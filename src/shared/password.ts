import * as crypto from "crypto";
import { __, pipe, prop, propEq } from "ramda";
import { UserEntity } from "../entities/UserEntity";

const SALT_LENGHT = 16;

export type PasswordObj = Pick<UserEntity, "salt"|"password">;

export const genSalt = ((saltLength: number) => (): string => (
  crypto
    .randomBytes(Math.ceil(saltLength / 2))
    .toString("hex")
    .slice(0, saltLength)
))(SALT_LENGHT);

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

export class PasswordHelper {
  private salt = "";
  private password = "";

  constructor(private saltLength = SALT_LENGHT) { }

  public genSalt(): PasswordHelper {
    this.salt = crypto
      .randomBytes(Math.ceil(this.saltLength / 2))
      .toString("hex")
      .slice(0, this.saltLength);

    return this;
  }

  public useSalt(salt: string): PasswordHelper {
    this.salt = salt;

    return this;
  }

  public hashPassword(password: string): PasswordHelper {
    this.password = pipe<string, crypto.Hmac, crypto.Hmac, string>(
      (salt) => crypto.createHmac("sha512", salt),
      (hash) => hash.update(password),
      (hash) => hash.digest("hex"),
    )(this.salt);

    return this;
  }

  public getPasswordAndSalt(): PasswordObj {
    return {
      password: this.password,
      salt: this.salt,
    };
  }
}
