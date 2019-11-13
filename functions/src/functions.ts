const functions = require('firebase-functions');
import {newQuotation} from "./model/quotation"

const express = require('express');
const cors = require('cors');



// Woocommerce webhook request for clients purchases
exports.woocommerceRequest = functions.https.onRequest(async (request, response) => {
	console.log("TCL: -> Woocommerce Request Function. Start:");
	console.log("TCL: -> ", JSON.stringify(request.body))


    const getPurchase = await require("./controller/woocommerceController");
    getPurchase.woocommercePurchase(request).then(async result => {
        const zoho = await require("./environment/zoho.flow");
        zoho.sendWoocommerceZoho(request.body);
        response.status(result.status).send(result.text)
    }).catch(error => {
        response.status(error.status).send(error.text)
    })
});

exports.onboardVehicles = functions.https.onRequest(async (request, response) => {
	try {
        console.log("TCL: Onboard Function. Start:")
        console.log("TCL: -> ", request.body);

        const getOnboardVariables = await require('./environment/onboardVariables');
        // Get onboard set of variables.
        const variables = await getOnboardVariables.getOnboardVariables(request, response);
        console.log("TCL: variables", variables)
        
        // get onboard controller
        const getOnboard = require("./controller/onboardController");

        getOnboard.clientOnboard(variables).then(result => {
            response.status(result.status).send(result.text)
        }).catch(error => {
            response.status(error.status).send(error.text)
        })
    } catch (error) {
		console.log("TCL: error", error)
        response.status(500).send(`Error on server. Check what happened.`)
        
    }

});


exports.timezoneExperiment = functions.https.onRequest(async (request, response) => {
    const timezone = request.body.timezone
    console.log("TCL: timezone", timezone)
    
    const timezoneDiff = timezone * 1000 * 3600
    // Pega o tempo do desligamento
    const timestampWithTimezone = (Date.now() + timezoneDiff)/1000|0;                              // TimeEnd - Timestamp do desligamento da protecão
    console.log("TCL: timestampWithTimezone", timestampWithTimezone)
    const timeYes = new Date(timestampWithTimezone*1000)
	console.log("TCL: timeYes", timeYes)
    const timeTimezone = timeYes.toLocaleString()
	console.log("TCL: timeTimezone", timeTimezone)
    const timestampWithoutTimezone = Date.now()/1000|0 
    console.log("TCL: timestampWithoutTimezone", timestampWithoutTimezone)
    const timeNo = new Date(timestampWithoutTimezone*1000) 
	console.log("TCL: timeNo", timeNo)
    const timeNoTimezone = timeNo.toLocaleString()
    console.log("TCL: timeNoTimezone", timeNoTimezone)
    
    response.json({
        timestampWithTimezone: timestampWithTimezone,
        timeTimezone: timeTimezone,
        timestampWithoutTimezone: timestampWithoutTimezone,
        timeNoTimezone: timeNoTimezone
    })
     
    
});

exports.quotation = functions.https.onRequest(async (request, response) => {
    interface Result {
        privateApi: Object;
        publicApi: Object
    }
    
    const userInput = request.body;

    await newQuotation(userInput).then(async (result: Result) => {
        const zoho = await require("./environment/zoho.flow");
        zoho.sendQuotationZoho(result.privateApi);
        response.send(result.publicApi)
    }).catch(error => {
        response.send(error)
    });
    
    
});



/*

        MESSENGER FUNCTIONS

*/

