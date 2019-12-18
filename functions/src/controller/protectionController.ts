import { userProfileDbRefRoot, itemProfileDbRef, getItemId } from "../database/database"
import { databaseMethods } from "../model/databaseMethods";
import { protectionMethods } from "../model/protection";
import { checkUserProfile, checkOnboard, checkItemInUse, checkItemProfile, checkMessengerId, checkUserCredit, checkOwnerCredit, checkItemAccess, checkBackupError, checkServerError, checkItemList } from "../model/errors";
const checkEqual = require('deep-equal');


export const onsuranceProtection = variables => {
    return new Promise(async (resolve, reject) => {
        const protection = async backup => {
            try {
                /*
                    TODO: 
                    DONE:
                        get all info from backup √
                        check if the data is ok.  √
                        check if client has enought switch √
                        check what operation client want to make (what on and what off) √
                        check if its first time activating √
                        send message informing what protection is off and what os ON √
                */

                const protection = await protectionMethods(backup, variables)

                if (backup.lastProtection.closed) { // All protections are off. No open protection in log
                    console.log("TCL: Protection is OFF");
                    const initiateNewProtection = await protection.initiateNewProtection();

                    console.log("TCL: initiateNewProtection", initiateNewProtection)
                    resolve(initiateNewProtection)

                } else { // Protection is ON, there is a open protection in Log
                    /*
                        TODO: 
                        DONE:
                            Resolve response when we close and open another protection.√
                    */

                    const closeProtection = await protection.closeProtection();

                    console.log("TCL: closeProtection", closeProtection);
                    resolve(closeProtection)
                }

            } catch (error) {
                // Restore data in case something goes wrong
                console.log("TCL: Error activating protection. Restoring backup.");
                console.error(new Error(error));
                console.error(new Error(`Error on activating protection for client ${variables.userEmail}. Error: ${error}`));
                await backup.dbMethods.setDatabaseInfo(backup.userDbPath.child("personal"), backup.userProfile);
                await backup.dbMethods.setDatabaseInfo(backup.itemDbPath.child("profile/protectionData"), backup.itemProfile);
                await backup.dbMethods.setDatabaseInfo(backup.itemDbPath.child(`logUse/${backup.lastProtectionId}`), backup.lastProtection);
                await backup.dbMethods.updateDatabaseInfo(backup.ownerDbPath.child("personal/wallet"), { switch: backup.ownerCredit });

                if (error.status) reject(error)
                reject(checkServerError());
            }
        }

        const doBackup = async () => { // BACKUP
            try {
                /* 
                                    get DB methods
                                */
                const dbMethods = await databaseMethods();

                /*
                    Inside user profile
                        1 - Check if user profile exist
                        2 - check if user have done onboard
                        3 - check if user have itemInUse on profile
                        4 - check if user is owner of the item
                            4.5 - If not owner, check if have the authorization to use
                        5 - Check if owner have enought credit
                */
                const userDbPath = await userProfileDbRefRoot(variables.userEmail);
                const userProfile = await dbMethods.getDatabaseInfo(userDbPath.child("personal"));
                console.log("TCL: doBackup. -> userProfile", userProfile);

                // ERROR check for non existing UserProfile
                checkUserProfile(userProfile, variables)

                // ERROR check for user onboard
                checkOnboard(userProfile, variables);

                // Get item in use from user DB
                const itemDbId = await getItemId(variables.itemInUse);
                console.log("TCL: doBackup -> itemDbId", itemDbId)
                const itemInUse = await dbMethods.getDatabaseInfo(userDbPath.child(`items/${itemDbId}`));
                console.log("TCL: doBackup -> itemInUse", itemInUse);

                // ERROR check for ITEM IN USE
                checkItemInUse(itemInUse, variables);

                // Check if client is item owner
                // tslint:disable-next-line: triple-equals
                const itemOwner = (variables.userEmail == itemInUse.owner) ? true : false
                console.log(`TCL: User is owner of item?  ${itemOwner}. Owner: ${itemInUse.owner}`)
                let ownerCredit = 0;
                let ownerDbPath;

                // Check if User (Not item owner) have permission to access it.
                if (!itemOwner) {
                    const hasAccessToItem = await dbMethods.getDatabaseInfo(userDbPath.child(`itemAuthorizations/thirdParty/${itemDbId}`))
                    console.log("TCL: hasAccessToItem", hasAccessToItem)
                    // ERROR check for item Access
                    checkItemAccess(hasAccessToItem, variables)

                    // User have authorization, now check for owner credit
                    ownerDbPath = await userProfileDbRefRoot(itemInUse.owner);
                    console.log("TCL: doBackup -> ownerDbPath", ownerDbPath)
                    ownerCredit = await dbMethods.getDatabaseInfo(ownerDbPath.child("personal/wallet/switch"));

                    console.log(`TCL: User have authorization from ${itemInUse.owner}. Owner credits: ${ownerCredit}.`)
                    // ERROR check for owner Credit
                    checkOwnerCredit(ownerCredit)
                } else {
                    await checkMessengerId(userProfile.messengerId, variables)
                    // ERROR check for credit in User wallet
                    checkUserCredit(userProfile, variables)
                };


                /*
                    Inside item profile
                        1 - Check if item profile exist
                        2 - check if there is change in protection
                        3 - check if it is the first activation
                        4 - get last protection
                        5 - Call the protection function
                */
                const itemDbPath = await itemProfileDbRef(itemInUse.itemId, itemInUse.type, itemInUse.innerType);
                const itemProfile = await dbMethods.getDatabaseInfo(itemDbPath.child("profile/protectionData"));
                console.log("TCL: doBackup -> itemProfile", itemProfile)
                // ERROR check for non existing ItemProfile
                checkItemProfile(itemProfile, variables)

                // Check if protection request is equal to server protection
                const checkProtectionEqual = checkEqual(variables.policies, itemProfile.protectionStatus)
                //    console.log("TCL: checkEqual (deep-equal)", checkProtectionEqual)
                // ERROR check for no diference in request and DB (protection status)
                if (checkProtectionEqual) {
                    // If protection is All OFF and request is all Off throw error
                    if (variables.statusProtection.allOff) throw {
                        status: 304, //Not modified
                        text: "Protection already OFF for all Policies.",
                        callback: 'noChangeAllOff',
                        variables: {
                            userEmail: variables.userEmail,
                            statusProtection: variables.statusProtection
                        }
                    };

                    // If protection is all ON and request is all ON throw error
                    if (variables.statusProtection.allOn) throw {
                        status: 304, // Not modified
                        text: "Protection already ON for all Policies.",
                        callback: 'noChangeAllOn',
                        variables: {
                            userEmail: variables.userEmail,
                            statusProtection: variables.statusProtection
                        }
                    };
                    // The same on DB and Request 
                    throw {
                        status: 304, // Not modified
                        text: "Protection status not changed for all Policies.",
                        callback: 'noChange',
                        variables: {
                            userEmail: variables.userEmail,
                            statusProtection: variables.statusProtection
                        }
                    };
                };


                /*
                    LOG USE
                    TODO:
    
                    DONE: 
                        Get the last protection use from log
                        Check if the log exist - for first activation check
    
                */
                let lastProtectionArrayId;
                let lastProtectionId;

                // get last protection data from Log
                let lastProtection = await dbMethods.getDatabaseInfo(itemDbPath.child("logUse").limitToLast(1))
                console.log("TCL: doBackup -> lastProtection", lastProtection)
                if (lastProtection === null) {
                    console.log("TCL: first time")
                    // First Time
                    lastProtection = [{
                        closed: true,
                    }];
                    lastProtectionArrayId = [0]
                    lastProtectionId = 0
                    //    console.log("TCL: doBackup -> No lastProtection", lastProtection[`${lastProtectionId}`])
                } else {
                    // Not First time
                    lastProtectionArrayId = Object.keys(lastProtection)
                    lastProtectionId = lastProtectionArrayId[0]
                    //   console.log("TCL: doBackup -> lastProtection obj", lastProtection[`${lastProtectionId}`])               
                }

                const backup = {
                    userProfile: userProfile,
                    userDbPath: userDbPath,
                    itemInUse: itemInUse,
                    itemProfile: itemProfile,
                    itemDbPath: itemDbPath,
                    lastProtectionId: lastProtectionId,
                    lastProtection: lastProtection[`${lastProtectionId}`],
                    itemOwner: itemOwner,
                    ownerCredit: ownerCredit,
                    ownerDbPath: ownerDbPath,
                    dbMethods: dbMethods,
                }
                return protection(backup)
            } catch (error) {

                if (error.status) reject(error)

                reject(checkBackupError(variables));
            }
        }
        return await doBackup()
    })
};

