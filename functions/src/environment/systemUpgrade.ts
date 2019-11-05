import { databaseMethods } from "../model/databaseMethods";
import { updateDatabase, userProfileDbRefRoot, customersDbRoot, itemsDbRoot, itemProfileDbRef } from "../database/database";
const crypto = require("crypto")

export const systemUpgrade = () =>{
    return new Promise(async (resolve, reject) => {
        const dbMethods = await databaseMethods();
        const newCustomersDbPath = await customersDbRoot()
        const newItemsDbPath = await itemsDbRoot()


        const upgrade = async (backupData) => {
            try {
                const oldDbPath = await updateDatabase()
                const userProfiles = await dbMethods.getDatabaseInfo(oldDbPath.child("customers/profiles"))
                const itemProfiles = await dbMethods.getDatabaseInfo(oldDbPath.child("items/vehicles"))
    
                const arrayKeysUser = Object.keys(userProfiles)
                console.log("TCL: systemUpgrade -> arrayKeysUser lenght", arrayKeysUser.length)
                const arrayKeysVehicle = Object.keys(itemProfiles)
                console.log("TCL: systemUpgrade -> arrayKeysVehicle lenght", arrayKeysVehicle.length)
    
    
                await arrayKeysUser.forEach(async element => {
                    console.log("TCL: element", element)
                    const oldUserProfile = userProfiles[element];
    
                    console.log("TCL: systemUpgrade -> oldUserProfile", oldUserProfile)
                    let userEmail = oldUserProfile.personal.userEmail
                    if (oldUserProfile.personal.userEmail !== undefined){
                        userEmail = oldUserProfile.personal.userEmail.toLowerCase()
                    } else {
                        reject("No user email")
                    };

                    let vehiclePlate = (oldUserProfile.personal.vehicleInUse)
    
                    let vehicleActivations = 0
                    let items =  null
                    // check if user have items in profile
                    if (vehiclePlate === false || vehiclePlate === undefined || vehiclePlate === null){
                        items = null
                    } else{
                        vehiclePlate = vehiclePlate.toLowerCase()
                        const itemDbId = crypto.createHash('md5').update(vehiclePlate).digest("hex");
                        console.log("TCL: systemUpgrade -> itemDbId", itemDbId)
                        const oldVehicleProfile = itemProfiles[itemDbId].profile
                        console.log("TCL: systemUpgrade -> oldVehicleProfile", oldVehicleProfile)
                        vehicleActivations = oldVehicleProfile.activations
                        items = {
                            [`${itemDbId}`] : {
                            "activationsCounter" : {
                                "accident" : vehicleActivations,
                                "theft" : vehicleActivations,
                                "thirdParty" : vehicleActivations
                            },
                            "innerType" : "car",
                            "itemId" : vehiclePlate,
                            "owner" : oldUserProfile.personal.userEmail,
                            "type" : "vehicle"
                            }
                        };
                    };
    
    
                    let lastOrder = 0
                    // check if user have last order
                    if (oldUserProfile.personal.lastOrder === null || oldUserProfile.personal.lastOrder === undefined){
                        lastOrder = 0
                    } else {
                        lastOrder = oldUserProfile.personal.lastOrder
                    }
    
    
                    let messengerId = null
                    // check if user have messenger id
                    if (oldUserProfile.personal.messengerId === null || oldUserProfile.personal.messengerId === undefined){
                        messengerId = null
                    } else {
                        messengerId = oldUserProfile.personal.messengerId
                    }
                    const newUserProfile = {
                        "items" : items,
                        "personal" : {
                            "activationsCounter" : oldUserProfile.personal.activations,
                            "clientId" : oldUserProfile.personal.idClient,
                            "firstName" : oldUserProfile.personal.firstName,
                            "lastName" : oldUserProfile.personal.lastName,
                            "lastOrder" : lastOrder,
                            "messengerId" : messengerId,
                            "onboard" : (function(){
                                if((oldUserProfile.personal.vehicleInUse === null || oldUserProfile.personal.vehicleInUse ===undefined)){
                                    return false;
                                } else {
                                    return true;
                                }
                            })(),
                            "userEmail" : oldUserProfile.personal.userEmail,
                            "wallet" : oldUserProfile.personal.wallet,
                        }
                    }
                    console.log("TCL: systemUpgrade -> newUserProfile", newUserProfile)
                    const userNewDbPath = await userProfileDbRefRoot(userEmail)
                    const result = await dbMethods.updateDatabaseInfo(userNewDbPath, newUserProfile)
                    if (result.status === 500) {
                        throw result
                    }
                });
    
                const newUserProfiles = await dbMethods.getDatabaseInfo(newCustomersDbPath.child("/profiles"))
                console.log("TCL: upgrade -> newUserProfiles", Object.keys(newUserProfiles).length);
                
                await arrayKeysVehicle.forEach(async element => {
                    const oldItemProfile = itemProfiles[element]
                    console.log("TCL: systemUpgrade -> oldItemProfile", oldItemProfile.profile)
                        
                    let vehiclePlate = 'abc'
                    let newItemProfile
                    if (oldItemProfile.profile.carValue === null || oldItemProfile.profile.carValue === undefined) {
                        vehiclePlate = oldItemProfile.profile.vehiclePlate
                        console.log("TCL: systemUpgrade -> vehiclePlate", vehiclePlate)
                        let protectionStatus = true;
    
                        if(oldItemProfile.profile.protectionStatus === "ON"){
                            protectionStatus = true;
                        } else{ 
                            protectionStatus = false;
                        };
    
                        const value = (property) =>{
    
                            if(oldItemProfile.profile[property] === undefined) {
                                return "not set"
                            } else{
                                return oldItemProfile.profile[property]
                            }  
                        }
                        newItemProfile = {
                            "logUse" : oldItemProfile.logUse,
                            "profile" : {
                                "brand" : value('vehicleBrand'),
                                "itemPrice" : value('vehicleValue'),
                                "model" : value('vehicleModel'),
                                "plate" : value('vehiclePlate'),
                                "protectionData" : {
                                  "access" : [ "pron" ],
                                  "activationsCounter" : {
                                    "accident" : oldItemProfile.profile.activations,
                                    "theft" : oldItemProfile.profile.activations,
                                    "thirdParty" : oldItemProfile.profile.activations
                                  },
                                  "minuteValue" : oldItemProfile.profile.minuteValue,
                                  "protectionStatus" : {
                                    "accident" : protectionStatus,
                                    "theft" : protectionStatus,
                                    "thirdParty" : protectionStatus
                                  }
                                },
                            }
                        }
                    } else {
                        vehiclePlate = oldItemProfile.profile.carPlate
    
                        console.log("TCL: systemUpgrade -> vehiclePlate", vehiclePlate)
    
                        let  protectionStatus = true;
    
                        if(oldItemProfile.profile.protectionStatus === "ON"){
                            protectionStatus = true;
                        } else{ 
                            protectionStatus =  false;
                        };
                        const value = (property) =>{
    
                            if(oldItemProfile.profile[property] === undefined) {
                                return "not set"
                            }else{
                                return oldItemProfile.profile[property]
                            } 
                        }
                            console.log("TCL: protectionStatus -> protectionStatus", protectionStatus)
                        newItemProfile = {
                            "logUse" : oldItemProfile.logUse,
                            "profile" : {
                                "brand" : value('carBrand'),
                                "itemPrice" : value('carValue'),
                                "model" : value('carModel'),
                                "plate" : value('carPlate'),
                                "protectionData" : {
                                  "access" : [ "pron" ],
                                  "activationsCounter" : {
                                    "accident" : oldItemProfile.profile.activations,
                                    "theft" : oldItemProfile.profile.activations,
                                    "thirdParty" : oldItemProfile.profile.activations
                                  },
                                  "minuteValue" : oldItemProfile.profile.minuteValue,
                                  "protectionStatus" : {
                                        "accident" : protectionStatus,
                                        "theft" : protectionStatus,
                                        "thirdParty" : protectionStatus
                                  }
                                },
                            }
                        }
                    }
                    console.log("TCL: newItemProfile", JSON.stringify(newItemProfile.profile));
                    const itemNewDbPath = await itemProfileDbRef(vehiclePlate, "vehicle", "car")
                    const result = await dbMethods.updateDatabaseInfo(itemNewDbPath, newItemProfile)
                    if (result.status === 500) {
                        throw result
                    }
                });
    
                const newItemsProfiles = await dbMethods.getDatabaseInfo(newItemsDbPath.child("/vehicle/car"))
                console.log("TCL: upgrade -> newItemsProfiles", Object.keys(newItemsProfiles).length)
    
                 const results = await {
                    oldUsers: arrayKeysUser.length,
                    newUsers: Object.keys(newUserProfiles).length,
                    oldVehicles: arrayKeysVehicle.length,
                    newVehicles: Object.keys(newItemsProfiles).length,
                };
                console.log("TCL: upgrade -> results", results)

                resolve(results)
            } catch (error) {
                // ITEMS error backup
                await dbMethods.updateDatabaseInfo(newItemsDbPath, backupData.newItemsProfiles)
                // Users Error Backup
                await dbMethods.updateDatabaseInfo(newCustomersDbPath, backupData.newUserProfiles)
                console.error("Backup done")
                reject(error)
            }
        }; 
        const backup = async () => {
            try {
            
                const newUserProfiles = await dbMethods.getDatabaseInfo(newCustomersDbPath.child("/profiles"))
                const newItemsProfiles = await dbMethods.getDatabaseInfo(newItemsDbPath.child("/vehicle/car"))
                const backupData = {
                    newUserProfiles: newUserProfiles,
                    newItemsProfiles: newItemsProfiles
                }
                await upgrade(backupData);
    
            } catch (error) {
                reject(error)
            }
        }
        await backup();
        
    });
};