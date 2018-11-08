const addSub = require('./addSub');
const multDiv = require('./multDiv');

function helloWorld() {
    let s = 'Hello World!';
    // console.log(s);
    return s;
}

module.exports = {
    add: addSub.add,
    subtract: addSub.subtract,
    multiply: multDiv.multiply,
    divide: multDiv.divide,
    helloWorld
};
