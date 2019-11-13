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
const woocommerce_rest_api_1 = require("@woocommerce/woocommerce-rest-api");
const api = new woocommerce_rest_api_1.default({
    url: "https://onsurance.me",
    consumerKey: "ck_24f24d13301017937cfb1e74f2e934971892939c",
    consumerSecret: "cs_6408b93b9160f219c8ed4d1297ab6406555ea7f4",
    version: "wc/v3",
});
exports.updateOrder = (order, status) => {
    return new Promise((resolve, reject) => {
        const data = {
            status: status
        };
        api.put(`orders/${order}`, data).then((response) => __awaiter(this, void 0, void 0, function* () {
            resolve(response.data);
        })).catch((error) => {
            console.error(new Error(error.response.data));
            reject({
                errorType: `Error updating woocommerce`,
                message: error.response.data
            });
        });
    });
};
//# sourceMappingURL=woocommerce.test.js.map