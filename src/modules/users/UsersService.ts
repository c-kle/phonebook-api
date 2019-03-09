import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { UserEntity } from "@entities/UserEntity";
import { IUsersService } from "@interfaces/IUsersService";
import { UserResource } from "@resources/UserResource";
import { usersServiceToken } from "@shared/DITokens";

@Service(usersServiceToken)
export class UsersService implements IUsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) { }

  public findByEmail(email: string): Promise<UserResource|undefined> {
    return this.repository.findOne({ email });
  }
}
