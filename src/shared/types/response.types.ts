import { Response } from "express";

export type ApiResponse<T> = Response<{
  success: boolean;
  message: string;
  data: T;
}>;
