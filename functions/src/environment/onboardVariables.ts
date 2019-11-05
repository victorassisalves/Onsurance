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
