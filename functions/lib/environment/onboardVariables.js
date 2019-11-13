"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../model/errors");
exports.getOnboardVariables = (request, response) => __awaiter(this, void 0, void 0, function* () {
    const requestBody = request.body;
    try {
        const onboardVariables = yield {
            userProfile: {
                firstName: requestBody.firstName,
                lastName: requestBody.lastName,
                userEmail: (requestBody.userEmail).toLowerCase(),
                cpf: requestBody.cpf,
                onboard: true,
                fundsToWallet: null,
            },
            itemProfile: {
                itemType: requestBody.itemType,
                typeOfUse: requestBody.typeOfUse,
                itemInnerType: requestBody.itemInnerType,
                factory: (requestBody.factory).toLowerCase(),
                plate: requestBody.plate.toLowerCase(),
                chassi: requestBody.chassi,
                itemPrice: parseFloat(requestBody.itemPrice),
                brand: requestBody.brand,
                model: requestBody.model,
                year: requestBody.year,
                access: [requestBody.products],
                hasAssistance: {
                    _status: (function () {
                        if (requestBody.hasAssistance === 'false') {
                            return false;
                        }
                        else {
                            return true;
                        }
                    })(),
                    startDate: Date.now() / 1000 | 0,
                    finishDate: (Date.now() / 1000 | 0) + 31622396
                },
                thirdPartyCoverage: parseInt(requestBody.thirdPartyCoverage)
            }
        };
        console.log("TCL: getOnboardVariables -> onboardVariables", onboardVariables);
        switch (onboardVariables.itemProfile.itemInnerType) {
            case "car":
            case "motorcycle":
            case "vuc":
            case "pickup":
                break;
            default:
                throw {
                    errorType: "Invalid vehicle type.",
                    message: `Vehicle type ${onboardVariables.itemProfile.itemType} not valid. Please check for postman environment and try again`,
                };
        }
        ;
        switch (onboardVariables.itemProfile.factory) {
            case "nacional":
            case "importado":
                break;
            default:
                throw {
                    errorType: "Invalid vehicle factory.",
                    message: `Vehicle factory ${onboardVariables.itemProfile.factory} not valid. Please check for postman environment and try again`,
                };
        }
        ;
        switch (onboardVariables.itemProfile.typeOfUse) {
            case "passeio":
            case "taxi":
            case "app":
            case "utility":
                break;
            default:
                throw {
                    errorType: "Invalid type of use for vehicle.",
                    message: `Vehicle type of use ${onboardVariables.itemProfile.typeOfUse} not valid. Please check for postman environment and try again`,
                };
        }
        ;
        return onboardVariables;
    }
    catch (error) {
        response.status(412).send(error);
    }
});
exports.tireOnboardVariables = (variables) => __awaiter(this, void 0, void 0, function* () {
    try {
        const treatedVariebles = {
            totalValue: errors_1.checkRequestVariables(parseFloat(variables.totalValue)),
            qtd: errors_1.checkRequestVariables(parseFloat(variables.qtd)),
            userEmail: errors_1.checkRequestVariables(variables.userEmail),
            tireId: errors_1.checkRequestVariables(variables.tireId),
            plate: errors_1.checkRequestVariables(variables.plate),
        };
        // Check number of tires
        switch (parseFloat(variables.qtd.toString())) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
                break;
            default:
                throw {
                    errorType: "Invalid tire number",
                    message: `${variables.qtd} is not a valid number of tires. Please select a valid number`
                };
        }
        ;
        return treatedVariebles;
    }
    catch (error) {
        throw error;
    }
});
//# sourceMappingURL=onboardVariables.js.map