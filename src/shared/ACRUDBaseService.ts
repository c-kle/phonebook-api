import { Repository, EntityManager, DeepPartial } from "typeorm";
import { BaseEntity } from "@entities/BaseEntity";
import { pipe, clone } from "ramda";

export abstract class ACRUDBaseService<TEntity extends BaseEntity> {
  constructor(protected readonly repository: Repository<TEntity>) { }

  public find(): Promise<TEntity[]> {
    return this.repository.find();
  }

  public findById(id: string): Promise<TEntity> {
    return this.repository.findOne(id);
  }

  public create(entity: DeepPartial<TEntity>): Promise<TEntity> {
    return this.repository.manager.transaction((manager: EntityManager) => {
      return pipe(
        clone,
        ({ id, ...obj }) => this.repository.create(<DeepPartial<TEntity>>obj),
        (newEntity) => manager.save(newEntity)
      )(entity);
    });
  }

  public update(entity: DeepPartial<TEntity>): Promise<TEntity> {
    return this.repository.manager.transaction((manager: EntityManager) => {
      const newEntity = this.repository.create(entity);
      return manager.save(newEntity);
    });
  }

  public delete(id: string): Promise<any> {
    return this.repository.delete(id);
  }
}