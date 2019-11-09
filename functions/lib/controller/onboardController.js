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
const calcMin_1 = require("../model/calcMin");
const errors_1 = require("../model/errors");
exports.clientOnboard = (variables) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        const doOnboard = (backup) => __awaiter(this, void 0, void 0, function* () {
            try {
                /*
                    TODO:  Get/Set data in ZOHO CRM API
                */
                // Database reference for user profile root
                const userDb = backup.userDbPath;
                const itemDbPath = backup.itemDbPath;
                // Get Methods for playing with user data base CRUD
                const userProfilePersonal = yield databaseMethods_1.databaseMethods();
                const userProfileItems = yield databaseMethods_1.databaseMethods();
                // Get profile info on DB
                const getProfile = backup.fullUserProfile.personal;
                console.log("TCL: clientOnboard -> getProfile", getProfile);
                // If user Dont exist enter here
                if (getProfile === null || getProfile === undefined)
                    throw {
                        status: 404,
                        text: `Error getting profile for ${variables.userProfile.userEmail}. Error: Profile = Null. Check if user purchased Onsurance and Order is Completed. `
                    };
                // checks if already did onboard
                if (getProfile.onboard) {
                    const itemsArrays = Object.keys(backup.fullUserProfile.items);
                    console.log("TCL: clientOnboard -> itemsArrays", itemsArrays);
                    // check if user already did onboard for that item
                    // Run array to get elements
                    itemsArrays.map(element => {
                        console.log(backup.fullUserProfile.items[element]);
                        console.log("TCL: clientOnboard -> item", backup.fullUserProfile.items[element]);
                        if (backup.fullUserProfile.items[element].itemId === variables.itemProfile.plate)
                            throw {
                                status: 403,
                                text: `Error doing onboard for ${variables.userProfile.userEmail}. Error: User already did onboard for item with id ${variables.itemProfile.plate}.`
                            };
                    });
                }
                else {
                    yield userProfilePersonal.updateDatabaseInfo(userDb.child('personal'), {
                        activationsCounter: 0
                    });
                }
                /*
                    TODO: add type to calc minute value
                    DONE:  Vehicle -> car and motorcicle calc minute
                */
                let itemMinuteValue = 4.84;
                if (variables.itemProfile.itemType === 'vehicle') {
                    const userInput = {
                        fipe: (variables.itemProfile.itemPrice).toString(),
                        vehicleType: variables.itemProfile.itemInnerType.toLowerCase(),
                        usageType: variables.itemProfile.typeOfUse.toLowerCase(),
                        factory: variables.itemProfile.factory.toLowerCase(),
                        thirdPartyCoverage: (variables.itemProfile.thirdPartyCoverage).toString()
                    };
                    console.log(`TCL: clientOnboard -> userInput`, userInput);
                    yield calcMin_1.getVehicleMinuteValue(userInput).then(result => {
                        itemMinuteValue = result;
                    }).catch(error => {
                        console.error(`error in calc minute value promise.`);
                        throw error;
                    });
                }
                ;
                console.log("TCL: clientOnboard -> itemMinuteValue", itemMinuteValue);
                // Reference to item in use on user profile database
                // customer -> profiles -> ClientId -> Items
                const itemInUse = {
                    type: variables.itemProfile.itemType,
                    innerType: variables.itemProfile.itemInnerType,
                    owner: variables.userProfile.userEmail,
                    itemId: variables.itemProfile.plate,
                    activationsCounter: {
                        theft: 0,
                        accident: 0,
                        thirdParty: 0,
                    },
                };
                // push new item in use to user databse
                const itemDdId = yield database_1.getItemId(variables.itemProfile.plate);
                console.log("TCL: clientOnboard -> itemDdId", itemDdId);
                yield userProfileItems.updateDatabaseInfo(userDb.child(`items/${itemDdId}`), itemInUse);
                const itemProfile = {
                    model: variables.itemProfile.model,
                    brand: variables.itemProfile.brand,
                    plate: variables.itemProfile.plate,
                    chassi: variables.itemProfile.chassi,
                    year: variables.itemProfile.year,
                    itemPrice: variables.itemProfile.itemPrice,
                    typeOfUse: variables.itemProfile.typeOfUse,
                    thirdPartyCoverage: variables.itemProfile.thirdPartyCoverage,
                    protectionData: {
                        minuteValue: parseFloat((itemMinuteValue * 1000).toFixed(3)),
                        protectionStatus: {
                            theft: false,
                            accident: false,
                            thirdParty: false,
                        },
                        activationsCounter: {
                            theft: 0,
                            accident: 0,
                            thirdParty: 0,
                            fullCoverage: 0,
                        },
                        access: variables.itemProfile.access
                    },
                    hasAssistance: variables.itemProfile.hasAssistance,
                    factory: variables.itemProfile.factory,
                };
                // Add the new item profile do db
                yield backup.itemMethods.updateDatabaseInfo(itemDbPath, itemProfile);
                // If onboard is false... set to true
                if (!getProfile.onboard)
                    yield userProfilePersonal.updateDatabaseInfo(userDb.child(`personal`), { onboard: true });
                resolve({
                    status: 200,
                    text: `All actions passed for client ${variables.userProfile.userEmail}. Onboard completed.`
                });
            }
            catch (error) {
                console.error(new Error(`Error for ${variables.userProfile.userEmail}: ${JSON.stringify(error)}`));
                yield (function () {
                    backup.itemMethods.setDatabaseInfo(backup.itemDbPath, backup.fullItem);
                    backup.userMethods.setDatabaseInfo(backup.userDbPath, backup.fullUserProfile);
                })();
                console.log("TCL: clientOnboard Error -> backup reverted");
                if (error.status)
                    reject(error);
                reject({
                    status: 500,
                    text: `Unknown error. check what happened. ${JSON.stringify(error)}`
                });
            }
            ;
        });
        // make backup in case something goes wrong anywhere
        try {
            // Get Methods for backup in case something goes wrong
            const userMethods = yield databaseMethods_1.databaseMethods();
            const itemMethods = userMethods;
            // Get user profile data for backup on DB
            const userDbPath = database_1.userProfileDbRefRoot(variables.userProfile.userEmail);
            const itemDbPath = database_1.itemProfileDbRef(variables.itemProfile.plate, variables.itemProfile.itemType, variables.itemProfile.itemInnerType).child("profile");
            const getFullUserProfile = yield userMethods.getDatabaseInfo(userDbPath);
            console.log("TCL: doBackup -> getFullUserProfile", getFullUserProfile);
            // ERROR check
            yield errors_1.checkUserProfile(getFullUserProfile, variables.userProfile);
            const getFullItem = yield itemMethods.getDatabaseInfo(itemDbPath);
            console.log("TCL: doBackup -> getFullItem", getFullItem);
            const variablesResponse = {
                userEmail: variables.userProfile.userEmail,
                itemInUse: variables.itemProfile.plate
            };
            // ERROR check for item profile that already exists
            yield errors_1.checkItemProfileAlreadyExists(getFullItem, variablesResponse);
            const backup = {
                userMethods: userMethods,
                itemMethods: itemMethods,
                fullUserProfile: getFullUserProfile,
                fullItem: getFullItem,
                itemDbPath: itemDbPath,
                userDbPath: userDbPath
            };
            return doOnboard(backup);
        }
        catch (error) {
            console.error(new Error(`Error doing backup for user ${variables.userProfile.userEmail}. Error: ${error}`));
            reject(error);
        }
    }));
});
//# sourceMappingURL=onboardController.js.map