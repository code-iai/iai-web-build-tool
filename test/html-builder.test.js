const fs = require('fs');
const path = require('path');

const parse5 = require('../node_modules/parse5');
const htmlBuilder = require('../src/html-builder');
const tB = require('./test-base');
const treeNodeCounter = require('../src/utilities/tree-node-counter');

beforeEach(() => {
    tB.createTempDir();
});

afterEach(() => {
    tB.deleteTempDir();
});

test('Build a test html file.', async () => {
    const testDir = './test/src/html';
    const srcFile = 'extend.njk';
    const outputFile = 'main.html';
    const compFile = 'comp.html';

    const sourceFilePath = path.join(testDir, srcFile);
    const resultFilePath = path.join(tB.TEMP_DIR, outputFile);

    const textFromFinalFile =
        '<!DOCTYPE html>\n' +
        '<html lang="en">\n' +
        '<head>\n' +
        '    <meta charset="UTF-8">';

    expect.assertions(4);

    await expect(htmlBuilder.build({ sourceFilePath, resultFilePath })).resolves.toBeTruthy();

    expect(fs.existsSync(resultFilePath)).toBe(true);

    let testStr = fs.readFileSync(resultFilePath, 'utf8');
    let compStr = fs.readFileSync(path.join(tB.COMP_DIR, compFile), 'utf8');

    // Check if resulting file contains some boilerplate code
    expect(testStr.includes(textFromFinalFile)).toBe(true);

    let [testObj, compObj] = await Promise.all([
        parse5.parse(testStr),
        parse5.parse(compStr)
    ]);

    // Pre-order tree traversal
    expect(treeNodeCounter.countPreOrder(compObj)).toBe(treeNodeCounter.countPreOrder(testObj));
});

test('Throw ReferenceError when source does not exist.', async () => {
    const testDir = './test/src/html';
    const outputFile = 'main.html';
    const nonexistentFile = 'nonexistent.njk';

    const sourceFilePath = path.join(testDir, nonexistentFile);
    const resultFilePath = path.join(tB.TEMP_DIR, outputFile);

    expect.assertions(1);

    expect(htmlBuilder.build({
        sourceFilePath,
        resultFilePath,
    })).rejects.toThrowError(ReferenceError);
});

