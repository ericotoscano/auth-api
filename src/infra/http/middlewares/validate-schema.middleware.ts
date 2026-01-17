import type { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodError, type ZodSchema } from "zod";
import { BadRequestError } from "../../../errors/custom-error";

type RequestSection = "body" | "params" | "query" | "headers" | "cookies";

export const validateSchema =
  (schema: ZodSchema, section: RequestSection): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[section]);

      req.validated ??= {};

      req.validated[section] = parsed;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string> = {};

        for (const issue of error.issues) {
          const field = issue.path.join(".") || section;

          if (!details[field]) {
            details[field] = issue.message;
          }
        }

        return next(
          new BadRequestError(
            "Request Validation Failed",
            "One or more request fields failed validation.",
            "VALIDATION_SCHEMA_FAILED",
            details,
          ),
        );
      }

      return next(error);
    }
  };
