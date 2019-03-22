"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getTimeOffVariables = (timeStart) => {
    // Pega o tempo do desligamento
    const timeEnd = Date.now() / 1000 | 0; // TimeEnd - Timestamp do desligamento da protecão
    const protectionTime = timeEnd - timeStart; // TimeDiff - Tempo total de uso da protecão em seconds
    // const days = (protectionTime/60/60/24|0)                         // TimeDiffDays - Tempo de uso em days(totais) da protecão
    const totalHours = (protectionTime / 60 / 60 | 0); // TimeDifftotalHours - Tempo de uso da protecão em hours
    const totalMinutes = (protectionTime / 60 | 0); // TimeDiffMinutesTotais - Tempo de uso em minutes da protecão
    // const hours = (totalHours - (days*24));                        // TimeDiffHours - Tempo de uso da protecão em hours dentro de 24H
    // const minutes = (totalMinutes - (totalHours * 60));               // TimeDiffMinutes - Tempo de uso da protecão em minutes dentro de 60Min
    const seconds = (protectionTime - (totalMinutes * 60)); // TimeDiffSeconds - Tempo de uso da protecão em seconds dentro de 60seconds
    const timeVariables = {
        timeEnd: timeEnd,
        protectionTime: protectionTime,
        totalHours: totalHours,
        seconds: seconds,
    };
    return timeVariables;
};
const activationFail = (dataBaseRef, systemVariables, response, profiles) => {
    const activationFail = {
        "messages": [
            {
                "text": `Opa ${systemVariables.firstName}. Não consegui ligar sua proteção. Vou trazer a função de Ligar para você tentar novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
            }
        ],
        "set_attributes": {
            "status-protecao": `OFF`,
        },
        "redirect_to_blocks": [
            "Ligar"
        ]
    };
    // Update activation number and protection status on actual vehicle database
    dataBaseRef.vehicleDbRef.update({
        activations: profiles[0].activations,
        protectionStatus: "OFF",
    }).then(() => {
        console.log(`activationFail - ${systemVariables.userEmail} - ${systemVariables.firstName} - ${systemVariables.carPlate} - Vehicle Activations updated.`);
    }).catch(error => {
        console.error(new Error(`activationFail - ${systemVariables.userEmail} - ${systemVariables.firstName} - ${systemVariables.carPlate} -  Error updating Vehicle activations. ${error}`));
    });
    // update user profile activation number
    dataBaseRef.userDbRef.update({
        activations: profiles[1].activations,
    }).then(() => {
        console.log(`activationFail - ${systemVariables.userEmail} - ${systemVariables.firstName} - ${systemVariables.carPlate} - User Activations updated.`);
    }).catch(error => {
        console.error(new Error(`activationFail - ${systemVariables.userEmail} - ${systemVariables.firstName} - ${systemVariables.carPlate} -  Error updating User activations. ${error}`));
    });
    response.json(activationFail);
};
const deactivationFail = (dataBaseRef, systemVariables, response, profiles) => {
    const deactivationFail = {
        "messages": [
            {
                "text": `Opa ${systemVariables.firstName}. Não consegui desligar sua proteção. Vou trazer a função de Desligar para você tentar novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
            }
        ],
        "set_attributes": {
            "status-protecao": "ON",
        },
        "redirect_to_blocks": [
            "Desligar"
        ]
    };
    // Update activation number and protection status on actual vehicle database
    dataBaseRef.vehicleDbRef.update({
        protectionStatus: "ON",
    }).then(() => {
        console.log(`activationFail - ${systemVariables.userEmail} - ${systemVariables.firstName} - ${systemVariables.carPlate} - Vehicle Activations updated.`);
    }).catch(error => {
        console.error(new Error(`activationFail - ${systemVariables.userEmail} - ${systemVariables.firstName} - ${systemVariables.carPlate} -  Error updating Vehicle activations. ${error}`));
    });
    // Update wallet when deactivation fail
    dataBaseRef.dbRefWallet.update({
        switch: profiles[1].wallet.switch,
        money: profiles[1].wallet.money
    }).then(() => {
        console.log(`activationFail - ${systemVariables.userEmail} - ${systemVariables.firstName} - ${systemVariables.carPlate} - User Activations updated.`);
    }).catch(error => {
        console.error(new Error(`activationFail - ${systemVariables.userEmail} - ${systemVariables.firstName} - ${systemVariables.carPlate} -  Error updating User activations. ${error}`));
    });
    response.json(deactivationFail);
};
//Funcão para desativar a protecão
const moobiDeactivateProtection = (dataBaseRef, moobi, resolve, reject, key) => {
    const timeVariables = getTimeOffVariables(moobi.timeStart);
    console.log('timeVariables: ', JSON.stringify(timeVariables));
    // Desliga a proteção, alterando o atributo status-protecao do chatfuel
    let protectionValue;
    let totalTime;
    // Calcula o valor conumido baseado no tempo de uso. 
    if (timeVariables.seconds >= 30) {
        protectionValue = parseFloat(((Math.ceil(timeVariables.protectionTime / 60)) * moobi.minuteValue).toFixed(2));
        totalTime = Math.ceil(timeVariables.protectionTime / 60);
    }
    else if (timeVariables.seconds < 30) {
        protectionValue = parseFloat(((Math.floor(timeVariables.protectionTime / 60)) * moobi.minuteValue).toFixed(2));
        totalTime = Math.floor(timeVariables.protectionTime / 60);
    }
    console.log('Ceil', Math.ceil(timeVariables.protectionTime / 60));
    console.log('Floor', Math.floor(timeVariables.protectionTime / 60));
    // Objeto com dados do desligamento da proteção
    const logUse = {
        timeEnd: `${timeVariables.timeEnd}`,
        protectionValue: protectionValue,
        protectionTime: totalTime,
    };
    dataBaseRef.companyAccount.child(`billing/${moobi.billingPeriod}/${key}`).update(logUse).then(() => {
        console.log(`FinishRide - Use Log Updated. Ride Finished`);
        resolve(logUse);
    }).catch(error => {
        console.error(new Error(`finishRide - Error updating log. ${error}`));
        reject(error);
    });
};
const getProfileInfo = (dataBaseRef, key) => {
    return new Promise((resolve, reject) => {
        let moobi;
        const getTimeStart = (moobi) => {
            dataBaseRef.companyAccount.child(`billing/${moobi.billingPeriod}/${key}`).once('value').then(snapshot => {
                const timeStart = snapshot.val();
                console.log('timeStart: ', timeStart);
                if (timeStart === undefined || timeStart === null) { // Not User
                    reject('timeStart not found.');
                }
                moobi.timeStart = timeStart.timeStart;
                console.log('moobi: ', JSON.stringify(moobi));
                moobiDeactivateProtection(dataBaseRef, moobi, resolve, reject, key);
            }).catch(error => {
                console.error(new Error(`getTimeStart - Failed to Get timeStart. ${error}`));
                reject(error);
            });
        };
        const getBillingPeriod = (moobi) => {
            dataBaseRef.companyAccount.child('billingPeriod').once('value').then(snapshot => {
                const billingPeriod = snapshot.val();
                console.log('billingPeriod: ', billingPeriod);
                if (billingPeriod === undefined || billingPeriod === null) { // Not User
                    reject('Billing Period not found.');
                }
                moobi.billingPeriod = billingPeriod;
                console.log('moobi: ', JSON.stringify(moobi));
                getTimeStart(moobi);
            }).catch(error => {
                console.error(new Error(`getBillingPeriod - Failed to Get BillingPeriod. ${error}`));
                reject(error);
            });
        };
        const getMinuteValue = () => {
            dataBaseRef.companyProfile.child('minuteValue').once('value').then(snapshot => {
                const minuteValue = snapshot.val();
                console.log('minuteValue: ', minuteValue);
                if (minuteValue === undefined || !minuteValue || minuteValue === null) { // Not User
                    reject('Company Profile not found.');
                }
                moobi = { minuteValue: minuteValue };
                getBillingPeriod(moobi);
            }).catch(error => {
                console.error(new Error(`getMinuteValue - Failed to Get minuteValue. ${error}`));
                reject(error);
            });
        };
        getMinuteValue();
    });
};
exports.activation = (dataBaseRef, timeStart) => {
    return new Promise((resolve, reject) => {
        console.log(`Second: ${Date.now()}`);
        const logUse = {
            timeStart: `${timeStart}`,
            driver: "victor.assis.alves@gmail.com",
            rideId: 123
        };
        // Update actual vehicle logUse of protection
        const logUseUpdate = (billingPeriod, key) => {
            dataBaseRef.companyAccount.child(`billing/${billingPeriod}`).child(key).set(logUse).then(() => {
                console.log(`logUseUpdate - Use Log Updated.`);
                const backToApp = {
                    key: key,
                    timeStart: timeStart,
                    billingPeriod: billingPeriod
                };
                resolve(backToApp);
            }).catch(error => {
                console.error(new Error(`logUseUpdate - Erro ao atualizar log de uso no banco. ${error}`));
                reject(error);
            });
        };
        const getBillingPeriod = () => {
            dataBaseRef.companyAccount.child('billingPeriod').once('value').then(snapshot => {
                const billingPeriod = snapshot.val();
                console.log('billingPeriod: ', billingPeriod);
                if (billingPeriod === undefined || billingPeriod === null) { // Not User
                    const key = dataBaseRef.companyAccount.child(`billing/0`).push(1).key;
                    const key2 = dataBaseRef.companyAccount.child(`billing/0`).push().key;
                    console.log('key2: ', key2);
                    reject(`Billing period NOT defined`);
                }
                const key = dataBaseRef.companyAccount.child(`billing/${billingPeriod}`).push(1).key;
                const key2 = dataBaseRef.companyAccount.child(`billing/0`).push().key;
                console.log('key2: ', key2);
                logUseUpdate(billingPeriod, key);
            }).catch(error => {
                console.error(new Error(`getBillingPeriod - Failed to Get BillingPeriod. ${error}`));
                reject(error);
            });
        };
        getBillingPeriod();
    });
};
exports.deactivation = (dataBaseRef, key) => {
    return new Promise((resolve, reject) => {
        getProfileInfo(dataBaseRef, key).then(result => {
            resolve(result);
        }).catch(error => {
            reject(error);
        });
    });
};
//# sourceMappingURL=companiesProtection.js.map