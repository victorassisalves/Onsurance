"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVariables = (request, response) => {
    const requestBody = request.body;
    try {
        const safeParkingVariables = {
            userProfile: {
                userEmail: (requestBody.userEmail).toLowerCase(),
            },
            itemProfile: {
                plate: requestBody.plate
            }
        };
        return safeParkingVariables;
    }
    catch (error) {
        response.status(412).send(`Error getting variables for Safe Parking for client ${requestBody.userEmail}. Error: ${error}`);
    }
};
//# sourceMappingURL=gurtam.js.map