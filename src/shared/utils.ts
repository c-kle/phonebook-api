import { both, complement, either, isEmpty, isNil } from "ramda";

export const isNotNil = complement(isNil);
export const isNotEmpty = complement(isEmpty);
export const isNotNilNorEmpty = both(isNotNil, isNotEmpty);
export const isNilOrEmpty = either(isNil, isEmpty);
