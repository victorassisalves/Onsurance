"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const databaseMethods_1 = require("../model/databaseMethods");
const database_1 = require("../database/database");
const calcProtection_1 = require("./calcProtection");
/*
             TODO :
                 Lavador manda requisição de seguro para Onsurance
                 Validação de autenticação do request
                 Validação das variáveis
                 Pegar o tempo Final do seguro
                 Fazer o Backup dos dados que serão modificados e checar a existência dos perfis
                     - Perfil do cliente --> OK
                     - Perfil do Item (veículo)
                     - Perfil do lavador
                     - Relatórios
                     -

                 Se qualquer um dos perfis necessários não existirem, devolver erro.
                 Fazer as alterações da proteção
                     Cliente
                         - Adicionar uma lavagem (proteção)
                         - Atualizar total pago
                         -
                     Item (Veículo)
                         - Atualizar minutos de seguro
                         - Atualizar uma lavagem (seguro)
                         - Atualizar o total gasto em seguro
                         - Adicionar um push ao Log de Uso do seguro
                             • Time End
                             • Duração do seguro
                             • Total faturado nessa lavagem
                     Lavador
                         - Atualizar minutos de seguro gerados
                         - Atualizar uma lavagem (seguro)
                         - Atualizar o total faturado em seguro
                         - Adicionar um push ao Log de Uso do seguro
                             • Time End
                             • Duração da lavagem
                             • Total faturado

                     Relatório
                         - Atualizar minutos totais de seguro
                         - Atualizar o total de lavagens (seguro)
                         - Atualizar o total faturado em seguro
                         - Atualizar o relatório mensal
                             • Número de seguros
                             • Minutos segurados
                             • Total faturado
                 
         */
