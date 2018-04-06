'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('atom');

var Range = _require.Range;
var CompositeDisposable = _require.CompositeDisposable;

var _require2 = require('./operator');

var Operator = _require2.Operator;

// Operator which start 'insert-mode'
// -------------------------
// [NOTE]
// Rule: Don't make any text mutation before calling `@selectTarget()`.

var ActivateInsertModeBase = (function (_Operator) {
  _inherits(ActivateInsertModeBase, _Operator);

  function ActivateInsertModeBase() {
    _classCallCheck(this, ActivateInsertModeBase);

    _get(Object.getPrototypeOf(ActivateInsertModeBase.prototype), 'constructor', this).apply(this, arguments);

    this.flashTarget = false;
    this.supportInsertionCount = true;
  }

  _createClass(ActivateInsertModeBase, [{
    key: 'getChangeSinceCheckpoint',

    // When each mutaion's extent is not intersecting, muitiple changes are recorded
    // e.g
    //  - Multicursors edit
    //  - Cursor moved in insert-mode(e.g ctrl-f, ctrl-b)
    // But I don't care multiple changes just because I'm lazy(so not perfect implementation).
    // I only take care of one change happened at earliest(topCursor's change) position.
    // Thats' why I save topCursor's position to @topCursorPositionAtInsertionStart to compare traversal to deletionStart
    // Why I use topCursor's change? Just because it's easy to use first change returned by getChangeSinceCheckpoint().
    value: function getChangeSinceCheckpoint(purpose) {
      var checkpoint = this.getBufferCheckpoint(purpose);
      return this.editor.buffer.getChangesSinceCheckpoint(checkpoint)[0];
    }

    // [BUG-BUT-OK] Replaying text-deletion-operation is not compatible to pure Vim.
    // Pure Vim record all operation in insert-mode as keystroke level and can distinguish
    // character deleted by `Delete` or by `ctrl-u`.
    // But I can not and don't trying to minic this level of compatibility.
    // So basically deletion-done-in-one is expected to work well.
  }, {
    key: 'replayLastChange',
    value: function replayLastChange(selection) {
      var textToInsert = undefined;
      if (this.lastChange != null) {
        var _lastChange = this.lastChange;
        var start = _lastChange.start;
        var oldExtent = _lastChange.oldExtent;
        var newText = _lastChange.newText;

        if (!oldExtent.isZero()) {
          var traversalToStartOfDelete = start.traversalFrom(this.topCursorPositionAtInsertionStart);
          var deletionStart = selection.cursor.getBufferPosition().traverse(traversalToStartOfDelete);
          var deletionEnd = deletionStart.traverse(oldExtent);
          selection.setBufferRange([deletionStart, deletionEnd]);
        }
        textToInsert = newText;
      } else {
        textToInsert = '';
      }
      selection.insertText(textToInsert, { autoIndent: true });
    }

    // called when repeated
    // [FIXME] to use replayLastChange in repeatInsert overriding subclasss.
  }, {
    key: 'repeatInsert',
    value: function repeatInsert(selection, text) {
      this.replayLastChange(selection);
    }
  }, {
    key: 'disposeReplaceMode',
    value: function disposeReplaceMode() {
      if (this.vimState.replaceModeDisposable) {
        this.vimState.replaceModeDisposable.dispose();
        this.vimState.replaceModeDisposable = null;
      }
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      this.disposeReplaceMode();
      _get(Object.getPrototypeOf(ActivateInsertModeBase.prototype), 'initialize', this).call(this);
    }
  }, {
    key: 'execute',
    value: function execute() {
      if (this.repeated) this.flashTarget = this.trackChange = true;

      this.preSelect();

      if (this.selectTarget() || this.target.wise !== 'linewise') {
        if (this.mutateText) this.mutateText();

        if (this.repeated) {
          for (var selection of this.editor.getSelections()) {
            var textToInsert = this.lastChange && this.lastChange.newText || '';
            this.repeatInsert(selection, textToInsert);
            this.utils.moveCursorLeft(selection.cursor);
          }
          this.mutationManager.setCheckpoint('did-finish');
          this.groupChangesSinceBufferCheckpoint('undo');
          this.emitDidFinishMutation();
          if (this.getConfig('clearMultipleCursorsOnEscapeInsertMode')) this.vimState.clearSelections();
        } else {
          if (this.mode !== 'insert') {
            this.initializeInsertMode();
          }

          if (this.name === 'ActivateReplaceMode') {
            this.activateMode('insert', 'replace');
          } else {
            this.activateMode('insert');
          }
        }
      } else {
        this.activateMode('normal');
      }
    }
  }, {
    key: 'initializeInsertMode',
    value: function initializeInsertMode() {
      var _this = this;

      // Avoid freezing by acccidental big count(e.g. `5555555555555i`), See #560, #596
      var insertionCount = this.supportInsertionCount ? this.limitNumber(this.getCount() - 1, { max: 100 }) : 0;

      var textByOperator = '';
      if (insertionCount > 0) {
        var change = this.getChangeSinceCheckpoint('undo');
        textByOperator = change && change.newText || '';
      }

      this.createBufferCheckpoint('insert');
      var topCursor = this.editor.getCursorsOrderedByBufferPosition()[0];
      this.topCursorPositionAtInsertionStart = topCursor.getBufferPosition();

      // Skip normalization of blockwiseSelection.
      // Since want to keep multi-cursor and it's position in when shift to insert-mode.
      for (var blockwiseSelection of this.getBlockwiseSelections()) {
        blockwiseSelection.skipNormalization();
      }

      var insertModeDisposable = this.vimState.preemptWillDeactivateMode(function (_ref) {
        var mode = _ref.mode;

        if (mode !== 'insert') {
          return;
        }
        insertModeDisposable.dispose();
        _this.disposeReplaceMode();

        _this.vimState.mark.set('^', _this.editor.getCursorBufferPosition()); // Last insert-mode position
        var textByUserInput = '';
        var change = _this.getChangeSinceCheckpoint('insert');
        if (change) {
          _this.lastChange = change;
          _this.setMarkForChange(new Range(change.start, change.start.traverse(change.newExtent)));
          textByUserInput = change.newText;
        }
        _this.vimState.register.set('.', { text: textByUserInput }); // Last inserted text

        while (insertionCount) {
          insertionCount--;
          for (var selection of _this.editor.getSelections()) {
            selection.insertText(textByOperator + textByUserInput, { autoIndent: true });
          }
        }

        // This cursor state is restored on undo.
        // So cursor state has to be updated before next groupChangesSinceCheckpoint()
        if (_this.getConfig('clearMultipleCursorsOnEscapeInsertMode')) _this.vimState.clearSelections();

        // grouping changes for undo checkpoint need to come last
        _this.groupChangesSinceBufferCheckpoint('undo');

        var preventIncorrectWrap = _this.editor.hasAtomicSoftTabs();
        for (var cursor of _this.editor.getCursors()) {
          _this.utils.moveCursorLeft(cursor, { preventIncorrectWrap: preventIncorrectWrap });
        }
      });
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return ActivateInsertModeBase;
})(Operator);

var ActivateInsertMode = (function (_ActivateInsertModeBase) {
  _inherits(ActivateInsertMode, _ActivateInsertModeBase);

  function ActivateInsertMode() {
    _classCallCheck(this, ActivateInsertMode);

    _get(Object.getPrototypeOf(ActivateInsertMode.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'Empty';
    this.acceptPresetOccurrence = false;
    this.acceptPersistentSelection = false;
  }

  return ActivateInsertMode;
})(ActivateInsertModeBase);

var ActivateReplaceMode = (function (_ActivateInsertMode) {
  _inherits(ActivateReplaceMode, _ActivateInsertMode);

  function ActivateReplaceMode() {
    _classCallCheck(this, ActivateReplaceMode);

    _get(Object.getPrototypeOf(ActivateReplaceMode.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ActivateReplaceMode, [{
    key: 'initialize',
    value: function initialize() {
      var _this2 = this;

      _get(Object.getPrototypeOf(ActivateReplaceMode.prototype), 'initialize', this).call(this);

      var replacedCharsBySelection = new WeakMap();
      this.vimState.replaceModeDisposable = new CompositeDisposable(this.editor.onWillInsertText(function (_ref2) {
        var _ref2$text = _ref2.text;
        var text = _ref2$text === undefined ? '' : _ref2$text;
        var cancel = _ref2.cancel;

        cancel();
        for (var selection of _this2.editor.getSelections()) {
          for (var char of text.split('')) {
            if (char !== '\n' && !selection.cursor.isAtEndOfLine()) selection.selectRight();
            if (!replacedCharsBySelection.has(selection)) replacedCharsBySelection.set(selection, []);
            replacedCharsBySelection.get(selection).push(selection.getText());
            selection.insertText(char);
          }
        }
      }), atom.commands.add(this.editorElement, 'core:backspace', function (event) {
        event.stopImmediatePropagation();
        for (var selection of _this2.editor.getSelections()) {
          var chars = replacedCharsBySelection.get(selection);
          if (chars && chars.length) {
            selection.selectLeft();
            if (!selection.insertText(chars.pop()).isEmpty()) selection.cursor.moveLeft();
          }
        }
      }));
    }
  }, {
    key: 'repeatInsert',
    value: function repeatInsert(selection, text) {
      for (var char of text) {
        if (char === '\n') continue;
        if (selection.cursor.isAtEndOfLine()) break;
        selection.selectRight();
      }
      selection.insertText(text, { autoIndent: false });
    }
  }]);

  return ActivateReplaceMode;
})(ActivateInsertMode);

var InsertAfter = (function (_ActivateInsertMode2) {
  _inherits(InsertAfter, _ActivateInsertMode2);

  function InsertAfter() {
    _classCallCheck(this, InsertAfter);

    _get(Object.getPrototypeOf(InsertAfter.prototype), 'constructor', this).apply(this, arguments);
  }

  // key: 'g I' in all mode

  _createClass(InsertAfter, [{
    key: 'execute',
    value: function execute() {
      for (var cursor of this.editor.getCursors()) {
        this.utils.moveCursorRight(cursor);
      }
      _get(Object.getPrototypeOf(InsertAfter.prototype), 'execute', this).call(this);
    }
  }]);

  return InsertAfter;
})(ActivateInsertMode);

var InsertAtBeginningOfLine = (function (_ActivateInsertMode3) {
  _inherits(InsertAtBeginningOfLine, _ActivateInsertMode3);

  function InsertAtBeginningOfLine() {
    _classCallCheck(this, InsertAtBeginningOfLine);

    _get(Object.getPrototypeOf(InsertAtBeginningOfLine.prototype), 'constructor', this).apply(this, arguments);
  }

  // key: normal 'A'

  _createClass(InsertAtBeginningOfLine, [{
    key: 'execute',
    value: function execute() {
      if (this.mode === 'visual' && this.submode !== 'blockwise') {
        this.editor.splitSelectionsIntoLines();
      }
      for (var blockwiseSelection of this.getBlockwiseSelections()) {
        blockwiseSelection.skipNormalization();
      }
      this.editor.moveToBeginningOfLine();
      _get(Object.getPrototypeOf(InsertAtBeginningOfLine.prototype), 'execute', this).call(this);
    }
  }]);

  return InsertAtBeginningOfLine;
})(ActivateInsertMode);

var InsertAfterEndOfLine = (function (_ActivateInsertMode4) {
  _inherits(InsertAfterEndOfLine, _ActivateInsertMode4);

  function InsertAfterEndOfLine() {
    _classCallCheck(this, InsertAfterEndOfLine);

    _get(Object.getPrototypeOf(InsertAfterEndOfLine.prototype), 'constructor', this).apply(this, arguments);
  }

  // key: normal 'I'

  _createClass(InsertAfterEndOfLine, [{
    key: 'execute',
    value: function execute() {
      this.editor.moveToEndOfLine();
      _get(Object.getPrototypeOf(InsertAfterEndOfLine.prototype), 'execute', this).call(this);
    }
  }]);

  return InsertAfterEndOfLine;
})(ActivateInsertMode);

var InsertAtFirstCharacterOfLine = (function (_ActivateInsertMode5) {
  _inherits(InsertAtFirstCharacterOfLine, _ActivateInsertMode5);

  function InsertAtFirstCharacterOfLine() {
    _classCallCheck(this, InsertAtFirstCharacterOfLine);

    _get(Object.getPrototypeOf(InsertAtFirstCharacterOfLine.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(InsertAtFirstCharacterOfLine, [{
    key: 'execute',
    value: function execute() {
      for (var cursor of this.editor.getCursors()) {
        this.utils.moveCursorToFirstCharacterAtRow(cursor, cursor.getBufferRow());
      }
      _get(Object.getPrototypeOf(InsertAtFirstCharacterOfLine.prototype), 'execute', this).call(this);
    }
  }]);

  return InsertAtFirstCharacterOfLine;
})(ActivateInsertMode);

var InsertAtLastInsert = (function (_ActivateInsertMode6) {
  _inherits(InsertAtLastInsert, _ActivateInsertMode6);

  function InsertAtLastInsert() {
    _classCallCheck(this, InsertAtLastInsert);

    _get(Object.getPrototypeOf(InsertAtLastInsert.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(InsertAtLastInsert, [{
    key: 'execute',
    value: function execute() {
      var point = this.vimState.mark.get('^');
      if (point) {
        this.editor.setCursorBufferPosition(point);
        this.editor.scrollToCursorPosition({ center: true });
      }
      _get(Object.getPrototypeOf(InsertAtLastInsert.prototype), 'execute', this).call(this);
    }
  }]);

  return InsertAtLastInsert;
})(ActivateInsertMode);

var InsertAboveWithNewline = (function (_ActivateInsertMode7) {
  _inherits(InsertAboveWithNewline, _ActivateInsertMode7);

  function InsertAboveWithNewline() {
    _classCallCheck(this, InsertAboveWithNewline);

    _get(Object.getPrototypeOf(InsertAboveWithNewline.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(InsertAboveWithNewline, [{
    key: 'initialize',
    value: function initialize() {
      this.originalCursorPositionMarker = this.editor.markBufferPosition(this.editor.getCursorBufferPosition());
      _get(Object.getPrototypeOf(InsertAboveWithNewline.prototype), 'initialize', this).call(this);
    }

    // This is for `o` and `O` operator.
    // On undo/redo put cursor at original point where user type `o` or `O`.
  }, {
    key: 'groupChangesSinceBufferCheckpoint',
    value: function groupChangesSinceBufferCheckpoint(purpose) {
      if (this.repeated) {
        _get(Object.getPrototypeOf(InsertAboveWithNewline.prototype), 'groupChangesSinceBufferCheckpoint', this).call(this, purpose);
        return;
      }

      var lastCursor = this.editor.getLastCursor();
      var cursorPosition = lastCursor.getBufferPosition();
      lastCursor.setBufferPosition(this.originalCursorPositionMarker.getHeadBufferPosition());
      this.originalCursorPositionMarker.destroy();
      this.originalCursorPositionMarker = null;

      if (this.getConfig('groupChangesWhenLeavingInsertMode')) {
        _get(Object.getPrototypeOf(InsertAboveWithNewline.prototype), 'groupChangesSinceBufferCheckpoint', this).call(this, purpose);
      }
      lastCursor.setBufferPosition(cursorPosition);
    }
  }, {
    key: 'autoIndentEmptyRows',
    value: function autoIndentEmptyRows() {
      for (var cursor of this.editor.getCursors()) {
        var row = cursor.getBufferRow();
        if (this.isEmptyRow(row)) this.editor.autoIndentBufferRow(row);
      }
    }
  }, {
    key: 'mutateText',
    value: function mutateText() {
      this.editor.insertNewlineAbove();
      if (this.editor.autoIndent) this.autoIndentEmptyRows();
    }
  }, {
    key: 'repeatInsert',
    value: function repeatInsert(selection, text) {
      selection.insertText(text.trimLeft(), { autoIndent: true });
    }
  }]);

  return InsertAboveWithNewline;
})(ActivateInsertMode);

var InsertBelowWithNewline = (function (_InsertAboveWithNewline) {
  _inherits(InsertBelowWithNewline, _InsertAboveWithNewline);

  function InsertBelowWithNewline() {
    _classCallCheck(this, InsertBelowWithNewline);

    _get(Object.getPrototypeOf(InsertBelowWithNewline.prototype), 'constructor', this).apply(this, arguments);
  }

  // Advanced Insertion
  // -------------------------

  _createClass(InsertBelowWithNewline, [{
    key: 'mutateText',
    value: function mutateText() {
      for (var cursor of this.editor.getCursors()) {
        this.utils.setBufferRow(cursor, this.getFoldEndRowForRow(cursor.getBufferRow()));
      }

      this.editor.insertNewlineBelow();
      if (this.editor.autoIndent) this.autoIndentEmptyRows();
    }
  }]);

  return InsertBelowWithNewline;
})(InsertAboveWithNewline);

var InsertByTarget = (function (_ActivateInsertModeBase2) {
  _inherits(InsertByTarget, _ActivateInsertModeBase2);

  function InsertByTarget() {
    _classCallCheck(this, InsertByTarget);

    _get(Object.getPrototypeOf(InsertByTarget.prototype), 'constructor', this).apply(this, arguments);

    this.which = null;
  }

  // key: 'I', Used in 'visual-mode.characterwise', visual-mode.blockwise

  _createClass(InsertByTarget, [{
    key: 'initialize',
    // one of ['start', 'end', 'head', 'tail']

    value: function initialize() {
      // HACK
      // When g i is mapped to `insert-at-start-of-target`.
      // `g i 3 l` start insert at 3 column right position.
      // In this case, we don't want repeat insertion 3 times.
      // This @getCount() call cache number at the timing BEFORE '3' is specified.
      this.getCount();
      _get(Object.getPrototypeOf(InsertByTarget.prototype), 'initialize', this).call(this);
    }
  }, {
    key: 'execute',
    value: function execute() {
      var _this3 = this;

      this.onDidSelectTarget(function () {
        // In vC/vL, when occurrence marker was NOT selected,
        // it behave's very specially
        // vC: `I` and `A` behaves as shoft hand of `ctrl-v I` and `ctrl-v A`.
        // vL: `I` and `A` place cursors at each selected lines of start( or end ) of non-white-space char.
        if (!_this3.occurrenceSelected && _this3.mode === 'visual' && _this3.submode !== 'blockwise') {
          for (var $selection of _this3.swrap.getSelections(_this3.editor)) {
            $selection.normalize();
            $selection.applyWise('blockwise');
          }

          if (_this3.submode === 'linewise') {
            for (var blockwiseSelection of _this3.getBlockwiseSelections()) {
              blockwiseSelection.expandMemberSelectionsOverLineWithTrimRange();
            }
          }
        }

        for (var $selection of _this3.swrap.getSelections(_this3.editor)) {
          $selection.setBufferPositionTo(_this3.which);
        }
      });
      _get(Object.getPrototypeOf(InsertByTarget.prototype), 'execute', this).call(this);
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return InsertByTarget;
})(ActivateInsertModeBase);

var InsertAtStartOfTarget = (function (_InsertByTarget) {
  _inherits(InsertAtStartOfTarget, _InsertByTarget);

  function InsertAtStartOfTarget() {
    _classCallCheck(this, InsertAtStartOfTarget);

    _get(Object.getPrototypeOf(InsertAtStartOfTarget.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'start';
  }

  // key: 'A', Used in 'visual-mode.characterwise', 'visual-mode.blockwise'
  return InsertAtStartOfTarget;
})(InsertByTarget);

var InsertAtEndOfTarget = (function (_InsertByTarget2) {
  _inherits(InsertAtEndOfTarget, _InsertByTarget2);

  function InsertAtEndOfTarget() {
    _classCallCheck(this, InsertAtEndOfTarget);

    _get(Object.getPrototypeOf(InsertAtEndOfTarget.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'end';
  }

  return InsertAtEndOfTarget;
})(InsertByTarget);

var InsertAtHeadOfTarget = (function (_InsertByTarget3) {
  _inherits(InsertAtHeadOfTarget, _InsertByTarget3);

  function InsertAtHeadOfTarget() {
    _classCallCheck(this, InsertAtHeadOfTarget);

    _get(Object.getPrototypeOf(InsertAtHeadOfTarget.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'head';
  }

  return InsertAtHeadOfTarget;
})(InsertByTarget);

var InsertAtStartOfOccurrence = (function (_InsertAtStartOfTarget) {
  _inherits(InsertAtStartOfOccurrence, _InsertAtStartOfTarget);

  function InsertAtStartOfOccurrence() {
    _classCallCheck(this, InsertAtStartOfOccurrence);

    _get(Object.getPrototypeOf(InsertAtStartOfOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.occurrence = true;
  }

  return InsertAtStartOfOccurrence;
})(InsertAtStartOfTarget);

var InsertAtEndOfOccurrence = (function (_InsertAtEndOfTarget) {
  _inherits(InsertAtEndOfOccurrence, _InsertAtEndOfTarget);

  function InsertAtEndOfOccurrence() {
    _classCallCheck(this, InsertAtEndOfOccurrence);

    _get(Object.getPrototypeOf(InsertAtEndOfOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.occurrence = true;
  }

  return InsertAtEndOfOccurrence;
})(InsertAtEndOfTarget);

var InsertAtHeadOfOccurrence = (function (_InsertAtHeadOfTarget) {
  _inherits(InsertAtHeadOfOccurrence, _InsertAtHeadOfTarget);

  function InsertAtHeadOfOccurrence() {
    _classCallCheck(this, InsertAtHeadOfOccurrence);

    _get(Object.getPrototypeOf(InsertAtHeadOfOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.occurrence = true;
  }

  return InsertAtHeadOfOccurrence;
})(InsertAtHeadOfTarget);

var InsertAtStartOfSubwordOccurrence = (function (_InsertAtStartOfOccurrence) {
  _inherits(InsertAtStartOfSubwordOccurrence, _InsertAtStartOfOccurrence);

  function InsertAtStartOfSubwordOccurrence() {
    _classCallCheck(this, InsertAtStartOfSubwordOccurrence);

    _get(Object.getPrototypeOf(InsertAtStartOfSubwordOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.occurrenceType = 'subword';
  }

  return InsertAtStartOfSubwordOccurrence;
})(InsertAtStartOfOccurrence);

var InsertAtEndOfSubwordOccurrence = (function (_InsertAtEndOfOccurrence) {
  _inherits(InsertAtEndOfSubwordOccurrence, _InsertAtEndOfOccurrence);

  function InsertAtEndOfSubwordOccurrence() {
    _classCallCheck(this, InsertAtEndOfSubwordOccurrence);

    _get(Object.getPrototypeOf(InsertAtEndOfSubwordOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.occurrenceType = 'subword';
  }

  return InsertAtEndOfSubwordOccurrence;
})(InsertAtEndOfOccurrence);

var InsertAtHeadOfSubwordOccurrence = (function (_InsertAtHeadOfOccurrence) {
  _inherits(InsertAtHeadOfSubwordOccurrence, _InsertAtHeadOfOccurrence);

  function InsertAtHeadOfSubwordOccurrence() {
    _classCallCheck(this, InsertAtHeadOfSubwordOccurrence);

    _get(Object.getPrototypeOf(InsertAtHeadOfSubwordOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.occurrenceType = 'subword';
  }

  return InsertAtHeadOfSubwordOccurrence;
})(InsertAtHeadOfOccurrence);

var InsertAtStartOfSmartWord = (function (_InsertByTarget4) {
  _inherits(InsertAtStartOfSmartWord, _InsertByTarget4);

  function InsertAtStartOfSmartWord() {
    _classCallCheck(this, InsertAtStartOfSmartWord);

    _get(Object.getPrototypeOf(InsertAtStartOfSmartWord.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'start';
    this.target = 'MoveToPreviousSmartWord';
  }

  return InsertAtStartOfSmartWord;
})(InsertByTarget);

var InsertAtEndOfSmartWord = (function (_InsertByTarget5) {
  _inherits(InsertAtEndOfSmartWord, _InsertByTarget5);

  function InsertAtEndOfSmartWord() {
    _classCallCheck(this, InsertAtEndOfSmartWord);

    _get(Object.getPrototypeOf(InsertAtEndOfSmartWord.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'end';
    this.target = 'MoveToEndOfSmartWord';
  }

  return InsertAtEndOfSmartWord;
})(InsertByTarget);

var InsertAtPreviousFoldStart = (function (_InsertByTarget6) {
  _inherits(InsertAtPreviousFoldStart, _InsertByTarget6);

  function InsertAtPreviousFoldStart() {
    _classCallCheck(this, InsertAtPreviousFoldStart);

    _get(Object.getPrototypeOf(InsertAtPreviousFoldStart.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'start';
    this.target = 'MoveToPreviousFoldStart';
  }

  return InsertAtPreviousFoldStart;
})(InsertByTarget);

var InsertAtNextFoldStart = (function (_InsertByTarget7) {
  _inherits(InsertAtNextFoldStart, _InsertByTarget7);

  function InsertAtNextFoldStart() {
    _classCallCheck(this, InsertAtNextFoldStart);

    _get(Object.getPrototypeOf(InsertAtNextFoldStart.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'end';
    this.target = 'MoveToNextFoldStart';
  }

  // -------------------------
  return InsertAtNextFoldStart;
})(InsertByTarget);

var Change = (function (_ActivateInsertModeBase3) {
  _inherits(Change, _ActivateInsertModeBase3);

  function Change() {
    _classCallCheck(this, Change);

    _get(Object.getPrototypeOf(Change.prototype), 'constructor', this).apply(this, arguments);

    this.trackChange = true;
    this.supportInsertionCount = false;
  }

  _createClass(Change, [{
    key: 'mutateText',
    value: function mutateText() {
      // Allways dynamically determine selection wise wthout consulting target.wise
      // Reason: when `c i {`, wise is 'characterwise', but actually selected range is 'linewise'
      //   {
      //     a
      //   }
      var isLinewiseTarget = this.swrap.detectWise(this.editor) === 'linewise';
      for (var selection of this.editor.getSelections()) {
        if (!this.getConfig('dontUpdateRegisterOnChangeOrSubstitute')) {
          this.setTextToRegister(selection.getText(), selection);
        }
        if (isLinewiseTarget) {
          selection.insertText('\n', { autoIndent: true });
          // selection.insertText("", {autoIndent: true})
          selection.cursor.moveLeft();
        } else {
          selection.insertText('', { autoIndent: true });
        }
      }
    }
  }]);

  return Change;
})(ActivateInsertModeBase);

var ChangeOccurrence = (function (_Change) {
  _inherits(ChangeOccurrence, _Change);

  function ChangeOccurrence() {
    _classCallCheck(this, ChangeOccurrence);

    _get(Object.getPrototypeOf(ChangeOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.occurrence = true;
  }

  return ChangeOccurrence;
})(Change);

var ChangeSubwordOccurrence = (function (_ChangeOccurrence) {
  _inherits(ChangeSubwordOccurrence, _ChangeOccurrence);

  function ChangeSubwordOccurrence() {
    _classCallCheck(this, ChangeSubwordOccurrence);

    _get(Object.getPrototypeOf(ChangeSubwordOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.occurrenceType = 'subword';
  }

  return ChangeSubwordOccurrence;
})(ChangeOccurrence);

var Substitute = (function (_Change2) {
  _inherits(Substitute, _Change2);

  function Substitute() {
    _classCallCheck(this, Substitute);

    _get(Object.getPrototypeOf(Substitute.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'MoveRight';
  }

  return Substitute;
})(Change);

var SubstituteLine = (function (_Change3) {
  _inherits(SubstituteLine, _Change3);

  function SubstituteLine() {
    _classCallCheck(this, SubstituteLine);

    _get(Object.getPrototypeOf(SubstituteLine.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.target = 'MoveToRelativeLine';
  }

  // alias
  return SubstituteLine;
})(Change);

var ChangeLine = (function (_SubstituteLine) {
  _inherits(ChangeLine, _SubstituteLine);

  function ChangeLine() {
    _classCallCheck(this, ChangeLine);

    _get(Object.getPrototypeOf(ChangeLine.prototype), 'constructor', this).apply(this, arguments);
  }

  return ChangeLine;
})(SubstituteLine);

var ChangeToLastCharacterOfLine = (function (_Change4) {
  _inherits(ChangeToLastCharacterOfLine, _Change4);

  function ChangeToLastCharacterOfLine() {
    _classCallCheck(this, ChangeToLastCharacterOfLine);

    _get(Object.getPrototypeOf(ChangeToLastCharacterOfLine.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'MoveToLastCharacterOfLine';
  }

  _createClass(ChangeToLastCharacterOfLine, [{
    key: 'execute',
    value: function execute() {
      var _this4 = this;

      this.onDidSelectTarget(function () {
        if (_this4.target.wise === 'blockwise') {
          for (var blockwiseSelection of _this4.getBlockwiseSelections()) {
            blockwiseSelection.extendMemberSelectionsToEndOfLine();
          }
        }
      });
      _get(Object.getPrototypeOf(ChangeToLastCharacterOfLine.prototype), 'execute', this).call(this);
    }
  }]);

  return ChangeToLastCharacterOfLine;
})(Change);

module.exports = {
  ActivateInsertModeBase: ActivateInsertModeBase,
  ActivateInsertMode: ActivateInsertMode,
  ActivateReplaceMode: ActivateReplaceMode,
  InsertAfter: InsertAfter,
  InsertAtBeginningOfLine: InsertAtBeginningOfLine,
  InsertAfterEndOfLine: InsertAfterEndOfLine,
  InsertAtFirstCharacterOfLine: InsertAtFirstCharacterOfLine,
  InsertAtLastInsert: InsertAtLastInsert,
  InsertAboveWithNewline: InsertAboveWithNewline,
  InsertBelowWithNewline: InsertBelowWithNewline,
  InsertByTarget: InsertByTarget,
  InsertAtStartOfTarget: InsertAtStartOfTarget,
  InsertAtEndOfTarget: InsertAtEndOfTarget,
  InsertAtHeadOfTarget: InsertAtHeadOfTarget,
  InsertAtStartOfOccurrence: InsertAtStartOfOccurrence,
  InsertAtEndOfOccurrence: InsertAtEndOfOccurrence,
  InsertAtHeadOfOccurrence: InsertAtHeadOfOccurrence,
  InsertAtStartOfSubwordOccurrence: InsertAtStartOfSubwordOccurrence,
  InsertAtEndOfSubwordOccurrence: InsertAtEndOfSubwordOccurrence,
  InsertAtHeadOfSubwordOccurrence: InsertAtHeadOfSubwordOccurrence,
  InsertAtStartOfSmartWord: InsertAtStartOfSmartWord,
  InsertAtEndOfSmartWord: InsertAtEndOfSmartWord,
  InsertAtPreviousFoldStart: InsertAtPreviousFoldStart,
  InsertAtNextFoldStart: InsertAtNextFoldStart,
  Change: Change,
  ChangeOccurrence: ChangeOccurrence,
  ChangeSubwordOccurrence: ChangeSubwordOccurrence,
  Substitute: Substitute,
  SubstituteLine: SubstituteLine,
  ChangeLine: ChangeLine,
  ChangeToLastCharacterOfLine: ChangeToLastCharacterOfLine
};
// [FIXME] to re-override target.wise in visual-mode
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmRvdGZpbGVzL2F0b20uc3ltbGluay9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vcGVyYXRvci1pbnNlcnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7O2VBRTBCLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQTdDLEtBQUssWUFBTCxLQUFLO0lBQUUsbUJBQW1CLFlBQW5CLG1CQUFtQjs7Z0JBQ2QsT0FBTyxDQUFDLFlBQVksQ0FBQzs7SUFBakMsUUFBUSxhQUFSLFFBQVE7Ozs7Ozs7SUFNVCxzQkFBc0I7WUFBdEIsc0JBQXNCOztXQUF0QixzQkFBc0I7MEJBQXRCLHNCQUFzQjs7K0JBQXRCLHNCQUFzQjs7U0FFMUIsV0FBVyxHQUFHLEtBQUs7U0FDbkIscUJBQXFCLEdBQUcsSUFBSTs7O2VBSHhCLHNCQUFzQjs7Ozs7Ozs7Ozs7V0FhRCxrQ0FBQyxPQUFPLEVBQUU7QUFDakMsVUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3BELGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMseUJBQXlCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDbkU7Ozs7Ozs7OztXQU9nQiwwQkFBQyxTQUFTLEVBQUU7QUFDM0IsVUFBSSxZQUFZLFlBQUEsQ0FBQTtBQUNoQixVQUFJLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxFQUFFOzBCQUNTLElBQUksQ0FBQyxVQUFVO1lBQTVDLEtBQUssZUFBTCxLQUFLO1lBQUUsU0FBUyxlQUFULFNBQVM7WUFBRSxPQUFPLGVBQVAsT0FBTzs7QUFDaEMsWUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtBQUN2QixjQUFNLHdCQUF3QixHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUE7QUFDNUYsY0FB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QXNCLEVBQXRCLHNCQUFzQjtBQUN0QixvQkFBa0IsRUFBbEIsa0JBQWtCO0FBQ2xCLHFCQUFtQixFQUFuQixtQkFBbUI7QUFDbkIsYUFBVyxFQUFYLFdBQVc7QUFDWCx5QkFBdUIsRUFBdkIsdUJBQXVCO0FBQ3ZCLHNCQUFvQixFQUFwQixvQkFBb0I7QUFDcEIsOEJBQTRCLEVBQTVCLDRCQUE0QjtBQUM1QixvQkFBa0IsRUFBbEIsa0JBQWtCO0FBQ2xCLHdCQUFzQixFQUF0QixzQkFBc0I7QUFDdEIsd0JBQXNCLEVBQXRCLHNCQUFzQjtBQUN0QixnQkFBYyxFQUFkLGNBQWM7QUFDZCx1QkFBcUIsRUFBckIscUJBQXFCO0FBQ3JCLHFCQUFtQixFQUFuQixtQkFBbUI7QUFDbkIsc0JBQW9CLEVBQXBCLG9CQUFvQjtBQUNwQiwyQkFBeUIsRUFBekIseUJBQXlCO0FBQ3pCLHlCQUF1QixFQUF2Qix1QkFBdUI7QUFDdkIsMEJBQXdCLEVBQXhCLHdCQUF3QjtBQUN4QixrQ0FBZ0MsRUFBaEMsZ0NBQWdDO0FBQ2hDLGdDQUE4QixFQUE5Qiw4QkFBOEI7QUFDOUIsaUNBQStCLEVBQS9CLCtCQUErQjtBQUMvQiwwQkFBd0IsRUFBeEIsd0JBQXdCO0FBQ3hCLHdCQUFzQixFQUF0QixzQkFBc0I7QUFDdEIsMkJBQXlCLEVBQXpCLHlCQUF5QjtBQUN6Qix1QkFBcUIsRUFBckIscUJBQXFCO0FBQ3JCLFFBQU0sRUFBTixNQUFNO0FBQ04sa0JBQWdCLEVBQWhCLGdCQUFnQjtBQUNoQix5QkFBdUIsRUFBdkIsdUJBQXVCO0FBQ3ZCLFlBQVUsRUFBVixVQUFVO0FBQ1YsZ0JBQWMsRUFBZCxjQUFjO0FBQ2QsWUFBVSxFQUFWLFVBQVU7QUFDViw2QkFBMkIsRUFBM0IsMkJBQTJCO0NBQzVCLENBQUEiLCJmaWxlIjoiL1VzZXJzL3NoYW5ub25iZXJ0dWNjaS8uZG90ZmlsZXMvYXRvbS5zeW1saW5rL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLWluc2VydC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmNvbnN0IHtSYW5nZSwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJylcbmNvbnN0IHtPcGVyYXRvcn0gPSByZXF1aXJlKCcuL29wZXJhdG9yJylcblxuLy8gT3BlcmF0b3Igd2hpY2ggc3RhcnQgJ2luc2VydC1tb2RlJ1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gW05PVEVdXG4vLyBSdWxlOiBEb24ndCBtYWtlIGFueSB0ZXh0IG11dGF0aW9uIGJlZm9yZSBjYWxsaW5nIGBAc2VsZWN0VGFyZ2V0KClgLlxuY2xhc3MgQWN0aXZhdGVJbnNlcnRNb2RlQmFzZSBleHRlbmRzIE9wZXJhdG9yIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBmbGFzaFRhcmdldCA9IGZhbHNlXG4gIHN1cHBvcnRJbnNlcnRpb25Db3VudCA9IHRydWVcblxuICAvLyBXaGVuIGVhY2ggbXV0YWlvbidzIGV4dGVudCBpcyBub3QgaW50ZXJzZWN0aW5nLCBtdWl0aXBsZSBjaGFuZ2VzIGFyZSByZWNvcmRlZFxuICAvLyBlLmdcbiAgLy8gIC0gTXVsdGljdXJzb3JzIGVkaXRcbiAgLy8gIC0gQ3Vyc29yIG1vdmVkIGluIGluc2VydC1tb2RlKGUuZyBjdHJsLWYsIGN0cmwtYilcbiAgLy8gQnV0IEkgZG9uJ3QgY2FyZSBtdWx0aXBsZSBjaGFuZ2VzIGp1c3QgYmVjYXVzZSBJJ20gbGF6eShzbyBub3QgcGVyZmVjdCBpbXBsZW1lbnRhdGlvbikuXG4gIC8vIEkgb25seSB0YWtlIGNhcmUgb2Ygb25lIGNoYW5nZSBoYXBwZW5lZCBhdCBlYXJsaWVzdCh0b3BDdXJzb3IncyBjaGFuZ2UpIHBvc2l0aW9uLlxuICAvLyBUaGF0cycgd2h5IEkgc2F2ZSB0b3BDdXJzb3IncyBwb3NpdGlvbiB0byBAdG9wQ3Vyc29yUG9zaXRpb25BdEluc2VydGlvblN0YXJ0IHRvIGNvbXBhcmUgdHJhdmVyc2FsIHRvIGRlbGV0aW9uU3RhcnRcbiAgLy8gV2h5IEkgdXNlIHRvcEN1cnNvcidzIGNoYW5nZT8gSnVzdCBiZWNhdXNlIGl0J3MgZWFzeSB0byB1c2UgZmlyc3QgY2hhbmdlIHJldHVybmVkIGJ5IGdldENoYW5nZVNpbmNlQ2hlY2twb2ludCgpLlxuICBnZXRDaGFuZ2VTaW5jZUNoZWNrcG9pbnQgKHB1cnBvc2UpIHtcbiAgICBjb25zdCBjaGVja3BvaW50ID0gdGhpcy5nZXRCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpXG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLmJ1ZmZlci5nZXRDaGFuZ2VzU2luY2VDaGVja3BvaW50KGNoZWNrcG9pbnQpWzBdXG4gIH1cblxuICAvLyBbQlVHLUJVVC1PS10gUmVwbGF5aW5nIHRleHQtZGVsZXRpb24tb3BlcmF0aW9uIGlzIG5vdCBjb21wYXRpYmxlIHRvIHB1cmUgVmltLlxuICAvLyBQdXJlIFZpbSByZWNvcmQgYWxsIG9wZXJhdGlvbiBpbiBpbnNlcnQtbW9kZSBhcyBrZXlzdHJva2UgbGV2ZWwgYW5kIGNhbiBkaXN0aW5ndWlzaFxuICAvLyBjaGFyYWN0ZXIgZGVsZXRlZCBieSBgRGVsZXRlYCBvciBieSBgY3RybC11YC5cbiAgLy8gQnV0IEkgY2FuIG5vdCBhbmQgZG9uJ3QgdHJ5aW5nIHRvIG1pbmljIHRoaXMgbGV2ZWwgb2YgY29tcGF0aWJpbGl0eS5cbiAgLy8gU28gYmFzaWNhbGx5IGRlbGV0aW9uLWRvbmUtaW4tb25lIGlzIGV4cGVjdGVkIHRvIHdvcmsgd2VsbC5cbiAgcmVwbGF5TGFzdENoYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgbGV0IHRleHRUb0luc2VydFxuICAgIGlmICh0aGlzLmxhc3RDaGFuZ2UgIT0gbnVsbCkge1xuICAgICAgY29uc3Qge3N0YXJ0LCBvbGRFeHRlbnQsIG5ld1RleHR9ID0gdGhpcy5sYXN0Q2hhbmdlXG4gICAgICBpZiAoIW9sZEV4dGVudC5pc1plcm8oKSkge1xuICAgICAgICBjb25zdCB0cmF2ZXJzYWxUb1N0YXJ0T2ZEZWxldGUgPSBzdGFydC50cmF2ZXJzYWxGcm9tKHRoaXMudG9wQ3Vyc29yUG9zaXRpb25BdEluc2VydGlvblN0YXJ0KVxuICAgICAgICBjb25zdCBkZWxldGlvblN0YXJ0ID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLnRyYXZlcnNlKHRyYXZlcnNhbFRvU3RhcnRPZkRlbGV0ZSlcbiAgICAgICAgY29uc3QgZGVsZXRpb25FbmQgPSBkZWxldGlvblN0YXJ0LnRyYXZlcnNlKG9sZEV4dGVudClcbiAgICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKFtkZWxldGlvblN0YXJ0LCBkZWxldGlvbkVuZF0pXG4gICAgICB9XG4gICAgICB0ZXh0VG9JbnNlcnQgPSBuZXdUZXh0XG4gICAgfSBlbHNlIHtcbiAgICAgIHRleHRUb0luc2VydCA9ICcnXG4gICAgfVxuICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHRUb0luc2VydCwge2F1dG9JbmRlbnQ6IHRydWV9KVxuICB9XG5cbiAgLy8gY2FsbGVkIHdoZW4gcmVwZWF0ZWRcbiAgLy8gW0ZJWE1FXSB0byB1c2UgcmVwbGF5TGFzdENoYW5nZSBpbiByZXBlYXRJbnNlcnQgb3ZlcnJpZGluZyBzdWJjbGFzc3MuXG4gIHJlcGVhdEluc2VydCAoc2VsZWN0aW9uLCB0ZXh0KSB7XG4gICAgdGhpcy5yZXBsYXlMYXN0Q2hhbmdlKHNlbGVjdGlvbilcbiAgfVxuXG4gIGRpc3Bvc2VSZXBsYWNlTW9kZSAoKSB7XG4gICAgaWYgKHRoaXMudmltU3RhdGUucmVwbGFjZU1vZGVEaXNwb3NhYmxlKSB7XG4gICAgICB0aGlzLnZpbVN0YXRlLnJlcGxhY2VNb2RlRGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgIHRoaXMudmltU3RhdGUucmVwbGFjZU1vZGVEaXNwb3NhYmxlID0gbnVsbFxuICAgIH1cbiAgfVxuXG4gIGluaXRpYWxpemUgKCkge1xuICAgIHRoaXMuZGlzcG9zZVJlcGxhY2VNb2RlKClcbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGV4ZWN1dGUgKCkge1xuICAgIGlmICh0aGlzLnJlcGVhdGVkKSB0aGlzLmZsYXNoVGFyZ2V0ID0gdGhpcy50cmFja0NoYW5nZSA9IHRydWVcblxuICAgIHRoaXMucHJlU2VsZWN0KClcblxuICAgIGlmICh0aGlzLnNlbGVjdFRhcmdldCgpIHx8IHRoaXMudGFyZ2V0Lndpc2UgIT09ICdsaW5ld2lzZScpIHtcbiAgICAgIGlmICh0aGlzLm11dGF0ZVRleHQpIHRoaXMubXV0YXRlVGV4dCgpXG5cbiAgICAgIGlmICh0aGlzLnJlcGVhdGVkKSB7XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgICAgIGNvbnN0IHRleHRUb0luc2VydCA9ICh0aGlzLmxhc3RDaGFuZ2UgJiYgdGhpcy5sYXN0Q2hhbmdlLm5ld1RleHQpIHx8ICcnXG4gICAgICAgICAgdGhpcy5yZXBlYXRJbnNlcnQoc2VsZWN0aW9uLCB0ZXh0VG9JbnNlcnQpXG4gICAgICAgICAgdGhpcy51dGlscy5tb3ZlQ3Vyc29yTGVmdChzZWxlY3Rpb24uY3Vyc29yKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMubXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoJ2RpZC1maW5pc2gnKVxuICAgICAgICB0aGlzLmdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludCgndW5kbycpXG4gICAgICAgIHRoaXMuZW1pdERpZEZpbmlzaE11dGF0aW9uKClcbiAgICAgICAgaWYgKHRoaXMuZ2V0Q29uZmlnKCdjbGVhck11bHRpcGxlQ3Vyc29yc09uRXNjYXBlSW5zZXJ0TW9kZScpKSB0aGlzLnZpbVN0YXRlLmNsZWFyU2VsZWN0aW9ucygpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5tb2RlICE9PSAnaW5zZXJ0Jykge1xuICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZUluc2VydE1vZGUoKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubmFtZSA9PT0gJ0FjdGl2YXRlUmVwbGFjZU1vZGUnKSB7XG4gICAgICAgICAgdGhpcy5hY3RpdmF0ZU1vZGUoJ2luc2VydCcsICdyZXBsYWNlJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmFjdGl2YXRlTW9kZSgnaW5zZXJ0JylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFjdGl2YXRlTW9kZSgnbm9ybWFsJylcbiAgICB9XG4gIH1cblxuICBpbml0aWFsaXplSW5zZXJ0TW9kZSAoKSB7XG4gICAgLy8gQXZvaWQgZnJlZXppbmcgYnkgYWNjY2lkZW50YWwgYmlnIGNvdW50KGUuZy4gYDU1NTU1NTU1NTU1NTVpYCksIFNlZSAjNTYwLCAjNTk2XG4gICAgbGV0IGluc2VydGlvbkNvdW50ID0gdGhpcy5zdXBwb3J0SW5zZXJ0aW9uQ291bnQgPyB0aGlzLmxpbWl0TnVtYmVyKHRoaXMuZ2V0Q291bnQoKSAtIDEsIHttYXg6IDEwMH0pIDogMFxuXG4gICAgbGV0IHRleHRCeU9wZXJhdG9yID0gJydcbiAgICBpZiAoaW5zZXJ0aW9uQ291bnQgPiAwKSB7XG4gICAgICBjb25zdCBjaGFuZ2UgPSB0aGlzLmdldENoYW5nZVNpbmNlQ2hlY2twb2ludCgndW5kbycpXG4gICAgICB0ZXh0QnlPcGVyYXRvciA9IChjaGFuZ2UgJiYgY2hhbmdlLm5ld1RleHQpIHx8ICcnXG4gICAgfVxuXG4gICAgdGhpcy5jcmVhdGVCdWZmZXJDaGVja3BvaW50KCdpbnNlcnQnKVxuICAgIGNvbnN0IHRvcEN1cnNvciA9IHRoaXMuZWRpdG9yLmdldEN1cnNvcnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpWzBdXG4gICAgdGhpcy50b3BDdXJzb3JQb3NpdGlvbkF0SW5zZXJ0aW9uU3RhcnQgPSB0b3BDdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgLy8gU2tpcCBub3JtYWxpemF0aW9uIG9mIGJsb2Nrd2lzZVNlbGVjdGlvbi5cbiAgICAvLyBTaW5jZSB3YW50IHRvIGtlZXAgbXVsdGktY3Vyc29yIGFuZCBpdCdzIHBvc2l0aW9uIGluIHdoZW4gc2hpZnQgdG8gaW5zZXJ0LW1vZGUuXG4gICAgZm9yIChjb25zdCBibG9ja3dpc2VTZWxlY3Rpb24gb2YgdGhpcy5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKCkpIHtcbiAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5za2lwTm9ybWFsaXphdGlvbigpXG4gICAgfVxuXG4gICAgY29uc3QgaW5zZXJ0TW9kZURpc3Bvc2FibGUgPSB0aGlzLnZpbVN0YXRlLnByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGUoKHttb2RlfSkgPT4ge1xuICAgICAgaWYgKG1vZGUgIT09ICdpbnNlcnQnKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaW5zZXJ0TW9kZURpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgICB0aGlzLmRpc3Bvc2VSZXBsYWNlTW9kZSgpXG5cbiAgICAgIHRoaXMudmltU3RhdGUubWFyay5zZXQoJ14nLCB0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKSAvLyBMYXN0IGluc2VydC1tb2RlIHBvc2l0aW9uXG4gICAgICBsZXQgdGV4dEJ5VXNlcklucHV0ID0gJydcbiAgICAgIGNvbnN0IGNoYW5nZSA9IHRoaXMuZ2V0Q2hhbmdlU2luY2VDaGVja3BvaW50KCdpbnNlcnQnKVxuICAgICAgaWYgKGNoYW5nZSkge1xuICAgICAgICB0aGlzLmxhc3RDaGFuZ2UgPSBjaGFuZ2VcbiAgICAgICAgdGhpcy5zZXRNYXJrRm9yQ2hhbmdlKG5ldyBSYW5nZShjaGFuZ2Uuc3RhcnQsIGNoYW5nZS5zdGFydC50cmF2ZXJzZShjaGFuZ2UubmV3RXh0ZW50KSkpXG4gICAgICAgIHRleHRCeVVzZXJJbnB1dCA9IGNoYW5nZS5uZXdUZXh0XG4gICAgICB9XG4gICAgICB0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLnNldCgnLicsIHt0ZXh0OiB0ZXh0QnlVc2VySW5wdXR9KSAvLyBMYXN0IGluc2VydGVkIHRleHRcblxuICAgICAgd2hpbGUgKGluc2VydGlvbkNvdW50KSB7XG4gICAgICAgIGluc2VydGlvbkNvdW50LS1cbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dEJ5T3BlcmF0b3IgKyB0ZXh0QnlVc2VySW5wdXQsIHthdXRvSW5kZW50OiB0cnVlfSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGlzIGN1cnNvciBzdGF0ZSBpcyByZXN0b3JlZCBvbiB1bmRvLlxuICAgICAgLy8gU28gY3Vyc29yIHN0YXRlIGhhcyB0byBiZSB1cGRhdGVkIGJlZm9yZSBuZXh0IGdyb3VwQ2hhbmdlc1NpbmNlQ2hlY2twb2ludCgpXG4gICAgICBpZiAodGhpcy5nZXRDb25maWcoJ2NsZWFyTXVsdGlwbGVDdXJzb3JzT25Fc2NhcGVJbnNlcnRNb2RlJykpIHRoaXMudmltU3RhdGUuY2xlYXJTZWxlY3Rpb25zKClcblxuICAgICAgLy8gZ3JvdXBpbmcgY2hhbmdlcyBmb3IgdW5kbyBjaGVja3BvaW50IG5lZWQgdG8gY29tZSBsYXN0XG4gICAgICB0aGlzLmdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludCgndW5kbycpXG5cbiAgICAgIGNvbnN0IHByZXZlbnRJbmNvcnJlY3RXcmFwID0gdGhpcy5lZGl0b3IuaGFzQXRvbWljU29mdFRhYnMoKVxuICAgICAgZm9yIChjb25zdCBjdXJzb3Igb2YgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29ycygpKSB7XG4gICAgICAgIHRoaXMudXRpbHMubW92ZUN1cnNvckxlZnQoY3Vyc29yLCB7cHJldmVudEluY29ycmVjdFdyYXB9KVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuY2xhc3MgQWN0aXZhdGVJbnNlcnRNb2RlIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlQmFzZSB7XG4gIHRhcmdldCA9ICdFbXB0eSdcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSA9IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gPSBmYWxzZVxufVxuXG5jbGFzcyBBY3RpdmF0ZVJlcGxhY2VNb2RlIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlIHtcbiAgaW5pdGlhbGl6ZSAoKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG5cbiAgICBjb25zdCByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb24gPSBuZXcgV2Vha01hcCgpXG4gICAgdGhpcy52aW1TdGF0ZS5yZXBsYWNlTW9kZURpc3Bvc2FibGUgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIHRoaXMuZWRpdG9yLm9uV2lsbEluc2VydFRleHQoKHt0ZXh0ID0gJycsIGNhbmNlbH0pID0+IHtcbiAgICAgICAgY2FuY2VsKClcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBjaGFyIG9mIHRleHQuc3BsaXQoJycpKSB7XG4gICAgICAgICAgICBpZiAoY2hhciAhPT0gJ1xcbicgJiYgIXNlbGVjdGlvbi5jdXJzb3IuaXNBdEVuZE9mTGluZSgpKSBzZWxlY3Rpb24uc2VsZWN0UmlnaHQoKVxuICAgICAgICAgICAgaWYgKCFyZXBsYWNlZENoYXJzQnlTZWxlY3Rpb24uaGFzKHNlbGVjdGlvbikpIHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBbXSlcbiAgICAgICAgICAgIHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKS5wdXNoKHNlbGVjdGlvbi5nZXRUZXh0KCkpXG4gICAgICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dChjaGFyKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSksXG5cbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKHRoaXMuZWRpdG9yRWxlbWVudCwgJ2NvcmU6YmFja3NwYWNlJywgZXZlbnQgPT4ge1xuICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgICBjb25zdCBjaGFycyA9IHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuICAgICAgICAgIGlmIChjaGFycyAmJiBjaGFycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHNlbGVjdGlvbi5zZWxlY3RMZWZ0KClcbiAgICAgICAgICAgIGlmICghc2VsZWN0aW9uLmluc2VydFRleHQoY2hhcnMucG9wKCkpLmlzRW1wdHkoKSkgc2VsZWN0aW9uLmN1cnNvci5tb3ZlTGVmdCgpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIClcbiAgfVxuXG4gIHJlcGVhdEluc2VydCAoc2VsZWN0aW9uLCB0ZXh0KSB7XG4gICAgZm9yIChjb25zdCBjaGFyIG9mIHRleHQpIHtcbiAgICAgIGlmIChjaGFyID09PSAnXFxuJykgY29udGludWVcbiAgICAgIGlmIChzZWxlY3Rpb24uY3Vyc29yLmlzQXRFbmRPZkxpbmUoKSkgYnJlYWtcbiAgICAgIHNlbGVjdGlvbi5zZWxlY3RSaWdodCgpXG4gICAgfVxuICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQsIHthdXRvSW5kZW50OiBmYWxzZX0pXG4gIH1cbn1cblxuY2xhc3MgSW5zZXJ0QWZ0ZXIgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGUge1xuICBleGVjdXRlICgpIHtcbiAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgIHRoaXMudXRpbHMubW92ZUN1cnNvclJpZ2h0KGN1cnNvcilcbiAgICB9XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cblxuLy8ga2V5OiAnZyBJJyBpbiBhbGwgbW9kZVxuY2xhc3MgSW5zZXJ0QXRCZWdpbm5pbmdPZkxpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGUge1xuICBleGVjdXRlICgpIHtcbiAgICBpZiAodGhpcy5tb2RlID09PSAndmlzdWFsJyAmJiB0aGlzLnN1Ym1vZGUgIT09ICdibG9ja3dpc2UnKSB7XG4gICAgICB0aGlzLmVkaXRvci5zcGxpdFNlbGVjdGlvbnNJbnRvTGluZXMoKVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IGJsb2Nrd2lzZVNlbGVjdGlvbiBvZiB0aGlzLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKSkge1xuICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnNraXBOb3JtYWxpemF0aW9uKClcbiAgICB9XG4gICAgdGhpcy5lZGl0b3IubW92ZVRvQmVnaW5uaW5nT2ZMaW5lKClcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuXG4vLyBrZXk6IG5vcm1hbCAnQSdcbmNsYXNzIEluc2VydEFmdGVyRW5kT2ZMaW5lIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlIHtcbiAgZXhlY3V0ZSAoKSB7XG4gICAgdGhpcy5lZGl0b3IubW92ZVRvRW5kT2ZMaW5lKClcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuXG4vLyBrZXk6IG5vcm1hbCAnSSdcbmNsYXNzIEluc2VydEF0Rmlyc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGUge1xuICBleGVjdXRlICgpIHtcbiAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgIHRoaXMudXRpbHMubW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvdyhjdXJzb3IsIGN1cnNvci5nZXRCdWZmZXJSb3coKSlcbiAgICB9XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cblxuY2xhc3MgSW5zZXJ0QXRMYXN0SW5zZXJ0IGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlIHtcbiAgZXhlY3V0ZSAoKSB7XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLnZpbVN0YXRlLm1hcmsuZ2V0KCdeJylcbiAgICBpZiAocG9pbnQpIHtcbiAgICAgIHRoaXMuZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgdGhpcy5lZGl0b3Iuc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbih7Y2VudGVyOiB0cnVlfSlcbiAgICB9XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cblxuY2xhc3MgSW5zZXJ0QWJvdmVXaXRoTmV3bGluZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZSB7XG4gIGluaXRpYWxpemUgKCkge1xuICAgIHRoaXMub3JpZ2luYWxDdXJzb3JQb3NpdGlvbk1hcmtlciA9IHRoaXMuZWRpdG9yLm1hcmtCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgLy8gVGhpcyBpcyBmb3IgYG9gIGFuZCBgT2Agb3BlcmF0b3IuXG4gIC8vIE9uIHVuZG8vcmVkbyBwdXQgY3Vyc29yIGF0IG9yaWdpbmFsIHBvaW50IHdoZXJlIHVzZXIgdHlwZSBgb2Agb3IgYE9gLlxuICBncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQgKHB1cnBvc2UpIHtcbiAgICBpZiAodGhpcy5yZXBlYXRlZCkge1xuICAgICAgc3VwZXIuZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBsYXN0Q3Vyc29yID0gdGhpcy5lZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG4gICAgY29uc3QgY3Vyc29yUG9zaXRpb24gPSBsYXN0Q3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBsYXN0Q3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHRoaXMub3JpZ2luYWxDdXJzb3JQb3NpdGlvbk1hcmtlci5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKSlcbiAgICB0aGlzLm9yaWdpbmFsQ3Vyc29yUG9zaXRpb25NYXJrZXIuZGVzdHJveSgpXG4gICAgdGhpcy5vcmlnaW5hbEN1cnNvclBvc2l0aW9uTWFya2VyID0gbnVsbFxuXG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKCdncm91cENoYW5nZXNXaGVuTGVhdmluZ0luc2VydE1vZGUnKSkge1xuICAgICAgc3VwZXIuZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpXG4gICAgfVxuICAgIGxhc3RDdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oY3Vyc29yUG9zaXRpb24pXG4gIH1cblxuICBhdXRvSW5kZW50RW1wdHlSb3dzICgpIHtcbiAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgIGNvbnN0IHJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgICAgaWYgKHRoaXMuaXNFbXB0eVJvdyhyb3cpKSB0aGlzLmVkaXRvci5hdXRvSW5kZW50QnVmZmVyUm93KHJvdylcbiAgICB9XG4gIH1cblxuICBtdXRhdGVUZXh0ICgpIHtcbiAgICB0aGlzLmVkaXRvci5pbnNlcnROZXdsaW5lQWJvdmUoKVxuICAgIGlmICh0aGlzLmVkaXRvci5hdXRvSW5kZW50KSB0aGlzLmF1dG9JbmRlbnRFbXB0eVJvd3MoKVxuICB9XG5cbiAgcmVwZWF0SW5zZXJ0IChzZWxlY3Rpb24sIHRleHQpIHtcbiAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LnRyaW1MZWZ0KCksIHthdXRvSW5kZW50OiB0cnVlfSlcbiAgfVxufVxuXG5jbGFzcyBJbnNlcnRCZWxvd1dpdGhOZXdsaW5lIGV4dGVuZHMgSW5zZXJ0QWJvdmVXaXRoTmV3bGluZSB7XG4gIG11dGF0ZVRleHQgKCkge1xuICAgIGZvciAoY29uc3QgY3Vyc29yIG9mIHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKSkge1xuICAgICAgdGhpcy51dGlscy5zZXRCdWZmZXJSb3coY3Vyc29yLCB0aGlzLmdldEZvbGRFbmRSb3dGb3JSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKSlcbiAgICB9XG5cbiAgICB0aGlzLmVkaXRvci5pbnNlcnROZXdsaW5lQmVsb3coKVxuICAgIGlmICh0aGlzLmVkaXRvci5hdXRvSW5kZW50KSB0aGlzLmF1dG9JbmRlbnRFbXB0eVJvd3MoKVxuICB9XG59XG5cbi8vIEFkdmFuY2VkIEluc2VydGlvblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgSW5zZXJ0QnlUYXJnZXQgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVCYXNlIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICB3aGljaCA9IG51bGwgLy8gb25lIG9mIFsnc3RhcnQnLCAnZW5kJywgJ2hlYWQnLCAndGFpbCddXG5cbiAgaW5pdGlhbGl6ZSAoKSB7XG4gICAgLy8gSEFDS1xuICAgIC8vIFdoZW4gZyBpIGlzIG1hcHBlZCB0byBgaW5zZXJ0LWF0LXN0YXJ0LW9mLXRhcmdldGAuXG4gICAgLy8gYGcgaSAzIGxgIHN0YXJ0IGluc2VydCBhdCAzIGNvbHVtbiByaWdodCBwb3NpdGlvbi5cbiAgICAvLyBJbiB0aGlzIGNhc2UsIHdlIGRvbid0IHdhbnQgcmVwZWF0IGluc2VydGlvbiAzIHRpbWVzLlxuICAgIC8vIFRoaXMgQGdldENvdW50KCkgY2FsbCBjYWNoZSBudW1iZXIgYXQgdGhlIHRpbWluZyBCRUZPUkUgJzMnIGlzIHNwZWNpZmllZC5cbiAgICB0aGlzLmdldENvdW50KClcbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGV4ZWN1dGUgKCkge1xuICAgIHRoaXMub25EaWRTZWxlY3RUYXJnZXQoKCkgPT4ge1xuICAgICAgLy8gSW4gdkMvdkwsIHdoZW4gb2NjdXJyZW5jZSBtYXJrZXIgd2FzIE5PVCBzZWxlY3RlZCxcbiAgICAgIC8vIGl0IGJlaGF2ZSdzIHZlcnkgc3BlY2lhbGx5XG4gICAgICAvLyB2QzogYElgIGFuZCBgQWAgYmVoYXZlcyBhcyBzaG9mdCBoYW5kIG9mIGBjdHJsLXYgSWAgYW5kIGBjdHJsLXYgQWAuXG4gICAgICAvLyB2TDogYElgIGFuZCBgQWAgcGxhY2UgY3Vyc29ycyBhdCBlYWNoIHNlbGVjdGVkIGxpbmVzIG9mIHN0YXJ0KCBvciBlbmQgKSBvZiBub24td2hpdGUtc3BhY2UgY2hhci5cbiAgICAgIGlmICghdGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgJiYgdGhpcy5tb2RlID09PSAndmlzdWFsJyAmJiB0aGlzLnN1Ym1vZGUgIT09ICdibG9ja3dpc2UnKSB7XG4gICAgICAgIGZvciAoY29uc3QgJHNlbGVjdGlvbiBvZiB0aGlzLnN3cmFwLmdldFNlbGVjdGlvbnModGhpcy5lZGl0b3IpKSB7XG4gICAgICAgICAgJHNlbGVjdGlvbi5ub3JtYWxpemUoKVxuICAgICAgICAgICRzZWxlY3Rpb24uYXBwbHlXaXNlKCdibG9ja3dpc2UnKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc3VibW9kZSA9PT0gJ2xpbmV3aXNlJykge1xuICAgICAgICAgIGZvciAoY29uc3QgYmxvY2t3aXNlU2VsZWN0aW9uIG9mIHRoaXMuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpKSB7XG4gICAgICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uZXhwYW5kTWVtYmVyU2VsZWN0aW9uc092ZXJMaW5lV2l0aFRyaW1SYW5nZSgpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgJHNlbGVjdGlvbiBvZiB0aGlzLnN3cmFwLmdldFNlbGVjdGlvbnModGhpcy5lZGl0b3IpKSB7XG4gICAgICAgICRzZWxlY3Rpb24uc2V0QnVmZmVyUG9zaXRpb25Ubyh0aGlzLndoaWNoKVxuICAgICAgfVxuICAgIH0pXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cblxuLy8ga2V5OiAnSScsIFVzZWQgaW4gJ3Zpc3VhbC1tb2RlLmNoYXJhY3Rlcndpc2UnLCB2aXN1YWwtbW9kZS5ibG9ja3dpc2VcbmNsYXNzIEluc2VydEF0U3RhcnRPZlRhcmdldCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0IHtcbiAgd2hpY2ggPSAnc3RhcnQnXG59XG5cbi8vIGtleTogJ0EnLCBVc2VkIGluICd2aXN1YWwtbW9kZS5jaGFyYWN0ZXJ3aXNlJywgJ3Zpc3VhbC1tb2RlLmJsb2Nrd2lzZSdcbmNsYXNzIEluc2VydEF0RW5kT2ZUYXJnZXQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldCB7XG4gIHdoaWNoID0gJ2VuZCdcbn1cblxuY2xhc3MgSW5zZXJ0QXRIZWFkT2ZUYXJnZXQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldCB7XG4gIHdoaWNoID0gJ2hlYWQnXG59XG5cbmNsYXNzIEluc2VydEF0U3RhcnRPZk9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRBdFN0YXJ0T2ZUYXJnZXQge1xuICBvY2N1cnJlbmNlID0gdHJ1ZVxufVxuXG5jbGFzcyBJbnNlcnRBdEVuZE9mT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEF0RW5kT2ZUYXJnZXQge1xuICBvY2N1cnJlbmNlID0gdHJ1ZVxufVxuXG5jbGFzcyBJbnNlcnRBdEhlYWRPZk9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRBdEhlYWRPZlRhcmdldCB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG59XG5cbmNsYXNzIEluc2VydEF0U3RhcnRPZlN1YndvcmRPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QXRTdGFydE9mT2NjdXJyZW5jZSB7XG4gIG9jY3VycmVuY2VUeXBlID0gJ3N1YndvcmQnXG59XG5cbmNsYXNzIEluc2VydEF0RW5kT2ZTdWJ3b3JkT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEF0RW5kT2ZPY2N1cnJlbmNlIHtcbiAgb2NjdXJyZW5jZVR5cGUgPSAnc3Vid29yZCdcbn1cblxuY2xhc3MgSW5zZXJ0QXRIZWFkT2ZTdWJ3b3JkT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEF0SGVhZE9mT2NjdXJyZW5jZSB7XG4gIG9jY3VycmVuY2VUeXBlID0gJ3N1YndvcmQnXG59XG5cbmNsYXNzIEluc2VydEF0U3RhcnRPZlNtYXJ0V29yZCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0IHtcbiAgd2hpY2ggPSAnc3RhcnQnXG4gIHRhcmdldCA9ICdNb3ZlVG9QcmV2aW91c1NtYXJ0V29yZCdcbn1cblxuY2xhc3MgSW5zZXJ0QXRFbmRPZlNtYXJ0V29yZCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0IHtcbiAgd2hpY2ggPSAnZW5kJ1xuICB0YXJnZXQgPSAnTW92ZVRvRW5kT2ZTbWFydFdvcmQnXG59XG5cbmNsYXNzIEluc2VydEF0UHJldmlvdXNGb2xkU3RhcnQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldCB7XG4gIHdoaWNoID0gJ3N0YXJ0J1xuICB0YXJnZXQgPSAnTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQnXG59XG5cbmNsYXNzIEluc2VydEF0TmV4dEZvbGRTdGFydCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0IHtcbiAgd2hpY2ggPSAnZW5kJ1xuICB0YXJnZXQgPSAnTW92ZVRvTmV4dEZvbGRTdGFydCdcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgQ2hhbmdlIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlQmFzZSB7XG4gIHRyYWNrQ2hhbmdlID0gdHJ1ZVxuICBzdXBwb3J0SW5zZXJ0aW9uQ291bnQgPSBmYWxzZVxuXG4gIG11dGF0ZVRleHQgKCkge1xuICAgIC8vIEFsbHdheXMgZHluYW1pY2FsbHkgZGV0ZXJtaW5lIHNlbGVjdGlvbiB3aXNlIHd0aG91dCBjb25zdWx0aW5nIHRhcmdldC53aXNlXG4gICAgLy8gUmVhc29uOiB3aGVuIGBjIGkge2AsIHdpc2UgaXMgJ2NoYXJhY3Rlcndpc2UnLCBidXQgYWN0dWFsbHkgc2VsZWN0ZWQgcmFuZ2UgaXMgJ2xpbmV3aXNlJ1xuICAgIC8vICAge1xuICAgIC8vICAgICBhXG4gICAgLy8gICB9XG4gICAgY29uc3QgaXNMaW5ld2lzZVRhcmdldCA9IHRoaXMuc3dyYXAuZGV0ZWN0V2lzZSh0aGlzLmVkaXRvcikgPT09ICdsaW5ld2lzZSdcbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIGlmICghdGhpcy5nZXRDb25maWcoJ2RvbnRVcGRhdGVSZWdpc3Rlck9uQ2hhbmdlT3JTdWJzdGl0dXRlJykpIHtcbiAgICAgICAgdGhpcy5zZXRUZXh0VG9SZWdpc3RlcihzZWxlY3Rpb24uZ2V0VGV4dCgpLCBzZWxlY3Rpb24pXG4gICAgICB9XG4gICAgICBpZiAoaXNMaW5ld2lzZVRhcmdldCkge1xuICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCgnXFxuJywge2F1dG9JbmRlbnQ6IHRydWV9KVxuICAgICAgICAvLyBzZWxlY3Rpb24uaW5zZXJ0VGV4dChcIlwiLCB7YXV0b0luZGVudDogdHJ1ZX0pXG4gICAgICAgIHNlbGVjdGlvbi5jdXJzb3IubW92ZUxlZnQoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoJycsIHthdXRvSW5kZW50OiB0cnVlfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgQ2hhbmdlT2NjdXJyZW5jZSBleHRlbmRzIENoYW5nZSB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG59XG5cbmNsYXNzIENoYW5nZVN1YndvcmRPY2N1cnJlbmNlIGV4dGVuZHMgQ2hhbmdlT2NjdXJyZW5jZSB7XG4gIG9jY3VycmVuY2VUeXBlID0gJ3N1YndvcmQnXG59XG5cbmNsYXNzIFN1YnN0aXR1dGUgZXh0ZW5kcyBDaGFuZ2Uge1xuICB0YXJnZXQgPSAnTW92ZVJpZ2h0J1xufVxuXG5jbGFzcyBTdWJzdGl0dXRlTGluZSBleHRlbmRzIENoYW5nZSB7XG4gIHdpc2UgPSAnbGluZXdpc2UnIC8vIFtGSVhNRV0gdG8gcmUtb3ZlcnJpZGUgdGFyZ2V0Lndpc2UgaW4gdmlzdWFsLW1vZGVcbiAgdGFyZ2V0ID0gJ01vdmVUb1JlbGF0aXZlTGluZSdcbn1cblxuLy8gYWxpYXNcbmNsYXNzIENoYW5nZUxpbmUgZXh0ZW5kcyBTdWJzdGl0dXRlTGluZSB7fVxuXG5jbGFzcyBDaGFuZ2VUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBDaGFuZ2Uge1xuICB0YXJnZXQgPSAnTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZSdcblxuICBleGVjdXRlICgpIHtcbiAgICB0aGlzLm9uRGlkU2VsZWN0VGFyZ2V0KCgpID0+IHtcbiAgICAgIGlmICh0aGlzLnRhcmdldC53aXNlID09PSAnYmxvY2t3aXNlJykge1xuICAgICAgICBmb3IgKGNvbnN0IGJsb2Nrd2lzZVNlbGVjdGlvbiBvZiB0aGlzLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKSkge1xuICAgICAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5leHRlbmRNZW1iZXJTZWxlY3Rpb25zVG9FbmRPZkxpbmUoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQWN0aXZhdGVJbnNlcnRNb2RlQmFzZSxcbiAgQWN0aXZhdGVJbnNlcnRNb2RlLFxuICBBY3RpdmF0ZVJlcGxhY2VNb2RlLFxuICBJbnNlcnRBZnRlcixcbiAgSW5zZXJ0QXRCZWdpbm5pbmdPZkxpbmUsXG4gIEluc2VydEFmdGVyRW5kT2ZMaW5lLFxuICBJbnNlcnRBdEZpcnN0Q2hhcmFjdGVyT2ZMaW5lLFxuICBJbnNlcnRBdExhc3RJbnNlcnQsXG4gIEluc2VydEFib3ZlV2l0aE5ld2xpbmUsXG4gIEluc2VydEJlbG93V2l0aE5ld2xpbmUsXG4gIEluc2VydEJ5VGFyZ2V0LFxuICBJbnNlcnRBdFN0YXJ0T2ZUYXJnZXQsXG4gIEluc2VydEF0RW5kT2ZUYXJnZXQsXG4gIEluc2VydEF0SGVhZE9mVGFyZ2V0LFxuICBJbnNlcnRBdFN0YXJ0T2ZPY2N1cnJlbmNlLFxuICBJbnNlcnRBdEVuZE9mT2NjdXJyZW5jZSxcbiAgSW5zZXJ0QXRIZWFkT2ZPY2N1cnJlbmNlLFxuICBJbnNlcnRBdFN0YXJ0T2ZTdWJ3b3JkT2NjdXJyZW5jZSxcbiAgSW5zZXJ0QXRFbmRPZlN1YndvcmRPY2N1cnJlbmNlLFxuICBJbnNlcnRBdEhlYWRPZlN1YndvcmRPY2N1cnJlbmNlLFxuICBJbnNlcnRBdFN0YXJ0T2ZTbWFydFdvcmQsXG4gIEluc2VydEF0RW5kT2ZTbWFydFdvcmQsXG4gIEluc2VydEF0UHJldmlvdXNGb2xkU3RhcnQsXG4gIEluc2VydEF0TmV4dEZvbGRTdGFydCxcbiAgQ2hhbmdlLFxuICBDaGFuZ2VPY2N1cnJlbmNlLFxuICBDaGFuZ2VTdWJ3b3JkT2NjdXJyZW5jZSxcbiAgU3Vic3RpdHV0ZSxcbiAgU3Vic3RpdHV0ZUxpbmUsXG4gIENoYW5nZUxpbmUsXG4gIENoYW5nZVRvTGFzdENoYXJhY3Rlck9mTGluZVxufVxuIl19