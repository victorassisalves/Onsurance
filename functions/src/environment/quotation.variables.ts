import { checkRequestVariables } from "../model/errors";

export interface TireQuoteVariables {
    totalValue: number,
    qtd: number,
    vehicleType: String,
    firstName: String,
    lastName: String,
    userEmail: String,
    vehiclePlate: String,
    dailyUsage: number,
    phone: String,
}

/**
 * @description This function treates the variables that comes from auto quotation endpoint.
 * @param {TireQuoteVariables} request Payload of the request from auto quotation
 */
export const autoQuoteVariables = async (request: TireQuoteVariables) => {

    try {
        const variables = {
            totalValue: checkRequestVariables("price", request.totalValue, Number),
            qtd: checkRequestVariables("qtd", request.qtd, Number),
            vehicleType: checkRequestVariables('VehicleType', request.vehicleType, String),
            firstName: checkRequestVariables('firstName', request.firstName, String),
            lastName: checkRequestVariables('lastName', request.lastName, String),
            userEmail: checkRequestVariables('userEmail', request.userEmail, String),
            vehiclePlate: checkRequestVariables('VehicleType', request.userEmail, String),
            dailyUsage: checkRequestVariables('VehicleType', request.dailyUsage, Number),
            phone: checkRequestVariables('VehicleType', request.phone, String, false),
        };

        return variables;
    } catch (error) {
        throw error;
        
    }
};

/**
 * @description This function treates the variables that comes from tire quotation endpoint.
 * @param {TireQuoteVariables} request Payload of the request from tire quotation
 */
export const tireQuoteVariables = async (request: TireQuoteVariables) => {

    try {
        const variables = {
            totalValue: checkRequestVariables("price", request.totalValue, Number),
            qtd: checkRequestVariables("qtd", request.qtd, Number),
            vehicleType: checkRequestVariables('VehicleType', request.vehicleType, String),
            firstName: checkRequestVariables('firstName', request.firstName, String),
            lastName: checkRequestVariables('lastName', request.lastName, String),
            userEmail: checkRequestVariables('userEmail', request.userEmail, String),
            vehiclePlate: checkRequestVariables('VehicleType', request.userEmail, String),
            dailyUsage: checkRequestVariables('VehicleType', request.dailyUsage, Number),
            phone: checkRequestVariables('VehicleType', request.phone, String, false),
        };

        return variables;
    } catch (error) {
        throw error;
        
    }
};