import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'entries' })
export class PhonebookEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  creationDate: Date;

  @UpdateDateColumn()
  modificationDate: Date;

  @Column({unique: true})
  name: string;

  @Column()
  fullAddress: string;

  @Column()
  phoneNumber: string;
}
