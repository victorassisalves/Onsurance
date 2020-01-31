import { getTireMinuteValue } from "../model/calcMin";
import { TireQuoteVariables } from "../environment/quotation.variables";
import { motoCounterDbRef } from "../database/database";
import { getDatabaseInfo, setDatabaseInfo } from "../model/databaseMethods";
import { checkRequestVariables } from "../model/errors";

export class executeTiresQuotation {
    minuteValue: number;
    anualCost: number;
    creditDuration: number;
    variables: TireQuoteVariables;
    constructor(variables: TireQuoteVariables) {
        this.variables = variables;
    }

    getMinuteValue() {
        this.minuteValue = getTireMinuteValue(this.variables.totalValue, this.variables.vehicleType);
        return this.minuteValue;
    }

    /**
     * 
     * @param minuteValue Tire minute value of Onsurance
     */
    calcUsage () {
        let minutes: number;
        minutes = parseFloat(this.variables.dailyUsage.hours) * 60;
        minutes += parseFloat(this.variables.dailyUsage.minutes);
        this.anualCost = parseFloat((this.minuteValue * minutes * 365).toFixed(2));
        this.creditDuration = parseFloat((99/this.anualCost*12).toFixed(2));
        return {
            anualCost: this.anualCost,
            creditDuration: this.creditDuration
        }
    };
};

/**
 * @description Execute the quote for Onsurance tires 
 * @param {TireQuoteVariables} variables The treated variables to execute the quotation
 */
export const executeTiresQuote = (variables: TireQuoteVariables) => {
    try {
        const tire = new executeTiresQuotation(variables);
        const minuteValue = tire.getMinuteValue();
        const usageData = tire.calcUsage();
        return {
            ...usageData,
            minuteValue: minuteValue,
            activationCredit: 99,
        }
    } catch (error) {
        throw error;
        
    }
};

interface AutoQuoteInterface {
    fipe: string;
    vehicleType: string;
    usageType?: string;
    factory: string;
    hoursUsedDaily: string;
    thirdPartyCoverage: string;
    firstName: string;
    email: string;
    truckTrunk?: string,
    truckTrunkValue?: string,
    motoCc?: string;
}

/**
 * @description Function that makes quotation
 * @param {quotationMock} userInput Data that comes from user quotation
 */
