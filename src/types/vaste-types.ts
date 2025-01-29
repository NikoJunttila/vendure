export type RoutePriceResponse = {
    status: string;
    data: [{
        pestimate: number,
        destimate: number,
        amount: number,
        company: [{
            companyType: string,
            _id: string,
            companyName: string,
            companyAddress?: string,
            companyID?: string,
            link?: string,
            __v?: number,
            phone?: string,
            web?: string
        }],
        days: string
    }];

}
export type OrderStatus ={
    status: string,
    data: {
        _id: string,
        subscriber:{
            name:{
                lastName: string,
                firstName: string,
                phoneNumber: string,
                email: string
            }
        },
        receiver: {
            name:{
                lastName: string,
                firstName: string,
                phoneNumber: string,
                email: string
            }
        },
        address:{
            pickup:{
                pstreet: string,
                pnumber: string,
                plocal: string,
                papartmentnumber: string
            },
            delivery:{
                dstreet: string,
                dnumber: string,
                dlocal: string,
                dapartmentnumber: string
            }
        },
        time:{
            pickupTime:{
                pAfter: number,
                pBefore: number,
            },
            deliveryTime: {
                dAfter: number,
                dBefore: number
            }
        },
        orderStatus: object,
        status: string,
        delivery: object,
        orderInfo: string,
        vasteOrder: number,
        companyID: string,
        destination: string
    }
}
export type VasteOrder ={
    senderLastname:string,
    senderFirstname:string,
    senderPhone: string,
    senderEmail:string,
    pickupAddress: string,
    pickupApartment: string,
    pickupPostal:string,
    pickupCity:string,
    receiverLastname:string,
    receiverFirstname:string,
    receiverPhone:string,
    receiverEmail:string,
    deliveryAddress:string,
    deliveryApartment:string,
    deliveryPostal:string,
    deliveryCity:string,
    pickupDateStart:string,
    pickupDateStop: string,
    pickupTimeStart: string,
    pickupTimeStop:string,
    deliveryDateStart:string,
    deliveryDateStop:string,
    deliveryTimeStart:string,
    deliveryTimeStop:string,
    orderInfoText:string,
    packageDescriptionText:string,
    personCount:number,
    deliveryHeight:number,
    deliveryLength:number,
    deliveryWidth:number,
    deliveryWeight:number,
    deliveryCount:number,
    destination: string,
    environment?: string,
    apikey?:string
}
export type VasteOrderResponse = {
    status:string,
    id:string,
    vasteOrder: string
}
export type postalCodeChecker = {
    data:[
        {  
            postalCodes:number[],
            price: number
        }
    ]
}
