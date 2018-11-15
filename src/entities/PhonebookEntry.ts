import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity({ name: 'entries' })
export class PhonebookEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  creationDate: Date;

  @UpdateDateColumn()
  modificationDate: Date;

  @Column({unique: true})
  @IsNotEmpty()
  name: string;

  @Column()
  @IsNotEmpty()
  fullAddress: string;

  @Column()
  @IsNotEmpty()
  phoneNumber: string;
}
