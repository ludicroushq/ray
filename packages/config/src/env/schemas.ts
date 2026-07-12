import { httpUrl, string } from "zod";

export const REQUIRED_STRING = string().trim().min(1);
export const OPTIONAL_STRING = REQUIRED_STRING.optional();
export const REQUIRED_URL = httpUrl();
