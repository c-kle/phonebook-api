import { always, last, pathOr, pipe, split, when, assoc, __ } from "ramda";
import { Action } from "routing-controllers";
import { Container } from "typedi/Container";

import { AuthTokenResource } from "@resources/AuthTokenResource";
import { UserResource } from "@resources/UserResource";
import { tokenManagerToken } from "@shared/DITokens";
import { isNotNil } from "@shared/utils";

const BEARER_STR = "Bearer ";

const ifElseP = (
  <TArg, TOnTrueRes, TOnFalseRes>(
    predicate: (arg: TArg) => Promise<boolean>,
    onTrue: (arg: TArg) => TOnTrueRes,
    onFalse: (arg: TArg) => TOnFalseRes) => (
      (arg: TArg) => predicate(arg).then((res) => res ? onTrue(arg) : onFalse(arg))
    )
);

const isBlackListed = (token: string) => (
  Container.get(tokenManagerToken).isBlackListed(token)
);

const decodeToken = (token: string) => (
  Container.get(tokenManagerToken)
    .tryDecodeToken(token)
    .then(when(isNotNil, assoc("accessToken", token)))
);

export const currentUserChecker = (action: Action) => (
  pipe<Action, string, string[], string, Promise<UserResource & AuthTokenResource>>(
    pathOr("", [ "context", "req", "headers", "authorization" ]),
    split(BEARER_STR),
    last,
    ifElseP(
      isBlackListed,
      always(null),
      decodeToken
    ),
  )(action)
);
