"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin_1 = require("../config/admin");
const crypto = require("crypto");
const customers = admin_1.admin.customers;
const items = admin_1.admin.items;
const main = admin_1.admin.main;
exports.indicationDbRefRoot = (userEmail) => {
    const userDbId = crypto.createHash('md5').update(userEmail).digest("hex");
    // const userDbId = crypto.createHmac('sha256', getSecretCustomer.userSecret).update(userEmail).digest('hex')
    return customers.ref(`/indication/${userDbId}`);
};
exports.userProfileDbRefRoot = (userEmail) => {
    const userDbId = crypto.createHash('md5').update(userEmail).digest("hex");
    // const userDbId = crypto.createHmac('sha256', getSecretCustomer.userSecret).update(userEmail).digest('hex')
    return customers.ref(`/profiles/${userDbId}`);
};
exports.userProfileDbRefPersonal = (userEmail) => {
    const userDbId = crypto.createHash('md5').update(userEmail).digest("hex");
    // const userDbId = crypto.createHmac('sha256', getSecretCustomer.userSecret).update(userEmail).digest('hex')
    return customers.ref(`/profiles/${userDbId}/personal/`);
};
exports.userPurchaseHistory = (userEmail) => {
    const userDbId = crypto.createHash('md5').update(userEmail).digest("hex");
    // const userDbId = crypto.createHmac('sha256', getSecretCustomer.userSecret).update(userEmail).digest('hex')
    return customers.ref(`/profiles/${userDbId}/purchaseHistory/`);
};
exports.itemProfileDbRef = (itemId, itemType, itemInnerType) => {
    console.log("TCL: itemProfileDbRef -> itemId", itemId);
    const itemDbId = crypto.createHash('md5').update(itemId).digest("hex");
    // const itemDbId = crypto.createHmac('sha256', getSecretCustomer.userSecret).update(itemId).digest('hex')
    return items.ref(`/${itemType}/${itemInnerType}/${itemDbId}`);
};
exports.itemsDbRoot = () => {
    return items.ref(`/`);
};
exports.customersDbRoot = () => {
    return customers.ref(`/`);
};
exports.getItemId = itemId => {
    const itemDbId = crypto.createHash('md5').update(itemId).digest("hex");
    // const itemDbId = crypto.createHmac('sha256', getSecretCustomer.userSecret).update(itemId).digest('hex')
    return itemDbId;
};
exports.getUserId = userEmail => {
    const userDbId = crypto.createHash('md5').update(userEmail).digest("hex");
    // const userDbId = crypto.createHmac('sha256', getSecretCustomer.userSecret).update(userEmail).digest('hex');
    return userDbId;
};
exports.updateDatabase = () => {
    return main.database().ref(`/`);
};
exports.billingDatabase = (billingPeriod, userEmail) => {
    const admin = customers;
    const userDbId = crypto.createHash('md5').update(userEmail).digest("hex");
    // const userDbId = crypto.createHmac('sha256', getSecretCustomer.userSecret).update(userEmail).digest('hex')
    // Referencia do Banco de dados
    const dbrefs = {
        // caminho do DB para o perfil de usuário
        userDbRef: admin.ref(`/profiles/${userDbId}/`),
        // Path to OBD billing for customers
        billingDbRef: admin.ref(`devices/billing/${billingPeriod}/`),
        // User Wallet
        dbRefWallet: admin.ref(`/profiles/${userDbId}/personal/wallet`),
        //userId
        userDbId: userDbId,
    };
    return dbrefs;
};
//# sourceMappingURL=database.js.map