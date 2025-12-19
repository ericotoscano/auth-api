import type { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodError, type ZodSchema } from "zod";
import { BadRequestError } from "../config/CustomError";

type RequestSection = "body" | "params" | "query" | "headers" | "cookies";

export const validateSchema =
  (schema: ZodSchema, requestSection: RequestSection): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const sections: Record<RequestSection, any> = {
        body: req.body,
        params: req.params,
        query: req.query,
        headers: req.headers,
        cookies: req.cookies,
      };

      const dataToValidate = sections[requestSection];

      const parsed = schema.parse(dataToValidate);

      req[requestSection] = parsed;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string> = {};

        for (const issue of error.issues) {
          const field = issue.path.join(".") || requestSection;

          if (!details[field]) {
            details[field] = issue.message;
          }
        }

        return next(
          new BadRequestError(
            "Request Validation Failed",
            "See 'details' for validation feedbacks by field.",
            "VALIDATE_SCHEMA_ERROR",
            details
          )
        );
      }

      return next(error);
    }
  };
