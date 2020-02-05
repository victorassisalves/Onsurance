var unirest = require('unirest');
import axios from 'axios';
import { admin } from '../config/admin';
import crypto = require('crypto');


let db = admin.firestore;

/**
 * @Todo
 *  1 - Checar se o token de acesso está funcionando
 *      1.1 - Renovar o token de acesso
 *  2 - Salvar os dados da cotação de pneus no módulo de leads
 *      2.1 - Criar um sessão de subform para armazenar os dados de cotação > 1
 */


 export class sendQuoteToZoho {
     privateApi: any;
     counter: number;
     constructor(privateApi) {
        this.privateApi = privateApi;
        this.counter = 0;
    };
    /**
     * @description This function update or create a new lead. It triggers all the necessaru functions.
     */
    public async upsertLead() {
        try {
            // get LastAccess token
            const access_token = await this.getAccessToken();
            console.log(`TCL: sendQuoteToZoho -> upsertLead -> access_token`, access_token);

            // Try to use zoho to upsert leads
            const baseUrl: string = "https://www.zohoapis.com/crm/v2/leads/upsert";
            const headers = {
                "Authorization":`Zoho-oauthtoken ${access_token}`,
                "Content-Type": "application/json"
            };

            const body = {
                "data": [
                    {
                        "Last_Name": "Lead_changed Mother fuckin lead",
                        "Email": "newcrmapi@zoho.com",
                        "Company": "abc",
                        "Lead_Status": "Contacted"
                    },
                    {
                        "Last_Name": "New Lead Test",
                        "First_Name": "CRM Lead",
                        "Email": "newlead@zoho.com",
                        "Lead_Status": "Attempted to Contact",
                        "Mobile": "7685635434"
                    }
                ],
                "duplicate_check_fields": [
                    "Email",
                    "Mobile"
                ],
                // "trigger":[ "workflow"]
            }

            console.log('before axios');
            console.log('Counter', this.counter);

            // const response = await axios({
            //     method: 'post',
            //     url: baseUrl,
            //     headers: headers,
            //     data: body,
            // })

            var req = unirest('POST', baseUrl)
            .headers(headers)
            .send(JSON.stringify(body))
            .end(async function (res) { 
                if (res.error) {
                    this.counter++
                    if (this.counter === 4){
                        this.counter = 0
                        throw new Error(res.error)
                    }
                    const newToken = await this.renewAccessToken();
                    console.log(`TCL: sendQuoteToZoho -> upsertLead -> newToken`, newToken);
                    this.upsertLead();
                }
                console.log(res.raw_body);
            });
            

        } catch (error) {
            console.error(`TCL: sendQuoteToZoho >-> UpsertLead >-> error: ${JSON.stringify(error)}`);
            throw new Error(error);
        }
        
    };

    /**
     * @description This function get's the last used access_token for zoho api from DB
     */
    private async getAccessToken() {
        try {
            
            const tokenRef = db.collection('zohoApi').doc('y4qmaP2Tb2FfwuEkyQay');
            const encriptedToken = await tokenRef.get().then(async(doc) => {
                    if (!doc.exists) {
                        console.log('No such document!');
                        return await this.renewAccessToken()
                    } else {
                        return doc.data();
                    }
                }).catch(err => {
                    console.error('Error getting document', err);
                    throw err;
                });

            const access_token = await this.decipherToken(encriptedToken.access_token);
            console.log(`TCL: sendQuoteToZoho -> getAccessToken -> access_token`, access_token);
            return access_token;
        } catch (error) {
            console.error(new Error(`TCL: sendQuoteToZoho -> GetAccessToken -> Error: ${JSON.stringify(error)}`));
            throw error;
        }
    }

    private createSubform() {
        return true;
    }

    /**
     * @description This function renew the access_token if the token is old and invalid
     */
    private async renewAccessToken() {
        try {
            const baseUrl: string = "https://accounts.zoho.com/oauth/v2/token";
            const refreshToken = `1000.8a6f3a40e674b00b4181921d2688e0cf.739b629c585e1d2876fdd4d1587fec30`;
            const clientId = `1000.M8HE5E2J8X33G6BLHEIMQ4PLAOXX1H`;
            const clientSecret = `7aa1db34bafe3d116c1143c5a718a847b744225ba0`;
            const params = `refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token`;
    
            const response = await axios.post(`${baseUrl}?${params}`);
            console.log(`TCL: response: ${JSON.stringify(response.data)}`);
 
            const encryptedToken = await this.cipherToken(response.data.access_token);
            console.log(`TCL: sendQuoteToZoho -> renewAccessToken -> encryptedToken`, encryptedToken);

            await db.collection('zohoApi').doc('y4qmaP2Tb2FfwuEkyQay').set({
                access_token: encryptedToken,
                // access_token: response.data.access_token
            });

            return response.data.access_token;
        } catch (error) {
            console.error(new Error(`TCL: sendQuoteToZoho -> renewAccessToken -> Error: ${JSON.stringify(error)}`));

            throw error;
            
        }
    };

    /**
     * @description This function decipher the DB zoho api access_token
     * @param encriptedToken It's the encrypted token fron DB
     */
    private async decipherToken(encriptedToken: string) {
        try {

            const algorithm = 'aes-192-cbc';
            const password = 'New zoho api key generated.';
            // Use the async `crypto.scrypt()` instead.
            const key = crypto.scryptSync(password, 'salt', 24);
            // The IV is usually passed along with the ciphertext.
            const iv = Buffer.alloc(16, 0); // Initialization vector.
            
            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            
            // Encrypted using same algorithm, key and iv.
            const encrypted = encriptedToken;
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            console.log(`TCL: sendQuoteToZoho -> decrypted`, decrypted);
            // Prints: some clear text data
            
            return decrypted;
            // Prints: some clear text data
        } catch (error) {
            console.error(new Error(`TCL: sendQuoteToZoho -> decipherToken -> error: ${JSON.stringify(error)}`));
            throw error;
        } 
    }

    /**
     * @description this function cipher the access_token from zoho crm api
     * @param access_token It's the generated access_token from zoho api
     */
    private async cipherToken(access_token: string) {
        try {
            
            const algorithm = 'aes-192-cbc';
            const password = 'New zoho api key generated.';
            // Use the async `crypto.scrypt()` instead.
            const key = crypto.scryptSync(password, 'salt', 24);
            // Use `crypto.randomBytes` to generate a random iv instead of the static iv
            // shown here.
            const iv = Buffer.alloc(16, 0); // Initialization vector.

            const cipher = crypto.createCipheriv(algorithm, key, iv);

            let encrypted = cipher.update(access_token, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            return encrypted;
        } catch (error) {
            console.error(new Error(`TCL: sendQuoteToZoho -> cipherToken -> error: ${JSON.stringify(error)}`));
            throw error;
        }
    }

    
 };