import { customers } from "./data/reportDataCustomers";

import { Report_UserProfileInterface, 
    Report_UserFinalReportProfile, 
    Report_ItemsInUserProfile, 
    Report_VehicleInUserProfileInterface, 
    Report_BillingInterface,
    Report_VehicleData,
    Report_vehicleV1Interface,
    Report_vehicleV2Interface,
    Report_vehicleV3Interface,
    Report_VehicleAutoLogUse, 
} from "./reportInterface";
import { vehicleData } from "./data/reportDataVehicles";
import * as crypto from "crypto";
import { convertTimestamp } from "../model/timeToDateModel";

const getItemId = (itemPlate: string) => {
    return crypto.createHash('md5').update(itemPlate).digest("hex");
}

const generalReport = {
    spent: 0,
    monthlyUsage: {},
}

/**
 * @description This Class is responsible for generating the report for Onsurance usage (Tires and Auto)
 */
class BuildOnsuranceUsageReport  {
    usageReportTotal: Array<any>;
    totalMinutes: number;
    /**
     * @description This functions is responsible for grouping the functions for generating auto usage report
     * @param itemProfile Vehicle (Auto) profile inside user profile
     */
    protected async generateAutoReportData(itemProfile: Report_VehicleInUserProfileInterface) {
        /**
         * @Todo
         *      buscar o veículo associado - Done
         *      Iterar no log de uso
         *      Tratar os dados
         *      
         */
        try {
            console.log(`TCL: 7.2.0 - buildOnsuranceUsageReport -> generateAutoReportData -> item Profile.`);
            const itemId = getItemId(itemProfile.itemId);
            const vehicleInfo: Report_VehicleData = vehicleData[itemProfile.type][itemProfile.innerType][itemId];
            const useReport = await this.separeteLogUseVergions(vehicleInfo.logUse);
            console.log(`TCL: 7.2.1 - buildOnsuranceUsageReport -> generateAutoReportData -> After separeteLogUseVergions.`);

            return useReport;
        } catch (error) {
            console.error(new Error(`buildOnsuranceUsageReport >-> generateAutoReportData >-> error: ${JSON.stringify(error)}`));
            if (error.message === undefined) throw {
                error: error,
                message: `Error in buildOnsuranceUsageReport -> generateAutoReportData -> function.`
            };
            throw error; 
        };
    }

