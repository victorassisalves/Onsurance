export const databaseMethods = async () => {

    const getDatabaseInfo = (dbPath) => {
        return dbPath.once('value').then((result) => {
            return result.val();
        }).catch((error) => {
            console.error(new Error(`Error getting database info. on path - ${error}.`));
            throw {
                status: 500, // internal server error
                text: `Error getting databse info on path.`,
                callback: "serverError",
                variables: {}
            };
            
        });
    };

    const setDatabaseInfo = (dbPath, content) => {
        return dbPath.set(content).then(() => {
			console.log("TCL: setDatabaseInfo -> Content set")
            return {
                status: 202,
                text: `Content set on database!`
            };
        }).catch((error) => {
            console.error(new Error(`Error setting content on database. - ${error}.`));
            throw {
                status: 500, // internal server error
                text: `Error setting content on database.`,
                callback: "serverError",
                variables: {}
            };
        });
    };

    const updateDatabaseInfo = (dbPath, content) => {
        return dbPath.update(content).then((result) => {
			console.log("TCL: updateDatabaseInfo -> Content updated")
        
            return {
                status: 200,
                text: `Content updated on database.`
            };
        }).catch((error) => {
            console.error(new Error(`Error updating content on database. - ${error}.`));
            throw {
                status: 500, // internal server error
                text: `Error updating content on database.`,
                callback: "serverError",
                variables: {}
            };
        });
    };

    const pushDatabaseInfo = async (dbPath, content) => {
        const pushDbRef = await dbPath.push();
        return pushDbRef.update(content).then((result) => {
		console.log("TCL: pushDatabaseInfo -> Content pushed")
            return {
                _id: pushDbRef.key,
                status: 200,
                text: `Content pushed.`
            };
        }).catch((error) => {
            console.error(new Error(`Error pushing content to database path. - ${error}.`));
            throw {
                status: 500, // internal server error
                text: `Error pushing content to database path.`,
                callback: "serverError",
                variables: {}
            };
        });
    };
    
    return {
        getDatabaseInfo: getDatabaseInfo,
        setDatabaseInfo: setDatabaseInfo,
        updateDatabaseInfo: updateDatabaseInfo,
        pushDatabaseInfo: pushDatabaseInfo

    }

}


/**
* @description This function get's the data on database path. 
* @param dbPath Path to database data
*/
export const getDatabaseInfo = async (dbPath: any): Promise<any> => {
    try {
        const data = await dbPath.once('value');
        return data.val();
    } catch (error) {
        console.error(new Error(`Error getting database info. on path - ${error}.`));
        throw {
            status: 500, // internal server error
            text: `Error getting databse info on path.`,
            callback: "serverError",
            variables: {}
        };
    };
};


/**
* @description This function delete's the data on database path. 
* @param dbPath Path to database data
*/
export const deleteDatabaseInfo = async (dbPath) => {
    try {
        await dbPath.remove();
        console.log("TCL: deleteDatabaseInfo -> Content deleted")
        return {
            status: 202,
            text: `Content set on database!`
        };
    } catch (error) {
        console.error(new Error(`Error deleting database info. on path - ${error}.`));
        throw {
            status: 500, // internal server error
            text: `Error deleting databse info on path.`,
            callback: "serverError",
            variables: {}
        };
    }
};

/**
 * @description This function set's the data on database path. 
 * @param dbPath Path to database where you want to set
 * @param content What you want to set on dbPath
 */
export const setDatabaseInfo = async (dbPath, content) => {
    try {
        await dbPath.set(content);
        console.log("TCL: setDatabaseInfo -> Content set")
        return {
            status: 202,
            text: `Content set on database!`
        };
    } catch (error) {
        console.error(new Error(`Error setting content on database. - ${error}.`));
        throw {
            status: 500, // internal server error
            error: JSON.stringify(error),
            text: `Error setting content on database.`,
            callback: "serverError",
            variables: {}
        };
    };
};

/**
 * @description This function update's the data on database path. 
 * @param dbPath Path to database where you want to update
 * @param content What you want to update on dbPath
 */
export const updateDatabaseInfo = (dbPath, content) => {
    return dbPath.update(content).then((result) => {
        console.log("TCL: updateDatabaseInfo -> Content updated")
        return {
            status: 200,
            text: `Content updated on database.`
        };
    }).catch((error) => {
        console.error(new Error(`Error updating content on database. - ${error}.`));
        throw {
            status: 500, // internal server error
            text: `Error updating content on database.`,
            callback: "serverError",
            variables: {}
        };
    });
};

/**
 * @description This function push the data on database path. 
 * @param dbPath Path to database where you want to push
 * @param content What you want to push on dbPath
 */
export const pushDatabaseInfo = async (dbPath, content) => {
    const pushDbRef = await dbPath.push();
    return pushDbRef.update(content).then((result) => {
    console.log("TCL: pushDatabaseInfo -> Content pushed")
        return {
            _id: pushDbRef.key,
            status: 200,
            text: `Content pushed.`
        };
    }).catch((error) => {
        console.error(new Error(`Error pushing content to database path. - ${error}.`));
        throw {
            status: 500, // internal server error
            text: `Error pushing content to database path.`,
            callback: "serverError",
            variables: {}
        };
    });
};