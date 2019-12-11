
import {admin} from "../config/admin"
const crypto = require("crypto")
const items = admin.items;

/**
 * @description This function returns the db Path to item
 * @param itemId Vehicle plate usually inside item on userProfile
 * @param itemType The type of the item vehicle | tire
 * @param itemInnerType The specifict type of item: car | motorcycle | vuc | pickup...
 */
export const itemProfileDbRef = (itemId, itemType, itemInnerType) => {
    const itemDbId = crypto.createHash('md5').update(itemId).digest("hex");
    // const itemDbId = crypto.createHmac('sha256', getSecretCustomer.userSecret).update(itemId).digest('hex')
    return items.ref(`/${itemType}/${itemInnerType}/${itemDbId}`);
};

export const itemsDbRoot = () => {
    return items.ref(`/`);
};

export const getItemId = itemId => {
    const itemDbId = crypto.createHash('md5').update(itemId).digest("hex");
    // const itemDbId = crypto.createHmac('sha256', getSecretCustomer.userSecret).update(itemId).digest('hex')
    return itemDbId;
};
