"use strict";

//////////////////////////////////////////////////////////////////////////////

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

function Scope() {
  return {
    tag: 'Scope',
    bindings: {},
  };
}

//////////////////////////////////////////////////////////////////////////////

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
NumTerm.prototype.eval = function (scope) {
  return this;
};
NumTerm.prototype.print = function () {
  return this.num.toString();
};

// #4. Equality
// TODO: Actually, “equality” is symbol binding, and so, needs symbols and scopes

// TODO: Rename “identifier” to “symbol”
function IdentifierTerm(identifier) {
  if (!(this instanceof IdentifierTerm)) {
    return new IdentifierTerm(identifier);
  }
  return Object.assign(this, {
    tag: 'IdentifierTerm',
    identifier: identifier,
  });
}
IdentifierTerm.prototype.eval = function (scope) {
  // TODO: Throw an “unbound symbol” exception here
  return scope[this.identifier];
};
IdentifierTerm.prototype.print = function () {
  return this.identifier.toString();
};

// TODO: Maybe assignments shouldn’t be terms; not sure
// TODO: Rename variables and members here
function AssignmentTerm(identifierTerm, term) {
  if (!(this instanceof AssignmentTerm)) {
    return new AssignmentTerm(identifierTerm, term);
  }
  return Object.assign(this, {
    tag: 'AssignmentTerm',
    identifierTerm: identifierTerm,
    term: term,
  });
}
AssignmentTerm.prototype.eval = function (scope) {
  // TODO: Maybe disallow multiple assignment here
  scope[this.identifierTerm.identifier] = this.term;
  return this;
};
AssignmentTerm.prototype.print = function () {
  return this.identifierTerm.print() + ' = ' + this.term.print();
};

// #5. Successor
var IncTerm = {
  tag: 'IncTerm',
  eval: function (scope) {
    return this;
  },
  apply: function (scope, arg) {
    return applyUnaryNumOp(scope, this.tag, arg, function (num) {
      return num + 1;
    });
  },
  print: function () {
    return 'inc';
  }
};

// #6. Predecessor
var DecTerm = {
  tag: 'DecTerm',
  eval: function (scope) {
    return this;
  },
  apply: function (scope, arg) {
    return applyUnaryNumOp(scope, this.tag, arg, function (num) {
      return num - 1;
    });
  },
  print: function () {
    return 'dec';
  }
};

// #7. Sum
var AddTerm = {
  tag: 'AddTerm',
  eval: function (scope) {
    return this;
  },
  apply: function (scope, arg1) {
    var tag = this.tag;
    return PartialFunctionTerm(function (arg2) {
      return applyBinaryNumOp(scope, tag, arg1, arg2, function (num1, num2) {
        return num1 + num2;
      });
    });
  },
  print: function () {
    return 'add';
  }
};

// #8. Variables
// TODO: Let’s hope we won’t need to deal with them

// #9. Product
var MulTerm = {
  tag: 'MulTerm',
  eval: function (scope) {
    return this;
  },
  apply: function (scope, arg1) {
    var tag = this.tag;
    return PartialFunctionTerm(function (arg2) {
      return applyBinaryNumOp(scope, tag, arg1, arg2, function (num1, num2) {
        return num1 * num2;
      });
    });
  },
  print: function () {
    return 'mul';
  }
};

// #10. Integer Division
var DivTerm = {
  tag: 'DivTerm',
  eval: function (scope) {
    return this;
  },
  apply: function (scope, arg1) {
    var tag = this.tag;
    return PartialFunctionTerm(function (arg2) {
      return applyBinaryNumOp(scope, tag, arg1, arg2, function (num1, num2) {
        if (num2 === 0) {
          return 0;
        }
        return parseInt(num1 / num2);
      });
    });
  },
  print: function () {
    return 'div';
  }
};

// #11. Equality and Booleans
var EqTerm = {
  tag: 'EqTerm',
  eval: function (scope) {
    return this;
  },
  apply: function (scope, arg1) {
    var tag = this.tag;
    return PartialFunctionTerm(function (arg2) {
      return applyBinaryCompOp(scope, tag, arg1, arg2, function (num1, num2) {
        return num1 === num2;
      });
    });
  },
  print: function () {
    return 'eq';
  }
};

var TTerm = {
  tag: 'TTerm',
  eval: function (scope) {
    return this;
  },
  apply: function (scope, x) {
    return PartialFunctionTerm(function (y) {
      return x.eval(scope);
    });
  },
  print: function () {
    return 't';
  }
};

