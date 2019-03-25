import { IsEmail, MinLength } from "class-validator";
import { BaseResource } from "@resources/BaseResource";

export const REGISTRATION = "registration_validation";
export const LOGIN = "login_validation";

export class UserResource extends BaseResource {
  @IsEmail({}, { groups: [ REGISTRATION, LOGIN ] })
  public readonly email: string;

  @MinLength(8, { groups: [ REGISTRATION, LOGIN ] })
  public readonly password: string;

  public readonly salt: string;
}

export type BasicUserResource = Pick<UserResource, "email"|"id">;
export type CredentialsResource = Pick<UserResource, "email"|"password">;
export type PasswordObjResource = Pick<UserResource, "salt"|"password">;

export const toBasicUser = (user: Partial<UserResource>): BasicUserResource => ({ id: user.id, email: user.email });
