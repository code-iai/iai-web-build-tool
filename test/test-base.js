const fs = require('fs');
const del = require('../node_modules/del');
const fileExist = require('../src/utilities/file-exist');

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
    fileExist,
    tempDir,
    compDir,
    createTempDir,
    deleteTempDir,
}

