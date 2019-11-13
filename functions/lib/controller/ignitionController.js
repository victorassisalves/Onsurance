"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../database/database");
const databaseMethods_1 = require("../model/databaseMethods");
exports.ignition = (variables) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        const dbMethods = yield databaseMethods_1.databaseMethods();
        try {
            // GET database PATHS
            /**
             * @database is the user profile database path
             *
             */
            const database = yield database_1.userProfileDbRefPersonal(variables.email);
            // Get user profile on personal database
            const userProfile = yield dbMethods.getDatabaseInfo(database);
            console.log("TCL: returnIgnition -> userProfile", userProfile);
            // Check if user exists. If Not, throw error
            //CHECK FOR ONBOARD???
            if (userProfile === null || userProfile === undefined) {
                throw {
                    status: 404,
                    text: `User ${variables.email} not found.`
                };
            }
            ;
            let chatfuel_block_id = `5c894cf10ecd9f1d82d179b4`;
            if (variables.value == false || variables.value == 'false') {
                chatfuel_block_id = `5c894cfe0ecd9f1d82d17e69`;
            }
            const messengerId = userProfile.messengerId;
            // Check if user exists. If Not, throw error
            //CHECK FOR ONBOARD???
            if (messengerId === null || messengerId === undefined) {
                throw {
                    status: 404,
                    text: `User ${variables.userEmail} without messenger id.`
                };
            }
            ;
            console.log("TCL: returnIgnition -> messengerId", messengerId);
            // const urlHomolog = `https://api.chatfuel.com/bots/5d1513f28955f00001fadda7/users/${messengerId}/send`
            // const homologToken = 'qwYLsCSz8hk4ytd6CPKP4C0oalstMnGdpDjF8YFHPHCieKNc0AfrnjVs91fGuH74'
            const urlProdution = `https://api.chatfuel.com/bots/5a3ac37ce4b04083e46d3c0e/users/${messengerId}/send`;
            const productionToken = "qwYLsCSz8hk4ytd6CPKP4C0oalstMnGdpDjF8YFHPHCieKNc0AfrnjVs91fGuH74";
            const request = yield require("request");
            const options = {
                method: 'POST',
                url: urlProdution,
                qs: {
                    chatfuel_token: productionToken,
                    chatfuel_block_id: chatfuel_block_id
                },
                headers: { 'cache-control': 'no-cache',
                    Connection: 'keep-alive',
                    'Content-Length': '0',
                    'Accept-Encoding': 'gzip, deflate',
                    Host: 'api.chatfuel.com',
                    'Cache-Control': 'no-cache',
                    Accept: '*/*',
                    'Content-Type': 'application/json' },
            };
            return yield request(options, function (error, resp, body) {
                if (error) {
                    console.error("TCL: Error in Send to messenger -> error", error);
                    reject({
                        status: 400,
                        text: `Failed to send message to user's menssenger. Error: ${JSON.stringify(error)}`
                    });
                }
                else {
                    console.log(`TCL: Body: ${JSON.stringify(body)}`);
                    console.log(`TCL: Resp: ${JSON.stringify(resp)}`);
                    console.log(`TCL: Message sent to Messenger`);
                    resolve({
                        status: 200,
                        text: `Message sent to Facebook Messenger. User warned about ignition.`
                    });
                }
            });
        }
        catch (error) {
            console.error("TCL: return ignition -> Failed warn user about ignition ", JSON.stringify(error));
            if (error.status)
                reject(error);
            reject({
                status: 500,
                text: `Failed warn user about ignition. ${error}`
            });
        }
        ;
    }));
};
//# sourceMappingURL=ignitionController.js.map