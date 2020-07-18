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
// TODO

// #12. Strict Less-Than
// TODO

// #13. Modulate
// TODO

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

// #21. True (K Combinator)
// TODO

// #22. False
// TODO

// #23. Power of Two
// TODO

// #24. I Combinator
// TODO

// #25. Cons (or Pair)
// TODO

// #26. Car (First)
// TODO

// #27. Cdr (Tail)
// TODO

// #28. Nil (Empty List)
// TODO

// #29. Is Nil (Is Empty List)
// TODO

// #30. List Construction Syntax
// TODO

// #31. Vector
// TODO

// #32. Draw
// TODO

// #33. Checkerboard
// TODO

// #34. Multiple Draw
// TODO

// #35. Modulate List
// TODO

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
    case 'add':
      return readBinaryOp('add', AddTerm, moreTokens);
    case 'mul':
      return readBinaryOp('mul', MulTerm, moreTokens);
    case 'div':
      return readBinaryOp('div', DivTerm, moreTokens);
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

function evalUnaryNumOp(op, unaryFun) {
  var val1 = op.arg1.eval();
  if (val1.tag != 'NumTerm') {
    throw new Error('Type error: ‘' + op.opName + '’ needs one numeric argument');
  }
  return NumTerm(unaryFun(val1.num));
}

function evalBinaryNumOp(op, binaryFun) {
  var val1 = op.arg1.eval();
  var val2 = op.arg2.eval();
  if (val1.tag != 'NumTerm' || val2.tag != 'NumTerm') {
    throw new Error('Type error: ‘' + op.opName + '’ needs two numeric arguments');
  }
  return NumTerm(binaryFun(val1.num, val2.num));
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
