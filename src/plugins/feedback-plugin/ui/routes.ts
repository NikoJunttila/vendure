import { registerRouteComponent } from '@vendure/admin-ui/core';
import { FeedbackComponent } from './feedback.component';

export default [
    registerRouteComponent({
        component: FeedbackComponent,
        path: '',
        title: 'Palaute sivu',
        breadcrumb: 'Feedback',
    }),
];
