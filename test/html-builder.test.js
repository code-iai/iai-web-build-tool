const fs = require('fs');
const path = require('path');
const parse5 = require('../node_modules/parse5');
const htmlBuilder = require('../src/html-builder');
const testBase = require('./test-base');
const treeNodeCounter = require('../src/utilities/tree-node-counter');

const TEST_DIR = './test/src/html';
const EXISTING_SOURCE_FILE = 'extend.njk';
const NOT_EXISTING_SOURCE_FILE = 'nonexistent.njk';
const OUTPUT_FILE = 'main.html';
const COMP_FILE = 'comp.html';

const EXISTING_SOURCE_FILE_PATH = path.join(TEST_DIR, EXISTING_SOURCE_FILE);
const COMP_FILE_PATH = path.join(testBase.COMP_DIR, COMP_FILE);
const NOT_EXISTING_SOURCE_FILE_PATH = path.join(TEST_DIR, NOT_EXISTING_SOURCE_FILE);
const RESULT_FILE_PATH = path.join(testBase.TEMP_DIR, OUTPUT_FILE);

const CONTENT_TO_BE_IN_OUTPUT_FILE =
    '<!DOCTYPE html>\n'
    + '<html lang="en">\n'
    + '<head>\n'
    + '    <meta charset="UTF-8">';

/*
Since we are testing async code, it is required to count all assertions to make sure,
that we are not skipping tests during running time.
Since some test methods are shared through some unit tests, we defined global constants to keep
track of the number of assertions in the defined shared test methods.
*/

const NUM_ASSERTIONS_TEST_HTML_BUILDER_IS_SUCCESSFUL = 2;
const NUM_ASSERTIONS_TEST_COMPARE_HTML_FILE = 1;
const NUM_ASSERTIONS_TEST_BUILT_HTML_FILE = 1
    + NUM_ASSERTIONS_TEST_COMPARE_HTML_FILE;
const NUM_ASSERTIONS_TOTAL_SHARED_TESTS =
    NUM_ASSERTIONS_TEST_HTML_BUILDER_IS_SUCCESSFUL
    + NUM_ASSERTIONS_TEST_BUILT_HTML_FILE;

beforeEach(() => {
    testBase.createTempDir();
});

afterEach(() => {
    testBase.deleteTempDir();
});

function readCompFile() {
    return fs.readFileSync(COMP_FILE_PATH, 'utf8');
}

async function compareHtmlFileToCompFile(testStr) {
    const compStr = readCompFile();

    // Parse tree structure
    const [testObj, compObj] = await Promise.all([
        parse5.parse(testStr),
        parse5.parse(compStr),
    ]);

    // Pre-order tree traversal and comparison
    expect(treeNodeCounter.countPreOrder(testObj)).toBe(treeNodeCounter.countPreOrder(compObj));
}

function testBuiltHtmlFileAndReadIt() {
    const testStr = fs.readFileSync(RESULT_FILE_PATH, 'utf8');

    // Check if resulting file contains some boilerplate code
    expect(testStr.includes(CONTENT_TO_BE_IN_OUTPUT_FILE)).toBe(true);

    compareHtmlFileToCompFile(testStr);

    return testStr;
}

function testBuiltHtmlFile() {
    testBuiltHtmlFileAndReadIt();
}

async function testHtmlBuilderIsSuccessful() {
    await expect(htmlBuilder.build({
        sourceFilePath: EXISTING_SOURCE_FILE_PATH,
        resultFilePath: RESULT_FILE_PATH,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(RESULT_FILE_PATH)).toBe(true);
}

test('Build a test html file.', async () => {
    expect.assertions(NUM_ASSERTIONS_TOTAL_SHARED_TESTS);

    await testHtmlBuilderIsSuccessful();
    testBuiltHtmlFile();
});

test('Throw ReferenceError when source does not exist.', async () => {
    expect.assertions(1);

    expect(htmlBuilder.build({
        sourceFilePath: NOT_EXISTING_SOURCE_FILE_PATH,
        resultFilePath: RESULT_FILE_PATH,
    })).rejects.toThrowError(ReferenceError);
});
