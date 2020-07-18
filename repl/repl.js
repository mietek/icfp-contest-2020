var Nothing = {
  tag: 'Nothing'
};

function Just(just) {
  return {
    tag: 'Just',
    just: just
  };
}

function Pair(fst, snd) {
  return {
    tag: 'Pair',
    fst: fst,
    snd: snd
  };
}

function Left(left) {
  return {
    tag: 'Left',
    left: left
  };
}

function Right(right) {
  return {
    tag: 'Right',
    right: right
  };
}

//////////////////////////////////////////////////////////////////////////////

// #1, #2, #3. Numbers and negative numbers
function NumTerm(num) {
  return {
    tag: 'NumTerm',
    num: num,
    eval: function () {
      return this;
    },
    print: function () {
      return this.num.toString();
    }
  };
}

// #4. Equality
// TODO: Actually, it’s symbol binding, and so, needs environments and dynamic/lexical scoping

// #5. Application
// TODO: Add parsing of ApTerm, add eval
function ApTerm(arg1, arg2) {
  return {
    tag: 'ApTerm',
    opName: 'ap',
    arg1: arg1,
    arg2: arg2,
    eval: function () {
      return this;
    },
    print: function () {
      return printBinaryOp(this);
    }
  };
}

// #5. Successor
function IncTerm(arg1) {
  return {
    tag: 'IncTerm',
    opName: 'inc',
    arg1: arg1,
    eval: function () {
      return evalUnaryNumOp(this, function (num1) {
        return num1 + 1;
      });
    },
    print: function () {
      return printUnaryOp(this);
    }
  };
}

// #6. Predecessor
function DecTerm(arg1) {
  return {
    tag: 'DecTerm',
    opName: 'dec',
    arg1: arg1,
    eval: function () {
      return evalUnaryNumOp(this, function (num1) {
        return num1 - 1;
      });
    },
    print: function () {
      return printUnaryOp(this);
    }
  };
}

// #7. Sum
function AddTerm(arg1, arg2) {
  return {
    tag: 'AddTerm',
    opName: 'add',
    arg1: arg1,
    arg2: arg2,
    eval: function () {
      return evalBinaryNumOp(this, function (num1, num2) {
        return num1 + num2;
      });
    },
    print: function () {
      return printBinaryOp(this);
    }
  };
}

// #8. Variables
// TODO: Let’s hope we won’t need to deal with them

// #9. Product
function MulTerm(arg1, arg2) {
  return {
    tag: 'MulTerm',
    opName: 'mul',
    arg1: arg1,
    arg2: arg2,
    eval: function () {
      return evalBinaryNumOp(this, function (num1, num2) {
        return num1 * num2;
      });
    },
    print: function () {
      return printBinaryOp(this);
    }
  };
}

// #10. Integer Division
function DivTerm(arg1, arg2) {
  return {
    tag: 'DivTerm',
    opName: 'div',
    arg1: arg1,
    arg2: arg2,
    eval: function () {
      return evalBinaryNumOp(this, function (num1, num2) {
        return parseInt(num1 / num2);
      });
    },
    print: function () {
      return printBinaryOp(this);
    }
  };
}

// #11. Equality and Booleans
function EqTerm(arg1, arg2) {
  return {
    tag: 'EqTerm',
    opName: 'eq',
    arg1: arg1,
    arg2: arg2,
    eval: function () {
      return evalBinaryCompOp(this, function (num1, num2) {
        return num1 == num2;
      });
    },
    print: function () {
      return printBinaryOp(this);
    }
  };
}

// #12. Strict Less-Than
function LtTerm(arg1, arg2) {
  return {
    tag: 'LtTerm',
    opName: 'lt',
    arg1: arg1,
    arg2: arg2,
    eval: function () {
      return evalBinaryCompOp(this, function (num1, num2) {
        return num1 < num2;
      });
    },
    print: function () {
      return printBinaryOp(this);
    }
  };
}

// #13. Modulate: see #35 Modulate List

// #14. Demodulate
// TODO

// #15. Send
// TODO

// #16. Negate
// TODO

