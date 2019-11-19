import axios from 'axios';
import { nodemailer } from "nodemailer";
const failSafe = 3;
let count = 0;
export const sendQuotationZoho = async (quotationInfo) => {
    try {
        await axios({
            method: 'post',
            url: 'https://flow.zoho.com/669168319/flow/webhook/incoming?zapikey=1001.64a7a6217ff72a8a25f58b1c5cd50365.6b2cf58950359f9bc3d903498fc91ab2&isdebug=false',
            data: {
                ...quotationInfo
            }
        });
    } catch (error) {
        for (count; count > failSafe; count++) {
            await sendQuotationZoho(quotationInfo)
        };
        console.error(new Error(error));
        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.com',
                port: 465,
                secure: true,  //true for 465 port, false for other ports
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
            }
        };
        
        transporter.sendMail(mailOptions(error), function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
    };
};


export const sendWoocommerceZoho = async (woocommerceInfo) => {
    try {
        await axios({
            method: 'post',
            url: 'https://flow.zoho.com/669296146/flow/webhook/incoming?zapikey=1001.40e010817af5e804017cab1a07d50c00.a9b61a039a01d7e832681fed4e763953&isdebug=false',
            data: {
                ...woocommerceInfo
            }
        });
    } catch (error) {
        for (count; count > failSafe; count++) {
            await sendWoocommerceZoho(woocommerceInfo)
        };
        console.error(new Error(error));
        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.com',
                port: 465,
                secure: true,  //true for 465 port, false for other ports
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
            }
        };
        
        transporter.sendMail(mailOptions(error), function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
    };
};