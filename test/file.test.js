jest.mock('fs');
const fs = require('fs');
const path = require('path');
const File = require('../src/utilities/file');
const EXISTING_DUMMY_FILE = path.join('test_folder','test_file.html');
const NOT_EXISTING_DUMMY_FILE = path.join('not_test_folder','test_file.html');

const existingFile = new File(EXISTING_DUMMY_FILE);
const notExistingFile = new File(NOT_EXISTING_DUMMY_FILE);

initMock();

test('Should return file exist', () => {
    expect(existingFile.exists()).toBe(true);
});

test('Should return file exist', () => {
    expect(notExistingFile.exists()).toBe(false);
});

test('Throw ReferenceError when file does not exist.', () => {
    expect(() => {
        notExistingFile.requiredExist();
    }).toThrowError(ReferenceError);
});

test('Throw no Error when file exists.', () => {
    expect(() => {
        existingFile.requiredExist();
    }).not.toThrowError(ReferenceError);
});

function initMock() {
    fs.existsSync = jest.fn((filePath) => { return EXISTING_DUMMY_FILE === filePath });
}
