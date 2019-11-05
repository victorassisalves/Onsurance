'use strict';

import { convertTimestamp } from "../model/timeToDateModel";
import { vehicleData } from "../report/reportDataVehicles";
import { customers} from "../report/reportDataCustomers";

interface customerInterface {
    [id: string] : {
        items: {
          [itemId: string] : {
            itemId: string,
            owner : string,
          }
        },
        personal: {
          cpf : string;
          firstName : string,
          lastName : string,
          userEmail : string;
        }
      },
}

const Excel = require('exceljs');

// Create workbook & add worksheet
const workbook = new Excel.Workbook();
const worksheet = workbook.addWorksheet('Onsurance Report');
const customerWorksheet = workbook.addWorksheet('Onsurance Customer Report');
customerWorksheet.columns = [
    { header: 'CustomerData', key: 'customerClm' },
    { header: 'Second Car', key: 'scdCarClm' },
    { header: 'Vehicle Owner', key: 'vehicleOwnerClm' },
    { header: 'Owner Email', key: 'emailClm' },
    { header: 'Current Balance', key: 'currentBalanceClm' },
    { header: 'CPF', key: 'cpfClm' },
    { header: 'ThirdParty', key: 'trdClm' },

]
// add column headers
worksheet.columns = [
    { header: 'CustomerData', key: 'customerClm' },
    { header: 'Vehicle Owner', key: 'vehicleOwnerClm' },
    { header: 'Owner Email', key: 'emailClm' },
    { header: 'CPF', key: 'cpfClm' },
    { header: 'Third Party User', key: 'trdClm' },
    { header: 'General', key: 'generalClm' },
    { header: 'Operation Time', key: 'opClm' },
    { header: 'Vehicles', key: 'vehiclesClm' },
    { header: 'Spent', key: 'spentClm' },
    { header: 'Monthly', key: 'monthlyClm' },
    { header: 'Initial Value', key: 'initialClm' },
    { header: 'Current Balance', key: 'finalClm' },
];

interface UsageDataInterface {
    general?: {
        activations?: number;
        firstActivationTS?: string;
        firstActivation?: Date;
        protectedMinutesTotal?: number;
        cpf?: number | string;
        name?: string;
        spent: any;
    },
    monthly?: Object;
};
interface generalReportDataInterface {
    general?: {
        activations?: number;
        firstActivation?: Date;
        protectedMinutesTotal?: number;
        vehicles: number;
        spent: any;
        operationTime?: number;
    },
    monthly?: Object;
};
let usageData: Object = {};
let generalReportData: generalReportDataInterface = {}
let generalPeriods: Array<string> = [];

type numStr = number | string;

interface OldDataInterface {
    finalSwitch?: string;
    initialSwitch?: string;
    tempoUso?: string;
    timeEnd?: string;
    timeStart?: string;
    user?: string;
    valorConsumido?: any;
};

interface NewDataInterface {
    activationUser: string;
    closed: boolean;
    consumedValue: any;
    deactivationUser: string;
    finalSwitch: number;
    initialSwitch: number;
    policies?: Object;
    timeEnd: numStr;
    timeStart: numStr;
    useTime: number;
};

interface MonthInterface {
    activations?: number;
    spent?: number;
    protectedMinutes?: number;
    intialAmount?: number;
    finalAmount?: number;
}

interface OlderDataInterface {
    finalProtecao: "1545354681 - Sexta - 21/12/2018 - 1:11:21",
    inicioProtecao: "1545345169 - Quinta - 20/12/2018 - 22:32:49",
    saldoFinal: any,
    saldoInicial: any,
    tempoUso: any,
    valorconsumido: any
}

function saveGeneralReport(spent: number, protectedMinutes: number, month: string, customerGeneralReportData){
    // ADD in the general report data 
    // generalReportData.monthly[month].activations += 1;
    generalReportData.monthly[month].spent = parseFloat((generalReportData.monthly[month].spent+ spent).toFixed(5));
    // generalReportData.monthly[month].protectedMinutes += protectedMinutes;

    generalReportData.general.spent = parseFloat((generalReportData.general.spent+ spent).toFixed(5));
    // generalReportData.general.activations += 1;
    // generalReportData.general.protectedMinutesTotal += protectedMinutes;

    customerGeneralReportData.general.spent = parseFloat((customerGeneralReportData.general.spent+ spent).toFixed(5));
    // customerGeneralReportData.general.activations += 1;
    // customerGeneralReportData.general.protectedMinutesTotal += protectedMinutes;
};

