const builder = require('../src/utilities/builder');
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
    expect(async () => {
        await builder.build('./src/builder/does-not-exist.txt');
    }).toThrowError(ReferenceError);
})

test('Build a file with standard parameters.', async () => {
    const source = './src/builder/something.txt';

    // No need to set doSomething because internal try-catch will handle it
    await builder.build(source);

    expect(() => {
        testBase.fileExist.fileDoesNotExistThrowError(source);
    }).not.toThrowError(ReferenceError);

    testBase.del.sync(['./src/builder/dest'], { force:true });
});

test('Build a renamed file.', () => {

});

test('Build a file to a certain destination.', () => {

});
