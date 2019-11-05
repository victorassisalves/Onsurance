// File to work with separeted polices for insurance

export const policesProtection = (minutePrice, policiesNumber) => {
    switch (policiesNumber) {
        case 1:
            return parseFloat((minutePrice*0.6).toFixed(3))
        case 2:
            return parseFloat((minutePrice*0.8).toFixed(3))
        case 3:
            return minutePrice
    
        default:
            return minutePrice;
    }
}