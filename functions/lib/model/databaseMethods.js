"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseMethods = () => __awaiter(this, void 0, void 0, function* () {
    const getDatabaseInfo = (dbPath) => {
        return dbPath.once('value').then((result) => {
            return result.val();
        }).catch((error) => {
            console.error(new Error(`Error getting database info. on path - ${error}.`));
            throw {
                status: 500,
                text: `Error getting databse info on path.`,
                callback: "serverError",
                variables: {}
            };
        });
    };
    const setDatabaseInfo = (dbPath, content) => {
        return dbPath.set(content).then(() => {
            console.log("TCL: setDatabaseInfo -> Content set");
            return {
                status: 202,
                text: `Content set on database!`
            };
        }).catch((error) => {
            console.error(new Error(`Error setting content on database. - ${error}.`));
            throw {
                status: 500,
                text: `Error setting content on database.`,
                callback: "serverError",
                variables: {}
            };
        });
    };
    const updateDatabaseInfo = (dbPath, content) => {
        return dbPath.update(content).then((result) => {
            console.log("TCL: updateDatabaseInfo -> Content updated");
            return {
                status: 200,
                text: `Content updated on database.`
            };
        }).catch((error) => {
            console.error(new Error(`Error updating content on database. - ${error}.`));
            throw {
                status: 500,
                text: `Error updating content on database.`,
                callback: "serverError",
                variables: {}
            };
        });
    };
    const pushDatabaseInfo = (dbPath, content) => __awaiter(this, void 0, void 0, function* () {
        const pushDbRef = yield dbPath.push();
        return pushDbRef.update(content).then((result) => {
            console.log("TCL: pushDatabaseInfo -> Content pushed");
            return {
                _id: pushDbRef.key,
                status: 200,
                text: `Content pushed.`
            };
        }).catch((error) => {
            console.error(new Error(`Error pushing content to database path. - ${error}.`));
            throw {
                status: 500,
                text: `Error pushing content to database path.`,
                callback: "serverError",
                variables: {}
            };
        });
    });
    return {
        getDatabaseInfo: getDatabaseInfo,
        setDatabaseInfo: setDatabaseInfo,
        updateDatabaseInfo: updateDatabaseInfo,
        pushDatabaseInfo: pushDatabaseInfo
    };
});
/**
* @description This function get's the data on database path.
* @param dbPath Path to database data
*/
exports.getDatabaseInfo = (dbPath) => {
    return dbPath.once('value').then((result) => {
        return result.val();
    }).catch((error) => {
        console.error(new Error(`Error getting database info. on path - ${error}.`));
        throw {
            status: 500,
            text: `Error getting databse info on path.`,
            callback: "serverError",
            variables: {}
        };
    });
};
/**
 * @description This function set's the data on database path.
 * @param dbPath Path to database where you want to set
 * @param content What you want to set on dbPath
 */
exports.setDatabaseInfo = (dbPath, content) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield dbPath.set(content);
        console.log("TCL: setDatabaseInfo -> Content set");
        return {
            status: 202,
            text: `Content set on database!`
        };
    }
    catch (error) {
        console.error(new Error(`Error setting content on database. - ${error}.`));
        throw {
            status: 500,
            error: JSON.stringify(error),
            text: `Error setting content on database.`,
            callback: "serverError",
            variables: {}
        };
    }
    ;
});
/**
 * @description This function update's the data on database path.
 * @param dbPath Path to database where you want to update
 * @param content What you want to update on dbPath
 */
exports.updateDatabaseInfo = (dbPath, content) => {
    return dbPath.update(content).then((result) => {
        console.log("TCL: updateDatabaseInfo -> Content updated");
        return {
            status: 200,
            text: `Content updated on database.`
        };
    }).catch((error) => {
        console.error(new Error(`Error updating content on database. - ${error}.`));
        throw {
            status: 500,
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
exports.pushDatabaseInfo = (dbPath, content) => __awaiter(this, void 0, void 0, function* () {
    const pushDbRef = yield dbPath.push();
    return pushDbRef.update(content).then((result) => {
        console.log("TCL: pushDatabaseInfo -> Content pushed");
        return {
            _id: pushDbRef.key,
            status: 200,
            text: `Content pushed.`
        };
    }).catch((error) => {
        console.error(new Error(`Error pushing content to database path. - ${error}.`));
        throw {
            status: 500,
            text: `Error pushing content to database path.`,
            callback: "serverError",
            variables: {}
        };
    });
});
//# sourceMappingURL=databaseMethods.js.map