import { databaseMethods } from "../model/databaseMethods";
import { userProfileDbRefPersonal } from "../database/database";
import { checkRequestVariables } from "../model/errors";

// request.query comes from get
// request.body comes from post

/*
    RESPONSES
    TODO:
        create a chatfuel block for every response
        Fix the quick replies 
*/

const activationFail = (protectionVariables) => {
    const activationFail = {
        "messages": [
            {
                "text": `Opa ${protectionVariables.firstName}. Não consegui ligar sua proteção. Vou trazer a função de Ligar para você tentar novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
            }
        ],
        "set_attributes":
            {
                "status-protecao": `OFF`,
            },
        "redirect_to_blocks": [
            "Ligar"
        ]
    }
    return activationFail
}

const deactivationFail = (protectionVariables, response) => {
    const deactivationFail = {
        "messages": [
            {
                "text": `Opa ${protectionVariables.firstName}. Não consegui desligar sua proteção. Vou trazer a função de Desligar para você tentar novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
            }
        ],
        "set_attributes":
        {
            "status-protecao": "ON",
        },
        "redirect_to_blocks": [
            "Desligar"
        ]
    }
    
    response.json(deactivationFail)
};

export const singleDeactivation = variables => {

    const singleDeactivation = {
        "messages": [
            {
                "text": `Sua proteção ${variables.protectionOff} está desligada!`
            }
        ],
        "set_attributes": {
                "status-protecao": variables.statusProtection,
                "user-credit": variables.newSwitch,
                "valorconsumido": variables.consumedSwitch,
                "dias": variables.days,
                "horas": variables.hours,
                "minutos": variables.minutes,
                "segundos": variables.seconds
        },
        "redirect_to_blocks": [
            `Pos Off`
        ]
    }
    return singleDeactivation
};

export const deactivationSuccessful = variables => {

    const deactivationSuccessful = {
        "messages": [
            {
                "text": "Sua proteção está desligada!"
            }
        ],
        "set_attributes": {
                "status-protecao": variables.statusProtection,
                "user-credit": variables.newSwitch,
                "valorconsumido": variables.consumedSwitch,
                "dias": variables.days,
                "horas": variables.hours,
                "minutos": variables.minutes,
                "segundos": variables.seconds
        },
        "redirect_to_blocks": [
            `Pos Off`
        ]
    }
    return deactivationSuccessful
};

export const deactivationActivation = variables => {

    const deactivationActivation = {
        "messages": [
            {
                "text": `Sua proteção ${variables.protectionOff} está desligada!`
            },
            {
                "text": `Sua proteção ${variables.protectionOn} está ligada!`
            }
        ],
        "set_attributes": {
                "status-protecao": variables.statusProtection,
                "user-credit": variables.newSwitch,
                "valorconsumido": variables.consumedSwitch,
                "dias": variables.days,
                "horas": variables.hours,
                "minutos": variables.minutes,
                "segundos": variables.seconds
        },
        "redirect_to_blocks": [
            `Pos Off`
        ]
    }
    return deactivationActivation
};

export const activationSuccessful = variables => {
    
    console.log("TCL: variables.protectionOn", variables.protectionOn)
    const activationSuccessful = {
        "messages": [
            {
                "text": `Sua proteção está ligada!`
            }
        ],
        "set_attributes":
            {
                "status-protecao": variables.statusProtection,
        },
        "redirect_to_blocks": [
            `Desligar`
        ]
    }
    
    return activationSuccessful
};

export const firstActivation = async variables => {

    const firstActivation = {
        "messages": [
            {
                "text": "Muito bom {{first name}}. Agora você é oficialmente parte da Onsurance."
            },
            {
                "text": "A proteção do veículo {{itemInUse}} está ativada."
            },
        ],
        "set_attributes":
            {
                "status-protecao": variables.statusProtection,
        },
        "redirect_to_blocks": [
            `firstActivation`
        ]
    }
    
    return firstActivation
};

export const noChangeAllOff = variables => {
    const noChangeAllOff = {
        "messages": [
            {
                "text": "Olá {{first name}}. Não houve alteração na proteção do seu {{itemInUse}}. Atualmente ela está desligada."
            },
        ],
        "set_attributes": {
            "status-protecao": "OFF",
        },
        "redirect_to_blocks": [
            `Ligar`
        ]
    }
    
    return noChangeAllOff
};

