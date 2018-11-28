const fs = require('fs');
const path = require('path');
const del = require('../node_modules/del');

const tempDir = './test/temp';
const compDir = './test/comp';

function createTempDir(){
    deleteTempDir();
    fs.mkdirSync(tempDir);
}

function deleteTempDir(){
    del.sync([tempDir], { force:true });
}

module.exports = {
    fs,
    path,
    tempDir,
    compDir,
    createTempDir,
    deleteTempDir,
}

