import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { UserEntity } from "../../entities/UserEntity";
import { IUsersService } from "../../interfaces/IUsers.service";
import { UserResouce } from "../../resources/UserResource";
import { usersServiceToken } from "../../shared/serviceTokens";

@Service(usersServiceToken)
export class UsersService implements IUsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) { }

  public findByEmail(email: string): Promise<UserResouce|undefined> {
    return this.repository.findOne({ email });
  }
}
