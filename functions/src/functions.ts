import * as functions from 'firebase-functions';




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
    const newQuotation = require("./model/quotation.auto").newQuotation;


    interface Result {
        privateApi: Object;
        publicApi: Object
    }
    
    const userInput = request.body;
    console.log(`TCL: userInput`, JSON.stringify(userInput));

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

// // Change system version to 2.0 - 
// exports.systemUpgrade = functions.https.onRequest(async(request, response) => {
//     try {
//         const update = await require("./environment/systemUpgrade");
//         update.systemUpgrade().then((result) => {
//             response.status(200).send(result)
//         }).catch((error) => {
//             console.log("TCL: error", error)
//             response.status(500).send(`Error on server. Check what happened.`)
//         });
//     } catch (error) {
//         console.log("TCL: error", error)
//         response.status(500).send(`Error on server. Check what happened.`)
//     }
// });




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

// exports.lavoOn = functions.https.onRequest(async (request, response) => {
//     const lavo = await require("./lavo/lavo_functions");
//     await lavo.lavoOn(request, response);
// });

// exports.lavoOff = functions.https.onRequest(async (request, response) => {
//     const lavo = await require("./lavo/lavo_functions");
//     await lavo.lavoOff(request, response);
// });


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


// Remember to always return the functions    **********


/**
 * @todo Liga/desliga Messenger
 * @todo thirdParty messenger
 *      @todo Get messenger ID and other data to account, specify what product can share.
 * @todo indication messenger
 * @todo Validate user access to items
 */

// -------------- ONSURANCE PNEUS ---------------

// Expose Express API ONBOARD as single Cloud Function for all Onboard Operations:
export const onboard = functions.https.onRequest(async (request, response) => {
    const onboard = require("./routes/onboard.routes");
    return await onboard(request, response);

});


// -------------- FIRST ACCESS ---------------
export const firstAccess = functions.https.onRequest(async(request, response) => {
    const firstAccess = require("./routes/firstAccess.routes");
    return await firstAccess(request, response);
});


// -------------- GET ITEMS ------------------
export const items = functions.https.onRequest(async (request, response) => {
    const items = require("./routes/items.routes");
    return await items(request, response);
});


// -------------- NEW QUOTE ------------------
export const quote = functions.https.onRequest(async (request, response) => {
    const quote = require("./routes/quotation.routes");
    return await quote(request, response);
});


// -------------- ONSURANCE TIRES ACTIVATION ---------------
export const onsuranceTires = functions.https.onRequest(async (request, response) => {
    const onsurance = require("./routes/onsurance.tires.routes");
    return await onsurance(request, response);
});


// -------------- ONSURANCE AUTO ACTIVATION ---------------
export const onsuranceAuto = functions.https.onRequest(async (request, response) => {
    const onsurance = require("./routes/onsurance.auto.routes");
    return await onsurance(request, response);
});


// -------------- ONSURANCE INDICATION --------------
export const indication = functions.https.onRequest(async (req, res) => {
    const indication = require("./routes/indication.routes");
    return await indication(req, res);
});

// -------------- ONSURANCE SHARE ITEMS ------------
export const share = functions.https.onRequest((req, res) => {
    const share = require("./routes/share.routes")
    return share(req, res)
});