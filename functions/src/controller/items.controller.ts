import { userProfileDbRefRoot } from "../database/customer.database";
import { getDatabaseInfo } from "../model/databaseMethods";
import { checkUserProfile, checkOnboard, checkItemList, checkTireProfile, checkItemInUse, checkItemProfile, checkTiresInProfile} from "../model/errors";
import { itemProfileDbRef } from "../database/auto.database";
import { tiresInItemDbPath, getItemId } from "../database/tire.database";
import { GetTire, GetAuto } from "../routes/items.routes";
import { TireInUserProfile, TireProtectionData, TireItemProfile } from "../model/tires.model";
import { UserProfileInterface, ItemAuthorizations, ItemsInUserProfile, VehicleInUserProfileInterface, PersonalUserProfileInterface, TireInUserProfileInterface } from "../interfaces/user.interfaces";
import { TestAccessToItem } from "../test/itemAccess.test";


/**
 * @description This function gets the list of items wich the user can access
 * @param variables 
 * @todo check if user have permission to access the item
 */
export const getItemList = async (variables) => {
    try {
        console.log(`Inside getItemList`);

        const userDbPath = await userProfileDbRefRoot(variables.userEmail);
        const itemsInUserDbPath = userDbPath.child('items');

        const userProfile: UserProfileInterface = await getDatabaseInfo(userDbPath);

        checkUserProfile(userProfile, variables.userEmail);
        checkOnboard(userProfile.personal, variables.userEmail);

        const itemsAuth: ItemAuthorizations = userProfile.itemAuthorizations

        const itemsInUserProfile: ItemsInUserProfile = await getDatabaseInfo(itemsInUserDbPath);
        checkItemList(itemsInUserProfile);

        const itemsArray = Object.keys(itemsInUserProfile);
        const resultArray = [];

        // Normal (for) is the only that accepts async callback
        // this first for iterates over itens on profile. Vehicles and tires

        for (let i = 0; i < itemsArray.length; i++) {
            const item = itemsArray[i];
            switch (item) {
                case "tires": {

                    const tiresArray = Object.keys(itemsInUserProfile[item]);
                    const tiresInProfile = itemsInUserProfile.tires;
                    // This second for iterates over tires inside profile.
                    // {tiresArray} is an array with the tires ids for that user
                    // We iterate through it and get the tire info
                    for (let i = 0; i < tiresArray.length; i++) {

                        const checkTireAccess = new TestAccessToItem(variables, tiresInProfile[tiresArray[i]], itemsAuth);
                        const owner = checkTireAccess.checkOwnership();
                        if (!owner) {
                            const thirdParty = checkTireAccess.checkThirdPartyAccess();
                            if (!thirdParty){
                                console.log(`User ${variables.userEmail} don't have acces to Tire ${JSON.stringify(tiresInProfile[tiresArray[i]])}.`);
                                break;
                            };
                        }
                        const tireProfilePath = tiresInItemDbPath(itemsInUserProfile[item][tiresArray[i]].vehicleType, itemsInUserProfile[item][tiresArray[i]].itemId);
    
                        const tireProfile = await getDatabaseInfo(tireProfilePath.child("profile/protectionData"));

                        resultArray.push({
                            itemId: itemsInUserProfile[item][tiresArray[i]].itemId,
                            type: itemsInUserProfile[item][tiresArray[i]].type,
                            owner: itemsInUserProfile[item][tiresArray[i]].owner,
                            protectionStatus: tireProfile.protectionStatus,
                            tireQtd: tireProfile.tireQtd
                        });
                    };
                    break;
                };
                default: {
                    const autoInProfile: VehicleInUserProfileInterface = itemsInUserProfile[item]
                    console.log(`TCL: autoInProfile`, autoInProfile);
                    const checkAutoAccess = new TestAccessToItem(variables, autoInProfile, itemsAuth);
                    const owner = checkAutoAccess.checkOwnership();
                    console.log(`TCL: owner`, owner);
                    if (!owner) {
                        const thirdParty = checkAutoAccess.checkThirdPartyAccess();
                        if (!thirdParty){
                            console.log(`User ${variables.userEmail} don't have acces to Auto ${JSON.stringify(autoInProfile)}.`);
                            break;
                        };
                    };

                    const vehicleProfilePath = itemProfileDbRef(
                        itemsInUserProfile[item].itemId, 
                        itemsInUserProfile[item].type, 
                        itemsInUserProfile[item].innerType,
                    );

                    const vehicleProfile = await getDatabaseInfo(vehicleProfilePath.child("profile"));

                    resultArray.push({
                        itemId: itemsInUserProfile[item].itemId,
                        type: itemsInUserProfile[item].type,
                        innerType:itemsInUserProfile[item].innerType,
                        owner: itemsInUserProfile[item].owner,
                        brand: vehicleProfile.brand,
                        model: vehicleProfile.model,
                        protectionStatus: vehicleProfile.protectionData.protectionStatus.accident
                    });
                    break;
                };
            };
        };

        if (resultArray.length === 0 ) throw {
            errorType: "No item access",
            callback: 'noAccessToItems',
            variables: {}
        };

        return resultArray;
    } catch (error) {
        console.error(new Error(`: ${JSON.stringify(error)}`));
        throw error;
    }
}

