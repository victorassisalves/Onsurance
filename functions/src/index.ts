import { request } from "https";
import { resolve } from "url";


const functions = require('firebase-functions');
const crypto = require('crypto')
const log = require('./log')()

// Turns messenger Protection ON or OFF
exports.protection = functions.https.onRequest(async(request, response) => {
    console.log(`${request.query["email_address"]} - Entrando na funcão Liga/Desliga a protecão:  ${JSON.stringify(request.query)}`);

    // Dados do usuário
    const getVariables = require(`./messengerVariables.js`)
    const getProtection = require(`./protection.js`)
    // User variables and data
    const protectionVariables = getVariables.getProtectionVariables(request)
    // Data base reference call
    const dataBaseRef = getVariables.getDataBaseRefs(protectionVariables, crypto)

    // Get protection status (User and vehicle Profiles)
    getProtection.getProfiles(dataBaseRef, protectionVariables).then(result => {

        const vehicleProfile = result[0]
        log('vehicleProfile: ', vehicleProfile);
        const userProfile = result[1]
        log('userProfile: ', userProfile);
        const profiles = result
        log(`User still have R$${(userProfile.wallet.money).toFixed(2)} money.`)

        // User have necessary credits to call protection
        const PROTECTION = () => {
            if (vehicleProfile === undefined || !vehicleProfile || vehicleProfile === null || userProfile === undefined || !userProfile || userProfile === null){ // Not User or vehicle not found
                return response.json({
                    "messages": [
                        {
                            "text": `Olá ${userProfile.firstName}, agradecemos seu interesse em utilizar a Onsurance. Não encontramos seu perfil em nosso banco de dados. Caso não seja cliente ainda, compre agora e aproveite os benefícios de ter sua proteção On Demand!`
                        }
                    ],
                    "redirect_to_blocks": [
                        "Pré compra"
                    ]
                })
            } else if (userProfile.activations === 0) { // First Activation
                log(`First activation.`)
                getProtection.firstActivation(response, profiles, protectionVariables, dataBaseRef) // Calls first activation function

            } else if (userProfile.activations >= 1 && vehicleProfile.protectionStatus === "OFF") { // Activation +1 and Status OFF - Turn ON
                log(`### Turnning Protection ON ###`)
                getProtection.activation(response, profiles, protectionVariables, dataBaseRef) // Calls normal activation function

            } else if (userProfile.activations >= 1 && vehicleProfile.protectionStatus === "ON") { // Activation +1 and Status ON - Turn OFF
                log(`### Turnning Protection OFF ###`)
                getProtection.deactivation(protectionVariables, dataBaseRef, profiles, response) // Calls normal activation function
            }
        }
        // User don't have necessary credits to call protection
        const NOCREDIT = () => {
            console.error(new Error(`No Credit.`));
            return response.json({
                "messages": [
                    {
                        "text": `Ooops 😵. Você não possui créditos suficientes para ligar seu Onsurance.`
                    },
                    {
                        "text": `Seus créditos: R$${(userProfile.wallet.money).toFixed(2)}`
                    },
                    {
                        "attachment": {
                            "type": "template",
                            "payload": {
                            "template_type": "button",
                            "text": "Clique no botão abaixo 👇 para realizar sua recarga.",
                            "buttons": [
                                {
                                    "type": "web_url",
                                    "url": "https://onsurance.me/produto/recarga-de-creditos-para-protecao-onsurance/",
                                    "title": "Fazer Recarga"
                                },
                            ]
                            }
                        }
                    }
                ],
            })
        }
        
        // Checks if user has necessary credits to call protection
        userProfile.wallet.switch < 1000 ? NOCREDIT() : PROTECTION()
    
    }).catch(error => {
        console.error(new Error(`Erro na proteção. ${error}`));
        response.json({
            "messages": [
                {
                    "text": `Opa. Tivemos um pequeno erro ao ligar sua proteção. Por favor, tente de novo. Caso o erro persista, digite "falar com especialista" ou ligue para: 0800-020-4921 e fale com nosso suporte. `
                }
            ],
            "redirect_to_blocks": [
                "Ligar"
            ]
        })
    })
    
})

