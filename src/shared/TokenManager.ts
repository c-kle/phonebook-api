import * as Redis from "ioredis";
import * as jwt from "jsonwebtoken";
import { ifElse, __ } from "ramda";
import { Inject, Service } from "typedi";

import { redisToken, tokenManagerToken } from "@shared/DITokens";
import { isNotNilNorEmpty } from "@shared/utils";

const SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_TTL = 5 * 60; // 5 minutes
const REFRESH_TOKEN_TTL = 24 * 60 * 60; // 24 hours

@Service(tokenManagerToken)
export class TokenManager {
  constructor(
    @Inject(redisToken)
    private readonly redis: Redis.Redis,
  ) { }

  private createRefreshToken(data: any): string {
    return jwt.sign({ ...data }, SECRET, { expiresIn: REFRESH_TOKEN_TTL, audience: "refresh" });
  }
  
  public createAccessToken(data: any): string {
    return jwt.sign({ ...data }, SECRET, { expiresIn: ACCESS_TOKEN_TTL });
  }

  public createNewTokens(data: any): { accessToken: string, refreshToken: string } {
    return {
      accessToken: this.createAccessToken(data),
      refreshToken: this.createRefreshToken(data)
    };
  }

  public tryDecodeToken(token: string): Promise<any> {
    const verifyToken = (accessToken: string): Promise<any> => (
      new Promise((resolve) => (
        jwt.verify(
          accessToken,
          SECRET,
          (err: Error, decoded: any) => resolve(err ? null : decoded)
        )
      ))
    );

    return ifElse<string, Promise<any>, Promise<null>>(
      isNotNilNorEmpty,
      verifyToken,
      () => Promise.resolve(null),
    )(token);
  }

  public blackListToken(token: string) {
    return this.redis.set(`blacklist:${token}`, 1, "EX", ACCESS_TOKEN_TTL, "NX");
  }

  public isBlackListed(token: string): Promise<boolean> {
    return this.redis
      .get(`blacklist:${token}`)
      .then(isNotNilNorEmpty);
  }
}