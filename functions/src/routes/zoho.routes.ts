import * as express from "express";
import * as cors from "cors";
import { sendQuoteToZoho } from "../zoho/zoho.api";
import { sendQuotationZoho } from "../environment/zoho.flow";
import { checkRequestVariables } from "../model/errors";


const zoho = express();
const router = express.Router();
zoho.use(cors({origin: true}));

router.get("/upsert", async (request, response) => {
    try {
        console.log(request.path)
        const variables = "test";
        const zoho = new sendQuoteToZoho(variables);
        const result = await zoho.upsertLead()
        response.send(result);
    } catch (error) {
        response.send(error)
    };
});

zoho.use('/zoho', router);
module.exports = zoho; 