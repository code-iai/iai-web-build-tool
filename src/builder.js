/*
Copyright (c) 2018 University of Bremen
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const gulp = require('gulp');
const rename = require('gulp-rename');
const log = require('gulplog');
const File = require('./utilities/file');

function pipeSource(source) {
    return gulp.src(source);
}

function executeCallbackFunction(piper, { callbackFunction, functionData } = {}) {
    if (typeof callbackFunction === 'function') {
        // All callback functions have to take the piping object as parameter
        // and return it
        return callbackFunction(piper, functionData);
    }

    throw new TypeError('You did not pass a callback function!');
}

function build({
    sourceFilePath,
    resultFilePath,
    customCallbackFunction,
    callbackFunctionData,
} = {}) {
    return new Promise((resolve) => {
        const sourceFile = new File(sourceFilePath);
        const resultFile = new File(resultFilePath);
        sourceFile.requiredExist();

        const fileOutputName = resultFile.getBasename();
        const dest = resultFile.getParentFolderPath();

        // Actual file building starts here
        let piper = pipeSource(sourceFilePath);

        piper = executeCallbackFunction(piper, {
            callbackFunction: customCallbackFunction,
            functionData: callbackFunctionData,
        });

        piper.on('error', log.error)
            .pipe(rename(fileOutputName))
            .pipe(gulp.dest(dest))
            .on('finish', () => {
                resolve('File was created');
            });
    });
}

module.exports = {
    build,
};