// Create user profile before firt activation
exports.createProfile = functions.https.onRequest(async(request, response) => {
    console.log(`${request.query["first name"]} - ${request.query["messenger user id"]} Create User Profile: ${JSON.stringify(request.query)}`);
    const factory = request.query["factory"]    

    // Import from files
    const calcMin = require('./calcMin.js')
    const getVariables = require(`./messengerVariables.js`)
    // User variables and data
    const systemVariables = await getVariables.getSystemVariables(request)
    // Vehicle variables and data
    const vehicleVariables = getVariables.getVehicleVariables(request)
    // Data base reference call
    const dataBaseRef = getVariables.getDataBaseRefs(systemVariables, crypto)

    let minuteValue = 0.00484
    // let brbCardUser = ""
    // Objeto de perfil do user
    let userProfile = {
        firstName: systemVariables.firstName,
        messengerId: systemVariables.messengerId,
        lastName: systemVariables.lastName,
        activations: 0,
        indicator: systemVariables.indicator,
        timezone: systemVariables.timezone,
        vehicleInUse: systemVariables.carPlate,
        onboard: true
    }
    let profileUser

    const indicatorProfile = {
        indicatedUsers: 1,
        indicated: {
            1: systemVariables.userEmail
        },
    }

    // Function that calculates minute price
    await calcMin.calcMinCar(vehicleVariables.carValue).then(result => {
        minuteValue = parseFloat(result)
        log('valorMinuto normal: ', minuteValue);
        if (factory === "Importado"){
            minuteValue = parseFloat((minuteValue*1.2).toFixed(2))
            log('valorMinuto Imported: ', minuteValue);
        }
    }).catch(error => {
        console.error(new Error(`${JSON.stringify(error)}, CarValue: ${vehicleVariables.carValue}.`))
        log('## Back to messenger ##')
        return response.json({
            "messages": [
                {
                    "text": `${error.text}`,
                }
            ],
            "redirect_to_blocks": [
                `${error.block}`
            ]
        })
    })

    //vehicle profile object
    const vehicleProfile = {
        vehicleModel: vehicleVariables.carModel,
        vehiclePlate: systemVariables.carPlate,
        vehicleValue: vehicleVariables.carValue,
        vehicleBrand: vehicleVariables.carBrand,
        minuteValue: minuteValue,
        activations: 0,
        protectionStatus: "OFF"
    }

    // Verificacão/Criacão do perfil de usuário
    const createProfiles = () => {
        return new Promise((resolve, reject) => {

            // Verificacão/Criacão do indicator
            const indication = () => {
                // Atualiza o numero de indicados do perfil de User do indicator
                const updateIndicatorUser = indicatedNum => {
                   dataBaseRef.dbRefIndicatorUser.update({
                        indication: {
                            indicatedUsers: indicatedNum
                        }           
                    }).then(() => {
                        log(`updateIndicatorUser - ${systemVariables.userEmail} - ${systemVariables.firstName} - Indicator User profile indication number Update Successful.`)
                        resolve(true)
                    }).catch(error => {
                        console.error(new Error(`updateIndicatorUsre - 1 - ${systemVariables.userEmail} - ${systemVariables.firstName} - Error updating indication number in user profile. ${error}`))
                        reject(error)
                    })
                }

                // Caso exista, atualiza o array de indicados
                const updateIndicatorArray = indicatedNum => {
                    dataBaseRef.dbRefIndicator.child(`/indicated/${indicatedNum}`).set(systemVariables.userEmail).then(() =>{
                        log(`updateIndicatorArray - ${systemVariables.userEmail} - ${systemVariables.firstName} - Indicatior array Update Successful.`)
                        updateIndicatorUser(indicatedNum)
                    }).catch(error => {
                        console.error(new Error(`updateIndicatorArray - ${systemVariables.userEmail} - ${systemVariables.firstName} -  Erro ao adicionar usuário ao array. ${error}`))
                        reject(error)
                    });
                }

                // Caso exista o perfil, atualiza o número de indicados
                const updateIndicator = indicatedNum => {
                    dataBaseRef.dbRefIndicator.update({
                        indicatedUsers: indicatedNum
                    }).then(() => {
                        log(`updateIndicator - ${systemVariables.userEmail} - ${systemVariables.firstName} - Indication Update Successful.`)
                        updateIndicatorArray(indicatedNum)
                    }).catch(error => {
                        console.error(new Error(`updateIndicator - ${systemVariables.userEmail} - ${systemVariables.firstName} - Error updating Indication. ${error}`))
                        reject(error)
                    })
                }

                //Caso nao exista, cria o perfil do indicator.
                const createIndicator = () => {
                    dataBaseRef.dbRefIndicator.set(indicatorProfile).then(() => {
                        log(`createIndicator - ${systemVariables.userEmail} - ${systemVariables.firstName} - Indicator profile creation Successful.`)
                        updateIndicatorUser(1)
                    }).catch(error => {
                        console.error(new Error(`createIndicator - ${systemVariables.userEmail} - ${systemVariables.firstName} - Error creating indicator. ${error}`))
                        reject(error)
                    })
                }

                // Busca perfil do indicator na tabela de indicatores
                const getIndicator = () => {
                    dataBaseRef.dbRefIndicator.once('value').then(snapshot => {
                        const data = snapshot.val()
                        if (!data) {
                            log(`getIndicator - ${systemVariables.userEmail} - ${systemVariables.firstName} - Indicator doesn't exist. Get Result: ${JSON.stringify(data)}`)
                            createIndicator()
                        } else if (data) {
                            log(`getIndicator - ${systemVariables.userEmail} - ${systemVariables.firstName} - Indicator exist. Get Result: ${JSON.stringify(data)}`)
                            const indicatedNum = parseInt(data.indicatedUsers) + 1
                            updateIndicator(indicatedNum)
                        }
                    }).catch(error => {
                        console.error(new Error(`getIndicator - ${systemVariables.userEmail} - ${systemVariables.firstName} - Error get Indicator. ${error}`))
                        reject(error)
                    })
                }

                getIndicator()

            }
            // Create vehicle profile in the database
            const createVehicleProfile = () => {
               dataBaseRef.vehicleDbRef.update(vehicleProfile).then(() => {
                    log(`createVehicleProfile - ${systemVariables.userEmail} - ${systemVariables.firstName} - ${systemVariables.carPlate} - Vehicle Profile Created. ${JSON.stringify(vehicleProfile)}`)
                    indication()
                }).catch(error => {
                    console.error(new Error(`createVehicleProfile - ${systemVariables.userEmail} - ${systemVariables.firstName} - ${systemVariables.carPlate} - Error Creating Vehicle Profile. ${error}`))
                    reject(error)
                })
            }

            // Update user profile with messenger info
            const updateProfile = () => {
                dataBaseRef.userDbRef.update(userProfile).then(() => {
                    log(`updateProfile - ${systemVariables.userEmail} - ${systemVariables.firstName} - Perfil gravado com sucesso no DB.`)
                    createVehicleProfile()
                }).catch(error => {
                    console.error(new Error(`updateProfile - ${systemVariables.userEmail} - ${systemVariables.firstName} - Falha ao criar perfil. ${error}`))
                    reject(error)
                })
            }

            // Cria perfil do usuário usando ID de cliente Woocommerce como Chave primária            
            const checkProfile = profileUser => {
                if (profileUser.idClient === undefined || profileUser.idClient === null || !profileUser.idClient) {      // Não existem dados do perfil do usuário no sistema
                    log('profileUser.idClient: ', profileUser.idClient)
                    console.error(new Error(`checkProfile - ${systemVariables.userEmail} - ${systemVariables.firstName} - User without profile. Result: ${JSON.stringify(profileUser)}.`))
                    reject(`No clientId in DB.`)
                } else if (profileUser.idClient) {
                    log(`checkProfile - ${systemVariables.userEmail} - ${systemVariables.firstName} - User with profile. Result: ${JSON.stringify(profileUser)}`)
                    updateProfile()
                }
            }

            // Checa se já foi criado o perfil do user pelo webhook do woocommerce
            const getProfile = () => {
                // Recuperar dados do usuário para checar se pré perfil foi criado
                dataBaseRef.userDbRef.once('value').then(snapshot => {
                    profileUser = snapshot.val()
                    // Check if user had previous activations (changed vehicle)
                    if (profileUser.activations && profileUser.activations > 0) {
                        log('profileUser.activations: ', profileUser.activations)
                        userProfile.activations = profileUser.activations
                    }
                    log(profileUser.vehicleInUse)
                    // Check if user already had done onboard
                    if (profileUser.onboard || profileUser.vehicleInUse !== undefined){
                        console.error(new Error(`GetProfile - user already did Onboard`))
                        response.json({
                            "messages":[
                                {
                                    "text": `😵 Oops ${systemVariables.firstName}... Essa função está desabilitada. Você já realizou o processo de ativação do Onsurance!`
                                },
                                {
                                    "attachment": {
                                        "type": "template",
                                        "payload": {
                                        "template_type": "button",
                                        "text": "Caso precise de ajuda fale com um de nossos especialistas. Obrigado pela compreensão. 😉",
                                        "buttons": [
                                            {
                                            "type": "show_block",
                                            "block_names": ["Human interaction"],
                                            "title": "Falar c Especialista"
                                            },
                                        ]
                                        }
                                    }
                                }
                            ],
                            "redirect_to_blocks": [
                                "Ligar"
                            ]
                        })
                    } else {
                        log(`checkProfile - ${systemVariables.userEmail} - ${systemVariables.firstName} - Success Getting User profile. 1st Onboard try.`)
                        checkProfile(profileUser)
                    }
                    
                }).catch( error => {
                    console.error(new Error(`getProfile - ${systemVariables.userEmail} - ${systemVariables.firstName} - Error getting User Profile. ${error}.`))
                    reject(error)
                })
            }

            getProfile()

        })
    }

    // Execute the promises for creating profile and indication check
    return createProfiles().then(()=> {
        log(`*** Final - Todas as funcões foram executadas com sucesso. ***`)
        response.json({
            "messages": [
                {
                    "text": `Opa ${systemVariables.firstName}! Terminei de verificar seus dados com sucesso e já posso começar a te proteger. Antes que eu me esqueça, valor da sua protecão vai ser de R$${(minuteValue/1000).toFixed(5)} ou ${minuteValue} créditos por minuto.`
                },
                {
                    "text": `Seu saldo atual é de: ${profileUser.wallet.switch} Créditos, que é o equivalente a R$${profileUser.wallet.money}.`
                },
                // {
                //     "text": `${brbCardUser}`
                // }
            ],
            "set_attributes":
            {
                "valorMinuto": minuteValue,
                "user-credit": profileUser.wallet.switch,
                "user-money": profileUser.wallet.money,
                "idCliente": profileUser.idClient
            },
            "redirect_to_blocks": [
                "welcome"
            ]
        })
    }).catch(error => {
        console.error(new Error(`*** final - Erro ao executar funcões. Retorno imediato. ${error} ***`));
        response.json({
            "messages": [
                {
                    "text": `Olá! Identifiquei um pequeno erro. Não consegui recuperar seus dados em nosso servidor. Preciso que você verifique suas informações e tente novamente.`
                },
                {
                    "text": `Verifique também se sua compra foi efetivada. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista" ou mande mensagem em nosso Whatsapp: +1 (800) 718-0234.`
                }
            ],
            "redirect_to_blocks": [
                "Informar Email"
            ]
        })
    })
     
})

