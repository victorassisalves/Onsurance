import { databaseMethods, getDatabaseInfo } from "../../model/databaseMethods";
import { userProfileDbRefPersonal } from "../../database/database";
import { checkRequestVariables, validateEmail } from "../../model/errors";
import { serverError } from "./messenger.responses";

// request.query comes from get
// request.body comes from post

/*
    VARIABLES
*/

// Variables for protection endpoint
export const getProtectionVariables = async (request, response) => {
    try {
        console.log(request.body);
        const allPolicies = []
        const on = [];
        const off = [];
        const checkString = (status, key) => {
            // tslint:disable-next-line: triple-equals
            const boolValue = status.toLowerCase() == 'true' ? true : false;
            allPolicies.push(boolValue);
            boolValue === true ? on.push(key) : off.push(key)
            return boolValue  
        };
        const policies = {
            theft: checkString(request.body["theft"], 'theft'),
            accident: checkString(request.body["accident"], 'accident'),
            thirdParty: checkString(request.body["thirdParty"], 'thirdParty'),
        };
        
        console.log("TCL: exports.getProtectionVariables -> allPolicies", allPolicies)
        
        const checkProtection = () => {
            return {
                allOff: allPolicies.every(status => status === false),
                allOn: allPolicies.every(status => status === true),
                on: on,
                off: off,
            }
        }
        const statusProtection = await checkProtection();
        console.log("TCL: exports.getProtectionVariables -> statusProtection", statusProtection);
        
        const protectionVariables = {
            userEmail:(request.body["userEmail"]).toLowerCase(),
            timezone:request.body["timezone"] || -3,
            itemInUse: request.body["itemInUse"].toLowerCase(),
            messengerId: request.body["messenger user id"],
            policies: policies,
            statusProtection: statusProtection
        }


        return protectionVariables
    } catch (error) {
        /*
            TODO: Set response to messenger standards
        */
        console.error(new Error(`Error to get variables for user ${request.body["email_address"]}. Error: ${error}.`));
        response.json({
            "messages": [
                {
                    "text": "Erro com varáveis. Verifique se os dados enviados estão corretos e tente novamente."
                },
            ],
            "redirect_to_blocks": [
                `Informar Email`
            ]
        });
    }
    
};

export const giveAccessVariables = async (request, response) => {
    try {
        console.log(request.body);
        
        const accessVariables = {
            userEmail:(request.body["userEmail"]).toLowerCase(),
            thirdPartyEmail:request.body["thirdPartyEmail"].toLowerCase(),
            itemToAccess: request.body["itemToAccess"].toLowerCase(),
            messengerId: request.body["messenger user id"],
        }


        // Checking messenger variable here because other requisitions may not have messenger (Onsurance app, zoho bot and so on...)
        const ownerDbPath = await userProfileDbRefPersonal(accessVariables.userEmail)
        const dbMethods = await databaseMethods();
        const messengerId = await dbMethods.getDatabaseInfo(ownerDbPath.child(`messengerId`));
        console.log("TCL: doBackup -> messengerId", messengerId)
        if (messengerId === undefined || messengerId === null) throw {
            status: 404, //Not found
            text: `No messenger id found in user ${accessVariables.userEmail} account.`,
            callback: `giveAccessNoMessenger`,
            variables: {}
        };
        // tslint:disable-next-line: triple-equals
        if (accessVariables.messengerId != messengerId && messengerId !== null) throw {
            status: 401, // Unauthorized
            text: `User is using a different messenger account.`,
            callback: `giveAccessNoMessenger`,
            variables: {}
        };
        return accessVariables
    } catch (error) {
        /*
            TODO: Set response to messenger standards
        */

        if(error.status) {
            console.error(new Error(`Error status: ${error.status}`));
            console.error(new Error(`Error description: ${error.text}`));
            console.log("TCL: giveAccessVariables -> error[`callback`]()", error[`callback`]())
            const callback = error.callback
            console.log("TCL: giveAccessVariables -> callback", callback())
            response.json(callback(error.variables))
        } else {
            /*

                TODO:
                    get the right block of messenger

            */
            console.error(new Error(`Error to get variables for user ${request.body["email_address"]}. Error: ${error}.`));

            response.json({
                "messages": [
                    {
                        "text": "Erro com varáveis. Verifique se os dados enviados estão corretos e tente novamente."
                    },
                ],
                "redirect_to_blocks": [
                    `Informar Email`
                ]
            });
        }
    }
};

