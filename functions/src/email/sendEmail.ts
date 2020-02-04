import * as nodemailer from "nodemailer";

const emailMatheus = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
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
</html>`

const emailJonas = `
<div style="text-align: center; padding: 40px 0">
  <img src="https://241904-962636-raikfcquaxqncofqfm.stackpathdns.com/wp-content/uploads/2019/11/Onsurance-logo-small.png.webp" alt="">
</div>

<div style="background: #f1f1f1; font-family: Arial, Helvetica, sans-serif; padding: 30px 10px">
  <div style="text-align: center;padding: 20px; font-size: 24px; text-transform: uppercase;">Resultado da sua cotação!</div>

  <table style="border: 0; width: 100%; max-width: 800px; margin: 0 auto 30px auto; table-layout: fixed;">
    <tr>
      <td style="width: 33%;"">
        <div style="margin: 0 5px; min-height: 110px; background: white; border-radius: 4px; padding: 15px; text-align: center;">
          <h3 style="color: #01B7FF; margin: 8px 0">
            <small style="display: block;">R$</small>
            <span style="font-size: 1.5rem;">200,00</span>
          </h3>
          <p style="margin: 0; font-size: 14px">
            <strong>Crédito inicial</strong> a ser pago na adesão. <br> (Pode parcelar)
          </p>
        </div>
      </td>
      <td style="width: 33%;"">
        <div style="margin: 0 5px; min-height: 110px; background: white; border-radius: 4px; padding: 15px; text-align: center;">
          <h3 style="color: #01B7FF; margin: 8px 0">
            <small style="display: block;">R$</small>
            <span style="font-size: 1.5rem;">200,00</span>
          </h3>
          <p style="margin: 0; font-size: 14px">
            Expectativa de <strong>consumo</strong> anual dos créditos
          </p>
        </div>
      </td>
      <td style="width: 33%;"">
        <div style="margin: 0 5px; min-height: 110px; background: white; border-radius: 4px; padding: 15px; text-align: center;">
          <h3 style="color: #01B7FF; margin: 8px 0">
            <small style="display: block;">Meses</small>
            <span style="font-size: 1.5rem;">2</span>
          </h3>
          <p style="margin: 0; font-size: 14px">
            <strong>Duração</strong> prevista dos seus créditos iniciais onsurance.
          </p>
        </div>
      </td>
      <td style="width: 33%;"">
        <div style="margin: 0 5px; min-height: 110px; background: white; border-radius: 4px; padding: 15px; text-align: center;">
          <h3 style="color: #01B7FF; margin: 8px 0">
            <small style="display: block;">R$</small>
            <span style="font-size: 1.5rem;">0.0003</span>
          </h3>
          <p style="margin: 0; font-size: 14px">
            Cobrado por <strong>minuto</strong> de uso dos seus créditos
          </p>
        </div>
      </td>
    </tr>
  </table>

  <div style="text-align: center;padding: 30px 10px; font-size: 24px; text-transform: uppercase;">Crédito pré-pago em que não expira, nunca!</div>

  <div style="text-align: center; border: 1px solid #b8daff; margin-bottom: 20px; line-height: 1.3; padding: 25px 20px; background-color: rgba(204, 229, 255, 0.1);">
    O onsurance foi avaliado em R$ 000,00 custa R$ 0.0003 por minuto... Functiona igual a um celular pré-pago: considerando seu <strong>uso diário de 2 horas</strong>, o crédito inicial irá durar <strong>3 meses</strong>
  </div>
  
  <div style="text-align: center; border: 1px solid #b8daff; margin-bottom: 20px; line-height: 1.3; padding: 25px 20px; background-color: rgba(204, 229, 255, 0.1);">
    Cobertura integral (até 100% tabela FIPE) contra roubo, furto e acidentes e até R$ 30.000,00 para danos materiais a terceiros. Você liga e desliga sua cobertura quando quiser!
    <br><br>
    Sua franquia em caso de colisões é R$ NaN.
  </div>

  <div style="text-align: center;padding: 30px 10px; font-size: 24px; text-transform: uppercase;">ADESÃO SIMPLIFICADA EM 4 ETAPAS</div>

  <table style="max-width: 800px; margin: 0 auto 30px auto;">
    <tr style="text-align: center;">
      <td>
        <div>
          <img width="60" src="images/step1.png" alt="">
        </div>
        <p>1. <strong>Compra</strong> do Crédito Inicial</p>
      </td>
      <td>
        <div>
          <img width="60" src="images/step2.png" alt="">
        </div>
        <p>2. <strong>Vistoria e Envio</strong> da Documentação</p>
      </td>
      <td>
        <div>
          <img width="60" src="images/step3.png" alt="">
        </div>
        <p>3. Aprovação em até 24h e <strong>uso imediato</strong></p>
      </td>
      <td>
        <div>
          <img width="60" src="images/step4.png" alt="">
        </div>
        <p>4. Recebe o <strong>Onsurance OnBoard*</strong> em casa.</p>
      </td>
    </tr>
  </table>

  <p style="text-align: center; font-size: 14px; margin: 40px 0">
    *O aparelho <strong>Onsurance Onboard</strong> chega em até 45 dias, com as orientações para oficina credenciada de instalação.
  </p>

  <hr>

  <div style="text-align: center;">
    <a style="display: inline-block; padding:10px; border-radius: 4px; background: #f7f7f7; color: #222; text-decoration: none; text-transform: uppercase;" href="https://onsurance.me/termos-de-uso" target="_blank" class="btn btn-light">VER O CONTRATO</a>
    <a style="display: inline-block; padding:10px; border-radius: 4px; background: #5B6268; color: #fff; text-decoration: none; text-transform: uppercase;" href="https://onsurance.me/" class="btn btn-secondary">REFAZER COTAÇÃO</a>
    <a style="display: inline-block; padding:10px; border-radius: 4px; background: #28A745; color: white; text-decoration: none; text-transform: uppercase;" href="https://loja.onsurance.me/" target="_blank" class="btn btn-success text-uppercase">Contratar agora!</a>
  </div>

</div>`

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
                        `matheus.lopes@onsurance.me`
                    ],
                    subject: 'Onsurance - Resultado de cotação Auto',
                    text: `Aqui está sua cotação`,
                    html: emailJonas,
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