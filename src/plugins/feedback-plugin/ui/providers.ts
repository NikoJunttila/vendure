import { addNavMenuSection } from '@vendure/admin-ui/core';

export default [
    addNavMenuSection({
        id: 'feedback',
        label: 'Extrat',
        items: [{
            id: 'feedback',
            label: 'Palautteet',
            routerLink: ['/extensions/feedback'],
            // Icon can be any of https://core.clarity.design/foundation/icons/shapes/
            icon: 'cursor-hand-open',
        }],
    },
    // Add this section before the "settings" section
    'settings'),
];
