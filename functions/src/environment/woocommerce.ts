
export const getVariables = (request) => {
    const wooRequest= JSON.stringify(request.body)
    const wooRequestParsed = JSON.parse(wooRequest)
    const billing = wooRequestParsed.billing;
    const orderStatus = wooRequestParsed.status
    let orderPaid: boolean;

     orderStatus === "processing" ? orderPaid = true : orderPaid = false;
    
    const woocommerceVariables = {
        idClient: wooRequestParsed.customer_id, 
        firstName: billing.first_name,
        userEmail: (billing.email).toLowerCase(),
        cpf: billing.cpf,
        purchasedItems: wooRequestParsed.line_items,
        orderId: wooRequestParsed.id,
        orderPaid: orderPaid,
        purchaseDate: Date.now()/1000|0
        
    }

    return woocommerceVariables;
}