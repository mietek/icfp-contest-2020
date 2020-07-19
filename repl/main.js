"use strict";

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


function createMultipleBitmapParagraph(className, bitmaps) {
  const pointSize = 10;
  // assuming all bitmaps are of the same size
  const bitmap0 = bitmaps[0];
  const bitmapWidth = getBitmapWidth(bitmap0);
  const bitmapHeight = getBitmapHeight(bitmap0);
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
  for (const [i, bitmap] of bitmaps.entries()) {
    // some magic numbers since it's supposed to be fun, right?
    // this way, no matter how many layers, each should have a distinctive color
    // and yet, it's deterministic!
    let magicHue = (1 + i) * 193 % 360;
    ctx.fillStyle = 'hsl(' + magicHue + ', 73%, 60%)';
    for (const point of bitmap) {
      ctx.fillRect(
        point.fst * pointSize + 1, // account for the top/left frame
        point.snd * pointSize + 1,
        pointSize - 1, // leave 1px for spacing
        pointSize - 1,
      );
    }
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
    // if (outputResult.right.tag === 'BitmapResult') {
    //   outputP = createBitmapParagraph('output', outputResult.right.bitmap);
    // }
    if (outputResult.right.tag === 'MultiBitmapResult') {
      outputP = createMultipleBitmapParagraph('output', outputResult.right.bitmaps);
    }
  }
  dialogContainer.className = 'dialog-container';
  dialogContainer.appendChild(inputP);
  dialogContainer.appendChild(outputP);
  outputContainer.appendChild(dialogContainer);
  return dialogContainer;
}

function handleKeyDown(env, event) {
  var input = document.getElementById('input');
  if (event.keyCode == 13) {
    if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) {
      event.preventDefault();
      replaceSelection(input, '\n');
    }
    else if (!event.altKey && !event.ctrlKey && !event.shiftKey && !event.metaKey) {
      event.preventDefault();
      var inputLines = input.value.trim().split(/\n+/);
      for (const inputText of inputLines) {
        if (inputText.length) {
          var outputResult = handleInput(env, inputText);
          var outputContainer = document.getElementById('output-container');
          var dialogContainer = appendDialog(outputContainer, inputText, outputResult);
          dialogContainer.scrollIntoView({ behavior: "smooth" });
          input.value = null;
        }
      }
    }
  }
}

function main() {
  const stdEnv = Env();
  handleInput(stdEnv, 'pwr2 = ap ap s ap ap c ap eq 0 1 ap ap b ap mul 2 ap ap b pwr2 ap add -1');
  handleInput(stdEnv, 'checkerboard = ap ap s ap ap b s ap ap c ap ap b c ap ap b ap c ap c ap ap s ap ap b s ap ap b ap b ap ap s i i lt eq ap ap s mul i nil ap ap s ap ap b s ap ap b ap b cons ap ap s ap ap b s ap ap b ap b cons ap c div ap c ap ap s ap ap b b ap ap c ap ap b b add neg ap ap b ap s mul div ap ap c ap ap b b checkerboard ap ap c add 2');
  handleInput(stdEnv, 'cb1 = ap ap checkerboard 9 11');
  handleInput(stdEnv, 'cb2 = ap ap checkerboard 9 39');
  handleInput(stdEnv, 'cb3 = ap ap checkerboard 9 4');
  handleInput(stdEnv, 'cbs = ap ap cons cb1 ap ap cons cb2 ap ap cons cb3 nil');
  handleInput(stdEnv, 'showmethemagic = ap multipledraw cbs'); // who doesn't like easter eggs
  handleInput(stdEnv, 'statelessdraw = ap ap c ap ap b b ap ap b ap b ap cons 0 ap ap c ap ap b b cons ap ap c cons nil ap ap c ap ap b cons ap ap c cons nil nil');
  stdEnv.map.set(
    'f38',
    FunctionTerm('x2',
      FunctionTerm('x0',
        parseInput('ap ap ap if0 ap car x0 ( ap modem ap car ap cdr x0 , ap multipledraw ap car ap cdr ap cdr x0 ) ap ap ap interact x2 ap modem ap car ap cdr x0 ap send ap car ap cdr ap cdr x0')
      ),
    ),
  );
  stdEnv.map.set(
    'interact',
    FunctionTerm('x2',
      FunctionTerm('x4',
        FunctionTerm('x3',
          parseInput('ap ap f38 x2 ap ap x2 x4 x3')
        ),
      ),
    ),
  );

  document.getElementById('input').addEventListener('keydown', function(event) {
    handleKeyDown(stdEnv, event);
  });
}

addEventListener('load', main);
