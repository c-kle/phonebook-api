import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export class BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @CreateDateColumn()
  public creationDate: Date;

  @UpdateDateColumn()
  public modificationDate: Date;
}
