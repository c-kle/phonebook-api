import { __, bind, always, either, equals, ifElse, isNil, merge, not, pick, pipe, prop, when, assoc, both, where, compose } from "ramda";
import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { UserEntity } from "@entities/UserEntity";
import { IAuthService } from "@interfaces/IAuthService";
import { AuthTokenResource } from "@resources/AuthTokenResource";
import { BasicUserResource, toBasicUser, UserResource, CredentialsResource } from "@resources/UserResource";
import { authServiceToken, tokenManagerToken } from "@shared/DITokens";
import { AuthHelper } from "@modules/auth/AuthHelper";
import { TokenManager } from "@shared/TokenManager";
import { isNotNil } from "@shared/utils";
import { ACRUDBaseService } from "@shared/ACRUDBaseService";

type PasswordObj = Pick<UserEntity, "salt"|"password">;

const prepareNewUser = (user: UserResource) => (
  pipe<UserResource, string, PasswordObj, Partial<UserEntity>, Partial<UserEntity>>(
    prop("password"),
    (password: string) => (
      AuthHelper
        .GEN_SALT()
        .hash(password)
        .PasswordAndSalt
    ),
    merge(user),
    pick(["email", "password", "salt"]),
  )(user)
);

const wrongCredentials = (credsToCheck: CredentialsResource) => (credsToCheckWith: PasswordObj) => (
  not(equals(
    credsToCheckWith.password,
    AuthHelper
      .USE_SALT(credsToCheckWith.salt)
      .hash(credsToCheck.password)
      .Password
  ))
);

const getJwtClaimsFromUSer = pick(["id"]);

@Service(authServiceToken)
export class AuthService extends ACRUDBaseService<UserEntity> implements IAuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @Inject(tokenManagerToken)
    private readonly tokenManager: TokenManager,
  ) {
    super(usersRepository);
  }

  public register(user: UserResource): Promise<BasicUserResource> {
    return pipe<UserResource, Partial<UserEntity>, Promise<BasicUserResource>>(
      prepareNewUser,
      (newUser) => this.create(newUser).then(toBasicUser)
    )(user);
  }

  public login(user: CredentialsResource): Promise<AuthTokenResource|null> {
    const createNewTokens = (
      compose<UserEntity, Partial<UserEntity>, AuthTokenResource>(
        bind(this.tokenManager.createNewTokens, this.tokenManager),
        getJwtClaimsFromUSer
      )
    );

    return this.usersRepository
      .findOne({ email: user.email }, { select: [ "salt", "password", "id" ] })
      .then(
        ifElse(
          either(isNil, wrongCredentials(user)),
          always(null),
          createNewTokens
        )
      );
  }

  public logout(accessToken: string): Promise<any> {
    return this.tokenManager.blackListToken(accessToken);
  }

  public refresToken(refresToken: string, userId: string): Promise<Pick<AuthTokenResource, "accessToken">> {
    const isValidRefreshToken = (
      both(
        isNotNil,
        where({ aud: equals("refresh"), id: equals(userId) })
      )
    );

    const createNewAccessToken = (
      pipe(
        getJwtClaimsFromUSer,
        bind(this.tokenManager.createAccessToken, this.tokenManager),
        assoc("accessToken", __, {})
      )
    );

    const tryRefreshToken = (): Promise<Pick<AuthTokenResource, "accessToken">> => (
      this.usersRepository
        .findOne(userId)
        .then(when(isNotNil, createNewAccessToken))
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
