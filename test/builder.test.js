const builder = require('../index');
const fs = require('fs');
const path = require('path');
const css = require('../node_modules/css');
const parse5 = require('../node_modules/parse5');
const del = require('../node_modules/del');

const tempDir = './test/temp';
const compDir = './test/comp';

beforeEach(() => {
    del.sync([tempDir], { force:true });
    fs.mkdirSync(tempDir);
});

afterEach(() => {
    del.sync([tempDir], { force:true });
});

function countNodesPreOrder(tree){
    if(!tree.childNodes){
        return 0;
    }

    let nodeCount = 0;

    for(let i = 0; i < tree.childNodes.length; ++i){
        nodeCount += countNodesPreOrder(tree.childNodes[i]);
    }
}

test('Build a test html file', async () => {
    const testDir = './test/src/html';
    const srcFile = 'extend.njk';
    const outputFile = 'main.html';
    const nonexistentFile = 'nonexistent.njk';
    const compFile = 'comp.html';

    const data = {text: 'This is some header'};

    expect.assertions(5);

    await expect(builder.html.build(path.join(testDir, nonexistentFile), tempDir, {
        outputName: outputFile,
        data: data,
    })).rejects.toThrowError();

    await expect(builder.html.build(path.join(testDir, srcFile), tempDir, {
        outputName: outputFile,
        data: data,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(path.join(tempDir, outputFile))).toBe(true);

    let testStr = fs.readFileSync(path.join(tempDir, outputFile), 'utf8');
    let compStr = fs.readFileSync(path.join(compDir, compFile), 'utf8');

    expect(testStr.includes(data.text)).toBe(true);

    let [testObj, compObj] = await Promise.all([
        parse5.parse(testStr),
        parse5.parse(compStr)
    ]);

    // TODO: Develop better method to compare HTML-ASTs
    // Pre-order tree traversal
    expect(countNodesPreOrder(compObj)).toBe(countNodesPreOrder(testObj));
});

test('Build a renamed html file', async () => {

});

test('Build a test css file', async () => {
    const testDir = './test/src/scss';
    const srcFile = 'base.scss';
    const outputFile = 'main.css';
    const nonexistentFile = 'nonexistent.scss';
    const compFile = 'comp.css';

    expect.assertions(5);

    await expect(builder.buildCSSMain(path.join(testDir, nonexistentFile), tempDir, {
        outputName: outputFile,
    })).rejects.toThrowError();

    await expect(builder.buildCSSMain(path.join(testDir, srcFile), tempDir, {
        outputName: outputFile,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(path.join(tempDir, outputFile))).toBe(true);

    let testStr = fs.readFileSync(path.join(tempDir, outputFile), 'utf8');
    let compStr = fs.readFileSync(path.join(compDir, compFile), 'utf8');

    let [testObj, compObj] = await Promise.all([
        css.parse(testStr, { source: path.join(tempDir, outputFile) }),
        css.parse(compStr, { source: path.join(compDir, compFile) })
    ]);

    expect(testStr).toEqual(expect.stringContaining('\n'));

    // Only check for same amount of rules
    // TODO: Develop better method to compare CSS-ASTs
    expect(testObj.stylesheet.rules.length).toBe(compObj.stylesheet.rules.length);
});

test('Build a minified test css file', async () => {
    const testDir = './test/src/scss';
    const srcFile = 'base.scss';
    const outputFile = 'main.css';
    const nonexistentFile = 'nonexistent.scss';
    const compFile = 'comp.css';

    expect.assertions(5);

    await expect(builder.buildCSSMain(path.join(testDir, nonexistentFile), tempDir, {
        outputName: outputFile,
        minify: true,
    })).rejects.toThrowError();

    await expect(builder.buildCSSMain(path.join(testDir, srcFile), tempDir, {
        outputName: outputFile,
        minify: true,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(path.join(tempDir, outputFile))).toBe(true);

    let testStr = fs.readFileSync(path.join(tempDir, outputFile), 'utf8');
    let compStr = fs.readFileSync(path.join(compDir, compFile), 'utf8');

    let [testObj, compObj] = await Promise.all([
        css.parse(testStr, { source: path.join(tempDir, outputFile) }),
        css.parse(compStr, { source: path.join(compDir, compFile) })
    ]);

    expect(testStr).toEqual(expect.not.stringContaining('\n'));

    // Only check for same amount of rules
    // TODO: Develop better method to compare CSS-ASTs
    expect(testObj.stylesheet.rules.length).toBe(compObj.stylesheet.rules.length);
});

test('Build a test js file', async () => {
    const testDir = './test/src/js';
    const srcFile = 'base.js';
    const outputFile = 'main.js';
    const outputFileMap = 'main.js.map';
    const nonexistentFile = 'nonexistent.js';

    expect.assertions(9);

    // All js builds have to be standalone, because otherwise node js cannot execute them
    await expect(builder.buildJSMain(path.join(testDir, nonexistentFile), tempDir, {
        outputName: outputFile,
        beStandalone: true,
    })).rejects.toThrowError();

    await expect(builder.buildJSMain(path.join(testDir, srcFile), tempDir, {
        outputName: outputFile,
        beStandalone: true,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(tempDir, outputFile)).toBe(true);
    expect(fs.existsSync(tempDir, outputFileMap)).toBe(true);

    const testModule = require(`./temp/${outputFile}`);

    let a = 10;
    let b = 5;
    expect(testModule.add(a, b)).toBe(a + b);
    expect(testModule.subtract(a, b)).toBe(a - b);
    expect(testModule.multiply(a, b)).toBe(a * b);
    expect(testModule.divide(a, b)).toBe(a / b);
    expect(testModule.helloWorld()).toBe('Hello World!');
});

test('Build a babeled test js file', async () => {
    const testDir = './test/src/js';
    const srcFile = 'base.js';
    const outputFile = 'main.js';
    const outputFileMap = 'main.js.map';
    const nonexistentFile = 'nonexistent.js';

    expect.assertions(10);

    // All js builds have to be standalone, because otherwise node js cannot execute them
    await expect(builder.buildJSMain(path.join(testDir, nonexistentFile), tempDir, {
        outputName: outputFile,
        useBabel: true,
        beStandalone: true,
    })).rejects.toThrowError();

    await expect(builder.buildJSMain(path.join(testDir, srcFile), tempDir, {
        outputName: outputFile,
        useBabel: true,
        beStandalone: true,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(tempDir, outputFile)).toBe(true);
    expect(fs.existsSync(tempDir, outputFileMap)).toBe(true);

    let testStr = fs.readFileSync(path.join(tempDir, outputFile), 'utf8');

    // TODO
    expect(testStr).toEqual(expect.stringContaining(' '));

    const testModule = require(`./temp/${outputFile}`);

    let a = 10;
    let b = 5;
    expect(testModule.add(a, b)).toBe(a + b);
    expect(testModule.subtract(a, b)).toBe(a - b);
    expect(testModule.multiply(a, b)).toBe(a * b);
    expect(testModule.divide(a, b)).toBe(a / b);
    expect(testModule.helloWorld()).toBe('Hello World!');
});

test('Build a uglified test js file', async () => {
    const testDir = './test/src/js';
    const srcFile = 'base.js';
    const outputFile = 'main.js';
    const outputFileMap = 'main.js.map';
    const nonexistentFile = 'nonexistent.js';

    expect.assertions(10);

    // All js builds have to be standalone, because otherwise node js cannot execute them
    await expect(builder.buildJSMain(path.join(testDir, nonexistentFile), tempDir, {
        outputName: outputFile,
        beStandalone: true,
        useUglify: true,
    })).rejects.toThrowError();

    await expect(builder.buildJSMain(path.join(testDir, srcFile), tempDir, {
        outputName: outputFile,
        useUglify: true,
        beStandalone: true,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(tempDir, outputFile)).toBe(true);
    expect(fs.existsSync(tempDir, outputFileMap)).toBe(true);

    let testStr = fs.readFileSync(path.join(tempDir, outputFile), 'utf8');

    let lineBreakCount = (testStr.match(/\n/g) || []).length;
    // Two linebreaks are always included
    // One for the sourcemap link and one as the final token
    expect(lineBreakCount).toBeLessThanOrEqual(2);

    const testModule = require(`./temp/${outputFile}`);

    let a = 10;
    let b = 5;
    expect(testModule.add(a, b)).toBe(a + b);
    expect(testModule.subtract(a, b)).toBe(a - b);
    expect(testModule.multiply(a, b)).toBe(a * b);
    expect(testModule.divide(a, b)).toBe(a / b);
    expect(testModule.helloWorld()).toBe('Hello World!');
});
