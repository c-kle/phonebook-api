import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";
import { Service } from "typedi";

import { PhonebookEntryEntity } from "@entities/PhonebookEntryEntity";
import { IPhonebookService } from "@interfaces/IPhonebookService";
import { phonebookServiceToken } from "@shared/DITokens";
import { ACRUDBaseService } from "@shared/ACRUDBaseService";

@Service(phonebookServiceToken)
export class PhonebookService extends ACRUDBaseService<PhonebookEntryEntity> implements IPhonebookService {
  constructor(
    @InjectRepository(PhonebookEntryEntity)
    phonebookRepository: Repository<PhonebookEntryEntity>,
  ) {
    super(phonebookRepository);
  }
}