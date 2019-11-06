import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
const api = new WooCommerceRestApi({
    url: "https://onsurance.me",
    consumerKey: "ck_24f24d13301017937cfb1e74f2e934971892939c",
    consumerSecret: "cs_6408b93b9160f219c8ed4d1297ab6406555ea7f4",
    version: "wc/v3",
  });

export const updateOrder = (order: number, status: string) => {

    return new Promise((resolve, reject) => {
        const data = {
            status: status
        };
        api.put(`orders/${order}`, data).then(async response => {
            resolve(response.data)
        }).catch((error) => {
            console.error(new Error(error.response.data));
            reject({
                errorType: `Error updating woocommerce`,
                message: error.response.data
            });
        });
    })
    
};

