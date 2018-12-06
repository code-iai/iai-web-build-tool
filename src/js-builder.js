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

const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const browserify = require('browserify');
const reactify = require('reactify');
const sourceStream = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

const basename = require('../src/utilities/basename');
const builder = require('./builder');

function resolveJSRequireDependencies(source, {
    outputName,
    beStandalone = false,
} = {}) {
    const standaloneName = (beStandalone && outputName)
        ? basename.fileBasename(outputName, {
            noExtension: true,
        })
        : '';

    const b = browserify({
        entries: source,
        debug: true,
        // defining transforms here will avoid crashing your stream
        transform: [reactify],
        standalone: standaloneName,
    });

    b.external('d3');
    b.external('jquery');
    b.external('rdflib');

    return b.bundle()
        .pipe(sourceStream(outputName))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }));
}

function pipeBrowserifyBabelUglify(piper, {
    source,
    outputName,
    useBabel = false,
    useUglify = false,
    beStandalone = false,
} = {}) {
    let b = resolveJSRequireDependencies(source, {
        outputName,
        beStandalone,
    });

    if (useBabel || useUglify) {
        b = b.pipe(babel({
            presets: ['env'],
        }));
    }

    if (useUglify) {
        b = b.pipe(uglify());
    }

    return b.pipe(sourcemaps.write('./'));
}

function build(source, {
    destination,
    outputName,
    useBabel = false,
    useUglify = false,
    beStandalone = false,
} = {}) {
    return new Promise(async (resolve, reject) => {
        try {
            await builder.build(source, {
                destination,
                outputName,
                outputExtension: '.js',
                customCallbackFunction: pipeBrowserifyBabelUglify,
                callbackFunctionData: {
                    source,
                    outputName,
                    useBabel,
                    useUglify,
                    beStandalone,
                },
            });
        } catch (Error) {
            // console.log(Error.message);
            reject(Error);
        }

        resolve('JS-File was created');
    });
}

module.exports = {
    build,
};
