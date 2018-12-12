const fs = require('fs');
const del = require('../node_modules/del');

const TEMP_DIR = './test/temp';
const COMP_DIR = './test/comp';

function createTempDir(){
    deleteTempDir();
    fs.mkdirSync(TEMP_DIR);
}

function deleteTempDir(){
    del.sync([TEMP_DIR], { force:true });
}

module.exports = {
    TEMP_DIR,
    COMP_DIR,
    createTempDir,
    deleteTempDir,
};

