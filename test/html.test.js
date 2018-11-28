const parse5 = require('../node_modules/parse5');
const htmlBuilder = require('../src/html');
const testBase = require('test-base');
const treeNodeCounter = require('../src/utilities/treeNodeCounter')

beforeEach(() => {
    testBase.createTempDir();
});

afterEach(() => {
    testBase.deleteTempDir();
});

test('Build a html file with no extra options.', async () => {

});

test('Build a renamed html file.', async () => {

});

test('Build a test html file', async () => {
    const testDir = './test/src/html';
    const srcFile = 'extend.njk';
    const outputFile = 'main.html';
    const nonexistentFile = 'nonexistent.njk';
    const compFile = 'comp.html';

    const textFromFinalFile =
        '<!DOCTYPE html>\n' +
        '<html lang="en">\n' +
        '<head>\n' +
        '    <meta charset="UTF-8">';

    expect.assertions(5);

    await expect(htmlBuilder.html.build(path.join(testDir, nonexistentFile), {
        dest: tempDir,
        outputName: outputFile,
    })).rejects.toThrowError(ReferenceError);

    await expect(htmlBuilder.html.build(path.join(testDir, srcFile), {
        dest: tempDir,
        outputName: outputFile,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(path.join(tempDir, outputFile))).toBe(true);

    let testStr = fs.readFileSync(path.join(tempDir, outputFile), 'utf8');
    let compStr = fs.readFileSync(path.join(compDir, compFile), 'utf8');

    expect(testStr.includes(textFromFinalFile)).toBe(true);

    let [testObj, compObj] = await Promise.all([
        parse5.parse(testStr),
        parse5.parse(compStr)
    ]);

    // Pre-order tree traversal
    expect(treeNodeCounter.countNodesPreOrder(compObj)).toBe(treeNodeCounter.countNodesPreOrder(testObj));
});
