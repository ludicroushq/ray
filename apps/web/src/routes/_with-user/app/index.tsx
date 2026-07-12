import { createFileRoute, getRouteApi } from "@tanstack/react-router";

const withUserRoute = getRouteApi("/_with-user");

export const Route = createFileRoute("/_with-user/app/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = withUserRoute.useLoaderData();
  const name = user.firstName ?? user.email;

  return (
    <div className="container mx-auto my-8">
      <h1 className="heading text-4xl">Hello {name}!</h1>
    </div>
  );
}
