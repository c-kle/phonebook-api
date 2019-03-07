import { Exclude, Expose } from "class-transformer";
import { IsEmail, MinLength } from "class-validator";

import { BaseResource } from "./BaseResource";

export const REGISTRATION = "registration";
export const LOGIN = "login";

@Exclude()
export class UserResouce extends BaseResource {
  @IsEmail({}, { groups: [ REGISTRATION, LOGIN ] })
  @Expose({ groups: [ REGISTRATION ] })
  public readonly email: string;

  @MinLength(8, { groups: [ REGISTRATION, LOGIN ] })
  @Expose({ groups: [ REGISTRATION ] })
  public readonly password?: string;
}
