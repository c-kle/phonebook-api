import { AuthTokenResource } from "../resources/AuthTokenResource";
import { UserResouce } from "../resources/UserResource";

export interface IAuthService {
  /**
   * Registers a new user
   * @param user The user data to register
   */
  register(user: UserResouce): Promise<AuthTokenResource>;

  /**
   * Finds a user with the given email
   * @param email The email used to find a user
   */
  findByEmail(email: string): Promise<UserResouce|undefined>;
}
