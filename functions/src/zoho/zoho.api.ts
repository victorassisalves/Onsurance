import axios from 'axios';
import { TireQuoteVariables } from "../environment/quotation.variables";


/**
 * @Todo
 *  1 - Checar se o token de acesso está funcionando
 *      1.1 - Renovar o token de acesso
 *  2 - Salvar os dados da cotação de pneus no módulo de leads
 *      2.1 - Criar um sessão de subform para armazenar os dados de cotação > 1
 */


 export class sendQuoteToZoho {
     variables;
     constructor(variables: TireQuoteVariables) {
        this.variables = variables;
    }

    protected upsertLead() {

        this.createSubform()
    };

    private createSubform() {
        return true;
    }

    async renewAccessToken() {
        try {
            const baseUrl: string = "https://accounts.zoho.com/oauth/v2/token";
            const refreshToken = `1000.8a6f3a40e674b00b4181921d2688e0cf.739b629c585e1d2876fdd4d1587fec30`;
            const clientId = `1000.M8HE5E2J8X33G6BLHEIMQ4PLAOXX1H`;
            const clientSecret = `7aa1db34bafe3d116c1143c5a718a847b744225ba0`;
            const params = `refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token`;
    
            const response = await axios.post(`${baseUrl}?${params}`)
            console.log(`TCL: response: ${JSON.stringify(response.data)}`);
            return response.data;
        } catch (error) {
            console.error(error);
            throw error;
            
        }
    }

    
 };