import { itemProfileDbRef} from "../database/database"
import {getVehicleMinuteValue, getTireMinuteValue} from '../model/calcMin'
import { checkUserProfile, checkItemProfileAlreadyExists, checkVehicleTireQtd } from "../model/errors";
import { getDatabaseInfo, setDatabaseInfo, databaseMethods, updateDatabaseInfo, pushDatabaseInfo} from "../model/databaseMethods";
import { getItemId, tiresInItemDbPath } from "../database/tire.database";
import { userProfileDbRefRoot } from "../database/customer.database";
import { restoreData } from "../model/backup.model";
import { tireOnboardVariables } from "../environment/onboardVariables";


interface VehicleOnboardInterface {
    userProfile: {
        firstName: string
        lastName: string
        userEmail: string
        cpf: string
        onboard: boolean
        fundsToWallet?: string
    },
    itemProfile: {
        itemType: string
        itemInnerType: string
        typeOfUse: string
        factory: string
        plate: string
        chassi: string
        itemPrice: number
        brand: string
        model: string
        year: number
        access: any
        hasAssistance: boolean
        thirdPartyCoverage: number
    }
}

export const clientOnboard = async (variables: VehicleOnboardInterface) => {
    return new Promise( async (resolve, reject) => {

        const doOnboard = async backup => {
            try {
                /*
                    TODO:  Get/Set data in ZOHO CRM API
                */
                // Database reference for user profile root
                const userDb = backup.userDbPath;
                const itemDbPath = backup.itemDbPath
    
    
                // Get Methods for playing with user data base CRUD
                const userProfilePersonal = await databaseMethods();
                const userProfileItems = await databaseMethods();
    
                // Get profile info on DB
                const getProfile = backup.fullUserProfile.personal;
                console.log("TCL: clientOnboard -> getProfile", getProfile)
    
                // If user Dont exist enter here
                if (getProfile === null || getProfile === undefined) throw {
                        status: 404, // Not found
                        text: `Error getting profile for ${variables.userProfile.userEmail}. Error: Profile = Null. Check if user purchased Onsurance and Order is Completed. `
                    };
                
                // checks if already did onboard
                if (getProfile.onboard) {
                    const itemsArrays = Object.keys(backup.fullUserProfile.items)
                    // check if user already did onboard for that item
                    // Run array to get elements
                    itemsArrays.map(element => {
                        if (backup.fullUserProfile.items[element].itemId === variables.itemProfile.plate) throw {
                                status: 403, //forbidden
                                text: `Error doing onboard for ${variables.userProfile.userEmail}. Error: User already did onboard for item with id ${variables.itemProfile.plate}.`
                        };
                    });
                } else {
                    await userProfilePersonal.updateDatabaseInfo(userDb.child('personal'), {
                        activationsCounter: 0
                    });
                }
    
                /* 
                    TODO: add type to calc minute value
                    DONE:  Vehicle -> car and motorcicle calc minute
                */
                let itemMinuteValue = 4.84;
                if (variables.itemProfile.itemType === 'vehicle'){
                    const userInput = {
                        fipe: (variables.itemProfile.itemPrice!).toString(),
                        vehicleType: variables.itemProfile.itemInnerType!.toLowerCase(),
                        usageType: variables.itemProfile.typeOfUse.toLowerCase(),
                        factory: variables.itemProfile.factory.toLowerCase(),
                        thirdPartyCoverage: (variables.itemProfile.thirdPartyCoverage).toString()
                    }
                    await getVehicleMinuteValue(userInput).then(result => {
                        itemMinuteValue = result;
                    }).catch(error => {
                        console.error(`error in calc minute value promise.`)
                        throw error;
                    });
                };
                console.log("TCL: clientOnboard -> itemMinuteValue", itemMinuteValue);
    
                // Reference to item in use on user profile database
                // customer -> profiles -> ClientId -> Items
                const itemInUse = {
                    type: variables.itemProfile.itemType,
                    innerType: variables.itemProfile.itemInnerType,
                    owner: variables.userProfile.userEmail,
                    itemId: variables.itemProfile.plate,
                    activationsCounter: {
                        theft: 0,
                        accident: 0,
                        thirdParty: 0,
                    },
                };
                // push new item in use to user databse
                const itemDdId = await getItemId(variables.itemProfile.plate)
                console.log("TCL: clientOnboard -> itemDdId", itemDdId)
                await userProfileItems.updateDatabaseInfo(userDb.child(`items/${itemDdId}`), itemInUse);
                
                const itemProfile = {
                    model: variables.itemProfile.model,
                    brand: variables.itemProfile.brand,
                    plate: variables.itemProfile.plate,
                    chassi: variables.itemProfile.chassi,
                    year: variables.itemProfile.year,
                    itemPrice: variables.itemProfile.itemPrice,
                    typeOfUse: variables.itemProfile.typeOfUse,
                    thirdPartyCoverage: variables.itemProfile.thirdPartyCoverage,
                    protectionData: {
                        minuteValue: parseFloat((itemMinuteValue*1000).toFixed(3)),
                        protectionStatus: {
                            theft: false,
                            accident: false,
                            thirdParty: false,
                        },
                        activationsCounter:{
                            theft: 0,
                            accident: 0,
                            thirdParty: 0,
                            fullCoverage: 0,
                        },
                        access: variables.itemProfile.access
                    },               
                    hasAssistance: variables.itemProfile.hasAssistance,
                    factory: variables.itemProfile.factory,
                };
    
                // Add the new item profile do db
                await backup.itemMethods.updateDatabaseInfo(itemDbPath ,itemProfile);
    
                // If onboard is false... set to true
                if (!getProfile.onboard) await userProfilePersonal.updateDatabaseInfo(userDb.child(`personal`), {onboard: true}); 
    
                resolve({
                    status: 200,
                    text: `All actions passed for client ${variables.userProfile.userEmail}. Onboard completed.`
                });
            } catch (error) {
                console.error(new Error(`Error for ${variables.userProfile.userEmail}: ${JSON.stringify(error)}`));
                await (function(){
                    backup.itemMethods.setDatabaseInfo(backup.itemDbPath, backup.fullItem);
                    backup.userMethods.setDatabaseInfo(backup.userDbPath,backup.fullUserProfile);
                })()
                console.log("TCL: clientOnboard Error -> backup reverted")
                if(error.status) reject(error)
                reject({
                    status: 500,
                    text: `Unknown error. check what happened. ${JSON.stringify(error)}`
                })
            } ;
        };
        // make backup in case something goes wrong anywhere
        try {
            // Get Methods for backup in case something goes wrong
            const userMethods = await databaseMethods();
            const itemMethods = userMethods
            // Get user profile data for backup on DB
            const userDbPath = userProfileDbRefRoot(variables.userProfile.userEmail)
            const itemDbPath = itemProfileDbRef(
                variables.itemProfile.plate, 
                variables.itemProfile.itemType, 
                variables.itemProfile.itemInnerType).child("profile");
            
            const getFullUserProfile = await userMethods.getDatabaseInfo(userDbPath)
            console.log("TCL: doBackup -> getFullUserProfile", getFullUserProfile)
            // ERROR check
            checkUserProfile(getFullUserProfile, variables.userProfile.userEmail)
            
            const getFullItem = await itemMethods.getDatabaseInfo(itemDbPath)
            console.log("TCL: doBackup -> getFullItem", getFullItem)

            const variablesResponse = {
                userEmail: variables.userProfile.userEmail,
                itemInUse: variables.itemProfile.plate
            };
            
            // ERROR check for item profile that already exists
            checkItemProfileAlreadyExists(getFullItem, variablesResponse)

            const backup = {
                userMethods: userMethods,
                itemMethods: itemMethods,
                fullUserProfile: getFullUserProfile,
                fullItem: getFullItem,
                itemDbPath: itemDbPath,
                userDbPath: userDbPath
            }
            return doOnboard(backup)
        } catch (error) {
            console.error(new Error(`Error doing backup for user ${variables.userProfile.userEmail}. Error: ${error}`));
            reject(error)
        }
        
        

    });   
};




