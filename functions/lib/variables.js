const admin = require('firebase-admin');
const homologacao = {
    apiKey: "AIzaSyABa9PXOgiVggDHjt1MD9bMVux-4UpObt4",
    authDomain: "onsurance-homologacao.firebaseapp.com",
    databaseURL: "https://onsurance-homologacao.firebaseio.com",
    projectId: "onsurance-homologacao",
    storageBucket: "onsurance-homologacao.appspot.com",
    messagingSenderId: "451230477262"
};
const producao = {
    apiKey: "AIzaSyD8RCBaeju-ieUb9Ya0rUSJg9OGtSlPPXM",
    authDomain: "onsuranceme-co.firebaseapp.com",
    databaseURL: "https://onsuranceme-co.firebaseio.com",
    projectId: "onsuranceme-co",
    storageBucket: "onsuranceme-co.appspot.com",
    messagingSenderId: "241481831218"
};
admin.initializeApp(homologacao);
exports.getSystemVariables = request => {
    const systemVariables = {
        userId: request.query["messenger user id"],
        firstName: request.query["first name"],
        userEmail: (request.query["email_address"]).toLowerCase(),
        lastName: request.query["last name"],
        indicator: (request.query["indicador"]).toLowerCase(),
        timezone: request.query["timezone"],
        carPlate: (request.query["car-plate"]).toLowerCase(),
        timeStart: request.query["timeStart"]
    };
    return systemVariables;
};
exports.getVehicleVariables = request => {
    const vehicleVariables = {
        // Dados do veículo
        carValue: request.query["car-value"],
        carModel: request.query["car-model"],
    };
    return vehicleVariables;
};
exports.getDataBaseRefs = (systemVariables, crypto) => {
    // Referencia do Banco de dados
    const userDbId = crypto.createHash('md5').update(systemVariables.userEmail).digest("hex");
    const vehicleDbId = crypto.createHash('md5').update(systemVariables.carPlate).digest("hex");
    const indicatorDbId = crypto.createHash('md5').update(systemVariables.indicator).digest("hex");
    const dbrefs = {
        // caminho do DB para o perfil de usuário
        userDbRef: admin.database().ref(`/clients/${userDbId}/profile`),
        // Caminho do DB para o perfil do veículo
        vehicleDbRef: admin.database().ref(`/clients/${userDbId}/vehicles/${vehicleDbId}/profile`),
        // Caminho do DB para o perfil de usuário do indicator
        dbRefIndicatorUser: admin.database().ref(`/clients/${indicatorDbId}/profile/indication`),
        // Caminho do DB para a Lista de Indicados do indicator
        dbRefIndicator: admin.database().ref(`/clients/${indicatorDbId}/indication`),
        // User Wallet
        dbRefWallet: admin.database().ref(`/clients/${userDbId}/profile/`).child('wallet'),
        // User Activations 
        dbRefActivations: admin.database().ref(`/clients/${userDbId}/profile/`).child('activations'),
        // Vehicle Activations
        vehicleDbRefActivations: admin.database().ref(`/clients/${userDbId}/vehicles/${vehicleDbId}/profile/`).child('activations'),
        // Vehicle Use Log
        dbRefLogUso: admin.database().ref(`/clients/${userDbId}/vehicles/${vehicleDbId}/`).child('logUse')
    };
    return dbrefs;
};
//# sourceMappingURL=variables.js.map