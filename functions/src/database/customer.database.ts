import {admin} from "../config/admin"
const crypto = require("crypto")

const customers = admin.customers;

/**
 * @description This function returns the path to customers profile.
 * @param userEmail Email of the user you are trying to access
 * ```
 * return customers.ref(`/profiles/${userDbId}`);
 * ```
 */
export const userProfileDbRefRoot = (userEmail) => {
    const userDbId = crypto.createHash('md5').update(userEmail).digest("hex");
    // const userDbId = crypto.createHmac('sha256', getSecretCustomer.userSecret).update(userEmail).digest('hex')
    return customers.ref(`/profiles/${userDbId}`);
};

/**
 * 
 * @param userEmail Email of the user you want to recover
 */
export const getCustomerId = userEmail => {
    const userDbId = crypto.createHash('md5').update(userEmail).digest("hex");
    // const userDbId = crypto.createHmac('sha256', getSecretCustomer.userSecret).update(userEmail).digest('hex');
    return userDbId;
};

export const customersProfilesDbRoot = () => {
    return customers.ref(`/profiles/`);
};