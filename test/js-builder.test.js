const fs = require('fs');
const path = require('path');
const jsBuilder = require('../src/js-builder');
const testBase = require('./test-base');

const TEST_DIR = './test/src/js';
const EXISTING_SOURCE_FILE = 'base.js';
const NOT_EXISTING_SOURCE_FILE = 'nonexistent.js';
const OUTPUT_FILE = 'main.js';

const EXISTING_SOURCE_FILE_PATH = path.join(TEST_DIR, EXISTING_SOURCE_FILE);
const NOT_EXISTING_SOURCE_FILE_PATH = path.join(TEST_DIR, NOT_EXISTING_SOURCE_FILE);
const RESULT_FILE_PATH = path.join(testBase.TEMP_DIR, OUTPUT_FILE);

/*
Since we are testing async code, it is required to count all assertions to make sure,
that we are not skipping tests during running time.
Since some test methods are shared through some unit tests, we defined global constants to keep
track of the number of assertions in the defined shared test methods.
*/

const NUM_ASSERTIONS_TEST_JS_BUILDER_IS_SUCCESSFUL = 2;
const NUM_ASSERTIONS_TEST_BUILT_JS_MODULE = 5;
const NUM_ASSERTIONS_TOTAL_SHARED_TESTS =
    NUM_ASSERTIONS_TEST_BUILT_JS_MODULE + NUM_ASSERTIONS_TEST_JS_BUILDER_IS_SUCCESSFUL;

beforeEach(() => {
    testBase.createTempDir();
});

afterEach(() => {
    testBase.deleteTempDir();
});

function testBuiltJsModule() {
    const testModule = require(`./temp/${OUTPUT_FILE}`);
    const a = 10;
    const b = 5;

    expect(testModule.add(a, b)).toBe(a + b);
    expect(testModule.subtract(a, b)).toBe(a - b);
    expect(testModule.multiply(a, b)).toBe(a * b);
    expect(testModule.divide(a, b)).toBe(a / b);
    expect(testModule.helloWorld()).toBe('Hello World!');
}

function testBuiltJsModuleAndReadIt() {
    testBuiltJsModule();
    return fs.readFileSync(RESULT_FILE_PATH, 'utf8');
}

async function testJsBuilderIsSuccessful({ useUglify, useBabel }) {
    expect(fs.existsSync(EXISTING_SOURCE_FILE_PATH)).toBe(true);

    // All js builds have to be standalone, because otherwise node js cannot execute them
    await expect(jsBuilder.build({
        sourceFilePath: EXISTING_SOURCE_FILE_PATH,
        resultFilePath: RESULT_FILE_PATH,
        useUglify,
        useBabel,
        beStandalone: true,
    })).resolves.toBeTruthy();
}

test('Build a test js file', async () => {
    expect.assertions(NUM_ASSERTIONS_TOTAL_SHARED_TESTS);

    await testJsBuilderIsSuccessful({ useUglify: false, useBabel: false });
    testBuiltJsModule();
});

test('Build a babeled test js file', async () => {
    expect.assertions(NUM_ASSERTIONS_TOTAL_SHARED_TESTS + 1);

    await testJsBuilderIsSuccessful({ useUglify: false, useBabel: true });

    const testStr = testBuiltJsModuleAndReadIt();
    expect(testStr).toEqual(expect.stringContaining(' '));
});

test('Build an uglified test js file', async () => {
    expect.assertions(NUM_ASSERTIONS_TOTAL_SHARED_TESTS + 1);

    await testJsBuilderIsSuccessful({ useUglify: true, useBabel: false });

    const testStr = testBuiltJsModuleAndReadIt();
    const lineBreakCount = (testStr.match(/\n/g) || []).length;
    // Two linebreaks are always included
    // One for the sourcemap link and one as the final token
    expect(lineBreakCount).toBeLessThanOrEqual(2);
});

test('Throw ReferenceError when source does not exist.', async () => {
    expect.assertions(1);

    await expect(jsBuilder.build({
        sourceFilePath: NOT_EXISTING_SOURCE_FILE_PATH,
        resultFilePath: RESULT_FILE_PATH,
        beStandalone: true,
    })).rejects.toThrowError(ReferenceError);
});
