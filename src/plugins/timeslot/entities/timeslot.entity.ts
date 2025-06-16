import {
    DeepPartial,
    HasCustomFields,
    VendureEntity
} from '@vendure/core';
import { Column, Entity } from 'typeorm';

export class TimeslotEntityCustomFields {}

@Entity()
export class TimeslotEntity extends VendureEntity implements HasCustomFields {
    constructor(input?: DeepPartial<TimeslotEntity>) {
        super(input);
    }

    @Column()
    code: string;

    @Column(type => TimeslotEntityCustomFields)
    customFields: TimeslotEntityCustomFields;
}
