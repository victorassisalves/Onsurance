const getVariables = require(`./messengerVariables.js`)
const logs = require('./log')()

// Pega a data com dia da semana para colocar no banco de dados
const getDate = (time) => {
    let weekDay
    const data = new Date(time)
    // Transforma o dia da semana em palavra
    switch (data.getDay()) {
        case 0:
            weekDay = "Domingo";
            break;
        case 1:
            weekDay = "Segunda";
            break;
        case 2:
            weekDay = "Terça";
            break;
        case 3:
            weekDay = "Quarta";
            break;
        case 4:
            weekDay = "Quinta";
            break;
        case 5:
            weekDay = "Sexta";
            break;
        case 6:
            weekDay = "Sábado";
            break;
    }
    return weekDay;
}

const activationFail = (dataBaseRef, protectionVariables, response, profiles) => {
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
    // Update activation number and protection status on actual vehicle database
    dataBaseRef.vehicleDbRef.update({
        activations: profiles[0].activations,
        protectionStatus: "OFF",
    }).then(() => {
        logs(`activationFail - ${protectionVariables.userEmail} - ${protectionVariables.firstName} - ${protectionVariables.carPlate} - Vehicle Activations updated.`)
    }).catch(error => {
        console.error(new Error(`activationFail - ${protectionVariables.userEmail} - ${protectionVariables.firstName} - ${protectionVariables.carPlate} -  Error updating Vehicle activations. ${error}`));
    })
    // update user profile activation number
    dataBaseRef.userDbRef.update({
        activations: profiles[1].activations,
    }).then(() => {
        logs(`activationFail - ${protectionVariables.userEmail} - ${protectionVariables.firstName} - ${protectionVariables.carPlate} - User Activations updated.`)
    }).catch(error => {
        console.error(new Error(`activationFail - ${protectionVariables.userEmail} - ${protectionVariables.firstName} - ${protectionVariables.carPlate} -  Error updating User activations. ${error}`));
    })
    
    response.json(activationFail)
}

