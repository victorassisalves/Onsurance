// Cotetion for anual cost of Onsurance
exports.quotation = ((data_set) => {
    const log = require('./log')()
    return new Promise((resolve, reject) => {
        const calcMin = require('./calcMin.js')
        // dados do usuário
        const userEmail = data_set["email_address_cot"]
        const firstName = data_set["first_name"];
        // Dados do veículo
        const carValue = data_set["vehicle_value_cot"]
        const vehicleType = (data_set["vehicle_type"]).toLowerCase()
        const factory = (data_set["factory_cot"]).toLowerCase()
        const onboard = (data_set["onboard_device_cot"]).toLowerCase()
        const horasUsoDia = parseInt(data_set["use_hours_cot"])
        const valorSeguro = data_set["insurance_value_cot"];
        const valorSemSeguro = data_set["no_insurance_value_cot"];
        let valorDoSeguro = valorSeguro

        if (vehicleType!== "carro" && vehicleType !== "moto"){
            reject({
                status: 412,
                error: `Incorrect variable.`,
                description: `Tipo de veículo: ${vehicleType} não é válido.`
            })
        } 
        if (factory !== "nacional" && factory !== "importado"){
            reject({
                status: 412,
                error: `Incorrect variable.`,
                description: `Factory: ${factory} não é válido.`
            })
        }

        let carPrice = parseInt(carValue)
        if (vehicleType === "moto" ){
            carPrice = carValue*2
        }

        let minute_value = 0.00484

        const calcAnualOnsurance = (minute_value) => {
            log(`2 - ${userEmail} - ${firstName} -  minute value, ${minute_value}`);

            let anual_onsurance_value = parseFloat(((horasUsoDia*60*365)*(minute_value/1000)).toFixed(2))

            if (onboard === "onboard 39,90"){
                log(`OnBoard Basic`)
                anual_onsurance_value += 478.8
            }  else if (onboard === "onboard 99,90"){
                log(`OnBoard Wi-Fi`)
                anual_onsurance_value += 1198.8
            } else {
                reject({
                    status: 412,
                    error: `Incorrect variable`,
                    description: `OnBoard device ${onboard} não é válido.`
                })
            }
            anual_onsurance_value = parseFloat((anual_onsurance_value).toFixed(2))

            log(`3 - ${userEmail} - ${firstName} -  consumo anual + OBD: ${anual_onsurance_value}`);

            let anual_onsurance_valueVirg = anual_onsurance_value.toString();
            anual_onsurance_valueVirg = anual_onsurance_valueVirg.replace(".", ",");

            const monthCost = parseFloat((anual_onsurance_value/12).toFixed(2))

            log('monthCost: ', monthCost);
            
    /* ---------------------------  Credit min - franchise --------------------- */

            let credit_min = 999
            let franchise = 1500

                            // MOTOS

            // franchise moto
            if (vehicleType === "moto" &&  carValue <= 19000) {
                franchise = 1500
            } else if (vehicleType === "moto" &&  carValue > 19000){

                if (factory === "nacional" && carValue > 25000){
                    franchise = carValue * 0.06
                } 
                if(factory === "importado"){
                    franchise = carValue * 0.08
                }
            }

            // Credit Min moto
            if (vehicleType === "moto" && carValue <= 16650){
                credit_min = 999

            } else if (vehicleType === "moto" && carValue > 16650) {
                credit_min = carValue*0.06
            }

                            // CARS

            // nacional Cars
            if (vehicleType === "carro" && factory === "nacional"){
                // franchise
                if (carValue < 37500){
                    franchise = 1500
                } else if (carValue >= 37500) {
                    franchise = carValue * 0.04
                }
                // Credit Min
                if (carValue > 40000) {
                    credit_min = carPrice*0.03
                } else if (carValue > 10000 && carValue <= 40000){
                    credit_min = 1199
                } else if (carValue <= 10000){
                    credit_min = 999
                }

            }

            // Imported Cars
            if (vehicleType === "carro" && factory === "importado") {
                // franchise
                if (carValue < 37500){
                    franchise = 3000
                } else if (carValue >= 37500) {
                    franchise = carValue * 0.08
                }
                // Min credit
                if (carValue > 40000) {
                    credit_min = carPrice*0.045
                } else {
                    credit_min = 1799
                }
            }
            let insurance_calc = valorDoSeguro
            // Calcula valor do seguro tradicional caso o usuário não tenha seguro
            if (valorSemSeguro === "0.05"){
                if (factory === "importado") {
                    valorDoSeguro = (0.096*carValue).toFixed(2);
                    insurance_calc = valorDoSeguro
                } else {
                    valorDoSeguro = (0.05*carValue).toFixed(2);
                    insurance_calc = valorDoSeguro
                }
                if (vehicleType === "moto"){
                    valorDoSeguro = (carValue*0.08).toFixed(2)
                    insurance_calc = valorDoSeguro
                }
            } else {
                if (factory === "importado") {
                    insurance_calc = (0.096*carValue).toFixed(2)
                } else {
                    insurance_calc = (0.05*carValue).toFixed(2)
                }
                if (vehicleType === "moto"){
                    insurance_calc = (carValue*0.08).toFixed(2)
                }
            }

            log(`4 - ${userEmail} - ${firstName} -  valor do seguro: ${valorDoSeguro}`);
            const minute_value_rs = (minute_value/1000).toFixed(5)
            const credit_duration = (credit_min/monthCost).toFixed(2)
            const economy = (valorDoSeguro - anual_onsurance_value).toFixed(2)
            log('creditDuration: ', credit_duration)
            log('credit_min: ', credit_min)
            
            const quotation_data = {
                public_api: {
                    credit_duration: credit_duration,
                    insurance_calc: insurance_calc,
                    economy_cot: economy,
                    minute_value_cot: minute_value_rs,
                    anual_protection_value_cot: anual_onsurance_value,
                    min_credit_cot: credit_min.toFixed(2),
                    franchise_cot: franchise,
                },
                private_api: {
                    ...data_set,
                    credit_duration: credit_duration,
                    insurance_calc: insurance_calc,
                    economy_cot: economy,
                    minute_value_cot: minute_value_rs,
                    anual_protection_value_cot: anual_onsurance_value,
                    min_credit_cot: credit_min.toFixed(2),
                    franchise_cot: franchise,
                }
            }
            log(JSON.stringify(quotation_data))
            resolve(quotation_data)
        }

        const getMinutePrice = () => {
            calcMin.calcMinCar(carPrice).then(result => {
                minute_value = result
                log('minute_value: ', minute_value);
                if (factory === "importado"){
                    minute_value = parseFloat((minute_value*1.2).toFixed(3))
                }
                calcAnualOnsurance(minute_value)
            }).catch(error => {
                console.error(new Error(`${JSON.stringify(error)}, Error calculating minute price.`))
                reject({
                    status: 400,
                    error: error,
                    description: "Falha ao gerar preço do minuto."
                })
            })  
        }
        
        getMinutePrice()
    
    })
})