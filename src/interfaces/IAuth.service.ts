// import { AuthTokenResource } from "../resources/AuthTokenResource";
import { BasicUserResource, UserResouce } from "../resources/UserResource";

export interface IAuthService {
  /**
   * Registers a new user
   * @param user The user data to register
   */
  register(user: UserResouce): Promise<BasicUserResource>;
}