const deactivationFail = (dataBaseRef, protectionVariables, response, profiles) => {
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
    // Update activation number and protection status on actual vehicle database
    dataBaseRef.vehicleDbRef.update({
        protectionStatus: "ON",
    }).then(() => {
        logs(`activationFail - ${protectionVariables.userEmail} - ${protectionVariables.firstName} - ${protectionVariables.carPlate} - Vehicle Activations updated.`)
    }).catch(error => {
        console.error(new Error(`activationFail - ${protectionVariables.userEmail} - ${protectionVariables.firstName} - ${protectionVariables.carPlate} -  Error updating Vehicle activations. ${error}`));
    })

    // Update wallet when deactivation fail
    dataBaseRef.dbRefWallet.update({
            switch: profiles[1].wallet.switch,
            money: profiles[1].wallet.money
    }).then(() => {
        logs(`activationFail - ${protectionVariables.userEmail} - ${protectionVariables.firstName} - ${protectionVariables.carPlate} - User Activations updated.`)
    }).catch(error => {
        console.error(new Error(`activationFail - ${protectionVariables.userEmail} - ${protectionVariables.firstName} - ${protectionVariables.carPlate} -  Error updating User activations. ${error}`));
    })
    
    response.json(deactivationFail)
}
// Function to activate protection
const activateProtection = (profiles, protectionVariables, dataBaseRef, timeStart, activationSuccess) => {
    return new Promise((resolve, reject) => {
    
        // Gera timeStamp do inicio da protecão
        const statusProtection = "ON";
        // const timezoneDiff = protectionVariables.timezone * 1000 * 3600
        // const time = Date.now() + timezoneDiff
        const vehicleActivations = profiles[0].activations + 1
        const userActivations = profiles[1].activations + 1
        const userProfile = profiles[1]

        const logsUse = {
            timeStart: `${timeStart}`,
            initialSwitch: profiles[1].wallet.switch,
            user: protectionVariables.userEmail
        };

        // Update actual vehicle logsUse of protection
        const logsUseUpdate = new Promise((resolve, reject) => {
            dataBaseRef.dbReflogsUso.child(`${vehicleActivations}`).update(logsUse).then( () => {
                logs(`logsUseUpdate - ${protectionVariables.userEmail} - ${userProfile.firstName} - ${protectionVariables.carPlate} -  Use logs Updated.`);
                resolve(true)
            }).catch(error => {
                console.error(new Error(`logsUseUpdate - ${protectionVariables.userEmail} - ${userProfile.firstName} -  Erro ao atualizar logs de uso no banco. ${error}`));
                reject(error)
            })
        })

        // Update user Total activation times from database
        const updateStatusUser = new Promise((resolve, reject) =>{
            dataBaseRef.userDbRef.update({
                activations: userActivations,
            }).then(() => {
                logs(`updateStatusUser - ${protectionVariables.userEmail} - ${userProfile.firstName} - USER Activations updated.`)
                resolve(true)
            }).catch(error => {
                console.error(new Error(`updateStatusUser - ${protectionVariables.userEmail} - ${userProfile.firstName}  - Error updating activations. ${error}`));
                reject(error)
            })
        })
       
        // Update activation number and protection status on actual vehicle database
        const updateStatusVehicle = new Promise((resolve, reject) =>{
            dataBaseRef.vehicleDbRef.update({
                activations: vehicleActivations,
                protectionStatus: statusProtection,
            }).then(() => {
                logs(`updateStatusVehicle - ${protectionVariables.userEmail} - ${userProfile.firstName} - ${protectionVariables.carPlate} - Vehicle Status updated.`)
                resolve(true)
            }).catch(error => {
                console.error(new Error(`updateStatusVehicle - ${protectionVariables.userEmail} - ${userProfile.firstName} - ${protectionVariables.carPlate} -  Error updating Vehicle Status. ${error}`));
                reject(error)
            })
        })
        
        Promise.all([updateStatusVehicle, updateStatusUser, logsUseUpdate]).then(() => {
            logs("*** Protection Activated In Server ***")
            resolve(activationSuccess)
        }).catch(error => {
            console.error(new Error(`Activation Failed. ${error}`))
            reject(error)
        })
    })
}

