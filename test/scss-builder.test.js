const fs = require('fs');
const path = require('path');
const css = require('../node_modules/css');
const scssBuilder = require('../src/scss-builder');
const testBase = require('./test-base');

const TEST_DIR = './test/src/scss';
const EXISTING_SOURCE_FILE = 'base.scss';
const NOT_EXISTING_SOURCE_FILE = 'nonexistent.scss';
const OUTPUT_FILE = 'main.css';
const COMP_FILE = 'comp.css';

const EXISTING_SOURCE_FILE_PATH = path.join(TEST_DIR, EXISTING_SOURCE_FILE);
const COMP_FILE_PATH = path.join(testBase.COMP_DIR, COMP_FILE);
const NOT_EXISTING_SOURCE_FILE_PATH = path.join(TEST_DIR, NOT_EXISTING_SOURCE_FILE);
const RESULT_FILE_PATH = path.join(testBase.TEMP_DIR, OUTPUT_FILE);

/*
Since we are testing async code, it is required to count all assertions to make sure,
that we are not skipping tests during running time.
Since some test methods are shared through some unit tests, we defined global constants to keep
track of the number of assertions in the defined shared test methods.
*/

const NUM_ASSERTIONS_TEST_SCSS_BUILDER_IS_SUCCESSFUL = 2;
const NUM_ASSERTIONS_TEST_BUILT_SCSS_FILE = 1;
const NUM_ASSERTIONS_TOTAL_SHARED_TESTS =
    NUM_ASSERTIONS_TEST_SCSS_BUILDER_IS_SUCCESSFUL
    + NUM_ASSERTIONS_TEST_BUILT_SCSS_FILE;

beforeEach(() => {
    testBase.createTempDir();
});

afterEach(() => {
    testBase.deleteTempDir();
});

function readCompFile() {
    return fs.readFileSync(COMP_FILE_PATH, 'utf8');
}

async function compareScssFileToCompFile(testStr) {
    const compStr = readCompFile();

    const [testObj, compObj] = await Promise.all([
        css.parse(testStr, { source: RESULT_FILE_PATH }),
        css.parse(compStr, { source: path.join(testBase.COMP_DIR, COMP_FILE) }),
    ]);

    // Only check for same amount of rules
    expect(testObj.stylesheet.rules.length).toBe(compObj.stylesheet.rules.length);
}

function testBuiltScssFileAndReadIt(){
    let testStr = fs.readFileSync(RESULT_FILE_PATH, 'utf8');

    compareScssFileToCompFile(testStr);

    return testStr;
}

async function testScssBuilderIsSuccessful({ minify = false } = {}) {
    await expect(scssBuilder.build({
        sourceFilePath: EXISTING_SOURCE_FILE_PATH,
        resultFilePath: RESULT_FILE_PATH,
        minify,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(RESULT_FILE_PATH)).toBe(true);
}

test('Build a test css file', async () => {
    expect.assertions(NUM_ASSERTIONS_TOTAL_SHARED_TESTS + 1);

    await testScssBuilderIsSuccessful();
    const testStr = testBuiltScssFileAndReadIt();

    // Check that file was not minified
    expect(testStr).toEqual(expect.stringContaining('\n'));
});

test('Build a minified test css file', async () => {
    expect.assertions(NUM_ASSERTIONS_TOTAL_SHARED_TESTS + 1);

    await testScssBuilderIsSuccessful({ minify: true });
    const testStr = testBuiltScssFileAndReadIt();

    // Check whether file was minified
    expect(testStr).toEqual(expect.not.stringContaining('\n'));
});

test('Throw ReferenceError when source does not exist.', () => {
    expect.assertions(1);

    expect(scssBuilder.build({
        sourceFilePath: NOT_EXISTING_SOURCE_FILE_PATH,
        resultFilePath: RESULT_FILE_PATH,
    })).rejects.toThrowError(ReferenceError);
});
