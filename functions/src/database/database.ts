
import {admin, getSecretCustomer} from "../config/admin"
const crypto = require("crypto")

const customers = admin.customers;
const items = admin.items;
const main = admin.main;
 

export const indicationDbRefRoot = (userEmail) => {
    const userDbId = crypto.createHash('md5').update(userEmail).digest("hex");
    // const userDbId = crypto.createHmac('sha256', getSecretCustomer.userSecret).update(userEmail).digest('hex')
    return customers.ref(`/indication/${userDbId}`);
};

export const userProfileDbRefRoot = (userEmail) => {
    const userDbId = crypto.createHash('md5').update(userEmail).digest("hex");
    // const userDbId = crypto.createHmac('sha256', getSecretCustomer.userSecret).update(userEmail).digest('hex')
    return customers.ref(`/profiles/${userDbId}`);
};

export const userProfileDbRefPersonal = (userEmail) => {
    const userDbId = crypto.createHash('md5').update(userEmail).digest("hex");
    // const userDbId = crypto.createHmac('sha256', getSecretCustomer.userSecret).update(userEmail).digest('hex')
    return customers.ref(`/profiles/${userDbId}/personal/`);
};

export const userPurchaseHistory = (userEmail) => {
    const userDbId = crypto.createHash('md5').update(userEmail).digest("hex");
    // const userDbId = crypto.createHmac('sha256', getSecretCustomer.userSecret).update(userEmail).digest('hex')
    return customers.ref(`/profiles/${userDbId}/purchaseHistory/`);
};

export const itemProfileDbRef = (itemId, itemType, itemInnerType) => {
    console.log("TCL: itemProfileDbRef -> itemId", itemId)
    const itemDbId = crypto.createHash('md5').update(itemId).digest("hex");
    // const itemDbId = crypto.createHmac('sha256', getSecretCustomer.userSecret).update(itemId).digest('hex')
    return items.ref(`/${itemType}/${itemInnerType}/${itemDbId}`);
};

export const itemsDbRoot = () => {
    return items.ref(`/`);
};
export const customersDbRoot = () => {
    return customers.ref(`/`);
};

export const getItemId = itemId => {
    const itemDbId = crypto.createHash('md5').update(itemId).digest("hex");
    // const itemDbId = crypto.createHmac('sha256', getSecretCustomer.userSecret).update(itemId).digest('hex')
    return itemDbId;
};

export const getUserId = userEmail => {
    const userDbId = crypto.createHash('md5').update(userEmail).digest("hex");
    // const userDbId = crypto.createHmac('sha256', getSecretCustomer.userSecret).update(userEmail).digest('hex');
    return userDbId;
}; 

export const updateDatabase = () => {
    return main.database().ref(`/`);
};

export const billingDatabase = (billingPeriod, userEmail) => {
    const admin = customers
    const userDbId = crypto.createHash('md5').update(userEmail).digest("hex");
    // const userDbId = crypto.createHmac('sha256', getSecretCustomer.userSecret).update(userEmail).digest('hex')


    // Referencia do Banco de dados
    const dbrefs = {
        // caminho do DB para o perfil de usuário
        userDbRef:admin.ref(`/profiles/${userDbId}/`),
        // Path to OBD billing for customers
        billingDbRef:admin.ref(`devices/billing/${billingPeriod}/`),
        // User Wallet
        dbRefWallet:admin.ref(`/profiles/${userDbId}/personal/wallet`),
        //userId
        userDbId: userDbId,
    }
    return dbrefs
};

// exports.updateDatabase = (userEmail, vehiclePlate, oldId, crypto) => {
    
//     const lowerEmail = userEmail.toString().toLowerCase()
//     const lowerPlate = vehiclePlate.toString().toLowerCase()
//     const admin = database.admin

//     const secrets = database.secrets

//     const newUserDbId = crypto.createHmac('sha256', secrets.userSecret).update(lowerEmail).digest('hex')
//     const newVehicleDbId = crypto.createHmac('sha256', secrets.vehicleSecret).update(lowerPlate).digest('hex')

//     const dbrefs = {
//         // caminho do DB para o perfil de usuário
//         userDbRef:admin.database().ref(`/customers/profiles/${newUserDbId}/`),
//         // Caminho do DB para o perfil do veículo        
//         vehicleDbRef:admin.database().ref(`/items/vehicles/${newVehicleDbId}/`),  
//         // caminho do DB para o perfil de usuário
//         oldUserDbRef:admin.database().ref(`/customers/profiles/${oldId}/personal`),
//         // Caminho do DB para o perfil do veículo        
//         oldVehicleDbRef:admin.database().ref(`/items/vehicles/${oldId}/`),
//         // report
//         report:admin.database().ref(`/report/`),
//     }
//     return dbrefs
// }

// module.exports.getDatabaseForReport = () => {
//     const admin = database.admin
//     const dbrefs = {
//         // caminho do DB para o perfil de usuário
//         userDbRef:admin.database().ref(`/customers/profiles/`),
//         // Caminho do DB para o perfil do veículo        
//         vehicleDbRef:admin.database().ref(`/items/vehicles/`),
//         // report
//         report:admin.database().ref(`/report/`),  
//     }
//     return dbrefs
// }