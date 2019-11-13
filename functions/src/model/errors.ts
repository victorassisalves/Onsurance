/**
 * @description This function checks if user profile is null or undefined
 * @param {Object} userProfile Id the profile we get from database
 * @param {Object} variables Contains the userEmail to send in response 
 */
export const checkUserProfile = (userProfile, variables) => {
    // Error check for owner account NOT exist
    switch (userProfile) {
        case null:
        case undefined:
            throw {
                status: 404, // Not Found
                text: `User Profile for ${variables.userEmail} don't exist.`,
                callback: 'noUserProfile',
                variables: {
                    userEmail: variables.userEmail
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
};

export const checkOnboard = (userProfile, variables) => {
    // ERROR check for user onboard
    if (!userProfile.onboard) throw {
        status: 403, // forbidden
        text: "Not User or no onboard made yet",
        callback: 'noOnboard',
        variables: {
            userEmail: variables.userEmail,
        }
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
};

export const checkMessengerId = (messengerId, variables) => {
    // console.log("TCL: checkMessengerId -> variables.messengerId", variables.messengerId)
    // console.log("TCL: checkMessengerId -> messengerId", messengerId)
    // tslint:disable-next-line: triple-equals
    if (variables.messengerId != messengerId && messengerId !== null) throw {
        status: 401, // Unauthorized
        text: `User is using a different messenger account.`,
        callback: `userUsingDiffMessenger`,
        variables: {}
    };
};

export const checkItemProfile = (itemProfile, variables) => {
    // ERROR check for non existing ItemProfile
    if (itemProfile === null || itemProfile === undefined) throw {
        status: 404, // Not found
        text: `Error checking item profile for ${variables.userEmail}. Check if user made onboard for item ${variables.itemInUse} or the data is correct.`,
        callback: 'noItemProfile',
        variables: {
            itemInUse: variables.itemInUse
        }
    };
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
// Check if there is a item in user profile
export const checkItemList = (userItemsList) => {
    if (userItemsList === null || userItemsList === undefined || !userItemsList) throw {
        status: 404, // Not Found
        text: `No items in user profile check if Onboard was made.`,
        callback: 'noOnboard',
        variables: {}
    };
};

/**
 * @description This function check any variable. If it is undefined or null throws a error, if is not, returns the variable
 * @param variable Is the variable you want to check for undefined or null
 * @returns {variable}
 * ```
 * return variable;
 * ```
 */
export const checkRequestVariables = (variable) => {
    switch (variable) {
        case null:
        case undefined:
            throw {
                errorType: "Variable is null or undefined",
                message: "Variable can't be null or undefined. Check the request and try again."
            };
        default:
            return variable;
    }
};


