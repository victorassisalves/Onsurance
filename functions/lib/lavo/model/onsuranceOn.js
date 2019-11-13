"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const databaseMethods_1 = require("../model/databaseMethods");
const database_1 = require("../database/database");
let clientCount = 0;
let washerCount = 0;
let itemCount = 0;
exports.onsuranceOn = (variables) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
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
            const dbMethods = yield databaseMethods_1.databaseMethods();
            const timeStart = (Date.now()) / 1000 | 0;
            const newDate = new Date();
            const month = newDate.getMonth() + 1;
            const year = newDate.getFullYear();
            console.log("TCL: onsuranceOn -> variables", variables);
            const reportDb = yield database_1.reportDbRef();
            const reportBackup = yield dbMethods.getDatabaseInfo(reportDb.child(`/general`));
            const reportBackupMonthBackup = yield dbMethods.getDatabaseInfo(reportDb.child(`/${year}/${month}`));
            let reportBackupMonth = {
                clients: 0,
                vehicles: 0,
                washers: 0
            };
            if (reportBackupMonthBackup !== null) {
                reportBackupMonth = reportBackupMonthBackup;
            }
            console.log("TCL: onsuranceOn -> reportBackup", reportBackup);
            const createClient = (clientProfileDb) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const itemId = yield database_1.getItemId(variables.vehiclePlate);
                    const item = {
                        vehiclePlate: variables.vehiclePlate,
                    };
                    yield databaseMethods_1.databaseMethods().setDatabaseInfo(clientProfileDb, {
                        name: variables.clientName,
                        email: variables.clientEmail,
                        cpf: variables.clientCpf,
                        washedTimes: 0,
                        totalPaid: 0,
                        onboard: true,
                    });
                    yield databaseMethods_1.databaseMethods().updateDatabaseInfo(clientProfileDb.child(`items/${itemId}`), item);
                    yield databaseMethods_1.databaseMethods().updateDatabaseInfo(reportDb.child(`/general`), {
                        clients: reportBackup.clients + 1
                    });
                    yield databaseMethods_1.databaseMethods().updateDatabaseInfo(reportDb.child(`/${year}/${month}`), {
                        clients: reportBackupMonth.clients + 1
                    });
                    return {
                        status: 202,
                        message: `Client created.`
                    };
                }
                catch (error) {
                    console.error("TCL: createClient -> error", error);
                    if (clientCount < 3) {
                        console.log("TCL: createClient -> Failed to create client. Times:", clientCount);
                        clientCount += 1;
                        yield createClient(clientProfileDb);
                    }
                    else {
                        yield databaseMethods_1.databaseMethods().setDatabaseInfo(clientProfileDb, null);
                        yield databaseMethods_1.databaseMethods().setDatabaseInfo(reportDb.child(`/general`), reportBackup);
                        throw {
                            status: 500,
                            message: `Error creating client. ${error}`
                        };
                    }
                    ;
                }
            });
            const createItem = (itemProfileDb) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    yield databaseMethods_1.databaseMethods().setDatabaseInfo(itemProfileDb, {
                        // brand: variables.washerName,
                        plate: variables.vehiclePlate,
                        washedTimes: 0,
                        totalBilled: 0,
                        onboard: true,
                    });
                    yield databaseMethods_1.databaseMethods().updateDatabaseInfo(reportDb.child(`/general`), {
                        vehicles: reportBackup.vehicles + 1
                    });
                    yield databaseMethods_1.databaseMethods().updateDatabaseInfo(reportDb.child(`/${year}/${month}`), {
                        vehicles: reportBackupMonth.vehicles + 1
                    });
                    return {
                        status: 202,
                        message: `Item created.`
                    };
                }
                catch (error) {
                    console.error("TCL: createItem -> error", error);
                    if (itemCount < 3) {
                        console.log("TCL: createItem -> Failed to create item. Times:", clientCount);
                        itemCount += 1;
                        yield createItem(itemProfileDb);
                    }
                    else {
                        yield databaseMethods_1.databaseMethods().setDatabaseInfo(itemProfileDb, null);
                        yield databaseMethods_1.databaseMethods().setDatabaseInfo(reportDb.child(`/general`), reportBackup);
                        throw {
                            status: 500,
                            message: `Error creating itemß. ${error}`
                        };
                    }
                    ;
                }
            });
            const createWasher = (washerProfileDb) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    yield databaseMethods_1.databaseMethods().setDatabaseInfo(washerProfileDb, {
                        name: variables.washerName,
                        email: variables.washerEmail,
                        cpf: variables.washerCpf,
                        washTimes: 0,
                        totalBilled: 0,
                        onboard: true,
                    });
                    yield databaseMethods_1.databaseMethods().updateDatabaseInfo(reportDb.child(`/general`), {
                        washers: reportBackup.washers + 1
                    });
                    yield databaseMethods_1.databaseMethods().updateDatabaseInfo(reportDb.child(`/${year}/${month}`), {
                        washers: reportBackupMonth.washers + 1
                    });
                    return {
                        status: 202,
                        message: `Washer created.`
                    };
                }
                catch (error) {
                    console.error("TCL: createWasher -> error", error);
                    if (washerCount < 3) {
                        console.log("TCL: createWasher -> Failed to create washer. Times:", clientCount);
                        washerCount += 1;
                        yield createWasher(washerProfileDb);
                    }
                    else {
                        yield databaseMethods_1.databaseMethods().setDatabaseInfo(washerProfileDb, null);
                        yield databaseMethods_1.databaseMethods().setDatabaseInfo(reportDb.child(`/general`), reportBackup);
                        throw {
                            status: 500,
                            message: `Error creating washer. ${error}`
                        };
                    }
                    ;
                }
            });
            const checkClient = () => __awaiter(void 0, void 0, void 0, function* () {
                // check client profile
                const clientProfileDb = yield database_1.clientProfileDbRef(variables.clientEmail);
                const userExists = yield dbMethods.getDatabaseInfo(clientProfileDb.child(`/onboard`));
                console.log("TCL: checkClient -> userExists", userExists);
                if (!userExists) {
                    return yield createClient(clientProfileDb);
                }
                else {
                    return `Client already exists.`;
                }
            });
            let result = yield checkClient();
            console.log("TCL: onsuranceOn -> checkClient result", JSON.stringify(result));
            const checkWasher = () => __awaiter(void 0, void 0, void 0, function* () {
                // check client profile
                const washerProfileDb = yield database_1.washerProfileDbRef(variables.washerEmail);
                const userExists = yield dbMethods.getDatabaseInfo(washerProfileDb.child(`/onboard`));
                console.log("TCL: checkWasher -> userExists", userExists);
                if (!userExists) {
                    return yield createWasher(washerProfileDb);
                }
                else {
                    return `Washer already exists.`;
                }
            });
            result = yield checkWasher();
            console.log("TCL: onsuranceOn -> checkWasher result:", JSON.stringify(result));
            const checkItem = () => __awaiter(void 0, void 0, void 0, function* () {
                const itemProfileDb = yield database_1.itemProfileDbRef(variables.vehiclePlate);
                const itemExists = yield dbMethods.getDatabaseInfo(itemProfileDb.child(`/onboard`));
                console.log("TCL: checkItem -> itemExists", itemExists);
                if (!itemExists) {
                    yield createItem(itemProfileDb);
                }
                else {
                    return `Item already exists.`;
                }
            });
            result = yield checkItem();
            console.log("TCL: onsuranceOn -> checkItem result", result);
            const backupLogUse = () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const backupItemLogUse = () => __awaiter(void 0, void 0, void 0, function* () {
                        const logUseDbRef = yield database_1.itemLogUseDbRef(variables.vehiclePlate);
                        return yield dbMethods.getDatabaseInfo(logUseDbRef.limitToLast(1));
                    });
                    const backupWasherLogUse = () => __awaiter(void 0, void 0, void 0, function* () {
                        const logUseDbRef = database_1.washerLogUseDbRef(variables.washerEmail);
                        return yield dbMethods.getDatabaseInfo(logUseDbRef.limitToLast(1));
                    });
                    const backupItem = yield backupItemLogUse();
                    console.log("TCL: backupLogUse -> backupItem", backupItem);
                    const backupWasher = yield backupWasherLogUse();
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
                        }
                        ;
                    };
                    if (backupItem === null && backupWasher !== null) {
                        backup = {
                            backupItemKey: null,
                            backupItemValues: null,
                            backupWasherKey: Object.keys(backupWasher),
                            backupWasherValues: Object.values(backupWasher)[0],
                        };
                        checkOpenProtection(backup.backupWasherValues.closed, backup.backupWasherKey, "colaborador", backup.backupWasherValues.vehiclePlate);
                    }
                    else if (backupWasher === null && backupItem !== null) {
                        backup = {
                            backupItemKey: Object.keys(backupItem),
                            backupItemValues: Object.values(backupItem)[0],
                            backupWasherKey: null,
                            backupWasherValues: null
                        };
                        checkOpenProtection(backup.backupItemValues.closed, backup.backupItemKey, "cliente", variables.vehiclePlate);
                    }
                    else if (backupWasher !== null && backupItem !== null) {
                        backup = {
                            backupItemKey: Object.keys(backupItem),
                            backupItemValues: Object.values(backupItem)[0],
                            backupWasherKey: Object.keys(backupWasher),
                            backupWasherValues: Object.values(backupWasher)[0]
                        };
                        checkOpenProtection(backup.backupItemValues.closed, backup.backupItemKey, "cliente", variables.vehiclePlate);
                        checkOpenProtection(backup.backupWasherValues.closed, backup.backupWasherKey, "colaborador", backup.backupWasherValues.vehiclePlate);
                    }
                    ;
                    return backup;
                }
                catch (error) {
                    console.error("TCL: backupLogUse -> error", error);
                    if (error.id) {
                        throw {
                            status: error.status,
                            message: error.message,
                            id: error.id
                        };
                    }
                    ;
                    if (error.status) {
                        throw {
                            status: error.status,
                            message: error.message,
                        };
                    }
                    ;
                    throw {
                        status: 500,
                        message: `Erro ao criar nova proteção. ${error}`
                    };
                }
            });
            const backup = yield backupLogUse();
            const createLogUSe = () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const createItemLogUse = () => __awaiter(void 0, void 0, void 0, function* () {
                        const logUseDbRef = yield database_1.itemLogUseDbRef(variables.vehiclePlate);
                        const logUse = {
                            timeStart: timeStart,
                            washer: variables.washerEmail,
                            onLocation: variables.location,
                            closed: false,
                        };
                        const pushId = yield dbMethods.pushDatabaseInfo(logUseDbRef, logUse);
                        return pushId;
                    });
                    const itemLogResult = yield createItemLogUse();
                    console.log("TCL: onsuranceOn -> createItemLogUse result", itemLogResult);
                    const logId = itemLogResult._id;
                    const createWasherLogUse = () => __awaiter(void 0, void 0, void 0, function* () {
                        const logUseDbRef = yield database_1.washerLogUseDbRef(variables.washerEmail);
                        const logUse = {
                            timeStart: timeStart,
                            client: variables.clientEmail,
                            vehiclePlate: variables.vehiclePlate,
                            onLocation: variables.location,
                            closed: false,
                        };
                        return yield dbMethods.setDatabaseInfo(logUseDbRef.child(`/${logId}`), logUse);
                    });
                    result = yield createWasherLogUse();
                    console.log("TCL: onsuranceOn -> createWasherLogUse result", result);
                    yield resolve({
                        message: `Proteção ativada com sucesso.`,
                        id: logId
                    });
                }
                catch (error) {
                    console.error("TCL: createLogUSe -> error", error);
                    // ITEM BACKUP
                    const itemLogUseDb = yield database_1.itemLogUseDbRef(variables.vehiclePlate);
                    yield dbMethods.setDatabaseInfo(itemLogUseDb.child(`/${backup.backupItemKey}`), backup.backupItemValues);
                    // WASHER BACKUP
                    const washerLogUseDb = database_1.washerLogUseDbRef(variables.washerEmail);
                    yield dbMethods.setDatabaseInfo(washerLogUseDb.child(`/${backup.backupWasherKey}`), backup.backupWasherValues);
                    throw {
                        status: 301,
                        message: `Failed to create log of use. Please try again`
                    };
                }
                ;
            });
            return yield createLogUSe();
        }
        catch (error) {
            console.error(new Error(`TCL: onsuranceOn -> error: ${JSON.stringify(error)}`));
            reject(error);
        }
    }));
};
//# sourceMappingURL=onsuranceOn.js.map