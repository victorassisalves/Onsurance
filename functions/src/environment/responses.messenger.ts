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
                "text": `Caso todos os passos acima já tenham sido realizados, contate nossos especialista que rapidamente seu problema será resolvido. Agradecemos a compreensão.`
            },
        ],
        "redirect_to_blocks": [
            `Informar Dados`
        ]
    }
    
    return noOnboard
};

/**
 * @description This function checks if the profile have
 */
export const noItemsOnProfile = (variables?) => {
    const noItems = {
        "messages": [
            {
                "text": "Olá {{first name}}. Não encontrei nenhum item em seu perfil."
            },
            {
                "text": `Verifique se seus dados foram aprovados e o onboard do item já foi feito.`
            },
            {
                "text": `Caso todos os passos acima já tenham sido realizados, contate nossos especialista que rapidamente seu problema será resolvido. Agradecemos a compreensão.`
            },
        ],
        "redirect_to_blocks": [
            `Informar Dados`
        ]
    }
    
    return noItems;
};

export const firstAccessResponse = variables => {

    const firstAccess = {
        "messages": [
            {
                "text": "Opaa! Verifiquei seus dados com sucesso."
            },
        ],
        "set_attributes": {
            "tireAccess": variables.tireAccess,
            "autoAccess": variables.autoAccess,
            "firstAccess": true,
        },
        "redirect_to_blocks": [
            `welcome`
        ]
    };
    
    return firstAccess;
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
            `welcome`
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
                "text": `Caso todos os passos acima já tenham sido realizados, contate nossos especialista que rapidamente seu problema será resolvido. Agradecemos a compreensão.`
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
                "text": `Caso todos os passos acima já tenham sido realizados, contate nossos especialista que rapidamente seu problema será resolvido. Agradecemos a compreensão.`
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
                "text": `Caso todos os passos acima já tenham sido realizados, contate nossos especialista que rapidamente seu problema será resolvido. Agradecemos a compreensão.`
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
                "text": `Caso já tenha efetuado a recarga, contate nossos especialista que rapidamente seu problema será resolvido. Agradecemos a compreensão.`
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
                "text": `Caso já tenha realizado a recarga, verifique se o pagamento já foi confirmado. Caso já tenha, contate nossos especialista que rapidamente seu problema será resolvido. Agradecemos a compreensão.`
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
                "text": `Caso já tenha realizado a compra, verifique se o pagamento já foi confirmado. Caso já tenha, contate nossos especialista que rapidamente seu problema será resolvido. Agradecemos a compreensão.`
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
                "text": `Caso já tenha realizado a compra, verifique se o pagamento já foi confirmado. Caso já tenha, contate nossos especialista que rapidamente seu problema será resolvido. Agradecemos a compreensão.`
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
                "text": `Caso todos os passos acima já tenham sido realizados, contate nossos especialista que rapidamente seu problema será resolvido. Agradecemos a compreensão.`
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

export const serverError = (variables?) => {

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

/**
 * @description This function returns the user to the block of choice to resend the variables wuth problems
 * @param block It's the block you need to send the user.
 */
export const variableNull = block => {

    const variableNull = {
        "messages" :[
            {
                "text" : `Opa!!! Não recebi todas as informações que precisava. Vamos tentar de novo.`
            },
            {
                "text": `Caso não dê certo, é só digitar "especialista" que trago alguém pra te ajudar.`
            }
        ],
        "redirect_to_blocks": [
            block
        ]
    }
    
    return variableNull
    
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
            status: 500,
            text: serverError
        };
    };
    
};

/**
 * @description This function returns the galery with the items in user profile.
 * @param {Array<any>} items Its the list of items to send to user profile
 */
export const showItemsListInGalery = async (items: Array<any>): Promise<Object> => {
    try {
        let atributtes = {}
        let statusProtection = 'ON';
        let autoTitle = "Quando desejar ligar o Onsurance do seu veículo é só clicar em Onsurance ON";
        let tireTitle = "Quando desejar ligar o Onsurance do(s) seu(s) Pneu(s) é só clicar em Onsurance ON";
        let block = "protection router";
        for (let i = 0; i < items.length; i++) {

            switch (items[i].type) {
            
                case "vehicle": {
                    if (items[i].protectionStatus) {
                        statusProtection = "OFF";
                        autoTitle = "Quando desejar desligar o Onsurance do seu veículo é só clicar em Onsurance OFF";
                    }   
                atributtes = {
                        ...atributtes,
                        "itemInUse": items[i].itemId,
                        "car-brand": items[i].brand,
                        "car-model":items[i].model,
                        "status-protecao": statusProtection,
                        "autoTitle": autoTitle,
                        "autoAccess": true,
                    };
                    break;
                };
                case "tires": {

                    if (items[i].protectionStatus) {
                        statusProtection = "OFF";
                        tireTitle = "Quando desejar desligar o Onsurance do(s) seu(s) Pneu(s) é só clicar em Onsurance OFF";
                    } 
                    atributtes = {
                        ...atributtes,
                        "tireVehicleId": items[i].itemId,
                        "tireQtd": items[i].tireQtd,
                        "tireOnsuranceStatus": statusProtection,
                        "tireTitle": tireTitle,
                        "tireAccess": true
                    };
                        
                    break;
                };
                default:
                    throw {
                        error: `Unknown type: ${items[i].type}`
                    };
            }
        };


        const response = {
            "messages" :[
                {
                    "text": `Tudo certo. Vamos começar.`,
                }
            ],
            "set_attributes": {
                ...atributtes,
            },
            "redirect_to_blocks": [
                block
            ]
        };
        return response;
        
    } catch (error) {
        console.error(new Error(`TCL: error: ${error}`));
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
        
        throw serverError;
    };
};




