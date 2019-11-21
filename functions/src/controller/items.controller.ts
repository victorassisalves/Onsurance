import { userProfileDbRefRoot } from "../database/customer.database";

interface GetItems {

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

        // const userDbPath = await userProfileDbRefRoot(variables.userEmail);
        return variables;
    } catch (error) {
        throw error;
    }
}