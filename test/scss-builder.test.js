const fs = require('fs');
const path = require('path');

const css = require('../node_modules/css');
const scssBuilder = require('../src/scss-builder');
const tB = require('./test-base');

beforeEach(() => {
    tB.createTempDir();
});

afterEach(() => {
    tB.deleteTempDir();
});

test('Build a test css file', async () => {
    const testDir = './test/src/scss';
    const srcFile = 'base.scss';
    const outputFile = 'main.css';
    const compFile = 'comp.css';

    expect.assertions(4);

    console.log(path.join(testDir, srcFile));

    await expect(scssBuilder.build(path.join(testDir, srcFile), {
        destination: tB.tempDir,
        outputName: outputFile,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(path.join(tB.tempDir, outputFile))).toBe(true);

    let testStr = fs.readFileSync(path.join(tB.tempDir, outputFile), 'utf8');
    let compStr = fs.readFileSync(path.join(tB.compDir, compFile), 'utf8');

    let [testObj, compObj] = await Promise.all([
        css.parse(testStr, { source: path.join(tB.tempDir, outputFile) }),
        css.parse(compStr, { source: path.join(tB.compDir, compFile) })
    ]);

    // Check that file was not minified
    expect(testStr).toEqual(expect.stringContaining('\n'));

    // Only check for same amount of rules
    expect(testObj.stylesheet.rules.length).toBe(compObj.stylesheet.rules.length);
});

test('Build a minified test css file', async () => {
    const testDir = './test/src/scss';
    const srcFile = 'base.scss';
    const outputFile = 'main.css';
    const compFile = 'comp.css';

    expect.assertions(4);

    console.log(path.join(testDir, srcFile));

    await expect(scssBuilder.build(path.join(testDir, srcFile), {
        destination: tB.tempDir,
        outputName: outputFile,
        minify: true,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(path.join(tB.tempDir, outputFile))).toBe(true);

    let testStr = fs.readFileSync(path.join(tB.tempDir, outputFile), 'utf8');
    let compStr = fs.readFileSync(path.join(tB.compDir, compFile), 'utf8');

    let [testObj, compObj] = await Promise.all([
        css.parse(testStr, { source: path.join(tB.tempDir, outputFile) }),
        css.parse(compStr, { source: path.join(tB.compDir, compFile) })
    ]);

    // Check whether file was minified
    expect(testStr).toEqual(expect.not.stringContaining('\n'));

    // Only check for same amount of rules
    expect(testObj.stylesheet.rules.length).toBe(compObj.stylesheet.rules.length);
});

test('Throw ReferenceError when source does not exist.', () => {
    const testDir = './test/src/scss';
    const outputFile = 'main.css';
    const nonexistentFile = 'nonexistent.scss';

    expect.assertions(1);

    expect(scssBuilder.build(path.join(testDir, nonexistentFile), {
        destination: tB.tempDir,
        outputName: outputFile,
    })).rejects.toThrowError(ReferenceError);
});
