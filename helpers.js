const makeStringTitled = (str) => {
    return str && typeof str === "string" ? str.charAt(0).toUpperCase() + str.slice(1) : '';
};


module.exports = {
    makeStringTitled,
};
