'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const timeToDateModel_1 = require("../model/timeToDateModel");
const reportDataVehicles_1 = require("../report/reportDataVehicles");
const reportDataCustomers_1 = require("../report/reportDataCustomers");
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
];
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
;
;
let usageData = {};
let generalReportData = {};
let generalPeriods = [];
;
;
function saveGeneralReport(spent, protectedMinutes, month, customerGeneralReportData) {
    // ADD in the general report data 
    // generalReportData.monthly[month].activations += 1;
    generalReportData.monthly[month].spent = parseFloat((generalReportData.monthly[month].spent + spent).toFixed(5));
    // generalReportData.monthly[month].protectedMinutes += protectedMinutes;
    generalReportData.general.spent = parseFloat((generalReportData.general.spent + spent).toFixed(5));
    // generalReportData.general.activations += 1;
    // generalReportData.general.protectedMinutesTotal += protectedMinutes;
    customerGeneralReportData.general.spent = parseFloat((customerGeneralReportData.general.spent + spent).toFixed(5));
    // customerGeneralReportData.general.activations += 1;
    // customerGeneralReportData.general.protectedMinutesTotal += protectedMinutes;
}
;
// Treat the OLDER log use data model for recieving data
function olderDataTreatment(logUseSingle, usagePeriods, monthlyUsage, customerGeneralReportData) {
    return __awaiter(this, void 0, void 0, function* () {
        const timeStart = logUseSingle.inicioProtecao.slice(0, 10);
        const timeEnd = logUseSingle.finalProtecao.slice(0, 10);
        const usageDateInfo = yield timeToDateModel_1.convertTimestamp(timeStart);
        const initialSwitch = parseFloat((parseFloat(logUseSingle.saldoInicial) / 1000).toFixed(5));
        const finalSwitch = parseFloat((parseFloat(logUseSingle.saldoFinal) / 1000).toFixed(5));
        const month = `${usageDateInfo.year}/${usageDateInfo.month}`;
        if (!usagePeriods.includes(month)) {
            usagePeriods.push(month);
            monthlyUsage[month] = {
                // activations: 0,
                intialAmount: initialSwitch,
                finalAmount: finalSwitch,
                spent: 0,
            };
            customerGeneralReportData.monthly[month] = {
                // activations: 0,
                spent: 0,
            };
        }
        if (!generalPeriods.includes(month)) {
            generalPeriods.push(month);
            generalReportData.monthly[month] = {
                // activations: 0,
                spent: 0,
            };
        }
        let monthData = monthlyUsage[month];
        const spent = parseFloat((parseFloat(logUseSingle.valorconsumido) / 1000).toFixed(5));
        const protectedMinutes = (parseInt(timeEnd) - parseInt(timeStart)) / 60 | 0;
        yield saveGeneralReport(spent, protectedMinutes, month, customerGeneralReportData);
        // monthData.activations += 1;
        monthData.spent = parseFloat(((monthData.spent + spent)).toFixed(5));
        // monthData.protectedMinutes += protectedMinutes;
        if (monthData.intialAmount < initialSwitch) {
            monthData.intialAmount = initialSwitch;
        }
        if (monthData.finalAmount > finalSwitch) {
            monthData.finalAmount = finalSwitch;
        }
        return {
            monthData: monthData,
            month: month
        };
    });
}
;
// Treat the OLD log use data model for recieving data
function oldDataTreatment(logUseSingle, usagePeriods, monthlyUsage, customerGeneralReportData) {
    return __awaiter(this, void 0, void 0, function* () {
        const usageDateInfo = yield timeToDateModel_1.convertTimestamp(logUseSingle.timeStart);
        const month = `${usageDateInfo.year}/${usageDateInfo.month}`;
        const initialSwitch = parseFloat((parseFloat(logUseSingle.initialSwitch) / 1000).toFixed(5));
        const finalSwitch = parseFloat((parseFloat(logUseSingle.finalSwitch) / 1000).toFixed(5));
        if (!usagePeriods.includes(month)) {
            usagePeriods.push(month);
            monthlyUsage[month] = {
                // activations: 0,
                intialAmount: initialSwitch,
                finalAmount: finalSwitch,
                spent: 0,
            };
            customerGeneralReportData.monthly[month] = {
                // activations: 0,
                spent: 0,
            };
        }
        if (!generalPeriods.includes(month)) {
            generalPeriods.push(month);
            generalReportData.monthly[month] = {
                // activations: 0,
                spent: 0,
            };
        }
        let monthData = monthlyUsage[month];
        const spent = parseFloat((parseFloat(logUseSingle.valorConsumido) / 1000).toFixed(5));
        const protectedMinutes = (parseInt(logUseSingle.timeEnd) - parseInt(logUseSingle.timeStart)) / 60 | 0;
        yield saveGeneralReport(spent, protectedMinutes, month, customerGeneralReportData);
        // monthData.activations += 1;
        monthData.spent = parseFloat(((monthData.spent + spent)).toFixed(5));
        // monthData.protectedMinutes += protectedMinutes;
        if (monthData.intialAmount < initialSwitch) {
            monthData.intialAmount = initialSwitch;
        }
        if (monthData.finalAmount > finalSwitch) {
            monthData.finalAmount = finalSwitch;
        }
        return {
            monthData: monthData,
            month: month
        };
    });
}
;
// Treat the NEW log use data model for recieving data
function newDataTreatment(logUseSingle, usagePeriods, monthlyUsage, customerGeneralReportData) {
    return __awaiter(this, void 0, void 0, function* () {
        const usageDateInfo = yield timeToDateModel_1.convertTimestamp(logUseSingle.timeStart);
        const month = `${usageDateInfo.year}/${usageDateInfo.month}`;
        const initialSwitch = parseFloat((logUseSingle.initialSwitch / 1000).toFixed(5));
        const finalSwitch = parseFloat((logUseSingle.finalSwitch / 1000).toFixed(5));
        if (!usagePeriods.includes(month)) {
            usagePeriods.push(month);
            monthlyUsage[month] = {
                // activations: 0,
                intialAmount: initialSwitch,
                finalAmount: finalSwitch,
                spent: 0,
            };
            customerGeneralReportData.monthly[month] = {
                // activations: 0,
                spent: 0,
            };
        }
        if (!generalPeriods.includes(month)) {
            generalPeriods.push(month);
            generalReportData.monthly[month] = {
                // activations: 0,
                spent: 0,
            };
        }
        let monthData = monthlyUsage[month];
        const spent = parseFloat((parseFloat(logUseSingle.consumedValue) / 1000).toFixed(5));
        const protectedMinutes = logUseSingle.useTime / 60 | 0;
        // ADD in the general report data 
        yield saveGeneralReport(spent, protectedMinutes, month, customerGeneralReportData);
        // monthData.activations += 1;
        monthData.spent = parseFloat(((monthData.spent + spent)).toFixed(5));
        // monthData.protectedMinutes += protectedMinutes
        if (monthData.intialAmount < initialSwitch) {
            monthData.intialAmount = initialSwitch;
        }
        if (monthData.finalAmount > finalSwitch) {
            monthData.finalAmount = finalSwitch;
        }
        return {
            monthData: monthData,
            month: month
        };
    });
}
;
/**
 * We have to separate the OLDER DATA Model from OLD DATA Model from the NEW DATA MODEL to avoid erros in the report generation
 * @param logUse
 * In LogUse we may have 3 Data Models -> OLDER: @interface OlderDataInterface , OLD: @interface OldDataInterface , NEW: @interface NewDataInterface.
 * Using the @param closed property to identify the new model
 * Using the @param user from @interface OldDataInterface property to separate OLD from OLDER data model -> Belongs to OLD
 */