// ON/OFF protection - OK
exports.onsuranceProtectionMsg = functions.https.onRequest(async (request, response) => {
    try {
        const activateOnsurance = await require("./controller/protectionController")
        const messenger = await require("./environment/messenger");

        const variables = await messenger.getProtectionVariables(request, response);

        activateOnsurance.onsuranceProtection(variables).then(async result => {
            const getResponse = await messenger[`${result.callback}`](result.variables);

            response.status(result.status).json(getResponse)
        }).catch(async error => {
            console.error(`${JSON.stringify(error)}`);
            console.error(new Error(`Description: ${error.text}`));
            const getResponse = await messenger[`${error.callback}`](error.variables);
            console.log("TCL: getResponse", getResponse);
            
            response.json(getResponse)
        });
    } catch (error) {
        console.error(new Error(error))
        console.error(new Error(`Error in main function try catch. ${error}`))        
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
    
});

// First access on protection - OK
exports.clientFirstAccessMsg = functions.https.onRequest(async (request, response) => {
    try {
        console.log("TCL: clientFirstAccessMsg")
        const messenger = await require('./environment/messenger');
        const variables = await messenger.firstAccessVariables(request, response);
        console.log("TCL: variables", variables);
        const firstAccess = await require('./controller/firstAccessController');
        firstAccess.doFirstAccess(variables).then(async result => {
            console.log("TCL: result", result)
            const getResponse = await messenger[`${result.callback}`](result.variables);
            console.log("TCL: getResponse", getResponse);
            response.json(getResponse)
        }).catch(async error => {
            console.error(new Error(`Error in first access controller. ${error}.`));
            console.error(new Error(`Error Status: ${error.status}`));
            console.error(new Error(`Error Description: ${error.text}`));
            const getResponse = await messenger[`${error.callback}`](error.variables);
            console.log("TCL: getResponse", getResponse);
            
            response.json(getResponse)
        });
    } catch (error) {
        console.error(new Error(error));
        console.error(new Error(`Error in main function try catch. ${error}`))
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
});

// Change vehicle for utilization
exports.changeVehicleMsg = functions.https.onRequest(async (req, res) => {
    console.log("TCL: req body", req.body)
    const messenger = await require("./environment/messenger");
    const variables = await messenger.changeItemVariables(req, res);

    const changeItem = await require("./controller/protectionController");

    await changeItem.changeVehicle(variables).then(async (result) => {
        console.log("TCL: result", result)
            const getResponse = await messenger[`${result.callback}`](result.variables);
            console.log("TCL: getResponse", getResponse);
            res.status(200).json(getResponse)
    }).catch(async (err) => {
        console.log("TCL: err", err)
        const getResponse = await messenger[`${err.callback}`](err.variables);
        console.log("TCL: getResponse", getResponse);
        res.json(getResponse);
    });
    
});
// Change vehicle information on Messenger
exports.changeVehicleInfoMsg = functions.https.onRequest(async (req, res) => {
    console.log("TCL: req body", req.body)
    const messenger = await require("./environment/messenger");
    const variables = await messenger.getItemInfoVariables(req, res);

    const getItem = await require("./controller/protectionController");

    await getItem.getVehicleInfo(variables).then(async (result) => {
        console.log("TCL: result", result)
            const getResponse = await messenger[`${result.callback}`](result.variables);
            console.log("TCL: getResponse", getResponse);

            res.status(result.status).json(getResponse)
    }).catch((err) => {
        console.log("TCL: err", err)
        res.status(err.status).json(err.text);
    });
    
});

// Give item acces to a thirdParty driver - OK
exports.giveItemAccessMsg = functions.https.onRequest(async (request, response) => {
    try {
        console.log("TCL: delegateItemAccess")
        const messenger = await require('./environment/messenger');
        const variables = await messenger.giveAccessVariables(request, response);
        console.log("TCL: variables", variables);
        const giveAccess = await require('./controller/giveAccessController');
        giveAccess.giveAccessController(variables).then(async result => {
            console.log("TCL: result", result)
            const getResponse = await messenger[`${result.callback}`](result.variables);
            console.log("TCL: getResponse", getResponse);
            response.json(getResponse)
        }).catch(async error => {
            console.error(new Error(`Error in giveAccessController. ${error}.`));
            console.error(new Error(`Error Status: ${error.status}`));
            console.error(new Error(`Error Description: ${error.text}`));
            const getResponse = await messenger[`${error.callback}`](error.variables);
            console.log("TCL: getResponse", getResponse);
            
            response.json(getResponse)
        });
    } catch (error) {
        console.error(new Error(error));
        console.error(new Error(`Error in main function try catch. ${error}`))
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
});

// Request to validade email input -
exports.userIndicationMsg = functions.https.onRequest(async (request, response) => {
    
    try {
        console.log("TCL: Check indication")
        const messenger = await require('./environment/messenger');

        const variables = await messenger.indicationVariables(request, response);
        console.log("TCL: variables", variables);

        const indication = await require('./controller/indicationController');

        indication.saveIndication(variables).then(async result => {
            console.log("TCL: result", result)
            const getResponse = await messenger[`${result.callback}`](result.variables);
            console.log("TCL: getResponse", getResponse);

            response.json(getResponse)
        }).catch(async error => {
            console.error(new Error(error));

            const getResponse = await messenger[`${error.callback}`](error.variables);
            console.log("TCL: getResponse", getResponse);
            
            response.json(getResponse)
        });
    } catch (error) {
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
                          "title":"Checar Indicação",
                          "block_names": ["validateIndication"]
                        },
                        {
                          "title":"Indicar a Onsurance",
                          "block_names": ["Referer"]
                        },
                        {
                          "title":"Conhecer a Onsurance",
                          "block_names": ["PRON"]
                        },
                        {
                          "title":"Falar com Especialista",
                          "block_names": ["Human interaction"]
                        },
                        {
                          "title":"Menu de Opções",
                          "block_names": ["Menu de opções"]
                        },
                    ]
                },
            ]
        });
    }
});

