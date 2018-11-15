import {JsonController, Get, Post, Body, Put, Param, NotFoundError, InternalServerError } from "routing-controllers";
import { Service } from "typedi";
import { Repository } from "typeorm";
import {InjectRepository} from "typeorm-typedi-extensions";
import { ifElse, propEq, identity } from "ramda";

import { PhonebookEntry } from "../entities/PhonebookEntry";

@Service()
@JsonController('/phonebook')
export class PhonebookController {
  constructor(
    @InjectRepository(PhonebookEntry)
    private readonly repository: Repository<PhonebookEntry>
  ) {}

  @Get('/ping')
  ping(): Promise<any> {
    return Promise.resolve({data: 'pong'})
  }

  @Get('/entries')
  all(): Promise<PhonebookEntry[]> {
    return this.repository.find();
  }

  @Post('/entries')
  create(@Body() entry: PhonebookEntry): Promise<PhonebookEntry> {
    return this.repository.save(entry);
  }

  @Put('/entries/:id')
  update(@Param("id") id: number, @Body() entry: PhonebookEntry): Promise<PhonebookEntry> {
    const updateEntry = () => this.repository.save({ ...entry, id });

    return this.repository.findOneOrFail(id)
      .then(updateEntry)
      .catch(ifElse(
        propEq('name', 'EntityNotFound'),
        () => Promise.reject(new NotFoundError()),
        (e: any) => Promise.reject(new InternalServerError(e.message)),
      ))
  }
}