# Caret

Utilities for reading and positioning the caret and selection in contenteditable HTML elements

```javascript
document.body.outerHTML = `
  <body contenteditable>
    <p>Hello,</p>
    <p>World!</p>
  </body>`

caret.nodeFromPosition(document.body, 6)
// [[TextNode "World"], 0]

selection.setBaseAndExtent(...caret.nodeFromPosition(document.body, 6));
careet.positionFromFocus(document.body);
// [[TextNode "World"], 0]

caret.positionFromNode(document.body.children[1].childNodes[0])
// 6

caret.innerText(document.body)
// 'Hello,\nWorld!'
```

## API

#### restore = caret.save(element)

Stores the current position of the caret, as a character offset from the beginning of `element`.  Returns a `restoreFn` callback function to restore the caret back to where it was.  This callback function takes an option `offset` parameter which will offset the restoration by the supplied number of characters.

```javascript
const restore = caret.save(el);
el.innerHTML = renderText();
restore();
```

#### [node, position] = caret.nodeFromPosition(element, position)

Returns the node and position within that node where your caret would end up if you start from the beginning of `element` and press the right-arrow key `position` times.  Returned node may either be an `HTMLElement` or else a `TextNode`.

#### position = caret.positionFromNode(element, targetNode, targetOffset)

Supposing your caret were positioned at `targetOffset` in `targetNode` within parent `element`, returns how many times would you need to press the left-arrow key for your caret to arrive at the beginning of `element`.

#### position = caret.positionFromFocus(element)

With your cursor focused in `element`, returns how many times would you need to press the left-arrow key for your caret to arrive at the beginning of `element`.

#### str = caret.innerText(element)

Returns keyboard-navigable plain text in element.  This is similar to the spec'd native `Node.innerText` method, but differs in that it is specifically returning text your caret can traverse, rather than how the text is rendered on the screen.  This manifests in different behavoir around paragraph tags and newlines, as well as trailing whitespace within each element.

