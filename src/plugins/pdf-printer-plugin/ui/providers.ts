import gql from 'graphql-tag';
import { addActionBarItem } from '@vendure/admin-ui/core';
import jsPDF from 'jspdf';
import { map } from 'rxjs/operators';
import 'jspdf-autotable';
import QRCode from 'qrcode';

const GET_ORDER = gql`
    query GetOrder($id: ID!) {
        order(id: $id) {
            id
            code
            state
            total
            currencyCode
            customer {
                firstName
                lastName
                emailAddress
            }
            shippingAddress {
                fullName
                streetLine1
                streetLine2
                city
                postalCode
                phoneNumber
            }
            customFields {
              dateString
              VasteCode
            }
            shippingLines{
              shippingMethod {
                code
                name
              }
            }
            lines {
                productVariant {
                    name
                    sku
                }
                quantity
                unitPrice
            }
        }
    }
`;

async function generateOrderPDF(orderData: any) {
    const doc = new jsPDF();
    const totalPrice = orderData.total / 100;
    const vasteCode = orderData.customFields.VasteCode || ""
    // Generate QR code
    const qrCodeData = await QRCode.toDataURL(vasteCode, {
        width: 175,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    });

    // Add header
    doc.setFontSize(20);
    doc.text(`Tilaus: ${orderData.code}`, 20, 20);

    // Add QR code in top right corner
    doc.addImage(qrCodeData, 'PNG', 150, 15, 40, 40);

    // Add customer details
    doc.setFontSize(12);
    doc.text('Asiakastiedot', 20, 30);
    doc.text(`Nimi: ${orderData.customer.firstName} ${orderData.customer.lastName}`, 20, 40);
    doc.text(`Sähköposti: ${orderData.customer.emailAddress}`, 20, 50);
    doc.text(`Puh. num: ${orderData.shippingAddress.phoneNumber}`, 20,60)

    // Add shipping address
    doc.text('Toimitusosoite', 20, 80);
    doc.text(`${orderData.shippingAddress.fullName}`, 20, 90);
    doc.text(`${orderData.shippingAddress.streetLine1}, ${orderData.shippingAddress.streetLine2}`, 20, 100);
    doc.text(`${orderData.shippingAddress.city}, ${orderData.shippingAddress.postalCode}`, 20, 110);
    // Add order details
    doc.text('Tilauksen tiedot', 20, 130);
    doc.text(`Toimitustapa: ${orderData.shippingLines[0].shippingMethod.name}`, 20, 140);
    doc.text(`Toimitusaika: ${orderData.customFields.dateString}`, 20, 150)
    doc.text(`Yhteensä: ${totalPrice} ${orderData.currencyCode}`, 20, 160);

    // Create table for order lines
    const tableColumns = ['Tuote', 'SKU', 'Määrä', 'Yksikköhinta', 'Yhteensä'];
    const tableRows = orderData.lines.map((line: any) => [
        line.productVariant.name,
        line.productVariant.sku,
        line.quantity,
        `${line.unitPrice / 100} ${orderData.currencyCode}`,
        `${line.quantity * line.unitPrice / 100} ${orderData.currencyCode}`
    ]);

    // @ts-ignore
    doc.autoTable({
        startY: 180,
        head: [tableColumns],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] }
    });

    // Save PDF
    doc.save(`tilaus-${orderData.code}.pdf`);
}

export default [
    addActionBarItem({
        id: 'print-pdf',
        locationId: 'order-detail',
        label: 'Tulosta pdf',
        icon: 'printer',
        buttonState: context => {
            return context.entity$.pipe(
                map((order : any) => ({
                    disabled: order?.state === 'PaymentAuthorized',
                    visible: true,
                })),
            );
        },
        onClick: async (event, context) => {
            try {
                const orderId = context.route.snapshot.params.id;

                const orderData = await context.dataService
                    .query(GET_ORDER, { id: orderId })
                    .single$
                    .toPromise();
                //@ts-ignore
                if (orderData?.order) {
                    //@ts-ignore
                    const order = orderData.order;
                    await generateOrderPDF(order);
                    context.notificationService.success('PDF generated successfully');
                } else {
                    throw new Error('Order data not found');
                }
            } catch (error: any) {
                context.notificationService.error('Error generating PDF: ' + error.message);
            }
        },
        requiresPermission: 'ReadOrder',
    }),
];
