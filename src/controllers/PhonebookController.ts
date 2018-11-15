import {JsonController, Get, Post, Body, Put, Param, NotFoundError, InternalServerError, Delete, UseBefore, BadRequestError } from "routing-controllers";
import { Service } from "typedi";
import { Repository } from "typeorm";
import {InjectRepository} from "typeorm-typedi-extensions";
import { ifElse, propEq, when, clone } from "ramda";

import { PhonebookEntry } from "../entities/PhonebookEntry";
import { checkToken } from "../helpers/token";
import { success, validateOrFail, isDupKeyError } from "../helpers";

const makeSaveEntry = (repos: Repository<PhonebookEntry>) => (newEntry: PhonebookEntry) => (
  Promise
    .resolve(newEntry)
    .then(newEntry => repos.create(newEntry))
    .then(newEntry => (
      repos
        .save(newEntry)
        .catch(when(isDupKeyError, () => Promise.reject<any>(new BadRequestError('entry already exists'))))
      )
    )
);

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
  @UseBefore(checkToken)
  create(@Body() entry: PhonebookEntry): Promise<PhonebookEntry> {
    const saveEntry = makeSaveEntry(this.repository);

    return Promise
      .resolve(entry)
      .then(clone)
      .then(validateOrFail)
      .then(saveEntry)
  }

  @Put('/entries/:id')
  @UseBefore(checkToken)
  update(@Param("id") id: number, @Body() entry: PhonebookEntry): Promise<PhonebookEntry> {
    const saveEntry = makeSaveEntry(this.repository);
    const updateEntry = () => (
      Promise
        .resolve({ ...entry, id})
        .then(clone)
        .then(validateOrFail)
        .then(saveEntry)
      );

    return this.repository.findOneOrFail(id)
      .then(updateEntry)
      .catch(ifElse(
        propEq('name', 'EntityNotFound'),
        () => Promise.reject(new NotFoundError()),
        (e: Error) => Promise.reject(e),
      ))
  }

  @Delete('/entries/:id')
  @UseBefore(checkToken)
  delete(@Param("id") id: number): Promise<any> {
    const deleteEntry = () => this.repository.delete({ id });

    return this.repository.findOneOrFail(id)
      .then(deleteEntry)
      .then(() => success({}))
      .catch(ifElse(
        propEq('name', 'EntityNotFound'),
        () => Promise.reject(new NotFoundError()),
        (e: Error) => Promise.reject(e),
      ))
  }
}