// #17. Function Application
// TODO

// #18. S Combinator
// TODO

// #19. C Combinator
// TODO

// #20. B Combinator
// TODO

// #21, #22. Booleans
function BoolTerm(bool) {
  if (bool) {
    return TrueTerm;
  } else {
    return FalseTerm;
  }
}

// #21. True (K Combinator)
var TrueTerm = {
  tag: 'TrueTerm',
  eval: function () {
    return this;
  },
  print: function () {
    return 't';
  }
};

// #22. False
var FalseTerm = {
  tag: 'FalseTerm',
  eval: function () {
    return this;
  },
  print: function () {
    return 'f';
  }
};

// #23. Power of Two
// TODO

// #24. I Combinator
// TODO

// #25. Cons (or Pair)
var ConsTerm = {
  tag: 'ConsTerm',
  eval: function () {
    return this;
  },
  print: function () {
    return 'cons';
  }
};

// #26. Car (First)
// TODO

// #27. Cdr (Tail)
// TODO

// #28. Nil (Empty List)
var NilTerm = {
  tag: 'NilTerm',
  eval: function () {
    return this;
  },
  print: function () {
    return 'nil';
  }
};

// #29. Is Nil (Is Empty List)
// TODO

// #30. List Construction Syntax
// TODO

// #31. Vector
// TODO

// #32. Draw
var DrawTerm = {
  tag: 'DrawTerm',
  eval: function () {
    return new ImageTerm([
      Pair(1, 1),
      Pair(1, 2),
      Pair(2, 1),
      Pair(2, 5),
    ]);
  },
  print: function () {
    return 'draw';
  }
};

function getBitmapWidth(bitmap) {
  return bitmap.reduce((acc, point) => Math.max(acc, point.fst), 0) + 1;
};

function getBitmapHeight(bitmap) {
  return bitmap.reduce((acc, point) => Math.max(acc, point.snd), 0) + 1;
};

// type Bitmap = [(Int, Int)] (array of x, y pairs)
// ImageTerm does not appear in the input, but it is the result of evaluating `draw`.
function ImageTerm(bitmap) {
  return {
    tag: 'ImageTerm',
    bitmap: bitmap,
    eval: function () {
      return this;
    },
    print: function () {
      return '[ ' + this.bitmap.map(p => `(${p.fst}, ${p.snd})`).join(',') + ' ]';
    },
    render: function () {
      const minW = 17;
      const minH = 13;
      const w = Math.max(minW, getBitmapWidth(this.bitmap));
      const h = Math.max(minH, getBitmapHeight(this.bitmap));
      const newBitmap = [];
      // add image border
      for (let i = 1; i < w - 1; i++) {
        newBitmap.push(Pair(i, 0));
        newBitmap.push(Pair(i, h - 1));
      }
      for (let i = 1; i < h - 1; i++) {
        newBitmap.push(Pair(0, i));
        newBitmap.push(Pair(w - 1, i));
      }
      // offset all points by 1 to account for the border
      for (let point of this.bitmap) {
        newBitmap.push(Pair(point.fst + 1, point.snd + 1));
      }
      return newBitmap;
    },
  };
};

// #33. Checkerboard
// TODO

// #34. Multiple Draw
// TODO

// #35. Modulate List

// modulateNum :: Int -> [Int]
function modulateNum(num) {
  const isNegative = num < 0 || Object.is(num, -0);
  const signBits = isNegative ? [1, 0] : [0, 1];
  const lengthTrailingBits = [0];
  // this is true for both +0 and -0
  if (num === 0) {
    return signBits.concat(lengthTrailingBits);
  }
  const numberBits = Math.abs(num).toString(2).split('');
  // pad numberBits with zeros, so that the length is a multiply of 4
  const paddingBits = new Array((4 - numberBits.length % 4) % 4).fill(0);
  const lengthBits = new Array(paddingBits.concat(numberBits).length / 4).fill(1);
  return signBits
    .concat(lengthBits)
    .concat(lengthTrailingBits)
    .concat(paddingBits)
    .concat(numberBits);
};

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(modulateNum(0),   '010'.split(''));
  assert.deepEqual(modulateNum(-0),  '100'.split(''));
  assert.deepEqual(modulateNum(1),   '01100001'.split(''));
  assert.deepEqual(modulateNum(-1),  '10100001'.split(''));
  assert.deepEqual(modulateNum(2),   '01100010'.split(''));
  assert.deepEqual(modulateNum(-2),  '10100010'.split(''));
  assert.deepEqual(modulateNum(16),  '0111000010000'.split(''));
  assert.deepEqual(modulateNum(-16), '1011000010000'.split(''));
}

