import { getItemId } from "../database/auto.database";
/**
 * 
 * @param userProfile Profile of the user who wants to access the item
 * @param itemToUse Item the user requesting wants to access
 */
export const checkItemUsagePermission = async (userProfile, itemToUse) => {
    if (userProfile.personal.userEmail === itemToUse.owner) {
        return true;
    } else {
        const itemId = await getItemId(itemToUse.itemId);
        if (userProfile.itemAuthorizations.thirdParty[itemId]) {
            console.log('User have authorization to use item.');
            return true;
        };
        return false;
    }
};