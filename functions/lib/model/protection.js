"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const deep_object_diff_1 = require("deep-object-diff");
const polices_1 = require("./polices");
const database_1 = require("../database/database");
exports.protectionMethods = (protectionData, variables) => __awaiter(void 0, void 0, void 0, function* () {
    const _ = require('lodash');
    const userDbPath = protectionData.userDbPath;
    const userDbMethods = protectionData.dbMethods;
    const userProfile = protectionData.userProfile;
    const itemDbPath = protectionData.itemDbPath;
    const itemProfile = protectionData.itemProfile;
    const itemDbMethods = protectionData.dbMethods;
    // diff gets the change in protection. To only make changes in what have changed
    const protectionChange = deep_object_diff_1.diff(itemProfile.protectionStatus, variables.policies);
    console.log("TCL: get diff from OBJ", protectionChange);
    const diffProtectionArray = Object.keys(protectionChange);
    // console.log("TCL: doBackup -> diffProtectionArray", diffProtectionArray)
    const turnOn = [];
    const turnOff = [];
    yield diffProtectionArray.forEach(element => {
        // tslint:disable-next-line: triple-equals
        const boolValue = protectionChange[`${element}`] === true ? true : false;
        if (boolValue === true) {
            turnOn.push(element);
        }
        else {
            turnOff.push(element);
        }
        return element;
    });
    // Check if there is a police to turn ON
    const protectionOn = turnOn.join(', ');
    // console.log("TCL: protectionMethods -> turnOn", turnOn)
    // console.log("TCL: protectionMethods -> _.isEmpty(turnOn)", _.isEmpty(turnOn))
    // Check if there is a police to turn OFF
    const protectionOff = turnOff.join(', ');
    // console.log("TCL: protectionMethods -> turnOff", turnOff)
    // console.log("TCL: protectionMethods -> _.isEmpty(turnOff)", _.isEmpty(turnOff))
    const initiateNewProtection = () => __awaiter(void 0, void 0, void 0, function* () {
        const timezoneDiff = variables.timezone * 1000 * 3600;
        const logUse = {
            closed: false,
            timeStart: (Date.now() + timezoneDiff) / 1000 | 0,
            activationUser: variables.userEmail,
            policies: variables.policies
        };
        // Get the number of timer user have activated
        // Get the number of times protection on that item has been activated
        const activationsCounterItem = itemProfile.activationsCounter;
        const activationsCounterUser = protectionData.itemInUse.activationsCounter;
        yield turnOn.forEach(element => {
            activationsCounterItem[element] += 1;
            activationsCounterUser[element] += 1;
            return activationsCounterItem;
        });
        console.log("TCL: initiateNewProtection -> activationsCounterItem", activationsCounterItem);
        console.log("TCL: initiateNewProtection -> activationsCounterUser", activationsCounterUser);
        yield itemDbMethods.pushDatabaseInfo(itemDbPath.child(`logUse`), logUse);
        yield itemDbMethods.updateDatabaseInfo(itemDbPath.child('profile/protectionData'), {
            protectionStatus: variables.policies,
            activationsCounter: activationsCounterUser,
        });
        yield userDbMethods.updateDatabaseInfo(userDbPath.child("personal"), {
            activationsCounter: (userProfile.activationsCounter + 1),
        });
        // generate field to see how many times that specific use activated that item
        const itemDbId = yield database_1.getItemId(variables.itemInUse);
        yield userDbMethods.updateDatabaseInfo(userDbPath.child(`items/${itemDbId}`), {
            activationsCounter: activationsCounterUser
        });
        const firstActivationResponse = {
            status: 200,
            text: `Turned ${protectionOn} ON. Welcome to Onsurance.`,
            callback: 'firstActivation',
            variables: {
                appId: variables.appId,
                userEmail: variables.userEmail,
                statusProtection: 'ON'
            }
        };
        const activationResponse = {
            status: 200,
            text: `Turned ${protectionOn} ON.`,
            callback: 'activationSuccessful',
            variables: {
                statusProtection: 'ON',
                protectionOn: protectionOn
            }
        };
        const deactivationActivationResponse = {
            status: 200,
            text: `Turned ${protectionOff} OFF and, turned ${protectionOn} ON.`,
            callback: 'deactivationActivation',
            variables: {
                protectionOff: protectionOff,
                protectionOn: protectionOn
            }
        };
        const deactivationResponse = {
            status: 200,
            text: `Turned ${protectionOff} OFF.`,
            callback: 'singleDeactivation',
            variables: {
                protectionOff: protectionOff,
            }
        };
        if (userProfile.activationsCounter === 0) { // Checks First Activation
            return firstActivationResponse;
        }
        else {
            if (protectionData.lastProtection.closed) {
                // return messages with only Onsurance ON Info
                return activationResponse;
            }
            else {
                // return messages with Onsurance ON and Onsurance OFF info
                if (_.isEmpty(turnOff))
                    return activationResponse; // No protection OFF Just ON but not all
                if (_.isEmpty(turnOn))
                    return deactivationResponse; // No protection ON, just OFF but not All
                if (!_.isEmpty(turnOn) && !_.isEmpty(turnOff))
                    return deactivationActivationResponse; // Protection ON and OFF
            }
        }
        ;
    });
    const closeProtection = () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("TCL: Protection is ON");
        const timezoneDiff = variables.timezone * 1000 * 3600;
        // Pega o tempo do desligamento
        const timeEnd = (Date.now() + timezoneDiff) / 1000 | 0; // TimeEnd - Timestamp do desligamento da protecão
        const useTime = timeEnd - protectionData.lastProtection.timeStart; // TimeDiff - Tempo total de uso da protecão em segundos
        const days = (useTime / 60 / 60 / 24 | 0); // TimeDiffDays - Tempo de uso em dias(totais) da protecão
        const totalHours = (useTime / 60 / 60 | 0); // TimeDiffHoursTotais - Tempo de uso da protecão em Horas
        const totalMinutes = (useTime / 60 | 0); // TimeDiffMinutesTotais - Tempo de uso em minutos da protecão
        const hours = (totalHours - (days * 24)); // TimeDiffHours - Tempo de uso da protecão em horas dentro de 24H
        const minutes = (totalMinutes - (totalHours * 60)); // TimeDiffMinutes - Tempo de uso da protecão em minutos dentro de 60Min
        const seconds = (useTime - (totalMinutes * 60)); // TimeDiffSeconds - Tempo de uso da protecão em segundos dentro de 60Segundos
        // Calcula o valor conumido baseado no tempo de uso.
        /*
         TODO: Calculate protection value based on policies
        */
        // Get the protection thats already ON to calculate total spent
        const protectionStatus = Object.keys(itemProfile.protectionStatus);
        const billingProtectionOn = [];
        yield protectionStatus.forEach(element => {
            console.log(`TCL: closeProtection -> itemProfile.protectionStatus[${element}]`, itemProfile.protectionStatus[`${element}`]);
            const boolValue = itemProfile.protectionStatus[`${element}`] === true ? true : false;
            if (boolValue === true) {
                billingProtectionOn.push(element);
            }
            return element;
        });
        console.log("TCL: closeProtection -> billingProtectionOn", billingProtectionOn);
        // console.log("TCL: closeProtection -> billingProtectionOn", billingProtectionOn.length)
        // Calculate minute value based on active polices on protection
        const protectionMinuteValue = polices_1.policesProtection(itemProfile.minuteValue, billingProtectionOn.length);
        let consumedSwitch = 0;
        console.log("TCL: closeProtection -> protectionMinuteValue", protectionMinuteValue);
        if (seconds >= 30) {
            consumedSwitch = parseFloat(((Math.ceil(useTime / 60)) * protectionMinuteValue).toFixed(3));
            console.log("TCL: closeProtection -> Considered minutes - ceil", Math.ceil(useTime / 60));
        }
        else if (seconds < 30) {
            consumedSwitch = parseFloat(((Math.floor(useTime / 60)) * protectionMinuteValue).toFixed(3));
            console.log("TCL: closeProtection -> Considered Minutes - floor", Math.floor(useTime / 60));
        }
        console.log("TCL: consumedSwitch", consumedSwitch);
        let newSwitch = 0;
        let oldSwitch = parseFloat(userProfile.wallet.switch.toFixed(2));
        if (!protectionData.itemOwner) {
            oldSwitch = parseFloat(protectionData.ownerCredit);
            newSwitch = parseFloat((parseFloat(protectionData.ownerCredit) - consumedSwitch).toFixed(2));
            console.log("TCL: newSwitch", newSwitch);
            const ownerDbPath = protectionData.ownerDbPath;
            yield userDbMethods.updateDatabaseInfo(ownerDbPath.child("personal/wallet/"), {
                switch: newSwitch
            });
            // console.log(`TCL: Owner wallet updated.`);
        }
        else {
            newSwitch = parseFloat((parseFloat(userProfile.wallet.switch) - consumedSwitch).toFixed(2));
            console.log("TCL: newSwitch", newSwitch);
            yield userDbMethods.updateDatabaseInfo(userDbPath.child('personal'), {
                wallet: {
                    switch: newSwitch
                }
            });
        }
        ;
        const closeLog = {
            closed: true,
            timeEnd: timeEnd,
            useTime: useTime,
            consumedValue: consumedSwitch,
            initialSwitch: oldSwitch,
            finalSwitch: newSwitch,
            deactivationUser: variables.userEmail,
        };
        yield itemDbMethods.updateDatabaseInfo(itemDbPath.child(`logUse/${protectionData.lastProtectionId}`), closeLog);
        const responseVariables = {
            days: days,
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            consumedSwitch: consumedSwitch,
            newSwitch: newSwitch,
            statusProtection: "OFF"
        };
        // Check if protection is completly off
        if (variables.statusProtection.allOff) {
            // Close protection and Do not open new log
            yield itemDbMethods.updateDatabaseInfo(itemDbPath.child(`profile/protectionData`), {
                protectionStatus: variables.policies
            });
            responseVariables.statusProtection = "OFF";
            return {
                status: 200,
                text: `Turned ${protectionOff} OFF.`,
                callback: "deactivationSuccessful",
                variables: responseVariables
            };
        }
        else {
            if (newSwitch <= 500) { // NO CREDIT
                // Close protection and Do not open new log
                yield itemDbMethods.updateDatabaseInfo(itemDbPath.child(`profile/protectionData`), {
                    protectionStatus: {
                        theft: false,
                        accident: false,
                        thirdParty: false,
                    }
                });
                let calback;
                protectionData.itemOwner ? calback = 'noUserCredit' : calback = 'noOwnerCredit';
                return {
                    status: 412,
                    text: `Protection shut down. Not enought credit to activate again. ${newSwitch}`,
                    calback: calback,
                    variables: {
                        userCredit: parseFloat((newSwitch / 1000).toFixed(3))
                    }
                };
            }
            return yield initiateNewProtection();
        }
    });
    return {
        initiateNewProtection: initiateNewProtection,
        closeProtection: closeProtection
    };
});
//# sourceMappingURL=protection.js.map