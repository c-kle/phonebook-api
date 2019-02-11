import { Allow, IsEmail, MinLength } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @CreateDateColumn()
  public creationDate: Date;

  @UpdateDateColumn()
  public modificationDate: Date;

  @Column({ unique: true, nullable: false })
  @IsEmail()
  public email: string;

  @Column({ nullable: false })
  @MinLength(8)
  public password: string;

  @Allow()
  @Column({ nullable: false })
  public salt: string;
}
