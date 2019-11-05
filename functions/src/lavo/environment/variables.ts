interface onVariables {
    clientEmail: string,
    washerEmail: string,
    vehiclePlate:  string,
    clientCpf: number,
    washerCpf: number,
};

export const onVariables = (req, res) => {
    console.log("TCL: onVariables -> request body", req.body)
    try {
        const variables = {
            clientName: (req.body.clientName).toLowerCase(),
            clientEmail: (req.body.clientEmail).toLowerCase(),
            washerEmail: (req.body.coworkerEmail).toLowerCase(),
            washerName: (req.body.coworkerName).toLowerCase(),
            vehiclePlate: (req.body.vehiclePlate).toLowerCase(),
            location: (req.body.location).toLowerCase(),
            clientCpf: parseInt(req.body.clientCpf),
            washerCpf: parseInt(req.body.coworkerCpf),
        };

        return variables;
    } catch (error) {
        console.error("TCL: onVariables -> error on getting variables for activation", error)
        res.status(500).send(`Error in ON variables. See what happned. ${error}`);
    }
    

};

export const offVariables = (req, res) => {
    console.log("TCL: offVariables -> request body", req.body)
    try {
        const variables = {
            clientEmail: (req.body.clientEmail).toLowerCase(),
            washerEmail: (req.body.coworkerEmail).toLowerCase(),
            vehiclePlate: (req.body.vehiclePlate).toLowerCase(),
            location: (req.body.location).toLowerCase(),
            logId: (req.body.logId),
        };

        return variables;
    } catch (error) {
        console.error("TCL: offVariables -> error on getting variables for deactivation", error)
        res.status(500).send(`Error in OFF variables. See what happned. ${error}`);
    }
    

};