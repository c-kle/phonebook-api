import { AuthTokenResource } from "@resources/AuthTokenResource";
import { BasicUserResource, UserResource, CredentialsResource } from "@resources/UserResource";

export interface IAuthService {
  /**
   * Registers a new user
   * @param user The user data to register
   * @returns The newly created user with basic info
   */
  register(user: UserResource): Promise<BasicUserResource>;

  /**
   * Logs the user in and generates the tokens
   * @param credentials The credentials to log in with
   * @returns Object with tokens or null if login fails
   */
  login(credentials: CredentialsResource): Promise<AuthTokenResource|null>;

  /**
   * Logs the user out and blacklists the token
   * @param accessToken the user's accessToken
   */
  logout(accessToken: string): Promise<any>;

  /**
   * Refreshes the user's access token with the user's refreshToken
   * @param refresToken The refresh token
   * @param userId The user's id
   */
  refresToken(refresToken: string, userId: string): Promise<Pick<AuthTokenResource, "accessToken">>;
}
