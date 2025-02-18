import { SharedModule } from '@vendure/admin-ui/core';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '@vendure/admin-ui/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '@vendure/admin-ui/core';
import gql from 'graphql-tag';

interface FeedbackEntity {
    id: string;
    rating: number;
    feedback: string;
    createdAt: string;
}

@Component({
    selector: 'feedback',
    template: `
        <vdr-page-block>
            <vdr-action-bar>
                <vdr-ab-left>
                    <vdr-page-title>Asiakaspalautteet</vdr-page-title>
                </vdr-ab-left>
            </vdr-action-bar>

                 <!-- Feedback List with ngFor -->
            <vdr-card *ngIf="feedbackItems.length > 0">
                <div class="feedback-list">
                    <div class="feedback-header">
                        <div class="rating-column">Keskiarvo {{avg}}</div>
                        <div class="feedback-column">Palaute</div>
                        <div class="date-column">Aika</div>
                        <div class="actions-column">Poista</div>
                    </div>
                    <div *ngFor="let feedback of feedbackItems" class="feedback-row">
                        <div class="rating-column">
                            <div class="flex items-center">
                                <div class="stars-container">
                                    <span *ngFor="let star of [1,2,3,4,5]"
                                        [class.filled]="star <= feedback.rating"
                                        class="star">★</span>
                                </div>
                                <span class="ml-2">{{ feedback.rating }}/5</span>
                            </div>
                        </div>
                        <div class="feedback-column">
                            <div class="max-w-md">{{ feedback.feedback }}</div>
                        </div>
                        <div class="date-column">
                            {{ feedback.createdAt | date:'medium' }}
                        </div>
                        <div class="actions-column">
                            <button class="btn btn-link" (click)="removeFeedback(feedback.id)">
                                <clr-icon shape="trash" class="is-danger"></clr-icon>
                            </button>
                        </div>
                    </div>
                </div>
            </vdr-card>
          </vdr-page-block>
    `,
 styles: [`
        .stars-container {
            color: #ddd;
        }
        .star.filled {
            color: #ffd700;
        }
        .form-input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        .feedback-list {
            width: 100%;
        }
        .feedback-header {
            display: grid;
            grid-template-columns: 200px 1fr 200px 100px;
            padding: 1rem;
            font-weight: bold;
            border-bottom: 1px solid #ddd;
        }
        .feedback-row {
            display: grid;
            grid-template-columns: 200px 1fr 200px 100px;
            padding: 1rem;
            border-bottom: 1px solid #ddd;
            align-items: center;
        }
        .rating-column, .feedback-column, .date-column, .actions-column {
            padding: 0 0.5rem;
        }
    `],
    standalone: true,
    imports: [SharedModule, CommonModule, ReactiveFormsModule],
})
export class FeedbackComponent implements OnInit {
    feedbackItems: FeedbackEntity[] = [];
    showAddForm = false;
    feedbackForm: FormGroup;
    avg: string = "";

    constructor(
        private dataService: DataService,
        private formBuilder: FormBuilder,
        private notificationService: NotificationService,
    ) {
        this.feedbackForm = this.formBuilder.group({
            feedback: ['', Validators.required],
            rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
        });
    }

    ngOnInit() {
        this.getFeedback();
    }

    getFeedback() {
        this.dataService.query<{ feedbacks: FeedbackEntity[] }>(
            gql`
                query GetFeedbacks {
                    feedbacks {
                        id
                        rating
                        feedback
                        createdAt
                    }
                }
            `
        ).single$.subscribe(
            result => {
                this.feedbackItems = result.feedbacks;
                let total : number = 0;
                if(this.feedbackItems){
                this.feedbackItems.forEach((fb : FeedbackEntity) => {
                total += fb.rating
                });
                const avg2 = total / this.feedbackItems.length
                this.avg = avg2.toFixed(2); // "5.57"
                }
            },
            err => {
                this.notificationService.error('Error fetching feedback', err);
                console.error('Error fetching feedback', err);
            }
        );
    }

    submitFeedback() {
        if (this.feedbackForm.valid) {
            const { feedback, rating } = this.feedbackForm.value;
            this.dataService.mutate<{ addFeedback: FeedbackEntity }>(
                gql`
                    mutation AddFeedback($content: String!, $rating: Int!) {
                        addFeedback(content: $content, rating: $rating) {
                            id
                            rating
                            feedback
                            createdAt
                        }
                    }
                `,
                {
                    content: feedback,
                    rating: parseInt(rating, 10),
                }
            ).subscribe(
                result => {
                    this.notificationService.success('Feedback added successfully');
                    this.showAddForm = false;
                    this.feedbackForm.reset({ rating: 5 });
                    this.getFeedback();
                },
                err => {
                    this.notificationService.error('Error adding feedback');
                }
            );
        }
    }

    removeFeedback(id: string) {
        this.dataService.mutate<{ removeFeedback: boolean }>(
            gql`
                mutation RemoveFeedback($id: ID!) {
                    removeFeedback(id: $id)
                }
            `,
            { id }
        ).subscribe(
            result => {
                if (result.removeFeedback) {
                    this.notificationService.success('Feedback removed successfully');
                    this.getFeedback();
                }
            },
            err => {
                this.notificationService.error('Error removing feedback');
            }
        );
    }
}