export const firstAccessVariables = async (request, response) => {
    try {
        const accessVariables = {
            userEmail:checkRequestVariables('UserEmail', request["userEmail"], String),
            firstName:checkRequestVariables('First Name', request["firstName"]),
            lastName:checkRequestVariables('Last Name', request["lastName"]),
            messengerId: checkRequestVariables('Messenger Id', request["messengerId"], String),
        }

        return accessVariables
    } catch (error) {
        /*
            TODO: Set response to messenger standards
        */
       if (error.callback) throw error

        console.error(new Error(`Error to get variables for user ${request.query["email_address"]}. Error: ${error}.`));

        response.json({
            "messages": [
                {
                    "text": "Erro com varáveis. Verifique se os dados enviados estão corretos e tente novamente."
                },
            ],
            "redirect_to_blocks": [
                `errorInVariablesOnboard`
            ]
        });
    }
};

export const indicationVariables = async (request, response) => {
    try {
        console.log(request.body);
        
        const indicationVariables = {
            userEmail:(request.body["indicatedUserEmail"]).toLowerCase(),
            indicatorEmail:request.body["indicator"].toLowerCase(),
            messengerId: request.body["messenger user id"],
            firstName: request.body["first name"],
            lastName: request.body["last name"],
        };

        // Error check for owner account NOT exist
        if (indicationVariables.indicatorEmail == indicationVariables.userEmail) throw {
            status: 409, // Conflict
            text: `Indicator is equal to indicated.`,
            callback: `indicatorEqualIndicated`,
            variables: {
                userEmail: indicationVariables.userEmail
            }
        };

        return indicationVariables
    } catch (error) {
        /*
            TODO: 
                Set response to messenger standards
                get the right block of messenger
        */

       if(error.status) {
            console.error(new Error(`Error status: ${error.status}`));
            console.error(new Error(`Error description: ${error.text}`));
            console.log("TCL: error[`callback`]()", error[`callback`]())
            const callback = error.callback
            console.log("TCL: callback", callback())
            return response.json(callback(error.variables))
        } else {
            console.error(new Error(`Error to get variables for user ${request.body["userEmail"]}. Error: ${error}.`));

            response.json({
                "messages": [
                    {
                        "text": "Erro com varáveis. Verifique se os dados enviados estão corretos e tente novamente."
                    },
                ],
                "redirect_to_blocks": [
                    `validateIndication`
                ]
            });
        };
    };
};

export const saveIndicatorVariables = async (request, response) => {
    try {
        console.log(request.body);
        
        const indicationVariables = {
            userEmail: request.body["email_address_indicacao"].toLowerCase(),
            firstName: request.body["first name"],
            lastName: request.body["last name"],
            messengerId: request.body["messenger user id"],
        };

        return indicationVariables
    } catch (error) {
        /*
            TODO: 
                Set response to messenger standards
                get the right block of messenger
        */

       if(error.status) {
            console.error(new Error(`Error status: ${error.status}`));
            console.error(new Error(`Error description: ${error.text}`));
            console.log("TCL: error[`callback`]()", error[`callback`]())
            const callback = error.callback
            console.log("TCL: callback", callback())
            return response.json(callback(error.variables))
        } else {
            console.error(new Error(`Error to get variables for user ${request.body["userEmail"]}. Error: ${error}.`));

            response.json({
                "messages": [
                    {
                        "text": "Erro com varáveis. Verifique se os dados enviados estão corretos e tente novamente."
                    },
                ],
                "redirect_to_blocks": [
                    `validateIndication`
                ]
            });
        };
    };
};

/**
 * @description This function organizes the variables from the payload to prepare for turnnig Onsurace Tires ON or OFF
 * @param req Payload from the request. req.body
 * @param res Response from the function in case something goes wrong here
 */
export interface OnsuraceTiresVariables {
    userEmail: string,
    messengerId: string,
    tireVehicleId: string
    accident: boolean,
    timezone?: number
}
export const onsuranceTires = async (req) => {
    try {
        const onsuranceTires = {
            userEmail: checkRequestVariables('userEmail', req.userEmail, String),
            messengerId: checkRequestVariables("messengerId", req.messengerId, String),
            tireVehicleId: checkRequestVariables(`Tire Vehicle ID`, req.tireVehicleId, String),
            accident: checkRequestVariables(`Tire Accident`, req.tireAccident, Boolean),
            timezone: checkRequestVariables(`Timezone`, req.timezone, Number, false),
        };

        return onsuranceTires
    } catch (error) {
        console.error(new Error(`Error while getting variables: ${JSON.stringify(error)}.`));
        throw error;    
    };
};

export const getItemListVariables = async (req, res) => {
    try {
        const getItems = {
            userEmail: checkRequestVariables('userEmail', req.userEmail, String),
            messengerId: checkRequestVariables("messengerId", req.messengerId, String)
        };
        return getItems;
    } catch (error) {
        console.error(new Error(`Error to get variables for user ${req.body["userEmail"]}. Error: ${JSON.stringify(error)}.`));

        res.json({
            "messages": [
                {
                    "text": "Erro com varáveis. Vou te encaminhar para um especialista. Aguarde somente um momento."
                },
            ],
            "redirect_to_blocks": [
                `Human interaction`
            ]
        });
    };
};

