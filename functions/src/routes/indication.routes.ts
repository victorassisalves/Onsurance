import * as express from "express";
import * as cors from "cors";
import { firstAccessVariables } from "../environment/messenger/messenger.variables";
import { getfirstAccess } from "../controller/firstAccessController";
import { userProfileDbRefRoot } from "../database/customer.database";
import { getDatabaseInfo, updateDatabaseInfo } from "../model/databaseMethods";
import { checkMessengerId } from "../model/errors";
import { firstAccessResponse, serverError, variableNull } from "../environment/messenger/messenger.responses";

const indication = express();
// Automatically allow cross-origin requests
indication.use(cors({ origin: true }));

/**
 * Indication endpoints plan
 * @todo
 *  @
 *  save indicator profile -> 1 
 *  save indicated profile -> 1
 *  link indicated with indicator -> 1
 *  send message to indicator that indicated registered -> 1
 *  send message to indicator that indicated bought -> 1
 *  check if indicator is client -> 1
 * 
 *  add 200h to indicator when indicated buy -> 2
 *  add 200h to indicated when he buys -> 2
 * 
 *  check if indicators (already done) made indications that monetized  -> 3
 *  Add 200h to indicators that already done -> 3
 * @done
 * 
 */


module.exports = indication;