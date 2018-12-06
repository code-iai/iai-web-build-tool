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

const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');

const builder = require('./builder');

function minifyFile(piper) {
    return piper.pipe(cleanCSS({ compatibility: 'ie8' }));
}

function pipeSass(piper, { minify = false } = {}) {
    const sassPiper = piper.pipe(sass());

    if (minify) {
        return minifyFile(sassPiper);
    }

    return sassPiper;
}

function build({
    sourceFilePath,
    resultFilePath,
    minify = false,
} = {}) {
    return new Promise(async (resolve, reject) => {
        try {
            await builder.build({
                sourceFilePath,
                resultFilePath,
                customCallbackFunction: pipeSass,
                callbackFunctionData: {
                    minify,
                },
            });
        } catch (Error) {
            // console.log(Error.message);
            reject(Error);
        }

        resolve('CSS-File was created');
    });
}

module.exports = {
    build,
};
