const builder = require('../src/utilities/builder');
const testBase = require('./test-base');

// TODO: Write tests

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

test('Build a file with standard parameters.', () => {

});

test('Build a renamed file.', () => {

});

test('Build a file to a certain destination.', () => {

});

test('Build a renamed html file.', () => {

});
