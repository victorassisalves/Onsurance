export const registerBillingVariables = async(request, response) =>{
    const userEmail = (request.body["userEmail"]).toLowerCase();
    const plan = request.body["plan"]
    const itemId = request.body["itemId"]
    const validateVariables = [userEmail, plan, itemId];
    await validateVariables.forEach(element =>{
        if(element === null || undefined) {
            response.status(2).send(`Invalid Variable. ${validateVariables}`);
        }
    });

    return {
        userEmail: userEmail,
        plan: plan,
        itemId: itemId
    };
};


// const chargeObdVariables = async(request, response) =>{

// };