var FTerm = {
  tag: 'FTerm',
  eval: function (scope) {
    return this;
  },
  apply: function (scope, x) {
    return PartialFunctionTerm(function (y) {
      return y.eval(scope);
    });
  },
  print: function () {
    return 'f';
  }
};

function BoolTerm(bool) {
  if (bool) {
    return TTerm;
  } else {
    return FTerm;
  }
}

// #12. Strict Less-Than
var LtTerm = {
  tag: 'LtTerm',
  eval: function () {
    return this;
  },
  apply: function (scope, arg1) {
    var tag = this.tag;
    return PartialFunctionTerm(function (arg2) {
      return applyBinaryCompOp(scope, tag, arg1, arg2, function (num1, num2) {
        return num1 < num2;
      });
    });
  },
  print: function () {
    return 'lt';
  }
};

// #13. Modulate: see #35 Modulate List

// #14. Demodulate
// TODO

// #15. Send
// TODO

// #16. Negate
var NegTerm = {
  tag: 'NegTerm',
  eval: function (scope) {
    return this;
  },
  apply: function (scope, arg) {
    return applyUnaryNumOp(scope, this.tag, arg, function (num) {
      return -num;
    });
  },
  print: function () {
    return 'neg';
  }
};

// #17. Function Application
// PartialFunctionTerm represents a partially applied function. Partial
// functions are not created when parsing the input, but they can appear during
// evaluation.
function PartialFunctionTerm(fn) {
  if (!(this instanceof PartialFunctionTerm)) {
    return new PartialFunctionTerm(fn);
  }
  return Object.assign(this, {
    tag: 'PartialFunctionTerm',
    fn: fn
  });
}
PartialFunctionTerm.prototype.eval = function (scope) {
  return this;
};
PartialFunctionTerm.prototype.apply = function (scope, arg) {
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
    arg1: arg1,
    arg2: arg2,
  });
}
ApTerm.prototype.eval = function (scope) {
  // Evaluate the first argument and see if it is a function, i.e. whether it
  // implements the (internal) `apply` method.
  var value1 = this.arg1.eval(scope);
  if (value1.apply) {
    return value1.apply(scope, this.arg2);
  } else {
    throw new Error(
      'Cannot perform application on term: ‘' + this.arg1.tag +
      '’. Did you forget to implement `apply`?'
    );
  }
};
ApTerm.prototype.print = function () {
  return 'ap ' + this.arg1.print() + ' ' + this.arg2.print();
};

// #18. S Combinator
var STerm = {
  tag: 'STerm',
  eval: function (scope) {
    return this;
  },
  apply: function (scope, x) {
    return PartialFunctionTerm(function (y) {
      return PartialFunctionTerm(function (z) {
        return ApTerm(
          ApTerm(x, z),
          ApTerm(y, z),
        ).eval(scope);
      });
    });
  },
  print: function () {
    return 's';
  }
};

// #19. C Combinator
var CTerm = {
  tag: 'CTerm',
  eval: function (scope) {
    return this;
  },
  apply: function (scope, x) {
    return PartialFunctionTerm(function (y) {
      return PartialFunctionTerm(function (z) {
        return ApTerm(
          ApTerm(x, z),
          y,
        ).eval(scope);
      });
    });
  },
  print: function () {
    return 'c';
  }
};

// #20. B Combinator
var BTerm = {
  tag: 'BTerm',
  eval: function (scope) {
    return this;
  },
  apply: function (scope, x) {
    return PartialFunctionTerm(function (y) {
      return PartialFunctionTerm(function (z) {
        return ApTerm(
          x,
          ApTerm(y, z),
        ).eval(scope);
      });
    });
  },
  print: function () {
    return 'b';
  }
};

// #21, #22. Booleans
// BoolTerm was moved to the top

// #21. True (K Combinator)
// TTerm was moved to the top

// #22. False
// FTerm was moved to the top

// #23. Power of Two
// TODO

// #24. I Combinator
var ITerm = {
  tag: 'ITerm',
  eval: function (scope) {
    return this;
  },
  apply: function (scope, x) {
    return x.eval(scope);
  },
  print: function () {
    return 'i';
  }
};

