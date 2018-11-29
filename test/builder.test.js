const builder = require('../src/utilities/builder');
const basename = require('../src/utilities/basename');
const testBase = require('./test-base');

beforeEach(() => {
    testBase.createTempDir();
});

afterEach(() => {
    testBase.deleteTempDir();
});

test('doSomething throws Error when not implemented.', () => {
    expect(() => {
        builder.doSomething()
    }).toThrowError(Error);
});

test('doSomething deos not throw Error when not implemented.', () => {
    builder.doSomething = function () {
        return true;
    };

    expect(() => {
        builder.doSomething()
    }).not.toThrowError(Error);

    expect(builder.doSomething()).toBe(true);

    builder.doSomething = function (a, b) {
        return a + b;
    };

    expect(() => {
        builder.doSomething(3, 4)
    }).not.toThrowError(Error);

    expect(builder.doSomething(2, 8)).toBe(10);
});

test('build throws ReferenceError when source is not valid.', async () => {
    const doesNotExistFile = './src/builder/does-not-exist.txt';

    await expect(builder.build(doesNotExistFile)).rejects.toThrowError(ReferenceError);
});

test('Build a file with standard parameters.', async () => {
    const source = './test/src/builder/something.txt';
    const tempSource = './test/temp/something.txt';

    testBase.fs.copyFileSync(source, tempSource);

    builder.doSomething = function (piper) {
        return piper;
    };

    await expect(builder.build(tempSource)).resolves.toBeTruthy();;

    const outputDest = testBase.path.join(testBase.path.dirname(tempSource), 'dest', basename.fileBasename(tempSource));

    await expect(testBase.fileExist.existsSync(outputDest)).toBe(true);
});

test('Build a file to a certain destination.', async () => {
    const source = './test/src/builder/something.txt';
    const destination = './test/temp';

    builder.doSomething = function (piper) {
        return piper;
    };

    await expect(builder.build(source, {
        destination,
    })).resolves.toBeTruthy();;

    const outputDest = testBase.path.join(destination, basename.fileBasename(source));

    await expect(testBase.fileExist.existsSync(outputDest)).toBe(true);
});

// All test from here on write into the temp-directory

test('Throw no global error while building even if doSomething is not set.', async () => {
    const source = './test/src/builder/something.txt';
    const destination = './test/temp';

    await expect(builder.build(source, {
        destination,
    })).resolves.toBeTruthy();;

    const outputDest = testBase.path.join(destination, basename.fileBasename(source));

    await expect(testBase.fileExist.existsSync(outputDest)).toBe(true);
})

// All test from here on do not implement doSomething

test('Build a renamed file.', async () => {
    const source = './test/src/builder/something.txt';
    const destination = './test/temp';
    const outputName = 'another-thing.txt';

    await expect(builder.build(source, {
        destination,
        outputName,
    })).resolves.toBeTruthy();;

    const outputDest = testBase.path.join(destination, basename.fileBasename(outputName));

    await expect(testBase.fileExist.existsSync(outputDest)).toBe(true);
});

test('Build a file with new extension.', async () => {
    const source = './test/src/builder/something.txt';
    const destination = './test/temp';
    const extension = '.html';

    await expect(builder.build(source, {
        destination,
        outputExtension: extension,
    })).resolves.toBeTruthy();;

    const outputDest = testBase.path.join(destination, basename.fileBasenameNewExtension(source, {
        newExtension: extension,
    }));

    await expect(testBase.fileExist.existsSync(outputDest)).toBe(true);
});

test('Build a renamed file with new extension.', async () => {
    const source = './test/src/builder/something.txt';
    const destination = './test/temp';
    const outputName = 'another-thing.txt';
    const outputNameNoExtension = 'another-thing';
    const extension = '.html';

    // Test with outputName
    await expect(builder.build(source, {
        destination,
        outputName,
        outputExtension: extension,
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
    })).resolves.toBeTruthy();;

    outputDest = testBase.path.join(destination, basename.fileBasenameNewExtension(outputNameNoExtension, {
        newExtension: extension,
    }));

    await expect(testBase.fileExist.existsSync(outputDest)).toBe(true);
});
