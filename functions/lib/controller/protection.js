"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../database/database");
const databaseMethods_1 = require("../model/databaseMethods");
const log_1 = require("../model/log");
const checkEqual = require('deep-equal');
const deep_object_diff_1 = require("deep-object-diff");
// Pega a data com dia da semana para colocar no banco de dados
const getDate = (time) => {
    let weekDay;
    const data = new Date(time);
    // Transforma o dia da semana em palavra
    switch (data.getDay()) {
        case 0:
            weekDay = "Domingo";
            break;
        case 1:
            weekDay = "Segunda";
            break;
        case 2:
            weekDay = "Terça";
            break;
        case 3:
            weekDay = "Quarta";
            break;
        case 4:
            weekDay = "Quinta";
            break;
        case 5:
            weekDay = "Sexta";
            break;
        case 6:
            weekDay = "Sábado";
            break;
    }
    return weekDay;
};
exports.onsuranceProtection = variables => {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        console.log("TCL: variables", variables);
        // make backup
        const doBackup = () => __awaiter(this, void 0, void 0, function* () {
            try {
                /*
                    get Db path
                    get DB methods
                    get info from data base
                */
                const dbMethods = yield databaseMethods_1.databaseMethods();
                const userDbPath = yield database_1.userProfileDbRefRoot(variables.userEmail);
                /*
                    Inside user profile
                */
                const userProfile = yield dbMethods.getDatabaseInfo(userDbPath.child("personal"));
                console.log("TCL: doBackup. -> userProfile", userProfile);
                const itemInUse = yield dbMethods.getDatabaseInfo(userDbPath.child(`items/${variables.itemInUse}`));
                console.log("TCL: doBackup -> itemInUse", itemInUse);
                /*
                    Inside item profile
                */
                const itemDbPath = yield database_1.itemProfileDbRef(itemInUse.itemId, itemInUse.type, itemInUse.innerType);
                const itemProfile = yield dbMethods.getDatabaseInfo(itemDbPath.child("profile"));
                console.log("TCL: doBackup -> itemProfile", itemProfile);
                // Check if protection request is equal to server protection
                console.log("TCL: checkEqual (deep-equal)", checkEqual(variables.policies, itemProfile.protectionStatus));
                if (checkEqual(variables.policies, itemProfile.protectionStatus)) {
                    throw {
                        status: 304,
                        text: "Protection status not changed for all Policies. Inside Backup"
                    };
                }
                ;
                console.log("TCL: get diff from OBJ", deep_object_diff_1.diff(itemProfile.protectionStatus, variables.policies));
                // get last protection data
                const lastProtection = yield dbMethods.getDatabaseInfo(itemDbPath.child("logUse").limitToLast(1));
                console.log("TCL: doBackup -> lastProtection", lastProtection);
                const lastProtectionArrayId = Object.keys(lastProtection);
                const lastProtectionId = lastProtectionArrayId[0];
                console.log("TCL: doBackup -> lastProtectionId", lastProtectionId);
                console.log("TCL: doBackup -> lastProtection obj", lastProtection[`${lastProtectionId}`]);
                const profileArray = [userProfile, itemInUse, itemProfile];
                console.log("TCL: profileArray", profileArray);
                const checkProfiles = profileArray.some(element => element === null || element === undefined);
                console.log("TCL: checkProfiles", checkProfiles);
                // Check if any information is null or undefined
                /*
                    TODO: Check each element to custom error message
                */
                if (checkProfiles) {
                    throw {
                        status: 404,
                        text: `Error checking profiles for ${variables.userEmail}. One or more items are null or undefined. ${profileArray}. Check if user is client.`
                    };
                }
                ;
                return {
                    userProfile: userProfile,
                    userDbPath: userDbPath,
                    itemInUse: itemInUse,
                    itemProfile: itemProfile,
                    itemDbPath: itemDbPath,
                    lastProtectionId: lastProtectionId,
                    lastProtection: lastProtection[`${lastProtectionId}`],
                };
            }
            catch (error) {
                console.error(new Error(`Error doing backup: ${error}`));
                if (error.status)
                    reject(error);
                reject({
                    status: 500,
                    text: `Error doing backup for client ${variables.userEmail}. One or more wrong information. Try again after checking data sent and user email.`
                });
            }
        });
        const backup = yield doBackup();
        try {
            /*
                TODO:
                    get all info from backup
                    check if the data is ok.
                    check if client has enought switch
                    check what operation client want to make (what on and what off)

            */
            const userDbPath = backup.userDbPath;
            const userDbMethods = yield databaseMethods_1.databaseMethods();
            const userProfile = backup.userProfile;
            const itemDbPath = backup.itemDbPath;
            const itemDbMethods = yield databaseMethods_1.databaseMethods();
            const itemInUse = backup.itemInUse;
            const itemProfile = backup.itemProfile;
            const initiateNewProtection = () => __awaiter(this, void 0, void 0, function* () {
                const timezoneDiff = variables.timezone * 1000 * 3600;
                const logUse = {
                    closed: false,
                    timeStart: (Date.now() + timezoneDiff) / 1000 | 0,
                    initialSwitch: userProfile.wallet.switch,
                    user: variables.userEmail,
                    policies: variables.policies
                };
                yield itemDbMethods.pushDatabaseInfo(itemDbPath.child(`logUse`), logUse);
                yield itemDbMethods.updateDatabaseInfo(itemDbPath.child('profile'), {
                    protectionStatus: variables.policies
                });
                resolve(`Protection on.`);
            });
            const closeProtection = () => __awaiter(this, void 0, void 0, function* () {
                console.log("TCL: Protection is ON");
                const timezoneDiff = variables.timezone * 1000 * 3600;
                // Pega o tempo do desligamento
                const timeEnd = (Date.now() + timezoneDiff) / 1000 | 0; // TimeEnd - Timestamp do desligamento da protecão
                const useTime = timeEnd - backup.lastProtection.timeStart; // TimeDiff - Tempo total de uso da protecão em segundos
                const days = (useTime / 60 / 60 / 24 | 0); // TimeDiffDays - Tempo de uso em dias(totais) da protecão
                const totalHours = (useTime / 60 / 60 | 0); // TimeDiffHoursTotais - Tempo de uso da protecão em Horas
                const totalMinutes = (useTime / 60 | 0); // TimeDiffMinutesTotais - Tempo de uso em minutos da protecão
                const hours = (totalHours - (days * 24)); // TimeDiffHours - Tempo de uso da protecão em horas dentro de 24H
                const minutes = (totalMinutes - (totalHours * 60)); // TimeDiffMinutes - Tempo de uso da protecão em minutos dentro de 60Min
                const seconds = (useTime - (totalMinutes * 60)); // TimeDiffSeconds - Tempo de uso da protecão em segundos dentro de 60Segundos
                // Calcula o valor conumido baseado no tempo de uso. 
                let consumedSwitch = 0;
                if (seconds >= 30) {
                    consumedSwitch = parseFloat(((Math.ceil(useTime / 60)) * backup.itemProfile.minuteValue).toFixed(3));
                }
                else if (seconds < 30) {
                    consumedSwitch = parseFloat(((Math.floor(useTime / 60)) * backup.itemProfile.minuteValue).toFixed(3));
                }
                console.log("TCL: consumedSwitch", consumedSwitch);
                const timeVariables = {
                    timeEnd: timeEnd,
                    useTime: useTime,
                    days: days,
                    hours: hours,
                    minutes: minutes,
                    seconds: seconds,
                };
                const newSwitch = parseFloat(backup.userProfile.wallet.switch) - consumedSwitch;
                console.log("TCL: newSwitch", newSwitch);
                userDbMethods.updateDatabaseInfo(userDbPath.child('personal'), {
                    wallet: {
                        switch: newSwitch
                    }
                });
                console.log("TCL: totalMinutes", totalMinutes);
                yield itemDbMethods.updateDatabaseInfo(itemDbPath.child(`logUse/${backup.lastProtectionId}`), {
                    closed: true,
                    timeEnd: timeEnd,
                    useTime: useTime,
                    consumedValue: consumedSwitch,
                });
                resolve('Protection Off');
            });
            if (backup.lastProtection.closed) { // All protections are off. No open protection in log
                console.log("TCL: variables.statusProtection.allOff", variables.statusProtection.allOff);
                console.log("TCL: Protection is OFF");
                // If protection if off (closed) and request is all Off throw error
                if (variables.statusProtection.allOff)
                    throw {
                        status: 304,
                        text: "Protection already OFF for all Policies."
                    };
                yield initiateNewProtection();
            }
            else { // Protection is ON, there is a open protection in Log
            }
        }
        catch (error) {
            console.log(error);
            console.error(new Error(`Error on activating protection for client ${variables.userEmail}. Error: ${error}`));
            if (error.status)
                reject(error);
            reject({
                status: 500,
                text: `error`,
            });
        }
    }));
};
const activationFail = (dataBaseRef, protectionVariables, response, profiles) => {
    const activationFail = {
        "messages": [
            {
                "text": `Opa ${protectionVariables.firstName}. Não consegui ligar sua proteção. Vou trazer a função de Ligar para você tentar novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
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
        log_1.log(`activationFail - ${protectionVariables.userEmail} - ${protectionVariables.firstName} - ${protectionVariables.carPlate} - Vehicle Activations updated.`);
    }).catch(error => {
        console.error(new Error(`activationFail - ${protectionVariables.userEmail} - ${protectionVariables.firstName} - ${protectionVariables.carPlate} -  Error updating Vehicle activations. ${error}`));
    });
    // update user profile activation number
    dataBaseRef.userDbRef.update({
        activations: profiles[1].activations,
    }).then(() => {
        log_1.log(`activationFail - ${protectionVariables.userEmail} - ${protectionVariables.firstName} - ${protectionVariables.carPlate} - User Activations updated.`);
    }).catch(error => {
        console.error(new Error(`activationFail - ${protectionVariables.userEmail} - ${protectionVariables.firstName} - ${protectionVariables.carPlate} -  Error updating User activations. ${error}`));
    });
    response.json(activationFail);
};
const deactivationFail = (dataBaseRef, protectionVariables, response, profiles) => {
    const deactivationFail = {
        "messages": [
            {
                "text": `Opa ${protectionVariables.firstName}. Não consegui desligar sua proteção. Vou trazer a função de Desligar para você tentar novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
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
        log_1.log(`activationFail - ${protectionVariables.userEmail} - ${protectionVariables.firstName} - ${protectionVariables.carPlate} - Vehicle Activations updated.`);
    }).catch(error => {
        console.error(new Error(`activationFail - ${protectionVariables.userEmail} - ${protectionVariables.firstName} - ${protectionVariables.carPlate} -  Error updating Vehicle activations. ${error}`));
    });
    // Update wallet when deactivation fail
    dataBaseRef.dbRefWallet.update({
        switch: profiles[1].wallet.switch,
        money: profiles[1].wallet.money
    }).then(() => {
        log_1.log(`activationFail - ${protectionVariables.userEmail} - ${protectionVariables.firstName} - ${protectionVariables.carPlate} - User Activations updated.`);
    }).catch(error => {
        console.error(new Error(`activationFail - ${protectionVariables.userEmail} - ${protectionVariables.firstName} - ${protectionVariables.carPlate} -  Error updating User activations. ${error}`));
    });
    response.json(deactivationFail);
};
// Function to activate protection
const activateProtection = (profiles, protectionVariables, dataBaseRef, timeStart, activationSuccess) => {
    return new Promise((resolve, reject) => {
        // Gera timeStamp do inicio da protecão
        const statusProtection = "ON";
        // const timezoneDiff = protectionVariables.timezone * 1000 * 3600
        // const time = Date.now() + timezoneDiff
        const vehicleActivations = profiles[0].activations + 1;
        const userActivations = profiles[1].activations + 1;
        const userProfile = profiles[1];
        const logUse = {
            timeStart: `${timeStart}`,
            initialSwitch: profiles[1].wallet.switch,
            user: protectionVariables.userEmail
        };
        // Update actual vehicle logUse of protection
        const logUseUpdate = new Promise((resolve, reject) => {
            dataBaseRef.dbReflogUso.child(`${vehicleActivations}`).update(logUse).then(() => {
                log_1.log(`logUseUpdate - ${protectionVariables.userEmail} - ${userProfile.firstName} - ${protectionVariables.carPlate} -  Use log Updated.`);
                resolve(true);
            }).catch(error => {
                console.error(new Error(`logUseUpdate - ${protectionVariables.userEmail} - ${userProfile.firstName} -  Erro ao atualizar log de uso no banco. ${error}`));
                reject(error);
            });
        });
        // Update user Total activation times from database
        const updateStatusUser = new Promise((resolve, reject) => {
            dataBaseRef.userDbRef.update({
                activations: userActivations,
            }).then(() => {
                log_1.log(`updateStatusUser - ${protectionVariables.userEmail} - ${userProfile.firstName} - USER Activations updated.`);
                resolve(true);
            }).catch(error => {
                console.error(new Error(`updateStatusUser - ${protectionVariables.userEmail} - ${userProfile.firstName}  - Error updating activations. ${error}`));
                reject(error);
            });
        });
        // Update activation number and protection status on actual vehicle database
        const updateStatusVehicle = new Promise((resolve, reject) => {
            dataBaseRef.vehicleDbRef.update({
                activations: vehicleActivations,
                protectionStatus: statusProtection,
            }).then(() => {
                log_1.log(`updateStatusVehicle - ${protectionVariables.userEmail} - ${userProfile.firstName} - ${protectionVariables.carPlate} - Vehicle Status updated.`);
                resolve(true);
            }).catch(error => {
                console.error(new Error(`updateStatusVehicle - ${protectionVariables.userEmail} - ${userProfile.firstName} - ${protectionVariables.carPlate} -  Error updating Vehicle Status. ${error}`));
                reject(error);
            });
        });
        Promise.all([updateStatusVehicle, updateStatusUser, logUseUpdate]).then(() => {
            log_1.log("*** Protection Activated In Server ***");
            resolve(activationSuccess);
        }).catch(error => {
            console.error(new Error(`Activation Failed. ${error}`));
            reject(error);
        });
    });
};
//Funcão para desativar a protecão
const deactivateProtection = (protectionVariables, dataBaseRef, profiles, block) => {
    return new Promise((resolve, reject) => {
        const timezoneDiff = protectionVariables.timezone * 1000 * 3600;
        // Pega o tempo do desligamento
        const timeEnd = (Date.now() + timezoneDiff) / 1000 | 0; // TimeEnd - Timestamp do desligamento da protecão
        const tempoProtecao = timeEnd - protectionVariables.timeStart; // TimeDiff - Tempo total de uso da protecão em segundos
        const dias = (tempoProtecao / 60 / 60 / 24 | 0); // TimeDiffDays - Tempo de uso em dias(totais) da protecão
        const horasTotais = (tempoProtecao / 60 / 60 | 0); // TimeDiffHoursTotais - Tempo de uso da protecão em Horas
        const minTotais = (tempoProtecao / 60 | 0); // TimeDiffMinutesTotais - Tempo de uso em minutos da protecão
        const horas = (horasTotais - (dias * 24)); // TimeDiffHours - Tempo de uso da protecão em horas dentro de 24H
        const minutos = (minTotais - (horasTotais * 60)); // TimeDiffMinutes - Tempo de uso da protecão em minutos dentro de 60Min
        const segundos = (tempoProtecao - (minTotais * 60)); // TimeDiffSeconds - Tempo de uso da protecão em segundos dentro de 60Segundos
        const timeVariables = {
            timeEnd: timeEnd,
            tempoProtecao: tempoProtecao,
            dias: dias,
            horas: horas,
            minutos: minutos,
            segundos: segundos,
        };
        // Desliga a proteção, alterando o atributo status-protecao do chatfuel
        const statusProtection = "OFF";
        const vehicleActivations = profiles[0].activations;
        const userProfile = profiles[1];
        const minuteValue = parseFloat(profiles[0].minuteValue);
        let valorConsumido;
        // Calcula o valor conumido baseado no tempo de uso. 
        if (timeVariables.segundos >= 30) {
            valorConsumido = ((Math.ceil(timeVariables.tempoProtecao / 60)) * minuteValue).toFixed(2);
        }
        else if (timeVariables.segundos < 30) {
            valorConsumido = ((Math.floor(timeVariables.tempoProtecao / 60)) * minuteValue).toFixed(2);
        }
        const switchCoin = parseFloat((parseFloat(userProfile.wallet.switch) - valorConsumido).toFixed(2));
        const money = parseFloat(((userProfile.wallet.money) - (valorConsumido / 1000)).toFixed(4));
        const sucessoDesligar = {
            "messages": [
                {
                    "text": "Sua proteção está desligada!"
                }
            ],
            "set_attributes": {
                "status-protecao": statusProtection,
                "user-credit": switchCoin,
                "user-money": money,
                "valorconsumido": valorConsumido,
                "dias": timeVariables.dias,
                "horas": timeVariables.horas,
                "minutos": timeVariables.minutos,
                "segundos": timeVariables.segundos
            },
            "redirect_to_blocks": [
                `${block}`
            ]
        };
        // Objeto com dados do desligamento da proteção
        const logUso = {
            timeEnd: `${timeVariables.timeEnd}`,
            valorConsumido: valorConsumido,
            tempoUso: `${timeVariables.dias} dias : ${timeVariables.horas} horas : ${timeVariables.minutos} minutos : ${timeVariables.segundos} segundos`,
            finalSwitch: switchCoin
        };
        log_1.log('logUso: ', JSON.stringify(logUso));
        // Atualiza no DB estado da protecão, Saldo em créditos e em dinheiro
        const updateUserProfile = new Promise((resolve, reject) => {
            // Salva no banco de dados o resultado do desligamento e atualiza o banco de dados
            dataBaseRef.dbRefWallet.update({
                switch: switchCoin,
                money: money
            }).then(() => {
                log_1.log(`updateUserProfile - ${protectionVariables.userEmail} - ${userProfile.firstName} -  Consumo do desligamento salvo no banco.`);
                resolve(true);
            }).catch(error => {
                console.error(new Error(`updateUserProfile ${protectionVariables.userEmail} - ${userProfile.firstName} -  Erro ao salvar dados de encerramento da protecão no banco de dados. ${error}`));
                reject(error);
            });
        });
        // Atualiza no DB o log de uso do desligamento
        const updatelogUse = new Promise((resolve, reject) => {
            // atualizar log de uso
            dataBaseRef.dbReflogUso.child(`${vehicleActivations}`).update(logUso).then(() => {
                log_1.log(`updatelogUse - ${protectionVariables.userEmail} - ${userProfile.firstName} -  Uselog updated.`);
                resolve(true);
            }).catch(error => {
                console.error(new Error(`updatelogUse - ${protectionVariables.userEmail} - ${userProfile.firstName} -  Error updating Uselog. ${error}`));
                reject(error);
            });
        });
        // Update activation number and protection status on actual vehicle database
        const updateStatusVehicle = new Promise((resolve, reject) => {
            dataBaseRef.vehicleDbRef.update({
                protectionStatus: statusProtection,
            }).then(() => {
                log_1.log(`updateStatusVehicle - ${protectionVariables.userEmail} - ${userProfile.firstName} - ${protectionVariables.carPlate} - Vehicle Status updated.`);
                resolve(true);
            }).catch(error => {
                console.error(new Error(`updateStatusVehicle - ${protectionVariables.userEmail} - ${userProfile.firstName} - ${protectionVariables.carPlate} -  Error updating Vehicle Status. ${error}`));
                reject(error);
            });
        });
        Promise.all([updateUserProfile, updatelogUse, updateStatusVehicle]).then(() => {
            log_1.log(`*** Protection completly OFF on Server. Returning to messenger. ***`);
            resolve(sucessoDesligar);
        }).catch(error => {
            reject(error);
        });
    });
};
// Checa numero de indicações do usuário que está ligando a protecão e premia
const verifyIndication = (profiles, protectionVariables, dataBaseRef, timeStart, activationSuccess) => {
    return new Promise((resolve, reject) => {
        const userProfile = profiles[1];
        const executePromo = (switchCoin, money) => {
            // Atualiza dados do usuário no banco de dados
            dataBaseRef.userDbRef.update({
                wallet: {
                    switch: switchCoin,
                    money: money,
                },
                indication: {
                    indicationPromo: true,
                    indicatedUsers: userProfile.indication.indicatedUsers
                }
            }).then(() => {
                log_1.log(`executePromo - ${protectionVariables.userEmail} - ${protectionVariables.firstName} -  Credit and Balance added to Server.`);
                log_1.log("*** Returning to messenger. User Gets Promo ***");
                // Adicionar os valores atualizados para as variáveis de usuário
                const resp = {
                    "set_attributes": {
                        "status-protecao": "ON",
                        "numAtivacao": userProfile.activations + 1,
                        "timeStart": timeStart,
                        "user-credit": switchCoin,
                        "user-money": money,
                        "afiliados": userProfile.indication.indicatedUsers
                    },
                    "redirect_to_blocks": [
                        "receber-promo"
                    ]
                };
                resolve(resp);
            }).catch(error => {
                console.error(new Error(`executePromo - ${protectionVariables.userEmail} - ${protectionVariables.firstName} -  Error updating balance on server. ${error}`));
                reject(error);
            });
        };
        const checkPromo = () => {
            // checa se número de indicados atingiu mais de 10 pela primeira vez
            // Se o usuário atingiu os requisitos necessários para receber o prênmio
            if (userProfile.indication.indicatedUsers >= 10 && userProfile.indication.indicationPromo === false) {
                log_1.log(`checkPromo - ${protectionVariables.userEmail} - ${protectionVariables.firstName} -  User Have requirements for indication promo.`);
                const switchCoin = (userProfile.wallet.switch + 1000000);
                const money = (parseFloat(userProfile.wallet.money) + 1000).toFixed(4);
                executePromo(switchCoin, money);
                // Caso usuário não tenha atingido os requisitos para receber prêmio
            }
            else if (parseInt(userProfile.indication.indicatedUsers) < 10 || userProfile.indication.indicationPromo === true) {
                log_1.log(`checkPromo - ${protectionVariables.userEmail} - ${protectionVariables.firstName} -  User don't have Requirements to get Promo.`);
                log_1.log("*** Returning to Messenger ***");
                resolve(activationSuccess);
            }
        };
        checkPromo();
    });
};
exports.getProfiles = (dataBaseRef, protectionVariables) => {
    return new Promise((resolve, reject) => {
        const getUserProfile = vehicleProfile => {
            dataBaseRef.userDbRef.once('value').then(snapshot => {
                const userProfile = snapshot.val();
                if (userProfile === undefined || !userProfile || userProfile === null) { // Not User
                    reject('User Profile not found.');
                }
                const profiles = [vehicleProfile, userProfile];
                resolve(profiles);
            }).catch(error => {
                console.error(new Error(`getUserProfile - ${protectionVariables.userEmail} - ${protectionVariables.firstName} - Error recovering User ${error}`));
                reject(error);
            });
        };
        const getVehicleProfile = () => {
            dataBaseRef.vehicleDbRef.once('value').then(snapshot => {
                const vehicleProfile = snapshot.val();
                if (vehicleProfile === undefined || !vehicleProfile || vehicleProfile === null) { // Not User
                    reject('Vehicle Profile not found.');
                }
                getUserProfile(vehicleProfile);
            }).catch(error => {
                console.error(new Error(`getVehicleProfile - ${protectionVariables.userEmail} - ${protectionVariables.firstName} - Failed to Get Protection status. ${error}`));
                reject(error);
            });
        };
        getVehicleProfile();
    });
};
exports.firstActivation = (response, profiles, protectionVariables, dataBaseRef) => {
    const block = "Mensagem de boas vindas primeira proteção";
    // const block = "api test"
    const timezoneDiff = protectionVariables.timezone * 1000 * 3600;
    const timeStart = (Date.now() + timezoneDiff) / 1000 | 0;
    const statusProtection = "ON";
    const userActivations = profiles[1].activations + 1;
    const activationSuccess = {
        "messages": [
            {
                "text": "Sua proteção está ativada!"
            }
        ],
        "set_attributes": {
            "status-protecao": statusProtection,
            "numAtivacao": userActivations,
            "timeStart": timeStart,
        },
        "redirect_to_blocks": [
            `${block}`
        ]
    };
    activateProtection(profiles, protectionVariables, dataBaseRef, timeStart, activationSuccess).then((result) => {
        log_1.log("*** Returning to Messenger ***");
        response.json(result);
    }).catch(error => {
        console.error(new Error(`actvateProtection - ${protectionVariables.userEmail} - ${protectionVariables.firstName} -  Failed to Turn ON Protection ${error}`));
        // Update activation number and protection status on actual vehicle database
        activationFail(dataBaseRef, protectionVariables, response, profiles);
    });
};
exports.activation = (response, profiles, protectionVariables, dataBaseRef) => {
    // Get log function to separete log from Production and Homolog
    const log = require('./log')();
    const block = "Desligar";
    // const block = "api test"
    const timezoneDiff = protectionVariables.timezone * 1000 * 3600;
    const timeStart = (Date.now() + timezoneDiff) / 1000 | 0;
    const statusProtection = "ON";
    const userActivations = profiles[1].activations + 1;
    const userMoney = (profiles[1].wallet.money).toFixed(2);
    log('userMoney: ', userMoney);
    let activationSuccess;
    if (userMoney < 100) {
        activationSuccess = {
            "messages": [
                {
                    "text": "Sua proteção está ativada!"
                },
                {
                    "text": `⚠️ Você tem apenas R$${userMoney} em sua conta Onsurance.`
                },
                {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "button",
                            "text": "Realize uma recarga clicando no botão abaixo 👇 para não deixar seu {{car-model}} desprotegido, OK?",
                            "buttons": [
                                {
                                    "type": "web_url",
                                    "url": "https://onsurance.me/produto/recarga-de-creditos-para-protecao-onsurance/",
                                    "title": "Fazer Recarga"
                                },
                            ]
                        }
                    }
                }
            ],
            "set_attributes": {
                "status-protecao": statusProtection,
                "numAtivacao": userActivations,
                "timeStart": timeStart,
            },
            "redirect_to_blocks": [
                `${block}`
            ]
        };
    }
    else {
        activationSuccess = {
            "messages": [
                {
                    "text": "Sua proteção está ativada!"
                },
            ],
            "set_attributes": {
                "status-protecao": statusProtection,
                "numAtivacao": userActivations,
                "timeStart": timeStart,
            },
            "redirect_to_blocks": [
                `${block}`
            ]
        };
    }
    activateProtection(profiles, protectionVariables, dataBaseRef, timeStart, activationSuccess).then((result) => {
        const userActivations = profiles[1].activations + 1;
        if (userActivations % 5 === 0) {
            verifyIndication(profiles, protectionVariables, dataBaseRef, timeStart, activationSuccess).then(result => {
                response.json(result);
            }).catch(error => {
                console.error(new Error(`verifyIndication - ${protectionVariables.userEmail} - ${protectionVariables.firstName} - Failed to verify indication. ${error}`));
                activationFail(dataBaseRef, protectionVariables, response, profiles);
            });
        }
        else {
            response.json(result);
        }
    }).catch(error => {
        console.error(new Error(`actvateProtection - ${protectionVariables.userEmail} - ${protectionVariables.firstName} -  Failed to Turn ON Protection ${error}`));
        activationFail(dataBaseRef, protectionVariables, response, profiles);
    });
};
exports.deactivation = (protectionVariables, dataBaseRef, profiles, response) => {
    const block = "Pos Off";
    // const block = "api test"
    deactivateProtection(protectionVariables, dataBaseRef, profiles, block).then(deactivationSuccess => {
        response.json(deactivationSuccess);
    }).catch(error => {
        console.error(new Error(`deactivateProtection -  ${protectionVariables.userEmail} - ${protectionVariables.firstName} -  Error turnnnig Protection OFF. ${error}`));
        deactivationFail(dataBaseRef, protectionVariables, response, profiles);
    });
};
//# sourceMappingURL=protection.js.map