export const changeVehicle = variables => {
    return new Promise(async (resolve, reject) => {
        try {
            const dbMethods = await databaseMethods();
            const userDbPath = await userProfileDbRefRoot(variables.userEmail);

            const messengerId = await dbMethods.getDatabaseInfo(userDbPath.child(`personal/messengerId`));
            console.log("TCL: messengerId", messengerId);
            await checkMessengerId(messengerId, variables);

            const userItemsList = await dbMethods.getDatabaseInfo(userDbPath.child(`/items`));
            console.log("TCL: userItemsList", userItemsList)
            checkItemList(userItemsList);

            const vehicles = Object.keys(userItemsList);
            console.log("TCL: vehicles length", vehicles.length)

            if (vehicles.length === 1) {
                const itemInUse = await userItemsList[`${vehicles[0]}`];
                console.log("TCL: itemInUse", itemInUse)
                const itemDbPath = await itemProfileDbRef(itemInUse.itemId, itemInUse.type, itemInUse.innerType);
                const itemProfile = await dbMethods.getDatabaseInfo(itemDbPath.child("profile"));
                resolve({
                    status: 204, // No content
                    text: `User only have vehicle ${vehicles[0]} in profile.`,
                    callback: 'onlyOneItemInProfile',
                    variables: {
                        itemProfile: itemProfile,
                        vehiclePlate: userItemsList[`${vehicles[0]}`].itemId
                    }
                })
            };

            let vehiclePlates = [];
            vehicles.forEach(element => {
                console.log("TCL: element", element);
                console.log("TCL: element id", userItemsList[`${element}`].itemId);
                vehiclePlates.push(userItemsList[`${element}`].itemId);
            });

            console.log("TCL: vehiclePlates", vehiclePlates);

            resolve({
                status: 200,
                text: `Items to change ${vehiclePlates}`,
                callback: 'changeItem',
                variables: {
                    vehiclePlates: vehiclePlates,
                }
            });
        } catch (error) {
            console.error("TCL: error", error)
            if (error.status) reject(error)
            reject({
                status: 500, // server error
                text: `Error getting items list on profile.`
            });
        };
    });
};