/**
 * 
 * @param {Object} variables Variables for tire Onboard
 */
export const tireOnboard = (variables) => {

    return new Promise(async (resolve, reject) => {
        try {
            const onboardVariables = await tireOnboardVariables(variables);

            // ------------ DB PATHS --------

            const userProfilePath = await userProfileDbRefRoot(onboardVariables.userEmail);
            const tireProfilePath = await tiresInItemDbPath(onboardVariables.vehicleType, onboardVariables.plate).child("profile");


            // ------------ USER PROFILE -----
            const userProfileBackup = await getDatabaseInfo(userProfilePath);
            console.log(`TCL: tireOnboard -> userProfileBackup`, JSON.stringify(userProfileBackup));
            checkUserProfile(userProfileBackup, onboardVariables.userEmail);


            // ------------ ITEMS -----------
            const tireProfileBackup = await getDatabaseInfo(tireProfilePath);
            // console.log(`TCL: tireOnboard -> tireProfileBackup`, JSON.stringify(tireProfileBackup));


            // ------------ EXECUTE ONBOARD --------
            
            const onboard = async () => {
                try {

                    switch (tireProfileBackup) {
                            /** Não existe perfil de pneus no DB
                             * @path Items/tires/vehicleId/profile
                             * 
                            */
                        case null:
                        case undefined: {


                            const minuteValue = await getTireMinuteValue(onboardVariables.totalValue, onboardVariables.vehicleType);
                            const protectionData = {
                                tireQtd: onboardVariables.tireQtd,
                                vehicleId: onboardVariables.plate,
                                minuteValue: minuteValue,
                                protectedMinutes: 0,
                                activationsCounter: {
                                    accident: 0
                                },
                                protectionStatus: false,
                                totalValue: onboardVariables.totalValue,
                                vehicleType: onboardVariables.vehicleType,
                            };

                            const tireProfile = {
                                nfId: onboardVariables.nfId,
                                tireQtd: onboardVariables.tireQtd,
                                totalValue: onboardVariables.totalValue,
                                tireData: onboardVariables.tiresData
                            };

                            await setDatabaseInfo(tireProfilePath.child("protectionData"), protectionData);

                            const pushResult = await pushDatabaseInfo(tireProfilePath.child("tires"), tireProfile);

                            const itemId = getItemId(onboardVariables.plate);
                            
                            
                            const itemInUserProfile = {

                                [itemId]: {
                                    itemId: onboardVariables.plate,
                                    type: "tires",
                                    activationsCounter: {
                                        accident: 0
                                    },
                                    owner: onboardVariables.userEmail,
                                    vehicleType: onboardVariables.vehicleType,
                                }
                            };

                            await updateDatabaseInfo(userProfilePath.child("items/tires"), itemInUserProfile);
                            await updateDatabaseInfo(userProfilePath.child("personal"), {onboard: true});

                            const result = {
                                profile: itemInUserProfile,
                                protectionData: protectionData,
                                tires: {
                                    [pushResult._id]: tireProfile
                                }
                            };

                            return resolve({
                                message: `Onboard made for item Tire with NF ${onboardVariables.nfId}.`,
                                onboardInformation: result
                            });
                        };
                        default: {

                            /*  Already have tires on db. 
                                Check if this specific tire (group) is on db
                            */

                           const minuteValue = await getTireMinuteValue(onboardVariables.totalValue, onboardVariables.vehicleType);

                            const protectionData = {
                                tireQtd: tireProfileBackup.protectionData.tireQtd + onboardVariables.tireQtd,
                                totalValue: tireProfileBackup.protectionData.totalValue + onboardVariables.totalValue,
                                minuteValue: minuteValue,
                            };        
                            
                            const tireProfile = {
                                nfId: onboardVariables.nfId,
                                tireQtd: onboardVariables.tireQtd,
                                totalValue: onboardVariables.totalValue,
                                tireData: onboardVariables.tiresData
                            };

                            await (async function checkTireInProfile(){
                                const tiresInProfile = Object.keys(tireProfileBackup.tires);
                                // iterate tires 
                                tiresInProfile.forEach(tire => {
                                    console.log(`TCL: tire`, tire);
                                    switch (tireProfileBackup.tires[tire].nfId) {
                                        case `${onboardVariables.nfId}`:{                                            
                                            throw {
                                                errorType: "Tires in NF already on profile",
                                                message:  `Tires with NF ${onboardVariables.nfId} already on profile.`
                                            };
                                        };
                                        default:
                                            break;
                                    }
                                });
                            })();

                            await checkVehicleTireQtd(onboardVariables.vehicleType, protectionData.tireQtd);
                            
                            protectionData.minuteValue = await getTireMinuteValue(protectionData.totalValue, onboardVariables.vehicleType);
                            
                            await updateDatabaseInfo(tireProfilePath.child("protectionData"), protectionData);
                            const pushResult = await pushDatabaseInfo(tireProfilePath.child("tires"), tireProfile);

                            const newTireProfile = {
                                profile:{
                                    protectionData: protectionData,
                                    tires: {
                                        ...tireProfileBackup.tires,
                                        [pushResult._id]: tireProfile
                                    }
                                },

                            };

                            return resolve(newTireProfile);
                            
                        };
                    };
                } catch (error) {
                    console.error(new Error(`Error in tire onboard. error: ${JSON.stringify(error)}`));
                    const rollback = {
                        tireProfile: await restoreData(tireProfilePath, tireProfileBackup),
                        userProfile: await restoreData(userProfilePath, userProfileBackup),
                    };
                    reject({
                        error: error,
                        backup: rollback
                    });
                }  
            };

            await onboard();
        } catch (error) {
            console.error(new Error(`TCL: tireOnboard -> error: ${JSON.stringify(error)}`));
            reject(error)
        }
    });
};

