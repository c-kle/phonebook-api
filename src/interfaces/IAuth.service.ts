// import { AuthTokenResource } from "../resources/AuthTokenResource";
import { AuthTokenResource } from "../resources/AuthTokenResource";
import { BasicUserResource, UserResource } from "../resources/UserResource";

export interface IAuthService {
  /**
   * Registers a new user
   * @param user The user data to register
   * @returns The newly created user with basic info
   */
  register(user: UserResource): Promise<BasicUserResource>;

  /**
   * Logs the user and generates the tokens
   * @param user The user with the credentials to login with
   * @returns Object with tokens or null if login fails
   */
  login(user: UserResource): Promise<AuthTokenResource|null>;
}
