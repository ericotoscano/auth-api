import { Document } from "mongoose";
import { PaginationType } from "./pagination.types";

export type FindAllQueryRequest<T extends string> = {
  fields?: string[];
  sort?: string;
  limit?: number;
  offset?: number;
} & Partial<Record<T, string | number | boolean>>;

export interface UpdateOptions<U extends Record<string, any>> {
  set?: Partial<U>;
  unset?: (keyof U)[];
  push?: Partial<Record<keyof U, any>>;
  pull?: Partial<Record<keyof U, any>>;
  addToSet?: Partial<Record<keyof U, any>>;
}

export type UpdateArrayOperation = "addToSet" | "pull";

export interface TokenOptions {
  secret: string;
  expiresInMinutes: number;
  audience?: string;
  issuer?: string;
}

export type FindAllReturn<M extends Document> = {
  results: M[];
  pagination: PaginationType;
};