// Treat the OLDER log use data model for recieving data
async function olderDataTreatment (logUseSingle: OlderDataInterface, usagePeriods: Array<string>, monthlyUsage, customerGeneralReportData){

    const timeStart = logUseSingle.inicioProtecao.slice(0, 10)
    const timeEnd = logUseSingle.finalProtecao.slice(0, 10)
    const usageDateInfo = await convertTimestamp(timeStart);

    const initialSwitch = parseFloat((parseFloat(logUseSingle.saldoInicial)/1000).toFixed(5));
    const finalSwitch = parseFloat((parseFloat(logUseSingle.saldoFinal)/1000).toFixed(5));

    const month = `${usageDateInfo.year}/${usageDateInfo.month}`;

    if (!usagePeriods.includes(month)){

        usagePeriods.push(month);

        monthlyUsage[month] = {
            // activations: 0,
            intialAmount: initialSwitch,
            finalAmount: finalSwitch,
            spent: 0,
            // protectedMinutes: 0,
        };
        customerGeneralReportData.monthly[month] = {
            // activations: 0,
            spent: 0,
            // protectedMinutes: 0,
        };
    }

    if (!generalPeriods.includes(month)){
        generalPeriods.push(month);
        generalReportData.monthly[month] = {
            // activations: 0,
            spent: 0,
            // protectedMinutes: 0,
        };
    }
    let monthData = monthlyUsage[month];
    const spent = parseFloat((parseFloat(logUseSingle.valorconsumido)/1000).toFixed(5));
    const protectedMinutes = (parseInt(timeEnd) - parseInt(timeStart))/60|0;

    await saveGeneralReport(spent, protectedMinutes, month, customerGeneralReportData);

    // monthData.activations += 1;
    monthData.spent = parseFloat(((monthData.spent + spent)).toFixed(5));
    // monthData.protectedMinutes += protectedMinutes;

    if (monthData.intialAmount < initialSwitch) {
        monthData.intialAmount = initialSwitch;
    }
    if (monthData.finalAmount > finalSwitch){
        monthData.finalAmount = finalSwitch;
    }
    return {
        monthData: monthData,
        month: month
    }


};

// Treat the OLD log use data model for recieving data
async function oldDataTreatment (logUseSingle: OldDataInterface, usagePeriods: Array<string>, monthlyUsage, customerGeneralReportData){
    const usageDateInfo = await convertTimestamp(logUseSingle.timeStart);

    const month = `${usageDateInfo.year}/${usageDateInfo.month}`;

    const initialSwitch = parseFloat((parseFloat(logUseSingle.initialSwitch)/1000).toFixed(5));
    const finalSwitch = parseFloat((parseFloat(logUseSingle.finalSwitch)/1000).toFixed(5));
    
    if (!usagePeriods.includes(month)){

        usagePeriods.push(month);

        monthlyUsage[month] = {
            // activations: 0,
            intialAmount: initialSwitch,
            finalAmount: finalSwitch,
            spent: 0,
            // protectedMinutes: 0,
        };
        customerGeneralReportData.monthly[month] = {
            // activations: 0,
            spent: 0,
            // protectedMinutes: 0,
        };
    }
    if (!generalPeriods.includes(month)){
        generalPeriods.push(month);
        generalReportData.monthly[month] = {
            // activations: 0,
            spent: 0,
            // protectedMinutes: 0,
        };
    }
    let monthData = monthlyUsage[month];
    const spent = parseFloat((parseFloat(logUseSingle.valorConsumido)/1000).toFixed(5));
    const protectedMinutes = (parseInt(logUseSingle.timeEnd) - parseInt(logUseSingle.timeStart))/60|0;

    await saveGeneralReport(spent, protectedMinutes, month, customerGeneralReportData);

    // monthData.activations += 1;
    monthData.spent = parseFloat(((monthData.spent + spent)).toFixed(5));
    // monthData.protectedMinutes += protectedMinutes;

    if (monthData.intialAmount < initialSwitch) {
        monthData.intialAmount = initialSwitch;
    }
    if (monthData.finalAmount > finalSwitch){
        monthData.finalAmount = finalSwitch;
    }
    return {
        monthData: monthData,
        month: month
    }
};

