import { IsEmail, MinLength } from "class-validator";
import { BaseResource } from "@resources/BaseResource";

export const REGISTRATION = "registration";
export const LOGIN = "login";

export class UserResource extends BaseResource {
  @IsEmail({}, { groups: [ REGISTRATION, LOGIN ] })
  public readonly email: string;

  @MinLength(8, { groups: [ REGISTRATION, LOGIN ] })
  public readonly password: string;
}

export type BasicUserResource = Pick<UserResource, "email"|"id">;
export type CredentialsResource = Pick<UserResource, "email"|"password">;

export const toBasicUser = (user: Partial<UserResource>): BasicUserResource => ({ id: user.id, email: user.email });