function iterateLogUseArray(logUse, vehicleId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const logUseArray = Object.keys(logUse);
            let monthlyUsage = {};
            let usagePeriods = [];
            let monthData = {
                // activations: 0,
                intialAmount: 0,
                finalAmount: 99999999999,
                spent: 0,
            };
            let customerGeneralReportData = {
                general: {
                    // activations: 0,
                    // protectedMinutesTotal: 0,
                    spent: 0
                },
                monthly: {}
            };
            // Iterate in LogUse array to get data FROM EACH USE
            yield logUseArray.forEach((element) => __awaiter(this, void 0, void 0, function* () {
                // Separate the MODELS HERE. OLD vs NEW 
                if (logUse[`${element}`] === null) {
                    // customerGeneralReportData.general.activations += 0;
                    return 0;
                }
                else if (logUse[`${element}`].closed === null || logUse[`${element}`].closed === undefined) {
                    if (logUse[`${element}`].user === null || logUse[`${element}`].user === undefined) {
                        /** THIS IS THE OLDER DATA MODEL
                         * @interface OlderDataInterface
                         * Use the interface above for reference of the data moldel
                        */
                        const logUseSingle = logUse[`${element}`];
                        const usageDataInfo = yield olderDataTreatment(logUseSingle, usagePeriods, monthlyUsage, customerGeneralReportData);
                        monthData = usageDataInfo.monthData;
                        monthlyUsage[usageDataInfo.month] = monthData;
                    }
                    else {
                        /** THIS IS THE OLD DATA MODEL
                         * @interface OldDataInterface
                         * Use the interface above for reference of the data moldel
                        */
                        const logUseSingle = logUse[`${element}`];
                        const usageDataInfo = yield oldDataTreatment(logUseSingle, usagePeriods, monthlyUsage, customerGeneralReportData);
                        monthData = usageDataInfo.monthData;
                        monthlyUsage[usageDataInfo.month] = monthData;
                    }
                }
                else {
                    /** THIS IS THE NEW DATA MODEL
                     * @param NewDataInterface
                     * Use the interface above for reference of the data moldel
                     */
                    const logUseSingle = logUse[`${element}`];
                    if (!logUseSingle.closed) {
                        logUseSingle.consumedValue = 0;
                    }
                    ;
                    const usageDataInfo = yield newDataTreatment(logUseSingle, usagePeriods, monthlyUsage, customerGeneralReportData);
                    monthData = usageDataInfo.monthData;
                    monthlyUsage[usageDataInfo.month] = monthData;
                }
                ;
            }));
            let unordered = monthlyUsage;
            yield Object.keys(customerGeneralReportData.monthly).sort().forEach(function (key) {
                customerGeneralReportData.monthly[key] = unordered[key];
            });
            return {
                general: customerGeneralReportData.general,
                monthly: customerGeneralReportData.monthly
            };
        }
        catch (error) {
            console.error(new Error(`Error in Log Use array iteration. Error: ${error}`));
            throw {
                error: `${error}`,
                message: `Error in log use iteration. ${error}`
            };
        }
    });
}
;
/**
 * Iterate through vehicle array data to get the log use from that vehicle
 * @param vehicleArray
 * After separating the vehicle profile, iterate the log use to work with the data
 */
