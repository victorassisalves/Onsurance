import * as express from "express";
import * as cors from "cors";
import { changeItemVariables } from "../environment/messenger";
import { userProfileDbRefRoot } from "../database/customer.database";
import { getDatabaseInfo } from "../model/databaseMethods";
import { checkMessengerId } from "../model/errors";
import { getItemList } from "../controller/items.controller";
import { showItemsListInGalery } from "../environment/responses.messenger";

const items = express();
// Automatically allow cross-origin requests
items.use(cors({ origin: true }));
// onsurance.use(authMiddleware);

items.post(`/list/messenger`, async (request, response) => {
    console.log(request.path);
    try {
        /**
         * To Do
         *  Check for user messenger id
         */
        const variables = await changeItemVariables(request, response);

        const userDbPath = await userProfileDbRefRoot(variables.userEmail);

        const messengerId = await getDatabaseInfo(userDbPath.child("/personal/messengerId"));
        await checkMessengerId(messengerId, variables);

        const result = await getItemList(variables);

        const messengerResponse = await showItemsListInGalery(result);

        response.json(messengerResponse);
    } catch (error) {
        console.error(new Error(` Error: ${JSON.stringify(error)}.`));
        const resp = require('../environment/responses.messenger');
        if (error.status) response.status(error.status).json(resp[error.callback](error.variables));
        response.send(error);
    };
});

items.get(`/messenger`, async (request, response) => {
    try {
        console.log(request.path);
        response.send(request.path);
    } catch (error) {
        const resp = require('../environment/responses.messenger');
        if (error.status) response.status(error.status).send(resp[error.callback](error.variables));
        response.send(error);
    };
});

module.exports = items;