// Request to validade email input
exports.passMessengerForIndicationMsg = functions.https.onRequest(async (request, response) => {
    
    try {

        console.log("TCL: passMessengerOnIndication")
        const messenger = await require('./environment/messenger');

        const variables = await messenger.saveIndicatorVariables(request, response);
        console.log("TCL: variables", variables);

        const indication = await require('./controller/indicationController');

        indication.saveMessenger(variables).then(async result => {
            console.log("TCL: result", result)
            response.status(200).send("")
        }).catch(async error => {
            console.error(new Error(error));
            const getResponse = await messenger[`${error.callback}`](error.variables);
            console.log("TCL: getResponse", getResponse);
            response.json(getResponse)
        });

    } catch (error) {
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
                          "title":"Tentar novamente",
                          "block_names": ["informar email indicacao"]
                        },
                        {
                          "title":"Conhecer a Onsurance",
                          "block_names": ["PRON"]
                        },
                        {
                          "title":"Falar com Especialista",
                          "block_names": ["Human interaction"]
                        },
                        {
                          "title":"Menu de Opções",
                          "block_names": ["Menu de opções"]
                        },
                    ]
                },
            ]
        });
    }
});

// Request to validade email input
exports.checkIndicationEmailMsg = functions.https.onRequest((request, response) => {
    
    console.log("TCL: request.query", request.query)

    const variableCheck = request.query["checkEmail"].toLowerCase()
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    const check = re.test(variableCheck)
    function ValidateEmail() {
        
        if (check){
            const userEmail = variableCheck
            console.log("TCL: ValidateEmail -> You have entered an Super Hyper Valid email address!")


            response.json({ 
                "set_attributes": {
                    "indicator": userEmail
                },
                "redirect_to_blocks": [
                    `validateIndication`
                ]
            })

        } else {
            console.log(`TCL: ValidateEmail -> Not email. Block: ${variableCheck}`)
            response.json(200)
        }
    }

    ValidateEmail()
});



/* 


        Upgrade Version


*/

// Change system version to 2.0 - 
exports.systemUpgrade = functions.https.onRequest(async(request, response) => {
    try {
        const update = await require("./environment/systemUpgrade");
        update.systemUpgrade().then((result) => {
            response.status(200).send(result)
        }).catch((error) => {
            console.log("TCL: error", error)
            response.status(500).send(`Error on server. Check what happened.`)
        });
    } catch (error) {
        console.log("TCL: error", error)
        response.status(500).send(`Error on server. Check what happened.`)
    }
});




/*

        HARDWARE FUNCTIONS

*/


// Request from ignition status - Hardware
exports.ignition = functions.https.onRequest(async (request, response) => {
    
    console.log("TCL: request.body", request.body);

    const variables = request.body;
    variables.email = request.body.clientId;
    variables.value = request.body.ignition;
    console.log("TCL: Email", variables.email);

    try {
        const ignition = await require("./controller/ignitionController");
        await ignition.ignition(variables).then((result) => {
            response.status(200).send(result)
        }).catch((error) => {
            console.error(new Error(`TCL: error, ${JSON.stringify(error)}`));
            response.status(error.status).send(error.text)
        });
    } catch (error) {
        console.error(new Error(`TCL: error, ${JSON.stringify(error)}`));
        response.status(500).send(`Error on server. Check what happened.`)
    }
});

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
exports.registerObd = functions.https.onRequest(async (request, response) => {

    try {
        console.log("TCL: -> ", JSON.stringify(request.body))

        const getBillingVariables = await require('./environment/billing');
        // Get onboard set of variables.
        const variables = await getBillingVariables.registerBillingVariables(request, response);
        console.log("TCL: variables", variables)
        
        // get onboard controller
        const register = await require("./controller/billingController");

        register.registerBilling(variables).then(result => {
            response.status(result.status).send(result.text)
        }).catch(error => {
        console.error(new Error(`TCL: error: ${error}`));
            response.status(error.status).send(error.text)
        });
    } catch (error) {
        console.error(new Error(`TCL: error: ${error}`));
        response.status(500).send(`Error on server. Check what happened.`)
        
    }
});

