let log = () => {
    const production = true
    let log

    if (!production) {
        log = console.log
    } else {
        log = () => {
            return
        } 
    }
    return log

}

module.exports = log
