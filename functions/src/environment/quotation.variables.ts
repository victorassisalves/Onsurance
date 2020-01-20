import { checkRequestVariables, validateEmail } from "../model/errors";


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
    tireBrand:string
    tireFactory:string
    insuranceOwner:string
    insuranceValue:number
    activeInsurance:string
    insuranceCompany:string
    insuranceExpiration:string
    zip:string
}

/**
 * @description This function treates the variables that comes from tire quotation endpoint.
 * @param {TireQuoteVariables} request Payload of the request from tire quotation
 */
export const tireQuoteVariables = async (request: TireQuoteVariables) => {
    try {
        const hours = parseInt(request.dailyUsage.slice(0,2));
        const minutes = parseInt(request.dailyUsage.slice(3,5));

        const variables = {
            totalValue: checkRequestVariables("price", request.totalValue, Number),
            qtd: checkRequestVariables("qtd", request.qtd, Number),
            vehicleType: checkRequestVariables('VehicleType', request.vehicleType, String),
            firstName: checkRequestVariables('firstName', request.firstName, String),
            lastName: checkRequestVariables('lastName', request.lastName, String),
            userEmail: validateEmail(request.userEmail),
            vehiclePlate: checkRequestVariables('VehicleType', request.vehiclePlate, String),
            dailyUsage: {
                hours: hours,
                minutes: minutes
            },
            tireBrand: checkRequestVariables("Tire Brand", request.tireBrand, String),
            tireFactory: checkRequestVariables("Tire Factory", request.tireFactory, String),
            insuranceOwner: checkRequestVariables("insurance Owner", request.insuranceOwner, String),
            phone: checkRequestVariables('VehicleType', request.phone, String),

            insuranceValue: checkRequestVariables("insurance Value", request.insuranceValue, Number, false),
            insuranceCompany: checkRequestVariables("insurance Company", request.insuranceCompany, String, false),
            activeInsurance: checkRequestVariables("Active insurance", request.activeInsurance, String, false),
            insuranceExpiration: checkRequestVariables("insurance Expiration", request.insuranceExpiration, String, false),
            zip: checkRequestVariables("Zip", request.zip, String, false),
        };

        return variables;
    } catch (error) {
        console.error(new Error(`${error}`));
        throw error;
        
    }
};