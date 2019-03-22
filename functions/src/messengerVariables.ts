const messengerVariables = (function() {
    const admin = require('./admin/admin.js')

    return {
        admin: admin.getAdmin(),
        secrets: admin.getSecretCustomer()
    }
})()

// Variables for protection endpoint
exports.getProtectionVariables = request => {
    const protectionVariables = {
        userEmail:(request.query["email_address"]).toLowerCase(),
        timezone:request.query["timezone"],
        timeStart:request.query["timeStart"],
        carPlate:(request.query["car-plate"]).toLowerCase(),
        indicator:(request.query["indicador"]).toLowerCase(),
        firstName:request.query["first name"],
        // carId:(request.query["car-chassi"]).toLowerCase(),
    }
    return protectionVariables
}

// Variables for profile creat    ion or system needs
exports.getSystemVariables = request => {
    const systemVariables = {
        messengerId:request.query["messenger user id"],
        firstName:request.query["first name"],
        userEmail:(request.query["email_address"]).toLowerCase(),
        lastName:request.query["last name"],
        indicator:(request.query["indicador"]).toLowerCase(),
        timezone:request.query["timezone"],
        carPlate:(request.query["car-plate"]).toLowerCase(),
    }
    return systemVariables
}

exports.getVehicleVariables = request => {
    const vehicleVariables = {
         // Dados do veículo
        carValue:request.query["car-value"],
        carModel:request.query["car-model"],
        carBrand:request.query["car-brand"],
        carPlate:(request.query["car-plate"]).toLowerCase(),
        // carId:(request.query["car-chassi"]).toLowerCase(),
    }
    return vehicleVariables
}

exports.getDataBaseRefs = (systemVariables, crypto) => {
    const admin = messengerVariables.admin

    // const secrets = messengerVariables.secrets

    // const userDbId = crypto.createHmac('sha256', secrets.userSecret).update(systemVariables.userEmail).digest('hex')
    // const vehicleDbId = crypto.createHmac('sha256', secrets.vehicleSecret).update(systemVariables.carPlate).digest('hex')
    // const indicatorDbId = crypto.createHmac('sha256', secrets.indicatorSecret).update(systemVariables.indicator).digest('hex')
    const userDbId = crypto.createHash('md5').update(systemVariables.userEmail).digest("hex");
    const vehicleDbId = crypto.createHash('md5').update(systemVariables.carPlate).digest("hex");
    const indicatorDbId = crypto.createHash('md5').update(systemVariables.indicator).digest("hex");

    // Referencia do Banco de dados

    const dbrefs = {
        // caminho do DB para o perfil de usuário
        userDbRef:admin.database().ref(`/customers/profiles/${userDbId}/personal`),
        // Caminho do DB para o perfil do veículo
        vehicleDbRef:admin.database().ref(`/items/vehicles/${vehicleDbId}/profile`),
        // Caminho do DB para o perfil de usuário do indicator
        dbRefIndicatorUser:admin.database().ref(`/customers/profiles/${indicatorDbId}/personal`),
        // Caminho do DB para a Lista de Indicados do indicator
        dbRefIndicator:admin.database().ref(`/customers/indication/${indicatorDbId}/`),
        // User Wallet
        dbRefWallet:admin.database().ref(`/customers/profiles/${userDbId}/personal`).child('wallet'),
        // User Activations 
        dbRefActivations:admin.database().ref(`/customers/profiles/${userDbId}/personal`).child('activations'),
        // Vehicle Activations
        vehicleDbRefActivations:admin.database().ref(`/items/vehicles/${vehicleDbId}/profile/`).child('activations'),
        // Vehicle Use Log
        dbReflogsUso:admin.database().ref(`/items/vehicles/${vehicleDbId}/logUse`)
    }
    return dbrefs
}

exports.database = (id, vehicleDbId, systemVariables) => {

    const admin = messengerVariables.admin

    // const secrets = messengerVariables.secrets

    // const newUserDbId = crypto.createHmac('sha256', secrets.userSecret).update(systemVariables.userEmail).digest('hex')

    // const newVehicleDbId = crypto.createHmac('sha256', secrets.vehicleSecret).update(systemVariables.userEmail).digest('hex')

    // const newIndicatorDbId = crypto.createHmac('sha256', secrets.indicatorSecret).update(systemVariables.userEmail).digest('hex')

    const dbrefs = {
        // caminho do DB para o perfil de usuário
        userDbRef:admin.database().ref(`/customers/profiles/${id}/personal`),

        // Caminho do DB para o perfil do veículo        
        vehicleDbRef:admin.database().ref(`/items/vehicles/${vehicleDbId}/`),  
    }
    return dbrefs
}