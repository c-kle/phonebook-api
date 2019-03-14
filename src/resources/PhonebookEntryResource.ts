import { BaseResource } from "@resources/BaseResource";
import { IsNotEmpty } from "class-validator";

export const CREATE_VALIDATION = "phonebook_create";
export const UPDATE_VALIDATION = "phonebook_update";

export class PhonebookEntryResource extends BaseResource {
  @IsNotEmpty({groups: [CREATE_VALIDATION]})
  public name: string;

  @IsNotEmpty({groups: [CREATE_VALIDATION]})
  public fullAddress: string;

  @IsNotEmpty({groups: [CREATE_VALIDATION]})
  public phoneNumber: string;
}