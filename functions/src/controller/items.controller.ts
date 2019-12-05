import { userProfileDbRefRoot } from "../database/customer.database";
import { getDatabaseInfo } from "../model/databaseMethods";
import { checkUserProfile, checkOnboard, checkItemList, checkTireProfile, checkItemInUse, checkItemProfile} from "../model/errors";
import { itemProfileDbRef } from "../database/auto.database";
import { tiresInItemDbPath, getItemId } from "../database/tire.database";
import { GetTire, GetAuto } from "../routes/items.routes";
import { TireInUserProfile, TireItemProfile, TireProtectionData } from "../model/tires.model";


/**
 * @description This function gets the list of items wich the user can access
 * @param variables 
 * @todo check if user have permission to access the item
 */
export const getItemList = async (variables) => {
    try {

        const userDbPath = await userProfileDbRefRoot(variables.userEmail);
        const itemsInUserDbPath = userDbPath.child('items');

        const userProfile = await getDatabaseInfo(userDbPath);

        checkUserProfile(userProfile.personal, variables.userEmail);
        checkOnboard(userProfile.personal, variables.userEmail);

        const itemsInUserProfile = await getDatabaseInfo(itemsInUserDbPath);
        console.log(`TCL: itemsInUserProfile`, itemsInUserProfile);
        checkItemList(itemsInUserProfile);

        const itemsArray = Object.keys(itemsInUserProfile);
        console.log(`TCL: itemsArray`, itemsArray);
        const resultArray = [];

        // Normal (for) is the only that accepts async callback
        // this first for iterates over itens on profile. Vehicles and tires

        for (let i = 0; i < itemsArray.length; i++) {
            const item = itemsArray[i];
            switch (item) {
                case "tires":
                    const tiresArray = Object.keys(itemsInUserProfile[item]);
                    // This second for iterates over tires inside profile.
                    // {tiresArray} is an array with the tires ids for that user
                    // We iterate through it and get the tire info
                    for (let i = 0; i < tiresArray.length; i++) {
                        
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
            
                default:
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
            };
        };

        return resultArray;
    } catch (error) {
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

            const userProfile = await getDatabaseInfo(userDbPath.child(`/personal`));
            checkUserProfile(userProfile, variables.userEmail);
            checkOnboard(userProfile, variables.userEmail);
            const userTiresList = await getDatabaseInfo(userDbPath.child(`/items/tires`));
            checkItemList(userTiresList);

            const tires = Object.keys(userTiresList);

            if (tires.length === 1) {

                const itemInUse = userTiresList[`${tires[0]}`];

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
                    vehiclePlates.push(userTiresList[`${element}`].itemId);
                };
                
            });

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

            const userProfile = await getDatabaseInfo(userDbPath.child(`/personal`));
            checkUserProfile(userProfile, variables.userEmail);
            checkOnboard(userProfile, variables.userEmail);
            const userItemsList = await getDatabaseInfo(userDbPath.child(`/items`));
            checkItemList(userItemsList);

            const items = Object.keys(userItemsList);

            const vehicles = items.filter((item, index) => {
                return item !== "tires";
            });

            const onlyOneVehicle = async () => {
                const itemInUse = userItemsList[`${vehicles[0]}`];
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
                    console.log("TCL: element", element)
                    console.log("TCL: element id", userItemsList[`${element}`].itemId)

                    vehiclePlates.push(userItemsList[`${element}`].itemId);
                };
                
            });

            console.log("TCL: vehiclePlates", vehiclePlates);

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

            const userProfile = await getDatabaseInfo(userDbPath.child(`/personal`));
            checkUserProfile(userProfile, variables.userEmail);
            checkOnboard(userProfile, variables.userEmail);

            const itemId = await getItemId(variables.tireVehicleId)
            const userTires: TireInUserProfile = await getDatabaseInfo(userDbPath.child(`/items/tires/${itemId}`));
            checkItemInUse(userTires, variables)

            const tireDbPath = await tiresInItemDbPath(userTires.vehicleType, userTires.itemId)
            const tireProfile: TireProtectionData = await getDatabaseInfo(tireDbPath.child("profile/protectionData"));
            console.log(`TCL: tireProfile`, tireProfile);
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
            console.error("TCL: error", error)
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

            // Get item in use from user DB
            const itemDbId = await getItemId(variables.itemInUse);

            const itemInUse = await getDatabaseInfo(userDbPath.child(`items/${itemDbId}`));


            // ERROR check for ITEM IN USE
            checkItemInUse(itemInUse, variables);

            const itemDbPath = await itemProfileDbRef(itemInUse.itemId, itemInUse.type, itemInUse.innerType);
            const itemProfile = await getDatabaseInfo(itemDbPath.child("profile"));

            // ERROR check for non existing ItemProfile
            checkItemProfile(itemProfile, variables)

            resolve({
                status: 200,
                text: `Item info ${itemProfile}`,
                callback: 'changeItemInfo',
                variables: {
                    itemProfile: itemProfile,
                }
            });
        } catch (error) {
            console.error("TCL: error", error)
            if (error.status) reject(error)
            reject({
                status: 500, // server error
                text: `Error getting items list on profile.`
            });
        };
    });
};