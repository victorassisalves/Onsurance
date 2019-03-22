const moobiVaribles = (function () {
    const admin = require('../admin/admin.js');
    return {
        admin: admin.getAdmin(),
    };
})();
const crypto = require('crypto');
exports.getDataBaseRefs = () => {
    // Referencia do Banco de dados
    const admin = moobiVaribles.admin;
    const dbrefs = {
        // Path for the company DB
        companyProfile: admin.database().ref(`/companies/moobi/profile/`),
        // Path to the company account
        companyAccount: admin.database().ref(`/companies/moobi/account/`),
        // Path to the company account
        companyDrivers: admin.database().ref(`/companies/moobi/drivers/`),
    };
    return dbrefs;
};
//# sourceMappingURL=moobiVariables.js.map