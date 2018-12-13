const fs = require('fs');
const path = require('path');
const builder = require('../src/builder');
const tB = require('./test-base');

beforeEach(() => {
    tB.createTempDir();
});

afterEach(() => {
    tB.deleteTempDir();
});

const SOURCE_FILE_PATH = './test/src/builder/something.txt';
const DESTINATION_FOLDER_PATH = './test/temp';
const RESULT_FILE_PATH = path.join(DESTINATION_FOLDER_PATH, 'test_file');

function callbackTestFunction(piper) {
    return piper;
}

test('Throw ReferenceError when source is not valid', () => {
    const sourceFilePath = './test/src/builder/does-not-exist.txt';
    expect(builder.build({sourceFilePath})).rejects.toThrowError(ReferenceError);
});

test('Throw TypeError when no callback is passed', () => {
    expect(builder.build({
        sourceFilePath:SOURCE_FILE_PATH,
        resultFilePath:DESTINATION_FOLDER_PATH,
    })).rejects.toThrowError(TypeError);
});


test('Build a file to a certain destination', async () => {
    await expect(builder.build({
        sourceFilePath: SOURCE_FILE_PATH,
        resultFilePath: RESULT_FILE_PATH,
        customCallbackFunction: callbackTestFunction,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(RESULT_FILE_PATH)).toBe(true);
});

function callbackTestFunctionWriteFileWithParameters (piper, {
    filepath,
    text,
} = {}){
    fs.writeFileSync(filepath, text);
    return piper;
}

test('Build a file with callback function', async () => {
    const resultFilePath = path.join(DESTINATION_FOLDER_PATH, 'somefile.txt');

    await expect(builder.build({
        sourceFilePath: SOURCE_FILE_PATH,
        resultFilePath: resultFilePath,
        customCallbackFunction: callbackTestFunctionWriteFileWithParameters,
        callbackFunctionData: {
            filepath: resultFilePath,
            text: 'I wrote something.',
        },
    })).resolves.toBeTruthy();

    // Check whether file was written by the callback function
    expect(fs.existsSync(resultFilePath)).toBe(true);
});
