import { UserResource, PasswordObjResource } from "@resources/UserResource";
import { ACRUDBaseService } from "@shared/ACRUDBaseService";
import { UserEntity } from "@entities/UserEntity";

export interface IUsersService extends ACRUDBaseService<UserEntity> {
  /**
   * Finds a user with the given email
   * @param email The email used to find a user
   */
  findByEmail(email: string): Promise<UserResource|undefined>;
  /**
   * Finds a user with the given email and select its password and salt
   * @param email The email used to find a user
   */
  findPasswordObjByEmail(email: string): Promise<PasswordObjResource|null>;
}
