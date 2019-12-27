import * as express from "express";
import * as cors from "cors";

const share = express();

share.use(cors({origin: true}));

share.post("/auto", async (req,res) => {

});

share.post("/pneus", async (req, res) => {

});