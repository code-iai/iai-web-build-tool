const treeNodeCounter = require('../src/utilities/tree-node-counter');

const TREE = {
    childNodes: [
        child1 = {
            childNodes: [
                child1 = {},
                child2 = {},
                child3 = {},
            ]
        },
        child2 = {
            childNodes: [
                child1 = {},
            ]
        } ,
    ],
};

const EMPTY_TREE = {};

test('Empty parameter should return 0 as child node count.', () => {
    expect(treeNodeCounter.countPreOrder()).toBe(0);
});

test('Return tree child node count.', () => {
    // Empty object equals a root node
    expect(treeNodeCounter.countPreOrder(EMPTY_TREE)).toBe(1);
    expect(treeNodeCounter.countPreOrder(TREE)).toBe(7);
});
