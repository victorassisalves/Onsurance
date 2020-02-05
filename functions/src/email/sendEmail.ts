import * as nodemailer from "nodemailer";
export class SendQuoteEmail {

  sendQuoteAutoResult (result) {
    try {
      const respostaAuto = {
        body: `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <title>Resultado Cotação Auto</title>
        </head>
        <style>
        @font-face {
          font-family: Montserrat;
          src: url('./fonts/Montserrat/Montserrat-Regular.ttf');
        }
        @font-face {
          font-family: Montserrat;
          src: url('./fonts/Montserrat/Montserrat-SemiBold.ttf');
          font-weight: bold;
        }
        @font-face {
          font-family: Opens_Sans;
          src: url('./fonts/Open_Sans/OpenSans-Regular.ttf');
        }
        @font-face {
          font-family: Opens_Sans;
          src: url('./fonts/Open_Sans/OpenSans-SemiBold.ttf');
          font-weight: bold;
        }
        </style>
        <body>
        
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td>
                <table
                  align="center"
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  width="600"
                  style="
                  border-collapse: separate !important;
                  border-width: 1px 1px 0px 1px;
                  border-style: solid;
                  border-color: #cccccc;
                  border-spacing: 0;
                  "
                >
                  <tr>
                    <td align="center" bgcolor="#ffffff"
                    style="
                    padding: 25px 0 25px 0;
                    ">
                        <img src="https://firebasestorage.googleapis.com/v0/b/onsurance-new.appspot.com/o/cotacao-auto%2FLogo.png?alt=media&token=b1a2262f-b519-4ace-ad90-704b82fd36c8" alt="Onsurance Inc." width="300" height="40" />
                    </td>
                  </tr>
                  <tr>
                    <td align="center" bgcolor="#f5f5f5"
                      style="
                      padding: 40px 0px 30px 0px;
                      font-size: 24px;
                      font-family: Montserrat;
                      font-weight: bold;
                      "
                    >
                      RESULTADO DA SUA COTAÇÃO!
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <table
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                      >
                        <tr>
                          <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="5px">
                            &nbsp;
                          </td>
                          <td width="110px" valign="top" bgcolor="#f5f5f5">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td align="center"
                                style="
                                color: #1890ff;
                                font-size: 16px;
                                font-family: Opens_Sans;
                                padding: 5px 0px 0px 0px;
                                border-radius: 5px 5px 0px 0px;
                                background-color: #ffffff;
                                ">
                                  R$
                                </td>
                              </tr>
                              <tr>
                                <td align="center"
                                style="
                                color: #1890ff;
                                font-size: 27px;
                                font-weight: 600;
                                font-family: Opens_Sans;
                                background-color: #ffffff;
                                padding: 0px 0px 5px 0px;
                                ">
                                  ${result.activationCredit}
                                </td>
                              </tr>
                              <tr>
                                <td align="center"
                                style="
                                font-size: 15px;
                                color: #494949;
                                font-family: Opens_Sans;
                                padding: 0px 5px 5px 5px;
                                border-radius: 0px 0px 5px 5px;
                                background-color: #ffffff;
                                ">
                                  <b>Crédito inicial</b> a ser pago na adesão.
                                  (Pode parcelar)
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="10px">
                            &nbsp;
                          </td>
                          <td width="110px" valign="top" bgcolor="#f5f5f5">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td align="center"
                                style="
                                color: #1890ff;
                                font-size: 16px;
                                font-family: Opens_Sans;
                                padding: 5px 0px 0px 0px;
                                border-radius: 5px 5px 0px 0px;
                                background-color: #ffffff;
                                ">
                                  R$
                                </td>
                              </tr>
                              <tr>
                                <td align="center"
                                style="
                                color: #1890ff;
                                font-size: 27px;
                                font-weight: 600;
                                font-family: Opens_Sans;
                                background-color: #ffffff;
                                padding: 0px 0px 5px 0px;
                                ">
                                  ${result.anualCost}
                                </td>
                              </tr>
                              <tr>
                                <td align="center"
                                style="
                                font-size: 15px;
                                color: #494949;
                                font-family: Opens_Sans;
                                padding: 0px 5px 5px 5px;
                                border-radius: 0px 0px 5px 5px;
                                background-color: #ffffff;
                                ">
                                  Expectativa de <b>consumo</b> anual dos créditos
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="10px">
                            &nbsp;
                          </td>
                          <td width="110px" valign="top" bgcolor="#f5f5f5">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td align="center"
                                style="
                                color: #1890ff;
                                font-size: 16px;
                                font-family: Opens_Sans;
                                padding: 5px 0px 0px 0px;
                                border-radius: 5px 5px 0px 0px;
                                background-color: #ffffff;
                                ">
                                  Meses
                                </td>
                              </tr>
                              <tr>
                                <td align="center"
                                style="
                                color: #1890ff;
                                font-size: 27px;
                                font-weight: 600;
                                font-family: Opens_Sans;
                                background-color: #ffffff;
                                padding: 0px 0px 5px 0px;
                                ">
                                  ${result.creditDuration}
                                </td>
                              </tr>
                              <tr>
                                <td align="center"
                                style="
                                font-size: 15px;
                                color: #494949;
                                font-family: Opens_Sans;
                                padding: 0px 5px 5px 5px;
                                border-radius: 0px 0px 5px 5px;
                                background-color: #ffffff;
                                ">
                                  <b>Duração</b> prevista dos seus créditos iniciais onsurance.
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="10px">
                            &nbsp;
                          </td>
                          <td width="110px" valign="top" bgcolor="#f5f5f5">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td align="center"
                                style="
                                color: #1890ff;
                                font-size: 16px;
                                font-family: Opens_Sans;
                                padding: 5px 0px 0px 0px;
                                border-radius: 5px 5px 0px 0px;
                                background-color: #ffffff;
                                ">
                                  R$
                                </td>
                              </tr>
                              <tr>
                                <td align="center"
                                style="
                                color: #1890ff;
                                font-size: 27px;
                                font-weight: 600;
                                font-family: Opens_Sans;
                                background-color: #ffffff;
                                padding: 0px 0px 5px 0px;
                                ">
                                  ${result.minuteValue}
                                </td>
                              </tr>
                              <tr>
                                <td align="center"
                                style="
                                font-size: 15px;
                                color: #494949;
                                font-family: Opens_Sans;
                                padding: 0px 5px 5px 5px;
                                border-radius: 0px 0px 5px 5px;
                                background-color: #ffffff;
                                ">
                                  Cobrado por <b>minuto</b> de uso dos seus créditos.
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="5px">
                            &nbsp;
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" bgcolor="#f5f5f5"
                      style="
                      padding: 40px 0px 30px 0px;
                      font-size: 24px;
                      font-family: Montserrat;
                      font-weight: bold;
                      "
                    >
                     CRÉDITO PRÉ-PAGO QUE NUNCA EXPIRA!
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="10">
                            &nbsp;
                          </td>
                          <td style="padding: 0px 0px 25px 0px;" bgcolor="#f5f5f5" >
                            <table border="0" cellpadding="0" cellspacing="0" width="100%"
                            style="
                            border-collapse: separate !important;
                            font-family: Opens_Sans;
                            background-color: #f1f1f1;
                            ">
                              <tr>
                                <td align="center"
                                style="
                                border-width: 1px 1px 0px 1px;
                                border-style: solid;
                                border-color: rgb(184, 218, 255);
                                border-radius: 5px 5px 0px 0px;
                                padding: 20px 20px 0px 20px;
                                background-color: rgba(204, 229, 255, 0.3);
                                ">
                                  <img src="https://firebasestorage.googleapis.com/v0/b/onsurance-new.appspot.com/o/cotacao-auto%2Fcarro.png?alt=media&token=d327eefa-3be4-40f8-ab2b-f5b8477f2419" height="128" width="128" style="display: block;" alt="Carro" />
                                </td>
                              </tr>
                              <tr>
                                <td
                                style="
                                border-width: 0px 1px 1px 1px;
                                border-style: solid;
                                border-color: rgb(184, 218, 255);
                                border-radius: 0px 0px 5px 5px;
                                padding: 0px 20px 20px 20px;
                                background-color: rgba(204, 229, 255, 0.3);
                                ">
                                  O onsurance do seu ${result.brand} ${result.model} de fabricação ${result.factory} avaliado em R$ ${result.fipe} custa R$ ${result.minuteValue} por minuto. Funciona
                                  igual a um celular pré-pago: considerando seu uso diário de ${result.hoursUsedDaily} horas, o crédito inicial irá durar ${result.creditDuration} meses.
                                </td
                                >
                              </tr>
                            </table>
                          </td>
                          <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="10">
                            &nbsp;
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="10">
                            &nbsp;
                          </td>
                          <td>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%"
                          style="
                          border-collapse: separate !important;
                          font-family: Opens_Sans;
                          background-color: #f1f1f1;
                          ">
                              <tr>
                                <td align="center"
                                style="
                                border-width: 1px 1px 0px 1px;
                                border-style: solid;
                                border-color: rgb(184, 218, 255);
                                border-radius: 5px 5px 0px 0px;
                                padding: 20px 20px 20px 20px;
                                background-color: rgba(204, 229, 255, 0.3);
                                ">
                                  <img src="https://firebasestorage.googleapis.com/v0/b/onsurance-new.appspot.com/o/cotacao-auto%2Fguarda-chuvas.png?alt=media&token=0aa77e45-1081-410d-824e-d34743b0465e" width="85" height="85" style="display: block;" alt="Guarda-Chuva" />
                                </td>
                              </tr>
                              <tr>
                                <td
                                style="
                                border-width: 0px 1px 1px 1px;
                                border-style: solid;
                                border-color: rgb(184, 218, 255);
                                border-radius: 0px 0px 5px 5px;
                                padding: 20px 20px 20px 20px;
                                background-color: rgba(204, 229, 255, 0.3);
                                ">
                                  Cobertura integral (até 100% tabela FIPE) contra roubo, furto e acidentes. 
                                  Sua cobertura para terceiros escolhida foi de R$ ${result.thirdPartyCoverage}.000,00. Você liga e desliga sua
                                  cobertura quando quiser!
                                  <br/><br/>
                                  Sua franquia em caso de colisões é R$ ${result.franchise}.
                                </td
                                style="
                                padding: 20px 20px 20px 20px;
                                ">
                              </tr>
                            </table
                          style="
                          padding: 20px 20px 20px 20px;
                          border: 1px solid rgb(184, 218, 255);
                          border-radius: 5px;
                          background-color: rgba(204, 229, 255, 0.1);
                          font-family: Opens_Sans;
                          ">
                          </td>
                          <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="10">
                            &nbsp;
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" bgcolor="#f5f5f5"
                      style="
                      padding: 40px 0px 30px 0px;
                      font-size: 24px;
                      font-family: Montserrat;
                      font-weight: bold;
                      "
                    >
                      ADESÃO SIMPLIFICADA EM 4 ETAPAS
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td width="130" bgcolor="#f5f5f5"
                          style="
                          font-family: Opens_Sans;
                          padding: 0px 20px 0px 10px;
                          "
                          valign="top">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td align="center"
                                style="padding: 0px 0px 5px 0px;">
                                  <img src="https://firebasestorage.googleapis.com/v0/b/onsurance-new.appspot.com/o/cotacao-auto%2Fcarrinho.png?alt=media&token=ac93a01c-2cad-49c1-87b9-6ccc810562ca" width="60" height="60" style="display: block;" alt="Carrinho de Compras" />
                                </td>
                              </tr>
                              <tr>
                                <td align="center">
                                  1. Compra do Crédito Inicial
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td width="130" bgcolor="#f5f5f5"
                          style="
                          font-family: Opens_Sans;
                          padding: 0px 20px 0px 0px;
                          "
                          valign="top">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td align="center"
                                style="padding: 0px 0px 5px 0px;">
                                  <img src="https://firebasestorage.googleapis.com/v0/b/onsurance-new.appspot.com/o/cotacao-auto%2Fdocumento1.png?alt=media&token=14545fef-8a76-4fe2-b397-4c72d24ca9ca" width="60" height="60" style="display: block;" alt="Primeira Documentação" />
                                </td>
                              </tr>
                              <tr>
                                <td align="center">
                                  2. Vistoria e Envio da Documentação
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td width="130" align="center" bgcolor="#f5f5f5"
                          style="
                          font-family: Opens_Sans;
                          padding: 0px 20px 0px 0px;
                          "
                          valign="top">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td align="center"
                                style="padding: 0px 0px 5px 0px;">
                                  <img src="https://firebasestorage.googleapis.com/v0/b/onsurance-new.appspot.com/o/cotacao-auto%2Fdocumento2.png?alt=media&token=44ee546f-22c9-42ec-add0-cd525bf47da6" width="60" height="60" style="display: block;" alt="Segunda Documentação" />
                                </td>
                              </tr>
                              <tr>
                                <td align="center">
                                  3. Aprovação em até 24h e uso imediato
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td width="130" align="center" bgcolor="#f5f5f5"
                          style="
                          font-family: Opens_Sans;
                          padding: 0px 10px 0px 0px;
                          "
                          valign="top">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td align="center"
                                style="padding: 0px 0px 5px 0px;">
                                  <img src="https://firebasestorage.googleapis.com/v0/b/onsurance-new.appspot.com/o/cotacao-auto%2Fcaixa.png?alt=media&token=ea9b6c0a-6a86-4f1a-a6bc-e5137fe8cea2" width="60" height="60" style="display: block;" alt="Caixa do Produto" />
                                </td>
                              </tr>
                              <tr>
                                <td align="center">
                                  4. Recebe o Onsurance OnBoard* em casa.
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table border="0" cellpadding="0" cellspacing="0">
                    </td>
                  </tr>
                  <tr>
                    <td align="center"
                      style="
                      padding: 35px 0px 20px 0px;
                      font-size: 15px;
                      font-family: Opens_Sans;
                      "
                      bgcolor="#f5f5f5"
                    >
                      *O aparelho <b>Onsurance Onboard</b> chega em até 45 dias, com as orientações para oficina
                      credenciada de instalação.
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 0px 0px 10px 0px;" bgcolor="#f5f5f5">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="50">
                            &nbsp;
                          </td>
                          <td bgcolor="#f5f5f5">
                            <hr>
                          </td>
                          <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="50">
                            &nbsp;
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0px 0px 20px 0px;" bgcolor="#f5f5f5">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <td width="30%" align="center"
                        style="padding: 5px 0px 5px 0px;">
                          <a href="https://loja.onsurance.me/termos-de-uso/"
                          style="
                          text-decoration: none;
                          font-family: Opens_Sans;
                          color: #4fc3f7;
                          ">TERMO DE USO</a>
                        </td>
                        <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="5%">
                          &nbsp;
                        </td>
                        <td width="30%" align="center"
                        style="padding: 5px 0px 5px 0px;">
                          <a href="#"
                          style="
                          text-decoration: none;
                          font-family: Opens_Sans;
                          color: #4fc3f7;
                          ">REFAZER COTAÇÃO</a>
                        </td>
                        <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="5%">
                          &nbsp;
                        </td>
                        <td width="30%" align="center"
                        style="padding: 5px 0px 5px 0px;">
                          <a href="https://loja.onsurance.me/"
                          style="
                          text-decoration: none;
                          font-family: Opens_Sans;
                          color: #4fc3f7;
                          ">CONTRATAR AGORA!</a>
                        </td>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td bgcolor="#9e9e9e" style="padding: 10px 10px 10px 10px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td width="70%"
                          style="
                          color: #fff;
                          font-family: Opens_Sans;
                          ">
                            Copyright © 2017 - 2020 Onsurance, Inc.
                          </td>
                          <td width="30%" align="right" style="color: #fff;" valign="middle">
                            <a href="https://m.me/onsurance.me">
                              <img src="https://firebasestorage.googleapis.com/v0/b/onsurance-new.appspot.com/o/cotacao-auto%2Fmessenger.png?alt=media&token=155993a5-56bb-4c77-b1ce-911a477ff13e" alt="Facebook" width="25" height="25" />
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
        
        </body>
      </html>`
      }

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
              to: `${result.email}`,
              cc: [
                `matheus.lopes@onsurance.me`,
              ],
              subject: 'Onsurance - Resultado da sua cotação para o Onsurance Auto',
              text: `Aqui está sua cotação`,
              html: respostaAuto.body,
          }
      };
      
