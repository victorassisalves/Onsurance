"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require('firebase-functions');
const quotation_1 = require("./model/quotation");
const express = require('express');
const cors = require('cors');
// Woocommerce webhook request for clients purchases
exports.woocommerceRequest = functions.https.onRequest((request, response) => __awaiter(this, void 0, void 0, function* () {
    console.log("TCL: -> Woocommerce Request Function. Start:");
    console.log("TCL: -> ", JSON.stringify(request.body));
    const getPurchase = yield require("./controller/woocommerceController");
    getPurchase.woocommercePurchase(request).then((result) => __awaiter(this, void 0, void 0, function* () {
        const zoho = yield require("./environment/zoho.flow");
        zoho.sendWoocommerceZoho(request.body);
        response.status(result.status).send(result.text);
    })).catch(error => {
        response.status(error.status).send(error.text);
    });
}));
exports.onboardVehicles = functions.https.onRequest((request, response) => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log("TCL: Onboard Function. Start:");
        console.log("TCL: -> ", request.body);
        const getOnboardVariables = yield require('./environment/onboardVariables');
        // Get onboard set of variables.
        const variables = yield getOnboardVariables.getOnboardVariables(request, response);
        console.log("TCL: variables", variables);
        // get onboard controller
        const getOnboard = require("./controller/onboardController");
        getOnboard.clientOnboard(variables).then(result => {
            response.status(result.status).send(result.text);
        }).catch(error => {
            response.status(error.status).send(error.text);
        });
    }
    catch (error) {
        console.log("TCL: error", error);
        response.status(500).send(`Error on server. Check what happened.`);
    }
}));
exports.timezoneExperiment = functions.https.onRequest((request, response) => __awaiter(this, void 0, void 0, function* () {
    const timezone = request.body.timezone;
    console.log("TCL: timezone", timezone);
    const timezoneDiff = timezone * 1000 * 3600;
    // Pega o tempo do desligamento
    const timestampWithTimezone = (Date.now() + timezoneDiff) / 1000 | 0; // TimeEnd - Timestamp do desligamento da protecão
    console.log("TCL: timestampWithTimezone", timestampWithTimezone);
    const timeYes = new Date(timestampWithTimezone * 1000);
    console.log("TCL: timeYes", timeYes);
    const timeTimezone = timeYes.toLocaleString();
    console.log("TCL: timeTimezone", timeTimezone);
    const timestampWithoutTimezone = Date.now() / 1000 | 0;
    console.log("TCL: timestampWithoutTimezone", timestampWithoutTimezone);
    const timeNo = new Date(timestampWithoutTimezone * 1000);
    console.log("TCL: timeNo", timeNo);
    const timeNoTimezone = timeNo.toLocaleString();
    console.log("TCL: timeNoTimezone", timeNoTimezone);
    response.json({
        timestampWithTimezone: timestampWithTimezone,
        timeTimezone: timeTimezone,
        timestampWithoutTimezone: timestampWithoutTimezone,
        timeNoTimezone: timeNoTimezone
    });
}));
exports.quotation = functions.https.onRequest((request, response) => __awaiter(this, void 0, void 0, function* () {
    const userInput = request.body;
    yield quotation_1.newQuotation(userInput).then((result) => __awaiter(this, void 0, void 0, function* () {
        const zoho = yield require("./environment/zoho.flow");
        zoho.sendQuotationZoho(result.privateApi);
        response.send(result.publicApi);
    })).catch(error => {
        response.send(error);
    });
}));
/*

        MESSENGER FUNCTIONS

*/
// ON/OFF protection - OK
exports.onsuranceProtectionMsg = functions.https.onRequest((request, response) => __awaiter(this, void 0, void 0, function* () {
    try {
        const activateOnsurance = yield require("./controller/protectionController");
        const messenger = yield require("./environment/messenger");
        const variables = yield messenger.getProtectionVariables(request, response);
        activateOnsurance.onsuranceProtection(variables).then((result) => __awaiter(this, void 0, void 0, function* () {
            const getResponse = yield messenger[`${result.callback}`](result.variables);
            response.status(result.status).json(getResponse);
        })).catch((error) => __awaiter(this, void 0, void 0, function* () {
            console.error(`${JSON.stringify(error)}`);
            console.error(new Error(`Description: ${error.text}`));
            const getResponse = yield messenger[`${error.callback}`](error.variables);
            console.log("TCL: getResponse", getResponse);
            response.json(getResponse);
        }));
    }
    catch (error) {
        console.error(new Error(error));
        console.error(new Error(`Error in main function try catch. ${error}`));
        response.json({
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
}));
// First access on protection - OK
exports.clientFirstAccessMsg = functions.https.onRequest((request, response) => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log("TCL: clientFirstAccessMsg");
        const messenger = yield require('./environment/messenger');
        const variables = yield messenger.firstAccessVariables(request, response);
        console.log("TCL: variables", variables);
        const firstAccess = yield require('./controller/firstAccessController');
        firstAccess.doFirstAccess(variables).then((result) => __awaiter(this, void 0, void 0, function* () {
            console.log("TCL: result", result);
            const getResponse = yield messenger[`${result.callback}`](result.variables);
            console.log("TCL: getResponse", getResponse);
            response.json(getResponse);
        })).catch((error) => __awaiter(this, void 0, void 0, function* () {
            console.error(new Error(`Error in first access controller. ${error}.`));
            console.error(new Error(`Error Status: ${error.status}`));
            console.error(new Error(`Error Description: ${error.text}`));
            const getResponse = yield messenger[`${error.callback}`](error.variables);
            console.log("TCL: getResponse", getResponse);
            response.json(getResponse);
        }));
    }
    catch (error) {
        console.error(new Error(error));
        console.error(new Error(`Error in main function try catch. ${error}`));
        response.json({
            "messages": [
                {
                    "text": "OOOoooppsss. Tivemos um pequeno erro em nosso servidor. Por favor verifique se está conectado à internet e tente novamente em 5 segundos."
                },
            ],
            "redirect_to_blocks": [
                `giveAccess`
            ]
        });
    }
}));
// Change vehicle for utilization
exports.changeVehicleMsg = functions.https.onRequest((req, res) => __awaiter(this, void 0, void 0, function* () {
    console.log("TCL: req body", req.body);
    const messenger = yield require("./environment/messenger");
    const variables = yield messenger.changeItemVariables(req, res);
    const changeItem = yield require("./controller/protectionController");
    yield changeItem.changeVehicle(variables).then((result) => __awaiter(this, void 0, void 0, function* () {
        console.log("TCL: result", result);
        const getResponse = yield messenger[`${result.callback}`](result.variables);
        console.log("TCL: getResponse", getResponse);
        res.status(200).json(getResponse);
    })).catch((err) => __awaiter(this, void 0, void 0, function* () {
        console.log("TCL: err", err);
        const getResponse = yield messenger[`${err.callback}`](err.variables);
        console.log("TCL: getResponse", getResponse);
        res.json(getResponse);
    }));
}));
// Change vehicle information on Messenger
exports.changeVehicleInfoMsg = functions.https.onRequest((req, res) => __awaiter(this, void 0, void 0, function* () {
    console.log("TCL: req body", req.body);
    const messenger = yield require("./environment/messenger");
    const variables = yield messenger.getItemInfoVariables(req, res);
    const getItem = yield require("./controller/protectionController");
    yield getItem.getVehicleInfo(variables).then((result) => __awaiter(this, void 0, void 0, function* () {
        console.log("TCL: result", result);
        const getResponse = yield messenger[`${result.callback}`](result.variables);
        console.log("TCL: getResponse", getResponse);
        res.status(result.status).json(getResponse);
    })).catch((err) => {
        console.log("TCL: err", err);
        res.status(err.status).json(err.text);
    });
}));
// Give item acces to a thirdParty driver - OK
exports.giveItemAccessMsg = functions.https.onRequest((request, response) => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log("TCL: delegateItemAccess");
        const messenger = yield require('./environment/messenger');
        const variables = yield messenger.giveAccessVariables(request, response);
        console.log("TCL: variables", variables);
        const giveAccess = yield require('./controller/giveAccessController');
        giveAccess.giveAccessController(variables).then((result) => __awaiter(this, void 0, void 0, function* () {
            console.log("TCL: result", result);
            const getResponse = yield messenger[`${result.callback}`](result.variables);
            console.log("TCL: getResponse", getResponse);
            response.json(getResponse);
        })).catch((error) => __awaiter(this, void 0, void 0, function* () {
            console.error(new Error(`Error in giveAccessController. ${error}.`));
            console.error(new Error(`Error Status: ${error.status}`));
            console.error(new Error(`Error Description: ${error.text}`));
            const getResponse = yield messenger[`${error.callback}`](error.variables);
            console.log("TCL: getResponse", getResponse);
            response.json(getResponse);
        }));
    }
    catch (error) {
        console.error(new Error(error));
        console.error(new Error(`Error in main function try catch. ${error}`));
        response.json({
            "messages": [
                {
                    "text": "OOOoooppsss. Tivemos um pequeno erro em nosso servidor. Por favor verifique se está conectado à internet e tente novamente em 5 segundos."
                },
            ],
            "redirect_to_blocks": [
                `giveAccess`
            ]
        });
    }
}));
// Request to validade email input -
exports.userIndicationMsg = functions.https.onRequest((request, response) => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log("TCL: Check indication");
        const messenger = yield require('./environment/messenger');
        const variables = yield messenger.indicationVariables(request, response);
        console.log("TCL: variables", variables);
        const indication = yield require('./controller/indicationController');
        indication.saveIndication(variables).then((result) => __awaiter(this, void 0, void 0, function* () {
            console.log("TCL: result", result);
            const getResponse = yield messenger[`${result.callback}`](result.variables);
            console.log("TCL: getResponse", getResponse);
            response.json(getResponse);
        })).catch((error) => __awaiter(this, void 0, void 0, function* () {
            console.error(new Error(error));
            const getResponse = yield messenger[`${error.callback}`](error.variables);
            console.log("TCL: getResponse", getResponse);
            response.json(getResponse);
        }));
    }
    catch (error) {
        console.error(new Error(error));
        response.json({
            "messages": [
                {
                    "text": "OOOoooppsss. Tivemos um pequeno erro em nosso servidor e não conseguimos checar quem te indicou. Por favor verifique se está conectado à internet e tente novamente em 5 segundos."
                },
                {
                    "text": "O que deseja fazer?",
                    "quick_replies": [
                        {
                            "title": "Checar Indicação",
                            "block_names": ["validateIndication"]
                        },
                        {
                            "title": "Indicar a Onsurance",
                            "block_names": ["Referer"]
                        },
                        {
                            "title": "Conhecer a Onsurance",
                            "block_names": ["PRON"]
                        },
                        {
                            "title": "Falar com Especialista",
                            "block_names": ["Human interaction"]
                        },
                        {
                            "title": "Menu de Opções",
                            "block_names": ["Menu de opções"]
                        },
                    ]
                },
            ]
        });
    }
}));
// Request to validade email input
exports.passMessengerForIndicationMsg = functions.https.onRequest((request, response) => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log("TCL: passMessengerOnIndication");
        const messenger = yield require('./environment/messenger');
        const variables = yield messenger.saveIndicatorVariables(request, response);
        console.log("TCL: variables", variables);
        const indication = yield require('./controller/indicationController');
        indication.saveMessenger(variables).then((result) => __awaiter(this, void 0, void 0, function* () {
            console.log("TCL: result", result);
            response.status(200).send("");
        })).catch((error) => __awaiter(this, void 0, void 0, function* () {
            console.error(new Error(error));
            const getResponse = yield messenger[`${error.callback}`](error.variables);
            console.log("TCL: getResponse", getResponse);
            response.json(getResponse);
        }));
    }
    catch (error) {
        console.error(new Error(error));
        response.json({
            "messages": [
                {
                    "text": "OOOoooppsss. Tivemos um pequeno erro em nosso servidor e não conseguimos criar seu perfil de indicador. Por favor verifique se está conectado à internet e tente novamente em 5 segundos."
                },
                {
                    "text": "O que deseja fazer?",
                    "quick_replies": [
                        {
                            "title": "Tentar novamente",
                            "block_names": ["informar email indicacao"]
                        },
                        {
                            "title": "Conhecer a Onsurance",
                            "block_names": ["PRON"]
                        },
                        {
                            "title": "Falar com Especialista",
                            "block_names": ["Human interaction"]
                        },
                        {
                            "title": "Menu de Opções",
                            "block_names": ["Menu de opções"]
                        },
                    ]
                },
            ]
        });
    }
}));
// Request to validade email input
exports.checkIndicationEmailMsg = functions.https.onRequest((request, response) => {
    console.log("TCL: request.query", request.query);
    const variableCheck = request.query["checkEmail"].toLowerCase();
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const check = re.test(variableCheck);
    function ValidateEmail() {
        if (check) {
            const userEmail = variableCheck;
            console.log("TCL: ValidateEmail -> You have entered an Super Hyper Valid email address!");
            response.json({
                "set_attributes": {
                    "indicator": userEmail
                },
                "redirect_to_blocks": [
                    `validateIndication`
                ]
            });
        }
        else {
            console.log(`TCL: ValidateEmail -> Not email. Block: ${variableCheck}`);
            response.json(200);
        }
    }
    ValidateEmail();
});
/*


        Upgrade Version


*/
// Change system version to 2.0 - 
exports.systemUpgrade = functions.https.onRequest((request, response) => __awaiter(this, void 0, void 0, function* () {
    try {
        const update = yield require("./environment/systemUpgrade");
        update.systemUpgrade().then((result) => {
            response.status(200).send(result);
        }).catch((error) => {
            console.log("TCL: error", error);
            response.status(500).send(`Error on server. Check what happened.`);
        });
    }
    catch (error) {
        console.log("TCL: error", error);
        response.status(500).send(`Error on server. Check what happened.`);
    }
}));
/*

        HARDWARE FUNCTIONS

*/
// Request from ignition status - Hardware
exports.ignition = functions.https.onRequest((request, response) => __awaiter(this, void 0, void 0, function* () {
    console.log("TCL: request.body", request.body);
    const variables = request.body;
    variables.email = request.body.clientId;
    variables.value = request.body.ignition;
    console.log("TCL: Email", variables.email);
    try {
        const ignition = yield require("./controller/ignitionController");
        yield ignition.ignition(variables).then((result) => {
            response.status(200).send(result);
        }).catch((error) => {
            console.error(new Error(`TCL: error, ${JSON.stringify(error)}`));
            response.status(error.status).send(error.text);
        });
    }
    catch (error) {
        console.error(new Error(`TCL: error, ${JSON.stringify(error)}`));
        response.status(500).send(`Error on server. Check what happened.`);
    }
}));
// Request from geofence status - Hardware
exports.geofence = functions.https.onRequest((request, response) => {
    console.log("TCL: request.headers", request.headers);
    console.log("TCL: request.body", request.body);
    response.status(200).send("OK");
});
/*

        BILLING - OBDs

*/
// Register obd and billing period on DB
exports.registerObd = functions.https.onRequest((request, response) => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log("TCL: -> ", JSON.stringify(request.body));
        const getBillingVariables = yield require('./environment/billing');
        // Get onboard set of variables.
        const variables = yield getBillingVariables.registerBillingVariables(request, response);
        console.log("TCL: variables", variables);
        // get onboard controller
        const register = yield require("./controller/billingController");
        register.registerBilling(variables).then(result => {
            response.status(result.status).send(result.text);
        }).catch(error => {
            console.error(new Error(`TCL: error: ${error}`));
            response.status(error.status).send(error.text);
        });
    }
    catch (error) {
        console.error(new Error(`TCL: error: ${error}`));
        response.status(500).send(`Error on server. Check what happened.`);
    }
}));
// Do cron job to generate pay value
exports.billingObd = functions.https.onRequest((request, response) => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log("TCL: -> ", JSON.stringify(request.body));
        // get onboard controller
        const chargeObd = yield require("./controller/billingController");
        yield chargeObd.executeBilling().then(result => {
            response.status(result.status).send(result.text);
        }).catch(error => {
            console.error(new Error(`TCL: error: ${error}`));
            response.status(error.status).send(error.text);
        });
    }
    catch (error) {
        console.error(new Error(`TCL: error: ${error}`));
        response.status(500).send(`Error on server. Check what happened.`);
    }
}));
/*

        LAVO ENDPOINTS

*/
exports.lavoOn = functions.https.onRequest((request, response) => __awaiter(this, void 0, void 0, function* () {
    const lavo = yield require("./lavo/lavo_functions");
    yield lavo.lavoOn(request, response);
}));
exports.lavoOff = functions.https.onRequest((request, response) => __awaiter(this, void 0, void 0, function* () {
    const lavo = yield require("./lavo/lavo_functions");
    yield lavo.lavoOff(request, response);
}));
exports.report = functions.https.onRequest((request, response) => __awaiter(this, void 0, void 0, function* () {
    const executeReport = yield require("./controller/reportController");
    yield executeReport.makeReport().then((result) => {
        console.log("TCL: result", result);
        response.send(result);
    }).catch((err) => {
        console.error(new Error(`Error in make report: ${err}`));
        response.send("Erro na função");
    });
}));
// -------------- ONSURANCE PNEUS ---------------
const pneus = express();
// Automatically allow cross-origin requests
pneus.use(cors({ origin: true }));
var authMiddleware = function (req, res, next) {
    console.log('LOGGED NEWWWW');
    next();
};
// Add middleware to authenticate requests
pneus.use(authMiddleware);
// build multiple CRUD interfaces:
pneus.post('/pneus', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const tire = yield require("./model/calcMin");
    try {
        const minuteValue = yield tire.getTireMinuteValue(req.body);
        console.log(`TCL: minuteValue`, minuteValue);
        res.status(200).send({ minuteValue: minuteValue });
    }
    catch (error) {
        res.send(error);
    }
}));
pneus.get('/cotacaoPneus', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const tire = yield require("./model/calcMin");
    console.log(`TCL: req.query`, req.query);
    try {
        const minuteValue = yield tire.getTireMinuteValue(req.query);
        console.log(`TCL: minuteValue`, minuteValue);
        res.status(200).send({ minuteValue: minuteValue });
    }
    catch (error) {
        res.send(error);
    }
}));
pneus.put('/pneus', (req, res) => res.send(`Put request`));
pneus.delete('/pneus', (req, res) => res.send(`Delete request`));
pneus.get('/', (req, res) => res.send(`Get request all`));
// Expose Express API as a single Cloud Function:
exports.expressTest = functions.https.onRequest(pneus);
const woo = express();
// Automatically allow cross-origin requests
woo.use(cors({ origin: true }));
// Add middleware to authenticate requests
// woo.use(authMiddleware);
woo.post('/order', (req, res) => __awaiter(this, void 0, void 0, function* () {
    console.log(`TCL: req query`, req.query);
    console.log(`TCL: req body`, req.body);
    const wooRequest = yield require("./test/woocommerce.test");
    try {
        const orderId = req.query.orderId;
        const result = yield wooRequest.updateOrder(orderId, req.query.status);
        console.log(`TCL: result`, JSON.stringify(result));
        res.send(result);
    }
    catch (error) {
        console.error(new Error(JSON.stringify(error)));
        const nodemailer = require("nodemailer");
        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.com',
            port: 465,
            secure: true,
            auth: {
                user: 'victor.assis@onsurance.me',
                pass: '*ScC49KEYeh4'
            }
        });
        const mailOptions = (error) => {
            return {
                from: 'victor.assis@onsurance.me',
                to: 'victor.assis@onsurance.me',
                subject: 'Firebase - Pagseguro Error WooTest!!!',
                text: `Erro ao ativar webhook do pagseguro. 
                        Body: ${JSON.stringify(req.body)}. 
                        Query: ${JSON.stringify(req.query)}.
                        Error: ${JSON.stringify(error)}.`
            };
        };
        transporter.sendMail(mailOptions(error), function (error, info) {
            if (error) {
                console.error(new Error(JSON.stringify(error)));
            }
            else {
                console.log('Email sent: ' + info.response);
            }
            ;
        });
        res.send(error);
    }
    ;
}));
// Expose Express API as a single Cloud Function:
exports.wooTest = functions.https.onRequest(woo);
//# sourceMappingURL=functions.js.map