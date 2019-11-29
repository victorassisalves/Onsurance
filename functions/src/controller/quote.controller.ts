import { getTireMinuteValue } from "../model/calcMin";
import { TireQuoteVariables } from "../environment/quotation.variables";

export class executeTiresQuotation {
    minuteValue: number;
    anualCost: number;
    creditDuration: number;
    variables: TireQuoteVariables;
    constructor(variables: TireQuoteVariables) {
        this.variables = variables;
    }

    getMinuteValue() {
        this.minuteValue = getTireMinuteValue(this.variables.totalValue, this.variables.vehicleType);
        return this.minuteValue;
    }

    /**
     * 
     * @param minuteValue Tire minute value of Onsurance
     */
    calcUsage () {
        this.anualCost = this.minuteValue * 60 * this.variables.dailyUsage * 365;
        this.creditDuration = parseFloat((50/this.anualCost*12).toFixed(2));
        return {
            anualCost: this.anualCost,
            creditDuration: this.creditDuration
        }
    };
};

/**
 * @description Execute the quote for Onsurance tires 
 * @param {TireQuoteVariables} variables The treated variables to execute the quotation
 */
export const executeTiresQuote = (variables: TireQuoteVariables) => {
    try {
        const tire = new executeTiresQuotation(variables);
        const minuteValue = tire.getMinuteValue();
        const usageData = tire.calcUsage();
        return {
            ...usageData,
            minuteValue: minuteValue
        }

    } catch (error) {
        throw error;
        
    }
};