/**
 * @description Gets the list of auto vehicles on user profile
 * @param variables 
 */
export const getTiresList = (variables): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            const userDbPath = await userProfileDbRefRoot(variables.userEmail);

            const userProfile: PersonalUserProfileInterface = await getDatabaseInfo(userDbPath.child(`/personal`));
            checkUserProfile(userProfile, variables.userEmail);
            checkOnboard(userProfile, variables.userEmail);
            const itemsAuth: ItemAuthorizations = await getDatabaseInfo(userDbPath.child(`itemAuthorizations`));
            const userTiresList: TireInUserProfileInterface = await getDatabaseInfo(userDbPath.child(`/items/tires`));
            checkItemList(userTiresList);

            const tires = Object.keys(userTiresList);

            if (tires.length === 1) {

                const itemInUse = userTiresList[`${tires[0]}`];
                
                const checkTireAccess = new TestAccessToItem(variables, itemInUse, itemsAuth);
                const owner = checkTireAccess.checkOwnership();
                
                if (!owner) {
                    const thirdParty = checkTireAccess.checkThirdPartyAccess();
                    if (!thirdParty){
                        console.log(`User ${variables.userEmail} don't have acces to Auto ${JSON.stringify(itemInUse)}.`);
                        throw {
                            status: 204, // No content
                            text: `User don't have access vehicle to ${itemInUse}.`,
                            callback: 'noAccessToTire',
                            variables: {}
                        };
                    };
                };


                const tireDbPath = await tiresInItemDbPath(itemInUse.vehicleType, itemInUse.itemId);
                const itemProfile = await getDatabaseInfo(tireDbPath.child("profile/protectionData"));
                return resolve({
                    status: 204, // No content
                    text: `User only have vehicle ${tires[0]} in profile.`,
                    callback: 'oneTireInProfile',
                    variables: {
                        itemProfile: itemProfile,
                        vehiclePlate: userTiresList[`${tires[0]}`].itemId
                    }
                }); 
            };

            let vehiclePlates = [];
            tires.forEach(element => {
                if (element === "tires"){
                    return;
                } else {
                    const itemInUse = userTiresList[`${element}`];
                
                    const checkTireAccess = new TestAccessToItem(variables, itemInUse, itemsAuth);
                    const owner = checkTireAccess.checkOwnership();
                    
                    if (!owner) {
                        const thirdParty = checkTireAccess.checkThirdPartyAccess();
                        if (!thirdParty){
                            console.log(`User ${variables.userEmail} don't have acces to Auto ${JSON.stringify(itemInUse)}.`);
                            return;
                        };
                    };

                    vehiclePlates.push(userTiresList[`${element}`].itemId);
                };
                
            });

            if (vehiclePlates.length === 0 ) throw {
                status: 204, // No content
                text: `User don't have access to any vehicle with Onsurance Tire.`,
                callback: 'noAccessToTire',
                variables: {}
            }
            return resolve({
                status: 200,
                text: `Items to change ${vehiclePlates}`,
                callback: 'changeTireOptions',
                variables: {
                    vehiclePlates: vehiclePlates,
                }
            });
        } catch (error) {
            console.error("TCL: error", error)
            if (error.callback) reject(error)
            throw reject({
                status: 500, // server error
                text: `Error getting items list on profile.`
            });
        };
    });
};

