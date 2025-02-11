import Stripe from "stripe";

const stripe = new Stripe(
  "sk_test_51N0PJMLdD2UuHgNTnBFTGoto84dK4A2mbwtqkDtRsor9xj8ePWvS2PPRIs9gWheT7rU2N7daJztzlJi0vhYPHQS700nbv3kAWR"
);

interface VendureOptions {
amount: number;
currency?: string;
connectedAccountId: string;
transfer_group: string;
}

/**
 * @description
 * A fake payment API based loosely on the Stripe Connect multiparty payments flow
 * described here: https://stripe.com/docs/connect/charges-transfers
 */
export class MyConnectSdk {
  constructor(private options: { apiKey: string }) {}

  /**
   * Used to create a payment on the platform itself.
   */
  async createPayment(options: VendureOptions){
    return { transactionId: Math.random().toString(36).substring(3) };
  }

  /**
   * Used to create a transfer payment to a Seller.
   */
  async createTransfer(options: VendureOptions,metadata:any) {
    if(metadata.paymentMethod == "stripe"){
        const transfer = await stripe.transfers.create({
            metadata: {
              orderCode:metadata.orderCode,
              channelToken:metadata.channelToken,
              orderId:metadata.orderId,
              transfer_group:metadata.transfer_group,
              LanguageCode:"fi"
            },
            amount: options.amount,
            currency: options.currency || "EUR",
            destination: options.connectedAccountId,
            transfer_group: options.transfer_group,
        });
        return {transactionId:transfer.id}
    }
    return { transactionId: Math.random().toString(36).substring(3) };
  }
}