// #25. Cons (or Pair)
// Cons is the pair constructor, i.e. it creates a pair when applied using
// `ap`. By itself, it does not take any arguments.
// PairTerm is the result of applying cons. It takes two arguments.
var ConsTerm = {
  tag: 'ConsTerm',
  eval: function (scope) {
    return this;
  },
  apply: function (scope, fst) {
    return PartialFunctionTerm(function (snd) {
      return PairTerm(fst, snd);
    });
  },
  print: function () {
    return 'cons';
  }
};

function PairTerm(fst, snd) {
  if (!(this instanceof PairTerm)) {
    return new PairTerm(fst, snd);
  }
  return Object.assign(this, {
    tag: 'PairTerm',
    fst: fst,
    snd: snd,
  });
}
PairTerm.prototype.eval = function (scope) {
  return this;
};
PairTerm.prototype.print = function () {
  return 'cons ' + this.fst.print() + ' ' + this.snd.print();
};

// #26. Car (First)
// TODO

// #27. Cdr (Tail)
// TODO

// #28. Nil (Empty List)

var NilTerm = {
  tag: 'NilTerm',
  eval: function (scope) {
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
  eval: function (scope) {
    return this;
  },
  apply: function (scope, arg) {
    const bitmap = [];
    var walk = (arg) => {
      const list = arg.eval(scope);
      if (list.tag === 'NilTerm') {
        return;
      }
      if (list.tag !== 'PairTerm') {
        throw new Error('Type error: ‘draw’ expects a list');
      }
      const head = list.fst.eval(scope);
      if (head.tag !== 'PairTerm') {
        throw new Error(
          'Type error: ‘draw’ expects list elements to be pairs, got ' + head.tag
        );
      }
      const xTerm = head.fst.eval(scope);
      const yTerm = head.snd.eval(scope);
      if (xTerm.tag !== 'NumTerm' || yTerm.tag !== 'NumTerm') {
        throw new Error('Type error: ‘draw’ expects list elements to be pairs of numbers');
      }
      const point = Pair(xTerm.num, yTerm.num);
      bitmap.push(point);
      walk(list.snd);
    };
    walk(arg);
    return ImageTerm(bitmap);
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
  if (!(this instanceof ImageTerm)) {
    return new ImageTerm(bitmap);
  }
  return Object.assign(this, {
    tag: 'ImageTerm',
    bitmap: bitmap,
  });
}
ImageTerm.prototype.eval = function (scope) {
  return this;
};
ImageTerm.prototype.print = function () {
  return '[ ' + this.bitmap.map(p => `(${p.fst}, ${p.snd})`).join(',') + ' ]';
};
ImageTerm.prototype.render = function () {
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

// modulateTerm :: Scope -> Term -> [Int]
function modulateTerm(scope, term) {
  const val = term.eval(scope);
  if (val.tag === 'NilTerm') {
    return [0, 0];
  }
  if (val.tag === 'PairTerm') {
    return [1, 1].concat(modulateTerm(scope, val.fst)).concat(modulateTerm(scope, val.snd));
  }
  if (val.tag === 'NumTerm') {
    return modulateNum(val.num);
  }
  throw new Error('modulateTerm cannot accept term of type: ' + val.tag);
}

function ModTerm(term) {
  return {
    tag: 'ModTerm',
    term: term,
    eval: function (scope) {
      var value = this.term.eval(scope);
      if (value.tag != 'NumTerm') {
        throw new Error('Type error: ‘mod’ needs a numeric argument (TODO: ‘mod’ on lists)');
      }
      return ModulatedTerm(modulateTerm(scope, term));
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
    eval: function (scope) {
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

    // TODO: Fix mod
    case 'mod':
      return readUnaryOp('mod', ModTerm, moreTokens);

    // TODO: Implement dem, send
    case 'dem':
      throw new Error('‘dem’ is unimplemented');
    case 'send':
      throw new Error('‘send’ is unimplemented');

    case 'neg':
      return Pair(NegTerm, moreTokens);

    // TODO: Fix ap
    case 'ap':
      return readBinaryOp('ap', ApTerm, moreTokens);

    case 's':
      return Pair(STerm, moreTokens);
    case 'c':
      return Pair(CTerm, moreTokens);
    case 'b':
      return Pair(BTerm, moreTokens);
    case 't':
      return Pair(TTerm, moreTokens);
    case 'f':
      return Pair(FTerm, moreTokens);

    // TODO: Implement pwr2
    case 'pwr2':
      throw new Error('‘pwr2’ is unimplemented');

    case 'i':
      return Pair(ITerm, moreTokens);
    case 'cons':
      return Pair(ConsTerm, moreTokens);

    // TODO: Implement car, cdr
    case 'car':
      throw new Error('‘car’ is unimplemented');
    case 'cdr':
      throw new Error('‘cdr’ is unimplemented');

    case 'nil':
      return Pair(NilTerm, moreTokens);

    // TODO: Implement isnil
    case 'isnil':
      throw new Error('‘isnil’ is unimplemented');

    // TODO: Fix lists
    case '(':
      throw new Error('‘(’ is unimplemented');
      //return readTermInParens(moreTokens);
    case ')':
      throw new Error('‘)’ is unimplemented');
    case ',':
      throw new Error('‘,’ is unimplemented');

    case 'vec':
      return Pair(ConsTerm, moreTokens);
    case 'draw':
      return Pair(DrawTerm, moreTokens);

    // TODO: Implement checkerboard, if0, interact...
    // case 'checkerboard':
    case 'if0':
      throw new Error('‘if0’ is unimplemented');
    case 'interact':
      throw new Error('‘interact’ is unimplemented');

    default:
      return returnIdentifierOrReadAssignment(IdentifierTerm(headToken), moreTokens);
      // return Pair(IdentifierTerm(headToken), moreTokens);
      // throw new Error('Unrecognized token: ‘' + headToken + '’');
  }
}

// readUnaryOp : String -> (Term -> Term) -> Array String -> Pair Term (Array String)
// TODO: Delete this
function readUnaryOp(opName, opConstructor, tokens) {
  if (tokens.length < 1) {
    throw new Error('Syntax error: ‘' + opName + '’ needs one argument');
  }
  var result = readTerm(tokens);
  return Pair(opConstructor(result.fst), result.snd);
}

// readBinaryOp : String -> (Term -> Term -> Term) -> Array String -> Pair Term (Array String)
// TODO: Delete this
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
  throw new Error('no terms on the right side of =');
}

//////////////////////////////////////////////////////////////////////////////

// evalTerm : Term -> Term
function evalTerm(scope, term) {
  return term.eval(scope);
}

function applyUnaryNumOp(scope, tag, arg, fun) {
  var val = arg.eval(scope);
  if (val.tag != 'NumTerm') {
    throw new Error('Type error: ‘' + tag + '’ needs one numeric argument');
  }
  return NumTerm(fun(val.num));
}

function applyBinaryNumOp(scope, tag, arg1, arg2, fun) {
  var val1 = arg1.eval(scope);
  var val2 = arg2.eval(scope);
  if (val1.tag != 'NumTerm' || val2.tag != 'NumTerm') {
    throw new Error('Type error: ‘' + tag + '’ needs two numeric arguments');
  }
  return NumTerm(fun(val1.num, val2.num));
}

function applyBinaryCompOp(scope, tag, arg1, arg2, fun) {
  var val1 = arg1.eval(scope);
  var val2 = arg2.eval(scope);
  if (val1.tag != 'NumTerm' || val2.tag != 'NumTerm') {
    throw new Error('Type error: ‘' + tag + '’ needs two numeric arguments');
  }
  return BoolTerm(fun(val1.num, val2.num));
}

//////////////////////////////////////////////////////////////////////////////

// printTerm : Term -> String
function printTerm(term) {
  return term.print();
}

//////////////////////////////////////////////////////////////////////////////

// tokenizeInput : String -> Array String
function tokenizeInput(text) {
  return text.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ').trim().split(/\s+/);
}

function StringResult(string) {
  return {
    tag: 'StringResult',
    string: string,
  };
}

function BitmapResult(bitmap) {
  return {
    tag: 'BitmapResult',
    bitmap: bitmap,
  };
}

// handleInput : Scope -> String -> Either String String
function handleInput(scope, inputText) {
  try {
    var tokens = tokenizeInput(inputText);
    var termAndMoreTokens = readTerm(tokens);
    var moreTokens = termAndMoreTokens.snd;
    if (moreTokens.length != 0) {
      throw new Error('Unexpected token: ‘' + moreTokens[0] + '’');
    }
    var term = termAndMoreTokens.fst;
    var value = evalTerm(scope, term);
    if (typeof value.render !== 'undefined') {
      return Right(BitmapResult(value.render()));
    } else {
      return Right(StringResult(printTerm(value)));
    }
  } catch (e) {
    console.error(e);
    return Left(e.message);
  }
}

// assertRight : String -> String -> ()
function assertRight(string, expectedRight) {
  if (typeof window === 'undefined') {
    const assert = require('assert');
    assert.deepEqual(
      handleInput(Scope(), string),
      Right(StringResult(expectedRight))
    );
  }
}

//////////////////////////////////////////////////////////////////////////////

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.strictEqual(NumTerm(37).print(), '37');
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.strictEqual(IdentifierTerm('foo').print(), 'foo');
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  const scope = Scope();
  AssignmentTerm(
    IdentifierTerm('foo'),
    NumTerm(42),
  ).eval(scope);
  assert.deepEqual(
    IdentifierTerm('foo').eval(scope),
    NumTerm(42),
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.throws(
    () => ApTerm(NumTerm(37), NumTerm(42)).eval(Scope()),
    /Cannot perform application on term: ‘NumTerm’/
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(IncTerm, NumTerm(42)).eval(Scope()),
    NumTerm(43),
  );
  assert.throws(
    () => ApTerm(IncTerm, IncTerm).eval(Scope()),
    /Type error: ‘IncTerm’ needs one numeric argument/
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(DecTerm, NumTerm(42)).eval(Scope()),
    NumTerm(41),
  );
  assert.throws(
    () => ApTerm(DecTerm, DecTerm).eval(Scope()),
    /Type error: ‘DecTerm’ needs one numeric argument/
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      ApTerm(AddTerm, NumTerm(42)),
      NumTerm(18),
    ).eval(Scope()),
    NumTerm(60),
  );
  assert.deepEqual(
    ApTerm(AddTerm, NumTerm(42)).eval(Scope()).print(),
    '<partial fn>',
  );
  assert.throws(
    () => ApTerm(ApTerm(AddTerm, NilTerm), NumTerm(42)).eval(Scope()),
    /Type error: ‘AddTerm’ needs two numeric arguments/,
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      ApTerm(MulTerm, NumTerm(4)),
      NumTerm(2),
    ).eval(Scope()),
    NumTerm(8),
  );
  assert.throws(
    () => ApTerm(ApTerm(MulTerm, NilTerm), NumTerm(42)).eval(Scope()),
    /Type error: ‘MulTerm’ needs two numeric arguments/,
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(4)), NumTerm(2)).eval(Scope()),
    NumTerm(2),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(4)), NumTerm(3)).eval(Scope()),
    NumTerm(1),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(4)), NumTerm(4)).eval(Scope()),
    NumTerm(1),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(4)), NumTerm(5)).eval(Scope()),
    NumTerm(0),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(5)), NumTerm(2)).eval(Scope()),
    NumTerm(2),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(6)), NumTerm(-2)).eval(Scope()),
    NumTerm(-3),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(5)), NumTerm(-3)).eval(Scope()),
    NumTerm(-1),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(-5)), NumTerm(3)).eval(Scope()),
    NumTerm(-1),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(-5)), NumTerm(-3)).eval(Scope()),
    NumTerm(1),
  );
  assert.throws(
    () => ApTerm(ApTerm(DivTerm, NilTerm), NumTerm(42)).eval(Scope()),
    /Type error: ‘DivTerm’ needs two numeric arguments/,
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      ApTerm(EqTerm, NumTerm(0)),
      NumTerm(-2),
    ).eval(Scope()),
    FTerm,
  );
  assert.deepEqual(
    ApTerm(
      ApTerm(EqTerm, NumTerm(-2)),
      NumTerm(-2),
    ).eval(Scope()),
    TTerm,
  );
  assert.throws(
    () => ApTerm(ApTerm(EqTerm, NilTerm), NumTerm(42)).eval(Scope()),
    /Type error: ‘EqTerm’ needs two numeric arguments/,
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(ApTerm(LtTerm, NumTerm(0)), NumTerm(-2)).eval(Scope()),
    FTerm,
  );
  assert.deepEqual(
    ApTerm(ApTerm(LtTerm, NumTerm(0)), NumTerm(0)).eval(Scope()),
    FTerm,
  );
  assert.deepEqual(
    ApTerm(ApTerm(LtTerm, NumTerm(0)), NumTerm(2)).eval(Scope()),
    TTerm,
  );
  assert.throws(
    () => ApTerm(ApTerm(LtTerm, NilTerm), NumTerm(42)).eval(Scope()),
    /Type error: ‘LtTerm’ needs two numeric arguments/,
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(NegTerm, NumTerm(0)).eval(Scope()),
    NumTerm(0),
  );
  assert.deepEqual(
    ApTerm(NegTerm, NumTerm(1)).eval(Scope()),
    NumTerm(-1),
  );
  assert.throws(
    () => ApTerm(NegTerm, NegTerm).eval(Scope()),
    /Type error: ‘NegTerm’ needs one numeric argument/
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      IncTerm,
      ApTerm(IncTerm, NumTerm(0)),
    ).eval(Scope()),
    NumTerm(2),
  );
  assert.deepEqual(
    ApTerm(
      IncTerm,
      ApTerm(IncTerm,
        ApTerm(IncTerm, NumTerm(0))),
    ).eval(Scope()),
    NumTerm(3),
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      ApTerm(
        ApTerm(STerm, AddTerm),
        IncTerm,
      ),
      NumTerm(1),
    ).eval(Scope()),
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
  //   ).eval(Scope()),
  //   NumTerm(42),
  // );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      ApTerm(
        ApTerm(CTerm, AddTerm),
        NumTerm(1),
      ),
      NumTerm(2),
    ).eval(Scope()),
    NumTerm(3),
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      ApTerm(
        ApTerm(BTerm, IncTerm),
        DecTerm,
      ),
      NumTerm(2),
    ).eval(Scope()),
    NumTerm(2),
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      ApTerm(TTerm, NumTerm(1)),
      NumTerm(5),
    ).eval(Scope()),
    NumTerm(1),
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      ApTerm(FTerm, NumTerm(1)),
      NumTerm(5),
    ).eval(Scope()),
    NumTerm(5),
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(ITerm, NumTerm(1)).eval(Scope()),
    NumTerm(1),
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.strictEqual(PairTerm(NumTerm(37), NumTerm(42)).print(), 'cons 37 42');
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(ApTerm(ConsTerm, NumTerm(1)), NilTerm).eval(Scope()),
    PairTerm(NumTerm(1), NilTerm),
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  const point = (x, y) => ApTerm(ApTerm(ConsTerm, NumTerm(x)), NumTerm(y));
  assert.deepEqual(
    // ap draw (ap ap cons (ap ap cons 1 1) nil)
    ApTerm(
      DrawTerm,
      ApTerm(ApTerm(ConsTerm, point(1, 1)), NilTerm),
    ).eval(Scope()),
    ImageTerm([Pair(1, 1)]),
  );
  assert.deepEqual(
    ApTerm(
      DrawTerm,
      ApTerm(
        ApTerm(ConsTerm, point(1, 2)),
        ApTerm(
          ApTerm(ConsTerm, point(1, 1)),
          NilTerm,
        ),
      ),
    ).eval(Scope()),
    ImageTerm([Pair(1, 2), Pair(1, 1)]),
  );
  assert.throws(
    () => ApTerm(
      DrawTerm,
      IncTerm,
    ).eval(Scope()),
    /Type error: ‘draw’ expects a list/
  );
}

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

