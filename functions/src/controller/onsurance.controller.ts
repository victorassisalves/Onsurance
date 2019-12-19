
import { userProfileDbRefRoot } from "../database/customer.database"
import { getDatabaseInfo, setDatabaseInfo, updateDatabaseInfo, pushDatabaseInfo, deleteDatabaseInfo } from "../model/databaseMethods";
import { OnsuraceTiresVariables } from "../environment/messenger/messenger.variables";
import { TireInUserProfile, TireProtectionData } from "../model/tires.model";
import { getItemId, tiresInItemDbPath } from "../database/tire.database";
import { PersonalUserProfileInterface, ItemAuthorizations, TireInUserProfileInterface } from "../interfaces/user.interfaces";
import { checkUserProfile, checkTireProfile, checkItemAccess, checkItemProfile, checkOnboard, checkOwnerCredit } from "../model/errors";
import { TestAccessToItem } from "../test/itemAccess.test";
import { checkStatusOnsuranceTires } from "../test/onsurance.test";
import { generateTimeEnd } from "../model/timeToDateModel";



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
                const haveAccess = checkUserAccess.checkTireThirdPartyAccess();
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
            const protectionStatus = status.every(status => status === true);
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
    let ownerCredit = 0;
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

                // check if owner have enought credit
                if (onsuranceData.tireProfile.owner !== variables.userEmail) {
                    const ownerDbPath = await userProfileDbRefRoot(onsuranceData.tireProfile.owner);
                    ownerCredit = await getDatabaseInfo(ownerDbPath.child("personal/wallet/switch"));
                    checkOwnerCredit(ownerCredit);
                }

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

        await turnOnsuranceOn();

        return "Onsurance Pneus ON";
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
            await deleteDatabaseInfo(error.tireDbPath.child(`logUse/${lastProtectionId}`));

            throw {
                callback: `TireRes_activationFail`,
                variables: {}
            };
        };
    };
};

/**
 * @description This function is responsible for turnning the Onsurance Tires OFF
 * @param {OnsuraceTiresVariables} variables Payload treated variables
 */
export const onsuranceTireOff = async (variables: OnsuraceTiresVariables) => {
    let ownerCredit = 0;
    let ownerDbPath: any = '';
    let newSwitch = 0;
    let oldSwitch = 0;
    try {
        const onsuranceData = await onsuranceTire(variables);
        const lastProtectionObj = await getDatabaseInfo(onsuranceData.tireDbPath.child("logUse").limitToLast(1));
        const lastProtectionId = Object.keys(lastProtectionObj)[0];
        const lastProtection = lastProtectionObj[lastProtectionId]

        // Get all time End info (total minutes, hours, minutes, seconds, timeEnd....)
        const timeInfo = generateTimeEnd(lastProtection.timeStart, variables.timezone)

        // Calculate minute value based on active polices on protection
        const minuteValue = onsuranceData.protectionData.minuteValue
        const consumedSwitch = parseFloat((timeInfo.totalMinutes*minuteValue).toFixed(3))

        // If user is not owner, discount credit on the owner wallet
        if (onsuranceData.tireProfile.owner !== variables.userEmail) {
            ownerDbPath = await userProfileDbRefRoot(onsuranceData.tireProfile.owner);
            ownerCredit = await getDatabaseInfo(ownerDbPath.child("personal/wallet/switch"))
            oldSwitch = ownerCredit;
            newSwitch = parseFloat((ownerCredit - consumedSwitch).toFixed(2))
            await updateDatabaseInfo(ownerDbPath.child("personal/wallet/"),{
                switch: newSwitch
            });
        } else {
            oldSwitch = onsuranceData.userProfile.wallet.switch
            newSwitch = parseFloat((oldSwitch - consumedSwitch).toFixed(2)) 
        };
        const logUse = {
            closed: true,
            timeEnd: timeInfo.timeEnd,
            deactivationUser: variables.userEmail,
            useTime: timeInfo.useTime,
            consumedValue: consumedSwitch,
            initialSwitch: oldSwitch,
            finalSwitch: newSwitch,
        };

        const responseVariables = {
            days: timeInfo.days,
            hours: timeInfo.hours,
            minutes: timeInfo.minutes,
            seconds: timeInfo.seconds,
            consumedSwitch: consumedSwitch,
            newSwitch: newSwitch,
            tireOnsuranceStatus: "OFF",
            tireOnsuranceId: lastProtectionId

        };

        // Call database to turn Onsurance OFF. Update data on database
        const turnOnsuranceOff = async () => {
            try {
                // Update user wallet 
                if (onsuranceData.tireProfile.owner === variables.userEmail) {
                    await updateDatabaseInfo(onsuranceData.userDbPath.child('personal'),{
                        wallet: {
                            switch: newSwitch
                        },
                    });

                };

                // Update Tire Item profile: update protection Data protected minutes and protection status
                await updateDatabaseInfo(onsuranceData.tireDbPath.child('profile/protectionData'), {
                    protectedMinutes: onsuranceData.protectionData.protectedMinutes + timeInfo.totalMinutes, 
                    protectionStatus: {
                        accident: false
                    }
                });

                // Update and close log use
                await updateDatabaseInfo(onsuranceData.tireDbPath.child(`logUse/${lastProtectionId}`), logUse);

                console.log(`Onsurance Tires OFF. Back to user`);

                return true
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
        
        await turnOnsuranceOff();
        return responseVariables
    } catch (error) {
        console.error(new Error(`Failed to turn Onsurance Tires OFF. Main function. ${JSON.stringify(error)}`));

        if (error.callback) throw error

        if (error.onsuranceData) {
            await executeBackupOff(error.onsuranceData, error.logUse);
            if (error.onsuranceData.tireProfile.owner !== error.onsuranceData.userProfile.userEmail) {
                await updateDatabaseInfo(ownerDbPath.child("personal/wallet/"),{
                    switch: ownerCredit
                });
            }
            throw {
                errorType: 'Unknown error. check what happened',
                error: error,
                callback: `TireRes_deactivationFail`,
                variables: {}
            }; 
        };
        throw {
            errorType: 'Unknown error. check what happened',
            error: error,
            callback: `TireRes_deactivationFail`,
            variables: {}
        }; 

    };
    
};