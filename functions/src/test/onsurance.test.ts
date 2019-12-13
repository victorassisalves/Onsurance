import { OnsuraceTiresVariables } from "../environment/messenger/messenger.variables";

/**
 * @description This function checks if there is no change on the protection status 
 * @param dbStatus Protection Status from DB
 * @param variables Payload variables (treated)
 */
export const checkStatusOnsuranceTires = (dbStatus, variables: OnsuraceTiresVariables) => {
    if (dbStatus === variables.accident) {
        console.log(`no cange in protection status`);
        if (dbStatus === true) throw{
            callback: 'noChangeAllOn'
        }
        throw {
            callback: `noChangeAllOff`
        }
    }
    return false;
};