/**
 * @description This function returns the treated variables for usage. Get the variables for auto usage
 * @param req The requested variables from ulr params (req.query)
 * @param res Response form endpoint
 */
export const getAutoInfoVariables = async (req, res) => {
    try {
        const getTireInfo = {
            userEmail: checkRequestVariables('userEmail', req.userEmail, String),
            messengerId: checkRequestVariables("messenger user id", req.messengerId, String),
            itemInUse: checkRequestVariables("item in use", req.itemInUse, String, true),
        };
        
        return getTireInfo;
    } catch (error) {
        console.error(new Error(`Error to get variables for user ${req["userEmail"]}. Error: ${JSON.stringify(error)}.`));

        res.json({
            "messages": [
                {
                    "text": "Erro com varáveis. Vamos tentar novamente, caso o erro se repita, por favor entre em contato com nossos especialistas."
                },
            ],
            "redirect_to_blocks": [
                `changeItemRouter`
            ]
        });
    };
};
/**
 * @description This function returns the treated variables for usage. Get the specific tire information for specific vehicle
 * @param req The requested variables from ulr params (req.query)
 * @param res Response form endpoint
 */
export const getTiresInfoVariables = async (req, res) => {
    try {
        const getTireInfo = {
            userEmail: checkRequestVariables('userEmail', req.userEmail, String),
            messengerId: checkRequestVariables("messenger user id", req.messengerId, String),
            tireVehicleId: checkRequestVariables("tire vehicle Id", req.tireVehicleId, String),
        };
        
        return getTireInfo;
    } catch (error) {
        console.error(new Error(`Error to get variables for user ${req["userEmail"]}. Error: ${JSON.stringify(error)}.`));

        res.json({
            "messages": [
                {
                    "text": "Erro com varáveis. Vamos tentar novamente, caso o erro se repita, por favor entre em contato com nossos especialistas."
                },
            ],
            "redirect_to_blocks": [
                `changeItemRouter`
            ]
        });
    };
};

export interface ShareOnsuranceTireVariables {
    userEmail: string;
    thirdPartyEmail: string;
    itemToAccess: string;
    messengerId: string;
};

export const shareOnsuranceTireVariables = async (req, res) => {
    try {
        console.log(req.body);
        
        const variables =  {
            userEmail: validateEmail(req.body["userEmail"]),
            thirdPartyEmail: validateEmail(req.body["thirdPartyEmail"]),
            itemToAccess: checkRequestVariables("Tires to have Access", req.body["itemToGiveAccess"], String),
            messengerId: checkRequestVariables("Messenger Id", req.body["messengerId"], String),
        };
        return variables;
    } catch (error) {
        /*

            TODO:
                get the right block of messenger
                - Block that share tire insurance

        */
        console.error(new Error(`Error getting variables. Error: ${JSON.stringify(error)}.`));
        return res.send(error);
        // return res.json({
        //     "messages": [
        //         {
        //             "text": "Erro com varáveis. Verifique se os dados enviados estão corretos e tente novamente."
        //         },
        //     ],
        //     "redirect_to_blocks": [
        //         // `Informar Email` - Get Block
        //     ]
        // });
    }
};


/*

        SEND MESSAGE TO MESSENGER

*/


export const sendMessage = variables =>{
    // const urlHomolog = `https://api.chatfuel.com/bots/5b6c74f30ecd9f13f0f036e3/users/${messengerId}/send`
    // const homologToken = 'qwYLsCSz8hk4ytd6CPKP4C0oalstMnGdpDjF8YFHPHCieKNc0AfrnjVs91fGuH74'

    const urlProdution = `https://api.chatfuel.com/bots/5a3ac37ce4b04083e46d3c0e/users/${variables.messengerId}/send`
    const productionToken = "qwYLsCSz8hk4ytd6CPKP4C0oalstMnGdpDjF8YFHPHCieKNc0AfrnjVs91fGuH74"
    const request = require("request");

    const options = { method: 'POST',
    url: urlProdution,
    qs: { 
        chatfuel_token: productionToken,
        chatfuel_message_tag: variables.messageTag,
        chatfuel_block_id: '5d07a75fb65696000157825d',
        text: variables.text 
    },
    headers: 
    { Connection: 'keep-alive',
        'content-length': '',
        'accept-encoding': 'gzip, deflate',
        Host: 'api.chatfuel.com',
        Accept: '*/*',
        'User-Agent': 'PostmanRuntime/7.13.0' } };

    request(options, function (error, response, body) {
    if (error) console.error(new Error(error));

    console.log(body);
});           
};
