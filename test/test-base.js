const fs = require('fs');
const path = require('path');
const del = require('../node_modules/del');
const fileExist = require('../src/utilities/file-exist');

const tempDir = './test/temp';
const compDir = './test/comp';

function createTempDir(){
    deleteTempDir();
    fs.mkdirSync(tempDir);
}

function deleteTempDir(){
    forceDeleteFile([tempDir]);
}

function forceDeleteFile(patterns){
    del.sync(patterns, { force:true });
}

module.exports = {
    fs,
    path,
    fileExist,
    tempDir,
    compDir,
    createTempDir,
    deleteTempDir,
    forceDeleteFile,
}

