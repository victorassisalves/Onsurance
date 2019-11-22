import * as express from "express";
import * as cors from "cors";
import { firstAccessVariables } from "../environment/messenger";
import { getfirstAccess } from "../controller/firstAccessController";
import { userProfileDbRefRoot } from "../database/customer.database";
import { getDatabaseInfo, updateDatabaseInfo } from "../model/databaseMethods";
import { checkMessengerId } from "../model/errors";
import { firstAccessResponse } from "../environment/responses.messenger";

const firstAccess = express();
// Automatically allow cross-origin requests
firstAccess.use(cors({ origin: true }));
// firstAccess.use(authMiddleware);

firstAccess.post(`/messenger`, async (request, response) => {
    try {
        const variables = await firstAccessVariables(request, response);
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
                pronAccess: result.access.pronAccess,
                userEmail: variables.userEmail,
            }
        };

        const messengerResp = firstAccessResponse(send.variables);
        response.json(messengerResp);  

    } catch (error) {
        const resp = require('../environment/responses.messenger');
        if (error.status) response.status(error.status).send(resp[error.callback](error.variables));
        response.send(error);
    };
});

module.exports = firstAccess;