//Funcão para desativar a protecão
const deactivateProtection = (protectionVariables, dataBaseRef, profiles, block) => {
    return new Promise((resolve, reject) => {

        const timezoneDiff = protectionVariables.timezone * 1000 * 3600
        // Pega o tempo do desligamento
        const timeEnd = (Date.now() + timezoneDiff)/1000|0;                              // TimeEnd - Timestamp do desligamento da protecão
        const tempoProtecao = timeEnd - protectionVariables.timeStart       // TimeDiff - Tempo total de uso da protecão em segundos
        const dias = (tempoProtecao/60/60/24|0)                         // TimeDiffDays - Tempo de uso em dias(totais) da protecão
        const horasTotais = (tempoProtecao/60/60|0)                     // TimeDiffHoursTotais - Tempo de uso da protecão em Horas
        const minTotais = (tempoProtecao/60|0);                         // TimeDiffMinutesTotais - Tempo de uso em minutos da protecão
        const horas = (horasTotais - (dias*24));                        // TimeDiffHours - Tempo de uso da protecão em horas dentro de 24H
        const minutos = (minTotais - (horasTotais * 60));               // TimeDiffMinutes - Tempo de uso da protecão em minutos dentro de 60Min
        const segundos = (tempoProtecao - (minTotais*60));              // TimeDiffSeconds - Tempo de uso da protecão em segundos dentro de 60Segundos

        const timeVariables = {
            timeEnd:timeEnd,
            tempoProtecao:tempoProtecao,
            dias:dias,
            horas:horas,
            minutos:minutos,
            segundos:segundos,
        }

        // Desliga a proteção, alterando o atributo status-protecao do chatfuel
        const statusProtection = "OFF";
        const vehicleActivations = profiles[0].activations
        const userProfile = profiles[1]
        const minuteValue = parseFloat(profiles[0].minuteValue)
        let valorConsumido


        // Calcula o valor conumido baseado no tempo de uso. 
        if (timeVariables.segundos >= 30){
            valorConsumido = ((Math.ceil(timeVariables.tempoProtecao/60))*minuteValue).toFixed(2)
        } else if (timeVariables.segundos < 30) {
            valorConsumido = ((Math.floor(timeVariables.tempoProtecao/60))*minuteValue).toFixed(2)
        }
        const switchCoin = parseFloat((parseFloat(userProfile.wallet.switch) - valorConsumido).toFixed(2))
        const money = parseFloat(((userProfile.wallet.money) - (valorConsumido/1000)).toFixed(4))
        const sucessoDesligar = {
            "messages": [
                {
                    "text": "Sua proteção está desligada!"
                }
            ],
            "set_attributes":
                {
                    "status-protecao": statusProtection,
                    "user-credit": switchCoin,
                    "user-money": money,
                    "valorconsumido": valorConsumido,
                    "dias": timeVariables.dias,
                    "horas": timeVariables.horas,
                    "minutos": timeVariables.minutos,
                    "segundos": timeVariables.segundos
                },
                "redirect_to_blocks": [
                    `${block}`
                ]
        }

        // Objeto com dados do desligamento da proteção
        const logsUso = {
            timeEnd: `${timeVariables.timeEnd}`,
            valorConsumido: valorConsumido,
            tempoUso: `${timeVariables.dias} dias : ${timeVariables.horas} horas : ${timeVariables.minutos} minutos : ${timeVariables.segundos} segundos`,
            finalSwitch: switchCoin
        }

        logs('logsUso: ', JSON.stringify(logsUso))
        
        // Atualiza no DB estado da protecão, Saldo em créditos e em dinheiro
        const updateUserProfile = new Promise((resolve, reject) => {
            // Salva no banco de dados o resultado do desligamento e atualiza o banco de dados
            dataBaseRef.dbRefWallet.update({
                switch: switchCoin,
                money: money
            }).then(() =>{
                logs(`updateUserProfile - ${protectionVariables.userEmail} - ${userProfile.firstName} -  Consumo do desligamento salvo no banco.`);
                resolve(true)
            }).catch(error =>{
                console.error(new Error(`updateUserProfile ${protectionVariables.userEmail} - ${userProfile.firstName} -  Erro ao salvar dados de encerramento da protecão no banco de dados. ${error}`));
                reject(error)
            });
        })

        // Atualiza no DB o logs de uso do desligamento
        const updatelogsUse = new Promise((resolve, reject) => {
            // atualizar logs de uso
            dataBaseRef.dbReflogsUso.child(`${vehicleActivations}`).update(logsUso).then(() =>{
                logs(`updatelogsUse - ${protectionVariables.userEmail} - ${userProfile.firstName} -  Uselogs updated.`);
                resolve(true);
            }).catch(error =>{
                console.error(new Error(`updatelogsUse - ${protectionVariables.userEmail} - ${userProfile.firstName} -  Error updating Uselogs. ${error}`));
                reject(error)
            });
        })
        // Update activation number and protection status on actual vehicle database
        const updateStatusVehicle = new Promise((resolve, reject) =>{
            dataBaseRef.vehicleDbRef.update({
                protectionStatus: statusProtection,
            }).then(() => {
                logs(`updateStatusVehicle - ${protectionVariables.userEmail} - ${userProfile.firstName} - ${protectionVariables.carPlate} - Vehicle Status updated.`)
                resolve(true)
            }).catch(error => {
                console.error(new Error(`updateStatusVehicle - ${protectionVariables.userEmail} - ${userProfile.firstName} - ${protectionVariables.carPlate} -  Error updating Vehicle Status. ${error}`));
                reject(error)
            })
        })

        Promise.all([updateUserProfile, updatelogsUse, updateStatusVehicle]).then(() => {
            logs(`*** Protection completly OFF on Server. Returning to messenger. ***`)
            resolve(sucessoDesligar)
        }).catch(error => {
            reject(error)
        })

    }) 
}

