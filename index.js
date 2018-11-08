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
const log = require('gulplog');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const nunjucks = require('gulp-nunjucks');
const gulpData = require('gulp-data');
const rename = require('gulp-rename');
const browserify = require('browserify');
const reactify = require('reactify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const fs = require('fs');
const path = require('path');

function buildHTMLMain(src, dest, data) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(src)) {
            reject(Error(`Source File ${src} does not exist.`));
        }

        const htmlFile = `${path.basename(src, path.extname(src))}.html`;

        gulp.src(src)
            .pipe(gulpData(() => (data)))
            .pipe(nunjucks.compile())
            .pipe(rename(htmlFile))
            .pipe(gulp.dest(dest))
            .on('finish', () => {
                const name = path.basename(src, path.extname(src));
                if (!fs.existsSync(`${dest}/${name}.html`)) {
                    reject(Error('File wasn\'t created'));
                }
                resolve('File was created');
            });
    });
}

function buildCSSMain(src, dest, minify) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(src)) {
            reject(Error(`Source File ${src} does not exist.`));
        }

        const c = gulp.src(src)
            .pipe(sass());

        if (minify) {
            c.pipe(cleanCSS({ compatibility: 'ie8' }));
        }

        c.on('error', log.error)
            .pipe(gulp.dest(dest))
            .on('finish', () => {
                const name = path.basename(src, path.extname(src));
                if (!fs.existsSync(`${dest}/${name}.css`)) {
                    reject(Error('File wasn\'t created'));
                }
                resolve('File was created');
            });
    });
}

function resolveJSRequireDependencies(pathToMainJs, outputName) {
    const b = browserify({
        entries: pathToMainJs,
        debug: true,
        // defining transforms here will avoid crashing your stream
        transform: [reactify],
        standalone: outputName,
    });

    b.external('d3');
    b.external('jquery');
    b.external('rdflib');

    return b.bundle()
        .pipe(source(outputName))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }));
}

function buildJSMain(pathToSrcMainJs, dest, outputName, useBabel, useUglify) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(pathToSrcMainJs)) {
            const outputN = outputName || path.basename(pathToSrcMainJs);

            let b = resolveJSRequireDependencies(pathToSrcMainJs, outputN);

            if (useBabel) {
                b.pipe(babel({
                    presets: ['env'],
                }));
            }

            if (useUglify) {
                b.pipe(babel({
                    presets: ['env'],
                }))
                    .pipe(uglify());
            }

            b.pipe(rename(`${outputN}.js`))
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest(dest))
                .on('finish', () => {
                    if (!fs.existsSync(`${dest}/${outputN}.js`)) {
                        reject(Error('File wasn\'t created'));
                    }
                    if (!fs.existsSync(`${dest}/${outputN}.js.map`)) {
                        reject(Error('Filemap wasn\'t created'));
                    }
                    resolve('File was created');
                });
        } else {
            reject(Error(`Source File ${pathToSrcMainJs} does not exist.`));
        }
    });
}

module.exports = {
    buildHTMLMain,
    buildCSSMain,
    buildJSMain,
};