    private async separeteLogUseVergions(logUse: Report_VehicleAutoLogUse) {
        try {
            let counter = 1;
            let minutes = 0;
            const logUseArray = Object.keys(logUse);
            const usageArray = [];
            console.log(`TCL: 7.2.0.0 - buildOnsuranceUsageReport -> separeteLogUseVergions -> Before ForOF ${counter}.`);

            let allUsage = {};
            for await (const log of logUseArray) {

                if (logUse[log].valorconsumido) { // V1

                    const usage: Report_vehicleV1Interface = logUse[log];

                    // console.log(`TCL: 7.2.0.${counter} - buildOnsuranceUsageReport -> separeteLogUseVergions -> V1.`);

                    const thisUsage = this.generateV1UsageReport(usage);
                    const month = `${thisUsage.month}/${thisUsage.year}`;

                    if (allUsage[month] !== null && allUsage[month] !== undefined){ // Já tem o mês de faturamento
                        allUsage[month].spent += thisUsage.spent; 
                        allUsage[month].totalMinutes += thisUsage.totalMinutes;
                        allUsage[month].activations += 1; 

                    } else { // Não tem o mês de faturamento

                        allUsage = {
                            ...allUsage,
                            [month]: {
                                spent: thisUsage.spent,
                                totalMinutes: thisUsage.totalMinutes,
                                activations: 1,
                            }
                        }
                    }  
                    this.generateGeneralReport(month, thisUsage);
                    minutes += thisUsage.totalMinutes;
                    allUsage[month].spent = parseFloat((allUsage[month].spent).toFixed(3));
                    counter++

                } else if (logUse[log].valorConsumido) { // V2
                    const usage: Report_vehicleV2Interface = logUse[log];
                    // console.log(`TCL: 7.2.0.${counter} - buildOnsuranceUsageReport -> separeteLogUseVergions -> V2.`);


                    const thisUsage = this.generateV2UsageReport(usage);
                    const month = `${thisUsage.month}/${thisUsage.year}`;

                    if (allUsage[month] !== null && allUsage[month] !== undefined){ // Já tem o mês de faturamento
                        // console.log(`TCL: buildOnsuranceUsageReport -> v2Usage[month]`);
                        allUsage[month].spent += thisUsage.spent; 
                        allUsage[month].totalMinutes += thisUsage.totalMinutes; 
                        allUsage[month].activations += 1; 


                    } else { // Não tem o mês de faturamento
                        // console.log(`TCL: buildOnsuranceUsageReport -> v2Usage[month]`);

                        allUsage = {
                            ...allUsage,
                            [month]: {
                                spent: thisUsage.spent,
                                totalMinutes: thisUsage.totalMinutes,
                                activations: 1,
                            }
                        }
                        // console.log(`TCL: buildOnsuranceUsageReport -> v2Usage[month]`);

                    } 
                    this.generateGeneralReport(month, thisUsage);
                    minutes += thisUsage.totalMinutes;
                    allUsage[month].spent = parseFloat((allUsage[month].spent).toFixed(3));
                    counter++

                } else if (logUse[log].closed) { // V3
                    const usage: Report_vehicleV3Interface = logUse[log];
                    // console.log(`TCL: 7.2.0.${counter} - buildOnsuranceUsageReport -> separeteLogUseVergions -> V3.`);

                    const thisUsage = this.generateV3UsageReport(usage);
                    const month = `${thisUsage.month}/${thisUsage.year}`;

                    if (allUsage[month] !== null && allUsage[month] !== undefined){ // Já tem o mês de faturamento

                        allUsage[month].spent += thisUsage.spent; 
                        allUsage[month].totalMinutes += thisUsage.totalMinutes; 
                        allUsage[month].activations += 1; 

                    } else { // Não tem o mês de faturamento

                        allUsage = {
                            ...allUsage,
                            [month]: {
                                spent: thisUsage.spent,
                                totalMinutes: thisUsage.totalMinutes,
                                activations: 1
                            }
                        }

                    }  
                    this.generateGeneralReport(month, thisUsage);
                    minutes += thisUsage.totalMinutes;
                    allUsage[month].spent = parseFloat((allUsage[month].spent).toFixed(3));
                    counter++
                } else { // V?
                    /**
                     * @bug -> if log version is 1 and valorconsumido: 0 ends here.
                     */
                    console.log(`TCL: 7.2.0.${counter} - buildOnsuranceUsageReport -> separeteLogUseVergions -> No Version founded.`);   
                    counter++
                }

            }
            console.log(`TCL: 7.2.0.${counter} - buildOnsuranceUsageReport -> separeteLogUseVergions -> After ForOF.`);
            usageArray.push(allUsage);

            console.log(`TCL: 7.2.0.END -> buildOnsuranceUsageReport -> usageArray`);
            return {
                usageArray: usageArray,
                totalMinutes: minutes,
            };
        } catch (error) {
            console.error(new Error(`buildOnsuranceUsageReport >-> separeteLogUseVergions >-> error: ${JSON.stringify(error)}`));
            console.error(new Error(`buildOnsuranceUsageReport >-> separeteLogUseVergions >-> error.message: ${JSON.stringify(error.message)}`));
            if (error.message === undefined) throw {
                error: error,
                message: `Error in buildOnsuranceUsageReport -> separeteLogUseVergions -> function.`
            };
            throw error; 
        }
    }

