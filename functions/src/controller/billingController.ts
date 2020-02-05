import { billingDatabase, getItemId, customersDbRoot } from "../database/database";
import { databaseMethods } from "../model/databaseMethods";

export const registerBilling = (variables) => {
    return new Promise(async (resolve, reject) => {
        const dbMethods = await databaseMethods();
        console.log("TCL: registerBilling -> variables", variables);
        
        const registerObd = async (backup) => {
            try {
                // Save item billing profile on Database
                let result = await dbMethods.updateDatabaseInfo(backup.database.userDbRef.child(`billing/${backup.itemId}`), {
                    plan: variables.plan,
                    billingDay: backup.billingPeriod,
                    billingTimes: 1
                });
                console.log("TCL: doBackup -> Saved item billing profile on Database.", result)

                let userBillingProfile = {}

                // Check if there is a billing for that client on that day
                if (backup.billingDay === null || undefined) {
                    // No billing registered
                    userBillingProfile = {
                        activePlans: 1,
                        billingTimes: 1
                    };
                    let result = await dbMethods.updateDatabaseInfo(backup.database.billingDbRef.child(`${backup.database.userDbId}`), userBillingProfile);
                    console.log("TCL: doBackup -> Saved item billing day on Database.", result);

                    result = await dbMethods.pushDatabaseInfo(backup.database.billingDbRef.child(`${backup.database.userDbId}/plans`), {
                        plan: variables.plan,
                        itemId: variables.itemId
                    });
                    console.log("TCL: doBackup -> Pushe item plan on Database.", result);

                } else {
                    userBillingProfile = {
                        activePlans: backup.billingDay.activePlans + 1,
                        billingTimes: backup.billingDay.billingTimes + 1,
                    };
                    let result = await dbMethods.updateDatabaseInfo(backup.database.billingDbRef.child(`${backup.database.userDbId}`), userBillingProfile);
                    console.log("TCL: doBackup -> Saved item billing day on Database.", result);

                    result = await dbMethods.pushDatabaseInfo(backup.database.billingDbRef.child(`${backup.database.userDbId}/plans`), {
                        plan: variables.plan,
                        itemId: variables.itemId
                    });
                    console.log("TCL: doBackup -> Pushe item plan on Database.", result);
                };

                const newWallet = {
                    switch: parseFloat((parseFloat(backup.userProfile.wallet.switch) - (backup.discountValue*1000)).toFixed(2)),
                };
                console.log("TCL: registerBilling -> newWallet", newWallet)

                // Update user profile wallet
                result = await dbMethods.updateDatabaseInfo(backup.database.userDbRef.child(`personal/wallet`), {
                    switch: newWallet.switch
                });
                console.log("TCL: registerBilling -> Discount Result", result);

                const sendMessage = async (newWallet, messengerId, discountValue) =>{
            
                    console.log(`TCL: Into sendMessage`);
                    // const urlHomolog = `https://api.chatfuel.com/bots/5d1513f28955f00001fadda7/users/${messengerId}/send`
                    // const homologToken = 'qwYLsCSz8hk4ytd6CPKP4C0oalstMnGdpDjF8YFHPHCieKNc0AfrnjVs91fGuH74'
        
                    const urlProdution = `https://api.chatfuel.com/bots/5dd588136dff450001d83274/users/${messengerId}/send`
                    const productionToken = "qwYLsCSz8hk4ytd6CPKP4C0oalstMnGdpDjF8YFHPHCieKNc0AfrnjVs91fGuH74"
                    const request = require("request");
                    const device_type = `Onboard Smart R$39,90`
                    const activePlans = 1;
                    const options = { 
                        method: 'POST',
                        url: urlProdution,
                        qs: { 
                            chatfuel_token: productionToken,
                            chatfuel_block_id: '5dd588136dff450001d83729',
                            discount_value: `${(discountValue*1000).toFixed(2)}`,
                            "device-type": `${device_type}`,
                            "user-credits": `${newWallet.switch}` },
                            "billedDevices": `${activePlans}`,
                        headers: { 'Content-Type': 'application/json' },
                        body: { 
                            chatfuel_token: productionToken,
                            chatfuel_block_id: '5dd588136dff450001d83729',
                            discount_value: `${discountValue}`,
                            "device-type": `${device_type}`,
                            "user-credit": `${newWallet.switch}`,
                            "billedDevices": `${activePlans}`
                        },
                        json: true 
                    };
        
                    await request(options, function (error, resp, body) {
                        if (error){
                            console.error("TCL: discountValueFromUser -> error", error)
                                
                                throw {
                                    status: 400,
                                    text: `Failed to send message to user's menssenger. Error: ${JSON.stringify(error)}`
                            } ;
                        };
                        console.log(`TCL: ${JSON.stringify(body)}`);
                        console.log(`TCL: ${JSON.stringify(resp)}`);
                    });
                    console.log(`TCL: Message sent to Messenger`);
                    resolve({
                        status: 200,
                        text: `OBD registered. Message sent to user and discount made on user wallet.`
                    })
                        
                };

                await sendMessage(newWallet, backup.userProfile.messengerId, backup.discountValue);

            } catch (error) {
                console.error("TCL: registerBilling -> Failed to register OBD", error);

                // Save item billing profile on Database
                let result = await dbMethods.setDatabaseInfo(backup.database.userDbRef.child(`billing/${backup.itemId}`), backup.billingInfo);
                console.log("TCL: doBackup -> Reverted billing Information on user profile..", result)
                
                // Revert billing databse
                result = await dbMethods.updateDatabaseInfo(backup.database.billingDbRef.child(`${backup.database.userDbId}`), backup.billingDay);
                console.log("TCL: doBackup -> Reverted billing Information on billing Day", result)
                
                // Revert user profile 
                result = await dbMethods.updateDatabaseInfo(backup.database.userDbRef.child(`personal`), backup.userProfile);
                console.log("TCL: doBackup -> Reverted user profile.", result);

                if (error.status) reject({
                    status: error.status,
                    text: error.text
                });

                reject({
                    status: 500,
                    text: `Error adding OBD, check what happened. ${error}`
                });
                
            }; 
        };
        
        const doBackup = async () => {

            try{
                const today = new Date();
                let billingPeriod = 0
                if (today.getDate() > 28 || today.getDate() === 1) {
                    billingPeriod = 28
                } else if (today.getDate() <= 28 && today.getDate() >= 2){
                    billingPeriod = today.getDate() - 1
                }
                console.log(`TCL: billingPeriod: `, billingPeriod);
                
                const itemId = await getItemId(variables.itemId)
                console.log("TCL: doBackup -> itemId", itemId)
    
                // GET database PATHS
                const database = await billingDatabase(billingPeriod, variables.userEmail);
    
                let discountValue = 0
                if (variables.plan === 'smart'){
                    discountValue += 39.9
                } else if (variables.plan === 'wifi'){
                    discountValue += 99.9
                } else {
                    throw {
                    status: 401,
                    text:`plan unknow - ${variables.plan}`
                    } 
                }

                // Get user profile on personal database
                const userProfile = await dbMethods.getDatabaseInfo(database.userDbRef.child("personal"));
                console.log("TCL: registerBilling -> userProfile", userProfile)
    
                // Check if user exists. If Not, throw error
                //CHECK FOR ONBOARD???
                if (userProfile === null || undefined) {
                    throw {
                        status: 404,
                        text: `User ${variables.userEmail} não existe do banco de dados.`
                    }
                };
    
                // Get item Profile to verify ownership
                const itemProfile = await dbMethods.getDatabaseInfo(database.userDbRef.child(`items/${itemId}`));
                if (itemProfile === null || undefined){
                    throw {
                        status: 401,
                        text: `Can register OBD to user. No item ${variables.itemId} in profile. Do Onboard.`
                    }
                } else if (itemProfile.owner !== variables.userEmail) {
                    throw {
                        status: 401,
                        text: `Can register OBD to user. Not owner of item ${variables.itemId}`
                    }
                }
    
                // Get billing information on user profile
                const billingInfo = await dbMethods.getDatabaseInfo(database.userDbRef.child(`billing/${itemId}`));
                console.log("TCL: doBackup -> billingInfo", billingInfo);
    
             
                // Check if item is already registered. If Not, create billing profile for item
                if (billingInfo === null || undefined) {
                console.log("TCL: doBackup -> No billing info registered.", billingInfo)
                    
                } else {
                    throw {
                        status: 409,
                        text: `OBD already registered for item ${variables.itemId}`
                    };    
                };
    
                const billingDay = await dbMethods.getDatabaseInfo(database.billingDbRef.child(`${database.userDbId}`))
                console.log("TCL: registerBilling -> billingDay", billingDay)
                
    
                const backup = {
                    itemId: itemId,
                    discountValue: discountValue,
                    database: database,
                    billingPeriod: billingPeriod,
                    billingInfo: billingInfo,
                    billingDay: billingDay,
                    userProfile: userProfile
    
                };
                return await registerObd(backup);
            } catch (error) {
                console.error("TCL: doBackup -> Failed todo Backup in register OBD", error);

                if (error.status) {
                    reject({
                        status: error.status,
                        text: error.text
                    });
                } else {
                    reject({
                        status: 500,
                        text: `Error doing backup for register OBD, check what happened. ${error}`
                    });
                }
                
            };
        };

        await doBackup();  
    });
};


