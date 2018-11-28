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

const basename = require('./basename');
const fileExist = require('./file-exist');

function doSomething() {
    throw Error('You have to implement the method doSomething!');
}

function buildFileName(source, {
    extension = '',
} = {}) {
    return (extension)
        ? basename.fileBasenameNewExtension(source, {
            newExtension: extension,
        })
        : basename.fileBasename(source);
}

function build(source, {
    destination = `${source}/dest`,
    outputName = '',
    outputExtension = '',
} = {}) {
    return new Promise((resolve) => {
        fileExist.fileDoesNotExistThrowError(source);

        const fileOutputName = outputName || buildFileName(source, {
            extension: outputExtension,
        });

        let gulper = gulp.src(source);

        try {
            gulper = doSomething(gulper);
        } catch (Error) {
            console.log(Error.message);
        }

        gulper.on('error', log.error)
            .pipe(rename(fileOutputName))
            .pipe(gulp.dest(destination))
            .on('finish', () => {
                resolve('File was created');
            });
    });
}

module.exports = {
    build,
    doSomething,
}
