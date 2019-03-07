import * as jwt from "jsonwebtoken";
import { ifElse, last, pathOr, pipe, split } from "ramda";
import { BadRequestError, UnauthorizedError } from "routing-controllers";
import { isNotEmpty } from ".";

const SECRET = process.env.JWT_SECRET;
const BEARER_STR = "Bearer ";

export const checkToken = (req: any, res: any, next?: (err?: any) => any) => {
  return pipe(
    pathOr("", ["headers", "authorization"]),
    split(BEARER_STR),
    last,
    ifElse(
      isNotEmpty,
      (token: string) => jwt.verify(token, SECRET, (err: Error, decoded: any) => {
        if (err) {
          res.status(401);
          return res.send(new UnauthorizedError());
        }
        req.user = decoded;
        return next();
      }),
      () => {
        res.status(400);
        return res.send(new BadRequestError("token is missing"));
      },
    ),
  )(req);
};

export const createToken = (payloadObj: any) => jwt.sign({ ...payloadObj }, SECRET);
