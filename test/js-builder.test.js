const fs = require('fs');
const path = require('path');

const jsBuilder = require('../src/js-builder');
const tB = require('./test-base');

beforeEach(() => {
    tB.createTempDir();
});

afterEach(() => {
    tB.deleteTempDir();
});

test('Build a test js file', async () => {
    const testDir = './test/src/js';
    const srcFile = 'base.js';
    const outputFile = 'main.js';
    const outputFileMap = 'main.js.map';

    expect.assertions(8);

    // All js builds have to be standalone, because otherwise node js cannot execute them
    await expect(jsBuilder.build({
        source: path.join(testDir, srcFile),
        destination: tB.tempDir,
        outputName: outputFile,
        beStandalone: true,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(tB.tempDir, outputFile)).toBe(true);
    expect(fs.existsSync(tB.tempDir, outputFileMap)).toBe(true);

    const testModule = require(`./temp/${outputFile}`);

    let a = 10;
    let b = 5;
    expect(testModule.add(a, b)).toBe(a + b);
    expect(testModule.subtract(a, b)).toBe(a - b);
    expect(testModule.multiply(a, b)).toBe(a * b);
    expect(testModule.divide(a, b)).toBe(a / b);
    expect(testModule.helloWorld()).toBe('Hello World!');
});

test('Build a babeled test js file', async () => {
    const testDir = './test/src/js';
    const srcFile = 'base.js';
    const outputFile = 'main.js';
    const outputFileMap = 'main.js.map';

    expect.assertions(9);

    // All js builds have to be standalone, because otherwise node js cannot execute them
    await expect(jsBuilder.build({
        source: path.join(testDir, srcFile),
        destination: tB.tempDir,
        outputName: outputFile,
        useBabel: true,
        beStandalone: true,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(tB.tempDir, outputFile)).toBe(true);
    expect(fs.existsSync(tB.tempDir, outputFileMap)).toBe(true);

    let testStr = fs.readFileSync(path.join(tB.tempDir, outputFile), 'utf8');

    expect(testStr).toEqual(expect.stringContaining(' '));

    const testModule = require(`./temp/${outputFile}`);

    let a = 10;
    let b = 5;
    expect(testModule.add(a, b)).toBe(a + b);
    expect(testModule.subtract(a, b)).toBe(a - b);
    expect(testModule.multiply(a, b)).toBe(a * b);
    expect(testModule.divide(a, b)).toBe(a / b);
    expect(testModule.helloWorld()).toBe('Hello World!');
});

test('Build a uglified test js file', async () => {
    const testDir = './test/src/js';
    const srcFile = 'base.js';
    const outputFile = 'main.js';
    const outputFileMap = 'main.js.map';

    expect.assertions(9);

    // All js builds have to be standalone, because otherwise node js cannot execute them
    await expect(jsBuilder.build({
        source: path.join(testDir, srcFile),
        destination: tB.tempDir,
        outputName: outputFile,
        useUglify: true,
        beStandalone: true,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(tB.tempDir, outputFile)).toBe(true);
    expect(fs.existsSync(tB.tempDir, outputFileMap)).toBe(true);

    let testStr = fs.readFileSync(path.join(tB.tempDir, outputFile), 'utf8');

    let lineBreakCount = (testStr.match(/\n/g) || []).length;
    // Two linebreaks are always included
    // One for the sourcemap link and one as the final token
    expect(lineBreakCount).toBeLessThanOrEqual(2);

    const testModule = require(`./temp/${outputFile}`);

    let a = 10;
    let b = 5;
    expect(testModule.add(a, b)).toBe(a + b);
    expect(testModule.subtract(a, b)).toBe(a - b);
    expect(testModule.multiply(a, b)).toBe(a * b);
    expect(testModule.divide(a, b)).toBe(a / b);
    expect(testModule.helloWorld()).toBe('Hello World!');
});

test('Throw ReferenceError when source does not exist.', async () => {
    const testDir = './test/src/js';
    const outputFile = 'main.js';
    const nonexistentFile = 'nonexistent.js';

    expect.assertions(1);

    expect(jsBuilder.build({
        source: path.join(testDir, nonexistentFile),
        destination: tB.tempDir,
        outputName: outputFile,
        beStandalone: true,
    })).rejects.toThrowError(ReferenceError);
});
