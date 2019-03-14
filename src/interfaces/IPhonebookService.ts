import { ACRUDBaseService } from "@shared/ACRUDBaseService";
import { PhonebookEntryEntity } from "@entities/PhonebookEntryEntity";

export interface IPhonebookService extends ACRUDBaseService<PhonebookEntryEntity> {
}