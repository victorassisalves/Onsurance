const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloFirebase = functions.https.onRequest((request, response) => {
//  response.json({"messages": [{"text": "Hello from Firebase! You are the baby becoming the child"}]});
// });



// Função que pega os atributos no chatfuel e identifica se Proteção está On / Off
exports.getUserInput = functions.https.onRequest((request, response) => {
    console.log("getUserInput : " + JSON.stringify(request.query));

    // Recebe os parâmetros do chatfuel
    const ESTADOPROTEÇÃOCARRO = request.query["ESTADOPROTEÇÃOCARRO"];

    // Dados do usuário
    const userId = request.query["chatfuel user id"];
    const firstName = request.query["first name"];
    const lastName = request.query["last name"];
    const userEmail = request.query["email_address"];
    const userCredit = request.query["user-credit"];
    const userMoney = request.query["user-money"];

    // Dados do veículo
    const carModel = request.query["car-model"];
    const carPlate = request.query["carPlate"];
    const carValue = request.query["carValue"];

    // Dados de tempo
    const timeStart = request.query["timeStart"];
    const timeEnd = request.query["timeEnd"];
    const timeDiff = request.query["timeDiff"];
    const timeDiffSeconds = request.query["timeDiffSeconds"];
    const timeDiffMinutes = request.query["timeDiffMinutes"];
    const timeDiffHours = request.query["timeDiffHours"];
    const timeDiffDays = request.query["timeDiffDays"];
    const timeDiffMonths = request.query["timeDiffMonths"];
    
    const numAtivacao = request.query["numAtivacao"];

// -----------------------//----------------------//-------------------// -------------------- */

    var numeroAtivacoes = parseInt(numAtivacao);
    var valorConsumido = 0;
    // Objeto de perfil do user
    var perfilUser = {
        userId: userId,
        userName: firstName,
        lastName: lastName,
        userEmail: userEmail,
        qtdAtivacao: numAtivacao,
        statusProtecao: estadoProtecao,
        saldoCreditos: userCredit,
        saldoDinheiro: userMoney,
        logUse: []
    }

    var estadoProtecao = ESTADOPROTEÇÃOCARRO.toString();


    const ligarProtecao = () => {
        estadoProtecao = "ON";
        numeroAtivacoes += 1;
        perfilUser.numAtivacao = numeroAtivacoes;
        response.json({
            "messages": [
                {
                    "text": "Sua proteção está desligada e vai ser ligada agora."
                }
            ],
            "set_attributes":
            {
                "ESTADOPROTEÇÃOCARRO": estadoProtecao,
                "numAtivacao": numeroAtivacoes,
            },
        });
    }

    const desligarProtecao = () => {
        // Desliga a proteção, alterando o atributo ESTADOPROTEÇÃOCARRO do chatfuel
        estadoProtecao = "OFF";

        // Calcula o valor conumido baseado no tempo de uso. 
        // Atualmente so calcula com um valor (5.5)
        if (timeDiffSeconds >= 30){
            valorConsumido = Math.ceil((timeDiff/60)*5.5);
        } else if (timeDiffSeconds < 30) {
            valorConsumido = Math.floor((timeDiff/60)*5.5);
        }

        perfilUser.userCredit = userCredit - valorConsumido;
        perfilUser.userMoney = userMoney - (valorConsumido/1000);
        
        // Passa o valor consumido para o Objeto perfil do Usuário
        perfilUser.logUse = {
            inicioProtecao: timeStart,
            finalProtecao: timeEnd,
            tempoDeUso: `${timeDiff}:${timeDiffSeconds}`,
            consumo: valorConsumido
        }

        // Retorna ao chatfuel o resultado da operação
        response.json({
            "messages": [
                {
                    "text": "Vamos desligar sua proteção."
                },
                {
                    "text": `Dados do usuário: ${JSON.stringify(perfilUser)}`
                }
            ],
            "set_attributes":
                {
                    "ESTADOPROTEÇÃOCARRO": estadoProtecao,
                    "user-credit": perfilUser.userCredit,
                    "user-money": perfilUser.userMoney,
                    "valorconsumido": valorConsumido
                },
        });
    }
 
    // primeira ativacão
    // if (numAtivacao === 0) {
    //     // ligarProtecao();
    //     numeroAtivacoes += 1;
    //     response.json({
    //         "message": [
    //             {
    //                 "text": "Primeira ativacão"
    //             }
    //         ],
    //         "set_attributes":
    //             {
    //                 "ESTADOPROTEÇÃOCARRO": estadoProtecao,
    //                 "numAtivacao": numeroAtivacoes,
    //             }
    //     })
        
    //     // xhr.open("POST", `https://api.chatfuel.com/bots/5a3ac37ce4b04083e46d3c0e/users/${userId}/send?chatfuel_token=qwYLsCSz8hk4ytd6CPKP4C0oalstMnGdpDjF8YFHPHCieKNc0AfrnjVs91fGuH74&chatfuel_block_id=5af0ada8e4b08cfa6b744d6f`, true);
    //     // xhr.setRequestHeader("Content-type", "application/json");
    // }

    // Checa estado da proteção - Liga / Desliga

    // Liga a Proteão
    if (estadoProtecao === "OFF"){
        ligarProtecao();

    //Desliga a proteão
    } else if (estadoProtecao === "ON" ) {
        desligarProtecao();
    }

});

exports.getMinutePrice = functions.https.onRequest((request, response) => {
    console.log("getUserInput : " + JSON.stringify(request.query));

    // Dados do veículo
    const carModel = request.query["car-model"];
    // const carPlate = request.query["carPlate"];
    const carValue = request.query["car-value"];
    
    var valorVeiculo = carValue;

    console.log(`Valor do Carro :  ${carValue}`);
    var valorMinuto = 0;
    
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

    

    response.json({
        "set_attributes":
        {
            "valorMinuto": valorMinuto,
        },
        "messages": [
            {
                "text": `Sendo seu ${carModel} na faixa de R$${valorVeiculo}, sua proteção vai ficar a partir de ${valorMinuto/1000} centavos, ou ${valorMinuto} Switchs por minuto.`,
            },
            {
                "text": "Muito barato né? Quer começar a econimizar?",
            }
        ],
        
    });
});