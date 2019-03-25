import { __, bind, always, either, equals, ifElse, isNil, merge, not, pick, pipe, prop, when, assoc, both, where, compose } from "ramda";
import { Inject, Service } from "typedi";

import { UserEntity } from "@entities/UserEntity";
import { IAuthService } from "@interfaces/IAuthService";
import { AuthTokenResource } from "@resources/AuthTokenResource";
import { BasicUserResource, toBasicUser, UserResource, CredentialsResource, PasswordObjResource } from "@resources/UserResource";
import { authServiceToken, tokenManagerToken, usersServiceToken } from "@shared/DITokens";
import { AuthHelper } from "@modules/auth/AuthHelper";
import { TokenManager } from "@shared/TokenManager";
import { isNotNil } from "@shared/utils";
import { UsersService } from "@modules/users/UsersService";


const prepareNewUser = (user: UserResource) => (
  pipe<UserResource, string, PasswordObjResource, Partial<UserEntity>, Partial<UserEntity>>(
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

const wrongCredentials = (credsToCheck: CredentialsResource) => (credsToCheckWith: PasswordObjResource) => (
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
export class AuthService  implements IAuthService {
  constructor(
    @Inject(usersServiceToken)
    private readonly usersService: UsersService,
    @Inject(tokenManagerToken)
    private readonly tokenManager: TokenManager,
  ) { }

  public register(user: UserResource): Promise<BasicUserResource> {
    return pipe<UserResource, Partial<UserEntity>, Promise<BasicUserResource>>(
      prepareNewUser,
      (newUser) => this.usersService.create(newUser).then(toBasicUser)
    )(user);
  }

  public login(user: CredentialsResource): Promise<AuthTokenResource|null> {
    const createNewTokens = (
      compose<UserEntity, Partial<UserEntity>, AuthTokenResource>(
        bind(this.tokenManager.createNewTokens, this.tokenManager),
        getJwtClaimsFromUSer
      )
    );

    return this.usersService
      .findPasswordObjByEmail(user.email)
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
      this.usersService
        .findById(userId)
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
