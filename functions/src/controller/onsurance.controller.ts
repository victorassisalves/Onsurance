
import { userProfileDbRefRoot } from "../database/customer.database"
import { getDatabaseInfo, setDatabaseInfo, updateDatabaseInfo, pushDatabaseInfo, deleteDatabaseInfo } from "../model/databaseMethods";
import { OnsuraceTiresVariables } from "../environment/messenger/messenger.variables";
import { TireInUserProfile, TireProtectionData } from "../model/tires.model";
import { getItemId, tiresInItemDbPath } from "../database/tire.database";
import { PersonalUserProfileInterface, ItemAuthorizations, TireInUserProfileInterface } from "../interfaces/user.interfaces";
import { checkUserProfile, checkTireProfile, checkItemAccess, checkItemProfile, checkOnboard } from "../model/errors";
import { TestAccessToItem } from "../test/itemAccess.test";
import { checkStatusOnsuranceTires } from "../test/onsurance.test";
import { stat } from "fs";
import { updateDatabase } from "../database/database";



/**
 * @description This function execute the activation of Onsurance Tires. ON and OFF
 * @param {OnsuraceTiresVariables} _variables Variables from the payload (treated)
 */
const onsuranceTire = async (_variables: OnsuraceTiresVariables) => {
    try {
        const userDbPath = await userProfileDbRefRoot(_variables.userEmail);

        const itemId = await getItemId(_variables.tireVehicleId);
    
        const userProfile: PersonalUserProfileInterface = await getDatabaseInfo(userDbPath.child('personal'));
        checkUserProfile(userProfile, _variables.userEmail);
        checkOnboard(userProfile, _variables.userEmail);

        const tireProfile: TireInUserProfile = await getDatabaseInfo(userDbPath.child(`items/tires/${itemId}`));
        checkTireProfile(tireProfile, _variables);

        const itemAuth: ItemAuthorizations = await getDatabaseInfo(userDbPath.child(`itemAuthorizations`));
        
        function checkAccess () {
            const checkUserAccess = new TestAccessToItem(_variables, tireProfile, itemAuth);

            const owner = checkUserAccess.checkOwnership();

            if (!owner) {
                const haveAccess = checkUserAccess.checkThirdPartyAccess();
                return haveAccess;
            };
            return true;
        };
        const _access = checkAccess()
        checkItemAccess(_access, _variables);

        const tireDbPath = await tiresInItemDbPath(tireProfile.vehicleType, tireProfile.itemId);

        const tireProtectionData: TireProtectionData = await getDatabaseInfo(tireDbPath.child('profile/protectionData'));
        checkItemProfile(tireProtectionData, _variables);

        function checkOnsuranceStatus () {
            const status = Object.values(tireProtectionData.protectionStatus);
            console.log(`TCL: status`, status);
            const protectionStatus = status.every(status => status === true);
            console.log(`TCL: protectionStatus`, protectionStatus);
            checkStatusOnsuranceTires(protectionStatus, _variables)
            return protectionStatus;
        };
        const status = checkOnsuranceStatus()

        checkStatusOnsuranceTires(status, _variables);

        return {
            protectionStatus: status,
            userProfile: userProfile,
            itemId: itemId,
            tireProfile: tireProfile,
            protectionData: tireProtectionData,
            userDbPath: userDbPath,
            tireDbPath: tireDbPath
        }
    } catch (error) {
        console.error(new Error(`Error in Onsurace Tire Activation - ${JSON.stringify(error)}`))
        throw error;
    }
};


interface OnsuranceData {
    protectionStatus: boolean,
    userProfile: PersonalUserProfileInterface
    itemId: string,
    tireProfile: TireInUserProfileInterface,
    protectionData: TireProtectionData,
    userDbPath: any,
    tireDbPath: any
};

const executeBackupOn = async (onsuranceData: OnsuranceData) => {
    console.log(`TCL: onsuranceData`, onsuranceData.itemId);
    try {
        await setDatabaseInfo(onsuranceData.userDbPath.child("personal"), onsuranceData.userProfile);
        await setDatabaseInfo(onsuranceData.userDbPath.child(`items/tires/${onsuranceData.itemId}`), onsuranceData.tireProfile);
        await setDatabaseInfo(onsuranceData.tireDbPath.child("profile/protectionData"), onsuranceData.protectionData);
        return "Backup executed"
    } catch (error) {
        console.error( new Error (`Failed to execute backup. ${JSON.stringify(error)}`));
        return "error in Backup"
    }   
};

