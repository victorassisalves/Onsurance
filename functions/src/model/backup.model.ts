import { setDatabaseInfo } from "./databaseMethods";

/**
 * @description This function is made to restore data in case of failure
 * @param path Path to dabase to restore data in case of failure
 * @param data Data to restore on database in case of failure
 */
export const restoreData = async (path, data) => {
    try {
        const backup = await setDatabaseInfo(path, data);
        console.log(`TCL: restoreData -> backup`, JSON.stringify(backup));
        return "Data restored!";
    } catch (error) {
        console.error(new Error(`TCL: restoreData -> error: ${JSON.stringify(error)}`));
        throw error;
    }
};