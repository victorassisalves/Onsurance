const functions = require('firebase-functions');
const admin = require('firebase-admin')
const crypto = require('crypto');
  
const homologacao = {
    apiKey: "AIzaSyABa9PXOgiVggDHjt1MD9bMVux-4UpObt4",
    authDomain: "onsurance-homologacao.firebaseapp.com",
    databaseURL: "https://onsurance-homologacao.firebaseio.com",
    projectId: "onsurance-homologacao",
    storageBucket: "onsurance-homologacao.appspot.com",
    messagingSenderId: "451230477262"
  }

const producao = {
    apiKey: "AIzaSyD8RCBaeju-ieUb9Ya0rUSJg9OGtSlPPXM",
    authDomain: "onsuranceme-co.firebaseapp.com",
    databaseURL: "https://onsuranceme-co.firebaseio.com",
    projectId: "onsuranceme-co",
    storageBucket: "onsuranceme-co.appspot.com",
    messagingSenderId: "241481831218"
}
admin.initializeApp(homologacao);


exports.protecao = functions.https.onRequest((request, response) => {
    console.log(`${request.query["email_address"]} - Entrando na funcão Liga/Desliga a protecão:  ${JSON.stringify(request.query)}`);

    // Recebe os parâmetros do chatfuel
    // Dados do usuário
    const firstName = request.query["first name"];
    const userEmail = (request.query["email_address"]).toLowerCase()
    const userCredit = parseFloat(request.query["user-credit"])
    const timezone = request.query["timezone"]
    const carPlate = (request.query["car-plate"]).toLowerCase()

    // Dados de tempo
    const timeStart = request.query["timeStart"];

    // Dados da proteção
    const statusProtecao = request.query["status-protecao"];
    var estadoProtecao = statusProtecao;
    const numAtivacao = request.query["numAtivacao"];

    // Referencia do Banco de dados
    var userDbId = crypto.createHash('md5').update(userEmail).digest("hex");
    var vehicleDbId = crypto.createHash('md5').update(carPlate).digest("hex");
    // User profile
    const dbRefProfile = admin.database().ref(`/clients/${userDbId}/`).child('profile');
    // User Wallet
    const dbRefWallet = admin.database().ref(`/clients/${userDbId}/`).child('profile/wallet');
    // User Activations 
    const dbRefActivations = admin.database().ref(`/clients/${userDbId}/`).child('profile/activations');
    // Vehicle Profile
    const vehicleDbRefProfile = admin.database().ref(`/clients/${userDbId}/vehicles/${vehicleDbId}/`).child('profile');
    // Vehicle Activations
    const vehicleDbRefActivations = admin.database().ref(`/clients/${userDbId}/vehicles/${vehicleDbId}/`).child('profile/activations');
    // Vehicle Use Log
    const dbRefLogUso = admin.database().ref(`/clients/${userDbId}/vehicles/${vehicleDbId}/`).child('logUse');


    var numeroAtivacoes = parseInt(numAtivacao)
    var valorConsumido = 0;

    // Objeto de perfil do user
    var perfilUser = {
        switch: 0,
        money: 0,
    }

    // Recebe dia da semana e data completa
    var data;
    var inicioProtecao;
    var diaSemana;

    var falhaLigar = {
        "messages": [
            {
                "text": `Opa ${firstName}. Não consegui ligar sua proteção. Vou trazer a função de Ligar para você tentar novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
            }
        ],
        "set_attributes":
            {
                "status-protecao": `OFF`,
                "numAtivacao": numeroAtivacoes
            },
        "redirect_to_blocks": [
            "Ligar"
        ]
    }
    var falhaDesligar = {
        "messages": [
            {
                "text": `Opa ${firstName}. Não consegui desligar sua proteção. Vou trazer a função de Desligar para você tentar novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
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
    var sucessoLigar;

    /* -----------------------//----------------------//-------------------// -------------------- */

    // Pega a data com dia da semana para colocar no banco de dados
    const pegarData = (date) => {
        data = new Date(date);
    
        // Transforma o dia da semana em palavra
        switch (data.getDay()) {
            case 0:
                diaSemana = "Domingo";
                break;
            case 1:
                diaSemana = "Segunda";
                break;
            case 2:
                diaSemana = "Terça";
                break;
            case 3:
                diaSemana = "Quarta";
                break;
            case 4:
                diaSemana = "Quinta";
                break;
            case 5:
                diaSemana = "Sexta";
                break;
            case 6:
                diaSemana = "Sábado";
                break;
        }
        return data;
    }

    // Funcão para acionar a protecão
    const ligarProtecao = () => {
        
        return new Promise((resolve, reject) => {

            console.log(`ligarProtecao - 1 - ${userEmail} - ${firstName} - Ligar proteção`);

            // Gera timeStamp do inicio da protecão
            inicioProtecao = Date.now()/1000|0;
            estadoProtecao = "ON";
            var horario = Date.now()
            var timezoneDiff = timezone * 1000 * 3600
            horario += timezoneDiff;

            // Chama a função de pegar a data atual para salval no BD        
            pegarData(horario);

            // **  Fata ajustar ao timezone do usuário ** //
            var logUso = {
                inicioProtecao: `${inicioProtecao} - ${diaSemana} - ${data.getDate()}/${data.getMonth()+1}/${data.getFullYear()} - ${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`,
                saldoInicial: userCredit,
                user: userEmail
            };

            // Get the activation number from the actual vehicle database
            let getActivationNumber = () => {
                vehicleDbRefActivations.once('value').then(snapshot => {
                    let data = snapshot.val()
                    console.log('data: ', data);
                    console.log(`getActivationNumber - 1 - ${userEmail} - ${firstName} - ${carPlate} - Vehicle Profile recovered.`)
                    numeroAtivacoes = data +1
                    return updateStatusVehicle(numeroAtivacoes)
                }).catch(error => {
                    console.error(new Error(`getActivationNumber - 1 - ${userEmail} - ${firstName} - ${carPlate} - Error when recovering profile. ${error}`))
                    reject(error)
                })
            }
            // Update activation number and protection status on actual vehicle database
            let updateStatusVehicle = numeroAtivacoes =>{
                vehicleDbRefProfile.update({
                    activations: numeroAtivacoes,
                    protectionStatus: estadoProtecao,
                }).then(() => {
                    console.log(`updateStatusVehicle - 1 - ${userEmail} - ${firstName} - ${carPlate} - Vehicle Status updated.`)
                    return getStatusUser()
                }).catch(error => {
                    console.error(new Error(`updateStatusVehicle - 1 - ${userEmail} - ${firstName} - ${carPlate} -  Error updating Vehicle Status. ${error}`));
                    reject(error)
                })
            }
            // Get user total activations times from user profile database
            let getStatusUser = () => {
                dbRefActivations.once('value').then(snapshot => {
                    var profile = snapshot.val()
                    console.log(`getStatusUser - 1 - ${userEmail} - ${firstName} - USER Activations Recovered. ${JSON.stringify(profile)}`)
                    return updateStatusUser(profile)
                }).catch(error =>{
                    console.error(new Error(`getStatusUser - 1 - Error recovering User ${error}`));
                    reject(error)
                })
            }
            // Update user Total activation times from database
            let updateStatusUser = (profile) =>{
                dbRefProfile.update({
                    activations: profile + 1,
                }).then(() => {
                    console.log(`updateStatusUser - 1 - ${userEmail} - ${firstName} - USER Activations updated.`)
                    return logUseUpdate()
                }).catch(error => {
                    console.error(new Error(`updateStatusUser - 1 - Error updating activations. ${error}`));
                    reject(error)
                })
            }
            // Update actual vehicle logUse of protection
            let logUseUpdate = () => {
                dbRefLogUso.child(`${numeroAtivacoes}`).update(logUso).then( () => {
                    console.log(`logUseUpdate - 1 - ${userEmail} - ${firstName} - ${carPlate} -  Use Log Updated.`);
                    console.log("*** Protection Activated ***")
                    sucessoLigar = { 
                        "messages": [
                            {
                                "text": "Sua proteção está ativada!"
                            }
                        ],
                        "set_attributes":
                            {
                                "status-protecao": estadoProtecao,
                                "numAtivacao": numeroAtivacoes,
                                "timeStart": inicioProtecao,
                            },
                        "redirect_to_blocks": [
                            "Desligar"
                        ]
                    }
                    return resolve(sucessoLigar)
                }).catch(error => {
                    console.error(new Error(`logUseUpdate - 1 - ${userEmail} - ${firstName} -  Erro ao atualizar log de uso no banco. ${error}`));
                    reject(error)
                })
            }
            getActivationNumber()
        })
    }  

    // Funcão para desativar a protecão
    const desligarProtecao = () => {
        return new Promise((resolve, reject) => {
            console.log(`desligarProtecao - 1 - ${userEmail} - ${firstName} -  Protection OFF`);
            // Desliga a proteção, alterando o atributo status-protecao do chatfuel
            estadoProtecao = "OFF";
            var horario = Date.now()
            var timezoneDiff = timezone * 1000 * 3600
            horario += timezoneDiff
            var date = new Date(horario)

            pegarData(horario)         // Pega os dados de data do uso da protecão 

            // Pega o tempo do desligamento
            var finalProtecao = Date.now()/1000|0;              // TimeEnd - Timestamp do desligamento da protecão
            var tempoProtecao = finalProtecao - timeStart       // TimeDiff - Tempo total de uso da protecão em segundos
            var dias = (tempoProtecao/60/60/24|0)               // TimeDiffDays - Tempo de uso em dias(totais) da protecão
            var horasTotais = (tempoProtecao/60/60|0)           // TimeDiffHours Totais - Tempo de uso da protecão em Horas
            var minTotais = (tempoProtecao/60|0);               // TimeDiffMinutes Totais - Tempo de uso em minutos da protecão
            var horas = (horasTotais - (dias*24));              // TimeDiffHours - Tempo de uso da protecão em horas dentro de 24H
            var minutos = (minTotais - (horasTotais * 60));     // TimeDiffMinutes - Tempo de uso da protecão em minutos dentro de 60Min
            var segundos = (tempoProtecao - (minTotais*60));    // TimeDiffSeconds - Tempo de uso da protecão em segundos dentro de 60Segundos
            var data
            
            // Get vehicle Profile data on DB
            let getVehicleData = () => {
                // Recupera os dados no DB para garantir a confiabilidade
                vehicleDbRefProfile.once('value').then(snapshot => {
                    data = snapshot.val()
                    console.log(`getVehicleData - 1 - ${userEmail} - ${firstName} - Data Recovered. ${JSON.stringify(data)}`)                    
                    var vehicleActivationTimes = data.activations
                    let minuteValue = data.minuteValue
                    return getUserData(vehicleActivationTimes, minuteValue)
                }).catch(error => {
                    console.error(new Error(`getVehicleData - 1 - ${userEmail} - ${firstName} -  Erro ao recuperar dados. ${error}`))
                    reject(error)
                })
            }
            
            // get User Profile data on DB
            let getUserData = (vehicleActivationTimes, minuteValue) => {
                
                // Recupera os dados no DB para garantir a confiabilidade
                // Get user profile wallet
                dbRefWallet.once('value').then(snapshot => {
                    data = snapshot.val()  

                    // Calcula o valor conumido baseado no tempo de uso. 
                    if (segundos >= 30){
                        valorConsumido = (Math.ceil(tempoProtecao/60))*minuteValue
                    } else if (segundos < 30) {
                        valorConsumido = (Math.floor(tempoProtecao/60))*minuteValue
                    }
                    perfilUser.switch = data.switch - valorConsumido
                    perfilUser.money = parseFloat((data.money) - (valorConsumido/1000)).toFixed(4)
                    var sucessoDesligar = {
                        "messages": [
                            {
                                "text": "Sua proteção está desligada!"
                            }
                        ],
                        "set_attributes":
                            {
                                "status-protecao": estadoProtecao,
                                "user-credit": perfilUser.switch,
                                "user-money": perfilUser.money,
                                "valorconsumido": valorConsumido,
                                "dias": dias,
                                "horas": horas,
                                "minutos": minutos,
                                "segundos": segundos
                            },
                            "redirect_to_blocks": [
                                "Pos Off"
                            ]
                    }

                    // Objeto com dados do desligamento da proteção
                    var logUso = {
                        finalProtecao: `${finalProtecao} - ${diaSemana} - ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} - ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
                        valorconsumido: valorConsumido,
                        tempoUso: `${dias} dias : ${horas} horas : ${minutos} minutos : ${segundos} segundos`,
                        saldoFinal: perfilUser.switch
                    }
                    return updateUserProfile(logUso, perfilUser, sucessoDesligar, vehicleActivationTimes)

                    }).catch(error =>{
                        console.error(new Error(`getUserData - 1 - ${userEmail} - ${firstName} -  Erro ao recuperar dados. ${error}`));
                        reject(error)
                    });
            }
            
            // Atualiza no DB estado da protecão, Saldo em créditos e em dinheiro
            let updateUserProfile = (logUso, perfilUser, sucessoDesligar, vehicleActivationTimes) => {
                
                // Salva no banco de dados o resultado do desligamento e atualiza o banco de dados
                dbRefWallet.update({
                    switch: perfilUser.switch,
                    money: parseFloat(perfilUser.money)
                }).then(() =>{
                    console.log(`updateUserProfile ${userEmail} - ${firstName} -  Consumo do desligamento salvo no banco.`);
                    return updateLogUse(logUso, sucessoDesligar, vehicleActivationTimes)
                }).catch(error =>{
                    console.error(new Error(`updateUserProfile ${userEmail} - ${firstName} -  Erro ao salvar dados de encerramento da protecão no banco de dados. ${error}`));
                    reject(error)
                });
            }

            // Atualiza no DB o log de uso do desligamento
            let updateLogUse = (logUso, sucessoDesligar, vehicleActivationTimes) => {
                // atualizar log de uso
                dbRefLogUso.child(`${vehicleActivationTimes}`).update(logUso).then(() =>{
                    console.log(`updateLogUse - 1 - ${userEmail} - ${firstName} -  UseLog updated.`);
                    return resolve(sucessoDesligar);
                }).catch(error =>{
                    console.error(new Error(`updateLogUse - 1 - ${userEmail} - ${firstName} -  Error updating UseLog. ${error}`));
                    reject(error)
                });
            }

            getVehicleData()
        }) 
    }

    // Checa numero de indicações do usuário que está ligando a protecão e premia
    const verificaIndicacao = () => {
        return new Promise((resolve, reject) => {
        const dbRefIndication = admin.database().ref(`/clients/${userDbId}/`).child('profile/indication');

            var data;
            let verificaUserIndicacao = () => {
                    // recupera dados do usuário no Banco de dados
                    dbRefIndication.once('value').then(snapshot => {
                        data = snapshot.val();
                        console.log(`verificaUserIndicacao - 1 - ${userEmail} - ${firstName} -  Dados do Usuário recuperado: ${data.indicatedUsers} indicados. recebeu promocão: ${data.indicationPromo}`);
                        return executaPremiacao(data)
                    }).catch(error => {
                        console.error(new Error(`verificaUserIndicacao - 1 - ${userEmail} - ${firstName} -  Erro ao recuperar usuário na base de dados. ${error}`))
                        numeroAtivacoes -= 1                        
                        reject(response.json(falhaLigar))
                    })
            }

            let executaPremiacao = result => {
                // checa se número de indicados atingiu mais de 10 pela primeira vez
                // Se o usuário atingiu os requisitos necessários para receber o prênmio
                if (parseInt(result.indicatedUsers) >= 10 && result.indicationPromo === false) {
                    console.log(`executaPremiacao - 1 - ${userEmail} - ${firstName} -  Usuário vai receber prêmio por indicacão.`);
                    var creditoPlus = result.switch + 1000000
                    var saldoPlus = (parseFloat(result.money) + 1000).toFixed(4)

                    adicionaPromocao(creditoPlus, saldoPlus, result)

                // Caso usuário não tenha atingido os requisitos para receber prêmio
                } else if (result.indicatedUsers < 10 || result.indicationPromo === true){
                    console.log(`executaPremiacao - 1 - ${userEmail} - ${firstName} -  Não tem requisitos para receber promocão.`);
                    resolve(true)
                }
            }

            let adicionaPromocao = (creditoPlus, saldoPlus, result) => {
                // Atualiza dados do usuário no banco de dados
                dbRefProfile.update({
                    wallet: {
                        switch: creditoPlus,
                        money: saldoPlus,
                    },
                    indication: {
                        indicationPromo: true
                    }
                    }).then(() => {
                        console.log(`adicionaPromocao - 1 - ligaProtecão - ${userEmail} - ${firstName} -  Crédito, saldo e status da promocão atualizados no banco.`);
                        receberPremio = true
                        console.log("*** Verificacão do indicador feita completamente no servidor. ***")
                        console.log("*** Retorno Imediato Messenger User recebendo promocão indicacão ***")
                        // Adicionar os valores atualizados para as variáveis de usuário
                        return resolve(
                            response.json({
                            "set_attributes":
                                {
                                    "status-protecao": "ON",
                                    "numAtivacao": result.activations,
                                    "timeStart": inicioProtecao,
                                    "user-credit": creditoPlus,
                                    "user-money": saldoPlus,
                                    "afiliados": result.indicatedUsers
                                },
                                "redirect_to_blocks": [
                                    "receber-promo"
                                ]
                            })
                        )
                    }).catch(error => {
                        console.error(new Error(`adicionaPromocao - 1 - ${userEmail} - ${firstName} -  Erro ao atualizar ganho de prêmio no banco. ${error}`))
                        console.error(new Error(error))
                        numeroAtivacoes -= 1
                        reject(response.json(falhaLigar))
                    })
            }

            verificaUserIndicacao()

        })
    }

    // Protecão desligada. Liga a Protecão
    if (estadoProtecao === "OFF" && numeroAtivacoes >= 1){

        // Liga a protecão, verifica a quantidade de indicacões e retorna para o chat
        ligarProtecao().then(result => { 
            // Liga a protecão no banco de dados, atualiza o log de uso.
            if (numeroAtivacoes % 3 ===0 ) {
                return verificaIndicacao()   // Verifica se user tem requisitos para receber premio por indicacão e premia
            }
            return true;
        }).then(() => {
            console.log("*** Retorno Imediato Messenger ***")
            return response.json(sucessoLigar)
        }).catch(error =>{
            console.error(new Error(`ligarProtecao - 2 - ${userEmail} - ${firstName} -  Erro ao executar promises. Protecão não Ligada ${error}`))
            numeroAtivacoes -= 1
            response.json(falhaLigar)
        })
            
    } else if (estadoProtecao === "ON" && numeroAtivacoes >= 1) {

        desligarProtecao().then(result =>{
            console.log("*** Returning to Messenger ***")
            return response.json(result)
        }).catch(error => {
            console.error(new Error(`DesligarProtecão - 2 - ${userEmail} - ${firstName} -  Erro ao executar promise. Protecão não desligada. ${error}`))
            response.json(falhaDesligar)
        })
    } else if (numeroAtivacoes === 0) {
        console.log(`PrimeiraAtivação - 1 - ${userEmail} - ${firstName} -  Primeira ativacão.`);
        
        ligarProtecao().then((result) => {
            console.log("*** Returning to Messenger ***")
            return response.json({
                "messages": [
                    {
                        "text": `Sua proteção está ligada!`
                    },
                ],
                "set_attributes":
                    {
                        "status-protecao": estadoProtecao,
                        "numAtivacao": numeroAtivacoes,
                        "timeStart": inicioProtecao,
                    },
                "redirect_to_blocks": [
                    "Mensagem de boas vindas primeira proteção"
                ]
            });
        }).catch(error => {
            console.error(new Error(`executaLigarProtecao - ligarProtecao - 2 - ${userEmail} - ${firstName} -  Erro ao executar promises. Protecão não Ligada ${error}`))
            numeroAtivacoes = 0
            response.json(falhaLigar)
        })
        
    } else {
        return response.json({
            "messages": [
                {
                    "text": `Identifiquei um pequeno erro! Preciso que entre em contato com nossa equipe de suporte. Pedimos desculpas pelo inconveniente.`
                },
            ],
            "redirect_to_blocks": [
                "Human interaction"
            ]
        });
    }
})

// Funcão para calculo de gastos anuais
exports.botSimulacao = functions.https.onRequest((request, response) => {
    console.log(`1 - ${request.query["first name"]} - ${request.query["messenger user id"]} - Bot de simuacão :   ${JSON.stringify(request.query)}`);

    // dados do usuário
    const userEmail = request.query["email_address-sim"];
    const firstName = request.query["first name"];

    // Dados do veículo
    const carValue = request.query["car-value-sim"];
    const horasUsoDia = request.query["horasUso-sim"];
    const valorSeguro = request.query["valorSeguro-sim"];
    const valorSemSeguro = request.query["valorSemSeguro-sim"];
    console.log('valorSemSeguro: ', valorSemSeguro);
    console.log('valorSeguro: ', valorSeguro);

    calcMin.calculaGasto(carValue).then(result => {
        console.log('valorMinuto: ', valorMinuto);
        valorMinuto = result;
        console.log('valorMinuto: ', valorMinuto);
        return valorMinuto; 
    }).catch(error => {
        console.error(new Error(`${JSON.stringify(error.description)}, CarValue: ${carValue}.`))
        response.json({
            "messages": [
                {
                    "text": `${error.textCot}`,
                }
            ],
            "redirect_to_blocks": [
                `Simulação de uso`
            ]
        })
    })

    console.log(`2.5 - ${userEmail} - ${firstName} -  valor do minuto pos funcão, ${valorMinuto}`);
    console.log(`3 - ${userEmail} - ${firstName} -  Valor do Carro :  ${carValue}`);
    
    var consumoAnual = ((horasUsoDia*60*365)*(valorMinuto/1000)).toFixed(2);
    console.log(`4 - ${userEmail} - ${firstName} -  consumo anual: ${consumoAnual}`);
    consumoAnual.toString();
    consumoAnual = consumoAnual.replace(".", ",");
    
    // Crédito mínimo até para carros até R$40.000
    var creditoMin = 999;

    if (carValue > 40000) {
        console.log(`5 - ${userEmail} - ${firstName} -  car value maior que 40000`);
        creditoMin = (carValue*0.025).toFixed(2);
    }

    var franquia;
    if (carValue < 37500){
        franquia = 1500
    } else if (carValue >= 37500) {
        franquia = carValue * 0.04
    }

    // Calcula valor do seguro tradicional caso o usuário não tenha seguro
    if (valorSemSeguro === "0.05"){
        var valorDoSeguro = (valorSemSeguro*carValue).toFixed(2);
        console.log(`5.5 - ${userEmail} - ${firstName} -  valorDoSeguro: , ${valorDoSeguro}`);

    }
    console.log(`6 - ${userEmail} - ${firstName} -  valor do seguro: ${valorDoSeguro}`);
    var valorMinRS = valorMinuto/1000;

    response.json({
        "messages": [
            {
                "text": `Conforme suas respostas, o valor do minuto da proteção é de R$${valorMinuto/1000}. Você liga para proteger e desliga para economizar. No seu caso de uso o custo médio da proteção será de R$${consumoAnual} ao ano.`,
            }
        ],
        "set_attributes": {
            "valorSeguro-sim": valorDoSeguro,
            "valorProtecaoAnual-sim": consumoAnual,
            "creditoMin-sim": creditoMin,
            "valorMinRS-sim": valorMinRS,
            "franquia-sim": franquia
        }
    });

});

// Criacão de perfil do usuário antes da primeira ativacão
exports.criaPerfilCompleto = functions.https.onRequest((request, response) => {
    const calcMin = require('./calMin.js')
    console.log(`${request.query["first name"]} - ${request.query["messenger user id"]} Create User Profile:   ${JSON.stringify(request.query)}`);

    // dados do usuário
    const userId = request.query["messenger user id"];
    const firstName = request.query["first name"];
    const userEmail = (request.query["email_address"]).toLowerCase()
    const lastName = request.query["last name"];
    const indicador = (request.query["indicador"]).toLowerCase()
    const timezone = request.query["timezone"];

    // Dados do veículo
    const carValue = parseFloat(request.query["car-value"])
    const carModel = request.query["car-model"];
    // const carBrand = request.query["car-brand"]
    const carPlate = (request.query["car-plate"]).toLowerCase()

    // Referencia do Banco de dados
    var userDbId = crypto.createHash('md5').update(userEmail).digest("hex");
    var vehicleDbId = crypto.createHash('md5').update(carPlate).digest("hex");
    var indicadorDbId = crypto.createHash('md5').update(indicador).digest("hex");

    // caminho do DB para o perfil de usuário
    const dbRef = admin.database().ref(`/clients/${userDbId}/`).child(`profile`);
    // Caminho do DB para o perfil do veículo
    const vehicleDbRef = admin.database().ref(`/clients/${userDbId}/vehicles/${vehicleDbId}/`).child(`profile`);
    // Caminho do DB para o perfil de usuário do Indicador
    const dbRefIndicadorUser = admin.database().ref(`/clients/${indicadorDbId}/`).child(`profile/indication`);
    // Caminho do DB para a Lista de Indicados do Indicador
    const dbRefIndicador = admin.database().ref(`/clients/${indicadorDbId}/`).child(`indication`);
    
    console.log(`2 - ${userEmail} - ${firstName} - Calcula minuto da protecão.`);
    calcMin.calculaGasto(carValue).then(result => {
        console.log('valorMinuto: ', valorMinuto);
        valorMinuto = result;
        console.log('valorMinuto: ', valorMinuto);
        return valorMinuto; 
    }).catch(error => {
        console.error(new Error(`${JSON.stringify(error.description)}, CarValue: ${carValue}.`))
        response.json({
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

     // Objeto de perfil do user
     var perfilUsuario = {
        messengerId: userId,
        lastName: lastName,
        activations: 0,
        indicator: indicador,
        timezone: timezone,
        vehicleInUse: carPlate
    }

    var vehicleProfile = {
        carModel: carModel,
        carPlate: carPlate,
        carValue: carValue,
        minuteValue: valorMinuto,
        activations: 0,
        protectionStatus: "OFF"
    }

    var data;
    var perfilUser;
    var perfilIndicador = {
        indicatedUsers: 1,
        indicated: {
            1: userEmail
        }
    }

    // Verificacão/Criacão do perfil de usuário
    const criaPerfil = () => {
        return new Promise((resolve, reject) => {
           
            // Checa se já foi criado o peril do user pelo webhook do woocommerce
            let checaPerfilDB = () => {
                console.log(`checaPerfilDB - 1 - ${userEmail} - ${firstName} - Checando se existe pefil.`)

                // Recuperar dados do usuário para checar se pré perfil foi criado
                dbRef.once('value').then(snapshot => {
                    console.log(`checaPerfilDB - 2 - ${userEmail} - ${firstName} - Checado com sucesso. User: ${JSON.stringify(snapshot.val())}`)
                    perfilUser = snapshot.val()
                    return criaPerfilUser(perfilUser)

                }).catch( error => {
                    console.error(new Error(`checaPerfilDB - 2 - ${userEmail} - ${firstName} - Erro ao tentar recuperar perfil de Usuário ${error}.`))
                    reject(error)
                })
            }

            let createVehicleProfile = () => {
                vehicleDbRef.update(vehicleProfile).then(() => {
                    console.log(`createVehicleProfile - 1 - ${userEmail} - ${firstName} - ${carPlate} - Perfil de véiculo criado. ${vehicleProfile.toString()}`)
                    return resolve(true)
                }).catch(error => {
                    console.error(new Error(`createVehicleProfile - 2 - ${userEmail} - ${firstName} - ${carPlate} - Falha ao criar perfil do veiculo. ${error}`))
                    reject(error)
                })
            }

            // Cria perfil do usuário usando ID de cliente Woocommerce como Chave primária            
            let criaPerfilUser = perfilUser => {
                if (!perfilUser.idClient) {      // Não existem dados do perfil do usuário no sistema
                    console.error(new Error(`criaPerfilUser - 1 - ${userEmail} - ${firstName} - Usuário sem perfil. Result: ${JSON.stringify(perfilUser)}.`))
                    reject(
                        response.json({
                            "messages": [
                                {
                                    "text": `Não encontrei seu perfil criado em nosso sistema. Verifique se a compra foi concluida e tente novamente. Caso o erro persista, entrem contato com nosso especialista digitando "falas com especialista".`
                                }
                            ],
                            "redirect_to_blocks": [
                                "Informar Email"
                            ]
                        })
                    )
                } else if (perfilUser.idClient) {
                    console.log(`criaPerfilUser - 1 - ${userEmail} - ${firstName} - Usuário com perfil.`)
                    dbRef.update(perfilUsuario).then(() => {
                        console.log(`criaPerfilUser - 2 - ${userEmail} - ${firstName} - Perfil gravado com sucesso no DB.`)
                        return createVehicleProfile()
                    }).catch(error => {
                        console.error(new Error(`gravaPerfilDb - 2 - ${userEmail} - ${firstName} - Falha ao criar perfil. ${error}`))
                        reject(error)
                    })
                }
            }

            checaPerfilDB()

        })
    }

    // Verificacão/Criacão do indicador
    const indicacao = () => {
        console.log(`indicacao - 1 - ${userEmail} - ${firstName} - Verificacão indicacão de usuário.`)
        return new Promise((resolve, reject) => {

            // Busca perfil do indicador na tabela de indicadores
            let checaPerfilIndicador = () => {
                dbRefIndicador.once('value').then(snapshot => {
                    data = snapshot.val()
                    console.log(`checaPerfilIndicador - 1 - ${userEmail} - ${firstName} - resultado checagem ${JSON.stringify(data)}`)
                    return acaoIndicador(data)

                }).catch(error => {
                    console.error(new Error(`checaPerfilIndicador - 1 - ${userEmail} - ${firstName} - Erro ao checar perfil de indicador. ${error}`))
                    reject(error)
                })
            }

            // Checa se indicador existe e faz as tratativas
            let acaoIndicador = (data) => {
                if (!data) {
                    console.log(`atualizaIndicador - 1 - ${userEmail} - ${firstName} - Indicador não existe no banco.`)
                    criaIndicador()
                } else if (data) {
                    console.log(`acaoIndicador - 1 - ${userEmail} - ${firstName} - Indicador existe no banco.`)
                    var numIndicados = parseInt(data.indicatedUsers) + 1
                    atualizaIndicador(numIndicados)
                }
            }

            // Caso exista o perfil, atualiza o número de indicados
            let atualizaIndicador = numIndicados => {
                dbRefIndicador.update({
                    indicatedUsers: numIndicados
                }).then(() => {
                    console.log(`atualizaIndicador - 1 - ${userEmail} - ${firstName} - Num de indicados atualizado.`)
                    return atualizaArrayIndicador(numIndicados)
                }).catch(error => {
                    console.error(new Error(`atualizaIndicador - 1 - ${userEmail} - ${firstName} - Erro ao atualizar num de indicados. ${error}`))
                    reject(error)
                })
            }

            // Caso exista, atualiza o array de indicados
            let atualizaArrayIndicador = numIndicados => {
                dbRefIndicador.child(`/indicated/${numIndicados}`).set(userEmail).then(() =>{
                    console.log(`atualizaArrayIndicador - 1 - ${userEmail} - ${firstName} -  Usuário adicionado ao array.`);
                    return atualizaUserIndicador(numIndicados)
                }).catch(error => {
                    console.error(new Error(`atualizaArrayIndicador - 1 - ${userEmail} - ${firstName} -  Erro ao adicionar usuário ao array. ${error}`))
                    reject(error)
                });
            }

            //Caso nao exista, cria o perfil do indicador.
            let criaIndicador = () => {
                dbRefIndicador.set(perfilIndicador).then(() => {
                    console.log(`criaIndicador - 1 - ${userEmail} - ${firstName} - Indicador criado com sucesso.`)
                    return atualizaUserIndicador(1)
                }).catch(error => {
                    console.error(new Error(`criaIndicador - 1 - ${userEmail} - ${firstName} - Erro ao criar indicador. ${error}`))
                    reject(error)
                })
            }

            // Atualiza o numero de indicados do perfil de User do indicador
            let atualizaUserIndicador = numIndicados => {
                dbRefIndicadorUser.update({
                    indicatedUsers: numIndicados
                }).then(() => {
                    console.log(`atualizaUserIndicador - 1 - ${userEmail} - ${firstName} - Numero de indicados no perfil do User atualizados`)
                    return resolve(true)
                }).catch(error => {
                    console.log(`atualizaUserIndicador - 1 - ${userEmail} - ${firstName} - Erro ao atualiza numero de indicados. ${error}`)
                    reject(error)
                })
            }

            checaPerfilIndicador()

        })
    }

    criaPerfil().then(result => {
        console.log(`*** criaPerfil - Final - Todas as funcões foram executadas com sucesso. ***`)
        return indicacao()
    }).then(()=> {
        console.log(`*** indicacao - Final - Todas as funcões foram executadas com sucesso. ***`)
        return response.json({
            "messages": [
                {
                "text": `Opa ${firstName}! Terminei de verificar seus dados com sucesso e já posso começar a te proteger. Antes que eu me esqueça, valor da sua protecão vai ser de R$${valorMinuto/1000} ou ${valorMinuto} créditos por minuto.`
                },
                {
                    "text": `Seu saldo atual é de: ${perfilUser.wallet.switch} Créditos, que é o equivalente a R$${perfilUser.wallet.money}.`
                }
            ],
            "set_attributes":
            {
                "valorMinuto": valorMinuto,
                "user-credit": perfilUser.wallet.switch,
                "user-money": perfilUser.wallet.money,
                "idCliente": perfilUser.idClient
            },
            "redirect_to_blocks": [
                "welcome"
            ]
        })
    }).catch(error => {
        console.error(new Error(`*** criaPerfil - final - Erro ao executar funcões. Retorno imediato. ${error} ***`));
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

exports.simLigaDesliga = functions.https.onRequest((request, response) =>{
    console.log(`1 - ${request.query["messenger user id"]} - Entrando na funcão Liga/Desliga a protecão:  ${JSON.stringify(request.query)}`);

       // Dados do usuário
       const userEmail = request.query["email_address-sim"];
       console.log('userEmail: ', userEmail);
       const firstName = request.query["first name"];
       const userCredit = request.query["user-credit-sim"];
       const userMoney = request.query["user-money-sim"];
   
       // Dados do veículo
       const carValue = request.query["car-value-sim"];
       const valorMinuto = request.query["valorMinuto-sim"];
   
       // Dados de tempo
       const timeStart = request.query["timeStart-sim"];
   
       // Dados da proteção
       const statusProtecao = request.query["status-protecao-sim"];
       const numAtivacao = parseInt(request.query["numAtivacao-sim"]);
       
       var numeroAtivacoes = numAtivacao; 

            // Funcão para acionar a protecão
    const ligarProtecao = () => {
        console.log(`ligarProtecao - 1 - ${userEmail} - ${firstName} -  Funcão Ligar proteção numAtivacao: ${numAtivacao}`);


        // Gera timeStamp do inicio da protecão
        inicioProtecao = Date.now()/1000|0;
        estadoProtecao = "ON-SIM";
        numeroAtivacoes = numAtivacao + 1;


        if (numAtivacao === 0){ // Primeira Ativacão
        console.log(`ligarProtecao - 1 - ${userEmail} - ${firstName} -  primeira ativacão`);

            calcMin.calculaGasto(carValue).then(result => {
                return response.json({
                    "messages": [
                        {
                            "text": `Parabéns pela primeira ativação de sua proteção simulada. O custo da sua proteção é de ${result} créditos por minuto. Baseado nesse valor, você tem aproximadamente ${(10000/result).toFixed(0)} minutos para simular a proteção do seu veículo. Aproveite bastante.`
                        }
                    ],
                    "set_attributes":
                    {
                        "status-protecao-sim": estadoProtecao,
                        "numAtivacao-sim": numeroAtivacoes,
                        "timeStart-sim": inicioProtecao,
                        "primeira-ativacao": inicioProtecao,
                        "valorMinuto-sim": result
                    },
                    "redirect_to_blocks": [
                        "Mensagem de boas vindas primeira proteção Simulação"
                    ]
                })
            }).catch(error => {
                console.error(new Error(`${JSON.stringify(error.description)}, CarValue: ${carValue}.`))
                response.json({
                    "messages": [
                        {
                            "text": `${error.textSim}`,
                        }
                    ],
                    "redirect_to_blocks": [
                        `valor incorreto veiculo sim`
                    ]
                })
            })

            
        } else if (numAtivacao >= 1 && userCredit >= 100 ) {  // pode usar a Proteção


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
        console.log(`desligarProtecao - 1 - ${userEmail} - ${firstName} -  Funcão desligar proteção`);
        // Desliga a proteção, alterando o atributo status-protecao do chatfuel
        estadoProtecao = "OFF-SIM";
        // Pega o tempo do desligamento
        // Criando minha própria funcão de tempo
        var finalProtecao = Date.now()/1000|0;
        var tempoProtecao = finalProtecao - timeStart; // TimeDiff
        var dias = (tempoProtecao/60/60/24|0); // TimeDiffDays
        var horasTotais = (tempoProtecao/60/60|0); // TimeDiffHours Totais
        var minTotais = (tempoProtecao/60|0); // TimeDiffMinutes Totais
        var horas = (horasTotais - (dias*24)); // TimeDiffHours
        var minutos = (minTotais - (horasTotais * 60)); // TimeDiffMinutes
        var segundos = (tempoProtecao - (minTotais*60)); // TimeDiffSeconds

            console.log(`desligarProtecao - 2 - ${userEmail} - ${firstName} -  tempo de proteção: ${tempoProtecao/60|0}`);
            // Calcula o valor conumido baseado no tempo de uso. 
            if (segundos >= 30){
                valorConsumido = (Math.ceil(tempoProtecao/60))*valorMinuto;
                console.log(`desligarProtecao - 3 - ${userEmail} - ${firstName} -  Segundos Maior que 30: ${segundos}`);
            } else if (segundos < 30) {
                valorConsumido = (Math.floor(tempoProtecao/60))*valorMinuto;
                console.log(`desligarProtecao - 4 - ${userEmail} - ${firstName} -  Segundos Menor que 30: ${segundos}`);
            }
        
        var saldoCreditos = userCredit - valorConsumido;
        var saldoDinheiro = (userMoney - (valorConsumido/1000)).toFixed(4); 
        console.log(`desligarProtecao - 4.5 - ${userEmail} - ${firstName} -  Valor consumido: ${valorConsumido}`);

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
        console.log(`ligaDesligaProtecao - 4 - ${userEmail} - ${firstName} -  Protecão desligada e número de ativacões: ${numAtivacao}`);

        // Chama a funcão de ligar a protecão
        ligarProtecao();

    //Protecão ligada. Desliga a proteão
    } else if (statusProtecao === "ON-SIM") {
        console.log(`ligaDesligaProtecao - 4 - ${userEmail} - ${firstName} -  Protecão ligada e número de ativacões maior que 0. ${numeroAtivacoes}`); 
        desligarProtecao();
    }


})

exports.wooWebhook = functions.https.onRequest((request, response) =>{
    console.log(`1 - resposta do request ${JSON.stringify(request.body)}`);

    const wooRequest= JSON.stringify(request.body)
    const wooRequestParsed = JSON.parse(wooRequest)
    console.log('wooRequestParsed: ', wooRequestParsed);
    const lineItems = wooRequestParsed.line_items
    console.log('lineItems: ', lineItems);
    const qtdItensCompra = lineItems.length;
    console.log('qtdItensCompra: ', qtdItensCompra);
    var valorCrédito = 0

    if (wooRequestParsed.status === "completed") {
    
        for (let value of lineItems){

            if (value.product_id === 386 || value.product_id === 543){
                    console.log(` Produto que não entra no crédito: ${JSON.stringify(value)}`);

            } else {
                    console.log(` Produto que entra no crédito: ${JSON.stringify(value)}`);

                valorCrédito = JSON.parse(parseFloat(value.total)) + valorCrédito
                console.log('valorCrédito: ', valorCrédito);
            }
        }
        valorCrédito = parseFloat(valorCrédito)
        console.log(`Valor total da compra para créditos: ${valorCrédito}`);

        const billing = wooRequestParsed.billing
        const clientId = wooRequestParsed.customer_id  
        const firstName = billing.first_name
        console.log('firstName: ', firstName);
        const lastName = billing.last_name
        console.log('lastName: ', lastName);
        const email = (billing.email).toLowerCase()
        console.log('email: ', email);
        var userDbId = crypto.createHash('md5').update(email).digest("hex");
        const perfilUser = {
                lastName: lastName,
                wallet: {
                    switch: (valorCrédito * 1000),
                    money: valorCrédito,
                },
                userEmail: email,
                firstName: firstName,
                idClient: clientId,
                indication: {
                    indicatedUsers: 0,
                    indicationPromo: false
                }
            }  
     
        // Referencia do Banco de dados
        const dbRef = admin.database().ref(`/clients/${userDbId}/`).child(`profile`);

        // Checar existência de usuário no banco de dados
        const criaPrePerfil = perfilUser => {
            return new Promise((resolve, reject) => {

                // Checa se já existe o User no DB
                let checaUserDb = () => {
                    console.log(`1 checaUserDb - ${email} - ${firstName} -  Checa existência do USER.`);
                        // Pega no banco de dados o usuário que fez a indicação para realizar as acões necessáriis
                        dbRef.once('value').then(snapshot => {
                        data = snapshot.val();
                        return acaoPerfil(data)
                        }).catch(error => {
                            console.error(new Error(`2 - checaUserDb - ${email} - ${firstName} -  Erro ao receber dados do comprador. ${error}`))
                            reject(error)
                        })
                }

                // Após recuperar dados no DB verifica se o user existe ou não e faz as tratativas
                let acaoPerfil = (data) => {
                    if (!data) {
                        console.log(`acaoPerfil - 1 - ${email} - ${firstName} -  User não existe na base. ${JSON.stringify(data)}.`)
                        criaPerfilDb(perfilUser)
                    } else if (data.idClient) {
                        // caso exista, atualiza o numero de indicadores e adiciona um elemento no array
                        console.log(`acaoPerfil - 1 - ${email} - ${firstName} -  User já existe na base. ${JSON.stringify(data)}`);
                        console.log(`acaoPerfil - 2 - ${email} - ${firstName} -  Saldo de creditos: ${data.switch}, Saldo dinheiro: ${data.money}`);
                        var saldoCreditos = parseFloat(data.switch + (valorCrédito * 1000))
                        var saldoDinheiro = parseFloat(data.money) + valorCrédito
                        console.log('novo saldoDinheiro: ', saldoDinheiro);
                        console.log('novo saldoCreditos: ', saldoCreditos); 
                        atualizaSaldo(saldoCreditos, saldoDinheiro)  
                        
                    } else if (!data.idClient) {
                        console.log(`acaoPerfil - 1 - ${email} - ${firstName} -  User existe na base. Mas não tinha comprado ainda${JSON.stringify(data)}.`)
                        perfilUser.indication.indicatedUsers = data.indication.indicatedUsers
                        criaPerfilDb(perfilUser)
                    }
                } 

                // Caso o user não exista, cria o perfil dele no DB
                let criaPerfilDb = perfilUser => {
                    console.log(`1 - criaPerfilDb - ${email} - ${firstName} -  Criando o perfil do novo usuário`);
                
                    // cria perfil de usuário no banco de dados de indicador  
                    dbRef.update(perfilUser).then(() =>{
                        console.log(`criaPerfilDb - 2 - ${email} - ${firstName} -  User criado com sucesso.`);
                        return resolve(true);
                    }).catch(error => {
                        console.error(new Error(`criaPerfilDb - 2 - ${email} - ${firstName} -  Erro ao criar usuário. ${error}`))
                        reject(error)
                    })
                }  

                // Caso o user exista, atualiza o saldo dele no DB
                let atualizaSaldo = (saldoCreditos, saldoDinheiro) => {
                    console.log(saldoCreditos, saldoDinheiro)
                    console.log(`1 - atualizaSaldo - ${email} - ${firstName} - Entrando na promise para atualizar o saldo após compra.`);

                    //Atualiza o numero de indicados (indicadores)
                    dbRef.update({
                        wallet: {
                            switch: saldoCreditos,
                            money: saldoDinheiro
                        }
                    }).then(() =>{
                        console.log(`2 - atualizaSaldo - ${email} - ${firstName} -  Saldo User atualizado com sucesso.`);
                        return resolve(true);
                    }).catch(error => {
                        console.error(new Error(`2 - atualizaSaldo - ${email} - ${firstName} -  Erro ao atualizar o saldo. ${error}`))
                        reject(error)
                    })
                } 
                
                checaUserDb()
            })
        }
        
        criaPrePerfil(perfilUser).then(() => {
            console.log('*** Criacão de perfil executada com sucesso. ***')
            return response.json(true)
        }).catch(error => {
            console.log(`*** Erro ao criar/atualizar perfil do usuário. ${error} ***`)
            response.json(false)
        })
    } else {
        console.log("status de ordem não concluida ainda");
        response.json(false)
    }

})

exports.getrequest = functions.https.onRequest((request, response) => {
    var _ = require('lodash')
    var carValue = request.query["car-value"]
    var myModule = require('./calMin.js')
    myModule.calculaGasto(carValue).then(result =>{
        return response.json({
            "messages": [
                {
                    "text": `Seu minuto é: ${result}`
                }
            ]
        })
    }).catch(error => {
        console.error(new Error(`${JSON.stringify(error.description)}, CarValue: ${carValue}.`))
        response.json({
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
    
})

exports.carStatus = functions.https.onRequest((request, response) =>{
    console.log(`${JSON.stringify(request.body)}`);
    return response.json(200)
})
