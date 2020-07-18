// handleInput : String -> Either String String
function handleInput(scope, inputText) {
  try {
    var tokens = tokeniseInput(inputText);
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

function replaceSelection(textArea, replaceText) {
  var oldText1 = textArea.value.slice(0, textArea.selectionStart);
  var oldText2 = textArea.value.slice(textArea.selectionEnd);
  var newText = oldText1.concat(replaceText).concat(oldText2);
  var newCaretPosition = textArea.selectionStart + replaceText.length;
  textArea.value = newText;
  textArea.selectionStart = newCaretPosition;
  textArea.selectionEnd = newCaretPosition;
}

function createParagraph(className, text) {
  var p = document.createElement('p');
  p.className = className;
  var lines = text.split('\n');
  for (var i = 1; i < lines.length; i++) {
    lines[i] = lines[i].replace(/^( *)(.*)( *)$/, function (match, leftSpaces, text, rightSpaces) {
      return ' '.repeat(leftSpaces.length) + text;
    });
  }
  for (var i = 0; i < lines.length; i++) {
    if (i) {
      p.appendChild(document.createElement('br'));
    }
    p.appendChild(document.createTextNode(lines[i]));
  }
  return p;
}

// createBitmapParagraph draws a bitmap on a canvas and returns a paragraph
// containing the canvas.
function createBitmapParagraph(className, bitmap) {
  const pointSize = 10;
  const bitmapWidth = getBitmapWidth(bitmap);
  const bitmapHeight = getBitmapHeight(bitmap);
  const p = document.createElement('p');
  p.className = className;
  const canvas = document.createElement('canvas');
  // add an extra pixel for top/left black frame
  canvas.width = bitmapWidth * pointSize + 1;
  canvas.height = bitmapHeight * pointSize + 1;
  canvas.style.width = 0.5 * canvas.width + 'px';
  canvas.style.height = 0.5 * canvas.height + 'px';
  p.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  for (const point of bitmap) {
    ctx.fillRect(
      point.fst * pointSize + 1, // account for the top/left frame
      point.snd * pointSize + 1,
      pointSize - 1, // leave 1px for spacing
      pointSize - 1,
    );
  }
  return p;
}

function appendDialog(outputContainer, inputText, outputResult) {
  var dialogContainer = document.createElement('div');
  var inputP = createParagraph('input', inputText);
  var outputP;
  if (outputResult.tag == 'Left') {
    outputP = createParagraph('output error', outputResult.left);
  } else {
    if (outputResult.right.tag === 'StringResult') {
      outputP = createParagraph('output', outputResult.right.string);
    }
    if (outputResult.right.tag === 'BitmapResult') {
      outputP = createBitmapParagraph('output', outputResult.right.bitmap);
    }
  }
  dialogContainer.className = 'dialog-container';
  dialogContainer.appendChild(inputP);
  dialogContainer.appendChild(outputP);
  outputContainer.appendChild(dialogContainer);
  return dialogContainer;
}

function handleKeyDown(scope, event) {
  var input = document.getElementById('input');
  if (event.keyCode == 13) {
    if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) {
      event.preventDefault();
      replaceSelection(input, '\n');
    }
    else if (!event.altKey && !event.ctrlKey && !event.shiftKey && !event.metaKey) {
      event.preventDefault();
      var inputText = input.value.trim();
      if (inputText.length) {
        var outputResult = handleInput(scope, inputText);
        var outputContainer = document.getElementById('output-container');
        var dialogContainer = appendDialog(outputContainer, inputText, outputResult);
        dialogContainer.scrollIntoView({ behavior: "smooth" });
        input.value = null;
      }
    }
  }
}

function main() {
  const scope = Scope();
  document.getElementById('input').addEventListener('keydown', function(event) {
    handleKeyDown(scope, event);
  });
}

addEventListener('load', main);
