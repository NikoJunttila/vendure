import {Customer, FulfillmentHandler, LanguageCode } from '@vendure/core';
export const storePickupFulfillmentHandler = new FulfillmentHandler({
    code:'pickup',
    description:[{
        languageCode: LanguageCode.fi,
        value: "Ostokset haetaan kaupasta"
    }],
    args:{
        preferredService:{
            type:'string',
            ui:{
                component: 'select-form-input',
                options:[
                    {value: 'Nouto'}
                ],
            },
        },
    },

init: ()=>{
},
createFulfillment: async (ctx, orders, lines, args ) => {
    var order = orders.find(ord => ord.state == 'PaymentSettled');
    console.log(order);
    
        return {
            method: `pick up from store`,
        };
},
onFulfillmentTransition: async(fromState, toState, {fulfillment}) =>{
    if(toState === 'Cancelled'){
        //
    }
    if(toState === 'Created'){
        //
    }
},

})

