import {admin} from "../config/admin"
const crypto = require("crypto")

const customers = admin.customers;

export const billingDatabase = (billingPeriod, userEmail) => {
    const userDbId = crypto.createHash('md5').update(userEmail).digest("hex");
    // const userDbId = crypto.createHmac('sha256', getSecretCustomer.userSecret).update(userEmail).digest('hex')


    // Referencia do Banco de dados
    const dbrefs = {
        // caminho do DB para o perfil de usuário
        userDbRef:customers.ref(`/profiles/${userDbId}/`),
        // Path to OBD billing for customers
        billingDbRef:customers.ref(`devices/billing/${billingPeriod}/`),
        // User Wallet
        dbRefWallet:customers.ref(`/profiles/${userDbId}/personal/wallet`),
        //userId
        userDbId: userDbId,
    }
    return dbrefs
};
