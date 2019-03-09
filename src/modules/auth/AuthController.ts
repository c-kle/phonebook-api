import {
  BadRequestError,
  Body,
  CurrentUser,
  Get,
  HttpCode,
  JsonController,
  Post,
  UnauthorizedError,
} from "routing-controllers";
import { Inject, Service } from "typedi";

import { isNil, when } from "ramda";
import { IAuthService } from "@interfaces/IAuthService";
import { IUsersService } from "@interfaces/IUsersService";
import { AuthTokenResource } from "@resources/AuthTokenResource";
import { BasicUserResource, LOGIN, REGISTRATION, UserResource } from "@resources/UserResource";
import { isNotNil } from "@shared/utils";
import { authServiceToken, usersServiceToken } from "@shared/DITokens";
import { UsersService } from "@modules/users/UsersService";
import { AuthService } from "@modules/auth/AuthService";

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

  @Get("/logout")
  @HttpCode(204)
  public logout(@CurrentUser({ required: true }) tokenObj: AuthTokenResource): Promise<any> {
    return this.service.logout(tokenObj);
  }
}
