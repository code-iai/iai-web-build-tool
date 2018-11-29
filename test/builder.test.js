const builder = require('../src/utilities/builder');
const basename = require('../src/utilities/basename');
const testBase = require('./test-base');

beforeEach(() => {
    testBase.createTempDir();
});

afterEach(() => {
    testBase.deleteTempDir();
});

const source = './test/src/builder/something.txt';

function callbackTestFunction (piper) {
    // console.log('I did something!');
    return piper;
};

test('Throws Error when no callback is passed.', async () => {
    expect.assertions(1);

    await expect(builder.build(source)).rejects.toThrowError(TypeError);
});

test('build throws ReferenceError when source is not valid.', async () => {
    const doesNotExistFile = './test/src/builder/does-not-exist.txt';

    expect.assertions(1);

    await expect(builder.build(doesNotExistFile)).rejects.toThrowError(ReferenceError);
});

test('Build a file with standard parameters.', async () => {
    const tempSource = './test/temp/something.txt';

    expect.assertions(2);

    testBase.fs.copyFileSync(source, tempSource);

    await expect(builder.build(tempSource, {
        customCallbackFunction: callbackTestFunction,
    })).resolves.toBeTruthy();;

    const outputDest = testBase.path.join(testBase.path.dirname(tempSource), 'dest', basename.fileBasename(source));

    await expect(testBase.fileExist.existsSync(outputDest)).toBe(true);
});

test('Build a file to a certain destination.', async () => {
    const destination = './test/temp';

    expect.assertions(2);

    await expect(builder.build(source, {
        destination,
        customCallbackFunction: callbackTestFunction,
    })).resolves.toBeTruthy();

    const outputDest = testBase.path.join(destination, basename.fileBasename(source));

    await expect(testBase.fileExist.existsSync(outputDest)).toBe(true);
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

    const outputDest = testBase.path.join(destination, basename.fileBasename(outputName));

    await expect(testBase.fileExist.existsSync(outputDest)).toBe(true);
});

test('Build a file with new extension.', async () => {
    const destination = './test/temp';
    const extension = '.html';

    expect.assertions(2);

    await expect(builder.build(source, {
        destination,
        outputExtension: extension,
        customCallbackFunction: callbackTestFunction,
    })).resolves.toBeTruthy();;

    const outputDest = testBase.path.join(destination, basename.fileBasenameNewExtension(source, {
        newExtension: extension,
    }));

    await expect(testBase.fileExist.existsSync(outputDest)).toBe(true);
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
    })).resolves.toBeTruthy();;

    let outputDest = testBase.path.join(destination, basename.fileBasenameNewExtension(outputName, {
        newExtension: extension,
    }));

    await expect(testBase.fileExist.existsSync(outputDest)).toBe(true);

    // Test with outputNameNoExtension
    await expect(builder.build(source, {
        destination,
        outputName: outputNameNoExtension,
        outputExtension: extension,
        customCallbackFunction: callbackTestFunction,
    })).resolves.toBeTruthy();;

    outputDest = testBase.path.join(destination, basename.fileBasenameNewExtension(outputNameNoExtension, {
        newExtension: extension,
    }));

    await expect(testBase.fileExist.existsSync(outputDest)).toBe(true);
});
