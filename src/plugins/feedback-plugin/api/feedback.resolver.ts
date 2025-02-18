import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Ctx, RequestContext, Allow, Permission } from '@vendure/core';
import { FeedbackService } from '../service/feedback.service';
import { FeedbackEntity } from '../entities/feedback.entity';

@Resolver()
export class FeedbackAdminResolver {
  constructor(private feedbackService: FeedbackService) {}

  @Query()
  @Allow(Permission.ReadCatalog)
  async feedbacks(@Ctx() ctx: RequestContext): Promise<FeedbackEntity[]> {
    return this.feedbackService.getFeedbacks(ctx);
  }

  @Mutation()
  @Allow(Permission.CreateCatalog)
  async createFeedback(
    @Ctx() ctx: RequestContext,
    @Args('input') input: { content: string; rating: number }
  ): Promise<FeedbackEntity> {
    return this.feedbackService.addFeedback(ctx, input.content, input.rating);
  }

  @Mutation()
  @Allow(Permission.DeleteCatalog)
  async removeFeedback(
    @Ctx() ctx: RequestContext,
    @Args('id') id: string
  ): Promise<boolean> {
    return this.feedbackService.removeFeedback(ctx, id);
  }
}

@Resolver()
export class FeedbackShopResolver {
  constructor(private feedbackService: FeedbackService) {}

  @Mutation()
  async createFeedback(
    @Ctx() ctx: RequestContext,
    @Args('input') input: { feedback: string; rating: number }
  ): Promise<FeedbackEntity> {
    return this.feedbackService.addFeedback(ctx, input.feedback, input.rating);
  }

  @Query()
  async feedbacks(@Ctx() ctx: RequestContext): Promise<FeedbackEntity[]> {
    return this.feedbackService.getFeedbacks(ctx);
  }
}
