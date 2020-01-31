export const activationFail = (protectionVariables) => {
    const activationFail = {
        "messages": [
            {
                "text": `Opa ${protectionVariables.firstName}. Não consegui ligar sua proteção. Vou trazer a função de Ligar para você tentar novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
            }
        ],
        "set_attributes":
            {
                "status-protecao": `OFF`,
                "autoTitle": "Clique para Ligar o Onsurance Auto." 
            },
        "redirect_to_blocks": [
            "protectionRouter"
        ]
    }
    return activationFail
}

export const deactivationFail = (protectionVariables, response) => {
    const deactivationFail = {
        "messages": [
            {
                "text": `Opa ${protectionVariables.firstName}. Não consegui desligar sua proteção. Vou trazer a função de Desligar para você tentar novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
            }
        ],
        "set_attributes":
        {
            "status-protecao": "ON",
            "autoTitle": "Clique para Desligar o Onsurance Auto."
        },
        "redirect_to_blocks": [
            "protectionRouter"
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
                "segundos": variables.seconds,
                "autoTitle": "Clique para Ligar o Onsurance Auto."
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
                "text": "Seu Onsurance Auto está Desligado!"
            }
        ],
        "set_attributes": {
                "status-protecao": variables.statusProtection,
                "user-credit": variables.newSwitch,
                "valorconsumido": variables.consumedSwitch,
                "dias": variables.days,
                "horas": variables.hours,
                "minutos": variables.minutes,
                "segundos": variables.seconds,
                "autoTitle": "Clique para Ligar o Onsurance Auto."
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
                "segundos": variables.seconds,
                "autoTitle": "Clique para Ligar o Onsurance Auto."
        },
        "redirect_to_blocks": [
            `Pos Off`
        ]
    }
    return deactivationActivation
};

export const activationSuccessful = variables => {
    
    const activationSuccessful = {
        "messages": [
            {
                "text": `Seu Onsurance Auto está Ligado!`
            }
        ],
        "set_attributes":
            {
                "status-protecao": variables.statusProtection,
                "autoTitle": "Clique para Desligar o Onsurance Auto."
        },
        "redirect_to_blocks": [
            `posOn`
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
                "autoTitle": "Clique para Desligar o Onsurance Auto."
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
            "autoTitle": "Clique para Ligar o Onsurance Auto."
        },
        "redirect_to_blocks": [
            `protectionRouter`
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
            "autoTitle": "Clique para Desligar o Onsurance Auto."
        },
        "redirect_to_blocks": [
            `protectionRouter`
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
            "autoTitle": "Clique para Desligar o Onsurance Auto."
        },
        "redirect_to_blocks": [
            `protectionRouter`
        ]
    }
    
    return noChangeAllOff
};

export const noUserProfile = variables => {

    const noUserProfile = {
        "messages": [
            {
                "text": "Então... Não conseguimos encontrar seu perfil em nosso sistema. Por favor, verifique se seu email está correto."
            },
            {
                "text": `Verifique também, se ${variables.userEmail} é o mesmo email que foi usado na compra dos créditos em nosso site.`
            },
        ],
        "redirect_to_blocks": [
            `informarDados`
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
            `informarDados`
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
            `informarDados`
        ]
    }
    
    return noItems;
};

/**
 * @description This function checks if the profile have Tires
 */
export const noTiresOnProfile = (variables?) => {
    const noItems = {
        "messages": [
            {
                "text": "Olá {{first name}}. Não encontrei nenhum veículo com Onsurance Pneus em seu perfil."
            },
            {
                "text": `Verifique se seus dados foram aprovados e o onboard do item já foi feito.`
            },
            {
                "text": `Caso todos os passos acima já tenham sido realizados, contate nossos especialista que rapidamente seu problema será resolvido. Agradecemos a compreensão.`
            },
        ],
        "redirect_to_blocks": [
            `informarDados`
        ]
    }
    
    return noItems;
};

