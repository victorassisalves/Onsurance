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
export interface VehicleInUserProfileInterface {
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
export interface TireInUserProfileInterface {
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
export interface PersonalUserProfileInterface {
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
export interface ItemAuthorizations {
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
export interface PurchaseHistory {
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
export interface ItemsInUserProfile {
    [`vehicleId`] : VehicleInUserProfileInterface,
    tires : {
        ['tireId'] : TireInUserProfileInterface
    }
}




/**
 * @description This interface represents the Full user profile
 * ```
 * userProfile: ThisInterface
 * ```
 */
export interface UserProfileInterface {
    billing : {
        [`itemId`] : {
            billingDay : number,
            billingTimes : number,
            plan : "smart"
        }
    },
    itemAuthorizations : ItemAuthorizations,
    items : ItemsInUserProfile,
    personal : PersonalUserProfileInterface,
    purchaseHistory : PurchaseHistory
  }
  