// modulateTerm :: Term -> [Int]
function modulateTerm(term) {
  if (term.tag === 'NilTerm') {
    return [0, 0];
  }
  if (term.tag === 'ConsTerm') {
    return [1, 1];
  }
  if (term.tag === 'ApTerm') {
    return modulateTerm(term.arg1).concat(modulateTerm(term.arg2));
  }
  if (term.tag === 'NumTerm') {
    return modulateNum(term.num);
  }
  throw new Error('modulateTerm cannot accept term of type: ' + term.tag);
}
if (typeof window === 'undefined') {
  const assert = require('assert');

  assert.deepEqual(
    // nil
    modulateTerm(NilTerm),
    '00'.split(''),
  );
  assert.deepEqual(
    // ap ap cons nil nil
    // ap (ap cons nil) nil
    // list [nil] or pair (nil, nil)
    modulateTerm(ApTerm(ApTerm(ConsTerm, NilTerm), NilTerm)),
    '110000'.split(''),
  );
  assert.deepEqual(
    // ap ap cons 0 nil
    // ap (ap cons 0) nil
    // list [0] or pair (0, nil)
    modulateTerm(ApTerm(ApTerm(ConsTerm, NumTerm(0)), NilTerm)),
    '1101000'.split(''),
  );
  assert.deepEqual(
    // ap ap cons 1 2
    // ap (ap cons 1) 2
    // pair (1, 2)
    modulateTerm(ApTerm(ApTerm(ConsTerm, NumTerm(1)), NumTerm(2))),
    '110110000101100010'.split(''),
  );
  assert.deepEqual(
    // ap ap cons 1 ap ap cons 2 nil
    // ap (ap cons 1) (ap (ap cons 2) nil)
    // list [1, 2] or pair (1, pair (2, nil))
    modulateTerm(
      ApTerm(
        ApTerm(ConsTerm, NumTerm(1)),
        ApTerm(ApTerm(ConsTerm, NumTerm(2)), NilTerm),
      ),
    ),
    '1101100001110110001000'.split(''),
  );
}

function ModTerm(term) {
  return {
    tag: 'ModTerm',
    term: term,
    eval: function () {
      var value = this.term.eval();
      if (value.tag != 'NumTerm') {
        throw new Error('Type error: ‘mod’ needs a numeric argument (TODO: ‘mod’ on lists)');
      }
      return ModulatedTerm(modulateTerm(term));
    },
    print: function () {
      return 'mod ' + this.term.print();
    }
  };
};

// Note: ModulatedTerm does not appear in inputs.
function ModulatedTerm(bits) {
  return {
    tag: 'ModulatedTerm',
    bits: bits,
    eval: function () {
      return this;
    },
    print: function () {
      return '[ ' + this.bits.join(',') + ' ]';
    }
  };
};

// #36. Send ( 0 )
// TODO

// #37. Is 0
// TODO

// #38. Interact
// TODO

// #39. Interaction Protocol
// TODO

// #40. Stateless Drawing Protocol
// TODO

// #41. Stateful Drawing Protocol
// TODO

// #42. Galaxy
// TODO

//////////////////////////////////////////////////////////////////////////////

