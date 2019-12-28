

/**
 * @description This function checks if user profile is null or undefined
 * @param {Object} userProfile Is the profile we get from database
 * @param {string} userEmail Is the userEmail to send in response 
 */
export const checkUserProfile = (userProfile, userEmail: string) => {
    // Error check for owner account NOT exist
    switch (userProfile) {
        case null:
        case undefined:
            throw {
                status: 404, // Not Found
                text: `User Profile for ${userEmail} don't exist.`,
                callback: 'noUserProfile',
                variables: {
                    userEmail: userEmail
                }
            };
        default:
            break;
    };
};

export const checkUserEmail = (userProfile, variables) => {
    // Error check for owner account NOT exist
    if (userProfile.userEmail !== variables.userEmail) throw {
        status: 404, // Not Found
        text: `User Profile email ${userProfile.userEmail} is different from ${variables.userEmail}.`,
        callback: 'noUserProfile',
        variables: {
            userEmail: variables.userEmail
        }
    };
};

export const checkItemAccess = (hasAccessToItem, variables) => {
    // ERROR check for item Access
    if (hasAccessToItem === null || hasAccessToItem === undefined || !hasAccessToItem) throw {
        status: 401, // not authorized
        text: `You don't have authorization to protect this Item. Ask the owner for the permission.`,
        callback: 'noItemAccess',
        variables: {
            itemInUse: variables.itemInUse
        }
    };
};

export const checkItemInUse = (itemInUse, variables) => {
    // ERROR Check for item NOT exists on user account
    if (itemInUse === null || itemInUse === undefined) throw {
        status: 404, // Not Found
        text: `User don't have item ${variables.itemInUse} in account.`,
        callback:  'noItemInUse',
        variables: {
            itemInUse: variables.itemInUse,
        }
    };
    return;
};


/**
 * @description This function check to see if the user onboard was already made
 * @param {Object} userProfile Is the user profile info we got from db
 * @param {String} userEmail Is the user email we get from endpoint request
 */
export const checkOnboard = (userProfile, userEmail: string) => {
    // ERROR check for user onboard
    switch (userProfile.onboard) {
        case null:
        case undefined:
        case false:
            throw {
                status: 403, // forbidden
                text: "Not onboard made yet",
                callback: 'noOnboard',
                variables: {
                    userEmail: userEmail,
                }
            };
        default:
            break;
    };
};

export const checkClientId = (userProfile, variables) => {
    // ERROR check for user onboard
    if (userProfile.clientId === null || userProfile.clientId === undefined) throw {
        status: 403, // forbidden
        text: "User don't have a client id",
        callback: 'noClientId',
        variables: {
            userEmail: variables.userEmail,
        }
    };
};

export const checkUserCredit = (userProfile, variables) => {
    // ERROR check for credit in User wallet
    if (userProfile.wallet.switch <= 500 ) throw {
        status: 402, // Payment required
        text: "Not enought switchs on your account. Recharge ASAP.",
        callback: 'noUserCredit',
        variables: {
            userCredit: parseFloat((userProfile.wallet.switch / 1000).toFixed(3)),
        }
    };
};

export const checkOwnerCredit = (ownerCredit) => {
    // ERROR check for owner Credit
    if (ownerCredit <= 500 ) throw {
        status: 402, // Payment required
        text: "Not enought switchs on owner account. Recharge ASAP.",
        callback: 'noOwnerCredit',
        variables: {
            ownerCredit: parseFloat((ownerCredit / 1000).toFixed(3)),
        }
    };
    return;
};

export const checkUserWallet = (userProfile, variables) => {
    // ERROR check for user onboard
    if (userProfile.wallet === null || userProfile.wallet === undefined) throw {
        status: 403, // forbidden
        text: "User don't have a wallet. Check onboard and woocommerce purshase.",
        callback: 'noWallet',
        variables: {
            userEmail: variables.userEmail,
        }
    };
    return;
};

/**
 * @description Function to check of messenger Id on DB is equal to the one sent on request.
 * @param {String} messengerId Variable we get from user profile on DB. 
 * @param {Object} variables Variables from request. Need to have messenger id on request to compare 
 */