    /**
     * @description This functions treats the data in the fisrt verios of the log use.
     * @param {Report_vehicleV1Interface} usage Is the log use representing 1 usage
     */
    private generateV1UsageReport(usage: Report_vehicleV1Interface) {
        try {
            const timeStart = usage.inicioProtecao.slice(0, 10);
            const timeEnd = usage.finalProtecao.slice(0, 10);
            const useTime = parseInt(timeEnd) - parseInt(timeStart);
            const usageDateInfo = convertTimestamp(timeEnd);
            let totalMinutes = (useTime/60|0);                         // TimeDiffMinutesTotais - Tempo de uso em minutos da protecão
            const seconds = (useTime - (totalMinutes*60)); 
            if (seconds > 30 ) {
                totalMinutes++
            }

            let spent: number = parseFloat(usage.valorconsumido);
            const usageData = {
                ...usageDateInfo,
                spent: parseFloat((spent/1000).toFixed(3)),
                totalMinutes: totalMinutes,
            };

            return usageData;
        } catch (error) {
            console.error(new Error(`buildOnsuranceUsageReport >-> generateV1UsageReport >-> error: ${JSON.stringify(error)}`));
            if (error.message === undefined) throw {
                error: error,
                message: `Error in buildOnsuranceUsageReport -> generateV1UsageReport -> function.`
            };
            throw error; 
        }
    }

    private generateV2UsageReport(usage: Report_vehicleV2Interface) {
        try {
            const timeStart = usage.timeStart;
            const timeEnd = usage.timeEnd;
            const useTime = timeEnd - timeStart;

            const usageDateInfo = convertTimestamp(timeEnd);
            let totalMinutes = (useTime/60|0);                         // TimeDiffMinutesTotais - Tempo de uso em minutos da protecão
            const seconds = (useTime - (totalMinutes*60)); 
            if (seconds > 30 ) {
                totalMinutes++
            }

            let spent: number = parseFloat(usage.valorConsumido);
            const usageData = {
                ...usageDateInfo,
                spent: parseFloat((spent/1000).toFixed(3)),
                totalMinutes: totalMinutes,
            };

            return usageData;
        } catch (error) {
            console.error(new Error(`buildOnsuranceUsageReport >-> generateV2UsageReport >-> error: ${JSON.stringify(error)}`));
            if (error.message === undefined) throw {
                error: error,
                message: `Error in buildOnsuranceUsageReport -> generateV2UsageReport -> function.`
            };
            throw error; 
        }
    }

    private generateV3UsageReport(usage: Report_vehicleV3Interface) {
        try {
            const timeStart = usage.timeStart;
            const timeEnd = usage.timeEnd;
            const useTime = timeEnd - timeStart;
            if (useTime !== usage.useTime){
                console.error(`TCL: 7.2.0.x.0 - buildOnsuranceUsageReport -> generateV3UsageReport. UseTime ${useTime} | usage.useTime ${usage.useTime}`);

            }
            let usageDateInfo = convertTimestamp(timeEnd);

            // Separate the new fiscal period. From days 26 to 25
            if (usageDateInfo.day >= 26 && usageDateInfo.year >= 2020){
                usageDateInfo.month = (parseInt(usageDateInfo.month) + 1).toString();
                usageDateInfo.month.length === 1 ?  usageDateInfo.month = `0${usageDateInfo.month}` : usageDateInfo.month
            }
            let totalMinutes = (useTime/60|0);                         // TimeDiffMinutesTotais - Tempo de uso em minutos da protecão
            const seconds = (useTime - (totalMinutes*60)); 
            if (seconds > 30 ) {
                totalMinutes++
            }

            let spent: number = usage.consumedValue;
            const usageData = {
                ...usageDateInfo,
                spent: parseFloat((spent/1000).toFixed(3)),
                totalMinutes: totalMinutes,
            };

            return usageData;
        } catch (error) {
            console.error(new Error(`buildOnsuranceUsageReport >-> generateV3UsageReport >-> error: ${JSON.stringify(error)}`));
            if (error.message === undefined) throw {
                error: error,
                message: `Error in buildOnsuranceUsageReport -> generateV3UsageReport -> function.`
            };
            throw error; 
        }
    }

