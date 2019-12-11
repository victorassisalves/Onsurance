import * as express from "express";
import * as cors from "cors";
import { getItemListVariables, getTiresInfoVariables, getAutoInfoVariables } from "../environment/messenger.variables";
import { userProfileDbRefRoot } from "../database/customer.database";
import { getDatabaseInfo } from "../model/databaseMethods";
import { checkMessengerId } from "../model/errors";
import { getItemList, getAutoList, getTiresList, getTire, getAuto } from "../controller/items.controller";
import { showItemsListInGalery, serverError, changeTireOptions, setTireInfo, setVehicleInfo } from "../environment/responses.messenger";

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

        const result: Array<any> = await getItemList(variables);

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

export interface GetAuto {
    userEmail: string;
    messengerId: string
    itemInUse: string
};

items.get('/auto/messenger', async (req, res) => {
    try {
        console.log(req.path);
        const variables: GetAuto = await getAutoInfoVariables(req.query, res);
        const userDbPath = await userProfileDbRefRoot(variables.userEmail);

        const messengerId = await getDatabaseInfo(userDbPath.child("/personal/messengerId"));
        await checkMessengerId(messengerId, variables);
        
        const result = await getAuto(variables);

        const messengerResponse = setVehicleInfo(result.variables);
        res.send(messengerResponse);
    } catch (error) {
        console.error(new Error(` Error in get specific auto: ${JSON.stringify(error)}.`));
        const resp = await require('../environment/responses.messenger');
        if (error.callback) return res.json(resp[error.callback](error.variables));
        const serverErrorMessenger = serverError()
        res.send(serverErrorMessenger);
    };
});

export interface GetTire {
    userEmail: string;
    messengerId: string
    tireVehicleId: string
};

items.get('/tire/messenger', async (req, res) => {
    try {
        console.log(req.path);
        const variables: GetTire = await getTiresInfoVariables(req.query, res);
        const userDbPath = await userProfileDbRefRoot(variables.userEmail);

        const messengerId = await getDatabaseInfo(userDbPath.child("/personal/messengerId"));
        await checkMessengerId(messengerId, variables);
        
        const result = await getTire(variables);

        const messengerResponse = setTireInfo(result.variables);
        res.send(messengerResponse);
    } catch (error) {
        console.error(new Error(` Error in get specific tire: ${JSON.stringify(error)}.`));
        const resp = await require('../environment/responses.messenger');
        if (error.callback) return res.json(resp[error.callback](error.variables));
        const serverErrorMessenger = serverError()
        res.send(serverErrorMessenger);
    };
});


module.exports = items;