export const noFirstAccess = (variables?) => {

    const firstAccess = {
        "messages": [
            {
                "text": "Então, vi aqui que não realizou sua verificação inicial de dados."
            },
            {
                "text": `Não se preocupe. Vou fazer isso agora com você.`
            }
        ],
        "set_attributes": {
            "firstAccess": false,
        },
        "redirect_to_blocks": [
            "informarDados"
        ]
    };
    
    return firstAccess;
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
            "user": "usuario"
        },
        "redirect_to_blocks": [
            "getItems"
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
            `getItems`
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

export const noTireInUse = variables => {

    const noItemInUse = {
        "messages": [
            {
                "text": `Olá {{first name}}. Não encontramos o veículo ${variables.tireVehicleId} com acesso ao Onsurance Pneus em seu perfil.`
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
                "text": `Oooops. Você não tem permissão para gerenciar a proteção deste item. Entre em contato com o proprietário.`,
            },
            {
                "text": `Caso todos os passos acima já tenham sido realizados, contate nossos especialista que rapidamente seu problema será resolvido. Agradecemos a compreensão.`,
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
                "text": `Olá {{first name}}. Não encontramos o veículo ${variables.itemToAccess} em seu perfil.`
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

/**
 * @description This function returns the response for the messenger to change the vehtiresicle in protection
 * @param variables Conatins the array of vehicle plates
 */
export const changeTireOptions = variables => {

    let replies = [];
    variables.vehiclePlates.forEach(element => {
        const reply = {
            "title": element,
            "set_attributes": {
              "tireVehicleId": element
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
                "text": "Qual veículo deseja segurar os pneus?",
                "quick_replies": replies,
                "quick_reply_options": {
                  "process_text_by_ai": false,
                  "text_attribute_name": "tireVehicleId"
                }
            }
        ],
    }
    
    return changeItemResponse
};

/**
 * @description This function returns the response for the messenger to change the vehicle in protection
 * @param variables Conatins the array of vehicle plates
 */
export const changeVehicleOptions = variables => {

    let replies = [];
    variables.vehiclePlates.forEach(element => {
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
                "text": "Qual veículo deseja escolher?",
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

/**
 * @descriptionThis functions returns the chatfuel callback to set item variables
 * @param variables Holds the item profile data
 */
export const setVehicleInfo = variables => {
    try {

        let protectionStatus = "ON"
        let autoTitle = "Clique para Desligar o Onsurance Auto.";
        if (variables.itemProfile.protectionData.protectionStatus.theft === false) {
            protectionStatus = "OFF"
            autoTitle = "Clique para Ligar o Onsurance Auto.";
        };

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
                "itemInUse": variables.itemProfile.plate,
                "autoTitle": autoTitle
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
 * @descriptionThis functions returns the chatfuel callback to set the tire to be protected 
 * @param variables Holds the tire profile data
 */
export const setTireInfo = (variables) => {

    let protectionStatus = "ON"
    let tireTitle = "Clique para Desligar o Onsurance Pneus.";
    if (variables.protectionStatus === false) {
        tireTitle = "Clique para Ligar o Onsurance Pneus.";
        protectionStatus = "OFF"
    };

    const changeItemInfoResponse = {
        "messages" :[
            {
                "text" : `Tudo pronto para usar o Onsurance Pneus para o veículo ${variables.tireVehicleId}.`
            },
            {
                "text": `Seu Onsurance Pneus está atualmente ${protectionStatus} para esse veículo.`
            }
        ],
        "set_attributes": {
            "tireOnsuranceStatus": protectionStatus,
            "tireQtd": variables.tireQtd,
            "tireVehicleId": variables.tireVehicleId,
            "tireTitle": tireTitle
        },
    }
    
    return changeItemInfoResponse
    
};

/**
 * @description This function returns the user to the block of choice to resend the variables wuth problems
 * @param block It's the block you need to send the user.
 */
export const variableNull = (block?) => {
    console.log(`TCL: block`, block);
    let sendToBlock = 'informarDados';

    if (block !== null && block !== undefined) {
        sendToBlock = block;
    };

    const variableNull = {
        "messages" :[
            {
                "text" : `Opa!!! Não recebi todas as informações que precisava. Vamos tentar de novo.`
            },
            {
                "text": `Caso não dê certo, é só digitar \"especialista\" que trago alguém pra te ajudar.`
            }
        ],
        "redirect_to_blocks": [
            sendToBlock
        ]
    }
    
    return variableNull
    
};

export const oneVehicleInProfile = variables => {
    try {

        const response = {
            "messages" :[
                {
                    "text" : `Encontrei o veículo ${variables.vehiclePlate} em seu perfil.`
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
                "itemInUse": variables.vehiclePlate,
                "autoAccess": true
            },
            "redirect_to_blocks": [
                "protectionRouter"
            ]
        }
        
        return response;
        
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
 * @description This function returns the response for messenger informing the user that in his profile, only have 1 tire inseured vehicle
 * @param variables The tires insurance information
 */
export const oneTireInProfile = variables => {

    const oneTireInProfile = {
        "messages" :[
            {
                "text" : `Encontrei o veículo ${variables.vehiclePlate} com acesso ao Onsurance pneus em seu perfil.`
            },
            {
                "text": `Pode utilizar seu Onsurance Pneus normalmente.`
            },
            {
                "text": `Caso tenha comprado o Onsurance pra pneus de outro veículo, entre em contato com nossos especialistas para resolver esse problema.`,
            }
        ],
        "set_attributes": {
            "tireVehicleId": variables.vehiclePlate,
            "tireQtd": variables.itemProfile.tireQtd,
            "tireAccess": true,
        },
        "redirect_to_blocks": [
            "protectionRouter"
        ]
    }
    
    return oneTireInProfile
    
};


/**
 * @description This function returns the galery with the items in user profile.
 * @param {Array<any>} items Its the list of items to send to user profile
 */
export const showItemsListInGalery = async (items: Array<any>): Promise<Object> => {
    try {
        let atributtes = {}
        let autoStatusProtection = 'OFF';
        let tireStatusProtection = 'OFF';
        let autoTitle = "Clique para Ligar o Onsurance Auto.";
        let tireTitle = "Para Ligar o Onsurance Pneus clique Onsurance ON - OFF";
        let block = "protectionRouter";
        for (let i = 0; i < items.length; i++) {

            switch (items[i].type) {
                case "vehicle": {
                    if (items[i].protectionStatus === true) {
                        autoStatusProtection = "ON";
                        autoTitle = "Clique para Desligar o Onsurance Auto.";
                    }   
                atributtes = {
                        ...atributtes,
                        "itemInUse": items[i].itemId,
                        "car-brand": items[i].brand,
                        "car-model":items[i].model,
                        "status-protecao": autoStatusProtection,
                        "autoTitle": autoTitle,
                        "autoAccess": true,
                    };
                    break;
                };
                case "tires": {

                    if (items[i].protectionStatus === true) {
                        tireStatusProtection = "ON";
                        tireTitle = "Para Desligar Onsurance Pneus clique em Onsurance ON - OFF";
                    } 
                    atributtes = {
                        ...atributtes,
                        "tireVehicleId": items[i].itemId,
                        "tireQtd": items[i].tireQtd,
                        "tireOnsuranceStatus": tireStatusProtection,
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

/**
 * @description This function returns to messenger informing the user don't have any item to access im profile
 * @param variables Mock variables
 */
export const noAccessToItems = (variables?) => {
    const noAccessToItems = {
        "messages" :[
            {
                "text" : `Opa!!! Parece que temos um problema!`
            },
            {
                "text": `Seu perfil não tem acesso a nenhum item. Verfique com o proprietário se o acesso foi encerrado.`
            },
            {
                "text": `Caso tenha comprado o Onsurance ou tenha confirmado que o proprietário tenha liberado o acesso, entre em contato com nossos especialistas para resolver esse problema.`,
            }
        ],
        "set_attributes": {
            "tireAccess": false,
            "autoAccess": false,
            "firstAccess": false,
        },
        "redirect_to_blocks": [
            "Menu de opções"
        ]
    }
    
    return noAccessToItems
    
};

/**
 * @description This function returns to messenger informing the user don't have any Auto to access im profile
 * @param variables Mock variables
 */
export const noAccessToAuto = (variables?) => {
    const noAccessToItems = {
        "messages" :[
            {
                "text" : `Opa!!! Parece que temos um problema!`
            },
            {
                "text": `Seu perfil não tem acesso a nenhum veículo. Verfique com o proprietário se o acesso foi encerrado.`
            },
            {
                "text": `Caso tenha comprado o Onsurance ou tenha confirmado que o proprietário tenha liberado o acesso, entre em contato com nossos especialistas para resolver esse problema.`,
            }
        ],
        "set_attributes": {
            "autoAccess": false,
        },
        "redirect_to_blocks": [
            "Menu de opções"
        ]
    }
    
    return noAccessToItems
    
};

/**
 * @description This function returns to messenger informing the user don't have any Vehicle with Onsurance Tires to access im profile
 * @param variables Mock variables
 */
export const noAccessToTire = (variables?) => {
    const noAccessToItems = {
        "messages" :[
            {
                "text" : `Opa!!! Parece que temos um problema!`
            },
            {
                "text": `Seu perfil não tem acesso a nenhum veículo com o Onsurance Pneus. Verfique com o proprietário se o acesso foi encerrado.`
            },
            {
                "text": `Caso tenha comprado o Onsurance ou tenha confirmado que o proprietário tenha liberado o acesso, entre em contato com nossos especialistas para resolver esse problema.`,
            }
        ],
        "set_attributes": {
            "tireAccess": false,
        },
        "redirect_to_blocks": [
            "Menu de opções"
        ]
    }
    
    return noAccessToItems
    
}



// ------------------ TIRES RESPONSES ---------------

export const TireRes_NoChangeOnsuranceOn = (variables) => {
    console.log(`TCL: tireVehicleId`, variables.tireVehicleId);
    return {
        "messages": [
            {
                "text": `Oops... Não houve alteração no Onsurance Pneus do veículo ${variables.tireVehicleId}. Atualmente ela está ON.`
            },
        ],
        "set_attributes": {
            "tireOnsuranceStatus": "ON",
            "tireTitle": "Clique para Desligar o Onsurance Pneus."
        },
        "redirect_to_blocks": [
            `protectionRouter`
        ]
    }
};

export const TireRes_NoChangeOnsuranceOff = (variables) => {
    return {
        "messages": [
            {
                "text": `Oops... Não houve alteração no Onsurance Pneus do veículo ${variables.tireVehicleId}. Atualmente ela está OFF.`
            },
        ],
        "set_attributes": {
            "tireOnsuranceStatus": "OFF",
            "tireTitle": "Clique para Ligar o Onsurance Pneus."
        },
        "redirect_to_blocks": [
            `protectionRouter`
        ]
    }
};

export const TireRes_activationFail = (variables?) => {
    return {
        "messages": [
            {
                "text": `Ooops. Não consegui ligar seu Onsurance. Vou trazer a função de Ligar para você tentar novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
            }
        ],
        "set_attributes":
            {
                "tireOnsuranceStatus": `OFF`,
                "tireTitle": "Clique para Ligar o Onsurance Pneus."
            },
        "redirect_to_blocks": [
            "protectionRouter"
        ]
    }
}

export const TireRes_deactivationFail = (variables?) => {
    return {
        "messages": [
            {
                "text": `Ooops. Não consegui desligar seu Onsurance Pneus. Vou trazer a função de Desligar para você tentar novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
            }
        ],
        "set_attributes":
        {
            "tireOnsuranceStatus": "ON",
            "tireTitle": "Clique para Desligar o Onsurance Pneus."
        },
        "redirect_to_blocks": [
            "protectionRouter"
        ]
    }
};


interface TiresSuccessfulDeactivation {
    newSwitch: number,
    consumedSwitch: number,
    days: number,
    hours: number,
    minutes: number,
    seconds: number,
    tireOnsuranceStatus: string,
    tireOnsuranceId: string,
}
/**
 * @description This function returns the messenger response of a successful Onsurance Tires Deactivation
 * @param variables Response Variables
 */
export const TireRes_deactivationSuccessful = (variables: TiresSuccessfulDeactivation) => {

    return {
        "messages": [
            {
                "text": "Seu Onsurance Pneus está Desligado!"
            }
        ],
        "set_attributes": {
                "user-credit": variables.newSwitch,
                "valorconsumido": variables.consumedSwitch,
                "dias": variables.days,
                "horas": variables.hours,
                "minutos": variables.minutes,
                "segundos": variables.seconds,
                "tireOnsuranceStatus": variables.tireOnsuranceStatus,
                "tireTitle": "Clique para Ligar o Onsurance Pneus." 
        },
        "redirect_to_blocks": [
            `Pos Off`
        ]
    };
};

/**
 * @description This function returns the messenger response of a successful Onsurance Tires Activation
 */
export const TireRes_activationSuccessful = () => {
    
    return {
        "messages": [
            {
                "text": `Seu Onsurance Pneus está ligado!`
            }
        ],
        "set_attributes": {
            "tireOnsuranceStatus": "ON",
            "tireTitle": "Clique para Desligar o Onsurance Pneus." 
        },
        "redirect_to_blocks": [
            `posOn`
        ]
    };
};




// ------------------ QUOTATION ---------------------



export const quote_TireResponse = (variables, ass24h) => {
    let extraText = ""
    if (ass24h === "sim") {
        const total = variables.activationCredit + 249
        extraText = `A assistência 24 horas não está inclusa nos créditos de ativação. O valor total (Assistência 24h + Crédito de ativação) é de R$ ${total}.`
    }
    return {
        "messages": [
            {
                "text": `Aqui está o resultado da sua cotação!`
            },
            {
                "text": extraText, 
            }
        ],
        "set_attributes": {
            "activationCreditCot": variables.activationCredit,
            "anualCostCot": variables.anualCost,
            "creditDurationCot": variables.creditDuration,
            "minuteValueCot": variables.minuteValue,
            "franchiseCot": variables.franchise,
        },
    };
    
};
export const quote_autoResponse = (variables, ass24h) => {
    if (variables.motoCc) {
        return {
            "messages": [
                {
                    "text": `Desculpe, infelizmente ainda não temos Onsurance para motos abaixo de 250cc!`
                },
                {
                    "text": `Estamos finalizando esse produto especialmente pra você. Acabamos de te colocar em uma lista de espera. você é o número ${variables.motoCounter}!`
                },
                {
                    "text": `Quando atingirmos 3000 pessoas com esse perfil estaremos com o produto pronto e vamos te avisar! Enquanto isso, indique para seus amigos para que possamos antecipar o laçamento.`
                },
            ],
            "redirect_to_blocks": [
                `motoUnder250Cc`
            ]
        };
    } else {
        let extraText = ""
        if (ass24h === "sim") {
            const total = variables.activationCredit + 249
            extraText = `A assistência 24 horas não está inclusa nos créditos de ativação. O valor total (Assistência 24h + Crédito de ativação) é de R$ ${total}.`
        }
        return {
            "messages": [
                {
                    "text": `Aqui está o resultado da sua cotação!`
                },
                {
                    "text": extraText, 
                }
            ],
            "set_attributes": {
                "activationCreditCot": variables.activationCredit,
                "anualCostCot": variables.anualCost,
                "creditDurationCot": variables.creditDuration,
                "minuteValueCot": variables.minuteValue,
                "franchiseCot": variables.franchise,
            },
        };
    }
    
};

/**
 * 
 * @param message Mensagem que o usuário recebe na interface do messenger em caso de erro.
 * @param block Bloco do chatfuel para o qual o usuário vai ser direcionado
 */
export const quote_ErrorResponse = (message: string, block: string) => {
    return {
        "messages": [
            {
                "text": `${message}`
            }
        ],
        "redirect_to_blocks": [
            `${block}`
        ]
    };
}

export const quote_ErrorDefaultResponse = () => {
    return {
        "messages": [
            {
                "text": `Desculpe, tivemos um erro ao realizar a cotação!`
            },
            {
                "text": `Vou te direcionar para começar novamente.`
            },
            {
                "text": `Caso o erro ocorra novamente, digite Falar com especialista que vamos te ajudar.`
            },
        ],
        "redirect_to_blocks": [
            `chooseVehicle`
        ]
    };
}