/**
 * @description Gets the list of auto vehicles on user profile
 * @param variables 
 */
export const getAutoList = (variables): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            const userDbPath = await userProfileDbRefRoot(variables.userEmail);

            const userProfile: PersonalUserProfileInterface = await getDatabaseInfo(userDbPath.child(`/personal`));
            checkUserProfile(userProfile, variables.userEmail);
            checkOnboard(userProfile, variables.userEmail);
            const itemsAuth: ItemAuthorizations = await getDatabaseInfo(userDbPath.child(`itemAuthorizations`));
            const userItemsList: ItemsInUserProfile = await getDatabaseInfo(userDbPath.child(`/items`));
            checkItemList(userItemsList);

            const items = Object.keys(userItemsList);

            const vehicles = items.filter((item, index) => {
                return item !== "tires";
            });

            const onlyOneVehicle = async () => {
                const itemInUse = userItemsList[`${vehicles[0]}`];

                const autoInProfile: VehicleInUserProfileInterface = itemInUse
                
                const checkAutoAccess = new TestAccessToItem(variables, autoInProfile, itemsAuth);
                const owner = checkAutoAccess.checkOwnership();
                
                if (!owner) {
                    const thirdParty = checkAutoAccess.checkThirdPartyAccess();
                    if (!thirdParty){
                        console.log(`User ${variables.userEmail} don't have acces to Auto ${JSON.stringify(autoInProfile)}.`);
                        throw {
                            status: 204, // No content
                            text: `User don't have access vehicle to ${vehicles[0]}.`,
                            callback: 'noAccessToAuto',
                            variables: {}
                        }
                    };
                };
                const itemDbPath = await itemProfileDbRef(itemInUse.itemId, itemInUse.type, itemInUse.innerType);
                const itemProfile = await getDatabaseInfo(itemDbPath.child("profile"));
                return resolve({
                    status: 204, // No content
                    text: `User only have vehicle ${vehicles[0]} in profile.`,
                    callback: 'oneVehicleInProfile',
                    variables: {
                        itemProfile: itemProfile,
                        vehiclePlate: userItemsList[`${vehicles[0]}`].itemId
                    }
                }); 
            };
            
            if (items.length === 1) {
                if (items[0] === "tires") {
                    return resolve({
                        status: 204, // No content
                        text: `User only have tires in profile. `,
                        callback: 'oneTireInProfile',
                        variables: {}
                    });
                };
                return onlyOneVehicle();
            } else {
                if (vehicles.length === 1) {
                    return onlyOneVehicle();
                }
            };

            let vehiclePlates = [];
            vehicles.forEach(element => {
                if (element === "tires"){
                    return;
                } else {
                    const autoInProfile: VehicleInUserProfileInterface = userItemsList[`${element}`]

                    const checkAutoAccess = new TestAccessToItem(variables, autoInProfile, itemsAuth);
                    const owner = checkAutoAccess.checkOwnership();

                    if (!owner) {
                        const thirdParty = checkAutoAccess.checkThirdPartyAccess();
                        if (!thirdParty){
                            console.log(`User ${variables.userEmail} don't have acces to Auto ${JSON.stringify(autoInProfile)}.`);
                            return;
                        };
                    };
                    vehiclePlates.push(userItemsList[`${element}`].itemId);
                };
                
            });


            if (vehiclePlates.length === 0) throw {
                status: 204, // No content
                text: `User don't have access vehicle to ${vehicles[0]}.`,
                callback: 'noAccessToAuto',
                variables: {}
            };
            return resolve({
                status: 200,
                text: `Items to change ${vehiclePlates}`,
                callback: 'changeVehicleOptions',
                variables: {
                    vehiclePlates: vehiclePlates,
                }
            });
        } catch (error) {
            console.error("TCL: error", error)
            if (error.callback) reject(error)
            throw reject({
                status: 500, // server error
                text: `Error getting items list on profile.`
            });
        };
    });
};


