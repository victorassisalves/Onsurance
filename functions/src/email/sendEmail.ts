import * as nodemailer from "nodemailer";



export class SendEmail {
    sendQuoteAutoResult () {
        try {
            const transporter = nodemailer.createTransport({
                host: 'smtp.zoho.com',
                    port: 465,
                    secure: true,  //true for 465 port, false for other ports
                    auth: {
                        user: 'victor.assis@onsurance.me',
                        pass: '*ScC49KEYeh4'
                    }
            });
            
            const mailOptions = () => {
                return {
                    from: 'victor.assis@onsurance.me',
                    to: 'victor.assis.alves@gmail.com',
                    cc: [
                        `adilair@onsurance.me`
                    ],
                    subject: 'Onsurance - Resultado de cotação Auto',
                    text: `Aqui está sua cotação`,
                    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                    <html xmlns="http://www.w3.org/1999/xhtml">
                        <head>
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                        <title>Template Email</title>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                        </head>
                        <body style="margin: 0; padding: 0;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td>
                                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse;">
                                            <tr>
                                                <td align="center" bgcolor="#eceff1" style="padding: 20px 0 30px 0;">
                                                    <img src="https://firebasestorage.googleapis.com/v0/b/onsurance-new.appspot.com/o/Logo.png?alt=media&token=7d2774ba-9c96-4995-9f37-59632d4f55d7" alt="Onsurance Inc." width="300" height="300" style="display: block;" />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td bgcolor="#ffffff" style="padding: 40px 30px 40px 30px; border: 1px solid #cccccc;">
                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                        <tr>
                                                            <td style="font-family: Arial, sans-serif; font-size: 24px;">
                                                                <b>Lorem ipsum dolor sit amet!</b>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding: 20px 0 30px 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tempus adipiscing felis, sit amet blandit ipsum volutpat sed.
                                                                Morbi porttitor, eget accumsan dictum, nisi libero ultricies ipsum, in posuere mauris neque at erat.
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                    <tr>
                                                                        <td width="260" valign="top">
                                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                                <tr>
                                                                                    <td>
                                                                                        <img src="https://firebasestorage.googleapis.com/v0/b/onsurance-new.appspot.com/o/seguro.png?alt=media&token=2d7e648f-8c00-417f-8c2b-5f76ae897fd6" alt="Seguro sobre demanda" width="100%" height="260" style="display: block;" />
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td style="padding: 25px 0 0 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                                                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tempus adipiscing felis, sit amet blandit ipsum volutpat sed.
                                                                                    Morbi porttitor, eget accumsan dictum, nisi libero ultricies ipsum, in posuere mauris neque at erat.
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                        </td>
                                                                        <td style="font-size: 0; line-height: 0;" width="20">
                                                                            &nbsp;
                                                                        </td>
                                                                        <td width="260" valign="top">
                                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                                <tr>
                                                                                    <td>
                                                                                        <img src="https://firebasestorage.googleapis.com/v0/b/onsurance-new.appspot.com/o/aplicativo.png?alt=media&token=c08c874b-f7ba-46f0-a426-b6bcf9587371" alt="Facilidade com o celular" width="100%" height="260" style="display: block;" />
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td style="padding: 25px 0 0 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                                                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tempus adipiscing felis, sit amet blandit ipsum volutpat sed.
                                                                                        Morbi porttitor, eget accumsan dictum, nisi libero ultricies ipsum, in posuere mauris neque at erat.
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td bgcolor="#1f1f1f" style="padding: 30px 30px 30px 30px; color: #666666">
                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                        <tr>
                                                            <td width="75%" style=" font-family: Arial, sans-serif; font-size: 14px;">
                                                                &reg; Onsurance, Inc. 2017 - 2020<br/>
                                                            </td>
                                                            <td align="right" width="25%">
                                                                <table border="0" cellpadding="0" cellspacing="0">
                                                                    <tr>
                                                                        <td>
                                                                            <a href="https://www.facebook.com/onsurance.me/">
                                                                                <img src="https://firebasestorage.googleapis.com/v0/b/onsurance-new.appspot.com/o/fb.png?alt=media&token=2fb806f8-f888-42b4-9bf3-f229c512342c" alt="Facebook" width="38" height="38" style="display: block;" border="0" />
                                                                            </a>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </body>
                    </html>`,
                }
            };
            
            transporter.sendMail(mailOptions(), function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
        } catch (error) {
        console.error(`TCL: sendEmail -> error`, error);
            
        }
        
    }
}