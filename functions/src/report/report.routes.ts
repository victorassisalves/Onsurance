
import * as express from "express";
import * as cors from "cors";
import { BuildUserProfileReport } from "../report/report.controller";
import { SendEmail } from "../email/sendEmail";


const report = express();
const router = express.Router();
report.use(cors({origin: true}));

router.get("/usage", async (request, response) => {
    try {
        console.log(request.path);
        // const email = new SendEmail()
        // email.sendQuoteAutoResult();
        const report = new BuildUserProfileReport();
        const result = await report.getProfile();
        console.log(`TCL: result >-> Before response.`);
    
        return response.send(result);
    } catch (error) {
        return response.send(error)
    };
});

report.use('', router);
module.exports = report; 