// Treat the NEW log use data model for recieving data
async function newDataTreatment(logUseSingle: NewDataInterface, usagePeriods: Array<string>, monthlyUsage, customerGeneralReportData){
    const usageDateInfo = await convertTimestamp(logUseSingle.timeStart);

    const month = `${usageDateInfo.year}/${usageDateInfo.month}`;

    const initialSwitch = parseFloat((logUseSingle.initialSwitch/1000).toFixed(5));
    const finalSwitch = parseFloat((logUseSingle.finalSwitch/1000).toFixed(5));

    if (!usagePeriods.includes(month)){

        usagePeriods.push(month);

        monthlyUsage[month] = {
            // activations: 0,
            intialAmount: initialSwitch,
            finalAmount: finalSwitch,
            spent: 0,
            // protectedMinutes: 0,
        };
        customerGeneralReportData.monthly[month] = {
            // activations: 0,
            spent: 0,
            // protectedMinutes: 0,
        };
    }

    if (!generalPeriods.includes(month)){
        generalPeriods.push(month);
        generalReportData.monthly[month] = {
            // activations: 0,
            spent: 0,
            // protectedMinutes: 0,
        };
    }
    let monthData = monthlyUsage[month];

    const spent = parseFloat((parseFloat(logUseSingle.consumedValue)/1000).toFixed(5));
    const protectedMinutes = logUseSingle.useTime/60|0;

    // ADD in the general report data 
    await saveGeneralReport(spent, protectedMinutes, month, customerGeneralReportData);

    // monthData.activations += 1;
    monthData.spent = parseFloat(((monthData.spent + spent)).toFixed(5));
    // monthData.protectedMinutes += protectedMinutes

    if (monthData.intialAmount < initialSwitch) {
        monthData.intialAmount = initialSwitch;
    }
    if (monthData.finalAmount > finalSwitch){
        monthData.finalAmount = finalSwitch;
    }
    return {
        monthData: monthData,
        month: month
    }
};

/**
 * We have to separate the OLDER DATA Model from OLD DATA Model from the NEW DATA MODEL to avoid erros in the report generation
 * @param logUse 
 * In LogUse we may have 3 Data Models -> OLDER: @interface OlderDataInterface , OLD: @interface OldDataInterface , NEW: @interface NewDataInterface. 
 * Using the @param closed property to identify the new model
 * Using the @param user from @interface OldDataInterface property to separate OLD from OLDER data model -> Belongs to OLD
 */
async function iterateLogUseArray(logUse: Object, vehicleId) {
    try {
        const logUseArray: Array<string> = Object.keys(logUse);
        
        let monthlyUsage: Object = {};
        let usagePeriods: Array<string> = [];

        let monthData: MonthInterface = {
            // activations: 0,
            intialAmount: 0,
            finalAmount: 99999999999,
            spent: 0,
            // protectedMinutes: 0,
        };

        let customerGeneralReportData= {
            general:{
                // activations: 0,
                // protectedMinutesTotal: 0,
                spent: 0
            },
            monthly: {}
        };

        // Iterate in LogUse array to get data FROM EACH USE
        await logUseArray.forEach(async element => {

            // Separate the MODELS HERE. OLD vs NEW 
            if (logUse[`${element}`] === null) {
                // customerGeneralReportData.general.activations += 0;
                return 0
            } else if (logUse[`${element}`].closed === null || logUse[`${element}`].closed === undefined) {

                if (logUse[`${element}`].user === null || logUse[`${element}`].user === undefined) {
                    /** THIS IS THE OLDER DATA MODEL
                     * @interface OlderDataInterface 
                     * Use the interface above for reference of the data moldel
                    */
                   const logUseSingle: OlderDataInterface = logUse[`${element}`];
                   const usageDataInfo = await olderDataTreatment(logUseSingle, usagePeriods, monthlyUsage, customerGeneralReportData);
                   monthData = usageDataInfo.monthData;
                   monthlyUsage[usageDataInfo.month] = monthData
                } else {
                    /** THIS IS THE OLD DATA MODEL
                     * @interface OldDataInterface 
                     * Use the interface above for reference of the data moldel
                    */

                    const logUseSingle: OldDataInterface = logUse[`${element}`];
                    const usageDataInfo = await oldDataTreatment(logUseSingle, usagePeriods, monthlyUsage, customerGeneralReportData);
                    monthData = usageDataInfo.monthData;
                    monthlyUsage[usageDataInfo.month] = monthData

                }
                
            } else{
                /** THIS IS THE NEW DATA MODEL
                 * @param NewDataInterface 
                 * Use the interface above for reference of the data moldel
                 */

                const logUseSingle: NewDataInterface = logUse[`${element}`];
                if (!logUseSingle.closed) {
                    logUseSingle.consumedValue = 0
                };
                const usageDataInfo = await newDataTreatment(logUseSingle, usagePeriods, monthlyUsage, customerGeneralReportData);
                
                monthData = usageDataInfo.monthData;
                monthlyUsage[usageDataInfo.month] = monthData

            };

        });
        
        let unordered = monthlyUsage


        await Object.keys(customerGeneralReportData.monthly).sort().forEach(function(key) {
          customerGeneralReportData.monthly[key] = unordered[key];
        });
        return {
            general: customerGeneralReportData.general,
            monthly: customerGeneralReportData.monthly
        }
    } catch (error) {
        console.error(new Error(`Error in Log Use array iteration. Error: ${error}`));
        throw {
            error: `${error}`,
            message: `Error in log use iteration. ${error}`
        };
    }
    
};

