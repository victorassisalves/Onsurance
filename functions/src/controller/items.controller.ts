import { userProfileDbRefRoot } from "../database/customer.database";
import { getDatabaseInfo } from "../model/databaseMethods";
import { checkUserProfile, checkOnboard} from "../model/errors";
import { itemProfileDbRef } from "../database/auto.database";
import { vehicleData } from "../report/reportDataVehicles";


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

        const itemsArray = Object.keys(itemsInUserProfile);
        const resultArray = [];
        for (let i = 0; i < itemsArray.length; i++) {
            const item = itemsArray[i];
            console.log(`TCL: item`, item);
            switch (item) {
                case "tires":
                        const tiresArray = Object.keys(itemsInUserProfile[item]);
                        tiresArray.forEach(tire => {
                            resultArray.push({
                                itemId: itemsInUserProfile[item][tire].itemId,
                                type: itemsInUserProfile[item][tire].type,
                                owner: itemsInUserProfile[item][tire].owner
                            });
                        });
                    break;
            
                default:
                    const vehicleProfilePath = itemProfileDbRef(
                        itemsInUserProfile[item].itemId, 
                        itemsInUserProfile[item].type, 
                        itemsInUserProfile[item].innerType,
                    );

                    const vehicleProfile = await getDatabaseInfo(vehicleProfilePath.child("profile"));
                    console.log(`TCL: vehicleProfile`, vehicleProfile);
                    resultArray.push({
                        itemId: itemsInUserProfile[item].itemId,
                        type: itemsInUserProfile[item].type,
                        innerType:itemsInUserProfile[item].innerType,
                        owner: itemsInUserProfile[item].owner,
                        brand: vehicleProfile.brand,
                        model: vehicleProfile.model,
                    });
            };
        };

        return resultArray;
    } catch (error) {
        throw error;
    }
}