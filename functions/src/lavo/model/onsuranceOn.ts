import { databaseMethods } from "../model/databaseMethods";
import { clientProfileDbRef, reportDbRef, getItemId, washerProfileDbRef, washerLogUseDbRef, itemProfileDbRef, itemLogUseDbRef } from "../database/database";


let clientCount = 0;
let washerCount = 0;
let itemCount = 0;


export const onsuranceOn =  (variables) => {
    return new Promise(async (resolve, reject) => {
        try {
            /*
                TODO :
                    Validação de autenticação do request
                    Validação das variáveis
                    Pegar o tempo inicial do seguro --> OK
                    Checar a existência dos perfis 
                        - Cliente --> OK
                        - Item (veículo) --> OK
                        - Lavador --> OK
                    Se qualquer um dos perfis necessários não existirem, criar.
                        - Fazer o Backup dos dados que serão modificados
                            - Relatórios --> OK
                            -
                        - Atualizar o relatório com
                            • número de clientes únicos --> OK
                            • número de lavadores únicos  --> OK
                            • número de itens (veículos) únicos --> OK
                    Fazer as alterações da proteção --> OK
                        Item (Veículo) --> OK
                            - Adicionar um push ao Log de Uso do seguro  --> OK
                                • Time Start
                                • Lavador (email)
                                • Local da lavagem
                        Lavador --> OK
                            - Adicionar um push ao Log de Uso do seguro  --> OK
                                • Time Start
                                • Local da lavagem
                                • Cliente (email)
                                • ID do item (placa do veículo)
                    
            */

            const dbMethods = await databaseMethods();
            const timeStart = (Date.now())/1000|0;
            const newDate = new Date();
            const month = newDate.getMonth() + 1;
            const year = newDate.getFullYear();
            console.log("TCL: onsuranceOn -> variables", variables);

            const reportDb = await reportDbRef();
            const reportBackup = await dbMethods.getDatabaseInfo(reportDb.child(`/general`));
            const reportBackupMonthBackup = await dbMethods.getDatabaseInfo(reportDb.child(`/${year}/${month}`));
        
            let reportBackupMonth = {
                clients: 0,
                vehicles: 0,
                washers: 0
            }
            if (reportBackupMonthBackup !== null) {
                reportBackupMonth = reportBackupMonthBackup
            }
            
            console.log("TCL: onsuranceOn -> reportBackup", reportBackup);

            
            const createClient = async (clientProfileDb) => {
                try {
                    const itemId = await getItemId(variables.vehiclePlate);
                    const item = {
                        vehiclePlate: variables.vehiclePlate,
                    };
                    await databaseMethods().setDatabaseInfo(clientProfileDb, {
                        name: variables.clientName,
                        email: variables.clientEmail,
                        cpf: variables.clientCpf,
                        washedTimes: 0,
                        totalPaid: 0,
                        onboard: true,
                    });
                    await databaseMethods().updateDatabaseInfo(clientProfileDb.child(`items/${itemId}`), item);
                    await databaseMethods().updateDatabaseInfo(reportDb.child(`/general`), {
                        clients: reportBackup.clients + 1
                    });
                    await databaseMethods().updateDatabaseInfo(reportDb.child(`/${year}/${month}`), {
                        clients: reportBackupMonth.clients + 1
                    });

                    return {
                        status: 202,
                        message: `Client created.`
                    }
                } catch (error) {
                    console.error("TCL: createClient -> error", error);
                    if (clientCount < 3) {
                        console.log("TCL: createClient -> Failed to create client. Times:", clientCount);
                        clientCount += 1;
                        await createClient(clientProfileDb);
                    } else {
                        await databaseMethods().setDatabaseInfo(clientProfileDb, null);
                        await databaseMethods().setDatabaseInfo(reportDb.child(`/general`), reportBackup)
                        throw {
                            status: 500,
                            message: `Error creating client. ${error}`
                        };
                    };
                }
                
            };

            const createItem = async (itemProfileDb) => {
                try {

                    await databaseMethods().setDatabaseInfo(itemProfileDb, {
                        // brand: variables.washerName,
                        plate: variables.vehiclePlate,
                        washedTimes: 0,
                        totalBilled: 0,
                        onboard: true,
                    });

                    await databaseMethods().updateDatabaseInfo(reportDb.child(`/general`), {
                        vehicles: reportBackup.vehicles + 1
                    });

                    await databaseMethods().updateDatabaseInfo(reportDb.child(`/${year}/${month}`), {
                        vehicles: reportBackupMonth.vehicles + 1
                    });

                    return {
                        status: 202,
                        message: `Item created.`
                    };
                } catch (error) {
                    console.error("TCL: createItem -> error", error);
                    if (itemCount < 3) {
                        console.log("TCL: createItem -> Failed to create item. Times:", clientCount);
                        itemCount += 1;
                        await createItem(itemProfileDb);
                    } else {
                        await databaseMethods().setDatabaseInfo(itemProfileDb, null);
                        await databaseMethods().setDatabaseInfo(reportDb.child(`/general`), reportBackup)
                        throw {
                            status: 500,
                            message: `Error creating itemß. ${error}`
                        };
                    };
                }
                
            };

            const createWasher = async (washerProfileDb) => {
                try {

                    await databaseMethods().setDatabaseInfo(washerProfileDb, {
                        name: variables.washerName,
                        email: variables.washerEmail,
                        cpf: variables.washerCpf,
                        washTimes: 0,
                        totalBilled: 0,
                        onboard: true,
                    });

                    await databaseMethods().updateDatabaseInfo(reportDb.child(`/general`), {
                        washers: reportBackup.washers + 1
                    });

                    await databaseMethods().updateDatabaseInfo(reportDb.child(`/${year}/${month}`), {
                        washers: reportBackupMonth.washers + 1
                    });
                        
                   
                    return {
                        status: 202,
                        message: `Washer created.`
                    }
                } catch (error) {
                    console.error("TCL: createWasher -> error", error);
                    if (washerCount < 3) {
                        console.log("TCL: createWasher -> Failed to create washer. Times:", clientCount);
                        washerCount += 1;
                        await createWasher(washerProfileDb);
                    } else {
                        await databaseMethods().setDatabaseInfo(washerProfileDb, null);
                        await databaseMethods().setDatabaseInfo(reportDb.child(`/general`), reportBackup)
                        throw {
                            status: 500,
                            message: `Error creating washer. ${error}`
                        };
                    };
                }
                
            };

            const checkClient = async () => {
                // check client profile
                const clientProfileDb = await clientProfileDbRef(variables.clientEmail);
                const userExists = await dbMethods.getDatabaseInfo(clientProfileDb.child(`/onboard`));
                console.log("TCL: checkClient -> userExists", userExists);
                if (!userExists) {
                    return await createClient(clientProfileDb);
                } else {
                    return `Client already exists.`
                }
            };

            let result = await checkClient();
            console.log("TCL: onsuranceOn -> checkClient result", JSON.stringify(result));


            const checkWasher = async () => {
                // check client profile
                const washerProfileDb = await washerProfileDbRef(variables.washerEmail);
                const userExists = await dbMethods.getDatabaseInfo(washerProfileDb.child(`/onboard`));
                console.log("TCL: checkWasher -> userExists", userExists);
                if (!userExists) {
                    return await createWasher(washerProfileDb);
                } else {
                    return `Washer already exists.`
                }
            };

            result = await checkWasher();
            console.log("TCL: onsuranceOn -> checkWasher result:", JSON.stringify(result));

            const checkItem = async () => {
                const itemProfileDb = await itemProfileDbRef(variables.vehiclePlate);
                const itemExists = await dbMethods.getDatabaseInfo(itemProfileDb.child(`/onboard`));
                console.log("TCL: checkItem -> itemExists", itemExists);
                if (!itemExists) {
                    await createItem(itemProfileDb);
                } else {
                    return `Item already exists.`
                }
            };  
            
            result =  await checkItem();
            console.log("TCL: onsuranceOn -> checkItem result", result);

            const backupLogUse = async () => {
                try {
                    const backupItemLogUse = async () => {
                        const logUseDbRef = await itemLogUseDbRef(variables.vehiclePlate);
                        return await dbMethods.getDatabaseInfo(logUseDbRef.limitToLast(1))
                    };
                    const backupWasherLogUse = async () => {
                        const logUseDbRef = washerLogUseDbRef(variables.washerEmail);
                        return await dbMethods.getDatabaseInfo(logUseDbRef.limitToLast(1))
                    };
    
                    const backupItem = await backupItemLogUse();
                    console.log("TCL: backupLogUse -> backupItem", backupItem);
                    const backupWasher = await backupWasherLogUse();
                    console.log("TCL: backupLogUse -> backupWasher", backupWasher);
                    let backup = {
                        backupItemKey: null,
                        backupItemValues: null,
                        backupWasherKey: null,
                        backupWasherValues: null
                    };
                    const checkOpenProtection = (protection, id, responsible, vehiclePlate) => {
                        if (protection === false) {
                            throw {
                                status: 303,
                                message: `Tem um seguro ativo do ${responsible}, para o veículo ${vehiclePlate}. Finalize esse seguro primeiro.`,
                                id: id
                            };
                        };
                    };
                    if (backupItem === null && backupWasher !== null) {
                        backup = {
                            backupItemKey: null,
                            backupItemValues: null,
                            backupWasherKey: Object.keys(backupWasher),
                            backupWasherValues: Object.values(backupWasher)[0],
                        };
                        checkOpenProtection(backup.backupWasherValues.closed, backup.backupWasherKey, "colaborador", backup.backupWasherValues.vehiclePlate);
                    } else if (backupWasher === null && backupItem !== null) {
                        backup = {
                            backupItemKey: Object.keys(backupItem),
                            backupItemValues: Object.values(backupItem)[0],
                            backupWasherKey: null,
                            backupWasherValues: null
                        };
                        checkOpenProtection(backup.backupItemValues.closed, backup.backupItemKey, "cliente", variables.vehiclePlate);
                    } else if (backupWasher !== null && backupItem !== null) {
                        backup = {
                            backupItemKey: Object.keys(backupItem),
                            backupItemValues: Object.values(backupItem)[0],
                            backupWasherKey: Object.keys(backupWasher),
                            backupWasherValues: Object.values(backupWasher)[0]
                        };
                        checkOpenProtection(backup.backupItemValues.closed, backup.backupItemKey, "cliente", variables.vehiclePlate);
                        checkOpenProtection(backup.backupWasherValues.closed, backup.backupWasherKey, "colaborador", backup.backupWasherValues.vehiclePlate);
                        
                    };

                    return backup;
                } catch (error) {
                    console.error("TCL: backupLogUse -> error", error);
                    if (error.id){
                        throw {
                            status: error.status,
                            message: error.message,
                            id: error.id
                        };
                    };
                    if (error.status){
                        throw {
                            status: error.status,
                            message: error.message,
                        };
                    };
                    
                    throw {
                        status: 500,
                        message: `Erro ao criar nova proteção. ${error}`
                    }
                }
                
            };

            const backup = await backupLogUse();

            const createLogUSe = async() => {
                try {

                    const createItemLogUse = async () => {
                        const logUseDbRef = await itemLogUseDbRef(variables.vehiclePlate);
                        const logUse = {
                            timeStart: timeStart,
                            washer: variables.washerEmail,
                            onLocation: variables.location,
                            closed: false,
                        };
                        const pushId = await dbMethods.pushDatabaseInfo(logUseDbRef, logUse);
                        return pushId;
                    };
                    const itemLogResult = await createItemLogUse();
                    console.log("TCL: onsuranceOn -> createItemLogUse result", itemLogResult);
                    const logId = itemLogResult._id;

                    const createWasherLogUse = async () => {
                        const logUseDbRef = await washerLogUseDbRef(variables.washerEmail);
                        const logUse = {
                            timeStart: timeStart,
                            client: variables.clientEmail,
                            vehiclePlate: variables.vehiclePlate,
                            onLocation: variables.location,
                            closed: false,
                        }
                        return await dbMethods.setDatabaseInfo(logUseDbRef.child(`/${logId}`), logUse);
                    };
                    result = await createWasherLogUse();
                    console.log("TCL: onsuranceOn -> createWasherLogUse result", result);

                    await resolve({
                        message: `Proteção ativada com sucesso.`,
                        id: logId
                    });
                } catch (error) {
                    console.error("TCL: createLogUSe -> error", error);

                    // ITEM BACKUP
                    const itemLogUseDb = await itemLogUseDbRef(variables.vehiclePlate);
                    await dbMethods.setDatabaseInfo(itemLogUseDb.child(`/${backup.backupItemKey}`), backup.backupItemValues);

                    // WASHER BACKUP
                    const washerLogUseDb = washerLogUseDbRef(variables.washerEmail);
                    await dbMethods.setDatabaseInfo(washerLogUseDb.child(`/${backup.backupWasherKey}`), backup.backupWasherValues);

                    throw {
                        status: 301,
                        message: `Failed to create log of use. Please try again` 
                    };
                };
            };
            return await createLogUSe();
            
        } catch (error) {
            console.error(new Error(`TCL: onsuranceOn -> error: ${JSON.stringify(error)}`));
            reject(error);
        }


    });
    
};