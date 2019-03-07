import { BadRequestError, Body, JsonController, Post } from "routing-controllers";
import { Inject, Service } from "typedi";

import { when } from "ramda";
import { IAuthService } from "../../interfaces/IAuth.service";
import { REGISTRATION, UserResouce } from "../../resources/UserResource";
import { isNotNil } from "../../shared";
import { authServiceToken } from "../../shared/serviceTokens";
import { AuthService } from "./Auth.service";

@Service()
@JsonController("/auth")
export class AuthController {
  private readonly service: IAuthService;

  constructor(
    @Inject(authServiceToken)
    service: AuthService,
  ) {
    this.service = service;
  }

  @Post("/register")
  public register(
    @Body({
      required: true,
      transform: {
        groups: [ REGISTRATION ],
      },
      type: UserResouce,
      validate: {
        groups: [ REGISTRATION ],
        validationError: { target: false, value: false },
      },
    })
    user: UserResouce,
  ): Promise<UserResouce> {
    console.log("sssssssssssssssssss", {user})
    const registerUser = () => this.service.register(user);
    const throwUserAlreadyExists = () => Promise.reject(new BadRequestError("user already exists"));

    return this.service.findByEmail(user.email)
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
