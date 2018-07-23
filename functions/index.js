const functions = require('firebase-functions');

 // Initialize Firebase
 const admin = require('firebase-admin');

 var unirest = require("unirest");

admin.initializeApp({
    apiKey: "AIzaSyD8RCBaeju-ieUb9Ya0rUSJg9OGtSlPPXM",
    authDomain: "onsuranceme-co.firebaseapp.com",
    databaseURL: "https://onsuranceme-co.firebaseio.com",
    projectId: "onsuranceme-co",
    storageBucket: "onsuranceme-co.appspot.com",
    messagingSenderId: "241481831218"
  });

  var tokenWallet = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvb25zdXJhbmNlLm1lIiwiaWF0IjoxNTMyMzA4NDQyLCJuYmYiOjE1MzIzMDg0NDIsImV4cCI6MTUzMjkxMzI0MiwiZGF0YSI6eyJ1c2VyIjp7ImlkIjoiMyJ9fX0.cKWdr4aiI9Dqk1_xLrB_L7A-6BO09Vi3YClW-HXNLYw'

// Função que pega os atributos no chatfuel e identifica se Proteção está On / Off
exports.ligaDesligaProtecao = functions.https.onRequest((request, response) => {
    console.log(`1 - ${request.query["chatfuel user id"]} - Entrando na funcão Liga/Desliga a protecão:  ${JSON.stringify(request.query)}`);

    // Recebe os parâmetros do chatfuel
    // Dados do usuário
    const userId = request.query["chatfuel user id"];
    const clienteId = request.query["idCliente"];
    const firstName = request.query["first name"];
    const lastName = request.query["last name"];
    const userEmail = request.query["email_address"];
    const userCredit = request.query["user-credit"];
    const userMoney = request.query["user-money"];
    const timezone = request.query["timezone"];
    const indicador = request.query["indicador"];

    // Dados do veículo
    const carModel = request.query["car-model"];
    const carPlate = request.query["car-plate"];
    const carValue = request.query["car-value"];
    const valorMinuto = request.query["valorMinuto"];

    // Dados de tempo
    const timeStart = request.query["timeStart"];

    // Dados da proteção
    const statusProtecao = request.query["status-protecao"];
    var estadoProtecao = statusProtecao;
    const numAtivacao = request.query["numAtivacao"];

// Referencia do Banco de dados
    const promise = admin.database().ref('/users').child(userId);
    const promiseIndicadorUser = admin.database().ref('/users').child(indicador);
    const indicadorPromise = admin.database().ref('/indicadores').child(indicador);

    var numeroAtivacoes = parseInt(numAtivacao);
    var idCliente = clienteId;
    var valorConsumido = 0;
    var urlWp = `https://onsurance.me/wp-json/wc/v2/customers?email=${userEmail}&consumer_key=ck_f56f3caf157dd3384abb0adc66fea28368ff22f4&consumer_secret=cs_b5df2c161badb57325d09487a5bf703aad0b81a4`

    // Objeto de perfil do user
    var perfilUser = {
        userId: userId,
        userName: firstName,
        lastName: lastName,
        userEmail: userEmail,
        carModel: carModel,
        carPlate: carPlate,
        carValue: carValue,
        qtdAtivacao: numAtivacao,
        usuariosIndicados: 0,
        estadoProtecao: estadoProtecao,
        valorMinuto: valorMinuto,
        indicador: indicador,
        timezone: timezone,
        recebeuPromocao: false
    }

    // Recebe dia da semana e data completa
    var data;
    var inicioProtecao;
    var diaSemana;

    /* -----------------------//----------------------//-------------------// -------------------- */

    // Pega a data com dia da semana para colocar no banco de dados
    const getDate = (date) =>{
        console.log(`getDate - 1 - ${userId} - ${firstName} - Funcão para pegar o dia da semana`);
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
        console.log(`getDate - 2 - ${userId} - ${firstName} - Data e dia da semana recebidos: ${data}, ${diaSemana}`);
        return data;        
    }

    // Funcão para acionar a protecão
    const ligarProtecao = () => {
        console.log(`ligarProtecao - 1 - ${userId} - ${firstName} -  Funcão Ligar proteção`);

        // Gera timeStamp do inicio da protecão
        inicioProtecao = Date.now()/1000|0;
        estadoProtecao = "ON";
        numeroAtivacoes += 1;

        // Chama a função de pegar a data atual para salval no BD        
        getDate(Date.now());

        // **  Fata ajustar ao timezone do usuário ** //
        var logUso = {
            inicioProtecao: `${inicioProtecao} - ${diaSemana} - ${data.getDate()}/${data.getMonth()+1}/${data.getFullYear()} - ${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`,
            finalProtecao: ``,
            valorconsumido: ``,
            tempoUso: ``,
            saldoInicial: userCredit,
            saldoFinal: ``    
        }

        // Atualiza o banco de dados do usuário
        let attProtecaoUser = new Promise((resolve, reject) => {
            console.log(`ligarProtecao - 2 - ${userId} - ${firstName} -  promise atualiza status ligar proteção no DB`);

            promise.update({
                qtdAtivacao: numeroAtivacoes,
                estadoProtecao: estadoProtecao,
            }).then(() => {
                console.log(`ligarProtecao - 3 - ${userId} - ${firstName} -  usuário atualizado no Banco`);
                return resolve(true);
            }).catch(error => {
                console.error(new Error(`ligarProtecao - 3 - Erro ao atualizar usuário no banco ${error}`));
                console.error(new Error(error))
                reject(error)
            });
        })
        
        // Atualiza o log de uso no banco de dados
        let attLogUsoPerfilUser = new Promise((resolve, reject) => {
            console.log(`ligarProtecao - 4 - ${userId} - ${firstName} -  promise atualiza log uso ligar no DB`);

            promise.child(`/logUse/${numeroAtivacoes}`).update(logUso).then( () => {
                console.log(`ligarProtecao - 5 - ${userId} - ${firstName} -  Log de uso atualizado no banco.`);
                return resolve(true);
            }).catch(error => {
                console.error(new Error(`ligarProtecao - 5 - ${userId} - ${firstName} -  Erro ao atualizar log de uso no banco. ${error}`));
                console.error(new Error(error))
                reject(error)
            });

        })
      
        const executaLigarProtecao = (response) => {
            console.log(`executaLigarProtecao - ligarProtecao - 1 - ${userId} - ${firstName} - Funcão que executa as promises de ligar a protecão.`);
                
                Promise.all([attProtecaoUser, attLogUsoPerfilUser]).then(() => {
                    console.log(`executaLigarProtecao - ligarProtecao - 2 - ${userId} - ${firstName} - Promises executadas com sucesso. Ligando protecão`);
                    if (numAtivacao >= 1) {
                        console.log(`ligarProtecao - 4 - ${userId} - ${firstName} -  chamando funcão premioIndicacão if ativacão > 0. numAtivacao: ${numAtivacao}`);

                        // Inicia verificacão para premiacão do usuário por 10 indicacões
                        var receberPremio = false;
                        // Chama funcão de premiacão e de resposta 
                        premioIndicacao(userId, promise, receberPremio, estadoProtecao, numeroAtivacoes, inicioProtecao, firstName, response, carModel, tokenWallet)
                }
                    return 
                }).catch(error => {
                    console.error(new Error(`executaLigarProtecao - ligarProtecao - 2 - ${userId} - ${firstName} -  Erro ao executar promises. Protecão não Ligada ${error}`))
                    console.error(new Error(error))
                    response.json({
                        "messages": [
                            {
                                "text": `Opa ${firstName}. Não consegui ligar sua proteção. Vou trazer a função de Ligar para você tentar novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
                            }
                        ],
                        "set_attributes":
                        {
                            "status-protecao": `OFF`,
                        },
                        "redirect_to_blocks": [
                            "Ligar"
                        ]
                    })
                })

        }

        executaLigarProtecao(response)     
        
        return inicioProtecao;
    }

    const desligarProtecao = () => {
        console.log(`desligarProtecao - 1 - ${userId} - ${firstName} -  Funcão desligar proteção`);
        // Desliga a proteção, alterando o atributo status-protecao do chatfuel
        estadoProtecao = "OFF";
        getDate(Date.now());
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

            console.log(`desligarProtecao - 2 - ${userId} - ${firstName} -  tempo de proteção: ${tempoProtecao/60|0}`);
            // Calcula o valor conumido baseado no tempo de uso. 
            if (segundos >= 30){
                valorConsumido = (Math.ceil(tempoProtecao/60))*valorMinuto;
                console.log(`desligarProtecao - 3 - ${userId} - ${firstName} -  Segundos Maior que 30: ${segundos}`);
            } else if (segundos < 30) {
                valorConsumido = (Math.floor(tempoProtecao/60))*valorMinuto;
                console.log(`desligarProtecao - 4 - ${userId} - ${firstName} -  Segundos Menor que 30: ${segundos}`);
            }
        
        perfilUser.saldoCreditos = userCredit - valorConsumido;
        perfilUser.saldoDinheiro = (userMoney - (valorConsumido/1000)).toFixed(4); 
        console.log(`desligarProtecao - 4.5 - ${userId} - ${firstName} -  Valor consumido: ${valorConsumido}`);

        // Objeto com dados do desligamento da proteção
        var logUso = {
            finalProtecao: `${finalProtecao} - ${diaSemana} - ${data.getDate()}/${data.getMonth()+1}/${data.getFullYear()} - ${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`,
            valorconsumido: valorConsumido,
            tempoUso: `${dias} dias : ${horas} horas : ${minutos} minutos : ${segundos} segundos`,
            saldoFinal: perfilUser.saldoCreditos
        };


        let attPerfilUser = new Promise((resolve, reject) => {
            
            // Salva no banco de dados o resultado do desligamento e atualiza o banco de dados
            promise.update({
                saldoCreditos: perfilUser.saldoCreditos,
                saldoDinheiro: perfilUser.saldoDinheiro,
                estadoProtecao: estadoProtecao,
            }).then(() =>{
                console.log(`desligarProtecao - 5 - ${userId} - ${firstName} -  Consumo do desligamento salvo no banco.`);
                return resolve(true)
            }).catch(error =>{
                console.error(new Error(`desligarProtecao - 5 - ${userId} - ${firstName} -  Erro ao slavar dados de encerramento da protecão no banco de dados. ${error}`));
                console.error(new Error(error))
                reject(error)
            });
        })

        let attLogUsoPerfilUser = new Promise((resolve, reject) => {
            // atualizar log de uso
            promise.child(`/logUse/${numeroAtivacoes}`).update(logUso).then(() =>{
                console.log(`desligarProtecao - 6 - ${userId} - ${firstName} -  Log de uso atualizado no banco`);
                return resolve(true);
            }).catch(error =>{
                console.error(new Error(`desligarProtecao - 6 - ${userId} - ${firstName} -  Erro ao atualizar log de uso. ${error}`));
                console.error(new Error(error))
                reject(error)
            });
        })

        // Desconta saldo na woowallet ao realizar o desligamento
        // post method para descontar na carteira o valor consumido.
        let descontaDesligarWallet = new Promise((resolve, reject) => {
        
            var req = unirest("post", `https://onsurance.me/wp-json/wp/v2/wallet/${idCliente}`);

            req.query({
            "type": "debit",
            "amount": `${valorConsumido}`,
            "details": `Desconto do uso da protecão Onsurance. Detalhes do uso. Início da protecão: ${timeStart}, ${JSON.stringify(logUso)}`
            });
            
            req.headers({
            "Authorization": `Bearer ${tokenWallet}`});
            
            req.end(res => {
                if (res.error){
                    console.error(new Error(`DesligarProteção - 8 - ${userId} - ${firstName} -  Desconto não realizado no wallet: ${JSON.stringify(res.error)}`));
                    console.error(new Error(res.error))
                    reject(res.error)
                } else {
                    console.log(`DesligarProteção - 8 - ${userId} - ${firstName} -  Desconto feito com sucesso no wallet: ${JSON.stringify(res.body)}`);
                    resolve(res.body)
                }
            });
        })

        const executaDesligarProtecao = (response) => {
            console.log(`1 - executaDesligarProtecao - desligarProtecao - ${userId} - ${firstName} - Funcão que executa as promises de desligar a protecão.`);
                
                Promise.all([descontaDesligarWallet, attPerfilUser, attLogUsoPerfilUser]).then(() => {
                    console.log(`2 - executaDesligarProtecao - desligarProtecao - ${userId} - ${firstName} - Promises executadas. Desligando protecão.`);
                    return response.json({
                        "messages": [
                            {
                                "text": "Sua proteção está desligada!"
                            }
                        ],
                        "set_attributes":
                            {
                                "status-protecao": estadoProtecao,
                                "user-credit": perfilUser.saldoCreditos,
                                "user-money": perfilUser.saldoDinheiro,
                                "valorconsumido": valorConsumido,
                                "dias": dias,
                                "horas": horas,
                                "minutos": minutos,
                                "segundos": segundos
                            },
                            "redirect_to_blocks": [
                                "Pós Off"
                            ]
                    });
                }).catch(error => {
                    console.error(new Error(`2 - executaDesligarProtecao - desligarProtecao - ${userId} - ${firstName} -  Erro ao executar promises. Protecão não desligada ${error}`))
                    console.error(new Error(error))
                    response.json({
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
                    })
                })

            }

            executaDesligarProtecao(response)     
    }

    // Checa estado da proteção - Liga / Desliga
    console.log(`ligaDesligaProtecao - 2 - ${userId} - ${firstName} -  Estado da protecão: ${estadoProtecao}`);
    console.log(`ligaDesligaProtecao - 3 - ${userId} - ${firstName} -  Número de ativacões: ${numeroAtivacoes}`);

    // Protecão desligada. Liga a Protecão
    if (estadoProtecao === "OFF" && numeroAtivacoes >= 1){
        console.log(`ligaDesligaProtecao - 4 - ${userId} - ${firstName} -  Protecão desligada e número de ativacões maior que 0. ${numeroAtivacoes}`);

        // Chama a funcão de ligar a protecão
        ligarProtecao();

    //Protecão ligada. Desliga a proteão
    } else if (estadoProtecao === "ON" && numeroAtivacoes >= 1) {
        console.log(`ligaDesligaProtecao - 4 - ${userId} - ${firstName} -  Protecão ligada e número de ativacões maior que 0. ${numeroAtivacoes}`); 
        desligarProtecao();
    }

    //primeira ativacão
    if (numeroAtivacoes === 0) {
        console.log(`PrimeiraAtivação - 1 - ${userId} - ${firstName} -  Primeira ativacão.`);

        criaNovoUsuario(perfilUser, userId, promise, indicadorPromise, promiseIndicadorUser, response, firstName, ligarProtecao);
        
        setTimeout(() => {
            promise.once('value').then(snapshot => {
                var data = snapshot.val() 
                console.log(`PrimeiraAtivação - 2 - Dados recuperados e retorno imediato`);
                return response.json({
                    "set_attributes":
                        {
                            "status-protecao": data.estadoProtecao,
                            "numAtivacao": 1,
                            "timeStart": inicioProtecao,
                        },
                        "redirect_to_blocks": [
                            "Mensagem de boas vindas primeira proteção"
                        ]
                });
            }).catch(error => {
                console.error(new Error(`PrimeiraAtivação - 2 - ${userId} - ${firstName} - Falha ao recuperar user ${error}`));
                console.error(new Error(error))
                response.json({
                    "messages": [
                        {
                            "text": `Opa ${firstName}! Não consegui ligar sua proteção. peço que você tente novamente. Caso continue tendo problemas entre em contato com nosso especialista digitando "falar com especialista".`
                        }
                    ],
                    "set_attributes":
                        {
                            "status-protecao": "OFF",
                            "numAtivacao": 0,
                        },
                        "redirect_to_blocks": [
                            "welcome homologação"
                        ]
                });
            })
        }, 1500)
        
    }
});

// Funcão para calculo de gastos anuais
exports.botSimulacao = functions.https.onRequest((request, response) => {
    console.log(`1 - ${request.query["first name"]} - ${request.query["chatfuel user id"]} - Bot de simuacão :   ${JSON.stringify(request.query)}`);

    // dados do usuário
    const userId = request.query["chatfuel user id"];
    const firstName = request.query["first name"];

    // Dados do veículo
    const carValue = request.query["car-value-sim"];
    const horasUsoDia = request.query["horasUso-sim"];
    const valorSeguro = request.query["valorSeguro-sim"];
    const valorSemSeguro = request.query["valorSemSeguro-sim"];
    console.log('valorSemSeguro: ', valorSemSeguro);
    console.log('valorSeguro: ', valorSeguro);


    var valorVeiculo = carValue;
    var checaValor = carValue.toString();

    // Checa se valor informado é válido
    if (checaValor.includes(".") || checaValor.includes(",")) {
        console.log(`2 - ${userId} - ${firstName} -  usuário informou valor no modelo errado! ${carValue}`);
        response.json({
            "set_attributes":
            {
                "valorCorreto-sim": false,
            },
            "messages": [
                {
                    "text": `O formato digitado está incorreto, por favor digite sem utilizar pontos ou vírgulas. Ex: "55000".`,
                }
            ]    
        });
    }
    
    var valorMinuto = calculaGasto(carValue);
    console.log(`2.5 - ${userId} - ${firstName} -  valor do minuto pos funcão, ${valorMinuto}`);
    console.log(`3 - ${userId} - ${firstName} -  Valor do Carro :  ${carValue}`);
    
    var consumoAnual = ((horasUsoDia*60*365)*(valorMinuto/1000)).toFixed(2);
    console.log(`4 - ${userId} - ${firstName} -  consumo anual: ${consumoAnual}`);
    consumoAnual.toString();
    consumoAnual = consumoAnual.replace(".", ",");
    
    // Crédito mínimo até para carros até R$40.000
    var creditoMin = 999;

    if (carValue > 40000) {
        console.log(`5 - ${userId} - ${firstName} -  car value maior que 40000`);
        creditoMin = (carValue*0.025).toFixed(2);
    }

    // Calcula valor do seguro tradicional caso o usuário não tenha seguro
    if (valorSemSeguro === "0.05"){
        var valorDoSeguro = (valorSemSeguro*carValue).toFixed(2);
        console.log(`5.5 - ${userId} - ${firstName} -  valorDoSeguro: , ${valorDoSeguro}`);

    }
    console.log(`6 - ${userId} - ${firstName} -  valor do seguro: ${valorDoSeguro}`);
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
            "valorMinRS-sim": valorMinRS
        }
    });

});

exports.calcPrecoMinuto = functions.https.onRequest((request, response) => {
    console.log(`1 - ${request.query["first name"]} - ${request.query["chatfuel user id"]} - Fluxo de calculo do minuto:   ${JSON.stringify(request.query)}`);

    // dados do usuário
    const userId = request.query["chatfuel user id"];
    const firstName = request.query["first name"];
    const userEmail = request.query["email_address"];

    // Dados do veículo
    const carValue = request.query["car-value"];
    const carModel = request.query["car-model"];
    var urlWp = `https://onsurance.me/wp-json/wc/v2/customers?email=${userEmail}&consumer_key=ck_f56f3caf157dd3384abb0adc66fea28368ff22f4&consumer_secret=cs_b5df2c161badb57325d09487a5bf703aad0b81a4`
    const promise = admin.database().ref('/users').child(userId);

    var checaValor = carValue.toString();

    // Checa se valor informado é válido
    if (checaValor.includes(".") || checaValor.includes(",")) {
        console.log(`2 - ${userId} - ${firstName} -  usuário informou valor no modelo errado! ${carValue}`);
        console.error(new Error(`2 - ${userId} - ${firstName} -  usuário informou valor no formato errado! ${carValue}`));
        response.json({
            "set_attributes":
            {
                "valorCorreto-sim": false,
            },
            "messages": [
                {
                    "text": `O valor do veículo foi digitado no formato errado, por favor NÃO utilize pontos ou vírgulas. Ex: "55000".`,
                }
            ],
            "redirect_to_blocks": [
                "Erro no preco do veiculo"
            ]
        });
    }


    var perfilUser = {};

    console.log(`2 - ${userId} - ${firstName} - Entrando na funcão de calculo do minuto.`);
    var valorMinuto = calculaGasto(carValue, response);

    pegaIdCliente(userId, perfilUser, promise, urlWp, response, valorMinuto, tokenWallet, firstName)


})

exports.getTimeStart = functions.https.onRequest((request, response) =>{
        // Pega a data com dia da semana para colocar no banco de dados
        var inicioProtecao = Date.now()/1000|0;
        response.json({
            "set_attributes":
                {
                    "timeStart": inicioProtecao
                },
                "redirect_to_blocks": [
                    "Trigger"
                ]
        });

})
exports.getTimeEnd = functions.https.onRequest((request, response) =>{
    const timeStart = request.query["timeStart"];

        var finalProtecao = Date.now()/1000|0;
        var tempoProtecao = finalProtecao - timeStart; // TimeDiff
        var dias = (tempoProtecao/60/60/24|0); // TimeDiffDays
        var horasTotais = (tempoProtecao/60/60|0); // TimeDiffHours Totais
        var minTotais = (tempoProtecao/60|0); // TimeDiffMinutes Totais
        var horas = (horasTotais - (dias*24)); // TimeDiffHours
        var minutos = (minTotais - (horas * 60)); // TimeDiffMinnutes
        var segundos = (tempoProtecao - (minTotais*60)); // TimeDiffSeconds

        response.json({
            "set_attributes":
                {
                    "timeEnd": finalProtecao,
                    "timeDiff": tempoProtecao,
                    "timeDiffMinutes": minutos,
                    "timeDiffHours": horas,
                    "timeDiffDays": dias,
                    "timeDiffSeconds": segundos
                },
                "redirect_to_blocks": [
                    "Trigger"
                ]
        });

})

// Funcão que trabalha toda criacão do usuário e fluxos de primeiro uso.
const criaNovoUsuario = (perfilUser, userId, promise, indicadorPromise, promiseIndicadorUser, response, firstName, ligarProtecao ) => {
    console.log(`criaNovoUsuario - 1 - ${userId} - ${firstName} -  Entra na funcão de criar novo usuário`);
    var perfilIndicador = {
        usuariosIndicados: 1,
        indicados: {
            1: userId
        }
    }

    // Contém a chamada de promise que cria o perfil do novo usuário no banco de dados
    const promiseCriaPerfilUserDb = () => {
        console.log(`1 - promiseCriaPerfilUserDb - criaNovoUsuario - ${userId} - ${firstName} -  Promise que cria o perfil do usuário`);
    
        //adiciona saldo da carteira no banco de dados
        return new Promise((resolve, reject) =>{
                // cria perfil do usuário que está ligando a protecão    
            promise.update(perfilUser).then( () => {
                console.log(`2 promiseCriaPerfilUserDb - criaNovoUsuario - ${userId} - ${firstName} -  Usuário criado com sucesso no Banco de Dados`);
                return resolve(true);
            }).catch(error => {
                console.error(new Error(`2 promiseCriaPerfilUserDb - criaNovoUsuario - ${userId} - ${firstName} -  Erro na cricão do usuário. ${error}`))
                console.error(new Error(error))
                reject(error)
            })
        })
    }
    
    //Chama a promise que cria um novo User no banco de dados. Faz a tratativa pro usuário em caso de erro
    const criaPerfilUserDb = (response, ligarProtecao) =>{
        console.log(`1 - criaPerfilUserDb - criaNovoUsuario - ${userId} - ${firstName} -  executando promise que cria um novo USER no Bando de Dados.`);

        var criaPerfil = promiseCriaPerfilUserDb();
        criaPerfil.then(result => {
            console.log(`2 - criaPerfilUserDb - criaNovoUsuario - ${userId} - ${firstName} - Usuário criado com sucesso no banco de dados. ${result}. Indo para a segunda chamada, checagem de indicacões`);

            return checaUserIndicadorDb(response, ligarProtecao);
        }).catch(error => {
            console.error(new Error(`2 - criaPerfilUserDb - criaNovoUsuario - ${userId} - ${firstName} - Saldo não foi gravado no Banco de Dados. Erro: ${error}`))
            console.error(new Error(error))
            response.json({
                    "messages": [
                        {
                            "text": `Olá! Identifiquei um pequeno erro. Não consegui criar seu perfil em nosso sistema. Preciso que você reinforme suas informações e tente novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
                        }
                    ],
                    "redirect_to_blocks": [
                        "Informar Email"
                    ]
            })
        })
    }
    criaPerfilUserDb(response, ligarProtecao)
    var data;
       
    
    // Contém a chamada de promise que checa se já existe o Indicador do novo User
    const promiseChecaUserIndicadorDb = () => {
        console.log(`1 - promiseChecaUserIndicador - criaNovoUsuario - ${userId} - ${firstName} -  Estrando na promise que checa se existe o usuário indicador`);
    
        return new Promise((resolve, reject) =>{
            // Pega no banco de dados o usuário que fez a indicação para realizar as acões necessáriis
            indicadorPromise.once('value').then(snapshot => {
            data = snapshot.val();
            return resolve(data); 
            }).catch(error => {
                console.error(new Error(`3 - promiseChecaUserIndicadorDb - criaNovoUsuario - ${userId} - ${firstName} -  Erro ao receber dados do indicador. ${error}`))
                console.error(new Error(error))
                reject(error)
            })
        })
    }

    // Executa a promise que checa se existe Indicador de novo User. 
    const checaUserIndicadorDb = (response, ligarProtecao) => {
        console.log(`1 - checaUserIndicadorDb - criaNovoUsuario - ${userId} - ${firstName} -  executando promise que checa se já existe INDICADOR de novo USER no Bando de Dados.`);
        var checaUserIndicador = promiseChecaUserIndicadorDb();
        checaUserIndicador.then(result => {
        console.log(`2 - checaUserIndicadorDb - criaNovoUsuario - ${userId} - ${firstName} - Checagem efetuada com sucesso. ${JSON.stringify(result)}. Indo para as tratativas.`);
        
        // checa se existe indicador no banco 
            // Indicador não existe !Result
            if (!result){
                //caso não exista cria na tabela indicadores
                console.log(`3 - checaUserIndicadorDb - criaNovoUsuario - ${userId} - ${firstName} -  Indicador não existe na base. ${JSON.stringify(result)}. Chamando a funcão de criar indicador no DB.`);  
                // !result -> não existe usuário indicador
                
                    // Contém a chamada de promise que cria um novo indicador no DB
                    const promiseCriaPerfilIndicadorDb = () => {
                        console.log(`1 - promiseCriaPerfilIndicadorDb - criaNovoUsuario - ${userId} - ${firstName} -  Estrando na promise que cria o perfil do usuário`);
                    
                        return new Promise((resolve, reject) =>{
                            // cria perfil de usuário no banco de dados de indicador  
                            indicadorPromise.set(perfilIndicador).then(() =>{
                                console.log(`2 - promiseCriaPerfilIndicadorDb - criaNovoUsuario - ${userId} - ${firstName} -  Indicador criado com sucesso.`);
                                return resolve(true);
                            }).catch(error => {
                                console.error(new Error(`2 - promiseCriaPerfilIndicadorDb - criaNovoUsuario - ${userId} - ${firstName} -  Erro ao criar usuário indicador. ${error}`))
                                console.error(new Error(error))
                                reject(error)
                            })
                        })
                    }       

                    //Chama a promise que salva os dados no banco de dados. Faz a tratativa pro usuário em caso de erro
                    const criaPerfilIndicadorDb = (response, ligarProtecao) =>{
                        console.log(`1 - criaPerfilIndicadorDb - criaNovoUsuario - ${userId} - ${firstName} -  Executando na promise que cria perfil de Indicador no Bando de Dados.`);

                        var criaPerfilIndicador = promiseCriaPerfilIndicadorDb();
                        criaPerfilIndicador.then(result => {
                            console.log(`2 - criaPerfilIndicadorDb - criaNovoUsuario - ${userId} - ${firstName} - Indicador criado com sucesso no banco de dados. Indo para a funcão que atualiza o número de indicado no perfil de Usuário do Indicador`);

                            return atualizaNumIndicadosUserDb(response, ligarProtecao);
                        }).catch(error => {
                            console.error(new Error(`2 - criaPerfilIndicadorDb - criaNovoUsuario - ${userId} - ${firstName} - Saldo não foi gravado no Banco de Dados. Erro: ${error}`))
                            console.error(new Error(error))
                            response.json({
                                    "messages": [
                                        {
                                            "text": `Olá! Identifiquei um pequeno erro. Não consegui criar seu perfil em nosso sistema. Preciso que você reinforme suas informações e tente novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
                                        }
                                    ],
                                    "redirect_to_blocks": [
                                        "Informar Email"
                                    ]
                            })
                        })
                    }

                    // atualiza o numero de indicados na tabela de USERS
                    const promiseAtualizaNumIndicadosUserDb = () => {
                        console.log(`1 - promiseAtualizaNumIndicadosIndicadorDb - criaNovoUsuario - ${userId} - ${firstName} -  Entrando na promise que atualiza o número de indicados no perfil do USUÁRIO indicador`);
                    
                        return new Promise((resolve, reject) =>{
                            // atualiza o numero de indicados na tabela de USERS
                            promiseIndicadorUser.update({
                                usuariosIndicados: 1
                            }).then(() =>{
                                console.log(`1 - promiseAtualizaNumIndicadosIndicadorDb - criaNovoUsuario - ${userId} - ${firstName} -  Número de indicados atualizado com sucesso`);
                                return resolve(true);
                            }).catch(error => {
                                console.error(new Error(`1 - promiseAtualizaNumIndicadosIndicadorDb - criaNovoUsuario - ${userId} - ${firstName} -  Erro ao atualizar usuário indicador. ${error}`));
                                console.error(new Error(error))
                                reject(error)
                            })
                        })
                    }
                    
                    //Chama a promise que atualiza o número de Indicados do Indicador na tabela de USERS. Faz a tratativa pro usuário em caso de erro
                    const atualizaNumIndicadosUserDb = (response, ligarProtecao) =>{
                        console.log(`1 - atualizaNumIndicadosUserDb - criaNovoUsuario - ${userId} - ${firstName} -  Executando a promise que atualiza o número de Indicados do Indicador na tabela de USERS.`);

                        var atualizaNumIndicadosUser = promiseAtualizaNumIndicadosUserDb();
                        atualizaNumIndicadosUser.then(result => {
                            console.log(`2 - atualizaNumIndicadosUserDb - criaNovoUsuario - ${userId} - ${firstName} - Usuário atualizado com sucesso no banco de dados. Encerrando fluxo de indicacões`);
                            return ligarProtecao()
                        }).catch(error => {
                            console.error(new Error(`2 - atualizaNumIndicadosUserDb - criaNovoUsuario - ${userId} - ${firstName} - Saldo não foi gravado no Banco de Dados. Erro: ${error}`))
                            console.error(new Error(error))
                            response.json({
                                    "messages": [
                                        {
                                            "text": `Olá! Identifiquei um pequeno erro. Não consegui criar seu perfil em nosso sistema. Preciso que você reinforme suas informações e tente novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
                                        }
                                    ],
                                    "redirect_to_blocks": [
                                        "Informar Email"
                                    ]
                            })
                        })
                    }

                    criaPerfilIndicadorDb(response, ligarProtecao)

                // Usuário indicador existe na base dados
            } else if (result){

                // caso exista, atualiza o numero de indicadores e adiciona um elemento no array
                console.log(`3 - checaUserIndicadorDb - criaNovoUsuario - ${userId} - ${firstName} -  Indicador já existe na base. ${JSON.stringify(result)}`);
                console.log(`4 - checaUserIndicadorDb - criaNovoUsuario - ${userId} - ${firstName} -  Numero de indicados: ${result.usuariosIndicados}`);

                var numIndicados = parseInt(result.usuariosIndicados) + 1;
    
                 // Result. Existe indicador no banco de dados
                    // promise para atualizar o numero de indicados no DB INDICADOR.
                    var promiseAtualizaNumIndicadosIndicadorDb =  new Promise((resolve, reject) =>{
                    console.log(`1 - promiseAtualizaNumIndicadosIndicadorDb - criaNovoUsuario - ${userId} - ${firstName} - Entrando na promise para atualizar o numero de indicados no DB INDICADOR.`);

                        //Atualiza o numero de indicados (indicadores)
                        indicadorPromise.update({
                            usuariosIndicados: numIndicados
                        }).then(() =>{
                            console.log(`2 - promiseAtualizaNumIndicadosIndicadorDb - criaNovoUsuario - ${userId} - ${firstName} -  Número de usuários indicados atualizado com sucesso.`);
                            return resolve(true);
                        }).catch(error => {
                            console.error(new Error(`criaNovoUsuario - 6 - ${userId} - ${firstName} -  Erro ao atualizar o número pessoas indicadas. ${error}`))
                            console.error(new Error(error))
                            reject(error)
                        })
                    })

                    // promise para atualizar o array de indicados com o id do novo user no DB INDICADOR.
                    var promiseAtualizaArrayNumIndicadosIndicadorDb =  new Promise((resolve, reject) =>{
                    console.log(`1 - promiseAtualizaArrayNumIndicadosIndicadorDb - criaNovoUsuario - ${userId} - ${firstName} - Entrando na promise para atualizar o array de indicados com o id do novo user no DB INDICADOR.`);

                        // Atualiza o array com os clientes indicados (indicadores)
                        indicadorPromise.child(`/indicados/${numIndicados}`).set(userId).then(() =>{
                            console.log(`2 - promiseAtualizaArrayNumIndicadosIndicadorDb - criaNovoUsuario - ${userId} - ${firstName} -  Usuário adicionado ao array com sucesso.`);
                            return resolve(true);
                        }).catch(error => {
                            console.error(new Error(`2 - promiseAtualizaArrayNumIndicadosIndicadorDb - criaNovoUsuario - ${userId} - ${firstName} -  Erro ao adicionar usuário ao array de pessoas indicadas. ${error}`))
                            console.error(new Error(error))
                            reject(error)
                        });
                    })

                    // promise para atualizar o array de indicados com o id do novo user no DB USER.        
                    var promiseAtualizaNumIndicadosUsersDb =  new Promise((resolve, reject) =>{
                    console.log(`1 - promiseAtualizaNumIndicadosUsersDb - criaNovoUsuario - ${userId} - ${firstName} - Entrando na promise para atualizar o número de indicados no DB USER.`);

                        // atualiza o numero de indicados no bando de usuários (users)
                        promiseIndicadorUser.update({
                            usuariosIndicados: numIndicados
                        }).then(() =>{
                            console.log(`2 - promiseAtualizaNumIndicadosUsersDb - criaNovoUsuario - ${userId} - ${firstName} -  Número de indicados do USER atualizado com sucesso`);
                            return resolve(true)
                        }).catch(error => {
                            console.error(new Error(`2 - promiseAtualizaNumIndicadosUsersDb - criaNovoUsuario - ${userId} - ${firstName} -  Erro ao atualizar o número de indicados na tabela Users. ${error}`))
                            console.error(new Error(error))
                            reject(error)
                        })
                    })

                    const executaPromises = (response, ligarProtecao) => {
                    console.log(`1 - executaPromises - criaNovoUsuario - ${userId} - ${firstName} - Entrando na funcão que executa as promises quando existe Indicador.`);
                        
                        Promise.all([promiseAtualizaNumIndicadosIndicadorDb, promiseAtualizaArrayNumIndicadosIndicadorDb]).then(() => {
                            console.log(`2 - executaPromises - criaNovoUsuario - ${userId} - ${firstName} - Promises executadas com sucesso.ligando protecão`);
                            return ligarProtecao()
                        }).catch(error => {
                            console.error(new Error(`2 - executaPromises - criaNovoUsuario - ${userId} - ${firstName} -  Erro ao executar todas as promises. ${error}`))
                            console.error(new Error(error))
                            response.json({
                                "messages": [
                                    {
                                        "text": `Olá! Identifiquei um pequeno erro. Não consegui criar seu perfil em nosso sistema. Preciso que você reinforme suas informações e tente novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
                                    }
                                ],
                                "redirect_to_blocks": [
                                    "Informar Email"
                                ]
                            })
                        })

                    }

                    executaPromises(response, ligarProtecao)
                }
            
            return ;
        }).catch(error => {
            console.error(new Error(`2 - criaPerfilIndicadorDb - criaNovoUsuario - ${userId} - ${firstName} - Saldo não foi gravado no Banco de Dados. Erro: ${error}`))
            console.error(new Error(error))
            response.json({
                    "messages": [
                        {
                            "text": `Olá! Identifiquei um pequeno erro. Não consegui criar seu perfil em nosso sistema. Preciso que você reinforme suas informações e tente novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
                        }
                    ],
                    "redirect_to_blocks": [
                        "Informar Email"
                    ]
            })
        })
    }
    
}

// Checa numero de indicações e premia se usuário atingir requisitos
const premioIndicacao = (userId, promise, receberPremio, estadoProtecao, numeroAtivacoes, inicioProtecao, firstName, response, carModel, tokenWallet) => {
    console.log(`premioIndicacao - 1 - ${userId} - ${firstName} -  Funcão de premiacão por numero de indicacão`);
    
    var data;
    // recupera dados do usuário no Banco de dados
    promise.once('value').then(snapshot => {
        data = snapshot.val();
        console.log(`premioIndicacao - 2 - ${userId} - ${firstName} -  Dados do Usuário recuperado: ${data.usuariosIndicados} indicados. recebeu promocão: ${data.recebeuPromocao}`);

        // checa se número de indicados atingiu mais de 10 pela primeira vez
        // Se o usuário atingiu os requisitos necessários para receber o prênmio
        if (parseInt(data.usuariosIndicados) >= 10 && data.recebeuPromocao === false) {
            console.log(`premioIndicacao - 3 - ${userId} - ${firstName} -  Usuário vai receber prêmio por indicacão.`);
            var creditoPlus = data.saldoCreditos + 1000000;
            var saldoPlus = parseFloat(data.saldoDinheiro) + 1000;

            console.log(`premioIndicacao - 4 - ${userId} - ${firstName} -  Iniciando o crédito na woowaleet. IdCliente: ${data.idCliente}`);
            
            // Faz a conexão com o woowallet e credita 1000 reais
            var req = unirest("post", `https://onsurance.me/wp-json/wp/v2/wallet/${data.idCliente}`);

            req.query({
            "type": "credit",
            "amount": 1000000,
            "details": `Parabéns ${firstName}, você acaba de ganhar Um milhão de créditos por indicar a Onsurance para pelo menos 10 pessoas. Agora vc pode proteger seu ${carModel} por muito mais tempo.`
            });
            
            req.headers({
            "Authorization": `Bearer ${tokenWallet}`
            });
            
            req.end(res => {
                if (res.error){
                    console.error(new Error(`premioIndicacao - 5 - ${userId} - ${firstName} -  Prêmio de indicacão não creditado: ${JSON.stringify(res.error)}`))
                    console.error(new Error(res.error))
                } else {
                    console.log(`premioIndicacao - 5 - ${userId} - ${firstName} -  Prêmio de indicacão creditado!!! ${JSON.stringify(res.body)}`);
                    receberPremio = true;
                }
            });

            // Atualiza dados do usuário no banco de dados
            promise.update({
                saldoCreditos: creditoPlus,
                saldoDinheiro: saldoPlus,
                recebeuPromocao: true
            }).then( () => {
                console.log(`premioIndicacao - 6 - ${userId} - ${firstName} -  Crédito, saldo e status da promocão atualizados no banco.`);
                return;
            }).catch(error => {
                console.error(new Error(`premioIndicacao - 6 - ${userId} - ${firstName} -  Erro ao atualizar ganho de prêmio no banco. ${error}`))
                console.error(new Error(error))
            })

            // Adicionar os valores atualizados para as variáveis de usuário
            console.log(`premioIndicacao - 8 - ${userId} - ${firstName} -  Finaliza premiacão e a ativacão da protecão.`);
            response.json({
                "set_attributes":
                {
                    "status-protecao": estadoProtecao,
                    "numAtivacao": numeroAtivacoes,
                    "timeStart": inicioProtecao,
                    "user-credit": creditoPlus,
                    "user-money": saldoPlus,
                    "afiliados": data.usuariosIndicados
                },
                "redirect_to_blocks": [
                    "receber-promo"
                ]
            }); 

        // Caso usuário não tenha atingido os requisitos para receber prêmio
        } else if (data.usuariosIndicados < 10 || data.recebeuPromocao === true){
            console.log(`premioIndicacao - 4 - ${userId} - ${firstName} -  Não tem requisitos para receber promocão: ${data.usuariosIndicados} indicados, recebeu promo: ${data.recebeuPromocao}`);
            receberPremio = false;
            console.log(`premioIndicacao - 5 - ${userId} - ${firstName} -  Ligando protecão.`);
    
                response.json({
                    "messages": [
                        {
                            "text": `Sua proteção está ligada!`
                        }
                    ],
                    "set_attributes":
                    {
                        "status-protecao": estadoProtecao,
                        "numAtivacao": numeroAtivacoes,
                        "timeStart": inicioProtecao,
                        "afiliados": data.usuariosIndicados
                    },
                    "redirect_to_blocks": [
                        "Pós On"
                    ]
                });
        }

        return receberPremio, data;
    }).catch(error => {
        console.error(new Error(`premioIndicacao - 2 - ${userId} - ${firstName} -  Erro ao recuperar usuário na base de dados. ${error}`))
        console.error(new Error(error))
        response.json({
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
        })
    })
}

const calculaGasto = (carValue, response) =>{

    console.log('iniciando funcão de calcular valor do min');
    
    var valorVeiculo = carValue;

    console.log(`Valor do Carro :  ${carValue}`);
    
        if (valorVeiculo <= 30000) {
            valorMinuto = 4;
        }
        if (valorVeiculo > 30000 && valorVeiculo <= 40000) {
            valorMinuto = 5.5;
        }
        if (valorVeiculo > 40000 && valorVeiculo <= 50000) {
            valorMinuto = 7;
        }
        if (valorVeiculo > 50000 && valorVeiculo <= 60000) {
            valorMinuto = 8.5;
        }
        if (valorVeiculo > 60000 && valorVeiculo <= 70000) {
            valorMinuto = 10;
        }
        if (valorVeiculo > 70000 && valorVeiculo <= 80000) {
            valorMinuto = 13;
        }
        if (valorVeiculo > 80000 && valorVeiculo <= 90000) {
            valorMinuto = 14;
        }
        if (valorVeiculo > 90000 && valorVeiculo <= 100000) {
            valorMinuto = 15;
        }
        if (valorVeiculo > 100000 && valorVeiculo <= 110000) {
            valorMinuto = 16;
        }
        if (valorVeiculo > 110000 && valorVeiculo <= 120000) {
            valorMinuto = 17;
        }
        if (valorVeiculo > 120000 && valorVeiculo <= 130000) {
            valorMinuto = 18;
        }
        if (valorVeiculo > 130000 && valorVeiculo <= 140000) {
            valorMinuto = 19;
        }
        if (valorVeiculo > 140000 && valorVeiculo <= 150000) {
            valorMinuto = 20;
        }
        if (valorVeiculo > 150000 && valorVeiculo <= 160000) {
            valorMinuto = 21;
        }
        if (valorVeiculo > 160000 && valorVeiculo <= 170000) {
            valorMinuto = 22;
        }
        if (valorVeiculo > 170000 && valorVeiculo <= 180000) {
            valorMinuto = 23;
        }
        if (valorVeiculo > 180000 && valorVeiculo <= 190000) {
            valorMinuto = 24;
        }
        if (valorVeiculo > 190000 && valorVeiculo <= 200000) {
            valorMinuto = 25;
        }
        if (valorVeiculo > 200000){
            valorMinuto = 25;
            response.json({
                "messages": [
                    {
                        "text": "Para veículos acima de duzentos mil estamos fazendo uma lista de espera. Vou te colocar em contato com nossos especialistas para que eles possam te explicar melhor a situação."
                    }
                ],
                "redirect_to_blocks": [
                    "Human interaction"
                ]
            })
        }


        console.log("valor do minuto", valorMinuto);
        return valorMinuto;

}

// Todo feito com promises e microservicos
// Recupera o Id de cliente do Woocommerce
const pegaIdCliente = (userId, perfilUser, promise, urlWp, response, valorMinuto, tokenWallet, firstName) => {
    console.log(`1 - pegaIdCliente - ${userId} - ${firstName} -  Entrando na função que pega id de cliente do woocommerce.`);
    var dataApi;

    // Contém a chamada de api que pega o ID de cliente no WP
    var promiseWpClientRequest = () =>{
        console.log(`1 - promiseWpClientRequest - pegaIdCliente - ${userId} - ${firstName} -  Entrando na funcão para pegar o id do cliente WP via Api.`);
    
            return new Promise((resolve, reject) => {
                // Do async job
                var apiRequest = unirest("get", `${urlWp}`);
        
                apiRequest.end(res => {
                    if (res.error){
                        console.error(new Error(`2 - promiseWpClientRequest - pegaIdCliente - ${userId} - ${firstName} - Falha em recuperar ID: ${JSON.stringify(res.error)}`))
                        console.error(new Error(res.error))
                        reject(res.error)

                        // array empty or does not exist
                    } else if (res.body[0] === undefined || res.length === 0) {
                        console.error(new Error(`2 - promiseWpClientRequest - pegaIdCliente - ${userId} - ${firstName} - Falha em recuperar ID Array vazio: ${JSON.stringify(res)}`))
                        console.error(new Error(res.error))
                        reject(res)
                    } else {
                        console.log(`2 - promiseWpClientRequest - pegaIdCliente - ${userId} - ${firstName} - Consulta de ID feita com sucesso: ${res.body[0].id}`);
                        console.log(`3 - promiseWpClientRequest - pegaIdCliente - ${userId} - ${firstName} -  Status da tentativa de conexão: ${res.status}`);
                        dataApi = res.body[0].id;
                        perfilUser.idCliente = dataApi
                        console.log(`4 - pegaIdCliente - ${userId} - ${firstName} -  Informacões do usuário no woocommerce. ${JSON.stringify(res.body)}`);
                        resolve(dataApi)
                    }
                                
                })
                        
            })
    }

    //Chama a promise que recupera o ID do cliente no WP. Faz a tratativa pro usuário em caso de erro
    const wpClientRequest = (response) =>{
        console.log(`1 - wpClientRequest - pegaIdCliente - ${userId} - ${firstName} -  Entrando na promise para pegar o ID do cliente. Id de cliente:${dataApi}`);

        var wpClient = promiseWpClientRequest();
        wpClient.then(result => {
            userDetails = result;
            console.log(`2 - wpClientRequest - pegaIdCliente - ${userId} - ${firstName} -  Id de cliente recuperado com sucesso. ${result}. Chamando funcão de gravar ID no DB`);
            return pegaSaldoCarteira(userId, perfilUser, dataApi, promise, tokenWallet, firstName, response);
        }).catch(error => {
            console.error(new Error(`2 - wpClientRequest - pegaIdCliente - ${userId} - ${firstName} - Erro ao tentar recuperar id de cliente ${error} - Status: ${error.status}`))
            console.error(new Error(error))
            response.json({
                    "messages": [
                        {
                            "text": `Olá! Identifiquei um pequeno erro. Não consegui recuperar seus dados em nosso servidor. Preciso que você reinforme suas informações e tente novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
                        }
                    ],
                    "redirect_to_blocks": [
                        "Informar Email"
                    ]
            })
        })
    }
    

    // Execucão da funcão
    wpClientRequest(response);
}

// Todo feito com promises e microservicos
// Recupera o saldo da wallet e salva no banco de dados
const pegaSaldoCarteira = (userId, perfilUser, dataApi, promise, tokenWallet, firstName, response) => {
    console.log(`1 - pegaSaldoCarteira - ${userId} - ${firstName} -  Entrando na funcão de receber o saldo da carteira. Id de cliente:${dataApi}`);
    
    // Contém a chamada de api que pega o saldo no woowallet
    var promiseWalletApiRequest = () =>{
    console.log(`1 - promiseWalletApiRequest - pegaSaldoCarteira - ${userId} - ${firstName} -  Entrando na funcão de receber o saldo da carteira via Api.`);

        return new Promise((resolve, reject) => {
            // Do async job
            var apiRequest = unirest("get", `https://onsurance.me/wp-json/wp/v2/current_balance/${dataApi}`);
    
            apiRequest.headers({"Authorization": `Bearer ${tokenWallet}`})
            
            apiRequest.end(res => {
                if (res.error){
                    console.error(new Error(`2 - promiseWalletApiRequest - pegaSaldoCarteira - ${userId} - ${firstName} - Falha em pegar o saldo: ${JSON.stringify(res.error)}`))
                    console.error(new Error(res.error))
                    reject(res.error)
                } else {
                    console.log(`2 - promiseWalletApiRequest - pegaSaldoCarteira - ${userId} - ${firstName} - Consulta de saldo feito com sucesso na carteira: ${JSON.stringify(res.body)}`);
                    perfilUser.saldoCreditos = parseFloat(res.body.toString())                    
                    console.log('perfilUser.saldoCreditos: ', perfilUser.saldoCreditos);
                    perfilUser.saldoDinheiro = (perfilUser.saldoCreditos/1000).toFixed(4)
                    console.log('perfilUser.saldoDinheiro: ', perfilUser.saldoDinheiro);
                    resolve(res.status)
                }
            
            })
    
        })
    }

    // Contém a chamada de promise que salva o saldo no banco de dados
    const promiseGravaSaldoDb = () => {
    console.log(`1 - promiseGravaSaldoDb - pegaSaldoCarteira - ${userId} - ${firstName} -  Entrando na funcão salvar o saldo wallet no banco de dados. id clientre${dataApi}`);

        //adiciona saldo da carteira no banco de dados
        return new Promise((resolve, reject) =>{
            var perfil = {
                saldoCreditos: perfilUser.saldoCreditos,
                saldoDinheiro: perfilUser.saldoDinheiro,
                idCliente: dataApi
            }
            promise.update({
                saldoCreditos: perfilUser.saldoCreditos,
                saldoDinheiro: perfilUser.saldoDinheiro,
                idCliente: dataApi
            }).then(() => {
                console.log(`2 - promiseGravaSaldoDb - pegaSaldoCarteira - ${userId} - ${firstName} - Adicão de saldo feito com sucesso no banco.`);
                return resolve(perfil);
            }).catch(error => {
                console.error(new Error(`2 - promiseGravaSaldoDb - pedaSaldoCarteira - ${userId} - ${firstName} - Falha na atualizacão do bando de dados. Saldo desatualizado ${error}`))
                console.error(new Error(error))
                reject(error)
            })
        })
    }

    //Chama a promise que salva os dados no banco de dados. Faz a tratativa pro usuário em caso de erro
    const gravaSaldoDb = (response) =>{
        console.log(`1 - gravaSaldoDb - pegaSaldoCarteira - ${userId} - ${firstName} -  Entrando na promise para gravar saldo no Bando de Dados.`);

        var gravaSaldo = promiseGravaSaldoDb();
        gravaSaldo.then(result => {
            console.log(`2 - gravaSaldoDb - pegaSaldoCarteira - ${userId} - ${firstName} - Saldo gravado com sucesso no banco de dados`);

            return response.json({
                "messages": [
                    {
                      "text": `Opa ${firstName}! Terminei de verificar seus dados com sucesso e já posso começar a te proteger. Antes que eu me esqueça, valor do minuto da sua protecão vai ser de R$${valorMinuto/1000} ou ${valorMinuto} créditos por minuto. Está pronto pra começar?`
                    }
                ],
                "set_attributes":
                {
                    "valorMinuto": valorMinuto,
                    "user-credit": result.saldoCreditos,
                    "user-money": result.saldoDinheiro,
                    "idCliente": result.idCliente
                }
            });
        }).catch(error => {
            console.error(new Error(`2 - gravaSaldoDb - pegaSaldoCarteira - ${userId} - ${firstName} - Saldo não foi gravado no Banco de Dados. Erro: ${error}`))
            console.error(new Error(error))
            response.json({
                    "messages": [
                        {
                          "text": `Olá! Identifiquei um pequeno erro. Não consegui gravar seus dados em nosso sistema. Preciso que você reinforme suas informações e tente novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
                        }
                    ],
                    "redirect_to_blocks": [
                        "Informar Email"
                    ]
            })
        })
    }

    //Chama a promise que recupera o saldo do usuário no woowallet. Faz a tratativa pro usuário em caso de erro
    const walletApiRequest = (response) =>{
        console.log(`1 - walletApiRequest - pegaSaldoCarteira - ${userId} - ${firstName} -  Entrando na promise de retornar o saldo da carteira. Id de cliente:${dataApi}`);

        var walletPromise = promiseWalletApiRequest();
        walletPromise.then(result => {
            userDetails = result;
            console.log(`2 - walletApiRequest - pegaSaldoCarteira - ${userId} - ${firstName} -  Saldo da carteira recuperado com sucesso. ${result}. Chamando funcão de gravar saldo no DB`);
            return gravaSaldoDb(response);
        }).catch(error => {
            console.error(new Error(`2 - walletApiRequest - pegaSaldoCarteira - ${userId} - ${firstName} - Tivemos um problema para recuperar seu saldo em nosso servidor ${error}`));
            console.error(new Error(error))
            response.json({
                    "messages": [
                        {
                          "text": `Olá! Identifiquei um pequeno erro. Não consegui recuperar seu saldo em nosso servidor. Preciso que você reinforme suas informações e tente novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
                        }
                    ],
                    "redirect_to_blocks": [
                        "Informar Email"
                    ]
            })
        })
    }

    // Execucão da funcão
    walletApiRequest(response);
}
