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

// TODO convert nullary terms to functions to avoid issues with ordering in the
// source.
var NilTerm = {
  tag: 'NilTerm',
  eval: function () {
    return this;
  },
  print: function () {
    return 'nil';
  }
};

function BoolTerm(bool) {
  if (bool) {
    return TrueTerm;
  } else {
    return FalseTerm;
  }
}

var TrueTerm = {
  tag: 'TrueTerm',
  eval: function () {
    return this;
  },
  apply: function (x) {
    return PartialFunctionTerm(function (y) {
      return x.eval();
    });
  },
  print: function () {
    return 't';
  }
};

var FalseTerm = {
  tag: 'FalseTerm',
  eval: function () {
    return this;
  },
  apply: function (x) {
    return PartialFunctionTerm(function (y) {
      return y.eval();
    });
  },
  print: function () {
    return 'f';
  }
};

// #1, #2, #3. Numbers and negative numbers
function NumTerm(num) {
  if (!(this instanceof NumTerm)) {
    return new NumTerm(num);
  }
  return Object.assign(this, {
    tag: 'NumTerm',
    num: num,
  });
}

NumTerm.prototype.eval = function () {
  return this;
};

NumTerm.prototype.print = function () {
  return this.num.toString();
};

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.strictEqual(NumTerm(37).print(), '37');
}

// #4. Equality
// TODO: Actually, it’s symbol binding, and so, needs environments and dynamic/lexical scoping

function IdentifierTerm(identifier) {
  if (!(this instanceof IdentifierTerm)) {
    return new IdentifierTerm(identifier);
  }
  return Object.assign(this, {
    tag: 'IdentifierTerm',
    identifier: identifier,
  });
}

IdentifierTerm.prototype.eval = function () {
  // TODO: look up the identifier in the environment
  return this;
};

IdentifierTerm.prototype.print = function () {
  return this.identifier.toString();
};

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.strictEqual(IdentifierTerm('foo').print(), 'foo');
}

function AssignmentTerm(arg1, arg2) {
  if (!(this instanceof AssignmentTerm)) {
    return new AssignmentTerm(arg1, arg2);
  }
  return Object.assign(this, {
    tag: 'AssignmentTerm',
    opName: 'assignment',
    arg1: arg1,
    arg2: arg2,
  });
}

AssignmentTerm.prototype.eval = function () {
  // TODO: modify the environment
};

AssignmentTerm.prototype.print = function () {
  return this.identifier.print() + ' = ' + this.term.print();
};

// #5. Application (this is technically #17, but we need it to test all the
// binary operators.

// PartialFunctionTerm represents a partially applied function. Partial
// functions are not created when parsing the input, but they can appear during
// evaluation.
function PartialFunctionTerm(fn) {
  if (!(this instanceof PartialFunctionTerm)) {
    return new PartialFunctionTerm(fn);
  }
  return Object.assign(this, {
    tag: 'PartialFunctionTerm',
    opName: 'partial',
    fn: fn,
  });
}

PartialFunctionTerm.prototype.eval = function () {
  return this;
};

PartialFunctionTerm.prototype.apply = function (arg) {
  return this.fn(arg);
};

PartialFunctionTerm.prototype.print = function (arg) {
  return '<partial fn>';
};

function ApTerm(arg1, arg2) {
  if (!(this instanceof ApTerm)) {
    return new ApTerm(arg1, arg2);
  }
  return Object.assign(this, {
    tag: 'ApTerm',
    opName: 'ap',
    arg1: arg1,
    arg2: arg2,
  });
}

ApTerm.prototype.eval = function () {
  // Evaluate the first argument and see if it is a function, i.e. whether it
  // implements the (internal) `apply` method.
  var value1 = this.arg1.eval();
  if (value1.apply) {
    return value1.apply(this.arg2);
  } else {
    throw new Error(
      'Cannot perform application on term: ‘' + this.arg1.tag +
      '’. Did you forget to implement `apply`?'
    );
  }
};

ApTerm.prototype.print = function () {
  return printBinaryOp(this);
};

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.throws(
    () => ApTerm(NumTerm(37), NumTerm(42)).eval(),
    /Cannot perform application on term: ‘NumTerm’/
  );
}

// #5. Successor
var IncTerm = {
  tag: 'IncTerm',
  opName: 'inc',
  eval: function () {
    return this;
  },
  apply: function (arg) {
    return applyUnaryNumOp(this, arg, function (num) {
      return num + 1;
    });
  },
  print: function () {
    return printUnaryOp(this);
  }
};

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(IncTerm, NumTerm(42)).eval(),
    NumTerm(43),
  );
  assert.throws(
    () => ApTerm(IncTerm, IncTerm).eval(),
    /Type error: ‘inc’ needs one numeric argument/
  );
}