const executeBackupOff = async (onsuranceData: OnsuranceData, logUse?) => {
    try {
        await setDatabaseInfo(onsuranceData.userDbPath.child("personal"), onsuranceData.userProfile);
        await setDatabaseInfo(onsuranceData.tireDbPath.child("profile/protectionData"), onsuranceData.protectionData);
        if (logUse !== null && logUse !== undefined) await setDatabaseInfo(onsuranceData.tireDbPath.child(`logUse/${logUse.lastProtectionId}`), logUse.lastProtection);
        return "Backup executed"
    } catch (error) {
        console.error( new Error (`Failed to execute backup. ${JSON.stringify(error)}`));
        return "error in Backup"
    }   
};

/**
 * @description This function is responsible for turnning the Onsurance Tires ON
 * @param variables Payload treated variables
 */
export const onsuranceTireOn = async (variables: OnsuraceTiresVariables) => {
    try {
        const onsuranceData = await onsuranceTire(variables);
        // create Log of use for tire protection
        let timezoneDiff = 0
        if (variables.timezone !== null) {
            timezoneDiff = variables.timezone * 1000 * 3600 
        };
        const logUse = {
            closed: false,
            timeStart: (Date.now() + timezoneDiff)/1000|0,
            activationUser: variables.userEmail,
            policies: {
                accident: variables.accident
            },
        };

        // Call database to turn Onsurance ON. Update data on database
        const turnOnsuranceOn = async() => {
            try {
                const logId = await pushDatabaseInfo(onsuranceData.tireDbPath.child("logUse"), logUse);
                // update profile activations counter
                await updateDatabaseInfo(onsuranceData.userDbPath.child("personal"), {
                    activationsCounter: onsuranceData.userProfile.activationsCounter + 1
                });

                // Update tires in profile activations counter
                await updateDatabaseInfo(onsuranceData.userDbPath.child(`items/tires/${onsuranceData.itemId}`), {
                    activationsCounter: {
                        accident: onsuranceData.tireProfile.activationsCounter.accident + 1
                    }
                });

                // Update tire profile in Items - Activations counter and status protection
                await updateDatabaseInfo(onsuranceData.tireDbPath.child(`profile/protectionData`), {
                    activationsCounter: {
                        accident: onsuranceData.protectionData.activationsCounter.accident + 1
                    },
                    protectionStatus: {
                        accident: true
                    }
                });
                return logId
            } catch (error) {
                console.error(new Error (`Error turnning Onsurance tires ON. ${JSON.stringify(error)}`));
                throw onsuranceData
            }
        };
        
        const logId = await turnOnsuranceOn();
        return {
            ...onsuranceData,
            tireLogId: logId._id
        };
    } catch (error) {
        if (error.callback) throw error
        await executeBackupOn(error);
        let lastProtection = await getDatabaseInfo(error.tireDbPath.child("logUse").limitToLast(1));
        if (lastProtection === null) {
            throw {
                callback: `TireRes_activationFail`,
                variables: {}
            };
        } else {
            const lastProtectionId = Object.keys(lastProtection)[0]
            await deleteDatabaseInfo(error.tireDbPath.child(`logUse/${lastProtectionId}`))
            throw {
                callback: `TireRes_activationFail`,
                variables: {}
            };

        }
        
    };
    
};

/**
 * @description This function is responsible for turnning the Onsurance Tires OFF
 * @param variables Payload treated variables
 */
