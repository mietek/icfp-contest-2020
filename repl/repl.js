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
NumTerm.read = function (tokens) {
  return Pair(NumTerm(Number(tokens[0])), tokens.slice(1));
};

// #4. Equality
// TODO: Actually, it’s symbol binding, and so, needs environments and dynamic/lexical scoping

// #5. Successor
function IncTerm(term) {
  return {
    tag: 'IncTerm',
    term: term,
    eval: function () {
      var value = this.term.eval();
      if (value.tag != 'NumTerm') {
        throw new Error('Type error: ‘inc’ needs a numeric argument');
      }
      return NumTerm(value.num + 1);
    },
    print: function () {
      return 'inc ' + this.term.print();
    }
  };
}
IncTerm.read = function (tokens) {
  if (tokens.length == 0) {
    throw new Error('Syntax error: ‘inc’ needs an argument');
  }
  var result = readTerm(tokens);
  return Pair(IncTerm(result.fst), result.snd);
};

// #6. Predecessor
function DecTerm(term) {
  return {
    tag: 'DecTerm',
    term: term,
    eval: function () {
      var value = this.term.eval();
      if (value.tag != 'NumTerm') {
        throw new Error('Type error: ‘dec’ needs a numeric argument');
      }
      return NumTerm(value.num - 1);
    },
    print: function () {
      return 'dec ' + this.term.print();
    }
  };
}
DecTerm.read = function (tokens) {
  if (tokens.length == 0) {
    throw new Error('Syntax error: ‘dec’ needs an argument');
  }
  var result = readTerm(tokens);
  return Pair(DecTerm(result.fst), result.snd);
};

// #7. Sum
function AddTerm(term1, term2) {
  return {
    tag: 'AddTerm',
    term1: term1,
    term2: term2,
    eval: function () {
      var value1 = this.term1.eval();
      var value2 = this.term2.eval();
      if (value1.tag != 'NumTerm' || value2.tag != 'NumTerm') {
        throw new Error('Type error: ‘add’ needs two numeric arguments');
      }
      return NumTerm(value1.num + value2.num);
    },
    print: function () {
      return 'add ' + this.term1.print() + ' ' + this.term2.print();
    }
  };
}
AddTerm.read = function (tokens) {
  if (tokens.length < 2) {
    throw new Error('Syntax error: ‘add’ needs two arguments');
  }
  var result1 = readTerm(tokens);
  var result2 = readTerm(result1.snd);
  return Pair(AddTerm(result1.fst, result2.fst), result2.snd);
};

// #8. Variables
// TODO: Let’s hope we won’t need to deal with them

// #9. Product
function MulTerm(term1, term2) {
  return {
    tag: 'MulTerm',
    term1: term1,
    term2: term2,
    eval: function () {
      var value1 = this.term1.eval();
      var value2 = this.term2.eval();
      if (value1.tag != 'NumTerm' || value2.tag != 'NumTerm') {
        throw new Error('Type error: ‘add’ needs two numeric arguments');
      }
      return NumTerm(value1.num * value2.num);
    },
    print: function () {
      return 'mul ' + this.term1.print() + ' ' + this.term2.print();
    }
  };
}
MulTerm.read = function (tokens) {
  if (tokens.length < 2) {
    throw new Error('Syntax error: ‘mul’ needs two arguments');
  }
  var result1 = readTerm(tokens);
  var result2 = readTerm(result1.snd);
  return Pair(MulTerm(result1.fst, result2.fst), result2.snd);
};

// #10. Integer Division
function DivTerm(term1, term2) {
  return {
    tag: 'DivTerm',
    term1: term1,
    term2: term2,
    eval: function () {
      var value1 = this.term1.eval();
      var value2 = this.term2.eval();
      if (value1.tag != 'NumTerm' || value2.tag != 'NumTerm') {
        throw new Error('Type error: ‘div’ needs two numeric arguments');
      }
      return NumTerm(parseInt(value1.num / value2.num));
    },
    print: function () {
      return 'div ' + this.term1.print() + ' ' + this.term2.print();
    }
  };
}
DivTerm.read = function (tokens) {
  if (tokens.length < 2) {
    throw new Error('Syntax error: ‘div’ needs two arguments');
  }
  var result1 = readTerm(tokens);
  var result2 = readTerm(result1.snd);
  return Pair(DivTerm(result1.fst, result2.fst), result2.snd);
};

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

// readTerm : Array String -> Pair Term (Array String)
function readTerm(tokens) {
  if (tokens.length == 0) {
    throw new Error('Unexpected EOF; expected term');
  }
  if (/^-?[0-9]+$/.test(tokens[0])) {
    return NumTerm.read(tokens);
  }
  switch (tokens[0]) {
    case 'inc':
      return IncTerm.read(tokens.slice(1));
    case 'dec':
      return DecTerm.read(tokens.slice(1));
    case 'add':
      return AddTerm.read(tokens.slice(1));
    case 'mul':
      return MulTerm.read(tokens.slice(1));
    case 'div':
      return DivTerm.read(tokens.slice(1));
    case '(':
      return readTermInParens(tokens.slice(1));
    default:
      throw new Error('Unrecognized token: ‘' + tokens[0] + '’');
  }
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

// evalTerm : Term -> Term
function evalTerm(term) {
  return term.eval();
}

// printTerm : Term -> String
function printTerm(term) {
  return term.print();
}
