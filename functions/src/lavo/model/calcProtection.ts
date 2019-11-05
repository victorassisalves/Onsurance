export const calc = (timeStart, timeEnd) => {

    const minuteValue = 0.015

        const useTime = timeEnd - timeStart       // TimeDiff - Tempo total de uso da protecão em segundos
        const days = (useTime/60/60/24|0)                         // TimeDiffDays - Tempo de uso em dias(totais) da protecão
        const totalHours = (useTime/60/60|0)                     // TimeDiffHoursTotais - Tempo de uso da protecão em Horas
        let totalMinutes = (useTime/60|0);                         // TimeDiffMinutesTotais - Tempo de uso em minutos da protecão
        const hours = (totalHours - (days*24));                        // TimeDiffHours - Tempo de uso da protecão em horas dentro de 24H
        const minutes = (totalMinutes - (totalHours * 60));               // TimeDiffMinutes - Tempo de uso da protecão em minutos dentro de 60Min
        const seconds = (useTime - (totalMinutes*60));
        let protectionCost = 0;
        if (seconds >= 30){
            protectionCost = parseFloat(((Math.ceil(useTime/60))*minuteValue).toFixed(3))
            totalMinutes += 1
            console.log("TCL: closeProtection -> Considered minutes - ceil", Math.ceil(useTime/60))
        } else if (seconds < 30) {
            protectionCost = parseFloat(((Math.floor(useTime/60))*minuteValue).toFixed(3))
            console.log("TCL: closeProtection -> Considered Minutes - floor", Math.floor(useTime/60))
        }
        console.log("TCL: protectionCost", protectionCost)

        const protectionData = {
            timeStart: timeStart,
            timeEnd: timeEnd,
            useTime: useTime,
            hours:hours,
            totalMinutes: totalMinutes,
            minutes:minutes,
            seconds:seconds,
            protectionCost: parseFloat(protectionCost.toFixed(3)),
        };
        
        return protectionData;
};