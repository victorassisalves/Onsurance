
import { userProfileDbRefRoot } from "../database/customer.database"
import { databaseMethods, getDatabaseInfo, setDatabaseInfo, updateDatabaseInfo } from "../model/databaseMethods";
import { OnsuraceTiresVariables } from "../environment/messenger/messenger.variables";
import { TireInUserProfile, TireProtectionData } from "../model/tires.model";
import { getItemId, tiresInItemDbPath } from "../database/tire.database";
import { PersonalUserProfileInterface, ItemAuthorizations } from "../interfaces/user.interfaces";
import { checkUserProfile, checkTireProfile, checkItemAccess, checkItemProfile } from "../model/errors";
import { TestAccessToItem } from "../test/itemAccess.test";



/**
 * @description This function execute the activation of Onsurance Tires. ON and OFF
 * @param {OnsuraceTiresVariables} _variables Variables from the payload (treated)
 */
const onsuranceTire = async (_variables: OnsuraceTiresVariables) => {
    try {
        const userDbPath = await userProfileDbRefRoot(_variables.userEmail);

        const itemId = await getItemId(_variables.tireVehicleId);
    
        const userProfile: PersonalUserProfileInterface = await getDatabaseInfo(userDbPath.child('personal'));
        checkUserProfile(userProfile, _variables.userEmail);
        const tireProfile: TireInUserProfile = await getDatabaseInfo(userDbPath.child(`items/tires/${itemId}`));
        checkTireProfile(tireProfile, _variables);
        const itemAuth: ItemAuthorizations = await getDatabaseInfo(userDbPath.child(`itemAuthorizations`));
        
        function checkAccess () {
            const checkUserAccess = new TestAccessToItem(_variables, tireProfile, itemAuth);

            const owner = checkUserAccess.checkOwnership();

            if (!owner) {
                const haveAccess = checkUserAccess.checkThirdPartyAccess();
                return haveAccess;
            };
            return true;
        };
        const _access = checkAccess()
        checkItemAccess(_access, _variables);

        const tireDbPath = await tiresInItemDbPath(tireProfile.vehicleType, tireProfile.itemId);

        const tireProtectionData: TireProtectionData = await getDatabaseInfo(tireDbPath.child('profile/protectionData'));
        checkItemProfile(tireProtectionData, _variables);


        function checkOnsuranceStatus () {
            return true;
        };
    
        function activateOnsuranceTire () {
            return true;
        };
        return _access
    } catch (error) {
        console.error(new Error(`Error in Onsurace Tire Activation - ${JSON.stringify(error)}`))
        throw error;
    }
};

export const onsuranceTireOn = async (variables: OnsuraceTiresVariables) => {
    return await onsuranceTire(variables);
};