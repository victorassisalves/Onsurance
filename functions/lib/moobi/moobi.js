"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getMoobiVariables = require(`./moobiVariables.js`);
const getProtection = require(`./moobiProtection.js`);
const dataBaseRef = getMoobiVariables.getDataBaseRefs();
// turns Moobi Onsurance ON
exports.moobiOn = () => {
    return new Promise((resolve, reject) => {
        const timeStart = Date.now() / 1000 | 0;
        console.log(`first: ${Date.now()}`);
        getProtection.activation(dataBaseRef, timeStart).then(result => {
            console.log(`Activation - *** ALL PASSED. RETURNING TO APP ***`);
            const company = result;
            console.log('moobi: ', JSON.stringify(company));
            resolve(company);
        }).catch(error => {
            reject(error);
        });
    });
};
// Turns Moobi Onsurance OFF
exports.moobiOff = (key) => {
    return new Promise((resolve, reject) => {
        getProtection.deactivation(dataBaseRef, key).then(result => {
            console.log(`Deactivation - *** ALL PASSED. RETURNING TO APP ***`);
            const company = result;
            console.log('moobi: ', JSON.stringify(company));
            resolve(company);
        }).catch(error => {
            console.error(new Error(`Deactivation with error. ${error}`));
            reject(error);
        });
    });
};
// Do cron job to generate pay value
exports.billing = () => {
    return new Promise((resolve, reject) => {
        const updateProfile = (company) => {
            dataBaseRef.companyProfile.update({
                protectionTime: company.protectionTime
            }).then((result) => {
                console.log(`UpdateProfile - Success`);
                resolve(company);
            }).catch((error) => {
                console.error(new Error(`UpdateProfile - Failed to update Company Profile. ${error}`));
                reject(error);
            });
        };
        const getCompanyProfile = (company) => {
            dataBaseRef.companyProfile.once('value').then(snapshot => {
                const companyProfile = snapshot.val();
                console.log('companyProfile: ', companyProfile);
                if (companyProfile === undefined || !companyProfile || companyProfile === null) { // Not User
                    reject('Company Profile not found.');
                }
                company.protectionTime += companyProfile.protectionTime;
                updateProfile(company);
            }).catch(error => {
                console.error(new Error(`companyProfile - Failed to Get companyProfile. ${error}`));
                reject(error);
            });
        };
        const iterateList = (arrayKeys, billingArray, billingPeriod) => {
            let company = {
                payAmount: 0,
                protectionTime: 0,
                billingPeriod: billingPeriod,
                failedItems: {}
            };
            let failedBilling = {
                failedTimes: 0,
                failedList: []
            };
            const iterateArray = (item, indice, array) => {
                console.log(`Array value item: ${JSON.stringify(billingArray[`${item}`])}`);
                console.log(`Item: ${item}`);
                console.log(`Indice: ${indice}`);
                // ---------------------
                const protectionValue = (billingArray[`${item}`].protectionValue).toFixed(2);
                const protectionTime = billingArray[`${item}`].protectionTime;
                if (Number.isFinite(protectionValue)) {
                    company.payAmount += protectionValue;
                    company.protectionTime += protectionTime;
                }
                else {
                    console.log(`Values NaN`);
                    failedBilling.failedTimes += 1;
                    failedBilling.failedList.push(item);
                }
                console.log('payAmount: ', company.payAmount);
                console.log('protectionTime: ', company.protectionTime);
            };
            arrayKeys.forEach(iterateArray);
            company.failedItems = failedBilling;
            console.log('Company OBJ: ', JSON.stringify(company));
            dataBaseRef.companyAccount.child(`billing/${billingPeriod}`).update({
                amountToPay: parseFloat((company.payAmount).toFixed(2)),
                protectionTime: company.protectionTime
            }).then((result) => {
                console.log(`*** Billing Period Updated ***`);
                getCompanyProfile(company);
            }).catch((error) => {
                console.error(new Error(`iterateList - Error Updating Billing Period. ${error}`));
            });
        };
        const getBillingList = (billingPeriod) => {
            dataBaseRef.companyAccount.child(`billing/${billingPeriod}`).once('value').then(snapshot => {
                const billingArray = snapshot.val();
                console.log('billingArray: ', billingArray);
                if (billingArray === undefined || !billingArray || billingArray === null) { // Not User
                    reject('No billing Period');
                }
                const arrayKeys = Object.keys(billingArray);
                console.log('arrayKeys: ', arrayKeys);
                iterateList(arrayKeys, billingArray, billingPeriod);
                // showData(vehicleProfile)
            }).catch(error => {
                console.error(new Error(`getBillingList - Failed to get Billing List. ${error}`));
                reject(error);
            });
        };
        const getBillingPeriod = () => {
            dataBaseRef.companyAccount.child('billingPeriod').once('value').then(snapshot => {
                let billingPeriod = snapshot.val();
                if (billingPeriod === undefined || billingPeriod === null) { // Not User
                    reject(`Billing period NOT defined`);
                }
                billingPeriod -= 1;
                getBillingList(billingPeriod);
            }).catch(error => {
                console.error(new Error(`getBillingPeriod - Failed to Get BillingPeriod. ${error}`));
                reject(error);
            });
        };
        getBillingPeriod();
    });
};
exports.changeBillingPeriod = () => {
    return new Promise((resolve, reject) => {
        let failed = 0;
        const updateBillingPeriod = (billingPeriod) => {
            dataBaseRef.companyAccount.update({
                billingPeriod: billingPeriod
            }).then((result) => {
                console.log(`updateBillingPeriod - Billing Period Updated`);
                resolve(billingPeriod);
            }).catch((error) => {
                console.error(new Error(`updateBillingPeriod - error updating Billing Period. Error: ${error}`));
                if (failed < 3) {
                    failed += 1;
                    updateBillingPeriod(billingPeriod);
                }
                reject(error);
            });
        };
        const getBillingPeriod = () => {
            dataBaseRef.companyAccount.child('billingPeriod').once('value').then(snapshot => {
                let billingPeriod = snapshot.val();
                console.log('billingPeriod: ', billingPeriod);
                if (billingPeriod === undefined || billingPeriod === null) { // Not User
                    reject(`Billing period NOT defined`);
                }
                billingPeriod += 1;
                console.log('billingPeriod + 1: ', billingPeriod);
                updateBillingPeriod(billingPeriod);
            }).catch(error => {
                console.error(new Error(`getBillingPeriod - Failed to Get BillingPeriod. ${error}`));
                reject(error);
            });
        };
        getBillingPeriod();
    });
};
//# sourceMappingURL=moobi.js.map