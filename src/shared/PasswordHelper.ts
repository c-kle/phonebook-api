import * as crypto from "crypto";
import { __, pipe } from "ramda";
import { UserEntity } from "../entities/UserEntity";

const SALT_LENGHT = 16;

export type PasswordObj = Pick<UserEntity, "salt"|"password">;

export class PasswordHelper {
  private salt = "";
  private password = "";

  public get Password(): string {
    return this.password;
  }

  public get PasswordAndSalt(): PasswordObj {
    return {
      password: this.password,
      salt: this.salt,
    };
  }

  public genSalt(): PasswordHelper {
    this.salt = crypto
      .randomBytes(Math.ceil(SALT_LENGHT / 2))
      .toString("hex")
      .slice(0, SALT_LENGHT);

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
}
