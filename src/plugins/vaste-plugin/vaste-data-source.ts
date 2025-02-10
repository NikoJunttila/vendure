import {RESTDataSource} from '@apollo/datasource-rest';
import { OrderStatus, RoutePriceResponse, VasteOrderResponse } from './vaste-types';
import type {KeyValueCache} from '@apollo/utils.keyvaluecache';
import 'dotenv/config';

export class VasteAPI extends RESTDataSource{
    override baseURL = "https://matava.swedencentral.cloudapp.azure.com:3567/";
    private _apikey: string;
    private _cache: KeyValueCache
    constructor(options:{apikey?:string; cache: KeyValueCache}){
        super(options);
        try{
                this.post('authenticate',{body:`username=${encodeURIComponent(process.env.VASTE_USER!)}&password=${encodeURIComponent(process.env.VASTE_PASS!)}&environment=${encodeURIComponent(process.env.VASTE_ENV!)}`,headers:{"Content-Type":"x-www-form-urlencoded"}}).then(res =>{
                this._apikey = res.data.api_key;
                options.apikey = res.data.api_key;
                this._cache = options.cache;
            })
        } catch (e){
            console.error(e)
        }
    }
    async getApiKey():Promise<string>{
        try{
            const res = await this.post('authenticate',{body:`username=${encodeURIComponent(process.env.VASTE_USER!)}&password=${encodeURIComponent(process.env.VASTE_PASS!)}&environment=${encodeURIComponent(process.env.VASTE_ENV!)}`,headers:{"Content-Type":"x-www-form-urlencoded"}})
            return res.data.api_key
        }
        catch (e){
            return ""
        }
    }
    async getRate(pickup: string, destination: string, date: string): Promise<RoutePriceResponse>{
        return this.post<RoutePriceResponse>('getRoutePrices',{body:`apikey=${encodeURIComponent(this._apikey)}&environment=${encodeURIComponent(process.env.VASTE_ENV!)}&pickup=${encodeURIComponent(pickup)}&delivery=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}&stretch=1&filter=0&type=4`,
        headers:{"Content-Type":"x-www-form-urlencoded"}});
        
    }
    async createOrder(
    receiverFirstName: string, 
    receiverLastName: string, 
    deliveryAddress: string, 
    deliveryApartment: string, 
    deliveryPostCode: string, 
    deliveryCity: string, 
    receiverEmail: string, 
    receiverPhone: string,
    senderFirstname: string, 
    senderLastname: string, 
    pickupAddress: string, 
    pickupApartment: string, 
    pickupPostal: string, 
    pickupCity: string, 
    senderEmail: string,
    senderPhone: string, 
    pickupDateStart: string,
    pickupDateStop: string, 
    pickupTimeStart: string, 
    pickupTimeStop: string, 
    deliveryDateStart: string, 
    deliveryDateStop: string, 
    deliveryTimeStart: string, 
    deliveryTimeEnd: string,
    orderInfoText: string, 
    orderDescription: string, 
    personCount: string, 
    deliveryHeight: number, 
    deliveryWidth: number, 
    deliveryLength: number, 
    deliveryWeight: number, 
    deliveryCount: number, 
    destinationType: string
): Promise<VasteOrderResponse> {
    const apikey = await this.getApiKey()
    const requestBody = `senderLastname=${encodeURIComponent(senderLastname)}`+
        `&senderFirstname=${encodeURIComponent(senderFirstname)}`+
        `&senderPhone=${encodeURIComponent(senderPhone)}`+
        `&senderEmail=${encodeURIComponent(senderEmail)}`+
        `&pickupAddress=${encodeURIComponent(pickupAddress)}`+
        `&pickupApartment=${encodeURIComponent(pickupApartment)}`+
        `&pickupPostal=${encodeURIComponent(pickupPostal)}`+
        `&pickupCity=${encodeURIComponent(pickupCity)}`+
        `&receiverLastname=${encodeURIComponent(receiverLastName)}`+
        `&receiverFirstname=${encodeURIComponent(receiverFirstName)}`+
        `&receiverPhone=${encodeURIComponent(receiverPhone)}`+
        `&receiverEmail=${encodeURIComponent(receiverEmail)}`+
        `&deliveryAddress=${encodeURIComponent(deliveryAddress)}`+
        `&deliveryApartment=${encodeURIComponent(deliveryApartment)}`+
        `&deliveryPostal=${encodeURIComponent(deliveryPostCode)}`+
        `&deliveryCity=${encodeURIComponent(deliveryCity)}`+
        `&pickupDateStart=${encodeURIComponent(pickupDateStart)}`+
        `&pickupDateStop=${encodeURIComponent(pickupDateStop)}`+
        `&pickupTimeStart=${encodeURIComponent(pickupTimeStart)}`+
        `&pickupTimeStop=${encodeURIComponent(pickupTimeStop)}`+
        `&deliveryDateStart=${encodeURIComponent(deliveryDateStart)}`+
        `&deliveryDateStop=${encodeURIComponent(deliveryDateStop)}`+
        `&deliveryTimeStart=${encodeURIComponent(deliveryTimeStart)}`+
        `&deliveryTimeStop=${encodeURIComponent(deliveryTimeEnd)}`+
        `&personCount=${encodeURIComponent(personCount)}`+
        `&orderInfoText=${encodeURIComponent(orderInfoText)}`+
        `&orderDescription=${encodeURIComponent(orderDescription)}`+
        `&destination=${encodeURIComponent(destinationType)}`+
        `&deliveryHeight=${encodeURIComponent(deliveryHeight)}`+
        `&deliveryWidth=${encodeURIComponent(deliveryWidth)}`+
        `&deliveryWeight=${encodeURIComponent(deliveryWeight)}`+
        `&deliveryLength=${encodeURIComponent(deliveryLength)}`+
        `&deliveryCount=${encodeURIComponent(deliveryCount)}`+
        `&apikey=${encodeURIComponent(apikey)}`+
        `&api_key=${encodeURIComponent(apikey)}`+
        `&environment=${encodeURIComponent(process.env.VASTE_ENV!)}`;
    try {
        const response = await this.post('tilaus', {
            body: requestBody,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        console.log('Response:', response);
        return response;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error; // Re-throw the error to be handled by the caller
    }
}
async getOrderStatus(orderId: string): Promise<OrderStatus>{
        return this.post('haetilaus',{body:`apikey=${encodeURIComponent(this._apikey)}&orderID=${encodeURIComponent(orderId)}`,headers:{"Content-Type":"x-www-form-urlencoded"}})
    }
}