export const executeBilling = () => {
    return new Promise(async(resolve, reject) => {
        const dbMethods = await databaseMethods();
        const doBackup = async () => {
            try {
                const today = new Date();
                const billingPeriod = today.getDate();
                if (billingPeriod > 28 ) throw {
                    status: 202,
                    text: 'Billing Period greater than 28.'
                }; 
                const database = await billingDatabase(billingPeriod, "mockEmail");
                const dailyBilling = await dbMethods.getDatabaseInfo(database.billingDbRef);
                console.log("TCL: doBackup -> dailyBilling", dailyBilling)
                if (dailyBilling === null || !dailyBilling || dailyBilling===undefined) throw {
                    status: 202,
                    text: `No OBDs registered in day ${billingPeriod}.`
                };
                const profilesToBill = Object.keys(dailyBilling);
                console.log("TCL: doBackup -> profilesToBill", profilesToBill);
                if (profilesToBill === null || profilesToBill === undefined) throw {
                    status: 202,
                    text: `No info on profiles to bill.`
                };
                await profilesToBill.forEach(async element => {
                    console.log("TCL: doBackup -> element", element)
                    const billingProfile = await dailyBilling[element]
                    console.log("TCL: doBackup -> billingProfile", billingProfile)
                    if (billingProfile === null || billingProfile === undefined) {
                        throw {
                            status: 300,
                            text: `No profile found for ${element}.`
                        }
                    };

                    

                    const billProfile = async () => {

                        const discountValueBase = 39.9;
                        const activePlans: number = billingProfile.activePlans;
                        const billingTimesBase: number = billingProfile.billingTimes; 
                        const customersDatabase = await customersDbRoot();
        
                        const userProfileWallet = await dbMethods.getDatabaseInfo(customersDatabase.child(`/profiles/${element}/personal/wallet`));
                        console.log("TCL: doBackup -> userProfileWallet", userProfileWallet);
        
                        const userMessengerId = await dbMethods.getDatabaseInfo(customersDatabase.child(`/profiles/${element}/personal/messengerId`));
                        console.log("TCL: doBackup -> userMessengerId", userMessengerId);
        
                        const discountValue = parseFloat((discountValueBase*activePlans*1000).toFixed(3));
                        console.log("TCL: doBackup -> discountValue", discountValue);
                        const newWallet = {
                            switch: parseFloat(( parseFloat(userProfileWallet.switch) - discountValue).toFixed(3)),
                        };
                        console.log("TCL: doBackup -> newWallet", newWallet);

                        const billingTimes = billingTimesBase + activePlans;
                        console.log("TCL: doBackup -> billingTimes", billingTimes);

                        let result = await dbMethods.updateDatabaseInfo(customersDatabase.child(`/profiles/${element}/personal/wallet`), newWallet)
                        console.log("TCL: billProfile -> Update Wallet", result);

                        result = await dbMethods.updateDatabaseInfo(database.billingDbRef.child(`${element}`), {
                            billingTimes: billingTimes,
                        });
                        console.log("TCL: billProfile -> Update billing database - billing Times", result);
                        
                        const sendMessage = async () =>{
            
                            console.log(`TCL: Into sendMessage`);
                            // const urlHomolog = `https://api.chatfuel.com/bots/5d1513f28955f00001fadda7/users/${messengerId}/send`
                            // const homologToken = 'qwYLsCSz8hk4ytd6CPKP4C0oalstMnGdpDjF8YFHPHCieKNc0AfrnjVs91fGuH74'
                
                            const urlProdution = `https://api.chatfuel.com/bots/5dd588136dff450001d83274/users/${userMessengerId}/send`
                            const productionToken = "qwYLsCSz8hk4ytd6CPKP4C0oalstMnGdpDjF8YFHPHCieKNc0AfrnjVs91fGuH74"
                            const request = require("request");
                            const device_type = `Onboard Smart R$39,90`
                            const activePlans = 1;
                            const options = { 
                                method: 'POST',
                                url: urlProdution,
                                qs: { 
                                    chatfuel_token: productionToken,
                                    chatfuel_block_id: '5dd588136dff450001d83729',
                                    discount_value: `${(discountValue*1000).toFixed(2)}`,
                                    "device-type": `${device_type}`,
                                    "user-credits": `${newWallet.switch}` },
                                    "billedDevices": `${activePlans}`,
                                headers: { 'Content-Type': 'application/json' },
                                body: { 
                                    chatfuel_token: productionToken,
                                    chatfuel_block_id: '5dd588136dff450001d83729',
                                    discount_value: `${discountValue}`,
                                    "device-type": `${device_type}`,
                                    "user-credit": `${newWallet.switch}`,
                                    "billedDevices": `${activePlans}`
                                },
                                json: true 
                            };
                
                            await request(options, function (error, resp, body) {
                                if (error){
                                    console.error("TCL: discountValueFromUser -> error", error)
                                        
                                        throw {
                                            status: 400,
                                            text: `Failed to send message to user's menssenger. Error: ${JSON.stringify(error)}`
                                    } ;
                                };
                                console.log(`TCL: ${JSON.stringify(body)}`);
                                console.log(`TCL: ${JSON.stringify(resp)}`);
                            });
                            console.log(`TCL: Message sent to Messenger`);
                        };
        
                        await sendMessage();
                    
                    };
                    await billProfile();
                        
                });

                console.log(`TCL: Finished billing array.`);
                resolve({
                    status: 200,
                    text: "finished billing user today."
                });

            } catch (error) {
                console.log("TCL: doBackup -> error", error)
                if (error.status) {
                    reject(error)
                };
                reject({
                    status: 500,
                    text: `Failed to bill profiles. Error: ${error}`
                })
                
            }
            

        };
        await doBackup();
    });
};