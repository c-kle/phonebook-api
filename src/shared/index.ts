import { complement, contains, isEmpty, isNil, o, prop } from "ramda";

export const isNotNil = complement(isNil);
export const isNotEmpty = complement(isEmpty);
export const isDupKeyError = o<Error, string, boolean>(contains("Duplicate entry"), prop("message"));
export const success = (data: any) => ({ success: true, ...(data || {}) });