// Woocommerce webhook reciever. Recieves when order updates status
exports.wooWebhook = functions.https.onRequest((request, response) =>{
    log(`1 - Request Body: ${JSON.stringify(request.body)}`);
    const getVariables = require(`./messengerVariables.js`)

    const wooRequest= JSON.stringify(request.body)
    const wooRequestParsed = JSON.parse(wooRequest)
    const lineItems = wooRequestParsed.line_items
    const orderId = wooRequestParsed.id
    let valorCrédito = 0
    // let adcCrdPlus = false

    if (wooRequestParsed.status === "completed") {
    
        for (const value of lineItems){

            if (value.product_id === 386 || value.product_id === 543){
                    log(`Check for non Credit Products: ${JSON.stringify(value.product_id)}`);

            } else {
                // Check if is Initial credit For BRB promo
                // value.product_id === 384 ? adcCrdPlus = true: adcCrdPlus = false
                // value.product_id === 1112 ? adcCrdPlus = true: adcCrdPlus = false
                log(` Produto que entra no crédito: ${JSON.stringify(value.product_id)}`);
                log(`Preco do produto:${JSON.parse(value.price)}`);

                valorCrédito = JSON.parse(value.price) + valorCrédito
                log('valorCrédito: ', valorCrédito);
            }
        }
        log(`Valor total da compra para créditos: ${valorCrédito}`);

        const billing = wooRequestParsed.billing
        const clienteId = wooRequestParsed.customer_id  
        const firstName = billing.first_name
        const userEmail = (billing.email).toLowerCase()
        const systemVariables = {
            userEmail: userEmail,
            carPlate: "",
            indicator: "",
        }
        // const metaData = wooRequestParsed.meta_data
        // let brbCard = false
        // const brbCardCheck = metaData.filter((check) => check.key === "BRBCard" )
    
        // if (brbCardCheck[0] === undefined || brbCardCheck[0] === null || !brbCardCheck[0]) {
        //     log(`Não é brbCard. brbCard: `, brbCard)
        // } else {
        //     if (brbCardCheck[0].value === `true` && adcCrdPlus === true){
        //         log(`Adicionar R$50 ao crédito`)
        //         valorCrédito += 50
        //         brbCard = true
        //     } else if (brbCardCheck[0].value === `false`){
        //         log(`Não adicionar R$50 ao crédito`)
        //     }
        // }
        const dataBaseRef = getVariables.getDataBaseRefs(systemVariables, crypto)    

        const perfilUser = {
            wallet: {
                switch: (valorCrédito * 1000),
                money: valorCrédito
            },
            indication: {
                indicatedUsers: 0,
                indicationPromo: false
            },
            idClient: clienteId,
            // brbCard: brbCard,
            cpf: billing.cpf,
            lastOrder: orderId,
            userEmail: userEmail,
            onboard: false,
        }  
     
        // Checar existência de usuário no banco de dados
        const createPreProfile = perfilUser => {
            return new Promise((resolve, reject) => {

                 // Caso o user não exista, cria o perfil dele no DB
                 const createProfile = perfilUser => {
                    // cria perfil de usuário no banco de dados de indicador  
                   dataBaseRef.userDbRef.update(perfilUser).then(() =>{
                        log(`createProfile - ${userEmail} - ${firstName} -  User pre profile created.`);
                        resolve(true);
                    }).catch(error => {
                        console.error(new Error(`createProfile - ${userEmail} - ${firstName} -  Error creating user. ${error}`))
                        reject(error)
                    })
                }  

                // Caso o user exista, atualiza o saldo dele no DB
                const updateBalance = (newSwitch, newMoney) => {
                    //Atualiza o numero de indicados (indicadores)
                   dataBaseRef.userDbRef.update({
                       wallet: {
                        switch: newSwitch,
                        money: newMoney
                       },
                       lastOrder: orderId
                    }).then(() =>{
                        log(`updateBalance - ${userEmail} - ${firstName} -  User balance updated.`);
                        resolve(true);
                    }).catch(error => {
                        console.error(new Error(`updateBalance - ${userEmail} - ${firstName} -  Error updating balance. ${error}`))
                        reject(error)
                    })
                } 

                // Após recuperar dados no DB verifica se o user existe ou não e faz as tratativas
                const checkProfile = (data) => {
                    if (!data) {
                        log(`checkProfile - ${userEmail} - ${firstName} -  No User in DB. ${JSON.stringify(data)}.`)
                        createProfile(perfilUser)
                    } else if (data.idClient) {
                        // caso exista, atualiza o numero de indicadores e adiciona um elemento no array
                        if (orderId !== data.lastOrder) {
                            log(`checkProfile - ${userEmail} - ${firstName} -  User in DB. Have pre profile. ${JSON.stringify(data)}`);
                            const newSwitch = parseFloat(data.wallet.switch + (valorCrédito * 1000))
                            const newMoney = parseFloat(data.wallet.money + valorCrédito)
                            log('New Switch: ', newSwitch);
                            log('New Money: ', newMoney); 
                            updateBalance(newSwitch, newMoney)
                        } else {
                            console.info(`Order Already computed.`)
                            response.status(202).send(`order already computed`)
                        }
                        
                    } else if (!data.idClient) {
                        log(`checkProfile - ${userEmail} - ${firstName} -  User in DB. But only by indication. ${JSON.stringify(data)}.`)
                        perfilUser.indication.indicatedUsers = data.indication.indicatedUsers
                        createProfile(perfilUser)
                    }
                } 

                // Checa se já existe o User no DB
                const getUser = () => {
                    // Pega no banco de dados o usuário que fez a indicação para realizar as acões necessáriis
                    dataBaseRef.userDbRef.once('value').then(snapshot => {
                    log(`getUser - ${userEmail} - ${firstName} -  Success in getting USER.`);
                    const data = snapshot.val();
                    checkProfile(data)
                    }).catch(error => {
                        console.error(new Error(`getUser - ${userEmail} - ${firstName} -  Error getting User. ${error}`))
                        reject(error)
                    })
                }
                
                getUser()
            })
        }
        
        createPreProfile(perfilUser).then(() => {
            log('*** Profile Creation Successful. ***')
            response.status(200).send(`Executado com sucesso.`)
        }).catch(error => {
            console.error(new Error(`*** Error Creating Profile. ${error} ***`))
            response.status(409).send(`Erro ao executar funcão.`)
        })

    } else {
        log("Order Not Completed Yet.");
        response.status(206).send(`Ordem não concluida.`)
    }

})

// Quotation for anual cost of Onsurance
exports.quotation = functions.https.onRequest((request, response) => {
    log(`${request.query["first name"]} - ${request.query["email_address-sim"]} - Cotation:   ${JSON.stringify(request.query)}`);

    const calcMin = require('./calcMin.js')

    // dados do usuário
    const userEmail = request.query["email_address-sim"];
    const firstName = request.query["first name"];

    // Dados do veículo
    const carValue = request.query["car-value-sim"]
    const vehicleType = request.query["vehicleType"]
    const factory = request.query["factory-sim"]
    const onboard = request.query["onboard-device-sim"]
    const horasUsoDia = request.query["horasUso-sim"];
    const valorSeguro = request.query["valorSeguro-sim"];
    const valorSemSeguro = request.query["valorSemSeguro-sim"];
    let valorDoSeguro = valorSeguro

    let carPrice = parseInt(carValue)
    if (vehicleType === "Moto" ){
        carPrice = carValue*2
    }

    let valorMinuto = 0.00484
    const getMinutePrice = () => {
        return new Promise((resolve, reject) => {
            calcMin.calcMinCar(carPrice).then(result => {
                valorMinuto = result
                log('valorMinuto: ', valorMinuto);
                if (factory === "Importado"){
                    valorMinuto = parseFloat((valorMinuto*1.2).toFixed(3))
                }
                resolve(valorMinuto)
            }).catch(error => {
                console.error(new Error(`${JSON.stringify(error)}, CarValue: ${carValue}.`))
                log('## Back to messenger ##')
                return response.json({
                    "messages": [
                        {
                            "text": `${error.textCot}`,
                        }
                    ],
                    "redirect_to_blocks": [
                        `${error.blockCot}`
                    ]
                })
            })
        })
    }  
    
    getMinutePrice().then(result =>{
        log(`2 - ${userEmail} - ${firstName} -  minute value, ${valorMinuto}`);

        let consumoAnual = parseFloat(((horasUsoDia*60*365)*(valorMinuto/1000)).toFixed(2))
        log('consumoAnual no OBD: ', consumoAnual);

        if (onboard === "OnBoard 39,90"){
            log(`OnBoard Basic`)
            consumoAnual += 478.8
        }  else if (onboard === "OnBoard 99,90"){
            log(`OnBoard Wi-Fi`)
            consumoAnual += 1198.8
        }
        consumoAnual = parseFloat((consumoAnual).toFixed(2))
        log(`3 - ${userEmail} - ${firstName} -  consumo anual + OBD: ${consumoAnual}`);
        let consumoAnualVirg = consumoAnual.toString();
        consumoAnualVirg = consumoAnualVirg.replace(".", ",");
        const monthCost = parseFloat((consumoAnual/12).toFixed(2))
        log('monthCost: ', monthCost);
        
/* ---------------------------  Credit min - Franquia --------------------- */

        let creditoMin = 999
        let franquia = 1500

                        // MOTOS 

        // Franquia Moto
        if (vehicleType === "Moto" &&  carValue <= 19000) {
            franquia = 1500
        } else if (vehicleType === "Moto" &&  carValue > 19000){

            if (factory === "Nacional" && carValue > 25000){
                franquia = carValue * 0.06
            } 
            if(factory === "Importado"){
                franquia = carValue * 0.08
            }
        }

        // Credit Min Moto
        if (vehicleType === "Moto" && carValue <= 16650){
            creditoMin = 999

        } else if (vehicleType === "Moto" && carValue > 16650) {
            creditoMin = carValue*0.06
        }

                        // CARS

        // Nacional Cars
        if (vehicleType === "Carro" && factory === "Nacional"){
            // Franquia
            if (carValue < 37500){
                franquia = 1500
            } else if (carValue >= 37500) {
                franquia = carValue * 0.04
            }
            // Credit Min
            if (carValue > 40000) {
                creditoMin = carPrice*0.03
            } else if (carValue > 10000 && carValue <= 40000){
                creditoMin = 1199
            } else if (carValue <= 10000){
                creditoMin = 999
            }

        }

        // Imported Cars
        if (vehicleType === "Carro" && factory === "Importado") {
            // Franquia
            if (carValue < 37500){
                franquia = 3000
            } else if (carValue >= 37500) {
                franquia = carValue * 0.08
            }
            // Min credit
            if (carValue > 40000) {
                creditoMin = carPrice*0.045
            } else {
                creditoMin = 1799
            }
        }
        let insurance_calc = valorDoSeguro
        // Calcula valor do seguro tradicional caso o usuário não tenha seguro
        if (valorSemSeguro === "0.05"){
            if (factory === "Importado") {
                valorDoSeguro = (0.096*carValue).toFixed(2);
                insurance_calc = valorDoSeguro
            } else {
                valorDoSeguro = (0.05*carValue).toFixed(2);
                insurance_calc = valorDoSeguro
            }
            if (vehicleType === "Moto"){
                valorDoSeguro = (carValue*0.08).toFixed(2)
                insurance_calc = valorDoSeguro
            }
        } else {
            if (factory === "Importado") {
                insurance_calc = (0.096*carValue).toFixed(2)
            } else {
                insurance_calc = (0.05*carValue).toFixed(2)
            }
            if (vehicleType === "Moto"){
                insurance_calc = (carValue*0.08).toFixed(2)
            }
        }
        log(`4 - ${userEmail} - ${firstName} -  valor do seguro: ${valorDoSeguro}`);
        const minuteValueRS = (valorMinuto/1000).toFixed(5)

        const creditDuration = (creditoMin/monthCost).toFixed(2)
        log('creditDuration: ', creditDuration)
        log('creditoMin: ', creditoMin)

        response.json({
            "messages": [
                {
                    "text": `Conforme suas respostas, o valor do minuto da proteção é de R$${minuteValueRS}. Você liga para proteger e desliga para economizar. No seu caso de uso o custo médio da proteção será de R$${consumoAnualVirg} ao ano.`,
                },
                {
                    "text": `Dessa forma, você vai conseguir usar a proteção Onsurance por ${creditDuration} meses.`
                }
            ],
            "set_attributes": {
                "valorSeguro-sim": valorDoSeguro,
                "valorProtecaoAnual-sim": consumoAnual,
                "creditoMin-sim": creditoMin.toFixed(2),
                "valorMinRS-sim": minuteValueRS,
                "franquia-sim": franquia,
                "economia-sim": (valorDoSeguro - consumoAnual).toFixed(2),
                "creditDuration": creditDuration,
                "insurance_calc": insurance_calc
            }
        })
    }).catch(error => {
        console.error(new Error(`Error in cotation. ${error}`))
        response.json({
            "messages": [
                {
                    "text": "Opa, ocorreu um pequeno em nosso servidor. Vamos tentar novamente."
                },
                {
                    "text": "Caso o erro persista, digite 'falar com especialista' que trago nosso consultor para resolver o problema. Obrigado"
                }
            ],
            "redirect_to_blocks":[
                "Entrada inicial de dados"
            ]
        })
    })
    

})

