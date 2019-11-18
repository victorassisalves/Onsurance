
import {admin} from "../config/admin";
const crypto = require("crypto");

const items = admin.items;

/**
 * @description This function returns the tire db path in itens database
 * @param itemId Is the vehicle plate, or item ID chose by the team
 * @param vehicleType Is the vehicle type for reference (carro, moto... etc)
 * ``` 
 * return items.ref(`/tires/${vehicleType}/${itemDbId}`);
 * ```
 */
export const tiresInItemDbPath = (vehicleType: string, itemId: string) => {
    const itemDbId = crypto.createHash('md5').update(itemId).digest("hex");
    // const itemDbId = crypto.createHmac('sha256', getSecretCustomer.userSecret).update(itemId).digest('hex');
    return items.ref(`/tires/${vehicleType}/${itemDbId}`);
};

/**
 * @description This function return's the item db ID 
 * @param itemId Is the vehicle plate, or item ID chose by the team
 */
export const getItemId = itemId => {
    const itemDbId = crypto.createHash('md5').update(itemId).digest("hex");
    // const itemDbId = crypto.createHmac('sha256', getSecretCustomer.userSecret).update(itemId).digest('hex')
    return itemDbId;
};
