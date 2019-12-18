import * as express from "express";
import * as cors from "cors";
import { serverError } from "../environment/messenger/messenger.responses";
import { onsuranceTires, OnsuraceTiresVariables } from "../environment/messenger/messenger.variables";
import { compareMessengerId, checkFirstAccess } from "../test/messenger.test";
import { onsuranceTireOn, onsuranceTireOff } from "../controller/onsurance.controller";

const onsurance = express();
// Automatically allow cross-origin requests
onsurance.use(cors({ origin: true }));
// onsurance.use(authMiddleware);


onsurance.post(`/on/messenger`, async (req, res) => {
    console.log(req.path);
    try {
        const variables: OnsuraceTiresVariables = await onsuranceTires(req.body);
        if (variables.accident === false) {
            throw {
                callback: 'TireRes_activationFail',
                variables: {}
            };
        };
        const dbMessengerId = await compareMessengerId(variables.userEmail, variables.messengerId);
        checkFirstAccess(dbMessengerId);
        const result = await onsuranceTireOn(variables);
        return res.send(result);
    } catch (error) {
        console.error(new Error(`Error: ${JSON.stringify(error)}`));
        if (error.callback) {
            const response = await require(`../environment/messenger/messenger.responses`)[error.callback](error.variables);
            return res.send(response);
        };
        const response = serverError();
        return res.send(response);
    }
});


onsurance.post(`/off/messenger`, async (req, res) => {
    console.log(req.path);
    try {
        const variables: OnsuraceTiresVariables = await onsuranceTires(req.body);
        if (variables.accident === true) {
            throw {
                callback: 'TireRes_deactivationFail',
                variables: {}
            };
        };
        const dbMessengerId = await compareMessengerId(variables.userEmail, variables.messengerId);
        checkFirstAccess(dbMessengerId);
        const result = await onsuranceTireOff(variables);
        return res.send(result);
    } catch (error) {
        console.error(new Error(`Error: ${JSON.stringify(error)}`));
        if (error.callback) {
            const response = await require(`../environment/messenger/messenger.responses`)[error.callback](error.variables);
            return res.send(response);
        };
        const response = serverError();
        return res.send(response);
    }
});

module.exports = onsurance;