// Protection simulation
exports.simulation = functions.https.onRequest((request, response) =>{
    log(`***  ${request.query["messenger user id"]} - Protection Simulation:  ${JSON.stringify(request.query)}`);

       // Dados do usuário
       const userEmail = request.query["email-address-sim"];
       const firstName = request.query["first name"];
       const userCredit = request.query["user-credit-sim"];
       const userMoney = request.query["user-money-sim"];
   
       // Dados do veículo
       const carValue = request.query["car-value-sim"];
       const valorMinuto = request.query["valorMinuto-sim"];
       const factory = request.query["factory-sim"]

       // Dados de tempo
       const timeStart = request.query["timeStart-sim"];
   
       // Dados da proteção
       const statusProtecao = request.query["status-protecao-sim"];
       const numAtivacao = parseInt(request.query["numAtivacao-sim"]);
       
       let numeroAtivacoes = numAtivacao; 
       let valorMinutoSim

            // Funcão para acionar a protecão
    const ligarProtecao = () => {
        log(`ligarProtecao - 1 - ${userEmail} - ${firstName} -  Funcão Ligar proteção numAtivacao: ${numAtivacao}`);


        // Gera timeStamp do inicio da protecão
        const inicioProtecao = Date.now()/1000|0;
        const estadoProtecao = "ON-SIM";
        numeroAtivacoes = numAtivacao + 1;


        if (numAtivacao === 0){ // Primeira Ativacão
        log(`ligarProtecao - 1 - ${userEmail} - ${firstName} -  primeira ativacão`);

            // Function that calculates minute price
            const calcMin = require('./calcMin.js')
            const firstActivation = () => {
                return new Promise((resolve, reject) => {
                    calcMin.calcMinCar(carValue).then(result => {
                        valorMinutoSim = result
                        log('valorMinuto normal: ', valorMinutoSim);
                        if (factory === "Importado"){
                            valorMinutoSim = parseFloat((valorMinutoSim*1.2).toFixed(3))
                            log('valorMinuto Imported: ', valorMinutoSim);
                        }
                        resolve(valorMinutoSim)
                    }).catch(error => {
                        console.error(new Error(`${JSON.stringify(error)}, CarValue: ${carValue}.`))
                        log('## Back to messenger ##')
                        return response.json({
                            "messages": [
                                {
                                    "text": `${error.textSim}`,
                                }
                            ],
                            "redirect_to_blocks": [
                                `${error.blockSim}`
                            ]
                        })
                    })
                })
            }  
            
            firstActivation().then(result =>{
            response.json({
                "messages": [
                    {
                        "text": `Parabéns pela primeira ativação de sua simulação de proteção. O custo da sua proteção é de ${valorMinutoSim} créditos por minuto. Baseado nesse valor, você tem aproximadamente ${(10000/valorMinutoSim).toFixed(0)} minutos para simular a proteção do seu veículo. Aproveite bastante.`
                    }
                ],
                "set_attributes":
                {
                    "status-protecao-sim": estadoProtecao,
                    "numAtivacao-sim": numeroAtivacoes,
                    "timeStart-sim": inicioProtecao,
                    "primeira-ativacao": inicioProtecao,
                    "valorMinuto-sim": valorMinutoSim
                },
                "redirect_to_blocks": [
                    "Mensagem de boas vindas primeira proteção Simulação"
                ]
            });
            }).catch(error => {
                console.error(new Error(`Error activating protection simulation. ${error}`))
                response.json({
                    "messages": [
                        {
                            "text": "Não consegui realizar sua ativação. Vamos tentar novamente."
                        },
                        {
                            "text": "Caso o erro persista, digite 'falar com especialista' que trago nosso consultor para resolver o problema. Obrigado"
                        }
                    ],
                    "redirect_to_blocks":[
                        "Entrada de dados para simular"
                    ]
                })
            })

            
        } else if (numAtivacao >= 1 && userCredit >= 300 ) {  // pode usar a Proteção


            response.json({
                "messages": [
                    {
                        "text": `Sua proteção simulada está ligada!`
                    }
                ],
                "set_attributes":
                {
                    "status-protecao-sim": estadoProtecao,
                    "numAtivacao-sim": numeroAtivacoes,
                    "timeStart-sim": inicioProtecao,
                },
                "redirect_to_blocks": [
                    "Desligar Simulação"
                ]
            });

        } else if (numAtivacao >1 && userCredit < 100) { // pouco crédito
            response.json({
                "messages": [
                    {
                        "text": `Seus créditos acabaram! Para usar a proteção Onsurance de verdade compre agora e tenha todos os benefícios da proteção On Demand.`
                    }
                ],
                "set_attributes":
                {
                    "status-protecao-sim": "OFF-SIM",
                    "numAtivacao-sim": numeroAtivacoes,
                    "timeStart-sim": inicioProtecao,
                },
                "redirect_to_blocks": [
                    "Comprar Proteção"
                ]
            });
        }

    }

    const desligarProtecao = () => {
        // Desliga a proteção, alterando o atributo status-protecao do chatfuel
        const estadoProtecao = "OFF-SIM";
        // Pega o tempo do desligamento
        // Criando minha própria funcão de tempo
        const finalProtecao = Date.now()/1000|0;
        const tempoProtecao = finalProtecao - timeStart; // TimeDiff
        const dias = (tempoProtecao/60/60/24|0); // TimeDiffDays
        const horasTotais = (tempoProtecao/60/60|0); // TimeDiffHours Totais
        const minTotais = (tempoProtecao/60|0); // TimeDiffMinutes Totais
        const horas = (horasTotais - (dias*24)); // TimeDiffHours
        const minutos = (minTotais - (horasTotais * 60)); // TimeDiffMinutes
        const segundos = (tempoProtecao - (minTotais*60)); // TimeDiffSeconds
        let valorConsumido

        // Calcula o valor conumido baseado no tempo de uso. 
        if (segundos >= 30){
            valorConsumido = (Math.ceil(tempoProtecao/60))*valorMinuto;
            log(`desligarProtecao - 3 - ${userEmail} - ${firstName} -  Segundos Maior que 30: ${segundos}`);
        } else if (segundos < 30) {
            valorConsumido = (Math.floor(tempoProtecao/60))*valorMinuto;
            log(`desligarProtecao - 4 - ${userEmail} - ${firstName} -  Segundos Menor que 30: ${segundos}`);
        }
        
        const saldoCreditos = userCredit - valorConsumido;
        const saldoDinheiro = (userMoney - (valorConsumido/1000)).toFixed(4); 
        log(`desligarProtecao - 4.5 - ${userEmail} - ${firstName} -  Valor consumido: ${valorConsumido}`);

        response.json({
            "messages": [
                {
                    "text": "Sua proteção está desligada!"
                }
            ],
            "set_attributes":
                {
                    "status-protecao-sim": estadoProtecao,
                    "user-credit-sim": saldoCreditos,
                    "user-money-sim": saldoDinheiro,
                    "valorconsumido-sim": valorConsumido,
                    "dias": dias,
                    "horas": horas,
                    "minutos": minutos,
                    "segundos": segundos
                },
                "redirect_to_blocks": [
                    "Pós Off simulação"
                ]
        });    
    }

    // Protecão desligada. Liga a Protecão
    if (statusProtecao === "OFF-SIM"){
        // Chama a funcão de ligar a protecão
        ligarProtecao();

    //Protecão ligada. Desliga a proteão
    } else if (statusProtecao === "ON-SIM") {
        desligarProtecao();
    }


})

