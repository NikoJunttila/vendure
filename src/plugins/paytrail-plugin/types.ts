export interface PaytrailItem {
  unitPrice: number;
  units: number;
  vatPercentage: number;
  productCode: string;
  description: string;
}

interface PaytrailCustomer {
  email: string;
}

interface PaytrailRedirectUrls {
  success: string;
  cancel: string;
}

export interface PaytrailData {
  stamp: string;
  reference: string;
  amount: number;
  currency: string;
  language: string;
  items: PaytrailItem[];
  customer: PaytrailCustomer;
  redirectUrls: PaytrailRedirectUrls;
}