      transporter.sendMail(mailOptions(), function(error, info){
        if (error) {
          console.error(new Error(`TCL: sendEmail -> sendQuoteAutoResult -> error: ${JSON.stringify(error)}`));
          throw new Error(`${error}`);
        } else {
          console.log('Email sent sendQuoteAutoResult: ' + info.response);
        }
      });
    } catch (error) {
      console.error(new Error(`TCL: sendEmail -> sendQuoteAutoResult -> error: ${JSON.stringify(error)}`));
      throw new Error(`${error}`);
    };       
  }

  sendQuoteTireResult (result) {
  
    try {
      const respostaPneus = {
        body: `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <title>Resultado cotação Onsurance Pneus</title>
        </head>
        <style>
        @font-face {
          font-family: Montserrat;
          src: url('./fonts/Montserrat/Montserrat-Regular.ttf');
        }
        @font-face {
          font-family: Montserrat;
          src: url('./fonts/Montserrat/Montserrat-SemiBold.ttf');
          font-weight: bold;
        }
        @font-face {
          font-family: Opens_Sans;
          src: url('./fonts/Open_Sans/OpenSans-Regular.ttf');
        }
        @font-face {
          font-family: Opens_Sans;
          src: url('./fonts/Open_Sans/OpenSans-SemiBold.ttf');
          font-weight: bold;
        }
        </style>
        <body>
        
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td>
                <table
                  align="center"
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  width="600"
                  style="
                  border-collapse: separate !important;
                  border-width: 1px 1px 0px 1px;
                  border-style: solid;
                  border-color: #cccccc;
                  border-spacing: 0;
                  "
                >
                  <tr>
                    <td align="center" bgcolor="#ffffff"
                    style="
                    padding: 25px 0 25px 0;
                    ">
                        <img src="https://firebasestorage.googleapis.com/v0/b/onsurance-new.appspot.com/o/cotacao-auto%2FLogo.png?alt=media&token=b1a2262f-b519-4ace-ad90-704b82fd36c8" alt="Onsurance Inc." width="300" height="40" />
                    </td>
                  </tr>
                  <tr>
                    <td align="center" bgcolor="#f5f5f5"
                      style="
                      padding: 40px 0px 30px 0px;
                      font-size: 24px;
                      font-family: Montserrat;
                      font-weight: bold;
                      "
                    >
                      VEJA O RESULTADO DA SUA COTAÇÃO!
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <table
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                      >
                        <tr>
                          <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="10">
                            &nbsp;
                          </td>
                          <td width="280px" valign="top" bgcolor="#f5f5f5">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td align="center"
                                style="
                                color: #1890ff;
                                font-size: 16px;
                                font-family: Opens_Sans;
                                padding: 5px 0px 0px 0px;
                                border-radius: 5px 5px 0px 0px;
                                background-color: #ffffff;
                                ">
                                  R$
                                </td>
                              </tr>
                              <tr>
                                <td align="center"
                                style="
                                color: #1890ff;
                                font-size: 27px;
                                font-weight: 600;
                                font-family: Opens_Sans;
                                background-color: #ffffff;
                                ">
                                  ${result.activationCredit}
                                </td>
                              </tr>
                              <tr>
                                <td align="center"
                                style="
                                font-size: 13px;
                                color: #494949;
                                font-family: Opens_Sans;
                                padding: 0px 0px 5px 0px;
                                border-radius: 0px 0px 5px 5px;
                                background-color: #ffffff;
                                ">
                                  Crédito inicial.
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="20">
                            &nbsp;
                          </td>
                          <td width="280px" valign="top" bgcolor="#f5f5f5">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td align="center"
                                style="
                                color: #1890ff;
                                font-size: 16px;
                                font-family: Opens_Sans;
                                padding: 5px 0px 0px 0px;
                                border-radius: 5px 5px 0px 0px;
                                background-color: #ffffff;
                                ">
                                  R$
                                </td>
                              </tr>
                              <tr>
                                <td align="center"
                                style="
                                color: #1890ff;
                                font-size: 27px;
                                font-weight: 600;
                                font-family: Opens_Sans;
                                background-color: #ffffff;
                                ">
                                  ${result.minuteValue}
                                </td>
                              </tr>
                              <tr>
                                <td align="center"
                                style="
                                font-size: 13px;
                                color: #494949;
                                font-family: Opens_Sans;
                                padding: 0px 0px 5px 0px;
                                border-radius: 0px 0px 5px 5px;
                                background-color: #ffffff;
                                ">
                                  Consumo por minuto de uso.
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="10">
                            &nbsp;
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" bgcolor="#f5f5f5"
                      style="
                      padding: 40px 0px 30px 0px;
                      font-size: 24px;
                      font-family: Montserrat;
                      font-weight: bold;
                      "
                    >
                     CRÉDITO PRÉ-PAGO QUE NUNCA EXPIRA!
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0px 0px 25px 0px;" bgcolor="#f5f5f5">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="10">
                            &nbsp;
                          </td>
                          <td>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%"
                            style="
                            border-collapse: separate !important;
                            font-family: Opens_Sans;
                            background-color: #f1f1f1;
                            ">
                              <tr>
                                <td align="center"
                                style="
                                border-width: 1px 1px 0px 1px;
                                border-style: solid;
                                border-color: rgb(184, 218, 255);
                                border-radius: 5px 5px 0px 0px;
                                padding: 20px 20px 20px 20px;
                                background-color: rgba(204, 229, 255, 0.3);
                                ">
                                  <img src="https://firebasestorage.googleapis.com/v0/b/onsurance-new.appspot.com/o/cotacao-pneus%2FWebp.net-resizeimage%20(2).png?alt=media&token=36d2f28f-b43f-4710-ac0d-89a7f06cba88"
                                  height="105"
                                  width="200"
                                  style="display: block;"
                                  alt="Pneu" />
                                </td>
                              </tr>
                              <tr>
                                <td
                                style="
                                border-width: 0px 1px 1px 1px;
                                border-style: solid;
                                border-color: rgb(184, 218, 255);
                                border-radius: 0px 0px 5px 5px;
                                padding: 0px 20px 20px 20px;
                                background-color: rgba(204, 229, 255, 0.3);
                                ">
                                  O Onsurance do seu(s) pneu de marca ${result.tireBrand}, de valor total R$ ${result.totalValue} custa R$ ${result.minuteValue} por
                                  minuto! Considerando seu uso diário de ${result.dailyUsage.hours}h:${result.dailyUsage.minutes}m o crédito inicial terá duração
                                  de ${result.creditDuration} meses.
                                  <br/><br/>
                                  Quando acabar, é só fazer uma recarga mínima de R$ 99.
                                </td
                                >
                              </tr>
                            </table>
                          </td>
                          <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="10">
                            &nbsp;
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="10">
                            &nbsp;
                          </td>
                          <td>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%"
                          style="
                          border-collapse: separate !important;
                          font-family: Opens_Sans;
                          background-color: #f1f1f1;
                          ">
                              <tr>
                                <td align="center"
                                style="
                                border-width: 1px 1px 0px 1px;
                                border-style: solid;
                                border-color: rgb(184, 218, 255);
                                border-radius: 5px 5px 0px 0px;
                                padding: 20px 20px 20px 20px;
                                background-color: rgba(204, 229, 255, 0.3);
                                ">
                                  <img src="https://firebasestorage.googleapis.com/v0/b/onsurance-new.appspot.com/o/cotacao-auto%2Fguarda-chuvas.png?alt=media&token=0aa77e45-1081-410d-824e-d34743b0465e"
                                  width="85"
                                  height="85"
                                  style="display: block;"
                                  alt="Guarda-Chuva" />
                                </td>
                              </tr>
                              <tr>
                                <td
                                style="
                                border-width: 0px 1px 1px 1px;
                                border-style: solid;
                                border-color: rgb(184, 218, 255);
                                border-radius: 0px 0px 5px 5px;
                                padding: 20px 20px 20px 20px;
                                background-color: rgba(204, 229, 255, 0.3);
                                ">
                                  Cobertura integral (até 100% do valor de Nota fiscal) contra rasgos, estouro
                                  e avarias que impeçam seu pneu de continuar rodando. 100% do valor do concerto
                                  para pneus furados. Troca de pneus em caso de avarias e guincho em caso de
                                  impossibilidade de continuar o trajeto em detrimento de avarias nos pneus
                                  segurados.
                                </td
                                style="
                                padding: 20px 20px 20px 20px;
                                ">
                              </tr>
                            </table
                          style="
                          padding: 20px 20px 20px 20px;
                          border: 1px solid rgb(184, 218, 255);
                          border-radius: 5px;
                          background-color: rgba(204, 229, 255, 0.1);
                          font-family: Opens_Sans;
                          ">
                          </td>
                          <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="10">
                            &nbsp;
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" bgcolor="#f5f5f5"
                      style="
                      padding: 40px 0px 30px 0px;
                      font-size: 24px;
                      font-family: Montserrat;
                      font-weight: bold;
                      "
                    >
                      ADESÃO SIMPLIFICADA EM 3 ETAPAS
                    </td>
                  </tr>
                  <tr>
                    <td bgcolor="#f5f5f5" style="padding: 0px 0px 20px 0px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td width="140" bgcolor="#f5f5f5"
                          style="
                          font-family: Opens_Sans;
                          padding: 0px 0px 0px 20px;
                          "
                          valign="top">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td align="center"
                                style="padding: 0px 0px 5px 0px;">
                                <img src="https://firebasestorage.googleapis.com/v0/b/onsurance-new.appspot.com/o/cotacao-auto%2Fcarrinho.png?alt=media&token=ac93a01c-2cad-49c1-87b9-6ccc810562ca" width="60" height="60" style="display: block;" alt="Carrinho de Compras" />
                                </td>
                              </tr>
                              <tr>
                                <td align="center">
                                  1. Compra do Crédito Inicial
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td width="140" bgcolor="#f5f5f5"
                          style="
                          font-family: Opens_Sans;
                          padding: 0px 20px 0px 20px;
                          "
                          valign="top">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td align="center"
                                style="padding: 0px 0px 5px 0px;">
                                <img src="https://firebasestorage.googleapis.com/v0/b/onsurance-new.appspot.com/o/cotacao-auto%2Fdocumento1.png?alt=media&token=14545fef-8a76-4fe2-b397-4c72d24ca9ca" width="60" height="60" style="display: block;" alt="Primeira Documentação" />
                                </td>
                              </tr>
                              <tr>
                                <td align="center">
                                  2. Vistoria e Envio da Documentação
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td width="140" align="center" bgcolor="#f5f5f5"
                          style="
                          font-family: Opens_Sans;
                          padding: 0px 20px 0px 0px;
                          "
                          valign="top">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td align="center"
                                style="padding: 0px 0px 5px 0px;">
                                <img src="https://firebasestorage.googleapis.com/v0/b/onsurance-new.appspot.com/o/cotacao-auto%2Fdocumento2.png?alt=media&token=44ee546f-22c9-42ec-add0-cd525bf47da6" width="60" height="60" style="display: block;" alt="Segunda Documentação" />
                                </td>
                              </tr>
                              <tr>
                                <td align="center">
                                  3. Aprovação em até 24h e uso imediato
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table border="0" cellpadding="0" cellspacing="0">
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 0px 0px 20px 0px;" bgcolor="#f5f5f5">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="50">
                            &nbsp;
                          </td>
                          <td bgcolor="#f5f5f5">
                            <hr>
                          </td>
                          <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="50">
                            &nbsp;
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0px 0px 10px 0px;" bgcolor="#f5f5f5">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <td width="30%" align="center"
                        style="padding: 5px 0px 5px 0px;">
                          <a href="https://loja.onsurance.me/termos-de-uso/"
                          style="
                          text-decoration: none;
                          font-family: Opens_Sans;
                          color: #4fc3f7;
                          ">TERMO DE USO</a>
                        </td>
                        <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="5%">
                          &nbsp;
                        </td>
                        <td width="30%" align="center"
                        style="padding: 5px 0px 5px 0px;">
                          <a href="#"
                          style="
                          text-decoration: none;
                          font-family: Opens_Sans;
                          color: #4fc3f7;
                          ">REFAZER COTAÇÃO</a>
                        </td>
                        <td style="font-size: 0; line-height: 0;" bgcolor="#f5f5f5" width="5%">
                          &nbsp;
                        </td>
                        <td width="30%" align="center"
                        style="padding: 5px 0px 5px 0px;">
                          <a href="https://loja.onsurance.me/"
                          style="
                          text-decoration: none;
                          font-family: Opens_Sans;
                          color: #4fc3f7;
                          ">CONTRATAR AGORA!</a>
                        </td>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td bgcolor="#9e9e9e" style="padding: 10px 10px 10px 10px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td width="70%"
                          style="
                          color: #fff;
                          font-family: Opens_Sans;
                          ">
                            Copyright © 2017 - 2020 Onsurance, Inc.
                          </td>
                          <td width="30%" align="right" style="color: #fff;" valign="middle">
                            <a href="https://m.me/onsurance.me">
                              <img src="https://firebasestorage.googleapis.com/v0/b/onsurance-new.appspot.com/o/cotacao-auto%2Fmessenger.png?alt=media&token=155993a5-56bb-4c77-b1ce-911a477ff13e" alt="Facebook" width="25" height="25" />
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
        
        </body>
        </html>`
      }
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
              to: `${result.userEmail}`,
              cc: [
                  `matheus.lopes@onsurance.me`,
              ],
              subject: 'Onsurance - Resultado da sua cotação para o Onsurance Pneus',
              text: `Aqui está sua cotação`,
              html: respostaPneus.body,
          }
      };
      
      transporter.sendMail(mailOptions(), function(error, info){
        if (error) {
          console.error(new Error(`TCL: sendEmail -> sendQuoteTireResult -> error: ${JSON.stringify(error)}`));
          throw new Error(`${error}`);
        } else {
          console.log('Email sent sendQuoteTireResult: ' + info.response);
        }
      });
    } catch (error) {
      console.error(new Error(`TCL: sendEmail -> sendQuoteTireResult -> error: ${JSON.stringify(error)}`));
      throw new Error(`${error}`);
    }
  
  }
}