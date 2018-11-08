const builder = require('../index');
const fs = require('fs');
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
    const testFileName = 'extend';
    const compFile = 'comp';

    const data = {text: 'This is some header'};

    expect.assertions(4);

    await expect(builder.buildHTMLMain(`${testDir}/something.njk`, tempDir, data)).rejects.toThrowError();

    await expect(builder.buildHTMLMain(`${testDir}/${testFileName}.njk`, tempDir, data)).resolves.toBeTruthy();

    let testStr = fs.readFileSync(`${tempDir}/${testFileName}.html`, 'utf8');
    let compStr = fs.readFileSync(`${compDir}/${compFile}.html`, 'utf8');

    expect(testStr.includes(data.text)).toBe(true);

    let [testObj, compObj] = await Promise.all([
        parse5.parse(testStr),
        parse5.parse(compStr)
    ]);

    // TODO: Develop better method to compare HTML-ASTs
    // Pre-order tree traversal
    expect(countNodesPreOrder(compObj)).toBe(countNodesPreOrder(testObj));
});

test('Build a test scss file', async () => {
    const testDir = './test/src/scss';
    const testFileName = 'base';
    const compFile = 'comp';

    expect.assertions(4);

    await expect(builder.buildCSSMain(`${testDir}/something.scss`, tempDir)).rejects.toThrowError();

    await expect(builder.buildCSSMain(`${testDir}/${testFileName}.scss`, tempDir)).resolves.toBeTruthy();

    let testStr = fs.readFileSync(`${tempDir}/${testFileName}.css`, 'utf8');
    let compStr = fs.readFileSync(`${compDir}/${compFile}.css`, 'utf8');

    let [testObj, compObj] = await Promise.all([
        css.parse(testStr, { source: `${tempDir}/${testFileName}.css` }),
        css.parse(compStr, { source: `${compDir}/${compFile}.css` })
    ]);

    expect(testStr).toEqual(expect.stringContaining('\n'));

    // Only check for same amount of rules
    // TODO: Develop better method to compare CSS-ASTs
    expect(testObj.stylesheet.rules.length).toBe(compObj.stylesheet.rules.length);
});

test('Build a minified test scss file', async () => {
    const testDir = './test/src/scss';
    const testFileName = 'base';
    const compFile = 'comp';

    expect.assertions(4);

    await expect(builder.buildCSSMain(`${testDir}/something.scss`, tempDir, true)).rejects.toThrowError();

    await expect(builder.buildCSSMain(`${testDir}/${testFileName}.scss`, tempDir, true)).resolves.toBeTruthy();

    let testStr = fs.readFileSync(`${tempDir}/${testFileName}.css`, 'utf8');
    let compStr = fs.readFileSync(`${compDir}/${compFile}.css`, 'utf8');

    expect(testStr).toEqual(expect.not.stringContaining('\n'));

    let [testObj, compObj] = await Promise.all([
        css.parse(testStr, { source: `${tempDir}/${testFileName}.css` }),
        css.parse(compStr, { source: `${compDir}/${compFile}.css` })
    ]);

    // Only check for same amount of rules
    // TODO: Develop better method to compare CSS-ASTs
    expect(testObj.stylesheet.rules.length).toBe(compObj.stylesheet.rules.length);
});

test('Build a test js file', async () => {
    const testDir = './test/src/js';
    const testFileName = 'base';
    const finalFileName = 'main';

    expect.assertions(7);

    await expect(builder.buildJSMain(`${testDir}/something.js`, tempDir, finalFileName)).rejects.toThrowError();

    await expect(builder.buildJSMain(`${testDir}/${testFileName}.js`, tempDir, finalFileName)).resolves.toBeTruthy();

    const temp = require(`./temp/${finalFileName}`);

    let a = 10;
    let b = 5;
    expect(temp.add(a, b)).toBe(a + b);
    expect(temp.subtract(a, b)).toBe(a - b);
    expect(temp.multiply(a, b)).toBe(a * b);
    expect(temp.divide(a, b)).toBe(a / b);
    expect(temp.helloWorld()).toBe('Hello World!');
});

test('Build a babeled test js file', async () => {
    const testDir = './test/src/js';
    const testFileName = 'base';
    const finalFileName = 'main';

    expect.assertions(8);

    await expect(builder.buildJSMain(`${testDir}/something.js`, tempDir, finalFileName, true)).rejects.toThrowError();

    await expect(builder.buildJSMain(`${testDir}/${testFileName}.js`, tempDir, finalFileName, true)).resolves.toBeTruthy();

    const temp = require(`./temp/${finalFileName}`);

    let a = 10;
    let b = 5;
    expect(temp.add(a, b)).toBe(a + b);
    expect(temp.subtract(a, b)).toBe(a - b);
    expect(temp.multiply(a, b)).toBe(a * b);
    expect(temp.divide(a, b)).toBe(a / b);
    expect(temp.helloWorld()).toBe('Hello World!');

    let testStr = fs.readFileSync(`${tempDir}/${finalFileName}.js`, 'utf8');

    // TODO
    expect(testStr).toEqual(expect.stringContaining(' '));
});

test('Build a uglified test js file', async () => {
    const testDir = './test/src/js';
    const testFileName = 'base';
    const finalFileName = 'main';

    expect.assertions(8);

    await expect(builder.buildJSMain(`${testDir}/something.js`, tempDir, finalFileName, false, true)).rejects.toThrowError();

    await expect(builder.buildJSMain(`${testDir}/${testFileName}.js`, tempDir, finalFileName, false, true)).resolves.toBeTruthy();

    const temp = require(`./temp/${finalFileName}`);

    let a = 10;
    let b = 5;
    expect(temp.add(a, b)).toBe(a + b);
    expect(temp.subtract(a, b)).toBe(a - b);
    expect(temp.multiply(a, b)).toBe(a * b);
    expect(temp.divide(a, b)).toBe(a / b);
    expect(temp.helloWorld()).toBe('Hello World!');

    let testStr = fs.readFileSync(`${tempDir}/${finalFileName}.js`, 'utf8');

    expect(testStr).toEqual(expect.not.stringContaining('\n'));
});
