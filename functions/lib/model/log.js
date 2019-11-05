"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = (() => {
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
})();
//# sourceMappingURL=log.js.map