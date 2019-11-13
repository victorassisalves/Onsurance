import { getDatabaseInfo } from "./databaseMethods";
import { itemDb, getItemId } from "../database/tire.database";
import { userProfileDbRefRoot } from "../database/customer.database";

export const tireOnboard = (onboardVariables) => {

    return new Promise(async (resolve, reject) => {
        try {
            
            /**
             * TODO:
             *  Get item database path for tire
             *  Get database informations for backup
             */
            // ------------ ITEMS 
            const tireProfilePath = await itemDb(onboardVariables.plate, "tire").child("profiles");
            const tireProfileBackup = getDatabaseInfo(tireProfilePath);

            const itemId = await getItemId(onboardVariables.plate);
            const tiresInUserProfilePath = await userProfileDbRefRoot(onboardVariables.userEmail).child(`items/tire/${itemId}`);
            const tireInUserProfileBackup = getDatabaseInfo(tiresInUserProfilePath);
        } catch (error) {
            
        }
    });
};