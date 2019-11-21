import * as express from "express";
import * as cors from "cors";
import { getProtectionVariables, changeItemVariables } from "../environment/messenger";
import { userProfileDbRefRoot } from "../database/customer.database";
import { getDatabaseInfo, updateDatabaseInfo } from "../model/databaseMethods";
import { checkMessengerId } from "../model/errors";

const items = express();
// Automatically allow cross-origin requests
items.use(cors({ origin: true }));
// onsurance.use(authMiddleware);

items.get(`/list/messenger`, async (request, response) => {
    try {
        console.log(request.path);

        // TODO - Get list of items
        const variables = changeItemVariables(request, response);
        response.send(variables);
    } catch (error) {
        const resp = require('../environment/responses.messenger');
        if (error.status) response.status(error.status).send(resp[error.callback](error.variables));
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