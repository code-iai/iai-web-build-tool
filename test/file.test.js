jest.mock('fs');
const fs = require('fs');
const path = require('path');
const File = require('../src/utilities/file');

const BASENAME_WITHOUT_FILE_TYPE = 'test_file';
const FILE_TYPE = '.html';
const BASENAME =  BASENAME_WITHOUT_FILE_TYPE + FILE_TYPE;

const EXISTING_DUMMY_FILE = path.join('test_folder', BASENAME);
const NOT_EXISTING_DUMMY_FILE = path.join('not_test_folder', BASENAME);

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

test('Throw no error when file exists.', () => {
    expect(() => {
        existingFile.requiredExist();
    }).not.toThrowError(ReferenceError);
});

test('Get basename', () => {
    const basename = existingFile.getBasename();
    expect(basename).toBe(BASENAME);
});

test('Get Basename without file type', () => {
    const basename = existingFile.getBasenameWithoutFileType();
    expect(basename).toBe(BASENAME_WITHOUT_FILE_TYPE);
});

test('Get file type', () => {
    const fileType = existingFile.getFileType();
    expect(fileType).toBe(FILE_TYPE);
});

test('Throw no Error when file exists.', () => {
    expect(() => {
        existingFile.requiredExist();
    }).not.toThrowError(ReferenceError);
});

test('Should return the correct parent folder path', () => {
    const parentFolderPath = existingFile.getParentFolderPath();
    expect(parentFolderPath).toBe('test_folder');
});

function initMock() {
    fs.existsSync = jest.fn((filePath) => { return EXISTING_DUMMY_FILE === filePath });
}
