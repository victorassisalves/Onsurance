/*
     Function to convert TIMESTAMP to DATE

*/

interface returnedDateInterface {
    month: string;
    day: number;
    weekDay: number;
    year: number;
}

/**
 * Get timestamp from log use
 * @param timestamp Parameter created when customer Turn Onsurance ON or OFF
 * Used to know when customer used Onsurance
 */
export const convertTimestamp = (timestamp): returnedDateInterface => {
    const fullTimeStamp = timestamp*1000;
    const fullDate = new Date(fullTimeStamp);
    let month: string = (fullDate.getMonth() + 1).toString(); // From 0 to 11 ->  0 = january
    const day: number = fullDate.getDate(); // From 1 to 31
    const weekDay: number = fullDate.getDay(); // From 0 to 6 -> 0 = sunday...
    const year: number = fullDate.getFullYear();
    if (month.length === 1) {
        month = `0${month}`
    }


    return {
        month: month,
        weekDay: weekDay,
        day: day,
        year: year
    };
}