// #6. Predecessor
var DecTerm = {
  tag: 'DecTerm',
  opName: 'dec',
  eval: function () {
    return this;
  },
  apply: function (arg) {
    return applyUnaryNumOp(this, arg, function (num) {
      return num - 1;
    });
  },
  print: function () {
    return printUnaryOp(this);
  }
};

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(DecTerm, NumTerm(42)).eval(),
    NumTerm(41),
  );
  assert.throws(
    () => ApTerm(DecTerm, DecTerm).eval(),
    /Type error: ‘dec’ needs one numeric argument/
  );
}

// #7. Sum
var AddTerm = {
  tag: 'AddTerm',
  opName: 'add',
  eval: function () {
    return this;
  },
  apply: function (arg1) {
    var opTerm = this;
    return PartialFunctionTerm(function (arg2) {
      return applyBinaryNumOp(opTerm, arg1, arg2, function (num1, num2) {
        return num1 + num2;
      });
    });
  },
  print: function () {
    return printBinaryOp(this);
  }
};

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      ApTerm(AddTerm, NumTerm(42)),
      NumTerm(18),
    ).eval(),
    NumTerm(60),
  );
  assert.deepEqual(
    ApTerm(AddTerm, NumTerm(42)).eval().print(),
    '<partial fn>',
  );
  assert.throws(
    () => ApTerm(ApTerm(AddTerm, NilTerm), NumTerm(42)).eval(),
    /Type error: ‘add’ needs two numeric arguments/,
  );
}

// #8. Variables
// TODO: Let’s hope we won’t need to deal with them

// #9. Product
var MulTerm = {
  tag: 'MulTerm',
  opName: 'mul',
  eval: function () {
    return this;
  },
  apply: function (arg1) {
    var opTerm = this;
    return PartialFunctionTerm(function (arg2) {
      return applyBinaryNumOp(opTerm, arg1, arg2, function (num1, num2) {
        return num1 * num2;
      });
    });
  },
  print: function () {
    return printBinaryOp(this);
  }
};

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      ApTerm(MulTerm, NumTerm(4)),
      NumTerm(2),
    ).eval(),
    NumTerm(8),
  );
  assert.throws(
    () => ApTerm(ApTerm(MulTerm, NilTerm), NumTerm(42)).eval(),
    /Type error: ‘mul’ needs two numeric arguments/,
  );
}

// #10. Integer Division
var DivTerm = {
  tag: 'DivTerm',
  opName: 'div',
  eval: function () {
    return this;
  },
  apply: function (arg1) {
    var opTerm = this;
    return PartialFunctionTerm(function (arg2) {
      return applyBinaryNumOp(opTerm, arg1, arg2, function (num1, num2) {
        return parseInt(num1 / num2);
      });
    });
  },
  print: function () {
    return printBinaryOp(this);
  }
};

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(4)), NumTerm(2)).eval(),
    NumTerm(2),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(4)), NumTerm(3)).eval(),
    NumTerm(1),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(4)), NumTerm(4)).eval(),
    NumTerm(1),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(4)), NumTerm(5)).eval(),
    NumTerm(0),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(5)), NumTerm(2)).eval(),
    NumTerm(2),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(6)), NumTerm(-2)).eval(),
    NumTerm(-3),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(5)), NumTerm(-3)).eval(),
    NumTerm(-1),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(-5)), NumTerm(3)).eval(),
    NumTerm(-1),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(-5)), NumTerm(-3)).eval(),
    NumTerm(1),
  );
  assert.throws(
    () => ApTerm(ApTerm(DivTerm, NilTerm), NumTerm(42)).eval(),
    /Type error: ‘div’ needs two numeric arguments/,
  );
}

// #11. Equality and Booleans
var EqTerm = {
  tag: 'EqTerm',
  opName: 'eq',
  eval: function () {
    return this;
  },
  apply: function (arg1) {
    var opTerm = this;
    return PartialFunctionTerm(function (arg2) {
      return applyBinaryCompOp(opTerm, arg1, arg2, function (num1, num2) {
        return num1 === num2;
      });
    });
  },
  print: function () {
    return printBinaryOp(this);
  }
};

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      ApTerm(EqTerm, NumTerm(0)),
      NumTerm(-2),
    ).eval(),
    FalseTerm,
  );
  assert.deepEqual(
    ApTerm(
      ApTerm(EqTerm, NumTerm(-2)),
      NumTerm(-2),
    ).eval(),
    TrueTerm,
  );
  assert.throws(
    () => ApTerm(ApTerm(EqTerm, NilTerm), NumTerm(42)).eval(),
    /Type error: ‘eq’ needs two numeric arguments/,
  );
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
var NegTerm = {
  tag: 'NegTerm',
  opName: 'neg',
  eval: function () {
    return this;
  },
  apply: function (arg) {
    return applyUnaryNumOp(this, arg, function (num) {
      return -num;
    });
  },
  print: function () {
    return printUnaryOp(this);
  }
};

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(NegTerm, NumTerm(0)).eval(),
    NumTerm(0),
  );
  assert.deepEqual(
    ApTerm(NegTerm, NumTerm(1)).eval(),
    NumTerm(-1),
  );
  assert.throws(
    () => ApTerm(NegTerm, NegTerm).eval(),
    /Type error: ‘neg’ needs one numeric argument/
  );
}

