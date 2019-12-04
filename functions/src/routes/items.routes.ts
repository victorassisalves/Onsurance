import * as express from "express";
import * as cors from "cors";
import { getItemListVariables } from "../environment/messenger";
import { userProfileDbRefRoot } from "../database/customer.database";
import { getDatabaseInfo } from "../model/databaseMethods";
import { checkMessengerId } from "../model/errors";
import { getItemList, getAutoList, getTiresList } from "../controller/items.controller";
import { showItemsListInGalery, serverError } from "../environment/responses.messenger";

const items = express();
// Automatically allow cross-origin requests
items.use(cors({ origin: true }));
// onsurance.use(authMiddleware);

items.get(`/list/messenger`, async (request, response) => {
    console.log(request.path);
    try {
        /**
         * To Do
         *  Check for user messenger id
         */
        const variables = await getItemListVariables(request.query, response);

        const userDbPath = await userProfileDbRefRoot(variables.userEmail);

        const messengerId = await getDatabaseInfo(userDbPath.child("/personal/messengerId"));
        await checkMessengerId(messengerId, variables);

        const result = await getItemList(variables);

        const messengerResponse = await showItemsListInGalery(result);

        response.json(messengerResponse);
    } catch (error) {
        console.error(new Error(` Error: ${JSON.stringify(error)}.`));
        const resp = require('../environment/responses.messenger');
        if (error.callback) response.json(resp[error.callback](error.variables));
        const serverErrorMessenger = serverError()
        response.send(serverErrorMessenger);
    };
});

/**
 * @description Gets the list of automobile vehicles that have tire insurance to give it back for messenger in a quick reply form
 */
items.get(`/list/tires/messenger`, async (request, response) => {
    try {
        console.log(request.path);
        const variables = await getItemListVariables(request.query, response);
        const userDbPath = await userProfileDbRefRoot(variables.userEmail);

        const messengerId = await getDatabaseInfo(userDbPath.child("/personal/messengerId"));
        await checkMessengerId(messengerId, variables);
        
        const result = await getTiresList(variables);
        console.log(`TCL: result`, result);
        const resp = await require('../environment/responses.messenger');

        const messengerResponse = await resp[result.callback](result.variables);
        response.send(messengerResponse);
    } catch (error) {
        console.error(new Error(` Error: ${JSON.stringify(error)}.`));
        const resp = require('../environment/responses.messenger');
        if (error.callback) response.json(resp[error.callback](error.variables));
        const serverErrorMessenger = serverError()
        response.send(serverErrorMessenger);
    };
});

/**
 * @description Gets the list of automobile vehicles to give it back for messenger in a quick reply form
 */
items.get(`/list/auto/messenger`, async (request, response) => {
    try {
        console.log(request.path);
        const variables = await getItemListVariables(request.query, response);
        const userDbPath = await userProfileDbRefRoot(variables.userEmail);

        const messengerId = await getDatabaseInfo(userDbPath.child("/personal/messengerId"));
        await checkMessengerId(messengerId, variables);
        
        const result = await getAutoList(variables);
        console.log(`TCL: result`, result);
        const resp = await require('../environment/responses.messenger');

        const messengerResponse = await resp[result.callback](result.variables);
        response.send(messengerResponse);
    } catch (error) {
        console.error(new Error(` Error: ${JSON.stringify(error)}.`));
        const resp = require('../environment/responses.messenger');
        if (error.callback) response.json(resp[error.callback](error.variables));
        const serverErrorMessenger = serverError()
        response.send(serverErrorMessenger);
    };
});

module.exports = items;