import { userProfileDbRefRoot } from "../database/customer.database";
import { getDatabaseInfo } from "../model/databaseMethods";
import { checkUserProfile, checkOnboard} from "../model/errors";
import { showItemsListInGalery } from "../environment/responses.messenger";
import { checkItemUsagePermission } from "../model/validation.model";
import { tiresInItemDbPath } from "../database/tire.database";
import { itemProfileDbRef } from "../database/auto.database";


interface TireData {
    activationsCounter: {
        accident: number
    };
    itemType: string
    owner: string
    itemId: string
    vehicleType: string
}
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
        var arr = ["6f4d85bab4ff861432a565539d9b8334", 'tires', "6f4d85bab4ff861432a565539d9b8334", "cellphones"];
        const result = [];

        itemsArray.forEach(async (item) => {
            switch (item) {
                case "tires": {
                    result.push({
                        tire: "tires"
                    });
                    break;
                };
            
                default: {

                    // const itemProfileDbPath = await itemProfileDbRef(itemsInUserProfile[item].itemId, itemsInUserProfile[item].type, itemsInUserProfile[item].innerType);
                    // const itemProfile = await getDatabaseInfo(itemProfileDbPath.child("profile"));
                    // console.log(`TCL: itemProfile`, itemProfile);
                    result.push({
                        itemId: itemsInUserProfile[item].itemId,
                        type: itemsInUserProfile[item].type,
                        // itemProfile: await itemProfile
                    });
                    break;
                }
            }
        });

        return result;
    } catch (error) {
        throw error;
    }
}