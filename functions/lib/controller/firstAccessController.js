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
    console.log("TCL: variables", variables);
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        const firstAccess = (backup) => __awaiter(this, void 0, void 0, function* () {
            try {
                /*
                    TODO:


                */
                const profile = {
                    firstName: variables.firstName,
                    lastName: variables.lastName,
                    messengerId: variables.messengerId
                };
                yield backup.dbMethods.updateDatabaseInfo(backup.userDbPath.child('personal'), profile);
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
            }
            catch (error) {
                console.log(`Error in first access for user ${variables.userEmail}. Doing Backup Now.`);
                yield backup.dbMethods.setDatabaseInfo(backup.userDbPath.child('personal'), backup.userProfile);
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
                const itemInUse = yield dbMethods.getDatabaseInfo(userDbPath.child(`items/${itemId}`));
                console.log("TCL: doBackup -> itemInUse", itemInUse);
                yield errors_1.checkItemInUse(itemInUse, variables);
                const itemDbPath = yield database_1.itemProfileDbRef(itemInUse.itemId, itemInUse.type, itemInUse.innerType);
                const itemProfile = yield dbMethods.getDatabaseInfo(itemDbPath.child("profile"));
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
                console.log("TCL: doBackup -> backup", backup);
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
//# sourceMappingURL=firstAccessController.js.map