import { DeepPartial, VendureEntity} from '@vendure/core';
import { Column, Entity } from 'typeorm';

@Entity()
export class FeedbackEntity extends VendureEntity {
    constructor(input?: DeepPartial<FeedbackEntity>) {
        super(input);
    }

    @Column()
    rating : number

    @Column()
    feedback : string
}
