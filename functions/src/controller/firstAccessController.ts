import { userProfileDbRefRoot, getItemId, itemProfileDbRef } from "../database/database";
import { databaseMethods } from "../model/databaseMethods";
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
                    firstName: variables.firstName,
                    lastName: variables.lastName, 
                    messengerId: variables.messengerId
                };

                await backup.dbMethods.updateDatabaseInfo(backup.userDbPath.child('personal'), profile)

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
                await checkItemProfile(itemProfile, variables)

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
