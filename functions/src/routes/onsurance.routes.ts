import * as express from "express";
import * as cors from "cors";
import { serverError } from "../environment/messenger/messenger.responses";
import { onsuranceTires, OnsuraceTiresVariables } from "../environment/messenger/messenger.variables";
import { compareMessengerId, checkFirstAccess } from "../test/messenger.test";
import { onsuranceTireOn } from "../controller/onsurance.controller";

const onsurance = express();
// Automatically allow cross-origin requests
onsurance.use(cors({ origin: true }));
// onsurance.use(authMiddleware);


/**
 * @description This endpoint is responsible for turning Onsurance Auto ON
 */
onsurance.post(`/auto/on/messenger`, async (req, res) => {
    try {
        const activateOnsurance = await require("../controller/onsurance.controller")
        const messenger = await require("../environment/messenger.variables");

        const variables = await messenger.getProtectionVariables(req, res);

        activateOnsurance.onsuranceProtection(variables).then(async result => {
            const getResponse = await messenger[`${result.callback}`](result.variables);

            res.status(result.status).json(getResponse)
        }).catch(async error => {
            console.error(`${JSON.stringify(error)}`);
            console.error(new Error(`Description: ${error.text}`));
            const getResponse = await messenger[`${error.callback}`](error.variables);
            console.log("TCL: getResponse", getResponse);
            
            res.json(getResponse)
        });
    } catch (error) {
        console.error(new Error(error))
        console.error(new Error(`Error in main function try catch. ${error}`))        
        res.json({
            "messages": [
                {
                    "text": "OOOoooppsss. Tivemos um pequeno erro em nosso servidor. Por favor verifique se está conectado à internet e tente novamente em 5 segundos."
                },
            ],
            "redirect_to_blocks": [
                `Ligar`
            ]
        });
    }
});


onsurance.post(`/tire/on/messenger`, async (req, res) => {
    console.log(req.path);
    try {
        const variables: OnsuraceTiresVariables = await onsuranceTires(req.body);
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

module.exports = onsurance;