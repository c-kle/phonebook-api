import { __,
  // assoc,
  merge, pick, pipe, prop } from "ramda";
import { Service } from "typedi";
import { Repository, Transaction, TransactionRepository } from "typeorm";
import { UserEntity } from "../../entities/UserEntity";
import { IAuthService } from "../../interfaces/IAuth.service";
// import { AuthTokenResource } from "../../resources/AuthTokenResource";
import { BasicUserResource, toBasicUser, UserResouce } from "../../resources/UserResource";
import { PasswordHelper, PasswordObj } from "../../shared/password";
import { authServiceToken } from "../../shared/serviceTokens";
// import { createToken } from "../../shared/token";

// const createTokenFromUser = pipe<UserEntity, Partial<UserEntity>, string, AuthTokenResource>(
//   pick([ "id", "email" ]),
//   createToken,
//   assoc("token", __, {}),
// );

const prepareUser = (user: UserResouce) => (
  pipe<UserResouce, string, PasswordObj, Partial<UserEntity>, Partial<UserEntity>>(
    prop("password"),
    (password: string) => new PasswordHelper()
      .genSalt()
      .hashPassword(password)
      .getPasswordAndSalt(),
    merge(user),
    pick(["email", "password", "salt"]),
  )(user)
);

@Service(authServiceToken)
export class AuthService implements IAuthService {
  @Transaction()
  public register(
    user: UserResouce,
    @TransactionRepository(UserEntity) userRepo?: Repository<UserEntity>,
  ): Promise<BasicUserResource> {
    return pipe<UserResouce, Partial<UserEntity>, UserEntity, Promise<BasicUserResource>>(
      prepareUser,
      (newUser) => userRepo.create(newUser),
      (newUser) => userRepo
        .save(newUser)
        .then(toBasicUser),
    )(user);
  }

  // public login(user: UserResouce): Promise<string|null> {

  // }
}
