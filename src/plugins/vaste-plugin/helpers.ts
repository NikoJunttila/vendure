import { VasteAPI } from "./vaste-data-source";
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
import { VasteOrderResponse, VasteOrder } from "src/plugins/vaste-plugin/vaste-types";


export function parseDeliveryDateTime(dateTimeString : any) {
  // Parse the ISO string into Date objects
  const startDate = new Date(dateTimeString);
  const stopDate = new Date(dateTimeString);
  
  // Add hours. dunno why
  startDate.setUTCHours(stopDate.getUTCHours() + 2);
  stopDate.setUTCHours(stopDate.getUTCHours() + 4);
  
  // Format the date as YYYY-MM-DD
  const formattedDate = startDate.toISOString().split('T')[0];
  
  // Format the start time as HH:mm
  const startHours = startDate.getUTCHours().toString().padStart(2, '0');
  const startMinutes = startDate.getUTCMinutes().toString().padStart(2, '0');
  const formattedStartTime = `${startHours}:${startMinutes}`;
  
  // Format the stop time as HH:mm
  const stopHours = stopDate.getUTCHours().toString().padStart(2, '0');
  const stopMinutes = stopDate.getUTCMinutes().toString().padStart(2, '0');
  const formattedStopTime = `${stopHours}:${stopMinutes}`;
  
  return {
    deliveryDateStart: formattedDate,
    deliveryDateStop: formattedDate,
    deliveryTimeStart: formattedStartTime,
    deliveryTimeStop: formattedStopTime
  };
}

export async function vendureDataToVaste(order:any, seller:any): Promise<string>{
            const options = {
                apikey: "",
                cache: new Map() as unknown as KeyValueCache
            };
            const vaste = new VasteAPI(options);
            const dateStart = new Date();
            // Parse delivery date time
            const result = parseDeliveryDateTime(order.customFields.dateTime);
            //vaste create order gives 504 timeout if field is empty
            const vasteOrder: VasteOrder = {
                senderLastname: seller.customFields.lastName || "undefined",
                senderFirstname: seller.customFields.firstName || "undefined",
                senderEmail: seller.customFields.Email || "undefined",
                senderPhone: seller.customFields.Phone || "undefined",
                pickupAddress: seller.customFields.pickupAddress || "",
                pickupApartment:seller.customFields.pickupApartment || "",
                pickupPostal: seller.customFields.pickupPostalCode || "",
                pickupCity: seller.customFields.pickupCity || "",
                pickupDateStart: `${dateStart.getFullYear()}-${(1 + dateStart.getMonth()).toString().padStart(2, "0")}-${dateStart.getDate().toString().padStart(2, "0")}`,
                pickupDateStop: `${dateStart.getFullYear()}-${(1 + dateStart.getMonth()).toString().padStart(2, "0")}-${dateStart.getDate().toString().padStart(2, "0")}`,
                pickupTimeStart: `${dateStart.getHours().toString().padStart(2, "0")}:${dateStart.getMinutes().toString().padStart(2, "0")}`,
                pickupTimeStop: `${dateStart.getHours().toString().padStart(2, "0")}:${dateStart.getMinutes().toString().padStart(2, "0")}`,
                receiverLastname: order?.customer?.lastName || "undefined",
                receiverFirstname: order?.customer?.firstName || "undefined",
                receiverPhone: order?.customer.phoneNumber || "undefined",
                receiverEmail: order.customer?.emailAddress || "undefined",
                deliveryAddress: order?.shippingAddress?.streetLine1 || "",
                deliveryApartment: order?.shippingAddress?.streetLine2 || "",
                deliveryPostal: order?.shippingAddress?.postalCode || "",
                deliveryCity: order?.shippingAddress?.city || "",
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
                //@ts-ignore
                orderInfoText: order.customFields.ToimitusInfo || "",
                packageDescriptionText: "",
                personCount: 0
            };
            try {
                
              const vasteRes = await vaste.createOrder(
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
                return vasteRes.vasteOrder
            } catch (e) {
                console.error(e)
                return ""
            }
    }