/**
 * Iterate through vehicle array data to get the log use from that vehicle
 * @param vehicleArray 
 * After separating the vehicle profile, iterate the log use to work with the data
 */
async function iterateVehicleArray(vehicleArray: Array<string>){
    try {

        await vehicleArray.forEach(async element => {
            const vehicleId = element
            let data;
            // Separate LogUse from the profile and Call the iterate LogUse function
            // Check if vehicle have LOGUSE in profile
            if (vehicleData.vehicle.car[`${element}`].logUse === null || vehicleData.vehicle.car[`${element}`].logUse === undefined) {
                console.log(`TCL: ${element} log use is null or undefined: ${vehicleData.vehicle.car[`${element}`].logUse}`);
            }
            else {
                const logUse: Object = vehicleData.vehicle.car[`${element}`].logUse;
                const logUseData = await iterateLogUseArray(logUse, vehicleId);
                data = {
                    [`${element}`]: logUseData,
                };
                // usageData = Object.assign(data, usageData);
                usageData = Object.assign(usageData, data);


            }
        });
        return usageData;
    } catch (error) {
        console.error(new Error(`Error in vehicle array iteration. Error: ${error}`));
        throw {
            error: `${error}`,
            message: `Error in vehicle array iteration. ${error}`
        };  
    }
};

