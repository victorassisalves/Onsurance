"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../database/database");
const databaseMethods_1 = require("../model/databaseMethods");
const errors_1 = require("../model/errors");
exports.giveAccessController = variables => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        const giveAccess = (backup) => __awaiter(void 0, void 0, void 0, function* () {
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
                    console.log("TCL: Third Party User don't have a profile. ", backup.thirdPartyProfile);
                    const profile = {
                        onboard: true,
                        activationsCounter: 0,
                        wallet: {
                            switch: 0
                        },
                        // onboard: false,
                        userEmail: variables.thirdPartyEmail,
                    };
                    yield backup.dbMethods.updateDatabaseInfo(backup.thirdPartyDbPath.child(`personal`), profile);
                }
                ;
                if (backup.checkThirdPartyItem === null || backup.checkThirdPartyItem === undefined) {
                    console.log("TCL: Third Party User don't have the item on its profile. ", backup.checkThirdPartyItem);
                    const item = backup.itemToAccess;
                    item.activationsCounter.accident = 0;
                    item.activationsCounter.theft = 0;
                    item.activationsCounter.thirdParty = 0;
                    console.log("TCL: item", item);
                    yield backup.dbMethods.updateDatabaseInfo(backup.thirdPartyDbPath.child(`items/${backup.itemId}`), item);
                }
                ;
                yield backup.dbMethods.updateDatabaseInfo(backup.ownerDbPath.child(`itemAuthorizations/myItems/${backup.itemId}`), {
                    [backup.thirdPartyId]: true,
                });
                console.log("TCL: owner updated.");
                yield backup.dbMethods.updateDatabaseInfo(backup.thirdPartyDbPath.child(`itemAuthorizations/thirdParty`), {
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
            }
            catch (error) {
                console.log(`Error  giving access to third party user ${variables.thirdPartyEmail}. Doing Backup Now.`);
                yield backup.dbMethods.setDatabaseInfo(backup.thirdPartyDbPath.child('personal'), backup.thirdPartyProfile);
                yield backup.dbMethods.setDatabaseInfo(backup.thirdPartyDbPath.child(`itemAuthorizations/thirdParty/${backup.itemId}`), backup.checkItemAccess);
                yield backup.dbMethods.setDatabaseInfo(backup.thirdPartyDbPath.child(`items/${backup.itemId}`), backup.checkThirdPartyItem);
                yield backup.dbMethods.setDatabaseInfo(backup.ownerDbPath.child(`itemAuthorizations/myItems/${backup.itemId}`), backup.ownerItemAuthorizations);
                reject(error);
            }
        });
        const doBackup = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const dbMethods = yield databaseMethods_1.databaseMethods();
                const ownerDbPath = yield database_1.userProfileDbRefRoot(variables.userEmail);
                const thirdPartyDbPath = yield database_1.userProfileDbRefRoot(variables.thirdPartyEmail);
                const itemId = yield database_1.getItemId(variables.itemToAccess);
                const thirdPartyId = yield database_1.getUserId(variables.thirdPartyEmail);
                console.log("TCL: doBackup -> thirdPartyId", thirdPartyId);
                console.log("TCL: doBackup -> itemId", itemId);
                /*
                    TODO:
                        check if user have item in account and is owner of the item

                */
                const ownerProfileEmail = yield dbMethods.getDatabaseInfo(ownerDbPath.child(`personal/userEmail`));
                console.log("TCL: doBackup -> ownerProfileEmail", ownerProfileEmail);
                // Error check for owner account NOT exist
                if (ownerProfileEmail === null || ownerProfileEmail === undefined)
                    throw {
                        status: 404,
                        text: `User ${variables.userEmail} don't exist.`,
                        callback: 'noUserProfile',
                        variables: {
                            userEmail: variables.userEmail
                        }
                    };
                const ownerItemAuthorizations = yield dbMethods.getDatabaseInfo(ownerDbPath.child(`itemAuthorizations/myItems/${itemId}`));
                console.log("TCL: doBackup -> ownerItemAuthorizations", ownerItemAuthorizations);
                if (ownerItemAuthorizations !== null || ownerItemAuthorizations === undefined) {
                    console.log("TCL: doBackup -> ownerItemAuthorizations thirdParty", ownerItemAuthorizations[thirdPartyId]);
                }
                const itemToAccess = yield dbMethods.getDatabaseInfo(ownerDbPath.child(`items/${itemId}`));
                console.log("TCL: doBackup -> itemToAccess", itemToAccess);
                // ERROR Check for item NOT exists on user account
                if (itemToAccess === null || itemToAccess === undefined)
                    throw {
                        status: 404,
                        text: `User don't have item ${variables.itemToAccess} in account.`,
                        callback: 'noItemToGiveAccess',
                        variables: {
                            itemInUse: variables.itemToAccess,
                        }
                    };
                // ERROR Check for ownership of Item
                yield errors_1.checkUserAccessPermission(variables, itemToAccess);
                if (variables.userEmail === variables.thirdPartyEmail) {
                    throw {
                        status: 304,
                        text: `User can't give access to himself.`,
                        callback: 'noAccessToSelf',
                        variables: {}
                    };
                }
                const checkThirdPartyItem = yield dbMethods.getDatabaseInfo(thirdPartyDbPath.child(`items/${itemId}`));
                console.log("TCL: doBackup -> checkThirdPartyItem", checkThirdPartyItem);
                // ERROR Check: See if third party user have The requested item on profile
                const checkItemAccess = yield dbMethods.getDatabaseInfo(thirdPartyDbPath.child(`itemAuthorizations/thirdParty/${itemId}`));
                console.log("TCL: doBackup -> checkItemAccess", checkItemAccess);
                // tslint:disable-next-line: triple-equals
                if (checkThirdPartyItem !== null && checkThirdPartyItem.itemId == variables.itemToAccess && checkItemAccess !== null) {
                    if (checkItemAccess && ownerItemAuthorizations[thirdPartyId])
                        throw {
                            status: 202,
                            text: `User ${variables.thirdPartyEmail} already have access to item ${variables.itemToAccess}.`,
                            callback: 'userAlreadyHavePermission',
                            variables: {
                                thirdPartyEmail: variables.thirdPartyEmail,
                                itemToAccess: variables.itemToAccess
                            }
                        };
                    // Error check for system inconsistencies
                    if (!checkItemAccess && ownerItemAuthorizations[thirdPartyId]) {
                        console.error(new Error(`Third Party user don't have item access but owner gave access to item.`));
                    }
                    else if (checkItemAccess && !ownerItemAuthorizations[thirdPartyId]) {
                        console.error(new Error(`Third Party user have item access but owner didn't gave access to item.`));
                    }
                }
                ;
                const thirdPartyProfile = yield dbMethods.getDatabaseInfo(thirdPartyDbPath.child(`personal`));
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
                };
                return giveAccess(backup);
            }
            catch (error) {
                console.log("TCL: doBackup -> error", error);
                reject(error);
            }
        });
        yield doBackup();
    }));
};
//# sourceMappingURL=giveAccessController.js.map