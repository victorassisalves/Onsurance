import * as express from "express";
import * as cors from "cors";
import { firstAccessVariables } from "../environment/messenger.variables";
import { getfirstAccess } from "../controller/firstAccessController";
import { userProfileDbRefRoot } from "../database/customer.database";
import { getDatabaseInfo, updateDatabaseInfo } from "../model/databaseMethods";
import { checkMessengerId } from "../model/errors";
import { firstAccessResponse, serverError, variableNull } from "../environment/responses.messenger";

const firstAccess = express();
// Automatically allow cross-origin requests
firstAccess.use(cors({ origin: true }));
// firstAccess.use(authMiddleware);

firstAccess.get(`/messenger`, async (request, response) => {
    try {
        const variables = await firstAccessVariables(request.query, response);
        console.log(request.path)

        // Checking messenger variable here because other requisitions may not have messenger (Onsurance app, zoho bot and so on...)
        const userDbPath = await userProfileDbRefRoot(variables.userEmail);
        const messengerId = await getDatabaseInfo(userDbPath.child(`personal/messengerId`));

        // ERROR check for different messenger ID
        await checkMessengerId(messengerId, variables);

        if (variables.messengerId == messengerId) throw {
            status: 409, // Conflict
            text: `User already did first access.`,
            callback: 'alreadyDidFirstAccess',
            variables: {}
        };

        const result = await getfirstAccess(variables);

        const profile = {
            lastName: variables.lastName, 
            messengerId: variables.messengerId
        };

        await updateDatabaseInfo(userDbPath.child('personal'), profile);

        const send = {
            variables: {
                tireAccess: result.access.tireAccess,
                autoAccess: result.access.autoAccess,
                userEmail: variables.userEmail,
            }
        };

        const messengerResp = firstAccessResponse(send.variables);
        console.log(`TCL: messengerResp`, messengerResp);
        return response.json(messengerResp);  
        
    } catch (error) {
        console.error(new Error(`TCL: error: ${JSON.stringify(error)}`));
        const resp = require('../environment/responses.messenger');
        if (error.callback) {
            if (error.callback === 'variableNull') response.json(variableNull('errorInVariablesOnboard'))
            response.json(resp[error.callback](error.variables));
        } else {
            const serverErrorMessenger = serverError();
            response.send(serverErrorMessenger);
        }
        
    };
});

module.exports = firstAccess;