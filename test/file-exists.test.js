const fileExist = require('../src/utilities/file-exist');

const existingFile = ('./test/src/misc/exists.txt');
const nonExistingFile = ('./test/src/misc/exists-not.txt');

test('Throw ReferenceError when file does not exist.', () => {
    expect(() => {
        fileExist.sourceDoesNotExistThrowError(nonExistingFile);
    }).toThrowError(ReferenceError);
});

test('Throw no Error when file exists.', () => {
    expect(() => {
        fileExist.sourceDoesNotExistThrowError(existingFile);
    }).not.toThrowError(ReferenceError);
});