export const checkMessengerId = async (messengerId: string, variables: any) => {
    // tslint:disable-next-line: triple-equals
    if (variables.messengerId != messengerId && messengerId !== null) {
        throw {
            status: 401, // Unauthorized
            text: `User is using a different messenger account.`,
            callback: `userUsingDiffMessenger`,
            variables: {}
        };
    } else {
        return;
    }

};

/**
 * @description This functions check is Vehicle exists on Item DB Path
 * @param itemProfile It's the item profile that comes from item db. 
 * @param variables It's the request variables that come from payload
 * @todo change this function name to checkVehicleProfile
 */
export const checkItemProfile = (itemProfile, variables) => {
    let itemInUse;
    if (variables.tireVehicleId) {
        itemInUse = variables.tireVehicleId
    } else {
        itemInUse = variables.itemInUse
    }

    // ERROR check for non existing ItemProfile
    if (itemProfile === null || itemProfile === undefined) throw {
        status: 404, // Not found
        text: `Error checking item profile for ${variables.userEmail}. Check if user made onboard for item ${itemInUse} or the data is correct.`,
        callback: 'noItemProfile',
        variables: {
            itemInUse: itemInUse
        }
    };
    return;
};

/**
 * @description This functions check if Tire exists on DB Path
 * @param tireProfile It's the item profile that comes from item db. 
 * @param variables It's the request variables that come from payload
 */
export const checkTireProfile = (tireProfile, variables) => {
    // ERROR check for non existing ItemProfile
    if (tireProfile === null || tireProfile === undefined) throw {
        status: 404, // Not found
        text: `Error checking tire profile for ${variables.userEmail}. Check if user made onboard for item ${variables.tireVehicleId} or the data is correct.`,
        callback: 'noTireInUse',
        variables: {
            tireVehicleId: variables.tireVehicleId
        }
    };
    return;
};
/**
 * @description This functions check if Tire exists on DB Path
 * @param tireProfile It's the item profile that comes from item db. 
 * @param variables It's the request variables that come from payload
 */
export const checkTiresInProfile = async (tires, variables) => {
    // ERROR check for non existing ItemProfile
    if (tires === null || tires === undefined) throw {
        status: 404, // Not found
        text: `Error checking tire profile for ${variables.userEmail}. Check if user made onboard for item ${variables.tireVehicleId} or the data is correct.`,
        callback: 'noTiresOnProfile',
        variables: {
            itemInUse: variables.tireVehicleId
        }
    };
    return;
};

export const checkItemProfileAlreadyExists = (itemProfile, variables) => {
    // console.log("TCL: checkItemProfileAlreadyExists -> itemProfile", itemProfile)
    // ERROR check for non existing ItemProfile
    if (itemProfile === null || itemProfile === undefined) {
        return true
    } else {
        throw {
            status: 409, // Conflict
            text: `Error checking item profile for ${variables.userEmail}. Item ${variables.itemInUse} already exists in Database. Onboard for this item was already made.`,
            callback: 'itemProfileAlreadyExist',
            variables: {
                itemInUse: variables.itemInUse
            }
        };
    }
};

export const checkEqualIndicationEmail = (variables) => {
    // Error check for owner account NOT exist
    // tslint:disable-next-line: triple-equals
    if (variables.indicatorEmail == variables.userEmail) throw {
        status: 409, // Conflict
        text: `Indicator is equal to indicated.`,
        callback: 'indicatorEqualIndicated',
        variables: {
            userEmail: variables.userEmail
        }
    };
    return;
};

export const checkForIndicator = (indicatedProfile, variables) => {
    // console.log("TCL: checkForIndicator -> indicatedProfile.indicator", indicatedProfile.indicator)
    // Error check for owner account NOT exist
    if (indicatedProfile.indicator === null || indicatedProfile.indicator === undefined) {
        return;
    } else {
        throw {
            status: 409, // Conflict
            text: `User already have indicator. ${indicatedProfile.indicator}`,
            callback: 'alreadyHaveIndicator',
            variables: {
                userEmail: variables.userEmail,
                indicator: indicatedProfile.indicator
            }
        };
    }
};

export const checkBackupError = variables => {

    return {
        status: 500, // Internal server error (not identified)
        text: `Error doing backup for client ${variables.userEmail}. One or more wrong information. Try again after checking data sent and user email.`,
        callback: 'serverError',
        variables: {}
    };
};

