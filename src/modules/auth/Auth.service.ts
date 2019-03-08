import { __, always, assoc, either, equals, ifElse, isNil, merge, not, pick, pipe, prop } from "ramda";
import { Service } from "typedi";
import { Repository, Transaction, TransactionRepository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { UserEntity } from "../../entities/UserEntity";
import { IAuthService } from "../../interfaces/IAuth.service";
import { AuthTokenResource } from "../../resources/AuthTokenResource";
import { BasicUserResource, toBasicUser, UserResource } from "../../resources/UserResource";
import { PasswordHelper, PasswordObj } from "../../shared/PasswordHelper";
import { authServiceToken } from "../../shared/serviceTokens";
import { createToken } from "../../shared/token";

const createTokenFromUser = pipe<UserEntity, Partial<UserEntity>, string, AuthTokenResource>(
  pick("id"),
  createToken,
  assoc("token", __, {}),
);

const prepareNewUser = (user: UserResource) => (
  pipe<UserResource, string, PasswordObj, Partial<UserEntity>, Partial<UserEntity>>(
    prop("password"),
    (password: string) => new PasswordHelper()
      .genSalt()
      .hashPassword(password)
      .PasswordAndSalt,
    merge(user),
    pick(["email", "password", "salt"]),
  )(user)
);

const wrongCredentials = (credsToCheck: UserResource) => (credsToCheckWith: PasswordObj) => (
  not(
    equals(
      credsToCheckWith.password,
      new PasswordHelper()
        .useSalt(credsToCheckWith.salt)
        .hashPassword(credsToCheck.password)
        .Password,
    ),
  )
);

@Service(authServiceToken)
export class AuthService implements IAuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  @Transaction()
  public register(
    user: UserResource,
    @TransactionRepository(UserEntity) userRepo?: Repository<UserEntity>,
  ): Promise<BasicUserResource> {
    return pipe<UserResource, Partial<UserEntity>, UserEntity, Promise<BasicUserResource>>(
      prepareNewUser,
      (newUser) => userRepo.create(newUser),
      (newUser) => userRepo
        .save(newUser)
        .then(toBasicUser),
    )(user);
  }

  public login(user: UserResource): Promise<AuthTokenResource|null> {
    return this.usersRepository
      .findOne({ email: user.email }, { select: [ "salt", "password", "id" ] })
      .then(
        ifElse(
          either(isNil, wrongCredentials(user)),
          always(null),
          createTokenFromUser,
        ),
      );
  }
}
