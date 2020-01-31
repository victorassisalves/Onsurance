import { admin } from "../config/admin";

import ExcelJS = require('exceljs');

// Create workbook & add worksheet
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Onsurance Report');

// add column headers
worksheet.columns = [
    { header: ' ', key: 'blankClm' },
    { header: 'Client Email', key: 'emailClm' },
    { header: 'Client Id', key: 'clientIdClm' },
    { header: 'CPF', key: 'cpfClm' },
    { header: 'Vehicle', key: 'fstVehicleClm' },
    // { header: 'Third Party User', key: 'trdClm' },
    { header: 'Spent', key: 'spentClm' },
    // { header: 'Current Balance', key: 'currentBalanceClm' },
    // { header: 'Monthly', key: 'monthlyClm' },
];

interface reportModel  {
    "generalReport": {
        "spent": number,
        "monthlyUsage": {
            ['month']: {
                "spent": number,
                "totalMinutes": number,
                "activations": number
            },
            ['month']: {
                "spent": number,
                "totalMinutes": number,
                "activations": number
            }
        }
    },
    "usersReport": [
        {
            "userId": string,
            "billing": { 
                ["vehicleId"]: {
                    ["month"]: {
                        "spent": number
                    }
                },
                
                "spent": number
            },
            "items": [
                {
                    ["vehicleId"]: {
                        ["month"]: {
                            "spent": number,
                            "totalMinutes": number,
                            "activations": number
                        },
                        ["month"]: {
                            "spent": number,
                            "totalMinutes": number,
                            "activations": number
                        }
                    }
                },
            ],
            "cpf": string,
            "email": string
        }
    ]
}

export const generalReportFile = async (report) => {
    try {

        // for await (let month of generalReportKeys) {
        // };
        const addRow = { 
            blankClm: "General Information", 
            spentClm: report.generalReport.spent, 
        };

        
        Object.keys(report.generalReport.monthlyUsage).reverse().forEach(function (key) {

            // Add row using key mapping to columns
            worksheet.columns = [...worksheet.columns,
            { header: key, key: key }
            ];
            addRow[`${key}`] = report.generalReport.monthlyUsage[key].spent;
        });
        worksheet.addRow(addRow);
        Object.keys(report.usersReport).forEach( user => {
        console.log(`TCL: user`, user);

            let addRow = {
                clientIdClm: report.usersReport[user].userId,
                emailClm: report.usersReport[user].email,
                spentClm: report.usersReport[user].spent,
                cpfClm: report.usersReport[user].cpf,
            };

            report.usersReport[user].items.forEach(item => {
            console.log(`TCL: item`, item);
                Object.keys(report.usersReport[user].items[item]).forEach(month => {
                console.log(`TCL: month`, month);

                    addRow[`${month}`] = report.usersReport[user].items[item][month].spent;
                    
                });
                // "items": [
                //     {
                //         ["vehicleId"]: [
                //             {
                //                 ["month"]: {
                //                     "spent": number,
                //                     "totalMinutes": number,
                //                     "activations": number
                //                 },
                //                 ["month"]: {
                //                     "spent": number,
                //                     "totalMinutes": number,
                //                     "activations": number
                //                 }
                //             }
                        // ]
            }); 
            worksheet.addRow(addRow);

        });


        // for await (let user of report.usersReport) {
        //     console.log(`TCL: user`, user);
            
        // };
        // Create a root reference
        // const storageRef = admin.storage.ref();

        
        await workbook.xlsx.writeFile('report.xlsx').then(() => {
            console.log("saved!!!");
        }).catch((err) => {
            console.log("err", err);
        });
        // // Create a reference to 'mountains.jpg'
        // const saveReport = storageRef.child('report/');
        // await saveReport.put('../../report.xlsx')

        // save workbook to disk
       
        return true;
    } catch (error) {
        throw error;
    }
}