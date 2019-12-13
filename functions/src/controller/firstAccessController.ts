import { getItemId, itemProfileDbRef } from "../database/database";
import { userProfileDbRefRoot } from "../database/customer.database";
import { databaseMethods, getDatabaseInfo } from "../model/databaseMethods";
import { checkUserProfile, checkItemInUse, checkOnboard, checkClientId, checkUserWallet, checkItemProfile, checkItemList } from "../model/errors";
import { TestAccessToItem } from "../test/itemAccess.test";
import { ItemAuthorizations} from "../interfaces/user.interfaces";
interface ItemAuth {
    thirdParty: {
        itemId: boolean
    },
    myItems: {
        itemId: {
            userId: boolean
        }
    }
}


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


/**
 * 
 * @param variables 
 * @todo Check item access to see if user.
 */
export const getfirstAccess = async (variables) => {
        // DO BACKUP
            const userDbPath = await userProfileDbRefRoot(variables.userEmail);
            
            const userProfileFull = await getDatabaseInfo(userDbPath);
            // ERROR check for owner account NOT exist
            checkUserProfile(userProfileFull, variables.userEmail)
            
            const userProfile = userProfileFull.personal;
            // ERROR check for onboard made
            checkOnboard(userProfile, variables);

            const userItems = userProfileFull.items;
            // Check if user have items on profile
            checkItemList(userItems);

            // ERROR check for client ID (Woocommerce)
            checkClientId(userProfile, variables);

            // ERROR check for wallet and wallet amount
            checkUserWallet(userProfile, variables);

            const itemAuth: ItemAuthorizations = userProfileFull.itemAuthorizations;            

            const checkAccessToProducts = () => {
                // First we need to check vehicles PRON
                const result = {
                    autoAccess: false,
                    tireAccess: false,
                };

                const itemsUser = Object.keys(userItems);

                const autoAccess = []
                const tireAccess = []
                
                itemsUser.forEach(item => {
                    // Inside tires in items 
                    switch (item) {
                        case "tires": {
                            const tires = Object.keys(userItems.tires);
                            tires.forEach(tire => {
                                const testTireAccess = new TestAccessToItem(variables, userItems.tires[tire], itemAuth);
                                const owner = testTireAccess.checkOwnership()
                                if (!owner) {
                                    const thirdParty = testTireAccess.checkThirdPartyAccess()
                                    tireAccess.push(thirdParty);
                                } else {
                                    tireAccess.push(owner);
                                }
                            });
                            const access =  tireAccess.some((value) => {
                                return value === true;
                            })
                            return result.tireAccess = access;
                        };
                        
                        default: {
                            const testAccessAuto = new TestAccessToItem(variables, userItems[item], itemAuth)
                            const owner = testAccessAuto.checkOwnership();
                            if (!owner) {
                                const thirdParty = testAccessAuto.checkThirdPartyAccess()
                                autoAccess.push(thirdParty);
                            } else {
                                autoAccess.push(owner);
                            }
                            const access =  autoAccess.some((value) => {
                                return value === true;
                            })
                            return result.autoAccess = access;
                        }
                                
                    }
                });

                return result;
            };

            const access = checkAccessToProducts();
            if (!access.autoAccess && !access.tireAccess){
                throw {
                    errorType: "No item access",
                    callback: 'noAccessToItems',
                    variables: {}
                }
            }
            return {
                userProfile: userProfile,
                userItems: userItems,
                access: access,
            }
};