    private generateGeneralReport(month, usageData) {
        try {
            if (generalReport.monthlyUsage[month] !== null && generalReport.monthlyUsage[month] !== undefined){ // Já tem o mês de faturamento
                generalReport.monthlyUsage[month].spent += usageData.spent; 
                generalReport.monthlyUsage[month].totalMinutes += usageData.totalMinutes;
                generalReport.monthlyUsage[month].activations += 1; 

            } else { // Não tem o mês de faturamento
                generalReport.monthlyUsage = {
                    ...generalReport.monthlyUsage,
                    [month]: {
                        spent: usageData.spent,
                        totalMinutes: usageData.totalMinutes,
                        activations: 1,
                    }
                };

                generalReport.monthlyUsage[month].spent = parseFloat((generalReport.monthlyUsage[month].spent).toFixed(3));
            } 
        } catch (error) {
            
        }
    }

}

// Se o dia for maior que 25, contar o mes mais 1.


/**
 * @todo
 *  Percorrer o perfil do user
 *      1 - Pegar e tratar informações de billing
 *      2 - Pegar e tratar informações de items
 *      3 - Pegar e tratar informações do Perfil
 *      4 - Pegar e tratar informações sobre terceiros
 */
export class BuildUserProfileReport extends BuildOnsuranceUsageReport {
    customersObj: any;
    userReportArray: Array<any> = [];
    usageTimeMedia = {
        hourMedia: 0,
        numberOfMonths: 0,
        users: 0,
    }
    constructor() {
        super();
        this.customersObj = customers;
        this.userReportArray = this.userReportArray
    };

    public async getProfile() {
        try {
            const usersArray = Object.keys(this.customersObj);
            console.info(`TCL: 1 -buildUserProfileReport -> getProfile >-> After TurnProfileInArray`);
            await this.iterateUsersArray(usersArray);
            console.log(`TCL: Last of Class - buildUserProfileReport -> getProfile >-> After iterateUsersArray`);
            const usageMedia = (this.usageTimeMedia.hourMedia/this.usageTimeMedia.users);
            console.log(`TCL: buildUserProfileReport -> usageMedia Months`, usageMedia);
            console.log(`TCL: buildUserProfileReport -> General Report`, JSON.stringify(generalReport));
            console.log(`TCL: buildUserProfileReport -> number of Users`, this.usageTimeMedia.users);
            console.log(`TCL: buildUserProfileReport -> total of hours`, this.usageTimeMedia.hourMedia);
            
            return this.userReportArray;   
        } catch (error) {
            console.error(new Error(`buildUserProfileReport >-> getProfile >-> error: ${JSON.stringify(error)}`));
            if (error.message === undefined) throw {
                error: error,
                message: `Error in getProfile function.`
            };
            throw error; 
        }
    };

    private async iterateUsersArray(usersArray: Array<string>){
        try {

            console.log(`TCL: 2 - buildUserProfileReport -> iterateUsersArray >-> Before For of`);

            for await ( let user of usersArray) {

                console.log(`TCL: 3 - buildUserProfileReport -> iterateUsersArray >-> user`, user);

                let userInfo: Report_UserFinalReportProfile = {
                    userId: user,
                    billing: '',
                    items: '',
                    cpf: '',
                    email: ','
                };

                const userProfile: Report_UserProfileInterface = this.customersObj[user];
                console.log(`TCL: 4 - buildUserProfileReport -> iterateUsersArray >-> userProfile`);
                switch (userProfile.personal.userEmail) {
                    // case 'victor.assis.alves@gmail.com':
                    case 'victor.assis@onsurance.me':
                    case 'victor@onsurance.me':
                    case 'ricardo@onsurance.me':
                    case 'adilair@onsurance.me':
                    case 'adilasjr@hotmail.com':
                    case 'ricardo@tripshop.com.br':
                    case 'Gentehumilde@gmail.com':
                    case "adilair@gmail.com":
                        break;
                
                    default:
                        if (userProfile.personal.clientId !== null && userProfile.personal.clientId !== undefined){

                            userInfo.cpf = userProfile.personal.cpf;
                            userInfo.email = userProfile.personal.userEmail;
        
                            userInfo.billing = await this.userBillingInfo(userProfile.billing); // 5 step
                            console.log(`TCL: 6 - buildUserProfileReport -> iterateUsersArray >-> After userBillingInfo`);
                            
                            userInfo.items  = await this.userItemsInfo(userProfile.items, userProfile.personal.userEmail); // 7 step
                            console.log(`TCL: 8 - buildUserProfileReport -> iterateUsersArray >-> After userItemsInfo`);
                            
                            this.userReportArray.push(userInfo);
        
                        } else {
                            console.log(`TCL: 5 - 6 - 7 - 8 - buildUserProfileReport -> iterateUsersArray >-> Not a buying client`);
                        }
                }
                
            };

            console.log(`TCL: 9 - buildUserProfileReport -> iterateUsersArray >-> Before return.`);
            return this.userReportArray;
        } catch (error) {
            console.error(new Error(`buildUserProfileReport >-> iterateUsersArray >-> error: ${JSON.stringify(error)}`));
            if (error.message === undefined) throw {
                error: error,
                message: `Error in iterateUsersArray function.`
            };
            throw error;
            
        }
    };

