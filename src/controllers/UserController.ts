import {JsonController, Post, Body, BadRequestError, ForbiddenError } from "routing-controllers";
import { Service } from "typedi";
import { Repository } from "typeorm";
import {InjectRepository} from "typeorm-typedi-extensions";
import {  merge, pick, pipe, clone, prop, __, when, ifElse, both, propOr, tap } from "ramda";

import { User } from "../entities/User";
import { saltHashPassword, PasswordObj, makeCheckPwd } from "../helpers/password";
import { isDupKeyError, validateOrFail, success, isNotNil } from "../helpers";
import { createToken } from "../helpers/token";

type AuthObj = Pick<User, 'email'|'password'>;

const makeSaveUser = (repos: Repository<User>) => (newUser: User) => (
  Promise
    .resolve(newUser)
    .then(user => repos.create(user))
    .then(user => (
      repos
        .save(user)
        .catch(when(isDupKeyError, () => Promise.reject<any>(new BadRequestError('user already exists'))))
      )
    )
);

const prepareUser = (user: User) => (
  Promise.resolve(user)
    .then(
      pipe<User, string, PasswordObj, User>(
        prop('password'),
        saltHashPassword,
        merge(user)
      )
    )
);

@Service()
@JsonController('/users')
export class UserController {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>
  ) {}

  @Post('/auth/signUp')
  signUp(@Body() user: User): Promise<any> {
    const saveUser = makeSaveUser(this.repository);

    return Promise.resolve(user)
      .then(pick(['password', 'email']))
      .then(clone)
      .then(validateOrFail)
      .then(prepareUser)
      .then(saveUser)
      .then(success)
  }

  @Post('/auth/login')
  login(@Body() credentials: AuthObj): Promise<any> {
    const passwordIsOk = makeCheckPwd(propOr('', 'password', credentials));

    return this.repository
      .findOne({ where: { email: credentials.email } })
      .then(user => [user, pick(['salt', 'password'])(user)])
      .then(([user, pwdObj]: [User, PasswordObj]) => (
        ifElse(
          both(isNotNil, passwordIsOk),
          () => createToken(user),
          () => Promise.reject<any>(new ForbiddenError())
        )(pwdObj)
      ))
      .then(token => success({token}));
  }
}