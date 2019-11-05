let log = () => {
    const production = false;
    let log;
    if (!production) {
        log = console.log;
    }
    else {
        log = () => {
            return;
        };
    }
    return log;
};
module.exports = log;
//# sourceMappingURL=log.js.map