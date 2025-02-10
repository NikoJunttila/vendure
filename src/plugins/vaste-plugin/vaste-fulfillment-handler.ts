import {Order,SellerService,FulfillmentHandler, LanguageCode, Injector, EntityHydrator } from '@vendure/core';

import {VasteAPI} from './vaste-data-source';
import {VasteOrder} from './vaste-types';
import type {KeyValueCache} from '@apollo/utils.keyvaluecache';

let vaste: VasteAPI;
var fulfillmentCache: KeyValueCache;
let entityHydrator: EntityHydrator;
let sellerService : SellerService;



export const vasteFulfillmentHandler = new FulfillmentHandler({
    code:'vaste',
    description:[{
        languageCode: LanguageCode.fi,
        value: "Luo Vaste tilaus seurantalinkillä."
    }],
    args:{
        preferredService:{
            type:'string',
            ui:{
                component: 'select-form-input',
                options:[
                    {value: 'priority'},
                    {value: 'standard'}
                ],
            },
        },
    },


init: (injector: Injector)=>{
    
    entityHydrator = injector.get(EntityHydrator);
    sellerService = injector.get(SellerService)
    var options ={
        apikey: "",
        cache: fulfillmentCache

    };
    vaste = new VasteAPI(options);
},
createFulfillment: async (ctx, orders, lines, args ) => {
    //tämä koodi siirretty createPayment paytrail metodiin
    //@ts-ignore
    var order : Order = orders.find(ord => ord.state == 'PaymentSettled');
    await entityHydrator.hydrate(ctx, order, { relations: ['customer'] });
    /*
    var dateStart = new Date();
    var vasteOrder: VasteOrder;
    //TODO find channel number and there find channel seller for this number below
    //var idx: number = order?.channels.findIndex(chan => chan.token == 'centria-token') || 0;
    //const seller = sellerService.findOne(ctx,2)
    //@ts-ignore
    const result = parseDeliveryDateTime(order.customFields.dateTime)
    
    vasteOrder = {
        environment: "test",
        senderLastname: "Elina",
        senderFirstname: "Miettunen",
        senderEmail: "elina.miettunen@m-ketju.fi",
        senderPhone: "0449011358",
        pickupAddress:"Nelostie 2391",
        pickupApartment: "",
        pickupPostal: "95340",
        pickupCity: "Loue",
        pickupDateStart: ""+dateStart.getFullYear()+"-"+(1+dateStart.getMonth()).toString().padStart(2,"0")+"-"+dateStart.getDate().toString().padStart(2,"0"),
        pickupDateStop: ""+dateStart.getFullYear()+"-"+(1+dateStart.getMonth()).toString().padStart(2,"0")+"-"+dateStart.getDate().toString().padStart(2,"0"),
        pickupTimeStart: ""+dateStart.getHours().toString().padStart(2,"0")+":"+dateStart.getMinutes().toString().padStart(2,"0"),
        pickupTimeStop: ""+dateStart.getHours().toString().padStart(2,"0")+":"+dateStart.getMinutes().toString().padStart(2,"0"),
        receiverLastname: order?.customer?.lastName || "",
        receiverFirstname: order?.customer?.firstName || "",
        receiverPhone: order?.shippingAddress.phoneNumber || "",
        receiverEmail: order.customer?.emailAddress || "",
        deliveryAddress: order?.shippingAddress.streetLine1 || "",
        deliveryApartment: order?.shippingAddress.streetLine2 || "",
        deliveryPostal: order?.shippingAddress.postalCode || "",
        deliveryCity: order?.shippingAddress.city || "",
        deliveryDateStart: result.deliveryDateStart,
        deliveryDateStop: result.deliveryDateStop,
        deliveryTimeStart: result.deliveryTimeStart,
        deliveryTimeStop: result.deliveryTimeStop,
        deliveryCount: 1,
        deliveryLength: 10,
        deliveryWidth: 10,
        deliveryHeight: 10,
        deliveryWeight: 10,
        destination: "address",
        apikey: "",
        //@ts-ignore
        orderInfoText: order.customFields.ToimitusInfo || "",
        packageDescriptionText: "",
        personCount: 0
    };
    
    try{
        const transaction = await vaste.createOrder(
            vasteOrder.receiverFirstname,
            vasteOrder.receiverLastname,
            vasteOrder.deliveryAddress,
            vasteOrder.deliveryApartment,
            vasteOrder.deliveryPostal,
            vasteOrder.deliveryCity,
            vasteOrder.receiverEmail,
            vasteOrder.receiverPhone,
            vasteOrder.senderFirstname,
            vasteOrder.senderLastname,
            vasteOrder.pickupAddress,
            vasteOrder.pickupApartment,
            vasteOrder.pickupPostal,
            vasteOrder.pickupCity,
            vasteOrder.senderEmail,
            vasteOrder.senderPhone,
            vasteOrder.pickupDateStart,
            vasteOrder.pickupDateStop,
            vasteOrder.pickupTimeStart,
            vasteOrder.pickupTimeStop,
            vasteOrder.deliveryDateStart,
            vasteOrder.deliveryDateStop,
            vasteOrder.deliveryTimeStart,
            vasteOrder.deliveryTimeStop,
            vasteOrder.orderInfoText,
            vasteOrder.packageDescriptionText,
            vasteOrder.personCount.toString(),
            vasteOrder.deliveryHeight,
            vasteOrder.deliveryWidth,
            vasteOrder.deliveryLength,
            vasteOrder.deliveryWeight,
            vasteOrder.deliveryCount,
            vasteOrder.destination
            );
        return {
            method: `Vaste ${args.preferredService}`,
            trackingCode: transaction.vasteOrder
        };
    }catch(e:any){
        console.log(e);
        throw e;
    } */
    return {
            method: `Vaste kotiinkuljetus`,
            trackingCode: order.customFields.VasteCode
        };
},
onFulfillmentTransition: async(fromState, toState, {fulfillment}) =>{
    if(toState === 'Cancelled'){
        //await vaste.cancelOrder(fulfillment.customFields.vasteOrderId);
    }
    if(toState === 'Created'){
        //
    }
},
})