if (typeof window === 'undefined') {
  const assert = require('assert');

  assert.deepEqual(
    // nil
    modulateTerm(Scope(), NilTerm),
    '00'.split(''),
  );
  assert.deepEqual(
    // ap ap cons nil nil
    // ap (ap cons nil) nil
    // list [nil] or pair (nil, nil)
    modulateTerm(Scope(), ApTerm(ApTerm(ConsTerm, NilTerm), NilTerm)),
    '110000'.split(''),
  );
  assert.deepEqual(
    // ap ap cons 0 nil
    // ap (ap cons 0) nil
    // list [0] or pair (0, nil)
    modulateTerm(Scope(), ApTerm(ApTerm(ConsTerm, NumTerm(0)), NilTerm)),
    '1101000'.split(''),
  );
  assert.deepEqual(
    // ap ap cons 1 2
    // ap (ap cons 1) 2
    // pair (1, 2)
    modulateTerm(Scope(), ApTerm(ApTerm(ConsTerm, NumTerm(1)), NumTerm(2))),
    '110110000101100010'.split(''),
  );
  assert.deepEqual(
    // ap ap cons 1 ap ap cons 2 nil
    // ap (ap cons 1) (ap (ap cons 2) nil)
    // list [1, 2] or pair (1, pair (2, nil))
    modulateTerm(
      Scope(),
      ApTerm(
        ApTerm(ConsTerm, NumTerm(1)),
        ApTerm(ApTerm(ConsTerm, NumTerm(2)), NilTerm),
      ),
    ),
    '1101100001110110001000'.split(''),
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  // Numbers and negative numbers
  assert.deepEqual(
    readTerm(tokenizeInput('42')),
    Pair(NumTerm(42), []),
  );
  assert.deepEqual(
    readTerm(tokenizeInput('-42')),
    Pair(NumTerm(-42), []),
  );
  // Identifiers
  assert.deepEqual(
    readTerm(tokenizeInput('foobar')),
    Pair(IdentifierTerm('foobar'), []),
  );
  // Nullary symbols: inc, dec, add, mul, div, eq, lt, neq, cons
  assert.deepEqual(
    readTerm(tokenizeInput('inc')),
    Pair(IncTerm, []),
  );
  assert.deepEqual(
    readTerm(tokenizeInput('dec')),
    Pair(DecTerm, []),
  );
  assert.deepEqual(
    readTerm(tokenizeInput('add')),
    Pair(AddTerm, []),
  );
  assert.deepEqual(
    readTerm(tokenizeInput('mul')),
    Pair(MulTerm, []),
  );
  assert.deepEqual(
    readTerm(tokenizeInput('div')),
    Pair(DivTerm, []),
  );
  assert.deepEqual(
    readTerm(tokenizeInput('eq')),
    Pair(EqTerm, []),
  );
  assert.deepEqual(
    readTerm(tokenizeInput('lt')),
    Pair(LtTerm, []),
  );
  assert.deepEqual(
    readTerm(tokenizeInput('neg')),
    Pair(NegTerm, []),
  );
  assert.deepEqual(
    readTerm(tokenizeInput('cons')),
    Pair(ConsTerm, []),
  );
  // Binary: application
  assert.deepEqual(
    readTerm(tokenizeInput('ap inc 37')),
    Pair(ApTerm(IncTerm, NumTerm(37)), []),
  );

  // equivalent of the test above
  assert.deepEqual(
    handleInput(Scope(),'ap inc 37'),
    Right(StringResult('38'))
  );

  //another equivalent of the test above
  assertRight('ap inc 37', '38');
  assertRight('mul', 'mul');

  assert.throws(
    () => readTerm(tokenizeInput('ap')),
    /Syntax error: ‘ap’ needs two arguments/
  );
  // Binary: assignment
  assert.deepEqual(
    readTerm(tokenizeInput('checkerboard = nil')),
    Pair(
      AssignmentTerm(
        IdentifierTerm('checkerboard'),
        NilTerm,
      ),
      [],
    ),
  );
  assert.deepEqual(
    readTerm(tokenizeInput('checkerboard = ap nil nil')),
    Pair(
      AssignmentTerm(
        IdentifierTerm('checkerboard'),
        ApTerm(NilTerm, NilTerm),
      ),
      [],
    ),
  );
  assert.throws(
    () => readTerm(tokenizeInput('checkerboard =')),
    /Unexpected EOF; expected term/
  );
  assert.deepEqual(
    readTerm(tokenizeInput('checkerboard = nil nil')),
    Pair(
      AssignmentTerm(
        IdentifierTerm('checkerboard'),
        NilTerm,
      ),
      ['nil'],
    ),
  );
  // NOTE: This test is bad, because it doesn’t use the contest list syntax
  // // ap draw (ap ap cons (ap ap cons 1 1) nil)
  // assert.deepEqual(
  //   readTerm(tokenizeInput('ap draw (ap ap cons (ap ap cons 1 1) nil)')),
  //   Pair(
  //     ApTerm(
  //       DrawTerm,
  //       ApTerm(
  //         ApTerm(
  //           ConsTerm,
  //           ApTerm(
  //             ApTerm(
  //               ConsTerm,
  //               NumTerm(1),
  //             ),
  //             NumTerm(1),
  //           ),
  //         ),
  //         NilTerm
  //       ),
  //     ),
  //     [],
  //   )
  // );
}

// String-to-string tests based on documentation
assertRight('1', '1');
assertRight('-1', '-1');
assertRight('0', '0');

assertRight('eq', 'eq');
assertRight('ap ap eq 0 0', 't');
assertRight('ap ap eq 0 -1', 'f');
assertRight('ap ap eq 0 2', 'f');
assertRight('ap ap eq -1 1', 'f');
assertRight('ap ap eq -1 -1', 't');

assertRight('inc', 'inc');
assertRight('ap inc 0', '1');
assertRight('ap inc 1', '2');
assertRight('ap inc -41', '-40');

assertRight('dec', 'dec');
assertRight('ap dec 0', '-1');
assertRight('ap dec 1', '0');
assertRight('ap dec -41', '-42');

assertRight('add', 'add');
assertRight('ap ap add 0 0', '0');
assertRight('ap ap add 1 2', '3');
assertRight('ap ap add 2 1', '3');
assertRight('ap ap add -42 42', '0');
// assertRight('ap ap add 0 x0', 'x0');

assertRight('mul', 'mul');
assertRight('ap ap mul 0 0', '0');
assertRight('ap ap mul 1 2', '2');
assertRight('ap ap mul 2 1', '2');
assertRight('ap ap mul 3 -2', '-6');
assertRight('ap ap mul -5 -5', '25');
assertRight('ap ap mul -42 42', '-1764');

assertRight('div', 'div');
assertRight('ap ap div 4 2', '2');
assertRight('ap ap div 4 3', '1');
assertRight('ap ap div 4 4', '1');
assertRight('ap ap div 4 5', '0');
assertRight('ap ap div 5 2', '2');
assertRight('ap ap div 6 -2', '-3');
assertRight('ap ap div 5 -3', '-1');
assertRight('ap ap div -5 3', '-1');
assertRight('ap ap div -5 -3', '1');
assertRight('ap ap div 0 0', '0');

assertRight('lt', 'lt');
assertRight('ap ap lt 0 -1', 'f');
assertRight('ap ap lt 0 0', 'f');
assertRight('ap ap lt 0 1', 't');
assertRight('ap ap lt 0 2', 't');
assertRight('ap ap lt 1 -1', 'f');
assertRight('ap ap lt 1 0', 'f');
assertRight('ap ap lt 1 1', 'f');
assertRight('ap ap lt 1 2', 't');
assertRight('ap ap lt -11 -12', 'f');
assertRight('ap ap lt -11 -11', 'f');
assertRight('ap ap lt -11 -10', 't');

// 'mod' is failing for now
// assertRight('mod', 'mod');
// assertRight('ap mod 0', '0');

assertRight('neg', 'neg');
assertRight('ap neg 0', '0');
assertRight('ap neg 1', '-1');
assertRight('ap neg -2', '2');
assertRight('ap neg -0', '0');

// assertRight('ap', 'ap');
assertRight('ap inc ap inc 0', '2');
assertRight('ap inc ap inc ap inc -3', '0');
assertRight('ap ap add ap ap add 2 3 4', '9');
assertRight('ap ap add 2 ap ap add 3 4', '9');
assertRight('ap ap add ap ap mul 2 3 4', '10');
assertRight('ap ap mul 2 ap ap add 3 4', '14');

assertRight('s', 's');
assertRight('ap ap ap s add inc 1', '3');
assertRight('ap ap ap s mul ap add 1 6', '42');

assertRight('c', 'c');
assertRight('ap ap ap c add 1 2', '3');

assertRight('b', 'b');
assertRight('ap ap ap b inc dec 1337', '1337');

assertRight('t', 't');
assertRight('ap ap t 1 5', '1');
assertRight('ap ap t t i', 't');
assertRight('ap ap t t ap inc 5', 't');
assertRight('ap ap t ap inc 5 t', '6');

assertRight('f', 'f');
assertRight('ap ap f 1 5', '5');
assertRight('ap ap ap s t 31 33', '33');

// assertRight('pwr2', 'pwr2');
// assertRight('ap pwr2 0', '1');

assertRight('i', 'i');
assertRight('ap i 1', '1');
assertRight('ap i i', 'i');
assertRight('ap i add', 'add');

assertRight('cons', 'cons');
assertRight('ap ap cons 1 2', 'cons 1 2');
// assertRight('ap ap ap cons 1 2 3', 'cons 1 2 3');

// assertRight('car', 'car');
// assertRight('cdr', 'cdr');
assertRight('nil', 'nil');
// assertRight('ap nil 0', 't');
// assertRight('isnil', 'isnil');
// assertRight('()', 'nil');
assertRight('vec', 'cons');
// assertRight('if0', 'if0');
