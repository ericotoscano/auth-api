import { Response } from "express";

export type TypedResponse<T> = Response<{
  success: boolean;
  message: string;
  data: T;
}>;
