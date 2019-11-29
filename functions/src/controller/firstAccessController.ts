import { getItemId, itemProfileDbRef } from "../database/database";
import { userProfileDbRefRoot } from "../database/customer.database";
import { databaseMethods, getDatabaseInfo } from "../model/databaseMethods";
import { checkUserProfile, checkItemInUse, checkOnboard, checkClientId, checkUserWallet, checkItemProfile } from "../model/errors";



export const doFirstAccess = variables => {
    console.log("TCL: variables", variables)
    return new Promise(async (resolve, reject) => {
        const firstAccess = async backup => {
            try {
                /*
                    TODO: 


                */

                const profile = {
                    lastName: variables.lastName, 
                    messengerId: variables.messengerId
                };

                await backup.dbMethods.updateDatabaseInfo(backup.userDbPath.child('personal'), profile);

                
                resolve({
                    status: 200,
                    text: `User ${variables.userEmail} did the first access.`,
                    callback: 'firstAccess',
                    variables: {
                        userEmail: variables.userEmail,
                        itemModel: backup.itemProfile.model,
                        itemBrand: backup.itemProfile.brand,
                    }
                });
            } catch (error) {
                console.log(`Error in first access for user ${variables.userEmail}. Doing Backup Now.`)
                await backup.dbMethods.setDatabaseInfo(backup.userDbPath.child('personal'), backup.userProfile)
                reject(error)
            }   
        }

        const doBackup = async () => {
            try {
                const dbMethods = await databaseMethods();
                const userDbPath = await userProfileDbRefRoot(variables.userEmail)
                const itemId = await getItemId(variables.itemInUse);
                
                /*
                    TODO:

                */
                
                const userProfile = await dbMethods.getDatabaseInfo(userDbPath.child(`personal`));
                console.log("TCL: doBackup -> userProfile", userProfile)
                
                // ERROR check for owner account NOT exist
                await checkUserProfile(userProfile, variables)

                // ERROR check for onboard made
                await checkOnboard(userProfile, variables);

                // ERROR check for client ID (Woocommerce)
                await checkClientId(userProfile, variables)

                // ERROR check for wallet and wallet amount
                await checkUserWallet(userProfile, variables)

                const itemInUse = await dbMethods.getDatabaseInfo(userDbPath.child(`items/${itemId}`));
                console.log("TCL: doBackup -> itemInUse", itemInUse);

                await checkItemInUse(itemInUse, variables);

                const itemDbPath = await itemProfileDbRef(itemInUse.itemId, itemInUse.type, itemInUse.innerType);
                const itemProfile = await dbMethods.getDatabaseInfo(itemDbPath.child("profile"));
                console.log("TCL: doBackup -> itemProfile", itemProfile);
                
                // ERROR check for non existing ItemProfile
                await checkItemProfile(itemProfile, variables);

                const backup = {
                    userProfile: userProfile,
                    itemProfile: itemProfile,
                    itemInUse: itemInUse,
                    itemId: itemId,
                    dbMethods: dbMethods,
                    userDbPath: userDbPath,
                }
                console.log("TCL: doBackup -> backup", backup)
                
                
                return firstAccess(backup)  
            } catch (error) {
                console.log("TCL: doBackup -> error", error)
                reject(error)
            }
        }

        await doBackup()
    });
    
};


export const getfirstAccess = async (variables) => {
    try {
        // DO BACKUP
            const userDbPath = await userProfileDbRefRoot(variables.userEmail);
            
            const userProfile = await getDatabaseInfo(userDbPath.child(`personal`));
            const userItems = await getDatabaseInfo(userDbPath.child(`items`));
            
            // ERROR check for owner account NOT exist
            checkUserProfile(userProfile, variables)

            // ERROR check for onboard made
            checkOnboard(userProfile, variables);

            // ERROR check for client ID (Woocommerce)
            checkClientId(userProfile, variables);

            // ERROR check for wallet and wallet amount
            checkUserWallet(userProfile, variables);

            const checkAccessToProducts = () => {
                // First we need to check vehicles PRON
                const result = {
                    autoAccess: false,
                    tireAccess: false,
                };

                const items = Object.keys(userItems);
                items.forEach(item => {
                    // Inside tires in items 
                    if (item === "tires") {
                        switch (userItems.tires) {
                            case null:
                            case undefined:
                                break
                            default:
                                result.tireAccess = true;
                                break;
                        };
                    };
                    if (userItems[item].type === "vehicle") {
                        result.autoAccess = true;
                    };
                });

                return result;
            };

            const access = checkAccessToProducts();
            
            return {
                userProfile: userProfile,
                userItems: userItems,
                access: access,
            }
    } catch (error) {
        console.error(new Error(`Error in get first access. Error: ${JSON.stringify(error)}.`));
        throw error;
    }
};