export const noChangeAllOn = variables => {
    const noChangeAllOff = {
        "messages": [
            {
                "text": "Olá {{first name}}. Não houve alteração na proteção do seu {{itemInUse}}. Atualmente ela está ligada."
            },
        ],
        "set_attributes": {
            "status-protecao": "ON",
        },
        "redirect_to_blocks": [
            `Ligar`
        ]
    }
    
    return noChangeAllOff
};

export const noChange = variables => {
    const noChangeAllOff = {
        "messages": [
            {
                "text": "Olá {{first name}}. Não houve alteração na proteção do seu {{itemInUse}}."
            },
            {
                "text": `Atualmente ${variables.statusProtection.on.join(", ")} está(ão) ligada(s) e ${variables.statusProtection.off.join(", ")} está(ão) desligada(s).`
            },
        ],
        "set_attributes": {
            "status-protecao": "ON",
        },
        "redirect_to_blocks": [
            `Ligar`
        ]
    }
    
    return noChangeAllOff
};

export const noUserProfile = variables => {

    const noUserProfile = {
        "messages": [
            {
                "text": "Olá {{first name}}. Não conseguimos encontrar seu perfil em nosso sistema. Por favor, verifique se seu email está correto."
            },
            {
                "text": `Verifique também, se ${variables.userEmail} é o mesmo email que foi usado na compra dos créditos em nosso site.`
            },
        ],
        "redirect_to_blocks": [
            `Informar Email`
        ]
    }
    
    return noUserProfile
};

export const noOnboard = variables => {

    const noOnboard = {
        "messages": [
            {
                "text": "Olá {{first name}}. Parece que seu primeiro onboard ainda não foi realizado em nosso sistema."
            },
            {
                "text": `Verifique se seus dados foram aprovados.`
            },
            {
                "text": `Caso todos os passos acima já tenham sido realizados, contate nossos especialista que rapidamente seu problema será resolvido. Agoradecemos a compreensão.`
            },
        ],
        "redirect_to_blocks": [
            `Informar Dados`
        ]
    }
    
    return noOnboard
};

export const firstAccess = variables => {

    const firstAccess = {
        "messages": [
            {
                "text": "Opaa! Verificamos os dados com sucesso."
            },
            {
                "text": "Agora está tudo pronto para acessar o Onsurance para o seu veículo."
            },
        ],
        "set_attributes": {
            "car-model": variables.itemModel,
            "car-brand": variables.itemBrand,
        },
        "redirect_to_blocks": [
            `welcome`
        ]
    }
    
    return firstAccess
};

export const alreadyDidFirstAccess = variables => {

    const noOnboard = {
        "messages": [
            {
                "text": "Opaa! Notamos que você já realizou o primeiro acesso à sua conta."
            },
            {
                "text": `Seu perfil já está apto para utilizar normalmente a proteção Onsurance.`
            },
            {
                "text": `Caso haja algum problema, contate nossos especialista que rapidamente seu problema será resolvido. Agradecemos a compreensão.`
            },
        ],
        "redirect_to_blocks": [
            `Ligar`
        ]
    }
    
    return noOnboard
};

export const noItemInUse = variables => {

    const noItemInUse = {
        "messages": [
            {
                "text": `Olá {{first name}}. Não encontramos o veículo ${variables.itemInUse} em seu perfil.`
            },
            {
                "text": `Verifique se seus dados foram aprovados e seu veículo cadastrado. Caso não seja o dono do item, verifique se o acesso foi liberado para o seu perfil.`
            },
            {
                "text": `Caso todos os passos acima já tenham sido realizados, contate nossos especialista que rapidamente seu problema será resolvido. Agoradecemos a compreensão.`
            },
        ],
        "redirect_to_blocks": [
            `changeItem`
        ]
    }
    
    return noItemInUse
};