exports.onsuranceOff = (variables) => {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const timeEnd = (Date.now()) / 1000 | 0;
            const newDate = new Date();
            const month = newDate.getMonth() + 1;
            const year = newDate.getFullYear();
            let clientCount = 0;
            let washerCount = 0;
            let itemCount = 0;
            const dbMethods = yield databaseMethods_1.databaseMethods();
            console.log("TCL: onsuranceOff -> variables", variables);
            // COLABORADOR
            const washerLogUseDb = yield database_1.washerLogUseDbRef(variables.washerEmail);
            const washerLogUseBackup = yield dbMethods.getDatabaseInfo(washerLogUseDb.child(`/${variables.logId}`));
            const washerProfileDb = yield database_1.washerProfileDbRef(variables.washerEmail);
            const washerProfileBackup = yield dbMethods.getDatabaseInfo(washerProfileDb);
            console.log("TCL: onsuranceOff -> washerLogUseBackup", washerLogUseBackup);
            if (washerProfileBackup === null || washerProfileBackup === undefined)
                throw {
                    status: 404,
                    message: `Erro ao buscar perfil do colaborador no banco de dados. Favor checar email do colaborador.`
                };
            if (washerLogUseBackup === null)
                throw {
                    status: 404,
                    message: `Nenhuma proteção para o colaborador com o ID: ${variables.logId}.`
                };
            // ---------------------
            // ITEM (VEÍCULO)
            const itemLogUseDb = yield database_1.itemLogUseDbRef(variables.vehiclePlate);
            const itemProfileDb = yield database_1.itemProfileDbRef(variables.vehiclePlate);
            const itemLogUseBackup = yield dbMethods.getDatabaseInfo(itemLogUseDb.child(`/${variables.logId}`));
            const itemProfileBackup = yield dbMethods.getDatabaseInfo(itemProfileDb);
            if (itemProfileBackup === null || itemProfileBackup === undefined)
                throw {
                    status: 404,
                    message: `Não achamos o veículo ${variables.vehiclePlate}. Favor checar a placa.`
                };
            if (itemLogUseBackup === null)
                throw {
                    status: 404,
                    message: `Não encontreu nenhuma proteção para o veículo ${variables.vehiclePlate} com o ID: ${variables.logId}.`
                };
            // ------------------------ 
            if (washerLogUseBackup.closed === true && itemLogUseBackup.closed === true)
                throw {
                    status: 300,
                    message: "O seguro já está desligado."
                };
            if (washerLogUseBackup.closed === true && itemLogUseBackup.closed !== true)
                throw {
                    status: 300,
                    message: "O seguro já está desligado para o colaborador mas não para o veículo. Entre em contato com o suporte."
                };
            if (washerLogUseBackup.closed !== true && itemLogUseBackup.closed === true)
                throw {
                    status: 300,
                    message: "O seguro já está desligado para o veículo mas não para o colaborador. Entre em contato com o suporte."
                };
            const timeStart = washerLogUseBackup.timeStart;
            // CLIENT DATA
            const clientProfileDb = yield database_1.clientProfileDbRef(variables.clientEmail);
            const clientProfileBackup = yield databaseMethods_1.databaseMethods().getDatabaseInfo(clientProfileDb);
            console.log("TCL: onsuranceOff -> clientProfileBackup", clientProfileBackup);
            if (clientProfileBackup === null || clientProfileBackup === undefined) {
                throw {
                    status: 404,
                    message: `Erro ao buscar perfil de cliente no banco de dados. Favor checar email do cliente.`
                };
            }
            // REPORT DATA
            const reportDb = yield database_1.reportDbRef();
            const reportBackup = yield dbMethods.getDatabaseInfo(reportDb.child(`/general`));
            const reportBackupMonth = yield dbMethods.getDatabaseInfo(reportDb.child(`/${year}/${month}`));
            console.log("TCL: onsuranceOff -> reportBackup", reportBackup);
            const protectionData = yield calcProtection_1.calc(timeStart, timeEnd);
            console.log("TCL: onsuranceOff -> protectionData", protectionData);
            const updateClient = () => __awaiter(this, void 0, void 0, function* () {
                try {
                    return yield databaseMethods_1.databaseMethods().updateDatabaseInfo(clientProfileDb, {
                        washedTimes: clientProfileBackup.washedTimes + 1,
                        totalPaid: parseFloat((clientProfileBackup.totalPaid + protectionData.protectionCost).toFixed(3))
                    });
                }
                catch (error) {
                    console.error("TCL: createClient -> error", error);
                    if (clientCount < 3) {
                        console.log("TCL: createClient -> Failed to update client. Times:", clientCount);
                        clientCount += 1;
                        yield updateClient();
                    }
                    else {
                        throw {
                            status: 500,
                            message: `Erro ao atualizar informações do cliente.`,
                            error: error
                        };
                    }
                    ;
                }
                ;
            });
            let counter = 0;
            const updateItem = () => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield databaseMethods_1.databaseMethods().updateDatabaseInfo(itemProfileDb, {
                        washedTimes: itemProfileBackup.washedTimes + 1,
                        totalBilled: parseFloat((itemProfileBackup.totalBilled + protectionData.protectionCost).toFixed(3))
                    });
                    console.log("TCL: updateItem -> reportBackup.totalBilled", reportBackup.totalBilled);
                    // await databaseMethods().updateDatabaseInfo(reportDb.child(`/general`), {
                    //     totalBilled: parseFloat((reportBackup.totalBilled + protectionData.protectionCost).toFixed(3)),
                    //     protectedMinutes: reportBackup.protectedMinutes + protectionData.totalMinutes,
                    //     protectionTimes: reportBackup.protectionTimes + 1
                    // });
                    yield reportDb.child(`/general`).transaction(reportBackup => {
                        reportBackup.totalBilled + parseFloat((protectionData.protectionCost).toFixed(3));
                        reportBackup.protectedMinutes + protectionData.totalMinutes;
                        reportBackup.protectionTimes++;
                        return reportBackup;
                    }, (error, committed, snapshot) => __awaiter(this, void 0, void 0, function* () {
                        if (error && counter < 4) {
                            counter += 1;
                            yield updateItem();
                            console.error(new Error(`Transaction failed abnormally! Error: ${error}`));
                        }
                        else if (error && counter >= 4) {
                            throw {
                                status: 500,
                                message: `Erro ao atualizar informações do report (transaction).`
                            };
                        }
                        else if (!committed) {
                            console.log('We aborted the transaction.');
                        }
                    }));
                    //Montly Report
                    yield reportDb.child(`/${year}/${month}`).transaction(reportBackupMonth => {
                        if (reportBackupMonth === null) {
                            reportBackupMonth.totalBilled = parseFloat((protectionData.protectionCost).toFixed(3));
                            reportBackupMonth.protectedMinutes = protectionData.totalMinutes;
                            reportBackupMonth.protectionTimes = 1;
                            return reportBackupMonth;
                        }
                        else {
                            reportBackupMonth.totalBilled + parseFloat((protectionData.protectionCost).toFixed(3));
                            reportBackupMonth.protectedMinutes + protectionData.totalMinutes;
                            reportBackupMonth.protectionTimes++;
                            return reportBackupMonth;
                        }
                    }, (error, committed, snapshot) => __awaiter(this, void 0, void 0, function* () {
                        if (error && counter < 4) {
                            counter += 1;
                            yield updateItem();
                            console.error(new Error(`Transaction failed abnormally! Error: ${error}`));
                        }
                        else if (error && counter >= 4) {
                            throw {
                                status: 500,
                                message: `Erro ao atualizar informações do report (transaction).`
                            };
                        }
                        else if (!committed) {
                            console.log('We aborted the transaction.');
                        }
                    }));
                    // update item log use
                    yield databaseMethods_1.databaseMethods().updateDatabaseInfo(itemLogUseDb.child(`/${variables.logId}`), {
                        timeEnd: protectionData.timeEnd,
                        totalBilled: protectionData.protectionCost,
                        protectionTime: protectionData.useTime,
                        offLocation: variables.location,
                        closed: true
                    });
                    return {
                        status: 202,
                        message: `Item and report updated.`
                    };
                }
                catch (error) {
                    console.error("TCL: updateItem -> error", error);
                    if (itemCount < 3) {
                        console.log("TCL: updateItem -> Failed to update item and report. Times:", clientCount);
                        itemCount += 1;
                        yield updateItem();
                    }
                    else {
                        throw {
                            status: 500,
                            message: `Erro ao atualizar informações do veículo.`,
                            error: error
                        };
                    }
                    ;
                }
                ;
            });
            const updateWasher = () => __awaiter(this, void 0, void 0, function* () {
                try {
                    // update washer profile
                    yield databaseMethods_1.databaseMethods().updateDatabaseInfo(washerProfileDb, {
                        washTimes: washerProfileBackup.washTimes + 1,
                        totalBilled: washerProfileBackup.totalBilled + protectionData.protectionCost,
                    });
                    // update wahser log use
                    yield databaseMethods_1.databaseMethods().updateDatabaseInfo(washerLogUseDb.child(`/${variables.logId}`), {
                        timeEnd: protectionData.timeEnd,
                        totalBilled: protectionData.protectionCost,
                        protectionTime: protectionData.useTime,
                        offLocation: variables.location,
                        closed: true,
                    });
                    return {
                        status: 202,
                        message: `Washer updated.`
                    };
                }
                catch (error) {
                    console.error("TCL: createWasher -> error", error);
                    if (washerCount < 3) {
                        console.log("TCL: createWasher -> Failed to create washer. Times:", clientCount);
                        washerCount += 1;
                        yield updateWasher();
                    }
                    else {
                        throw {
                            status: 500,
                            message: `Erro atualizando dados do colaborador.`,
                            error: error
                        };
                    }
                    ;
                }
            });
            const turnProtectionOff = () => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield updateClient();
                    yield updateWasher();
                    yield updateItem();
                    yield resolve({
                        message: `Proteção desativada com sucesso.`,
                        protectionData: protectionData
                    });
                }
                catch (error) {
                    yield databaseMethods_1.databaseMethods().setDatabaseInfo(clientProfileDb, clientProfileBackup);
                    yield databaseMethods_1.databaseMethods().setDatabaseInfo(itemProfileDb, itemProfileBackup);
                    yield databaseMethods_1.databaseMethods().updateDatabaseInfo(itemLogUseDb.child(`/${variables.logId}`), itemLogUseBackup);
                    yield databaseMethods_1.databaseMethods().setDatabaseInfo(reportDb.child(`/general`), reportBackup);
                    yield databaseMethods_1.databaseMethods().setDatabaseInfo(washerLogUseDb.child(`/${variables.logId}`), washerLogUseBackup);
                    yield databaseMethods_1.databaseMethods().setDatabaseInfo(washerLogUseDb, washerProfileBackup);
                    if (error.status)
                        throw {
                            status: error.status,
                            message: error.message
                        };
                    throw {
                        status: 500,
                        message: `Erro ao desligar seguro. Favor contatar suporte.`,
                        error: error
                    };
                }
                ;
            });
            return yield turnProtectionOff();
        }
        catch (error) {
            console.error(new Error(`TCL: onsuranceOff -> error: ${JSON.stringify(error)}`));
            if (error.status)
                reject(error);
            reject({
                status: 500,
                message: `Não consegui desligar o seguro, por favor entre em contato com o suporte.`,
                error: error
            });
        }
        ;
    }));
};
//# sourceMappingURL=onsuranceOff.js.map