"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcMinCar = (carValue) => {
    return new Promise((resolve, reject) => {
        let minuteValue = 0;
        const calc = () => {
            if (carValue <= 30000) {
                minuteValue = 0.00484;
            }
            else {
                const constant = 0.00181;
                const sumValue = (constant / 10000).toFixed(10);
                const minuteBase = 0.00484;
                minuteValue = ((carValue - 30000) * parseFloat(sumValue) + minuteBase);
            }
            resolve((minuteValue * 1000).toFixed(2));
        };
        const checkCarValue = () => {
            // Checa se valor informado é válido
            const checaValor = carValue.toString();
            if (checaValor.includes(".") || checaValor.includes(",")) {
                const err = {
                    description: 'Vehicle value input in the wrong format!',
                    text: 'O valor do veículo foi digitado no formato errado, por favor NÃO utilize pontos ou vírgulas. Ex: "55000".',
                    blockCot: `wrong car value cot`,
                    blockSim: `Wrong car value sim`,
                    block: `valor incorreto veiculo`
                };
                reject(err);
            }
            else {
                calc();
            }
        };
        checkCarValue();
    });
};
//# sourceMappingURL=calcMin.js.map