/// <reference types="vite/client" />

import { getConvexFunctionName } from "@confect/core/Ref";
import { Auth } from "@confect/server/Auth";
import {
  layer as makeTestLayer,
  TestConfect as TestConfectTag,
} from "@confect/test/TestConfect";
import type { TestConfect as TestConfectService } from "@confect/test/TestConfect";
import { convexTest } from "convex-test";
import type { FunctionArgs, FunctionReturnType } from "convex/server";
import { getFunctionName } from "convex/server";
import { ConvexError } from "convex/values";
import {
  die,
  either,
  gen,
  provide,
  provideService,
  runPromise,
} from "effect/Effect";
import type { Effect } from "effect/Effect";
import { isLeft, isRight } from "effect/Either";
import { describe, expect, expectTypeOf, test } from "vitest";

import refs from "../confect/_generated/refs";
import databaseSchema from "../confect/_generated/schema";
import { Unauthenticated } from "../confect/errors/authentication";
import { requireIdentity } from "../confect/identity";
import convexSchema from "../convex/schema";
import { currentViewer as nativeCurrentViewer } from "../native";

const modules = import.meta.glob(["../convex/**/*.*s"]);
const testLayer = makeTestLayer(databaseSchema, convexSchema, modules)();

function runTest<A, E>(
  effect: Effect<A, E, TestConfectService<typeof databaseSchema>>
) {
  return runPromise(effect.pipe(provide(testLayer)));
}

describe("Confect session", () => {
  test("exposes the native bridge with the exact viewer contract", () => {
    type NativeViewer = FunctionReturnType<typeof nativeCurrentViewer>;

    expectTypeOf<FunctionArgs<typeof nativeCurrentViewer>>().toEqualTypeOf<
      Record<never, never>
    >();
    expectTypeOf<NativeViewer>().toEqualTypeOf<{
      readonly email: string | null;
      readonly name: string | null;
      readonly tokenIdentifier: string;
    }>();
    expectTypeOf<NativeViewer>().not.toBeAny();
    expectTypeOf<NativeViewer>().not.toHaveProperty("subject");
    expect(getFunctionName(nativeCurrentViewer)).toBe(
      getConvexFunctionName(refs.public.session.currentViewer)
    );
  });

  test("returns a fixed safe error payload for anonymous viewers", async () => {
    const result = await runTest(
      gen(function* anonymousViewerTest() {
        const testConfect = yield* TestConfectTag<typeof databaseSchema>();
        return yield* testConfect.query(refs.public.session.currentViewer);
      }).pipe(either)
    );

    expect(isLeft(result)).toBeTruthy();
    if (isRight(result)) {
      return;
    }

    expect(result.left).toBeInstanceOf(Unauthenticated);
    expect(result.left).toMatchObject({
      _tag: "Unauthenticated",
      code: "UNAUTHENTICATED",
      message: "Authentication required",
    });
  });

  test("surfaces the same fixed payload through the native Convex bridge", async () => {
    const convex = convexTest(convexSchema, modules);
    let failure: unknown;
    try {
      await convex.query(nativeCurrentViewer, {});
    } catch (error: unknown) {
      failure = error;
    }

    expect(failure).toBeInstanceOf(ConvexError);
    if (!(failure instanceof ConvexError)) {
      return;
    }

    expect(failure.data).toStrictEqual({
      _tag: "Unauthenticated",
      code: "UNAUTHENTICATED",
      message: "Authentication required",
    });
  });

  test("projects only the intended authenticated identity fields", async () => {
    const viewer = await runTest(
      gen(function* authenticatedViewerTest() {
        const testConfect = yield* TestConfectTag<typeof databaseSchema>();
        return yield* testConfect
          .withIdentity({
            email: "person@example.com",
            issuer: "https://api.workos.com/",
            name: "Person Example",
            subject: "user_123",
            tokenIdentifier: "workos|user_123",
            unexpectedClaim: "must not be projected",
          })
          .query(refs.public.session.currentViewer);
      })
    );

    expect(viewer).toStrictEqual({
      email: "person@example.com",
      name: "Person Example",
      tokenIdentifier: "workos|user_123",
    });
  });

  test("keeps identities isolated between test contexts", async () => {
    const viewers = await runTest(
      gen(function* isolatedIdentitiesTest() {
        const testConfect = yield* TestConfectTag<typeof databaseSchema>();
        const first = yield* testConfect
          .withIdentity({
            subject: "first",
            tokenIdentifier: "workos|first",
          })
          .query(refs.public.session.currentViewer);
        const second = yield* testConfect
          .withIdentity({
            subject: "second",
            tokenIdentifier: "workos|second",
          })
          .query(refs.public.session.currentViewer);

        return { first, second };
      })
    );

    expect(viewers).toStrictEqual({
      first: {
        email: null,
        name: null,
        tokenIdentifier: "workos|first",
      },
      second: {
        email: null,
        name: null,
        tokenIdentifier: "workos|second",
      },
    });
  });

  test("does not turn unexpected auth failures into an unauthenticated error", async () => {
    const authFailure = new Error("auth SDK failure");
    let thrown: unknown;
    try {
      await runPromise(
        requireIdentity.pipe(
          provideService(Auth, {
            getUserIdentity: die(authFailure),
          })
        )
      );
    } catch (error: unknown) {
      thrown = error;
    }

    expect(thrown).not.toBeInstanceOf(Unauthenticated);
    expect(String(thrown)).toContain("auth SDK failure");
  });
});

describe("Convex test environment", () => {
  test("loads the starter schema", async () => {
    const convex = convexTest(convexSchema, modules);
    const storedFile = await convex.run((ctx) =>
      ctx.db.system.query("_storage").first()
    );

    expect(storedFile).toBeNull();
  });
});