// Request recieved from gurtam plataform
exports.vehicleIgnition = functions.https.onRequest((request, response) =>{
   
    log('request Body: ', (request.body));
    const body_data = (Object.keys(request.body)).toString()
    log('body_data: ', body_data);
    const car_status = JSON.parse(body_data)
    log('car_status: ', car_status);
    const value = car_status.value
    const messenger_id = car_status.messenger_id

    let block_id = '5c894cf10ecd9f1d82d179b4'
    
    if (value === "Activated") {
        block_id = '5c894cf10ecd9f1d82d179b4'
    } else {
        block_id = '5c894cfe0ecd9f1d82d17e69'
    }

    const sendMessage = () =>{
        return new Promise((resolve, reject) => {
            // const urlHomolog = `https://api.chatfuel.com/bots/5b6c74f30ecd9f13f0f036e3/users/${messengerId}/send`
            // const homologToken = 'qwYLsCSz8hk4ytd6CPKP4C0oalstMnGdpDjF8YFHPHCieKNc0AfrnjVs91fGuH74'

            const urlProdution = `https://api.chatfuel.com/bots/5a3ac37ce4b04083e46d3c0e/users/${messenger_id}/send`
            const productionToken = "qwYLsCSz8hk4ytd6CPKP4C0oalstMnGdpDjF8YFHPHCieKNc0AfrnjVs91fGuH74"
            const request = require("request");

            const options = { method: 'POST',
            url: urlProdution,
            qs: { 
                chatfuel_token: productionToken,
                chatfuel_block_id: block_id,
            },
            headers: { 'Content-Type': 'application/json' },
            body: { 
                chatfuel_token: productionToken,
                chatfuel_block_id: block_id 
            },
            json: true };

            request(options, function (error, resp, body) {
                if (error){ 
                    console.error(new Error(error))
                    reject(error)
                } else {
                    log(`Message sent to Messenger`)
                    resolve(`Ignition ${value}`)
                }

            });
        })
        
   
    }

    sendMessage().then(result =>{

        response.status(200).send(result)
    }).catch(error =>{
        response.status(400).send(error)
    })

    
})

// Request to validade email input
exports.checkEmail = functions.https.onRequest((request, response) => {
    log(`${JSON.stringify(request.query)}`)
    const variableCheck = request.query["checkEmail"].toLowerCase()
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    const check = re.test(variableCheck)
    function ValidateEmail() {
        
        if (check){
            const userEmail = variableCheck
            log("You have entered an Super Hyper Valid email address!")

            response.json({ 
                "set_attributes": {
                    "indicador": userEmail
                }
            })

        } else {
            log("You have entered an invalid email address!")
            response.json(200)
        }
    }

    ValidateEmail()
})

// Request to validade email input in quotation
exports.checkEmailQuotation = functions.https.onRequest((request, response) => {
    log(`${JSON.stringify(request.query)}`)
    const variableCheck = request.query["email_address-sim"].toLowerCase()
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    const check = re.test(variableCheck)
    const block = 'Segunda entrada de Dados'
    function ValidateEmail() {
        
        if (check){
            log("You have entered an Super Hyper Valid email address!")

            response.json({ 
                "set_attributes":
                    {
                        "checkEmail": true
                    }
            })

        } else {
            log("You have entered an invalid email address!")
            response.json({ 
                "messages": [
                    {
                        "text": "Email inválido. Por favor, insira o seu email para fazer a cotação."
                    }
                ],
                "set_attributes":
                    {
                        "checkEmail": false
                    },
                "redirect_to_blocks": [
                    `${block}`
                ]
            })
        }
    }

    ValidateEmail()
})

// Register obd and billing period on DB
exports.registerObd = functions.https.onRequest((request, response) => {
    log(`${JSON.stringify(request.body)}`);
    log(`${JSON.stringify(request.query)}`);

    const userEmail = (request.body["user_email"]).toString()
    const plan = request.body["plan"]

    // const admin = require('./admin/admin.js')
    const getDatabase = require('./database.js')
    // const secrets = admin.getSecretCustomer()
    const userDbId = crypto.createHash('md5').update(userEmail).digest("hex");
    log('userDbId: ', userDbId)
    // const userDbId = crypto.createHmac('sha256', secrets.userSecret).update(userEmail).digest('hex')

    
    const today = new Date();
    let billingPeriod = 0
    if (today.getDate() > 28 || today.getDate() === 1) {
        billingPeriod = 28
    } else if (today.getDate() <= 28 && today.getDate() >= 2){
        billingPeriod = today.getDate() - 1
        // billingPeriod = today.getDate()
    }

    log('billingPeriod: ', billingPeriod);

    const database = getDatabase.billingDatabase(billingPeriod, userDbId)
    const userBillingProfile = {
        activePlans: 1,
        plans: {
            0: plan
        },
        billings: 1
    }

    let discountValue = 0
    if (plan === 'smart'){
        discountValue += 39.9
    } else if (plan === 'wifi'){
        discountValue += 99.9
    } else {
        response.status(401).send(`plan unknow - ${plan}`)
    }
    const discountValueFromUser = (newWallet) =>{
        database.userDbRef.child(`wallet`).set({
            switch: parseFloat(newWallet.switch),
            money: parseFloat(newWallet.money)
        }).then((result) => {
            log(`Discounted`)
            response.status(200).send(`OBD cadastrado e descontado com sucesso.`)

        }).catch((error) => {
            console.error(new Error(`discountValueFromUser - Coudnt discount value from wallet. ${error}`))
            response.status(401).send(`discountValueFromUser - Coudnt discount value from wallet. ${error}`)
        });
    }

    const getWallet = () => {
        database.userDbRef.once('value').then(snapshot => {
            const profile = snapshot.val()
            const wallet = profile.wallet
            log('wallet: ', wallet);
            const newWallet = {
                switch: parseFloat((parseFloat(wallet.switch) - (discountValue*1000)).toFixed(2)),
                money: parseFloat((parseFloat(wallet.money) - discountValue).toFixed(4))
            }
            discountValueFromUser(newWallet)
        }).catch((error) => {
            console.error(new Error(`getWallet - Failed to get wallet from User DB - error: ${error}`))
            response.status(401).send(`getWallet - Failed to get wallet from User DB  - error: ${error}`)        
        });
    }

    database.billingDbRef.child(`${userDbId}`).update(userBillingProfile).then((result) => {
        getWallet()
    }).catch((err) => {
        response.status(401).send(`failed to update billing profile hehe`)        
    });
})

