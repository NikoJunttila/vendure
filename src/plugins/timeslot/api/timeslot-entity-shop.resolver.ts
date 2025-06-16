import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
    Allow,
    Ctx,
    ID,
    ListQueryOptions,
    PaginatedList,
    RelationPaths,
    Relations,
    RequestContext,
} from '@vendure/core';
import { TimeslotEntity } from '../entities/timeslot.entity';
import { TimeslotEntityService } from '../services/timeslot-entity.service';

@Resolver()
export class TimeslotEntityShopResolver {
    constructor(private timeslotEntityService: TimeslotEntityService) {}

    @Query()
    async timeslotEntity(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: ID },
        @Relations(TimeslotEntity) relations: RelationPaths<TimeslotEntity>,
    ): Promise<TimeslotEntity | null> {
        return this.timeslotEntityService.findOne(ctx, args.id, relations);
    }

    @Query()
    async timeslotEntitys(
        @Ctx() ctx: RequestContext,
        @Args() args: { options: ListQueryOptions<TimeslotEntity> },
        @Relations(TimeslotEntity) relations: RelationPaths<TimeslotEntity>,
    ): Promise<PaginatedList<TimeslotEntity>> {
        return this.timeslotEntityService.findAll(ctx, args.options || undefined, relations);
    }
}