import * as express from "express";
import * as cors from "cors";
import { tireQuoteVariables } from "../environment/quotation.variables";
import { executeTiresQuote } from "../controller/quote.controller";


const quote = express();

quote.use(cors({origin: true}));

quote.get("/tires", async (request, response) => {
    try {
        console.log(request.path)
        const variables = await tireQuoteVariables(request.query);
        const result = await executeTiresQuote(variables);
        response.send(result);
    } catch (error) {
        response.send(error)
    };
});


module.exports = quote; 