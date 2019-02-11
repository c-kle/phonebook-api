import * as crypto from "crypto";
import { __, pipe, prop, propEq } from "ramda";
import { User } from "../entities/User";

export type PasswordObj = Pick<User, "salt"|"password">;

const genSalt = (length: number): string => (
  crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length)
);

export const hashWithSalt = (password: string) => (
  pipe<string, crypto.Hmac, crypto.Hmac, string>(
    (salt) => crypto.createHmac("sha512", salt),
    (hash) => hash.update(password),
    (hash) => hash.digest("hex"),
  )
);

export const makeCheckPwd = (pwdToCheck: string) => (pwdObj: PasswordObj): boolean => (
  pipe(
    prop("salt"),
    hashWithSalt(pwdToCheck),
    propEq("password", __, pwdObj),
  )(pwdObj)
);

export const saltHashPassword = pipe<string, [string, string], PasswordObj>(
  (pwd: string) => [ pwd, genSalt(16) ],
  ([ pwd, salt ]: [ string, string ]) => ({ password: hashWithSalt(pwd)(salt), salt }),
);
