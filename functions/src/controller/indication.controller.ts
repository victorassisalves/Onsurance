import { indicationDbRefRoot } from "../database/database";
import { databaseMethods } from "../model/databaseMethods";
import { checkForIndicator, checkBackupError, checkServerError, checkMessengerId } from "../model/errors";
import { sendMessage } from "../environment/messenger/messenger.variables";




export const saveIndication = variables => {
    return new Promise(async (resolve, reject) => {
        const indication = async backup => {
            try {
                /*
                    TODO: 


                */

                await backup.dbMethods.updateDatabaseInfo(backup.indicatedDbPath, {
                    indicator: variables.indicatorEmail
                });

                await backup.dbMethods.pushDatabaseInfo(backup.indicatorDbPath.child(`indicated`), {
                    user: variables.userEmail
                });

                const broadcastVariables = {
                    text: `😃 Deu certo ${backup.indicatorProfile.firstName}. Seu indicado acabou de acessar o Onsurance graças a sua indicação! Quando ${variables.firstName} ${variables.lastName} comprar créditos iniciais você ganhará 200h de seguro como cortesia nossa. 🤩 😉💰`,
                    messageTag: 'COMMUNITY_ALERT',
                    messengerId: backup.indicatorProfile.messengerId
                }
                console.log("TCL: broadcastVariables", broadcastVariables)

                sendMessage(broadcastVariables);

                resolve({
                    status: 200,
                    text: `Indication process done.`,
                    callback: 'indicationDone',
                    variables: {
                        userEmail: variables.userEmail,
                        indicator: variables.indicatorEmail,
                        indicatorProfile: backup.indicatorProfile
                    }
                });
            } catch (error) {
                console.log(`Error doing indication for ${variables.userEmail}. Doing Backup Now.`)
                await backup.dbMethods.setDatabaseInfo(backup.indicatedDbPath, backup.indicatedProfile)
                await backup.dbMethods.setDatabaseInfo(backup.indicatorDbPath, backup.indicatorProfile)
                if (error.status) {
                    reject(error)    
                } else {
                    reject(checkServerError());
                }
            }   
        }

        const doBackup = async () => {
            try {
                const dbMethods = await databaseMethods();
                //INDICATOR
                const indicatorDbPath = await indicationDbRefRoot(variables.indicatorEmail);
                const indicatorProfile = await dbMethods.getDatabaseInfo(indicatorDbPath);
                console.log("TCL: doBackup -> indicatorProfile", indicatorProfile);

                // INDICATED
                const indicatedDbPath = await indicationDbRefRoot(variables.userEmail);
                const indicatedProfile = await dbMethods.getDatabaseInfo(indicatedDbPath);
                console.log("TCL: doBackup -> indicatedProfile", indicatedProfile);


                if (indicatedProfile !== null) {
                    await checkForIndicator(indicatedProfile, variables)
                }

                const backup = {
                    indicatorProfile: indicatorProfile,
                    indicatorDbPath: indicatorDbPath,
                    indicatedProfile: indicatedProfile,
                    indicatedDbPath: indicatedDbPath,
                    dbMethods: dbMethods,
                }
                
                
                return indication(backup)  
            } catch (error) {
                console.log("TCL: doBackup -> error", error)
                if (error.status) {
                    reject(error);
                } else {
                    reject(checkServerError());
                }

            }
        }

        await doBackup()
    });
    
};

export const saveMessenger = variables => {
    return new Promise(async (resolve, reject) => {
        
        const saveIndicatorProfile = async backup => {
            try {
                const indicatorProfile = backup.indicatorProfile;
                const dbMethods = await databaseMethods()
                const indicatorDbPath = backup.indicatorDbPath

                const saveIndicatorProfile = () => {
                    return dbMethods.updateDatabaseInfo(indicatorDbPath, {
                        messengerId: variables.messengerId,
                        userEmail: variables.userEmail,
                        firstName: variables.firstName,
                        lastName: variables.lastName,
                    });
                }
                if (indicatorProfile === null){
                    await saveIndicatorProfile()
                    resolve({
                        status: 200,
                        text: `Indication process done.`,
                    });
                } else {
                    if(indicatorProfile.messengerId == variables.messengerId){
                        resolve({
                            status: 200,
                            text: 'Already have indication profile'
                        })
                    } else if (indicatorProfile.messengerId === null || indicatorProfile.messengerId === undefined){
                        await saveIndicatorProfile()
                        resolve({
                            status: 200,
                            text: `Indication process done.`,
                        });
                    } else {
                        await checkMessengerId(indicatorProfile.messengerId, variables)
                    };
                };
            } catch (error) {
                console.error(new Error("Error saving indicator profile. Doing Backup"))
                console.error(new Error(error))

                await backup.dbMethods.setDatabaseInfo(backup.indicatorDbPath, backup.indicatorProfile);

                if (error.status) {
                    reject(error);
                } else {
                    reject(checkServerError());
                };
            };
        };
         
        const backup = async() => {
            try {
                const dbMethods = await databaseMethods();
                const indicatorDbPath = indicationDbRefRoot(variables.userEmail)

                const indicatorProfile = await dbMethods.getDatabaseInfo(indicatorDbPath);
                console.log("TCL: backup -> indicatorProfile", indicatorProfile)

                const backupVariables = {
                    indicatorDbPath:  indicatorDbPath,
                    indicatorProfile: indicatorProfile,
                    dbMethods: dbMethods,
                }
                
                return saveIndicatorProfile(backupVariables)
            } catch (error) {
                console.error(new Error(error));

                if(error.status) reject(error)
                reject(checkBackupError(variables));
            }
        };

        await backup()
        
    });
};