export const noItemProfile = variables => {

    const noItemProfile = {
        "messages": [
            {
                "text": `Olá {{first name}}. Não encontramos o veículo ${variables.itemInUse} em nosso sistema.`
            },
            {
                "text": `Verifique se seus dados foram aprovados e seu veículo cadastrado.`
            },
            {
                "text": `Caso todos os passos acima já tenham sido realizados, contate nossos especialista que rapidamente seu problema será resolvido. Agoradecemos a compreensão.`
            },
        ],
        "redirect_to_blocks": [
            `changeItem`
        ]
    }
    
    return noItemProfile
};

export const noItemAccess = variables => {

    const noItemAccess = {
        "messages": [
            {
                "text": `Oooops. Você não tem permissão para gerenciar a proteção deste veículo. Entre em contato com o proprietário.`,
                "quick_replies": [
                    {
                      "title":"Entrar em contato",
                      "block_names": ["Human interaction"]
                    },
                    {
                      "title":"Trocar de veículo",
                        "block_names": ['changeItem']
                    }
                ]
            },
            {
                "text": `Caso todos os passos acima já tenham sido realizados, contate nossos especialista que rapidamente seu problema será resolvido. Agoradecemos a compreensão.`
            },
        ],
    }
    
    return noItemAccess
};

export const noOwnerCredit = variables => {
    /*
        TODO:
            Send response to owner message account 


    */
    const noOwnerCredit = {
        "messages": [
            {
                "text": `Olá {{first name}}. Infelizmente não podemos ativar a proteção para o o veículo {{itemInUse}}.`
            },
            {
                "text": `O proprietário do veículo não possui saldos suficiente.`
            },
            {
                "text": `Caso já tenha efetuado a recarga, contate nossos especialista que rapidamente seu problema será resolvido. Agoradecemos a compreensão.`
            },
        ],
        "redirect_to_blocks": [
            `littleCredit`
        ]
    }
    
    return noOwnerCredit
};

export const noUserCredit = variables => {

    const noUserCredit = {
        "messages": [
            {
                "text": `Olá {{first name}}. Infelizmente não podemos ativar a proteção para o o veículo {{itemInUse}}.`
            },
            {
                "text": `Você não possui saldos suficiente. Seu saldo atual é: R$${variables.userCredit}`
            },
            {
                "text": `Caso já tenha realizado a recarga, verifique se o pagamento já foi confirmado. Caso já tenha, contate nossos especialista que rapidamente seu problema será resolvido. Agoradecemos a compreensão.`
            },
        ],
        "redirect_to_blocks": [
            `littleCredit`
        ]
    }
    
    return noUserCredit
};


export const noWallet = variables => {
    const noWallet = {
        "messages": [
            {
                "text": `Não encontramos sua carteira de créditos em nosso sistema.`
            },
            {
                "text": `Você já realizou a compra dos créditos em nosso site?`
            },
            {
                "text": `Caso já tenha realizado a compra, verifique se o pagamento já foi confirmado. Caso já tenha, contate nossos especialista que rapidamente seu problema será resolvido. Agoradecemos a compreensão.`
            },
        ],
        "redirect_to_blocks": [
            `littleCredit`
        ]
    }
    
    return noWallet
};


export const noClientId = variables => {
    const noClientId = {
        "messages": [
            {
                "text": `Não encontramos o identificador da sua compra feita em nosso sistema.`
            },
            {
                "text": `Você já realizou a compra dos créditos em nosso site?`
            },
            {
                "text": `Caso já tenha realizado a compra, verifique se o pagamento já foi confirmado. Caso já tenha, contate nossos especialista que rapidamente seu problema será resolvido. Agoradecemos a compreensão.`
            },
        ],
        "redirect_to_blocks": [
            `littleCredit`
        ]
    }
    
    return noClientId
};

export const noItemToGiveAccess = variables => {

    const noItemInUse = {
        "messages": [
            {
                "text": `Olá {{first name}}. Não encontramos o veículo ${variables.itemInUse} em seu perfil.`
            },
            {
                "text": `Verifique se seus dados foram aprovados e seu veículo cadastrado.`
            },
            {
                "text": `Caso todos os passos acima já tenham sido realizados, contate nossos especialista que rapidamente seu problema será resolvido. Agoradecemos a compreensão.`
            },
        ],
        "redirect_to_blocks": [
            `giveAccess`
        ]
    }
    
    return noItemInUse
};

