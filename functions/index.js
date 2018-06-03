const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloFirebase = functions.https.onRequest((request, response) => {
 response.json({"messages": [{"text": "Hello from Firebase! You are the baby becoming the child"}]});
});



// Função que pega os atributos no chatfuel e identifica se Proteção está On / Off
exports.getUserInput = functions.https.onRequest((request, response) => {
    console.log("getUserInput : " + JSON.stringify(request.query));

    // Recebe os parâmetros do chatfuel
    const ESTADOPROTEÇÃOCARRO = request.query["ESTADOPROTEÇÃOCARRO"];
    const userId = request.query["chatfuel user id"];
    const timeStart = request.query["timeStart"];
    const timeEnd = request.query["timeEnd"];
    const timeDiff = request.query["timeDiff"];
    // const firstName = resquest.query["first name"];
    // const lastName = resquest.query["last name"];
    // const userEmail = resquest.query["email_address"];
    const timeDiffSeconds = request.query["timeDiffSeconds"];

    const userCredit = request.query["user-credit"];
    const userMoney = request.query["user-money"];
    const numAtivacao = request.query["numAtivacao"];

/* -----------------------//----------------------//-------------------// -------------------- */

    var valorConsumido = 0;
    // Objeto de perfil do user
    var perfilUser = {
        userId: userId,
        // firstName: firstName,
        // lastName: lastName,
        // userEmail: userEmail,
        numAtivacao: numAtivacao,
        statusProtecao: estadoProtecao,
        saldoCreditos: userCredit,
        saldoDinheiro: userMoney,
        logUse: []
    }

    var estadoProtecao = ESTADOPROTEÇÃOCARRO.toString();


    const ligarProtecao = () => {
        estadoProtecao = "ON";
        numeroAtivacoes = numAtivacao + 1;
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