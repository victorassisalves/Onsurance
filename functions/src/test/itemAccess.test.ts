import { getItemId } from "../database/database";
import { UserProfileInterface, ItemAuthorizations, VehicleInUserProfileInterface, TireInUserProfileInterface } from "../interfaces/user.interfaces";


/**
 * @description This class is used to check if user have the access to the item. 
 * @param {Object} itemInUserProfile -> This is the item user is trying to get access. Comes from DB Must be the Specific Item
 * @param {Object} variables -> Payload variables
 * @param {ItemAuthorizations} itemAuth -> It's the Item Autorizations data from profile
 */
export class TestAccessToItem {
    itemInUserProfile;
    variables: any;
    itemAuth: ItemAuthorizations

    /**
     * 
     * @param {VehicleInUserProfileInterface | TireInUserProfileInterface} itemInUserProfile -> This is the item user is trying to get access. Comes from DB Must be the Specific Item
     * @param {Object} variables -> Payload variables
     * @param {ItemAuthorizations} itemAuth -> It's the Item Autorizations data from profile
     */
    constructor(variables, itemInUserProfile, itemAuth?: ItemAuthorizations) {
        this.variables = variables;
        this.itemInUserProfile = itemInUserProfile;
        this.itemAuth = itemAuth
    };

    /**
     * @description This function return's if the user is the owner of the item is trying to access
     * @returns true or false
     * ```
     * return true | false
     * ```
     */
    checkOwnership(): boolean {
        if (this.itemInUserProfile.owner === this.variables.userEmail) return true;
        return false;
    }

    /**
     * @description This function activates if the user is NOT owner of the item is trying to access. It check's if the owner gave access to this user
     * @returns true or false
     * ```
     * return true | false
     * ```
     */
    checkThirdPartyAccess (): boolean {
        if (this.itemAuth === null || this.itemAuth === undefined){
            return false;
        } else {
            if (this.itemAuth.thirdParty === null || this.itemAuth.thirdParty === undefined){
                return false;
            } else {
                const itemId = getItemId(this.itemInUserProfile.itemId.toLowerCase());
                const access: boolean = this.itemAuth.thirdParty[itemId];
                if (access === null || access === undefined){
                    return false;
                };
                return access;
            }
        }
        
        
    };
};