// readTerm : Array String -> Pair Term (Array String)
function readTerm(tokens) {
  if (tokens.length == 0) {
    throw new Error('Unexpected EOF; expected term');
  }
  var headToken = tokens[0];
  var moreTokens = tokens.slice(1);
  if (/^-?[0-9]+$/.test(headToken)) {
    return Pair(NumTerm(Number(headToken)), moreTokens);
  }
  switch (tokens[0]) {
    case 'inc':
      return readUnaryOp('inc', IncTerm, moreTokens);
    case 'dec':
      return readUnaryOp('dec', DecTerm, moreTokens);
    case 'mod':
      return readUnaryOp('mod', ModTerm, moreTokens);
    case 'add':
      return readBinaryOp('add', AddTerm, moreTokens);
    case 'mul':
      return readBinaryOp('mul', MulTerm, moreTokens);
    case 'div':
      return readBinaryOp('div', DivTerm, moreTokens);
    case 'eq':
      return readBinaryOp('eq', EqTerm, moreTokens);
    case 'lt':
      return readBinaryOp('lt', LtTerm, moreTokens);
    case 't':
      return Pair(TrueTerm, moreTokens);
    case 'f':
      return Pair(FalseTerm, moreTokens);
    case 'draw':
      return Pair(DrawTerm, moreTokens);
    case '(':
      return readTermInParens(moreTokens);
    default:
      throw new Error('Unrecognized token: ‘' + headToken + '’');
  }
}

// readUnaryOp : String -> (Term -> Term) -> Array String -> Pair Term (Array String)
function readUnaryOp(opName, opConstructor, tokens) {
  if (tokens.length < 1) {
    throw new Error('Syntax error: ‘' + opName + '’ needs one argument');
  }
  var result = readTerm(tokens);
  return Pair(opConstructor(result.fst), result.snd);
}

// readBinaryOp : String -> (Term -> Term -> Term) -> Array String -> Pair Term (Array String)
function readBinaryOp(opName, opConstructor, tokens) {
  if (tokens.length < 2) {
    throw new Error('Syntax error: ‘' + opName + '’ needs two arguments');
  }
  var result1 = readTerm(tokens);
  var result2 = readTerm(result1.snd);
  return Pair(opConstructor(result1.fst, result2.fst), result2.snd);
}

// readTermInParens : Array String -> Pair Term (Array String)
function readTermInParens(tokens) {
  if (tokens.length == 0) {
    throw new Error('Unexpected EOF in parentheses; expected term');
  }
  var result = readTerm(tokens);
  var moreTokens = result.snd;
  if (moreTokens.length == 0) {
    throw new Error('Unexpected EOF in parentheses; expected ‘)’');
  }
  if (moreTokens[0] != ')') {
    throw new Error('Unexpected token in parentheses: ‘' + moreTokens[0] + '’');
  }
  var term = result.fst;
  return Pair(term, moreTokens.slice(1));
}

//////////////////////////////////////////////////////////////////////////////

// evalTerm : Term -> Term
function evalTerm(term) {
  return term.eval();
}

function evalUnaryNumOp(op, fun) {
  var val1 = op.arg1.eval();
  if (val1.tag != 'NumTerm') {
    throw new Error('Type error: ‘' + op.opName + '’ needs one numeric argument');
  }
  return NumTerm(fun(val1.num));
}

function evalBinaryNumOp(op, fun) {
  var val1 = op.arg1.eval();
  var val2 = op.arg2.eval();
  if (val1.tag != 'NumTerm' || val2.tag != 'NumTerm') {
    throw new Error('Type error: ‘' + op.opName + '’ needs two numeric arguments');
  }
  return NumTerm(fun(val1.num, val2.num));
}

function evalBinaryCompOp(op, fun) {
  var val1 = op.arg1.eval();
  var val2 = op.arg2.eval();
  if (val1.tag != 'NumTerm' || val2.tag != 'NumTerm') {
    throw new Error('Type error: ‘' + op.opName + '’ needs two numeric arguments');
  }
  return BoolTerm(fun(val1.num, val2.num));
}

//////////////////////////////////////////////////////////////////////////////

// printTerm : Term -> String
function printTerm(term) {
  return term.print();
}

function printUnaryOp(op) {
  return op.opName + ' ' + op.arg1.print();
}

function printBinaryOp(op) {
  return op.opName + ' ' + op.arg1.print() + ' ' + op.arg2.print();
}
