const INLINE = 'inline';
const BLOCK = 'block';

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;
const DOCUMENT_POSITION_PRECEDING = 2;

const caret = {
  save(el) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return () => {};

    const backwards =
      selection.anchorNode == selection.focusNode ?
        selection.focusOffset < selection.anchorOffset :
      selection.anchorNode.compareDocumentPosition(selection.focusNode) & DOCUMENT_POSITION_PRECEDING ?
        true : false;

    let spos = this.positionFromFocus(el);
    let epos = spos;

    const restore = (sdelta = 0, edelta) => {
      if (edelta === undefined) edelta = sdelta;
      var [snode, _spos] = this.nodeFromPosition(el, spos + sdelta);
      var [enode, _epos] = this.nodeFromPosition(el, epos + edelta);
      try {
        if (backwards) {
          selection.setBaseAndExtent(enode, _epos, snode, _spos);
        } else {
          selection.setBaseAndExtent(snode, _spos, enode, _epos);
        }
      } catch (e) {
        console.log("ERR", e);
      }
    };
    restore.spos = spos;
    restore.epos = epos;
    restore.backwards = backwards;
    return restore;
  },

  innerTextWalk(el, cb) {
    let ncue = null;

    const _walk = (n) => {
      if (ncue && ncue.tagName == 'BR') {
        cb('\n', ncue);
        ncue = null;
      }
      cb('', n);
      if (n.nodeType == TEXT_NODE) {
        if (!n.textContent.length) return
        cb(n.textContent, n);
      } else if (n.nodeType == ELEMENT_NODE) {
        if (this._block(n) && ncue && ncue.tagName != 'BR') {
          cb('\n', n);
          ncue = null;
        }
        for (const c of n.childNodes) {
          !this._invisible(c) && _walk(c);
        }
        if (n.tagName == 'BR') ncue = n;
      }
      if (this._block(n)) ncue = n;
    }
    _walk(el);
  },

  innerText(el) {
    let text = '';
    this.innerTextWalk(el, str => {
      text += str
    });
    return text;
  },

  positionFromFocus(el) {
    const selection = window.getSelection();
    let { focusNode, focusOffset } = selection;
    return this.positionFromNode(el, focusNode, focusOffset);
  },

  positionFromNode(el, targetNode, targetOffset) {

    let text = '';
    let offsetCount = 0;
    let ret = null;

    this.innerTextWalk(el, (str, node) => {
      if (ret !== null) return;
      text += str;
      if (targetNode.nodeType == ELEMENT_NODE && node.parentNode == targetNode) {
        if (offsetCount++ == targetOffset) {
          ret = text.length + (node.tagName == 'BR' && node != node.parentNode.lastElementChild ? 1 : 0);
        }
      } else if (targetNode.nodeType == TEXT_NODE && node == targetNode) {
        ret = text.length + targetOffset;
      }
    });

    return ret ?? text.length;
  },

  nodeFromPosition(el, pos) {

    let text = '';
    let ret = null;

    this.innerTextWalk(el, (str, node) => {
      if (ret !== null) return;
      if (text.length + str.length >= pos) {
        // newline adjustment because lone br tags in divs are /special/
        const nadj = str == '\n' ? -1 : 0;
        ret = ret ?? [node, pos - text.length + nadj];
      }
      text += str;
    });

    return ret;
  },

  _invisible(el) {
    if (el.nodeType !== ELEMENT_NODE) return false;
    if (typeof window === 'undefined') {
      return false;
    }
    const computedStyle = getComputedStyle(el);
    if (computedStyle.display == 'none') return true;
    return false;
  },

  _block(el) {
    if (el.nodeType !== ELEMENT_NODE) return false;
    if (typeof window === 'undefined') {
      return el.tagName == 'DIV';
    }
    const display = window.getComputedStyle(el).display;
    if (['block', 'list-item', 'flex'].includes(display)) {
      return true;
    }
  },

}

export default caret;