    private async userBillingInfo(userBilling: Report_BillingInterface){
        /**
         * @todo
         *      Get the billing day
         *      Get number of billing times
         *      Generate billing Months and billing values
         *      Mount data in excel format
         */
        try {
            console.log(`TCL: 5.0 - buildUserProfileReport -> userBillingInfo >-> userBilling`);

            return userBilling;
        } catch (error) {
            console.error(new Error(`buildUserProfileReport >-> useBillingInfo >-> error: ${JSON.stringify(error)}`));
            if (error.message === undefined) throw {
                error: error,
                message: `Error in userBillingInfo function.`
            };
            throw error;  
        }
    };

    private async userItemsInfo(userItems: Report_ItemsInUserProfile, userEmail: string) {
        /**
         * @Todo
         *      Get user items
         *      For each user item get item in items user array.
         *          Prepare for tire *
         *      Iterate item logUse to get usage data
         *      Mount data in excel format
         */
        try {

            console.log(`TCL: 7.0 - buildUserProfileReport -> userItemsInfo -> Start`);
            const items = Object.keys(userItems);
            const userUsageReport = []; //Usage report for all items
            for await (const vehicle of items) {
                console.log(`TCL: 7.1 - buildUserProfileReport -> userItemsInfo -> Inside for of. Vehicle:`, vehicle);

                if (vehicle === 'tires'){
                    console.log(`TCL: 7.2 - buildUserProfileReport -> userItemsInfo -> Inside for of -> Onsurance Tires.`);
                    userUsageReport.push(vehicle);
                } else {
                    console.log(`TCL: 7.2 - buildUserProfileReport -> userItemsInfo -> Inside for of -> Onsurance Auto.`);
                    const autoInfo: Report_VehicleInUserProfileInterface = userItems[vehicle];
                    if (userEmail === autoInfo.owner){
                        const vehicleReport = await this.generateAutoReportData(userItems[vehicle]) // Returns the usage report for 1 item
                        const months = vehicleReport.usageArray.length;
                        const hours = vehicleReport.totalMinutes/60;
                        const media = parseFloat((hours/months).toFixed(1));
                        this.usageTimeMedia.hourMedia += media;

                        const itemReport = {
                            [vehicle]: vehicleReport.usageArray,
                        };
                        console.log(`TCL: 7.3 - buildUserProfileReport -> userItemsInfo >-> itemReport`);
                        userUsageReport.push(itemReport);
                    };
                }     
            };
            console.log(`TCL: 7.4 - buildUserProfileReport -> userItemsInfo -> Before Return.`);
            return userUsageReport;
        } catch (error) {
            console.error(new Error(`buildUserProfileReport >-> userItemsInfo >-> error: ${JSON.stringify(error)}`));
            if (error.message === undefined) throw {
                error: error,
                message: `Error in userItemsInfo function.`
            };
            throw error;  
        }
    };
};