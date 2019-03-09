import * as jwt from "jsonwebtoken";
import { ifElse } from "ramda";
import { isNotNilNorEmpty } from "shared/utils";

const SECRET = process.env.JWT_SECRET;

const verifyToken = (token: string): Promise<any> => (
  new Promise((resolve) => (
    jwt.verify(token, SECRET,
      (err: Error, decoded: any) => resolve(err ? null : { ...decoded, token }),
    )
  ))
);

export const decodeToken = (
  ifElse<string, Promise<any>, Promise<any>>(
    isNotNilNorEmpty,
    verifyToken,
    () => Promise.resolve(null),
  )
);

export const createToken = (payloadObj: any) => jwt.sign({ ...payloadObj }, SECRET);