export function makeReport() {
    return new Promise(async (resolve, reject) => {
        try {

            // Make vehicles array to get Log Use
            const vehilesArrayId: Array<string> = Object.keys(vehicleData.vehicle.car);
            generalReportData.general = {
                // activations: 0,
                // protectedMinutesTotal: 0,
                spent: 0,
                vehicles: vehilesArrayId.length
            }
            generalReportData.monthly = {};
            generalPeriods = [];
            //Call the function that iterates through the array
            const reportData = await iterateVehicleArray(vehilesArrayId);
            generalReportData.general.operationTime = (Object.keys(generalReportData.monthly)).length;
              
              let unordered = generalReportData.monthly
              const ordered = {};
            // Add row using key mapping to columns
            const addRow = { 
                generalClm: "General Information", 
                spentClm: generalReportData.general.spent, 
                opClm: generalReportData.general.operationTime, 
                vehiclesClm: generalReportData.general.vehicles 
            };

            await Object.keys(generalReportData.monthly).sort().forEach(function(key) {
                ordered[key] = unordered[key];
                // Add row using key mapping to columns
                worksheet.columns = [...worksheet.columns,
                    {header: key, key: key}
                ];
                addRow[`${key}`] = generalReportData.monthly[key].spent 
            });
            await worksheet.addRow(addRow);
            console.log(`General report ok!`)

            Object.keys(reportData).forEach(async id => {

                let addRow = {
                    customerClm: id,
                    spentClm: reportData[id].general.spent,
                };

                let initialSwitch = 0;
                let finalSwitch = 0;

                Object.keys(reportData[id].monthly).forEach(month => {

                    if (initialSwitch < reportData[id].monthly[month].intialAmount) {
                        initialSwitch = reportData[id].monthly[month].intialAmount
                    };

                    if (finalSwitch === 0 ){
                        finalSwitch = reportData[id].monthly[month].finalAmount;
                    } else if (finalSwitch > reportData[id].monthly[month].finalAmount) {
                        finalSwitch = reportData[id].monthly[month].finalAmount;
                    };

                    addRow[`${month}`] = reportData[id].monthly[month].spent;
        
                }); 

                addRow[`finalClm`] = finalSwitch;
                addRow[`initialClm`] = initialSwitch;
                worksheet.addRow(addRow);

            }); 

            const customerArray = Object.keys(customers);
            let customerRow = {};
            const customerFamily = {};
            await customerArray.forEach(customer => {
                // const customerEmail = customers[customer].personal.userEmail;
                if (customers[customer].items === null || customers[customer].items === undefined) {
                    console.log(`No items for customer ${customer}`)
                    return null;
                } else {
                    if (customers[customer].itemAuthorizations === null || customers[customer].itemAuthorizations === undefined) {

                        if (Object.keys(customers[customer].items).length > 1) {
                            customerRow = {
                                customerClm: Object.keys(customers[customer].items)[0],
                                scdCarClm: Object.keys(customers[customer].items)[1],
                                vehicleOwnerClm: `${customers[customer].personal.firstName} ${customers[customer].personal.lastName}`,
                                emailClm: customers[customer].personal.userEmail,
                                currentBalanceClm: parseFloat(((customers[customer].personal.wallet.switch)/1000).toFixed(5)),
                                cpfClm: customers[customer].personal.cpf
                            }
                        } else {
                            customerRow = {
                                customerClm: Object.keys(customers[customer].items)[0],
                                vehicleOwnerClm: `${customers[customer].personal.firstName} ${customers[customer].personal.lastName}`,
                                emailClm: customers[customer].personal.userEmail,
                                currentBalanceClm: parseFloat(((customers[customer].personal.wallet.switch)/1000).toFixed(5)),
                                cpfClm: customers[customer].personal.cpf
                            }
                        }
                        customerWorksheet.addRow(customerRow)
                    } else {
                        if (customers[customer].itemAuthorizations.myItems === null || customers[customer].itemAuthorizations.myItems === undefined) {
                            console.log(`Third Party user ${customer}`)
                            return null;
                        } else {
                            const values = Object.values(customers[customer].itemAuthorizations.myItems)[0];
                            const userId = Object.keys(values)[0];

                            if (Object.keys(customers[customer].items).length > 1) {
                                customerRow = {
                                    customerClm: Object.keys(customers[customer].items)[0],
                                    scdCarClm: Object.keys(customers[customer].items)[1],
                                    vehicleOwnerClm: `${customers[customer].personal.firstName} ${customers[customer].personal.lastName}`,
                                    emailClm: customers[customer].personal.userEmail,
                                    currentBalanceClm: parseFloat(((customers[customer].personal.wallet.switch)/1000).toFixed(5)),
                                    cpfClm: customers[customer].personal.cpf,
                                    trdClm: customers[userId].personal.userEmail,

                                }
                            } else {

                                customerRow = {
                                    customerClm: Object.keys(customers[customer].items)[0],
                                    vehicleOwnerClm: `${customers[customer].personal.firstName} ${customers[customer].personal.lastName}`,
                                    emailClm: customers[customer].personal.userEmail,
                                    currentBalanceClm: parseFloat(((customers[customer].personal.wallet.switch)/1000).toFixed(5)),
                                    cpfClm: customers[customer].personal.cpf,
                                    trdClm: customers[userId].personal.userEmail,

                                }
                            }
                            console.log("TCL: makeReport -> customerRow", JSON.stringify(customerRow));
                            customerWorksheet.addRow(customerRow)
                        }
                        
                    }
                }
                
            });

            // save workbook to disk
            await workbook.xlsx.writeFile('report.xlsx').then(() => {
                console.log("saved!!!");
            }).catch((err) => {
                console.log("err", err);
            });
              generalReportData.monthly = {};
              generalReportData.monthly = ordered;

            const response = {
                generalData: generalReportData,
                customersReportData: reportData,
            };
            resolve(response)
        } catch (error) {
            console.log("TCL: makeReport -> error", error);
            reject(error);
        }

    });
};