// Do cron job to generate pay value
exports.billingObd = functions.https.onRequest((request, response) =>{

    // Import from files
    const getDatabase = require(`./database`)

    const executeBilling = () => {
        return new Promise((resolve, reject) => {
        
            const iterateList = (arrayKeys, billingArray, billingPeriod) => {
                
                const iterateArray = (item, indice, array) => {
                    log(`Array value item: ${JSON.stringify(billingArray[`${item}`])}`)
                    log(`Item: ${item}`);
                    log(`Indice: ${indice}`);
                    const userDbId = item
                    let messengerId
                    log('userDbId: ', userDbId);
                    const dataBaseRef = getDatabase.billingDatabase(billingPeriod, userDbId)

                    // --------------------
                    
                    const billings = (billingArray[`${item}`].billings) + 1
                    const plans = billingArray[`${item}`].plans
                    let device_type = ''
                    console.log('plans: ', plans);
                    let discountValue = 0
                    plans.forEach(element => {
                        if (element === 'smart'){
                            device_type = device_type.concat('Smart. ')
                            discountValue += 39.90
                        } else if (element === 'wifi'){
                            device_type = device_type.concat('Wifi. ')
                            discountValue += 99.90
                        } else {
                            reject(`plan unknow - ${plans}`)
                        }
                    })
                    log(`discountValue is: ${discountValue}`)

                    const sendMessage = (newWallet) =>{
                        log(`Into sendMessage`);
                        // const urlHomolog = `https://api.chatfuel.com/bots/5b6c74f30ecd9f13f0f036e3/users/${messengerId}/send`
                        // const homologToken = 'qwYLsCSz8hk4ytd6CPKP4C0oalstMnGdpDjF8YFHPHCieKNc0AfrnjVs91fGuH74'

                        const urlProdution = `https://api.chatfuel.com/bots/5a3ac37ce4b04083e46d3c0e/users/${messengerId}/send`
                        const productionToken = "qwYLsCSz8hk4ytd6CPKP4C0oalstMnGdpDjF8YFHPHCieKNc0AfrnjVs91fGuH74"
                        const request = require("request");

                        const options = { method: 'POST',
                        url: urlProdution,
                        qs: 
                        { chatfuel_token: productionToken,
                            chatfuel_block_id: '5c4390ef76ccbc7888779d68',
                            discount_value: `${(discountValue*1000).toFixed(2)}`,
                            "device-type": `${device_type}`,
                            "user-credits": `${newWallet.switch}` },
                        headers: { 'Content-Type': 'application/json' },
                        body: 
                        { chatfuel_token: productionToken,
                            chatfuel_block_id: '5c4390ef76ccbc7888779d68',
                            discount_value: `${discountValue}`,
                            "device-type": `${device_type}`,
                            "user-credit": `${newWallet.switch}` },
                        json: true };

                        request(options, function (error, resp, body) {
                        if (error) throw new Error(error);

                        log(body)
                        log(resp)
                        });
                        log(`Array end`)
                   
                    }

                    const updateBillingProfile = (newWallet) =>{
                        log(`updateBillingProfile`)
                        dataBaseRef.billingDbRef.child(`${userDbId}`).update({
                            billings: billings
                        }).then((result) => {
                            sendMessage(newWallet)
                        }).catch((error) => {
                            console.error(new Error(`UpdateProfile - Failed to update Company Profile. ${error}`))
                            reject(`UpdateProfile - Failed to update Company Profile. ${error}`)
                        });
                    }

                    const discountValueFromUser = (newWallet) =>{
                        log(`discountValueFromUser`)
                        dataBaseRef.userDbRef.child(`wallet`).set({
                            switch: parseFloat(newWallet.switch),
                            money: parseFloat(newWallet.money)
                        }).then((result) => {
                            log(`Discounted`)
                            updateBillingProfile(newWallet)
                        }).catch((error) => {
                            console.error(new Error(`discountValueFromUser - Coudnt discount value from wallet. ${error}`))
                            reject(`discountValueFromUser - Coudnt discount value from wallet. ${error}`)
                        });
                    }

                    const getWallet = () => {
                        log(`get Wallet`)
                        dataBaseRef.userDbRef.once('value').then(snapshot => {
                            const profile = snapshot.val()
                            const wallet = profile.wallet
                            messengerId = profile.messengerId
                            log('wallet: ', wallet);
                            const newWallet = {
                                switch: parseFloat((parseFloat(wallet.switch) - (discountValue*1000)).toFixed(2)),
                                money: parseFloat((parseFloat(wallet.money) - discountValue).toFixed(4))
                            }
                            log('new Wallet', newWallet)
                            discountValueFromUser(newWallet)
                        }).catch((error) => {
                            console.error(new Error(`getWallet - Failed to get wallet from User DB - error: ${error}`))
                            reject(`getWallet - Failed to get wallet from User DB  - error: ${error}`)
                        });
                    }

                    getWallet()

                }

                arrayKeys.forEach(iterateArray)
                resolve(`Billing executado com sucesso`)
            }
        
            const getBillingList = (billingPeriod) => {
                const userDbId = 0
                const dataBaseRef = getDatabase.billingDatabase(billingPeriod, userDbId)

                dataBaseRef.billingDbRef.once('value').then(snapshot => {
                    const billingArray = snapshot.val()
                    log('billingArray: ', billingArray);
                    if (billingArray === undefined || !billingArray || billingArray === null){ // Not User
                        resolve('No billing Period')
                    } else {
                        const arrayKeys = Object.keys(billingArray)
                        log('arrayKeys: ', arrayKeys);
                        iterateList(arrayKeys, billingArray, billingPeriod)
                    }
                }).catch(error => {
                    console.error(new Error(`getBillingList - Failed to get Billing List. ${error}`))
                    reject(error)
                })
            }

            const getBillingPeriod = () => {
                const today = new Date();
                const billingPeriod = today.getDate();
                log('billingPeriod: ', billingPeriod);
                getBillingList(billingPeriod)
            }
        
            getBillingPeriod() 
        })
    }

    executeBilling().then((result) => {
        response.status(200).send(result)
    }).catch(error => {
        response.status(400).send(`${error}`)
    })
})

