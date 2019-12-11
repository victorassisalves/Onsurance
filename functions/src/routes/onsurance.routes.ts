import * as express from "express";
import * as cors from "cors";
import { userProfileDbRefRoot } from "../database/customer.database";
import { getDatabaseInfo, updateDatabaseInfo } from "../model/databaseMethods";
import { checkMessengerId } from "../model/errors";
import { serverError } from "../environment/responses.messenger";

const onsurance = express();
// Automatically allow cross-origin requests
onsurance.use(cors({ origin: true }));
// onsurance.use(authMiddleware);


/**
 * @description This endpoint is responsible for turning Onsurance Auto ON
 */
onsurance.post(`/auto/on/messenger`, async (req, res) => {
    try {
        console.log(req.path);
        res.send("ON")
    } catch (error) {
        console.error(new Error(`Error in ${req.path}. Error: ${JSON.stringify(error)}`));
        const resp = require('../environment/responses.messenger');
        if (error.callback) res.json(resp[error.callback](error.variables));
        const serverErrorMessage = serverError();
        res.send(serverErrorMessage);
    };
});

module.exports = onsurance;