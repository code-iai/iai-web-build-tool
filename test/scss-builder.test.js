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

    const sourceFilePath = path.join(testDir, srcFile);
    const resultFilePath = path.join(tB.tempDir, outputFile);


    await expect(scssBuilder.build({
        sourceFilePath,
        resultFilePath,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(resultFilePath)).toBe(true);

    let testStr = fs.readFileSync(resultFilePath, 'utf8');
    let compStr = fs.readFileSync(path.join(tB.compDir, compFile), 'utf8');

    let [testObj, compObj] = await Promise.all([
        css.parse(testStr, { source: resultFilePath }),
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

    const sourceFilePath = path.join(testDir, srcFile);
    const resultFilePath = path.join(tB.tempDir, outputFile);

    await expect(scssBuilder.build({
        sourceFilePath,
        resultFilePath,
        minify: true,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(resultFilePath)).toBe(true);

    let testStr = fs.readFileSync(resultFilePath, 'utf8');
    let compStr = fs.readFileSync(path.join(tB.compDir, compFile), 'utf8');

    let [testObj, compObj] = await Promise.all([
        css.parse(testStr, { source: resultFilePath }),
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

    const sourceFilePath = path.join(testDir, nonexistentFile);
    const resultFilePath = path.join(tB.tempDir, outputFile);

    expect(scssBuilder.build({
        sourceFilePath,
        resultFilePath,
    })).rejects.toThrowError(ReferenceError);
});
