import * as express from "express";
import * as cors from "cors";

const onboard = express();

// Automatically allow cross-origin requests
onboard.use(cors({ origin: true }));

var authMiddleware = function (req, res, next) {
    console.log('Middleware Log!')
    next()
  }

// Add middleware to authenticate requests
onboard.use(authMiddleware);

// build multiple CRUD interfaces:
onboard.post('/pneus', async (req, res) => {
    console.log(`/pneus -> Tire Onboard.`)
    const tire = await require("./controller/onboardController");
    try {
        const result = await tire.tireOnboard(req.body)
        console.log(`TCL: result`, JSON.stringify(result));
        res.status(200).send(result);
        
    } catch (err) {
        if (err.status) res.status(err.status).send(err.text);
        res.send(err)
    }
});

module.exports = onboard;