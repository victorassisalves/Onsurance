"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserProfile = (userProfile, variables) => {
    // Error check for owner account NOT exist
    if (userProfile === null || userProfile === undefined)
        throw {
            status: 404,
            text: `User Profile for ${variables.userEmail} don't exist.`,
            callback: 'noUserProfile',
            variables: {
                userEmail: variables.userEmail
            }
        };
};
exports.checkUserEmail = (userProfile, variables) => {
    // Error check for owner account NOT exist
    if (userProfile.userEmail !== variables.userEmail)
        throw {
            status: 404,
            text: `User Profile email ${userProfile.userEmail} is different from ${variables.userEmail}.`,
            callback: 'noUserProfile',
            variables: {
                userEmail: variables.userEmail
            }
        };
};
exports.checkItemAccess = (hasAccessToItem, variables) => {
    // ERROR check for item Access
    if (hasAccessToItem === null || hasAccessToItem === undefined || !hasAccessToItem)
        throw {
            status: 401,
            text: `You don't have authorization to protect this Item. Ask the owner for the permission.`,
            callback: 'noItemAccess',
            variables: {
                itemInUse: variables.itemInUse
            }
        };
};
exports.checkItemInUse = (itemInUse, variables) => {
    // ERROR Check for item NOT exists on user account
    if (itemInUse === null || itemInUse === undefined)
        throw {
            status: 404,
            text: `User don't have item ${variables.itemInUse} in account.`,
            callback: 'noItemInUse',
            variables: {
                itemInUse: variables.itemInUse,
            }
        };
};
exports.checkOnboard = (userProfile, variables) => {
    // ERROR check for user onboard
    if (!userProfile.onboard)
        throw {
            status: 403,
            text: "Not User or no onboard made yet",
            callback: 'noOnboard',
            variables: {
                userEmail: variables.userEmail,
            }
        };
};
exports.checkClientId = (userProfile, variables) => {
    // ERROR check for user onboard
    if (userProfile.clientId === null || userProfile.clientId === undefined)
        throw {
            status: 403,
            text: "User don't have a client id",
            callback: 'noClientId',
            variables: {
                userEmail: variables.userEmail,
            }
        };
};
exports.checkUserCredit = (userProfile, variables) => {
    // ERROR check for credit in User wallet
    if (userProfile.wallet.switch <= 500)
        throw {
            status: 402,
            text: "Not enought switchs on your account. Recharge ASAP.",
            callback: 'noUserCredit',
            variables: {
                userCredit: parseFloat((userProfile.wallet.switch / 1000).toFixed(3)),
            }
        };
};
exports.checkOwnerCredit = (ownerCredit) => {
    // ERROR check for owner Credit
    if (ownerCredit <= 500)
        throw {
            status: 402,
            text: "Not enought switchs on owner account. Recharge ASAP.",
            callback: 'noOwnerCredit',
            variables: {
                ownerCredit: parseFloat((ownerCredit / 1000).toFixed(3)),
            }
        };
};
exports.checkUserWallet = (userProfile, variables) => {
    // ERROR check for user onboard
    if (userProfile.wallet === null || userProfile.wallet === undefined)
        throw {
            status: 403,
            text: "User don't have a wallet. Check onboard and woocommerce purshase.",
            callback: 'noWallet',
            variables: {
                userEmail: variables.userEmail,
            }
        };
};
exports.checkMessengerId = (messengerId, variables) => {
    // console.log("TCL: checkMessengerId -> variables.messengerId", variables.messengerId)
    // console.log("TCL: checkMessengerId -> messengerId", messengerId)
    // tslint:disable-next-line: triple-equals
    if (variables.messengerId != messengerId && messengerId !== null)
        throw {
            status: 401,
            text: `User is using a different messenger account.`,
            callback: `userUsingDiffMessenger`,
            variables: {}
        };
};
exports.checkItemProfile = (itemProfile, variables) => {
    // ERROR check for non existing ItemProfile
    if (itemProfile === null || itemProfile === undefined)
        throw {
            status: 404,
            text: `Error checking item profile for ${variables.userEmail}. Check if user made onboard for item ${variables.itemInUse} or the data is correct.`,
            callback: 'noItemProfile',
            variables: {
                itemInUse: variables.itemInUse
            }
        };
};
exports.checkItemProfileAlreadyExists = (itemProfile, variables) => {
    // console.log("TCL: checkItemProfileAlreadyExists -> itemProfile", itemProfile)
    // ERROR check for non existing ItemProfile
    if (itemProfile === null || itemProfile === undefined) {
        return true;
    }
    else {
        throw {
            status: 409,
            text: `Error checking item profile for ${variables.userEmail}. Item ${variables.itemInUse} already exists in Database. Onboard for this item was already made.`,
            callback: 'itemProfileAlreadyExist',
            variables: {
                itemInUse: variables.itemInUse
            }
        };
    }
};
exports.checkEqualIndicationEmail = (variables) => {
    // Error check for owner account NOT exist
    // tslint:disable-next-line: triple-equals
    if (variables.indicatorEmail == variables.userEmail)
        throw {
            status: 409,
            text: `Indicator is equal to indicated.`,
            callback: 'indicatorEqualIndicated',
            variables: {
                userEmail: variables.userEmail
            }
        };
};
exports.checkForIndicator = (indicatedProfile, variables) => {
    // console.log("TCL: checkForIndicator -> indicatedProfile.indicator", indicatedProfile.indicator)
    // Error check for owner account NOT exist
    if (indicatedProfile.indicator === null || indicatedProfile.indicator === undefined) {
        return;
    }
    else {
        throw {
            status: 409,
            text: `User already have indicator. ${indicatedProfile.indicator}`,
            callback: 'alreadyHaveIndicator',
            variables: {
                userEmail: variables.userEmail,
                indicator: indicatedProfile.indicator
            }
        };
    }
};
exports.checkBackupError = variables => {
    return {
        status: 500,
        text: `Error doing backup for client ${variables.userEmail}. One or more wrong information. Try again after checking data sent and user email.`,
        callback: 'serverError',
        variables: {}
    };
};
exports.checkServerError = () => {
    return {
        status: 500,
        text: `Error in server. Generic Error, check what happened. Try again after checking data sent and user email.`,
        callback: 'serverError',
        variables: {}
    };
};
exports.checkUserAccessPermission = (variables, itemToAccess) => {
    if (variables.userEmail !== itemToAccess.owner) {
        throw {
            status: 401,
            text: `User don't have authorization to give access to item.`,
            callback: 'noPermissionToGiveAccess',
            variables: {
                itemInUse: variables.itemInUse
            }
        };
    }
    else {
        return true;
    }
};
/*

        CHANGE ITEM

*/
// Check if there is a item in user profile
exports.checkItemList = (userItemsList) => {
    if (userItemsList === null || userItemsList === undefined || !userItemsList)
        throw {
            status: 404,
            text: `No items in user profile check if Onboard was made.`,
            callback: 'noOnboard',
            variables: {}
        };
};
//# sourceMappingURL=errors.js.map