// #17. Function Application
// See #5: Application. Here we just define more tests.

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      IncTerm,
      ApTerm(IncTerm, NumTerm(0)),
    ).eval(),
    NumTerm(2),
  );
  assert.deepEqual(
    ApTerm(
      IncTerm,
      ApTerm(IncTerm,
        ApTerm(IncTerm, NumTerm(0))),
    ).eval(),
    NumTerm(3),
  );
}

// #18. S Combinator
var STerm = {
  tag: 'STerm',
  eval: function () {
    return this;
  },
  apply: function (x) {
    return PartialFunctionTerm(function (y) {
      return PartialFunctionTerm(function (z) {
        return ApTerm(
          ApTerm(x, z),
          ApTerm(y, z),
        ).eval();
      });
    });
  },
  print: function () {
    return 's';
  }
};

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      ApTerm(
        ApTerm(STerm, AddTerm),
        IncTerm,
      ),
      NumTerm(1),
    ).eval(),
    NumTerm(3),
  );
  // TODO uncomment after Mul is implemented correctly
  // assert.deepEqual(
  //   ApTerm(
  //     ApTerm(
  //       ApTerm(STerm, MulTerm),
  //       ApTerm(AddTerm, NumTerm(1)),
  //     ),
  //     NumTerm(1),
  //   ).eval(),
  //   NumTerm(42),
  // );
}

// #19. C Combinator
var CTerm = {
  tag: 'CTerm',
  eval: function () {
    return this;
  },
  apply: function (x) {
    return PartialFunctionTerm(function (y) {
      return PartialFunctionTerm(function (z) {
        return ApTerm(
          ApTerm(x, z),
          y,
        ).eval();
      });
    });
  },
  print: function () {
    return 'c';
  }
};

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      ApTerm(
        ApTerm(CTerm, AddTerm),
        NumTerm(1),
      ),
      NumTerm(2),
    ).eval(),
    NumTerm(3),
  );
}

// #20. B Combinator
var BTerm = {
  tag: 'BTerm',
  eval: function () {
    return this;
  },
  apply: function (x) {
    return PartialFunctionTerm(function (y) {
      return PartialFunctionTerm(function (z) {
        return ApTerm(
          x,
          ApTerm(y, z),
        ).eval();
      });
    });
  },
  print: function () {
    return 'b';
  }
};

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      ApTerm(
        ApTerm(BTerm, IncTerm),
        DecTerm,
      ),
      NumTerm(2),
    ).eval(),
    NumTerm(2),
  );
}

// #21, #22. Booleans
// BoolTerm was moved to the top

// #21. True (K Combinator)
// TrueTerm was moved to the top

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      ApTerm(TrueTerm, NumTerm(1)),
      NumTerm(5),
    ).eval(),
    NumTerm(1),
  );
}

// #22. False
// FalseTerm was moved to the top

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      ApTerm(FalseTerm, NumTerm(1)),
      NumTerm(5),
    ).eval(),
    NumTerm(5),
  );
}

// #23. Power of Two
// TODO

// #24. I Combinator
var ITerm = {
  tag: 'ITerm',
  eval: function () {
    return this;
  },
  apply: function (x) {
    return x.eval();
  },
  print: function () {
    return 'b';
  }
};

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(ITerm, NumTerm(1)).eval(),
    NumTerm(1),
  );
}

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
// See NilTerm defined earlier.

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

// tokeniseInput : String -> Array String
function tokeniseInput(text) {
  return text.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ').trim().split(/\s+/);
}

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
    // Unary symbols
    case 'inc':
      return Pair(IncTerm, moreTokens);
    case 'dec':
      return Pair(DecTerm, moreTokens);
    case 'add':
      return Pair(AddTerm, moreTokens);
    case 'mul':
      return Pair(MulTerm, moreTokens);
    case 'div':
      return Pair(DivTerm, moreTokens);
    case 'eq':
      return Pair(EqTerm, moreTokens);
    case 'lt':
      return Pair(LtTerm, moreTokens);
    case 'neg':
      return Pair(NegTerm, moreTokens);
    case 't':
      return Pair(TrueTerm, moreTokens);
    case 'f':
      return Pair(FalseTerm, moreTokens);
    case 'draw':
      return Pair(DrawTerm, moreTokens);

    // Binary symbols
    case 'nil':
      return Pair(NilTerm, moreTokens);
    case 'ap':
      return readBinaryOp('ap', ApTerm, moreTokens);

    // TODO: clean up these symbols
    case 'mod':
      return readUnaryOp('mod', ModTerm, moreTokens);

    // Other, more complicated cases
    case '(':
      return readTermInParens(moreTokens);
    default:
      return returnIdentifierOrReadAssignment(IdentifierTerm(headToken), moreTokens);
      // return Pair(IdentifierTerm(headToken), moreTokens);
      // throw new Error('Unrecognized token: ‘' + headToken + '’');
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

