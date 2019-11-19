import * as express from "express";
import * as cors from "cors";
import { firstAccessVariables, userUsingDiffMessenger, alreadyDidFirstAccess } from "../environment/messenger";
import { doFirstAccess } from "../controller/firstAccessController";
import { userProfileDbRefRoot } from "../database/customer.database";
import { getDatabaseInfo } from "../model/databaseMethods";
import { checkMessengerId } from "../model/errors";

const firstAccess = express();
// Automatically allow cross-origin requests
firstAccess.use(cors({ origin: true }));
// firstAccess.use(authMiddleware);

firstAccess.get(`/messenger`, async (request, response) => {
    try {
        const variables = await firstAccessVariables(request, response);
        console.log("/messenger - First Access.");

        // Checking messenger variable here because other requisitions may not have messenger (Onsurance app, zoho bot and so on...)
        const userDbPath = await userProfileDbRefRoot(variables.userEmail).child("personal")
        const messengerId = await getDatabaseInfo(userDbPath.child(`messengerId`));
        console.log("TCL: messengerId", messengerId)

        // ERROR check for different messenger ID
        // tslint:disable-next-line: triple-equals
        await checkMessengerId(messengerId, variables);

        // tslint:disable-next-line: triple-equals
        if (variables.messengerId == messengerId) throw {
            status: 409, // Conflict
            text: `User already did first access.`,
            callback: alreadyDidFirstAccess,
            variables: {}
        };


        const result = await doFirstAccess(variables);
        response.send(result);  
    } catch (error) {
        response.send(error);
    };
    // try {
    //     console.log("/messenger - First Access.");
    //     const variables = await require('./environment/messenger').firstAccessVariables(request, response);

    //     console.log("TCL: variables", variables);
    //     const firstAccess = await require('./controller/firstAccessController');

    //     const result = await firstAccess.doFirstAccess(variables)
    //     console.log("TCL: result", result)
    //     // const getResponse = await messenger[`${result.callback}`](result.variables);
    //     // console.log("TCL: getResponse", getResponse);
    //     response.json({firstAccess: true})
       
    // } catch (error) {
    //     console.error(new Error(`Error in first access controller. ${error}.`));
    //     // console.error(new Error(`Error Status: ${error.status}`));
    //     // console.error(new Error(`Error Description: ${error.text}`));
    //     if (error. status) response.json({error: error})
    //     response.json({
    //         "messages": [
    //             {
    //                 "text": "OOOoooppsss. Tivemos um pequeno erro em nosso servidor. Por favor verifique se está conectado à internet e tente novamente em 5 segundos."
    //             },
    //         ],
    //         "redirect_to_blocks": [
    //             `giveAccess`
    //         ]
    //     });
    // }
});

module.exports = firstAccess;