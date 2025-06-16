import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DeletionResponse, Permission } from '@vendure/common/lib/generated-types';
import { CustomFieldsObject } from '@vendure/common/lib/shared-types';
import {
    Allow,
    Ctx,
    ID,
    ListQueryOptions,
    PaginatedList,
    RelationPaths,
    Relations,
    RequestContext,
    Transaction
} from '@vendure/core';
import { TimeslotEntity } from '../entities/timeslot.entity';
import { TimeslotEntityService } from '../services/timeslot-entity.service';

// These can be replaced by generated types if you set up code generation
interface CreateTimeslotEntityInput {
    code: string;
    // Define the input fields here
    customFields?: CustomFieldsObject;
}
interface UpdateTimeslotEntityInput {
    id: ID;
    code?: string;
    // Define the input fields here
    customFields?: CustomFieldsObject;
}

@Resolver()
export class TimeslotEntityAdminResolver {
    constructor(private timeslotEntityService: TimeslotEntityService) {}

    @Query()
    @Allow(Permission.SuperAdmin)
    async timeslotEntity(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: ID },
        @Relations(TimeslotEntity) relations: RelationPaths<TimeslotEntity>,
    ): Promise<TimeslotEntity | null> {
        return this.timeslotEntityService.findOne(ctx, args.id, relations);
    }

    @Query()
    @Allow(Permission.SuperAdmin)
    async timeslotEntitys(
        @Ctx() ctx: RequestContext,
        @Args() args: { options: ListQueryOptions<TimeslotEntity> },
        @Relations(TimeslotEntity) relations: RelationPaths<TimeslotEntity>,
    ): Promise<PaginatedList<TimeslotEntity>> {
        return this.timeslotEntityService.findAll(ctx, args.options || undefined, relations);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.SuperAdmin)
    async createTimeslotEntity(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: CreateTimeslotEntityInput },
    ): Promise<TimeslotEntity> {
        return this.timeslotEntityService.create(ctx, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.SuperAdmin)
    async updateTimeslotEntity(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: UpdateTimeslotEntityInput },
    ): Promise<TimeslotEntity> {
        return this.timeslotEntityService.update(ctx, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.SuperAdmin)
    async deleteTimeslotEntity(@Ctx() ctx: RequestContext, @Args() args: { id: ID }): Promise<DeletionResponse> {
        return this.timeslotEntityService.delete(ctx, args.id);
    }
}
