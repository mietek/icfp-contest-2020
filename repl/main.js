function tokeniseInput(text) {
  return text.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ').trim().split(/\s+/);
}

// handleInput : String -> Either String String
function handleInput(inputText) {
  try {
    var tokens = tokeniseInput(inputText);
    var termAndMoreTokens = readTerm(tokens);
    var moreTokens = termAndMoreTokens.snd;
    if (moreTokens.length != 0) {
      throw new Error('Unexpected token: ‘' + moreTokens[0] + '’');
    }
    var term = termAndMoreTokens.fst;
    var value = evalTerm(term);
    return Right(printTerm(value));
  } catch (e) {
    return Left(e.message);
  }
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

function appendDialog(outputContainer, inputText, outputResult) {
  var dialogContainer = document.createElement('div');
  var inputP = createParagraph('input', inputText);
  if (outputResult.tag == 'Left') {
    var outputP = createParagraph('output error', outputResult.left);
  } else {
    var outputP = createParagraph('output', outputResult.right);
  }
  dialogContainer.className = 'dialog-container';
  dialogContainer.appendChild(inputP);
  dialogContainer.appendChild(outputP);
  outputContainer.appendChild(dialogContainer);
  return dialogContainer;
}

function handleKeyDown(event) {
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
        var outputResult = handleInput(inputText);
        var outputContainer = document.getElementById('output-container');
        var dialogContainer = appendDialog(outputContainer, inputText, outputResult);
        dialogContainer.scrollIntoView({ behavior: "smooth" });
        input.value = null;
      }
    }
  }
}

function main() {
  document.getElementById('input').addEventListener('keydown', handleKeyDown);
}

addEventListener('load', main);
