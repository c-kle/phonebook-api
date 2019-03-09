import { UserResource } from "@resources/UserResource";

export interface IUsersService {
  /**
   * Finds a user with the given email
   * @param email The email used to find a user
   */
  findByEmail(email: string): Promise<UserResource|undefined>;
}
