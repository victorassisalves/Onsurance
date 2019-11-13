"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const onsuranceOn_1 = require("./model/onsuranceOn");
const onsuranceOff_1 = require("./model/onsuranceOff");
// LIGAR LAVO
exports.lavoOn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Ligar
        const variables = yield require("./environment/variables").onVariables(req, res);
        yield onsuranceOn_1.onsuranceOn(variables).then(result => {
            res.status(200).send(result);
        }).catch(error => {
            if (error.id) {
                res.status(error.status).send({
                    message: error.message,
                    id: error.id
                });
            }
            res.status(error.status).send(error.message);
        });
    }
    catch (error) {
        // Error em Ligar 
        res.status(500).send(`Erro ao ligar proteção LAVO. ${error.message}`);
    }
});
// DESLIGAR LAVO
exports.lavoOff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Desligar
        const variables = yield require("./environment/variables").offVariables(req, res);
        yield onsuranceOff_1.onsuranceOff(variables).then(result => {
            res.status(200).send(result);
        }).catch(error => {
            if (error.status)
                res.status(error.status).send(error);
            res.status(300).send(error.message);
        });
    }
    catch (error) {
        // Error em Desliigar 
        res.status(500).send(`Erro ao desligar proteção LAVO. ${error.message}`);
    }
});
//# sourceMappingURL=lavo_functions.js.map