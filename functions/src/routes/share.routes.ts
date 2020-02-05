import * as express from "express";
import * as cors from "cors";
import { compareMessengerId } from "../test/messenger.test";

import { shareOnsuranceTires } from "../controller/share.controller";
import { shareOnsuranceTireVariables } from "../environment/messenger/messenger.variables";
import { giveAccessMessenger, serverError } from "../environment/messenger/messenger.responses";

const share = express();

share.use(cors({origin: true}));

share.post("/auto", async (req,res) => {
    return true;
});

share.post("/tires", async (req, res) => {
    try {
        console.log(req.path);
        const variables = await shareOnsuranceTireVariables(req, res);
        await compareMessengerId(variables.userEmail, variables.messengerId);
        shareOnsuranceTires(variables).then((result: any) => {
            console.log(`TCL: result`, result);
            const response = giveAccessMessenger(variables);
            return res.send(response);
        }).catch(async (error) => {
            console.log(`TCL: error`, error);
            const messenger = await require("../environment/messenger/messenger.responses");
            const getResponse = await messenger[`${error.callback}`](error.variables);
            console.log("TCL: getResponse", getResponse);
            res.json(getResponse)
        });
        
    } catch (error) {
        console.error(error);

        /**
         * @todo 
         *  adequade response
         */
        if (error.calback) {
            const messenger = await require("../environment/messenger/messenger.responses");
            const getResponse = await messenger[`${error.callback}`](error.variables);
            console.log("TCL: getResponse", getResponse);
            
            res.json(getResponse)
        };
        const response = serverError()
        res.send(response);
    }
    
});

module.exports = share;