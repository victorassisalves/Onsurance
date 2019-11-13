"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerBillingVariables = (request, response) => __awaiter(this, void 0, void 0, function* () {
    const userEmail = (request.body["userEmail"]).toLowerCase();
    const plan = request.body["plan"];
    const itemId = request.body["itemId"].toLowerCase();
    const validateVariables = [userEmail, plan, itemId];
    yield validateVariables.forEach(element => {
        if (element === null || undefined) {
            response.status(2).send(`Invalid Variable. ${validateVariables}`);
        }
    });
    return {
        userEmail: userEmail,
        plan: plan,
        itemId: itemId
    };
});
// const chargeObdVariables = async(request, response) =>{
// };
//# sourceMappingURL=billing.js.map