const functions = require('firebase-functions');

 // Initialize Firebase
 const admin = require('firebase-admin');

 const axios = require('axios');
 var unirest = require("unirest");



admin.initializeApp({
    apiKey: "AIzaSyD8RCBaeju-ieUb9Ya0rUSJg9OGtSlPPXM",
    authDomain: "onsuranceme-co.firebaseapp.com",
    databaseURL: "https://onsuranceme-co.firebaseio.com",
    projectId: "onsuranceme-co",
    storageBucket: "onsuranceme-co.appspot.com",
    messagingSenderId: "241481831218"
  });

  var tokenWallet = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvb25zdXJhbmNlLm1lIiwiaWF0IjoxNTMxODQ1MTIxLCJuYmYiOjE1MzE4NDUxMjEsImV4cCI6MTUzMjQ0OTkyMSwiZGF0YSI6eyJ1c2VyIjp7ImlkIjoiMyJ9fX0.I1zSaaug4A25w5Co-C1-sUdwtBQqQ0Nw23L-htE42dk'

// Função que pega os atributos no chatfuel e identifica se Proteção está On / Off
exports.ligaDesligaProtecao = functions.https.onRequest((request, response) => {
    console.log(`ligaDesligaProtecao - 1 - ${request.query["chatfuel user id"]} - Entrando na funcão Liga/Desliga a protecão:  ${JSON.stringify(request.query)}`);

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
    const ESTADOPROTEÇÃOCARRO = request.query["ESTADOPROTEÇÃOCARRO"];
    var estadoProtecao = ESTADOPROTEÇÃOCARRO.toString();
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
        estadoProtecao: ESTADOPROTEÇÃOCARRO,
        valorMinuto: valorMinuto,
        usuariosIndicados: 0,
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
        console.log(`getDate - 1 - ${userId} - ${firstName} - Iniciando funcão para pegar o dia da semana`);
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
        console.log(`getDate - 2 - ${userId} - ${firstName} - Data e dia da semana recebidos com sucesso: ${data}, ${diaSemana}`);
        return data;        
    }

    // Funcão para acionar a protecão
    const ligarProtecao = () => {
        console.log(`ligarProtecao - 1 - ${userId} - ${firstName} -  Ligando proteção`);

        // Gera timeStamp do inicio da protecão
        inicioProtecao = Date.now()/1000|0;
        estadoProtecao = "ON-H";
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
        promise.update({
            qtdAtivacao: numeroAtivacoes,
            estadoProtecao: estadoProtecao,
        }).then(() => {
            console.log(`ligarProtecao - 2 - ${userId} - ${firstName} -  usuário atualizado com sucesso no banco de dados`);
            return;
        }).catch(error => {
            console.error(`ligarProtecao - 2 - Erro na atualizacão do usuário no banco ${error}`);
        });
        // Atualiza o log de uso no banco de dados
        promise.child(`/logUse/${numeroAtivacoes}`).update(logUso).then( () => {
            console.log(`ligarProtecao - 3 - ${userId} - ${firstName} -  Log de uso atualizado com sucesso no banco de dados`);
            return;
        }).catch(error => {
            console.error(`ligarProtecao - 3 - ${userId} - ${firstName} -  Erro na atualizacão do log de uso no banco de dados. ${error}`);
        });
      
        console.log(`ligarProtecao - 4 - ${userId} - ${firstName} -  Final da funcão de ligar protecão`);
    };

    const desligarProtecao = () => {
        console.log(`desligarProtecao - 1 - ${userId} - ${firstName} -  Inicio da funcão desligar proteção`);
        // Desliga a proteção, alterando o atributo ESTADOPROTEÇÃOCARRO do chatfuel
        estadoProtecao = "OFF-H";
        getDate(Date.now());
        // Pega o tempo do desligamento
        // Criando minha própria funcão de tempo
        var finalProtecao = Date.now()/1000|0;
        var tempoProtecao = finalProtecao - timeStart; // TimeDiff
        var dias = (tempoProtecao/60/60/24|0); // TimeDiffDays
        var horasTotais = (tempoProtecao/60/60|0); // TimeDiffHours Totais
        var minTotais = (tempoProtecao/60|0); // TimeDiffMinutes Totais
        var horas = (horasTotais - (dias*24)); // TimeDiffHours
        var minutos = (minTotais - (horas * 60)); // TimeDiffMinnutes
        var segundos = (tempoProtecao - (minTotais*60)); // TimeDiffSeconds

            console.log(`desligarProtecao - 2 - ${userId} - ${firstName} -  tempo de proteão maior que 2 minutos: ${tempoProtecao/60|0}`);
            // Calcula o valor conumido baseado no tempo de uso. 
            if (segundos >= 30){
                valorConsumido = (Math.ceil(tempoProtecao/60))*valorMinuto;
                console.log(`desligarProtecao - 3 - ${userId} - ${firstName} -  Segundos Maior que 30: ${segundos}`);
            } else if (segundos < 30) {
                valorConsumido = (Math.floor(tempoProtecao/60))*valorMinuto;
                console.log(`desligarProtecao - 4 - ${userId} - ${firstName} -  Segundos Menor que 30: ${segundos}`);
            }
        
        perfilUser.saldoCreditos = userCredit - valorConsumido;
        perfilUser.saldoDinheiro = (userMoney - (valorConsumido/1000)).toFixed(3); 
        console.log(`desligarProtecao - 4.5 - ${userId} - ${firstName} -  Valor consumido calculado com sucesso. ${valorConsumido}`);

        // Objeto com dados do desligamento da proteção
        var logUso = {
            finalProtecao: `${finalProtecao} - ${diaSemana} - ${data.getDate()}/${data.getMonth()+1}/${data.getFullYear()} - ${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`,
            valorconsumido: valorConsumido,
            tempoUso: `${dias} dias : ${horas} horas : ${minutos} minutos : ${segundos} segundos`,
            saldoFinal: perfilUser.saldoCreditos
        };

        // Salva no banco de dados o resultado do desligamento e atualiza o banco de dados
        promise.update({
            saldoCreditos: perfilUser.saldoCreditos,
            saldoDinheiro: perfilUser.saldoDinheiro,
            estadoProtecao: estadoProtecao,
        }).then(() =>{
            console.log(`desligarProtecao - 5 - ${userId} - ${firstName} -  Dados de consumo no desligamento da protecão salvos com sucesso no banco de dados.`);
            return;
        }).catch(error =>{
            console.error(`desligarProtecao - 5 - ${userId} - ${firstName} -  Erro ao slavar dados de encerramento da protecão no banco de dados. ${error}`);
        });

        // atualizar log de uso
        promise.child(`/logUse/${numeroAtivacoes}`).update(logUso).then(() =>{
            console.log(`desligarProtecao - 6 - ${userId} - ${firstName} -  Log de uso atualizado com sucesso no banco`);
            return;
        }).catch(error =>{
            console.error(`desligarProtecao - 6 - ${userId} - ${firstName} -  Erro ao atualizar log de uso. ${error}`);
        });

        // Desconta saldo na woowallet ao realizar o desligamento
        // post method para descontar na carteira o valor consumido.
        console.log(`7 - desligarProtecão - ${userId} - ${firstName} -   Entrando no Post para descontar saldo da carteira. Id cliente: ${idCliente}`);
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
                console.error(`DesligarProteção - 8 - ${userId} - ${firstName} -  Desconto não realizado: ${JSON.stringify(res.error)}`);
            } else {
                console.log(`DesligarProteção - 8 - ${userId} - ${firstName} -  Desconto feito com sucesso na carteira: ${JSON.stringify(res.body)}`);
            }
        });
            
        console.log(`desligarProtecao - 9 - ${userId} - ${firstName} -  Indo para resposta Json. Final da funcão`);
        response.json({
            "messages": [
                {
                    "text": "Vamos desligar sua proteção."
                }
            ],
            "set_attributes":
                {
                    "ESTADOPROTEÇÃOCARRO": estadoProtecao,
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
    }

    // Checa estado da proteção - Liga / Desliga
    console.log(`ligaDesligaProtecao - 2 - ${userId} - ${firstName} -  Checa estado da protecão para acompanhamento de fluxo: ${estadoProtecao}`);
    console.log(`ligaDesligaProtecao - 3 - ${userId} - ${firstName} -  Checa Número de ativacões para acompanhamento de fluxo: ${numeroAtivacoes}`);

    // Protecão desligada. Liga a Protecão
    if (estadoProtecao === "OFF-H" && numeroAtivacoes >= 1){
        console.log(`ligaDesligaProtecao - 4 - ${userId} - ${firstName} -  Protecão desligada e número de ativacões maior que 0. ${numeroAtivacoes}`);

        // Chama a funcão de ligar a protecão
        ligarProtecao();

        // Inicia verificacão para premiacão do usuário por 10 indicacões
        var receberPremio = false;
        // Chama funcão de premiacão e de resposta 
        premioIndicacao(userId, promise, receberPremio, estadoProtecao, numeroAtivacoes, inicioProtecao, firstName, response)    

    //Protecão ligada. Desliga a proteão
    } else if (estadoProtecao === "ON-H" && numeroAtivacoes >= 1) {
        console.log(`ligaDesligaProtecao - 4 - ${userId} - ${firstName} -  Protecão ligada e número de ativacões maior que 0. ${numeroAtivacoes}`); 
        desligarProtecao();
    }

    //primeira ativacão
    if (numeroAtivacoes === 0) {
        console.log(`ligaDesligaProtecao - 4 - ${userId} - ${firstName} -  Primeira ativacão do usuário.`);

        criaNovoUsuario(perfilUser, userId, promise, indicadorPromise, promiseIndicadorUser, urlWp, response, firstName);
        ligarProtecao();
        console.log(`ligaDesligaProtecao - 5 final - ${userId} - ${firstName} -  Proteção ativada. Indo para retorno JSON.`);
        promise.once('value').then(snapshot => {
            var data = snapshot.val() 
            return response.json({
                "messages": [
                    {
                        "text": `Olá ${firstName}, essa é sua primeira ativação. Seja bem vindo à Onsurance. Amamos você.`
                    }
                ],
                "set_attributes":
                    {
                        "ESTADOPROTEÇÃOCARRO": estadoProtecao,
                        "numAtivacao": numeroAtivacoes,
                        "timeStart": inicioProtecao,
                        "user-credit": data.saldoCreditos,
                        "user-money": data.saldoDinheiro,
                        "idCliente": data.idCliente
                    },
                    "redirect_to_blocks": [
                        "Mensagem de boas vindas primeira proteção"
                    ]
            });
        }).catch(error => {
            console.error(`Falha ao recuperar user ${error}`);
        })
        
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
                "text": `Conforme suas respostas, o valor do minuto da proteção é de R$${valorMinuto/1000}. Você liga para proteger, desliga para economizar. No seu caso de uso o custo médio da proteção será de R$${consumoAnual} ao ano.`,
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
        response.json({
            "set_attributes":
            {
                "valorCorreto-sim": false,
            },
            "messages": [
                {
                    "text": `O formato digitado está incorreto, por favor digite sem utilizar pontos ou vírgulas. Ex: "55000".`,
                }
            ],
            "redirect_to_blocks": [
                "Informar Dados Faltantes"
            ]
        });
    }


    var perfilUser = {};

    console.log(`2 - ${userId} - ${firstName} - Entrando na funcão de calculo do minuto.`);
    var valorMinuto = calculaGasto(carValue);

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
const criaNovoUsuario = (perfilUser, userId, promise, indicadorPromise, promiseIndicadorUser, urlWp, response, tokenWallet, firstName) => {
    console.log(`criaNovoUsuario - 1 - ${userId} - ${firstName} -  Entra na funcão de criar novo usuário`);
    var perfilIndicador = {
        numeroIndicados: 1,
        indicados: {
            1: userId
        }
    }
    // cria perfil do usuário que está ligando a protecão    
    promise.update(perfilUser).then( () => {
        console.log(`criaNovoUsuario - 2 - ${userId} - ${firstName} -  Usuário criado com sucesso`);
        return;
    }).catch(error => {
        console.error(`criaNovoUsuario - 2 - ${userId} - ${firstName} -  Erro na cricão do usuário ${error}`);
    })
    pegaIdCliente(userId, perfilUser, promise, urlWp, tokenWallet, firstName)

    var data;
    // Pega no banco de dados o usuário que fez a indicação para realizar as acões necessáriis
    indicadorPromise.once('value').then(snapshot => {
        data = snapshot.val();

    // pega usuário indicador
        console.log(`criaNovoUsuario - 3 - ${userId} - ${firstName} -  Dados do usuário indicador: ${JSON.stringify(data)}`);
            // checa se existe indicador no banco 
            if (!data){

                //caso não exista cria na tabela indicadores
                console.log(`criaNovoUsuario - 4 - ${userId} - ${firstName} -  Indicador não existe na base. ${JSON.stringify(data)}`);

                indicadorPromise.set(perfilIndicador).then(() =>{
                    console.log(`criaNovoUsuario - 5 - ${userId} - ${firstName} -  Indicador criado com sucesso.`);
                    return;
                }).catch(error => {
                    console.error(`criaNovoUsuario - 5 - ${userId} - ${firstName} -  Erro ao criar usuário indicador. ${error}`);
                })

                // atualiza o numero de indicados na tabela de usuários
                promiseIndicadorUser.update({
                    usuariosIndicados: 1
                }).then(() =>{
                    console.log(`criaNovoUsuario - 6 - ${userId} - ${firstName} -  Número de indicados atualizado com sucesso`);
                    return;
                }).catch(error => {
                    console.error(`criaNovoUsuario - 6 - ${userId} - ${firstName} -  Erro ao atualizar usuário indicador. ${error}`);
                })
                
                // Usuário indicador existe na base dados
            } else if (data){

                // caso exista, atualiza o numero de indicadores e adiciona um elemento no array
                console.log(`criaNovoUsuario - 4 - ${userId} - ${firstName} -  Indicador já existe na base. ${JSON.stringify(data)}`);
                console.log(`criaNovoUsuario - 5 - ${userId} - ${firstName} -  Numero de indicados: ${data.numeroIndicados}`);

                var numIndicados = parseInt(data.numeroIndicados) + 1;

                //Atualiza o numero de indicados (indicadores)
                indicadorPromise.update({
                    numeroIndicados: numIndicados
                }).then(() =>{
                    console.log(`criaNovoUsuario - 6 - ${userId} - ${firstName} -  Número de usuários indicados atualizado com sucesso.`);
                    return;
                }).catch(error => {
                    console.error(`criaNovoUsuario - 6 - ${userId} - ${firstName} -  Erro ao atualizar o número pessoas indicadas. ${error}`);
                })

                // Atualiza o array com os clientes indicados (indicadores)
                indicadorPromise.child(`/indicados/${numIndicados}`).set(userId).then(() =>{
                    console.log(`criaNovoUsuario - 7 - ${userId} - ${firstName} -  Usuário adicionado ao array com sucesso.`);
                    return;
                }).catch(error => {
                    console.error(`criaNovoUsuario - 7 - ${userId} - ${firstName} -  Erro ao adicionar usuário ao array de pessoas indicadas. ${error}`);
                });
    
                // atualiza o numero de indicados no bando de usuários (users)
                promiseIndicadorUser.update({
                    usuariosIndicados: numIndicados
                }).then(() =>{
                    console.log(`criaNovoUsuario - 8 - ${userId} - ${firstName} -  Número de indicados atualizado com sucesso`);
                    return;
                }).catch(error => {
                    console.error(`criaNovoUsuario - 8 - ${userId} - ${firstName} -  Erro ao atualizar o número de indicados na tabela Users. ${error}`);
                })
            }

        return data; 
    }).catch(error => {
        console.error(`criaNovoUsuario - 3 - ${userId} - ${firstName} -  Erro ao receber dados do indicador. ${error}`);
    })
    console.log(`criaNovoUsuario - 4/9 - ${userId} - ${firstName} -  Final da funcão de criar novo usuário`);
}

// Checa numero de indicações e premia se usuário atingir requisitos
const premioIndicacao = (userId, promise, receberPremio, estadoProtecao, numeroAtivacoes, inicioProtecao, firstName, response, carModel) => {
    console.log(`premioIndicacao - 1 - ${userId} - ${firstName} -  Entrando na funcão de premiacão por numero de indicacão`);
    
    var data;
    // recupera dados do usuário no Banco de dados
    promise.once('value').then(snapshot => {
        data = snapshot.val();
        console.log(`premioIndicacao - 2 - ${userId} - ${firstName} -  Dados do Usuário recuperado: ${JSON.stringify(data)}`);
        console.log(`premioIndicacao - 3 - ${userId} - ${firstName} -  Usuário com: ${data.usuariosIndicados} indicados`);

        // checa se número de indicados atingiu mais de 10 pela primeira vez
        // Se o usuário atingiu os requisitos necessários para receber o prênmio
        if (parseInt(data.usuariosIndicados) >= 10 && data.recebeuPromocao === false) {
            console.log(`premioIndicacao - 4 - ${userId} - ${firstName} -  Usuário com mais de 10 indicados: ${data.usuariosIndicados}`);
            var creditoPlus = data.saldoCreditos + 1000000;
            var saldoPlus = parseFloat(data.saldoDinheiro) + 1000;

            console.log(`premioIndicacao - 5 - ${userId} - ${firstName} -  Iniciando o crédito na woowaleet. IdCliente: ${data.idCliente}`);
            
            // Faz a conexão com o woowallet e credita 1000 reais
            var req = unirest("post", `https://onsurance.me/wp-json/wp/v2/wallet/${data.idCliente}`);

            req.query({
            "type": "credit",
            "amount": 1000000,
            "details": `Parabéns ${firstName}, você acaba de ganhar Um milhão de créditos por indicar a Onsurance para pelo menos 10 pessoas. Agora vc pode proteger seu ${carModel} por muito mais tempo.`
            });
            
            req.headers({
            "Authorization": `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvb25zdXJhbmNlLm1lIiwiaWF0IjoxNTI5OTQ5ODAxLCJuYmYiOjE1Mjk5NDk4MDEsImV4cCI6MTUzMDU1NDYwMSwiZGF0YSI6eyJ1c2VyIjp7ImlkIjoiMzMifX19._En-wPDp0XXYfqiVAq7A9sQcbdT5htvde-CvQjgY_4o`
            });
            
            req.end(res => {
                if (res.error){
                    console.error(`premioIndicacao - 6 - ${userId} - ${firstName} -  Prêmio de indicacão não creditado com sucesso: ${JSON.stringify(res.error)}`);
                } else {
                    console.log(`premioIndicacao - 7 - ${userId} - ${firstName} -  Prêmio de indicacão creditado com sucesso!!!: ${JSON.stringify(res.body)}`);
                    receberPremio = true;
                }
            });

            // Atualiza dados do usuário no banco de dados
            promise.update({
                saldoCreditos: creditoPlus,
                saldoDinheiro: saldoPlus,
                recebeuPromocao: true
            }).then( () => {
                console.log(`premioIndicacao - 8 - ${userId} - ${firstName} -  Crédito, saldo e status da promocão atualizados com sucesso`);
                return;
            }).catch(error => {
                console.error(`premioIndicacao - 8 - ${userId} - ${firstName} -  Erro ao atualizar dados do prêmio de indicacão. ${error}`);
            })

            // receberPremio = true;
            console.log('receberPremio: ', receberPremio);
           
            // Adicionar os valores atualizados para as variáveis de usuário
            console.log(`premioIndicacao - 9 - ${userId} - ${firstName} -  Usuário qualificado para receber prêmio por indicacão.`);
            console.log(`premioIndicacao - 10 - ${userId} - ${firstName} -  Finaliza premiacão e a ativacão da protecão e manda a resposta.`);
            response.json({
                "set_attributes":
                {
                    "ESTADOPROTEÇÃOCARRO": estadoProtecao,
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
            console.log(`premioIndicacao - 4 - ${userId} - ${firstName} -  Usuário com menos de 10 indicados ou já recebeu a promocão: ${data.usuariosIndicados}, ${data.recebeuPromocao}`);
            receberPremio = false;
            console.log(`premioIndicacao - 5 - ${userId} - ${firstName} -  Finaliza a ativacão da protecão e manda a resposta.`);
    
                response.json({
                    "messages": [
                        {
                            "text": `Olá ${firstName}, vamos ativar sua proteção.`
                        }
                    ],
                    "set_attributes":
                    {
                        "ESTADOPROTEÇÃOCARRO": estadoProtecao,
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
        console.error(`premioIndicacao - 2 - ${userId} - ${firstName} -  Erro ao recuperar usuário na base de dados. ${error}`);
    })

    console.log(`premioIndicacao - 5 ${userId} - ${firstName} -  Atributo de receber prêmio: ${receberPremio}.`);
    console.log(`premioIndicacao - 6 ${userId} - ${firstName} -  Final da funcão de premiar usuário por indicacão`);
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
                        "text": "Ainda não estamos trabalhando com veículos nessa faixa de preço, por favor entre em contato com nossa equipe de suporte."
                    }
                ]
            })
        }


        console.log("valor do minuto", valorMinuto);
        return valorMinuto;

}

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
                        console.error(`2 - promiseWpClientRequest - pegaIdCliente - ${userId} - ${firstName} - Falha em recuperar ID: ${JSON.stringify(res.error)}`);
                        reject(res.error)
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
            console.error(error);
            response.json({
                    "messages": [
                        {
                            "text": `Olá! Identifiquei um pequeno erro. Não consegui recuperar seus dados em nosso servidor. Preciso que você reinforme seus dados e tente novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista". ${error}`
                        }
                    ],
                    "redirect_to_blocks": [
                        "Informar Email Homologação"
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
                    console.error(`2 - promiseWalletApiRequest - pegaSaldoCarteira - ${userId} - ${firstName} - Falha em pegar o saldo: ${JSON.stringify(res.error)}`);
                    reject(res.error)
                } else {
                    console.log(`2 - promiseWalletApiRequest - pegaSaldoCarteira - ${userId} - ${firstName} - Consulta de saldo feito com sucesso na carteira: ${JSON.stringify(res.body)}`);
                    perfilUser.saldoCreditos = parseInt(res.body.toString())
                    perfilUser.saldoDinheiro = (perfilUser.saldoCreditos/1000).toFixed(3)
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
            promise.update({
                saldoCreditos: perfilUser.saldoCreditos,
                saldoDinheiro: perfilUser.saldoDinheiro,
                idCliente: dataApi
            }).then(() => {
                console.log(`2 - promiseGravaSaldoDb - pegaSaldoCarteira - ${userId} - ${firstName} - Adicão de saldo feito com sucesso no banco.`);
                return resolve(true);
            }).catch(error => {
                console.error(`2 - promiseGravaSaldoDb - pedaSaldoCarteira - ${userId} - ${firstName} - Falha na atualizacão do bando de dados. Saldo desatualizado ${error}`);
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
                      "text": `Olá ${firstName}! Terminei de verificar seus dados com sucesso e já posso começar a te proteger. Antes que eu me esqueça, valor do minuto da sua protecão vai ser de R$${valorMinuto/1000} (menos de um centavo) por minuto ou ${valorMinuto} créditos por minuto. Está pronto pra começar?`
                    }
                ]
            });
        }).catch(error => {
            console.error(`2 - gravaSaldoDb - pegaSaldoCarteira - ${userId} - ${firstName} - Saldo não foi gravado no Banco de Dados. Erro: ${error}`);
            response.json({
                    "messages": [
                        {
                          "text": `Olá! Identifiquei um pequeno erro. Não consegui atualizar as informações no banco de dados. Preciso que você reinforme seus dados e tente novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista". ${error}`
                        }
                    ],
                    "redirect_to_blocks": [
                        "Informar Email Homologação"
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
            console.error(error);
            response.json({
                    "messages": [
                        {
                          "text": `Olá! Identifiquei um pequeno erro. Não consegui recuperar seu saldo em nosso servidor. Preciso que você reinforme seus dados e tente novamente. Se o problema persistir entre em contato com nosso especialista digitando "falar com especialista". ${error}`
                        }
                    ],
                    "redirect_to_blocks": [
                        "Informar Email Homologação"
                    ]
            })
        })
    }

    // Execucão da funcão
    walletApiRequest(response);
}
