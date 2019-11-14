interface TireOnboard {
    totalValue: number;
    qtd: number;
    userEmail: string;
    tireId: string;
    plate: string;
    vehicleType: string;
};


export const checkVehicleTireQtd = (vehicleType, tireQtd) => {
    try {
        switch (vehicleType) {
            // case "caminhonete":
            // case "vuc":
            case "carro": {
                if (tireQtd > 4) {
                    throw {
                        errorType: "Invalid tire number.",
                        message: `A car can't have ${tireQtd} tires. Maximum of 4 tires`
                    };
                };
                break;

            }
            case "moto":{
                if (tireQtd > 2) {
                    throw {
                        errorType: "Invalid tire number.",
                        message: `A motorcycle can't have ${tireQtd} tires. Maximum of 2 tires`
                    };
                };
                break;

            }

            default:
                throw {
                    errorType: "Invalid vehicle type.",
                    message: `${vehicleType} is a invalid type. Not fit for onboard.`
                };
        }
    } catch (error) {
        console.error(new Error(`Error checking vehicle type and tire qtd. Error: ${JSON.stringify(error)}.`));
        throw error;
    }
};