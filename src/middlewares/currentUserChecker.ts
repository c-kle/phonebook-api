import { always, ifElse, last, pathOr, pipe, split } from "ramda";
import { Action } from "routing-controllers";
import { Container } from "typedi/Container";
import { decodeToken } from "@shared/token";
import { AuthTokenResource } from "@resources/AuthTokenResource";
import { UserResource } from "@resources/UserResource";
import { isNilOrEmpty } from "@shared/utils";
import { redisToken } from "@shared/DITokens";

const BEARER_STR = "Bearer ";

const getFromBlacklist = (token: string) => {
  const redis = Container.get(redisToken);

  return redis.get(`blacklist:${token}`);
};

const decodeIfNotBlacklisted = (token: string) => (
  getFromBlacklist(token).then(
    ifElse<string, Promise<UserResource & AuthTokenResource>, Promise<null>>(
      isNilOrEmpty,
      () => decodeToken(token),
      always(null),
    ),
  )
);

export const currentUserChecker = (
  pipe<Action, string, string[], string, Promise<UserResource & AuthTokenResource>>(
    pathOr("", [ "context", "req", "headers", "authorization" ]),
    split(BEARER_STR),
    last,
    decodeIfNotBlacklisted,
  )
);