// Do cron job to generate pay value
exports.billingObd = functions.https.onRequest(async (request, response) =>{

    try {
        console.log("TCL: -> ", JSON.stringify(request.body));
        
        // get onboard controller
        const chargeObd = await require("./controller/billingController");

        await chargeObd.executeBilling().then(result => {
            response.status(result.status).send(result.text)
        }).catch(error => {
        console.error(new Error(`TCL: error: ${error}`));
            response.status(error.status).send(error.text)
        });
    } catch (error) {
        console.error(new Error(`TCL: error: ${error}`));
        response.status(500).send(`Error on server. Check what happened.`)
        
    }
    
});




/* 

        LAVO ENDPOINTS

*/

exports.lavoOn = functions.https.onRequest(async (request, response) => {
    const lavo = await require("./lavo/lavo_functions");
    await lavo.lavoOn(request, response);
});

exports.lavoOff = functions.https.onRequest(async (request, response) => {
    const lavo = await require("./lavo/lavo_functions");
    await lavo.lavoOff(request, response);
});


exports.report = functions.https.onRequest(async (request, response) => {
    const executeReport = await require("./controller/reportController");
    
    await executeReport.makeReport().then((result) => {
        console.log("TCL: result", result)
        response.send(result);
    }).catch((err) => {
        console.error(new Error (`Error in make report: ${err}`));
        response.send("Erro na função");
    });

    
});



// -------------- ONSURANCE PNEUS ---------------


const pneus = express();

// Automatically allow cross-origin requests
pneus.use(cors({ origin: true }));

var authMiddleware = function (req, res, next) {
    console.log('Middleware Log!')
    next()
  }

// Add middleware to authenticate requests
pneus.use(authMiddleware);

// build multiple CRUD interfaces:
pneus.post('/onboard', async (req, res) => {
    const tireOnboard = await require("./model/tires.model");
    try {
        tireOnboard.tireOnboard(req.body).then(result => {
            console.log(`TCL: result`, JSON.stringify(result));
            res.status(200).send(result);
        }).catch((err) => {
            if (err.status) res.status(err.status).send(err.text);
            res.send({error: err})
        });
        
    } catch (error) {
        res.send(error);
    }
});


pneus.get('/cotacaoPneus', async (req, res) => {
    const tire = await require("./model/calcMin");

    console.log(`TCL: req.query`, req.query);
    try {
        const minuteValue = await tire.getTireMinuteValue(req.query)
        console.log(`TCL: minuteValue`, minuteValue)
        res.status(200).send({minuteValue: minuteValue});
        
    } catch (error) {
        res.send(error);
    }
});
pneus.put('/pneus', (req, res) => res.send(`Put request`));
pneus.delete('/pneus', (req, res) => res.send(`Delete request`));
pneus.get('/', (req, res) => res.send(`Get request all`));

// Expose Express API as a single Cloud Function:
exports.tire = functions.https.onRequest(pneus);



const woo = express();

// Automatically allow cross-origin requests
woo.use(cors({ origin: true }));

// Add middleware to authenticate requests
// woo.use(authMiddleware);

woo.post('/order', async (req, res) => {
    console.log(`TCL: req query`, req.query);
    console.log(`TCL: req body`, req.body);

    const wooRequest = await require("./test/woocommerce.test");
    try {

        const orderId = req.body.Referencia;
        const statusBase = (req.body.StatusTransacao).toLowerCase();
        let status: string;
        switch (statusBase) {
            case "completo":
                status = "completed";
                break;
            case "em análise":
                status = "processing";
                break;
            case "aprovado":
                status = "on-hold";
                break;
            case "cancelado":
                status = "cancelled";
                break;
            case "aguardando":
                status = "pending";
                break;
            default:
                throw {
                    errorType: "Status ainda não analisado pelo time.",
                    message: `Analisar o status ${statusBase}. Adcionar ao endpoint.`
                }   
        }
        const result = await wooRequest.updateOrder(orderId, status);
        console.log(`TCL: result`, JSON.stringify(result))
        res.send(result)
    } catch (error) {
        console.error(new Error(JSON.stringify(error)));

        const nodemailer = require("nodemailer");

        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.com',
                port: 465,
                secure: true,  //true for 465 port, false for other ports
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
        transporter.sendMail(mailOptions(error), function(error, info){
          if (error) {
            console.error(new Error(JSON.stringify(error)));
          } else {
            console.log('Email sent: ' + info.response);
          };
        });

        res.send(error)
    };
});
// Expose Express API as a single Cloud Function:
exports.wooTest = functions.https.onRequest(woo);