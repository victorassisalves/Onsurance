
import {admin} from "../config/admin"
const crypto = require("crypto")
const items = admin.items;


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
