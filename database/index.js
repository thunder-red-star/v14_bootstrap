const fs = require('fs');
const path = require('path');

const guild = require('./guild/index.js');
const error = require('./error/index.js');

module.exports = {
    guild,
    error
};