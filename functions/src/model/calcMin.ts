import { invalidVehicleType } from "./errors";

interface Vehicle {
    fipe: string;
    vehicleType: string;
    usageType?: string;
    factory: string;
    thirdPartyCoverage: string;
}


/**
 * 
 * @param {Vehicle} userInput 
 */
export const getVehicleMinuteValue = (userInput: Vehicle): Promise<number> => {
    return new Promise((resolve, reject) => {
        try {

            const fipe = parseFloat(userInput.fipe!);
            const vehicleType = userInput.vehicleType!.toLowerCase();
            const usageType = userInput.usageType.toLowerCase();
            const factory = userInput.factory.toLowerCase();
            const thirdPartyCoverage = parseFloat(userInput.thirdPartyCoverage);




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
         * @param {number} minuteValue is the base minute value based on vehicle FIPE 
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
                        errorType: "Invalid factory",
                        message:`Informe uma fabricação válida. Só pode ser nacional ou importado. ${factory} não é válido.`
                    }
            }
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
            const vehicleValue = fipe;

            switch (usageType) {
                case "passeio":
                    return vehicleValue;
                case "taxi":
                case "app":
                case "utility":
                    return vehicleValue + 10000;
                default:
                    throw {
                        errorType: "Invalid usage type.",
                        message: `"${usageType}" is not a valid usage type. Please select a valid one: app, taxi, passeio ou utility.`
                    }
            }
        };

        /**
         * @description This function calculates the minute value based on the third party coverage choose by the user
         * @param {number} thirdPartyCoverage The value that represents the coverage for third parties. 30 === 30k
         * @param {number} minuteValue Minute value, the cost per minute of use
         */
        const calcThirdPartyCoverage = (thirdPartyCoverage: number, minuteValue: number) => {
            console.log(`TCL: calcThirdPartyCoverage -> thirdPartyCoverage`, thirdPartyCoverage)
            if (thirdPartyCoverage < 30) {
                return minuteValue
            } else {
                const multiplier = parseFloat(((thirdPartyCoverage - 30)/10).toFixed(0));
                console.log(`TCL: calcThirdPartyCoverage -> multiplier`, multiplier)
                const newMinuteValue = parseFloat((minuteValue + (multiplier*(minuteValue/18))).toFixed(5));
                console.log(`TCL: calcThirdPartyCoverage -> newMinuteValue`, newMinuteValue)
                return newMinuteValue
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
            };

        };




        /**
         * @description This functions execute all functions above
         * 
         * @param {string} vehicleType
         * 
         * Then we execute te functions
         */
        const executeCalculations = async(vehicleType: string) => {
            try {

                console.log("TCL: executeCalculations -> Typo de veículo:", vehicleType);

                switch (vehicleType) {
                    case "carro": 
                    case "car": {

                        const usageVehicleValue = getFipeByUsage(usageType, fipe);
                        console.log("TCL: executeCalculations -> usageVehicleValue", usageVehicleValue)
                        
                        const minuteValueBase = calcMinuteCar(usageVehicleValue);
                        const minuteValueFactory = minuteByFactory(factory, minuteValueBase);
                        console.log("TCL: executeCalculations -> Car minute value by factory", minuteValueFactory);
                        
                        const minuteValue = calcThirdPartyCoverage(thirdPartyCoverage, minuteValueFactory)

                        // const quotationData = {
                        //     calcVehicleValue: usageVehicleValue,
                        //     minuteValue: minuteValue,
                        // }

                        resolve(minuteValue);
                    };

                    case "moto": 
                    case "motorcycle": {

                        const minuteValueBase = calcMinuteMoto(fipe);
                        const minuteValueFactory = minuteByFactory(factory, minuteValueBase)
                        console.log("TCL: executeCalculations -> Moto minute Value by factory", minuteValueFactory);

                        const minuteValue = calcThirdPartyCoverage(thirdPartyCoverage, minuteValueFactory)
                        
                        // const quotationData = {
                        //     calcVehicleValue: fipe,
                        //     minuteValue: minuteValue,
                        // }

                        resolve(minuteValue);
                    };

                    case "vuc": {


                        const minuteValueBase = calcMinuteVuc(fipe);
                        const minuteValueFactory = minuteByFactory(factory, minuteValueBase);
                        console.log("TCL: executeCalculations -> VUC minuteValueFactory", minuteValueFactory);

                        const minuteValue = calcThirdPartyCoverage(thirdPartyCoverage, minuteValueFactory)

                        // const quotationData = {
                        //     calcVehicleValue: fipe,
                        //     minuteValue: minuteValue,
                        // }

                        resolve(minuteValue);
                    }

                    case "caminhonete":
                    case "pickup": {
                        let minuteValueBase: number
                        if (usageType === "passeio") {
                            minuteValueBase = calcMinutePickup(fipe);
                        } else if (usageType === "utility") {
                            minuteValueBase = calcMinuteVuc(fipe);
                        } else {
                            throw {
                                errorType: "Invalid usage type for pickups.",
                                message: `"${usageType}" is not a valid usage type. Please select a valid one: passeio or utility.`
                            }
                        }
                        
                        const minuteValueFactory = minuteByFactory(factory, minuteValueBase);
                        console.log("TCL: executeCalculations -> Caminhonete minuteValueFactory", minuteValueFactory);

                        const minuteValue = calcThirdPartyCoverage(thirdPartyCoverage, minuteValueFactory)

                        // const quotationData = {
                        //     calcVehicleValue: fipe,
                        //     minuteValue: minuteValue,
                        // }

                        resolve(minuteValue);
                    }
                    default:
                        throw {
                            errorType: "Invalid vehicle type.",
                            message: `Informe um veículo válido. ${vehicleType}`,
                        };
                };

            } catch (error) {
                console.error(new Error(`Error in execute calculations. Check: ${JSON.stringify(error)}`))  
                reject(error); 
                
            };
        };

        return executeCalculations(vehicleType);
            
        } catch (error) {
            console.error(new Error(`Error in quotation. Check: ${JSON.stringify(error)}`))  

            reject(error); 
        }
    });      
};

/**
 * 
 * @param {string} vehicleType Is the vehicle type for separete calculations
 * @param {number} tireTotalValue must already contain the total tire values to execute the function
 * @returns {Object}
 * ```
 * return {
 * minuteValue: parseFloat((minuteValueBase * multiplier).toFixed(5)),
 * minuteValueBase: parseFloat((minuteValueBase).toFixed(5))
 * };
 * ```
 */
export const getTireMinuteValue = (tireTotalValue: number, vehicleType: String): number => {
    try {
        switch (vehicleType) {
            case "car":
            case "carro":
            case "moto":
            case "caminhonete":
            case "vuc":
                if (tireTotalValue > 800) {
                    const minuteValueBase = parseFloat((tireTotalValue/800000).toFixed(5));
                    return minuteValueBase;
                } else {
                    const minuteValueBase = 0.001;
                    return minuteValueBase;
                }
            
            default:
                invalidVehicleType(vehicleType);
        };
    } catch (error) {
        throw error;   
    }
    
  
};