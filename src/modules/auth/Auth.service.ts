import { __, assoc, merge, pick, pipe, prop } from "ramda";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { UserEntity } from "../../entities/UserEntity";
import { IAuthService } from "../../interfaces/IAuth.service";
import { AuthTokenResource } from "../../resources/AuthTokenResource";
import { UserResouce } from "../../resources/UserResource";
import { PasswordHelper, PasswordObj } from "../../shared/password";
import { authServiceToken } from "../../shared/serviceTokens";
import { createToken } from "../../shared/token";

const createTokenFromUser = pipe<UserEntity, Partial<UserEntity>, string, AuthTokenResource>(
  pick([ "id", "email" ]),
  createToken,
  assoc("token", __, {}),
);

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
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) { }

  public register(user: UserResouce): Promise<AuthTokenResource> {
    return pipe<UserResouce, Partial<UserEntity>, UserEntity, Promise<UserEntity>, Promise<AuthTokenResource>>(
      prepareUser,
      (newUser) => this.repository.create(newUser),
      (newUser) => this.repository.save(newUser),
      (newUserP) => newUserP.then(createTokenFromUser),
    )(user);
  }

  public findByEmail(email: string): Promise<UserResouce|undefined> {
    return this.repository.findOne({ email });
  }

  // public login(user: UserResouce): Promise<string|null> {

  // }
}
