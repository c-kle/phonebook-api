import * as crypto from 'crypto';
import { pipe, o, assoc, __, tap, prop, equals, eqProps } from 'ramda';
import { User } from '../entities/User';

export type PasswordObj = Pick<User, 'salt'|'password'>;

const genSalt = (length: number): string => (
  crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
);

export const hashWithSalt = (password: string) => (salt: string): PasswordObj => (
  pipe<string, crypto.Hmac, crypto.Hmac, string, PasswordObj>(
    (salt: string) => crypto.createHmac('sha512', salt),
    (hash) => hash.update(password),
    (hash) => hash.digest('hex'),
    assoc('password', __, { salt }),
  )(salt)
);

export const makeCheckPwd = (pwdToCheck: string) => (pwdObjReference: PasswordObj): boolean => {
  const comparePwds = eqProps('password', pwdObjReference);

  return pipe(
    prop('salt'),
    hashWithSalt(pwdToCheck),
    comparePwds
  )(pwdObjReference)
}
export const saltHashPassword = (password: string): PasswordObj => (
  o(hashWithSalt(password), genSalt)(16)
);
