import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { UserEntity } from "@entities/UserEntity";
import { IUsersService } from "@interfaces/IUsersService";
import { UserResource, PasswordObjResource } from "@resources/UserResource";
import { usersServiceToken } from "@shared/DITokens";
import { ACRUDBaseService } from "@shared/ACRUDBaseService";

@Service(usersServiceToken)
export class UsersService extends ACRUDBaseService<UserEntity> implements IUsersService {
  constructor(
    @InjectRepository(UserEntity)
    repository: Repository<UserEntity>,
  ) {
    super(repository);
  }

  public findByEmail(email: string): Promise<UserResource|undefined> {
    return this.repository.findOne({ email });
  }

  public findPasswordObjByEmail(email: string): Promise<PasswordObjResource|null> {
    return this.repository.findOne({ email }, { select: [ "salt", "password", "id" ] })
  }
}