// Checa numero de indicações do usuário que está ligando a protecão e premia
const verifyIndication = (profiles ,protectionVariables, dataBaseRef, timeStart, activationSuccess) => {
    return new Promise((resolve, reject) => {
        const userProfile = profiles[1]
        const executePromo = (switchCoin, money) => {
            // Atualiza dados do usuário no banco de dados
            dataBaseRef.userDbRef.update({
                wallet: {
                    switch: switchCoin,
                    money: money,
                },
                indication: {
                    indicationPromo: true,
                    indicatedUsers: userProfile.indication.indicatedUsers
                }
            }).then(() => {
                logs(`executePromo - ${protectionVariables.userEmail} - ${protectionVariables.firstName} -  Credit and Balance added to Server.`);
                logs("*** Returning to messenger. User Gets Promo ***")
                // Adicionar os valores atualizados para as variáveis de usuário
                const resp = {
                    "set_attributes":
                        {
                            "status-protecao": "ON",
                            "numAtivacao": userProfile.activations +1 ,
                            "timeStart": timeStart,
                            "user-credit": switchCoin,
                            "user-money": money,
                            "afiliados": userProfile.indication.indicatedUsers
                        },
                        "redirect_to_blocks": [
                            "receber-promo"
                        ]
                    }
                resolve(resp)
            }).catch(error => {
                console.error(new Error(`executePromo - ${protectionVariables.userEmail} - ${protectionVariables.firstName} -  Error updating balance on server. ${error}`))
                reject(error)
            })
        }
        
        const checkPromo = () => {
            // checa se número de indicados atingiu mais de 10 pela primeira vez
            // Se o usuário atingiu os requisitos necessários para receber o prênmio
            if (userProfile.indication.indicatedUsers >= 10 && userProfile.indication.indicationPromo === false) {
                logs(`checkPromo - ${protectionVariables.userEmail} - ${protectionVariables.firstName} -  User Have requirements for indication promo.`)

                const switchCoin = (userProfile.wallet.switch + 1000000)
                const money = (parseFloat(userProfile.wallet.money) + 1000).toFixed(4)

                executePromo(switchCoin, money)

            // Caso usuário não tenha atingido os requisitos para receber prêmio
            } else if (parseInt(userProfile.indication.indicatedUsers) < 10 || userProfile.indication.indicationPromo === true){
                logs(`checkPromo - ${protectionVariables.userEmail} - ${protectionVariables.firstName} -  User don't have Requirements to get Promo.`)
                logs("*** Returning to Messenger ***")
                resolve(activationSuccess)
            }
        }

        checkPromo()

    })
}

exports.getProfiles = (dataBaseRef, protectionVariables) => {
    return new Promise((resolve, reject) => {

        const getUserProfile = vehicleProfile => {
            dataBaseRef.userDbRef.once('value').then(snapshot => {
                const userProfile = snapshot.val()
                if (userProfile === undefined || !userProfile || userProfile === null){ // Not User
                    reject('User Profile not found.')
                }
                const profiles =  [vehicleProfile, userProfile]
                resolve(profiles)
            }).catch(error =>{
                console.error(new Error(`getUserProfile - ${protectionVariables.userEmail} - ${protectionVariables.firstName} - Error recovering User ${error}`));
                reject(error)
            })
        }
        const getVehicleProfile = () => {
            
            dataBaseRef.vehicleDbRef.once('value').then(snapshot => {
                const vehicleProfile = snapshot.val()
                if (vehicleProfile === undefined || !vehicleProfile || vehicleProfile === null){ // Not User
                    reject('Vehicle Profile not found.')
                }

                getUserProfile(vehicleProfile)
            }).catch(error => {
                console.error(new Error(`getVehicleProfile - ${protectionVariables.userEmail} - ${protectionVariables.firstName} - Failed to Get Protection status. ${error}`))
                reject(error)
            })
        }
    
        getVehicleProfile() 
    })
}

