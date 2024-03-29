import * as express from "express";
import * as cors from "cors";
import { sendQuoteToZoho } from "../zoho/zoho.api";
import { tireQuoteVariables, TireQuoteVariables } from "../environment/quotation.variables";
import { executeTiresQuote, executeAutoQuote } from "../controller/quote.controller";
import { quote_autoResponse, quote_ErrorResponse, quote_ErrorDefaultResponse, quote_tireResponse } from "../environment/messenger/messenger.responses";
import { sendQuotationZoho } from "../environment/zoho.flow";
import { checkRequestVariables } from "../model/errors";
import { SendQuoteEmail } from "../email/sendEmail";

interface Result {
    privateApi: Object;
    publicApi: Object
}

const quote = express();
const router = express.Router();

const email = new SendQuoteEmail();
quote.use(cors({origin: true}));

router.get("/tires", async (request, response) => {
    try {
        console.log(request.path)
        console.log(`TCL: request.query`, request.query);
        const variables: TireQuoteVariables = await tireQuoteVariables(request.query);
        console.log(`TCL: variables`, variables);
        const result = executeTiresQuote(variables);
        // const privateApi = {
        //     ...variables,
        //     ...result
        // }
        // console.log(`TCL: privateApi`, JSON.stringify(privateApi));

        response.send(result.publicApi);
    } catch (error) {
        response.send(error)
    };
});

router.post("/tires/messenger", async (request, response) => {
    try {
        console.log(request.path)
        let requestVariables = request.body;
        if (parseInt(requestVariables.dailyUsage) < 10){
            requestVariables.dailyUsage = `0${request.body.dailyUsage},00`
        } else {
            requestVariables.dailyUsage = `${request.body.dailyUsage},00`
        }

        const variables: TireQuoteVariables = await tireQuoteVariables(requestVariables);
        const result = executeTiresQuote(variables);

        email.sendQuoteTireResult(result.privateApi);

        // const zoho = new sendQuoteToZoho(variables);
        // const resp = zoho.upsertLead();
        // console.log(`TCL: Zoho Response: `, resp);
        const ass24h = checkRequestVariables("assistência 24 horas", request.body.ass24h, String, false)
        const messengerResponse = quote_tireResponse(result.publicApi, ass24h);
        return response.send(messengerResponse);
    } catch (error) {
        console.error(new Error(`Erro ao executar cotação para messenger: ${JSON.stringify(error)}`));
        if (error.block) {
            const messengerResponse = quote_ErrorResponse(error.message, error.block)
            return response.send(messengerResponse);
        };
        
        return response.send(quote_ErrorDefaultResponse());
    };
});



// ---------- AUTO ----------

router.post("/auto", async (request, response) => {
    
    const userInput = request.body;
    console.log(`TCL: userInput`, JSON.stringify(userInput));

    await executeAutoQuote(userInput).then(async (result: Result) => {
        const zoho = sendQuotationZoho(result.privateApi);
        response.send(result.publicApi)
    }).catch(error => {
        response.send(error)
    });
});

router.post("/auto/messenger", async (request, response) => {
    try {
        console.log(request.path)

        interface Result {
            privateApi: Object;
            publicApi: Object
        }
        
        const userInput = request.body;

        if (userInput.thirdPartyCoverage < 100000){
            const thirdParty = ((userInput.thirdPartyCoverage).toString()).slice(0, 2);
            userInput.thirdPartyCoverage = parseInt(thirdParty);
        } else {
            const thirdParty = ((userInput.thirdPartyCoverage).toString()).slice(0, 3);
            userInput.thirdPartyCoverage = parseInt(thirdParty);
        };

        await executeAutoQuote(userInput).then(async (result: Result) => {
            const zoho = sendQuotationZoho(result.privateApi);
            const ass24h = checkRequestVariables("assistência 24 horas", userInput.ass24h, String, false);
            email.sendQuoteAutoResult(result.privateApi);

            const messengerResponse = quote_autoResponse(result.publicApi, ass24h);
            return response.json(messengerResponse);
        }).catch(error => {
            console.error(new Error(`Erro ao executar cotação para messenger: ${JSON.stringify(error)}`));
            if (error.block) {
                const messengerResponse = quote_ErrorResponse(error.message, error.block)
                return response.send(messengerResponse);
            };
            
            return response.send(quote_ErrorDefaultResponse());
        });
    } catch (error) {
        console.error(new Error(`Erro ao iniciar cotação para messenger: ${JSON.stringify(error)}`));
        if (error.block) {
            const messengerResponse = quote_ErrorResponse(error.message, error.block)
            return response.send(messengerResponse);
        };
        
        return response.send(quote_ErrorDefaultResponse());
    };
});

quote.use('/quote', router);
module.exports = quote; 