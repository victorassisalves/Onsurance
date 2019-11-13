"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../database/database");
const databaseMethods_1 = require("../model/databaseMethods");
const protection_1 = require("../model/protection");
const errors_1 = require("../model/errors");
const checkEqual = require('deep-equal');
exports.onsuranceProtection = variables => {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        const protection = (backup) => __awaiter(this, void 0, void 0, function* () {
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
                const protection = yield protection_1.protectionMethods(backup, variables);
                if (backup.lastProtection.closed) { // All protections are off. No open protection in log
                    console.log("TCL: Protection is OFF");
                    const initiateNewProtection = yield protection.initiateNewProtection();
                    console.log("TCL: initiateNewProtection", initiateNewProtection);
                    resolve(initiateNewProtection);
                }
                else { // Protection is ON, there is a open protection in Log
                    /*
                        TODO:
                        DONE:
                            Resolve response when we close and open another protection.√
                    */
                    const closeProtection = yield protection.closeProtection();
                    console.log("TCL: closeProtection", closeProtection);
                    resolve(closeProtection);
                }
            }
            catch (error) {
                // Restore data in case something goes wrong
                console.log("TCL: Error activating protection. Restoring backup.");
                console.error(new Error(error));
                console.error(new Error(`Error on activating protection for client ${variables.userEmail}. Error: ${error}`));
                yield backup.dbMethods.setDatabaseInfo(backup.userDbPath.child("personal"), backup.userProfile);
                yield backup.dbMethods.setDatabaseInfo(backup.itemDbPath.child("profile/protectionData"), backup.itemProfile);
                yield backup.dbMethods.setDatabaseInfo(backup.itemDbPath.child(`logUse/${backup.lastProtectionId}`), backup.lastProtection);
                yield backup.dbMethods.updateDatabaseInfo(backup.ownerDbPath.child("personal/wallet"), { switch: backup.ownerCredit });
                if (error.status)
                    reject(error);
                reject(errors_1.checkServerError());
            }
        });
        const doBackup = () => __awaiter(this, void 0, void 0, function* () {
            try {
                /*
                                    get DB methods
                                */
                const dbMethods = yield databaseMethods_1.databaseMethods();
                /*
                    Inside user profile
                        1 - Check if user profile exist
                        2 - check if user have done onboard
                        3 - check if user have itemInUse on profile
                        4 - check if user is owner of the item
                            4.5 - If not owner, check if have the authorization to use
                        5 - Check if owner have enought credit
                */
                const userDbPath = yield database_1.userProfileDbRefRoot(variables.userEmail);
                const userProfile = yield dbMethods.getDatabaseInfo(userDbPath.child("personal"));
                console.log("TCL: doBackup. -> userProfile", userProfile);
                // ERROR check for non existing UserProfile
                yield errors_1.checkUserProfile(userProfile, variables);
                // ERROR check for user onboard
                yield errors_1.checkOnboard(userProfile, variables);
                // Get item in use from user DB
                const itemDbId = yield database_1.getItemId(variables.itemInUse);
                console.log("TCL: doBackup -> itemDbId", itemDbId);
                const itemInUse = yield dbMethods.getDatabaseInfo(userDbPath.child(`items/${itemDbId}`));
                console.log("TCL: doBackup -> itemInUse", itemInUse);
                // ERROR check for ITEM IN USE
                yield errors_1.checkItemInUse(itemInUse, variables);
                // Check if client is item owner
                // tslint:disable-next-line: triple-equals
                const itemOwner = (variables.userEmail == itemInUse.owner) ? true : false;
                console.log(`TCL: User is owner of item?  ${itemOwner}. Owner: ${itemInUse.owner}`);
                let ownerCredit = 0;
                let ownerDbPath;
                // Check if User (Not item owner) have permission to access it.
                if (!itemOwner) {
                    const hasAccessToItem = yield dbMethods.getDatabaseInfo(userDbPath.child(`itemAuthorizations/thirdParty/${itemDbId}`));
                    console.log("TCL: hasAccessToItem", hasAccessToItem);
                    // ERROR check for item Access
                    yield errors_1.checkItemAccess(hasAccessToItem, variables);
                    // User have authorization, now check for owner credit
                    ownerDbPath = yield database_1.userProfileDbRefRoot(itemInUse.owner);
                    console.log("TCL: doBackup -> ownerDbPath", ownerDbPath);
                    ownerCredit = yield dbMethods.getDatabaseInfo(ownerDbPath.child("personal/wallet/switch"));
                    console.log(`TCL: User have authorization from ${itemInUse.owner}. Owner credits: ${ownerCredit}.`);
                    // ERROR check for owner Credit
                    yield errors_1.checkOwnerCredit(ownerCredit);
                }
                else {
                    yield errors_1.checkMessengerId(userProfile.messengerId, variables);
                    // ERROR check for credit in User wallet
                    yield errors_1.checkUserCredit(userProfile, variables);
                }
                ;
                /*
                    Inside item profile
                        1 - Check if item profile exist
                        2 - check if there is change in protection
                        3 - check if it is the first activation
                        4 - get last protection
                        5 - Call the protection function
                */
                const itemDbPath = yield database_1.itemProfileDbRef(itemInUse.itemId, itemInUse.type, itemInUse.innerType);
                const itemProfile = yield dbMethods.getDatabaseInfo(itemDbPath.child("profile/protectionData"));
                console.log("TCL: doBackup -> itemProfile", itemProfile);
                // ERROR check for non existing ItemProfile
                yield errors_1.checkItemProfile(itemProfile, variables);
                // Check if protection request is equal to server protection
                const checkProtectionEqual = checkEqual(variables.policies, itemProfile.protectionStatus);
                //    console.log("TCL: checkEqual (deep-equal)", checkProtectionEqual)
                // ERROR check for no diference in request and DB (protection status)
                if (checkProtectionEqual) {
                    // If protection is All OFF and request is all Off throw error
                    if (variables.statusProtection.allOff)
                        throw {
                            status: 304,
                            text: "Protection already OFF for all Policies.",
                            callback: 'noChangeAllOff',
                            variables: {
                                userEmail: variables.userEmail,
                                statusProtection: variables.statusProtection
                            }
                        };
                    // If protection is all ON and request is all ON throw error
                    if (variables.statusProtection.allOn)
                        throw {
                            status: 304,
                            text: "Protection already ON for all Policies.",
                            callback: 'noChangeAllOn',
                            variables: {
                                userEmail: variables.userEmail,
                                statusProtection: variables.statusProtection
                            }
                        };
                    // The same on DB and Request 
                    throw {
                        status: 304,
                        text: "Protection status not changed for all Policies.",
                        callback: 'noChange',
                        variables: {
                            userEmail: variables.userEmail,
                            statusProtection: variables.statusProtection
                        }
                    };
                }
                ;
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
                let lastProtection = yield dbMethods.getDatabaseInfo(itemDbPath.child("logUse").limitToLast(1));
                console.log("TCL: doBackup -> lastProtection", lastProtection);
                if (lastProtection === null) {
                    console.log("TCL: first time");
                    // First Time
                    lastProtection = [{
                            closed: true,
                        }];
                    lastProtectionArrayId = [0];
                    lastProtectionId = 0;
                    //    console.log("TCL: doBackup -> No lastProtection", lastProtection[`${lastProtectionId}`])
                }
                else {
                    // Not First time
                    lastProtectionArrayId = Object.keys(lastProtection);
                    lastProtectionId = lastProtectionArrayId[0];
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
                };
                return protection(backup);
            }
            catch (error) {
                if (error.status)
                    reject(error);
                reject(errors_1.checkBackupError(variables));
            }
        });
        return yield doBackup();
    }));
};
exports.changeVehicle = variables => {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const dbMethods = yield databaseMethods_1.databaseMethods();
            const userDbPath = yield database_1.userProfileDbRefRoot(variables.userEmail);
            const messengerId = yield dbMethods.getDatabaseInfo(userDbPath.child(`personal/messengerId`));
            console.log("TCL: messengerId", messengerId);
            yield errors_1.checkMessengerId(messengerId, variables);
            const userItemsList = yield dbMethods.getDatabaseInfo(userDbPath.child(`/items`));
            console.log("TCL: userItemsList", userItemsList);
            yield errors_1.checkItemList(userItemsList);
            const vehicles = Object.keys(userItemsList);
            console.log("TCL: vehicles length", vehicles.length);
            if (vehicles.length === 1) {
                const itemInUse = yield userItemsList[`${vehicles[0]}`];
                console.log("TCL: itemInUse", itemInUse);
                const itemDbPath = yield database_1.itemProfileDbRef(itemInUse.itemId, itemInUse.type, itemInUse.innerType);
                const itemProfile = yield dbMethods.getDatabaseInfo(itemDbPath.child("profile"));
                resolve({
                    status: 204,
                    text: `User only have vehicle ${vehicles[0]} in profile.`,
                    callback: 'onlyOneItemInProfile',
                    variables: {
                        itemProfile: itemProfile,
                        vehiclePlate: userItemsList[`${vehicles[0]}`].itemId
                    }
                });
            }
            ;
            let vehiclePlates = [];
            yield vehicles.forEach(element => {
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
        }
        catch (error) {
            console.error("TCL: error", error);
            if (error.status)
                reject(error);
            reject({
                status: 500,
                text: `Error getting items list on profile.`
            });
        }
        ;
    }));
};
exports.getVehicleInfo = variables => {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const dbMethods = yield databaseMethods_1.databaseMethods();
            const userDbPath = yield database_1.userProfileDbRefRoot(variables.userEmail);
            const messengerId = yield dbMethods.getDatabaseInfo(userDbPath.child(`personal/messengerId`));
            console.log("TCL: messengerId", messengerId);
            yield errors_1.checkMessengerId(messengerId, variables);
            // Get item in use from user DB
            const itemDbId = yield database_1.getItemId(variables.itemInUse);
            console.log("TCL: doBackup -> itemDbId", itemDbId);
            const itemInUse = yield dbMethods.getDatabaseInfo(userDbPath.child(`items/${itemDbId}`));
            console.log("TCL: doBackup -> itemInUse", itemInUse);
            // ERROR check for ITEM IN USE
            yield errors_1.checkItemInUse(itemInUse, variables);
            const itemDbPath = yield database_1.itemProfileDbRef(itemInUse.itemId, itemInUse.type, itemInUse.innerType);
            const itemProfile = yield dbMethods.getDatabaseInfo(itemDbPath.child("profile"));
            console.log("TCL: doBackup -> itemProfile", itemProfile);
            // ERROR check for non existing ItemProfile
            yield errors_1.checkItemProfile(itemProfile, variables);
            resolve({
                status: 200,
                text: `Item info ${itemProfile}`,
                callback: 'changeItemInfo',
                variables: {
                    itemProfile: itemProfile,
                }
            });
        }
        catch (error) {
            console.error("TCL: error", error);
            if (error.status)
                reject(error);
            reject({
                status: 500,
                text: `Error getting items list on profile.`
            });
        }
        ;
    }));
};
//# sourceMappingURL=protectionController.js.map