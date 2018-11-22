const treeNodeCounter = require('../src/utilities/treeNodeCounter');

const tree = {
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
const emptyTree = {};

test('Empty parameter should return 0 as child node count.', () => {
    expect(treeNodeCounter.countPreOrder()).toBe(0);
});

test('Return tree child node count.', () => {
    // Empty object equals a root node
    expect(treeNodeCounter.countPreOrder(emptyTree)).toBe(1);
    expect(treeNodeCounter.countPreOrder(tree)).toBe(7);
})
