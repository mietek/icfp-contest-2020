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

function Env() {
  return {
    tag: 'Env',
    map: new Map(),
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
NumTerm.prototype.eval = function (env) {
  return this;
};
NumTerm.prototype.print = function () {
  return this.num.toString();
};

// #4. Equality
// TODO: Actually, “equality” is symbol binding, and so, needs symbols and envs

function SymTerm(sym) {
  if (!(this instanceof SymTerm)) {
    return new SymTerm(sym);
  }
  return Object.assign(this, {
    tag: 'SymTerm',
    sym: sym,
  });
}
SymTerm.prototype.eval = function (env) {
  if (env.map.has(this.sym)) {
    return env.map.get(this.sym);
  }
  return this;
};
SymTerm.prototype.print = function () {
  return this.sym;
};

// TODO: Maybe assignments shouldn’t be terms; not sure
// TODO: Rename variables and members here
// TODO: Assignments should use symbols directly
function AssignmentTerm(symTerm, term) {
  if (!(this instanceof AssignmentTerm)) {
    return new AssignmentTerm(symTerm, term);
  }
  return Object.assign(this, {
    tag: 'AssignmentTerm',
    symTerm: symTerm,
    term: term,
  });
}
AssignmentTerm.prototype.eval = function (env) {
  env.map.set(this.symTerm.sym, evalTerm(env, this.term));
  return this;
};
AssignmentTerm.prototype.print = function () {
  return this.symTerm.print() + ' = ' + this.term.print();
};

// #5. Successor
var IncTerm = {
  tag: 'IncTerm',
  eval: function (env) {
    return this;
  },
  apply: function (env, arg) {
    return applyUnaryNumOp(env, this.tag, arg, function (num) {
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
  eval: function (env) {
    return this;
  },
  apply: function (env, arg) {
    return applyUnaryNumOp(env, this.tag, arg, function (num) {
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
  eval: function (env) {
    return this;
  },
  apply: function (env, arg1) {
    var tag = this.tag;
    return PartialFunctionTerm(function (arg2) {
      return applyBinaryNumOp(env, tag, arg1, arg2, function (num1, num2) {
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
  eval: function (env) {
    return this;
  },
  apply: function (env, arg1) {
    var tag = this.tag;
    return PartialFunctionTerm(function (arg2) {
      return applyBinaryNumOp(env, tag, arg1, arg2, function (num1, num2) {
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
  eval: function (env) {
    return this;
  },
  apply: function (env, arg1) {
    var tag = this.tag;
    return PartialFunctionTerm(function (arg2) {
      return applyBinaryNumOp(env, tag, arg1, arg2, function (num1, num2) {
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
  eval: function (env) {
    return this;
  },
  apply: function (env, arg1) {
    var tag = this.tag;
    return PartialFunctionTerm(function (arg2) {
      return applyBinaryCompOp(env, tag, arg1, arg2, function (num1, num2) {
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
  eval: function (env) {
    return this;
  },
  apply: function (env, x) {
    return PartialFunctionTerm(function (y) {
      return x.eval(env);
    });
  },
  print: function () {
    return 't';
  }
};

var FTerm = {
  tag: 'FTerm',
  eval: function (env) {
    return this;
  },
  apply: function (env, x) {
    return PartialFunctionTerm(function (y) {
      return y.eval(env);
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
  apply: function (env, arg1) {
    var tag = this.tag;
    return PartialFunctionTerm(function (arg2) {
      return applyBinaryCompOp(env, tag, arg1, arg2, function (num1, num2) {
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
  eval: function (env) {
    return this;
  },
  apply: function (env, arg) {
    return applyUnaryNumOp(env, this.tag, arg, function (num) {
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
PartialFunctionTerm.prototype.eval = function (env) {
  return this;
};
PartialFunctionTerm.prototype.apply = function (env, arg) {
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
ApTerm.prototype.eval = function (env) {
  // Evaluate the first argument and see if it is a function, i.e. whether it
  // implements the (internal) `apply` method.
  var value1 = this.arg1.eval(env);
  if (value1.apply) {
    return value1.apply(env, this.arg2);
  }
  return this;
  // TODO: Let’s try evaluating open terms to themselves, instead of failing
  //  else {
  //   console.log(this.arg1, value1);
  //   throw new Error(
  //     'Cannot perform application on term: ‘' + value1.tag +
  //     '’. Did you forget to implement `apply`?'
  //   );
  // }
};
ApTerm.prototype.print = function () {
  return 'ap ' + this.arg1.print() + ' ' + this.arg2.print();
};

// #18. S Combinator
var STerm = {
  tag: 'STerm',
  eval: function (env) {
    return this;
  },
  apply: function (env, x) {
    return PartialFunctionTerm(function (y) {
      return PartialFunctionTerm(function (z) {
        return ApTerm(
          ApTerm(x, z), // TODO: May need to pre-evaluate z first for performance, or not
          ApTerm(y, z),
        ).eval(env);
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
  eval: function (env) {
    return this;
  },
  apply: function (env, x) {
    return PartialFunctionTerm(function (y) {
      return PartialFunctionTerm(function (z) {
        return ApTerm(
          ApTerm(x, z),
          y,
        ).eval(env);
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
  eval: function (env) {
    return this;
  },
  apply: function (env, x) {
    return PartialFunctionTerm(function (y) {
      return PartialFunctionTerm(function (z) {
        return ApTerm(
          x,
          ApTerm(y, z),
        ).eval(env);
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
  eval: function (env) {
    return this;
  },
  apply: function (env, x) {
    return x.eval(env);
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
  eval: function (env) {
    return this;
  },
  apply: function (env, fst) {
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
PairTerm.prototype.eval = function (env) {
  return this;
};
PairTerm.prototype.print = function () {
  return 'cons ' + this.fst.print() + ' ' + this.snd.print();
};

// #26. Car (First)
var CarTerm = {
  tag: 'CarTerm',
  eval: function (env) {
    return this;
  },
  apply: function (env, arg) {
    var val = arg.eval(env);
    if (val.tag != 'PairTerm') {
      throw new Error('Type error: ‘car’ needs a list argument');
    }
    return val.fst;
  },
  print: function () {
    return 'car';
  }
};

// #27. Cdr (Tail)
var CdrTerm = {
  tag: 'CdrTerm',
  eval: function (env) {
    return this;
  },
  apply: function (env, arg) {
    var val = arg.eval(env);
    if (val.tag != 'PairTerm') {
      throw new Error('Type error: ‘cdr’ needs a list argument');
    }
    return val.snd;
  },
  print: function () {
    return 'cdr';
  }
};

// #28. Nil (Empty List)
var NilTerm = {
  tag: 'NilTerm',
  eval: function (env) {
    return this;
  },
  print: function () {
    return 'nil';
  }
};

// #29. Is Nil (Is Empty List)
var IsnilTerm = {
  tag: 'IsnilTerm',
  eval: function (env) {
    return this;
  },
  apply: function (env, arg) {
    var val = arg.eval(env);
    return BoolTerm(val.tag == 'NilTerm');
  },
  print: function () {
    return 'isnil';
  }
};

// #30. List Construction Syntax
// TODO

// #31. Vector
// TODO

// #32. Draw
var DrawTerm = {
  tag: 'DrawTerm',
  eval: function (env) {
    return this;
  },
  apply: function (env, arg) {
    var walk = (arg, acc) => {
      const list = arg.eval(env);
      if (list.tag === 'NilTerm') {
        return acc;
      }
      if (list.tag !== 'PairTerm') {
        throw new Error('Type error: ‘draw’ expects a list');
      }
      const head = list.fst.eval(env);
      if (head.tag !== 'PairTerm') {
        throw new Error(
          'Type error: ‘draw’ expects list elements to be pairs, got ' + head.tag
        );
      }
      const xTerm = head.fst.eval(env);
      const yTerm = head.snd.eval(env);
      if (xTerm.tag !== 'NumTerm' || yTerm.tag !== 'NumTerm') {
        throw new Error('Type error: ‘draw’ expects list elements to be pairs of numbers');
      }
      const point = Pair(xTerm.num, yTerm.num);
      acc.push(point);
      return walk(list.snd, acc);
    };
    const bitmap = walk(arg, []);
    return ImageTerm(bitmap);
  },
  print: function () {
    return 'draw';
  }
};
var MultiDrawTerm = {
  tag: 'MultiDrawTerm',
  eval: function (env) {
    return this;
  },
  apply: function (env, arg) {
    // walk : List Pair -> Bitmap
    var walk = (arg, acc) => {
      const list = arg.eval(env);
      if (list.tag === 'NilTerm'){
        return acc;
      }
      if (list.tag !== 'PairTerm') {
        throw new Error('Type error: ‘multipledraw’ expects a list of lists');
      }
      const head = list.fst.eval(env);
      if (head.tag !== 'PairTerm') {
        throw new Error(
          'Type error: ‘multipledraw’ expects list of list elements to be pairs, got ' + head.tag
        );
      }
      const xTerm = head.fst.eval(env);
      const yTerm = head.snd.eval(env);
      if (xTerm.tag !== 'NumTerm' || yTerm.tag !== 'NumTerm') {
        throw new Error('Type error: ‘multipledraw’ expects list elements to be pairs of numbers');
      }
      const point = Pair(xTerm.num, yTerm.num);
      const newAcc = acc.concat([point]);
      return walk(list.snd, newAcc);
    }
    // externalWalk : List List Pair -> List Bitmap -> List Bitmap
    var externalWalk = (arg, acc) => {
      const listOfLists = arg.eval(env);

      if (listOfLists.tag === 'NilTerm') {
        return acc;
      }
      if (listOfLists.tag !== 'PairTerm') {
        throw new Error('Type error: ‘multipledraw’ expects a list');
      }
      const headList = listOfLists.fst.eval(env);
      if (headList.tag !== 'PairTerm') {
        throw new Error(
          'Type error: ‘multipledraw’ expects list elements to be pairs, got ' + head.tag
        );
      }
      const bitmap = walk(headList, []);
      const newAcc = acc.concat([bitmap])
      return externalWalk(listOfLists.snd, newAcc);
    }
    const bitmaps = externalWalk(arg, []);
    return MultiImageTerm(bitmaps);
  },
  print: function () {
    return 'multipledraw';
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
ImageTerm.prototype.eval = function (env) {
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
  return [newBitmap];
};

// #33. Checkerboard
// TODO

// #34. Multiple Draw
// type Bitmaps = [[(Int, Int)]] (array of arrays of x, y pairs)
function MultiImageTerm(bitmaps) {
  if (!(this instanceof MultiImageTerm)) {
    return new MultiImageTerm(bitmaps);
  }
  return Object.assign(this, {
    tag: 'MultiImageTerm',
    bitmaps: bitmaps,
  });
}
MultiImageTerm.prototype.eval = function (env) {
  return this;
};
MultiImageTerm.prototype.print = function () {
  return '[ ' + this.bitmaps.map(b => '[ ' + b.map(p => `(${p.fst}, ${p.snd})`).join(',') + ' ]').join(",") + ' ]';
};
MultiImageTerm.prototype.render = function () {
  const minW = 17;
  const minH = 13;
  // assuming all bitmaps have the same size
  const w = Math.max(minW, getBitmapWidth(this.bitmaps[0]));
  const h = Math.max(minH, getBitmapHeight(this.bitmaps[0]));
  const bitmapsWithBorders = [];
  for (const bitmap of this.bitmaps) {
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
    for (let point of bitmap) {
      newBitmap.push(Pair(point.fst + 1, point.snd + 1));
    }
    bitmapsWithBorders.push(newBitmap);
  }
  return bitmapsWithBorders;
};

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

// modulateTerm :: Env -> Term -> [Int]
function modulateTerm(env, term) {
  const val = term.eval(env);
  if (val.tag === 'NilTerm') {
    return [0, 0];
  }
  if (val.tag === 'PairTerm') {
    return [1, 1].concat(modulateTerm(env, val.fst)).concat(modulateTerm(env, val.snd));
  }
  if (val.tag === 'NumTerm') {
    return modulateNum(val.num);
  }
  throw new Error('modulateTerm cannot accept term of type: ' + val.tag);
}

var ModTerm = {
  tag: 'ModTerm',
  eval: function (env) {
    return this;
  },
  apply: function (env, term) {
    return ModulatedTerm(modulateTerm(env, term));
  },
  print: function () {
    return 'mod';
  },
};

// Note: ModulatedTerm does not appear in inputs.
function ModulatedTerm(bits) {
  if (!(this instanceof ModulatedTerm)) {
    return new ModulatedTerm(bits);
  }
  return Object.assign(this, {
    tag: 'ModulatedTerm',
    bits: bits,
  });
}
ModulatedTerm.prototype.eval = function (env) {
  return this;
};
ModulatedTerm.prototype.print = function () {
  return '{ ' + this.bits.join(',') + ' }';
};

var ModemTerm = {
  tag: 'ModemTerm',
  eval: function (env) {
    return this;
  },
  apply: function (env, term) {
    // Run modulation, discarding results. This will throw if the term contains
    // anything that cannot be modulated.
    modulateTerm(env, term);
    // Return the reduced term. We evaluate the term twice (once in
    // modulateTerm, once here), but this is just a performance issue.
    return term.eval(env);
  },
  print: function () {
    return 'mod';
  },
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
    case 'mod':
      return Pair(ModTerm, moreTokens);
    case 'modem':
      return Pair(ModemTerm, moreTokens);

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

    // TODO: pwr2 and checkerboard are hardcoded in the stdEnv in main.js; make it better

    case 'i':
      return Pair(ITerm, moreTokens);
    case 'cons':
      return Pair(ConsTerm, moreTokens);
    case 'car':
      return Pair(CarTerm, moreTokens);
    case 'cdr':
      return Pair(CdrTerm, moreTokens);
    case 'nil':
      return Pair(NilTerm, moreTokens);
    case 'isnil':
      return Pair(IsnilTerm, moreTokens);

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


    case 'multipledraw':
      return Pair(MultiDrawTerm, moreTokens);

    // TODO: Implement if0, interact...
    // case 'checkerboard':

    case 'if0':
      throw new Error('‘if0’ is unimplemented');
    case 'interact':
      throw new Error('‘interact’ is unimplemented');

    default:
      return returnSymOrReadAssignment(SymTerm(headToken), moreTokens);
      // return Pair(SymTerm(headToken), moreTokens);
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

// returnSymOrReadAssignment : SymTerm -> Array String -> (Term, Array String)
function returnSymOrReadAssignment(symTerm, tokens) {
  if (tokens.length === 0) {
    return Pair(symTerm, []);
  }
  var headToken = tokens[0];
  var moreTokens = tokens.slice(1);
  if (headToken === '=') {
    var result = readTerm(moreTokens);
    return Pair(AssignmentTerm(symTerm, result.fst), result.snd);
  }
  return Pair(symTerm, tokens);
}

//////////////////////////////////////////////////////////////////////////////

// evalTerm : Term -> Term
function evalTerm(env, term) {
  return term.eval(env);
}

function applyUnaryNumOp(env, tag, arg, fun) {
  var val = arg.eval(env);
  if (val.tag != 'NumTerm') {
    throw new Error('Type error: ‘' + tag + '’ needs one numeric argument');
  }
  return NumTerm(fun(val.num));
}

function applyBinaryNumOp(env, tag, arg1, arg2, fun) {
  var val1 = arg1.eval(env);
  var val2 = arg2.eval(env);
  if (val1.tag != 'NumTerm' || val2.tag != 'NumTerm') {
    throw new Error('Type error: ‘' + tag + '’ needs two numeric arguments');
  }
  return NumTerm(fun(val1.num, val2.num));
}

function applyBinaryCompOp(env, tag, arg1, arg2, fun) {
  var val1 = arg1.eval(env);
  var val2 = arg2.eval(env);
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

function MultiBitmapResult(bitmaps) {
  return {
    tag: 'MultiBitmapResult',
    bitmaps: bitmaps,
  };
}

// parseInput : Text -> Term
function parseInput(inputText) {
  var tokens = tokenizeInput(inputText);
  var termAndMoreTokens = readTerm(tokens);
  var moreTokens = termAndMoreTokens.snd;
  if (moreTokens.length != 0) {
    throw new Error('Unexpected token: ‘' + moreTokens[0] + '’');
  }
  return termAndMoreTokens.fst;
}

// handleInput : Env -> String -> Either String String
function handleInput(env, inputText) {
  try {
    var term = parseInput(inputText);
    var value = evalTerm(env, term);
    if (typeof value.render !== 'undefined') {
      return Right(MultiBitmapResult(value.render()));
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
      handleInput(Env(), string),
      Right(StringResult(expectedRight))
    );
  }
}

// assertEvalTerm : String -> Term -> ()
function assertEvalTerm(inputText, expectedTerm) {
  if (typeof window === 'undefined') {
    const assert = require('assert');
    const inputTerm = parseInput(inputText);
    const resultTerm = evalTerm(Env(), inputTerm);
    assert.deepEqual(resultTerm, expectedTerm);
  }
}

// assertEvalThrows : String -> String | RegExp -> ()
function assertEvalThrows(inputText, expectedThrow) {
  if (typeof window === 'undefined') {
    const assert = require('assert');
    const inputTerm = parseInput(inputText);
    assert.throws(() => evalTerm(Env(), inputTerm), expectedThrow);
  }
}

//////////////////////////////////////////////////////////////////////////////

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.strictEqual(NumTerm(37).print(), '37');
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.strictEqual(SymTerm('foo').print(), 'foo');
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  const env = Env();
  AssignmentTerm(
    SymTerm('foo'),
    NumTerm(42),
  ).eval(env);
  assert.deepEqual(
    SymTerm('foo').eval(env),
    NumTerm(42),
  );
}

if (typeof window === 'undefined') {
  // This test is commented out, because after allowing open terms to be
  // returned from eval(), we haven’t updated the type check there. This is OK,
  // the type check would just help with debugging.
  // const assert = require('assert');
  // assert.throws(
  //   () => ApTerm(NumTerm(37), NumTerm(42)).eval(Env()),
  //   /Cannot perform application on term: ‘NumTerm’/
  // );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(IncTerm, NumTerm(42)).eval(Env()),
    NumTerm(43),
  );
  assert.throws(
    () => ApTerm(IncTerm, IncTerm).eval(Env()),
    /Type error: ‘IncTerm’ needs one numeric argument/
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(DecTerm, NumTerm(42)).eval(Env()),
    NumTerm(41),
  );
  assert.throws(
    () => ApTerm(DecTerm, DecTerm).eval(Env()),
    /Type error: ‘DecTerm’ needs one numeric argument/
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      ApTerm(AddTerm, NumTerm(42)),
      NumTerm(18),
    ).eval(Env()),
    NumTerm(60),
  );
  assert.deepEqual(
    ApTerm(AddTerm, NumTerm(42)).eval(Env()).print(),
    '<partial fn>',
  );
  assert.throws(
    () => ApTerm(ApTerm(AddTerm, NilTerm), NumTerm(42)).eval(Env()),
    /Type error: ‘AddTerm’ needs two numeric arguments/,
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      ApTerm(MulTerm, NumTerm(4)),
      NumTerm(2),
    ).eval(Env()),
    NumTerm(8),
  );
  assert.throws(
    () => ApTerm(ApTerm(MulTerm, NilTerm), NumTerm(42)).eval(Env()),
    /Type error: ‘MulTerm’ needs two numeric arguments/,
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(4)), NumTerm(2)).eval(Env()),
    NumTerm(2),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(4)), NumTerm(3)).eval(Env()),
    NumTerm(1),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(4)), NumTerm(4)).eval(Env()),
    NumTerm(1),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(4)), NumTerm(5)).eval(Env()),
    NumTerm(0),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(5)), NumTerm(2)).eval(Env()),
    NumTerm(2),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(6)), NumTerm(-2)).eval(Env()),
    NumTerm(-3),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(5)), NumTerm(-3)).eval(Env()),
    NumTerm(-1),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(-5)), NumTerm(3)).eval(Env()),
    NumTerm(-1),
  );
  assert.deepEqual(
    ApTerm(ApTerm(DivTerm, NumTerm(-5)), NumTerm(-3)).eval(Env()),
    NumTerm(1),
  );
  assert.throws(
    () => ApTerm(ApTerm(DivTerm, NilTerm), NumTerm(42)).eval(Env()),
    /Type error: ‘DivTerm’ needs two numeric arguments/,
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      ApTerm(EqTerm, NumTerm(0)),
      NumTerm(-2),
    ).eval(Env()),
    FTerm,
  );
  assert.deepEqual(
    ApTerm(
      ApTerm(EqTerm, NumTerm(-2)),
      NumTerm(-2),
    ).eval(Env()),
    TTerm,
  );
  assert.throws(
    () => ApTerm(ApTerm(EqTerm, NilTerm), NumTerm(42)).eval(Env()),
    /Type error: ‘EqTerm’ needs two numeric arguments/,
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(ApTerm(LtTerm, NumTerm(0)), NumTerm(-2)).eval(Env()),
    FTerm,
  );
  assert.deepEqual(
    ApTerm(ApTerm(LtTerm, NumTerm(0)), NumTerm(0)).eval(Env()),
    FTerm,
  );
  assert.deepEqual(
    ApTerm(ApTerm(LtTerm, NumTerm(0)), NumTerm(2)).eval(Env()),
    TTerm,
  );
  assert.throws(
    () => ApTerm(ApTerm(LtTerm, NilTerm), NumTerm(42)).eval(Env()),
    /Type error: ‘LtTerm’ needs two numeric arguments/,
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(NegTerm, NumTerm(0)).eval(Env()),
    NumTerm(0),
  );
  assert.deepEqual(
    ApTerm(NegTerm, NumTerm(1)).eval(Env()),
    NumTerm(-1),
  );
  assert.throws(
    () => ApTerm(NegTerm, NegTerm).eval(Env()),
    /Type error: ‘NegTerm’ needs one numeric argument/
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      IncTerm,
      ApTerm(IncTerm, NumTerm(0)),
    ).eval(Env()),
    NumTerm(2),
  );
  assert.deepEqual(
    ApTerm(
      IncTerm,
      ApTerm(IncTerm,
        ApTerm(IncTerm, NumTerm(0))),
    ).eval(Env()),
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
    ).eval(Env()),
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
  //   ).eval(Env()),
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
    ).eval(Env()),
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
    ).eval(Env()),
    NumTerm(2),
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      ApTerm(TTerm, NumTerm(1)),
      NumTerm(5),
    ).eval(Env()),
    NumTerm(1),
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(
      ApTerm(FTerm, NumTerm(1)),
      NumTerm(5),
    ).eval(Env()),
    NumTerm(5),
  );
}

if (typeof window === 'undefined') {
  const assert = require('assert');
  assert.deepEqual(
    ApTerm(ITerm, NumTerm(1)).eval(Env()),
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
    ApTerm(ApTerm(ConsTerm, NumTerm(1)), NilTerm).eval(Env()),
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
    ).eval(Env()),
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
    ).eval(Env()),
    ImageTerm([Pair(1, 2), Pair(1, 1)]),
  );
  assert.throws(
    () => ApTerm(
      DrawTerm,
      IncTerm,
    ).eval(Env()),
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
    modulateTerm(Env(), NilTerm),
    '00'.split(''),
  );
  assert.deepEqual(
    // ap ap cons nil nil
    // ap (ap cons nil) nil
    // list [nil] or pair (nil, nil)
    modulateTerm(Env(), ApTerm(ApTerm(ConsTerm, NilTerm), NilTerm)),
    '110000'.split(''),
  );
  assert.deepEqual(
    // ap ap cons 0 nil
    // ap (ap cons 0) nil
    // list [0] or pair (0, nil)
    modulateTerm(Env(), ApTerm(ApTerm(ConsTerm, NumTerm(0)), NilTerm)),
    '1101000'.split(''),
  );
  assert.deepEqual(
    // ap ap cons 1 2
    // ap (ap cons 1) 2
    // pair (1, 2)
    modulateTerm(Env(), ApTerm(ApTerm(ConsTerm, NumTerm(1)), NumTerm(2))),
    '110110000101100010'.split(''),
  );
  assert.deepEqual(
    // ap ap cons 1 ap ap cons 2 nil
    // ap (ap cons 1) (ap (ap cons 2) nil)
    // list [1, 2] or pair (1, pair (2, nil))
    modulateTerm(
      Env(),
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
  // Symbols
  assert.deepEqual(
    readTerm(tokenizeInput('foobar')),
    Pair(SymTerm('foobar'), []),
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
  assert.deepEqual(
    readTerm(tokenizeInput('mod')),
    Pair(ModTerm, []),
  );
  // Binary: application
  assert.deepEqual(
    readTerm(tokenizeInput('ap inc 37')),
    Pair(ApTerm(IncTerm, NumTerm(37)), []),
  );
  assert.deepEqual(
    readTerm(tokenizeInput('ap mod 37')),
    Pair(ApTerm(ModTerm, NumTerm(37)), []),
  );

  // equivalent of the test above
  assert.deepEqual(
    handleInput(Env(),'ap inc 37'),
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
        SymTerm('checkerboard'),
        NilTerm,
      ),
      [],
    ),
  );
  assert.deepEqual(
    readTerm(tokenizeInput('checkerboard = ap nil nil')),
    Pair(
      AssignmentTerm(
        SymTerm('checkerboard'),
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
        SymTerm('checkerboard'),
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

assertRight('mod', 'mod');
assertRight('ap mod 0', '{ 0,1,0 }');
assertRight('ap mod ap ap cons nil nil', '{ 1,1,0,0,0,0 }');

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

assertRight('car', 'car');
assertRight('ap car ap ap cons 0 1', '0');
assertRight('cdr', 'cdr');
assertRight('ap cdr ap ap cons 0 1', '1');
assertRight('nil', 'nil');
// assertRight('ap nil 0', 't');
assertRight('isnil', 'isnil');
assertRight('ap isnil nil', 't');
assertRight('ap isnil ap ap cons 0 1', 'f');
// assertRight('()', 'nil');
assertRight('vec', 'cons');
// assertRight('if0', 'if0');

assertEvalTerm('modem', ModemTerm);
assertEvalTerm('ap modem 1', NumTerm(1));
assertEvalTerm('ap modem ap ap cons 1 nil', PairTerm(NumTerm(1), NilTerm));
assertEvalThrows(
  'ap modem ap add 1',
  /modulateTerm cannot accept term of type: PartialFunctionTerm/,
);
