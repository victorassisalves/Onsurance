exports.calculaGasto = (carValue) => {
var valorMinuto, err;
    return new Promise((resolve, reject) =>{
        let checkCarValue = () => {
            if (carValue.includes(".") || carValue.includes(",")) {
                console.log(`usuário informou valor no modelo errado! ${carValue}`);
                err = {
                    description: 'Vehicle input in the wrong format!',
                    text: 'O valor do veículo foi digitado no formato errado, por favor NÃO utilize pontos ou vírgulas. Ex: "55000".',
                    block: `valor incorreto veiculo`,
                }
                reject(err)
            } else if (carValue > 200000) {
                console.log(`Vehicle price greater than 200k! ${carValue}`)
                err = {
                    description: 'Vehicle value greater than 200k!',
                    text: "Para veículos acima de duzentos mil estamos fazendo uma lista de espera. Vou te colocar em contato com nossos especialistas para que eles possam te explicar melhor a situação.",
                    textSim: "Ainda não trabalhamos proteção para veículos com esse preço. Por favor faça a simulação com outro valor ou digite 'falar com especialista' para entrar em contato conosco e saber como entrar em nossa lista de espera.",
                    textCot: "Ainda não trabalhamos proteção para veículos com esse preço. Por favor faça a cotação com outro valor ou digite 'falar com especialista' para entrar em contato conosco e saber como entrar em nossa lista de espera.",
                    block: "valor incorreto veiculo",
                }
                reject(err)
            } else {
                return calc()
            }
            return true;
        }
        var calc = () => {
            console.log('iniciando funcão de calcular valor do min');
        
            console.log(`Valor do Carro :  ${carValue}`);
        
            if (carValue <= 30000) {
                valorMinuto = 4;
            }
            if (carValue > 30000 && carValue <= 40000) {
                valorMinuto = 5.5;
            }
            if (carValue > 40000 && carValue <= 50000) {
                valorMinuto = 7;
            }
            if (carValue > 50000 && carValue <= 60000) {
                valorMinuto = 8.5;
            }
            if (carValue > 60000 && carValue <= 70000) {
                valorMinuto = 10;
            }
            if (carValue > 70000 && carValue <= 80000) {
                valorMinuto = 13;
            }
            if (carValue > 80000 && carValue <= 90000) {
                valorMinuto = 14;
            }
            if (carValue > 90000 && carValue <= 100000) {
                valorMinuto = 15;
            }
            if (carValue > 100000 && carValue <= 110000) {
                valorMinuto = 16;
            }
            if (carValue > 110000 && carValue <= 120000) {
                valorMinuto = 17;
            }
            if (carValue > 120000 && carValue <= 130000) {
                valorMinuto = 18;
            }
            if (carValue > 130000 && carValue <= 140000) {
                valorMinuto = 19;
            }
            if (carValue > 140000 && carValue <= 150000) {
                valorMinuto = 20;
            }
            if (carValue > 150000 && carValue <= 160000) {
                valorMinuto = 21;
            }
            if (carValue > 160000 && carValue <= 170000) {
                valorMinuto = 22;
            }
            if (carValue > 170000 && carValue <= 180000) {
                valorMinuto = 23;
            }
            if (carValue > 180000 && carValue <= 190000) {
                valorMinuto = 24;
            }
            if (carValue > 190000 && carValue <= 200000) {
                valorMinuto = 25;
            }
            console.log("valor do minuto", valorMinuto);
            return resolve(valorMinuto);
        }
        checkCarValue()
    })
}