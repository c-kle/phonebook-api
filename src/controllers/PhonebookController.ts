import { clone, ifElse, propEq, when } from "ramda";
import {
  BadRequestError,
  Body,
  Delete,
  Get,
  JsonController,
  NotFoundError,
  Param,
  Post,
  Put,
  UseBefore } from "routing-controllers";
import { Service } from "typedi";
import { Repository } from "typeorm";
import {InjectRepository} from "typeorm-typedi-extensions";

import { PhonebookEntryEntity } from "../entities/PhonebookEntryEntity";
import { isDupKeyError, success } from "../shared";
import { checkToken } from "../shared/token";

const makeSaveEntry = (repos: Repository<PhonebookEntryEntity>) => (newEntry: PhonebookEntryEntity) => (
  Promise
    .resolve(newEntry)
    .then((entry) => repos.create(entry))
    .then((entity) => (
      repos
        .save(entity)
        .catch(when(isDupKeyError, () => Promise.reject<any>(new BadRequestError("entry already exists"))))
      ),
    )
);

@Service()
@JsonController("/phonebook")
export class PhonebookController {
  constructor(
    @InjectRepository(PhonebookEntryEntity)
    private readonly repository: Repository<PhonebookEntryEntity>,
  ) {}

  @Get("/ping")
  public ping(): Promise<any> {
    return Promise.resolve({data: "pong"});
  }

  @Get("/entries")
  public all(): Promise<PhonebookEntryEntity[]> {
    return this.repository.find();
  }

  @Post("/entries")
  @UseBefore(checkToken)
  public create(@Body() entry: PhonebookEntryEntity): Promise<PhonebookEntryEntity> {
    const saveEntry = makeSaveEntry(this.repository);

    return Promise
      .resolve(entry)
      .then(clone)
      // .then(validateOrFail())
      .then(saveEntry);
  }

  @Put("/entries/:id")
  @UseBefore(checkToken)
  public update(@Param("id") id: string, @Body() entry: PhonebookEntryEntity): Promise<PhonebookEntryEntity> {
    const saveEntry = makeSaveEntry(this.repository);
    const updateEntry = () => (
      Promise
        .resolve({ ...entry, id})
        .then(clone)
        // .then(validateOrFail)
        .then(saveEntry)
      );

    return this.repository.findOneOrFail(id)
      .then(updateEntry)
      .catch(ifElse(
        propEq("name", "EntityNotFound"),
        () => Promise.reject(new NotFoundError()),
        (e: Error) => Promise.reject(e),
      ));
  }

  @Delete("/entries/:id")
  @UseBefore(checkToken)
  public delete(@Param("id") id: string): Promise<any> {
    const deleteEntry = () => this.repository.delete({ id });

    return this.repository.findOneOrFail(id)
      .then(deleteEntry)
      .then(() => success({}))
      .catch(ifElse(
        propEq("name", "EntityNotFound"),
        () => Promise.reject(new NotFoundError()),
        (e: Error) => Promise.reject(e),
      ));
  }
}
