import assert from 'assert';
import { suite } from './index.js';

import * as linkedom from 'linkedom';
import caret from '../index.js';

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;


suite('innerText', test => {
  test('single node', () => {
    const el = createElement('<div>abc</div>');
    const text = caret.innerText(el);
    assert.equal(text, 'abc');
  });
  test('spurious br', () => {
    const el = createElement('<div>abc<br></div>');
    const text = caret.innerText(el);
    assert.equal(text, 'abc');
  });
  test('newline via br', () => {
    const el = createElement('<div>abc<br>def</div>');
    const text = caret.innerText(el);
    assert.equal(text, 'abc\ndef');
  });
  test('newline via div', () => {
    const el = createElement('<div><div>abc</div><div>def</div></div>');
    const text = caret.innerText(el);
    assert.equal(text, 'abc\ndef');
  });
  test('leading empty line', () => {
    const el = createElement('<div><div><br></div><div>abc</div></div>');
    const text = caret.innerText(el);
    assert.equal(text, '\nabc');
  });
  test('collapse br div', () => {
    const el = createElement('<div><div>abc<br></div><div>def</div></div>');
    const text = caret.innerText(el);
    assert.equal(text, 'abc\ndef');
  });
  test('collapse just one br div', () => {
    const el = createElement('<div><div>abc<br><br></div><div>def</div></div>');
    const text = caret.innerText(el);
    assert.equal(text, 'abc\n\ndef');
  });
  test('blockquote', () => {
    const el = createElement('<blockquote ld-q=""><code>&gt; </code>abc<br><br></blockquote>');
    const text = caret.innerText(el);
    assert.equal(text, '> abc\n');
  });

});

suite('nodeFromPosition', test => {

  test('text only', () => {
    const el = createElement('<div>abc</div>');
    const [node, pos] = caret.nodeFromPosition(el, 2);
    assert.equal(el.childNodes[0], node);
    assert.equal(node.nodeType, TEXT_NODE);
    assert.equal(node.textContent, 'abc');
    assert.equal(pos, 2);
  });

  test('nested', () => {
    const el = createElement('<div><div>abc</div></div>');
    const [node, pos] = caret.nodeFromPosition(el, 2);
    assert.equal(el.childNodes[0].childNodes[0], node);
    assert.equal(node.nodeType, TEXT_NODE);
    assert.equal(node.textContent, 'abc');
    assert.equal(pos, 2);
  });

  test('line start', () => {
    const el = createElement('<div><div><br></div><div>abc</div></div>');
    const [node, pos] = caret.nodeFromPosition(el, 1);
    assert.equal(node, el.childNodes[1]);
    assert.equal(node.nodeType, ELEMENT_NODE);
    assert.equal(node.textContent, 'abc');
    assert.equal(pos, 0);
  });

});


function createElement(html) {
  const { document } = linkedom.parseHTML('<html></html>');
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.childNodes[0];
}

