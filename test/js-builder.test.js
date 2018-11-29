const jsBuilder = require('../src/js-builder');
const testBase = require('test-base');

beforeEach(() => {
    testBase.createTempDir();
});

afterEach(() => {
    testBase.deleteTempDir();
});

test('Build a test js file', async () => {
    const testDir = './test/src/js';
    const srcFile = 'base.js';
    const outputFile = 'main.js';
    const outputFileMap = 'main.js.map';
    const nonexistentFile = 'nonexistent.js';

    expect.assertions(9);

    // All js builds have to be standalone, because otherwise node js cannot execute them
    await expect(builder.js.build(path.join(testDir, nonexistentFile), {
        dest: tempDir,
        outputName: outputFile,
        beStandalone: true,
    })).rejects.toThrowError(ReferenceError);

    await expect(builder.js.build(path.join(testDir, srcFile), {
        dest: tempDir,
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
    await expect(builder.js.build(path.join(testDir, nonexistentFile), {
        dest: tempDir,
        outputName: outputFile,
        useBabel: true,
        beStandalone: true,
    })).rejects.toThrowError(ReferenceError);

    await expect(builder.js.build(path.join(testDir, srcFile), {
        dest: tempDir,
        outputName: outputFile,
        useBabel: true,
        beStandalone: true,
    })).resolves.toBeTruthy();

    expect(fs.existsSync(tempDir, outputFile)).toBe(true);
    expect(fs.existsSync(tempDir, outputFileMap)).toBe(true);

    let testStr = fs.readFileSync(path.join(tempDir, outputFile), 'utf8');

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
    await expect(builder.js.build(path.join(testDir, nonexistentFile), {
        dest: tempDir,
        outputName: outputFile,
        beStandalone: true,
        useUglify: true,
    })).rejects.toThrowError(ReferenceError);

    await expect(builder.js.build(path.join(testDir, srcFile), {
        dest: tempDir,
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
