import { RegisteredConvexFunction, RegisteredFunctions } from "@confect/server";
import databaseSchema from "../schema";
import session from "../../session.impl";

export default RegisteredFunctions.buildForGroup<typeof import("../../session.spec")["default"]>(databaseSchema, session, RegisteredConvexFunction.make);
