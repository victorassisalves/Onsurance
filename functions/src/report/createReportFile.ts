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
    { header: 'Current Balance', key: 'currentBalanceClm' },
    { header: 'Vehicle', key: 'vehicleClm' },
    { header: 'Device Spent', key: 'deviceClm' },

    // { header: 'Third Party User', key: 'trdClm' },
    { header: 'Spent', key: 'spentClm' },
    // { header: 'Monthly', key: 'monthlyClm' },
];

// interface reportModel  {
//     "generalReport": {
//         "spent": number,
//         "monthlyUsage": {
//             ['month']: {
//                 "spent": number,
//                 "totalMinutes": number,
//                 "activations": number
//             },
//             ['month']: {
//                 "spent": number,
//                 "totalMinutes": number,
//                 "activations": number
//             }
//         }
//     },
//     "usersReport": [
//         {
//             "userId": string,
//             "billing": { 
//                 ["vehicleId"]: {
//                     ["month"]: {
//                         "spent": number
//                     }
//                 },
                
//                 "spent": number
//             },
//             "items": [
//                 {
//                     ["vehicleId"]: {
//                         ["month"]: {
//                             "spent": number,
//                             "totalMinutes": number,
//                             "activations": number
//                         },
//                         ["month"]: {
//                             "spent": number,
//                             "totalMinutes": number,
//                             "activations": number
//                         }
//                     }
//                 },
//             ],
//             "cpf": string,
//             "email": string
//         }
//     ]
// }

export const generalReportFile = async (report) => {
    try {

        // for await (let month of generalReportKeys) {
        // };
        const addGeneralRow = { 
            blankClm: "General Information", 
            spentClm: report.generalReport.spent, 
            deviceClm: 0,
        };


        console.log(`TCL: generalReportFile -> Before general report`);
        
        Object.keys(report.generalReport.monthlyUsage).reverse().forEach(function (key) {

            // Add row using key mapping to columns
            worksheet.columns = [...worksheet.columns,
            { header: key, key: key }
            ];
            addGeneralRow[`${key}`] = report.generalReport.monthlyUsage[key].spent;
        });
        worksheet.addRow(addGeneralRow);

        console.log(`TCL: generalReportFile -> Before user report`);
        let deviceSpent = 0;
        const deviceBill = []
        Object.keys(report.usersReport).forEach( user => {
            console.log(`TCL: user`, user);
            if (user === '6') {
                console.log(report.usersReport[user])
                console.log(report.usersReport[user].items)
            };

            let addRow = {
                clientIdClm: report.usersReport[user].userId,
                emailClm: report.usersReport[user].email,
                spentClm: 0,
                cpfClm: report.usersReport[user].cpf,
                currentBalanceClm: report.usersReport[user].wallet
            };
            let spent = 0;
            
            if (report.usersReport[user].items !== null && report.usersReport[user].items !== undefined && report.usersReport[user].items !== ''){
                report.usersReport[user].items.forEach(item => {
                    // console.log(`TCL: item`, item);

                    Object.keys(item).forEach(vehicle => {
                        // console.log(`TCL: vehicle`, vehicle);

                        addRow[`vehicleClm`] = vehicle
                        
                        Object.keys(item[vehicle]).forEach(month => {

                            addRow[`${month}`] = item[vehicle][month].spent;
                            spent += item[vehicle][month].spent
                            
                            if (report.usersReport[user].billing !== null && report.usersReport[user].billig !== ''){
                                if (report.usersReport[user].billing[vehicle] && report.usersReport[user].billing[vehicle][month]) {
                                    if (!deviceBill.includes(`Device - ${month}`)) {
                                        worksheet.columns = [...worksheet.columns,
                                            { header: `Device - ${month}`, key: `Device - ${month}` }
                                        ];
                                        deviceBill.push(`Device - ${month}`)
                                    }
                                    addRow[`Device - ${month}`] = report.usersReport[user].billing[vehicle][month].spent;  
                                    deviceSpent += report.usersReport[user].billing[vehicle][month].spent;  
                                    // spent += report.usersReport[user].billing[vehicle][month].spent;
                                }
                            };
                        })
                        addRow.spentClm = parseFloat(spent.toFixed(4))
                        worksheet.addRow(addRow);
                        spent = 0;
                        addRow = {
                            clientIdClm: ``,
                            emailClm: report.usersReport[user].email,
                            spentClm: 0,
                            cpfClm: '',
                            currentBalanceClm: ''
                        }
                    });
                
                }); 
            }

        });


        let row = worksheet.getRow(2);
        row.getCell('G').value = deviceSpent;

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