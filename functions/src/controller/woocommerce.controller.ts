import {userProfileDbRefRoot} from "../database/database"
import {getVariables} from "../environment/woocommerce"; 
import { databaseMethods } from "../model/databaseMethods";

export const woocommercePurchase = async (request) => {
    return new Promise( async (resolve, reject) => {
        
        // Get woocommerce set of variables.
        const variables = getVariables(request);

        // make backup in case something goes wrong anywhere
        const doBackup = async () => {
            try {
                if (variables.orderPaid === false) {
                    throw{
                        status: 204, // Not completed
                        text: `Order not completed yet for ${variables.userEmail}.`,
                    };
                }
                // Get Methods for backup in case something goes wrong
                const dbMethods = await databaseMethods();
                // Get user profile data for backup on DB
                const userDbPath = userProfileDbRefRoot(variables.userEmail)
                // Get user profile data for backup on DB
                const getFullProfile = await dbMethods.getDatabaseInfo(userDbPath)
				console.log("TCL: doBackup -> getFullProfile", getFullProfile)

                return {
                    userMethods: dbMethods,
                    userDbPath: userDbPath,
                    fullProfile: getFullProfile
                }
            } catch (error) {
                console.error(new Error(`${JSON.stringify(error)}`));
                reject(error)
            }
        };

        const backup = await doBackup()

        // Check order status. If is completed (true) enter
        if (variables.orderPaid) {
            try {
                /*
                    TODO:  Get/Set data in ZOHO CRM API
                */

                // Database reference for user profile
                const userProfileDb = await userProfileDbRefRoot(variables.userEmail);

                // Get Methods for playing with user data base root CRUD
                const profile = await databaseMethods();

                // Set profile DB Path to client purchase history
                const purchaseHistoryDb = await databaseMethods();

                // Get user personal profile info on DB
                const getProfile = await profile.getDatabaseInfo(userProfileDb.child("personal"))
				console.log("TCL: getProfile", getProfile)

                let fundsToWallet= 0.0;
                let hasAssistance = false;
                
                // Get all the products in the purchase
                const getPurchase = () => {
                    let totalFunds = 0;
                    const purchasedItems = [];
                    for (const product of variables.purchasedItems){
                        purchasedItems.push(product.product_id)
                        totalFunds += parseFloat(product.subtotal)

                        if (product.product_id === 386 || product.product_id === 543){

							console.log("TCL: getPurchase -> ", `Non Credit Products: ID:${(product.product_id)}, Name: ${product.name}`)
                            if (product.product_id === 386) hasAssistance = true;
                        } else {

							console.log("TCL: getPurchase -> ", `Add to wallet: ID:${product.product_id}, Name: ${product.name}`)

							console.log("TCL: getPurchase -> ", `Subtotal: ${parseFloat(product.subtotal)}`)
            
                            fundsToWallet += parseFloat(product.subtotal)
							console.log("TCL: getPurchase -> fundsToWallet", fundsToWallet)
                        }
                    }
                    return {
                        fundsToWallet: fundsToWallet,
                        totalFunds: totalFunds,
                        purchasedItems: purchasedItems
                    }
                };
                const purchaseData = await getPurchase();

                // Function to push the purchase information to purchaseHistory DB Path
                const setPurchaseHistoryInfo = async () => {
                    // purchase history info
                    const purchaseHistory = {
                        totalFunds: purchaseData.totalFunds,
                        fundsToWallet: purchaseData.fundsToWallet,
                        orderId: variables.orderId,
                        purchaseDate: variables.purchaseDate,
                        purchasedItems: purchaseData.purchasedItems
                    };

                    // Update last order in purchase history db path
                    const updateOrder = await purchaseHistoryDb.updateDatabaseInfo(userProfileDb.child('purchaseHistory'), {lastOrder: variables.orderId})
					console.log("TCL: setPurchaseHistoryInfo -> updateOrder", updateOrder)

                    // Push purchase history to db path
                    const pushPurchaseHistory = await purchaseHistoryDb.pushDatabaseInfo(userProfileDb.child('purchaseHistory'), purchaseHistory)
					console.log("TCL: setPurchaseHistoryInfo -> pushPurchaseHistory", pushPurchaseHistory)

                    return true;
                };

                // If user Dont exist enter here
                if (getProfile === null) {
                    await setPurchaseHistoryInfo()
                    const contentSet = {
                        userEmail: variables.userEmail,
                        firstName: variables.firstName,
                        cpf: variables.cpf,
                        clientId: variables.idClient,
                        lastOrder: variables.orderId,
                        onboard: false,
                        wallet: {
                            switch: fundsToWallet*1000,
                        }
                    };
                    const result = await profile.setDatabaseInfo(userProfileDb.child("personal"), contentSet)
                    resolve(result);

                } else { // Client is making a recharge...

                    //Check if last order is equal to order id to not repeat funds operation
                    if (getProfile.lastOrder === variables.orderId){
						console.log("TCL: woocommercePurchase -> ", `Order ${variables.orderId} already computed.`)
                        reject({
                            status: 208,
                            text: `Already computed Order for ${variables.userEmail}.`
                        });
                    } else { 
                        await setPurchaseHistoryInfo()
                        let contentUpdate;
                        if (getProfile.clientId === null || getProfile.clientId === undefined) {
                            contentUpdate = {
                                lastOrder: variables.orderId,
                                clientId: variables.idClient,
                                wallet: {
                                    switch: getProfile.wallet.switch + (fundsToWallet*1000)
                                },
                            }; 
                        } else {
                            contentUpdate = {
                                lastOrder: variables.orderId,
                                wallet: {
                                    switch: parseFloat((getProfile.wallet.switch + (fundsToWallet*1000)).toFixed(2))
                                },
                            }; 
                        }

                        const result = await profile.updateDatabaseInfo(userProfileDb.child("personal"), contentUpdate);
                        resolve(result);
                    };

                };

            } catch (error) {
                console.error(new Error(`Error for ${variables.userEmail}: ${JSON.stringify(error)}`));
                //revert profile in case something goes wrong
                await backup.userMethods.setDatabaseInfo(backup.userDbPath, backup.fullProfile);
                reject(error)
            } ;

        } else {
			console.log("TCL: woocommercePurchase -> ", `Order paid: ${variables.orderPaid}. Return to request.`)
            return reject({
                status: 204, // Not completed
                text: `Order not completed yet for ${variables.userEmail}.`,
            });

        };

    });   
};