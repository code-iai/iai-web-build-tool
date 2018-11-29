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

    const textFromFinalFile =
        '<!DOCTYPE html>\n' +
        '<html lang="en">\n' +
        '<head>\n' +
        '    <meta charset="UTF-8">';

    expect.assertions(4);

    await expect(htmlBuilder.build(path.join(testDir, srcFile), {
        destination: tB.tempDir,
        outputName: outputFile,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(path.join(tB.tempDir, outputFile))).toBe(true);

    let testStr = fs.readFileSync(path.join(tB.tempDir, outputFile), 'utf8');
    let compStr = fs.readFileSync(path.join(tB.compDir, compFile), 'utf8');

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

    expect.assertions(1);

    const nonexistentFile = 'nonexistent.njk';

    expect(htmlBuilder.build(path.join(testDir, nonexistentFile), {
        destination: tB.tempDir,
        outputName: outputFile,
    })).rejects.toThrowError(ReferenceError);
});

