const fs = require('fs');
const path = require('path');

const jsBuilder = require('../src/js-builder');
const tB = require('./test-base');

const TEST_DIR = './test/src/js';
const EXISTING_SRC_FILE = 'base.js';
const OUTPUT_FILE = 'main.js';

const NOT_EXISTING_SRC_FILE = 'nonexistent.js';

const NOT_EXISTING_SOURCE_FILE_PATH = path.join(TEST_DIR, NOT_EXISTING_SRC_FILE);
const EXISTING_SOURCE_FILE_PATH = path.join(TEST_DIR, EXISTING_SRC_FILE);
const RESULT_FILE_PATH = path.join('.',tB.tempDir, OUTPUT_FILE);


beforeEach(() => {
    tB.createTempDir();
});

afterEach(() => {
    tB.deleteTempDir();
});

test('Build a test js file', async () => {
    expect.assertions(8);

    // All js builds have to be standalone, because otherwise node js cannot execute them
    await expect(jsBuilder.build({
        sourceFilePath: EXISTING_SOURCE_FILE_PATH,
        resultFilePath: RESULT_FILE_PATH,
        beStandalone: true,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(RESULT_FILE_PATH)).toBe(true);

    const testModule = require(`./temp/${OUTPUT_FILE}`);

    let a = 10;
    let b = 5;
    expect(testModule.add(a, b)).toBe(a + b);
    expect(testModule.subtract(a, b)).toBe(a - b);
    expect(testModule.multiply(a, b)).toBe(a * b);
    expect(testModule.divide(a, b)).toBe(a / b);
    expect(testModule.helloWorld()).toBe('Hello World!');
});

test('Build a babeled test js file', async () => {
    expect.assertions(9);

    // All js builds have to be standalone, because otherwise node js cannot execute them
    await expect(jsBuilder.build({
        sourceFilePath: EXISTING_SOURCE_FILE_PATH,
        resultFilePath: RESULT_FILE_PATH,
        useBabel: true,
        beStandalone: true,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(RESULT_FILE_PATH)).toBe(true);

    let testStr = fs.readFileSync(RESULT_FILE_PATH, 'utf8');

    expect(testStr).toEqual(expect.stringContaining(' '));

    const testModule = require(`./temp/${OUTPUT_FILE}`);

    let a = 10;
    let b = 5;

    expect(testModule.add(a, b)).toBe(a + b);
    expect(testModule.subtract(a, b)).toBe(a - b);
    expect(testModule.multiply(a, b)).toBe(a * b);
    expect(testModule.divide(a, b)).toBe(a / b);
    expect(testModule.helloWorld()).toBe('Hello World!');
});

test('Build a uglified test js file', async () => {
    expect.assertions(9);

    // All js builds have to be standalone, because otherwise node js cannot execute them
    await expect(jsBuilder.build({
        sourceFilePath: EXISTING_SOURCE_FILE_PATH,
        resultFilePath: RESULT_FILE_PATH,
        useUglify: true,
        beStandalone: true,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(EXISTING_SOURCE_FILE_PATH)).toBe(true);

    let testStr = fs.readFileSync(RESULT_FILE_PATH, 'utf8');

    let lineBreakCount = (testStr.match(/\n/g) || []).length;
    // Two linebreaks are always included
    // One for the sourcemap link and one as the final token
    expect(lineBreakCount).toBeLessThanOrEqual(2);

    const testModule = require(`./temp/${OUTPUT_FILE}`);

    let a = 10;
    let b = 5;
    expect(testModule.add(a, b)).toBe(a + b);
    expect(testModule.subtract(a, b)).toBe(a - b);
    expect(testModule.multiply(a, b)).toBe(a * b);
    expect(testModule.divide(a, b)).toBe(a / b);
    expect(testModule.helloWorld()).toBe('Hello World!');
});

test('Throw ReferenceError when source does not exist.', async () => {
    expect.assertions(1);
    await expect(jsBuilder.build({
        sourceFilePath: NOT_EXISTING_SOURCE_FILE_PATH,
        resultFilePath: RESULT_FILE_PATH,
        beStandalone: true,
    })).rejects.toThrowError(ReferenceError);
});
