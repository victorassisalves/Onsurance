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
const databaseMethods_1 = require("./databaseMethods");
const tire_database_1 = require("../database/tire.database");
const customer_database_1 = require("../database/customer.database");
const errors_1 = require("./errors");
const backup_model_1 = require("./backup.model");
const calcMin_1 = require("./calcMin");
const onboardVariables_1 = require("../environment/onboardVariables");
exports.tireOnboard = (variables) => {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const onboardVariables = yield onboardVariables_1.tireOnboardVariables(variables);
            /**
             * TODO:
             *  @todo Get item database path for tire
             *  @todo Get user database path to items in profile
             *  @todo Get database informations for backup in user profile.
             *  @todo Check to see if user profile exist
             *  @todo Check to see if user already have vehicle with tires in profile
             *  @todo
             *
            */
            // ------------ DB PATHS --------
            const userProfilePath = yield customer_database_1.userProfileDbRefRoot(onboardVariables.userEmail).child("personal");
            const tireProfilePath = yield tire_database_1.tiresInItemDbPath(onboardVariables.plate).child("profiles");
            const itemId = yield tire_database_1.getItemId(onboardVariables.plate);
            const tiresInUserProfilePath = yield customer_database_1.userProfileDbRefRoot(onboardVariables.userEmail).child(`items/tires/${itemId}`);
            // ------------ USER PROFILE -----
            const userProfileBackup = yield databaseMethods_1.getDatabaseInfo(userProfilePath);
            console.log(`TCL: tireOnboard -> userProfileBackup`, JSON.stringify(userProfileBackup));
            errors_1.checkUserProfile(userProfileBackup, onboardVariables);
            // ------------ ITEM IN USER PROFILE ---
            const tireInUserProfileBackup = yield databaseMethods_1.getDatabaseInfo(tiresInUserProfilePath);
            console.log(`TCL: tireOnboard -> tireInUserProfileBackup`, JSON.stringify(tireInUserProfileBackup));
            // ------------ ITEMS -----------
            const tireProfileBackup = yield databaseMethods_1.getDatabaseInfo(tireProfilePath);
            console.log(`TCL: tireOnboard -> tireProfileBackup`, JSON.stringify(tireProfileBackup));
            // ------------ EXECUTE ONBOARD --------
            const onboard = () => __awaiter(this, void 0, void 0, function* () {
                try {
                    switch (tireProfileBackup) {
                        /** Não existe perfil de pneus no DB
                         * @path Items/tires/vehicleId/profile
                         *
                        */
                        case null:
                        case undefined:
                            {
                                const minute = yield calcMin_1.getTireMinuteValue(onboardVariables);
                                const tireProfile = {
                                    qtd: onboardVariables.qtd,
                                    vehicleId: onboardVariables.plate,
                                    minuteValue: minute.minuteValue,
                                    minuteValueBase: minute.minuteValueBase,
                                    totalValue: onboardVariables.totalValue,
                                    tires: {
                                        [`${onboardVariables.tireId}`]: {
                                            price: onboardVariables.totalValue
                                        }
                                    }
                                };
                                yield databaseMethods_1.setDatabaseInfo(tireProfilePath, tireProfile);
                                return resolve({
                                    message: `Onboard made for item Tire ${onboardVariables.tireId}.`
                                });
                            }
                            ;
                        default:
                            {
                                switch (tireProfileBackup.tires[onboardVariables.tireId]) {
                                    case null:
                                    case undefined:
                                        /*  Tire isn't on db yet
                                            Need to make onboard for tire in tire/vehicle profile
                                        */
                                        console.log(`TCL: tireProfileBackup[onboardVariables.tireId]`, tireProfileBackup[onboardVariables.tireId]);
                                        const newTireMinute = {
                                            qtd: tireProfileBackup.qtd + onboardVariables.qtd,
                                            totalValue: tireProfileBackup.totalValue + onboardVariables.totalValue
                                        };
                                        console.log(`TCL: newTireMinute`, JSON.stringify(newTireMinute));
                                        return resolve(newTireMinute);
                                    default:
                                        {
                                            // Since no data was modified, no restoration is necessary
                                            reject({
                                                errorType: "Onboard Already made for this item.",
                                                message: `Tire ${onboardVariables.tireId} is already on database.`
                                            });
                                        }
                                        ;
                                }
                                ;
                                // const data = {
                                //     data1: tireProfileBackup,
                                //     data2: tireInUserProfileBackup,
                                //     data3: userProfileBackup
                                // }
                                // resolve(data);
                            }
                            ;
                    }
                    ;
                }
                catch (error) {
                    console.error(new Error(`Error in tire onboard. error: ${JSON.stringify(error)}`));
                    const rollback = {
                        tireProfile: yield backup_model_1.restoreData(tireProfilePath, tireProfileBackup),
                        userProfile: yield backup_model_1.restoreData(userProfilePath, userProfileBackup),
                    };
                    reject({
                        error: error,
                        backup: rollback
                    });
                }
            });
            yield onboard();
        }
        catch (error) {
            console.error(new Error(`TCL: tireOnboard -> error: ${error}`));
            reject(error);
        }
    }));
};
//# sourceMappingURL=tires.model.js.map