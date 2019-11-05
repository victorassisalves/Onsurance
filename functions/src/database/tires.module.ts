export interface TireProfile {
    id: string;
    model: string;
    brand: string;
    width: number | string;
    height: number | string;
    price: number;
    timestampOnboard: Date;
    timestampActivationCupom: Date;
    timestampInvoice: Date;
    category: string;
    speedIndex: number | string;
    loadIndex: number | string;
    rim: string | number;
}

/**
 * @interface TiresDB
 * Used to get the mock data for saving in database
 * 
 */
export interface TiresDB {

    qtd: number,
    totalValue: number,
    minuteValueBase: number,
    minuteValue: number;
    tires: {
        [`tireProfile.id`]: TireProfile
    }

    
}

export interface VehicleProfile {
    tiresData: TiresDB;
    profile: Object;
    logUse: Object;
    tiresLogUse: Object;
}

export interface TireCalcMinute {
    qtd: number;
    totalValue: number;
}