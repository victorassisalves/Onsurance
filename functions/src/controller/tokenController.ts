// const nodemailer = require("nodemailer");
// import { userProfileDbRefPersonal } from "../database/database";
// import { databaseMethods } from "../model/databaseMethods";
// const crypto = require("crypto");

// export const generateToken = (variables) =>{
//     return new Promise(async(resolve, reject) =>{

//         try {
//             const secret = `${variables.userEmail}${variables.password}`;
//             const hash = crypto.createHmac('sha256', secret)
//                         .update(`${Date.now()}`)
//                         .digest('hex');
//             console.log("TCL: generateToken -> hash", hash)

//             const transporter = nodemailer.createTransport({
//                 host: 'smtp.zoho.com',
//                     port: 465,
//                     secure: true,  //true for 465 port, false for other ports
//                     auth: {
//                         user: 'victor.assis@onsurance.me',
//                         pass: '*ScC49KEYeh4'
//                     }
//             });

            
//             const form = `<a href="https://us-central1-onsurance-new.cloudfunctions.net/sendTokenToMessenger?messengerId=${variables.messengerId}&accessToken=${hash}">Acessar Messenger</a>`
//             const mailOptions = {
//                 from: 'victor.assis@onsurance.me',
//                 to: `${variables.userEmail}`,
//                 subject: 'Onsurance: Token de segurança para uso do seguro.',
//                 text: `Segue o token de verificação para começar a usar o Onsurance. Não divulgue nem mostre para ninguém.
//                         Token: ${hash}`,
//                 html: form,
//             }

//             await transporter.sendMail(mailOptions, async function(error, info){
// 				console.log("TCL: generateToken -> info", info)
//                 if (error) {
//                     console.error(new Error(`Error sending token to email. ${error}`))
//                     throw {
//                         status: 500,
//                         text: "Token NOT sent to email."
//                     };
//                 } else {
//                     const userPrfileDbPath = await userProfileDbRefPersonal(variables.userEmail)
//                     const userProfile = await databaseMethods();
//                     await userProfile.updateDatabaseInfo(userPrfileDbPath,{
//                         _accessToken: hash
//                     });
//                     resolve({
//                         status: 200,
//                         text: "Token generated succesfully"
//                     });
//                 };
//             });
//         } catch (error) {
//             console.error(new Error(`Failed to generate token. ${error}`))
//             reject({
//                 status: 500,
//                 text: `Error: ${error.text}`
//             });
//         }
    
//     });
// };

// export const sendTokenToMessenger = variables => {
//     return new Promise((resolve, reject) => {

//         const request = require("request");

//         const homologToken = "qwYLsCSz8hk4ytd6CPKP4C0oalstMnGdpDjF8YFHPHCieKNc0AfrnjVs91fGuH74"
//         const botIdHomolog = `5b6c74f30ecd9f13f0f036e3`
//         const blockId = `5cdc7015dc22550006628fb4`
//         const urlHomolog = `https://api.chatfuel.com/bots/${botIdHomolog}/users/${variables.messengerId}/send`
//         const urlProdution = `https://api.chatfuel.com/bots/5a3ac37ce4b04083e46d3c0e/users/${variables.messengerId}/send`

//         const productionToken = "qwYLsCSz8hk4ytd6CPKP4C0oalstMnGdpDjF8YFHPHCieKNc0AfrnjVs91fGuH74"

//         const options = { method: 'POST',
//         url: urlHomolog,
//         qs: { 
//             chatfuel_token: homologToken,
//             chatfuel_block_id: blockId,
//             accessToken: variables.hash, 
//         },
//         headers: { 'Content-Type': 'application/json' },
//         body: { 
//             chatfuel_token: homologToken,
//             chatfuel_block_id: blockId,
//             accessToken: variables.hash, 
//         },
//         json: true };

//         request(options, function (error, resp, body) {
//             if (error){ 
//                 console.error(new Error(error))
//                 reject(error)
//             } else {
//                 console.log("TCL: sendMessage -> Token sent to Messenger")
//                 resolve(`token ${variables.hash}`)
//             }

//         });
    
//     });
// }