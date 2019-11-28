import { userProfileDbRefRoot } from "../database/customer.database";
import { getDatabaseInfo } from "../model/databaseMethods";
import { checkUserProfile, checkOnboard, checkItemList} from "../model/errors";
import { itemProfileDbRef } from "../database/auto.database";
import { vehicleData } from "../report/reportDataVehicles";
import { tiresInItemDbPath } from "../database/tire.database";


/**
 * @description This function gets the list of items wich the user can access
 * @param variables 
 */
export const getItemList = async (variables) => {
    try {

        /**
         * Todo: 
         *  get user profile
         *      check if profile exists
         *      check onboard
         *  get user items list
         *      check if user is owner or have access granted
         *      check if have items
         *      
         */

        const userDbPath = await userProfileDbRefRoot(variables.userEmail);
        const itemsInUserDbPath = userDbPath.child('items');

        const userProfile = await getDatabaseInfo(userDbPath);

        checkUserProfile(userProfile.personal, variables.userEmail);
        checkOnboard(userProfile.personal, variables.userEmail);

        const itemsInUserProfile = await getDatabaseInfo(itemsInUserDbPath);
        checkItemList(itemsInUserProfile);
        const itemsArray = Object.keys(itemsInUserProfile);
        const resultArray = [];

        // Normal for is the only that accepts async callback
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

                    console.log(`TCL: vehicleProfile.protectionData.protectionStatus.accident`, vehicleProfile.protectionData.protectionStatus.accident);
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