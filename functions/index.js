const functions = require('firebase-functions');
const admin = require('firebase-admin')
const unirest = require("unirest");
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
    var userDbId = crypto.createHash('md5').update(userEmail).digest("hex");
    const dbRef = admin.database().ref('/users').child(userDbId);

    var numeroAtivacoes = parseInt(numAtivacao);
    var valorConsumido = 0;

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
            let atualizaStatus = () =>{
                dbRef.update({
                    qtdAtivacao: numeroAtivacoes,
                    estadoProtecao: estadoProtecao,
                }).then(() => {
                    console.log(`ligarProtecao - 2 - ${userEmail} - ${firstName} -  Status atualizado no banco.`)
                    return atualizaLog()
                }).catch(error => {
                    console.error(new Error(`ligarProtecao - 2 - Erro ao atualizar usuário no banco ${error}`));
                    numeroAtivacoes -= 1
                    response.json(falhaLigar)
                })
            }

            let atualizaLog = () => {
                dbRef.child(`/logUse/${numeroAtivacoes}`).update(logUso).then( () => {
                    console.log(`ligarProtecao - 3 - ${userEmail} - ${firstName} -  Log de uso atualizado no banco.`);
                    console.log("*** Protecão completamente ligada no servidor. ***")
                    sucessoLigar = { 
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
                    }
                    return resolve()
                }).catch(error => {
                    console.error(new Error(`ligarProtecao - 3 - ${userEmail} - ${firstName} -  Erro ao atualizar log de uso no banco. ${error}`));
                    numeroAtivacoes -= 1                    
                    response.json(falhaLigar)
                })
            }
            atualizaStatus()
        })
    }  

    // Funcão para desativar a protecão
    const desligarProtecao = () => {

        return new Promise((resolve, reject) => {
            console.log(`desligarProtecao - 1 - ${userEmail} - ${firstName} -  Desligando Protecão`);
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
                
                // Recupera os dados no DB para garantir a confiabilidade
                dbRef.once('value').then(snapshot => {
                    data = snapshot.val()   

                    console.log(`pegarDadosDb - desligarProtecao - 3 - ${userEmail} - ${firstName} -  Dados recuperados do DB.`);

                    perfilUser.saldoCreditos = data.saldoCreditos - valorConsumido                          // 
                    perfilUser.saldoDinheiro = parseFloat((data.saldoDinheiro) - (valorConsumido/1000)).toFixed(4)
                    var sucessoDesligar = {
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
                    }
                    var date = new Date()
                    // Objeto com dados do desligamento da proteção
                    var logUso = {
                        finalProtecao: `${finalProtecao} - ${diaSemana} - ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} - ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
                        valorconsumido: valorConsumido,
                        tempoUso: `${dias} dias : ${horas} horas : ${minutos} minutos : ${segundos} segundos`,
                        saldoFinal: perfilUser.saldoCreditos
                    }
                    return atualizaPerfilUser(logUso, perfilUser, sucessoDesligar)

                    }).catch(error =>{
                        console.error(new Error(`desligarProtecao - 3 - ${userEmail} - ${firstName} -  Erro ao recuperar dados. ${error}`));
                        reject(error)
                    });
            }
            

            // Atualiza no DB estado da protecão, Saldo em créditos e em dinheiro
            let atualizaPerfilUser = (logUso, perfilUser, sucessoDesligar) => {
                
                // Salva no banco de dados o resultado do desligamento e atualiza o banco de dados
                dbRef.update({
                    saldoCreditos: perfilUser.saldoCreditos,
                    saldoDinheiro: parseFloat(perfilUser.saldoDinheiro),
                    estadoProtecao: estadoProtecao,
                }).then(() =>{
                    console.log(`desligarProtecao - 4 - ${userEmail} - ${firstName} -  Consumo do desligamento salvo no banco. ${JSON.stringify(perfilUser)}`);
                    return atualizaLogUso(logUso, sucessoDesligar)
                }).catch(error =>{
                    console.error(new Error(`desligarProtecao - 4 - ${userEmail} - ${firstName} -  Erro ao slavar dados de encerramento da protecão no banco de dados. ${error}`));
                    reject(error)
                });
            }

            // Atualiza no DB o log de uso do desligamento
            let atualizaLogUso = (logUso, sucessoDesligar) => {
                // atualizar log de uso
                dbRef.child(`/logUse/${numeroAtivacoes}`).update(logUso).then(() =>{
                    console.log(`desligarProtecao - 6 - ${userEmail} - ${firstName} -  Log de uso atualizado no banco. `);
                    return resolve(sucessoDesligar);
                }).catch(error =>{
                    console.error(new Error(`desligarProtecao - 6 - ${userEmail} - ${firstName} -  Erro ao atualizar log de uso. ${error}`));
                    reject(error)
                });
            }

            pegarDadosDb()
        }) 
    }

    // Checa numero de indicações do usuário que está ligando a protecão e premia
    const verificaIndicacao = () => {
        return new Promise((resolve, reject) => {
            console.log(`verificaIndicacao - 1 - ${userEmail} - ${firstName} -  Verificando indicacões.`);
            
            var data;
            let verificaUserIndicacao = () => {
                    // recupera dados do usuário no Banco de dados
                    dbRef.once('value').then(snapshot => {
                        data = snapshot.val();
                        console.log(`verificaIndicacao - 2 - ${userEmail} - ${firstName} -  Dados do Usuário recuperado: ${data.usuariosIndicados} indicados. recebeu promocão: ${data.recebeuPromocao}`);
                        return executaPremiacao(data)
                    }).catch(error => {
                        console.error(new Error(`verificaIndicacao - 2 - ${userEmail} - ${firstName} -  Erro ao recuperar usuário na base de dados. ${error}`))
                        numeroAtivacoes -= 1                        
                        reject(response.json(falhaLigar))
                    })
            }

            let executaPremiacao = result => {
                // checa se número de indicados atingiu mais de 10 pela primeira vez
                // Se o usuário atingiu os requisitos necessários para receber o prênmio
                if (parseInt(result.usuariosIndicados) >= 10 && result.recebeuPromocao === false) {
                    console.log(`executaVerificaUserIndicacao - 2 - ligarProtecão - ${userEmail} - ${firstName} -  Usuário vai receber prêmio por indicacão.`);
                    var creditoPlus = result.saldoCreditos + 1000000
                    var saldoPlus = (parseFloat(result.saldoDinheiro) + 1000).toFixed(4)

                    adicionaPromocao(creditoPlus, saldoPlus, result)

                // Caso usuário não tenha atingido os requisitos para receber prêmio
                } else if (result.usuariosIndicados < 10 || result.recebeuPromocao === true){
                    console.log(`executaVerificaUserIndicacao - 2 - ligarProtecão - ${userEmail} - ${firstName} -  Não tem requisitos para receber promocão: ${result.usuariosIndicados} indicados, recebeu promo: ${result.recebeuPromocao}`);
                    console.log("*** Verificacão do indicador feita completamente no servidor. ***")                    
                    receberPremio = false
                    resolve(receberPremio)
                }
            }

            let adicionaPromocao = (creditoPlus, saldoPlus, result) => {
                // Atualiza dados do usuário no banco de dados
                dbRef.update({
                    saldoCreditos: creditoPlus,
                    saldoDinheiro: saldoPlus,
                    recebeuPromocao: true
                    }).then(() => {
                        console.log(`executaVerificaUserIndicacao - 3 - ligaProtecão - ${userEmail} - ${firstName} -  Crédito, saldo e status da promocão atualizados no banco.`);
                        receberPremio = true
                        console.log(`executaVerificaUserIndicacao - 4 - ${userEmail} - ${firstName} -  Finaliza premiacão e a ativacão da protecão.`);
                        console.log("*** Verificacão do indicador feita completamente no servidor. ***")
                        console.log("*** Retorno Imediato Messenger User recebendo promocão indocacão ***")
                        // Adicionar os valores atualizados para as variáveis de usuário
                        return resolve(
                            response.json({
                            "set_attributes":
                                {
                                    "status-protecao": "ON",
                                    "numAtivacao": result.qtdAtivacao,
                                    "timeStart": inicioProtecao,
                                    "user-credit": creditoPlus,
                                    "user-money": saldoPlus,
                                    "afiliados": result.usuariosIndicados
                                },
                                "redirect_to_blocks": [
                                    "receber-promo"
                                ]
                            })
                        )
                    }).catch(error => {
                        console.error(new Error(`executaVerificaUserIndicacao - 3 - ${userEmail} - ${firstName} -  Erro ao atualizar ganho de prêmio no banco. ${error}`))
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
            return verificaIndicacao()   // Verifica se user tem requisitos para receber premio por indicacão e premia
        }).then(() => {
            console.log("*** Retorno Imediato Messenger ***")
            return response.json(sucessoLigar)
        }).catch(error =>{
            console.error(new Error(`executaLigarProtecao - ligarProtecao - 2 - ${userEmail} - ${firstName} -  Erro ao executar promises. Protecão não Ligada ${error}`))
            numeroAtivacoes -= 1
            response.json(falhaLigar)
        })
            
    } else if (estadoProtecao === "ON" && numeroAtivacoes >= 1) {

        desligarProtecao().then(result =>{
            console.log("*** Retorno Imediato Messenger ***")
            return response.json(result)
        }).catch(error => {
            console.error(new Error(`DesligarProtecão - 2 - ${userEmail} - ${firstName} -  Erro ao executar promise. Protecão não desligada ${error}`))
            perfilUser.saldoCreditos = data.saldoCreditos + valorConsumido                          // 
            perfilUser.saldoDinheiro = (data.saldoDinheiro + (valorConsumido/1000)).toFixed(4)
            dbRef.update({
                saldoCreditos: perfilUser.saldoCreditos,
                saldoDinheiro: parseFloat(perfilUser.saldoDinheiro),
                estadoProtecao: 'ON',
            }).then(() =>{
                console.log(`desligarProtecao - 4 - ${userEmail} - ${firstName} -  Consumo do desligamento salvo no banco. ${JSON.stringify(perfilUser)}`);
                return response.json(falhaDesligar)
            }).catch(error =>{
                console.error(new Error(`desligarProtecao - 4 - ${userEmail} - ${firstName} -  Erro ao slavar dados de encerramento da protecão no banco de dados. ${error}`));
            });
        })
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

    // Referencia do Banco de dados
    var userDbId = crypto.createHash('md5').update(userEmail).digest("hex");
    console.log('userDbId: ', userDbId);
    var indicadorDbId = crypto.createHash('md5').update(indicador).digest("hex");
    const dbRef = admin.database().ref('/users').child(userDbId);
    const dbRefIndicadorUser = admin.database().ref('/users').child(indicadorDbId);
    const dbRefIndicador = admin.database().ref('/indicadores').child(indicadorDbId);
    

    var checaValor = carValue.toString();

     // Objeto de perfil do user
     var perfilUsuario = {
        messengerId: userId,
        lastName: lastName,
        carModel: carModel,
        carPlate: carPlate,
        carValue: carValue,
        qtdAtivacao: 0,
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

    console.log(`2 - ${userEmail} - ${firstName} - Calcula minuto da protecão.`);
    var valorMinuto = calculaGasto(carValue, response);

    var data;
    var perfilUser;
    var perfilIndicador = {
        usuariosIndicados: 1,
        indicados: {
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

            // Cria perfil do usuário usando ID de cliente Woocommerce como Chave primária            
            let criaPerfilUser = perfilUser => {
                if (!perfilUser.idCliente) {      // Não existem dados do perfil do usuário no sistema
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
                } else if (perfilUser.idCliente) {
                    console.log(`criaPerfilUser - 1 - ${userEmail} - ${firstName} - Usuário com perfil: ${JSON.stringify(perfilUser)}.`) // Como Tratar? Retorna* pro bot
                    dbRef.update(perfilUsuario).then(() => {
                        console.log(`criaPerfilUser - 2 - ${userEmail} - ${firstName} - Perfil gravado com sucesso no DB.`)
                        return resolve(true)
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
                    console.log(`checaPerfilIndicador - 1 - ${userEmail} - ${firstName} - resultado checagem ${data}`)
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
                    var numIndicados = parseInt(data.usuariosIndicados) + 1
                    atualizaIndicador(numIndicados)
                }
            }

            // Caso exista o perfil, atualiza o número de indicados
            let atualizaIndicador = numIndicados => {
                dbRefIndicador.update({
                    usuariosIndicados: numIndicados
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
                dbRefIndicador.child(`/indicados/${numIndicados}`).set(userEmail).then(() =>{
                    console.log(`atualizaArrayIndicador - 1 - ${userEmail} - ${firstName} -  Usuário adicionado ao array.`);
                    return atualizaUserIndicador(numIndicados)
                }).catch(error => {
                    console.error(new Error(`atualizaArrayIndicador - 1 - ${userEmail} - ${firstName} -  Erro ao adicionar usuário ao array. ${error}`))
                    reject(error)
                });
            }

            //Caso nnao exista, cria o perfil do indicador.
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
                    usuariosIndicados: numIndicados
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
                "text": `Opa ${firstName}! Terminei de verificar seus dados com sucesso e já posso começar a te proteger. Antes que eu me esqueça, valor da sua protecão vai ser de R$${valorMinuto/1000} ou ${valorMinuto} créditos por minuto. Está pronto pra começar?`
                },
                {
                    "text": `Opa ${firstName}! Créditos: ${perfilUser.saldoCreditos}. Saldo R$: ${perfilUser.saldoDinheiro}. Id cliente: ${perfilUser.idCliente}.`
                }
            ],
            "set_attributes":
            {
                "valorMinuto": valorMinuto,
                "user-credit": perfilUser.saldoCreditos,
                "user-money": perfilUser.saldoDinheiro,
                "idCliente": perfilUser.idCliente
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
                    "text": `Olá! Identifiquei um pequeno erro. Não consegui recuperar seus dados em nosso servidor. Preciso que você reinforme suas informações e tente novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista".`
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
    const wooRequestParsed = JSON.parse(wooRequest)
    console.log('Resposta do request Parsed: ', wooRequestParsed);
    const lineItems = wooRequestParsed.line_items
    console.log('Itens comprados pelo usuário: ', lineItems);
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
        valorCrédito = parseFloat(valorCrédito)
        console.log(`Valor total da compra para créditos: ${valorCrédito}`);

        const billing = wooRequestParsed.billing
        const clienteId = wooRequestParsed.customer_id  
        console.log('clienteId: ', clienteId);
        const firstName = billing.first_name
        console.log('firstName: ', firstName);
        const lastName = billing.last_name
        console.log('lastName: ', lastName);
        const email = billing.email
        console.log('email: ', email);
        var userDbId = crypto.createHash('md5').update(email).digest("hex");
        const perfilUser = {
            lastName: lastName,
            recebeuPromocao: false,
            saldoCreditos: (valorCrédito * 1000),
            saldoDinheiro: valorCrédito,
            userEmail: email,
            userName: firstName,
            idCliente: clienteId,
            usuariosIndicados: 0
            }  
     
        // Referencia do Banco de dados
        const dbRef = admin.database().ref('/users').child(userDbId);

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
                    } else if (data.idCliente) {
                        // caso exista, atualiza o numero de indicadores e adiciona um elemento no array
                        console.log(`acaoPerfil - 1 - ${email} - ${firstName} -  User já existe na base. ${JSON.stringify(data)}`);
                        console.log(`acaoPerfil - 2 - ${email} - ${firstName} -  Saldo de creditos: ${data.saldoCreditos}, Saldo dinheiro: ${data.saldoDinheiro}`);
                        var saldoCreditos = parseFloat(data.saldoCreditos + (valorCrédito * 1000))
                        var saldoDinheiro = parseFloat(data.saldoDinheiro) + valorCrédito
                        console.log('novo saldoDinheiro: ', saldoDinheiro);
                        console.log('novo saldoCreditos: ', saldoCreditos); 
                        atualizaSaldo(saldoCreditos, saldoDinheiro)  
                        
                    } else if (!data.idCliente) {
                        console.log(`acaoPerfil - 1 - ${email} - ${firstName} -  User existe na base. Mas não tinha comprado ainda${JSON.stringify(data)}.`)
                        perfilUser.usuariosIndicados = data.usuariosIndicados
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
                        saldoCreditos: saldoCreditos,
                        saldoDinheiro: saldoDinheiro
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
    const userEmail = request.query["email_address"]

    var hashString = crypto.createHash('md5').update(userEmail).digest("hex");
    const cipher = crypto.createCipher('aes192', 'senhaLouca');

let encrypted = cipher.update('some clear text data', 'utf8', 'hex');
encrypted += cipher.final('hex');
console.log(encrypted);
    console.log(hashString)
    response.json({
        "messages": [
            {
                "text": `String em hash: ${hashString}, ${encrypted}`
            }
        ]
    })
})

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
