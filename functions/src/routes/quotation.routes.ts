import * as express from "express";
import * as cors from "cors";
import { tireQuoteVariables } from "../environment/quotation.variables";
import { executeTiresQuote, executeAutoQuote } from "../controller/quote.controller";


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

quote.get("/tires/messenger", async (request, response) => {
    try {
        console.log(request.path)
        const variables = await tireQuoteVariables(request.query);
        const result = await executeTiresQuote(variables);
        response.send(result);
    } catch (error) {
        response.send(error)
    };
});



// ---------- AUTO ----------

quote.get("/auto", async (request, response) => {
    // try {
    //     console.log(request.path)
    //     const variables = await tireQuoteVariables(request.query);
    //     // const result = await executeAutoQuote();
    //     response.send(result);
    // } catch (error) {
    //     response.send(error)
    // };
});

quote.get("/auto/messenger", async (request, response) => {
    // try {
    //     console.log(request.path)
    //     const variables = await tireQuoteVariables(request.query);
    //     const result = await executeAutoQuote(variables);
    //     response.send(result);
    // } catch (error) {
    //     response.send(error)
    // };
});


module.exports = quote; 