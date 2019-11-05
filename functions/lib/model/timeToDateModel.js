"use strict";
/*
     Function to convert TIMESTAMP to DATE

*/
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Get timestamp from log use
 * @param timestamp Parameter created when customer Turn Onsurance ON or OFF
 * Used to know when customer used Onsurance
 */
exports.convertTimestamp = (timestamp) => {
    const fullTimeStamp = timestamp * 1000;
    const fullDate = new Date(fullTimeStamp);
    let month = (fullDate.getMonth() + 1).toString(); // From 0 to 11 ->  0 = january
    const day = fullDate.getDate(); // From 1 to 31
    const weekDay = fullDate.getDay(); // From 0 to 6 -> 0 = sunday...
    const year = fullDate.getFullYear();
    if (month.length === 1) {
        month = `0${month}`;
    }
    return {
        month: month,
        weekDay: weekDay,
        day: day,
        year: year
    };
};
//# sourceMappingURL=timeToDateModel.js.map