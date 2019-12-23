import axios from 'axios';
import { nodemailer } from "nodemailer";
const failSafe = 3;
let count = 0;
export const sendQuotationZoho = async (quotationInfo) => {
    try {
        await axios({
            method: 'post',
            url: 'https://flow.zoho.com/669296146/flow/webhook/incoming?zapikey=1001.5079b46a98bc8b658c116b1d7e75ad17.ab2e0b3eb57aa7d17d8bdce45ea6f647&isdebug=false',
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
            url: 'https://flow.zoho.com/669296146/flow/webhook/incoming?zapikey=1001.09fce5a77546f25e5bee96a95d574a13.138fa519fbb79600165eaab69328f9fe&isdebug=false',
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