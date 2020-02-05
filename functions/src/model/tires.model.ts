import { NumericDictionary } from "lodash";

// interface TireOnboard {
//     totalValue: number;
//     qtd: number;
//     userEmail: string;
//     tireId: string;
//     plate: string;
//     vehicleType: string;
// };

export interface TireInUserProfile {
    activationsCounter: {
        accident: number
    }
    itemId: string;
    owner: string;
    type: "tires";
    vehicleType: string;
}

export interface TireItemProfile {
    profile: {
        protectionData: {
            activationsCounter: number;
            minuteValue: number;
            protectedMinutes: number;
            protectionStatus: boolean;
            tireQtd: number;
            totalValue: number;
            vehicleId: string;
            vehicleType: string;
        }
        tire: {}
    }
}
export interface TireProtectionData {
    activationsCounter: {
        accident: number;
    };
    minuteValue: number;
    protectedMinutes: number;
    protectionStatus: {
        accident: boolean;
    };
    tireQtd: number;
    totalValue: number;
    vehicleId: string;
    vehicleType: string;
}