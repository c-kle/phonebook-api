import { IsNotEmpty } from "class-validator";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity({ name: "entries" })
export class PhonebookEntryEntity extends BaseEntity {
  @Column({unique: true})
  @IsNotEmpty()
  public name: string;

  @Column()
  @IsNotEmpty()
  public fullAddress: string;

  @Column()
  @IsNotEmpty()
  public phoneNumber: string;
}