export const noPermissionToGiveAccess = variables => {

    const noPermissionToGiveAccess = {
        "messages": [
            {
                "text": `Oooops. Você não tem permissão para liberar o acesso deste veículo.`,
                "quick_replies": [
                    {
                      "title":"Entrar em contato",
                      "block_names": ["Human Interaction"]
                    },
                    {
                      "title":"Trocar de veículo",
                        "block_names": ['changeItem']
                    },
                    {
                      "title":"Menu de Opções",
                        "block_names": ['Menu de opções']
                    },
                    
                ]
            },
        ]
    }
    
    return noPermissionToGiveAccess
};

export const noAccessToSelf = variables => {

    const noAccessToSelf = {
        "messages": [
            {
                "text": `Oooops. Você não pode dar acesso a sí mesmo hehe.`,
                "quick_replies": [
                    {
                      "title":"Entrar em contato",
                      "block_names": ["Human Interaction"]
                    },
                    {
                      "title":"Dar acesso",
                        "block_names": ['giveAccess']
                    },
                    {
                      "title":"Menu de Opções",
                        "block_names": ['Menu de opções']
                    },
                    
                ]
            },
        ]
    }
    
    return noAccessToSelf
};

export const userAlreadyHavePermission = variables => {

    const userAlreadyHavePermission = {
        "messages": [
            {
                "text": `Oooops. O usuário já tem permissão para gerenciar a proteção deste veículo.`,
            },
            {
                "text": `Agora só falta compartilhar com ${variables.thirdPartyEmail} para que vocês consigam proteger o veículo ${variables.itemToAccess} `,
                "quick_replies": [
                    {
                      "title":"Entrar em contato",
                      "block_names": ["Human Interaction"]
                    },
                    {
                      "title":"Dar acesso para outro veículo",
                        "block_names": ['giveAccess']
                    },
                    {
                      "title":"Compartilhar acesso",
                        "block_names": ['shareAccess']
                    },
                    {
                      "title":"Menu de Opções",
                        "block_names": ['Menu de opções']
                    },
                    
                ]
            },
        ],
    }
    
    return userAlreadyHavePermission
};

export const userUsingDiffMessenger = variables => {

    const userUsingDiffMessenger = {
        "messages": [
            {
                "text": `Opa!!! Essa conta de email já está vinculada a outro messenger.`
            },
            {
                "text": `Por favor, contate nossos especialistas para que possamos resolver este problema juntos.`
            },
            {
                "text": "O que deseja fazer?",
                "quick_replies": [
                
                    {
                      "title":"Falar com Especialista",
                      "block_names": ["Human interaction"]
                    },
                    {
                      "title":"Menu de Opções",
                      "block_names": ["Menu de opções"]
                    },
                    {
                        "title":"Indicar a Onsurance",
                        "block_names": ["Referer"]
                    },
                    {
                        "title":"Conhecer a Onsurance",
                        "block_names": ["PRON"]
                    },
                ]
            },
        ]
    }
    
    return userUsingDiffMessenger
};

export const giveAccessMessenger = variables => {

    const giveAccessMessenger = {
        "messages": [
            {
                "text": `Acesso concedito com sucesso!`
            },
            {
                "text": `Só falta que o usuário ${variables.thirdPartyEmail} acesse em sua conta do messenger.`
            },
        ],
        "redirect_to_blocks": [
            `shareAccess`
        ]
    }
    
    return giveAccessMessenger
};

export const giveAccessNoMessenger = variables => {

    const giveAccessNoMessenger = {
        "messages": [
            {
                "text": `Não há uma conta do messenger cadastrada em nosso sistema.`
            },
            {
                "text": `Por favor, contate nossos especialistas para que possamos resolver este problema juntos.`
            },
        ],
        "redirect_to_blocks": [
            `Human interaction`
        ]
    }
    
    return giveAccessNoMessenger
};

