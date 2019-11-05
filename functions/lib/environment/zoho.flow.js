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
const axios_1 = require("axios");
const nodemailer_1 = require("nodemailer");
const failSafe = 3;
let count = 0;
exports.sendQuotationZoho = (quotationInfo) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield axios_1.default({
            method: 'post',
            url: 'https://flow.zoho.com/669168319/flow/webhook/incoming?zapikey=1001.64a7a6217ff72a8a25f58b1c5cd50365.6b2cf58950359f9bc3d903498fc91ab2&isdebug=false',
            data: Object.assign({}, quotationInfo)
        });
    }
    catch (error) {
        for (count; count > failSafe; count++) {
            yield exports.sendQuotationZoho(quotationInfo);
        }
        ;
        console.error(new Error(error));
        const transporter = nodemailer_1.nodemailer.createTransport({
            host: 'smtp.zoho.com',
            port: 465,
            secure: true,
            auth: {
                user: 'victor.assis@onsurance.me',
                pass: '*ScC49KEYeh4'
            }
        });
        const mailOptions = (error) => {
            return {
                from: 'victor.assis@onsurance.me',
                to: 'victor.assis@onsurance.me',
                subject: 'Firebase - Zoho flow Error!!!',
                text: `Error sending quotation to zoho form. Please vheck what happened. Error: ${error}. Quotation Data: ${quotationInfo} `
            };
        };
        transporter.sendMail(mailOptions(error), function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
    ;
});
exports.sendWoocommerceZoho = (woocommerceInfo) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield axios_1.default({
            method: 'post',
            url: 'https://flow.zoho.com/669296146/flow/webhook/incoming?zapikey=1001.40e010817af5e804017cab1a07d50c00.a9b61a039a01d7e832681fed4e763953&isdebug=false',
            data: Object.assign({}, woocommerceInfo)
        });
    }
    catch (error) {
        for (count; count > failSafe; count++) {
            yield exports.sendWoocommerceZoho(woocommerceInfo);
        }
        ;
        console.error(new Error(error));
        const transporter = nodemailer_1.nodemailer.createTransport({
            host: 'smtp.zoho.com',
            port: 465,
            secure: true,
            auth: {
                user: 'victor.assis@onsurance.me',
                pass: '*ScC49KEYeh4'
            }
        });
        const mailOptions = (error) => {
            return {
                from: 'victor.assis@onsurance.me',
                to: 'victor.assis@onsurance.me',
                subject: 'Firebase - Zoho flow Error!!!',
                text: `Error sending quotation to zoho form. Please vheck what happened. Error: ${error}. Purchase Data: ${woocommerceInfo} `
            };
        };
        transporter.sendMail(mailOptions(error), function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
    ;
});
//# sourceMappingURL=zoho.flow.js.map