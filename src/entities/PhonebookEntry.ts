import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "entries" })
export class PhonebookEntry {
  @PrimaryGeneratedColumn()
  public id: number;

  @CreateDateColumn()
  public creationDate: Date;

  @UpdateDateColumn()
  public modificationDate: Date;

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
