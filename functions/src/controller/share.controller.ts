import { userProfileDbRefRoot } from "../database/customer.database";
import { getItemId } from "../database/tire.database";
import { getUserId } from "../database/database";
import { getDatabaseInfo, updateDatabaseInfo, setDatabaseInfo } from "../model/databaseMethods";
import { checkUserAccessPermission, checkUserProfile } from "../model/errors";
import { PersonalUserProfileInterface, TireInUserProfileInterface } from "../interfaces/user.interfaces";
import { TireInUserProfile } from "../model/tires.model";
import { ShareOnsuranceTireVariables } from "../environment/messenger/messenger.variables";

/**
 * @description This function is responsible for sharing Onsurance tires with a third partie person.
 * @param variables Payload variables for the share Onsurance tires. Must come treated
 */
export const shareOnsuranceTires = async (variables: ShareOnsuranceTireVariables) => {
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

                // The third party don't have a profile
                if (backup.thirdPartyProfile === null || backup.thirdPartyProfile === undefined) {
                    const profile = {
                        onboard: true,
                        activationsCounter: 0,
                        wallet: {
                            switch: 0
                        },
                        // onboard: false,
                        userEmail: variables.thirdPartyEmail,
                    };
                    await updateDatabaseInfo(backup.thirdPartyDbPath.child(`personal`), profile)
                };

                // User don't have item in profile
                if (backup.checkThirdPartyItem === null || backup.checkThirdPartyItem === undefined) {
                    const item = backup.itemToAccess;
                    item.activationsCounter.accident = 0;
                    await updateDatabaseInfo(backup.thirdPartyDbPath.child(`items/tires/${backup.itemId}`), item);
                };

                // Set um owner db that third party user have access to item
                await updateDatabaseInfo(backup.ownerDbPath.child(`itemAuthorizations/myItems/tires/${backup.itemId}`), {
                    [backup.thirdPartyId] : true,
                });

                // Set um third party db that owner gave access to item
                await updateDatabaseInfo(backup.thirdPartyDbPath.child(`itemAuthorizations/thirdParty/tires`), {
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
                console.error(`Error  giving access to third party user ${variables.thirdPartyEmail}. Doing Backup Now.`)
                await setDatabaseInfo(backup.thirdPartyDbPath.child('personal'), backup.thirdPartyProfile)
                await setDatabaseInfo(backup.thirdPartyDbPath.child(`itemAuthorizations/thirdParty/tires/${backup.itemId}`), backup.checkItemAccess);
                await setDatabaseInfo(backup.thirdPartyDbPath.child(`items/tires/${backup.itemId}`), backup.checkThirdPartyItem);
                await setDatabaseInfo(backup.ownerDbPath.child(`itemAuthorizations/myItems/tires/${backup.itemId}`), backup.ownerItemAuthorizations)
                reject(error)
            }   
        }

        const doBackup = async () => {
            try {
                const ownerDbPath = await userProfileDbRefRoot(variables.userEmail)
                const thirdPartyDbPath = await userProfileDbRefRoot(variables.thirdPartyEmail)
                const itemId = await getItemId(variables.itemToAccess);
                const thirdPartyId = await getUserId(variables.thirdPartyEmail);
                
                if (variables.userEmail === variables.thirdPartyEmail){
                    throw {
                       status: 304, // Not modified
                       text: `User can't give access to himself.`,
                       callback: 'noAccessToSelf',
                       variables: {}
                   };
                }
                /*
                    TODO:
                        check if user have item in account and is owner of the item

                */
                
                const userProfile: PersonalUserProfileInterface = await getDatabaseInfo(ownerDbPath.child(`personal`));

                // Error check for owner account NOT exist
                checkUserProfile(userProfile, variables.userEmail);

                const ownerItemAuthorizations = await getDatabaseInfo(ownerDbPath.child(`itemAuthorizations/myItems/tires/${itemId}`))

                const itemToAccess: TireInUserProfile  = await getDatabaseInfo(ownerDbPath.child(`items/tires/${itemId}`));
                // ERROR Check for item NOT exists on user account
                if (itemToAccess === null || itemToAccess === undefined) throw {
                    status: 404, // Not Found
                    text: `User don't have item ${variables.itemToAccess} in account.`,
                    callback:  'noItemToGiveAccess',
                    variables: {
                        itemToAccess: variables.itemToAccess,
                    }
                };

                // ERROR Check for ownership of Item
                checkUserAccessPermission(variables, itemToAccess);

                const thirdPartyProfile = await getDatabaseInfo(thirdPartyDbPath.child(`personal`));
                
                const checkThirdPartyItem: TireInUserProfileInterface = await getDatabaseInfo(thirdPartyDbPath.child(`items/tires/${itemId}`));

                // ERROR Check: See if third party user have The requested item on profile
                const checkItemAccess: boolean = await getDatabaseInfo(thirdPartyDbPath.child(`itemAuthorizations/thirdParty/tires/${itemId}`))
                                
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
                };

                const backup = {
                    ownerItemAuthorizations: ownerItemAuthorizations,
                    thirdPartyProfile: thirdPartyProfile,
                    thirdPartyId: thirdPartyId,
                    itemToAccess: itemToAccess,
                    checkThirdPartyItem: checkThirdPartyItem,
                    checkItemAccess: checkItemAccess,
                    itemId: itemId,
                    ownerDbPath: ownerDbPath,
                    thirdPartyDbPath: thirdPartyDbPath,
                }
                
                return giveAccess(backup)  
            } catch (error) {
                console.log("TCL: doBackup -> error", error)
                return reject(error)
            }
        }

        await doBackup()
    });
};  