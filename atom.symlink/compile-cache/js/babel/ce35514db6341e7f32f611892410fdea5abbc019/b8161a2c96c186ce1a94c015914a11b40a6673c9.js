'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var settings = require('./settings');
var VimState = require('./vim-state');

var FILE_TABLE = undefined;

var classify = function classify(s) {
  return s[0].toUpperCase() + s.slice(1).replace(/-(\w)/g, function (m) {
    return m[1].toUpperCase();
  });
};
var dasherize = function dasherize(s) {
  return (s[0].toLowerCase() + s.slice(1)).replace(/[A-Z]/g, function (m) {
    return '-' + m.toLowerCase();
  });
};

module.exports = (function () {
  _createClass(Base, [{
    key: 'name',
    get: function get() {
      return this.constructor.name;
    }
  }], [{
    key: 'classByName',
    value: new Map(),
    enumerable: true
  }, {
    key: 'commandPrefix',
    value: 'vim-mode-plus',
    enumerable: true
  }, {
    key: 'commandScope',
    value: 'atom-text-editor',
    enumerable: true
  }, {
    key: 'operationKind',
    value: null,
    enumerable: true
  }]);

  function Base(vimState) {
    _classCallCheck(this, Base);

    this.recordable = false;
    this.repeated = false;
    this.count = null;
    this.defaultCount = 1;

    this.vimState = vimState;
  }

  _createClass(Base, [{
    key: 'initialize',
    value: function initialize() {}

    // Called both on cancel and success
  }, {
    key: 'resetState',
    value: function resetState() {}

    // OperationStack postpone execution untill isReady() get true, overridden on subclass.
  }, {
    key: 'isReady',
    value: function isReady() {
      return true;
    }

    // VisualModeSelect is anormal, since it's auto complemented in visial mode.
    // In other word, normal-operator is explicit whereas anormal-operator is implicit.
  }, {
    key: 'isTargetOfNormalOperator',
    value: function isTargetOfNormalOperator() {
      return this.operator && this.operator.name !== 'VisualModeSelect';
    }
  }, {
    key: 'hasCount',
    value: function hasCount() {
      return this.vimState.hasCount();
    }
  }, {
    key: 'getCount',
    value: function getCount() {
      if (this.count == null) {
        this.count = this.hasCount() ? this.vimState.getCount() : this.defaultCount;
      }
      return this.count;
    }

    // Identical to utils.limitNumber. Copy here to postpone full require of utils.
  }, {
    key: 'limitNumber',
    value: function limitNumber(number) {
      var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var max = _ref.max;
      var min = _ref.min;

      if (max != null) number = Math.min(number, max);
      if (min != null) number = Math.max(number, min);
      return number;
    }
  }, {
    key: 'resetCount',
    value: function resetCount() {
      this.count = null;
    }
  }, {
    key: 'countTimes',
    value: function countTimes(last, fn) {
      if (last < 1) return;

      var stopped = false;
      var stop = function stop() {
        return stopped = true;
      };
      for (var count = 1; count <= last; count++) {
        fn({ count: count, isFinal: count === last, stop: stop });
        if (stopped) break;
      }
    }
  }, {
    key: 'activateMode',
    value: function activateMode(mode, submode) {
      var _this = this;

      this.onDidFinishOperation(function () {
        _this.vimState.activate(mode, submode);
      });
    }
  }, {
    key: 'activateModeIfNecessary',
    value: function activateModeIfNecessary(mode, submode) {
      if (!this.vimState.isMode(mode, submode)) {
        this.activateMode(mode, submode);
      }
    }
  }, {
    key: 'getInstance',
    value: function getInstance(name, properties) {
      return this.constructor.getInstance(this.vimState, name, properties);
    }
  }, {
    key: 'cancelOperation',
    value: function cancelOperation() {
      this.vimState.operationStack.cancel(this);
    }
  }, {
    key: 'processOperation',
    value: function processOperation() {
      this.vimState.operationStack.process();
    }
  }, {
    key: 'focusInput',
    value: function focusInput() {
      var _this2 = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      if (!options.onConfirm) {
        options.onConfirm = function (input) {
          _this2.input = input;
          _this2.processOperation();
        };
      }
      if (!options.onCancel) options.onCancel = function () {
        return _this2.cancelOperation();
      };
      if (!options.onChange) options.onChange = function (input) {
        return _this2.vimState.hover.set(input);
      };

      this.vimState.focusInput(options);
    }

    // Return promise which resolve with input char or `undefined` when cancelled.
  }, {
    key: 'focusInputPromised',
    value: function focusInputPromised() {
      var _this3 = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return new Promise(function (resolve) {
        var defaultOptions = { hideCursor: true, onChange: function onChange(input) {
            return _this3.vimState.hover.set(input);
          } };
        _this3.vimState.focusInput(Object.assign(defaultOptions, options, { onConfirm: resolve, onCancel: resolve }));
      });
    }
  }, {
    key: 'readChar',
    value: function readChar() {
      var _this4 = this;

      this.vimState.readChar({
        onConfirm: function onConfirm(input) {
          _this4.input = input;
          _this4.processOperation();
        },
        onCancel: function onCancel() {
          return _this4.cancelOperation();
        }
      });
    }

    // Return promise which resolve with read char or `undefined` when cancelled.
  }, {
    key: 'readCharPromised',
    value: function readCharPromised() {
      var _this5 = this;

      return new Promise(function (resolve) {
        _this5.vimState.readChar({ onConfirm: resolve, onCancel: resolve });
      });
    }
  }, {
    key: 'instanceof',
    value: function _instanceof(klassName) {
      return this instanceof Base.getClass(klassName);
    }
  }, {
    key: 'isOperator',
    value: function isOperator() {
      // Don't use `instanceof` to postpone require for faster activation.
      return this.constructor.operationKind === 'operator';
    }
  }, {
    key: 'isMotion',
    value: function isMotion() {
      // Don't use `instanceof` to postpone require for faster activation.
      return this.constructor.operationKind === 'motion';
    }
  }, {
    key: 'isTextObject',
    value: function isTextObject() {
      // Don't use `instanceof` to postpone require for faster activation.
      return this.constructor.operationKind === 'text-object';
    }
  }, {
    key: 'getCursorBufferPosition',
    value: function getCursorBufferPosition() {
      return this.getBufferPositionForCursor(this.editor.getLastCursor());
    }
  }, {
    key: 'getCursorBufferPositions',
    value: function getCursorBufferPositions() {
      var _this6 = this;

      return this.editor.getCursors().map(function (cursor) {
        return _this6.getBufferPositionForCursor(cursor);
      });
    }
  }, {
    key: 'getCursorBufferPositionsOrdered',
    value: function getCursorBufferPositionsOrdered() {
      return this.utils.sortPoints(this.getCursorBufferPositions());
    }
  }, {
    key: 'getBufferPositionForCursor',
    value: function getBufferPositionForCursor(cursor) {
      return this.mode === 'visual' ? this.getCursorPositionForSelection(cursor.selection) : cursor.getBufferPosition();
    }
  }, {
    key: 'getCursorPositionForSelection',
    value: function getCursorPositionForSelection(selection) {
      return this.swrap(selection).getBufferPositionFor('head', { from: ['property', 'selection'] });
    }
  }, {
    key: 'getOperationTypeChar',
    value: function getOperationTypeChar() {
      return ({ operator: 'O', 'text-object': 'T', motion: 'M', 'misc-command': 'X' })[this.constructor.operationKind];
    }
  }, {
    key: 'toString',
    value: function toString() {
      var base = this.name + '<' + this.getOperationTypeChar() + '>';
      return this.target ? base + '{target = ' + this.target.toString() + '}' : base;
    }
  }, {
    key: 'getCommandName',
    value: function getCommandName() {
      return this.constructor.getCommandName();
    }
  }, {
    key: 'getCommandNameWithoutPrefix',
    value: function getCommandNameWithoutPrefix() {
      return this.constructor.getCommandNameWithoutPrefix();
    }
  }, {
    key: 'getSmoothScrollDuation',
    value: function getSmoothScrollDuation(kind) {
      var base = 'smoothScrollOn' + kind;
      return this.getConfig(base) ? this.getConfig(base + 'Duration') : 0;
    }

    // Proxy propperties and methods
    // ===========================================================================
  }, {
    key: 'onDidChangeSearch',
    // prettier-ignore

    value: function onDidChangeSearch() {
      var _vimState;

      return (_vimState = this.vimState).onDidChangeSearch.apply(_vimState, arguments);
    }
    // prettier-ignore
  }, {
    key: 'onDidConfirmSearch',
    value: function onDidConfirmSearch() {
      var _vimState2;

      return (_vimState2 = this.vimState).onDidConfirmSearch.apply(_vimState2, arguments);
    }
    // prettier-ignore
  }, {
    key: 'onDidCancelSearch',
    value: function onDidCancelSearch() {
      var _vimState3;

      return (_vimState3 = this.vimState).onDidCancelSearch.apply(_vimState3, arguments);
    }
    // prettier-ignore
  }, {
    key: 'onDidCommandSearch',
    value: function onDidCommandSearch() {
      var _vimState4;

      return (_vimState4 = this.vimState).onDidCommandSearch.apply(_vimState4, arguments);
    }
    // prettier-ignore
  }, {
    key: 'onDidSetTarget',
    value: function onDidSetTarget() {
      var _vimState5;

      return (_vimState5 = this.vimState).onDidSetTarget.apply(_vimState5, arguments);
    }
    // prettier-ignore
  }, {
    key: 'emitDidSetTarget',
    value: function emitDidSetTarget() {
      var _vimState6;

      return (_vimState6 = this.vimState).emitDidSetTarget.apply(_vimState6, arguments);
    }
    // prettier-ignore
  }, {
    key: 'onWillSelectTarget',
    value: function onWillSelectTarget() {
      var _vimState7;

      return (_vimState7 = this.vimState).onWillSelectTarget.apply(_vimState7, arguments);
    }
    // prettier-ignore
  }, {
    key: 'emitWillSelectTarget',
    value: function emitWillSelectTarget() {
      var _vimState8;

      return (_vimState8 = this.vimState).emitWillSelectTarget.apply(_vimState8, arguments);
    }
    // prettier-ignore
  }, {
    key: 'onDidSelectTarget',
    value: function onDidSelectTarget() {
      var _vimState9;

      return (_vimState9 = this.vimState).onDidSelectTarget.apply(_vimState9, arguments);
    }
    // prettier-ignore
  }, {
    key: 'emitDidSelectTarget',
    value: function emitDidSelectTarget() {
      var _vimState10;

      return (_vimState10 = this.vimState).emitDidSelectTarget.apply(_vimState10, arguments);
    }
    // prettier-ignore
  }, {
    key: 'onDidFailSelectTarget',
    value: function onDidFailSelectTarget() {
      var _vimState11;

      return (_vimState11 = this.vimState).onDidFailSelectTarget.apply(_vimState11, arguments);
    }
    // prettier-ignore
  }, {
    key: 'emitDidFailSelectTarget',
    value: function emitDidFailSelectTarget() {
      var _vimState12;

      return (_vimState12 = this.vimState).emitDidFailSelectTarget.apply(_vimState12, arguments);
    }
    // prettier-ignore
  }, {
    key: 'onWillFinishMutation',
    value: function onWillFinishMutation() {
      var _vimState13;

      return (_vimState13 = this.vimState).onWillFinishMutation.apply(_vimState13, arguments);
    }
    // prettier-ignore
  }, {
    key: 'emitWillFinishMutation',
    value: function emitWillFinishMutation() {
      var _vimState14;

      return (_vimState14 = this.vimState).emitWillFinishMutation.apply(_vimState14, arguments);
    }
    // prettier-ignore
  }, {
    key: 'onDidFinishMutation',
    value: function onDidFinishMutation() {
      var _vimState15;

      return (_vimState15 = this.vimState).onDidFinishMutation.apply(_vimState15, arguments);
    }
    // prettier-ignore
  }, {
    key: 'emitDidFinishMutation',
    value: function emitDidFinishMutation() {
      var _vimState16;

      return (_vimState16 = this.vimState).emitDidFinishMutation.apply(_vimState16, arguments);
    }
    // prettier-ignore
  }, {
    key: 'onDidFinishOperation',
    value: function onDidFinishOperation() {
      var _vimState17;

      return (_vimState17 = this.vimState).onDidFinishOperation.apply(_vimState17, arguments);
    }
    // prettier-ignore
  }, {
    key: 'onDidResetOperationStack',
    value: function onDidResetOperationStack() {
      var _vimState18;

      return (_vimState18 = this.vimState).onDidResetOperationStack.apply(_vimState18, arguments);
    }
    // prettier-ignore
  }, {
    key: 'subscribe',
    value: function subscribe() {
      var _vimState19;

      return (_vimState19 = this.vimState).subscribe.apply(_vimState19, arguments);
    }
    // prettier-ignore
  }, {
    key: 'isMode',
    value: function isMode() {
      var _vimState20;

      return (_vimState20 = this.vimState).isMode.apply(_vimState20, arguments);
    }
    // prettier-ignore
  }, {
    key: 'getBlockwiseSelections',
    value: function getBlockwiseSelections() {
      var _vimState21;

      return (_vimState21 = this.vimState).getBlockwiseSelections.apply(_vimState21, arguments);
    }
    // prettier-ignore
  }, {
    key: 'getLastBlockwiseSelection',
    value: function getLastBlockwiseSelection() {
      var _vimState22;

      return (_vimState22 = this.vimState).getLastBlockwiseSelection.apply(_vimState22, arguments);
    }
    // prettier-ignore
  }, {
    key: 'addToClassList',
    value: function addToClassList() {
      var _vimState23;

      return (_vimState23 = this.vimState).addToClassList.apply(_vimState23, arguments);
    }
    // prettier-ignore
  }, {
    key: 'getConfig',
    value: function getConfig() {
      var _vimState24;

      return (_vimState24 = this.vimState).getConfig.apply(_vimState24, arguments);
    }
    // prettier-ignore

    // Wrapper for this.utils
    // ===========================================================================
  }, {
    key: 'getVimEofBufferPosition',
    value: function getVimEofBufferPosition() {
      return this.utils.getVimEofBufferPosition(this.editor);
    }
    // prettier-ignore
  }, {
    key: 'getVimLastBufferRow',
    value: function getVimLastBufferRow() {
      return this.utils.getVimLastBufferRow(this.editor);
    }
    // prettier-ignore
  }, {
    key: 'getVimLastScreenRow',
    value: function getVimLastScreenRow() {
      return this.utils.getVimLastScreenRow(this.editor);
    }
    // prettier-ignore
  }, {
    key: 'getValidVimBufferRow',
    value: function getValidVimBufferRow(row) {
      return this.utils.getValidVimBufferRow(this.editor, row);
    }
    // prettier-ignore
  }, {
    key: 'getValidVimScreenRow',
    value: function getValidVimScreenRow(row) {
      return this.utils.getValidVimScreenRow(this.editor, row);
    }
    // prettier-ignore
  }, {
    key: 'getWordBufferRangeAndKindAtBufferPosition',
    value: function getWordBufferRangeAndKindAtBufferPosition() {
      var _utils;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return (_utils = this.utils).getWordBufferRangeAndKindAtBufferPosition.apply(_utils, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: 'getFirstCharacterPositionForBufferRow',
    value: function getFirstCharacterPositionForBufferRow(row) {
      return this.utils.getFirstCharacterPositionForBufferRow(this.editor, row);
    }
    // prettier-ignore
  }, {
    key: 'getBufferRangeForRowRange',
    value: function getBufferRangeForRowRange(rowRange) {
      return this.utils.getBufferRangeForRowRange(this.editor, rowRange);
    }
    // prettier-ignore
  }, {
    key: 'scanEditor',
    value: function scanEditor() {
      var _utils2;

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return (_utils2 = this.utils).scanEditor.apply(_utils2, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: 'findInEditor',
    value: function findInEditor() {
      var _utils3;

      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return (_utils3 = this.utils).findInEditor.apply(_utils3, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: 'findPoint',
    value: function findPoint() {
      var _utils4;

      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return (_utils4 = this.utils).findPoint.apply(_utils4, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: 'trimBufferRange',
    value: function trimBufferRange() {
      var _utils5;

      for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      return (_utils5 = this.utils).trimBufferRange.apply(_utils5, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: 'isEmptyRow',
    value: function isEmptyRow() {
      var _utils6;

      for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }

      return (_utils6 = this.utils).isEmptyRow.apply(_utils6, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: 'getFoldStartRowForRow',
    value: function getFoldStartRowForRow() {
      var _utils7;

      for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        args[_key7] = arguments[_key7];
      }

      return (_utils7 = this.utils).getFoldStartRowForRow.apply(_utils7, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: 'getFoldEndRowForRow',
    value: function getFoldEndRowForRow() {
      var _utils8;

      for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        args[_key8] = arguments[_key8];
      }

      return (_utils8 = this.utils).getFoldEndRowForRow.apply(_utils8, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: 'getBufferRows',
    value: function getBufferRows() {
      var _utils9;

      for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
        args[_key9] = arguments[_key9];
      }

      return (_utils9 = this.utils).getRows.apply(_utils9, [this.editor, 'buffer'].concat(args));
    }
    // prettier-ignore
  }, {
    key: 'getScreenRows',
    value: function getScreenRows() {
      var _utils10;

      for (var _len10 = arguments.length, args = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
        args[_key10] = arguments[_key10];
      }

      return (_utils10 = this.utils).getRows.apply(_utils10, [this.editor, 'screen'].concat(args));
    }
    // prettier-ignore
  }, {
    key: 'replaceTextInRangeViaDiff',
    value: function replaceTextInRangeViaDiff() {
      var _utils11;

      for (var _len11 = arguments.length, args = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
        args[_key11] = arguments[_key11];
      }

      return (_utils11 = this.utils).replaceTextInRangeViaDiff.apply(_utils11, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: 'mode',
    get: function get() {
      return this.vimState.mode;
    }
    // prettier-ignore
  }, {
    key: 'submode',
    get: function get() {
      return this.vimState.submode;
    }
    // prettier-ignore
  }, {
    key: 'swrap',
    get: function get() {
      return this.vimState.swrap;
    }
    // prettier-ignore
  }, {
    key: 'utils',
    get: function get() {
      return this.vimState.utils;
    }
    // prettier-ignore
  }, {
    key: 'editor',
    get: function get() {
      return this.vimState.editor;
    }
    // prettier-ignore
  }, {
    key: 'editorElement',
    get: function get() {
      return this.vimState.editorElement;
    }
    // prettier-ignore
  }, {
    key: 'globalState',
    get: function get() {
      return this.vimState.globalState;
    }
    // prettier-ignore
  }, {
    key: 'mutationManager',
    get: function get() {
      return this.vimState.mutationManager;
    }
    // prettier-ignore
  }, {
    key: 'occurrenceManager',
    get: function get() {
      return this.vimState.occurrenceManager;
    }
    // prettier-ignore
  }, {
    key: 'persistentSelection',
    get: function get() {
      return this.vimState.persistentSelection;
    }
    // prettier-ignore
  }, {
    key: '_',
    get: function get() {
      return this.vimState._;
    }
    // prettier-ignore
  }], [{
    key: 'isCommand',
    value: function isCommand() {
      return this.hasOwnProperty('command') ? this.command : true;
    }
  }, {
    key: 'getClass',
    value: function getClass(name) {
      if (!this.classByName.has(name)) {
        if (!FILE_TABLE) {
          (function () {
            FILE_TABLE = {};
            var namesByFile = require('./json/file-table.json');
            // convert namesByFile to fileByName(= FILE_TABLE)
            Object.keys(namesByFile).forEach(function (file) {
              return namesByFile[file].forEach(function (name) {
                return FILE_TABLE[name] = file;
              });
            });
          })();
        }
        Object.values(require(FILE_TABLE[name])).forEach(function (klass) {
          return klass.register();
        });

        if (atom.inDevMode() && settings.get('debug')) {
          console.log('lazy-require: ' + FILE_TABLE[name] + ' for ' + name);
        }
      }

      var klass = this.classByName.get(name);
      if (!klass) {
        throw new Error('class \'' + name + '\' not found');
      }
      return klass;
    }
  }, {
    key: 'getInstance',
    value: function getInstance(vimState, klass, properties) {
      klass = typeof klass === 'function' ? klass : Base.getClass(klass);
      var object = new klass(vimState); // eslint-disable-line new-cap
      if (properties) Object.assign(object, properties);
      object.initialize();
      return object;
    }

    // Don't remove this. Public API to register operations to classTable
    // This can be used from vmp-plugin such as vmp-ex-mode.
  }, {
    key: 'register',
    value: function register() {
      if (this.classByName.has(this.name)) {
        console.warn('Duplicate constructor ' + this.name);
      }
      this.classByName.set(this.name, this);
    }
  }, {
    key: 'getCommandName',
    value: function getCommandName() {
      return this.commandPrefix + ':' + this.getCommandNameWithoutPrefix();
    }
  }, {
    key: 'getCommandNameWithoutPrefix',
    value: function getCommandNameWithoutPrefix() {
      return dasherize(this.name);
    }
  }, {
    key: 'registerCommand',
    value: function registerCommand() {
      var _this7 = this;

      return VimState.registerCommandFromSpec(this.name, {
        scope: this.commandScope,
        prefix: this.commandPrefix,
        getClass: function getClass() {
          return _this7;
        }
      });
    }
  }, {
    key: 'getKindForCommandName',
    value: function getKindForCommandName(command) {
      var commandWithoutPrefix = command.replace(/^vim-mode-plus:/, '');
      var commandClassName = classify(commandWithoutPrefix);
      if (this.classByName.has(commandClassName)) {
        return this.classByName.get(commandClassName).operationKind;
      }
    }
  }, {
    key: '_',
    get: function get() {
      return VimState._;
    }
  }]);

  return Base;
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmRvdGZpbGVzL2F0b20uc3ltbGluay9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9iYXNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7O0FBRVgsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFBO0FBQ3RDLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQTs7QUFFdkMsSUFBSSxVQUFVLFlBQUEsQ0FBQTs7QUFFZCxJQUFNLFFBQVEsR0FBRyxTQUFYLFFBQVEsQ0FBRyxDQUFDO1NBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxVQUFBLENBQUM7V0FBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFO0dBQUEsQ0FBQztDQUFBLENBQUE7QUFDaEcsSUFBTSxTQUFTLEdBQUcsU0FBWixTQUFTLENBQUcsQ0FBQztTQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBRSxPQUFPLENBQUMsUUFBUSxFQUFFLFVBQUEsQ0FBQztXQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFO0dBQUEsQ0FBQztDQUFBLENBQUE7O0FBRXRHLE1BQU0sQ0FBQyxPQUFPO2VBQVMsSUFBSTs7U0FXaEIsZUFBRztBQUNWLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUE7S0FDN0I7OztXQVpvQixJQUFJLEdBQUcsRUFBRTs7OztXQUNQLGVBQWU7Ozs7V0FDaEIsa0JBQWtCOzs7O1dBQ2pCLElBQUk7Ozs7QUFXZixXQWZTLElBQUksQ0FlWixRQUFRLEVBQUU7MEJBZkYsSUFBSTs7U0FN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QixhQUFPLElBQUksQ0FBQyxhQUFhLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFBO0tBQ3JFOzs7V0FFa0MsdUNBQUc7QUFDcEMsYUFBTyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQzVCOzs7V0FFc0IsMkJBQUc7OztBQUN4QixhQUFPLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQ2pELGFBQUssRUFBRSxJQUFJLENBQUMsWUFBWTtBQUN4QixjQUFNLEVBQUUsSUFBSSxDQUFDLGFBQWE7QUFDMUIsZ0JBQVEsRUFBRTs7U0FBVTtPQUNyQixDQUFDLENBQUE7S0FDSDs7O1dBRTRCLCtCQUFDLE9BQU8sRUFBRTtBQUNyQyxVQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDbkUsVUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtBQUN2RCxVQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7QUFDMUMsZUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLGFBQWEsQ0FBQTtPQUM1RDtLQUNGOzs7U0FvQlksZUFBRztBQUFFLGFBQU8sUUFBUSxDQUFDLENBQUMsQ0FBQTtLQUFFOzs7U0EvUWhCLElBQUk7SUE4VDFCLENBQUEiLCJmaWxlIjoiL1VzZXJzL3NoYW5ub25iZXJ0dWNjaS8uZG90ZmlsZXMvYXRvbS5zeW1saW5rL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5jb25zdCBzZXR0aW5ncyA9IHJlcXVpcmUoJy4vc2V0dGluZ3MnKVxuY29uc3QgVmltU3RhdGUgPSByZXF1aXJlKCcuL3ZpbS1zdGF0ZScpXG5cbmxldCBGSUxFX1RBQkxFXG5cbmNvbnN0IGNsYXNzaWZ5ID0gcyA9PiBzWzBdLnRvVXBwZXJDYXNlKCkgKyBzLnNsaWNlKDEpLnJlcGxhY2UoLy0oXFx3KS9nLCBtID0+IG1bMV0udG9VcHBlckNhc2UoKSlcbmNvbnN0IGRhc2hlcml6ZSA9IHMgPT4gKHNbMF0udG9Mb3dlckNhc2UoKSArIHMuc2xpY2UoMSkpLnJlcGxhY2UoL1tBLVpdL2csIG0gPT4gJy0nICsgbS50b0xvd2VyQ2FzZSgpKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEJhc2Uge1xuICBzdGF0aWMgY2xhc3NCeU5hbWUgPSBuZXcgTWFwKClcbiAgc3RhdGljIGNvbW1hbmRQcmVmaXggPSAndmltLW1vZGUtcGx1cydcbiAgc3RhdGljIGNvbW1hbmRTY29wZSA9ICdhdG9tLXRleHQtZWRpdG9yJ1xuICBzdGF0aWMgb3BlcmF0aW9uS2luZCA9IG51bGxcblxuICByZWNvcmRhYmxlID0gZmFsc2VcbiAgcmVwZWF0ZWQgPSBmYWxzZVxuICBjb3VudCA9IG51bGxcbiAgZGVmYXVsdENvdW50ID0gMVxuXG4gIGdldCBuYW1lICgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lXG4gIH1cblxuICBjb25zdHJ1Y3RvciAodmltU3RhdGUpIHtcbiAgICB0aGlzLnZpbVN0YXRlID0gdmltU3RhdGVcbiAgfVxuXG4gIGluaXRpYWxpemUgKCkge31cblxuICAvLyBDYWxsZWQgYm90aCBvbiBjYW5jZWwgYW5kIHN1Y2Nlc3NcbiAgcmVzZXRTdGF0ZSAoKSB7fVxuXG4gIC8vIE9wZXJhdGlvblN0YWNrIHBvc3Rwb25lIGV4ZWN1dGlvbiB1bnRpbGwgaXNSZWFkeSgpIGdldCB0cnVlLCBvdmVycmlkZGVuIG9uIHN1YmNsYXNzLlxuICBpc1JlYWR5ICgpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLy8gVmlzdWFsTW9kZVNlbGVjdCBpcyBhbm9ybWFsLCBzaW5jZSBpdCdzIGF1dG8gY29tcGxlbWVudGVkIGluIHZpc2lhbCBtb2RlLlxuICAvLyBJbiBvdGhlciB3b3JkLCBub3JtYWwtb3BlcmF0b3IgaXMgZXhwbGljaXQgd2hlcmVhcyBhbm9ybWFsLW9wZXJhdG9yIGlzIGltcGxpY2l0LlxuICBpc1RhcmdldE9mTm9ybWFsT3BlcmF0b3IgKCkge1xuICAgIHJldHVybiB0aGlzLm9wZXJhdG9yICYmIHRoaXMub3BlcmF0b3IubmFtZSAhPT0gJ1Zpc3VhbE1vZGVTZWxlY3QnXG4gIH1cblxuICBoYXNDb3VudCAoKSB7XG4gICAgcmV0dXJuIHRoaXMudmltU3RhdGUuaGFzQ291bnQoKVxuICB9XG5cbiAgZ2V0Q291bnQgKCkge1xuICAgIGlmICh0aGlzLmNvdW50ID09IG51bGwpIHtcbiAgICAgIHRoaXMuY291bnQgPSB0aGlzLmhhc0NvdW50KCkgPyB0aGlzLnZpbVN0YXRlLmdldENvdW50KCkgOiB0aGlzLmRlZmF1bHRDb3VudFxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jb3VudFxuICB9XG5cbiAgLy8gSWRlbnRpY2FsIHRvIHV0aWxzLmxpbWl0TnVtYmVyLiBDb3B5IGhlcmUgdG8gcG9zdHBvbmUgZnVsbCByZXF1aXJlIG9mIHV0aWxzLlxuICBsaW1pdE51bWJlciAobnVtYmVyLCB7bWF4LCBtaW59ID0ge30pIHtcbiAgICBpZiAobWF4ICE9IG51bGwpIG51bWJlciA9IE1hdGgubWluKG51bWJlciwgbWF4KVxuICAgIGlmIChtaW4gIT0gbnVsbCkgbnVtYmVyID0gTWF0aC5tYXgobnVtYmVyLCBtaW4pXG4gICAgcmV0dXJuIG51bWJlclxuICB9XG5cbiAgcmVzZXRDb3VudCAoKSB7XG4gICAgdGhpcy5jb3VudCA9IG51bGxcbiAgfVxuXG4gIGNvdW50VGltZXMgKGxhc3QsIGZuKSB7XG4gICAgaWYgKGxhc3QgPCAxKSByZXR1cm5cblxuICAgIGxldCBzdG9wcGVkID0gZmFsc2VcbiAgICBjb25zdCBzdG9wID0gKCkgPT4gKHN0b3BwZWQgPSB0cnVlKVxuICAgIGZvciAobGV0IGNvdW50ID0gMTsgY291bnQgPD0gbGFzdDsgY291bnQrKykge1xuICAgICAgZm4oe2NvdW50LCBpc0ZpbmFsOiBjb3VudCA9PT0gbGFzdCwgc3RvcH0pXG4gICAgICBpZiAoc3RvcHBlZCkgYnJlYWtcbiAgICB9XG4gIH1cblxuICBhY3RpdmF0ZU1vZGUgKG1vZGUsIHN1Ym1vZGUpIHtcbiAgICB0aGlzLm9uRGlkRmluaXNoT3BlcmF0aW9uKCgpID0+IHtcbiAgICAgIHRoaXMudmltU3RhdGUuYWN0aXZhdGUobW9kZSwgc3VibW9kZSlcbiAgICB9KVxuICB9XG5cbiAgYWN0aXZhdGVNb2RlSWZOZWNlc3NhcnkgKG1vZGUsIHN1Ym1vZGUpIHtcbiAgICBpZiAoIXRoaXMudmltU3RhdGUuaXNNb2RlKG1vZGUsIHN1Ym1vZGUpKSB7XG4gICAgICB0aGlzLmFjdGl2YXRlTW9kZShtb2RlLCBzdWJtb2RlKVxuICAgIH1cbiAgfVxuXG4gIGdldEluc3RhbmNlIChuYW1lLCBwcm9wZXJ0aWVzKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IuZ2V0SW5zdGFuY2UodGhpcy52aW1TdGF0ZSwgbmFtZSwgcHJvcGVydGllcylcbiAgfVxuXG4gIGNhbmNlbE9wZXJhdGlvbiAoKSB7XG4gICAgdGhpcy52aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5jYW5jZWwodGhpcylcbiAgfVxuXG4gIHByb2Nlc3NPcGVyYXRpb24gKCkge1xuICAgIHRoaXMudmltU3RhdGUub3BlcmF0aW9uU3RhY2sucHJvY2VzcygpXG4gIH1cblxuICBmb2N1c0lucHV0IChvcHRpb25zID0ge30pIHtcbiAgICBpZiAoIW9wdGlvbnMub25Db25maXJtKSB7XG4gICAgICBvcHRpb25zLm9uQ29uZmlybSA9IGlucHV0ID0+IHtcbiAgICAgICAgdGhpcy5pbnB1dCA9IGlucHV0XG4gICAgICAgIHRoaXMucHJvY2Vzc09wZXJhdGlvbigpXG4gICAgICB9XG4gICAgfVxuICAgIGlmICghb3B0aW9ucy5vbkNhbmNlbCkgb3B0aW9ucy5vbkNhbmNlbCA9ICgpID0+IHRoaXMuY2FuY2VsT3BlcmF0aW9uKClcbiAgICBpZiAoIW9wdGlvbnMub25DaGFuZ2UpIG9wdGlvbnMub25DaGFuZ2UgPSBpbnB1dCA9PiB0aGlzLnZpbVN0YXRlLmhvdmVyLnNldChpbnB1dClcblxuICAgIHRoaXMudmltU3RhdGUuZm9jdXNJbnB1dChvcHRpb25zKVxuICB9XG5cbiAgLy8gUmV0dXJuIHByb21pc2Ugd2hpY2ggcmVzb2x2ZSB3aXRoIGlucHV0IGNoYXIgb3IgYHVuZGVmaW5lZGAgd2hlbiBjYW5jZWxsZWQuXG4gIGZvY3VzSW5wdXRQcm9taXNlZCAob3B0aW9ucyA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7aGlkZUN1cnNvcjogdHJ1ZSwgb25DaGFuZ2U6IGlucHV0ID0+IHRoaXMudmltU3RhdGUuaG92ZXIuc2V0KGlucHV0KX1cbiAgICAgIHRoaXMudmltU3RhdGUuZm9jdXNJbnB1dChPYmplY3QuYXNzaWduKGRlZmF1bHRPcHRpb25zLCBvcHRpb25zLCB7b25Db25maXJtOiByZXNvbHZlLCBvbkNhbmNlbDogcmVzb2x2ZX0pKVxuICAgIH0pXG4gIH1cblxuICByZWFkQ2hhciAoKSB7XG4gICAgdGhpcy52aW1TdGF0ZS5yZWFkQ2hhcih7XG4gICAgICBvbkNvbmZpcm06IGlucHV0ID0+IHtcbiAgICAgICAgdGhpcy5pbnB1dCA9IGlucHV0XG4gICAgICAgIHRoaXMucHJvY2Vzc09wZXJhdGlvbigpXG4gICAgICB9LFxuICAgICAgb25DYW5jZWw6ICgpID0+IHRoaXMuY2FuY2VsT3BlcmF0aW9uKClcbiAgICB9KVxuICB9XG5cbiAgLy8gUmV0dXJuIHByb21pc2Ugd2hpY2ggcmVzb2x2ZSB3aXRoIHJlYWQgY2hhciBvciBgdW5kZWZpbmVkYCB3aGVuIGNhbmNlbGxlZC5cbiAgcmVhZENoYXJQcm9taXNlZCAoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgdGhpcy52aW1TdGF0ZS5yZWFkQ2hhcih7b25Db25maXJtOiByZXNvbHZlLCBvbkNhbmNlbDogcmVzb2x2ZX0pXG4gICAgfSlcbiAgfVxuXG4gIGluc3RhbmNlb2YgKGtsYXNzTmFtZSkge1xuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgQmFzZS5nZXRDbGFzcyhrbGFzc05hbWUpXG4gIH1cblxuICBpc09wZXJhdG9yICgpIHtcbiAgICAvLyBEb24ndCB1c2UgYGluc3RhbmNlb2ZgIHRvIHBvc3Rwb25lIHJlcXVpcmUgZm9yIGZhc3RlciBhY3RpdmF0aW9uLlxuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgPT09ICdvcGVyYXRvcidcbiAgfVxuXG4gIGlzTW90aW9uICgpIHtcbiAgICAvLyBEb24ndCB1c2UgYGluc3RhbmNlb2ZgIHRvIHBvc3Rwb25lIHJlcXVpcmUgZm9yIGZhc3RlciBhY3RpdmF0aW9uLlxuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgPT09ICdtb3Rpb24nXG4gIH1cblxuICBpc1RleHRPYmplY3QgKCkge1xuICAgIC8vIERvbid0IHVzZSBgaW5zdGFuY2VvZmAgdG8gcG9zdHBvbmUgcmVxdWlyZSBmb3IgZmFzdGVyIGFjdGl2YXRpb24uXG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3Iub3BlcmF0aW9uS2luZCA9PT0gJ3RleHQtb2JqZWN0J1xuICB9XG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmdldEJ1ZmZlclBvc2l0aW9uRm9yQ3Vyc29yKHRoaXMuZWRpdG9yLmdldExhc3RDdXJzb3IoKSlcbiAgfVxuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKS5tYXAoY3Vyc29yID0+IHRoaXMuZ2V0QnVmZmVyUG9zaXRpb25Gb3JDdXJzb3IoY3Vyc29yKSlcbiAgfVxuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uc09yZGVyZWQgKCkge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLnNvcnRQb2ludHModGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKSlcbiAgfVxuXG4gIGdldEJ1ZmZlclBvc2l0aW9uRm9yQ3Vyc29yIChjdXJzb3IpIHtcbiAgICByZXR1cm4gdGhpcy5tb2RlID09PSAndmlzdWFsJyA/IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oY3Vyc29yLnNlbGVjdGlvbikgOiBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICB9XG5cbiAgZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24gKHNlbGVjdGlvbikge1xuICAgIHJldHVybiB0aGlzLnN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ2hlYWQnLCB7ZnJvbTogWydwcm9wZXJ0eScsICdzZWxlY3Rpb24nXX0pXG4gIH1cblxuICBnZXRPcGVyYXRpb25UeXBlQ2hhciAoKSB7XG4gICAgcmV0dXJuIHtvcGVyYXRvcjogJ08nLCAndGV4dC1vYmplY3QnOiAnVCcsIG1vdGlvbjogJ00nLCAnbWlzYy1jb21tYW5kJzogJ1gnfVt0aGlzLmNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmRdXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgY29uc3QgYmFzZSA9IGAke3RoaXMubmFtZX08JHt0aGlzLmdldE9wZXJhdGlvblR5cGVDaGFyKCl9PmBcbiAgICByZXR1cm4gdGhpcy50YXJnZXQgPyBgJHtiYXNlfXt0YXJnZXQgPSAke3RoaXMudGFyZ2V0LnRvU3RyaW5nKCl9fWAgOiBiYXNlXG4gIH1cblxuICBnZXRDb21tYW5kTmFtZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IuZ2V0Q29tbWFuZE5hbWUoKVxuICB9XG5cbiAgZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4ICgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5nZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXgoKVxuICB9XG5cbiAgc3RhdGljIGlzQ29tbWFuZCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaGFzT3duUHJvcGVydHkoJ2NvbW1hbmQnKSA/IHRoaXMuY29tbWFuZCA6IHRydWVcbiAgfVxuXG4gIHN0YXRpYyBnZXRDbGFzcyAobmFtZSkge1xuICAgIGlmICghdGhpcy5jbGFzc0J5TmFtZS5oYXMobmFtZSkpIHtcbiAgICAgIGlmICghRklMRV9UQUJMRSkge1xuICAgICAgICBGSUxFX1RBQkxFID0ge31cbiAgICAgICAgY29uc3QgbmFtZXNCeUZpbGUgPSByZXF1aXJlKCcuL2pzb24vZmlsZS10YWJsZS5qc29uJylcbiAgICAgICAgLy8gY29udmVydCBuYW1lc0J5RmlsZSB0byBmaWxlQnlOYW1lKD0gRklMRV9UQUJMRSlcbiAgICAgICAgT2JqZWN0LmtleXMobmFtZXNCeUZpbGUpLmZvckVhY2goZmlsZSA9PiBuYW1lc0J5RmlsZVtmaWxlXS5mb3JFYWNoKG5hbWUgPT4gKEZJTEVfVEFCTEVbbmFtZV0gPSBmaWxlKSkpXG4gICAgICB9XG4gICAgICBPYmplY3QudmFsdWVzKHJlcXVpcmUoRklMRV9UQUJMRVtuYW1lXSkpLmZvckVhY2goa2xhc3MgPT4ga2xhc3MucmVnaXN0ZXIoKSlcblxuICAgICAgaWYgKGF0b20uaW5EZXZNb2RlKCkgJiYgc2V0dGluZ3MuZ2V0KCdkZWJ1ZycpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBsYXp5LXJlcXVpcmU6ICR7RklMRV9UQUJMRVtuYW1lXX0gZm9yICR7bmFtZX1gKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGtsYXNzID0gdGhpcy5jbGFzc0J5TmFtZS5nZXQobmFtZSlcbiAgICBpZiAoIWtsYXNzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGNsYXNzICcke25hbWV9JyBub3QgZm91bmRgKVxuICAgIH1cbiAgICByZXR1cm4ga2xhc3NcbiAgfVxuXG4gIHN0YXRpYyBnZXRJbnN0YW5jZSAodmltU3RhdGUsIGtsYXNzLCBwcm9wZXJ0aWVzKSB7XG4gICAga2xhc3MgPSB0eXBlb2Yga2xhc3MgPT09ICdmdW5jdGlvbicgPyBrbGFzcyA6IEJhc2UuZ2V0Q2xhc3Moa2xhc3MpXG4gICAgY29uc3Qgb2JqZWN0ID0gbmV3IGtsYXNzKHZpbVN0YXRlKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5ldy1jYXBcbiAgICBpZiAocHJvcGVydGllcykgT2JqZWN0LmFzc2lnbihvYmplY3QsIHByb3BlcnRpZXMpXG4gICAgb2JqZWN0LmluaXRpYWxpemUoKVxuICAgIHJldHVybiBvYmplY3RcbiAgfVxuXG4gIC8vIERvbid0IHJlbW92ZSB0aGlzLiBQdWJsaWMgQVBJIHRvIHJlZ2lzdGVyIG9wZXJhdGlvbnMgdG8gY2xhc3NUYWJsZVxuICAvLyBUaGlzIGNhbiBiZSB1c2VkIGZyb20gdm1wLXBsdWdpbiBzdWNoIGFzIHZtcC1leC1tb2RlLlxuICBzdGF0aWMgcmVnaXN0ZXIgKCkge1xuICAgIGlmICh0aGlzLmNsYXNzQnlOYW1lLmhhcyh0aGlzLm5hbWUpKSB7XG4gICAgICBjb25zb2xlLndhcm4oYER1cGxpY2F0ZSBjb25zdHJ1Y3RvciAke3RoaXMubmFtZX1gKVxuICAgIH1cbiAgICB0aGlzLmNsYXNzQnlOYW1lLnNldCh0aGlzLm5hbWUsIHRoaXMpXG4gIH1cblxuICBzdGF0aWMgZ2V0Q29tbWFuZE5hbWUgKCkge1xuICAgIHJldHVybiB0aGlzLmNvbW1hbmRQcmVmaXggKyAnOicgKyB0aGlzLmdldENvbW1hbmROYW1lV2l0aG91dFByZWZpeCgpXG4gIH1cblxuICBzdGF0aWMgZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4ICgpIHtcbiAgICByZXR1cm4gZGFzaGVyaXplKHRoaXMubmFtZSlcbiAgfVxuXG4gIHN0YXRpYyByZWdpc3RlckNvbW1hbmQgKCkge1xuICAgIHJldHVybiBWaW1TdGF0ZS5yZWdpc3RlckNvbW1hbmRGcm9tU3BlYyh0aGlzLm5hbWUsIHtcbiAgICAgIHNjb3BlOiB0aGlzLmNvbW1hbmRTY29wZSxcbiAgICAgIHByZWZpeDogdGhpcy5jb21tYW5kUHJlZml4LFxuICAgICAgZ2V0Q2xhc3M6ICgpID0+IHRoaXNcbiAgICB9KVxuICB9XG5cbiAgc3RhdGljIGdldEtpbmRGb3JDb21tYW5kTmFtZSAoY29tbWFuZCkge1xuICAgIGNvbnN0IGNvbW1hbmRXaXRob3V0UHJlZml4ID0gY29tbWFuZC5yZXBsYWNlKC9edmltLW1vZGUtcGx1czovLCAnJylcbiAgICBjb25zdCBjb21tYW5kQ2xhc3NOYW1lID0gY2xhc3NpZnkoY29tbWFuZFdpdGhvdXRQcmVmaXgpXG4gICAgaWYgKHRoaXMuY2xhc3NCeU5hbWUuaGFzKGNvbW1hbmRDbGFzc05hbWUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jbGFzc0J5TmFtZS5nZXQoY29tbWFuZENsYXNzTmFtZSkub3BlcmF0aW9uS2luZFxuICAgIH1cbiAgfVxuXG4gIGdldFNtb290aFNjcm9sbER1YXRpb24gKGtpbmQpIHtcbiAgICBjb25zdCBiYXNlID0gJ3Ntb290aFNjcm9sbE9uJyArIGtpbmRcbiAgICByZXR1cm4gdGhpcy5nZXRDb25maWcoYmFzZSkgPyB0aGlzLmdldENvbmZpZyhiYXNlICsgJ0R1cmF0aW9uJykgOiAwXG4gIH1cblxuICAvLyBQcm94eSBwcm9wcGVydGllcyBhbmQgbWV0aG9kc1xuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgZ2V0IG1vZGUgKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5tb2RlIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBzdWJtb2RlICgpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuc3VibW9kZSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgc3dyYXAgKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5zd3JhcCB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgdXRpbHMgKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS51dGlscyB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgZWRpdG9yICgpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZWRpdG9yIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBlZGl0b3JFbGVtZW50ICgpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZWRpdG9yRWxlbWVudCB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgZ2xvYmFsU3RhdGUgKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5nbG9iYWxTdGF0ZSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgbXV0YXRpb25NYW5hZ2VyICgpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUubXV0YXRpb25NYW5hZ2VyIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBvY2N1cnJlbmNlTWFuYWdlciAoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9jY3VycmVuY2VNYW5hZ2VyIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBwZXJzaXN0ZW50U2VsZWN0aW9uICgpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbiB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgXyAoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLl8gfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgc3RhdGljIGdldCBfICgpIHsgcmV0dXJuIFZpbVN0YXRlLl8gfSAvLyBwcmV0dGllci1pZ25vcmVcblxuICBvbkRpZENoYW5nZVNlYXJjaCAoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZENoYW5nZVNlYXJjaCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZENvbmZpcm1TZWFyY2ggKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRDb25maXJtU2VhcmNoKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkQ2FuY2VsU2VhcmNoICguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkQ2FuY2VsU2VhcmNoKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkQ29tbWFuZFNlYXJjaCAoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZENvbW1hbmRTZWFyY2goLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRTZXRUYXJnZXQgKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRTZXRUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdERpZFNldFRhcmdldCAoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0RGlkU2V0VGFyZ2V0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uV2lsbFNlbGVjdFRhcmdldCAoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbldpbGxTZWxlY3RUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdFdpbGxTZWxlY3RUYXJnZXQgKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZW1pdFdpbGxTZWxlY3RUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRTZWxlY3RUYXJnZXQgKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRTZWxlY3RUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdERpZFNlbGVjdFRhcmdldCAoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0RGlkU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkRmFpbFNlbGVjdFRhcmdldCAoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZEZhaWxTZWxlY3RUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdERpZEZhaWxTZWxlY3RUYXJnZXQgKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZW1pdERpZEZhaWxTZWxlY3RUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25XaWxsRmluaXNoTXV0YXRpb24gKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25XaWxsRmluaXNoTXV0YXRpb24oLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdFdpbGxGaW5pc2hNdXRhdGlvbiAoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0V2lsbEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkRmluaXNoTXV0YXRpb24gKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBlbWl0RGlkRmluaXNoTXV0YXRpb24gKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZW1pdERpZEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkRmluaXNoT3BlcmF0aW9uICguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkRmluaXNoT3BlcmF0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkUmVzZXRPcGVyYXRpb25TdGFjayAoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2soLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgc3Vic2NyaWJlICguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLnN1YnNjcmliZSguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBpc01vZGUgKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuaXNNb2RlKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldEJsb2Nrd2lzZVNlbGVjdGlvbnMgKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucyguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uICguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgYWRkVG9DbGFzc0xpc3QgKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuYWRkVG9DbGFzc0xpc3QoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0Q29uZmlnICguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmdldENvbmZpZyguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuXG4gIC8vIFdyYXBwZXIgZm9yIHRoaXMudXRpbHNcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uICgpIHsgcmV0dXJuIHRoaXMudXRpbHMuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldFZpbUxhc3RCdWZmZXJSb3cgKCkgeyByZXR1cm4gdGhpcy51dGlscy5nZXRWaW1MYXN0QnVmZmVyUm93KHRoaXMuZWRpdG9yKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRWaW1MYXN0U2NyZWVuUm93ICgpIHsgcmV0dXJuIHRoaXMudXRpbHMuZ2V0VmltTGFzdFNjcmVlblJvdyh0aGlzLmVkaXRvcikgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0VmFsaWRWaW1CdWZmZXJSb3cgKHJvdykgeyByZXR1cm4gdGhpcy51dGlscy5nZXRWYWxpZFZpbUJ1ZmZlclJvdyh0aGlzLmVkaXRvciwgcm93KSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRWYWxpZFZpbVNjcmVlblJvdyAocm93KSB7IHJldHVybiB0aGlzLnV0aWxzLmdldFZhbGlkVmltU2NyZWVuUm93KHRoaXMuZWRpdG9yLCByb3cpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uICguLi5hcmdzKSB7IHJldHVybiB0aGlzLnV0aWxzLmdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uKHRoaXMuZWRpdG9yLCAuLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93IChyb3cpIHsgcmV0dXJuIHRoaXMudXRpbHMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyh0aGlzLmVkaXRvciwgcm93KSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlIChyb3dSYW5nZSkgeyByZXR1cm4gdGhpcy51dGlscy5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKHRoaXMuZWRpdG9yLCByb3dSYW5nZSkgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgc2NhbkVkaXRvciAoLi4uYXJncykgeyByZXR1cm4gdGhpcy51dGlscy5zY2FuRWRpdG9yKHRoaXMuZWRpdG9yLCAuLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBmaW5kSW5FZGl0b3IgKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudXRpbHMuZmluZEluRWRpdG9yKHRoaXMuZWRpdG9yLCAuLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBmaW5kUG9pbnQgKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudXRpbHMuZmluZFBvaW50KHRoaXMuZWRpdG9yLCAuLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICB0cmltQnVmZmVyUmFuZ2UgKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudXRpbHMudHJpbUJ1ZmZlclJhbmdlKHRoaXMuZWRpdG9yLCAuLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBpc0VtcHR5Um93ICguLi5hcmdzKSB7IHJldHVybiB0aGlzLnV0aWxzLmlzRW1wdHlSb3codGhpcy5lZGl0b3IsIC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldEZvbGRTdGFydFJvd0ZvclJvdyAoLi4uYXJncykgeyByZXR1cm4gdGhpcy51dGlscy5nZXRGb2xkU3RhcnRSb3dGb3JSb3codGhpcy5lZGl0b3IsIC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldEZvbGRFbmRSb3dGb3JSb3cgKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudXRpbHMuZ2V0Rm9sZEVuZFJvd0ZvclJvdyh0aGlzLmVkaXRvciwgLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0QnVmZmVyUm93cyAoLi4uYXJncykgeyByZXR1cm4gdGhpcy51dGlscy5nZXRSb3dzKHRoaXMuZWRpdG9yLCAnYnVmZmVyJywgLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0U2NyZWVuUm93cyAoLi4uYXJncykgeyByZXR1cm4gdGhpcy51dGlscy5nZXRSb3dzKHRoaXMuZWRpdG9yLCAnc2NyZWVuJywgLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgcmVwbGFjZVRleHRJblJhbmdlVmlhRGlmZiAoLi4uYXJncykgeyByZXR1cm4gdGhpcy51dGlscy5yZXBsYWNlVGV4dEluUmFuZ2VWaWFEaWZmKHRoaXMuZWRpdG9yLCAuLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxufVxuIl19