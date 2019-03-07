import { Exclude } from "class-transformer/decorators";

@Exclude()
export class BaseResource {
  public id: string;
}
