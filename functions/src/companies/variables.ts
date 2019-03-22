const varibles = (function() {
    const admin = require('../admin/admin.js')

    return {
        admin: admin.getAdmin(),
    }
})()

const crypto = require('crypto');

exports.getDataBaseRefs = (companyId) => {
    // Referencia do Banco de dados
    const admin = varibles.admin

    const dbrefs = {
        // Path for the company DB
        companyProfile:admin.database().ref(`/companies/${companyId}/profile/`),

        // Path to the company account
        companyAccount:admin.database().ref(`/companies/${companyId}/account/`),

        // Path to the company account
        companyDrivers:admin.database().ref(`/companies/${companyId}/drivers/`),
    }
    return dbrefs
}