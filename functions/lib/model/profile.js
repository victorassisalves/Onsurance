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
const log_1 = require("../model/log");
exports.profileMethods = (dbPath) => __awaiter(this, void 0, void 0, function* () {
    const getProfileInfo = () => {
        return dbPath.once('value').then((result) => {
            return result.val();
        }).catch((error) => {
            console.error(new Error(`Error getting profile. - ${error}.`));
            throw {
                status: 401,
                text: `Error getting profile`
            };
        });
    };
    const setProfileInfo = (content) => {
        return dbPath.set(content).then(() => {
            log_1.log(`Created Profile!`);
            return {
                status: 200,
                text: `Profile Created.`
            };
        }).catch((error) => {
            console.error(new Error(`Error setting content on profile. - ${error}.`));
            throw {
                status: 401,
                text: `Error setting content on profile`
            };
        });
    };
    const updateProfileInfo = (content) => {
        return dbPath.update(content).then((result) => {
            log_1.log(`Content updated on profile.`);
            return {
                status: 200,
                text: `Profile Updated.`
            };
        }).catch((error) => {
            console.error(new Error(`Error updating content on profile. - ${error}.`));
            throw {
                status: 401,
                text: `Error updating content on profile`
            };
        });
    };
    return {
        getProfileInfo: getProfileInfo,
        setProfileInfo: setProfileInfo,
        updateProfileInfo: updateProfileInfo
    };
});
//# sourceMappingURL=profile.js.map