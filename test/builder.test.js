const fs = require('fs');
const path = require('path');

const builder = require('../src/utilities/builder');
const basename = require('../src/utilities/basename');
const tB = require('./test-base');

beforeEach(() => {
    tB.createTempDir();
});

afterEach(() => {
    tB.deleteTempDir();
});

const source = './test/src/builder/something.txt';

function callbackTestFunction(piper) {
    // console.log('I did something!');
    return piper;
};

test('Build() throws ReferenceError when source is not valid.', () => {
    const doesNotExistFile = './test/src/builder/does-not-exist.txt';

    expect.assertions(1);

    expect(builder.build(doesNotExistFile)).rejects.toThrowError(ReferenceError);
});

test('Build() throws TypeError when no callback is passed.', () => {
    expect.assertions(1);

    expect(builder.build(source)).rejects.toThrowError(TypeError);
});

test('Build a file with standard parameters.', async () => {
    const tempSource = './test/temp/something.txt';

    expect.assertions(2);

    fs.copyFileSync(source, tempSource);

    await expect(builder.build(tempSource, {
        customCallbackFunction: callbackTestFunction,
    })).resolves.toBeTruthy();;

    const outputDest = path.join(path.dirname(tempSource), 'dest', basename.fileBasename(source));

    expect(tB.fileExist.existsSync(outputDest)).toBe(true);
});

test('Build a file to a certain destination.', async () => {
    const destination = './test/temp';

    expect.assertions(2);

    await expect(builder.build(source, {
        destination,
        customCallbackFunction: callbackTestFunction,
    })).resolves.toBeTruthy();

    const outputDest = path.join(destination, basename.fileBasename(source));

    expect(tB.fileExist.existsSync(outputDest)).toBe(true);
});

// All test from here on write into the temp-directory

test('Build a renamed file.', async () => {
    const destination = './test/temp';
    const outputName = 'another-thing.txt';

    expect.assertions(2);

    await expect(builder.build(source, {
        destination,
        outputName,
        customCallbackFunction: callbackTestFunction,
    })).resolves.toBeTruthy();;

    const outputDest = path.join(destination, basename.fileBasename(outputName));

    expect(tB.fileExist.existsSync(outputDest)).toBe(true);
});

test('Build a file with new extension.', async () => {
    const destination = './test/temp';
    const extension = '.html';

    expect.assertions(2);

    await expect(builder.build(source, {
        destination,
        outputExtension: extension,
        customCallbackFunction: callbackTestFunction,
    })).resolves.toBeTruthy();

    const outputDest = path.join(destination, basename.fileBasenameNewExtension(source, {
        newExtension: extension,
    }));

    expect(tB.fileExist.existsSync(outputDest)).toBe(true);
});

test('Build a renamed file with new extension.', async () => {
    const destination = './test/temp';
    const outputName = 'another-thing.txt';
    const outputNameNoExtension = 'another-thing';
    const extension = '.html';

    expect.assertions(4);

    // Test with outputName
    await expect(builder.build(source, {
        destination,
        outputName,
        outputExtension: extension,
        customCallbackFunction: callbackTestFunction,
    })).resolves.toBeTruthy();

    let outputDest = path.join(destination, basename.fileBasenameNewExtension(outputName, {
        newExtension: extension,
    }));

    expect(tB.fileExist.existsSync(outputDest)).toBe(true);

    // Test with outputNameNoExtension
    await expect(builder.build(source, {
        destination,
        outputName: outputNameNoExtension,
        outputExtension: extension,
        customCallbackFunction: callbackTestFunction,
    })).resolves.toBeTruthy();

    outputDest = path.join(destination, basename.fileBasenameNewExtension(outputNameNoExtension, {
        newExtension: extension,
    }));

    await expect(tB.fileExist.existsSync(outputDest)).toBe(true);
});

function callbackTestFunctionWriteFileWithParameters (piper, {
    filepath,
    text,
} = {}){
    fs.writeFileSync(filepath, text);
    return piper;
}

test('Test callback with passed function parameters.', async () => {
    const destination = './test/temp';
    const fileWriteDest = path.join(destination, 'somefile.txt');

    expect.assertions(3);

    await expect(builder.build(source, {
        destination,
        customCallbackFunction: callbackTestFunctionWriteFileWithParameters,
        callbackFunctionData: {
            filepath: fileWriteDest,
            text: 'I wrote something.',
        },
    })).resolves.toBeTruthy();

    const outputDest = path.join(destination, basename.fileBasename(source));

    expect(tB.fileExist.existsSync(outputDest)).toBe(true);

    // Check whether file was written by the callback function
    expect(tB.fileExist.existsSync(fileWriteDest)).toBe(true);
});
