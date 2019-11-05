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
const errors_1 = require("../model/errors");
exports.doFirstAccess = variables => {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        const firstAccess = (backup) => __awaiter(this, void 0, void 0, function* () {
            try {
                /*
                    TODO:


                */
                const profile = {
                    firstName: variables.firstName,
                    lastName: variables.lastName,
                };
                yield backup.dbMethods.updateDatabaseInfo(backup.userDbPath.child('personal'), profile);
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
                console.log(`Error in first access for user ${variables.userEmail}. Doing Backup Now.`);
                yield backup.dbMethods.setDatabaseInfo(backup.thirdPartyDbPath.child('personal'), backup.userProfile);
                reject(error);
            }
        });
        const doBackup = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const dbMethods = yield databaseMethods_1.databaseMethods();
                const userDbPath = yield database_1.userProfileDbRefRoot(variables.userEmail);
                const itemId = yield database_1.getItemId(variables.itemInUse);
                /*
                    TODO:
                        check if user have item in account and is owner of the item

                */
                const userProfile = yield dbMethods.getDatabaseInfo(userDbPath.child(`personal`));
                console.log("TCL: doBackup -> userProfile", userProfile);
                // ERROR check for owner account NOT exist
                yield errors_1.checkUserProfile(userProfile, variables);
                // ERROR check for onboard made
                yield errors_1.checkOnboard(userProfile, variables);
                // ERROR check for client ID (Woocommerce)
                yield errors_1.checkClientId(userProfile, variables);
                // ERROR check for wallet and wallet amount
                yield errors_1.checkUserWallet(userProfile, variables);
                const itemInUse = yield dbMethods.getDatabaseInfo(userProfile.child(`items/${itemId}`));
                console.log("TCL: doBackup -> itemInUse", itemInUse);
                yield errors_1.checkItemInUse(itemInUse, variables);
                const itemDbPath = yield database_1.itemProfileDbRef(itemInUse.itemId, itemInUse.type, itemInUse.innerType);
                const itemProfile = yield dbMethods.getDatabaseInfo(itemDbPath.child("profile/protectionData"));
                console.log("TCL: doBackup -> itemProfile", itemProfile);
                // ERROR check for non existing ItemProfile
                yield errors_1.checkItemProfile(itemProfile, variables);
                const backup = {
                    userProfile: userProfile,
                    itemProfile: itemProfile,
                    itemInUse: itemInUse,
                    itemId: itemId,
                    dbMethods: dbMethods,
                    userDbPath: userDbPath,
                };
                return firstAccess(backup);
            }
            catch (error) {
                console.log("TCL: doBackup -> error", error);
                reject(error);
            }
        });
        yield doBackup();
    }));
};
//# sourceMappingURL=firstAccess.js.map