import {JsonController
  , Get
  // Post, Param, Delete, Body
} from "routing-controllers";
import {Service} from "typedi";
// import {CategoryRepository} from "../repository/CategoryRepository";

@Service()
@JsonController()
export class PhoneBookController {
  constructor() {}

  @Get("/ping")
  ping(): Promise<any> {
    return Promise.resolve({data: 'pong'})
  }
  // @Get("/categories")
  // all(): Promise<Category[]> {
  //     return this.categoryRepository.findAll();
  // }

  // @Get("/categories/:id")
  // one(@Param("id") id: number): Category {
  //     return this.categoryRepository.findOne(id);
  // }

  // @Post("/categories")
  // category(@Body() category: Category): Category {
  //     return this.categoryRepository.save(category);
  // }

  // @Delete("/categories/:id")
  // delete(@Param("id") id: number): Category {
  //     return this.categoryRepository.remove(id);
  // }
}