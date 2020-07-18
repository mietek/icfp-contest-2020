const assert = require('assert');
const {readTerm, tokeniseInput, Pair, NumTerm} = require('./repl.js')

assert.deepEqual(
  readTerm(tokeniseInput('42')),
  Pair(NumTerm(42), []),
);
