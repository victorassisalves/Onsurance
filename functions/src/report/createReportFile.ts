const Excel = require('exceljs');

// Create workbook & add worksheet
const workbook = new Excel.Workbook();
const worksheet = workbook.addWorksheet('Onsurance Report');

// add column headers
worksheet.columns = [
    { header: 'Client Email', key: 'emailClm' },
    { header: 'CPF', key: 'cpfClm' },
    { header: 'Vehicle', key: 'fstVehicleClm' },
    { header: 'Second Vehicle', key: 'scdVehicleClm' },
    { header: 'Third Party User', key: 'trdClm' },
    { header: 'Operation Time', key: 'opClm' },
    { header: 'Spent', key: 'spentClm' },
    { header: 'Current Balance', key: 'currentBalanceClm' },
    { header: 'Monthly', key: 'monthlyClm' },
];

const generateFileReport = async () => {
    // save workbook to disk
    await workbook.xlsx.writeFile('report.xlsx').then(() => {
        console.log("saved!!!");
    }).catch((err) => {
        console.log("err", err);
    });
}