export const executeAutoQuote = (userInput: AutoQuoteInterface) => {
    return new Promise((resolve, reject) => {
        try {

            const fipe = parseFloat(userInput.fipe!);
            const vehicleType = userInput.vehicleType!.toLowerCase();
            const usageType = userInput.usageType.toLowerCase();
            const factory = userInput.factory.toLowerCase();
            const hoursUsedDaily = parseFloat(userInput.hoursUsedDaily!);
            const thirdPartyCoverage = parseFloat(userInput.thirdPartyCoverage);
            const truckTrunk = checkRequestVariables("Truck Trunk", userInput.truckTrunk, String, false)
            if (thirdPartyCoverage > 150 || thirdPartyCoverage < 30) {
                throw {
                    status: 406, // Not Acceptable
                    error: "Cobertura para terceiros fora do limite.",
                    message: `${thirdPartyCoverage} está fora do limite permitido. Valores só podem ir de 30 até 150`,
                    block: "wrong3rdCoverage"
                };
                
            }

        // ----------- GENERAL FUNCTIONS ---------------/ 


        /**
         * @description This function returns the vehicle minute value based on the factory
         * 
         * @param {string} factory Is the vehicle factory. Can be: 
         * 
         * ``` 
         * "nacional" or "importado"
         * ```
         * 
         * @param {number} minuteValue is the minute value calculated from:
         * @function calcMinuteMoto 
         * @function calcMinuteCar
         *
         */
        const minuteByFactory = (factory: string, minuteValue: number) => {
            switch (factory) {
                case "nacional":
                    return parseFloat((minuteValue).toFixed(5));
                case "importado":
                    return parseFloat((minuteValue * 1.2).toFixed(5));
                default:
                    throw {
                        status: 406, // Not Acceptable
                        error: "Fabricação inválida",
                        message:`Escolha uma fabricação válida. Só pode ser nacional ou importado. ${factory} não é válido.`,
                        block: "initialDataEntry",
                        variables: {},
                    };
            };
        };

        /**
         * @description Get's the vehicle value based on the type of Usage.
         * Each type of use modify the FIPE value.
         * @param {string} usageType can assume 3 values: 
         * ``` 
         * "taxi", "app" or "passeio".
         * ``` 
         * @param {number} fipe Is the vehicle base value based on the FIPE table
         * 
         * @returns
         * ```
         * return vehicleValue
         * ```
         */
        const getFipeByUsage = (usageType: string, fipe: number) => {
            let vehicleValue = fipe;

            switch (usageType) {
                case "passeio":
                    return vehicleValue;
                case "taxi":
                case "app":
                    return vehicleValue + 10000;
                default:
                    throw {
                        status: 406, // Not Acceptable
                        error: "Tipo de uso inválido para carro.",
                        message: `"${usageType}" não é um tipo de uso válido. Escolha uma das seguintes opções: app, taxi, passeio.`,
                        block: "chooseCarUsage",
                        variables: {}
                    }
            }
        }

        /**
         * @description This function calculates the duration in months of the credit in a 365 days usage
         * 
         * It recieves the following paramenter:
         * @param {number} activationCredit Credit used to activate Onsurance
         * @param {number} hoursUsedDaily Number of hours used per day
         * @param {number} minuteValue Minute value, the cost per minute of use
         * ```
         * return {
         *  duration: number,
         *  anualCost: number
         * }
         * ```
         */
        const yearCalculations = (activationCredit: number, hoursUsedDaily: number, minuteValue: number) => {
            const obd = 478.8;
            const yearUsage = parseFloat((hoursUsedDaily * 60 * minuteValue * 365).toFixed(2));
            const anualCost =  obd + yearUsage;
            return {
                duration: parseFloat((activationCredit/(anualCost/12)).toFixed(1)),
                anualCost: parseFloat(anualCost.toFixed(2))
            };
        };

        /**
         * 
         * @param {number} thirdPartyCoverage The value that represents the coverage for third parties.
         * @param {number} activationCredit Credit used to activate Onsurance
         * @param {number} minuteValue Minute value, the cost per minute of use
         */
        const calcThirdPartyCoverage = (thirdPartyCoverage: number, activationCredit: number, minuteValue: number) => {
            if (thirdPartyCoverage < 30) {
                return {
                    activationCredit: activationCredit,
                    minuteValue: minuteValue
                };
            } else {
                const multiplier = parseFloat(((thirdPartyCoverage - 30)/10).toFixed(0));

                const newActivationCredit = parseFloat((activationCredit + (multiplier*28.5)).toFixed(2));

                const newMinuteValue = parseFloat((minuteValue + (multiplier*(minuteValue/18))).toFixed(5));

                return {
                    activationCredit: newActivationCredit,
                    minuteValue: newMinuteValue
                };
            }
        };


        // ----------- CAR FUNCTIONS ---------------/ 


        /**
         * @description This function calculates the car minute value based on the type of Usage and FIPE value.
         * 
         * @param {number} usageVehicleValue stands for the vehicle value that comes from the:
         * ``` 
         * function getFipeByUsage(usageType, fipe)
         * ``` 
         * 
         */
        const calcMinuteCar = (usageVehicleValue: number) => {
            const vehicleValue = usageVehicleValue
            const minuteValueBase = 0.00484;
            const multiplier = vehicleValue - 30000;
            const sumBase = 0.000000181;
            let minuteValue = 0.00484;

            if (vehicleValue >= 30000)  {
                return minuteValue = parseFloat((minuteValueBase + (multiplier * sumBase)).toFixed(5));
            } else {
                return minuteValue; 
            }

        }

        /**
         * @description This function returns the vehicle minute value based on the factory
         * 
         * @param {string} factory Is the vehicle factory. Can be: 
         * 
         * ``` 
         * "nacional" or "importado"
         * ```
         * 
         * @param {number} vehicleValue is the car value calculated from the function:
         * @function getFipeByUsage
         *
         */
        const getCarActivationCredit = (factory: string, vehicleValue: number) => {
            
            if (factory === "nacional") {
                if (vehicleValue < 10001) {
                    return 999;
                } else if (vehicleValue > 10000 && vehicleValue <= 40000){
                    return 1199
                } else {
                    return parseFloat((vehicleValue * 0.03).toFixed(2));
                }
            } else {
                if (vehicleValue <= 40000){
                    return 1799
                } else {
                    return parseFloat((vehicleValue * 0.045).toFixed(2));
                }
            };
        };

        /**
         * @description This function is used to get the vehicle franchise
         * @param {string} factory have 2 values:
         * ```
         * "nacional" or "importado"
         * ```
         * @param {number} vehicleValue vehicle value tha comes from
         * @function getFipeByUsage(usageType, fipe)
         */
        const getCarFranchise = (factory: string, vehicleValue: number) => {

            switch (factory) {
                case "nacional": {
                    if (vehicleValue <= 37500) {
                        return 1500;
                    } else {
                        return parseFloat((vehicleValue * 0.04).toFixed(2));
                    };
                };
                default: {
                    if (vehicleValue <= 37500) {
                        return 3000;
                    } else {
                        return parseFloat((vehicleValue * 0.08).toFixed(2));
                    };
                };
            }
        };


        // ----------- MOTORCYCLE FUNCTIONS ---------------/ 


        /**
         * @description This function calculates the motorcycle minute value based on the FIPE value.
         * 
         * @param {number} fipe stands for the FIPE value
         * 
         */
        const calcMinuteMoto = (fipe: number) => {
            const vehicleValue = fipe * 2;
            const minuteValueBase = 0.00484;
            const multiplier = vehicleValue - 30000;
            const sumBase = 0.000000181;
            let minuteValue = 0.00484;

            if (vehicleValue >= 30000)  {
                return minuteValue = parseFloat((minuteValueBase + (multiplier * sumBase)).toFixed(5));
            } else {
                return minuteValue; 
            }
        };

        /**
         * @description This function returns the vehicle minute value based on the factory
         * 
         * @param {string} factory Is the vehicle factory. Can be: 
         * 
         * ``` 
         * "nacional" or "importado"
         * ```
         * 
         * @param {number} fipe is the motorcycle FIPE value:
         * 
         * @returns {number}
         * 
         * ```
         * activationCredit: number
         * ```
         *
         */
        const getMotoActivationCredit = (factory: string, fipe: number): number => {
            
            if (factory === "nacional") {
                if (fipe <= 16650) {
                    return 999;
                } else {
                    return parseFloat((fipe * 0.06).toFixed(2));
                }
            } else {
                if (fipe <= 16650){
                    return 1499;
                } else {
                    return parseFloat((fipe * 0.09).toFixed(2));
                }
            };
        };

        /**
         * @description This function is used to get the vehicle franchise
         * @param {string} factory have 2 values:
         * ```
         * "nacional" or "importado"
         * ```
         * @param {number} fipe it's the motorcycle value that comes from the FIPE table
         */
        const getMotoFranchise = (factory: string, fipe: number) => {

            switch (factory) {
                case "nacional": {
                    if (fipe <= 37500) {
                        return 3000;
                    } else {
                        return parseFloat((fipe * 0.08).toFixed(2));
                    };
                };
                case "importado": {
                    if (fipe <= 37500) {
                        return 4500;
                    } else {
                        return parseFloat((fipe * 0.12).toFixed(2));
                    };
                };
                default:
                    throw {
                        status: 406, // Not Acceptable
                        error: "Fabricação inválida",
                        message:`Escolha uma fabricação válida. Só pode ser nacional ou importado. ${factory} não é válido.`,
                        block: "initialDataEntry",
                        variables: {},
                    };
            }
        };


        // ----------- CAMINHONETE FUNCTIONS ---------------/ 


        /**
         * @description This function calculates the car minute value based on the type of Usage and FIPE value.
         * 
         * @param {number} fipe stands for the vehicle value that comes from the FIPE table
         * @returns
         * ```
         * return minuteValue;
         * ```
         */
        const calcMinutePickup = (fipe: number) => {
            const vehicleValue = fipe
            const minuteValueBase = 0.00968;
            const multiplier = vehicleValue - 40000;
            const sumBase = 0.000000195;


            if (vehicleValue >= 40000)  {
                return parseFloat((minuteValueBase + (multiplier * sumBase)).toFixed(5));
            } else {
                return minuteValueBase; 
            }

        }


        // ----------- VUC FUNCTIONS ---------------/ 


        /**
         * @description This function calculates the car minute value based on the FIPE value.
         * 
         * @param {number} fipe stands for the vehicle value that comes from the FIPE table
         * @returns
         * ```
         * return minuteValue;
         * ```
         */
        const calcMinuteVuc = (fipe: number) => {
            const vehicleValue = fipe
            const minuteValueBase = 0.010164;
            const multiplier = vehicleValue - 40000;
            const sumBase = 0.000000205;


            if (vehicleValue >= 40000)  {
                return parseFloat((minuteValueBase + (multiplier * sumBase)).toFixed(5));
            } else {
                return minuteValueBase; 
            }

        }

        /**
         * @description This function returns the vehicle activation credit for PickupsS and VUCs.
         * 
         * This function can be used to get activation credit for:
         * @type VUC
         * @type PICKUP
         * 
         * @param {string} factory Is the vehicle factory. Can be: 
         * 
         * ``` 
         * "nacional" or "importado"
         * ```
         * 
         * @param {number} vehicleValue is the car value calculated from the function:
         * @function getFipeByUsage
         *
         */
        const getActivationCredit_Vuc_Pickup = (factory: string, vehicleValue: number): number => {
            
            if (factory === "nacional") {
                if (vehicleValue <= 40000){
                    return 2399
                } else {
                    return parseFloat((vehicleValue * 0.06).toFixed(2));
                }
            } else {
                if (vehicleValue <= 40000){
                    return 2999
                } else {
                    return parseFloat((vehicleValue * 0.075).toFixed(2));
                }
            };
        };

        /**
         * @description This function is used to get the vehicle franchise for VUCs and Pickups
         * @param {string} factory have 2 values:
         * ```
         * "nacional" or "importado"
         * ```
         * @param {number} vehicleValue vehicle value tha comes from
         * @function getFipeByUsage(usageType, fipe)
         */
        const getFranchise_Vuc_Pickup = (factory: string, vehicleValue: number) => {

            switch (factory) {
                case "nacional": {
                    if (vehicleValue <= 40000) {
                        return 3200;
                    } else {
                        return parseFloat((vehicleValue * 0.08).toFixed(2));
                    };
                };
                case "importado": {
                    if (vehicleValue <= 40000) {
                        return 4800;
                    } else {
                        return parseFloat((vehicleValue * 0.12).toFixed(2));
                    };
                };
                default:
                    throw {
                        status: 406, // Not Acceptable
                        error: "Fabricação inválida",
                        message:`Escolha uma fabricação válida. Só pode ser nacional ou importado. ${factory} não é válido.`,
                        block: "initialDataEntry",
                        variables: {},
                    };
            }
        };


        /**
         * @description This function deals with the response
         * @param {Object} userInput The information that comes from the quotation form
         * @param {quotationData} quotationData The information that comes from the quotation functions.
         */
        const quotationResponse = (userInput: Object, quotationData) => {
            const quotationResponse = {
                publicApi: {
                    creditDuration: quotationData.creditDuration,
                    minuteValue: quotationData.minuteValue,
                    anualCost: quotationData.anualCost,
                    activationCredit: quotationData.activationCredit,
                    franchise: quotationData.franchise,
                },
                privateApi: {
                    ...userInput,
                    creditDuration: quotationData.creditDuration,
                    minuteValue: quotationData.minuteValue,
                    anualCost: quotationData.anualCost,
                    activationCredit: quotationData.activationCredit,
                    franchise: quotationData.franchise,
                }
            }

            return resolve(quotationResponse);
        };

        /**
         * @description This functions execute all functions above
         * 
         * @param {string} vehicleType
         * 
         * Then we execute te functions
         */
        const executeCalculations = async (vehicleType: string) => {
            try {

                console.log("TCL: executeCalculations -> Tipo de veículo:", vehicleType);

                switch (vehicleType) {
                    case "car":
                    case "carro": {

                        const usageVehicleValue = getFipeByUsage(usageType, fipe);
                        
                        const minuteValueBase = calcMinuteCar(usageVehicleValue);
                        const minuteValueFactory = minuteByFactory(factory, minuteValueBase);
                        
                        const baseActivationCredit = getCarActivationCredit(factory, usageVehicleValue);

                        const franchise = getCarFranchise(factory, usageVehicleValue);

                        const thirdPartyCoverageInfo = calcThirdPartyCoverage(thirdPartyCoverage,baseActivationCredit,minuteValueFactory)
                        const activationCredit = thirdPartyCoverageInfo.activationCredit;
                        const minuteValue = thirdPartyCoverageInfo.minuteValue;
                        
                        /**
                         * The @var yearInfo recieve two informations:
                         * @param duration That represents the duration in months of the activation credit
                         * @param anualCost that represents the total cost estimated for 365 days of usage
                         */
                        const yearInfo = yearCalculations(activationCredit, hoursUsedDaily, minuteValue);

                        const quotationData = {
                            calcVehicleValue: usageVehicleValue,
                            minuteValue: minuteValue,
                            activationCredit: activationCredit,
                            franchise: franchise,
                            creditDuration: yearInfo.duration,
                            anualCost: yearInfo.anualCost
                        }

                        return quotationResponse(userInput, quotationData);
                    };

                    case "motorcylcle":
                    case "moto": {

                        const motoCc = checkRequestVariables(`Moto CC`, userInput.motoCc, String);
                        const minuteValueBase = calcMinuteMoto(fipe);
                        const minuteValueFactory = minuteByFactory(factory, minuteValueBase)
                        const baseActivationCredit = getMotoActivationCredit(factory, fipe);
                        const franchise = getMotoFranchise(factory, fipe);
                        const thirdPartyCoverageInfo = calcThirdPartyCoverage(thirdPartyCoverage,baseActivationCredit,minuteValueFactory);

                        const activationCredit = thirdPartyCoverageInfo.activationCredit;
                        const minuteValue = thirdPartyCoverageInfo.minuteValue;

                        /**
                         * The @var yearInfo recieve two informations:
                         * @param duration That represents the duration in months of the activation credit
                         * @param anualCost that represents the total cost estimated for 365 days of usage
                         */
                        const yearInfo = yearCalculations(activationCredit, hoursUsedDaily, minuteValue);
                        
                        const quotationData = {
                            calcVehicleValue: fipe,
                            minuteValue: minuteValue,
                            activationCredit: activationCredit,
                            franchise: franchise,
                            creditDuration: yearInfo.duration,
                            anualCost: yearInfo.anualCost
                        }

                        if (motoCc === "abaixode250cc") {
                            console.log(`TCL: motoCc`, motoCc);
                            const motoCounterDbPath = await motoCounterDbRef()
                            
                            const motoCounter: number = await getDatabaseInfo(motoCounterDbPath);

                            const newMotoCounter:number = motoCounter + 1;


                            await setDatabaseInfo(motoCounterDbPath, newMotoCounter);

                            const quotationResponse = {
                                publicApi: {
                                    motoCc: motoCc,
                                    info: 'Moto under 250 cc',
                                    motoCounter: newMotoCounter
                                },
                                privateApi: {
                                    ...userInput,
                                    ...quotationData,
                                    motoCc: motoCc,
                                    motoCounter: newMotoCounter - 1500
                                }
                            };
                
                            return resolve(quotationResponse);

                        };

                        return quotationResponse(userInput, quotationData);
                    };

                    case "vuc": {
                        let vucValue = fipe;
                        if (truckTrunk === "sim") {
                            vucValue += parseFloat(userInput.truckTrunkValue);
                        };
                        const minuteValueBase = calcMinuteVuc(vucValue);
                        const minuteValueFactory = minuteByFactory(factory, minuteValueBase);
                        
                        const baseActivationCredit = getActivationCredit_Vuc_Pickup(factory, vucValue);

                        const franchise = getFranchise_Vuc_Pickup(factory, vucValue);

                        const thirdPartyCoverageInfo = calcThirdPartyCoverage(thirdPartyCoverage,baseActivationCredit,minuteValueFactory)
                        const activationCredit = thirdPartyCoverageInfo.activationCredit;
                        const minuteValue = thirdPartyCoverageInfo.minuteValue;

                        /**
                         * The @var yearInfo recieve two informations:
                         * @param duration That represents the duration in months of the activation credit
                         * @param anualCost that represents the total cost estimated for 365 days of usage
                         */
                        const yearInfo = yearCalculations(activationCredit, hoursUsedDaily, minuteValue);

                        const quotationData = {
                            calcVehicleValue: vucValue,
                            minuteValue: minuteValue,
                            activationCredit: activationCredit,
                            franchise: franchise,
                            creditDuration: yearInfo.duration,
                            anualCost: yearInfo.anualCost
                        };

                        return quotationResponse(userInput, quotationData);
                    }

                    case "pickup":
                    case "caminhonete": {
                    
                        let minuteValueBase = 0.00968
                        if (userInput.usageType === "passeio") {
                            minuteValueBase = calcMinutePickup(fipe);
                        } else if (userInput.usageType === "utilitario") {
                            minuteValueBase = calcMinuteVuc(fipe);
                        } else {
                            throw {
                                status: 406, // Not Acceptable
                                error: "Tipo de uso inválido para caminhonete.",
                                message: `${usageType} não é um tipo de uso válido. Escolha uma das seguintes opções: passeio ou utilitario.`,
                                block: "choosePickupUsage",
                                variables: {}
                            }; 
                        };

                        const minuteValueFactory = minuteByFactory(factory, minuteValueBase);
                        
                        const baseActivationCredit = getActivationCredit_Vuc_Pickup(factory, fipe);

                        const franchise = getFranchise_Vuc_Pickup(factory, fipe);

                        const thirdPartyCoverageInfo = calcThirdPartyCoverage(thirdPartyCoverage,baseActivationCredit,minuteValueFactory);
                        const activationCredit = thirdPartyCoverageInfo.activationCredit;
                        const minuteValue = thirdPartyCoverageInfo.minuteValue;

                        /**
                         * The @var yearInfo recieve two informations:
                         * @param duration That represents the duration in months of the activation credit
                         * @param anualCost that represents the total cost estimated for 365 days of usage
                         */
                        const yearInfo = yearCalculations(activationCredit, hoursUsedDaily, minuteValue);

                        const quotationData = {
                            calcVehicleValue: fipe,
                            minuteValue: minuteValue,
                            activationCredit: activationCredit,
                            franchise: franchise,
                            creditDuration: yearInfo.duration,
                            anualCost: yearInfo.anualCost
                        }

                        return quotationResponse(userInput, quotationData);
                    }

                    default:
                        throw {
                            status: 406, // Not Acceptable
                            error: "Tipo de veículo inválido.",
                            message: `${userInput.vehicleType} não é válido. Escolha um tipo de veículo válido. Carro, moto, vuc ou caminhonete`,
                            block: 'chooseVehicle',
                            variables: {}
                        };
                };

            } catch (error) {
                console.error(new Error(`Error in execute calculations. Check: ${JSON.stringify(error)}`))  
                return reject(error); 
                
            };
        };

        return executeCalculations(vehicleType);
            
        } catch (error) {
            console.error(new Error(`Error in quotation. Check: ${JSON.stringify(error)}`))  

            return reject(error); 
        }
    });      
};