/**
 * @description This function gets the tires profile to return to user
 * @param variables 
 */
export const getTire = (variables: GetTire): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            const userDbPath = await userProfileDbRefRoot(variables.userEmail);

            const userProfile: PersonalUserProfileInterface = await getDatabaseInfo(userDbPath.child(`/personal`));
            checkUserProfile(userProfile, variables.userEmail);
            checkOnboard(userProfile, variables.userEmail);

            const itemId = await getItemId(variables.tireVehicleId)
            const tires = await getDatabaseInfo(userDbPath.child(`/items/tires/`));
            checkTiresInProfile(tires, variables)
            const userTires: TireInUserProfile = tires[itemId];
            checkTireProfile(userTires, variables);

            const itemsAuth: ItemAuthorizations = await getDatabaseInfo(userDbPath.child(`itemAuthorizations`));

            const checkTireAccess = new TestAccessToItem(variables, userTires, itemsAuth);
            const owner = checkTireAccess.checkOwnership();
            
            if (!owner) {
                const thirdParty = checkTireAccess.checkThirdPartyAccess();

                if (!thirdParty) reject({
                    text: `User don't have access to vehicle ${JSON.stringify(userTires)} to Onsurance Tires.`,
                    callback: 'noItemAccess',
                    variables: {}
                })
            };

            const tireDbPath = await tiresInItemDbPath(userTires.vehicleType, userTires.itemId)
            const tireProfile: TireProtectionData = await getDatabaseInfo(tireDbPath.child("profile/protectionData"));
            checkTireProfile(tireProfile, variables)

            return resolve({
                status: 200,
                text: `Got tire. Now lets change it on messenger`,
                callback: 'setTireOptions',
                variables: {
                    tireVehicleId: variables.tireVehicleId,
                    tireQtd: tireProfile.tireQtd,
                    protectionStatus: tireProfile.protectionStatus
                }
            });
        } catch (error) {
            console.error(new Error(JSON.stringify(error)));
            if (error.callback) reject(error)
            throw reject({
                status: 500, // server error
                text: `Error getting tire.`
            });
        };
    });
};


/**
 * @description This function gets the auto profile to return to user
 * @param variables 
 */
export const getAuto = (variables: GetAuto): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            const userDbPath = await userProfileDbRefRoot(variables.userEmail);

            const userProfile = await getDatabaseInfo(userDbPath.child(`/personal`));
            checkUserProfile(userProfile, variables.userEmail);
            checkOnboard(userProfile, variables.userEmail);

            // Get item in use from user DB
            const itemDbId = await getItemId(variables.itemInUse);

            const itemInUse: VehicleInUserProfileInterface = await getDatabaseInfo(userDbPath.child(`items/${itemDbId}`));

            // ERROR check for ITEM IN USE
            checkItemInUse(itemInUse, variables);

            const itemsAuth: ItemAuthorizations = await getDatabaseInfo(userDbPath.child(`itemAuthorizations`));

            const checkAutoAccess = new TestAccessToItem(variables, itemInUse, itemsAuth);
            const owner = checkAutoAccess.checkOwnership();
            
            if (!owner) {
                const thirdParty = checkAutoAccess.checkThirdPartyAccess();

                if (!thirdParty) throw {
                    text: `User don't have access vehicle to ${JSON.stringify(itemInUse)}.`,
                    callback: 'noItemAccess',
                    variables: {}
                };
            };

            const itemDbPath = await itemProfileDbRef(itemInUse.itemId, itemInUse.type, itemInUse.innerType);
            const itemProfile = await getDatabaseInfo(itemDbPath.child("profile"));

            // ERROR check for non existing ItemProfile
            checkItemProfile(itemProfile, variables)

            return resolve({
                status: 200,
                text: `Item info ${itemProfile}`,
                callback: 'changeItemInfo',
                variables: {
                    itemProfile: itemProfile,
                }
            });
        } catch (error) {
            console.error(new Error(JSON.stringify(error)));
            if (error.callback) reject(error)
            reject({
                status: 500, // server error
                text: `Error getting vehicle on profile.`
            });
        };
    });
};