const basename = require('../src/utilities/basename');

const testPath = 'src/utilities/basename.js';
const resultBasename = 'basename.js';
const resultBasenameNoExtension = 'basename';
const alternativeExtension = '.jsx';
const resultBasenameWithNewExtension = `${resultBasenameNoExtension}${alternativeExtension}`;

test('Return basename of filepath with extension.', () => {
    expect(basename.fileBasename(testPath)).toBe(resultBasename);
});

test('Return basename of filepath without extension.', () => {
    expect(basename.fileBasename(testPath, {
        noExtension: true,
    })).toBe(resultBasenameNoExtension);
});

test('Return basename of filepath with new extensions.', () => {
    expect(basename.fileBasenameNewExtension(testPath, {
        newExtension: alternativeExtension,
    })).toBe(resultBasenameWithNewExtension);

    expect(basename.fileBasenameNewExtension(testPath, {
        newExtension: '',
    })).toBe(resultBasenameNoExtension);
});