// Usage report for investor
exports.usageReport = functions.https.onRequest((request, response) =>{
    const getDatabase = require(`./database`)

    // get database references
    const getDataBaseRef = getDatabase.getDatabaseForReport()
    let reportProfile;
    let report;

    // Get protection status (User and vehicle Profiles)
    const GETPROFILES = async() => {
        return new Promise((resolve, reject) => {

            // Get user profile from database
            const getUserProfile = vehicleProfile => {
                getDataBaseRef.userDbRef.once('value').then(snapshot => {
                    const userProfile = snapshot.val()
                    if (userProfile === undefined || !userProfile || userProfile === null){ // Not User
                        reject("Vehicle profile not found.")
                    }
                    const PROFILESARRAY =  [vehicleProfile, userProfile]
                    resolve(PROFILESARRAY)
                }).catch(error =>{
                    console.error(new Error(`getUserProfile - Error recovering User ${error}`));
                    reject(error)
                })
            }

            // Get Vehicle profiles from database
            getDataBaseRef.vehicleDbRef.once('value').then(snapshot => {
                const vehicleProfile = snapshot.val()
                if (vehicleProfile === undefined || !vehicleProfile || vehicleProfile === null){ // Not User
                    reject("Vehicle profile not found.")
                }

                getUserProfile(vehicleProfile)
            }).catch(error => {
                console.error(new Error(`getVehicleProfile - Failed to Get Protection status. ${error}`))
                reject(error)
            })
        })
    }
     
    GETPROFILES().then((result) => {
        const vehicleProfile = result[0]
        log('vehicleProfile: ', vehicleProfile);
        const userProfile = result[1]
        log('userProfile: ', userProfile);
        generateReport(userProfile, vehicleProfile)
    }).catch((error) => {
        console.error(new Error("Failed to get profiles." + error));
    });


    function generateReport(userProfile, vehicleProfile){
        let totalUsage = 0
        let minMedia = 0
        let totalActivations = 0
        let valorConsumidoMedio = 0.001
        let first_time_activated = 9999999999
        let last_time_activated = 0
        let hours_used_day_media = 0
        let users = 0
        const transferProfile = (userProfile, vehicleProfile) => {
            return new Promise((resolve, reject) => {
                
                if (userProfile === undefined || !userProfile || userProfile === null){ // Not User
                    response.status(201)(`No Data`)
                }

                const arrayKeysUser = Object.keys(userProfile)
                const arrayKeysVehicle = Object.keys(vehicleProfile)
                users = arrayKeysUser.length


                const superArray = {
                    arrayKeysUser: arrayKeysUser,
                    arrayKeysVehicle: arrayKeysVehicle,
                    userProfile: userProfile,
                }

                const iterateArrayVehicle = async(vehicle, userEmail, indice) => {

                    // Data base reference call

                    let vehiclePlate = vehicle.profile.vehiclePlate
                    log('vehiclePlate: ', vehiclePlate);
                    const user_activations = parseFloat(vehicle.profile.activations)
                    totalActivations += user_activations
                    let minute_value = vehicle.profile.minuteValue
                    minute_value = parseFloat(minute_value)
                    minMedia += (minute_value)
                    const logUseArray = vehicle.logUse

                    let first_activation = 99999999999
                    let last_activation = 0

                    let vehicleDbId = true

                    if(vehiclePlate === undefined || vehiclePlate === null || !vehiclePlate){
                        vehiclePlate = "false"
                        vehicleDbId = false
                    }
                    
                    const dataBaseRef = getDatabase.updateDatabase("userEmail", vehiclePlate, "oldId", crypto)

                    if (vehicleDbId === true){

                        const valorConsumidoUser: number = logUseArray.reduce( ( prevVal=0, elem ) => { // gets consumed value from user log
        
                            if (elem !== null) {
                                if(elem.valorconsumido !== undefined ){
                                    return prevVal + parseFloat(elem.valorconsumido)
                                } else if (elem.valorConsumido !== undefined){
                                    return prevVal + parseFloat(elem.valorConsumido)
                                } else {
                                    return prevVal + 0
                                }
                            }
                            return prevVal + 0
                        }, 0 )    
        

                        const userUsage: number = logUseArray.reduce( ( prevVal=0, elem ) => { // gets Usage time (timestamp)
                            if (elem !== null) {
                                if (elem.inicioProtecao){
                                    const inicioProtecao = elem.inicioProtecao.split(" ")
                                    const finalProtecao = elem.finalProtecao.split(" ")
                                    const time = parseInt(finalProtecao[0]) - parseInt(inicioProtecao[0])
                                    if (first_activation > parseInt(inicioProtecao[0])) { // Get first activation
                                        first_activation = (inicioProtecao[0])
                                    }
                                    if (last_activation < parseInt(finalProtecao[0])) {
                                        last_activation = (finalProtecao[0])
                                    }
                                    return prevVal + time
                                } else if(elem.timeStart && elem.timeStart >= 0 && elem.timeEnd !== undefined){
                                    const time = parseInt(elem.timeEnd) - parseInt(elem.timeStart)
                                    if (first_activation > elem.timeStart) {
                                        first_activation = elem.timeStart
                                    }
                                    if (last_activation < elem.timeEnd) {
                                        last_activation = elem.timeEnd
                                    }
                                    return prevVal + time
                                } else {
                                    return prevVal + 0
                                }
                            }
                            return prevVal + 0
                        }, 0 )
        
                        
                        valorConsumidoMedio = valorConsumidoUser + valorConsumidoMedio
            
                        totalUsage += userUsage


                        if (first_time_activated > first_activation) {
                            first_time_activated = first_activation
                        }
                        if (last_time_activated < last_activation) {
                            last_time_activated = last_activation
                        }

                        const first_activation_date = (new Date(first_activation*1000)).toLocaleDateString()
                        const last_activation_date = (new Date(last_activation*1000)).toLocaleDateString()

                        const first_month = parseInt((first_activation_date.split("-"))[1])
                        const first_day = parseInt((first_activation_date.split("-"))[2])
                        const first_year = parseInt((first_activation_date.split("-"))[0])

                        const last_month = parseInt((last_activation_date.split("-"))[1])
                        const last_day = parseInt((last_activation_date.split("-"))[2])
                        const last_year = parseInt((last_activation_date.split("-"))[0])

                        let months_used = 0
                        if ( last_year === first_year){

                            months_used = last_month - first_month

                            if (months_used < 1){
                                months_used = 1
                            }
                        } else {
                            months_used = (12-first_month)+last_month
                        }

                        let days_used = 0
                        if (first_day >= last_day){
                            days_used = first_day - last_day 
                        } else {
                            days_used = last_day - first_day
                        }
                        months_used += parseFloat((days_used/30).toFixed(2))

                        let consumed_credit_month = 0
                        if (valorConsumidoUser < 0.0001){
                            consumed_credit_month = 1
                        } else {
                        consumed_credit_month = (valorConsumidoUser/1000/months_used)
                        }

                        const user_hours_used_day_media = (consumed_credit_month*1000/minute_value/60/30)
                        hours_used_day_media += user_hours_used_day_media
                        const remaining_credit: number = (userProfile[`${arrayKeysUser[indice]}`].personal.wallet.switch)

                        const remaining_days_credit_no_obd = parseFloat((remaining_credit/(user_hours_used_day_media*minute_value*60)).toFixed(2))
                        const remaining_days_credit_obd = parseFloat((remaining_credit/((user_hours_used_day_media*minute_value*60)+1330)).toFixed(2))

                        const lowerPlate = vehiclePlate.toString().toLowerCase()
                        const vehicleDbId = crypto.createHash('md5').update(lowerPlate).digest("hex");

                        reportProfile = {
                            _email: userEmail,
                            activations: user_activations,
                            minute_value: parseFloat((minute_value/1000).toFixed(5)),
                            protection_hours_total: userUsage/60/60|1,
                            months_used: parseFloat(months_used.toFixed(1)),
                            remaining_credit: parseFloat((remaining_credit/1000).toFixed(2)),
                            remaining_days_credit_no_obd: remaining_days_credit_no_obd,
                            remaining_days_credit_with_obd: remaining_days_credit_obd,
                            consumed_credit_month_media: parseFloat(consumed_credit_month.toFixed(2)),
                            hours_used_day_media: parseFloat(user_hours_used_day_media.toFixed(2)),
                            _first_activation: first_activation_date,
                            _last_activation: last_activation_date,
                            consumed_credit_total: parseFloat((valorConsumidoUser/1000).toFixed(2)),
                        }
                        dataBaseRef.report.child(`data/${vehicleDbId}`).update(reportProfile).then(() => {

                        if (indice === arrayKeysUser.length - 1 ){

                            const first_time_activated_date = (new Date(first_time_activated*1000)).toLocaleDateString()
                            const last_time_activated_date = (new Date(last_time_activated*1000)).toLocaleDateString()

                            const first_month = parseInt((first_time_activated_date.split("-"))[1])
                            const first_day = parseInt((first_time_activated_date.split("-"))[2])

                            const last_month = parseInt((last_time_activated_date.split("-"))[1])
                            const last_day = parseInt((last_time_activated_date.split("-"))[2])

                            let months_used = (12-first_month)+last_month
                            let days_used = 0
                            
                            if (first_day >= last_day){
                                days_used = first_day - last_day 
                            } else {
                                days_used = last_day - first_day
                            }
                            months_used += parseFloat((days_used/30).toFixed(2))

                            const consumed_credit_month = parseFloat((valorConsumidoMedio/1000/months_used).toFixed(2))

                            log(`Vehicle finished`);
                            report = {
                                totalActivations: totalActivations,
                                activations_per_user_media: parseFloat((totalActivations/arrayKeysVehicle.length).toFixed(1)),
                                minute_value_media: parseFloat(((minMedia/arrayKeysVehicle.length)/1000).toFixed(5)),
                                consumed_value_total: parseFloat((valorConsumidoMedio/1000).toFixed(2)),
                                consumed_value_per_user_media: parseFloat(((valorConsumidoMedio/arrayKeysVehicle.length)/1000).toFixed(2)),
                                protected_hours_total: (totalUsage/60/60|0),
                                consumed_credit_month_media: consumed_credit_month,
                                hours_used_day_media: parseFloat(hours_used_day_media.toFixed(2)),
                                hours_used_user_day_media: parseFloat((hours_used_day_media/arrayKeysVehicle.length).toFixed(2)),
                                operation_time: months_used,
                                first_activation: first_time_activated_date,
                                last_activation: last_time_activated_date,
                                users: users,
                                vehicles: arrayKeysVehicle.length
                            }
                            resolve(report)
                        }

                        }).catch(error =>{
                            console.error(new Error(`Error saving vehicle profile in test database.. ${error}`))
                            reject(error)
                        })
                    }
                }

                const iterateArrayUser = async(item, indice, array) => {

                    // Data base reference call
                    let userEmail = (userProfile[`${arrayKeysUser[indice]}`].personal.userEmail)
                    log('userEmail: ', userEmail)

                    if(userEmail === undefined || userEmail === null || !userEmail){
                        userEmail = "false"
                    }

                    let vehiclePlate = (userProfile[`${arrayKeysUser[indice]}`].personal.vehicleInUse)
                    if(vehiclePlate === undefined || vehiclePlate === null || !vehiclePlate){
                        vehiclePlate = "false"
                    }
                    const lowerPlate = vehiclePlate.toString().toLowerCase()
                    const vehicleDbId = crypto.createHash('md5').update(lowerPlate).digest("hex");

                    if (vehiclePlate !== "false"){
                        const vehicle = vehicleProfile[`${vehicleDbId}`]
                        log('vehicle: ', vehicle);
                        await iterateArrayVehicle(vehicle, userEmail, indice)
                        // if (indice === superArray.arrayKeysUser.length - 1 ){
                        //     log(`User ok - To vehicle`)
                        //     response.send('ok')
                        //     // superArray.arrayKeysVehicle.forEach(iterateArrayVehicle)
                        // }
                    }
                }

                arrayKeysUser.forEach(iterateArrayUser)    
            })
        }
        
        transferProfile(userProfile, vehicleProfile).then((result) => {

            // Set the results of the report in database
            getDataBaseRef.report.child('geral').set(result).then(() => {

                response.status(200).send(result)
            }).catch(error =>{
                console.error(new Error(`Error saving profile in test database. ${error}`))
                response.send(`Erro... `, error)
            })
        }).catch((err) => {
            response.status(301).send(`Erro... `, err)
        });
    }
        
   
})


// --------------------- ### 3rd Parties ### ------------------- //


// Quotation API for 3rd parties
exports.onsuranceQuotation = functions.https.onRequest((request, response) =>{
    console.log(`Body Request: ${JSON.stringify(request.body)}`);
    const getQuotation = require("./quotation.js")
    const production = false
    const data_set = {
        email_address_cot: request.body["email_address_cot"],
        first_name: request.body["first_name"],
        last_name: request.body["last_name"],
        user_phone: request.body["user_phone"],
        country: request.body["country"],
        state: request.body["state"],
        city: request.body["city"],
        insurance_owner: request.body["insurance_owner"],
        vehicle_value_cot: parseInt(request.body["vehicle_value_cot"]),
        vehicle_model_cot: request.body["vehicle_model_cot"],
        vehicle_age_cot: request.body["vehicle_age_cot"],
        use_hours_cot: request.body["use_hours_cot"],
        insurance_value_cot: request.body["insurance_value_cot"],
        vehicle_brand_cot: request.body["vehicle_brand_cot"],
        vehicle_type: request.body["vehicle_type"],
        garage_home: request.body["garage_home"],
        garage_work: request.body["garage_work"],
        onboard_device_cot: request.body["onboard_device_cot"],
        factory_cot: request.body["factory_cot"],
        no_insurance_value_cot: request.body["no_insurance_value_cot"],
        active_insurance: request.body["active_insurance"],
        actual_insurance_company: request.body["actual_insurance_company"],
        lead_sourse: request.body["lead_sourse"]
    }

    const axios = require('axios')

    const sendToZoho = (quotation_data) => {
        axios.get('https://hook.integromat.com/gp3qa3hwjc7a2f4utlts1cg4gcgfmfy3', {
            params: quotation_data.private_api
        }).then((result) => {
            log(result)
            log(result.data)
        }).catch(function (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error(new Error(error.response.data))
                console.error(new Error(error.response.status))
                console.error(new Error(error.response.headers))
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.error(new Error(error.request))
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error(new Error(error.message))
            }
            log(error.config);
        })
    }

    getQuotation.quotation(data_set).then((result) => {
        if (production) {sendToZoho(result)}
        response.status(200).send(result.public_api)
    }).catch((error) => {
        console.error(new Error(error))
        if (error.status && error.description) {
            response.status(error.status).send(error.description)
        } else {
            response.status(400).send("Erro ao realizar cotacão. Favor verifique as informacões enviadas e tente novamente.")
        }
    });

})

