import * as express from "express";
import * as cors from "cors";
import { compareMessengerId } from "../test/messenger.test";

import { shareOnsuranceTires } from "../controller/share.controller";

const share = express();

share.use(cors({origin: true}));

share.post("/auto", async (req,res) => {
    return true;
});

share.post("/tires", async (req, res) => {
    try {
        console.log(req.path);
        const variables = await require("../environment/messenger/messenger.variables").shareOnsuranceTireVariables(req, res);
        await compareMessengerId(variables.userEmail, variables.messengerId);
        const result = await shareOnsuranceTires(variables);
        return res.send(result);
    } catch (error) {
        /**
         * @todo 
         *  adequade response
         */
        console.error(error);
        res.send(error);
    }
    
});

module.exports = share;