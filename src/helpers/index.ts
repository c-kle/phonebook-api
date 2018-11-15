import { complement, isNil, always, o, contains, prop, isEmpty } from "ramda";
import { validate } from "class-validator";

export const isNotNil = complement(isNil);
export const isNotEmpty = complement(isEmpty);

export const validateOrFail = <T>(entity: T) => validate(entity).then(always(entity))
export const isDupKeyError = o<Error, string, boolean>(contains('Duplicate entry'), prop('message'));
export const success = (data: any) => ({ success: true, ...(data || {}) });