export const getVehicleInfo = variables => {
    return new Promise(async (resolve, reject) => {
        try {
            const dbMethods = await databaseMethods();
            const userDbPath = await userProfileDbRefRoot(variables.userEmail);

            const messengerId = await dbMethods.getDatabaseInfo(userDbPath.child(`personal/messengerId`));
            console.log("TCL: messengerId", messengerId);
            await checkMessengerId(messengerId, variables);

            // Get item in use from user DB
            const itemDbId = await getItemId(variables.itemInUse);
            console.log("TCL: doBackup -> itemDbId", itemDbId)
            const itemInUse = await dbMethods.getDatabaseInfo(userDbPath.child(`items/${itemDbId}`));
            console.log("TCL: doBackup -> itemInUse", itemInUse);

            // ERROR check for ITEM IN USE
            checkItemInUse(itemInUse, variables);

            const itemDbPath = await itemProfileDbRef(itemInUse.itemId, itemInUse.type, itemInUse.innerType);
            const itemProfile = await dbMethods.getDatabaseInfo(itemDbPath.child("profile"));
            console.log("TCL: doBackup -> itemProfile", itemProfile)
            // ERROR check for non existing ItemProfile
            checkItemProfile(itemProfile, variables)

            resolve({
                status: 200,
                text: `Item info ${itemProfile}`,
                callback: 'changeItemInfo',
                variables: {
                    itemProfile: itemProfile,
                }
            });
        } catch (error) {
            console.error("TCL: error", error)
            if (error.status) reject(error)
            reject({
                status: 500, // server error
                text: `Error getting items list on profile.`
            });
        };
    });
};