const builder = require('../index');
const fs = require('fs');
const path = require('path');
const css = require('../node_modules/css');
const parse5 = require('../node_modules/parse5');
const del = require('../node_modules/del');

const tempDir = './test/temp';
const compDir = './test/comp';

beforeEach(() => {
    del.sync([tempDir], { force:true });
    fs.mkdirSync(tempDir);
});

afterEach(() => {
    del.sync([tempDir], { force:true });
});

test('Build a test css file', async () => {
    const testDir = './test/src/scss';
    const srcFile = 'base.scss';
    const outputFile = 'main.css';
    const nonexistentFile = 'nonexistent.scss';
    const compFile = 'comp.css';

    expect.assertions(5);

    await expect(builder.scss.build(path.join(testDir, nonexistentFile), {
        dest: tempDir,
        outputName: outputFile,
    })).rejects.toThrowError(ReferenceError);

    await expect(builder.scss.build(path.join(testDir, srcFile), {
        dest: tempDir,
        outputName: outputFile,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(path.join(tempDir, outputFile))).toBe(true);

    let testStr = fs.readFileSync(path.join(tempDir, outputFile), 'utf8');
    let compStr = fs.readFileSync(path.join(compDir, compFile), 'utf8');

    let [testObj, compObj] = await Promise.all([
        css.parse(testStr, { source: path.join(tempDir, outputFile) }),
        css.parse(compStr, { source: path.join(compDir, compFile) })
    ]);

    expect(testStr).toEqual(expect.stringContaining('\n'));

    // Only check for same amount of rules
    expect(testObj.stylesheet.rules.length).toBe(compObj.stylesheet.rules.length);
});

test('Build a minified test css file', async () => {
    const testDir = './test/src/scss';
    const srcFile = 'base.scss';
    const outputFile = 'main.css';
    const nonexistentFile = 'nonexistent.scss';
    const compFile = 'comp.css';

    expect.assertions(5);

    await expect(builder.scss.build(path.join(testDir, nonexistentFile), {
        dest: tempDir,
        outputName: outputFile,
        minify: true,
    })).rejects.toThrowError(ReferenceError);

    await expect(builder.scss.build(path.join(testDir, srcFile), {
        dest: tempDir,
        outputName: outputFile,
        minify: true,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(path.join(tempDir, outputFile))).toBe(true);

    let testStr = fs.readFileSync(path.join(tempDir, outputFile), 'utf8');
    let compStr = fs.readFileSync(path.join(compDir, compFile), 'utf8');

    let [testObj, compObj] = await Promise.all([
        css.parse(testStr, { source: path.join(tempDir, outputFile) }),
        css.parse(compStr, { source: path.join(compDir, compFile) })
    ]);

    expect(testStr).toEqual(expect.not.stringContaining('\n'));

    // Only check for same amount of rules
    expect(testObj.stylesheet.rules.length).toBe(compObj.stylesheet.rules.length);
});
