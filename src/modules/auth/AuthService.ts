import * as Redis from "ioredis";
import { __, always, assoc, either, equals, ifElse, isNil, merge, not, pick, pipe, prop } from "ramda";
import { Inject, Service } from "typedi";
import { Repository, Transaction, TransactionRepository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { UserEntity } from "@entities/UserEntity";
import { IAuthService } from "@interfaces/IAuthService";
import { AuthTokenResource } from "@resources/AuthTokenResource";
import { BasicUserResource, toBasicUser, UserResource } from "@resources/UserResource";
import { authServiceToken, redisToken } from "@shared/DITokens";
import { PasswordHelper, PasswordObj } from "@modules/auth/AuthHelper";
import { createToken } from "@shared/token";

const createTokenFromUser = pipe<UserEntity, Partial<UserEntity>, string, AuthTokenResource>(
  pick(["id"]),
  createToken,
  assoc("token", __, {}),
);

const prepareNewUser = (user: UserResource) => (
  pipe<UserResource, string, PasswordObj, Partial<UserEntity>, Partial<UserEntity>>(
    prop("password"),
    (password: string) => new PasswordHelper()
      .genSalt()
      .hashPassword(password)
      .PasswordAndSalt,
    merge(user),
    pick(["email", "password", "salt"]),
  )(user)
);

const wrongCredentials = (credsToCheck: UserResource) => (credsToCheckWith: PasswordObj) => (
  not(
    equals(
      credsToCheckWith.password,
      new PasswordHelper()
        .useSalt(credsToCheckWith.salt)
        .hashPassword(credsToCheck.password)
        .Password,
    ),
  )
);

@Service(authServiceToken)
export class AuthService implements IAuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @Inject(redisToken)
    private readonly redis: Redis.Redis,
  ) { }

  @Transaction()
  public register(
    user: UserResource,
    @TransactionRepository(UserEntity) userRepo?: Repository<UserEntity>,
  ): Promise<BasicUserResource> {
    return pipe<UserResource, Partial<UserEntity>, UserEntity, Promise<BasicUserResource>>(
      prepareNewUser,
      (newUser) => userRepo.create(newUser),
      (newUser) => userRepo
        .save(newUser)
        .then(toBasicUser),
    )(user);
  }

  public login(user: UserResource): Promise<AuthTokenResource|null> {
    return this.usersRepository
      .findOne({ email: user.email }, { select: [ "salt", "password", "id" ] })
      .then(
        ifElse(
          either(isNil, wrongCredentials(user)),
          always(null),
          createTokenFromUser,
        ),
      );
  }

  public logout(tokenObj: AuthTokenResource): Promise<any> {
    return this.redis.set(`blacklist:${tokenObj.token}`, 1, "EX", 300, "NX");
  }

}
