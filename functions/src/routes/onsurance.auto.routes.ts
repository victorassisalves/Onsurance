import * as express from "express";
import * as cors from "cors";
import { getProtectionVariables } from "../environment/messenger/messenger.variables";
import { onsuranceProtection } from "../controller/protectionController";

const onsurance = express();
onsurance.use(cors({origin: true}));

onsurance.post("/messenger", async (req, res) => {
    try {

        const response = await require("../environment/messenger/messenger.responses")

        const variables = await getProtectionVariables(req, res);

        onsuranceProtection(variables).then(async (result: any) => {
            const getResponse = await response[`${result.callback}`](result.variables);

            return res.status(result.status).json(getResponse)
        }).catch(async error => {
            console.error(`${JSON.stringify(error)}`);
            console.error(new Error(`Description: ${error.text}`));

            const getResponse = await response[`${error.callback}`](error.variables);
            console.log("TCL: getResponse", getResponse);
            
            return res.json(getResponse)
        });
    } catch (error) {
        console.error(new Error(error))
        console.error(new Error(`Error in main function try catch. ${error}`))        
        return res.json({
            "messages": [
                {
                    "text": "OOOoooppsss. Tivemos um pequeno erro em nosso servidor. Por favor verifique se está conectado à internet e tente novamente em 5 segundos."
                },
            ],
            "redirect_to_blocks": [
                `protectionRouter`
            ]
        });
    }
})

module.exports = onsurance