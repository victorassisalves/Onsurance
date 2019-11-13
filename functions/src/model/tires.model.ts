import { getDatabaseInfo, setDatabaseInfo } from "./databaseMethods";
import { getItemId, tiresInItemDbPath } from "../database/tire.database";
import { userProfileDbRefRoot } from "../database/customer.database";
import { checkUserProfile } from "./errors";
import { restoreData } from "./backup.model";
import { getTireMinuteValue } from "./calcMin";
import { tireOnboardVariables } from "../environment/onboardVariables";




export const tireOnboard = (variables) => {

    return new Promise(async (resolve, reject) => {
        try {
            const onboardVariables = await tireOnboardVariables(variables);
            /**
             * TODO:
             *  @todo Get item database path for tire
             *  @todo Get user database path to items in profile
             *  @todo Get database informations for backup in user profile.
             *  @todo Check to see if user profile exist
             *  @todo Check to see if user already have vehicle with tires in profile
             *  @todo 
             * 
            */

            // ------------ DB PATHS --------


            const userProfilePath = await userProfileDbRefRoot(onboardVariables.userEmail).child("personal");

            const tireProfilePath = await tiresInItemDbPath(onboardVariables.plate).child("profiles");
            
            const itemId = await getItemId(onboardVariables.plate);
            const tiresInUserProfilePath = await userProfileDbRefRoot(onboardVariables.userEmail).child(`items/tires/${itemId}`);



            // ------------ USER PROFILE -----
            const userProfileBackup = await getDatabaseInfo(userProfilePath);
            console.log(`TCL: tireOnboard -> userProfileBackup`, JSON.stringify(userProfileBackup));
            checkUserProfile(userProfileBackup, onboardVariables);


            // ------------ ITEM IN USER PROFILE ---
            const tireInUserProfileBackup = await getDatabaseInfo(tiresInUserProfilePath);
            console.log(`TCL: tireOnboard -> tireInUserProfileBackup`, JSON.stringify(tireInUserProfileBackup));


            // ------------ ITEMS -----------
            const tireProfileBackup = await getDatabaseInfo(tireProfilePath);
            console.log(`TCL: tireOnboard -> tireProfileBackup`, JSON.stringify(tireProfileBackup));


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
                            const minute = await getTireMinuteValue(onboardVariables);

                            const tireProfile = {
                                qtd: onboardVariables.qtd,
                                vehicleId: onboardVariables.plate,
                                minuteValue: minute.minuteValue,
                                minuteValueBase: minute.minuteValueBase,
                                totalValue: onboardVariables.totalValue,
                                tires: {
                                    [`${onboardVariables.tireId}`]: {
                                        price: onboardVariables.totalValue
                                    }
                                }
                            };

                            await setDatabaseInfo(tireProfilePath, tireProfile);
                            return resolve({
                                message: `Onboard made for item Tire ${onboardVariables.tireId}.`
                            });
                        };
                        default: {
                            switch (tireProfileBackup.tires[onboardVariables.tireId] ) {
                                case null:
                                case undefined:
                                    /*  Tire isn't on db yet
                                        Need to make onboard for tire in tire/vehicle profile
                                    */
                                    console.log(`TCL: tireProfileBackup[onboardVariables.tireId]`, tireProfileBackup[onboardVariables.tireId]); 

                                    const newTireMinute = {
                                        qtd: tireProfileBackup.qtd + onboardVariables.qtd,
                                        totalValue: tireProfileBackup.totalValue + onboardVariables.totalValue
                                    }
                                    console.log(`TCL: newTireMinute`, JSON.stringify(newTireMinute));
                                    return resolve(newTireMinute)
                                default: {
                                    // Since no data was modified, no restoration is necessary
                                    reject({
                                        errorType: "Onboard Already made for this item.",
                                        message: `Tire ${onboardVariables.tireId} is already on database.`
                                    });
                                };
                            };

                            // const data = {
                            //     data1: tireProfileBackup,
                            //     data2: tireInUserProfileBackup,
                            //     data3: userProfileBackup
                            // }
                            // resolve(data);
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
            console.error(new Error(`TCL: tireOnboard -> error: ${error}`));
            reject(error)
        }
    });
};