exports.firstActivation = (response, profiles, protectionVariables, dataBaseRef) => {
    const block = "Mensagem de boas vindas primeira proteção"
    // const block = "api test"
    const timezoneDiff = protectionVariables.timezone * 1000 * 3600
    const timeStart = (Date.now() + timezoneDiff)/1000|0
    const statusProtection = "ON";
    const userActivations = profiles[1].activations + 1
    const  activationSuccess = { 
        "messages": [
            {
                "text": "Sua proteção está ativada!"
            }
        ],
        "set_attributes":
            {
                "status-protecao": statusProtection,
                "numAtivacao": userActivations,
                "timeStart": timeStart,
            },
        "redirect_to_blocks": [
            `${block}`
        ]
    }

    activateProtection(profiles, protectionVariables, dataBaseRef, timeStart, activationSuccess).then((result) => {
        logs("*** Returning to Messenger ***")
        response.json(result)
    }).catch(error => {
        console.error(new Error(`actvateProtection - ${protectionVariables.userEmail} - ${protectionVariables.firstName} -  Failed to Turn ON Protection ${error}`))
        // Update activation number and protection status on actual vehicle database
        activationFail(dataBaseRef, protectionVariables, response, profiles)
    })
}

exports.activation = (response, profiles, protectionVariables, dataBaseRef) => {
    // Get log function to separete logs from Production and Homolog
    const log = require('./log')()
    const block = "Desligar"
    // const block = "api test"
    const timezoneDiff = protectionVariables.timezone * 1000 * 3600
    const timeStart = (Date.now() + timezoneDiff)/1000|0
    const statusProtection = "ON";
    const userActivations = profiles[1].activations + 1
    const userMoney = (profiles[1].wallet.money).toFixed(2)
    log('userMoney: ', userMoney);

    let activationSuccess
    if (userMoney < 100) {
        activationSuccess = { 
            "messages": [
                {
                    "text": "Sua proteção está ativada!"
                },
                {
                    "text": `⚠️ Você tem apenas R$${userMoney} em sua conta Onsurance.`
                },
                {
                    "attachment": {
                        "type": "template",
                        "payload": {
                        "template_type": "button",
                        "text": "Realize uma recarga clicando no botão abaixo 👇 para não deixar seu {{car-model}} desprotegido, OK?",
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
            "set_attributes":
                {
                    "status-protecao": statusProtection,
                    "numAtivacao": userActivations,
                    "timeStart": timeStart,
                },
            "redirect_to_blocks": [
                `${block}`
            ]
        }
    } else {
        activationSuccess = { 
            "messages": [
                {
                    "text": "Sua proteção está ativada!"
                },
            ],
            "set_attributes":
                {
                    "status-protecao": statusProtection,
                    "numAtivacao": userActivations,
                    "timeStart": timeStart,
                },
            "redirect_to_blocks": [
                `${block}`
            ]
        }
    }
    activateProtection(profiles, protectionVariables, dataBaseRef, timeStart, activationSuccess).then((result) => {

        const userActivations = profiles[1].activations + 1
        if (userActivations % 5 === 0) {
            verifyIndication(profiles ,protectionVariables, dataBaseRef, timeStart, activationSuccess).then(result => {
                response.json(result)
            }).catch(error =>{
                console.error(new Error(`verifyIndication - ${protectionVariables.userEmail} - ${protectionVariables.firstName} - Failed to verify indication. ${error}`))
                activationFail(dataBaseRef, protectionVariables, response, profiles)
            })
        } else {
            response.json(result)
        }
    }).catch(error => {
        console.error(new Error(`actvateProtection - ${protectionVariables.userEmail} - ${protectionVariables.firstName} -  Failed to Turn ON Protection ${error}`))
        activationFail(dataBaseRef, protectionVariables, response, profiles)
    })


}

exports.deactivation= (protectionVariables, dataBaseRef, profiles, response) => {
    const block = "Pos Off"
    // const block = "api test"
    deactivateProtection(protectionVariables, dataBaseRef, profiles, block).then(deactivationSuccess => {
        response.json(deactivationSuccess)
    }).catch(error => {
        console.error(new Error(`deactivateProtection -  ${protectionVariables.userEmail} - ${protectionVariables.firstName} -  Error turnnnig Protection OFF. ${error}`));
        deactivationFail(dataBaseRef, protectionVariables, response, profiles)
    })
}
