const get = require('./get');
const set = require('./set');
const del = require('./delete');
const create = require('./create');

module.exports = {
    get,
    set,
    delete: del,
    create
}