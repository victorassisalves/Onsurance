"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database = (function () {
    const admin = require('./admin/admin.js');
    return {
        admin: admin.getAdmin(),
        secrets: admin.getSecretCustomer()
    };
})();
exports.getDataBaseRefs = (systemVariables, crypto) => {
    const admin = database.admin;
    const secrets = database.secrets;
    const userDbId = crypto.createHmac('sha256', secrets.userSecret).update(systemVariables.userEmail).digest('hex');
    const vehicleDbId = crypto.createHmac('sha256', secrets.vehicleSecret).update(systemVariables.userEmail).digest('hex');
    const indicatorDbId = crypto.createHmac('sha256', secrets.indicatorSecret).update(systemVariables.userEmail).digest('hex');
    // Referencia do Banco de dados
    // const userDbId = crypto.createHash('md5').update(systemVariables.userEmail).digest("hex");
    // const vehicleDbId = crypto.createHash('md5').update(systemVariables.carPlate).digest("hex");
    // const indicatorDbId = crypto.createHash('md5').update(systemVariables.indicator).digest("hex");
    const dbrefs = {
        // caminho do DB para o perfil de usuário
        userDbRef: admin.database().ref(`/customers/profiles/${userDbId}/personal`),
        // Caminho do DB para o perfil do veículo
        vehicleDbRef: admin.database().ref(`/items/vehicles/${vehicleDbId}/profile`),
        // Caminho do DB para o perfil de usuário do indicator
        dbRefIndicatorUser: admin.database().ref(`/customers/profiles/${indicatorDbId}/personal`),
        // Caminho do DB para a Lista de Indicados do indicator
        dbRefIndicator: admin.database().ref(`/customers/indication/${indicatorDbId}/`),
        // User Wallet
        dbRefWallet: admin.database().ref(`/customers/profiles/${userDbId}/personal`).child('wallet'),
        // User Activations 
        dbRefActivations: admin.database().ref(`/customers/profiles/${userDbId}/personal`).child('activations'),
        // Vehicle Activations
        vehicleDbRefActivations: admin.database().ref(`/items/vehicles/${vehicleDbId}/profile/`).child('activations'),
        // Vehicle Use Log
        dbRefLogUso: admin.database().ref(`/items/vehicles/${vehicleDbId}/logUse`)
    };
    return dbrefs;
};
exports.billingDatabase = (billingPeriod, userDbId) => {
    const admin = database.admin;
    // Referencia do Banco de dados
    const dbrefs = {
        // caminho do DB para o perfil de usuário
        userDbRef: admin.database().ref(`/customers/profiles/${userDbId}/personal`),
        // Path to OBD billing for customers
        billingDbRef: admin.database().ref(`devices/billing/${billingPeriod}/`),
        // User Wallet
        dbRefWallet: admin.database().ref(`/customers/profiles/${userDbId}/personal/wallet`),
    };
    return dbrefs;
};
exports.updateDatabase = (userEmail, vehiclePlate, oldId, crypto) => {
    const lowerEmail = userEmail.toString().toLowerCase();
    const lowerPlate = vehiclePlate.toString().toLowerCase();
    const admin = database.admin;
    const secrets = database.secrets;
    const newUserDbId = crypto.createHmac('sha256', secrets.userSecret).update(lowerEmail).digest('hex');
    const newVehicleDbId = crypto.createHmac('sha256', secrets.vehicleSecret).update(lowerPlate).digest('hex');
    const dbrefs = {
        // caminho do DB para o perfil de usuário
        userDbRef: admin.database().ref(`/customers/profiles/${newUserDbId}/`),
        // Caminho do DB para o perfil do veículo        
        vehicleDbRef: admin.database().ref(`/items/vehicles/${newVehicleDbId}/`),
        // caminho do DB para o perfil de usuário
        oldUserDbRef: admin.database().ref(`/customers/profiles/${oldId}/personal`),
        // Caminho do DB para o perfil do veículo        
        oldVehicleDbRef: admin.database().ref(`/items/vehicles/${oldId}/`),
        // report
        report: admin.database().ref(`/report/`),
    };
    return dbrefs;
};
exports.getDatabaseForReport = () => {
    const admin = database.admin;
    const dbrefs = {
        // caminho do DB para o perfil de usuário
        userDbRef: admin.database().ref(`/customers/profiles/`),
        // Caminho do DB para o perfil do veículo        
        vehicleDbRef: admin.database().ref(`/items/vehicles/`),
        // report
        report: admin.database().ref(`/report/`),
    };
    return dbrefs;
};
//# sourceMappingURL=database.js.map