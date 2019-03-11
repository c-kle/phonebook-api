import { __, bind, always, either, equals, ifElse, isNil, merge, not, pick, pipe, prop, when, assoc, both, where, compose } from "ramda";
import { Inject, Service } from "typedi";
import { Repository, Transaction, TransactionRepository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { UserEntity } from "@entities/UserEntity";
import { IAuthService } from "@interfaces/IAuthService";
import { AuthTokenResource } from "@resources/AuthTokenResource";
import { BasicUserResource, toBasicUser, UserResource, CredentialsResource } from "@resources/UserResource";
import { authServiceToken, tokenManagerToken } from "@shared/DITokens";
import { PasswordHelper, PasswordObj } from "@modules/auth/AuthHelper";
import { TokenManager } from "@shared/TokenManager";
import { isNotNil } from "@shared/utils";

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

const wrongCredentials = (credsToCheck: CredentialsResource) => (credsToCheckWith: PasswordObj) => (
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
    @Inject(tokenManagerToken)
    private readonly tokenManager: TokenManager,
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

  public login(user: CredentialsResource): Promise<AuthTokenResource|null> {
    const createNewTokens = bind(this.tokenManager.createNewTokens, this.tokenManager);

    return this.usersRepository
      .findOne({ email: user.email }, { select: [ "salt", "password", "id" ] })
      .then(
        ifElse(
          either(isNil, wrongCredentials(user)),
          always(null),
          createNewTokens,
        ),
      );
  }

  public logout(accessToken: string): Promise<any> {
    return this.tokenManager.blackListToken(accessToken);
  }

  public refresToken(refresToken: string, userId: string): Promise<Pick<AuthTokenResource, "accessToken">> {
    const createNewAccessToken = compose(
      assoc("accessToken", __, {}),
      bind(this.tokenManager.createAccessToken, this.tokenManager)
    );

    const tryRefreshToken = () => (
      this.usersRepository
        .findOne(userId)
        .then(when(isNotNil, createNewAccessToken))
    );

    const isValidRefreshToken = both(
      isNotNil,
      where({ aud: equals("refresh"), id: equals(userId) })
    );

    return this.tokenManager
      .tryDecodeToken(refresToken)
      .then(
        ifElse(
          isValidRefreshToken,
          tryRefreshToken,
          always(null)
        )
      );
  }
}
