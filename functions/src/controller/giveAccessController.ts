import { userProfileDbRefRoot, getItemId, getUserId } from "../database/database";
import { databaseMethods } from "../model/databaseMethods";
import {checkUserAccessPermission } from "../model/errors";


export const giveAccessController = variables => {
    return new Promise(async (resolve, reject) => {
        const giveAccess = async backup => {
            try {
                /*
                    TODO: 
                        check if third party user have a profile
                            create preProfile
                        check if third party user have the item on his/her profile
                            crete item on item path
                        register item access to owner
                        give item access to user 



                */

                if (backup.thirdPartyProfile === null || backup.thirdPartyProfile === undefined) {
                    console.log("TCL: Third Party User don't have a profile. ", backup.thirdPartyProfile)
                    const profile = {
                        onboard: true,
                        activationsCounter: 0,
                        wallet: {
                            switch: 0
                        },
                        // onboard: false,
                        userEmail: variables.thirdPartyEmail,
                    };
                    await backup.dbMethods.updateDatabaseInfo(backup.thirdPartyDbPath.child(`personal`), profile)
                };

                if (backup.checkThirdPartyItem === null || backup.checkThirdPartyItem === undefined) {
                    console.log("TCL: Third Party User don't have the item on its profile. ", backup.checkThirdPartyItem);
                    const item = backup.itemToAccess;
                    item.activationsCounter.accident = 0;
                    item.activationsCounter.theft = 0;
                    item.activationsCounter.thirdParty = 0;
                    console.log("TCL: item", item)
                    
                    await backup.dbMethods.updateDatabaseInfo(backup.thirdPartyDbPath.child(`items/${backup.itemId}`), item);
                };

                await backup.dbMethods.updateDatabaseInfo(backup.ownerDbPath.child(`itemAuthorizations/myItems/${backup.itemId}`), {
                    [backup.thirdPartyId] : true,
                });
                console.log("TCL: owner updated.")
                await backup.dbMethods.updateDatabaseInfo(backup.thirdPartyDbPath.child(`itemAuthorizations/thirdParty`), {
                    [backup.itemId]: true,
                });

                resolve({
                    status: 200,
                    text: `Access granted. User ${variables.thirdPartyEmail} can now use protection on item ${variables.itemToAccess}.`,
                    callback: 'giveAccessMessenger',
                    variables: {
                        thirdPartyEmail: variables.thirdPartyEmail
                    }
                });
            } catch (error) {
                console.log(`Error  giving access to third party user ${variables.thirdPartyEmail}. Doing Backup Now.`)
                await backup.dbMethods.setDatabaseInfo(backup.thirdPartyDbPath.child('personal'), backup.thirdPartyProfile)
                await backup.dbMethods.setDatabaseInfo(backup.thirdPartyDbPath.child(`itemAuthorizations/thirdParty/${backup.itemId}`), backup.checkItemAccess);
                await backup.dbMethods.setDatabaseInfo(backup.thirdPartyDbPath.child(`items/${backup.itemId}`), backup.checkThirdPartyItem);
                await backup.dbMethods.setDatabaseInfo(backup.ownerDbPath.child(`itemAuthorizations/myItems/${backup.itemId}`), backup.ownerItemAuthorizations)
                reject(error)
            }   
        }

        const doBackup = async () => {
            try {
                const dbMethods = await databaseMethods();
                const ownerDbPath = await userProfileDbRefRoot(variables.userEmail)
                const thirdPartyDbPath = await userProfileDbRefRoot(variables.thirdPartyEmail)
                const itemId = await getItemId(variables.itemToAccess);
                const thirdPartyId = await getUserId(variables.thirdPartyEmail);
                console.log("TCL: doBackup -> thirdPartyId", thirdPartyId)
                console.log("TCL: doBackup -> itemId", itemId)
                
                /*
                    TODO:
                        check if user have item in account and is owner of the item

                */

                
                const ownerProfileEmail = await dbMethods.getDatabaseInfo(ownerDbPath.child(`personal/userEmail`));
                console.log("TCL: doBackup -> ownerProfileEmail", ownerProfileEmail)
                // Error check for owner account NOT exist
                if (ownerProfileEmail === null || ownerProfileEmail === undefined) throw {
                    status: 404, // Not Found
                    text: `User ${variables.userEmail} don't exist.`,
                    callback: 'noUserProfile',
                    variables: {
                        userEmail: variables.userEmail
                    }
                };

                const ownerItemAuthorizations = await dbMethods.getDatabaseInfo(ownerDbPath.child(`itemAuthorizations/myItems/${itemId}`))
                console.log("TCL: doBackup -> ownerItemAuthorizations", ownerItemAuthorizations);
                if (ownerItemAuthorizations !== null || ownerItemAuthorizations === undefined) {
                    console.log("TCL: doBackup -> ownerItemAuthorizations thirdParty", ownerItemAuthorizations[thirdPartyId]);
                }

                const itemToAccess = await dbMethods.getDatabaseInfo(ownerDbPath.child(`items/${itemId}`));
                console.log("TCL: doBackup -> itemToAccess", itemToAccess);
                // ERROR Check for item NOT exists on user account
                if (itemToAccess === null || itemToAccess === undefined) throw {
                    status: 404, // Not Found
                    text: `User don't have item ${variables.itemToAccess} in account.`,
                    callback:  'noItemToGiveAccess',
                    variables: {
                        itemInUse: variables.itemToAccess,
                    }
                };

                // ERROR Check for ownership of Item
                await checkUserAccessPermission(variables, itemToAccess);

                if (variables.userEmail === variables.thirdPartyEmail){
                    throw {
                       status: 304, // Not modified
                       text: `User can't give access to himself.`,
                       callback: 'noAccessToSelf',
                       variables: {}
                   };
                }
                
                const checkThirdPartyItem = await dbMethods.getDatabaseInfo(thirdPartyDbPath.child(`items/${itemId}`));
                console.log("TCL: doBackup -> checkThirdPartyItem", checkThirdPartyItem);

                // ERROR Check: See if third party user have The requested item on profile
                const checkItemAccess = await dbMethods.getDatabaseInfo(thirdPartyDbPath.child(`itemAuthorizations/thirdParty/${itemId}`))
                console.log("TCL: doBackup -> checkItemAccess", checkItemAccess)
                
                // tslint:disable-next-line: triple-equals
                if (checkThirdPartyItem !== null && checkThirdPartyItem.itemId == variables.itemToAccess && checkItemAccess !== null) {
                    if (checkItemAccess && ownerItemAuthorizations[thirdPartyId]) throw {
                        status: 202, // Accepted but no action taken 
                        text: `User ${variables.thirdPartyEmail} already have access to item ${variables.itemToAccess}.`,
                        callback: 'userAlreadyHavePermission',
                        variables: {
                            thirdPartyEmail: variables.thirdPartyEmail,
                            itemToAccess: variables.itemToAccess
                        }
                    };

                    // Error check for system inconsistencies
                    if (!checkItemAccess && ownerItemAuthorizations[thirdPartyId]){
                        console.error(new Error(`Third Party user don't have item access but owner gave access to item.`))
                    }  else if (checkItemAccess && !ownerItemAuthorizations[thirdPartyId])  {
                        console.error(new Error(`Third Party user have item access but owner didn't gave access to item.`))
                    } 
                };

                const thirdPartyProfile = await dbMethods.getDatabaseInfo(thirdPartyDbPath.child(`personal`));
                console.log("TCL: doBackup -> thirdPartyProfile", thirdPartyProfile);

                // if (thirdPartyProfile === null || thirdPartyProfile === undefined) throw {
                //     status: 204, // No content
                //     text: `User ${variables.thirdPartyEmail} don't have an account.`
                // };

                const backup = {
                    ownerItemAuthorizations: ownerItemAuthorizations,
                    thirdPartyProfile: thirdPartyProfile,
                    thirdPartyId: thirdPartyId,
                    itemToAccess: itemToAccess,
                    checkThirdPartyItem: checkThirdPartyItem,
                    checkItemAccess: checkItemAccess,
                    itemId: itemId,
                    dbMethods: dbMethods,
                    ownerDbPath: ownerDbPath,
                    thirdPartyDbPath: thirdPartyDbPath,
                }
                
                
                return giveAccess(backup)  
            } catch (error) {
                console.log("TCL: doBackup -> error", error)
                reject(error)
            }
        }

        await doBackup()
    });
    
};
