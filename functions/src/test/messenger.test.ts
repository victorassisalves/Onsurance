import { userProfileDbRefRoot } from "../database/customer.database";
import { getDatabaseInfo } from "../model/databaseMethods";

/**
 * 
 * @param {string} userEmail Email of the user to check on DB
 * @param {string} messengerId Messenger Id that comes from the payload
 */
export const compareMessengerId = async (userEmail: string, messengerId: string) => {
    const userDbPath = await userProfileDbRefRoot(userEmail);
    const dbMessengerId = await getDatabaseInfo(userDbPath.child("/personal/messengerId"));
    if (messengerId != dbMessengerId && dbMessengerId !== null) {
        throw {
            status: 401, // Unauthorized
            text: `User is using a different messenger account.`,
            callback: `userUsingDiffMessenger`,
            variables: {}
        };
    } else {
        return dbMessengerId;
    }
};


export const checkFirstAccess = (dbMessengerId) => {
    if (dbMessengerId === undefined || dbMessengerId === null) {
        throw {
            status: 401, // Unauthorized
            text: `User haven't made first access in messenger.`,
            callback: `noFirstAccess`,
            variables: {}
        };
    } else {
        return;
    }
}