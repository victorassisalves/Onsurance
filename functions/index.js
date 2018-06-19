const functions = require('firebase-functions');

const firebase = require("firebase");

 // Initialize Firebase
 const admin = require('firebase-admin');

admin.initializeApp({
    apiKey: "AIzaSyDXehFd5rJfnIH3dgLBHoOc_O5R7D3IuHw",
    authDomain: "onsurance-co.firebaseapp.com",
    databaseURL: "https://onsurance-co.firebaseio.com",
    projectId: "onsurance-co",
    storageBucket: "onsurance-co.appspot.com",
    messagingSenderId: "1087999485424"
  });

// Função que pega os atributos no chatfuel e identifica se Proteção está On / Off
exports.ligaDesligaProtecao = functions.https.onRequest((request, response) => {
    console.log(`ligaDesligaProtecao - 1 - ${request.query["chatfuel user id"]} - Entrando na funcão Liga/Desliga a protecão:  ${JSON.stringify(request.query)}`);

    // Recebe os parâmetros do chatfuel

    // Dados do usuário
    const userId = request.query["chatfuel user id"];
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

/* -----------------------//----------------------//-------------------// -------------------- */

    var numeroAtivacoes = parseInt(numAtivacao);
    var valorConsumido = 0;

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
        saldoCreditos: userCredit,
        saldoDinheiro: userMoney,
        valorMinuto: valorMinuto,
        usuariosIndicados: 0,
        indicador: indicador,
        recebeuPromocao: false
    }

    // Recebe dia da semana e data completa
    var data;
    var inicioProtecao;
    var diaSemana;
    const getDate = (date) =>{
        console.log(`getDate - 1 - ${userId} - Iniciando funcão para pegar o dia da semana`);
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
        console.log(`getDate - 2 - ${userId} - Data e dia da semana recebidos com sucesso: ${data}, ${diaSemana}`);
        return data;        
    }

    // Funcão para acionar a protecão
    const ligarProtecao = () => {
        console.log(`ligarProtecao - 1 - ${userId} - Ligando proteção`);

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
        }


        // Atualiza o banco de dados do usuário
        promise.update({
            qtdAtivacao: numeroAtivacoes,
            estadoProtecao: estadoProtecao,
        }).then( () => {
            console.log(`ligarProtecao - 2 - ${userId} - usuário atualizado com sucesso`);
            return null;
        }).catch(error => {
            console.log(`ligarProtecao - 2 - Erro na cricão do usuário ${error}`);
        });
        promise.child(`/logUse/${numeroAtivacoes}`).update(logUso).then( () => {
            console.log(`ligarProtecao - 3 - ${userId} - Log de uso atualizado com sucesso`);
            return null;
        }).catch(error => {
            console.log(`ligarProtecao - 3 - ${userId} - Erro na criacão do usuário ${error}`);
        });


        console.log(`ligarProtecao - 4 - ${userId} - Final da funcão de ligar protecão`);
        
    };

    const desligarProtecao = () => {
        console.log(`desligarProtecao - 1 - ${userId} - desligar proteção`);
        // Desliga a proteção, alterando o atributo ESTADOPROTEÇÃOCARRO do chatfuel
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
        var minutos = (minTotais - (horas * 60)); // TimeDiffMinnutes
        var segundos = (tempoProtecao - (minTotais*60)); // TimeDiffSeconds

        // Checa se a protecão está ligada a mais de 2 minutos
        if (tempoProtecao <= 120 ){
            console.log(`desligarProtecao - 2 - ${userId} - tempo de protecao menor que 2 minutos: ${tempoProtecao/60|0}`);

            valorConsumido = valorMinuto*2;
            console.log(`desligarProtecao - 3 - ${userId} - valorConsumido para tempo menor que 2 minutos: ${valorConsumido}`);

        } else if( tempoProtecao > 120) {
            console.log(`desligarProtecao - 2 - ${userId} - tempo de proteão maior que 2 minutos: ${tempoProtecao/60|0}`);
            // Calcula o valor conumido baseado no tempo de uso. 
            if (segundos >= 30){
                valorConsumido = (Math.ceil(tempoProtecao/60))*valorMinuto;
                console.log(`desligarProtecao - 3 - ${userId} - Segundos Maior que 30: ${segundos}`);
            } else if (segundos < 30) {
                valorConsumido = (Math.floor(tempoProtecao/60))*valorMinuto;
                console.log(`desligarProtecao - 4 - ${userId} - Segundos Menor que 30: ${segundos}`);
            }
        }


        
        perfilUser.saldoCreditos = userCredit - valorConsumido;
        perfilUser.saldoDinheiro = (userMoney - (valorConsumido/1000)).toFixed(3); 

        console.log(`desligarProtecao - 4.5 - ${userId} - Valor consumido calculado com sucesso. ${valorConsumido}`);

        // Objeto com dados do desligamento da proteção
        var logUso = {
            finalProtecao: `${finalProtecao} - ${diaSemana} - ${data.getDate()}/${data.getMonth()+1}/${data.getFullYear()} - ${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`,
            valorconsumido: valorConsumido,
            tempoUso: `${dias} dias : ${horas} horas : ${minutos} minutos : ${segundos} segundos`,
        };

        // Salva no banco de dados o resultado do desligamento e atualiza o banco de dados
        promise.update({
            saldoCreditos: perfilUser.saldoCreditos,
            saldoDinheiro: perfilUser.saldoDinheiro,
            estadoProtecao: estadoProtecao,
        }).then(() =>{
            console.log(`desligarProtecao - 5 - ${userId} - Dados de consumo no desligamento da protecão salvos com sucesso no banco de dados.`);
            return;
        }).catch(error =>{
            console.error(`desligarProtecao - 5 - ${userId} - Erro ao slavar dados de encerramento da protecão no banco de dados. ${error}`);
        });

        // atualizar log de uso
        promise.child(`/logUse/${numeroAtivacoes}`).update(logUso).then(() =>{
            console.log(`desligarProtecao - 6 - ${userId} - Log de uso atualizado com sucesso no banco`);
            return;
        }).catch(error =>{
            console.error(`desligarProtecao - 6 - ${userId} - Erro ao atualizar log de uso. ${error}`);
        });

        console.log(`desligarProtecao - 7 - ${userId} - Indo para resposta Json`);
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
                    "timeDiffDays": dias,
                    "timeDiffHours": horas,
                    "timeDiffMinutes": minutos,
                    "timeDiffSeconds": segundos
                },
        });
    }

    // Checa estado da proteção - Liga / Desliga
    console.log(`ligaDesligaProtecao - 2 - ${userId} - Checa estado da protecão para acompanhamento de fluxo: ${estadoProtecao}`);
    console.log(`ligaDesligaProtecao - 3 - ${userId} - Checa Número de ativacões para acompanhamento de fluxo: ${numeroAtivacoes}`);

    // Liga a Protecão
    if (estadoProtecao === "OFF" && numeroAtivacoes >= 1){
        console.log(`ligaDesligaProtecao - 4 - ${userId} - Protecão desligada e número de ativacões maior que 0. ${numeroAtivacoes}`);

        // Chama a funcão de ligar a protecão
        ligarProtecao();

        // Inicia verificacão para premiacão do usuário por 10 indicacões
        var receberPremio = false;
        // Chama funcão de premiacão
        premioIndicacao(userId, promise, receberPremio, estadoProtecao, numeroAtivacoes, inicioProtecao, firstName, response)    

    //Desliga a proteão
    } else if (estadoProtecao === "ON" && numeroAtivacoes >= 1) {
        console.log(`ligaDesligaProtecao - 4 - ${userId} - Protecão ligada e número de ativacões maior que 0. ${numeroAtivacoes}`); 
        desligarProtecao();
    }

    //primeira ativacão
    if (numeroAtivacoes === 0) {
        console.log(`ligaDesligaProtecao - 4 - ${userId} - Primeira ativacão do usuário.`);

        // Cria perfil do usuário no banco de dados
        criaNovoUsuario(perfilUser, userId, promise, indicadorPromise, promiseIndicadorUser);
        ligarProtecao();
        response.json({
            "messages": [
                {
                    "text": `Olá ${firstName}, essa é sua primeira ativação. Seja bem vindo à Onsurance.`
                }
            ],
            "set_attributes":
                {
                    "ESTADOPROTEÇÃOCARRO": estadoProtecao,
                    "numAtivacao": numeroAtivacoes,
                    "timeStart": inicioProtecao
                }// },
                // "redirect_to_blocks": [
                //     "Mensagem de boas vindas primeira proteção"
                // ]
        });
    }
});


