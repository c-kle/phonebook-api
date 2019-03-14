import { ifElse, isNil } from "ramda";
import {
  Body,
  Delete,
  Get,
  JsonController,
  NotFoundError,
  Param,
  Post,
  Put, 
  HttpCode,
  CurrentUser} from "routing-controllers";
import { Service, Inject } from "typedi";
import { PhonebookEntryEntity } from "@entities/PhonebookEntryEntity";
import { PhonebookService } from "@modules/phonebook/PhonebookService";
import { phonebookServiceToken } from "@shared/DITokens";
import { IPhonebookService } from "@interfaces/IPhonebookService";
import { PhonebookEntryResource, CREATE_VALIDATION, UPDATE_VALIDATION } from "@resources/PhonebookEntryResource";
import { UserResource } from "@resources/UserResource";

const throwNotFound = () => Promise.reject(new NotFoundError());

@Service()
@JsonController("/phonebook/entries")
export class PhonebookController {
  private readonly service: IPhonebookService;

  constructor(
    @Inject(phonebookServiceToken)
    service: PhonebookService,
  ) {
    this.service = service;
  }

  @Get("/")
  public getAll(): Promise<PhonebookEntryResource[]> {
    return this.service.find();
  }

  @Post("/")
  @HttpCode(201)
  public create(
    @Body({
      required: true,
      validate: {
        groups: [CREATE_VALIDATION],
        validationError: { target: false, value: false },
      }
    }) entry: PhonebookEntryResource,
    @CurrentUser({ required: true }) _user: UserResource
  ): Promise<PhonebookEntryResource> {
    return this.service.create(entry);
  }

  @Put("/:id")
  public update(
    @Param("id") id: string,
    @Body({
      required: true,
      validate: {
        groups: [UPDATE_VALIDATION],
        validationError: { target: false, value: false },
      }
    }) entry: PhonebookEntryEntity,
    @CurrentUser({ required: true }) _user: UserResource
  ): Promise<PhonebookEntryEntity> {
    const updateEntry = () => this.service.update({ ...entry, id });

    return this.service
      .findById(id)
      .then(ifElse(isNil, throwNotFound, updateEntry));
  }

  @Delete("/:id")
  public delete(
    @Param("id") id: string,
    @CurrentUser({ required: true }) _user: UserResource
  ): Promise<any> {
    const deleteEntry = () => this.service.delete(id);

    return this.service
      .findById(id)
      .then(ifElse(isNil, throwNotFound, deleteEntry));
  }
}
