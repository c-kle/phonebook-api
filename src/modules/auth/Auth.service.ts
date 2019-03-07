import { merge, pipe } from "ramda";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { UserEntity } from "../../entities/UserEntity";
import { IAuthService } from "../../interfaces/IAuth.service";
import { UserResouce } from "../../resources/UserResource";
import { PasswordHelper, PasswordObj } from "../../shared/password";
import { authServiceToken } from "../../shared/serviceTokens";

const makeSaveUser = (repos: Repository<UserEntity>) => (newUser: Partial<UserEntity>) => (
  Promise
    .resolve(newUser)
    .then((user) => repos.create(user))
    .then((user) => repos.save(user))
);

@Service(authServiceToken)
export class AuthService implements IAuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) { }

  public register(user: UserResouce): Promise<UserResouce> {
    const saveUser = makeSaveUser(this.repository);

    return pipe<PasswordObj, UserResouce, Promise<UserEntity>>(
      merge(user),
      saveUser,
    )(new PasswordHelper()
      .genSalt()
      .hashPassword(user.password)
      .getPasswordAndSalt(),
    );
  }

  public findByEmail(email: string): Promise<UserResouce|undefined> {
    return this.repository.findOne({ email });
  }

  // public login(user: UserResouce): Promise<string|null> {

  // }
}
