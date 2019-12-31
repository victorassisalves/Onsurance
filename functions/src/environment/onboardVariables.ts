import { TiresDB, TireProfile } from "../database/tires.module";
import { checkRequestVariables, checkVehicleTireQtd } from "../model/errors";

export const getOnboardVariables = async (request, response) => {
    const requestBody = request.body
    try {
        const onboardVariables = await {
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
                    _status: (function(){
                        if(requestBody.hasAssistance === 'false'){
                            return false;
                        } else {
                            return true;
                        }
                           
                    })(),
                    startDate: Date.now()/1000|0,
                    finishDate: (Date.now()/1000|0)+31622396
                },
                thirdPartyCoverage: parseInt(requestBody.thirdPartyCoverage)
            }
        };
        console.log("TCL: getOnboardVariables -> onboardVariables", onboardVariables)
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
        };
        switch (onboardVariables.itemProfile.factory) {
            case "nacional":
            case "importado":
                break;
            default:
                throw {
                    errorType: "Invalid vehicle factory.",
                    message: `Vehicle factory ${onboardVariables.itemProfile.factory} not valid. Please check for postman environment and try again`,
                };
        };

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
        };
        return onboardVariables;

    } catch (error) {
        response.status(412).send(error);
    }
};



interface tireOnboardVariablesInterface {
    totalValue: string;
    tireQtd: string;
    userEmail: string;
    nfId: string;
    plate: string;
    vehicleType: string;
    brand: string;
    runFlat: boolean;
    loadIndex: number;
    speedIndex: string;
    pressure: number;
    temperature: string;
    traction: string;
    fabrication: number;
    treadwear: number;
    width: number;
    height: number;
    radius: string;
    vehicleModel: string;
    vehicleBrand: string;
    vehicleValue: number;
    vehicleYear: number;
    chassi: string;
};
/**
 * 
 * @param variables 
 */
export const tireOnboardVariables = async (variables: tireOnboardVariablesInterface) => {
    try {
        
        const treatedVariables = {
            totalValue: checkRequestVariables("totalValue", variables.totalValue, Number),
            tireQtd: checkRequestVariables("tireQtd", variables.tireQtd, Number),
            userEmail: checkRequestVariables("email", variables.userEmail, String),
            nfId: checkRequestVariables("nfId", variables.nfId, String),
            plate: checkRequestVariables("plate", variables.plate, String),
            vehicleType: checkRequestVariables("vehicleType", variables.vehicleType, String),
            vehicleInfo: {
                vehicleModel: checkRequestVariables("vehicleModel", variables.vehicleModel, String, false),
                vehicleBrand: checkRequestVariables("vehicleBrand", variables.vehicleBrand, String, false),
                vehicleValue: checkRequestVariables("vehicleValue", variables.vehicleValue, Number, false),
                vehicleYear: checkRequestVariables("vehicleYear", variables.vehicleYear, Number, false),
                chassi: checkRequestVariables("chassi", variables.chassi, String, false),
            },
            tiresData: {
                brand: checkRequestVariables("Brand", variables.brand, String),
                runFlat:checkRequestVariables("Run Flat", variables.runFlat, Boolean),
                loadIndex: checkRequestVariables("Load Index", variables.loadIndex, Number),
                speedIndex: checkRequestVariables("Speed Index", variables.speedIndex, String),
                pressure: checkRequestVariables("Pressure", variables.pressure, Number),
                temperature: checkRequestVariables("Temperature", variables.temperature, String),
                traction: checkRequestVariables("Traction", variables.traction, String),
                fabrication: checkRequestVariables("Fabrication", variables.fabrication, Number),
                treadwear: checkRequestVariables("Tread Wear", variables.treadwear, Number),
                width: checkRequestVariables("Width", variables.width, Number),
                height: checkRequestVariables("Height", variables.height, Number),
                radius: checkRequestVariables("Radius", variables.radius, String),
            }
        };
        await checkVehicleTireQtd(treatedVariables.vehicleType, treatedVariables.tireQtd);
        return treatedVariables;
        
    } catch (error) {
        console.log(`TCL: error`, error);
        throw error;
    }
};
