const fs = require('fs');
const path = require('path');
const builder = require('../src/builder');
const testBase = require('./test-base');

beforeEach(() => {
    testBase.createTempDir();
});

afterEach(() => {
    testBase.deleteTempDir();
});

const TEST_DIR = './test/src/builder';
const EXISTING_SOURCE_FILE = 'something.txt';
const NOT_EXISTING_SOURCE_FILE = 'does-not-exist.txt';
const OUTPUT_FILE = 'test_file';

const EXISTING_SOURCE_FILE_PATH = path.join(TEST_DIR, EXISTING_SOURCE_FILE);
const NOT_EXISTING_SOURCE_FILE_PATH = path.join(TEST_DIR, NOT_EXISTING_SOURCE_FILE);
const RESULT_FILE_PATH = path.join(testBase.TEMP_DIR, OUTPUT_FILE);

/*
Since we are testing async code, it is required to count all assertions to make sure,
that we are not skipping tests during running time.
Since some test methods are shared through some unit tests, we defined global constants to keep
track of the number of assertions in the defined shared test methods.
*/

const NUM_ASSERTIONS_TEST_BUILDER_IS_SUCCESSFUL = 2;

function callbackTestFunction(piper) {
    return piper;
}

function callbackTestFunctionWriteFileWithParameters(piper, { filepath, text } = {}) {
    fs.writeFileSync(filepath, text);
    return piper;
}

async function testBuilderIsSuccessful({ customCallbackFunction, callbackFunctionData } = {}) {
    await expect(builder.build({
        sourceFilePath: EXISTING_SOURCE_FILE_PATH,
        resultFilePath: RESULT_FILE_PATH,
        customCallbackFunction,
        callbackFunctionData,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(RESULT_FILE_PATH)).toBe(true);
}

test('Throw ReferenceError when source is not valid', () => {
    expect.assertions(1);

    expect(builder.build({
        sourceFilePath: NOT_EXISTING_SOURCE_FILE_PATH,
    })).rejects.toThrowError(ReferenceError);
});

test('Throw TypeError when no callback is passed', () => {
    expect.assertions(1);

    expect(builder.build({
        sourceFilePath: EXISTING_SOURCE_FILE_PATH,
        resultFilePath: RESULT_FILE_PATH,
    })).rejects.toThrowError(TypeError);
});


test('Build a file to a certain destination', async () => {
    expect.assertions(NUM_ASSERTIONS_TEST_BUILDER_IS_SUCCESSFUL);

    await testBuilderIsSuccessful({ customCallbackFunction: callbackTestFunction });
});

test('Build a file with callback function', async () => {
    const callbackFunctionFileWritePath = path.join(testBase.TEMP_DIR, 'somefile.txt');

    expect.assertions(NUM_ASSERTIONS_TEST_BUILDER_IS_SUCCESSFUL +1);

    await testBuilderIsSuccessful({
        customCallbackFunction: callbackTestFunctionWriteFileWithParameters,
        callbackFunctionData: {
            filepath: callbackFunctionFileWritePath,
            text: 'I wrote something.',
        },
    });

    // Check whether file was written by the callback function
    expect(fs.existsSync(callbackFunctionFileWritePath)).toBe(true);
});
