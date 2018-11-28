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

    builder.doSomething = function (piper) {
        return piper;
    };

    await expect(builder.build(source)).resolves.toBeTruthy();;

    const outputDest = testBase.path.join(testBase.path.dirname(source), 'dest', basename.fileBasename(source));

    await expect(testBase.fileExist.existsSync(outputDest)).toBe(true);

    await testBase.forceDeleteFile([outputDest]);
});

test('Throw no global error while building even if doSomething is not set.', async () => {
    expect(true).toBe(true);
})

test('Build a file to a certain destination.', async () => {

});

// All test from here on write into the temp-directory

test('Build a renamed file.', async () => {

});

test('Build a file with new extension.', async () => {

});

test('Build a renamed file with new extension.', async () => {

});
