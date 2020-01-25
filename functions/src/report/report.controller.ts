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

const getItemId = (itemPlate) => {
    return crypto.createHash('md5').update(itemPlate).digest("hex");
}

/**
 * @description This Class is responsible for generating the report for Onsurance usage (Tires and Auto)
 */
class buildOnsuranceUsageReport  {

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
            if (!error.message) throw {
                error: error,
                message: `Error in buildOnsuranceUsageReport -> generateAutoReportData -> function.`
            };
            throw error; 
        };
    }

    private async separeteLogUseVergions(logUse: Report_VehicleAutoLogUse) {
        try {
            let counter = 1;
            const logUseArray = Object.keys(logUse);
            console.log(`TCL: 7.2.0.0 - buildOnsuranceUsageReport -> separeteLogUseVergions -> Before ForOF ${counter}.`);

            for await (const log of logUseArray) {
                if (logUse[log].valorconsumido) {
                    let usage: Report_vehicleV1Interface = logUse[log];
                    console.log(`TCL: 7.2.0.${counter} - buildOnsuranceUsageReport -> separeteLogUseVergions -> V1.`);

                } else if (logUse[log].valorConsumido) {
                    let usage: Report_vehicleV2Interface = logUse[log];
                    console.log(`TCL: 7.2.0.${counter} - buildOnsuranceUsageReport -> separeteLogUseVergions -> V2.`);

                } else if (logUse[log].closed) {
                    let usage: Report_vehicleV3Interface = logUse[log];
                    console.log(`TCL: 7.2.0.${counter} - buildOnsuranceUsageReport -> separeteLogUseVergions -> V3.`);
                } else {
                    /**
                     * @bug -> if log version is 1 and valorconsumido: 0 ends here.
                     */
                    console.log(`TCL: 7.2.0.${counter} - buildOnsuranceUsageReport -> separeteLogUseVergions -> No Version founded.`);   
                }
                counter++
            }
            console.log(`TCL: 7.2.0.2 - buildOnsuranceUsageReport -> separeteLogUseVergions -> After For OF.counter ${counter}`);

            return counter
        } catch (error) {
            console.error(new Error(`buildOnsuranceUsageReport >-> separeteLogUseVergions >-> error: ${JSON.stringify(error)}`));
            if (!error.message) throw {
                error: error,
                message: `Error in buildOnsuranceUsageReport -> separeteLogUseVergions -> function.`
            };
            throw error; 
        }
    }

}


/**
 * @todo
 *  Percorrer o perfil do user
 *      1 - Pegar e tratar informações de billing
 *      2 - Pegar e tratar informações de items
 *      3 - Pegar e tratar informações do Perfil
 *      4 - Pegar e tratar informações sobre terceiros
 */
export class buildUserProfileReport extends buildOnsuranceUsageReport {
    customersObj: any;
    userReportArray: Array<any> = [];
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
            return this.userReportArray;   
        } catch (error) {
            console.error(new Error(`buildUserProfileReport >-> getProfile >-> error: ${JSON.stringify(error)}`));
            if (!error.message) throw {
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
                    items: ''
                };

                const userProfile: Report_UserProfileInterface = this.customersObj[user];
                console.log(`TCL: 4 - buildUserProfileReport -> iterateUsersArray >-> userProfile`);
                
                if (userProfile.personal.clientId !== null && userProfile.personal.clientId !== undefined){

                    userInfo.billing = await this.userBillingInfo(userProfile.billing); // 5 step
                    console.log(`TCL: 6 - buildUserProfileReport -> iterateUsersArray >-> After userBillingInfo`);
                    
                    userInfo.items  = await this.userItemsInfo(userProfile.items, userProfile.personal.userEmail); // 7 step
                    console.log(`TCL: 8 - buildUserProfileReport -> iterateUsersArray >-> After userItemsInfo`);

                    this.userReportArray.push(userInfo);

                } else {
                    console.log(`TCL: 5 - 6 - buildUserProfileReport -> iterateUsersArray >-> Not a buying client`);
                }
            };

            console.log(`TCL: 9 - buildUserProfileReport -> iterateUsersArray >-> Before return.`);
            return this.userReportArray;
        } catch (error) {
            console.error(new Error(`buildUserProfileReport >-> iterateUsersArray >-> error: ${JSON.stringify(error)}`));
            if (!error.message) throw {
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
            if (!error.message) throw {
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
                        const itemReport = await this.generateAutoReportData(userItems[vehicle]); // Returns the usage report for 1 item
                        console.log(`TCL: 7.3 - buildUserProfileReport -> userItemsInfo >-> itemReport`);
                        userUsageReport.push(itemReport);
                    };
                }     
            };
            console.log(`TCL: 7.4 - buildUserProfileReport -> userItemsInfo -> Before Return.`);
            return userUsageReport;
        } catch (error) {
            console.error(new Error(`buildUserProfileReport >-> userItemsInfo >-> error: ${JSON.stringify(error)}`));
            if (!error.message) throw {
                error: error,
                message: `Error in userItemsInfo function.`
            };
            throw error;  
        }
    };
};