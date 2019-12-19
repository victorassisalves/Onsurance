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

/**
 * @description This function generates the timeEnd info
 * @param timeStart Time that onsurance start
 * @param timezone The user timezone 
 */
export const generateTimeEnd = (timeStart, timezone = 0) => {
    let timezoneDiff = 0
    if (timezone !== null) {
        timezoneDiff = timezone * 1000 * 3600 
    };
    
    const timeEnd = (Date.now() + timezoneDiff)/1000|0;                              // TimeEnd - Timestamp do desligamento da protecão
    const useTime = timeEnd - timeStart       // TimeDiff - Tempo total de uso da protecão em segundos
    const days = (useTime/60/60/24|0)                         // TimeDiffDays - Tempo de uso em dias(totais) da protecão
    const totalHours = (useTime/60/60|0)                     // TimeDiffHoursTotais - Tempo de uso da protecão em Horas
    let totalMinutes = (useTime/60|0);                         // TimeDiffMinutesTotais - Tempo de uso em minutos da protecão
    const hours = (totalHours - (days*24));                        // TimeDiffHours - Tempo de uso da protecão em horas dentro de 24H
    const minutes = (totalMinutes - (totalHours * 60));               // TimeDiffMinutes - Tempo de uso da protecão em minutos dentro de 60Min
    const seconds = (useTime - (totalMinutes*60)); 

    if (seconds >= 30) totalMinutes += 1

    return {
        timeEnd: timeEnd,
        useTime: useTime,
        days: days,
        totalHours: totalHours,
        totalMinutes: totalMinutes,
        hours: hours,
        minutes: minutes,
        seconds: seconds
    }   
}