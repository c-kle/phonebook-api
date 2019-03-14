import * as crypto from "crypto";
import { __, pipe } from "ramda";

const SALT_LENGHT = 16;

class PasswordContainer {
  public get Password(): string {
    return this.password;
  }

  public get PasswordAndSalt(): { password: string, salt: string } {
    return {
      password: this.password,
      salt: this.salt,
    };
  }

  constructor(private readonly password: string, private readonly salt: string) {}
}

class PasswordHasher {
  constructor(private readonly salt: string) {}

  public hash(password: string) {
    return pipe<string, crypto.Hmac, crypto.Hmac, string, PasswordContainer>(
      (salt) => crypto.createHmac("sha512", salt),
      (hash) => hash.update(password),
      (hash) => hash.digest("hex"),
      (hash) => new PasswordContainer(hash, this.salt),
    )(this.salt);
  }
}

export class AuthHelper {
  public static GEN_SALT(): PasswordHasher {
    const salt = crypto
      .randomBytes(Math.ceil(SALT_LENGHT / 2))
      .toString("hex")
      .slice(0, SALT_LENGHT);

    return new PasswordHasher(salt);
  }

  public static USE_SALT(salt: string): PasswordHasher {
    return new PasswordHasher(salt);
  }
}