export const checkServerError = () => {

    return {
        status: 500, // Internal server error (not identified)
        text: `Error in server. Generic Error, check what happened. Try again after checking data sent and user email.`,
        callback: 'serverError',
        variables: {}
    };
};

export const checkUserAccessPermission = (variables, itemToAccess) => {
    if (variables.userEmail !== itemToAccess.owner){
         throw {
            status: 401, // Not Authorized
            text: `User don't have authorization to give access to item.`,
            callback: 'noPermissionToGiveAccess',
            variables: {
                itemInUse: variables.itemInUse
            }
        };
    } else {
        return true
    }
};

/*

        CHANGE ITEM

*/

/**
 * @description This function checks if user have items in profile. If null or undefined, throw error.
 * @param {Object} userItemsList List of items in user profile
 */
export const checkItemList = (userItemsList: Object) => {
    if (userItemsList === null || userItemsList === undefined || !userItemsList) throw {
        status: 404, // Not Found
        text: `No items in user profile check if Onboard was made.`,
        callback: "noItemsOnProfile",
        variables: {}
    };
    return;
};

/**
 * @description This function check any variable. If it is undefined or null throws a error, if is not, returns the variable
 * @param {string} varName Is the variable name to return error dubug
 * @param {any} variable Is the variable you want to check for undefined or null
 * @param {String | Number} variableType If variable is String or Number send this paramenter
 * @param {boolean} required For default every variable is required. If not, pass value false
 * @returns {variable}
 * ```
 * return variable;
 * ```
 */
export const checkRequestVariables = (varName, variable, variableType?, required = true) => {
    switch (variable) {
        case null:
        case undefined:
            if (required === true){
                throw {
                    callback: `variableNull`,
                    errorType: "Variable is null or undefined",
                    message: `Variable ${varName} can't be null or undefined. Check the request and try again.`,
                    variable: variable
                };
            };
            return null;
        case '':
        case ' ':
            if (required === true) throw {
                callback: `variableNull`,
                errorType: "Variable is empty",
                variable: variable,
                message: `Variable ${varName} can't be empty. Check the request and try again.`
            };
            return null;
        default:
            if (variableType === String){
                return variable.toLowerCase()
            } else if (variableType === Number) {
                return parseFloat(variable);
            } else if (variableType === Boolean) {
                switch (variable) {
                    case true:
                    case 'true':
                        return true;
                    case false:
                    case 'false':
                    default:
                        return false;
                };
            }
            return variable;
    }
};

/**
 * @description this function throws a error for invalid vehicle type
 * @param vehicleType is the vehicle type that is invalid
 */
export const invalidVehicleType = (vehicleType) => {
    return {
        errorType: "Invalid vehicle type.",
        message: `${vehicleType} is a invalid type of vehicle.`
    };
};

/**
 * @description This function checks if the vehicle type is valid and if the number of tires for that vehicle is also valid
 * @param vehicleType Type of vehicle to check
 * @param tireQtd Quantity of tires in the vehicle type
 */
export const checkVehicleTireQtd = async (vehicleType, tireQtd) => {
    try {
        switch (vehicleType) {
            // case "caminhonete":
            // case "vuc":
            case "car":
                if (tireQtd > 4) {
                    throw {
                        errorType: "Invalid tire number.",
                        message: `A car can't have ${tireQtd} tires. Maximum of 4 tires`
                    };
                };
                break;
            case "moto":
                if (tireQtd > 2) {
                    throw {
                        errorType: "Invalid tire number.",
                        message: `A motorcycle can't have ${tireQtd} tires. Maximum of 2 tires`
                    };
                };
                break;
            default:
                throw invalidVehicleType(vehicleType);
        };
    } catch (error) {
        console.error(new Error(`Error checking vehicle type and tire qtd. Error: ${JSON.stringify(error)}.`));
        throw error;
    };
};

/**
 * @description This function validates if user email is valid
 * @param email User email to validate
 */
export const validateEmail = (email) => {
    if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    .test(email)){
        return checkRequestVariables("User Email", email, String);
  } else {
    console.error("You have entered an invalid email address!")
    throw {
        error: "Not a valid email",
        Message: "Email inválido, por favor insira um email válido"
    }
  }
    

}