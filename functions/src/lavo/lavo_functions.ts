import { onsuranceOn } from "./model/onsuranceOn";
import { onsuranceOff } from "./model/onsuranceOff";


// LIGAR LAVO
export const lavoOn = async (req, res) => {
    try {
        // Ligar
        const variables = await require("./environment/variables").onVariables(req, res);
        await onsuranceOn(variables).then(result => {
            res.status(200).send(result)

        }).catch(error => {
            if (error.id) {
                res.status(error.status).send({
                    message: error.message,
                    id: error.id
                })
            }
            res.status(error.status).send(error.message)
        });
    } catch (error) {
        // Error em Ligar 
        res.status(500).send(`Erro ao ligar proteção LAVO. ${error.message}` )
    }
};


// DESLIGAR LAVO
export const lavoOff = async (req, res) => {
    try {
        // Desligar
        const variables = await require("./environment/variables").offVariables(req, res);
        await onsuranceOff(variables).then(result => {
            res.status(200).send(result)

        }).catch(error => {
            if (error.status) res.status(error.status).send(error)
            res.status(300).send(error.message)
        });
    } catch (error) {
        // Error em Desliigar 
        res.status(500).send(`Erro ao desligar proteção LAVO. ${error.message}` )
    }
};