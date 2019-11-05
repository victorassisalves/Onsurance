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
const messenger_1 = require("../environment/messenger");
exports.saveIndication = variables => {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        const indication = (backup) => __awaiter(this, void 0, void 0, function* () {
            try {
                /*
                    TODO:


                */
                yield backup.dbMethods.updateDatabaseInfo(backup.indicatedDbPath, {
                    indicator: variables.indicatorEmail
                });
                yield backup.dbMethods.pushDatabaseInfo(backup.indicatorDbPath.child(`indicated`), {
                    user: variables.userEmail
                });
                const broadcastVariables = {
                    text: `😃 Deu certo ${backup.indicatorProfile.firstName}. Seu indicado acabou de acessar o Onsurance graças a sua indicação! Quando ${variables.firstName} ${variables.lastName} comprar créditos iniciais você ganhará 200h de seguro como cortesia nossa. 🤩 😉💰`,
                    messageTag: 'COMMUNITY_ALERT',
                    messengerId: backup.indicatorProfile.messengerId
                };
                console.log("TCL: broadcastVariables", broadcastVariables);
                messenger_1.sendMessage(broadcastVariables);
                resolve({
                    status: 200,
                    text: `Indication process done.`,
                    callback: 'indicationDone',
                    variables: {
                        userEmail: variables.userEmail,
                        indicator: variables.indicatorEmail,
                        indicatorProfile: backup.indicatorProfile
                    }
                });
            }
            catch (error) {
                console.log(`Error doing indication for ${variables.userEmail}. Doing Backup Now.`);
                yield backup.dbMethods.setDatabaseInfo(backup.indicatedDbPath, backup.indicatedProfile);
                yield backup.dbMethods.setDatabaseInfo(backup.indicatorDbPath, backup.indicatorProfile);
                if (error.status) {
                    reject(error);
                }
                else {
                    reject(errors_1.checkServerError());
                }
            }
        });
        const doBackup = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const dbMethods = yield databaseMethods_1.databaseMethods();
                //INDICATOR
                const indicatorDbPath = yield database_1.indicationDbRefRoot(variables.indicatorEmail);
                const indicatorProfile = yield dbMethods.getDatabaseInfo(indicatorDbPath);
                console.log("TCL: doBackup -> indicatorProfile", indicatorProfile);
                // INDICATED
                const indicatedDbPath = yield database_1.indicationDbRefRoot(variables.userEmail);
                const indicatedProfile = yield dbMethods.getDatabaseInfo(indicatedDbPath);
                console.log("TCL: doBackup -> indicatedProfile", indicatedProfile);
                if (indicatedProfile !== null) {
                    yield errors_1.checkForIndicator(indicatedProfile, variables);
                }
                const backup = {
                    indicatorProfile: indicatorProfile,
                    indicatorDbPath: indicatorDbPath,
                    indicatedProfile: indicatedProfile,
                    indicatedDbPath: indicatedDbPath,
                    dbMethods: dbMethods,
                };
                return indication(backup);
            }
            catch (error) {
                console.log("TCL: doBackup -> error", error);
                if (error.status) {
                    reject(error);
                }
                else {
                    reject(errors_1.checkServerError());
                }
            }
        });
        yield doBackup();
    }));
};
exports.saveMessenger = variables => {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        const saveIndicatorProfile = (backup) => __awaiter(this, void 0, void 0, function* () {
            try {
                const indicatorProfile = backup.indicatorProfile;
                const dbMethods = yield databaseMethods_1.databaseMethods();
                const indicatorDbPath = backup.indicatorDbPath;
                const saveIndicatorProfile = () => {
                    return dbMethods.updateDatabaseInfo(indicatorDbPath, {
                        messengerId: variables.messengerId,
                        userEmail: variables.userEmail,
                        firstName: variables.firstName,
                        lastName: variables.lastName,
                    });
                };
                if (indicatorProfile === null) {
                    yield saveIndicatorProfile();
                    resolve({
                        status: 200,
                        text: `Indication process done.`,
                    });
                }
                else {
                    if (indicatorProfile.messengerId == variables.messengerId) {
                        resolve({
                            status: 200,
                            text: 'Already have indication profile'
                        });
                    }
                    else if (indicatorProfile.messengerId === null || indicatorProfile.messengerId === undefined) {
                        yield saveIndicatorProfile();
                        resolve({
                            status: 200,
                            text: `Indication process done.`,
                        });
                    }
                    else {
                        yield errors_1.checkMessengerId(indicatorProfile.messengerId, variables);
                    }
                    ;
                }
                ;
            }
            catch (error) {
                console.error(new Error("Error saving indicator profile. Doing Backup"));
                console.error(new Error(error));
                yield backup.dbMethods.setDatabaseInfo(backup.indicatorDbPath, backup.indicatorProfile);
                if (error.status) {
                    reject(error);
                }
                else {
                    reject(errors_1.checkServerError());
                }
                ;
            }
            ;
        });
        const backup = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const dbMethods = yield databaseMethods_1.databaseMethods();
                const indicatorDbPath = database_1.indicationDbRefRoot(variables.userEmail);
                const indicatorProfile = yield dbMethods.getDatabaseInfo(indicatorDbPath);
                console.log("TCL: backup -> indicatorProfile", indicatorProfile);
                const backupVariables = {
                    indicatorDbPath: indicatorDbPath,
                    indicatorProfile: indicatorProfile,
                    dbMethods: dbMethods,
                };
                return saveIndicatorProfile(backupVariables);
            }
            catch (error) {
                console.error(new Error(error));
                if (error.status)
                    reject(error);
                reject(errors_1.checkBackupError(variables));
            }
        });
        yield backup();
    }));
};
//# sourceMappingURL=indicationController.js.map