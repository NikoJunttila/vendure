import { Inject, Injectable } from '@nestjs/common';
import { DeletionResponse, DeletionResult } from '@vendure/common/lib/generated-types';
import { CustomFieldsObject, ID, PaginatedList } from '@vendure/common/lib/shared-types';
import {
    CustomFieldRelationService,
    ListQueryBuilder,
    ListQueryOptions,
    RelationPaths,
    RequestContext,
    TransactionalConnection,
    assertFound,
    patchEntity
} from '@vendure/core';
import { TIMESLOT_PLUGIN_OPTIONS } from '../constants';
import { TimeslotEntity } from '../entities/timeslot.entity';
import { PluginInitOptions } from '../types';

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

@Injectable()
export class TimeslotEntityService {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder,
        private customFieldRelationService: CustomFieldRelationService, @Inject(TIMESLOT_PLUGIN_OPTIONS) private options: PluginInitOptions
    ) {}

    async findAll(
        ctx: RequestContext,
        options?: ListQueryOptions<TimeslotEntity>,
        relations?: RelationPaths<TimeslotEntity>,
    ): Promise<PaginatedList<TimeslotEntity>> {
        const [items, totalItems] = await this.listQueryBuilder
            .build(TimeslotEntity, options, {
                relations,
                ctx,
            }
            ).getManyAndCount();
        return {
            items,
            totalItems,
        };
    }

    findOne(
        ctx: RequestContext,
        id: ID,
        relations?: RelationPaths<TimeslotEntity>,
    ): Promise<TimeslotEntity | null> {
        return this.connection
            .getRepository(ctx, TimeslotEntity)
            .findOne({
                where: { id },
                relations,
            });
    }

    async create(ctx: RequestContext, input: CreateTimeslotEntityInput): Promise<TimeslotEntity> {
        const newEntity = await this.connection.getRepository(ctx, TimeslotEntity).save(input);
        await this.customFieldRelationService.updateRelations(ctx, TimeslotEntity, input, newEntity);
        return assertFound(this.findOne(ctx, newEntity.id));
    }

    async update(ctx: RequestContext, input: UpdateTimeslotEntityInput): Promise<TimeslotEntity> {
        const entity = await this.connection.getEntityOrThrow(ctx, TimeslotEntity, input.id);
        const updatedEntity = patchEntity(entity, input);
        await this.connection.getRepository(ctx, TimeslotEntity).save(updatedEntity, { reload: false });
        await this.customFieldRelationService.updateRelations(ctx, TimeslotEntity, input, updatedEntity);
        return assertFound(this.findOne(ctx, updatedEntity.id));
    }

    async delete(ctx: RequestContext, id: ID): Promise<DeletionResponse> {
        const entity = await this.connection.getEntityOrThrow(ctx, TimeslotEntity, id);
        try {
            await this.connection.getRepository(ctx, TimeslotEntity).remove(entity);
            return {
                result: DeletionResult.DELETED,
            };
        } catch (e: any) {
            return {
                result: DeletionResult.NOT_DELETED,
                message: e.toString(),
            };
        }
    }
}
