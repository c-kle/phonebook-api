import { BadRequestError, Body, JsonController, Post, UnauthorizedError } from "routing-controllers";
import { Inject, Service } from "typedi";

import { when, isNil } from "ramda";
import { IAuthService } from "../../interfaces/IAuth.service";
import { IUsersService } from "../../interfaces/IUsers.service";
import { BasicUserResource, REGISTRATION, UserResource, LOGIN } from "../../resources/UserResource";
import { isNotNil } from "../../shared";
import { authServiceToken, usersServiceToken } from "../../shared/serviceTokens";
import { UsersService } from "../users/Users.service";
import { AuthService } from "./Auth.service";
import { AuthTokenResource } from "../../resources/AuthTokenResource";

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
    user: UserResource,
  ): Promise<BasicUserResource> {
    const registerUser = () => this.service.register(user);
    const throwUserAlreadyExists = () => Promise.reject(new BadRequestError("User already exists"));

    return this.userService.findByEmail(user.email)
      .then(when(isNotNil, throwUserAlreadyExists))
      .then(registerUser);
  }

  @Post("/login")
  public login(
    @Body({
      required: true,
      validate: {
        groups: [ LOGIN ],
        validationError: { target: false, value: false },
      },
    })
    credentials: UserResource,
  ): Promise<AuthTokenResource> {
    const throwUnauthorized = () => Promise.reject(new UnauthorizedError("Invalid credentials"));

    return this.service
      .login(credentials)
      .then(when(isNil, throwUnauthorized));
  }
}
