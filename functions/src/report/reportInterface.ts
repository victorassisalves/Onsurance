/**
 * @description This interface represents the data of vehicles inside user profile
 * ```
 * userProfile: {
 *  items: {
 *      vehicleId: ThisInterface
 *  }
 * }
 * ```
 */
export interface Report_VehicleInUserProfileInterface {
    activationsCounter : {
      accident : number,
      theft : number,
      thirdParty : number
    },
    innerType : string,
    itemId : string,
    owner : string,
    type : "vehicle"
}

/**
 * @description This interface represents the data of Tires inside user profile
 * ```
 * userProfile: {
 *  items: {
 *      tires: {
 *          tireId: ThisInterface
 *      }
 *  }
 * }
 * ```
 */
export interface Report_TireInUserProfileInterface {
    activationsCounter : {
      accident : number
    },
    itemId : string,
    owner : string,
    type : "tires",
    vehicleType : string
};

/**
 * @description This interface represents the data of the user inside user profile
 * ```
 * userProfile: {
 *  personal: ThisInterface
 * }
 * ```
 */
export interface Report_PersonalUserProfileInterface {
    activationsCounter : number,
    clientId : number,
    cpf : number,
    firstName : string,
    lastName : string,
    lastOrder : number,
    messengerId : string,
    onboard : boolean,
    userEmail : string,
    wallet : {
      switch : number
    }
}

/**
 * @description This interface represents the Item Authorization in User Profile
 * ```
 * userProfile: {
 *  itemAuthorizations: ThisInterface
 * }
 * ```
 */
export interface Report_ItemAuthorizations {
    myItems : {
        [`itemId`] : {
            [`userId`] : boolean,
        }
    },
    thirdParty: {
        [`itemId`] :  boolean,
        tires: {
            [`itemId`]: boolean
        }
    }
}

/**
 * @description This interface represents the purchase history
 * ```
 * userProfile: {
 *  purchaseHistory: ThisInterface
 * }
 * ```
 */
export interface Report_PurchaseHistory {
    [`purchaseId`] : {
      fundsToWallet : number,
      orderId : number,
      purchaseDate : number,
      purchasedItems : Array<number>,
      totalFunds : number
    },
    lastOrder : number
}

/**
 * @description This interface represents the purchase history
 * ```
 * userProfile: {
 *  purchaseHistory: ThisInterface
 * }
 * ```
 */
export interface Report_ItemsInUserProfile {
    [`vehicleId`] : Report_VehicleInUserProfileInterface,
    tires : {
        ['tireId'] : Report_TireInUserProfileInterface
    }
}

/**
 * @description This interface represents the Full user profile
 * ```
 * userProfile: ThisInterface
 * ```
 */
export interface Report_BillingInterface {
    [`itemId`] : {
        billingDay : number,
        billingTimes : number,
        plan : "smart"
    }
}

/**
 * @description This interface represents the Full user profile
 * ```
 * userProfile: ThisInterface
 * ```
 */
export interface Report_UserProfileInterface {
    billing : Report_BillingInterface
    itemAuthorizations : Report_ItemAuthorizations,
    items : Report_ItemsInUserProfile,
    personal : Report_PersonalUserProfileInterface,
    purchaseHistory : Report_PurchaseHistory
}
  
/**
 * @description First version of log use data base model
 */
export interface Report_vehicleV1Interface {
    "finalProtecao" : string, //"1533396456 - Sábado - 4/8/2018 - 15:27:36"
    "inicioProtecao" : string, //"1533395940 - Sábado - 4/8/2018 - 15:19:0"
    "saldoFinal" : number, //"1235137.00" - string
    "saldoInicial" : number, //"1235200"
    "tempoUso" : string, //"0 dias : 0 horas : 8 minutos : 36 segundos",
    "valorconsumido" : any, //63
}

/**
 * @description Second version of log use data base model
 */
export interface Report_vehicleV2Interface {
    "finalSwitch" : number, //124357,
    "initialSwitch" : number, //134052,
    "tempoUso" : string, //"0 dias : 23 horas : 5 minutos : 17 segundos",
    "timeEnd" : number, //"1561798559" - string
    "timeStart" : number, //"1561715442" - string
    "user" : string, //"pedro-rubio2503@hotmail.com" - string
    "valorConsumido" : string, //"9695.00" - string
}


/**
 * @description Third version of log use data base model
 */
export interface Report_vehicleV3Interface {
    "activationUser" : string, //"pedro-rubio2503@hotmail.com",
    "closed" : boolean, //true,
    "consumedValue" : number, //0,
    "deactivationUser" : string, //"pedro-rubio2503@hotmail.com",
    "finalSwitch" : number, //93606,
    "initialSwitch" : number, //93606,
    "policies" : {
    "accident" : true,
    "theft" : true,
    "thirdParty" : true
    },
    "timeEnd" : number, //1562546615,
    "timeStart" : number, //1562546590,
    "useTime" : number, //25
}


export interface Report_UserFinalReportProfile {
    userId: string,
    billing: any;
    items: any;
    cpf: any;
    email: string;
    spent: number;
}

export interface Report_CustomersData {
    ['userId']: Report_UserProfileInterface
}
export interface Report_VehicleData {
    logUse?: Report_VehicleAutoLogUse,
    profile: Report_VehicleAutoProfile,

}

export interface Report_VehicleAutoProfile {
    "brand" : string, // "audi"
    "itemPrice" : number, //"64660",
    "model" : string, //"A4",
    "plate" : string, //"Jki7208",
    "protectionData" : {
        "access" : [ "pron" ],
        "activationsCounter" : {
        "accident" : number, // 381,
        "theft" : number, //381,
        "thirdParty" : number, //381
        },
        "minuteValue" : number, //12.1,
        "protectionStatus" : {
        "accident" : boolean, //false,
        "theft" : boolean, //false,
        "thirdParty" : boolean, //false
        }
    }
}

export interface Report_VehicleAutoLogUse {
    ['useId1']?: Report_vehicleV1Interface,
    ['useId2']?: Report_vehicleV2Interface,
    ['useId3']?: Report_vehicleV3Interface,
}

export interface Report_vehicleReport {
    totalMinutes: number,
    usageArray: any,
    spent: number
}