const functions = require('firebase-functions');

 // Initialize Firebase
 const admin = require('firebase-admin');

 var unirest = require("unirest");

 const axios = require('axios');
 
const homolog = {
    apiKey: "AIzaSyDXehFd5rJfnIH3dgLBHoOc_O5R7D3IuHw",
    authDomain: "onsurance-co.firebaseapp.com",
    databaseURL: "https://onsurance-co.firebaseio.com",
    projectId: "onsurance-co",
    storageBucket: "onsurance-co.appspot.com",
    messagingSenderId: "1087999485424"
}
const product = {
    apiKey: "AIzaSyD8RCBaeju-ieUb9Ya0rUSJg9OGtSlPPXM",
    authDomain: "onsuranceme-co.firebaseapp.com",
    databaseURL: "https://onsuranceme-co.firebaseio.com",
    projectId: "onsuranceme-co",
    storageBucket: "onsuranceme-co.appspot.com",
    messagingSenderId: "241481831218"
}
admin.initializeApp(homolog);

exports.protecao = functions.https.onRequest((request, response) =>{
    console.log(`${request.query["email_address"]} - Entrando na funcão Liga/Desliga a protecão:  ${JSON.stringify(request.query)}`);

    // Recebe os parâmetros do chatfuel
    // Dados do usuário
    const clienteId = request.query["idCliente"];
    const firstName = request.query["first name"];
    const userEmail = request.query["email_address"];
    const userCredit = request.query["user-credit"];
    const userMoney = request.query["user-money"];
    const indicador = request.query["indicador"];
    const valorMinuto = request.query["valorMinuto"];

    // Dados de tempo
    const timeStart = request.query["timeStart"];

    // Dados da proteção
    const statusProtecao = request.query["status-protecao"];
    var estadoProtecao = statusProtecao;
    const numAtivacao = request.query["numAtivacao"];

    // Referencia do Banco de dados
    const dbRef = admin.database().ref('/users').child(clienteId);
    // const dbRefIndicadorUser = admin.database().ref('/users').child(indicador);
    // const indicadorPromise = admin.database().ref('/indicadores').child(indicador);

    var numeroAtivacoes = parseInt(numAtivacao);
    var valorConsumido = 0;
    var urlWp = `https://onsurance.me/wp-json/wc/v2/customers?email=${userEmail}&consumer_key=ck_f56f3caf157dd3384abb0adc66fea28368ff22f4&consumer_secret=cs_b5df2c161badb57325d09487a5bf703aad0b81a4`

    // Objeto de perfil do user
    var perfilUser = {
        saldoCreditos: userCredit,
        saldoDinheiro: userMoney,
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
    /* -----------------------//----------------------//-------------------// -------------------- */

    // Pega a data com dia da semana para colocar no banco de dados
    const pegarData = (date) => {
        console.log(`getDate - 1 - ${userEmail} - ${firstName} - Funcão para pegar o dia da semana`);
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

                console.log(`ligarProtecao - 1 - ${userEmail} - ${firstName} -  Funcão Ligar proteção`);

                // Gera timeStamp do inicio da protecão
                inicioProtecao = Date.now()/1000|0;
                estadoProtecao = "ON";
                numeroAtivacoes += 1;

                // Chama a função de pegar a data atual para salval no BD        
                pegarData(Date.now());

                // **  Fata ajustar ao timezone do usuário ** //
                var logUso = {
                    inicioProtecao: `${inicioProtecao} - ${diaSemana} - ${data.getDate()}/${data.getMonth()+1}/${data.getFullYear()} - ${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`,
                    finalProtecao: ``,
                    valorconsumido: ``,
                    tempoUso: ``,
                    saldoInicial: userCredit,
                    saldoFinal: ``    
                };
                const atualizaStatus = () =>{
                    dbRef.update({
                        qtdAtivacao: numeroAtivacoes,
                        estadoProtecao: estadoProtecao,
                    }).then(() => {
                        console.log(`ligarProtecao - 2 - ${userEmail} - ${firstName} -  Status atualizado no banco.`)
                        return atualizaLog()
                    }).catch(error => {
                        console.error(new Error(`ligarProtecao - 2 - Erro ao atualizar usuário no banco ${error}`));
                        response.json(falhaLigar)
                    })
                }

                const atualizaLog = () => {
                    dbRef.child(`/logUse/${numeroAtivacoes}`).update(logUso).then( () => {
                        console.log(`ligarProtecao - 3 - ${userEmail} - ${firstName} -  Log de uso atualizado no banco.`);
                        console.log("*** Protecão completamente ligada no servidor. ***")
                        return resolve()
                    }).catch(error => {
                        console.error(new Error(`ligarProtecao - 3 - ${userEmail} - ${firstName} -  Erro ao atualizar log de uso no banco. ${error}`));
                        response.json(falhaLigar)
                    })
                }
                atualizaStatus()
            })

    }  

    // Funcão para desativar a protecão
    const desligarProtecao = async() => {
        console.log(`desligarProtecao - 1 - ${userEmail} - ${firstName} -  Funcão desligar proteção`);
        // Desliga a proteção, alterando o atributo status-protecao do chatfuel
        estadoProtecao = "OFF";

        pegarData(Date.now())         // Pega os dados de data do uso da protecão 

        // Pega o tempo do desligamento
        var finalProtecao = Date.now()/1000|0;              // TimeEnd - Timestamp do desligamento da protecão
        var tempoProtecao = finalProtecao - timeStart       // TimeDiff - Tempo total de uso da protecão em segundos
        var dias = (tempoProtecao/60/60/24|0)               // TimeDiffDays - Tempo de uso em dias(totais) da protecão
        var horasTotais = (tempoProtecao/60/60|0)           // TimeDiffHours Totais - Tempo de uso da protecão em Horas
        var minTotais = (tempoProtecao/60|0);               // TimeDiffMinutes Totais - Tempo de uso em minutos da protecão
        var horas = (horasTotais - (dias*24));              // TimeDiffHours - Tempo de uso da protecão em horas dentro de 24H
        var minutos = (minTotais - (horasTotais * 60));     // TimeDiffMinutes - Tempo de uso da protecão em minutos dentro de 60Min
        var segundos = (tempoProtecao - (minTotais*60));    // TimeDiffSeconds - Tempo de uso da protecão em segundos dentro de 60Segundos

        // Calcula o valor conumido baseado no tempo de uso. 
        if (segundos >= 30){
            valorConsumido = (Math.ceil(tempoProtecao/60))*valorMinuto;
            console.log(`desligarProtecao - 2 - ${userEmail} - ${firstName} -  Segundos Maior que 30: ${segundos}s`);
        } else if (segundos < 30) {
            valorConsumido = (Math.floor(tempoProtecao/60))*valorMinuto;
            console.log(`desligarProtecao - 2 - ${userEmail} - ${firstName} -  Segundos Menor que 30: ${segundos}s`);
        }
        var data
        let pegarDadosDb = () => {
            
            return new Promise((resolve, reject) => {
                // Recupera os dados no DB para garantir a confiabilidade
                dbRef.once('value').then(snapshot => {
                    data = snapshot.val()   

                    console.log(`pegarDadosDb - desligarProtecao - 3 - ${userEmail} - ${firstName} -  Dados recuperados do DB. ${JSON.stringify(data)}.`);

                    perfilUser.saldoCreditos = data.saldoCreditos - valorConsumido                          // 
                    perfilUser.saldoDinheiro = (data.saldoDinheiro - (valorConsumido/1000)).toFixed(4) 
                    return resolve(data)

                    }).catch(error =>{
                        console.error(new Error(`desligarProtecao - 3 - ${userEmail} - ${firstName} -  Erro ao recuperar dados. ${error}`));
                        console.error(new Error(error))
                        reject(error)
                    });
                })
        }
        await pegarDadosDb()
        var date = new Date()
        // Objeto com dados do desligamento da proteção
        var logUso = {
            finalProtecao: `${finalProtecao} - ${diaSemana} - ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} - ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
            valorconsumido: valorConsumido,
            tempoUso: `${dias} dias : ${horas} horas : ${minutos} minutos : ${segundos} segundos`,
            saldoFinal: perfilUser.saldoCreditos
        };

        // Atualiza no DB estado da protecão, Saldo em créditos e em dinheiro
        let attPerfilUser = new Promise((resolve, reject) => {
            
            // Salva no banco de dados o resultado do desligamento e atualiza o banco de dados
            dbRef.update({
                saldoCreditos: perfilUser.saldoCreditos,
                saldoDinheiro: perfilUser.saldoDinheiro,
                estadoProtecao: estadoProtecao,
            }).then(() =>{
                console.log(`desligarProtecao - 5 - ${userEmail} - ${firstName} -  Consumo do desligamento salvo no banco.`);
                return resolve(true)
            }).catch(error =>{
                console.error(new Error(`desligarProtecao - 5 - ${userEmail} - ${firstName} -  Erro ao slavar dados de encerramento da protecão no banco de dados. ${error}`));
                console.error(new Error(error))
                reject(error)
            });
        })

        // Atualiza no DB o log de uso do desligamento
        let attLogUsoPerfilUser = new Promise((resolve, reject) => {
            // atualizar log de uso
            dbRef.child(`/logUse/${numeroAtivacoes}`).update(logUso).then(() =>{
                console.log(`desligarProtecao - 6 - ${userEmail} - ${firstName} -  Log de uso atualizado no banco`);
                return resolve(true);
            }).catch(error =>{
                console.error(new Error(`desligarProtecao - 6 - ${userEmail} - ${firstName} -  Erro ao atualizar log de uso. ${error}`));
                console.error(new Error(error))
                reject(error)
            });
        })

        const executaDesligarProtecao = (response) => {
            console.log(`executaDesligarProtecao - 1 - desligarProtecao - ${userEmail} - ${firstName} - Funcão que executa as promises de att do DB.`);
                
                Promise.all([attPerfilUser, attLogUsoPerfilUser]).then(() => {
                    console.log(`executaDesligarProtecao - 2 - desligarProtecao - ${userEmail} - ${firstName} - Promises executadas. Desligando protecão.`);
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
                    console.error(new Error(`2 - executaDesligarProtecao - desligarProtecao - ${userEmail} - ${firstName} -  Erro ao executar promises. Protecão não desligada ${error}`))
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

        await executaDesligarProtecao(response)     
    }

    // Checa numero de indicações do usuário que está ligando a protecão e premia
    const verificaIndicacao = () => {
        return new Promise((resolve) => {
            console.log(`verificaIndicacao - 1 - ${userEmail} - ${firstName} -  Verificando indicacões.`);
            
            var data;
            let verificaUserIndicacao = new Promise((resolve, reject) => {
                    // recupera dados do usuário no Banco de dados
                    dbRef.once('value').then(snapshot => {
                        data = snapshot.val();
                        console.log(`verificaIndicacao - 2 - ${userEmail} - ${firstName} -  Dados do Usuário recuperado: ${data.usuariosIndicados} indicados. recebeu promocão: ${data.recebeuPromocao}`);
                        return resolve(data)
                    }).catch(error => {
                        console.error(new Error(`verificaIndicacao - 2 - ${userEmail} - ${firstName} -  Erro ao recuperar usuário na base de dados. ${error}`))
                        console.error(new Error(error))
                        reject(error)
                    })
            })

            // faz as tratativas de acordo com o numero de indicacões
                console.log(`executaVerificaUserIndicacao - LigarProtecão - ${userEmail} - ${firstName} -  trazendo dados do usuário`);
            verificaUserIndicacao.then(result => {
                console.log(`executaVerificaUserIndicacao - 1 - ligaProtecão - ${userEmail} - ${firstName} -  Dados do User. ${result}.`);
                
                // checa se número de indicados atingiu mais de 10 pela primeira vez
                // Se o usuário atingiu os requisitos necessários para receber o prênmio
                if (parseInt(result.usuariosIndicados) >= 10 && result.recebeuPromocao === false) {
                    console.log(`executaVerificaUserIndicacao - 2 - ligarProtecão${userEmail} - ${firstName} -  Usuário vai receber prêmio por indicacão.`);
                    var creditoPlus = result.saldoCreditos + 1000000;
                    var saldoPlus = parseFloat(result.saldoDinheiro) + 1000;

                    // Atualiza dados do usuário no banco de dados
                        dbRef.update({
                        saldoCreditos: creditoPlus,
                        saldoDinheiro: saldoPlus,
                        recebeuPromocao: true
                        }).then( () => {
                            console.log(`executaVerificaUserIndicacao - 3 - ligaProtecão - ${userEmail} - ${firstName} -  Crédito, saldo e status da promocão atualizados no banco.`);
                            receberPremio = true
                            console.log(`executaVerificaUserIndicacao - 4 - ${userEmail} - ${firstName} -  Finaliza premiacão e a ativacão da protecão.`);
                            console.log("*** Verificacão do indicador feita completamente no servidor. ***")

                            // Adicionar os valores atualizados para as variáveis de usuário
                            return response.json({
                                "set_attributes":
                                {
                                    "status-protecao": estadoProtecao,
                                    "numAtivacao": numeroAtivacoes,
                                    "timeStart": inicioProtecao,
                                    "user-credit": creditoPlus,
                                    "user-money": saldoPlus,
                                    "afiliados": result.usuariosIndicados
                                },
                                "redirect_to_blocks": [
                                    "receber-promo"
                                ]
                            })
                        }).catch(error => {
                            console.error(new Error(`executaVerificaUserIndicacao - 3 - ${userEmail} - ${firstName} -  Erro ao atualizar ganho de prêmio no banco. ${error}`))
                            console.error(new Error(error))
                            numeroAtivacoes -= 1
                            response.json({
                                "messages": [
                                    {
                                        "text": `Olá! Identifiquei um pequeno erro. Não consegui executar sua premiação. Preciso que você tente novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
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
                            })
                        })

                // Caso usuário não tenha atingido os requisitos para receber prêmio
                } else if (result.usuariosIndicados < 10 || result.recebeuPromocao === true){
                    console.log(`executaVerificaUserIndicacao - 2 - ligarProtecão - ${userEmail} - ${firstName} -  Não tem requisitos para receber promocão: ${result.usuariosIndicados} indicados, recebeu promo: ${result.recebeuPromocao}`);
                    console.log("*** Verificacão do indicador feita completamente no servidor. ***")                    
                    resol(receberPremio = false)
                }

                return receberPremio, result;
            }).catch(error => {
                console.error(new Error(`executaVerificaUserIndicacao - 1 - LigarProtecão - ${userEmail} - ${firstName} - Erro ao tentar recuperar dados do User ${error} - Status: ${error.status}`))
                numeroAtivacoes -= 1
                response.json({
                        "messages": [
                            {
                                "text": `Olá! Identifiquei um pequeno erro. Não consegui recuperar seus dados em nosso servidor. Preciso que você reinforme suas informações e tente novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
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
                    })
            })
        })
    }

    // Protecão desligada. Liga a Protecão
    if (estadoProtecao === "OFF" && numeroAtivacoes >= 1){

        // Liga a protecão, verifica a quantidade de indicacões e retorna para o chat
        ligarProtecao().then(result =>{ 
                // Liga a protecão no banco de dados, atualiza o log de uso.
            return // verificaIndicacao()   // Verifica se user tem qrequisitos para receber premio por indicacão e premia
        }).then(() =>{
            console.log("*** Retorno Imediato ***")
            return response.json({       // Retorna para o chat 
                "messages": [
                    {
                        "text": "Sua proteção está ativada!"
                    },
                    {
                        "text": `Verificacão de vairáveis: Status: ${estadoProtecao}, Numero de aticacões: ${numeroAtivacoes} e TimeStart: ${inicioProtecao}.`
                    }
                ],
                "set_attributes":
                    {
                        "status-protecao": estadoProtecao,
                        "numAtivacao": numeroAtivacoes,
                        "timeStart": inicioProtecao,
                    },
                "redirect_to_blocks": [
                    "Pós On"
                ]
            })
        }).catch(error =>{
            console.error(new Error(`executaLigarProtecao - ligarProtecao - 2 - ${userEmail} - ${firstName} -  Erro ao executar promises. Protecão não Ligada ${error}`))
            response.json(falhaLigar)
        })
            
    } else if (estadoProtecao === "ON" && numeroAtivacoes >= 1) {
        desligarProtecao();
    }

    //primeira ativacão
    if (numeroAtivacoes === 0) {
        console.log(`PrimeiraAtivação - 1 - ${userEmail} - ${firstName} -  Primeira ativacão.`);
        
        ligarProtecao().then((result) => {
            console.log("*** Retorno Imediato ***")
            return response.json({
                "messages": [
                    {
                        "text": `Verificacão de vairáveis: Status: ${estadoProtecao}, Numero de aticacões: ${numeroAtivacoes} e TimeStart: ${inicioProtecao}.`
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
        
    }
})

// Funcão para calculo de gastos anuais
exports.botSimulacao = functions.https.onRequest((request, response) => {
    console.log(`1 - ${request.query["first name"]} - ${request.query["messenger user id"]} - Bot de simuacão :   ${JSON.stringify(request.query)}`);

    // dados do usuário
    const userId = request.query["messenger user id"];
    const firstName = request.query["first name"];

    // Dados do veículo
    const carValue = request.query["car-value-sim"];
    const horasUsoDia = request.query["horasUso-sim"];
    const valorSeguro = request.query["valorSeguro-sim"];
    const valorSemSeguro = request.query["valorSemSeguro-sim"];
    console.log('valorSemSeguro: ', valorSemSeguro);
    console.log('valorSeguro: ', valorSeguro);


    var checaValor = carValue.toString();

    // Checa se valor informado é válido
    if (checaValor.includes(".") || checaValor.includes(",")) {
        console.log(`2 - ${userEmail} - ${firstName} -  usuário informou valor no modelo errado! ${carValue}`);
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
    
    var valorMinuto = calculaGasto(carValue, response);
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
            "valorMinRS-sim": valorMinRS
        }
    });

});

exports.criaPerfilCompleto = functions.https.onRequest((request, response) => {
    console.log(`${request.query["first name"]} - ${request.query["messenger user id"]} - 1 - Cria perfil completo do user:   ${JSON.stringify(request.query)}`);

    // dados do usuário
    const userId = request.query["messenger user id"];
    const firstName = request.query["first name"];
    const userEmail = request.query["email_address"];
    const lastName = request.query["last name"];
    const indicador = request.query["indicador"];
    const timezone = request.query["timezone"];

    // Dados do veículo
    const carValue = request.query["car-value"];
    const carModel = request.query["car-model"];
    const carPlate = request.query["car-plate"];
    var urlWp = `https://onsurance.me/wp-json/wc/v2/customers?email=${userEmail}&consumer_key=ck_f56f3caf157dd3384abb0adc66fea28368ff22f4&consumer_secret=cs_b5df2c161badb57325d09487a5bf703aad0b81a4`
    console.log('urlWp: ', urlWp);

    // Referencia do Banco de dados
    // const dbRefIndicadorUser = admin.database().ref('/users').child(indicador);
    // const indicadorPromise = admin.database().ref('/indicadores').child(indicador);

    var checaValor = carValue.toString();

     // Objeto de perfil do user
     var perfilUsuario = {
        messengerId: userId,
        firstName: firstName,
        lastName: lastName,
        userEmail: userEmail,
        carModel: carModel,
        carPlate: carPlate,
        carValue: carValue,
        qtdAtivacao: 0,
        idCliente: "",
        usuariosIndicados: 0,
        estadoProtecao: "OFF",
        indicador: indicador,
        timezone: timezone,
    }

    // Checa se valor informado é válido
    if (checaValor.includes(".") || checaValor.includes(",")) {
        console.log(`2 - ${userEmail} - ${firstName} -  usuário informou valor no modelo errado! ${carValue}`);
        console.error(new Error(`2 - ${userEmail} - ${firstName} -  usuário informou valor no formato errado! ${carValue}`));
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

    console.log(`2 - ${userEmail} - ${firstName} - 2 - Calcula minuto da protecão.`);
    var valorMinuto = calculaGasto(carValue, response);

    var dataApi;
    // Recupera o id de cliente no Woocommerce
    const pegaIdCliente = () => {
        console.log(`pegaIdCliente - 1 - ${userEmail} - ${firstName} - Pega id do cliente Woocommerce`)
        
        // Contém a chamada de api que pega o ID de cliente no WP
        let requestWoo =  new Promise((resolve, reject) => {
            console.log(`requestWoo - 1 - pegaIdCliente - ${userEmail} - ${firstName} -  GET Request para pegar o id do cliente WP via Api.`);

            // Do async job
            var apiRequest = unirest("GET", urlWp);
            
            apiRequest.end(res => {
                if (res.error){
                    console.error(new Error(`requestWoo - 2 - pegaIdCliente - ${userEmail} - ${firstName} - Falha em recuperar ID: ${JSON.stringify(res.error)}`))
                    reject(res.error)

                    // Array do perfil de cliente Vazio ou não existe (geralmente acontece com Admin do WP)
                } else if (res.body[0] === undefined || res.length === 0) {
                    console.error(new Error(`2 - requestWoo - 2 - pegaIdCliente - ${userEmail} - ${firstName} - Falha em recuperar ID Array vazio: ${JSON.stringify(res)}`))
                    reject(res)
                } else {
                    console.log(`requestWoo - 2 - pegaIdCliente - ${userEmail} - ${firstName} - Consulta de ID feita com sucesso: ${res.body[0].id}`);
                    dataApi = res.body[0].id;
                    perfilUsuario.idCliente = dataApi
                    console.log(`requestWoo - 3 - pegaIdCliente - ${userEmail} - ${firstName} -  Informacões do usuário no woocommerce. ${JSON.stringify(res.body)}`);
                    resolve(dataApi)
                }
                            
            })
                    
        })

        //Chama a promise que recupera o ID do cliente no WP. Faz a tratativa pro usuário em caso de erro
        requestWoo.then(result => {
                console.log(`ExecuteRequestWoo - 1 - pegaIdCliente - ${userEmail} - ${firstName} -  Id de cliente recuperado com sucesso. ${result}. Var dataApi: ${dataApi}`);
                return criaPerfilUser()
        }).catch(error => {
                console.error(new Error(`ExecuteRequestWoo - 1 - pegaIdCliente - ${userEmail} - ${firstName} - Erro ao tentar recuperar id de cliente ${error} - Status: ${error.status}`))
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

    // Cria perfil do usuário usando ID de cliente Woocommerce como Chave primária
    const criaPerfilUser = () => {
        console.log(`executaCriaPerfilUser - 2 - ${userEmail} - ${firstName} - ID recuperado, criando pefil. DataAPI: ${dataApi}`)

        const dbRef = admin.database().ref('/users').child(dataApi);

        // Recuperar dados do usuário para checar se pré perfil foi criado
        let checaPerfilDb = new Promise((resolve, reject) => {
            dbRef.once('value').then(snapshot => {
                var perfilUser = snapshot.val()

                return resolve(perfilUser)

            }).catch( error => {
                console.error(new Error(`checaPerfilDB - 1 - criaPerfilUser - ${userEmail} - ${firstName} - Erro ao tentar recuperar perfil de Usuário ${error}.`))
                console.error(new Error(error))
                reject(error)
            })
        })

        checaPerfilDb.then(result => {
                console.log(`gravaPerfilDb - 1 - ${userEmail} - ${firstName} - Resultado da consulta de perfil. ${JSON.stringify(result)}`)
                perfilUser = result
                if (!result) {      // Não existem dados do perfil do usuário no sistema
                    console.error(new Error(`gravaPerfilDb - 2 - criaPerfilUser - ${userEmail} - ${firstName} - Usuário sem perfil. Result: ${JSON.stringify(perfilUser)}.`))
                    console.error(new Error(error)) // Como Tratar? Retorna* pro bot
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
                } else {
                    console.log(`gravaPerfilDb - 2 - criaPerfilUser - ${userEmail} - ${firstName} - Usuário com perfil Result: ${JSON.stringify(perfilUser)}.`) // Como Tratar? Retorna* pro bot
                    return dbRef.update(perfilUsuario).then(result => {
                        console.log(`gravaPerfilDb - 3 - ${userEmail} - ${firstName} - Perfil gravado com sucesso no DB.`)
                        return response.json({
                            "messages": [
                                {
                                "text": `Opa ${firstName}! Terminei de verificar seus dados com sucesso e já posso começar a te proteger. Antes que eu me esqueça, valor da sua protecão vai ser de R$${valorMinuto/1000} ou ${valorMinuto} créditos por minuto. Está pronto pra começar?`
                                },
                                {
                                    "text": `Opa ${firstName}! Créditos: ${perfilUser.saldoCreditos}. Saldo R$: ${perfilUser.saldoDinheiro}. Id cliente: ${dataApi}.`
                                }
                            ],
                            "set_attributes":
                            {
                                "valorMinuto": valorMinuto,
                                "user-credit": perfilUser.saldoCreditos,
                                "user-money": perfilUser.saldoDinheiro,
                                "idCliente": dataApi
                            },
                            "redirect_to_blocks": [
                                "welcome"
                            ]
                        });
                    }).catch(error => {
                        console.error(new Error(`gravaPerfilDb - 3 - ${userEmail} - ${firstName} - Falha ao criar perfil. ${error}`))
                        console.error(new Error(error))
                        response.json({
                            "messages": [
                                {
                                    "text": `Olá! Identifiquei um pequeno erro. Não consegui grava seu perfil em nosso servidor. Preciso que você reinforme seus dados e tente novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
                                }
                            ],
                            "redirect_to_blocks": [
                                "Informar Email"
                            ]
                        })
                    })
                }
                return true
        }).catch(error => {
            console.error(new Error(`gravaPerfilDb - 1 - ${userEmail} - ${firstName} - Erro ao consultar perfil de usuário. ${error}`))
            console.error(new Error(error))
        })

    }

    pegaIdCliente()

})

exports.simLigaDesliga = functions.https.onRequest((request, response) =>{
    console.log(`1 - ${request.query["messenger user id"]} - Entrando na funcão Liga/Desliga a protecão:  ${JSON.stringify(request.query)}`);

       // Dados do usuário
       const userId = request.query["messenger user id"];
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

            var valorMinutoSim = calculaGasto(carValue, response)

            response.json({
                "messages": [
                    {
                        "text": `Parabéns pela primeira ativação de sua proteção simulada. O custo da sua proteção é de ${valorMinutoSim} créditos por minuto. Baseado nesse valor, você tem aproximadamente ${(10000/valorMinutoSim).toFixed(0)} minutos para simular a proteção do seu veículo. Aproveite bastante.`
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

        } else if (numAtivacao >1 && userCredit < 300) { // pouco crédito
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
    console.log('wooRequest: ', wooRequest);
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
                    console.log(`Preco do produto:${JSON.parse(value.price)}`);

                valorCrédito = JSON.parse(value.price) + valorCrédito
                console.log('valorCrédito: ', valorCrédito);
            }
        }
        console.log(`Valor total da compra para créditos: ${valorCrédito}`);

        const billing = wooRequestParsed.billing
        console.log('billing: ', billing);
        
        const clienteId = wooRequestParsed.customer_id  
        console.log('clienteId: ', clienteId);
        const firstName = billing.first_name
        console.log('firstName: ', firstName);
        const lastName = billing.last_name
        console.log('lastName: ', lastName);
        const email = billing.email
        console.log('email: ', email);

        const perfilUser = {
        lastName: lastName,
        recebeuPromocao: false,
        saldoCreditos: (valorCrédito * 1000),
        saldoDinheiro: valorCrédito,
        userEmail: email,
        userName: firstName
        }
        
        // Referencia do Banco de dados
        const promise = admin.database().ref('/users').child(clienteId);
        
        const resposta = response.json({
            "messages": [
                {
                    "text": `Olá ${firstName}! Retorno de webhook.`
                }
            ]
        })
        // Checar existência de usuário no banco de dados

            // Contém a chamada de promise que checa se já existe o User
            const checaUserDb = () => {
                console.log(`1 checaUserDb - ${email} - ${firstName} -  Estrando na promise que checa se existe o usuário indicador`);
            
                return new Promise((resolve, reject) =>{
                    // Pega no banco de dados o usuário que fez a indicação para realizar as acões necessáriis
                    promise.once('value').then(snapshot => {
                    data = snapshot.val();
                    return resolve(data); 
                    }).catch(error => {
                        console.error(new Error(`2 - checaUserDb - ${email} - ${firstName} -  Erro ao receber dados do comprador. ${error}`))
                        console.error(new Error(error))
                        reject(error)
                    })
                })
            }
        
            // Executa a promise que checa se existe User. 
            const executaChecaUserDb = (response) => {
                console.log(`1 - executaChecaUserDb - ${email} - ${firstName} -  executando promise que checa se já existe USER no Bando de Dados.`);
                var checaUser = checaUserDb();
                checaUser.then(result => {
                console.log(`2 - executaChecaUserDb - ${email} - ${firstName} - Checagem efetuada com sucesso. ${JSON.stringify(result)}. Indo para as tratativas.`);
                
                // checa se existe indicador no banco 
                    // Indicador não existe !Result
                    if (!result){
                        //caso não exista cria na tabela indicadores
                        console.log(`3 - executaChecaUserDb - ${email} - ${firstName} -  User não existe na base. ${JSON.stringify(result)}. Chamando a funcão de criar indicador no DB.`);  
                        // !result -> não existe usuário indicador
                        
                            // Contém a chamada de promise que cria um novo indicador no DB
                            const criaPerfilDb = () => {
                                console.log(`1 - criaPerfilDb - ${email} - ${firstName} -  Estrando na promise que cria o perfil do usuário`);
                            
                                return new Promise((resolve, reject) =>{
                                    // cria perfil de usuário no banco de dados de indicador  
                                    promise.set(perfilUser).then(() =>{
                                        console.log(`2 - criaPerfilDb - ${email} - ${firstName} -  User criado com sucesso.`);
                                        return resolve(true);
                                    }).catch(error => {
                                        console.error(new Error(`2 - criaPerfilDb - ${email} - ${firstName} -  Erro ao criar usuário. ${error}`))
                                        console.error(new Error(error))
                                        reject(error)
                                    })
                                })
                            }       
        
                            //Chama a promise que salva os dados no banco de dados. Faz a tratativa pro usuário em caso de erro
                            const executaCriaPerfilDb = (response) =>{
                                console.log(`1 - criaPerfilIndicadorDb - criaNovoUsuario - ${email} - ${firstName} -  Executando na promise que cria perfil de Indicador no Bando de Dados.`);
        
                                var criaPerfil = criaPerfilDb();
                                criaPerfil.then(result => {
                                    console.log(`2 - executaCriaPerfilDb - ${email} - ${firstName} - User criado com sucesso no banco de dados.`);
                                    return resposta;
                                }).catch(error => {
                                    console.error(new Error(`2 - executaCriaPerfilDb - ${email} - ${firstName} - User não foi gravado no Banco de Dados. Erro: ${error}`))
                                    console.error(new Error(error))
                                })
                            }
        
                            executaCriaPerfilDb(response)
        
                        // Usuário indicador existe na base dados
                    } else if (result){
        
                        // caso exista, atualiza o numero de indicadores e adiciona um elemento no array
                        console.log(`3 - executaChecaUserDb - ${email} - ${firstName} -  User já existe na base. ${JSON.stringify(result)}`);
                        console.log(`4 - executaChecaUserDb - ${email} - ${firstName} -  Saldo de creditos: ${result.saldoCreditos}, Saldo dinheiro: ${result.saldoDinheiro}`);
        
                        var saldoCreditos = parseFloat(result.saldoCreditos + perfilUser.saldoCreditos)
                        var saldoDinheiro = parseFloat(result.saldoDinheiro + perfilUser.saldoDinheiro)
            
                        // Result. Existe indicador no banco de dados
                            // promise para atualizar o numero de indicados no DB INDICADOR.
                        var atualizaSaldo =  new Promise((resolve, reject) =>{
                            console.log(`1 - atualizaSaldo - ${email} - ${firstName} - Entrando na promise para atualizar o saldo após compra.`);
        
                            //Atualiza o numero de indicados (indicadores)
                            promise.update({
                                saldoCreditos: saldoCreditos,
                                saldoDinheiro: saldoDinheiro
                            }).then(() =>{
                                console.log(`2 - atualizaSaldo - ${email} - ${firstName} -  Saldo User atualizado com sucesso.`);
                                return resolve(true);
                            }).catch(error => {
                                console.error(new Error(`2 - atualizaSaldo - ${email} - ${firstName} -  Erro ao atualizar o saldo. ${error}`))
                                console.error(new Error(error))
                                reject(error)
                            })
                        })
                            
                            const executaPromises = (response) => {
                                
                            console.log(`1 - executaPromises - ${email} - ${firstName} - Entrando na funcão que executa as promises quando existe Usuário.`);
                                
                                Promise.all([atualizaSaldo]).then((result) => {
                                    console.log('result: ', result);
                                    console.log(`2 - executaPromises - ${email} - ${firstName} - Promises executadas com sucesso.`);
                                    return resposta;
                                }).catch(error => {

                                    console.error(new Error(`2 - executaPromises - ${email} - ${firstName} -  Erro ao executar todas as promises. ${error}`))
                                    console.error(new Error(error))
                                    return error;

                                })
        
                            }
                            
                            executaPromises(response)
                    }
                    
                    return ;
                }).catch(error => {
                    console.error(new Error(`2 - executaChecaUserDb - ${email} - ${firstName} - Saldo não foi gravado no Banco de Dados. Erro: ${error}`))
                    console.error(new Error(error))
                    return response.json({
                        "messages": [
                            {
                                "text": "Erro maldito"
                            }
                        ]
                    });
                })
            }
            executaChecaUserDb(response)
        // Dados do usuário
        //    console.log(`4 - resposta do request ${userEmail}`)

    } else {
        console.log("status de ordem não concluida ainda");
        response.json({
            "messages": [
                {
                    "text": `Status de ordem: ${wooRequestParsed.status}`
                }
            ]
        })
    }


})


// Checa numero de indicações e premia se usuário atingir requisitos
const premioIndicacao = (userEmail, promise, receberPremio, estadoProtecao, numeroAtivacoes, inicioProtecao, firstName, response, ) => {
    console.log(`premioIndicacao - 1 - ${userEmail} - ${firstName} -  Funcão de premiacão por numero de indicacão`);
    
    var data;
    // recupera dados do usuário no Banco de dados
    promise.once('value').then(snapshot => {
        data = snapshot.val();
        console.log(`premioIndicacao - 2 - ${userEmail} - ${firstName} -  Dados do Usuário recuperado: ${data.usuariosIndicados} indicados. recebeu promocão: ${data.recebeuPromocao}`);

        // checa se número de indicados atingiu mais de 10 pela primeira vez
        // Se o usuário atingiu os requisitos necessários para receber o prênmio
        if (parseInt(data.usuariosIndicados) >= 10 && data.recebeuPromocao === false) {
            console.log(`premioIndicacao - 3 - ${userEmail} - ${firstName} -  Usuário vai receber prêmio por indicacão.`);
            var creditoPlus = data.saldoCreditos + 1000000;
            var saldoPlus = parseFloat(data.saldoDinheiro) + 1000;

            // Atualiza dados do usuário no banco de dados
            promise.update({
                saldoCreditos: creditoPlus,
                saldoDinheiro: saldoPlus,
                recebeuPromocao: true
            }).then( () => {
                console.log(`premioIndicacao - 6 - ${userEmail} - ${firstName} -  Crédito, saldo e status da promocão atualizados no banco.`);
                return;
            }).catch(error => {
                console.error(new Error(`premioIndicacao - 6 - ${userEmail} - ${firstName} -  Erro ao atualizar ganho de prêmio no banco. ${error}`))
                console.error(new Error(error))
            })

            // Adicionar os valores atualizados para as variáveis de usuário
            console.log(`premioIndicacao - 8 - ${userEmail} - ${firstName} -  Finaliza premiacão e a ativacão da protecão.`);
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
            console.log(`premioIndicacao - 4 - ${userEmail} - ${firstName} -  Não tem requisitos para receber promocão: ${data.usuariosIndicados} indicados, recebeu promo: ${data.recebeuPromocao}`);
            receberPremio = false;
            console.log(`premioIndicacao - 5 - ${userEmail} - ${firstName} -  Ligando protecão.`);
    
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
        console.error(new Error(`premioIndicacao - 2 - ${userEmail} - ${firstName} -  Erro ao recuperar usuário na base de dados. ${error}`))
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


exports.getrequest = functions.https.onRequest((request, response) => {


    const userEmail = request.query["email_address"];
    var urlWp = `https://onsurance.me/wp-json/wc/v2/customers?email=${userEmail}&consumer_key=ck_f56f3caf157dd3384abb0adc66fea28368ff22f4&consumer_secret=cs_b5df2c161badb57325d09487a5bf703aad0b81a4`
    console.log('urlWp: ', urlWp);
    var dataApi;
    var req = unirest("GET", urlWp);

    req.headers({
        "Postman-Token": "3718fc34-5403-44a6-92d8-38fb70ab48e9",
        "Cache-Control": "no-cache"
      });
      
    req.end(res => {
        if (res.error){
            console.error(new Error(` Falha em recuperar ID: ${JSON.stringify(res.error)}`))
            response.json({
                "messages": [
                    {
                        "text": `responsta Unirest ${res.error}`
                    }
                ]
            })

            // Array do perfil de cliente Vazio ou não existe (geralmente acontece com Admin do WP)
        } else if (res.body[0] === undefined || res.length === 0) {
            console.error(new Error(`Falha em recuperar ID Array vazio: ${JSON.stringify(res)}`))
            console.error(new Error(res.body))
            response.json({
                "messages": [
                    {
                        "text": `responsta Unirest ${dataApi}`
                    }
                ]
            })
        } else {
            console.log(`Consulta de ID feita com sucesso: ${res.body[0].id}`);
            dataApi = res.body[0].id;
            console.log(`Informacões do usuário no woocommerce. ${JSON.stringify(res.body)}`);
            response.json({
                "messages": [
                    {
                        "text": `responsta Unirest ${dataApi}`
                    }
                ]
            })
        }
                    
    })

})

