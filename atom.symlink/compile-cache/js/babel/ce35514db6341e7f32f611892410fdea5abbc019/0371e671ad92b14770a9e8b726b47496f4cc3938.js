'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('atom');

var Point = _require.Point;
var Range = _require.Range;

var Base = require('./base');

var Motion = (function (_Base) {
  _inherits(Motion, _Base);

  function Motion() {
    _classCallCheck(this, Motion);

    _get(Object.getPrototypeOf(Motion.prototype), 'constructor', this).apply(this, arguments);

    this.operator = null;
    this.inclusive = false;
    this.wise = 'characterwise';
    this.jump = false;
    this.verticalMotion = false;
    this.moveSucceeded = null;
    this.moveSuccessOnLinewise = false;
    this.selectSucceeded = false;
    this.requireInput = false;
    this.caseSensitivityKind = null;
  }

  // Used as operator's target in visual-mode.

  _createClass(Motion, [{
    key: 'isReady',
    value: function isReady() {
      return !this.requireInput || this.input != null;
    }
  }, {
    key: 'isLinewise',
    value: function isLinewise() {
      return this.wise === 'linewise';
    }
  }, {
    key: 'isBlockwise',
    value: function isBlockwise() {
      return this.wise === 'blockwise';
    }
  }, {
    key: 'forceWise',
    value: function forceWise(wise) {
      if (wise === 'characterwise') {
        this.inclusive = this.wise === 'linewise' ? false : !this.inclusive;
      }
      this.wise = wise;
    }
  }, {
    key: 'resetState',
    value: function resetState() {
      this.selectSucceeded = false;
    }
  }, {
    key: 'moveWithSaveJump',
    value: function moveWithSaveJump(cursor) {
      var originalPosition = this.jump && cursor.isLastCursor() ? cursor.getBufferPosition() : undefined;

      this.moveCursor(cursor);

      if (originalPosition && !cursor.getBufferPosition().isEqual(originalPosition)) {
        this.vimState.mark.set('`', originalPosition);
        this.vimState.mark.set("'", originalPosition);
      }
    }
  }, {
    key: 'execute',
    value: function execute() {
      if (this.operator) {
        this.select();
      } else {
        for (var cursor of this.editor.getCursors()) {
          this.moveWithSaveJump(cursor);
        }
      }
      this.editor.mergeCursors();
      this.editor.mergeIntersectingSelections();
    }

    // NOTE: selection is already "normalized" before this function is called.
  }, {
    key: 'select',
    value: function select() {
      var _this = this;

      // need to care was visual for `.` repeated.
      var isOrWasVisual = this.operator['instanceof']('SelectBase') || this.name === 'CurrentSelection';

      var _loop = function (selection) {
        selection.modifySelection(function () {
          return _this.moveWithSaveJump(selection.cursor);
        });

        var selectSucceeded = _this.moveSucceeded != null ? _this.moveSucceeded : !selection.isEmpty() || _this.isLinewise() && _this.moveSuccessOnLinewise;
        if (!_this.selectSucceeded) _this.selectSucceeded = selectSucceeded;

        if (isOrWasVisual || selectSucceeded && (_this.inclusive || _this.isLinewise())) {
          var $selection = _this.swrap(selection);
          $selection.saveProperties(true); // save property of "already-normalized-selection"
          $selection.applyWise(_this.wise);
        }
      };

      for (var selection of this.editor.getSelections()) {
        _loop(selection);
      }

      if (this.wise === 'blockwise') {
        this.vimState.getLastBlockwiseSelection().autoscroll();
      }
    }
  }, {
    key: 'setCursorBufferRow',
    value: function setCursorBufferRow(cursor, row, options) {
      if (this.verticalMotion && !this.getConfig('stayOnVerticalMotion')) {
        cursor.setBufferPosition(this.getFirstCharacterPositionForBufferRow(row), options);
      } else {
        this.utils.setBufferRow(cursor, row, options);
      }
    }

    // Call callback count times.
    // But break iteration when cursor position did not change before/after callback.
  }, {
    key: 'moveCursorCountTimes',
    value: function moveCursorCountTimes(cursor, fn) {
      var oldPosition = cursor.getBufferPosition();
      this.countTimes(this.getCount(), function (state) {
        fn(state);
        var newPosition = cursor.getBufferPosition();
        if (newPosition.isEqual(oldPosition)) state.stop();
        oldPosition = newPosition;
      });
    }
  }, {
    key: 'isCaseSensitive',
    value: function isCaseSensitive(term) {
      if (this.getConfig('useSmartcaseFor' + this.caseSensitivityKind)) {
        return term.search(/[A-Z]/) !== -1;
      } else {
        return !this.getConfig('ignoreCaseFor' + this.caseSensitivityKind);
      }
    }
  }, {
    key: 'getLastResortPoint',
    value: function getLastResortPoint(direction) {
      if (direction === 'next') {
        return this.getVimEofBufferPosition();
      } else {
        return new Point(0, 0);
      }
    }
  }], [{
    key: 'operationKind',
    value: 'motion',
    enumerable: true
  }, {
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return Motion;
})(Base);

var CurrentSelection = (function (_Motion) {
  _inherits(CurrentSelection, _Motion);

  function CurrentSelection() {
    _classCallCheck(this, CurrentSelection);

    _get(Object.getPrototypeOf(CurrentSelection.prototype), 'constructor', this).apply(this, arguments);

    this.selectionExtent = null;
    this.blockwiseSelectionExtent = null;
    this.inclusive = true;
    this.pointInfoByCursor = new Map();
  }

  _createClass(CurrentSelection, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      if (this.mode === 'visual') {
        this.selectionExtent = this.isBlockwise() ? this.swrap(cursor.selection).getBlockwiseSelectionExtent() : this.editor.getSelectedBufferRange().getExtent();
      } else {
        // `.` repeat case
        cursor.setBufferPosition(cursor.getBufferPosition().translate(this.selectionExtent));
      }
    }
  }, {
    key: 'select',
    value: function select() {
      var _this2 = this;

      if (this.mode === 'visual') {
        _get(Object.getPrototypeOf(CurrentSelection.prototype), 'select', this).call(this);
      } else {
        for (var cursor of this.editor.getCursors()) {
          var pointInfo = this.pointInfoByCursor.get(cursor);
          if (pointInfo) {
            var cursorPosition = pointInfo.cursorPosition;
            var startOfSelection = pointInfo.startOfSelection;

            if (cursorPosition.isEqual(cursor.getBufferPosition())) {
              cursor.setBufferPosition(startOfSelection);
            }
          }
        }
        _get(Object.getPrototypeOf(CurrentSelection.prototype), 'select', this).call(this);
      }

      // * Purpose of pointInfoByCursor? see #235 for detail.
      // When stayOnTransformString is enabled, cursor pos is not set on start of
      // of selected range.
      // But I want following behavior, so need to preserve position info.
      //  1. `vj>.` -> indent same two rows regardless of current cursor's row.
      //  2. `vj>j.` -> indent two rows from cursor's row.

      var _loop2 = function (cursor) {
        var startOfSelection = cursor.selection.getBufferRange().start;
        _this2.onDidFinishOperation(function () {
          var cursorPosition = cursor.getBufferPosition();
          _this2.pointInfoByCursor.set(cursor, { startOfSelection: startOfSelection, cursorPosition: cursorPosition });
        });
      };

      for (var cursor of this.editor.getCursors()) {
        _loop2(cursor);
      }
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return CurrentSelection;
})(Motion);

var MoveLeft = (function (_Motion2) {
  _inherits(MoveLeft, _Motion2);

  function MoveLeft() {
    _classCallCheck(this, MoveLeft);

    _get(Object.getPrototypeOf(MoveLeft.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MoveLeft, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this3 = this;

      var allowWrap = this.getConfig('wrapLeftRightMotion');
      this.moveCursorCountTimes(cursor, function () {
        _this3.utils.moveCursorLeft(cursor, { allowWrap: allowWrap });
      });
    }
  }]);

  return MoveLeft;
})(Motion);

var MoveRight = (function (_Motion3) {
  _inherits(MoveRight, _Motion3);

  function MoveRight() {
    _classCallCheck(this, MoveRight);

    _get(Object.getPrototypeOf(MoveRight.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MoveRight, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this4 = this;

      var allowWrap = this.getConfig('wrapLeftRightMotion');

      this.moveCursorCountTimes(cursor, function () {
        _this4.editor.unfoldBufferRow(cursor.getBufferRow());

        // - When `wrapLeftRightMotion` enabled and executed as pure-motion in `normal-mode`,
        //   we need to move **again** to wrap to next-line if it rached to EOL.
        // - Expression `!this.operator` means normal-mode motion.
        // - Expression `this.mode === "normal"` is not appropreate since it matches `x` operator's target case.
        var needMoveAgain = allowWrap && !_this4.operator && !cursor.isAtEndOfLine();

        _this4.utils.moveCursorRight(cursor, { allowWrap: allowWrap });

        if (needMoveAgain && cursor.isAtEndOfLine()) {
          _this4.utils.moveCursorRight(cursor, { allowWrap: allowWrap });
        }
      });
    }
  }]);

  return MoveRight;
})(Motion);

var MoveRightBufferColumn = (function (_Motion4) {
  _inherits(MoveRightBufferColumn, _Motion4);

  function MoveRightBufferColumn() {
    _classCallCheck(this, MoveRightBufferColumn);

    _get(Object.getPrototypeOf(MoveRightBufferColumn.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MoveRightBufferColumn, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      this.utils.setBufferColumn(cursor, cursor.getBufferColumn() + this.getCount());
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return MoveRightBufferColumn;
})(Motion);

var MoveUp = (function (_Motion5) {
  _inherits(MoveUp, _Motion5);

  function MoveUp() {
    _classCallCheck(this, MoveUp);

    _get(Object.getPrototypeOf(MoveUp.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.wrap = false;
    this.direction = 'up';
  }

  _createClass(MoveUp, [{
    key: 'getBufferRow',
    value: function getBufferRow(row) {
      var min = 0;
      var max = this.getVimLastBufferRow();

      if (this.direction === 'up') {
        row = this.getFoldStartRowForRow(row) - 1;
        row = this.wrap && row < min ? max : this.limitNumber(row, { min: min });
      } else {
        row = this.getFoldEndRowForRow(row) + 1;
        row = this.wrap && row > max ? min : this.limitNumber(row, { max: max });
      }
      return this.getFoldStartRowForRow(row);
    }
  }, {
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this5 = this;

      this.moveCursorCountTimes(cursor, function () {
        var row = _this5.getBufferRow(cursor.getBufferRow());
        _this5.utils.setBufferRow(cursor, row);
      });
    }
  }]);

  return MoveUp;
})(Motion);

var MoveUpWrap = (function (_MoveUp) {
  _inherits(MoveUpWrap, _MoveUp);

  function MoveUpWrap() {
    _classCallCheck(this, MoveUpWrap);

    _get(Object.getPrototypeOf(MoveUpWrap.prototype), 'constructor', this).apply(this, arguments);

    this.wrap = true;
  }

  return MoveUpWrap;
})(MoveUp);

var MoveDown = (function (_MoveUp2) {
  _inherits(MoveDown, _MoveUp2);

  function MoveDown() {
    _classCallCheck(this, MoveDown);

    _get(Object.getPrototypeOf(MoveDown.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'down';
  }

  return MoveDown;
})(MoveUp);

var MoveDownWrap = (function (_MoveDown) {
  _inherits(MoveDownWrap, _MoveDown);

  function MoveDownWrap() {
    _classCallCheck(this, MoveDownWrap);

    _get(Object.getPrototypeOf(MoveDownWrap.prototype), 'constructor', this).apply(this, arguments);

    this.wrap = true;
  }

  return MoveDownWrap;
})(MoveDown);

var MoveUpScreen = (function (_Motion6) {
  _inherits(MoveUpScreen, _Motion6);

  function MoveUpScreen() {
    _classCallCheck(this, MoveUpScreen);

    _get(Object.getPrototypeOf(MoveUpScreen.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.direction = 'up';
  }

  _createClass(MoveUpScreen, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this6 = this;

      this.moveCursorCountTimes(cursor, function () {
        _this6.utils.moveCursorUpScreen(cursor);
      });
    }
  }]);

  return MoveUpScreen;
})(Motion);

var MoveDownScreen = (function (_MoveUpScreen) {
  _inherits(MoveDownScreen, _MoveUpScreen);

  function MoveDownScreen() {
    _classCallCheck(this, MoveDownScreen);

    _get(Object.getPrototypeOf(MoveDownScreen.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.direction = 'down';
  }

  _createClass(MoveDownScreen, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this7 = this;

      this.moveCursorCountTimes(cursor, function () {
        _this7.utils.moveCursorDownScreen(cursor);
      });
    }
  }]);

  return MoveDownScreen;
})(MoveUpScreen);

var MoveUpToEdge = (function (_Motion7) {
  _inherits(MoveUpToEdge, _Motion7);

  function MoveUpToEdge() {
    _classCallCheck(this, MoveUpToEdge);

    _get(Object.getPrototypeOf(MoveUpToEdge.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.jump = true;
    this.direction = 'previous';
  }

  _createClass(MoveUpToEdge, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this8 = this;

      this.moveCursorCountTimes(cursor, function () {
        var point = _this8.getPoint(cursor.getScreenPosition());
        if (point) cursor.setScreenPosition(point);
      });
    }
  }, {
    key: 'getPoint',
    value: function getPoint(fromPoint) {
      var column = fromPoint.column;
      var startRow = fromPoint.row;

      for (var row of this.getScreenRows({ startRow: startRow, direction: this.direction })) {
        var point = new Point(row, column);
        if (this.isEdge(point)) return point;
      }
    }
  }, {
    key: 'isEdge',
    value: function isEdge(point) {
      // If point is stoppable and above or below point is not stoppable, it's Edge!
      return this.isStoppable(point) && (!this.isStoppable(point.translate([-1, 0])) || !this.isStoppable(point.translate([+1, 0])));
    }
  }, {
    key: 'isStoppable',
    value: function isStoppable(point) {
      return this.isNonWhiteSpace(point) || this.isFirstRowOrLastRowAndStoppable(point) ||
      // If right or left column is non-white-space char, it's stoppable.
      this.isNonWhiteSpace(point.translate([0, -1])) && this.isNonWhiteSpace(point.translate([0, +1]));
    }
  }, {
    key: 'isNonWhiteSpace',
    value: function isNonWhiteSpace(point) {
      var char = this.utils.getTextInScreenRange(this.editor, Range.fromPointWithDelta(point, 0, 1));
      return char != null && /\S/.test(char);
    }
  }, {
    key: 'isFirstRowOrLastRowAndStoppable',
    value: function isFirstRowOrLastRowAndStoppable(point) {
      // In notmal-mode, cursor is NOT stoppable to EOL of non-blank row.
      // So explicitly guard to not answer it stoppable.
      if (this.mode === 'normal' && this.utils.pointIsAtEndOfLineAtNonEmptyRow(this.editor, point)) {
        return false;
      }

      // If clipped, it means that original ponit was non stoppable(e.g. point.colum > EOL).
      var row = point.row;

      return (row === 0 || row === this.getVimLastScreenRow()) && point.isEqual(this.editor.clipScreenPosition(point));
    }
  }]);

  return MoveUpToEdge;
})(Motion);

var MoveDownToEdge = (function (_MoveUpToEdge) {
  _inherits(MoveDownToEdge, _MoveUpToEdge);

  function MoveDownToEdge() {
    _classCallCheck(this, MoveDownToEdge);

    _get(Object.getPrototypeOf(MoveDownToEdge.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'next';
  }

  // Word Motion family
  // +----------------------------------------------------------------------------+
  // | direction | which      | word  | WORD | subword | smartword | alphanumeric |
  // |-----------+------------+-------+------+---------+-----------+--------------+
  // | next      | word-start | w     | W    | -       | -         | -            |
  // | previous  | word-start | b     | b    | -       | -         | -            |
  // | next      | word-end   | e     | E    | -       | -         | -            |
  // | previous  | word-end   | ge    | g E  | n/a     | n/a       | n/a          |
  // +----------------------------------------------------------------------------+

  return MoveDownToEdge;
})(MoveUpToEdge);

var WordMotion = (function (_Motion8) {
  _inherits(WordMotion, _Motion8);

  function WordMotion() {
    _classCallCheck(this, WordMotion);

    _get(Object.getPrototypeOf(WordMotion.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = null;
    this.skipBlankRow = false;
    this.skipWhiteSpaceOnlyRow = false;
  }

  // w

  _createClass(WordMotion, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this9 = this;

      this.moveCursorCountTimes(cursor, function (countState) {
        cursor.setBufferPosition(_this9.getPoint(cursor, countState));
      });
    }
  }, {
    key: 'getPoint',
    value: function getPoint(cursor, countState) {
      var direction = this.direction;
      var which = this.which;

      var regex = this.name.endsWith('Subword') ? cursor.subwordRegExp() : this.wordRegex || cursor.wordRegExp();

      var from = cursor.getBufferPosition();
      if (direction === 'next' && which === 'start' && this.operator && countState.isFinal) {
        // [NOTE] Exceptional behavior for w and W: [Detail in vim help `:help w`.]
        // [case-A] cw, cW treated as ce, cE when cursor is at non-blank.
        // [case-B] when w, W used as TARGET, it doesn't move over new line.
        if (this.isEmptyRow(from.row)) return [from.row + 1, 0];

        // [case-A]
        if (this.operator.name === 'Change' && !this.utils.pointIsAtWhiteSpace(this.editor, from)) {
          which = 'end';
        }
        var point = this.findPoint(direction, regex, which, this.buildOptions(from));
        // [case-B]
        return point ? Point.min(point, [from.row, Infinity]) : this.getLastResortPoint(direction);
      } else {
        return this.findPoint(direction, regex, which, this.buildOptions(from)) || this.getLastResortPoint(direction);
      }
    }
  }, {
    key: 'buildOptions',
    value: function buildOptions(from) {
      return {
        from: from,
        skipEmptyRow: this.skipEmptyRow,
        skipWhiteSpaceOnlyRow: this.skipWhiteSpaceOnlyRow,
        preTranslate: this.which === 'end' && [0, +1] || undefined,
        postTranslate: this.which === 'end' && [0, -1] || undefined
      };
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return WordMotion;
})(Motion);

var MoveToNextWord = (function (_WordMotion) {
  _inherits(MoveToNextWord, _WordMotion);

  function MoveToNextWord() {
    _classCallCheck(this, MoveToNextWord);

    _get(Object.getPrototypeOf(MoveToNextWord.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'next';
    this.which = 'start';
  }

  // W
  return MoveToNextWord;
})(WordMotion);

var MoveToNextWholeWord = (function (_MoveToNextWord) {
  _inherits(MoveToNextWholeWord, _MoveToNextWord);

  function MoveToNextWholeWord() {
    _classCallCheck(this, MoveToNextWholeWord);

    _get(Object.getPrototypeOf(MoveToNextWholeWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /^$|\S+/g;
  }

  // no-keymap
  return MoveToNextWholeWord;
})(MoveToNextWord);

var MoveToNextSubword = (function (_MoveToNextWord2) {
  _inherits(MoveToNextSubword, _MoveToNextWord2);

  function MoveToNextSubword() {
    _classCallCheck(this, MoveToNextSubword);

    _get(Object.getPrototypeOf(MoveToNextSubword.prototype), 'constructor', this).apply(this, arguments);
  }

  // no-keymap
  return MoveToNextSubword;
})(MoveToNextWord);

var MoveToNextSmartWord = (function (_MoveToNextWord3) {
  _inherits(MoveToNextSmartWord, _MoveToNextWord3);

  function MoveToNextSmartWord() {
    _classCallCheck(this, MoveToNextSmartWord);

    _get(Object.getPrototypeOf(MoveToNextSmartWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /[\w-]+/g;
  }

  // no-keymap
  return MoveToNextSmartWord;
})(MoveToNextWord);

var MoveToNextAlphanumericWord = (function (_MoveToNextWord4) {
  _inherits(MoveToNextAlphanumericWord, _MoveToNextWord4);

  function MoveToNextAlphanumericWord() {
    _classCallCheck(this, MoveToNextAlphanumericWord);

    _get(Object.getPrototypeOf(MoveToNextAlphanumericWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /\w+/g;
  }

  // b
  return MoveToNextAlphanumericWord;
})(MoveToNextWord);

var MoveToPreviousWord = (function (_WordMotion2) {
  _inherits(MoveToPreviousWord, _WordMotion2);

  function MoveToPreviousWord() {
    _classCallCheck(this, MoveToPreviousWord);

    _get(Object.getPrototypeOf(MoveToPreviousWord.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'previous';
    this.which = 'start';
    this.skipWhiteSpaceOnlyRow = true;
  }

  // B
  return MoveToPreviousWord;
})(WordMotion);

var MoveToPreviousWholeWord = (function (_MoveToPreviousWord) {
  _inherits(MoveToPreviousWholeWord, _MoveToPreviousWord);

  function MoveToPreviousWholeWord() {
    _classCallCheck(this, MoveToPreviousWholeWord);

    _get(Object.getPrototypeOf(MoveToPreviousWholeWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /^$|\S+/g;
  }

  // no-keymap
  return MoveToPreviousWholeWord;
})(MoveToPreviousWord);

var MoveToPreviousSubword = (function (_MoveToPreviousWord2) {
  _inherits(MoveToPreviousSubword, _MoveToPreviousWord2);

  function MoveToPreviousSubword() {
    _classCallCheck(this, MoveToPreviousSubword);

    _get(Object.getPrototypeOf(MoveToPreviousSubword.prototype), 'constructor', this).apply(this, arguments);
  }

  // no-keymap
  return MoveToPreviousSubword;
})(MoveToPreviousWord);

var MoveToPreviousSmartWord = (function (_MoveToPreviousWord3) {
  _inherits(MoveToPreviousSmartWord, _MoveToPreviousWord3);

  function MoveToPreviousSmartWord() {
    _classCallCheck(this, MoveToPreviousSmartWord);

    _get(Object.getPrototypeOf(MoveToPreviousSmartWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /[\w-]+/;
  }

  // no-keymap
  return MoveToPreviousSmartWord;
})(MoveToPreviousWord);

var MoveToPreviousAlphanumericWord = (function (_MoveToPreviousWord4) {
  _inherits(MoveToPreviousAlphanumericWord, _MoveToPreviousWord4);

  function MoveToPreviousAlphanumericWord() {
    _classCallCheck(this, MoveToPreviousAlphanumericWord);

    _get(Object.getPrototypeOf(MoveToPreviousAlphanumericWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /\w+/;
  }

  // e
  return MoveToPreviousAlphanumericWord;
})(MoveToPreviousWord);

var MoveToEndOfWord = (function (_WordMotion3) {
  _inherits(MoveToEndOfWord, _WordMotion3);

  function MoveToEndOfWord() {
    _classCallCheck(this, MoveToEndOfWord);

    _get(Object.getPrototypeOf(MoveToEndOfWord.prototype), 'constructor', this).apply(this, arguments);

    this.inclusive = true;
    this.direction = 'next';
    this.which = 'end';
    this.skipEmptyRow = true;
    this.skipWhiteSpaceOnlyRow = true;
  }

  // E
  return MoveToEndOfWord;
})(WordMotion);

var MoveToEndOfWholeWord = (function (_MoveToEndOfWord) {
  _inherits(MoveToEndOfWholeWord, _MoveToEndOfWord);

  function MoveToEndOfWholeWord() {
    _classCallCheck(this, MoveToEndOfWholeWord);

    _get(Object.getPrototypeOf(MoveToEndOfWholeWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /\S+/g;
  }

  // no-keymap
  return MoveToEndOfWholeWord;
})(MoveToEndOfWord);

var MoveToEndOfSubword = (function (_MoveToEndOfWord2) {
  _inherits(MoveToEndOfSubword, _MoveToEndOfWord2);

  function MoveToEndOfSubword() {
    _classCallCheck(this, MoveToEndOfSubword);

    _get(Object.getPrototypeOf(MoveToEndOfSubword.prototype), 'constructor', this).apply(this, arguments);
  }

  // no-keymap
  return MoveToEndOfSubword;
})(MoveToEndOfWord);

var MoveToEndOfSmartWord = (function (_MoveToEndOfWord3) {
  _inherits(MoveToEndOfSmartWord, _MoveToEndOfWord3);

  function MoveToEndOfSmartWord() {
    _classCallCheck(this, MoveToEndOfSmartWord);

    _get(Object.getPrototypeOf(MoveToEndOfSmartWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /[\w-]+/g;
  }

  // no-keymap
  return MoveToEndOfSmartWord;
})(MoveToEndOfWord);

var MoveToEndOfAlphanumericWord = (function (_MoveToEndOfWord4) {
  _inherits(MoveToEndOfAlphanumericWord, _MoveToEndOfWord4);

  function MoveToEndOfAlphanumericWord() {
    _classCallCheck(this, MoveToEndOfAlphanumericWord);

    _get(Object.getPrototypeOf(MoveToEndOfAlphanumericWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /\w+/g;
  }

  // ge
  return MoveToEndOfAlphanumericWord;
})(MoveToEndOfWord);

var MoveToPreviousEndOfWord = (function (_WordMotion4) {
  _inherits(MoveToPreviousEndOfWord, _WordMotion4);

  function MoveToPreviousEndOfWord() {
    _classCallCheck(this, MoveToPreviousEndOfWord);

    _get(Object.getPrototypeOf(MoveToPreviousEndOfWord.prototype), 'constructor', this).apply(this, arguments);

    this.inclusive = true;
    this.direction = 'previous';
    this.which = 'end';
    this.skipWhiteSpaceOnlyRow = true;
  }

  // gE
  return MoveToPreviousEndOfWord;
})(WordMotion);

var MoveToPreviousEndOfWholeWord = (function (_MoveToPreviousEndOfWord) {
  _inherits(MoveToPreviousEndOfWholeWord, _MoveToPreviousEndOfWord);

  function MoveToPreviousEndOfWholeWord() {
    _classCallCheck(this, MoveToPreviousEndOfWholeWord);

    _get(Object.getPrototypeOf(MoveToPreviousEndOfWholeWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /\S+/g;
  }

  // Sentence
  // -------------------------
  // Sentence is defined as below
  //  - end with ['.', '!', '?']
  //  - optionally followed by [')', ']', '"', "'"]
  //  - followed by ['$', ' ', '\t']
  //  - paragraph boundary is also sentence boundary
  //  - section boundary is also sentence boundary(ignore)
  return MoveToPreviousEndOfWholeWord;
})(MoveToPreviousEndOfWord);

var MoveToNextSentence = (function (_Motion9) {
  _inherits(MoveToNextSentence, _Motion9);

  function MoveToNextSentence() {
    _classCallCheck(this, MoveToNextSentence);

    _get(Object.getPrototypeOf(MoveToNextSentence.prototype), 'constructor', this).apply(this, arguments);

    this.jump = true;
    this.sentenceRegex = new RegExp('(?:[\\.!\\?][\\)\\]"\']*\\s+)|(\\n|\\r\\n)', 'g');
    this.direction = 'next';
  }

  _createClass(MoveToNextSentence, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this10 = this;

      this.moveCursorCountTimes(cursor, function () {
        var point = _this10.direction === 'next' ? _this10.getNextStartOfSentence(cursor.getBufferPosition()) : _this10.getPreviousStartOfSentence(cursor.getBufferPosition());
        cursor.setBufferPosition(point || _this10.getLastResortPoint(_this10.direction));
      });
    }
  }, {
    key: 'isBlankRow',
    value: function isBlankRow(row) {
      return this.editor.isBufferRowBlank(row);
    }
  }, {
    key: 'getNextStartOfSentence',
    value: function getNextStartOfSentence(from) {
      var _this11 = this;

      return this.findInEditor('forward', this.sentenceRegex, { from: from }, function (_ref) {
        var range = _ref.range;
        var match = _ref.match;

        if (match[1] != null) {
          var startRow = range.start.row;
          var endRow = range.end.row;

          if (_this11.skipBlankRow && _this11.isBlankRow(endRow)) return;
          if (_this11.isBlankRow(startRow) !== _this11.isBlankRow(endRow)) {
            return _this11.getFirstCharacterPositionForBufferRow(endRow);
          }
        } else {
          return range.end;
        }
      });
    }
  }, {
    key: 'getPreviousStartOfSentence',
    value: function getPreviousStartOfSentence(from) {
      var _this12 = this;

      return this.findInEditor('backward', this.sentenceRegex, { from: from }, function (_ref2) {
        var range = _ref2.range;
        var match = _ref2.match;

        if (match[1] != null) {
          var startRow = range.start.row;
          var endRow = range.end.row;

          if (!_this12.isBlankRow(endRow) && _this12.isBlankRow(startRow)) {
            var point = _this12.getFirstCharacterPositionForBufferRow(endRow);
            if (point.isLessThan(from)) return point;else if (!_this12.skipBlankRow) return _this12.getFirstCharacterPositionForBufferRow(startRow);
          }
        } else if (range.end.isLessThan(from)) {
          return range.end;
        }
      });
    }
  }]);

  return MoveToNextSentence;
})(Motion);

var MoveToPreviousSentence = (function (_MoveToNextSentence) {
  _inherits(MoveToPreviousSentence, _MoveToNextSentence);

  function MoveToPreviousSentence() {
    _classCallCheck(this, MoveToPreviousSentence);

    _get(Object.getPrototypeOf(MoveToPreviousSentence.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'previous';
  }

  return MoveToPreviousSentence;
})(MoveToNextSentence);

var MoveToNextSentenceSkipBlankRow = (function (_MoveToNextSentence2) {
  _inherits(MoveToNextSentenceSkipBlankRow, _MoveToNextSentence2);

  function MoveToNextSentenceSkipBlankRow() {
    _classCallCheck(this, MoveToNextSentenceSkipBlankRow);

    _get(Object.getPrototypeOf(MoveToNextSentenceSkipBlankRow.prototype), 'constructor', this).apply(this, arguments);

    this.skipBlankRow = true;
  }

  return MoveToNextSentenceSkipBlankRow;
})(MoveToNextSentence);

var MoveToPreviousSentenceSkipBlankRow = (function (_MoveToPreviousSentence) {
  _inherits(MoveToPreviousSentenceSkipBlankRow, _MoveToPreviousSentence);

  function MoveToPreviousSentenceSkipBlankRow() {
    _classCallCheck(this, MoveToPreviousSentenceSkipBlankRow);

    _get(Object.getPrototypeOf(MoveToPreviousSentenceSkipBlankRow.prototype), 'constructor', this).apply(this, arguments);

    this.skipBlankRow = true;
  }

  // Paragraph
  // -------------------------
  return MoveToPreviousSentenceSkipBlankRow;
})(MoveToPreviousSentence);

var MoveToNextParagraph = (function (_Motion10) {
  _inherits(MoveToNextParagraph, _Motion10);

  function MoveToNextParagraph() {
    _classCallCheck(this, MoveToNextParagraph);

    _get(Object.getPrototypeOf(MoveToNextParagraph.prototype), 'constructor', this).apply(this, arguments);

    this.jump = true;
    this.direction = 'next';
  }

  _createClass(MoveToNextParagraph, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this13 = this;

      this.moveCursorCountTimes(cursor, function () {
        var point = _this13.getPoint(cursor.getBufferPosition());
        cursor.setBufferPosition(point || _this13.getLastResortPoint(_this13.direction));
      });
    }
  }, {
    key: 'getPoint',
    value: function getPoint(from) {
      var _this14 = this;

      var wasBlankRow = this.editor.isBufferRowBlank(from.row);
      return this.findInEditor(this.direction, /^/g, { from: from }, function (_ref3) {
        var range = _ref3.range;

        var isBlankRow = _this14.editor.isBufferRowBlank(range.start.row);
        if (!wasBlankRow && isBlankRow) {
          return range.start;
        }
        wasBlankRow = isBlankRow;
      });
    }
  }]);

  return MoveToNextParagraph;
})(Motion);

var MoveToPreviousParagraph = (function (_MoveToNextParagraph) {
  _inherits(MoveToPreviousParagraph, _MoveToNextParagraph);

  function MoveToPreviousParagraph() {
    _classCallCheck(this, MoveToPreviousParagraph);

    _get(Object.getPrototypeOf(MoveToPreviousParagraph.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'previous';
  }

  return MoveToPreviousParagraph;
})(MoveToNextParagraph);

var MoveToNextDiffHunk = (function (_Motion11) {
  _inherits(MoveToNextDiffHunk, _Motion11);

  function MoveToNextDiffHunk() {
    _classCallCheck(this, MoveToNextDiffHunk);

    _get(Object.getPrototypeOf(MoveToNextDiffHunk.prototype), 'constructor', this).apply(this, arguments);

    this.jump = true;
    this.direction = 'next';
  }

  _createClass(MoveToNextDiffHunk, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this15 = this;

      this.moveCursorCountTimes(cursor, function () {
        var point = _this15.getPoint(cursor.getBufferPosition());
        if (point) cursor.setBufferPosition(point);
      });
    }
  }, {
    key: 'getPoint',
    value: function getPoint(from) {
      var _this16 = this;

      var getHunkRange = function getHunkRange(row) {
        return _this16.utils.getHunkRangeAtBufferRow(_this16.editor, row);
      };
      var hunkRange = getHunkRange(from.row);
      return this.findInEditor(this.direction, /^[+-]/g, { from: from }, function (_ref4) {
        var range = _ref4.range;

        if (hunkRange && hunkRange.containsPoint(range.start)) return;

        return getHunkRange(range.start.row).start;
      });
    }
  }]);

  return MoveToNextDiffHunk;
})(Motion);

var MoveToPreviousDiffHunk = (function (_MoveToNextDiffHunk) {
  _inherits(MoveToPreviousDiffHunk, _MoveToNextDiffHunk);

  function MoveToPreviousDiffHunk() {
    _classCallCheck(this, MoveToPreviousDiffHunk);

    _get(Object.getPrototypeOf(MoveToPreviousDiffHunk.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'previous';
  }

  // -------------------------
  // keymap: 0
  return MoveToPreviousDiffHunk;
})(MoveToNextDiffHunk);

var MoveToBeginningOfLine = (function (_Motion12) {
  _inherits(MoveToBeginningOfLine, _Motion12);

  function MoveToBeginningOfLine() {
    _classCallCheck(this, MoveToBeginningOfLine);

    _get(Object.getPrototypeOf(MoveToBeginningOfLine.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MoveToBeginningOfLine, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      this.utils.setBufferColumn(cursor, 0);
    }
  }]);

  return MoveToBeginningOfLine;
})(Motion);

var MoveToColumn = (function (_Motion13) {
  _inherits(MoveToColumn, _Motion13);

  function MoveToColumn() {
    _classCallCheck(this, MoveToColumn);

    _get(Object.getPrototypeOf(MoveToColumn.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MoveToColumn, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      this.utils.setBufferColumn(cursor, this.getCount() - 1);
    }
  }]);

  return MoveToColumn;
})(Motion);

var MoveToLastCharacterOfLine = (function (_Motion14) {
  _inherits(MoveToLastCharacterOfLine, _Motion14);

  function MoveToLastCharacterOfLine() {
    _classCallCheck(this, MoveToLastCharacterOfLine);

    _get(Object.getPrototypeOf(MoveToLastCharacterOfLine.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MoveToLastCharacterOfLine, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var row = this.getValidVimBufferRow(cursor.getBufferRow() + this.getCount() - 1);
      cursor.setBufferPosition([row, Infinity]);
      cursor.goalColumn = Infinity;
    }
  }]);

  return MoveToLastCharacterOfLine;
})(Motion);

var MoveToLastNonblankCharacterOfLineAndDown = (function (_Motion15) {
  _inherits(MoveToLastNonblankCharacterOfLineAndDown, _Motion15);

  function MoveToLastNonblankCharacterOfLineAndDown() {
    _classCallCheck(this, MoveToLastNonblankCharacterOfLineAndDown);

    _get(Object.getPrototypeOf(MoveToLastNonblankCharacterOfLineAndDown.prototype), 'constructor', this).apply(this, arguments);

    this.inclusive = true;
  }

  // MoveToFirstCharacterOfLine faimily
  // ------------------------------------
  // ^

  _createClass(MoveToLastNonblankCharacterOfLineAndDown, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var row = this.limitNumber(cursor.getBufferRow() + this.getCount() - 1, { max: this.getVimLastBufferRow() });
      var options = { from: [row, Infinity], allowNextLine: false };
      var point = this.findInEditor('backward', /\S|^/, options, function (event) {
        return event.range.start;
      });
      cursor.setBufferPosition(point);
    }
  }]);

  return MoveToLastNonblankCharacterOfLineAndDown;
})(Motion);

var MoveToFirstCharacterOfLine = (function (_Motion16) {
  _inherits(MoveToFirstCharacterOfLine, _Motion16);

  function MoveToFirstCharacterOfLine() {
    _classCallCheck(this, MoveToFirstCharacterOfLine);

    _get(Object.getPrototypeOf(MoveToFirstCharacterOfLine.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MoveToFirstCharacterOfLine, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      cursor.setBufferPosition(this.getFirstCharacterPositionForBufferRow(cursor.getBufferRow()));
    }
  }]);

  return MoveToFirstCharacterOfLine;
})(Motion);

var MoveToFirstCharacterOfLineUp = (function (_MoveToFirstCharacterOfLine) {
  _inherits(MoveToFirstCharacterOfLineUp, _MoveToFirstCharacterOfLine);

  function MoveToFirstCharacterOfLineUp() {
    _classCallCheck(this, MoveToFirstCharacterOfLineUp);

    _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineUp.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
  }

  _createClass(MoveToFirstCharacterOfLineUp, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this17 = this;

      this.moveCursorCountTimes(cursor, function () {
        var row = _this17.getValidVimBufferRow(cursor.getBufferRow() - 1);
        cursor.setBufferPosition([row, 0]);
      });
      _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineUp.prototype), 'moveCursor', this).call(this, cursor);
    }
  }]);

  return MoveToFirstCharacterOfLineUp;
})(MoveToFirstCharacterOfLine);

var MoveToFirstCharacterOfLineDown = (function (_MoveToFirstCharacterOfLine2) {
  _inherits(MoveToFirstCharacterOfLineDown, _MoveToFirstCharacterOfLine2);

  function MoveToFirstCharacterOfLineDown() {
    _classCallCheck(this, MoveToFirstCharacterOfLineDown);

    _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineDown.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
  }

  _createClass(MoveToFirstCharacterOfLineDown, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this18 = this;

      this.moveCursorCountTimes(cursor, function () {
        var point = cursor.getBufferPosition();
        if (point.row < _this18.getVimLastBufferRow()) {
          cursor.setBufferPosition(point.translate([+1, 0]));
        }
      });
      _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineDown.prototype), 'moveCursor', this).call(this, cursor);
    }
  }]);

  return MoveToFirstCharacterOfLineDown;
})(MoveToFirstCharacterOfLine);

var MoveToFirstCharacterOfLineAndDown = (function (_MoveToFirstCharacterOfLineDown) {
  _inherits(MoveToFirstCharacterOfLineAndDown, _MoveToFirstCharacterOfLineDown);

  function MoveToFirstCharacterOfLineAndDown() {
    _classCallCheck(this, MoveToFirstCharacterOfLineAndDown);

    _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineAndDown.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MoveToFirstCharacterOfLineAndDown, [{
    key: 'getCount',
    value: function getCount() {
      return _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineAndDown.prototype), 'getCount', this).call(this) - 1;
    }
  }]);

  return MoveToFirstCharacterOfLineAndDown;
})(MoveToFirstCharacterOfLineDown);

var MoveToScreenColumn = (function (_Motion17) {
  _inherits(MoveToScreenColumn, _Motion17);

  function MoveToScreenColumn() {
    _classCallCheck(this, MoveToScreenColumn);

    _get(Object.getPrototypeOf(MoveToScreenColumn.prototype), 'constructor', this).apply(this, arguments);
  }

  // keymap: g 0

  _createClass(MoveToScreenColumn, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var point = this.utils.getScreenPositionForScreenRow(this.editor, cursor.getScreenRow(), this.which, {
        allowOffScreenPosition: this.getConfig('allowMoveToOffScreenColumnOnScreenLineMotion')
      });
      if (point) cursor.setScreenPosition(point);
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return MoveToScreenColumn;
})(Motion);

var MoveToBeginningOfScreenLine = (function (_MoveToScreenColumn) {
  _inherits(MoveToBeginningOfScreenLine, _MoveToScreenColumn);

  function MoveToBeginningOfScreenLine() {
    _classCallCheck(this, MoveToBeginningOfScreenLine);

    _get(Object.getPrototypeOf(MoveToBeginningOfScreenLine.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'beginning';
  }

  // g ^: `move-to-first-character-of-screen-line`
  return MoveToBeginningOfScreenLine;
})(MoveToScreenColumn);

var MoveToFirstCharacterOfScreenLine = (function (_MoveToScreenColumn2) {
  _inherits(MoveToFirstCharacterOfScreenLine, _MoveToScreenColumn2);

  function MoveToFirstCharacterOfScreenLine() {
    _classCallCheck(this, MoveToFirstCharacterOfScreenLine);

    _get(Object.getPrototypeOf(MoveToFirstCharacterOfScreenLine.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'first-character';
  }

  // keymap: g $
  return MoveToFirstCharacterOfScreenLine;
})(MoveToScreenColumn);

var MoveToLastCharacterOfScreenLine = (function (_MoveToScreenColumn3) {
  _inherits(MoveToLastCharacterOfScreenLine, _MoveToScreenColumn3);

  function MoveToLastCharacterOfScreenLine() {
    _classCallCheck(this, MoveToLastCharacterOfScreenLine);

    _get(Object.getPrototypeOf(MoveToLastCharacterOfScreenLine.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'last-character';
  }

  // keymap: g g
  return MoveToLastCharacterOfScreenLine;
})(MoveToScreenColumn);

var MoveToFirstLine = (function (_Motion18) {
  _inherits(MoveToFirstLine, _Motion18);

  function MoveToFirstLine() {
    _classCallCheck(this, MoveToFirstLine);

    _get(Object.getPrototypeOf(MoveToFirstLine.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.jump = true;
    this.verticalMotion = true;
    this.moveSuccessOnLinewise = true;
  }

  // keymap: G

  _createClass(MoveToFirstLine, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      this.setCursorBufferRow(cursor, this.getValidVimBufferRow(this.getRow()));
      cursor.autoscroll({ center: true });
    }
  }, {
    key: 'getRow',
    value: function getRow() {
      return this.getCount() - 1;
    }
  }]);

  return MoveToFirstLine;
})(Motion);

var MoveToLastLine = (function (_MoveToFirstLine) {
  _inherits(MoveToLastLine, _MoveToFirstLine);

  function MoveToLastLine() {
    _classCallCheck(this, MoveToLastLine);

    _get(Object.getPrototypeOf(MoveToLastLine.prototype), 'constructor', this).apply(this, arguments);

    this.defaultCount = Infinity;
  }

  // keymap: N% e.g. 10%
  return MoveToLastLine;
})(MoveToFirstLine);

var MoveToLineByPercent = (function (_MoveToFirstLine2) {
  _inherits(MoveToLineByPercent, _MoveToFirstLine2);

  function MoveToLineByPercent() {
    _classCallCheck(this, MoveToLineByPercent);

    _get(Object.getPrototypeOf(MoveToLineByPercent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MoveToLineByPercent, [{
    key: 'getRow',
    value: function getRow() {
      var percent = this.limitNumber(this.getCount(), { max: 100 });
      return Math.floor(this.getVimLastBufferRow() * (percent / 100));
    }
  }]);

  return MoveToLineByPercent;
})(MoveToFirstLine);

var MoveToRelativeLine = (function (_Motion19) {
  _inherits(MoveToRelativeLine, _Motion19);

  function MoveToRelativeLine() {
    _classCallCheck(this, MoveToRelativeLine);

    _get(Object.getPrototypeOf(MoveToRelativeLine.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.moveSuccessOnLinewise = true;
  }

  _createClass(MoveToRelativeLine, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var row = undefined;
      var count = this.getCount();
      if (count < 0) {
        // Support negative count
        // Negative count can be passed like `operationStack.run("MoveToRelativeLine", {count: -5})`.
        // Currently used in vim-mode-plus-ex-mode pkg.
        while (count++ < 0) {
          row = this.getFoldStartRowForRow(row == null ? cursor.getBufferRow() : row - 1);
          if (row <= 0) break;
        }
      } else {
        var maxRow = this.getVimLastBufferRow();
        while (count-- > 0) {
          row = this.getFoldEndRowForRow(row == null ? cursor.getBufferRow() : row + 1);
          if (row >= maxRow) break;
        }
      }
      this.utils.setBufferRow(cursor, row);
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return MoveToRelativeLine;
})(Motion);

var MoveToRelativeLineMinimumTwo = (function (_MoveToRelativeLine) {
  _inherits(MoveToRelativeLineMinimumTwo, _MoveToRelativeLine);

  function MoveToRelativeLineMinimumTwo() {
    _classCallCheck(this, MoveToRelativeLineMinimumTwo);

    _get(Object.getPrototypeOf(MoveToRelativeLineMinimumTwo.prototype), 'constructor', this).apply(this, arguments);
  }

  // Position cursor without scrolling., H, M, L
  // -------------------------
  // keymap: H

  _createClass(MoveToRelativeLineMinimumTwo, [{
    key: 'getCount',
    value: function getCount() {
      return this.limitNumber(_get(Object.getPrototypeOf(MoveToRelativeLineMinimumTwo.prototype), 'getCount', this).call(this), { min: 2 });
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return MoveToRelativeLineMinimumTwo;
})(MoveToRelativeLine);

var MoveToTopOfScreen = (function (_Motion20) {
  _inherits(MoveToTopOfScreen, _Motion20);

  function MoveToTopOfScreen() {
    _classCallCheck(this, MoveToTopOfScreen);

    _get(Object.getPrototypeOf(MoveToTopOfScreen.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.jump = true;
    this.defaultCount = 0;
    this.verticalMotion = true;
  }

  _createClass(MoveToTopOfScreen, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var bufferRow = this.editor.bufferRowForScreenRow(this.getScreenRow());
      this.setCursorBufferRow(cursor, bufferRow);
    }
  }, {
    key: 'getScreenRow',
    value: function getScreenRow() {
      var firstVisibleRow = this.editor.getFirstVisibleScreenRow();
      var lastVisibleRow = this.limitNumber(this.editor.getLastVisibleScreenRow(), { max: this.getVimLastScreenRow() });

      var baseOffset = 2;
      if (this.name === 'MoveToTopOfScreen') {
        var offset = firstVisibleRow === 0 ? 0 : baseOffset;
        var count = this.getCount() - 1;
        return this.limitNumber(firstVisibleRow + count, { min: firstVisibleRow + offset, max: lastVisibleRow });
      } else if (this.name === 'MoveToMiddleOfScreen') {
        return firstVisibleRow + Math.floor((lastVisibleRow - firstVisibleRow) / 2);
      } else if (this.name === 'MoveToBottomOfScreen') {
        var offset = lastVisibleRow === this.getVimLastScreenRow() ? 0 : baseOffset + 1;
        var count = this.getCount() - 1;
        return this.limitNumber(lastVisibleRow - count, { min: firstVisibleRow, max: lastVisibleRow - offset });
      }
    }
  }]);

  return MoveToTopOfScreen;
})(Motion);

var MoveToMiddleOfScreen = (function (_MoveToTopOfScreen) {
  _inherits(MoveToMiddleOfScreen, _MoveToTopOfScreen);

  function MoveToMiddleOfScreen() {
    _classCallCheck(this, MoveToMiddleOfScreen);

    _get(Object.getPrototypeOf(MoveToMiddleOfScreen.prototype), 'constructor', this).apply(this, arguments);
  }

  // keymap: M
  return MoveToMiddleOfScreen;
})(MoveToTopOfScreen);

var MoveToBottomOfScreen = (function (_MoveToTopOfScreen2) {
  _inherits(MoveToBottomOfScreen, _MoveToTopOfScreen2);

  function MoveToBottomOfScreen() {
    _classCallCheck(this, MoveToBottomOfScreen);

    _get(Object.getPrototypeOf(MoveToBottomOfScreen.prototype), 'constructor', this).apply(this, arguments);
  }

  // keymap: L

  // Scrolling
  // Half: ctrl-d, ctrl-u
  // Full: ctrl-f, ctrl-b
  // -------------------------
  // [FIXME] count behave differently from original Vim.
  return MoveToBottomOfScreen;
})(MoveToTopOfScreen);

var Scroll = (function (_Motion21) {
  _inherits(Scroll, _Motion21);

  function Scroll() {
    _classCallCheck(this, Scroll);

    _get(Object.getPrototypeOf(Scroll.prototype), 'constructor', this).apply(this, arguments);

    this.verticalMotion = true;
  }

  _createClass(Scroll, [{
    key: 'execute',
    value: function execute() {
      var amountOfPage = this.constructor.amountOfPageByName[this.name];
      var amountOfScreenRows = Math.trunc(amountOfPage * this.editor.getRowsPerPage() * this.getCount());
      this.amountOfPixels = amountOfScreenRows * this.editor.getLineHeightInPixels();

      _get(Object.getPrototypeOf(Scroll.prototype), 'execute', this).call(this);

      this.vimState.requestScroll({
        amountOfPixels: this.amountOfPixels,
        duration: this.getSmoothScrollDuation((Math.abs(amountOfPage) === 1 ? 'Full' : 'Half') + 'ScrollMotion')
      });
    }
  }, {
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var cursorPixel = this.editorElement.pixelPositionForScreenPosition(cursor.getScreenPosition());
      cursorPixel.top += this.amountOfPixels;
      var screenPosition = this.editorElement.screenPositionForPixelPosition(cursorPixel);
      var screenRow = this.getValidVimScreenRow(screenPosition.row);
      this.setCursorBufferRow(cursor, this.editor.bufferRowForScreenRow(screenRow), { autoscroll: false });
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }, {
    key: 'scrollTask',
    value: null,
    enumerable: true
  }, {
    key: 'amountOfPageByName',
    value: {
      ScrollFullScreenDown: 1,
      ScrollFullScreenUp: -1,
      ScrollHalfScreenDown: 0.5,
      ScrollHalfScreenUp: -0.5,
      ScrollQuarterScreenDown: 0.25,
      ScrollQuarterScreenUp: -0.25
    },
    enumerable: true
  }]);

  return Scroll;
})(Motion);

var ScrollFullScreenDown = (function (_Scroll) {
  _inherits(ScrollFullScreenDown, _Scroll);

  function ScrollFullScreenDown() {
    _classCallCheck(this, ScrollFullScreenDown);

    _get(Object.getPrototypeOf(ScrollFullScreenDown.prototype), 'constructor', this).apply(this, arguments);
  }

  // ctrl-f
  return ScrollFullScreenDown;
})(Scroll);

var ScrollFullScreenUp = (function (_Scroll2) {
  _inherits(ScrollFullScreenUp, _Scroll2);

  function ScrollFullScreenUp() {
    _classCallCheck(this, ScrollFullScreenUp);

    _get(Object.getPrototypeOf(ScrollFullScreenUp.prototype), 'constructor', this).apply(this, arguments);
  }

  // ctrl-b
  return ScrollFullScreenUp;
})(Scroll);

var ScrollHalfScreenDown = (function (_Scroll3) {
  _inherits(ScrollHalfScreenDown, _Scroll3);

  function ScrollHalfScreenDown() {
    _classCallCheck(this, ScrollHalfScreenDown);

    _get(Object.getPrototypeOf(ScrollHalfScreenDown.prototype), 'constructor', this).apply(this, arguments);
  }

  // ctrl-d
  return ScrollHalfScreenDown;
})(Scroll);

var ScrollHalfScreenUp = (function (_Scroll4) {
  _inherits(ScrollHalfScreenUp, _Scroll4);

  function ScrollHalfScreenUp() {
    _classCallCheck(this, ScrollHalfScreenUp);

    _get(Object.getPrototypeOf(ScrollHalfScreenUp.prototype), 'constructor', this).apply(this, arguments);
  }

  // ctrl-u
  return ScrollHalfScreenUp;
})(Scroll);

var ScrollQuarterScreenDown = (function (_Scroll5) {
  _inherits(ScrollQuarterScreenDown, _Scroll5);

  function ScrollQuarterScreenDown() {
    _classCallCheck(this, ScrollQuarterScreenDown);

    _get(Object.getPrototypeOf(ScrollQuarterScreenDown.prototype), 'constructor', this).apply(this, arguments);
  }

  // g ctrl-d
  return ScrollQuarterScreenDown;
})(Scroll);

var ScrollQuarterScreenUp = (function (_Scroll6) {
  _inherits(ScrollQuarterScreenUp, _Scroll6);

  function ScrollQuarterScreenUp() {
    _classCallCheck(this, ScrollQuarterScreenUp);

    _get(Object.getPrototypeOf(ScrollQuarterScreenUp.prototype), 'constructor', this).apply(this, arguments);
  }

  // g ctrl-u

  // Find
  // -------------------------
  // keymap: f
  return ScrollQuarterScreenUp;
})(Scroll);

var Find = (function (_Motion22) {
  _inherits(Find, _Motion22);

  function Find() {
    _classCallCheck(this, Find);

    _get(Object.getPrototypeOf(Find.prototype), 'constructor', this).apply(this, arguments);

    this.backwards = false;
    this.inclusive = true;
    this.offset = 0;
    this.requireInput = true;
    this.caseSensitivityKind = 'Find';
  }

  // keymap: F

  _createClass(Find, [{
    key: 'restoreEditorState',
    value: function restoreEditorState() {
      if (this._restoreEditorState) this._restoreEditorState();
      this._restoreEditorState = null;
    }
  }, {
    key: 'cancelOperation',
    value: function cancelOperation() {
      this.restoreEditorState();
      _get(Object.getPrototypeOf(Find.prototype), 'cancelOperation', this).call(this);
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      var _this19 = this;

      if (this.getConfig('reuseFindForRepeatFind')) this.repeatIfNecessary();

      if (!this.repeated) {
        var charsMax = this.getConfig('findCharsMax');
        var optionsBase = { purpose: 'find', charsMax: charsMax };

        if (charsMax === 1) {
          this.focusInput(optionsBase);
        } else {
          this._restoreEditorState = this.utils.saveEditorState(this.editor);
          var options = {
            autoConfirmTimeout: this.getConfig('findConfirmByTimeout'),
            onConfirm: function onConfirm(input) {
              _this19.input = input;
              if (input) _this19.processOperation();else _this19.cancelOperation();
            },
            onChange: function onChange(preConfirmedChars) {
              _this19.preConfirmedChars = preConfirmedChars;
              _this19.highlightTextInCursorRows(_this19.preConfirmedChars, 'pre-confirm', _this19.isBackwards());
            },
            onCancel: function onCancel() {
              _this19.vimState.highlightFind.clearMarkers();
              _this19.cancelOperation();
            },
            commands: {
              'vim-mode-plus:find-next-pre-confirmed': function vimModePlusFindNextPreConfirmed() {
                return _this19.findPreConfirmed(+1);
              },
              'vim-mode-plus:find-previous-pre-confirmed': function vimModePlusFindPreviousPreConfirmed() {
                return _this19.findPreConfirmed(-1);
              }
            }
          };
          this.focusInput(Object.assign(options, optionsBase));
        }
      }
      _get(Object.getPrototypeOf(Find.prototype), 'initialize', this).call(this);
    }
  }, {
    key: 'findPreConfirmed',
    value: function findPreConfirmed(delta) {
      if (this.preConfirmedChars && this.getConfig('highlightFindChar')) {
        var index = this.highlightTextInCursorRows(this.preConfirmedChars, 'pre-confirm', this.isBackwards(), this.getCount() - 1 + delta, true);
        this.count = index + 1;
      }
    }
  }, {
    key: 'repeatIfNecessary',
    value: function repeatIfNecessary() {
      var findCommandNames = ['Find', 'FindBackwards', 'Till', 'TillBackwards'];
      var currentFind = this.globalState.get('currentFind');
      if (currentFind && findCommandNames.includes(this.vimState.operationStack.getLastCommandName())) {
        this.input = currentFind.input;
        this.repeated = true;
      }
    }
  }, {
    key: 'isBackwards',
    value: function isBackwards() {
      return this.backwards;
    }
  }, {
    key: 'execute',
    value: function execute() {
      var _this20 = this;

      _get(Object.getPrototypeOf(Find.prototype), 'execute', this).call(this);
      var decorationType = 'post-confirm';
      if (this.operator && !this.operator['instanceof']('SelectBase')) {
        decorationType += ' long';
      }

      // HACK: When repeated by ",", this.backwards is temporary inverted and
      // restored after execution finished.
      // But final highlightTextInCursorRows is executed in async(=after operation finished).
      // Thus we need to preserve before restored `backwards` value and pass it.
      var backwards = this.isBackwards();
      this.editor.component.getNextUpdatePromise().then(function () {
        _this20.highlightTextInCursorRows(_this20.input, decorationType, backwards);
      });
    }
  }, {
    key: 'getPoint',
    value: function getPoint(fromPoint) {
      var scanRange = this.editor.bufferRangeForBufferRow(fromPoint.row);
      var points = [];
      var regex = this.getRegex(this.input);
      var indexWantAccess = this.getCount() - 1;

      var translation = new Point(0, this.isBackwards() ? this.offset : -this.offset);
      if (this.repeated) {
        fromPoint = fromPoint.translate(translation.negate());
      }

      if (this.isBackwards()) {
        if (this.getConfig('findAcrossLines')) scanRange.start = Point.ZERO;

        this.editor.backwardsScanInBufferRange(regex, scanRange, function (_ref5) {
          var range = _ref5.range;
          var stop = _ref5.stop;

          if (range.start.isLessThan(fromPoint)) {
            points.push(range.start);
            if (points.length > indexWantAccess) stop();
          }
        });
      } else {
        if (this.getConfig('findAcrossLines')) scanRange.end = this.editor.getEofBufferPosition();

        this.editor.scanInBufferRange(regex, scanRange, function (_ref6) {
          var range = _ref6.range;
          var stop = _ref6.stop;

          if (range.start.isGreaterThan(fromPoint)) {
            points.push(range.start);
            if (points.length > indexWantAccess) stop();
          }
        });
      }

      var point = points[indexWantAccess];
      if (point) return point.translate(translation);
    }

    // FIXME: bad naming, this function must return index
  }, {
    key: 'highlightTextInCursorRows',
    value: function highlightTextInCursorRows(text, decorationType, backwards) {
      var index = arguments.length <= 3 || arguments[3] === undefined ? this.getCount() - 1 : arguments[3];
      var adjustIndex = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];

      if (!this.getConfig('highlightFindChar')) return;

      return this.vimState.highlightFind.highlightCursorRows(this.getRegex(text), decorationType, backwards, this.offset, index, adjustIndex);
    }
  }, {
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var point = this.getPoint(cursor.getBufferPosition());
      if (point) cursor.setBufferPosition(point);else this.restoreEditorState();

      if (!this.repeated) this.globalState.set('currentFind', this);
    }
  }, {
    key: 'getRegex',
    value: function getRegex(term) {
      var modifiers = this.isCaseSensitive(term) ? 'g' : 'gi';
      return new RegExp(this._.escapeRegExp(term), modifiers);
    }
  }]);

  return Find;
})(Motion);

var FindBackwards = (function (_Find) {
  _inherits(FindBackwards, _Find);

  function FindBackwards() {
    _classCallCheck(this, FindBackwards);

    _get(Object.getPrototypeOf(FindBackwards.prototype), 'constructor', this).apply(this, arguments);

    this.inclusive = false;
    this.backwards = true;
  }

  // keymap: t
  return FindBackwards;
})(Find);

var Till = (function (_Find2) {
  _inherits(Till, _Find2);

  function Till() {
    _classCallCheck(this, Till);

    _get(Object.getPrototypeOf(Till.prototype), 'constructor', this).apply(this, arguments);

    this.offset = 1;
  }

  // keymap: T

  _createClass(Till, [{
    key: 'getPoint',
    value: function getPoint() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var point = _get(Object.getPrototypeOf(Till.prototype), 'getPoint', this).apply(this, args);
      this.moveSucceeded = point != null;
      return point;
    }
  }]);

  return Till;
})(Find);

var TillBackwards = (function (_Till) {
  _inherits(TillBackwards, _Till);

  function TillBackwards() {
    _classCallCheck(this, TillBackwards);

    _get(Object.getPrototypeOf(TillBackwards.prototype), 'constructor', this).apply(this, arguments);

    this.inclusive = false;
    this.backwards = true;
  }

  // Mark
  // -------------------------
  // keymap: `
  return TillBackwards;
})(Till);

var MoveToMark = (function (_Motion23) {
  _inherits(MoveToMark, _Motion23);

  function MoveToMark() {
    _classCallCheck(this, MoveToMark);

    _get(Object.getPrototypeOf(MoveToMark.prototype), 'constructor', this).apply(this, arguments);

    this.jump = true;
    this.requireInput = true;
    this.input = null;
    this.moveToFirstCharacterOfLine = false;
  }

  // keymap: '

  _createClass(MoveToMark, [{
    key: 'initialize',
    value: function initialize() {
      this.readChar();
      _get(Object.getPrototypeOf(MoveToMark.prototype), 'initialize', this).call(this);
    }
  }, {
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var point = this.vimState.mark.get(this.input);
      if (point) {
        if (this.moveToFirstCharacterOfLine) {
          point = this.getFirstCharacterPositionForBufferRow(point.row);
        }
        cursor.setBufferPosition(point);
        cursor.autoscroll({ center: true });
      }
    }
  }]);

  return MoveToMark;
})(Motion);

var MoveToMarkLine = (function (_MoveToMark) {
  _inherits(MoveToMarkLine, _MoveToMark);

  function MoveToMarkLine() {
    _classCallCheck(this, MoveToMarkLine);

    _get(Object.getPrototypeOf(MoveToMarkLine.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.moveToFirstCharacterOfLine = true;
  }

  // Fold motion
  // -------------------------
  return MoveToMarkLine;
})(MoveToMark);

var MoveToPreviousFoldStart = (function (_Motion24) {
  _inherits(MoveToPreviousFoldStart, _Motion24);

  function MoveToPreviousFoldStart() {
    _classCallCheck(this, MoveToPreviousFoldStart);

    _get(Object.getPrototypeOf(MoveToPreviousFoldStart.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'characterwise';
    this.which = 'start';
    this.direction = 'previous';
  }

  _createClass(MoveToPreviousFoldStart, [{
    key: 'execute',
    value: function execute() {
      var _this21 = this;

      var foldRanges = this.utils.getCodeFoldRanges(this.editor);
      this.rows = foldRanges.map(function (range) {
        return range[_this21.which].row;
      }).sort(function (a, b) {
        return a - b;
      });
      if (this.direction === 'previous') this.rows.reverse();
      _get(Object.getPrototypeOf(MoveToPreviousFoldStart.prototype), 'execute', this).call(this);
    }
  }, {
    key: 'getScanRows',
    value: function getScanRows(cursor) {
      if (this.direction === 'previous') {
        return this.rows.filter(function (row) {
          return row < cursor.getBufferRow();
        });
      } else {
        return this.rows.filter(function (row) {
          return row > cursor.getBufferRow();
        });
      }
    }
  }, {
    key: 'detectRow',
    value: function detectRow(cursor) {
      return this.getScanRows(cursor)[0];
    }
  }, {
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this22 = this;

      this.moveCursorCountTimes(cursor, function () {
        var row = _this22.detectRow(cursor);
        if (row != null) _this22.utils.moveCursorToFirstCharacterAtRow(cursor, row);
      });
    }
  }]);

  return MoveToPreviousFoldStart;
})(Motion);

var MoveToNextFoldStart = (function (_MoveToPreviousFoldStart) {
  _inherits(MoveToNextFoldStart, _MoveToPreviousFoldStart);

  function MoveToNextFoldStart() {
    _classCallCheck(this, MoveToNextFoldStart);

    _get(Object.getPrototypeOf(MoveToNextFoldStart.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'next';
  }

  return MoveToNextFoldStart;
})(MoveToPreviousFoldStart);

var MoveToPreviousFoldStartWithSameIndent = (function (_MoveToPreviousFoldStart2) {
  _inherits(MoveToPreviousFoldStartWithSameIndent, _MoveToPreviousFoldStart2);

  function MoveToPreviousFoldStartWithSameIndent() {
    _classCallCheck(this, MoveToPreviousFoldStartWithSameIndent);

    _get(Object.getPrototypeOf(MoveToPreviousFoldStartWithSameIndent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MoveToPreviousFoldStartWithSameIndent, [{
    key: 'detectRow',
    value: function detectRow(cursor) {
      var _this23 = this;

      var baseIndentLevel = this.editor.indentationForBufferRow(cursor.getBufferRow());
      return this.getScanRows(cursor).find(function (row) {
        return _this23.editor.indentationForBufferRow(row) === baseIndentLevel;
      });
    }
  }]);

  return MoveToPreviousFoldStartWithSameIndent;
})(MoveToPreviousFoldStart);

var MoveToNextFoldStartWithSameIndent = (function (_MoveToPreviousFoldStartWithSameIndent) {
  _inherits(MoveToNextFoldStartWithSameIndent, _MoveToPreviousFoldStartWithSameIndent);

  function MoveToNextFoldStartWithSameIndent() {
    _classCallCheck(this, MoveToNextFoldStartWithSameIndent);

    _get(Object.getPrototypeOf(MoveToNextFoldStartWithSameIndent.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'next';
  }

  return MoveToNextFoldStartWithSameIndent;
})(MoveToPreviousFoldStartWithSameIndent);

var MoveToPreviousFoldEnd = (function (_MoveToPreviousFoldStart3) {
  _inherits(MoveToPreviousFoldEnd, _MoveToPreviousFoldStart3);

  function MoveToPreviousFoldEnd() {
    _classCallCheck(this, MoveToPreviousFoldEnd);

    _get(Object.getPrototypeOf(MoveToPreviousFoldEnd.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'end';
  }

  return MoveToPreviousFoldEnd;
})(MoveToPreviousFoldStart);

var MoveToNextFoldEnd = (function (_MoveToPreviousFoldEnd) {
  _inherits(MoveToNextFoldEnd, _MoveToPreviousFoldEnd);

  function MoveToNextFoldEnd() {
    _classCallCheck(this, MoveToNextFoldEnd);

    _get(Object.getPrototypeOf(MoveToNextFoldEnd.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'next';
  }

  // -------------------------
  return MoveToNextFoldEnd;
})(MoveToPreviousFoldEnd);

var MoveToPreviousFunction = (function (_MoveToPreviousFoldStart4) {
  _inherits(MoveToPreviousFunction, _MoveToPreviousFoldStart4);

  function MoveToPreviousFunction() {
    _classCallCheck(this, MoveToPreviousFunction);

    _get(Object.getPrototypeOf(MoveToPreviousFunction.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'previous';
  }

  _createClass(MoveToPreviousFunction, [{
    key: 'detectRow',
    value: function detectRow(cursor) {
      var _this24 = this;

      return this.getScanRows(cursor).find(function (row) {
        return _this24.utils.isIncludeFunctionScopeForRow(_this24.editor, row);
      });
    }
  }]);

  return MoveToPreviousFunction;
})(MoveToPreviousFoldStart);

var MoveToNextFunction = (function (_MoveToPreviousFunction) {
  _inherits(MoveToNextFunction, _MoveToPreviousFunction);

  function MoveToNextFunction() {
    _classCallCheck(this, MoveToNextFunction);

    _get(Object.getPrototypeOf(MoveToNextFunction.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'next';
  }

  return MoveToNextFunction;
})(MoveToPreviousFunction);

var MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle = (function (_MoveToPreviousFunction2) {
  _inherits(MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle, _MoveToPreviousFunction2);

  function MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle() {
    _classCallCheck(this, MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle);

    _get(Object.getPrototypeOf(MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle, [{
    key: 'execute',
    value: function execute() {
      _get(Object.getPrototypeOf(MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle.prototype), 'execute', this).call(this);
      this.getInstance('RedrawCursorLineAtUpperMiddle').execute();
    }
  }]);

  return MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle;
})(MoveToPreviousFunction);

var MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle = (function (_MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle) {
  _inherits(MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle, _MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle);

  function MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle() {
    _classCallCheck(this, MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle);

    _get(Object.getPrototypeOf(MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'next';
  }

  // Scope based
  // -------------------------
  return MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle;
})(MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle);

var MoveToPositionByScope = (function (_Motion25) {
  _inherits(MoveToPositionByScope, _Motion25);

  function MoveToPositionByScope() {
    _classCallCheck(this, MoveToPositionByScope);

    _get(Object.getPrototypeOf(MoveToPositionByScope.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'backward';
    this.scope = '.';
  }

  _createClass(MoveToPositionByScope, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this25 = this;

      this.moveCursorCountTimes(cursor, function () {
        var cursorPosition = cursor.getBufferPosition();
        var point = _this25.utils.detectScopeStartPositionForScope(_this25.editor, cursorPosition, _this25.direction, _this25.scope);
        if (point) cursor.setBufferPosition(point);
      });
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return MoveToPositionByScope;
})(Motion);

var MoveToPreviousString = (function (_MoveToPositionByScope) {
  _inherits(MoveToPreviousString, _MoveToPositionByScope);

  function MoveToPreviousString() {
    _classCallCheck(this, MoveToPreviousString);

    _get(Object.getPrototypeOf(MoveToPreviousString.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'backward';
    this.scope = 'string.begin';
  }

  return MoveToPreviousString;
})(MoveToPositionByScope);

var MoveToNextString = (function (_MoveToPreviousString) {
  _inherits(MoveToNextString, _MoveToPreviousString);

  function MoveToNextString() {
    _classCallCheck(this, MoveToNextString);

    _get(Object.getPrototypeOf(MoveToNextString.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'forward';
  }

  return MoveToNextString;
})(MoveToPreviousString);

var MoveToPreviousNumber = (function (_MoveToPositionByScope2) {
  _inherits(MoveToPreviousNumber, _MoveToPositionByScope2);

  function MoveToPreviousNumber() {
    _classCallCheck(this, MoveToPreviousNumber);

    _get(Object.getPrototypeOf(MoveToPreviousNumber.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'backward';
    this.scope = 'constant.numeric';
  }

  return MoveToPreviousNumber;
})(MoveToPositionByScope);

var MoveToNextNumber = (function (_MoveToPreviousNumber) {
  _inherits(MoveToNextNumber, _MoveToPreviousNumber);

  function MoveToNextNumber() {
    _classCallCheck(this, MoveToNextNumber);

    _get(Object.getPrototypeOf(MoveToNextNumber.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'forward';
  }

  return MoveToNextNumber;
})(MoveToPreviousNumber);

var MoveToNextOccurrence = (function (_Motion26) {
  _inherits(MoveToNextOccurrence, _Motion26);

  function MoveToNextOccurrence() {
    _classCallCheck(this, MoveToNextOccurrence);

    _get(Object.getPrototypeOf(MoveToNextOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.jump = true;
    this.direction = 'next';
  }

  _createClass(MoveToNextOccurrence, [{
    key: 'execute',
    value: function execute() {
      this.ranges = this.utils.sortRanges(this.occurrenceManager.getMarkers().map(function (marker) {
        return marker.getBufferRange();
      }));
      _get(Object.getPrototypeOf(MoveToNextOccurrence.prototype), 'execute', this).call(this);
    }
  }, {
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var range = this.ranges[this.utils.getIndex(this.getIndex(cursor.getBufferPosition()), this.ranges)];
      var point = range.start;
      cursor.setBufferPosition(point, { autoscroll: false });

      this.editor.unfoldBufferRow(point.row);
      if (cursor.isLastCursor()) {
        this.utils.smartScrollToBufferPosition(this.editor, point);
      }

      if (this.getConfig('flashOnMoveToOccurrence')) {
        this.vimState.flash(range, { type: 'search' });
      }
    }
  }, {
    key: 'getIndex',
    value: function getIndex(fromPoint) {
      var index = this.ranges.findIndex(function (range) {
        return range.start.isGreaterThan(fromPoint);
      });
      return (index >= 0 ? index : 0) + this.getCount() - 1;
    }
  }], [{
    key: 'commandScope',

    // Ensure this command is available when only has-occurrence
    value: 'atom-text-editor.vim-mode-plus.has-occurrence',
    enumerable: true
  }]);

  return MoveToNextOccurrence;
})(Motion);

var MoveToPreviousOccurrence = (function (_MoveToNextOccurrence) {
  _inherits(MoveToPreviousOccurrence, _MoveToNextOccurrence);

  function MoveToPreviousOccurrence() {
    _classCallCheck(this, MoveToPreviousOccurrence);

    _get(Object.getPrototypeOf(MoveToPreviousOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'previous';
  }

  // -------------------------
  // keymap: %

  _createClass(MoveToPreviousOccurrence, [{
    key: 'getIndex',
    value: function getIndex(fromPoint) {
      var ranges = this.ranges.slice().reverse();
      var range = ranges.find(function (range) {
        return range.end.isLessThan(fromPoint);
      });
      var index = range ? this.ranges.indexOf(range) : this.ranges.length - 1;
      return index - (this.getCount() - 1);
    }
  }]);

  return MoveToPreviousOccurrence;
})(MoveToNextOccurrence);

var MoveToPair = (function (_Motion27) {
  _inherits(MoveToPair, _Motion27);

  function MoveToPair() {
    _classCallCheck(this, MoveToPair);

    _get(Object.getPrototypeOf(MoveToPair.prototype), 'constructor', this).apply(this, arguments);

    this.inclusive = true;
    this.jump = true;
    this.member = ['Parenthesis', 'CurlyBracket', 'SquareBracket'];
  }

  _createClass(MoveToPair, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var point = this.getPoint(cursor);
      if (point) cursor.setBufferPosition(point);
    }
  }, {
    key: 'getPointForTag',
    value: function getPointForTag(point) {
      var pairInfo = this.getInstance('ATag').getPairInfo(point);
      if (!pairInfo) return;

      var openRange = pairInfo.openRange;
      var closeRange = pairInfo.closeRange;

      openRange = openRange.translate([0, +1], [0, -1]);
      closeRange = closeRange.translate([0, +1], [0, -1]);
      if (openRange.containsPoint(point) && !point.isEqual(openRange.end)) {
        return closeRange.start;
      }
      if (closeRange.containsPoint(point) && !point.isEqual(closeRange.end)) {
        return openRange.start;
      }
    }
  }, {
    key: 'getPoint',
    value: function getPoint(cursor) {
      var cursorPosition = cursor.getBufferPosition();
      var cursorRow = cursorPosition.row;
      var point = this.getPointForTag(cursorPosition);
      if (point) return point;

      // AAnyPairAllowForwarding return forwarding range or enclosing range.
      var range = this.getInstance('AAnyPairAllowForwarding', { member: this.member }).getRange(cursor.selection);
      if (!range) return;

      var start = range.start;
      var end = range.end;

      if (start.row === cursorRow && start.isGreaterThanOrEqual(cursorPosition)) {
        // Forwarding range found
        return end.translate([0, -1]);
      } else if (end.row === cursorPosition.row) {
        // Enclosing range was returned
        // We move to start( open-pair ) only when close-pair was at same row as cursor-row.
        return start;
      }
    }
  }]);

  return MoveToPair;
})(Motion);

module.exports = {
  Motion: Motion,
  CurrentSelection: CurrentSelection,
  MoveLeft: MoveLeft,
  MoveRight: MoveRight,
  MoveRightBufferColumn: MoveRightBufferColumn,
  MoveUp: MoveUp,
  MoveUpWrap: MoveUpWrap,
  MoveDown: MoveDown,
  MoveDownWrap: MoveDownWrap,
  MoveUpScreen: MoveUpScreen,
  MoveDownScreen: MoveDownScreen,
  MoveUpToEdge: MoveUpToEdge,
  MoveDownToEdge: MoveDownToEdge,
  WordMotion: WordMotion,
  MoveToNextWord: MoveToNextWord,
  MoveToNextWholeWord: MoveToNextWholeWord,
  MoveToNextAlphanumericWord: MoveToNextAlphanumericWord,
  MoveToNextSmartWord: MoveToNextSmartWord,
  MoveToNextSubword: MoveToNextSubword,
  MoveToPreviousWord: MoveToPreviousWord,
  MoveToPreviousWholeWord: MoveToPreviousWholeWord,
  MoveToPreviousAlphanumericWord: MoveToPreviousAlphanumericWord,
  MoveToPreviousSmartWord: MoveToPreviousSmartWord,
  MoveToPreviousSubword: MoveToPreviousSubword,
  MoveToEndOfWord: MoveToEndOfWord,
  MoveToEndOfWholeWord: MoveToEndOfWholeWord,
  MoveToEndOfAlphanumericWord: MoveToEndOfAlphanumericWord,
  MoveToEndOfSmartWord: MoveToEndOfSmartWord,
  MoveToEndOfSubword: MoveToEndOfSubword,
  MoveToPreviousEndOfWord: MoveToPreviousEndOfWord,
  MoveToPreviousEndOfWholeWord: MoveToPreviousEndOfWholeWord,
  MoveToNextSentence: MoveToNextSentence,
  MoveToPreviousSentence: MoveToPreviousSentence,
  MoveToNextSentenceSkipBlankRow: MoveToNextSentenceSkipBlankRow,
  MoveToPreviousSentenceSkipBlankRow: MoveToPreviousSentenceSkipBlankRow,
  MoveToNextParagraph: MoveToNextParagraph,
  MoveToPreviousParagraph: MoveToPreviousParagraph,
  MoveToNextDiffHunk: MoveToNextDiffHunk,
  MoveToPreviousDiffHunk: MoveToPreviousDiffHunk,
  MoveToBeginningOfLine: MoveToBeginningOfLine,
  MoveToColumn: MoveToColumn,
  MoveToLastCharacterOfLine: MoveToLastCharacterOfLine,
  MoveToLastNonblankCharacterOfLineAndDown: MoveToLastNonblankCharacterOfLineAndDown,
  MoveToFirstCharacterOfLine: MoveToFirstCharacterOfLine,
  MoveToFirstCharacterOfLineUp: MoveToFirstCharacterOfLineUp,
  MoveToFirstCharacterOfLineDown: MoveToFirstCharacterOfLineDown,
  MoveToFirstCharacterOfLineAndDown: MoveToFirstCharacterOfLineAndDown,
  MoveToScreenColumn: MoveToScreenColumn,
  MoveToBeginningOfScreenLine: MoveToBeginningOfScreenLine,
  MoveToFirstCharacterOfScreenLine: MoveToFirstCharacterOfScreenLine,
  MoveToLastCharacterOfScreenLine: MoveToLastCharacterOfScreenLine,
  MoveToFirstLine: MoveToFirstLine,
  MoveToLastLine: MoveToLastLine,
  MoveToLineByPercent: MoveToLineByPercent,
  MoveToRelativeLine: MoveToRelativeLine,
  MoveToRelativeLineMinimumTwo: MoveToRelativeLineMinimumTwo,
  MoveToTopOfScreen: MoveToTopOfScreen,
  MoveToMiddleOfScreen: MoveToMiddleOfScreen,
  MoveToBottomOfScreen: MoveToBottomOfScreen,
  Scroll: Scroll,
  ScrollFullScreenDown: ScrollFullScreenDown,
  ScrollFullScreenUp: ScrollFullScreenUp,
  ScrollHalfScreenDown: ScrollHalfScreenDown,
  ScrollHalfScreenUp: ScrollHalfScreenUp,
  ScrollQuarterScreenDown: ScrollQuarterScreenDown,
  ScrollQuarterScreenUp: ScrollQuarterScreenUp,
  Find: Find,
  FindBackwards: FindBackwards,
  Till: Till,
  TillBackwards: TillBackwards,
  MoveToMark: MoveToMark,
  MoveToMarkLine: MoveToMarkLine,
  MoveToPreviousFoldStart: MoveToPreviousFoldStart,
  MoveToNextFoldStart: MoveToNextFoldStart,
  MoveToPreviousFoldStartWithSameIndent: MoveToPreviousFoldStartWithSameIndent,
  MoveToNextFoldStartWithSameIndent: MoveToNextFoldStartWithSameIndent,
  MoveToPreviousFoldEnd: MoveToPreviousFoldEnd,
  MoveToNextFoldEnd: MoveToNextFoldEnd,
  MoveToPreviousFunction: MoveToPreviousFunction,
  MoveToNextFunction: MoveToNextFunction,
  MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle: MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle,
  MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle: MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle,
  MoveToPositionByScope: MoveToPositionByScope,
  MoveToPreviousString: MoveToPreviousString,
  MoveToNextString: MoveToNextString,
  MoveToPreviousNumber: MoveToPreviousNumber,
  MoveToNextNumber: MoveToNextNumber,
  MoveToNextOccurrence: MoveToNextOccurrence,
  MoveToPreviousOccurrence: MoveToPreviousOccurrence,
  MoveToPair: MoveToPair
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmRvdGZpbGVzL2F0b20uc3ltbGluay9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9tb3Rpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7O2VBRVksT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBL0IsS0FBSyxZQUFMLEtBQUs7SUFBRSxLQUFLLFlBQUwsS0FBSzs7QUFFbkIsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBOztJQUV4QixNQUFNO1lBQU4sTUFBTTs7V0FBTixNQUFNOzBCQUFOLE1BQU07OytCQUFOLE1BQU07O1NBSVYsUUFBUSxHQUFHLElBQUk7U0FDZixTQUFTLEdBQUcsS0FBSztTQUNqQixJQUFJLEdBQUcsZUFBZTtTQUN0QixJQUFJLEdBQUcsS0FBSztTQUNaLGNBQWMsR0FBRyxLQUFLO1NBQ3RCLGFBQWEsR0FBRyxJQUFJO1NBQ3BCLHFCQUFxQixHQUFHLEtBQUs7U0FDN0IsZUFBZSxHQUFHLEtBQUs7U0FDdkIsWUFBWSxHQUFHLEtBQUs7U0FDcEIsbUJBQW1CLEdBQUcsSUFBSTs7Ozs7ZUFidEIsTUFBTTs7V0FlRixtQkFBRztBQUNULGFBQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFBO0tBQ2hEOzs7V0FFVSxzQkFBRztBQUNaLGFBQU8sSUFBSSxDQUFDLElBQUksS0FBSyxVQUFVLENBQUE7S0FDaEM7OztXQUVXLHVCQUFHO0FBQ2IsYUFBTyxJQUFJLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQTtLQUNqQzs7O1dBRVMsbUJBQUMsSUFBSSxFQUFFO0FBQ2YsVUFBSSxJQUFJLEtBQUssZUFBZSxFQUFFO0FBQzVCLFlBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksS0FBSyxVQUFVLEdBQUcsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQTtP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cUIsRUFBckIscUJBQXFCO0FBQ3JCLE1BQUksRUFBSixJQUFJO0FBQ0osZUFBYSxFQUFiLGFBQWE7QUFDYixNQUFJLEVBQUosSUFBSTtBQUNKLGVBQWEsRUFBYixhQUFhO0FBQ2IsWUFBVSxFQUFWLFVBQVU7QUFDVixnQkFBYyxFQUFkLGNBQWM7QUFDZCx5QkFBdUIsRUFBdkIsdUJBQXVCO0FBQ3ZCLHFCQUFtQixFQUFuQixtQkFBbUI7QUFDbkIsdUNBQXFDLEVBQXJDLHFDQUFxQztBQUNyQyxtQ0FBaUMsRUFBakMsaUNBQWlDO0FBQ2pDLHVCQUFxQixFQUFyQixxQkFBcUI7QUFDckIsbUJBQWlCLEVBQWpCLGlCQUFpQjtBQUNqQix3QkFBc0IsRUFBdEIsc0JBQXNCO0FBQ3RCLG9CQUFrQixFQUFsQixrQkFBa0I7QUFDbEIsd0RBQXNELEVBQXRELHNEQUFzRDtBQUN0RCxvREFBa0QsRUFBbEQsa0RBQWtEO0FBQ2xELHVCQUFxQixFQUFyQixxQkFBcUI7QUFDckIsc0JBQW9CLEVBQXBCLG9CQUFvQjtBQUNwQixrQkFBZ0IsRUFBaEIsZ0JBQWdCO0FBQ2hCLHNCQUFvQixFQUFwQixvQkFBb0I7QUFDcEIsa0JBQWdCLEVBQWhCLGdCQUFnQjtBQUNoQixzQkFBb0IsRUFBcEIsb0JBQW9CO0FBQ3BCLDBCQUF3QixFQUF4Qix3QkFBd0I7QUFDeEIsWUFBVSxFQUFWLFVBQVU7Q0FDWCxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmRvdGZpbGVzL2F0b20uc3ltbGluay9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9tb3Rpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5jb25zdCB7UG9pbnQsIFJhbmdlfSA9IHJlcXVpcmUoJ2F0b20nKVxuXG5jb25zdCBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJylcblxuY2xhc3MgTW90aW9uIGV4dGVuZHMgQmFzZSB7XG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gJ21vdGlvbidcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuXG4gIG9wZXJhdG9yID0gbnVsbFxuICBpbmNsdXNpdmUgPSBmYWxzZVxuICB3aXNlID0gJ2NoYXJhY3Rlcndpc2UnXG4gIGp1bXAgPSBmYWxzZVxuICB2ZXJ0aWNhbE1vdGlvbiA9IGZhbHNlXG4gIG1vdmVTdWNjZWVkZWQgPSBudWxsXG4gIG1vdmVTdWNjZXNzT25MaW5ld2lzZSA9IGZhbHNlXG4gIHNlbGVjdFN1Y2NlZWRlZCA9IGZhbHNlXG4gIHJlcXVpcmVJbnB1dCA9IGZhbHNlXG4gIGNhc2VTZW5zaXRpdml0eUtpbmQgPSBudWxsXG5cbiAgaXNSZWFkeSAoKSB7XG4gICAgcmV0dXJuICF0aGlzLnJlcXVpcmVJbnB1dCB8fCB0aGlzLmlucHV0ICE9IG51bGxcbiAgfVxuXG4gIGlzTGluZXdpc2UgKCkge1xuICAgIHJldHVybiB0aGlzLndpc2UgPT09ICdsaW5ld2lzZSdcbiAgfVxuXG4gIGlzQmxvY2t3aXNlICgpIHtcbiAgICByZXR1cm4gdGhpcy53aXNlID09PSAnYmxvY2t3aXNlJ1xuICB9XG5cbiAgZm9yY2VXaXNlICh3aXNlKSB7XG4gICAgaWYgKHdpc2UgPT09ICdjaGFyYWN0ZXJ3aXNlJykge1xuICAgICAgdGhpcy5pbmNsdXNpdmUgPSB0aGlzLndpc2UgPT09ICdsaW5ld2lzZScgPyBmYWxzZSA6ICF0aGlzLmluY2x1c2l2ZVxuICAgIH1cbiAgICB0aGlzLndpc2UgPSB3aXNlXG4gIH1cblxuICByZXNldFN0YXRlICgpIHtcbiAgICB0aGlzLnNlbGVjdFN1Y2NlZWRlZCA9IGZhbHNlXG4gIH1cblxuICBtb3ZlV2l0aFNhdmVKdW1wIChjdXJzb3IpIHtcbiAgICBjb25zdCBvcmlnaW5hbFBvc2l0aW9uID0gdGhpcy5qdW1wICYmIGN1cnNvci5pc0xhc3RDdXJzb3IoKSA/IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpIDogdW5kZWZpbmVkXG5cbiAgICB0aGlzLm1vdmVDdXJzb3IoY3Vyc29yKVxuXG4gICAgaWYgKG9yaWdpbmFsUG9zaXRpb24gJiYgIWN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLmlzRXF1YWwob3JpZ2luYWxQb3NpdGlvbikpIHtcbiAgICAgIHRoaXMudmltU3RhdGUubWFyay5zZXQoJ2AnLCBvcmlnaW5hbFBvc2l0aW9uKVxuICAgICAgdGhpcy52aW1TdGF0ZS5tYXJrLnNldChcIidcIiwgb3JpZ2luYWxQb3NpdGlvbilcbiAgICB9XG4gIH1cblxuICBleGVjdXRlICgpIHtcbiAgICBpZiAodGhpcy5vcGVyYXRvcikge1xuICAgICAgdGhpcy5zZWxlY3QoKVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgICAgdGhpcy5tb3ZlV2l0aFNhdmVKdW1wKGN1cnNvcilcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5lZGl0b3IubWVyZ2VDdXJzb3JzKClcbiAgICB0aGlzLmVkaXRvci5tZXJnZUludGVyc2VjdGluZ1NlbGVjdGlvbnMoKVxuICB9XG5cbiAgLy8gTk9URTogc2VsZWN0aW9uIGlzIGFscmVhZHkgXCJub3JtYWxpemVkXCIgYmVmb3JlIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkLlxuICBzZWxlY3QgKCkge1xuICAgIC8vIG5lZWQgdG8gY2FyZSB3YXMgdmlzdWFsIGZvciBgLmAgcmVwZWF0ZWQuXG4gICAgY29uc3QgaXNPcldhc1Zpc3VhbCA9IHRoaXMub3BlcmF0b3IuaW5zdGFuY2VvZignU2VsZWN0QmFzZScpIHx8IHRoaXMubmFtZSA9PT0gJ0N1cnJlbnRTZWxlY3Rpb24nXG5cbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIHNlbGVjdGlvbi5tb2RpZnlTZWxlY3Rpb24oKCkgPT4gdGhpcy5tb3ZlV2l0aFNhdmVKdW1wKHNlbGVjdGlvbi5jdXJzb3IpKVxuXG4gICAgICBjb25zdCBzZWxlY3RTdWNjZWVkZWQgPVxuICAgICAgICB0aGlzLm1vdmVTdWNjZWVkZWQgIT0gbnVsbFxuICAgICAgICAgID8gdGhpcy5tb3ZlU3VjY2VlZGVkXG4gICAgICAgICAgOiAhc2VsZWN0aW9uLmlzRW1wdHkoKSB8fCAodGhpcy5pc0xpbmV3aXNlKCkgJiYgdGhpcy5tb3ZlU3VjY2Vzc09uTGluZXdpc2UpXG4gICAgICBpZiAoIXRoaXMuc2VsZWN0U3VjY2VlZGVkKSB0aGlzLnNlbGVjdFN1Y2NlZWRlZCA9IHNlbGVjdFN1Y2NlZWRlZFxuXG4gICAgICBpZiAoaXNPcldhc1Zpc3VhbCB8fCAoc2VsZWN0U3VjY2VlZGVkICYmICh0aGlzLmluY2x1c2l2ZSB8fCB0aGlzLmlzTGluZXdpc2UoKSkpKSB7XG4gICAgICAgIGNvbnN0ICRzZWxlY3Rpb24gPSB0aGlzLnN3cmFwKHNlbGVjdGlvbilcbiAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcyh0cnVlKSAvLyBzYXZlIHByb3BlcnR5IG9mIFwiYWxyZWFkeS1ub3JtYWxpemVkLXNlbGVjdGlvblwiXG4gICAgICAgICRzZWxlY3Rpb24uYXBwbHlXaXNlKHRoaXMud2lzZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy53aXNlID09PSAnYmxvY2t3aXNlJykge1xuICAgICAgdGhpcy52aW1TdGF0ZS5nZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKCkuYXV0b3Njcm9sbCgpXG4gICAgfVxuICB9XG5cbiAgc2V0Q3Vyc29yQnVmZmVyUm93IChjdXJzb3IsIHJvdywgb3B0aW9ucykge1xuICAgIGlmICh0aGlzLnZlcnRpY2FsTW90aW9uICYmICF0aGlzLmdldENvbmZpZygnc3RheU9uVmVydGljYWxNb3Rpb24nKSkge1xuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhyb3cpLCBvcHRpb25zKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlclJvdyhjdXJzb3IsIHJvdywgb3B0aW9ucylcbiAgICB9XG4gIH1cblxuICAvLyBDYWxsIGNhbGxiYWNrIGNvdW50IHRpbWVzLlxuICAvLyBCdXQgYnJlYWsgaXRlcmF0aW9uIHdoZW4gY3Vyc29yIHBvc2l0aW9uIGRpZCBub3QgY2hhbmdlIGJlZm9yZS9hZnRlciBjYWxsYmFjay5cbiAgbW92ZUN1cnNvckNvdW50VGltZXMgKGN1cnNvciwgZm4pIHtcbiAgICBsZXQgb2xkUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIHRoaXMuY291bnRUaW1lcyh0aGlzLmdldENvdW50KCksIHN0YXRlID0+IHtcbiAgICAgIGZuKHN0YXRlKVxuICAgICAgY29uc3QgbmV3UG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgaWYgKG5ld1Bvc2l0aW9uLmlzRXF1YWwob2xkUG9zaXRpb24pKSBzdGF0ZS5zdG9wKClcbiAgICAgIG9sZFBvc2l0aW9uID0gbmV3UG9zaXRpb25cbiAgICB9KVxuICB9XG5cbiAgaXNDYXNlU2Vuc2l0aXZlICh0ZXJtKSB7XG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKGB1c2VTbWFydGNhc2VGb3Ike3RoaXMuY2FzZVNlbnNpdGl2aXR5S2luZH1gKSkge1xuICAgICAgcmV0dXJuIHRlcm0uc2VhcmNoKC9bQS1aXS8pICE9PSAtMVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gIXRoaXMuZ2V0Q29uZmlnKGBpZ25vcmVDYXNlRm9yJHt0aGlzLmNhc2VTZW5zaXRpdml0eUtpbmR9YClcbiAgICB9XG4gIH1cblxuICBnZXRMYXN0UmVzb3J0UG9pbnQgKGRpcmVjdGlvbikge1xuICAgIGlmIChkaXJlY3Rpb24gPT09ICduZXh0Jykge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFBvaW50KDAsIDApXG4gICAgfVxuICB9XG59XG5cbi8vIFVzZWQgYXMgb3BlcmF0b3IncyB0YXJnZXQgaW4gdmlzdWFsLW1vZGUuXG5jbGFzcyBDdXJyZW50U2VsZWN0aW9uIGV4dGVuZHMgTW90aW9uIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBzZWxlY3Rpb25FeHRlbnQgPSBudWxsXG4gIGJsb2Nrd2lzZVNlbGVjdGlvbkV4dGVudCA9IG51bGxcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuICBwb2ludEluZm9CeUN1cnNvciA9IG5ldyBNYXAoKVxuXG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIGlmICh0aGlzLm1vZGUgPT09ICd2aXN1YWwnKSB7XG4gICAgICB0aGlzLnNlbGVjdGlvbkV4dGVudCA9IHRoaXMuaXNCbG9ja3dpc2UoKVxuICAgICAgICA/IHRoaXMuc3dyYXAoY3Vyc29yLnNlbGVjdGlvbikuZ2V0QmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50KClcbiAgICAgICAgOiB0aGlzLmVkaXRvci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKCkuZ2V0RXh0ZW50KClcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gYC5gIHJlcGVhdCBjYXNlXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkudHJhbnNsYXRlKHRoaXMuc2VsZWN0aW9uRXh0ZW50KSlcbiAgICB9XG4gIH1cblxuICBzZWxlY3QgKCkge1xuICAgIGlmICh0aGlzLm1vZGUgPT09ICd2aXN1YWwnKSB7XG4gICAgICBzdXBlci5zZWxlY3QoKVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgICAgY29uc3QgcG9pbnRJbmZvID0gdGhpcy5wb2ludEluZm9CeUN1cnNvci5nZXQoY3Vyc29yKVxuICAgICAgICBpZiAocG9pbnRJbmZvKSB7XG4gICAgICAgICAgY29uc3Qge2N1cnNvclBvc2l0aW9uLCBzdGFydE9mU2VsZWN0aW9ufSA9IHBvaW50SW5mb1xuICAgICAgICAgIGlmIChjdXJzb3JQb3NpdGlvbi5pc0VxdWFsKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKSkge1xuICAgICAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHN0YXJ0T2ZTZWxlY3Rpb24pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzdXBlci5zZWxlY3QoKVxuICAgIH1cblxuICAgIC8vICogUHVycG9zZSBvZiBwb2ludEluZm9CeUN1cnNvcj8gc2VlICMyMzUgZm9yIGRldGFpbC5cbiAgICAvLyBXaGVuIHN0YXlPblRyYW5zZm9ybVN0cmluZyBpcyBlbmFibGVkLCBjdXJzb3IgcG9zIGlzIG5vdCBzZXQgb24gc3RhcnQgb2ZcbiAgICAvLyBvZiBzZWxlY3RlZCByYW5nZS5cbiAgICAvLyBCdXQgSSB3YW50IGZvbGxvd2luZyBiZWhhdmlvciwgc28gbmVlZCB0byBwcmVzZXJ2ZSBwb3NpdGlvbiBpbmZvLlxuICAgIC8vICAxLiBgdmo+LmAgLT4gaW5kZW50IHNhbWUgdHdvIHJvd3MgcmVnYXJkbGVzcyBvZiBjdXJyZW50IGN1cnNvcidzIHJvdy5cbiAgICAvLyAgMi4gYHZqPmouYCAtPiBpbmRlbnQgdHdvIHJvd3MgZnJvbSBjdXJzb3IncyByb3cuXG4gICAgZm9yIChjb25zdCBjdXJzb3Igb2YgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29ycygpKSB7XG4gICAgICBjb25zdCBzdGFydE9mU2VsZWN0aW9uID0gY3Vyc29yLnNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG4gICAgICB0aGlzLm9uRGlkRmluaXNoT3BlcmF0aW9uKCgpID0+IHtcbiAgICAgICAgY29uc3QgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgICB0aGlzLnBvaW50SW5mb0J5Q3Vyc29yLnNldChjdXJzb3IsIHtzdGFydE9mU2VsZWN0aW9uLCBjdXJzb3JQb3NpdGlvbn0pXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBNb3ZlTGVmdCBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIGNvbnN0IGFsbG93V3JhcCA9IHRoaXMuZ2V0Q29uZmlnKCd3cmFwTGVmdFJpZ2h0TW90aW9uJylcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgdGhpcy51dGlscy5tb3ZlQ3Vyc29yTGVmdChjdXJzb3IsIHthbGxvd1dyYXB9KVxuICAgIH0pXG4gIH1cbn1cblxuY2xhc3MgTW92ZVJpZ2h0IGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgY29uc3QgYWxsb3dXcmFwID0gdGhpcy5nZXRDb25maWcoJ3dyYXBMZWZ0UmlnaHRNb3Rpb24nKVxuXG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIHRoaXMuZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG5cbiAgICAgIC8vIC0gV2hlbiBgd3JhcExlZnRSaWdodE1vdGlvbmAgZW5hYmxlZCBhbmQgZXhlY3V0ZWQgYXMgcHVyZS1tb3Rpb24gaW4gYG5vcm1hbC1tb2RlYCxcbiAgICAgIC8vICAgd2UgbmVlZCB0byBtb3ZlICoqYWdhaW4qKiB0byB3cmFwIHRvIG5leHQtbGluZSBpZiBpdCByYWNoZWQgdG8gRU9MLlxuICAgICAgLy8gLSBFeHByZXNzaW9uIGAhdGhpcy5vcGVyYXRvcmAgbWVhbnMgbm9ybWFsLW1vZGUgbW90aW9uLlxuICAgICAgLy8gLSBFeHByZXNzaW9uIGB0aGlzLm1vZGUgPT09IFwibm9ybWFsXCJgIGlzIG5vdCBhcHByb3ByZWF0ZSBzaW5jZSBpdCBtYXRjaGVzIGB4YCBvcGVyYXRvcidzIHRhcmdldCBjYXNlLlxuICAgICAgY29uc3QgbmVlZE1vdmVBZ2FpbiA9IGFsbG93V3JhcCAmJiAhdGhpcy5vcGVyYXRvciAmJiAhY3Vyc29yLmlzQXRFbmRPZkxpbmUoKVxuXG4gICAgICB0aGlzLnV0aWxzLm1vdmVDdXJzb3JSaWdodChjdXJzb3IsIHthbGxvd1dyYXB9KVxuXG4gICAgICBpZiAobmVlZE1vdmVBZ2FpbiAmJiBjdXJzb3IuaXNBdEVuZE9mTGluZSgpKSB7XG4gICAgICAgIHRoaXMudXRpbHMubW92ZUN1cnNvclJpZ2h0KGN1cnNvciwge2FsbG93V3JhcH0pXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlUmlnaHRCdWZmZXJDb2x1bW4gZXh0ZW5kcyBNb3Rpb24ge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIHRoaXMudXRpbHMuc2V0QnVmZmVyQ29sdW1uKGN1cnNvciwgY3Vyc29yLmdldEJ1ZmZlckNvbHVtbigpICsgdGhpcy5nZXRDb3VudCgpKVxuICB9XG59XG5cbmNsYXNzIE1vdmVVcCBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG4gIHdyYXAgPSBmYWxzZVxuICBkaXJlY3Rpb24gPSAndXAnXG5cbiAgZ2V0QnVmZmVyUm93IChyb3cpIHtcbiAgICBjb25zdCBtaW4gPSAwXG4gICAgY29uc3QgbWF4ID0gdGhpcy5nZXRWaW1MYXN0QnVmZmVyUm93KClcblxuICAgIGlmICh0aGlzLmRpcmVjdGlvbiA9PT0gJ3VwJykge1xuICAgICAgcm93ID0gdGhpcy5nZXRGb2xkU3RhcnRSb3dGb3JSb3cocm93KSAtIDFcbiAgICAgIHJvdyA9IHRoaXMud3JhcCAmJiByb3cgPCBtaW4gPyBtYXggOiB0aGlzLmxpbWl0TnVtYmVyKHJvdywge21pbn0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHJvdyA9IHRoaXMuZ2V0Rm9sZEVuZFJvd0ZvclJvdyhyb3cpICsgMVxuICAgICAgcm93ID0gdGhpcy53cmFwICYmIHJvdyA+IG1heCA/IG1pbiA6IHRoaXMubGltaXROdW1iZXIocm93LCB7bWF4fSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2V0Rm9sZFN0YXJ0Um93Rm9yUm93KHJvdylcbiAgfVxuXG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCByb3cgPSB0aGlzLmdldEJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlclJvdyhjdXJzb3IsIHJvdylcbiAgICB9KVxuICB9XG59XG5cbmNsYXNzIE1vdmVVcFdyYXAgZXh0ZW5kcyBNb3ZlVXAge1xuICB3cmFwID0gdHJ1ZVxufVxuXG5jbGFzcyBNb3ZlRG93biBleHRlbmRzIE1vdmVVcCB7XG4gIGRpcmVjdGlvbiA9ICdkb3duJ1xufVxuXG5jbGFzcyBNb3ZlRG93bldyYXAgZXh0ZW5kcyBNb3ZlRG93biB7XG4gIHdyYXAgPSB0cnVlXG59XG5cbmNsYXNzIE1vdmVVcFNjcmVlbiBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG4gIGRpcmVjdGlvbiA9ICd1cCdcbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIHRoaXMudXRpbHMubW92ZUN1cnNvclVwU2NyZWVuKGN1cnNvcilcbiAgICB9KVxuICB9XG59XG5cbmNsYXNzIE1vdmVEb3duU2NyZWVuIGV4dGVuZHMgTW92ZVVwU2NyZWVuIHtcbiAgd2lzZSA9ICdsaW5ld2lzZSdcbiAgZGlyZWN0aW9uID0gJ2Rvd24nXG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICB0aGlzLnV0aWxzLm1vdmVDdXJzb3JEb3duU2NyZWVuKGN1cnNvcilcbiAgICB9KVxuICB9XG59XG5cbmNsYXNzIE1vdmVVcFRvRWRnZSBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG4gIGp1bXAgPSB0cnVlXG4gIGRpcmVjdGlvbiA9ICdwcmV2aW91cydcbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRQb2ludChjdXJzb3IuZ2V0U2NyZWVuUG9zaXRpb24oKSlcbiAgICAgIGlmIChwb2ludCkgY3Vyc29yLnNldFNjcmVlblBvc2l0aW9uKHBvaW50KVxuICAgIH0pXG4gIH1cblxuICBnZXRQb2ludCAoZnJvbVBvaW50KSB7XG4gICAgY29uc3Qge2NvbHVtbiwgcm93OiBzdGFydFJvd30gPSBmcm9tUG9pbnRcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiB0aGlzLmdldFNjcmVlblJvd3Moe3N0YXJ0Um93LCBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9ufSkpIHtcbiAgICAgIGNvbnN0IHBvaW50ID0gbmV3IFBvaW50KHJvdywgY29sdW1uKVxuICAgICAgaWYgKHRoaXMuaXNFZGdlKHBvaW50KSkgcmV0dXJuIHBvaW50XG4gICAgfVxuICB9XG5cbiAgaXNFZGdlIChwb2ludCkge1xuICAgIC8vIElmIHBvaW50IGlzIHN0b3BwYWJsZSBhbmQgYWJvdmUgb3IgYmVsb3cgcG9pbnQgaXMgbm90IHN0b3BwYWJsZSwgaXQncyBFZGdlIVxuICAgIHJldHVybiAoXG4gICAgICB0aGlzLmlzU3RvcHBhYmxlKHBvaW50KSAmJlxuICAgICAgKCF0aGlzLmlzU3RvcHBhYmxlKHBvaW50LnRyYW5zbGF0ZShbLTEsIDBdKSkgfHwgIXRoaXMuaXNTdG9wcGFibGUocG9pbnQudHJhbnNsYXRlKFsrMSwgMF0pKSlcbiAgICApXG4gIH1cblxuICBpc1N0b3BwYWJsZSAocG9pbnQpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5pc05vbldoaXRlU3BhY2UocG9pbnQpIHx8XG4gICAgICB0aGlzLmlzRmlyc3RSb3dPckxhc3RSb3dBbmRTdG9wcGFibGUocG9pbnQpIHx8XG4gICAgICAvLyBJZiByaWdodCBvciBsZWZ0IGNvbHVtbiBpcyBub24td2hpdGUtc3BhY2UgY2hhciwgaXQncyBzdG9wcGFibGUuXG4gICAgICAodGhpcy5pc05vbldoaXRlU3BhY2UocG9pbnQudHJhbnNsYXRlKFswLCAtMV0pKSAmJiB0aGlzLmlzTm9uV2hpdGVTcGFjZShwb2ludC50cmFuc2xhdGUoWzAsICsxXSkpKVxuICAgIClcbiAgfVxuXG4gIGlzTm9uV2hpdGVTcGFjZSAocG9pbnQpIHtcbiAgICBjb25zdCBjaGFyID0gdGhpcy51dGlscy5nZXRUZXh0SW5TY3JlZW5SYW5nZSh0aGlzLmVkaXRvciwgUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHBvaW50LCAwLCAxKSlcbiAgICByZXR1cm4gY2hhciAhPSBudWxsICYmIC9cXFMvLnRlc3QoY2hhcilcbiAgfVxuXG4gIGlzRmlyc3RSb3dPckxhc3RSb3dBbmRTdG9wcGFibGUgKHBvaW50KSB7XG4gICAgLy8gSW4gbm90bWFsLW1vZGUsIGN1cnNvciBpcyBOT1Qgc3RvcHBhYmxlIHRvIEVPTCBvZiBub24tYmxhbmsgcm93LlxuICAgIC8vIFNvIGV4cGxpY2l0bHkgZ3VhcmQgdG8gbm90IGFuc3dlciBpdCBzdG9wcGFibGUuXG4gICAgaWYgKHRoaXMubW9kZSA9PT0gJ25vcm1hbCcgJiYgdGhpcy51dGlscy5wb2ludElzQXRFbmRPZkxpbmVBdE5vbkVtcHR5Um93KHRoaXMuZWRpdG9yLCBwb2ludCkpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIC8vIElmIGNsaXBwZWQsIGl0IG1lYW5zIHRoYXQgb3JpZ2luYWwgcG9uaXQgd2FzIG5vbiBzdG9wcGFibGUoZS5nLiBwb2ludC5jb2x1bSA+IEVPTCkuXG4gICAgY29uc3Qge3Jvd30gPSBwb2ludFxuICAgIHJldHVybiAocm93ID09PSAwIHx8IHJvdyA9PT0gdGhpcy5nZXRWaW1MYXN0U2NyZWVuUm93KCkpICYmIHBvaW50LmlzRXF1YWwodGhpcy5lZGl0b3IuY2xpcFNjcmVlblBvc2l0aW9uKHBvaW50KSlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlRG93blRvRWRnZSBleHRlbmRzIE1vdmVVcFRvRWRnZSB7XG4gIGRpcmVjdGlvbiA9ICduZXh0J1xufVxuXG4vLyBXb3JkIE1vdGlvbiBmYW1pbHlcbi8vICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuLy8gfCBkaXJlY3Rpb24gfCB3aGljaCAgICAgIHwgd29yZCAgfCBXT1JEIHwgc3Vid29yZCB8IHNtYXJ0d29yZCB8IGFscGhhbnVtZXJpYyB8XG4vLyB8LS0tLS0tLS0tLS0rLS0tLS0tLS0tLS0tKy0tLS0tLS0rLS0tLS0tKy0tLS0tLS0tLSstLS0tLS0tLS0tLSstLS0tLS0tLS0tLS0tLStcbi8vIHwgbmV4dCAgICAgIHwgd29yZC1zdGFydCB8IHcgICAgIHwgVyAgICB8IC0gICAgICAgfCAtICAgICAgICAgfCAtICAgICAgICAgICAgfFxuLy8gfCBwcmV2aW91cyAgfCB3b3JkLXN0YXJ0IHwgYiAgICAgfCBiICAgIHwgLSAgICAgICB8IC0gICAgICAgICB8IC0gICAgICAgICAgICB8XG4vLyB8IG5leHQgICAgICB8IHdvcmQtZW5kICAgfCBlICAgICB8IEUgICAgfCAtICAgICAgIHwgLSAgICAgICAgIHwgLSAgICAgICAgICAgIHxcbi8vIHwgcHJldmlvdXMgIHwgd29yZC1lbmQgICB8IGdlICAgIHwgZyBFICB8IG4vYSAgICAgfCBuL2EgICAgICAgfCBuL2EgICAgICAgICAgfFxuLy8gKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG5cbmNsYXNzIFdvcmRNb3Rpb24gZXh0ZW5kcyBNb3Rpb24ge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIHdvcmRSZWdleCA9IG51bGxcbiAgc2tpcEJsYW5rUm93ID0gZmFsc2VcbiAgc2tpcFdoaXRlU3BhY2VPbmx5Um93ID0gZmFsc2VcblxuICBtb3ZlQ3Vyc29yIChjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgY291bnRTdGF0ZSA9PiB7XG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24odGhpcy5nZXRQb2ludChjdXJzb3IsIGNvdW50U3RhdGUpKVxuICAgIH0pXG4gIH1cblxuICBnZXRQb2ludCAoY3Vyc29yLCBjb3VudFN0YXRlKSB7XG4gICAgY29uc3Qge2RpcmVjdGlvbn0gPSB0aGlzXG4gICAgbGV0IHt3aGljaH0gPSB0aGlzXG4gICAgY29uc3QgcmVnZXggPSB0aGlzLm5hbWUuZW5kc1dpdGgoJ1N1YndvcmQnKSA/IGN1cnNvci5zdWJ3b3JkUmVnRXhwKCkgOiB0aGlzLndvcmRSZWdleCB8fCBjdXJzb3Iud29yZFJlZ0V4cCgpXG5cbiAgICBjb25zdCBmcm9tID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBpZiAoZGlyZWN0aW9uID09PSAnbmV4dCcgJiYgd2hpY2ggPT09ICdzdGFydCcgJiYgdGhpcy5vcGVyYXRvciAmJiBjb3VudFN0YXRlLmlzRmluYWwpIHtcbiAgICAgIC8vIFtOT1RFXSBFeGNlcHRpb25hbCBiZWhhdmlvciBmb3IgdyBhbmQgVzogW0RldGFpbCBpbiB2aW0gaGVscCBgOmhlbHAgd2AuXVxuICAgICAgLy8gW2Nhc2UtQV0gY3csIGNXIHRyZWF0ZWQgYXMgY2UsIGNFIHdoZW4gY3Vyc29yIGlzIGF0IG5vbi1ibGFuay5cbiAgICAgIC8vIFtjYXNlLUJdIHdoZW4gdywgVyB1c2VkIGFzIFRBUkdFVCwgaXQgZG9lc24ndCBtb3ZlIG92ZXIgbmV3IGxpbmUuXG4gICAgICBpZiAodGhpcy5pc0VtcHR5Um93KGZyb20ucm93KSkgcmV0dXJuIFtmcm9tLnJvdyArIDEsIDBdXG5cbiAgICAgIC8vIFtjYXNlLUFdXG4gICAgICBpZiAodGhpcy5vcGVyYXRvci5uYW1lID09PSAnQ2hhbmdlJyAmJiAhdGhpcy51dGlscy5wb2ludElzQXRXaGl0ZVNwYWNlKHRoaXMuZWRpdG9yLCBmcm9tKSkge1xuICAgICAgICB3aGljaCA9ICdlbmQnXG4gICAgICB9XG4gICAgICBjb25zdCBwb2ludCA9IHRoaXMuZmluZFBvaW50KGRpcmVjdGlvbiwgcmVnZXgsIHdoaWNoLCB0aGlzLmJ1aWxkT3B0aW9ucyhmcm9tKSlcbiAgICAgIC8vIFtjYXNlLUJdXG4gICAgICByZXR1cm4gcG9pbnQgPyBQb2ludC5taW4ocG9pbnQsIFtmcm9tLnJvdywgSW5maW5pdHldKSA6IHRoaXMuZ2V0TGFzdFJlc29ydFBvaW50KGRpcmVjdGlvbilcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZmluZFBvaW50KGRpcmVjdGlvbiwgcmVnZXgsIHdoaWNoLCB0aGlzLmJ1aWxkT3B0aW9ucyhmcm9tKSkgfHwgdGhpcy5nZXRMYXN0UmVzb3J0UG9pbnQoZGlyZWN0aW9uKVxuICAgIH1cbiAgfVxuXG4gIGJ1aWxkT3B0aW9ucyAoZnJvbSkge1xuICAgIHJldHVybiB7XG4gICAgICBmcm9tOiBmcm9tLFxuICAgICAgc2tpcEVtcHR5Um93OiB0aGlzLnNraXBFbXB0eVJvdyxcbiAgICAgIHNraXBXaGl0ZVNwYWNlT25seVJvdzogdGhpcy5za2lwV2hpdGVTcGFjZU9ubHlSb3csXG4gICAgICBwcmVUcmFuc2xhdGU6ICh0aGlzLndoaWNoID09PSAnZW5kJyAmJiBbMCwgKzFdKSB8fCB1bmRlZmluZWQsXG4gICAgICBwb3N0VHJhbnNsYXRlOiAodGhpcy53aGljaCA9PT0gJ2VuZCcgJiYgWzAsIC0xXSkgfHwgdW5kZWZpbmVkXG4gICAgfVxuICB9XG59XG5cbi8vIHdcbmNsYXNzIE1vdmVUb05leHRXb3JkIGV4dGVuZHMgV29yZE1vdGlvbiB7XG4gIGRpcmVjdGlvbiA9ICduZXh0J1xuICB3aGljaCA9ICdzdGFydCdcbn1cblxuLy8gV1xuY2xhc3MgTW92ZVRvTmV4dFdob2xlV29yZCBleHRlbmRzIE1vdmVUb05leHRXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL14kfFxcUysvZ1xufVxuXG4vLyBuby1rZXltYXBcbmNsYXNzIE1vdmVUb05leHRTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmQge31cblxuLy8gbm8ta2V5bWFwXG5jbGFzcyBNb3ZlVG9OZXh0U21hcnRXb3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmQge1xuICB3b3JkUmVnZXggPSAvW1xcdy1dKy9nXG59XG5cbi8vIG5vLWtleW1hcFxuY2xhc3MgTW92ZVRvTmV4dEFscGhhbnVtZXJpY1dvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZCB7XG4gIHdvcmRSZWdleCA9IC9cXHcrL2dcbn1cblxuLy8gYlxuY2xhc3MgTW92ZVRvUHJldmlvdXNXb3JkIGV4dGVuZHMgV29yZE1vdGlvbiB7XG4gIGRpcmVjdGlvbiA9ICdwcmV2aW91cydcbiAgd2hpY2ggPSAnc3RhcnQnXG4gIHNraXBXaGl0ZVNwYWNlT25seVJvdyA9IHRydWVcbn1cblxuLy8gQlxuY2xhc3MgTW92ZVRvUHJldmlvdXNXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmQge1xuICB3b3JkUmVnZXggPSAvXiR8XFxTKy9nXG59XG5cbi8vIG5vLWtleW1hcFxuY2xhc3MgTW92ZVRvUHJldmlvdXNTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkIHt9XG5cbi8vIG5vLWtleW1hcFxuY2xhc3MgTW92ZVRvUHJldmlvdXNTbWFydFdvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmQge1xuICB3b3JkUmVnZXggPSAvW1xcdy1dKy9cbn1cblxuLy8gbm8ta2V5bWFwXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0FscGhhbnVtZXJpY1dvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmQge1xuICB3b3JkUmVnZXggPSAvXFx3Ky9cbn1cblxuLy8gZVxuY2xhc3MgTW92ZVRvRW5kT2ZXb3JkIGV4dGVuZHMgV29yZE1vdGlvbiB7XG4gIGluY2x1c2l2ZSA9IHRydWVcbiAgZGlyZWN0aW9uID0gJ25leHQnXG4gIHdoaWNoID0gJ2VuZCdcbiAgc2tpcEVtcHR5Um93ID0gdHJ1ZVxuICBza2lwV2hpdGVTcGFjZU9ubHlSb3cgPSB0cnVlXG59XG5cbi8vIEVcbmNsYXNzIE1vdmVUb0VuZE9mV2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1xcUysvZ1xufVxuXG4vLyBuby1rZXltYXBcbmNsYXNzIE1vdmVUb0VuZE9mU3Vid29yZCBleHRlbmRzIE1vdmVUb0VuZE9mV29yZCB7fVxuXG4vLyBuby1rZXltYXBcbmNsYXNzIE1vdmVUb0VuZE9mU21hcnRXb3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1tcXHctXSsvZ1xufVxuXG4vLyBuby1rZXltYXBcbmNsYXNzIE1vdmVUb0VuZE9mQWxwaGFudW1lcmljV29yZCBleHRlbmRzIE1vdmVUb0VuZE9mV29yZCB7XG4gIHdvcmRSZWdleCA9IC9cXHcrL2dcbn1cblxuLy8gZ2VcbmNsYXNzIE1vdmVUb1ByZXZpb3VzRW5kT2ZXb3JkIGV4dGVuZHMgV29yZE1vdGlvbiB7XG4gIGluY2x1c2l2ZSA9IHRydWVcbiAgZGlyZWN0aW9uID0gJ3ByZXZpb3VzJ1xuICB3aGljaCA9ICdlbmQnXG4gIHNraXBXaGl0ZVNwYWNlT25seVJvdyA9IHRydWVcbn1cblxuLy8gZ0VcbmNsYXNzIE1vdmVUb1ByZXZpb3VzRW5kT2ZXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0VuZE9mV29yZCB7XG4gIHdvcmRSZWdleCA9IC9cXFMrL2dcbn1cblxuLy8gU2VudGVuY2Vcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNlbnRlbmNlIGlzIGRlZmluZWQgYXMgYmVsb3dcbi8vICAtIGVuZCB3aXRoIFsnLicsICchJywgJz8nXVxuLy8gIC0gb3B0aW9uYWxseSBmb2xsb3dlZCBieSBbJyknLCAnXScsICdcIicsIFwiJ1wiXVxuLy8gIC0gZm9sbG93ZWQgYnkgWyckJywgJyAnLCAnXFx0J11cbi8vICAtIHBhcmFncmFwaCBib3VuZGFyeSBpcyBhbHNvIHNlbnRlbmNlIGJvdW5kYXJ5XG4vLyAgLSBzZWN0aW9uIGJvdW5kYXJ5IGlzIGFsc28gc2VudGVuY2UgYm91bmRhcnkoaWdub3JlKVxuY2xhc3MgTW92ZVRvTmV4dFNlbnRlbmNlIGV4dGVuZHMgTW90aW9uIHtcbiAganVtcCA9IHRydWVcbiAgc2VudGVuY2VSZWdleCA9IG5ldyBSZWdFeHAoYCg/OltcXFxcLiFcXFxcP11bXFxcXClcXFxcXVwiJ10qXFxcXHMrKXwoXFxcXG58XFxcXHJcXFxcbilgLCAnZycpXG4gIGRpcmVjdGlvbiA9ICduZXh0J1xuXG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCBwb2ludCA9XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID09PSAnbmV4dCdcbiAgICAgICAgICA/IHRoaXMuZ2V0TmV4dFN0YXJ0T2ZTZW50ZW5jZShjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICAgICAgICA6IHRoaXMuZ2V0UHJldmlvdXNTdGFydE9mU2VudGVuY2UoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQgfHwgdGhpcy5nZXRMYXN0UmVzb3J0UG9pbnQodGhpcy5kaXJlY3Rpb24pKVxuICAgIH0pXG4gIH1cblxuICBpc0JsYW5rUm93IChyb3cpIHtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpXG4gIH1cblxuICBnZXROZXh0U3RhcnRPZlNlbnRlbmNlIChmcm9tKSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEluRWRpdG9yKCdmb3J3YXJkJywgdGhpcy5zZW50ZW5jZVJlZ2V4LCB7ZnJvbX0sICh7cmFuZ2UsIG1hdGNofSkgPT4ge1xuICAgICAgaWYgKG1hdGNoWzFdICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QgW3N0YXJ0Um93LCBlbmRSb3ddID0gW3JhbmdlLnN0YXJ0LnJvdywgcmFuZ2UuZW5kLnJvd11cbiAgICAgICAgaWYgKHRoaXMuc2tpcEJsYW5rUm93ICYmIHRoaXMuaXNCbGFua1JvdyhlbmRSb3cpKSByZXR1cm5cbiAgICAgICAgaWYgKHRoaXMuaXNCbGFua1JvdyhzdGFydFJvdykgIT09IHRoaXMuaXNCbGFua1JvdyhlbmRSb3cpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhlbmRSb3cpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByYW5nZS5lbmRcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZ2V0UHJldmlvdXNTdGFydE9mU2VudGVuY2UgKGZyb20pIHtcbiAgICByZXR1cm4gdGhpcy5maW5kSW5FZGl0b3IoJ2JhY2t3YXJkJywgdGhpcy5zZW50ZW5jZVJlZ2V4LCB7ZnJvbX0sICh7cmFuZ2UsIG1hdGNofSkgPT4ge1xuICAgICAgaWYgKG1hdGNoWzFdICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QgW3N0YXJ0Um93LCBlbmRSb3ddID0gW3JhbmdlLnN0YXJ0LnJvdywgcmFuZ2UuZW5kLnJvd11cbiAgICAgICAgaWYgKCF0aGlzLmlzQmxhbmtSb3coZW5kUm93KSAmJiB0aGlzLmlzQmxhbmtSb3coc3RhcnRSb3cpKSB7XG4gICAgICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coZW5kUm93KVxuICAgICAgICAgIGlmIChwb2ludC5pc0xlc3NUaGFuKGZyb20pKSByZXR1cm4gcG9pbnRcbiAgICAgICAgICBlbHNlIGlmICghdGhpcy5za2lwQmxhbmtSb3cpIHJldHVybiB0aGlzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coc3RhcnRSb3cpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocmFuZ2UuZW5kLmlzTGVzc1RoYW4oZnJvbSkpIHtcbiAgICAgICAgcmV0dXJuIHJhbmdlLmVuZFxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTZW50ZW5jZSBleHRlbmRzIE1vdmVUb05leHRTZW50ZW5jZSB7XG4gIGRpcmVjdGlvbiA9ICdwcmV2aW91cydcbn1cblxuY2xhc3MgTW92ZVRvTmV4dFNlbnRlbmNlU2tpcEJsYW5rUm93IGV4dGVuZHMgTW92ZVRvTmV4dFNlbnRlbmNlIHtcbiAgc2tpcEJsYW5rUm93ID0gdHJ1ZVxufVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1NlbnRlbmNlU2tpcEJsYW5rUm93IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNTZW50ZW5jZSB7XG4gIHNraXBCbGFua1JvdyA9IHRydWVcbn1cblxuLy8gUGFyYWdyYXBoXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0UGFyYWdyYXBoIGV4dGVuZHMgTW90aW9uIHtcbiAganVtcCA9IHRydWVcbiAgZGlyZWN0aW9uID0gJ25leHQnXG5cbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludCB8fCB0aGlzLmdldExhc3RSZXNvcnRQb2ludCh0aGlzLmRpcmVjdGlvbikpXG4gICAgfSlcbiAgfVxuXG4gIGdldFBvaW50IChmcm9tKSB7XG4gICAgbGV0IHdhc0JsYW5rUm93ID0gdGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhmcm9tLnJvdylcbiAgICByZXR1cm4gdGhpcy5maW5kSW5FZGl0b3IodGhpcy5kaXJlY3Rpb24sIC9eL2csIHtmcm9tfSwgKHtyYW5nZX0pID0+IHtcbiAgICAgIGNvbnN0IGlzQmxhbmtSb3cgPSB0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJhbmdlLnN0YXJ0LnJvdylcbiAgICAgIGlmICghd2FzQmxhbmtSb3cgJiYgaXNCbGFua1Jvdykge1xuICAgICAgICByZXR1cm4gcmFuZ2Uuc3RhcnRcbiAgICAgIH1cbiAgICAgIHdhc0JsYW5rUm93ID0gaXNCbGFua1Jvd1xuICAgIH0pXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNQYXJhZ3JhcGggZXh0ZW5kcyBNb3ZlVG9OZXh0UGFyYWdyYXBoIHtcbiAgZGlyZWN0aW9uID0gJ3ByZXZpb3VzJ1xufVxuXG5jbGFzcyBNb3ZlVG9OZXh0RGlmZkh1bmsgZXh0ZW5kcyBNb3Rpb24ge1xuICBqdW1wID0gdHJ1ZVxuICBkaXJlY3Rpb24gPSAnbmV4dCdcblxuICBtb3ZlQ3Vyc29yIChjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgaWYgKHBvaW50KSBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgfSlcbiAgfVxuXG4gIGdldFBvaW50IChmcm9tKSB7XG4gICAgY29uc3QgZ2V0SHVua1JhbmdlID0gcm93ID0+IHRoaXMudXRpbHMuZ2V0SHVua1JhbmdlQXRCdWZmZXJSb3codGhpcy5lZGl0b3IsIHJvdylcbiAgICBsZXQgaHVua1JhbmdlID0gZ2V0SHVua1JhbmdlKGZyb20ucm93KVxuICAgIHJldHVybiB0aGlzLmZpbmRJbkVkaXRvcih0aGlzLmRpcmVjdGlvbiwgL15bKy1dL2csIHtmcm9tfSwgKHtyYW5nZX0pID0+IHtcbiAgICAgIGlmIChodW5rUmFuZ2UgJiYgaHVua1JhbmdlLmNvbnRhaW5zUG9pbnQocmFuZ2Uuc3RhcnQpKSByZXR1cm5cblxuICAgICAgcmV0dXJuIGdldEh1bmtSYW5nZShyYW5nZS5zdGFydC5yb3cpLnN0YXJ0XG4gICAgfSlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0RpZmZIdW5rIGV4dGVuZHMgTW92ZVRvTmV4dERpZmZIdW5rIHtcbiAgZGlyZWN0aW9uID0gJ3ByZXZpb3VzJ1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBrZXltYXA6IDBcbmNsYXNzIE1vdmVUb0JlZ2lubmluZ09mTGluZSBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIHRoaXMudXRpbHMuc2V0QnVmZmVyQ29sdW1uKGN1cnNvciwgMClcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9Db2x1bW4gZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yIChjdXJzb3IpIHtcbiAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlckNvbHVtbihjdXJzb3IsIHRoaXMuZ2V0Q291bnQoKSAtIDEpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIGNvbnN0IHJvdyA9IHRoaXMuZ2V0VmFsaWRWaW1CdWZmZXJSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpICsgdGhpcy5nZXRDb3VudCgpIC0gMSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgSW5maW5pdHldKVxuICAgIGN1cnNvci5nb2FsQ29sdW1uID0gSW5maW5pdHlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9MYXN0Tm9uYmxhbmtDaGFyYWN0ZXJPZkxpbmVBbmREb3duIGV4dGVuZHMgTW90aW9uIHtcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuXG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIGNvbnN0IHJvdyA9IHRoaXMubGltaXROdW1iZXIoY3Vyc29yLmdldEJ1ZmZlclJvdygpICsgdGhpcy5nZXRDb3VudCgpIC0gMSwge21heDogdGhpcy5nZXRWaW1MYXN0QnVmZmVyUm93KCl9KVxuICAgIGNvbnN0IG9wdGlvbnMgPSB7ZnJvbTogW3JvdywgSW5maW5pdHldLCBhbGxvd05leHRMaW5lOiBmYWxzZX1cbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZmluZEluRWRpdG9yKCdiYWNrd2FyZCcsIC9cXFN8Xi8sIG9wdGlvbnMsIGV2ZW50ID0+IGV2ZW50LnJhbmdlLnN0YXJ0KVxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgfVxufVxuXG4vLyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSBmYWltaWx5XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIF5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpKVxuICB9XG59XG5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lVXAgZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCByb3cgPSB0aGlzLmdldFZhbGlkVmltQnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSAtIDEpXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgMF0pXG4gICAgfSlcbiAgICBzdXBlci5tb3ZlQ3Vyc29yKGN1cnNvcilcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZURvd24gZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCBwb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBpZiAocG9pbnQucm93IDwgdGhpcy5nZXRWaW1MYXN0QnVmZmVyUm93KCkpIHtcbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LnRyYW5zbGF0ZShbKzEsIDBdKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHN1cGVyLm1vdmVDdXJzb3IoY3Vyc29yKVxuICB9XG59XG5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lQW5kRG93biBleHRlbmRzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lRG93biB7XG4gIGdldENvdW50ICgpIHtcbiAgICByZXR1cm4gc3VwZXIuZ2V0Q291bnQoKSAtIDFcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9TY3JlZW5Db2x1bW4gZXh0ZW5kcyBNb3Rpb24ge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIGNvbnN0IHBvaW50ID0gdGhpcy51dGlscy5nZXRTY3JlZW5Qb3NpdGlvbkZvclNjcmVlblJvdyh0aGlzLmVkaXRvciwgY3Vyc29yLmdldFNjcmVlblJvdygpLCB0aGlzLndoaWNoLCB7XG4gICAgICBhbGxvd09mZlNjcmVlblBvc2l0aW9uOiB0aGlzLmdldENvbmZpZygnYWxsb3dNb3ZlVG9PZmZTY3JlZW5Db2x1bW5PblNjcmVlbkxpbmVNb3Rpb24nKVxuICAgIH0pXG4gICAgaWYgKHBvaW50KSBjdXJzb3Iuc2V0U2NyZWVuUG9zaXRpb24ocG9pbnQpXG4gIH1cbn1cblxuLy8ga2V5bWFwOiBnIDBcbmNsYXNzIE1vdmVUb0JlZ2lubmluZ09mU2NyZWVuTGluZSBleHRlbmRzIE1vdmVUb1NjcmVlbkNvbHVtbiB7XG4gIHdoaWNoID0gJ2JlZ2lubmluZydcbn1cblxuLy8gZyBeOiBgbW92ZS10by1maXJzdC1jaGFyYWN0ZXItb2Ytc2NyZWVuLWxpbmVgXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mU2NyZWVuTGluZSBleHRlbmRzIE1vdmVUb1NjcmVlbkNvbHVtbiB7XG4gIHdoaWNoID0gJ2ZpcnN0LWNoYXJhY3Rlcidcbn1cblxuLy8ga2V5bWFwOiBnICRcbmNsYXNzIE1vdmVUb0xhc3RDaGFyYWN0ZXJPZlNjcmVlbkxpbmUgZXh0ZW5kcyBNb3ZlVG9TY3JlZW5Db2x1bW4ge1xuICB3aGljaCA9ICdsYXN0LWNoYXJhY3Rlcidcbn1cblxuLy8ga2V5bWFwOiBnIGdcbmNsYXNzIE1vdmVUb0ZpcnN0TGluZSBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG4gIGp1bXAgPSB0cnVlXG4gIHZlcnRpY2FsTW90aW9uID0gdHJ1ZVxuICBtb3ZlU3VjY2Vzc09uTGluZXdpc2UgPSB0cnVlXG5cbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgdGhpcy5zZXRDdXJzb3JCdWZmZXJSb3coY3Vyc29yLCB0aGlzLmdldFZhbGlkVmltQnVmZmVyUm93KHRoaXMuZ2V0Um93KCkpKVxuICAgIGN1cnNvci5hdXRvc2Nyb2xsKHtjZW50ZXI6IHRydWV9KVxuICB9XG5cbiAgZ2V0Um93ICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDb3VudCgpIC0gMVxuICB9XG59XG5cbi8vIGtleW1hcDogR1xuY2xhc3MgTW92ZVRvTGFzdExpbmUgZXh0ZW5kcyBNb3ZlVG9GaXJzdExpbmUge1xuICBkZWZhdWx0Q291bnQgPSBJbmZpbml0eVxufVxuXG4vLyBrZXltYXA6IE4lIGUuZy4gMTAlXG5jbGFzcyBNb3ZlVG9MaW5lQnlQZXJjZW50IGV4dGVuZHMgTW92ZVRvRmlyc3RMaW5lIHtcbiAgZ2V0Um93ICgpIHtcbiAgICBjb25zdCBwZXJjZW50ID0gdGhpcy5saW1pdE51bWJlcih0aGlzLmdldENvdW50KCksIHttYXg6IDEwMH0pXG4gICAgcmV0dXJuIE1hdGguZmxvb3IodGhpcy5nZXRWaW1MYXN0QnVmZmVyUm93KCkgKiAocGVyY2VudCAvIDEwMCkpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvUmVsYXRpdmVMaW5lIGV4dGVuZHMgTW90aW9uIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICB3aXNlID0gJ2xpbmV3aXNlJ1xuICBtb3ZlU3VjY2Vzc09uTGluZXdpc2UgPSB0cnVlXG5cbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgbGV0IHJvd1xuICAgIGxldCBjb3VudCA9IHRoaXMuZ2V0Q291bnQoKVxuICAgIGlmIChjb3VudCA8IDApIHtcbiAgICAgIC8vIFN1cHBvcnQgbmVnYXRpdmUgY291bnRcbiAgICAgIC8vIE5lZ2F0aXZlIGNvdW50IGNhbiBiZSBwYXNzZWQgbGlrZSBgb3BlcmF0aW9uU3RhY2sucnVuKFwiTW92ZVRvUmVsYXRpdmVMaW5lXCIsIHtjb3VudDogLTV9KWAuXG4gICAgICAvLyBDdXJyZW50bHkgdXNlZCBpbiB2aW0tbW9kZS1wbHVzLWV4LW1vZGUgcGtnLlxuICAgICAgd2hpbGUgKGNvdW50KysgPCAwKSB7XG4gICAgICAgIHJvdyA9IHRoaXMuZ2V0Rm9sZFN0YXJ0Um93Rm9yUm93KHJvdyA9PSBudWxsID8gY3Vyc29yLmdldEJ1ZmZlclJvdygpIDogcm93IC0gMSlcbiAgICAgICAgaWYgKHJvdyA8PSAwKSBicmVha1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBtYXhSb3cgPSB0aGlzLmdldFZpbUxhc3RCdWZmZXJSb3coKVxuICAgICAgd2hpbGUgKGNvdW50LS0gPiAwKSB7XG4gICAgICAgIHJvdyA9IHRoaXMuZ2V0Rm9sZEVuZFJvd0ZvclJvdyhyb3cgPT0gbnVsbCA/IGN1cnNvci5nZXRCdWZmZXJSb3coKSA6IHJvdyArIDEpXG4gICAgICAgIGlmIChyb3cgPj0gbWF4Um93KSBicmVha1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlclJvdyhjdXJzb3IsIHJvdylcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9SZWxhdGl2ZUxpbmVNaW5pbXVtVHdvIGV4dGVuZHMgTW92ZVRvUmVsYXRpdmVMaW5lIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBnZXRDb3VudCAoKSB7XG4gICAgcmV0dXJuIHRoaXMubGltaXROdW1iZXIoc3VwZXIuZ2V0Q291bnQoKSwge21pbjogMn0pXG4gIH1cbn1cblxuLy8gUG9zaXRpb24gY3Vyc29yIHdpdGhvdXQgc2Nyb2xsaW5nLiwgSCwgTSwgTFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8ga2V5bWFwOiBIXG5jbGFzcyBNb3ZlVG9Ub3BPZlNjcmVlbiBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG4gIGp1bXAgPSB0cnVlXG4gIGRlZmF1bHRDb3VudCA9IDBcbiAgdmVydGljYWxNb3Rpb24gPSB0cnVlXG5cbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgY29uc3QgYnVmZmVyUm93ID0gdGhpcy5lZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KHRoaXMuZ2V0U2NyZWVuUm93KCkpXG4gICAgdGhpcy5zZXRDdXJzb3JCdWZmZXJSb3coY3Vyc29yLCBidWZmZXJSb3cpXG4gIH1cblxuICBnZXRTY3JlZW5Sb3cgKCkge1xuICAgIGNvbnN0IGZpcnN0VmlzaWJsZVJvdyA9IHRoaXMuZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgY29uc3QgbGFzdFZpc2libGVSb3cgPSB0aGlzLmxpbWl0TnVtYmVyKHRoaXMuZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCksIHttYXg6IHRoaXMuZ2V0VmltTGFzdFNjcmVlblJvdygpfSlcblxuICAgIGNvbnN0IGJhc2VPZmZzZXQgPSAyXG4gICAgaWYgKHRoaXMubmFtZSA9PT0gJ01vdmVUb1RvcE9mU2NyZWVuJykge1xuICAgICAgY29uc3Qgb2Zmc2V0ID0gZmlyc3RWaXNpYmxlUm93ID09PSAwID8gMCA6IGJhc2VPZmZzZXRcbiAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5nZXRDb3VudCgpIC0gMVxuICAgICAgcmV0dXJuIHRoaXMubGltaXROdW1iZXIoZmlyc3RWaXNpYmxlUm93ICsgY291bnQsIHttaW46IGZpcnN0VmlzaWJsZVJvdyArIG9mZnNldCwgbWF4OiBsYXN0VmlzaWJsZVJvd30pXG4gICAgfSBlbHNlIGlmICh0aGlzLm5hbWUgPT09ICdNb3ZlVG9NaWRkbGVPZlNjcmVlbicpIHtcbiAgICAgIHJldHVybiBmaXJzdFZpc2libGVSb3cgKyBNYXRoLmZsb29yKChsYXN0VmlzaWJsZVJvdyAtIGZpcnN0VmlzaWJsZVJvdykgLyAyKVxuICAgIH0gZWxzZSBpZiAodGhpcy5uYW1lID09PSAnTW92ZVRvQm90dG9tT2ZTY3JlZW4nKSB7XG4gICAgICBjb25zdCBvZmZzZXQgPSBsYXN0VmlzaWJsZVJvdyA9PT0gdGhpcy5nZXRWaW1MYXN0U2NyZWVuUm93KCkgPyAwIDogYmFzZU9mZnNldCArIDFcbiAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5nZXRDb3VudCgpIC0gMVxuICAgICAgcmV0dXJuIHRoaXMubGltaXROdW1iZXIobGFzdFZpc2libGVSb3cgLSBjb3VudCwge21pbjogZmlyc3RWaXNpYmxlUm93LCBtYXg6IGxhc3RWaXNpYmxlUm93IC0gb2Zmc2V0fSlcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvTWlkZGxlT2ZTY3JlZW4gZXh0ZW5kcyBNb3ZlVG9Ub3BPZlNjcmVlbiB7fSAvLyBrZXltYXA6IE1cbmNsYXNzIE1vdmVUb0JvdHRvbU9mU2NyZWVuIGV4dGVuZHMgTW92ZVRvVG9wT2ZTY3JlZW4ge30gLy8ga2V5bWFwOiBMXG5cbi8vIFNjcm9sbGluZ1xuLy8gSGFsZjogY3RybC1kLCBjdHJsLXVcbi8vIEZ1bGw6IGN0cmwtZiwgY3RybC1iXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBbRklYTUVdIGNvdW50IGJlaGF2ZSBkaWZmZXJlbnRseSBmcm9tIG9yaWdpbmFsIFZpbS5cbmNsYXNzIFNjcm9sbCBleHRlbmRzIE1vdGlvbiB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgc3RhdGljIHNjcm9sbFRhc2sgPSBudWxsXG4gIHN0YXRpYyBhbW91bnRPZlBhZ2VCeU5hbWUgPSB7XG4gICAgU2Nyb2xsRnVsbFNjcmVlbkRvd246IDEsXG4gICAgU2Nyb2xsRnVsbFNjcmVlblVwOiAtMSxcbiAgICBTY3JvbGxIYWxmU2NyZWVuRG93bjogMC41LFxuICAgIFNjcm9sbEhhbGZTY3JlZW5VcDogLTAuNSxcbiAgICBTY3JvbGxRdWFydGVyU2NyZWVuRG93bjogMC4yNSxcbiAgICBTY3JvbGxRdWFydGVyU2NyZWVuVXA6IC0wLjI1XG4gIH1cbiAgdmVydGljYWxNb3Rpb24gPSB0cnVlXG5cbiAgZXhlY3V0ZSAoKSB7XG4gICAgY29uc3QgYW1vdW50T2ZQYWdlID0gdGhpcy5jb25zdHJ1Y3Rvci5hbW91bnRPZlBhZ2VCeU5hbWVbdGhpcy5uYW1lXVxuICAgIGNvbnN0IGFtb3VudE9mU2NyZWVuUm93cyA9IE1hdGgudHJ1bmMoYW1vdW50T2ZQYWdlICogdGhpcy5lZGl0b3IuZ2V0Um93c1BlclBhZ2UoKSAqIHRoaXMuZ2V0Q291bnQoKSlcbiAgICB0aGlzLmFtb3VudE9mUGl4ZWxzID0gYW1vdW50T2ZTY3JlZW5Sb3dzICogdGhpcy5lZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKClcblxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuXG4gICAgdGhpcy52aW1TdGF0ZS5yZXF1ZXN0U2Nyb2xsKHtcbiAgICAgIGFtb3VudE9mUGl4ZWxzOiB0aGlzLmFtb3VudE9mUGl4ZWxzLFxuICAgICAgZHVyYXRpb246IHRoaXMuZ2V0U21vb3RoU2Nyb2xsRHVhdGlvbigoTWF0aC5hYnMoYW1vdW50T2ZQYWdlKSA9PT0gMSA/ICdGdWxsJyA6ICdIYWxmJykgKyAnU2Nyb2xsTW90aW9uJylcbiAgICB9KVxuICB9XG5cbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgY29uc3QgY3Vyc29yUGl4ZWwgPSB0aGlzLmVkaXRvckVsZW1lbnQucGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKGN1cnNvci5nZXRTY3JlZW5Qb3NpdGlvbigpKVxuICAgIGN1cnNvclBpeGVsLnRvcCArPSB0aGlzLmFtb3VudE9mUGl4ZWxzXG4gICAgY29uc3Qgc2NyZWVuUG9zaXRpb24gPSB0aGlzLmVkaXRvckVsZW1lbnQuc2NyZWVuUG9zaXRpb25Gb3JQaXhlbFBvc2l0aW9uKGN1cnNvclBpeGVsKVxuICAgIGNvbnN0IHNjcmVlblJvdyA9IHRoaXMuZ2V0VmFsaWRWaW1TY3JlZW5Sb3coc2NyZWVuUG9zaXRpb24ucm93KVxuICAgIHRoaXMuc2V0Q3Vyc29yQnVmZmVyUm93KGN1cnNvciwgdGhpcy5lZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KHNjcmVlblJvdyksIHthdXRvc2Nyb2xsOiBmYWxzZX0pXG4gIH1cbn1cblxuY2xhc3MgU2Nyb2xsRnVsbFNjcmVlbkRvd24gZXh0ZW5kcyBTY3JvbGwge30gLy8gY3RybC1mXG5jbGFzcyBTY3JvbGxGdWxsU2NyZWVuVXAgZXh0ZW5kcyBTY3JvbGwge30gLy8gY3RybC1iXG5jbGFzcyBTY3JvbGxIYWxmU2NyZWVuRG93biBleHRlbmRzIFNjcm9sbCB7fSAvLyBjdHJsLWRcbmNsYXNzIFNjcm9sbEhhbGZTY3JlZW5VcCBleHRlbmRzIFNjcm9sbCB7fSAvLyBjdHJsLXVcbmNsYXNzIFNjcm9sbFF1YXJ0ZXJTY3JlZW5Eb3duIGV4dGVuZHMgU2Nyb2xsIHt9IC8vIGcgY3RybC1kXG5jbGFzcyBTY3JvbGxRdWFydGVyU2NyZWVuVXAgZXh0ZW5kcyBTY3JvbGwge30gLy8gZyBjdHJsLXVcblxuLy8gRmluZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8ga2V5bWFwOiBmXG5jbGFzcyBGaW5kIGV4dGVuZHMgTW90aW9uIHtcbiAgYmFja3dhcmRzID0gZmFsc2VcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuICBvZmZzZXQgPSAwXG4gIHJlcXVpcmVJbnB1dCA9IHRydWVcbiAgY2FzZVNlbnNpdGl2aXR5S2luZCA9ICdGaW5kJ1xuXG4gIHJlc3RvcmVFZGl0b3JTdGF0ZSAoKSB7XG4gICAgaWYgKHRoaXMuX3Jlc3RvcmVFZGl0b3JTdGF0ZSkgdGhpcy5fcmVzdG9yZUVkaXRvclN0YXRlKClcbiAgICB0aGlzLl9yZXN0b3JlRWRpdG9yU3RhdGUgPSBudWxsXG4gIH1cblxuICBjYW5jZWxPcGVyYXRpb24gKCkge1xuICAgIHRoaXMucmVzdG9yZUVkaXRvclN0YXRlKClcbiAgICBzdXBlci5jYW5jZWxPcGVyYXRpb24oKVxuICB9XG5cbiAgaW5pdGlhbGl6ZSAoKSB7XG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKCdyZXVzZUZpbmRGb3JSZXBlYXRGaW5kJykpIHRoaXMucmVwZWF0SWZOZWNlc3NhcnkoKVxuXG4gICAgaWYgKCF0aGlzLnJlcGVhdGVkKSB7XG4gICAgICBjb25zdCBjaGFyc01heCA9IHRoaXMuZ2V0Q29uZmlnKCdmaW5kQ2hhcnNNYXgnKVxuICAgICAgY29uc3Qgb3B0aW9uc0Jhc2UgPSB7cHVycG9zZTogJ2ZpbmQnLCBjaGFyc01heH1cblxuICAgICAgaWYgKGNoYXJzTWF4ID09PSAxKSB7XG4gICAgICAgIHRoaXMuZm9jdXNJbnB1dChvcHRpb25zQmFzZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3Jlc3RvcmVFZGl0b3JTdGF0ZSA9IHRoaXMudXRpbHMuc2F2ZUVkaXRvclN0YXRlKHRoaXMuZWRpdG9yKVxuICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgIGF1dG9Db25maXJtVGltZW91dDogdGhpcy5nZXRDb25maWcoJ2ZpbmRDb25maXJtQnlUaW1lb3V0JyksXG4gICAgICAgICAgb25Db25maXJtOiBpbnB1dCA9PiB7XG4gICAgICAgICAgICB0aGlzLmlucHV0ID0gaW5wdXRcbiAgICAgICAgICAgIGlmIChpbnB1dCkgdGhpcy5wcm9jZXNzT3BlcmF0aW9uKClcbiAgICAgICAgICAgIGVsc2UgdGhpcy5jYW5jZWxPcGVyYXRpb24oKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgb25DaGFuZ2U6IHByZUNvbmZpcm1lZENoYXJzID0+IHtcbiAgICAgICAgICAgIHRoaXMucHJlQ29uZmlybWVkQ2hhcnMgPSBwcmVDb25maXJtZWRDaGFyc1xuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRUZXh0SW5DdXJzb3JSb3dzKHRoaXMucHJlQ29uZmlybWVkQ2hhcnMsICdwcmUtY29uZmlybScsIHRoaXMuaXNCYWNrd2FyZHMoKSlcbiAgICAgICAgICB9LFxuICAgICAgICAgIG9uQ2FuY2VsOiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnZpbVN0YXRlLmhpZ2hsaWdodEZpbmQuY2xlYXJNYXJrZXJzKClcbiAgICAgICAgICAgIHRoaXMuY2FuY2VsT3BlcmF0aW9uKClcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNvbW1hbmRzOiB7XG4gICAgICAgICAgICAndmltLW1vZGUtcGx1czpmaW5kLW5leHQtcHJlLWNvbmZpcm1lZCc6ICgpID0+IHRoaXMuZmluZFByZUNvbmZpcm1lZCgrMSksXG4gICAgICAgICAgICAndmltLW1vZGUtcGx1czpmaW5kLXByZXZpb3VzLXByZS1jb25maXJtZWQnOiAoKSA9PiB0aGlzLmZpbmRQcmVDb25maXJtZWQoLTEpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZm9jdXNJbnB1dChPYmplY3QuYXNzaWduKG9wdGlvbnMsIG9wdGlvbnNCYXNlKSlcbiAgICAgIH1cbiAgICB9XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBmaW5kUHJlQ29uZmlybWVkIChkZWx0YSkge1xuICAgIGlmICh0aGlzLnByZUNvbmZpcm1lZENoYXJzICYmIHRoaXMuZ2V0Q29uZmlnKCdoaWdobGlnaHRGaW5kQ2hhcicpKSB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuaGlnaGxpZ2h0VGV4dEluQ3Vyc29yUm93cyhcbiAgICAgICAgdGhpcy5wcmVDb25maXJtZWRDaGFycyxcbiAgICAgICAgJ3ByZS1jb25maXJtJyxcbiAgICAgICAgdGhpcy5pc0JhY2t3YXJkcygpLFxuICAgICAgICB0aGlzLmdldENvdW50KCkgLSAxICsgZGVsdGEsXG4gICAgICAgIHRydWVcbiAgICAgIClcbiAgICAgIHRoaXMuY291bnQgPSBpbmRleCArIDFcbiAgICB9XG4gIH1cblxuICByZXBlYXRJZk5lY2Vzc2FyeSAoKSB7XG4gICAgY29uc3QgZmluZENvbW1hbmROYW1lcyA9IFsnRmluZCcsICdGaW5kQmFja3dhcmRzJywgJ1RpbGwnLCAnVGlsbEJhY2t3YXJkcyddXG4gICAgY29uc3QgY3VycmVudEZpbmQgPSB0aGlzLmdsb2JhbFN0YXRlLmdldCgnY3VycmVudEZpbmQnKVxuICAgIGlmIChjdXJyZW50RmluZCAmJiBmaW5kQ29tbWFuZE5hbWVzLmluY2x1ZGVzKHRoaXMudmltU3RhdGUub3BlcmF0aW9uU3RhY2suZ2V0TGFzdENvbW1hbmROYW1lKCkpKSB7XG4gICAgICB0aGlzLmlucHV0ID0gY3VycmVudEZpbmQuaW5wdXRcbiAgICAgIHRoaXMucmVwZWF0ZWQgPSB0cnVlXG4gICAgfVxuICB9XG5cbiAgaXNCYWNrd2FyZHMgKCkge1xuICAgIHJldHVybiB0aGlzLmJhY2t3YXJkc1xuICB9XG5cbiAgZXhlY3V0ZSAoKSB7XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gICAgbGV0IGRlY29yYXRpb25UeXBlID0gJ3Bvc3QtY29uZmlybSdcbiAgICBpZiAodGhpcy5vcGVyYXRvciAmJiAhdGhpcy5vcGVyYXRvci5pbnN0YW5jZW9mKCdTZWxlY3RCYXNlJykpIHtcbiAgICAgIGRlY29yYXRpb25UeXBlICs9ICcgbG9uZydcbiAgICB9XG5cbiAgICAvLyBIQUNLOiBXaGVuIHJlcGVhdGVkIGJ5IFwiLFwiLCB0aGlzLmJhY2t3YXJkcyBpcyB0ZW1wb3JhcnkgaW52ZXJ0ZWQgYW5kXG4gICAgLy8gcmVzdG9yZWQgYWZ0ZXIgZXhlY3V0aW9uIGZpbmlzaGVkLlxuICAgIC8vIEJ1dCBmaW5hbCBoaWdobGlnaHRUZXh0SW5DdXJzb3JSb3dzIGlzIGV4ZWN1dGVkIGluIGFzeW5jKD1hZnRlciBvcGVyYXRpb24gZmluaXNoZWQpLlxuICAgIC8vIFRodXMgd2UgbmVlZCB0byBwcmVzZXJ2ZSBiZWZvcmUgcmVzdG9yZWQgYGJhY2t3YXJkc2AgdmFsdWUgYW5kIHBhc3MgaXQuXG4gICAgY29uc3QgYmFja3dhcmRzID0gdGhpcy5pc0JhY2t3YXJkcygpXG4gICAgdGhpcy5lZGl0b3IuY29tcG9uZW50LmdldE5leHRVcGRhdGVQcm9taXNlKCkudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3ModGhpcy5pbnB1dCwgZGVjb3JhdGlvblR5cGUsIGJhY2t3YXJkcylcbiAgICB9KVxuICB9XG5cbiAgZ2V0UG9pbnQgKGZyb21Qb2ludCkge1xuICAgIGNvbnN0IHNjYW5SYW5nZSA9IHRoaXMuZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KGZyb21Qb2ludC5yb3cpXG4gICAgY29uc3QgcG9pbnRzID0gW11cbiAgICBjb25zdCByZWdleCA9IHRoaXMuZ2V0UmVnZXgodGhpcy5pbnB1dClcbiAgICBjb25zdCBpbmRleFdhbnRBY2Nlc3MgPSB0aGlzLmdldENvdW50KCkgLSAxXG5cbiAgICBjb25zdCB0cmFuc2xhdGlvbiA9IG5ldyBQb2ludCgwLCB0aGlzLmlzQmFja3dhcmRzKCkgPyB0aGlzLm9mZnNldCA6IC10aGlzLm9mZnNldClcbiAgICBpZiAodGhpcy5yZXBlYXRlZCkge1xuICAgICAgZnJvbVBvaW50ID0gZnJvbVBvaW50LnRyYW5zbGF0ZSh0cmFuc2xhdGlvbi5uZWdhdGUoKSlcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc0JhY2t3YXJkcygpKSB7XG4gICAgICBpZiAodGhpcy5nZXRDb25maWcoJ2ZpbmRBY3Jvc3NMaW5lcycpKSBzY2FuUmFuZ2Uuc3RhcnQgPSBQb2ludC5aRVJPXG5cbiAgICAgIHRoaXMuZWRpdG9yLmJhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlKHJlZ2V4LCBzY2FuUmFuZ2UsICh7cmFuZ2UsIHN0b3B9KSA9PiB7XG4gICAgICAgIGlmIChyYW5nZS5zdGFydC5pc0xlc3NUaGFuKGZyb21Qb2ludCkpIHtcbiAgICAgICAgICBwb2ludHMucHVzaChyYW5nZS5zdGFydClcbiAgICAgICAgICBpZiAocG9pbnRzLmxlbmd0aCA+IGluZGV4V2FudEFjY2Vzcykgc3RvcCgpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLmdldENvbmZpZygnZmluZEFjcm9zc0xpbmVzJykpIHNjYW5SYW5nZS5lbmQgPSB0aGlzLmVkaXRvci5nZXRFb2ZCdWZmZXJQb3NpdGlvbigpXG5cbiAgICAgIHRoaXMuZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlKHJlZ2V4LCBzY2FuUmFuZ2UsICh7cmFuZ2UsIHN0b3B9KSA9PiB7XG4gICAgICAgIGlmIChyYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludCkpIHtcbiAgICAgICAgICBwb2ludHMucHVzaChyYW5nZS5zdGFydClcbiAgICAgICAgICBpZiAocG9pbnRzLmxlbmd0aCA+IGluZGV4V2FudEFjY2Vzcykgc3RvcCgpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgY29uc3QgcG9pbnQgPSBwb2ludHNbaW5kZXhXYW50QWNjZXNzXVxuICAgIGlmIChwb2ludCkgcmV0dXJuIHBvaW50LnRyYW5zbGF0ZSh0cmFuc2xhdGlvbilcbiAgfVxuXG4gIC8vIEZJWE1FOiBiYWQgbmFtaW5nLCB0aGlzIGZ1bmN0aW9uIG11c3QgcmV0dXJuIGluZGV4XG4gIGhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3MgKHRleHQsIGRlY29yYXRpb25UeXBlLCBiYWNrd2FyZHMsIGluZGV4ID0gdGhpcy5nZXRDb3VudCgpIC0gMSwgYWRqdXN0SW5kZXggPSBmYWxzZSkge1xuICAgIGlmICghdGhpcy5nZXRDb25maWcoJ2hpZ2hsaWdodEZpbmRDaGFyJykpIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXMudmltU3RhdGUuaGlnaGxpZ2h0RmluZC5oaWdobGlnaHRDdXJzb3JSb3dzKFxuICAgICAgdGhpcy5nZXRSZWdleCh0ZXh0KSxcbiAgICAgIGRlY29yYXRpb25UeXBlLFxuICAgICAgYmFja3dhcmRzLFxuICAgICAgdGhpcy5vZmZzZXQsXG4gICAgICBpbmRleCxcbiAgICAgIGFkanVzdEluZGV4XG4gICAgKVxuICB9XG5cbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgIGlmIChwb2ludCkgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgIGVsc2UgdGhpcy5yZXN0b3JlRWRpdG9yU3RhdGUoKVxuXG4gICAgaWYgKCF0aGlzLnJlcGVhdGVkKSB0aGlzLmdsb2JhbFN0YXRlLnNldCgnY3VycmVudEZpbmQnLCB0aGlzKVxuICB9XG5cbiAgZ2V0UmVnZXggKHRlcm0pIHtcbiAgICBjb25zdCBtb2RpZmllcnMgPSB0aGlzLmlzQ2FzZVNlbnNpdGl2ZSh0ZXJtKSA/ICdnJyA6ICdnaSdcbiAgICByZXR1cm4gbmV3IFJlZ0V4cCh0aGlzLl8uZXNjYXBlUmVnRXhwKHRlcm0pLCBtb2RpZmllcnMpXG4gIH1cbn1cblxuLy8ga2V5bWFwOiBGXG5jbGFzcyBGaW5kQmFja3dhcmRzIGV4dGVuZHMgRmluZCB7XG4gIGluY2x1c2l2ZSA9IGZhbHNlXG4gIGJhY2t3YXJkcyA9IHRydWVcbn1cblxuLy8ga2V5bWFwOiB0XG5jbGFzcyBUaWxsIGV4dGVuZHMgRmluZCB7XG4gIG9mZnNldCA9IDFcbiAgZ2V0UG9pbnQgKC4uLmFyZ3MpIHtcbiAgICBjb25zdCBwb2ludCA9IHN1cGVyLmdldFBvaW50KC4uLmFyZ3MpXG4gICAgdGhpcy5tb3ZlU3VjY2VlZGVkID0gcG9pbnQgIT0gbnVsbFxuICAgIHJldHVybiBwb2ludFxuICB9XG59XG5cbi8vIGtleW1hcDogVFxuY2xhc3MgVGlsbEJhY2t3YXJkcyBleHRlbmRzIFRpbGwge1xuICBpbmNsdXNpdmUgPSBmYWxzZVxuICBiYWNrd2FyZHMgPSB0cnVlXG59XG5cbi8vIE1hcmtcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGtleW1hcDogYFxuY2xhc3MgTW92ZVRvTWFyayBleHRlbmRzIE1vdGlvbiB7XG4gIGp1bXAgPSB0cnVlXG4gIHJlcXVpcmVJbnB1dCA9IHRydWVcbiAgaW5wdXQgPSBudWxsXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lID0gZmFsc2VcblxuICBpbml0aWFsaXplICgpIHtcbiAgICB0aGlzLnJlYWRDaGFyKClcbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIGxldCBwb2ludCA9IHRoaXMudmltU3RhdGUubWFyay5nZXQodGhpcy5pbnB1dClcbiAgICBpZiAocG9pbnQpIHtcbiAgICAgIGlmICh0aGlzLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKSB7XG4gICAgICAgIHBvaW50ID0gdGhpcy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHBvaW50LnJvdylcbiAgICAgIH1cbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICAgIGN1cnNvci5hdXRvc2Nyb2xsKHtjZW50ZXI6IHRydWV9KVxuICAgIH1cbiAgfVxufVxuXG4vLyBrZXltYXA6ICdcbmNsYXNzIE1vdmVUb01hcmtMaW5lIGV4dGVuZHMgTW92ZVRvTWFyayB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lID0gdHJ1ZVxufVxuXG4vLyBGb2xkIG1vdGlvblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQgZXh0ZW5kcyBNb3Rpb24ge1xuICB3aXNlID0gJ2NoYXJhY3Rlcndpc2UnXG4gIHdoaWNoID0gJ3N0YXJ0J1xuICBkaXJlY3Rpb24gPSAncHJldmlvdXMnXG5cbiAgZXhlY3V0ZSAoKSB7XG4gICAgY29uc3QgZm9sZFJhbmdlcyA9IHRoaXMudXRpbHMuZ2V0Q29kZUZvbGRSYW5nZXModGhpcy5lZGl0b3IpXG4gICAgdGhpcy5yb3dzID0gZm9sZFJhbmdlcy5tYXAocmFuZ2UgPT4gcmFuZ2VbdGhpcy53aGljaF0ucm93KS5zb3J0KChhLCBiKSA9PiBhIC0gYilcbiAgICBpZiAodGhpcy5kaXJlY3Rpb24gPT09ICdwcmV2aW91cycpIHRoaXMucm93cy5yZXZlcnNlKClcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxuXG4gIGdldFNjYW5Sb3dzIChjdXJzb3IpIHtcbiAgICBpZiAodGhpcy5kaXJlY3Rpb24gPT09ICdwcmV2aW91cycpIHtcbiAgICAgIHJldHVybiB0aGlzLnJvd3MuZmlsdGVyKHJvdyA9PiByb3cgPCBjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnJvd3MuZmlsdGVyKHJvdyA9PiByb3cgPiBjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgfVxuICB9XG5cbiAgZGV0ZWN0Um93IChjdXJzb3IpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTY2FuUm93cyhjdXJzb3IpWzBdXG4gIH1cblxuICBtb3ZlQ3Vyc29yIChjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3Qgcm93ID0gdGhpcy5kZXRlY3RSb3coY3Vyc29yKVxuICAgICAgaWYgKHJvdyAhPSBudWxsKSB0aGlzLnV0aWxzLm1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3coY3Vyc29yLCByb3cpXG4gICAgfSlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9OZXh0Rm9sZFN0YXJ0IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQge1xuICBkaXJlY3Rpb24gPSAnbmV4dCdcbn1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRXaXRoU2FtZUluZGVudCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0IHtcbiAgZGV0ZWN0Um93IChjdXJzb3IpIHtcbiAgICBjb25zdCBiYXNlSW5kZW50TGV2ZWwgPSB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2NhblJvd3MoY3Vyc29yKS5maW5kKHJvdyA9PiB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cpID09PSBiYXNlSW5kZW50TGV2ZWwpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvTmV4dEZvbGRTdGFydFdpdGhTYW1lSW5kZW50IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRXaXRoU2FtZUluZGVudCB7XG4gIGRpcmVjdGlvbiA9ICduZXh0J1xufVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0ZvbGRFbmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCB7XG4gIHdoaWNoID0gJ2VuZCdcbn1cblxuY2xhc3MgTW92ZVRvTmV4dEZvbGRFbmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRFbmQge1xuICBkaXJlY3Rpb24gPSAnbmV4dCdcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvUHJldmlvdXNGdW5jdGlvbiBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0IHtcbiAgZGlyZWN0aW9uID0gJ3ByZXZpb3VzJ1xuICBkZXRlY3RSb3cgKGN1cnNvcikge1xuICAgIHJldHVybiB0aGlzLmdldFNjYW5Sb3dzKGN1cnNvcikuZmluZChyb3cgPT4gdGhpcy51dGlscy5pc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93KHRoaXMuZWRpdG9yLCByb3cpKVxuICB9XG59XG5cbmNsYXNzIE1vdmVUb05leHRGdW5jdGlvbiBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRnVuY3Rpb24ge1xuICBkaXJlY3Rpb24gPSAnbmV4dCdcbn1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNGdW5jdGlvbkFuZFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGdW5jdGlvbiB7XG4gIGV4ZWN1dGUgKCkge1xuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICAgIHRoaXMuZ2V0SW5zdGFuY2UoJ1JlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlJykuZXhlY3V0ZSgpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvTmV4dEZ1bmN0aW9uQW5kUmVkcmF3Q3Vyc29yTGluZUF0VXBwZXJNaWRkbGUgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0Z1bmN0aW9uQW5kUmVkcmF3Q3Vyc29yTGluZUF0VXBwZXJNaWRkbGUge1xuICBkaXJlY3Rpb24gPSAnbmV4dCdcbn1cblxuLy8gU2NvcGUgYmFzZWRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb1Bvc2l0aW9uQnlTY29wZSBleHRlbmRzIE1vdGlvbiB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgZGlyZWN0aW9uID0gJ2JhY2t3YXJkJ1xuICBzY29wZSA9ICcuJ1xuXG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBjb25zdCBwb2ludCA9IHRoaXMudXRpbHMuZGV0ZWN0U2NvcGVTdGFydFBvc2l0aW9uRm9yU2NvcGUodGhpcy5lZGl0b3IsIGN1cnNvclBvc2l0aW9uLCB0aGlzLmRpcmVjdGlvbiwgdGhpcy5zY29wZSlcbiAgICAgIGlmIChwb2ludCkgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgIH0pXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTdHJpbmcgZXh0ZW5kcyBNb3ZlVG9Qb3NpdGlvbkJ5U2NvcGUge1xuICBkaXJlY3Rpb24gPSAnYmFja3dhcmQnXG4gIHNjb3BlID0gJ3N0cmluZy5iZWdpbidcbn1cblxuY2xhc3MgTW92ZVRvTmV4dFN0cmluZyBleHRlbmRzIE1vdmVUb1ByZXZpb3VzU3RyaW5nIHtcbiAgZGlyZWN0aW9uID0gJ2ZvcndhcmQnXG59XG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzTnVtYmVyIGV4dGVuZHMgTW92ZVRvUG9zaXRpb25CeVNjb3BlIHtcbiAgZGlyZWN0aW9uID0gJ2JhY2t3YXJkJ1xuICBzY29wZSA9ICdjb25zdGFudC5udW1lcmljJ1xufVxuXG5jbGFzcyBNb3ZlVG9OZXh0TnVtYmVyIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNOdW1iZXIge1xuICBkaXJlY3Rpb24gPSAnZm9yd2FyZCdcbn1cblxuY2xhc3MgTW92ZVRvTmV4dE9jY3VycmVuY2UgZXh0ZW5kcyBNb3Rpb24ge1xuICAvLyBFbnN1cmUgdGhpcyBjb21tYW5kIGlzIGF2YWlsYWJsZSB3aGVuIG9ubHkgaGFzLW9jY3VycmVuY2VcbiAgc3RhdGljIGNvbW1hbmRTY29wZSA9ICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMuaGFzLW9jY3VycmVuY2UnXG4gIGp1bXAgPSB0cnVlXG4gIGRpcmVjdGlvbiA9ICduZXh0J1xuXG4gIGV4ZWN1dGUgKCkge1xuICAgIHRoaXMucmFuZ2VzID0gdGhpcy51dGlscy5zb3J0UmFuZ2VzKHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuZ2V0TWFya2VycygpLm1hcChtYXJrZXIgPT4gbWFya2VyLmdldEJ1ZmZlclJhbmdlKCkpKVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG5cbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLnJhbmdlc1t0aGlzLnV0aWxzLmdldEluZGV4KHRoaXMuZ2V0SW5kZXgoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpLCB0aGlzLnJhbmdlcyldXG4gICAgY29uc3QgcG9pbnQgPSByYW5nZS5zdGFydFxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludCwge2F1dG9zY3JvbGw6IGZhbHNlfSlcblxuICAgIHRoaXMuZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyhwb2ludC5yb3cpXG4gICAgaWYgKGN1cnNvci5pc0xhc3RDdXJzb3IoKSkge1xuICAgICAgdGhpcy51dGlscy5zbWFydFNjcm9sbFRvQnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIHBvaW50KVxuICAgIH1cblxuICAgIGlmICh0aGlzLmdldENvbmZpZygnZmxhc2hPbk1vdmVUb09jY3VycmVuY2UnKSkge1xuICAgICAgdGhpcy52aW1TdGF0ZS5mbGFzaChyYW5nZSwge3R5cGU6ICdzZWFyY2gnfSlcbiAgICB9XG4gIH1cblxuICBnZXRJbmRleCAoZnJvbVBvaW50KSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLnJhbmdlcy5maW5kSW5kZXgocmFuZ2UgPT4gcmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbihmcm9tUG9pbnQpKVxuICAgIHJldHVybiAoaW5kZXggPj0gMCA/IGluZGV4IDogMCkgKyB0aGlzLmdldENvdW50KCkgLSAxXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNPY2N1cnJlbmNlIGV4dGVuZHMgTW92ZVRvTmV4dE9jY3VycmVuY2Uge1xuICBkaXJlY3Rpb24gPSAncHJldmlvdXMnXG5cbiAgZ2V0SW5kZXggKGZyb21Qb2ludCkge1xuICAgIGNvbnN0IHJhbmdlcyA9IHRoaXMucmFuZ2VzLnNsaWNlKCkucmV2ZXJzZSgpXG4gICAgY29uc3QgcmFuZ2UgPSByYW5nZXMuZmluZChyYW5nZSA9PiByYW5nZS5lbmQuaXNMZXNzVGhhbihmcm9tUG9pbnQpKVxuICAgIGNvbnN0IGluZGV4ID0gcmFuZ2UgPyB0aGlzLnJhbmdlcy5pbmRleE9mKHJhbmdlKSA6IHRoaXMucmFuZ2VzLmxlbmd0aCAtIDFcbiAgICByZXR1cm4gaW5kZXggLSAodGhpcy5nZXRDb3VudCgpIC0gMSlcbiAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBrZXltYXA6ICVcbmNsYXNzIE1vdmVUb1BhaXIgZXh0ZW5kcyBNb3Rpb24ge1xuICBpbmNsdXNpdmUgPSB0cnVlXG4gIGp1bXAgPSB0cnVlXG4gIG1lbWJlciA9IFsnUGFyZW50aGVzaXMnLCAnQ3VybHlCcmFja2V0JywgJ1NxdWFyZUJyYWNrZXQnXVxuXG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRQb2ludChjdXJzb3IpXG4gICAgaWYgKHBvaW50KSBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gIH1cblxuICBnZXRQb2ludEZvclRhZyAocG9pbnQpIHtcbiAgICBjb25zdCBwYWlySW5mbyA9IHRoaXMuZ2V0SW5zdGFuY2UoJ0FUYWcnKS5nZXRQYWlySW5mbyhwb2ludClcbiAgICBpZiAoIXBhaXJJbmZvKSByZXR1cm5cblxuICAgIGxldCB7b3BlblJhbmdlLCBjbG9zZVJhbmdlfSA9IHBhaXJJbmZvXG4gICAgb3BlblJhbmdlID0gb3BlblJhbmdlLnRyYW5zbGF0ZShbMCwgKzFdLCBbMCwgLTFdKVxuICAgIGNsb3NlUmFuZ2UgPSBjbG9zZVJhbmdlLnRyYW5zbGF0ZShbMCwgKzFdLCBbMCwgLTFdKVxuICAgIGlmIChvcGVuUmFuZ2UuY29udGFpbnNQb2ludChwb2ludCkgJiYgIXBvaW50LmlzRXF1YWwob3BlblJhbmdlLmVuZCkpIHtcbiAgICAgIHJldHVybiBjbG9zZVJhbmdlLnN0YXJ0XG4gICAgfVxuICAgIGlmIChjbG9zZVJhbmdlLmNvbnRhaW5zUG9pbnQocG9pbnQpICYmICFwb2ludC5pc0VxdWFsKGNsb3NlUmFuZ2UuZW5kKSkge1xuICAgICAgcmV0dXJuIG9wZW5SYW5nZS5zdGFydFxuICAgIH1cbiAgfVxuXG4gIGdldFBvaW50IChjdXJzb3IpIHtcbiAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgY29uc3QgY3Vyc29yUm93ID0gY3Vyc29yUG9zaXRpb24ucm93XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50Rm9yVGFnKGN1cnNvclBvc2l0aW9uKVxuICAgIGlmIChwb2ludCkgcmV0dXJuIHBvaW50XG5cbiAgICAvLyBBQW55UGFpckFsbG93Rm9yd2FyZGluZyByZXR1cm4gZm9yd2FyZGluZyByYW5nZSBvciBlbmNsb3NpbmcgcmFuZ2UuXG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldEluc3RhbmNlKCdBQW55UGFpckFsbG93Rm9yd2FyZGluZycsIHttZW1iZXI6IHRoaXMubWVtYmVyfSkuZ2V0UmFuZ2UoY3Vyc29yLnNlbGVjdGlvbilcbiAgICBpZiAoIXJhbmdlKSByZXR1cm5cblxuICAgIGNvbnN0IHtzdGFydCwgZW5kfSA9IHJhbmdlXG4gICAgaWYgKHN0YXJ0LnJvdyA9PT0gY3Vyc29yUm93ICYmIHN0YXJ0LmlzR3JlYXRlclRoYW5PckVxdWFsKGN1cnNvclBvc2l0aW9uKSkge1xuICAgICAgLy8gRm9yd2FyZGluZyByYW5nZSBmb3VuZFxuICAgICAgcmV0dXJuIGVuZC50cmFuc2xhdGUoWzAsIC0xXSlcbiAgICB9IGVsc2UgaWYgKGVuZC5yb3cgPT09IGN1cnNvclBvc2l0aW9uLnJvdykge1xuICAgICAgLy8gRW5jbG9zaW5nIHJhbmdlIHdhcyByZXR1cm5lZFxuICAgICAgLy8gV2UgbW92ZSB0byBzdGFydCggb3Blbi1wYWlyICkgb25seSB3aGVuIGNsb3NlLXBhaXIgd2FzIGF0IHNhbWUgcm93IGFzIGN1cnNvci1yb3cuXG4gICAgICByZXR1cm4gc3RhcnRcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIE1vdGlvbixcbiAgQ3VycmVudFNlbGVjdGlvbixcbiAgTW92ZUxlZnQsXG4gIE1vdmVSaWdodCxcbiAgTW92ZVJpZ2h0QnVmZmVyQ29sdW1uLFxuICBNb3ZlVXAsXG4gIE1vdmVVcFdyYXAsXG4gIE1vdmVEb3duLFxuICBNb3ZlRG93bldyYXAsXG4gIE1vdmVVcFNjcmVlbixcbiAgTW92ZURvd25TY3JlZW4sXG4gIE1vdmVVcFRvRWRnZSxcbiAgTW92ZURvd25Ub0VkZ2UsXG4gIFdvcmRNb3Rpb24sXG4gIE1vdmVUb05leHRXb3JkLFxuICBNb3ZlVG9OZXh0V2hvbGVXb3JkLFxuICBNb3ZlVG9OZXh0QWxwaGFudW1lcmljV29yZCxcbiAgTW92ZVRvTmV4dFNtYXJ0V29yZCxcbiAgTW92ZVRvTmV4dFN1YndvcmQsXG4gIE1vdmVUb1ByZXZpb3VzV29yZCxcbiAgTW92ZVRvUHJldmlvdXNXaG9sZVdvcmQsXG4gIE1vdmVUb1ByZXZpb3VzQWxwaGFudW1lcmljV29yZCxcbiAgTW92ZVRvUHJldmlvdXNTbWFydFdvcmQsXG4gIE1vdmVUb1ByZXZpb3VzU3Vid29yZCxcbiAgTW92ZVRvRW5kT2ZXb3JkLFxuICBNb3ZlVG9FbmRPZldob2xlV29yZCxcbiAgTW92ZVRvRW5kT2ZBbHBoYW51bWVyaWNXb3JkLFxuICBNb3ZlVG9FbmRPZlNtYXJ0V29yZCxcbiAgTW92ZVRvRW5kT2ZTdWJ3b3JkLFxuICBNb3ZlVG9QcmV2aW91c0VuZE9mV29yZCxcbiAgTW92ZVRvUHJldmlvdXNFbmRPZldob2xlV29yZCxcbiAgTW92ZVRvTmV4dFNlbnRlbmNlLFxuICBNb3ZlVG9QcmV2aW91c1NlbnRlbmNlLFxuICBNb3ZlVG9OZXh0U2VudGVuY2VTa2lwQmxhbmtSb3csXG4gIE1vdmVUb1ByZXZpb3VzU2VudGVuY2VTa2lwQmxhbmtSb3csXG4gIE1vdmVUb05leHRQYXJhZ3JhcGgsXG4gIE1vdmVUb1ByZXZpb3VzUGFyYWdyYXBoLFxuICBNb3ZlVG9OZXh0RGlmZkh1bmssXG4gIE1vdmVUb1ByZXZpb3VzRGlmZkh1bmssXG4gIE1vdmVUb0JlZ2lubmluZ09mTGluZSxcbiAgTW92ZVRvQ29sdW1uLFxuICBNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lLFxuICBNb3ZlVG9MYXN0Tm9uYmxhbmtDaGFyYWN0ZXJPZkxpbmVBbmREb3duLFxuICBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSxcbiAgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVVcCxcbiAgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVEb3duLFxuICBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZUFuZERvd24sXG4gIE1vdmVUb1NjcmVlbkNvbHVtbixcbiAgTW92ZVRvQmVnaW5uaW5nT2ZTY3JlZW5MaW5lLFxuICBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mU2NyZWVuTGluZSxcbiAgTW92ZVRvTGFzdENoYXJhY3Rlck9mU2NyZWVuTGluZSxcbiAgTW92ZVRvRmlyc3RMaW5lLFxuICBNb3ZlVG9MYXN0TGluZSxcbiAgTW92ZVRvTGluZUJ5UGVyY2VudCxcbiAgTW92ZVRvUmVsYXRpdmVMaW5lLFxuICBNb3ZlVG9SZWxhdGl2ZUxpbmVNaW5pbXVtVHdvLFxuICBNb3ZlVG9Ub3BPZlNjcmVlbixcbiAgTW92ZVRvTWlkZGxlT2ZTY3JlZW4sXG4gIE1vdmVUb0JvdHRvbU9mU2NyZWVuLFxuICBTY3JvbGwsXG4gIFNjcm9sbEZ1bGxTY3JlZW5Eb3duLFxuICBTY3JvbGxGdWxsU2NyZWVuVXAsXG4gIFNjcm9sbEhhbGZTY3JlZW5Eb3duLFxuICBTY3JvbGxIYWxmU2NyZWVuVXAsXG4gIFNjcm9sbFF1YXJ0ZXJTY3JlZW5Eb3duLFxuICBTY3JvbGxRdWFydGVyU2NyZWVuVXAsXG4gIEZpbmQsXG4gIEZpbmRCYWNrd2FyZHMsXG4gIFRpbGwsXG4gIFRpbGxCYWNrd2FyZHMsXG4gIE1vdmVUb01hcmssXG4gIE1vdmVUb01hcmtMaW5lLFxuICBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCxcbiAgTW92ZVRvTmV4dEZvbGRTdGFydCxcbiAgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRXaXRoU2FtZUluZGVudCxcbiAgTW92ZVRvTmV4dEZvbGRTdGFydFdpdGhTYW1lSW5kZW50LFxuICBNb3ZlVG9QcmV2aW91c0ZvbGRFbmQsXG4gIE1vdmVUb05leHRGb2xkRW5kLFxuICBNb3ZlVG9QcmV2aW91c0Z1bmN0aW9uLFxuICBNb3ZlVG9OZXh0RnVuY3Rpb24sXG4gIE1vdmVUb1ByZXZpb3VzRnVuY3Rpb25BbmRSZWRyYXdDdXJzb3JMaW5lQXRVcHBlck1pZGRsZSxcbiAgTW92ZVRvTmV4dEZ1bmN0aW9uQW5kUmVkcmF3Q3Vyc29yTGluZUF0VXBwZXJNaWRkbGUsXG4gIE1vdmVUb1Bvc2l0aW9uQnlTY29wZSxcbiAgTW92ZVRvUHJldmlvdXNTdHJpbmcsXG4gIE1vdmVUb05leHRTdHJpbmcsXG4gIE1vdmVUb1ByZXZpb3VzTnVtYmVyLFxuICBNb3ZlVG9OZXh0TnVtYmVyLFxuICBNb3ZlVG9OZXh0T2NjdXJyZW5jZSxcbiAgTW92ZVRvUHJldmlvdXNPY2N1cnJlbmNlLFxuICBNb3ZlVG9QYWlyXG59XG4iXX0=