import { Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity({ name: "users" })
export class UserEntity extends BaseEntity {
  @Column({ unique: true, nullable: false })
  public email: string;

  @Column({ nullable: false, select: false })
  public password: string;

  @Column({ nullable: false, select: false })
  public salt: string;
}