export const indicationDone = variables => {
    let text = `Tudo pronto! Você acabou de ser indicado por ${variables.indicator}. Quando realizar as compra dos créditos iniciais, vocês dois ganharão 200 horas de proteção.`
    if (variables.indicatorProfile !== null && variables.indicatorProfile.firstName !== undefined && variables.indicatorProfile.lastName !== undefined) {
        text = `Tudo pronto! Você acabou de ser indicado por ${variables.indicatorProfile.firstName} ${variables.indicatorProfile.lastName}. Quando realizar as compra dos créditos iniciais, vocês dois ganharão 200 horas de proteção.`
    };
    
    const indicationDone = {
        "messages": [
            {
                "text": text,
            },
            {
                "text": `O que deseja fazer agora?`,
                "quick_replies": [
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
        ],
    }
    
    return indicationDone
};

export const indicatorEqualIndicated = variables => {

    const indicatorEqualIndicated = {
        "messages": [
            {
                "text": `Você não pode se indicar hehe. Espertinho...`,
                "quick_replies": [
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
            }
        ],
    }
    
    return indicatorEqualIndicated
};

export const serverError = variables => {

    const serverError = {
        "messages": [
            {
                "text": "OOOoooppsss. Tivemos um pequeno erro em nosso servidor. Por favor verifique se está conectado à internet e tente novamente em 5 segundos."
            },
            {
                "text": "O que deseja fazer?",
                "quick_replies": [
                    {
                        "title":"Falar com Especialista",
                        "block_names": ["Human interaction"]
                    },
                    {
                        "title":"Menu de Opções",
                        "block_names": ["Menu de opções"]
                    },
                    {
                        "title":"Indicar a Onsurance",
                        "block_names": ["Referer"]
                    },
                    {
                        "title":"Conhecer a Onsurance",
                        "block_names": ["PRON"]
                    },
                    
                ]
            },
        ]
    };
    
    return serverError
};

export const alreadyHaveIndicator = variables => {

    const alreadyHaveIndicator = {
        "messages": [
            {
                "text": `Identificamos que você já recebeu indicação de um usuário. O que deseja fazer?`,
                "quick_replies": [
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
            }
        ],
    }
    
    return alreadyHaveIndicator
};

/* 

        CHANGE ITEM IN PROFILE MESSENGER

*/


export const changeItem = async variables => {

    let replies = [];
    await variables.vehiclePlates.forEach(element => {
        const reply = {
            "title": element,
            "set_attributes": {
              "itemInUse": element
            }
        };
        replies.push(reply)
    });
    replies.push({
        "title":"Falar com Especialista",
        "block_names": ["Human interaction"]
      },
      {
        "title":"Menu de Opções",
        "block_names": ["Menu de opções"]
      });
    const changeItemResponse = {
        "messages": [
            {
                "text": "Qual opção deseja escolher?",
                "quick_replies": replies,
                "quick_reply_options": {
                  "process_text_by_ai": false,
                  "text_attribute_name": "itemInUse"
                }
            }
        ],
    }
    
    return changeItemResponse
};

export const changeItemInfo = variables => {
    try {
        console.log("TCL: variables", variables)
        console.log("TCL: variables.itemProfile.protectiondata.protectionStatus", variables.itemProfile.protectionData.protectionStatus)
        console.log("TCL: variables.itemProfile.protectiondata.protectionStatus.theft", variables.itemProfile.protectionData.protectionStatus.theft)

        let protectionStatus = "ON"
        if (variables.itemProfile.protectionData.protectionStatus.theft === false) {
            protectionStatus = "OFF"
        };
        console.log("TCL: protectionStatus", protectionStatus)

        const changeItemInfoResponse = {
            "messages" :[
                {
                    "text" : `Tudo pronto para usar seu ${variables.itemProfile.brand} ${variables.itemProfile.model}.`
                },
                {
                    "text": `Seu Onsurance está atualmente ${protectionStatus}.`
                }
            ],
            "set_attributes": {
                "car-brand": variables.itemProfile.brand,
                "car-model": variables.itemProfile.model,
                "status-protecao": protectionStatus,
                "itemInUse": variables.itemProfile.plate
            },
        }
        
        return changeItemInfoResponse
        
    } catch (error) {
        const serverError = {
            "messages": [
                {
                    "text": "OOOoooppsss. Tivemos um pequeno erro em nosso servidor. Por favor verifique se está conectado à internet e tente novamente em 5 segundos."
                },
                {
                    "text": "O que deseja fazer?",
                    "quick_replies": [
                        {
                            "title":"Falar com Especialista",
                            "block_names": ["Human interaction"]
                        },
                        {
                            "title":"Menu de Opções",
                            "block_names": ["Menu de opções"]
                        },
                        {
                            "title":"Indicar a Onsurance",
                            "block_names": ["Referer"]
                        },
                        {
                            "title":"Conhecer a Onsurance",
                            "block_names": ["PRON"]
                        },
                        
                    ]
                },
            ]
        };
        
        return {
            status: 200,
            text: serverError
        };
    }
    
};

export const onlyOneItemInProfile = variables => {
    try {

        const onlyOneItemInProfileResponse = {
            "messages" :[
                {
                    "text" : `Opa!!! Encontrei o veículo ${variables.vehiclePlate} em seu perfil.`
                },
                {
                    "text": `Pode utilizar seu Onsurance normalmente.`
                },
                {
                    "text": `Caso tenha comprado o Onsurance pra outro veículo, entre em contato com nossos especialistas para resolver esse problema.`,
                }
            ],
            "set_attributes": {
                "car-brand": variables.itemProfile.brand,
                "car-model": variables.itemProfile.model,
                "itemInUse": variables.vehiclePlate
            },
        }
        
        return onlyOneItemInProfileResponse
        
    } catch (error) {
        const serverError = {
            "messages": [
                {
                    "text": "OOOoooppsss. Tivemos um pequeno erro em nosso servidor. Por favor verifique se está conectado à internet e tente novamente em 5 segundos."
                },
                {
                    "text": "O que deseja fazer?",
                    "quick_replies": [
                        {
                            "title":"Falar com Especialista",
                            "block_names": ["Human interaction"]
                        },
                        {
                            "title":"Menu de Opções",
                            "block_names": ["Menu de opções"]
                        },
                        {
                            "title":"Indicar a Onsurance",
                            "block_names": ["Referer"]
                        },
                        {
                            "title":"Conhecer a Onsurance",
                            "block_names": ["PRON"]
                        },
                        
                    ]
                },
            ]
        };
        
        return {
            status: 200,
            text: serverError
        };
    };
    
};






/*
    VARIABLES
*/

// Variables for protection endpoint
export const getProtectionVariables = async (request, response) => {
    try {
        console.log(request.body);
        const allPolicies = []
        const on = [];
        const off = [];
        const checkString = (status, key) => {
            // tslint:disable-next-line: triple-equals
            const boolValue = status.toLowerCase() == 'true' ? true : false;
            allPolicies.push(boolValue);
            boolValue === true ? on.push(key) : off.push(key)
            return boolValue  
        };
        const policies = await {
            theft: checkString(request.body["theft"], 'theft'),
            accident: checkString(request.body["accident"], 'accident'),
            thirdParty: checkString(request.body["thirdParty"], 'thirdParty'),
        };
        
        console.log("TCL: exports.getProtectionVariables -> allPolicies", allPolicies)
        
        const checkProtection = () => {
            return {
                allOff: allPolicies.every(status => status === false),
                allOn: allPolicies.every(status => status === true),
                on: on,
                off: off,
            }
        }
        const statusProtection = await checkProtection();
        console.log("TCL: exports.getProtectionVariables -> statusProtection", statusProtection);
        
        const protectionVariables = {
            userEmail:(request.body["userEmail"]).toLowerCase(),
            timezone:request.body["timezone"] || -3,
            itemInUse: request.body["itemInUse"].toLowerCase(),
            messengerId: request.body["messenger user id"],
            policies: policies,
            statusProtection: statusProtection
        }


        return protectionVariables
    } catch (error) {
        /*
            TODO: Set response to messenger standards
        */
        console.error(new Error(`Error to get variables for user ${request.body["email_address"]}. Error: ${error}.`));
        response.json({
            "messages": [
                {
                    "text": "Erro com varáveis. Verifique se os dados enviados estão corretos e tente novamente."
                },
            ],
            "redirect_to_blocks": [
                `Informar Email`
            ]
        });
    }
    
};

export const giveAccessVariables = async (request, response) => {
    try {
        console.log(request.body);
        
        const accessVariables = {
            userEmail:(request.body["userEmail"]).toLowerCase(),
            thirdPartyEmail:request.body["thirdPartyEmail"].toLowerCase(),
            itemToAccess: request.body["itemToAccess"].toLowerCase(),
            messengerId: request.body["messenger user id"],
        }


        // Checking messenger variable here because other requisitions may not have messenger (Onsurance app, zoho bot and so on...)
        const ownerDbPath = await userProfileDbRefPersonal(accessVariables.userEmail)
        const dbMethods = await databaseMethods();
        const messengerId = await dbMethods.getDatabaseInfo(ownerDbPath.child(`messengerId`));
        console.log("TCL: doBackup -> messengerId", messengerId)
        if (messengerId === undefined || messengerId === null) throw {
            status: 404, //Not found
            text: `No messenger id found in user ${accessVariables.userEmail} account.`,
            callback: giveAccessNoMessenger,
            variables: {}
        };
        // tslint:disable-next-line: triple-equals
        if (accessVariables.messengerId != messengerId && messengerId !== null) throw {
            status: 401, // Unauthorized
            text: `User is using a different messenger account.`,
            callback: giveAccessNoMessenger,
            variables: {}
        };
        return accessVariables
    } catch (error) {
        /*
            TODO: Set response to messenger standards
        */

        if(error.status) {
            console.error(new Error(`Error status: ${error.status}`));
            console.error(new Error(`Error description: ${error.text}`));
            console.log("TCL: giveAccessVariables -> error[`callback`]()", error[`callback`]())
            const callback = error.callback
            console.log("TCL: giveAccessVariables -> callback", callback())
            response.json(callback(error.variables))
        } else {
            /*

                TODO:
                    get the right block of messenger

            */
            console.error(new Error(`Error to get variables for user ${request.body["email_address"]}. Error: ${error}.`));

            response.json({
                "messages": [
                    {
                        "text": "Erro com varáveis. Verifique se os dados enviados estão corretos e tente novamente."
                    },
                ],
                "redirect_to_blocks": [
                    `Informar Email`
                ]
            });
        }
    }
};

export const firstAccessVariables = async (request, response) => {
    try {
        const accessVariables = {
            userEmail:checkRequestVariables('UserEmail', request.query["userEmail"], String),
            firstName:checkRequestVariables('First Name', request.query["first name"]),
            lastName:checkRequestVariables('Last Name', request.query["last name"]),
            messengerId: checkRequestVariables('Messenger Id', request.query["messenger user id"], String),
        }

        return accessVariables
    } catch (error) {
        /*
            TODO: Set response to messenger standards
        */

        console.error(new Error(`Error to get variables for user ${request.query["email_address"]}. Error: ${error}.`));

        response.json({
            "messages": [
                {
                    "text": "Erro com varáveis. Verifique se os dados enviados estão corretos e tente novamente."
                },
            ],
            "redirect_to_blocks": [
                `Informar Dados`
            ]
        });
    }
};

export const indicationVariables = async (request, response) => {
    try {
        console.log(request.body);
        
        const indicationVariables = {
            userEmail:(request.body["indicatedUserEmail"]).toLowerCase(),
            indicatorEmail:request.body["indicator"].toLowerCase(),
            messengerId: request.body["messenger user id"],
            firstName: request.body["first name"],
            lastName: request.body["last name"],
        };

        // Error check for owner account NOT exist
        if (indicationVariables.indicatorEmail == indicationVariables.userEmail) throw {
            status: 409, // Conflict
            text: `Indicator is equal to indicated.`,
            callback: indicatorEqualIndicated,
            variables: {
                userEmail: indicationVariables.userEmail
            }
        };

        return indicationVariables
    } catch (error) {
        /*
            TODO: 
                Set response to messenger standards
                get the right block of messenger
        */

       if(error.status) {
            console.error(new Error(`Error status: ${error.status}`));
            console.error(new Error(`Error description: ${error.text}`));
            console.log("TCL: error[`callback`]()", error[`callback`]())
            const callback = error.callback
            console.log("TCL: callback", callback())
            return response.json(callback(error.variables))
        } else {
            console.error(new Error(`Error to get variables for user ${request.body["userEmail"]}. Error: ${error}.`));

            response.json({
                "messages": [
                    {
                        "text": "Erro com varáveis. Verifique se os dados enviados estão corretos e tente novamente."
                    },
                ],
                "redirect_to_blocks": [
                    `validateIndication`
                ]
            });
        };
    };
};

export const saveIndicatorVariables = async (request, response) => {
    try {
        console.log(request.body);
        
        const indicationVariables = {
            userEmail: request.body["email_address_indicacao"].toLowerCase(),
            firstName: request.body["first name"],
            lastName: request.body["last name"],
            messengerId: request.body["messenger user id"],
        };

        return indicationVariables
    } catch (error) {
        /*
            TODO: 
                Set response to messenger standards
                get the right block of messenger
        */

       if(error.status) {
            console.error(new Error(`Error status: ${error.status}`));
            console.error(new Error(`Error description: ${error.text}`));
            console.log("TCL: error[`callback`]()", error[`callback`]())
            const callback = error.callback
            console.log("TCL: callback", callback())
            return response.json(callback(error.variables))
        } else {
            console.error(new Error(`Error to get variables for user ${request.body["userEmail"]}. Error: ${error}.`));

            response.json({
                "messages": [
                    {
                        "text": "Erro com varáveis. Verifique se os dados enviados estão corretos e tente novamente."
                    },
                ],
                "redirect_to_blocks": [
                    `validateIndication`
                ]
            });
        };
    };
};

export const changeItemVariables = async (req, res) => {
    try {
        const changeItem = {
            userEmail: checkRequestVariables('userEmail', req.query[`userEmail`], String),
            messengerId: checkRequestVariables("messenger user id", req.query[`messenger user id`], String)
        };
        return changeItem;
    } catch (error) {
        console.error(new Error(`Error to get variables for user ${req.body["userEmail"]}. Error: ${error}.`));

        res.json({
            "messages": [
                {
                    "text": "Erro com varáveis. Verifique se os dados enviados estão corretos e tente novamente."
                },
            ],
            "redirect_to_blocks": [
                `changeItemEndpoint`
            ]
        });
    };
};

export const getItemInfoVariables = async (req, res) => {
    try {
        const getItemInfo = {
            userEmail: req.body[`userEmail`].toLowerCase(),
            messengerId: req.body[`messenger user id`],
            itemInUse: req.body[`itemInUse`].toLowerCase()
        };

        
        return getItemInfo;
    } catch (error) {
        console.error(new Error(`Error to get variables for user ${req.body["userEmail"]}. Error: ${error}.`));

        res.json({
            "messages": [
                {
                    "text": "Erro com varáveis. Verifique se os dados enviados estão corretos e tente novamente."
                },
            ],
            "redirect_to_blocks": [
                `changeItemEndpoint`
            ]
        });
    };
};








/*

        SEND MESSAGE TO MESSENGER

*/


export const sendMessage = variables =>{
    // const urlHomolog = `https://api.chatfuel.com/bots/5b6c74f30ecd9f13f0f036e3/users/${messengerId}/send`
    // const homologToken = 'qwYLsCSz8hk4ytd6CPKP4C0oalstMnGdpDjF8YFHPHCieKNc0AfrnjVs91fGuH74'

    const urlProdution = `https://api.chatfuel.com/bots/5a3ac37ce4b04083e46d3c0e/users/${variables.messengerId}/send`
    const productionToken = "qwYLsCSz8hk4ytd6CPKP4C0oalstMnGdpDjF8YFHPHCieKNc0AfrnjVs91fGuH74"
    const request = require("request");

    const options = { method: 'POST',
    url: urlProdution,
    qs: { 
        chatfuel_token: productionToken,
        chatfuel_message_tag: variables.messageTag,
        chatfuel_block_id: '5d07a75fb65696000157825d',
        text: variables.text 
    },
    headers: 
    { Connection: 'keep-alive',
        'content-length': '',
        'accept-encoding': 'gzip, deflate',
        Host: 'api.chatfuel.com',
        Accept: '*/*',
        'User-Agent': 'PostmanRuntime/7.13.0' } };

    request(options, function (error, response, body) {
    if (error) console.error(new Error(error));

    console.log(body);
});

               
};
