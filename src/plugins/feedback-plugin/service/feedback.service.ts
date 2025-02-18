import { Injectable } from '@nestjs/common';
import {
    ID,
    RequestContext,
    TransactionalConnection,
    UserInputError,
} from '@vendure/core';
import { FeedbackEntity } from '../entities/feedback.entity';

@Injectable()
export class FeedbackService {
    constructor(
        private connection: TransactionalConnection,
    ) {}

    async getFeedbacks(ctx: RequestContext): Promise<FeedbackEntity[]> {
        return this.connection.getRepository(ctx, FeedbackEntity).find();
    }

    /**
     * Adds a new feedback item.
     */
    async addFeedback(ctx: RequestContext, content: string, rating: number): Promise<FeedbackEntity> {
        if (rating < 1 || rating > 5) {
            throw new UserInputError('Rating must be between 1 and 5');
        }

        const feedback = new FeedbackEntity();
        feedback.feedback = content;
        feedback.rating = rating;

        return this.connection.getRepository(ctx, FeedbackEntity).save(feedback);
    }

    /**
     * Removes a feedback item.
     */
    async removeFeedback(ctx: RequestContext, id: ID): Promise<boolean> {
        const result = await this.connection.getRepository(ctx, FeedbackEntity).delete(id);
        return result.affected ? result.affected > 0 : false;
    }
}
