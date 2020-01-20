import { checkRequestVariables } from "../model/errors";


/**
 * @description This function treates the variables that comes from auto quotation endpoint.
 * @param {TireQuoteVariables} request Payload of the request from auto quotation
 */
export const autoQuoteVariables = async (request) => {

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
            truckTrunk: checkRequestVariables("Truck Trunk", request.truckTrunk, String, false),
            truckTrunkValue: checkRequestVariables("Truck Trunk", request.truckTrunkValue, Number, false),
        };

        return variables;
    } catch (error) {
        throw error;
        
    }
};

export interface TireQuoteVariables {
    totalValue: number,
    qtd: number,
    vehicleType: String,
    firstName: String,
    lastName: String,
    userEmail: String,
    vehiclePlate: String,
    dailyUsage: any,
    phone: String,
}

/**
 * @description This function treates the variables that comes from tire quotation endpoint.
 * @param {TireQuoteVariables} request Payload of the request from tire quotation
 */
export const tireQuoteVariables = async (request: TireQuoteVariables) => {
    try {
        console.log(`TCL: request.dailyUsage`, request.dailyUsage);
        console.log(typeof(request.dailyUsage))
        const hours = parseInt(request.dailyUsage.slice(0,2));
        console.log(`TCL: hours`, hours);
        const minutes = parseInt(request.dailyUsage.slice(3,5));
        console.log(`TCL: minutes`, minutes);

        const variables = {
            totalValue: checkRequestVariables("price", request.totalValue, Number),
            qtd: checkRequestVariables("qtd", request.qtd, Number),
            vehicleType: checkRequestVariables('VehicleType', request.vehicleType, String),
            firstName: checkRequestVariables('firstName', request.firstName, String),
            lastName: checkRequestVariables('lastName', request.lastName, String),
            userEmail: checkRequestVariables('userEmail', request.userEmail, String),
            vehiclePlate: checkRequestVariables('VehicleType', request.vehiclePlate, String),
            dailyUsage: {
                hours: hours,
                minutes: minutes
            },
            phone: checkRequestVariables('VehicleType', request.phone, String, false),
        };
        console.log(`TCL: variables`, JSON.stringify(variables));

        return variables;
    } catch (error) {
        throw error;
        
    }
};