// Funcão para calculo de gastos anuais
exports.botSimulacao = functions.https.onRequest((request, response) => {
    console.log("Bot de simuacão : " + JSON.stringify(request.query));

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
        console.log(`usuário informou valor no modelo errado! ${carValue}`);
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
    console.log("valor do minuto pos funcão", valorMinuto);
    console.log(`Valor do Carro :  ${carValue}`);
    
    var consumoAnual = ((horasUsoDia*60*365)*(valorMinuto/1000)).toFixed(2);
    console.log(`consumo mensal e anual: ${consumoAnual}`);
    consumoAnual.toString();
    consumoAnual = consumoAnual.replace(".", ",");
    
    // Crédito mínimo até para carros até R$40.000
    var creditoMin = 999;

    if (carValue > 40000) {
        console.log(`car value maior que 40000`);
        creditoMin = (carValue*0.025).toFixed(2);
    }

    // Calcula valor do seguro tradicional caso o usuário não tenha seguro
    if (valorSemSeguro === "0.05"){
        var valorDoSeguro = (valorSemSeguro*carValue).toFixed(2);
        console.log('valorDoSeguro: ', valorDoSeguro);

    }
    console.log("valor do seguro: ", valorDoSeguro);
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

exports.functionFirestore = functions.https.onRequest((request, response) => {
    console.log('Iniciando functionFirestore: ' + JSON.stringify(request.query));

    const userId = request.query["chatfuel user id"];
    const firstName = request.query["first name"];
    const lastName = request.query["last name"];

    const promise = admin.firestore().doc(`users/${userId}`);


    var userData = {
        firstName: firstName,
        lastName: lastName,
        age: 23,
        birth: "21/06/1994"
    }
    console.log(`Dados do Usuário: ${JSON.stringify(userData)}`);
    
    
    console.log('promise é isso ai: ', promise);
    
    
    promise.get().then(snapshot => {
        console.log(`promise criada e comecando a pegar os dados no DB`);
        const data = snapshot.data();
        // checa dados no banco 
        if (!data){
            console.log(`nada na base. ${JSON.stringify(data)}`);
            promise.set(userData)
        } else if (data){
            console.log(`base com usuário. ${JSON.stringify(data)}`);
            var idade = data.age + 1;
            console.log('idade: ', idade);
            promise.update({
                age: idade
            })

            
        }
        return response.json({
            "messages":[
                {
                    "text": `Mandando de volta ${JSON.stringify(data)}, nome: ${data.firstName}`
                }
            ]
        });
    }).catch(error => {
        console.error(error);
        response.status(500).json({
            "messages": [
                {
                    "text": `Deu erro: ${JSON.stringify(error)}`
                }
            ]
        });
    })

})

// Cria novo user no banco
const criaNovoUsuario = (perfilUser, userId, promise, indicadorPromise, promiseIndicadorUser) => {
    console.log(`criaNovoUsuario - 1 - ${userId} - Entra na funcão de criar novo usuário`);
    var perfilIndicador = {
        numeroIndicados: 1,
        indicados: {
            1: userId
        }
    }
    // cria perfil do usuário que está ligando a protecão
    promise.set(perfilUser).then( () => {
        console.log(`criaNovoUsuario - 2 - ${userId} - usuário criado com sucesso`);
        return null;
    }).catch(error => {
        console.error(`criaNovoUsuario - 2 - ${userId} - Erro na cricão do usuário ${error}`);
    })
    var data;
    indicadorPromise.once('value').then(snapshot => {
        data = snapshot.val();

    // pega usuário indicador
        console.log(`criaNovoUsuario - 3 - ${userId} - Dados do usuário indicador: ${JSON.stringify(data)}`);
            // checa se existe indicador no banco 
            if (!data){

                //caso não exista cria na tabela indicadores
                console.log(`criaNovoUsuario - 4 - ${userId} - Indicador não existe na base. ${JSON.stringify(data)}`);

                indicadorPromise.set(perfilIndicador).then(() =>{
                    console.log(`criaNovoUsuario - 5 - ${userId} - Indicador criado com sucesso.`);
                    return;
                }).catch(error => {
                    console.error(`criaNovoUsuario - 5 - ${userId} - Erro ao criar usuário indicador. ${error}`);
                })

                // atualiza o numero de indicados na tabela de usuários
                promiseIndicadorUser.update({
                    usuariosIndicados: 1
                }).then(() =>{
                    console.log(`criaNovoUsuario - 6 - ${userId} - Número de indicados atualizado com sucesso`);
                    return;
                }).catch(error => {
                    console.error(`criaNovoUsuario - 6 - ${userId} - Erro ao atualizar usuário indicador. ${error}`);
                })
                
                // Usuário indicador existe na base dados
            } else if (data){

                // caso exista, atualiza o numero de indicadores e adiciona um elemento no array
                console.log(`criaNovoUsuario - 4 - ${userId} - Indicador já existe na base. ${JSON.stringify(data)}`);
                console.log(`criaNovoUsuario - 5 - ${userId} - Numero de indicados: ${data.numeroIndicados}`);

                var numIndicados = parseInt(data.numeroIndicados) + 1;

                //Atualiza o numero de indicados (indicadores)
                indicadorPromise.update({
                    numeroIndicados: numIndicados
                }).then(() =>{
                    console.log(`criaNovoUsuario - 6 - ${userId} - Número de usuários indicados atualizado com sucesso.`);
                    return;
                }).catch(error => {
                    console.error(`criaNovoUsuario - 6 - ${userId} - Erro ao atualizar o número pessoas indicadas. ${error}`);
                })

                // Atualiza o array com os clientes indicados (indicadores)
                indicadorPromise.child(`/indicados/${numIndicados}`).set(userId).then(() =>{
                    console.log(`criaNovoUsuario - 7 - ${userId} - Usuário adicionado ao array com sucesso.`);
                    return;
                }).catch(error => {
                    console.error(`criaNovoUsuario - 7 - ${userId} - Erro ao adicionar usuário ao array de pessoas indicadas. ${error}`);
                });
    
                // atualiza o numero de indicados no bando de usuários (users)
                promiseIndicadorUser.update({
                    usuariosIndicados: numIndicados
                }).then(() =>{
                    console.log(`criaNovoUsuario - 8 - ${userId} - Número de indicados atualizado com sucesso`);
                    return;
                }).catch(error => {
                    console.error(`criaNovoUsuario - 8 - ${userId} - Erro ao atualizar o número de indicados na tabela Users. ${error}`);
                })
            }

        return data; 
    }).catch(error => {
        console.error(`criaNovoUsuario - 3 - ${userId} - Erro ao receber dados do indicador. ${error}`);
    })

    console.log(`criaNovoUsuario - 7/9 - ${userId} - Final da funcão de criar novo usuário`);
    
}

const premioIndicacao = (userId, promise, receberPremio, estadoProtecao, numeroAtivacoes, inicioProtecao, firstName, response) => {
    console.log(`premioIndicacao - 1 - ${userId} - Entrando na funcão de premiacão por numero de indicacão`);
    
    var data;
    // recupera dados do usuário no Banco de dados
    promise.once('value').then(snapshot => {
        data = snapshot.val();
        console.log(`premioIndicacao - 2 - ${userId} - Dados do Usuário recuperado: ${JSON.stringify(data)}`);
        console.log(`premioIndicacao - 3 - ${userId} - Usuário com: ${data.usuariosIndicados} indicados`);

        // checa se número de indicados atingiu mais de 10 pela primeira vez
        // Se o usuário atingiu os requisitos necessários para receber o prênmio
        if (parseInt(data.usuariosIndicados) >= 10 && data.recebeuPromocao === false) {
            console.log(`premioIndicacao - 4 - ${userId} - Usuário com mais de 10 indicados: ${data.usuariosIndicados}`);
            var creditoPlus = data.saldoCreditos + 1000000;
            var saldoPlus = parseFloat(data.saldoDinheiro) + 1000;

            // Atualiza dados do usuário no banco de dados
            promise.update({
                saldoCreditos: creditoPlus,
                saldoDinheiro: saldoPlus,
                recebeuPromocao: true
            }).then( () => {
                console.log(`premioIndicacao - 5 - ${userId} - Crédito, saldo e status da promocão atualizados com sucesso`);
                return;
            }).catch(error => {
                console.error(`premioIndicacao - 5 - ${userId} - Erro ao atualizar dados do prêmio de indicacão. ${error}`);
            })
            receberPremio = true;
           
            // Adicionar os valores atualizados para as variáveis de usuário
            console.log(`premioIndicacao - 6 - ${userId} - Usuário qualificado para receber prêmio por indicacão.`);
            console.log(`premioIndicacao - 7 - ${userId} - Finaliza premiacão e a ativacão da protecão e manda a resposta.`);
            response.json({
                "messages": [
                    {
                        "text": `Olá ${firstName}, vamos ativar sua proteção. Você acabou de receber o prêmio por indicar 10 pessoas. Saldo atual: ${creditoPlus}, ${saldoPlus}`
                    }
                ],
                "set_attributes":
                {
                    "ESTADOPROTEÇÃOCARRO": estadoProtecao,
                    "numAtivacao": numeroAtivacoes,
                    "timeStart": inicioProtecao,
                    "user-credit": creditoPlus,
                    "user-money": saldoPlus
                },
            }); 

        // Caso usuário não tenha atingido os requisitos para receber prêmio
        } else if (data.usuariosIndicados < 10 || data.recebeuPromocao === true){
            console.log(`premioIndicacao - 4 - ${userId} - Usuário com menos de 10 indicados ou já recebeu a promocão: ${data.usuariosIndicados}, ${data.recebeuPromocao}`);
            receberPremio = false;
            console.log(`premioIndicacao - 5 - ${userId} - Finaliza a ativacão da protecão e manda a resposta.`);
    
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
                    },
                });
        }

        return receberPremio, data;
    }).catch(error => {
        console.error(`premioIndicacao - 2 - ${userId} - Erro ao recuperar usuário na base de dados. ${error}`);
    })


    console.log(`premioIndicacao - 5 ${userId} - Atributo de receber prêmio: ${receberPremio}.`);
    console.log(`premioIndicacao - 6 ${userId} - Final da funcão de premiar usuário por indicacão`);
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
            response.json({
                "messages": [
                    {
                        "text": "Ainda não estamos trabalhando com veículos nessa faixa de preço, por favor entre em contato com o CEO."
                    }
                ]
            })
        }


        console.log("valor do minuto", valorMinuto);
        return valorMinuto;

}