// returnIdentifierOrReadAssignment : IdentifierTerm -> Array String -> (Term, Array String)
function returnIdentifierOrReadAssignment(identifierTerm, tokens) {
  if (tokens.length === 0) {
    return Pair(identifierTerm, []);
  }
  var headToken = tokens[0];
  var moreTokens = tokens.slice(1);
  if (headToken === '=') {
    var result = readTerm(moreTokens);
    return Pair(AssignmentTerm(identifierTerm, result.fst), result.snd);
  }
  return tokens;
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  // Numbers and negative numbers
  assert.deepEqual(
    readTerm(tokeniseInput('42')),
    Pair(NumTerm(42), []),
  );
  assert.deepEqual(
    readTerm(tokeniseInput('-42')),
    Pair(NumTerm(-42), []),
  );
  // Identifiers
  assert.deepEqual(
    readTerm(tokeniseInput('foobar')),
    Pair(IdentifierTerm('foobar'), []),
  );
  // Nullary symbols: inc, dec, add, mul, div, eq, lt, neq
  assert.deepEqual(
    readTerm(tokeniseInput('inc')),
    Pair(IncTerm, []),
  );
  assert.deepEqual(
    readTerm(tokeniseInput('dec')),
    Pair(DecTerm, []),
  );
  assert.deepEqual(
    readTerm(tokeniseInput('add')),
    Pair(AddTerm, []),
  );
  assert.deepEqual(
    readTerm(tokeniseInput('mul')),
    Pair(MulTerm, []),
  );
  assert.deepEqual(
    readTerm(tokeniseInput('div')),
    Pair(DivTerm, []),
  );
  assert.deepEqual(
    readTerm(tokeniseInput('eq')),
    Pair(EqTerm, []),
  );
  assert.deepEqual(
    readTerm(tokeniseInput('lt')),
    Pair(LtTerm, []),
  );
  assert.deepEqual(
    readTerm(tokeniseInput('neg')),
    Pair(NegTerm, []),
  );
  // Binary: application
  assert.deepEqual(
    readTerm(tokeniseInput('ap inc 37')),
    Pair(ApTerm(IncTerm, NumTerm(37)), []),
  );
  assert.throws(
    () => readTerm(tokeniseInput('ap')),
    /Syntax error: ‘ap’ needs two arguments/
  );
  // Binary: assignment
  assert.deepEqual(
    readTerm(tokeniseInput('checkerboard = nil')),
    Pair(
      AssignmentTerm(
        IdentifierTerm('checkerboard'),
        NilTerm,
      ),
      [],
    ),
  );
  assert.deepEqual(
    readTerm(tokeniseInput('checkerboard = ap nil nil')),
    Pair(
      AssignmentTerm(
        IdentifierTerm('checkerboard'),
        ApTerm(NilTerm, NilTerm),
      ),
      [],
    ),
  );
  assert.throws(
    () => readTerm(tokeniseInput('checkerboard =')),
    /Unexpected EOF; expected term/
  );
  assert.deepEqual(
    readTerm(tokeniseInput('checkerboard = nil nil')),
    Pair(
      AssignmentTerm(
        IdentifierTerm('checkerboard'),
        NilTerm,
      ),
      ['nil'],
    ),
  );
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

function applyUnaryNumOp(op, arg, fun) {
  var val = arg.eval();
  if (val.tag != 'NumTerm') {
    throw new Error('Type error: ‘' + op.opName + '’ needs one numeric argument');
  }
  return NumTerm(fun(val.num));
}

function applyBinaryNumOp(opTerm, arg1, arg2, fun) {
  var val1 = arg1.eval();
  var val2 = arg2.eval();
  if (val1.tag != 'NumTerm' || val2.tag != 'NumTerm') {
    throw new Error('Type error: ‘' + opTerm.opName + '’ needs two numeric arguments');
  }
  return NumTerm(fun(val1.num, val2.num));
}

function applyBinaryCompOp(opTerm, arg1, arg2, fun) {
  var val1 = arg1.eval();
  var val2 = arg2.eval();
  if (val1.tag != 'NumTerm' || val2.tag != 'NumTerm') {
    throw new Error('Type error: ‘' + opTerm.opName + '’ needs two numeric arguments');
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