function iterateVehicleArray(vehicleArray) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield vehicleArray.forEach((element) => __awaiter(this, void 0, void 0, function* () {
                const vehicleId = element;
                let data;
                // Separate LogUse from the profile and Call the iterate LogUse function
                // Check if vehicle have LOGUSE in profile
                if (reportDataVehicles_1.vehicleData.vehicle.car[`${element}`].logUse === null || reportDataVehicles_1.vehicleData.vehicle.car[`${element}`].logUse === undefined) {
                    console.log(`TCL: ${element} log use is null or undefined: ${reportDataVehicles_1.vehicleData.vehicle.car[`${element}`].logUse}`);
                }
                else {
                    const logUse = reportDataVehicles_1.vehicleData.vehicle.car[`${element}`].logUse;
                    const logUseData = yield iterateLogUseArray(logUse, vehicleId);
                    data = {
                        [`${element}`]: logUseData,
                    };
                    // usageData = Object.assign(data, usageData);
                    usageData = Object.assign(usageData, data);
                }
            }));
            return usageData;
        }
        catch (error) {
            console.error(new Error(`Error in vehicle array iteration. Error: ${error}`));
            throw {
                error: `${error}`,
                message: `Error in vehicle array iteration. ${error}`
            };
        }
    });
}
;
function makeReport() {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            // Make vehicles array to get Log Use
            const vehilesArrayId = Object.keys(reportDataVehicles_1.vehicleData.vehicle.car);
            generalReportData.general = {
                // activations: 0,
                // protectedMinutesTotal: 0,
                spent: 0,
                vehicles: vehilesArrayId.length
            };
            generalReportData.monthly = {};
            generalPeriods = [];
            //Call the function that iterates through the array
            const reportData = yield iterateVehicleArray(vehilesArrayId);
            generalReportData.general.operationTime = (Object.keys(generalReportData.monthly)).length;
            let unordered = generalReportData.monthly;
            const ordered = {};
            // Add row using key mapping to columns
            const addRow = {
                generalClm: "General Information",
                spentClm: generalReportData.general.spent,
                opClm: generalReportData.general.operationTime,
                vehiclesClm: generalReportData.general.vehicles
            };
            yield Object.keys(generalReportData.monthly).sort().forEach(function (key) {
                ordered[key] = unordered[key];
                // Add row using key mapping to columns
                worksheet.columns = [...worksheet.columns,
                    { header: key, key: key }
                ];
                addRow[`${key}`] = generalReportData.monthly[key].spent;
            });
            yield worksheet.addRow(addRow);
            console.log(`General report ok!`);
            Object.keys(reportData).forEach((id) => __awaiter(this, void 0, void 0, function* () {
                let addRow = {
                    customerClm: id,
                    spentClm: reportData[id].general.spent,
                };
                let initialSwitch = 0;
                let finalSwitch = 0;
                Object.keys(reportData[id].monthly).forEach(month => {
                    if (initialSwitch < reportData[id].monthly[month].intialAmount) {
                        initialSwitch = reportData[id].monthly[month].intialAmount;
                    }
                    ;
                    if (finalSwitch === 0) {
                        finalSwitch = reportData[id].monthly[month].finalAmount;
                    }
                    else if (finalSwitch > reportData[id].monthly[month].finalAmount) {
                        finalSwitch = reportData[id].monthly[month].finalAmount;
                    }
                    ;
                    addRow[`${month}`] = reportData[id].monthly[month].spent;
                });
                addRow[`finalClm`] = finalSwitch;
                addRow[`initialClm`] = initialSwitch;
                worksheet.addRow(addRow);
            }));
            const customerArray = Object.keys(reportDataCustomers_1.customers);
            let customerRow = {};
            const customerFamily = {};
            yield customerArray.forEach(customer => {
                // const customerEmail = customers[customer].personal.userEmail;
                if (reportDataCustomers_1.customers[customer].items === null || reportDataCustomers_1.customers[customer].items === undefined) {
                    console.log(`No items for customer ${customer}`);
                    return null;
                }
                else {
                    if (reportDataCustomers_1.customers[customer].itemAuthorizations === null || reportDataCustomers_1.customers[customer].itemAuthorizations === undefined) {
                        if (Object.keys(reportDataCustomers_1.customers[customer].items).length > 1) {
                            customerRow = {
                                customerClm: Object.keys(reportDataCustomers_1.customers[customer].items)[0],
                                scdCarClm: Object.keys(reportDataCustomers_1.customers[customer].items)[1],
                                vehicleOwnerClm: `${reportDataCustomers_1.customers[customer].personal.firstName} ${reportDataCustomers_1.customers[customer].personal.lastName}`,
                                emailClm: reportDataCustomers_1.customers[customer].personal.userEmail,
                                currentBalanceClm: parseFloat(((reportDataCustomers_1.customers[customer].personal.wallet.switch) / 1000).toFixed(5)),
                                cpfClm: reportDataCustomers_1.customers[customer].personal.cpf
                            };
                        }
                        else {
                            customerRow = {
                                customerClm: Object.keys(reportDataCustomers_1.customers[customer].items)[0],
                                vehicleOwnerClm: `${reportDataCustomers_1.customers[customer].personal.firstName} ${reportDataCustomers_1.customers[customer].personal.lastName}`,
                                emailClm: reportDataCustomers_1.customers[customer].personal.userEmail,
                                currentBalanceClm: parseFloat(((reportDataCustomers_1.customers[customer].personal.wallet.switch) / 1000).toFixed(5)),
                                cpfClm: reportDataCustomers_1.customers[customer].personal.cpf
                            };
                        }
                        customerWorksheet.addRow(customerRow);
                    }
                    else {
                        if (reportDataCustomers_1.customers[customer].itemAuthorizations.myItems === null || reportDataCustomers_1.customers[customer].itemAuthorizations.myItems === undefined) {
                            console.log(`Third Party user ${customer}`);
                            return null;
                        }
                        else {
                            const values = Object.values(reportDataCustomers_1.customers[customer].itemAuthorizations.myItems)[0];
                            const userId = Object.keys(values)[0];
                            if (Object.keys(reportDataCustomers_1.customers[customer].items).length > 1) {
                                customerRow = {
                                    customerClm: Object.keys(reportDataCustomers_1.customers[customer].items)[0],
                                    scdCarClm: Object.keys(reportDataCustomers_1.customers[customer].items)[1],
                                    vehicleOwnerClm: `${reportDataCustomers_1.customers[customer].personal.firstName} ${reportDataCustomers_1.customers[customer].personal.lastName}`,
                                    emailClm: reportDataCustomers_1.customers[customer].personal.userEmail,
                                    currentBalanceClm: parseFloat(((reportDataCustomers_1.customers[customer].personal.wallet.switch) / 1000).toFixed(5)),
                                    cpfClm: reportDataCustomers_1.customers[customer].personal.cpf,
                                    trdClm: reportDataCustomers_1.customers[userId].personal.userEmail,
                                };
                            }
                            else {
                                customerRow = {
                                    customerClm: Object.keys(reportDataCustomers_1.customers[customer].items)[0],
                                    vehicleOwnerClm: `${reportDataCustomers_1.customers[customer].personal.firstName} ${reportDataCustomers_1.customers[customer].personal.lastName}`,
                                    emailClm: reportDataCustomers_1.customers[customer].personal.userEmail,
                                    currentBalanceClm: parseFloat(((reportDataCustomers_1.customers[customer].personal.wallet.switch) / 1000).toFixed(5)),
                                    cpfClm: reportDataCustomers_1.customers[customer].personal.cpf,
                                    trdClm: reportDataCustomers_1.customers[userId].personal.userEmail,
                                };
                            }
                            console.log("TCL: makeReport -> customerRow", JSON.stringify(customerRow));
                            customerWorksheet.addRow(customerRow);
                        }
                    }
                }
            });
            // save workbook to disk
            yield workbook.xlsx.writeFile('report.xlsx').then(() => {
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
            resolve(response);
        }
        catch (error) {
            console.log("TCL: makeReport -> error", error);
            reject(error);
        }
    }));
}
exports.makeReport = makeReport;
;
//# sourceMappingURL=reportController.js.map