export const onsuranceTireOff = async (variables: OnsuraceTiresVariables) => {
    try {
        const onsuranceData = await onsuranceTire(variables);
        const lastProtectionObj = await getDatabaseInfo(onsuranceData.tireDbPath.child("logUse").limitToLast(1));
        const lastProtectionId = Object.keys(lastProtectionObj)[0];
        const lastProtection = lastProtectionObj[lastProtectionId]
        
        // create Log of use for tire protection
        let timezoneDiff = 0
        if (variables.timezone !== null) {
            timezoneDiff = variables.timezone * 1000 * 3600 
        };
        const timeEnd = (Date.now() + timezoneDiff)/1000|0;                              // TimeEnd - Timestamp do desligamento da protecão
        const useTime = timeEnd - lastProtection.timeStart       // TimeDiff - Tempo total de uso da protecão em segundos
        const days = (useTime/60/60/24|0)                         // TimeDiffDays - Tempo de uso em dias(totais) da protecão
        const totalHours = (useTime/60/60|0)                     // TimeDiffHoursTotais - Tempo de uso da protecão em Horas
        let totalMinutes = (useTime/60|0);                         // TimeDiffMinutesTotais - Tempo de uso em minutos da protecão
        const hours = (totalHours - (days*24));                        // TimeDiffHours - Tempo de uso da protecão em horas dentro de 24H
        const minutes = (totalMinutes - (totalHours * 60));               // TimeDiffMinutes - Tempo de uso da protecão em minutos dentro de 60Min
        const seconds = (useTime - (totalMinutes*60));              // TimeDiffSeconds - Tempo de uso da protecão em segundos dentro de 60Segundos
    
         // Calcula o valor conumido baseado no tempo de uso.

        // Calculate minute value based on active polices on protection
        const minuteValue = onsuranceData.protectionData.minuteValue
        let consumedSwitch = 0;
        console.log("TCL: closeProtection -> protectionMinuteValue", minuteValue)
        if (seconds >= 30){
            consumedSwitch = parseFloat(((Math.ceil(useTime/60))*minuteValue).toFixed(3))
            totalMinutes + 1;
            console.log("TCL: closeProtection -> Considered minutes - ceil", Math.ceil(useTime/60))
        } else if (seconds < 30) {
            consumedSwitch = parseFloat(((Math.floor(useTime/60))*minuteValue).toFixed(3))
            console.log("TCL: closeProtection -> Considered Minutes - floor", Math.floor(useTime/60))
        }
        console.log("TCL: consumedSwitch", consumedSwitch)

        let newSwitch = 0;
        let oldSwitch = onsuranceData.userProfile.wallet.switch

        // if (onsuranceData.tireProfile.owner !== variables.userEmail) {
        //     const 
        //     oldSwitch = parseFloat(protectionData.ownerCredit)
        //     newSwitch = parseFloat((parseFloat(protectionData.ownerCredit) - consumedSwitch).toFixed(2))
        //     console.log("TCL: newSwitch", newSwitch)
        //     const ownerDbPath = protectionData.ownerDbPath
        //     await userDbMethods.updateDatabaseInfo(ownerDbPath.child("personal/wallet/"),{
        //         switch: newSwitch
        //     });
        //     // console.log(`TCL: Owner wallet updated.`);
        // } else {
            newSwitch = parseFloat((oldSwitch - consumedSwitch).toFixed(2))
            console.log("TCL: newSwitch", newSwitch)
            
        // };
        const logUse = {
            closed: true,
            timeEnd: (Date.now() + timezoneDiff)/1000|0,
            deactivationUser: variables.userEmail,
            useTime: useTime,
            consumedValue: consumedSwitch,
            initialSwitch: oldSwitch,
            finalSwitch: newSwitch,
        };
        console.log(`TCL: logUse`, logUse);

        const responseVariables = {
            days:days,
            hours:hours,
            minutes:minutes,
            seconds:seconds,
            consumedSwitch: consumedSwitch,
            newSwitch: newSwitch,
            tireOnsuranceStatus: "OFF",
            tireOnsuranceId: lastProtectionId

        };

        // Call database to turn Onsurance OFF. Update data on database
        const turnOnsuranceOff = async () => {
            try {
                // Update user wallet 
                await updateDatabaseInfo(onsuranceData.userDbPath.child('personal'),{
                    wallet: {
                        switch: newSwitch
                    },
                });

                console.log(`wallet updated`);

                // Update Tire Item profile: update protection Data protected minutes and protection status
                await updateDatabaseInfo(onsuranceData.tireDbPath.child('profile/protectionData'), {
                    protectedMinutes: onsuranceData.protectionData.protectedMinutes + totalMinutes, 
                    protectionStatus: {
                        accident: false
                    }
                });

                console.log(`Item profile protection data updated`);

                // Update and close log use
                await updateDatabaseInfo(onsuranceData.tireDbPath.child(`logUse/${lastProtectionId}`), logUse);

                console.log(`log use updated`)
                return lastProtection[lastProtectionId];
            } catch (error) {
                console.error(new Error (`Error turnning Onsurance tires OFF. ${JSON.stringify(error)}`));
                throw {
                    onsuranceData: onsuranceData,
                    logUse: {
                        lastProtection: lastProtection[lastProtectionId],
                        lastProtectionId: lastProtectionId,
                    },
                };
            }
        };
        
        const oldLogUse = await turnOnsuranceOff();
        return {
            ...onsuranceData,
            logUse: oldLogUse,
            responseVariables: responseVariables,
        };
    } catch (error) {
        console.error(`TCL: error`, JSON.stringify(error));
        if (error.callback) throw error
        if (error.onsuranceData) {
            await executeBackupOff(error.onsuranceData, error.logUse);
            throw {
                callback: `TireRes_deactivationFail`,
                variables: {}
            }; 
        };

    };
    
};