// Turn protection ON for Companies
exports.getClientToken = functions.https.onRequest((request, response) => {
    log('request: ', (request))
    log('request headers: ', (request.headers))
    log('request Body: ', (request.body))
    log('request Query: ', (request.query))
    const nodemailer = require('nodemailer');
    const clientId = request.body['client_id']

    const dataBaseRef = require('./companies/variables').getDataBaseRefs(clientId)

    const secret = `${request.body['client_id']}${request.body['client_secret']}`;
    const hash = crypto.createHmac('sha256', secret)
                 .update(`${Date.now()}`)
                 .digest('hex')
    console.log(hash);


    const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
            port: 465,
            secure: true,  //true for 465 port, false for other ports
            auth: {
                user: 'victor.assis@onsurance.me',
                pass: ''
            }
    });

    const mailOptions = {
        from: 'victor.assis@onsurance.me',
        to: 'victor.assis@onsurance.me',
        subject: 'Client Token',
        text: `${hash}`
    }

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.error(new Error(`Error sending token to email. ${error}`))
            response.status(500).send("Token NOT sent to email.")
        } else {
            dataBaseRef.companyProfile.update({
                access_token: hash
            }).then((result) => {
                response.status(200).send("Token generated succesfully.")
            }).catch((error) => {
                console.error(new Error(`UpdateProfile - Failed to update Company Profile. ${error}`))
                response.status(500).send("Token sent to email. But error on saving in the system.")
            })
            log('Email sent: ' + info.response);
            }
        })
})



// // Turn moobi protection OFF
// exports.moobiOff = functions.https.onRequest((request, response) => {
//     log('request: ', JSON.stringify(request.body))
//     const moobi = require(`./moobi/moobi.js`)

//     const key = request.body['key']
//     log('key: ', key);

//     !key || key === undefined ? response.status(400).send(`Key Undefined. ${key}`) : true
        
//     moobi.moobiOff(key).then(result =>{
//         response.status(200).send(`${JSON.stringify(result)}`)
//     }).catch(error => {
//         response.status(400).send(`${error}`)
//     })
// })


// // Cron job for Moobi billing period
// exports.moobiBilling = functions.https.onRequest((request, response) =>{

//     const moobi = require(`./moobi/moobi.js`)

//     log(request.headers.authorization)
//     if (request.headers.authorization === "Basic b25zdXJhbmNlTW9vYmlCaWxsaW5nOldDZTNWQCN6dWdUM0ZeM3RlWnlu"){
//         moobi.billing().then((result) => {
//             response.status(200).send(`${JSON.stringify(result)}`)
//         }).catch(error => {
//             response.status(400).send(`${error}`)
//         })
//     } else {
//         console.error(new Error(`Not Authorized conection. Check possible hack try.`))
//         response.status(203).send(`Not Authorized.`)        
//     }

    
   
// })

// // Update billing period berofe running billing
// exports.moobiUpdateBillingPeriod = functions.https.onRequest((request, response) => {
//     const moobi = require(`./moobi/moobi.js`)

//     log(request.headers.authorization)
//     if (request.headers.authorization === "Basic b25zdXJhbmNlTW9vYmlVcGRhdGVCaWxsaW5nOjQjJiQqbSpFNTN3ZkJMUEc5dTJw"){
//         log(`Authorized`)
//         moobi.changeBillingPeriod().then((result) => {
//             response.status(200).send(`${JSON.stringify(result)}`)  
//         }).catch((error) => {
//             response.status(400).send(`${error}`)        
//         });
//     } else {
//         console.error(new Error(`Not Authorized conection. Check possible hack try.`))
//         response.status(203).send(`Not Authorized.`)        
//     }

    
// })

// Update data model on DB
exports.updateDb = functions.https.onRequest((request, response) =>{
    const getDatabase = require(`./database.js`)
    const getOldData = require(`./oldData.js`)
    const oldData = getOldData.getOldData()
    console.log('oldData: ', JSON.stringify(oldData))

    const transferProfile = () => {
        return new Promise((resolve, reject) => {
            const userProfile = oldData.customers.profiles
            const vehicleProfile = oldData.items.vehicles
            if (userProfile === undefined || !userProfile || userProfile === null){ // Not User
                response.status(201)(`No Data`)
            }

            const arrayKeysUser = Object.keys(userProfile)
            log('arrayKeysUser: ', arrayKeysUser);
            const arrayKeysVehicle = Object.keys(vehicleProfile)
            log('arrayKeysVehicle: ', arrayKeysVehicle);
            
            const superArray = {
                arrayKeysUser: arrayKeysUser,
                arrayKeysVehicle: arrayKeysVehicle,
                userProfile: userProfile,
            }

            const iterateArrayVehicle = async(item, indice, array) => {
                log(`Item: ${item}`);
                log(`Indice: ${indice}`);

                const oldId = item
                log('oldId: ', oldId);

                // Data base reference call
                let vehiclePlate = (vehicleProfile[`${superArray.arrayKeysVehicle[indice]}`].profile.vehiclePlate)
                const userEmail = `not necessary`
                let vehicleDbId = true
                if(vehiclePlate === undefined || vehiclePlate === null || !vehiclePlate){
                    vehiclePlate = "false"
                    vehicleDbId = false
                }

                log('vehiclePlate: ', vehiclePlate);
                
                const dataBaseRef = getDatabase.updateDatabase(userEmail, vehiclePlate, oldId, crypto)

                if (vehicleDbId !== false){
                    dataBaseRef.vehicleDbRef.set(vehicleProfile[`${superArray.arrayKeysVehicle[indice]}`]).then(() => {
                        log(`Vehicle Profile saved.`);
                    }).catch(error =>{
                        console.error(new Error(`Error saving vehicle profile in test database.. ${error}`))
                        reject(error)
                    })
                }

                dataBaseRef.oldVehicleDbRef.remove().then(() => {
                    log(`Old Profile Deleted.`)
                    log('superArray.arrayKeysVehicle.length: ', superArray.arrayKeysVehicle.length);
                    if (indice === superArray.arrayKeysVehicle.length - 1 ){
                        resolve('Tudo certo Chefe.')
                    }
                }).catch(error =>{
                    console.error(new Error(`Error saving profile in test database. ${error}`))
                    reject(error)
                })


            }

            const iterateArrayUser = async(item, indice, array) => {
                log(`Item: ${item}`);
                log(`Indice: ${indice}`);

                const oldId = item
                log('oldId: ', oldId);

                // Data base reference call
                let userEmail = (userProfile[`${superArray.arrayKeysUser[indice]}`].personal.userEmail)
                log('userEmail: ', userEmail)
                if(userEmail === undefined || userEmail === null || !userEmail){
                    userEmail = "false"
                }
                let vehiclePlate = (userProfile[`${superArray.arrayKeysUser[indice]}`].personal.vehicleInUse)
                if(vehiclePlate === undefined || vehiclePlate === null || !vehiclePlate){
                    vehiclePlate = "false"
                }
                const dataBaseRef = getDatabase.updateDatabase(userEmail, vehiclePlate, oldId, crypto)

                dataBaseRef.userDbRef.set(userProfile[`${superArray.arrayKeysUser[indice]}`]).then(() => {
                    log(`Profile Created.`);
                }).catch(error =>{
                    console.error(new Error(`Error saving profile in test database. ${error}`))
                    reject(error)
                })

                dataBaseRef.oldUserDbRef.remove().then(() => {
                    log(`Old Profile Deleted.`)
                    log('superArray.arrayKeysUser.length: ', superArray.arrayKeysUser.length);
                    if (indice === superArray.arrayKeysUser.length - 1 ){
                        log(`User ok - To vehicle`)
                        superArray.arrayKeysVehicle.forEach(iterateArrayVehicle)
                    }
                }).catch(error =>{
                    console.error(new Error(`Error saving profile in test database. ${error}`))
                    reject(error)
                })


            }

            superArray.arrayKeysUser.forEach(iterateArrayUser)    
        })
    }
    
    transferProfile().then((result) => {
        response.status(200).send(result)
    }).catch((err) => {
        response.status(400).send(`Erro... `, err)
    });
   
})