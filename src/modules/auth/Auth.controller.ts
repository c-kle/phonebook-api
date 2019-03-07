import { BadRequestError, Body, JsonController, Post } from "routing-controllers";
import { Inject, Service } from "typedi";

import { when } from "ramda";
import { IAuthService } from "../../interfaces/IAuth.service";
import { IUsersService } from "../../interfaces/IUsers.service";
import { BasicUserResource, REGISTRATION, UserResouce } from "../../resources/UserResource";
import { isNotNil } from "../../shared";
import { authServiceToken, usersServiceToken } from "../../shared/serviceTokens";
import { UsersService } from "../users/Users.service";
import { AuthService } from "./Auth.service";

@Service()
@JsonController("/auth")
export class AuthController {
  private readonly service: IAuthService;
  private readonly userService: IUsersService;

  constructor(
    @Inject(authServiceToken)
    service: AuthService,
    @Inject(usersServiceToken)
    usersService: UsersService,
  ) {
    this.service = service;
    this.userService = usersService;
  }

  @Post("/register")
  public register(
    @Body({
      required: true,
      validate: {
        groups: [ REGISTRATION ],
        validationError: { target: false, value: false },
      },
    })
    user: UserResouce,
  ): Promise<BasicUserResource> {
    const registerUser = () => this.service.register(user);
    const throwUserAlreadyExists = () => Promise.reject(new BadRequestError("user already exists"));

    return this.userService.findByEmail(user.email)
      .then(when(isNotNil, throwUserAlreadyExists))
      .then(registerUser);
  }

  // @Post("/auth/login")
  // public login(
  //   @Body({
  //     required: true,
  //     validate: {
  //       groups: [ LOGIN ],
  //       validationError: { target: false, value: false },
  //     },
  //   })
  //   credentials: UserResouce,
  // ): Promise<any> {
  //   const passwordIsOk = makeCheckPwd(propOr("", "password", credentials));

  //   return this.repository
  //     .findOne({ where: { email: credentials.email } })
  //     .then((user) => [user, pick(["salt", "password"])(user)])
  //     .then(([user, pwdObj]: [UserEntity, PasswordObj]) => (
  //       ifElse(
  //         both(isNotNil, passwordIsOk),
  //         () => createToken(user),
  //         () => Promise.reject<any>(new ForbiddenError()),
  //       )(pwdObj)
  //     ))
  //     .then((token) => success({token}));
  // }
}
