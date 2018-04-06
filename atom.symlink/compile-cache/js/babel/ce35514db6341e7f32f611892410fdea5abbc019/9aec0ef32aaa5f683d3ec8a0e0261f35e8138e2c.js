'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('atom');

var Range = _require.Range;

var Base = require('./base');

var Operator = (function (_Base) {
  _inherits(Operator, _Base);

  function Operator() {
    _classCallCheck(this, Operator);

    _get(Object.getPrototypeOf(Operator.prototype), 'constructor', this).apply(this, arguments);

    this.recordable = true;
    this.wise = null;
    this.target = null;
    this.occurrence = false;
    this.occurrenceType = 'base';
    this.flashTarget = true;
    this.flashCheckpoint = 'did-finish';
    this.flashType = 'operator';
    this.flashTypeForOccurrence = 'operator-occurrence';
    this.trackChange = false;
    this.patternForOccurrence = null;
    this.stayAtSamePosition = null;
    this.stayOptionName = null;
    this.stayByMarker = false;
    this.restorePositions = true;
    this.setToFirstCharacterOnLinewise = false;
    this.acceptPresetOccurrence = true;
    this.acceptPersistentSelection = true;
    this.bufferCheckpointByPurpose = null;
    this.targetSelected = null;
    this.input = null;
    this.readInputAfterSelect = false;
    this.bufferCheckpointByPurpose = {};
  }

  _createClass(Operator, [{
    key: 'isReady',
    value: function isReady() {
      return this.target && this.target.isReady();
    }

    // Called when operation finished
    // This is essentially to reset state for `.` repeat.
  }, {
    key: 'resetState',
    value: function resetState() {
      this.targetSelected = null;
      this.occurrenceSelected = false;
    }

    // Two checkpoint for different purpose
    // - one for undo
    // - one for preserve last inserted text
  }, {
    key: 'createBufferCheckpoint',
    value: function createBufferCheckpoint(purpose) {
      this.bufferCheckpointByPurpose[purpose] = this.editor.createCheckpoint();
    }
  }, {
    key: 'getBufferCheckpoint',
    value: function getBufferCheckpoint(purpose) {
      return this.bufferCheckpointByPurpose[purpose];
    }
  }, {
    key: 'groupChangesSinceBufferCheckpoint',
    value: function groupChangesSinceBufferCheckpoint(purpose) {
      var checkpoint = this.getBufferCheckpoint(purpose);
      if (checkpoint) {
        this.editor.groupChangesSinceCheckpoint(checkpoint);
        delete this.bufferCheckpointByPurpose[purpose];
      }
    }
  }, {
    key: 'setMarkForChange',
    value: function setMarkForChange(range) {
      this.vimState.mark.set('[', range.start);
      this.vimState.mark.set(']', range.end);
    }
  }, {
    key: 'needFlash',
    value: function needFlash() {
      return this.flashTarget && this.getConfig('flashOnOperate') && !this.getConfig('flashOnOperateBlacklist').includes(this.name) && (this.mode !== 'visual' || this.submode !== this.target.wise) // e.g. Y in vC
      ;
    }
  }, {
    key: 'flashIfNecessary',
    value: function flashIfNecessary(ranges) {
      if (this.needFlash()) {
        this.vimState.flash(ranges, { type: this.getFlashType() });
      }
    }
  }, {
    key: 'flashChangeIfNecessary',
    value: function flashChangeIfNecessary() {
      var _this = this;

      if (this.needFlash()) {
        this.onDidFinishOperation(function () {
          var ranges = _this.mutationManager.getSelectedBufferRangesForCheckpoint(_this.flashCheckpoint);
          _this.vimState.flash(ranges, { type: _this.getFlashType() });
        });
      }
    }
  }, {
    key: 'getFlashType',
    value: function getFlashType() {
      return this.occurrenceSelected ? this.flashTypeForOccurrence : this.flashType;
    }
  }, {
    key: 'trackChangeIfNecessary',
    value: function trackChangeIfNecessary() {
      var _this2 = this;

      if (!this.trackChange) return;
      this.onDidFinishOperation(function () {
        var range = _this2.mutationManager.getMutatedBufferRangeForSelection(_this2.editor.getLastSelection());
        if (range) _this2.setMarkForChange(range);
      });
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      this.subscribeResetOccurrencePatternIfNeeded();

      // When preset-occurrence was exists, operate on occurrence-wise
      if (this.acceptPresetOccurrence && this.occurrenceManager.hasMarkers()) {
        this.occurrence = true;
      }

      // [FIXME] ORDER-MATTER
      // To pick cursor-word to find occurrence base pattern.
      // This has to be done BEFORE converting persistent-selection into real-selection.
      // Since when persistent-selection is actually selected, it change cursor position.
      if (this.occurrence && !this.occurrenceManager.hasMarkers()) {
        var regex = this.patternForOccurrence || this.getPatternForOccurrenceType(this.occurrenceType);
        this.occurrenceManager.addPattern(regex);
      }

      // This change cursor position.
      if (this.selectPersistentSelectionIfNecessary()) {
        // [FIXME] selection-wise is not synched if it already visual-mode
        if (this.mode !== 'visual') {
          this.vimState.activate('visual', this.swrap.detectWise(this.editor));
        }
      }

      if (this.mode === 'visual') {
        this.target = 'CurrentSelection';
      }
      if (typeof this.target === 'string') {
        this.setTarget(this.getInstance(this.target));
      }

      _get(Object.getPrototypeOf(Operator.prototype), 'initialize', this).call(this);
    }
  }, {
    key: 'subscribeResetOccurrencePatternIfNeeded',
    value: function subscribeResetOccurrencePatternIfNeeded() {
      var _this3 = this;

      // [CAUTION]
      // This method has to be called in PROPER timing.
      // If occurrence is true but no preset-occurrence
      // Treat that `occurrence` is BOUNDED to operator itself, so cleanp at finished.
      if (this.occurrence && !this.occurrenceManager.hasMarkers()) {
        this.onDidResetOperationStack(function () {
          return _this3.occurrenceManager.resetPatterns();
        });
      }
    }
  }, {
    key: 'setModifier',
    value: function setModifier(_ref) {
      var _this4 = this;

      var wise = _ref.wise;
      var occurrence = _ref.occurrence;
      var occurrenceType = _ref.occurrenceType;

      if (wise) {
        this.wise = wise;
      } else if (occurrence) {
        this.occurrence = occurrence;
        this.occurrenceType = occurrenceType;
        // This is o modifier case(e.g. `c o p`, `d O f`)
        // We RESET existing occurence-marker when `o` or `O` modifier is typed by user.
        var regex = this.getPatternForOccurrenceType(occurrenceType);
        this.occurrenceManager.addPattern(regex, { reset: true, occurrenceType: occurrenceType });
        this.onDidResetOperationStack(function () {
          return _this4.occurrenceManager.resetPatterns();
        });
      }
    }

    // return true/false to indicate success
  }, {
    key: 'selectPersistentSelectionIfNecessary',
    value: function selectPersistentSelectionIfNecessary() {
      var canSelect = this.acceptPersistentSelection && this.getConfig('autoSelectPersistentSelectionOnOperate') && !this.persistentSelection.isEmpty();

      if (canSelect) {
        this.persistentSelection.select();
        this.editor.mergeIntersectingSelections();
        this.swrap.saveProperties(this.editor);
        return true;
      } else {
        return false;
      }
    }
  }, {
    key: 'getPatternForOccurrenceType',
    value: function getPatternForOccurrenceType(occurrenceType) {
      if (occurrenceType === 'base') {
        return this.utils.getWordPatternAtBufferPosition(this.editor, this.getCursorBufferPosition());
      } else if (occurrenceType === 'subword') {
        return this.utils.getSubwordPatternAtBufferPosition(this.editor, this.getCursorBufferPosition());
      }
    }

    // target is TextObject or Motion to operate on.
  }, {
    key: 'setTarget',
    value: function setTarget(target) {
      this.target = target;
      this.target.operator = this;
      this.emitDidSetTarget(this);
    }
  }, {
    key: 'setTextToRegister',
    value: function setTextToRegister(text, selection) {
      if (this.vimState.register.isUnnamed() && this.isBlackholeRegisteredOperator()) {
        return;
      }

      var wise = this.occurrenceSelected ? this.occurrenceWise : this.target.wise;
      if (wise === 'linewise' && !text.endsWith('\n')) {
        text += '\n';
      }

      if (text) {
        this.vimState.register.set(null, { text: text, selection: selection });

        if (this.vimState.register.isUnnamed()) {
          if (this['instanceof']('Delete') || this['instanceof']('Change')) {
            if (!this.needSaveToNumberedRegister(this.target) && this.utils.isSingleLineText(text)) {
              this.vimState.register.set('-', { text: text, selection: selection }); // small-change
            } else {
                this.vimState.register.set('1', { text: text, selection: selection });
              }
          } else if (this['instanceof']('Yank')) {
            this.vimState.register.set('0', { text: text, selection: selection });
          }
        }
      }
    }
  }, {
    key: 'isBlackholeRegisteredOperator',
    value: function isBlackholeRegisteredOperator() {
      var operators = this.getConfig('blackholeRegisteredOperators');
      var wildCardOperators = operators.filter(function (name) {
        return name.endsWith('*');
      });
      var commandName = this.getCommandNameWithoutPrefix();
      return wildCardOperators.some(function (name) {
        return new RegExp('^' + name.replace('*', '.*')).test(commandName);
      }) || operators.includes(commandName);
    }
  }, {
    key: 'needSaveToNumberedRegister',
    value: function needSaveToNumberedRegister(target) {
      // Used to determine what register to use on change and delete operation.
      // Following motion should save to 1-9 register regerdless of content is small or big.
      var goesToNumberedRegisterMotionNames = ['MoveToPair', // %
      'MoveToNextSentence', // (, )
      'Search', // /, ?, n, N
      'MoveToNextParagraph' // {, }
      ];
      return goesToNumberedRegisterMotionNames.some(function (name) {
        return target['instanceof'](name);
      });
    }
  }, {
    key: 'normalizeSelectionsIfNecessary',
    value: function normalizeSelectionsIfNecessary() {
      if (this.mode === 'visual' && this.target && this.target.isMotion()) {
        this.swrap.normalize(this.editor);
      }
    }
  }, {
    key: 'mutateSelections',
    value: function mutateSelections() {
      for (var selection of this.editor.getSelectionsOrderedByBufferPosition()) {
        this.mutateSelection(selection);
      }
      this.mutationManager.setCheckpoint('did-finish');
      this.restoreCursorPositionsIfNecessary();
    }
  }, {
    key: 'preSelect',
    value: function preSelect() {
      this.normalizeSelectionsIfNecessary();
      this.createBufferCheckpoint('undo');
    }
  }, {
    key: 'postMutate',
    value: function postMutate() {
      this.groupChangesSinceBufferCheckpoint('undo');
      this.emitDidFinishMutation();

      // Even though we fail to select target and fail to mutate,
      // we have to return to normal-mode from operator-pending or visual
      this.activateMode('normal');
    }

    // Main
  }, {
    key: 'execute',
    value: function execute() {
      this.preSelect();

      if (this.readInputAfterSelect && !this.repeated) {
        return this.executeAsyncToReadInputAfterSelect();
      }

      if (this.selectTarget()) this.mutateSelections();
      this.postMutate();
    }
  }, {
    key: 'executeAsyncToReadInputAfterSelect',
    value: _asyncToGenerator(function* () {
      if (this.selectTarget()) {
        this.input = yield this.focusInputPromised(this.focusInputOptions);
        if (this.input == null) {
          if (this.mode !== 'visual') {
            this.editor.revertToCheckpoint(this.getBufferCheckpoint('undo'));
            this.activateMode('normal');
          }
          return;
        }
        this.mutateSelections();
      }
      this.postMutate();
    })

    // Return true unless all selection is empty.
  }, {
    key: 'selectTarget',
    value: function selectTarget() {
      if (this.targetSelected != null) {
        return this.targetSelected;
      }
      this.mutationManager.init({ stayByMarker: this.stayByMarker });

      if (this.target.isMotion() && this.mode === 'visual') this.target.wise = this.submode;
      if (this.wise != null) this.target.forceWise(this.wise);

      this.emitWillSelectTarget();

      // Allow cursor position adjustment 'on-will-select-target' hook.
      // so checkpoint comes AFTER @emitWillSelectTarget()
      this.mutationManager.setCheckpoint('will-select');

      // NOTE: When repeated, set occurrence-marker from pattern stored as state.
      if (this.repeated && this.occurrence && !this.occurrenceManager.hasMarkers()) {
        this.occurrenceManager.addPattern(this.patternForOccurrence, { occurrenceType: this.occurrenceType });
      }

      this.target.execute();

      this.mutationManager.setCheckpoint('did-select');
      if (this.occurrence) {
        if (!this.patternForOccurrence) {
          // Preserve occurrencePattern for . repeat.
          this.patternForOccurrence = this.occurrenceManager.buildPattern();
        }

        this.occurrenceWise = this.wise || 'characterwise';
        if (this.occurrenceManager.select(this.occurrenceWise)) {
          this.occurrenceSelected = true;
          this.mutationManager.setCheckpoint('did-select-occurrence');
        }
      }

      this.targetSelected = this.vimState.haveSomeNonEmptySelection() || this.target.name === 'Empty';
      if (this.targetSelected) {
        this.emitDidSelectTarget();
        this.flashChangeIfNecessary();
        this.trackChangeIfNecessary();
      } else {
        this.emitDidFailSelectTarget();
      }

      return this.targetSelected;
    }
  }, {
    key: 'restoreCursorPositionsIfNecessary',
    value: function restoreCursorPositionsIfNecessary() {
      if (!this.restorePositions) return;

      var stay = this.stayAtSamePosition != null ? this.stayAtSamePosition : this.getConfig(this.stayOptionName) || this.occurrenceSelected && this.getConfig('stayOnOccurrence');
      var wise = this.occurrenceSelected ? this.occurrenceWise : this.target.wise;
      var setToFirstCharacterOnLinewise = this.setToFirstCharacterOnLinewise;

      this.mutationManager.restoreCursorPositions({ stay: stay, wise: wise, setToFirstCharacterOnLinewise: setToFirstCharacterOnLinewise });
    }
  }], [{
    key: 'operationKind',
    value: 'operator',
    enumerable: true
  }, {
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return Operator;
})(Base);

var SelectBase = (function (_Operator) {
  _inherits(SelectBase, _Operator);

  function SelectBase() {
    _classCallCheck(this, SelectBase);

    _get(Object.getPrototypeOf(SelectBase.prototype), 'constructor', this).apply(this, arguments);

    this.flashTarget = false;
    this.recordable = false;
  }

  _createClass(SelectBase, [{
    key: 'execute',
    value: function execute() {
      this.normalizeSelectionsIfNecessary();
      this.selectTarget();

      if (this.target.selectSucceeded) {
        if (this.target.isTextObject()) {
          this.editor.scrollToCursorPosition();
        }
        var wise = this.occurrenceSelected ? this.occurrenceWise : this.target.wise;
        this.activateModeIfNecessary('visual', wise);
      } else {
        this.cancelOperation();
      }
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return SelectBase;
})(Operator);

var Select = (function (_SelectBase) {
  _inherits(Select, _SelectBase);

  function Select() {
    _classCallCheck(this, Select);

    _get(Object.getPrototypeOf(Select.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Select, [{
    key: 'execute',
    value: function execute() {
      this.swrap.saveProperties(this.editor);
      _get(Object.getPrototypeOf(Select.prototype), 'execute', this).call(this);
    }
  }]);

  return Select;
})(SelectBase);

var SelectLatestChange = (function (_SelectBase2) {
  _inherits(SelectLatestChange, _SelectBase2);

  function SelectLatestChange() {
    _classCallCheck(this, SelectLatestChange);

    _get(Object.getPrototypeOf(SelectLatestChange.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'ALatestChange';
  }

  return SelectLatestChange;
})(SelectBase);

var SelectPreviousSelection = (function (_SelectBase3) {
  _inherits(SelectPreviousSelection, _SelectBase3);

  function SelectPreviousSelection() {
    _classCallCheck(this, SelectPreviousSelection);

    _get(Object.getPrototypeOf(SelectPreviousSelection.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'PreviousSelection';
  }

  return SelectPreviousSelection;
})(SelectBase);

var SelectPersistentSelection = (function (_SelectBase4) {
  _inherits(SelectPersistentSelection, _SelectBase4);

  function SelectPersistentSelection() {
    _classCallCheck(this, SelectPersistentSelection);

    _get(Object.getPrototypeOf(SelectPersistentSelection.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'APersistentSelection';
    this.acceptPersistentSelection = false;
  }

  return SelectPersistentSelection;
})(SelectBase);

var SelectOccurrence = (function (_SelectBase5) {
  _inherits(SelectOccurrence, _SelectBase5);

  function SelectOccurrence() {
    _classCallCheck(this, SelectOccurrence);

    _get(Object.getPrototypeOf(SelectOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.occurrence = true;
  }

  // VisualModeSelect: used in visual-mode
  // When text-object is invoked from normal or viusal-mode, operation would be
  //  => VisualModeSelect operator with target=text-object
  // When motion is invoked from visual-mode, operation would be
  //  => VisualModeSelect operator with target=motion)
  // ================================
  // VisualModeSelect is used in TWO situation.
  // - visual-mode operation
  //   - e.g: `v l`, `V j`, `v i p`...
  // - Directly invoke text-object from normal-mode
  //   - e.g: Invoke `Inner Paragraph` from command-palette.
  return SelectOccurrence;
})(SelectBase);

var VisualModeSelect = (function (_SelectBase6) {
  _inherits(VisualModeSelect, _SelectBase6);

  function VisualModeSelect() {
    _classCallCheck(this, VisualModeSelect);

    _get(Object.getPrototypeOf(VisualModeSelect.prototype), 'constructor', this).apply(this, arguments);

    this.acceptPresetOccurrence = false;
    this.acceptPersistentSelection = false;
  }

  // Persistent Selection
  // =========================

  _createClass(VisualModeSelect, null, [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return VisualModeSelect;
})(SelectBase);

var CreatePersistentSelection = (function (_Operator2) {
  _inherits(CreatePersistentSelection, _Operator2);

  function CreatePersistentSelection() {
    _classCallCheck(this, CreatePersistentSelection);

    _get(Object.getPrototypeOf(CreatePersistentSelection.prototype), 'constructor', this).apply(this, arguments);

    this.flashTarget = false;
    this.stayAtSamePosition = true;
    this.acceptPresetOccurrence = false;
    this.acceptPersistentSelection = false;
  }

  _createClass(CreatePersistentSelection, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      this.persistentSelection.markBufferRange(selection.getBufferRange());
    }
  }]);

  return CreatePersistentSelection;
})(Operator);

var TogglePersistentSelection = (function (_CreatePersistentSelection) {
  _inherits(TogglePersistentSelection, _CreatePersistentSelection);

  function TogglePersistentSelection() {
    _classCallCheck(this, TogglePersistentSelection);

    _get(Object.getPrototypeOf(TogglePersistentSelection.prototype), 'constructor', this).apply(this, arguments);
  }

  // Preset Occurrence
  // =========================

  _createClass(TogglePersistentSelection, [{
    key: 'initialize',
    value: function initialize() {
      if (this.mode === 'normal') {
        var point = this.editor.getCursorBufferPosition();
        var marker = this.persistentSelection.getMarkerAtPoint(point);
        if (marker) this.target = 'Empty';
      }
      _get(Object.getPrototypeOf(TogglePersistentSelection.prototype), 'initialize', this).call(this);
    }
  }, {
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      var point = this.getCursorPositionForSelection(selection);
      var marker = this.persistentSelection.getMarkerAtPoint(point);
      if (marker) {
        marker.destroy();
      } else {
        _get(Object.getPrototypeOf(TogglePersistentSelection.prototype), 'mutateSelection', this).call(this, selection);
      }
    }
  }]);

  return TogglePersistentSelection;
})(CreatePersistentSelection);

var TogglePresetOccurrence = (function (_Operator3) {
  _inherits(TogglePresetOccurrence, _Operator3);

  function TogglePresetOccurrence() {
    _classCallCheck(this, TogglePresetOccurrence);

    _get(Object.getPrototypeOf(TogglePresetOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'Empty';
    this.flashTarget = false;
    this.acceptPresetOccurrence = false;
    this.acceptPersistentSelection = false;
    this.occurrenceType = 'base';
  }

  _createClass(TogglePresetOccurrence, [{
    key: 'execute',
    value: function execute() {
      var marker = this.occurrenceManager.getMarkerAtPoint(this.getCursorBufferPosition());
      if (marker) {
        this.occurrenceManager.destroyMarkers([marker]);
      } else {
        var isNarrowed = this.vimState.isNarrowed();

        var regex = undefined;
        if (this.mode === 'visual' && !isNarrowed) {
          this.occurrenceType = 'base';
          regex = new RegExp(this._.escapeRegExp(this.editor.getSelectedText()), 'g');
        } else {
          regex = this.getPatternForOccurrenceType(this.occurrenceType);
        }

        this.occurrenceManager.addPattern(regex, { occurrenceType: this.occurrenceType });
        this.occurrenceManager.saveLastPattern(this.occurrenceType);

        if (!isNarrowed) this.activateMode('normal');
      }
    }
  }]);

  return TogglePresetOccurrence;
})(Operator);

var TogglePresetSubwordOccurrence = (function (_TogglePresetOccurrence) {
  _inherits(TogglePresetSubwordOccurrence, _TogglePresetOccurrence);

  function TogglePresetSubwordOccurrence() {
    _classCallCheck(this, TogglePresetSubwordOccurrence);

    _get(Object.getPrototypeOf(TogglePresetSubwordOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.occurrenceType = 'subword';
  }

  // Want to rename RestoreOccurrenceMarker
  return TogglePresetSubwordOccurrence;
})(TogglePresetOccurrence);

var AddPresetOccurrenceFromLastOccurrencePattern = (function (_TogglePresetOccurrence2) {
  _inherits(AddPresetOccurrenceFromLastOccurrencePattern, _TogglePresetOccurrence2);

  function AddPresetOccurrenceFromLastOccurrencePattern() {
    _classCallCheck(this, AddPresetOccurrenceFromLastOccurrencePattern);

    _get(Object.getPrototypeOf(AddPresetOccurrenceFromLastOccurrencePattern.prototype), 'constructor', this).apply(this, arguments);
  }

  // Delete
  // ================================

  _createClass(AddPresetOccurrenceFromLastOccurrencePattern, [{
    key: 'execute',
    value: function execute() {
      this.occurrenceManager.resetPatterns();
      var regex = this.globalState.get('lastOccurrencePattern');
      if (regex) {
        var occurrenceType = this.globalState.get('lastOccurrenceType');
        this.occurrenceManager.addPattern(regex, { occurrenceType: occurrenceType });
        this.activateMode('normal');
      }
    }
  }]);

  return AddPresetOccurrenceFromLastOccurrencePattern;
})(TogglePresetOccurrence);

var Delete = (function (_Operator4) {
  _inherits(Delete, _Operator4);

  function Delete() {
    _classCallCheck(this, Delete);

    _get(Object.getPrototypeOf(Delete.prototype), 'constructor', this).apply(this, arguments);

    this.trackChange = true;
    this.flashCheckpoint = 'did-select-occurrence';
    this.flashTypeForOccurrence = 'operator-remove-occurrence';
    this.stayOptionName = 'stayOnDelete';
    this.setToFirstCharacterOnLinewise = true;
  }

  _createClass(Delete, [{
    key: 'execute',
    value: function execute() {
      var _this5 = this;

      this.onDidSelectTarget(function () {
        if (_this5.occurrenceSelected && _this5.occurrenceWise === 'linewise') {
          _this5.flashTarget = false;
        }
      });

      if (this.target.wise === 'blockwise') {
        this.restorePositions = false;
      }
      _get(Object.getPrototypeOf(Delete.prototype), 'execute', this).call(this);
    }
  }, {
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      this.setTextToRegister(selection.getText(), selection);
      selection.deleteSelectedText();
    }
  }]);

  return Delete;
})(Operator);

var DeleteRight = (function (_Delete) {
  _inherits(DeleteRight, _Delete);

  function DeleteRight() {
    _classCallCheck(this, DeleteRight);

    _get(Object.getPrototypeOf(DeleteRight.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'MoveRight';
  }

  return DeleteRight;
})(Delete);

var DeleteLeft = (function (_Delete2) {
  _inherits(DeleteLeft, _Delete2);

  function DeleteLeft() {
    _classCallCheck(this, DeleteLeft);

    _get(Object.getPrototypeOf(DeleteLeft.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'MoveLeft';
  }

  return DeleteLeft;
})(Delete);

var DeleteToLastCharacterOfLine = (function (_Delete3) {
  _inherits(DeleteToLastCharacterOfLine, _Delete3);

  function DeleteToLastCharacterOfLine() {
    _classCallCheck(this, DeleteToLastCharacterOfLine);

    _get(Object.getPrototypeOf(DeleteToLastCharacterOfLine.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'MoveToLastCharacterOfLine';
  }

  _createClass(DeleteToLastCharacterOfLine, [{
    key: 'execute',
    value: function execute() {
      var _this6 = this;

      this.onDidSelectTarget(function () {
        if (_this6.target.wise === 'blockwise') {
          for (var blockwiseSelection of _this6.getBlockwiseSelections()) {
            blockwiseSelection.extendMemberSelectionsToEndOfLine();
          }
        }
      });
      _get(Object.getPrototypeOf(DeleteToLastCharacterOfLine.prototype), 'execute', this).call(this);
    }
  }]);

  return DeleteToLastCharacterOfLine;
})(Delete);

var DeleteLine = (function (_Delete4) {
  _inherits(DeleteLine, _Delete4);

  function DeleteLine() {
    _classCallCheck(this, DeleteLine);

    _get(Object.getPrototypeOf(DeleteLine.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.target = 'MoveToRelativeLine';
    this.flashTarget = false;
  }

  // Yank
  // =========================
  return DeleteLine;
})(Delete);

var Yank = (function (_Operator5) {
  _inherits(Yank, _Operator5);

  function Yank() {
    _classCallCheck(this, Yank);

    _get(Object.getPrototypeOf(Yank.prototype), 'constructor', this).apply(this, arguments);

    this.trackChange = true;
    this.stayOptionName = 'stayOnYank';
  }

  _createClass(Yank, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      this.setTextToRegister(selection.getText(), selection);
    }
  }]);

  return Yank;
})(Operator);

var YankLine = (function (_Yank) {
  _inherits(YankLine, _Yank);

  function YankLine() {
    _classCallCheck(this, YankLine);

    _get(Object.getPrototypeOf(YankLine.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.target = 'MoveToRelativeLine';
  }

  return YankLine;
})(Yank);

var YankToLastCharacterOfLine = (function (_Yank2) {
  _inherits(YankToLastCharacterOfLine, _Yank2);

  function YankToLastCharacterOfLine() {
    _classCallCheck(this, YankToLastCharacterOfLine);

    _get(Object.getPrototypeOf(YankToLastCharacterOfLine.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'MoveToLastCharacterOfLine';
  }

  // Yank diff hunk at cursor by removing leading "+" or "-" from each line
  return YankToLastCharacterOfLine;
})(Yank);

var YankDiffHunk = (function (_Yank3) {
  _inherits(YankDiffHunk, _Yank3);

  function YankDiffHunk() {
    _classCallCheck(this, YankDiffHunk);

    _get(Object.getPrototypeOf(YankDiffHunk.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'InnerDiffHunk';
  }

  // -------------------------
  // [ctrl-a]

  _createClass(YankDiffHunk, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      // Remove leading "+" or "-" in diff hunk
      var textToYank = selection.getText().replace(/^./gm, '');
      this.setTextToRegister(textToYank, selection);
    }
  }]);

  return YankDiffHunk;
})(Yank);

var Increase = (function (_Operator6) {
  _inherits(Increase, _Operator6);

  function Increase() {
    _classCallCheck(this, Increase);

    _get(Object.getPrototypeOf(Increase.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'Empty';
    this.flashTarget = false;
    this.restorePositions = false;
    this.step = 1;
  }

  // [ctrl-x]

  _createClass(Increase, [{
    key: 'execute',
    value: function execute() {
      this.newRanges = [];
      if (!this.regex) this.regex = new RegExp('' + this.getConfig('numberRegex'), 'g');

      _get(Object.getPrototypeOf(Increase.prototype), 'execute', this).call(this);

      if (this.newRanges.length) {
        if (this.getConfig('flashOnOperate') && !this.getConfig('flashOnOperateBlacklist').includes(this.name)) {
          this.vimState.flash(this.newRanges, { type: this.flashTypeForOccurrence });
        }
      }
    }
  }, {
    key: 'replaceNumberInBufferRange',
    value: function replaceNumberInBufferRange(scanRange, fn) {
      var _this7 = this;

      var newRanges = [];
      this.scanEditor('forward', this.regex, { scanRange: scanRange }, function (event) {
        if (fn) {
          if (fn(event)) event.stop();else return;
        }
        var nextNumber = _this7.getNextNumber(event.matchText);
        newRanges.push(event.replace(String(nextNumber)));
      });
      return newRanges;
    }
  }, {
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      var _this8 = this;

      var cursor = selection.cursor;

      if (this.target.name === 'Empty') {
        (function () {
          // ctrl-a, ctrl-x in `normal-mode`
          var cursorPosition = cursor.getBufferPosition();
          var scanRange = _this8.editor.bufferRangeForBufferRow(cursorPosition.row);
          var newRanges = _this8.replaceNumberInBufferRange(scanRange, function (event) {
            return event.range.end.isGreaterThan(cursorPosition);
          });
          var point = newRanges.length && newRanges[0].end.translate([0, -1]) || cursorPosition;
          cursor.setBufferPosition(point);
        })();
      } else {
        var _newRanges;

        var scanRange = selection.getBufferRange();
        (_newRanges = this.newRanges).push.apply(_newRanges, _toConsumableArray(this.replaceNumberInBufferRange(scanRange)));
        cursor.setBufferPosition(scanRange.start);
      }
    }
  }, {
    key: 'getNextNumber',
    value: function getNextNumber(numberString) {
      return Number.parseInt(numberString, 10) + this.step * this.getCount();
    }
  }]);

  return Increase;
})(Operator);

var Decrease = (function (_Increase) {
  _inherits(Decrease, _Increase);

  function Decrease() {
    _classCallCheck(this, Decrease);

    _get(Object.getPrototypeOf(Decrease.prototype), 'constructor', this).apply(this, arguments);

    this.step = -1;
  }

  // -------------------------
  // [g ctrl-a]
  return Decrease;
})(Increase);

var IncrementNumber = (function (_Increase2) {
  _inherits(IncrementNumber, _Increase2);

  function IncrementNumber() {
    _classCallCheck(this, IncrementNumber);

    _get(Object.getPrototypeOf(IncrementNumber.prototype), 'constructor', this).apply(this, arguments);

    this.baseNumber = null;
    this.target = null;
  }

  // [g ctrl-x]

  _createClass(IncrementNumber, [{
    key: 'getNextNumber',
    value: function getNextNumber(numberString) {
      if (this.baseNumber != null) {
        this.baseNumber += this.step * this.getCount();
      } else {
        this.baseNumber = Number.parseInt(numberString, 10);
      }
      return this.baseNumber;
    }
  }]);

  return IncrementNumber;
})(Increase);

var DecrementNumber = (function (_IncrementNumber) {
  _inherits(DecrementNumber, _IncrementNumber);

  function DecrementNumber() {
    _classCallCheck(this, DecrementNumber);

    _get(Object.getPrototypeOf(DecrementNumber.prototype), 'constructor', this).apply(this, arguments);

    this.step = -1;
  }

  // Put
  // -------------------------
  // Cursor placement:
  // - place at end of mutation: paste non-multiline characterwise text
  // - place at start of mutation: non-multiline characterwise text(characterwise, linewise)
  return DecrementNumber;
})(IncrementNumber);

var PutBefore = (function (_Operator7) {
  _inherits(PutBefore, _Operator7);

  function PutBefore() {
    _classCallCheck(this, PutBefore);

    _get(Object.getPrototypeOf(PutBefore.prototype), 'constructor', this).apply(this, arguments);

    this.location = 'before';
    this.target = 'Empty';
    this.flashType = 'operator-long';
    this.restorePositions = false;
    this.flashTarget = false;
    this.trackChange = false;
  }

  _createClass(PutBefore, [{
    key: 'initialize',
    // manage manually

    value: function initialize() {
      this.vimState.sequentialPasteManager.onInitialize(this);
      _get(Object.getPrototypeOf(PutBefore.prototype), 'initialize', this).call(this);
    }
  }, {
    key: 'execute',
    value: function execute() {
      var _this9 = this;

      this.mutationsBySelection = new Map();
      this.sequentialPaste = this.vimState.sequentialPasteManager.onExecute(this);

      this.onDidFinishMutation(function () {
        if (!_this9.cancelled) _this9.adjustCursorPosition();
      });

      _get(Object.getPrototypeOf(PutBefore.prototype), 'execute', this).call(this);

      if (this.cancelled) return;

      this.onDidFinishOperation(function () {
        // TrackChange
        var newRange = _this9.mutationsBySelection.get(_this9.editor.getLastSelection());
        if (newRange) _this9.setMarkForChange(newRange);

        // Flash
        if (_this9.getConfig('flashOnOperate') && !_this9.getConfig('flashOnOperateBlacklist').includes(_this9.name)) {
          var ranges = _this9.editor.getSelections().map(function (selection) {
            return _this9.mutationsBySelection.get(selection);
          });
          _this9.vimState.flash(ranges, { type: _this9.getFlashType() });
        }
      });
    }
  }, {
    key: 'adjustCursorPosition',
    value: function adjustCursorPosition() {
      for (var selection of this.editor.getSelections()) {
        if (!this.mutationsBySelection.has(selection)) continue;

        var cursor = selection.cursor;

        var newRange = this.mutationsBySelection.get(selection);
        if (this.linewisePaste) {
          this.utils.moveCursorToFirstCharacterAtRow(cursor, newRange.start.row);
        } else {
          if (newRange.isSingleLine()) {
            cursor.setBufferPosition(newRange.end.translate([0, -1]));
          } else {
            cursor.setBufferPosition(newRange.start);
          }
        }
      }
    }
  }, {
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      var value = this.vimState.register.get(null, selection, this.sequentialPaste);
      if (!value.text) {
        this.cancelled = true;
        return;
      }

      var textToPaste = value.text.repeat(this.getCount());
      this.linewisePaste = value.type === 'linewise' || this.isMode('visual', 'linewise');
      var newRange = this.paste(selection, textToPaste, { linewisePaste: this.linewisePaste });
      this.mutationsBySelection.set(selection, newRange);
      this.vimState.sequentialPasteManager.savePastedRangeForSelection(selection, newRange);
    }

    // Return pasted range
  }, {
    key: 'paste',
    value: function paste(selection, text, _ref2) {
      var linewisePaste = _ref2.linewisePaste;

      if (this.sequentialPaste) {
        return this.pasteCharacterwise(selection, text);
      } else if (linewisePaste) {
        return this.pasteLinewise(selection, text);
      } else {
        return this.pasteCharacterwise(selection, text);
      }
    }
  }, {
    key: 'pasteCharacterwise',
    value: function pasteCharacterwise(selection, text) {
      var cursor = selection.cursor;

      if (selection.isEmpty() && this.location === 'after' && !this.isEmptyRow(cursor.getBufferRow())) {
        cursor.moveRight();
      }
      return selection.insertText(text);
    }

    // Return newRange
  }, {
    key: 'pasteLinewise',
    value: function pasteLinewise(selection, text) {
      var cursor = selection.cursor;

      var cursorRow = cursor.getBufferRow();
      if (!text.endsWith('\n')) {
        text += '\n';
      }
      if (selection.isEmpty()) {
        if (this.location === 'before') {
          return this.utils.insertTextAtBufferPosition(this.editor, [cursorRow, 0], text);
        } else if (this.location === 'after') {
          var targetRow = this.getFoldEndRowForRow(cursorRow);
          this.utils.ensureEndsWithNewLineForBufferRow(this.editor, targetRow);
          return this.utils.insertTextAtBufferPosition(this.editor, [targetRow + 1, 0], text);
        }
      } else {
        if (!this.isMode('visual', 'linewise')) {
          selection.insertText('\n');
        }
        return selection.insertText(text);
      }
    }
  }]);

  return PutBefore;
})(Operator);

var PutAfter = (function (_PutBefore) {
  _inherits(PutAfter, _PutBefore);

  function PutAfter() {
    _classCallCheck(this, PutAfter);

    _get(Object.getPrototypeOf(PutAfter.prototype), 'constructor', this).apply(this, arguments);

    this.location = 'after';
  }

  return PutAfter;
})(PutBefore);

var PutBeforeWithAutoIndent = (function (_PutBefore2) {
  _inherits(PutBeforeWithAutoIndent, _PutBefore2);

  function PutBeforeWithAutoIndent() {
    _classCallCheck(this, PutBeforeWithAutoIndent);

    _get(Object.getPrototypeOf(PutBeforeWithAutoIndent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(PutBeforeWithAutoIndent, [{
    key: 'pasteLinewise',
    value: function pasteLinewise(selection, text) {
      var newRange = _get(Object.getPrototypeOf(PutBeforeWithAutoIndent.prototype), 'pasteLinewise', this).call(this, selection, text);
      this.utils.adjustIndentWithKeepingLayout(this.editor, newRange);
      return newRange;
    }
  }]);

  return PutBeforeWithAutoIndent;
})(PutBefore);

var PutAfterWithAutoIndent = (function (_PutBeforeWithAutoIndent) {
  _inherits(PutAfterWithAutoIndent, _PutBeforeWithAutoIndent);

  function PutAfterWithAutoIndent() {
    _classCallCheck(this, PutAfterWithAutoIndent);

    _get(Object.getPrototypeOf(PutAfterWithAutoIndent.prototype), 'constructor', this).apply(this, arguments);

    this.location = 'after';
  }

  return PutAfterWithAutoIndent;
})(PutBeforeWithAutoIndent);

var AddBlankLineBelow = (function (_Operator8) {
  _inherits(AddBlankLineBelow, _Operator8);

  function AddBlankLineBelow() {
    _classCallCheck(this, AddBlankLineBelow);

    _get(Object.getPrototypeOf(AddBlankLineBelow.prototype), 'constructor', this).apply(this, arguments);

    this.flashTarget = false;
    this.target = 'Empty';
    this.stayAtSamePosition = true;
    this.stayByMarker = true;
    this.where = 'below';
  }

  _createClass(AddBlankLineBelow, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      var point = selection.getHeadBufferPosition();
      if (this.where === 'below') point.row++;
      point.column = 0;
      this.editor.setTextInBufferRange([point, point], '\n'.repeat(this.getCount()));
    }
  }]);

  return AddBlankLineBelow;
})(Operator);

var AddBlankLineAbove = (function (_AddBlankLineBelow) {
  _inherits(AddBlankLineAbove, _AddBlankLineBelow);

  function AddBlankLineAbove() {
    _classCallCheck(this, AddBlankLineAbove);

    _get(Object.getPrototypeOf(AddBlankLineAbove.prototype), 'constructor', this).apply(this, arguments);

    this.where = 'above';
  }

  return AddBlankLineAbove;
})(AddBlankLineBelow);

var ResolveGitConflict = (function (_Operator9) {
  _inherits(ResolveGitConflict, _Operator9);

  function ResolveGitConflict() {
    _classCallCheck(this, ResolveGitConflict);

    _get(Object.getPrototypeOf(ResolveGitConflict.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'Empty';
    this.restorePositions = false;
  }

  _createClass(ResolveGitConflict, [{
    key: 'mutateSelection',
    // do manually

    value: function mutateSelection(selection) {
      var _this10 = this;

      var point = this.getCursorPositionForSelection(selection);
      var rangeInfo = this.getConflictingRangeInfo(point.row);

      if (rangeInfo) {
        (function () {
          var whole = rangeInfo.whole;
          var sectionOurs = rangeInfo.sectionOurs;
          var sectionTheirs = rangeInfo.sectionTheirs;
          var bodyOurs = rangeInfo.bodyOurs;
          var bodyTheirs = rangeInfo.bodyTheirs;

          var resolveConflict = function resolveConflict(range) {
            var text = _this10.editor.getTextInBufferRange(range);
            var dstRange = _this10.getBufferRangeForRowRange([whole.start.row, whole.end.row]);
            var newRange = _this10.editor.setTextInBufferRange(dstRange, text ? text + '\n' : '');
            selection.cursor.setBufferPosition(newRange.start);
          };
          // NOTE: When cursor is at separator row '=======', no replace happens because it's ambiguous.
          if (sectionOurs.containsPoint(point)) {
            resolveConflict(bodyOurs);
          } else if (sectionTheirs.containsPoint(point)) {
            resolveConflict(bodyTheirs);
          }
        })();
      }
    }
  }, {
    key: 'getConflictingRangeInfo',
    value: function getConflictingRangeInfo(row) {
      var from = [row, Infinity];
      var conflictStart = this.findInEditor('backward', /^<<<<<<< .+$/, { from: from }, function (event) {
        return event.range.start;
      });

      if (conflictStart) {
        var startRow = conflictStart.row;
        var separatorRow = undefined,
            endRow = undefined;
        var _from = [startRow + 1, 0];
        var regex = /(^<<<<<<< .+$)|(^=======$)|(^>>>>>>> .+$)/g;
        this.scanEditor('forward', regex, { from: _from }, function (_ref3) {
          var match = _ref3.match;
          var range = _ref3.range;
          var stop = _ref3.stop;

          if (match[1]) {
            // incomplete conflict hunk, we saw next conflict startRow wihout seeing endRow
            stop();
          } else if (match[2]) {
            separatorRow = range.start.row;
          } else if (match[3]) {
            endRow = range.start.row;
            stop();
          }
        });
        if (!endRow) return;
        var whole = new Range([startRow, 0], [endRow, Infinity]);
        var sectionOurs = new Range(whole.start, [(separatorRow || endRow) - 1, Infinity]);
        var sectionTheirs = new Range([(separatorRow || startRow) + 1, 0], whole.end);

        var bodyOursStart = sectionOurs.start.translate([1, 0]);
        var bodyOurs = sectionOurs.getRowCount() === 1 ? new Range(bodyOursStart, bodyOursStart) : new Range(bodyOursStart, sectionOurs.end);

        var bodyTheirs = sectionTheirs.getRowCount() === 1 ? new Range(sectionTheirs.start, sectionTheirs.start) : sectionTheirs.translate([0, 0], [-1, 0]);
        return { whole: whole, sectionOurs: sectionOurs, sectionTheirs: sectionTheirs, bodyOurs: bodyOurs, bodyTheirs: bodyTheirs };
      }
    }
  }]);

  return ResolveGitConflict;
})(Operator);

module.exports = {
  Operator: Operator,
  SelectBase: SelectBase,
  Select: Select,
  SelectLatestChange: SelectLatestChange,
  SelectPreviousSelection: SelectPreviousSelection,
  SelectPersistentSelection: SelectPersistentSelection,
  SelectOccurrence: SelectOccurrence,
  VisualModeSelect: VisualModeSelect,
  CreatePersistentSelection: CreatePersistentSelection,
  TogglePersistentSelection: TogglePersistentSelection,
  TogglePresetOccurrence: TogglePresetOccurrence,
  TogglePresetSubwordOccurrence: TogglePresetSubwordOccurrence,
  AddPresetOccurrenceFromLastOccurrencePattern: AddPresetOccurrenceFromLastOccurrencePattern,
  Delete: Delete,
  DeleteRight: DeleteRight,
  DeleteLeft: DeleteLeft,
  DeleteToLastCharacterOfLine: DeleteToLastCharacterOfLine,
  DeleteLine: DeleteLine,
  Yank: Yank,
  YankLine: YankLine,
  YankToLastCharacterOfLine: YankToLastCharacterOfLine,
  YankDiffHunk: YankDiffHunk,
  Increase: Increase,
  Decrease: Decrease,
  IncrementNumber: IncrementNumber,
  DecrementNumber: DecrementNumber,
  PutBefore: PutBefore,
  PutAfter: PutAfter,
  PutBeforeWithAutoIndent: PutBeforeWithAutoIndent,
  PutAfterWithAutoIndent: PutAfterWithAutoIndent,
  AddBlankLineBelow: AddBlankLineBelow,
  AddBlankLineAbove: AddBlankLineAbove,
  ResolveGitConflict: ResolveGitConflict
};
// ctrl-a in normal-mode find target number in current line manually
// do manually
// do manually
// manage manually
// manage manually
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmRvdGZpbGVzL2F0b20uc3ltbGluay9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vcGVyYXRvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7Ozs7O2VBRUssT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBeEIsS0FBSyxZQUFMLEtBQUs7O0FBQ1osSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBOztJQUV4QixRQUFRO1lBQVIsUUFBUTs7V0FBUixRQUFROzBCQUFSLFFBQVE7OytCQUFSLFFBQVE7O1NBR1osVUFBVSxHQUFHLElBQUk7U0FFakIsSUFBSSxHQUFHLElBQUk7U0FDWCxNQUFNLEdBQUcsSUFBSTtTQUNiLFVBQVUsR0FBRyxLQUFLO1NBQ2xCLGNBQWMsR0FBRyxNQUFNO1NBRXZCLFdBQVcsR0FBRyxJQUFJO1NBQ2xCLGVBQWUsR0FBRyxZQUFZO1NBQzlCLFNBQVMsR0FBRyxVQUFVO1NBQ3RCLHNCQUFzQixHQUFHLHFCQUFxQjtTQUM5QyxXQUFXLEdBQUcsS0FBSztTQUVuQixvQkFBb0IsR0FBRyxJQUFJO1NBQzNCLGtCQUFrQixHQUFHLElBQUk7U0FDekIsY0FBYyxHQUFHLElBQUk7U0FDckIsWUFBWSxHQUFHLEtBQUs7U0FDcEIsZ0JBQWdCLEdBQUcsSUFBSTtTQUN2Qiw2QkFBNkIsR0FBRyxLQUFLO1NBRXJDLHNCQUFzQixHQUFHLElBQUk7U0FDN0IseUJBQXlCLEdBQUcsSUFBSTtTQUVoQyx5QkFBeUIsR0FBRyxJQUFJO1NBRWhDLGNBQWMsR0FBRyxJQUFJO1NBQ3JCLEtBQUssR0FBRyxJQUFJO1NBQ1osb0JBQW9CLEdBQUcsS0FBSztTQUM1Qix5QkFBeUIsR0FBRyxFQUFFOzs7ZUEvQjFCLFFBQVE7O1dBaUNKLG1CQUFHO0FBQ1QsYUFBTyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFF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RUFBVixVQUFVO0FBQ1YsNkJBQTJCLEVBQTNCLDJCQUEyQjtBQUMzQixZQUFVLEVBQVYsVUFBVTtBQUNWLE1BQUksRUFBSixJQUFJO0FBQ0osVUFBUSxFQUFSLFFBQVE7QUFDUiwyQkFBeUIsRUFBekIseUJBQXlCO0FBQ3pCLGNBQVksRUFBWixZQUFZO0FBQ1osVUFBUSxFQUFSLFFBQVE7QUFDUixVQUFRLEVBQVIsUUFBUTtBQUNSLGlCQUFlLEVBQWYsZUFBZTtBQUNmLGlCQUFlLEVBQWYsZUFBZTtBQUNmLFdBQVMsRUFBVCxTQUFTO0FBQ1QsVUFBUSxFQUFSLFFBQVE7QUFDUix5QkFBdUIsRUFBdkIsdUJBQXVCO0FBQ3ZCLHdCQUFzQixFQUF0QixzQkFBc0I7QUFDdEIsbUJBQWlCLEVBQWpCLGlCQUFpQjtBQUNqQixtQkFBaUIsRUFBakIsaUJBQWlCO0FBQ2pCLG9CQUFrQixFQUFsQixrQkFBa0I7Q0FDbkIsQ0FBQSIsImZpbGUiOiIvVXNlcnMvc2hhbm5vbmJlcnR1Y2NpLy5kb3RmaWxlcy9hdG9tLnN5bWxpbmsvcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5jb25zdCB7UmFuZ2V9ID0gcmVxdWlyZSgnYXRvbScpXG5jb25zdCBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJylcblxuY2xhc3MgT3BlcmF0b3IgZXh0ZW5kcyBCYXNlIHtcbiAgc3RhdGljIG9wZXJhdGlvbktpbmQgPSAnb3BlcmF0b3InXG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgcmVjb3JkYWJsZSA9IHRydWVcblxuICB3aXNlID0gbnVsbFxuICB0YXJnZXQgPSBudWxsXG4gIG9jY3VycmVuY2UgPSBmYWxzZVxuICBvY2N1cnJlbmNlVHlwZSA9ICdiYXNlJ1xuXG4gIGZsYXNoVGFyZ2V0ID0gdHJ1ZVxuICBmbGFzaENoZWNrcG9pbnQgPSAnZGlkLWZpbmlzaCdcbiAgZmxhc2hUeXBlID0gJ29wZXJhdG9yJ1xuICBmbGFzaFR5cGVGb3JPY2N1cnJlbmNlID0gJ29wZXJhdG9yLW9jY3VycmVuY2UnXG4gIHRyYWNrQ2hhbmdlID0gZmFsc2VcblxuICBwYXR0ZXJuRm9yT2NjdXJyZW5jZSA9IG51bGxcbiAgc3RheUF0U2FtZVBvc2l0aW9uID0gbnVsbFxuICBzdGF5T3B0aW9uTmFtZSA9IG51bGxcbiAgc3RheUJ5TWFya2VyID0gZmFsc2VcbiAgcmVzdG9yZVBvc2l0aW9ucyA9IHRydWVcbiAgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2UgPSBmYWxzZVxuXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2UgPSB0cnVlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gPSB0cnVlXG5cbiAgYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZSA9IG51bGxcblxuICB0YXJnZXRTZWxlY3RlZCA9IG51bGxcbiAgaW5wdXQgPSBudWxsXG4gIHJlYWRJbnB1dEFmdGVyU2VsZWN0ID0gZmFsc2VcbiAgYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZSA9IHt9XG5cbiAgaXNSZWFkeSAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGFyZ2V0ICYmIHRoaXMudGFyZ2V0LmlzUmVhZHkoKVxuICB9XG5cbiAgLy8gQ2FsbGVkIHdoZW4gb3BlcmF0aW9uIGZpbmlzaGVkXG4gIC8vIFRoaXMgaXMgZXNzZW50aWFsbHkgdG8gcmVzZXQgc3RhdGUgZm9yIGAuYCByZXBlYXQuXG4gIHJlc2V0U3RhdGUgKCkge1xuICAgIHRoaXMudGFyZ2V0U2VsZWN0ZWQgPSBudWxsXG4gICAgdGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgPSBmYWxzZVxuICB9XG5cbiAgLy8gVHdvIGNoZWNrcG9pbnQgZm9yIGRpZmZlcmVudCBwdXJwb3NlXG4gIC8vIC0gb25lIGZvciB1bmRvXG4gIC8vIC0gb25lIGZvciBwcmVzZXJ2ZSBsYXN0IGluc2VydGVkIHRleHRcbiAgY3JlYXRlQnVmZmVyQ2hlY2twb2ludCAocHVycG9zZSkge1xuICAgIHRoaXMuYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZVtwdXJwb3NlXSA9IHRoaXMuZWRpdG9yLmNyZWF0ZUNoZWNrcG9pbnQoKVxuICB9XG5cbiAgZ2V0QnVmZmVyQ2hlY2twb2ludCAocHVycG9zZSkge1xuICAgIHJldHVybiB0aGlzLmJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2VbcHVycG9zZV1cbiAgfVxuXG4gIGdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludCAocHVycG9zZSkge1xuICAgIGNvbnN0IGNoZWNrcG9pbnQgPSB0aGlzLmdldEJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSlcbiAgICBpZiAoY2hlY2twb2ludCkge1xuICAgICAgdGhpcy5lZGl0b3IuZ3JvdXBDaGFuZ2VzU2luY2VDaGVja3BvaW50KGNoZWNrcG9pbnQpXG4gICAgICBkZWxldGUgdGhpcy5idWZmZXJDaGVja3BvaW50QnlQdXJwb3NlW3B1cnBvc2VdXG4gICAgfVxuICB9XG5cbiAgc2V0TWFya0ZvckNoYW5nZSAocmFuZ2UpIHtcbiAgICB0aGlzLnZpbVN0YXRlLm1hcmsuc2V0KCdbJywgcmFuZ2Uuc3RhcnQpXG4gICAgdGhpcy52aW1TdGF0ZS5tYXJrLnNldCgnXScsIHJhbmdlLmVuZClcbiAgfVxuXG4gIG5lZWRGbGFzaCAoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuZmxhc2hUYXJnZXQgJiZcbiAgICAgIHRoaXMuZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZScpICYmXG4gICAgICAhdGhpcy5nZXRDb25maWcoJ2ZsYXNoT25PcGVyYXRlQmxhY2tsaXN0JykuaW5jbHVkZXModGhpcy5uYW1lKSAmJlxuICAgICAgKHRoaXMubW9kZSAhPT0gJ3Zpc3VhbCcgfHwgdGhpcy5zdWJtb2RlICE9PSB0aGlzLnRhcmdldC53aXNlKSAvLyBlLmcuIFkgaW4gdkNcbiAgICApXG4gIH1cblxuICBmbGFzaElmTmVjZXNzYXJ5IChyYW5nZXMpIHtcbiAgICBpZiAodGhpcy5uZWVkRmxhc2goKSkge1xuICAgICAgdGhpcy52aW1TdGF0ZS5mbGFzaChyYW5nZXMsIHt0eXBlOiB0aGlzLmdldEZsYXNoVHlwZSgpfSlcbiAgICB9XG4gIH1cblxuICBmbGFzaENoYW5nZUlmTmVjZXNzYXJ5ICgpIHtcbiAgICBpZiAodGhpcy5uZWVkRmxhc2goKSkge1xuICAgICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJhbmdlcyA9IHRoaXMubXV0YXRpb25NYW5hZ2VyLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2VzRm9yQ2hlY2twb2ludCh0aGlzLmZsYXNoQ2hlY2twb2ludClcbiAgICAgICAgdGhpcy52aW1TdGF0ZS5mbGFzaChyYW5nZXMsIHt0eXBlOiB0aGlzLmdldEZsYXNoVHlwZSgpfSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgZ2V0Rmxhc2hUeXBlICgpIHtcbiAgICByZXR1cm4gdGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgPyB0aGlzLmZsYXNoVHlwZUZvck9jY3VycmVuY2UgOiB0aGlzLmZsYXNoVHlwZVxuICB9XG5cbiAgdHJhY2tDaGFuZ2VJZk5lY2Vzc2FyeSAoKSB7XG4gICAgaWYgKCF0aGlzLnRyYWNrQ2hhbmdlKSByZXR1cm5cbiAgICB0aGlzLm9uRGlkRmluaXNoT3BlcmF0aW9uKCgpID0+IHtcbiAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy5tdXRhdGlvbk1hbmFnZXIuZ2V0TXV0YXRlZEJ1ZmZlclJhbmdlRm9yU2VsZWN0aW9uKHRoaXMuZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSlcbiAgICAgIGlmIChyYW5nZSkgdGhpcy5zZXRNYXJrRm9yQ2hhbmdlKHJhbmdlKVxuICAgIH0pXG4gIH1cblxuICBpbml0aWFsaXplICgpIHtcbiAgICB0aGlzLnN1YnNjcmliZVJlc2V0T2NjdXJyZW5jZVBhdHRlcm5JZk5lZWRlZCgpXG5cbiAgICAvLyBXaGVuIHByZXNldC1vY2N1cnJlbmNlIHdhcyBleGlzdHMsIG9wZXJhdGUgb24gb2NjdXJyZW5jZS13aXNlXG4gICAgaWYgKHRoaXMuYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSAmJiB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKSkge1xuICAgICAgdGhpcy5vY2N1cnJlbmNlID0gdHJ1ZVxuICAgIH1cblxuICAgIC8vIFtGSVhNRV0gT1JERVItTUFUVEVSXG4gICAgLy8gVG8gcGljayBjdXJzb3Itd29yZCB0byBmaW5kIG9jY3VycmVuY2UgYmFzZSBwYXR0ZXJuLlxuICAgIC8vIFRoaXMgaGFzIHRvIGJlIGRvbmUgQkVGT1JFIGNvbnZlcnRpbmcgcGVyc2lzdGVudC1zZWxlY3Rpb24gaW50byByZWFsLXNlbGVjdGlvbi5cbiAgICAvLyBTaW5jZSB3aGVuIHBlcnNpc3RlbnQtc2VsZWN0aW9uIGlzIGFjdHVhbGx5IHNlbGVjdGVkLCBpdCBjaGFuZ2UgY3Vyc29yIHBvc2l0aW9uLlxuICAgIGlmICh0aGlzLm9jY3VycmVuY2UgJiYgIXRoaXMub2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpKSB7XG4gICAgICBjb25zdCByZWdleCA9IHRoaXMucGF0dGVybkZvck9jY3VycmVuY2UgfHwgdGhpcy5nZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGUodGhpcy5vY2N1cnJlbmNlVHlwZSlcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihyZWdleClcbiAgICB9XG5cbiAgICAvLyBUaGlzIGNoYW5nZSBjdXJzb3IgcG9zaXRpb24uXG4gICAgaWYgKHRoaXMuc2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbklmTmVjZXNzYXJ5KCkpIHtcbiAgICAgIC8vIFtGSVhNRV0gc2VsZWN0aW9uLXdpc2UgaXMgbm90IHN5bmNoZWQgaWYgaXQgYWxyZWFkeSB2aXN1YWwtbW9kZVxuICAgICAgaWYgKHRoaXMubW9kZSAhPT0gJ3Zpc3VhbCcpIHtcbiAgICAgICAgdGhpcy52aW1TdGF0ZS5hY3RpdmF0ZSgndmlzdWFsJywgdGhpcy5zd3JhcC5kZXRlY3RXaXNlKHRoaXMuZWRpdG9yKSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5tb2RlID09PSAndmlzdWFsJykge1xuICAgICAgdGhpcy50YXJnZXQgPSAnQ3VycmVudFNlbGVjdGlvbidcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLnRhcmdldCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMuc2V0VGFyZ2V0KHRoaXMuZ2V0SW5zdGFuY2UodGhpcy50YXJnZXQpKVxuICAgIH1cblxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgc3Vic2NyaWJlUmVzZXRPY2N1cnJlbmNlUGF0dGVybklmTmVlZGVkICgpIHtcbiAgICAvLyBbQ0FVVElPTl1cbiAgICAvLyBUaGlzIG1ldGhvZCBoYXMgdG8gYmUgY2FsbGVkIGluIFBST1BFUiB0aW1pbmcuXG4gICAgLy8gSWYgb2NjdXJyZW5jZSBpcyB0cnVlIGJ1dCBubyBwcmVzZXQtb2NjdXJyZW5jZVxuICAgIC8vIFRyZWF0IHRoYXQgYG9jY3VycmVuY2VgIGlzIEJPVU5ERUQgdG8gb3BlcmF0b3IgaXRzZWxmLCBzbyBjbGVhbnAgYXQgZmluaXNoZWQuXG4gICAgaWYgKHRoaXMub2NjdXJyZW5jZSAmJiAhdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5oYXNNYXJrZXJzKCkpIHtcbiAgICAgIHRoaXMub25EaWRSZXNldE9wZXJhdGlvblN0YWNrKCgpID0+IHRoaXMub2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpKVxuICAgIH1cbiAgfVxuXG4gIHNldE1vZGlmaWVyICh7d2lzZSwgb2NjdXJyZW5jZSwgb2NjdXJyZW5jZVR5cGV9KSB7XG4gICAgaWYgKHdpc2UpIHtcbiAgICAgIHRoaXMud2lzZSA9IHdpc2VcbiAgICB9IGVsc2UgaWYgKG9jY3VycmVuY2UpIHtcbiAgICAgIHRoaXMub2NjdXJyZW5jZSA9IG9jY3VycmVuY2VcbiAgICAgIHRoaXMub2NjdXJyZW5jZVR5cGUgPSBvY2N1cnJlbmNlVHlwZVxuICAgICAgLy8gVGhpcyBpcyBvIG1vZGlmaWVyIGNhc2UoZS5nLiBgYyBvIHBgLCBgZCBPIGZgKVxuICAgICAgLy8gV2UgUkVTRVQgZXhpc3Rpbmcgb2NjdXJlbmNlLW1hcmtlciB3aGVuIGBvYCBvciBgT2AgbW9kaWZpZXIgaXMgdHlwZWQgYnkgdXNlci5cbiAgICAgIGNvbnN0IHJlZ2V4ID0gdGhpcy5nZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGUob2NjdXJyZW5jZVR5cGUpXG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4ocmVnZXgsIHtyZXNldDogdHJ1ZSwgb2NjdXJyZW5jZVR5cGV9KVxuICAgICAgdGhpcy5vbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2soKCkgPT4gdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKCkpXG4gICAgfVxuICB9XG5cbiAgLy8gcmV0dXJuIHRydWUvZmFsc2UgdG8gaW5kaWNhdGUgc3VjY2Vzc1xuICBzZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uSWZOZWNlc3NhcnkgKCkge1xuICAgIGNvbnN0IGNhblNlbGVjdCA9XG4gICAgICB0aGlzLmFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gJiZcbiAgICAgIHRoaXMuZ2V0Q29uZmlnKCdhdXRvU2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbk9uT3BlcmF0ZScpICYmXG4gICAgICAhdGhpcy5wZXJzaXN0ZW50U2VsZWN0aW9uLmlzRW1wdHkoKVxuXG4gICAgaWYgKGNhblNlbGVjdCkge1xuICAgICAgdGhpcy5wZXJzaXN0ZW50U2VsZWN0aW9uLnNlbGVjdCgpXG4gICAgICB0aGlzLmVkaXRvci5tZXJnZUludGVyc2VjdGluZ1NlbGVjdGlvbnMoKVxuICAgICAgdGhpcy5zd3JhcC5zYXZlUHJvcGVydGllcyh0aGlzLmVkaXRvcilcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZSAob2NjdXJyZW5jZVR5cGUpIHtcbiAgICBpZiAob2NjdXJyZW5jZVR5cGUgPT09ICdiYXNlJykge1xuICAgICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0V29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uKHRoaXMuZWRpdG9yLCB0aGlzLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgfSBlbHNlIGlmIChvY2N1cnJlbmNlVHlwZSA9PT0gJ3N1YndvcmQnKSB7XG4gICAgICByZXR1cm4gdGhpcy51dGlscy5nZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIHRoaXMuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICB9XG4gIH1cblxuICAvLyB0YXJnZXQgaXMgVGV4dE9iamVjdCBvciBNb3Rpb24gdG8gb3BlcmF0ZSBvbi5cbiAgc2V0VGFyZ2V0ICh0YXJnZXQpIHtcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldFxuICAgIHRoaXMudGFyZ2V0Lm9wZXJhdG9yID0gdGhpc1xuICAgIHRoaXMuZW1pdERpZFNldFRhcmdldCh0aGlzKVxuICB9XG5cbiAgc2V0VGV4dFRvUmVnaXN0ZXIgKHRleHQsIHNlbGVjdGlvbikge1xuICAgIGlmICh0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLmlzVW5uYW1lZCgpICYmIHRoaXMuaXNCbGFja2hvbGVSZWdpc3RlcmVkT3BlcmF0b3IoKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3Qgd2lzZSA9IHRoaXMub2NjdXJyZW5jZVNlbGVjdGVkID8gdGhpcy5vY2N1cnJlbmNlV2lzZSA6IHRoaXMudGFyZ2V0Lndpc2VcbiAgICBpZiAod2lzZSA9PT0gJ2xpbmV3aXNlJyAmJiAhdGV4dC5lbmRzV2l0aCgnXFxuJykpIHtcbiAgICAgIHRleHQgKz0gJ1xcbidcbiAgICB9XG5cbiAgICBpZiAodGV4dCkge1xuICAgICAgdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5zZXQobnVsbCwge3RleHQsIHNlbGVjdGlvbn0pXG5cbiAgICAgIGlmICh0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLmlzVW5uYW1lZCgpKSB7XG4gICAgICAgIGlmICh0aGlzLmluc3RhbmNlb2YoJ0RlbGV0ZScpIHx8IHRoaXMuaW5zdGFuY2VvZignQ2hhbmdlJykpIHtcbiAgICAgICAgICBpZiAoIXRoaXMubmVlZFNhdmVUb051bWJlcmVkUmVnaXN0ZXIodGhpcy50YXJnZXQpICYmIHRoaXMudXRpbHMuaXNTaW5nbGVMaW5lVGV4dCh0ZXh0KSkge1xuICAgICAgICAgICAgdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5zZXQoJy0nLCB7dGV4dCwgc2VsZWN0aW9ufSkgLy8gc21hbGwtY2hhbmdlXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudmltU3RhdGUucmVnaXN0ZXIuc2V0KCcxJywge3RleHQsIHNlbGVjdGlvbn0pXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5zdGFuY2VvZignWWFuaycpKSB7XG4gICAgICAgICAgdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5zZXQoJzAnLCB7dGV4dCwgc2VsZWN0aW9ufSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlzQmxhY2tob2xlUmVnaXN0ZXJlZE9wZXJhdG9yICgpIHtcbiAgICBjb25zdCBvcGVyYXRvcnMgPSB0aGlzLmdldENvbmZpZygnYmxhY2tob2xlUmVnaXN0ZXJlZE9wZXJhdG9ycycpXG4gICAgY29uc3Qgd2lsZENhcmRPcGVyYXRvcnMgPSBvcGVyYXRvcnMuZmlsdGVyKG5hbWUgPT4gbmFtZS5lbmRzV2l0aCgnKicpKVxuICAgIGNvbnN0IGNvbW1hbmROYW1lID0gdGhpcy5nZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXgoKVxuICAgIHJldHVybiAoXG4gICAgICB3aWxkQ2FyZE9wZXJhdG9ycy5zb21lKG5hbWUgPT4gbmV3IFJlZ0V4cCgnXicgKyBuYW1lLnJlcGxhY2UoJyonLCAnLionKSkudGVzdChjb21tYW5kTmFtZSkpIHx8XG4gICAgICBvcGVyYXRvcnMuaW5jbHVkZXMoY29tbWFuZE5hbWUpXG4gICAgKVxuICB9XG5cbiAgbmVlZFNhdmVUb051bWJlcmVkUmVnaXN0ZXIgKHRhcmdldCkge1xuICAgIC8vIFVzZWQgdG8gZGV0ZXJtaW5lIHdoYXQgcmVnaXN0ZXIgdG8gdXNlIG9uIGNoYW5nZSBhbmQgZGVsZXRlIG9wZXJhdGlvbi5cbiAgICAvLyBGb2xsb3dpbmcgbW90aW9uIHNob3VsZCBzYXZlIHRvIDEtOSByZWdpc3RlciByZWdlcmRsZXNzIG9mIGNvbnRlbnQgaXMgc21hbGwgb3IgYmlnLlxuICAgIGNvbnN0IGdvZXNUb051bWJlcmVkUmVnaXN0ZXJNb3Rpb25OYW1lcyA9IFtcbiAgICAgICdNb3ZlVG9QYWlyJywgLy8gJVxuICAgICAgJ01vdmVUb05leHRTZW50ZW5jZScsIC8vICgsIClcbiAgICAgICdTZWFyY2gnLCAvLyAvLCA/LCBuLCBOXG4gICAgICAnTW92ZVRvTmV4dFBhcmFncmFwaCcgLy8geywgfVxuICAgIF1cbiAgICByZXR1cm4gZ29lc1RvTnVtYmVyZWRSZWdpc3Rlck1vdGlvbk5hbWVzLnNvbWUobmFtZSA9PiB0YXJnZXQuaW5zdGFuY2VvZihuYW1lKSlcbiAgfVxuXG4gIG5vcm1hbGl6ZVNlbGVjdGlvbnNJZk5lY2Vzc2FyeSAoKSB7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gJ3Zpc3VhbCcgJiYgdGhpcy50YXJnZXQgJiYgdGhpcy50YXJnZXQuaXNNb3Rpb24oKSkge1xuICAgICAgdGhpcy5zd3JhcC5ub3JtYWxpemUodGhpcy5lZGl0b3IpXG4gICAgfVxuICB9XG5cbiAgbXV0YXRlU2VsZWN0aW9ucyAoKSB7XG4gICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKCkpIHtcbiAgICAgIHRoaXMubXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICB9XG4gICAgdGhpcy5tdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludCgnZGlkLWZpbmlzaCcpXG4gICAgdGhpcy5yZXN0b3JlQ3Vyc29yUG9zaXRpb25zSWZOZWNlc3NhcnkoKVxuICB9XG5cbiAgcHJlU2VsZWN0ICgpIHtcbiAgICB0aGlzLm5vcm1hbGl6ZVNlbGVjdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgdGhpcy5jcmVhdGVCdWZmZXJDaGVja3BvaW50KCd1bmRvJylcbiAgfVxuXG4gIHBvc3RNdXRhdGUgKCkge1xuICAgIHRoaXMuZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KCd1bmRvJylcbiAgICB0aGlzLmVtaXREaWRGaW5pc2hNdXRhdGlvbigpXG5cbiAgICAvLyBFdmVuIHRob3VnaCB3ZSBmYWlsIHRvIHNlbGVjdCB0YXJnZXQgYW5kIGZhaWwgdG8gbXV0YXRlLFxuICAgIC8vIHdlIGhhdmUgdG8gcmV0dXJuIHRvIG5vcm1hbC1tb2RlIGZyb20gb3BlcmF0b3ItcGVuZGluZyBvciB2aXN1YWxcbiAgICB0aGlzLmFjdGl2YXRlTW9kZSgnbm9ybWFsJylcbiAgfVxuXG4gIC8vIE1haW5cbiAgZXhlY3V0ZSAoKSB7XG4gICAgdGhpcy5wcmVTZWxlY3QoKVxuXG4gICAgaWYgKHRoaXMucmVhZElucHV0QWZ0ZXJTZWxlY3QgJiYgIXRoaXMucmVwZWF0ZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4ZWN1dGVBc3luY1RvUmVhZElucHV0QWZ0ZXJTZWxlY3QoKVxuICAgIH1cblxuICAgIGlmICh0aGlzLnNlbGVjdFRhcmdldCgpKSB0aGlzLm11dGF0ZVNlbGVjdGlvbnMoKVxuICAgIHRoaXMucG9zdE11dGF0ZSgpXG4gIH1cblxuICBhc3luYyBleGVjdXRlQXN5bmNUb1JlYWRJbnB1dEFmdGVyU2VsZWN0ICgpIHtcbiAgICBpZiAodGhpcy5zZWxlY3RUYXJnZXQoKSkge1xuICAgICAgdGhpcy5pbnB1dCA9IGF3YWl0IHRoaXMuZm9jdXNJbnB1dFByb21pc2VkKHRoaXMuZm9jdXNJbnB1dE9wdGlvbnMpXG4gICAgICBpZiAodGhpcy5pbnB1dCA9PSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLm1vZGUgIT09ICd2aXN1YWwnKSB7XG4gICAgICAgICAgdGhpcy5lZGl0b3IucmV2ZXJ0VG9DaGVja3BvaW50KHRoaXMuZ2V0QnVmZmVyQ2hlY2twb2ludCgndW5kbycpKVxuICAgICAgICAgIHRoaXMuYWN0aXZhdGVNb2RlKCdub3JtYWwnKVxuICAgICAgICB9XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdGhpcy5tdXRhdGVTZWxlY3Rpb25zKClcbiAgICB9XG4gICAgdGhpcy5wb3N0TXV0YXRlKClcbiAgfVxuXG4gIC8vIFJldHVybiB0cnVlIHVubGVzcyBhbGwgc2VsZWN0aW9uIGlzIGVtcHR5LlxuICBzZWxlY3RUYXJnZXQgKCkge1xuICAgIGlmICh0aGlzLnRhcmdldFNlbGVjdGVkICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldFNlbGVjdGVkXG4gICAgfVxuICAgIHRoaXMubXV0YXRpb25NYW5hZ2VyLmluaXQoe3N0YXlCeU1hcmtlcjogdGhpcy5zdGF5QnlNYXJrZXJ9KVxuXG4gICAgaWYgKHRoaXMudGFyZ2V0LmlzTW90aW9uKCkgJiYgdGhpcy5tb2RlID09PSAndmlzdWFsJykgdGhpcy50YXJnZXQud2lzZSA9IHRoaXMuc3VibW9kZVxuICAgIGlmICh0aGlzLndpc2UgIT0gbnVsbCkgdGhpcy50YXJnZXQuZm9yY2VXaXNlKHRoaXMud2lzZSlcblxuICAgIHRoaXMuZW1pdFdpbGxTZWxlY3RUYXJnZXQoKVxuXG4gICAgLy8gQWxsb3cgY3Vyc29yIHBvc2l0aW9uIGFkanVzdG1lbnQgJ29uLXdpbGwtc2VsZWN0LXRhcmdldCcgaG9vay5cbiAgICAvLyBzbyBjaGVja3BvaW50IGNvbWVzIEFGVEVSIEBlbWl0V2lsbFNlbGVjdFRhcmdldCgpXG4gICAgdGhpcy5tdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludCgnd2lsbC1zZWxlY3QnKVxuXG4gICAgLy8gTk9URTogV2hlbiByZXBlYXRlZCwgc2V0IG9jY3VycmVuY2UtbWFya2VyIGZyb20gcGF0dGVybiBzdG9yZWQgYXMgc3RhdGUuXG4gICAgaWYgKHRoaXMucmVwZWF0ZWQgJiYgdGhpcy5vY2N1cnJlbmNlICYmICF0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKSkge1xuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHRoaXMucGF0dGVybkZvck9jY3VycmVuY2UsIHtvY2N1cnJlbmNlVHlwZTogdGhpcy5vY2N1cnJlbmNlVHlwZX0pXG4gICAgfVxuXG4gICAgdGhpcy50YXJnZXQuZXhlY3V0ZSgpXG5cbiAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KCdkaWQtc2VsZWN0JylcbiAgICBpZiAodGhpcy5vY2N1cnJlbmNlKSB7XG4gICAgICBpZiAoIXRoaXMucGF0dGVybkZvck9jY3VycmVuY2UpIHtcbiAgICAgICAgLy8gUHJlc2VydmUgb2NjdXJyZW5jZVBhdHRlcm4gZm9yIC4gcmVwZWF0LlxuICAgICAgICB0aGlzLnBhdHRlcm5Gb3JPY2N1cnJlbmNlID0gdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5idWlsZFBhdHRlcm4oKVxuICAgICAgfVxuXG4gICAgICB0aGlzLm9jY3VycmVuY2VXaXNlID0gdGhpcy53aXNlIHx8ICdjaGFyYWN0ZXJ3aXNlJ1xuICAgICAgaWYgKHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuc2VsZWN0KHRoaXMub2NjdXJyZW5jZVdpc2UpKSB7XG4gICAgICAgIHRoaXMub2NjdXJyZW5jZVNlbGVjdGVkID0gdHJ1ZVxuICAgICAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KCdkaWQtc2VsZWN0LW9jY3VycmVuY2UnKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudGFyZ2V0U2VsZWN0ZWQgPSB0aGlzLnZpbVN0YXRlLmhhdmVTb21lTm9uRW1wdHlTZWxlY3Rpb24oKSB8fCB0aGlzLnRhcmdldC5uYW1lID09PSAnRW1wdHknXG4gICAgaWYgKHRoaXMudGFyZ2V0U2VsZWN0ZWQpIHtcbiAgICAgIHRoaXMuZW1pdERpZFNlbGVjdFRhcmdldCgpXG4gICAgICB0aGlzLmZsYXNoQ2hhbmdlSWZOZWNlc3NhcnkoKVxuICAgICAgdGhpcy50cmFja0NoYW5nZUlmTmVjZXNzYXJ5KClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbWl0RGlkRmFpbFNlbGVjdFRhcmdldCgpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudGFyZ2V0U2VsZWN0ZWRcbiAgfVxuXG4gIHJlc3RvcmVDdXJzb3JQb3NpdGlvbnNJZk5lY2Vzc2FyeSAoKSB7XG4gICAgaWYgKCF0aGlzLnJlc3RvcmVQb3NpdGlvbnMpIHJldHVyblxuXG4gICAgY29uc3Qgc3RheSA9XG4gICAgICB0aGlzLnN0YXlBdFNhbWVQb3NpdGlvbiAhPSBudWxsXG4gICAgICAgID8gdGhpcy5zdGF5QXRTYW1lUG9zaXRpb25cbiAgICAgICAgOiB0aGlzLmdldENvbmZpZyh0aGlzLnN0YXlPcHRpb25OYW1lKSB8fCAodGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgJiYgdGhpcy5nZXRDb25maWcoJ3N0YXlPbk9jY3VycmVuY2UnKSlcbiAgICBjb25zdCB3aXNlID0gdGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgPyB0aGlzLm9jY3VycmVuY2VXaXNlIDogdGhpcy50YXJnZXQud2lzZVxuICAgIGNvbnN0IHtzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZX0gPSB0aGlzXG4gICAgdGhpcy5tdXRhdGlvbk1hbmFnZXIucmVzdG9yZUN1cnNvclBvc2l0aW9ucyh7c3RheSwgd2lzZSwgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2V9KVxuICB9XG59XG5cbmNsYXNzIFNlbGVjdEJhc2UgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICByZWNvcmRhYmxlID0gZmFsc2VcblxuICBleGVjdXRlICgpIHtcbiAgICB0aGlzLm5vcm1hbGl6ZVNlbGVjdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgdGhpcy5zZWxlY3RUYXJnZXQoKVxuXG4gICAgaWYgKHRoaXMudGFyZ2V0LnNlbGVjdFN1Y2NlZWRlZCkge1xuICAgICAgaWYgKHRoaXMudGFyZ2V0LmlzVGV4dE9iamVjdCgpKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oKVxuICAgICAgfVxuICAgICAgY29uc3Qgd2lzZSA9IHRoaXMub2NjdXJyZW5jZVNlbGVjdGVkID8gdGhpcy5vY2N1cnJlbmNlV2lzZSA6IHRoaXMudGFyZ2V0Lndpc2VcbiAgICAgIHRoaXMuYWN0aXZhdGVNb2RlSWZOZWNlc3NhcnkoJ3Zpc3VhbCcsIHdpc2UpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2FuY2VsT3BlcmF0aW9uKClcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgU2VsZWN0IGV4dGVuZHMgU2VsZWN0QmFzZSB7XG4gIGV4ZWN1dGUgKCkge1xuICAgIHRoaXMuc3dyYXAuc2F2ZVByb3BlcnRpZXModGhpcy5lZGl0b3IpXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cblxuY2xhc3MgU2VsZWN0TGF0ZXN0Q2hhbmdlIGV4dGVuZHMgU2VsZWN0QmFzZSB7XG4gIHRhcmdldCA9ICdBTGF0ZXN0Q2hhbmdlJ1xufVxuXG5jbGFzcyBTZWxlY3RQcmV2aW91c1NlbGVjdGlvbiBleHRlbmRzIFNlbGVjdEJhc2Uge1xuICB0YXJnZXQgPSAnUHJldmlvdXNTZWxlY3Rpb24nXG59XG5cbmNsYXNzIFNlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBTZWxlY3RCYXNlIHtcbiAgdGFyZ2V0ID0gJ0FQZXJzaXN0ZW50U2VsZWN0aW9uJ1xuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uID0gZmFsc2Vcbn1cblxuY2xhc3MgU2VsZWN0T2NjdXJyZW5jZSBleHRlbmRzIFNlbGVjdEJhc2Uge1xuICBvY2N1cnJlbmNlID0gdHJ1ZVxufVxuXG4vLyBWaXN1YWxNb2RlU2VsZWN0OiB1c2VkIGluIHZpc3VhbC1tb2RlXG4vLyBXaGVuIHRleHQtb2JqZWN0IGlzIGludm9rZWQgZnJvbSBub3JtYWwgb3Igdml1c2FsLW1vZGUsIG9wZXJhdGlvbiB3b3VsZCBiZVxuLy8gID0+IFZpc3VhbE1vZGVTZWxlY3Qgb3BlcmF0b3Igd2l0aCB0YXJnZXQ9dGV4dC1vYmplY3Rcbi8vIFdoZW4gbW90aW9uIGlzIGludm9rZWQgZnJvbSB2aXN1YWwtbW9kZSwgb3BlcmF0aW9uIHdvdWxkIGJlXG4vLyAgPT4gVmlzdWFsTW9kZVNlbGVjdCBvcGVyYXRvciB3aXRoIHRhcmdldD1tb3Rpb24pXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gVmlzdWFsTW9kZVNlbGVjdCBpcyB1c2VkIGluIFRXTyBzaXR1YXRpb24uXG4vLyAtIHZpc3VhbC1tb2RlIG9wZXJhdGlvblxuLy8gICAtIGUuZzogYHYgbGAsIGBWIGpgLCBgdiBpIHBgLi4uXG4vLyAtIERpcmVjdGx5IGludm9rZSB0ZXh0LW9iamVjdCBmcm9tIG5vcm1hbC1tb2RlXG4vLyAgIC0gZS5nOiBJbnZva2UgYElubmVyIFBhcmFncmFwaGAgZnJvbSBjb21tYW5kLXBhbGV0dGUuXG5jbGFzcyBWaXN1YWxNb2RlU2VsZWN0IGV4dGVuZHMgU2VsZWN0QmFzZSB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSA9IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gPSBmYWxzZVxufVxuXG4vLyBQZXJzaXN0ZW50IFNlbGVjdGlvblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ3JlYXRlUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIE9wZXJhdG9yIHtcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICBzdGF5QXRTYW1lUG9zaXRpb24gPSB0cnVlXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2UgPSBmYWxzZVxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uID0gZmFsc2VcblxuICBtdXRhdGVTZWxlY3Rpb24gKHNlbGVjdGlvbikge1xuICAgIHRoaXMucGVyc2lzdGVudFNlbGVjdGlvbi5tYXJrQnVmZmVyUmFuZ2Uoc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkpXG4gIH1cbn1cblxuY2xhc3MgVG9nZ2xlUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIENyZWF0ZVBlcnNpc3RlbnRTZWxlY3Rpb24ge1xuICBpbml0aWFsaXplICgpIHtcbiAgICBpZiAodGhpcy5tb2RlID09PSAnbm9ybWFsJykge1xuICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICBjb25zdCBtYXJrZXIgPSB0aGlzLnBlcnNpc3RlbnRTZWxlY3Rpb24uZ2V0TWFya2VyQXRQb2ludChwb2ludClcbiAgICAgIGlmIChtYXJrZXIpIHRoaXMudGFyZ2V0ID0gJ0VtcHR5J1xuICAgIH1cbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIG11dGF0ZVNlbGVjdGlvbiAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBjb25zdCBtYXJrZXIgPSB0aGlzLnBlcnNpc3RlbnRTZWxlY3Rpb24uZ2V0TWFya2VyQXRQb2ludChwb2ludClcbiAgICBpZiAobWFya2VyKSB7XG4gICAgICBtYXJrZXIuZGVzdHJveSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHN1cGVyLm11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgfVxuICB9XG59XG5cbi8vIFByZXNldCBPY2N1cnJlbmNlXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBUb2dnbGVQcmVzZXRPY2N1cnJlbmNlIGV4dGVuZHMgT3BlcmF0b3Ige1xuICB0YXJnZXQgPSAnRW1wdHknXG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2VcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSA9IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gPSBmYWxzZVxuICBvY2N1cnJlbmNlVHlwZSA9ICdiYXNlJ1xuXG4gIGV4ZWN1dGUgKCkge1xuICAgIGNvbnN0IG1hcmtlciA9IHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuZ2V0TWFya2VyQXRQb2ludCh0aGlzLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgaWYgKG1hcmtlcikge1xuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5kZXN0cm95TWFya2VycyhbbWFya2VyXSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaXNOYXJyb3dlZCA9IHRoaXMudmltU3RhdGUuaXNOYXJyb3dlZCgpXG5cbiAgICAgIGxldCByZWdleFxuICAgICAgaWYgKHRoaXMubW9kZSA9PT0gJ3Zpc3VhbCcgJiYgIWlzTmFycm93ZWQpIHtcbiAgICAgICAgdGhpcy5vY2N1cnJlbmNlVHlwZSA9ICdiYXNlJ1xuICAgICAgICByZWdleCA9IG5ldyBSZWdFeHAodGhpcy5fLmVzY2FwZVJlZ0V4cCh0aGlzLmVkaXRvci5nZXRTZWxlY3RlZFRleHQoKSksICdnJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlZ2V4ID0gdGhpcy5nZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGUodGhpcy5vY2N1cnJlbmNlVHlwZSlcbiAgICAgIH1cblxuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHJlZ2V4LCB7b2NjdXJyZW5jZVR5cGU6IHRoaXMub2NjdXJyZW5jZVR5cGV9KVxuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5zYXZlTGFzdFBhdHRlcm4odGhpcy5vY2N1cnJlbmNlVHlwZSlcblxuICAgICAgaWYgKCFpc05hcnJvd2VkKSB0aGlzLmFjdGl2YXRlTW9kZSgnbm9ybWFsJylcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgVG9nZ2xlUHJlc2V0U3Vid29yZE9jY3VycmVuY2UgZXh0ZW5kcyBUb2dnbGVQcmVzZXRPY2N1cnJlbmNlIHtcbiAgb2NjdXJyZW5jZVR5cGUgPSAnc3Vid29yZCdcbn1cblxuLy8gV2FudCB0byByZW5hbWUgUmVzdG9yZU9jY3VycmVuY2VNYXJrZXJcbmNsYXNzIEFkZFByZXNldE9jY3VycmVuY2VGcm9tTGFzdE9jY3VycmVuY2VQYXR0ZXJuIGV4dGVuZHMgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZSB7XG4gIGV4ZWN1dGUgKCkge1xuICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpXG4gICAgY29uc3QgcmVnZXggPSB0aGlzLmdsb2JhbFN0YXRlLmdldCgnbGFzdE9jY3VycmVuY2VQYXR0ZXJuJylcbiAgICBpZiAocmVnZXgpIHtcbiAgICAgIGNvbnN0IG9jY3VycmVuY2VUeXBlID0gdGhpcy5nbG9iYWxTdGF0ZS5nZXQoJ2xhc3RPY2N1cnJlbmNlVHlwZScpXG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4ocmVnZXgsIHtvY2N1cnJlbmNlVHlwZX0pXG4gICAgICB0aGlzLmFjdGl2YXRlTW9kZSgnbm9ybWFsJylcbiAgICB9XG4gIH1cbn1cblxuLy8gRGVsZXRlXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgRGVsZXRlIGV4dGVuZHMgT3BlcmF0b3Ige1xuICB0cmFja0NoYW5nZSA9IHRydWVcbiAgZmxhc2hDaGVja3BvaW50ID0gJ2RpZC1zZWxlY3Qtb2NjdXJyZW5jZSdcbiAgZmxhc2hUeXBlRm9yT2NjdXJyZW5jZSA9ICdvcGVyYXRvci1yZW1vdmUtb2NjdXJyZW5jZSdcbiAgc3RheU9wdGlvbk5hbWUgPSAnc3RheU9uRGVsZXRlJ1xuICBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZSA9IHRydWVcblxuICBleGVjdXRlICgpIHtcbiAgICB0aGlzLm9uRGlkU2VsZWN0VGFyZ2V0KCgpID0+IHtcbiAgICAgIGlmICh0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCAmJiB0aGlzLm9jY3VycmVuY2VXaXNlID09PSAnbGluZXdpc2UnKSB7XG4gICAgICAgIHRoaXMuZmxhc2hUYXJnZXQgPSBmYWxzZVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBpZiAodGhpcy50YXJnZXQud2lzZSA9PT0gJ2Jsb2Nrd2lzZScpIHtcbiAgICAgIHRoaXMucmVzdG9yZVBvc2l0aW9ucyA9IGZhbHNlXG4gICAgfVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG5cbiAgbXV0YXRlU2VsZWN0aW9uIChzZWxlY3Rpb24pIHtcbiAgICB0aGlzLnNldFRleHRUb1JlZ2lzdGVyKHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbilcbiAgICBzZWxlY3Rpb24uZGVsZXRlU2VsZWN0ZWRUZXh0KClcbiAgfVxufVxuXG5jbGFzcyBEZWxldGVSaWdodCBleHRlbmRzIERlbGV0ZSB7XG4gIHRhcmdldCA9ICdNb3ZlUmlnaHQnXG59XG5cbmNsYXNzIERlbGV0ZUxlZnQgZXh0ZW5kcyBEZWxldGUge1xuICB0YXJnZXQgPSAnTW92ZUxlZnQnXG59XG5cbmNsYXNzIERlbGV0ZVRvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIERlbGV0ZSB7XG4gIHRhcmdldCA9ICdNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lJ1xuXG4gIGV4ZWN1dGUgKCkge1xuICAgIHRoaXMub25EaWRTZWxlY3RUYXJnZXQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMudGFyZ2V0Lndpc2UgPT09ICdibG9ja3dpc2UnKSB7XG4gICAgICAgIGZvciAoY29uc3QgYmxvY2t3aXNlU2VsZWN0aW9uIG9mIHRoaXMuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpKSB7XG4gICAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLmV4dGVuZE1lbWJlclNlbGVjdGlvbnNUb0VuZE9mTGluZSgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5cbmNsYXNzIERlbGV0ZUxpbmUgZXh0ZW5kcyBEZWxldGUge1xuICB3aXNlID0gJ2xpbmV3aXNlJ1xuICB0YXJnZXQgPSAnTW92ZVRvUmVsYXRpdmVMaW5lJ1xuICBmbGFzaFRhcmdldCA9IGZhbHNlXG59XG5cbi8vIFlhbmtcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFlhbmsgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIHRyYWNrQ2hhbmdlID0gdHJ1ZVxuICBzdGF5T3B0aW9uTmFtZSA9ICdzdGF5T25ZYW5rJ1xuXG4gIG11dGF0ZVNlbGVjdGlvbiAoc2VsZWN0aW9uKSB7XG4gICAgdGhpcy5zZXRUZXh0VG9SZWdpc3RlcihzZWxlY3Rpb24uZ2V0VGV4dCgpLCBzZWxlY3Rpb24pXG4gIH1cbn1cblxuY2xhc3MgWWFua0xpbmUgZXh0ZW5kcyBZYW5rIHtcbiAgd2lzZSA9ICdsaW5ld2lzZSdcbiAgdGFyZ2V0ID0gJ01vdmVUb1JlbGF0aXZlTGluZSdcbn1cblxuY2xhc3MgWWFua1RvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIFlhbmsge1xuICB0YXJnZXQgPSAnTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZSdcbn1cblxuLy8gWWFuayBkaWZmIGh1bmsgYXQgY3Vyc29yIGJ5IHJlbW92aW5nIGxlYWRpbmcgXCIrXCIgb3IgXCItXCIgZnJvbSBlYWNoIGxpbmVcbmNsYXNzIFlhbmtEaWZmSHVuayBleHRlbmRzIFlhbmsge1xuICB0YXJnZXQgPSAnSW5uZXJEaWZmSHVuaydcbiAgbXV0YXRlU2VsZWN0aW9uIChzZWxlY3Rpb24pIHtcbiAgICAvLyBSZW1vdmUgbGVhZGluZyBcIitcIiBvciBcIi1cIiBpbiBkaWZmIGh1bmtcbiAgICBjb25zdCB0ZXh0VG9ZYW5rID0gc2VsZWN0aW9uLmdldFRleHQoKS5yZXBsYWNlKC9eLi9nbSwgJycpXG4gICAgdGhpcy5zZXRUZXh0VG9SZWdpc3Rlcih0ZXh0VG9ZYW5rLCBzZWxlY3Rpb24pXG4gIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gW2N0cmwtYV1cbmNsYXNzIEluY3JlYXNlIGV4dGVuZHMgT3BlcmF0b3Ige1xuICB0YXJnZXQgPSAnRW1wdHknIC8vIGN0cmwtYSBpbiBub3JtYWwtbW9kZSBmaW5kIHRhcmdldCBudW1iZXIgaW4gY3VycmVudCBsaW5lIG1hbnVhbGx5XG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2UgLy8gZG8gbWFudWFsbHlcbiAgcmVzdG9yZVBvc2l0aW9ucyA9IGZhbHNlIC8vIGRvIG1hbnVhbGx5XG4gIHN0ZXAgPSAxXG5cbiAgZXhlY3V0ZSAoKSB7XG4gICAgdGhpcy5uZXdSYW5nZXMgPSBbXVxuICAgIGlmICghdGhpcy5yZWdleCkgdGhpcy5yZWdleCA9IG5ldyBSZWdFeHAoYCR7dGhpcy5nZXRDb25maWcoJ251bWJlclJlZ2V4Jyl9YCwgJ2cnKVxuXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG5cbiAgICBpZiAodGhpcy5uZXdSYW5nZXMubGVuZ3RoKSB7XG4gICAgICBpZiAodGhpcy5nZXRDb25maWcoJ2ZsYXNoT25PcGVyYXRlJykgJiYgIXRoaXMuZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdCcpLmluY2x1ZGVzKHRoaXMubmFtZSkpIHtcbiAgICAgICAgdGhpcy52aW1TdGF0ZS5mbGFzaCh0aGlzLm5ld1Jhbmdlcywge3R5cGU6IHRoaXMuZmxhc2hUeXBlRm9yT2NjdXJyZW5jZX0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVwbGFjZU51bWJlckluQnVmZmVyUmFuZ2UgKHNjYW5SYW5nZSwgZm4pIHtcbiAgICBjb25zdCBuZXdSYW5nZXMgPSBbXVxuICAgIHRoaXMuc2NhbkVkaXRvcignZm9yd2FyZCcsIHRoaXMucmVnZXgsIHtzY2FuUmFuZ2V9LCBldmVudCA9PiB7XG4gICAgICBpZiAoZm4pIHtcbiAgICAgICAgaWYgKGZuKGV2ZW50KSkgZXZlbnQuc3RvcCgpXG4gICAgICAgIGVsc2UgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCBuZXh0TnVtYmVyID0gdGhpcy5nZXROZXh0TnVtYmVyKGV2ZW50Lm1hdGNoVGV4dClcbiAgICAgIG5ld1Jhbmdlcy5wdXNoKGV2ZW50LnJlcGxhY2UoU3RyaW5nKG5leHROdW1iZXIpKSlcbiAgICB9KVxuICAgIHJldHVybiBuZXdSYW5nZXNcbiAgfVxuXG4gIG11dGF0ZVNlbGVjdGlvbiAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qge2N1cnNvcn0gPSBzZWxlY3Rpb25cbiAgICBpZiAodGhpcy50YXJnZXQubmFtZSA9PT0gJ0VtcHR5Jykge1xuICAgICAgLy8gY3RybC1hLCBjdHJsLXggaW4gYG5vcm1hbC1tb2RlYFxuICAgICAgY29uc3QgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgY29uc3Qgc2NhblJhbmdlID0gdGhpcy5lZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3coY3Vyc29yUG9zaXRpb24ucm93KVxuICAgICAgY29uc3QgbmV3UmFuZ2VzID0gdGhpcy5yZXBsYWNlTnVtYmVySW5CdWZmZXJSYW5nZShzY2FuUmFuZ2UsIGV2ZW50ID0+XG4gICAgICAgIGV2ZW50LnJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuKGN1cnNvclBvc2l0aW9uKVxuICAgICAgKVxuICAgICAgY29uc3QgcG9pbnQgPSAobmV3UmFuZ2VzLmxlbmd0aCAmJiBuZXdSYW5nZXNbMF0uZW5kLnRyYW5zbGF0ZShbMCwgLTFdKSkgfHwgY3Vyc29yUG9zaXRpb25cbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc2NhblJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgIHRoaXMubmV3UmFuZ2VzLnB1c2goLi4udGhpcy5yZXBsYWNlTnVtYmVySW5CdWZmZXJSYW5nZShzY2FuUmFuZ2UpKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHNjYW5SYW5nZS5zdGFydClcbiAgICB9XG4gIH1cblxuICBnZXROZXh0TnVtYmVyIChudW1iZXJTdHJpbmcpIHtcbiAgICByZXR1cm4gTnVtYmVyLnBhcnNlSW50KG51bWJlclN0cmluZywgMTApICsgdGhpcy5zdGVwICogdGhpcy5nZXRDb3VudCgpXG4gIH1cbn1cblxuLy8gW2N0cmwteF1cbmNsYXNzIERlY3JlYXNlIGV4dGVuZHMgSW5jcmVhc2Uge1xuICBzdGVwID0gLTFcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gW2cgY3RybC1hXVxuY2xhc3MgSW5jcmVtZW50TnVtYmVyIGV4dGVuZHMgSW5jcmVhc2Uge1xuICBiYXNlTnVtYmVyID0gbnVsbFxuICB0YXJnZXQgPSBudWxsXG5cbiAgZ2V0TmV4dE51bWJlciAobnVtYmVyU3RyaW5nKSB7XG4gICAgaWYgKHRoaXMuYmFzZU51bWJlciAhPSBudWxsKSB7XG4gICAgICB0aGlzLmJhc2VOdW1iZXIgKz0gdGhpcy5zdGVwICogdGhpcy5nZXRDb3VudCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYmFzZU51bWJlciA9IE51bWJlci5wYXJzZUludChudW1iZXJTdHJpbmcsIDEwKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5iYXNlTnVtYmVyXG4gIH1cbn1cblxuLy8gW2cgY3RybC14XVxuY2xhc3MgRGVjcmVtZW50TnVtYmVyIGV4dGVuZHMgSW5jcmVtZW50TnVtYmVyIHtcbiAgc3RlcCA9IC0xXG59XG5cbi8vIFB1dFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQ3Vyc29yIHBsYWNlbWVudDpcbi8vIC0gcGxhY2UgYXQgZW5kIG9mIG11dGF0aW9uOiBwYXN0ZSBub24tbXVsdGlsaW5lIGNoYXJhY3Rlcndpc2UgdGV4dFxuLy8gLSBwbGFjZSBhdCBzdGFydCBvZiBtdXRhdGlvbjogbm9uLW11bHRpbGluZSBjaGFyYWN0ZXJ3aXNlIHRleHQoY2hhcmFjdGVyd2lzZSwgbGluZXdpc2UpXG5jbGFzcyBQdXRCZWZvcmUgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIGxvY2F0aW9uID0gJ2JlZm9yZSdcbiAgdGFyZ2V0ID0gJ0VtcHR5J1xuICBmbGFzaFR5cGUgPSAnb3BlcmF0b3ItbG9uZydcbiAgcmVzdG9yZVBvc2l0aW9ucyA9IGZhbHNlIC8vIG1hbmFnZSBtYW51YWxseVxuICBmbGFzaFRhcmdldCA9IGZhbHNlIC8vIG1hbmFnZSBtYW51YWxseVxuICB0cmFja0NoYW5nZSA9IGZhbHNlIC8vIG1hbmFnZSBtYW51YWxseVxuXG4gIGluaXRpYWxpemUgKCkge1xuICAgIHRoaXMudmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5vbkluaXRpYWxpemUodGhpcylcbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGV4ZWN1dGUgKCkge1xuICAgIHRoaXMubXV0YXRpb25zQnlTZWxlY3Rpb24gPSBuZXcgTWFwKClcbiAgICB0aGlzLnNlcXVlbnRpYWxQYXN0ZSA9IHRoaXMudmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5vbkV4ZWN1dGUodGhpcylcblxuICAgIHRoaXMub25EaWRGaW5pc2hNdXRhdGlvbigoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuY2FuY2VsbGVkKSB0aGlzLmFkanVzdEN1cnNvclBvc2l0aW9uKClcbiAgICB9KVxuXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG5cbiAgICBpZiAodGhpcy5jYW5jZWxsZWQpIHJldHVyblxuXG4gICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICAvLyBUcmFja0NoYW5nZVxuICAgICAgY29uc3QgbmV3UmFuZ2UgPSB0aGlzLm11dGF0aW9uc0J5U2VsZWN0aW9uLmdldCh0aGlzLmVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgICBpZiAobmV3UmFuZ2UpIHRoaXMuc2V0TWFya0ZvckNoYW5nZShuZXdSYW5nZSlcblxuICAgICAgLy8gRmxhc2hcbiAgICAgIGlmICh0aGlzLmdldENvbmZpZygnZmxhc2hPbk9wZXJhdGUnKSAmJiAhdGhpcy5nZXRDb25maWcoJ2ZsYXNoT25PcGVyYXRlQmxhY2tsaXN0JykuaW5jbHVkZXModGhpcy5uYW1lKSkge1xuICAgICAgICBjb25zdCByYW5nZXMgPSB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkubWFwKHNlbGVjdGlvbiA9PiB0aGlzLm11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pKVxuICAgICAgICB0aGlzLnZpbVN0YXRlLmZsYXNoKHJhbmdlcywge3R5cGU6IHRoaXMuZ2V0Rmxhc2hUeXBlKCl9KVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBhZGp1c3RDdXJzb3JQb3NpdGlvbiAoKSB7XG4gICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICBpZiAoIXRoaXMubXV0YXRpb25zQnlTZWxlY3Rpb24uaGFzKHNlbGVjdGlvbikpIGNvbnRpbnVlXG5cbiAgICAgIGNvbnN0IHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgICBjb25zdCBuZXdSYW5nZSA9IHRoaXMubXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICAgIGlmICh0aGlzLmxpbmV3aXNlUGFzdGUpIHtcbiAgICAgICAgdGhpcy51dGlscy5tb3ZlQ3Vyc29yVG9GaXJzdENoYXJhY3RlckF0Um93KGN1cnNvciwgbmV3UmFuZ2Uuc3RhcnQucm93KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG5ld1JhbmdlLmlzU2luZ2xlTGluZSgpKSB7XG4gICAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKG5ld1JhbmdlLmVuZC50cmFuc2xhdGUoWzAsIC0xXSkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKG5ld1JhbmdlLnN0YXJ0KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbXV0YXRlU2VsZWN0aW9uIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmltU3RhdGUucmVnaXN0ZXIuZ2V0KG51bGwsIHNlbGVjdGlvbiwgdGhpcy5zZXF1ZW50aWFsUGFzdGUpXG4gICAgaWYgKCF2YWx1ZS50ZXh0KSB7XG4gICAgICB0aGlzLmNhbmNlbGxlZCA9IHRydWVcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IHRleHRUb1Bhc3RlID0gdmFsdWUudGV4dC5yZXBlYXQodGhpcy5nZXRDb3VudCgpKVxuICAgIHRoaXMubGluZXdpc2VQYXN0ZSA9IHZhbHVlLnR5cGUgPT09ICdsaW5ld2lzZScgfHwgdGhpcy5pc01vZGUoJ3Zpc3VhbCcsICdsaW5ld2lzZScpXG4gICAgY29uc3QgbmV3UmFuZ2UgPSB0aGlzLnBhc3RlKHNlbGVjdGlvbiwgdGV4dFRvUGFzdGUsIHtsaW5ld2lzZVBhc3RlOiB0aGlzLmxpbmV3aXNlUGFzdGV9KVxuICAgIHRoaXMubXV0YXRpb25zQnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgbmV3UmFuZ2UpXG4gICAgdGhpcy52aW1TdGF0ZS5zZXF1ZW50aWFsUGFzdGVNYW5hZ2VyLnNhdmVQYXN0ZWRSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24sIG5ld1JhbmdlKVxuICB9XG5cbiAgLy8gUmV0dXJuIHBhc3RlZCByYW5nZVxuICBwYXN0ZSAoc2VsZWN0aW9uLCB0ZXh0LCB7bGluZXdpc2VQYXN0ZX0pIHtcbiAgICBpZiAodGhpcy5zZXF1ZW50aWFsUGFzdGUpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhc3RlQ2hhcmFjdGVyd2lzZShzZWxlY3Rpb24sIHRleHQpXG4gICAgfSBlbHNlIGlmIChsaW5ld2lzZVBhc3RlKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXN0ZUxpbmV3aXNlKHNlbGVjdGlvbiwgdGV4dClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucGFzdGVDaGFyYWN0ZXJ3aXNlKHNlbGVjdGlvbiwgdGV4dClcbiAgICB9XG4gIH1cblxuICBwYXN0ZUNoYXJhY3Rlcndpc2UgKHNlbGVjdGlvbiwgdGV4dCkge1xuICAgIGNvbnN0IHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgaWYgKHNlbGVjdGlvbi5pc0VtcHR5KCkgJiYgdGhpcy5sb2NhdGlvbiA9PT0gJ2FmdGVyJyAmJiAhdGhpcy5pc0VtcHR5Um93KGN1cnNvci5nZXRCdWZmZXJSb3coKSkpIHtcbiAgICAgIGN1cnNvci5tb3ZlUmlnaHQoKVxuICAgIH1cbiAgICByZXR1cm4gc2VsZWN0aW9uLmluc2VydFRleHQodGV4dClcbiAgfVxuXG4gIC8vIFJldHVybiBuZXdSYW5nZVxuICBwYXN0ZUxpbmV3aXNlIChzZWxlY3Rpb24sIHRleHQpIHtcbiAgICBjb25zdCB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgIGNvbnN0IGN1cnNvclJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgIGlmICghdGV4dC5lbmRzV2l0aCgnXFxuJykpIHtcbiAgICAgIHRleHQgKz0gJ1xcbidcbiAgICB9XG4gICAgaWYgKHNlbGVjdGlvbi5pc0VtcHR5KCkpIHtcbiAgICAgIGlmICh0aGlzLmxvY2F0aW9uID09PSAnYmVmb3JlJykge1xuICAgICAgICByZXR1cm4gdGhpcy51dGlscy5pbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgW2N1cnNvclJvdywgMF0sIHRleHQpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMubG9jYXRpb24gPT09ICdhZnRlcicpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0Um93ID0gdGhpcy5nZXRGb2xkRW5kUm93Rm9yUm93KGN1cnNvclJvdylcbiAgICAgICAgdGhpcy51dGlscy5lbnN1cmVFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3codGhpcy5lZGl0b3IsIHRhcmdldFJvdylcbiAgICAgICAgcmV0dXJuIHRoaXMudXRpbHMuaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIFt0YXJnZXRSb3cgKyAxLCAwXSwgdGV4dClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCF0aGlzLmlzTW9kZSgndmlzdWFsJywgJ2xpbmV3aXNlJykpIHtcbiAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoJ1xcbicpXG4gICAgICB9XG4gICAgICByZXR1cm4gc2VsZWN0aW9uLmluc2VydFRleHQodGV4dClcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgUHV0QWZ0ZXIgZXh0ZW5kcyBQdXRCZWZvcmUge1xuICBsb2NhdGlvbiA9ICdhZnRlcidcbn1cblxuY2xhc3MgUHV0QmVmb3JlV2l0aEF1dG9JbmRlbnQgZXh0ZW5kcyBQdXRCZWZvcmUge1xuICBwYXN0ZUxpbmV3aXNlIChzZWxlY3Rpb24sIHRleHQpIHtcbiAgICBjb25zdCBuZXdSYW5nZSA9IHN1cGVyLnBhc3RlTGluZXdpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuICAgIHRoaXMudXRpbHMuYWRqdXN0SW5kZW50V2l0aEtlZXBpbmdMYXlvdXQodGhpcy5lZGl0b3IsIG5ld1JhbmdlKVxuICAgIHJldHVybiBuZXdSYW5nZVxuICB9XG59XG5cbmNsYXNzIFB1dEFmdGVyV2l0aEF1dG9JbmRlbnQgZXh0ZW5kcyBQdXRCZWZvcmVXaXRoQXV0b0luZGVudCB7XG4gIGxvY2F0aW9uID0gJ2FmdGVyJ1xufVxuXG5jbGFzcyBBZGRCbGFua0xpbmVCZWxvdyBleHRlbmRzIE9wZXJhdG9yIHtcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICB0YXJnZXQgPSAnRW1wdHknXG4gIHN0YXlBdFNhbWVQb3NpdGlvbiA9IHRydWVcbiAgc3RheUJ5TWFya2VyID0gdHJ1ZVxuICB3aGVyZSA9ICdiZWxvdydcblxuICBtdXRhdGVTZWxlY3Rpb24gKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHBvaW50ID0gc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgaWYgKHRoaXMud2hlcmUgPT09ICdiZWxvdycpIHBvaW50LnJvdysrXG4gICAgcG9pbnQuY29sdW1uID0gMFxuICAgIHRoaXMuZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKFtwb2ludCwgcG9pbnRdLCAnXFxuJy5yZXBlYXQodGhpcy5nZXRDb3VudCgpKSlcbiAgfVxufVxuXG5jbGFzcyBBZGRCbGFua0xpbmVBYm92ZSBleHRlbmRzIEFkZEJsYW5rTGluZUJlbG93IHtcbiAgd2hlcmUgPSAnYWJvdmUnXG59XG5cbmNsYXNzIFJlc29sdmVHaXRDb25mbGljdCBleHRlbmRzIE9wZXJhdG9yIHtcbiAgdGFyZ2V0ID0gJ0VtcHR5J1xuICByZXN0b3JlUG9zaXRpb25zID0gZmFsc2UgLy8gZG8gbWFudWFsbHlcblxuICBtdXRhdGVTZWxlY3Rpb24gKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgY29uc3QgcmFuZ2VJbmZvID0gdGhpcy5nZXRDb25mbGljdGluZ1JhbmdlSW5mbyhwb2ludC5yb3cpXG5cbiAgICBpZiAocmFuZ2VJbmZvKSB7XG4gICAgICBjb25zdCB7d2hvbGUsIHNlY3Rpb25PdXJzLCBzZWN0aW9uVGhlaXJzLCBib2R5T3VycywgYm9keVRoZWlyc30gPSByYW5nZUluZm9cbiAgICAgIGNvbnN0IHJlc29sdmVDb25mbGljdCA9IHJhbmdlID0+IHtcbiAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgICBjb25zdCBkc3RSYW5nZSA9IHRoaXMuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShbd2hvbGUuc3RhcnQucm93LCB3aG9sZS5lbmQucm93XSlcbiAgICAgICAgY29uc3QgbmV3UmFuZ2UgPSB0aGlzLmVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShkc3RSYW5nZSwgdGV4dCA/IHRleHQgKyAnXFxuJyA6ICcnKVxuICAgICAgICBzZWxlY3Rpb24uY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKG5ld1JhbmdlLnN0YXJ0KVxuICAgICAgfVxuICAgICAgLy8gTk9URTogV2hlbiBjdXJzb3IgaXMgYXQgc2VwYXJhdG9yIHJvdyAnPT09PT09PScsIG5vIHJlcGxhY2UgaGFwcGVucyBiZWNhdXNlIGl0J3MgYW1iaWd1b3VzLlxuICAgICAgaWYgKHNlY3Rpb25PdXJzLmNvbnRhaW5zUG9pbnQocG9pbnQpKSB7XG4gICAgICAgIHJlc29sdmVDb25mbGljdChib2R5T3VycylcbiAgICAgIH0gZWxzZSBpZiAoc2VjdGlvblRoZWlycy5jb250YWluc1BvaW50KHBvaW50KSkge1xuICAgICAgICByZXNvbHZlQ29uZmxpY3QoYm9keVRoZWlycylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRDb25mbGljdGluZ1JhbmdlSW5mbyAocm93KSB7XG4gICAgY29uc3QgZnJvbSA9IFtyb3csIEluZmluaXR5XVxuICAgIGNvbnN0IGNvbmZsaWN0U3RhcnQgPSB0aGlzLmZpbmRJbkVkaXRvcignYmFja3dhcmQnLCAvXjw8PDw8PDwgLiskLywge2Zyb219LCBldmVudCA9PiBldmVudC5yYW5nZS5zdGFydClcblxuICAgIGlmIChjb25mbGljdFN0YXJ0KSB7XG4gICAgICBjb25zdCBzdGFydFJvdyA9IGNvbmZsaWN0U3RhcnQucm93XG4gICAgICBsZXQgc2VwYXJhdG9yUm93LCBlbmRSb3dcbiAgICAgIGNvbnN0IGZyb20gPSBbc3RhcnRSb3cgKyAxLCAwXVxuICAgICAgY29uc3QgcmVnZXggPSAvKF48PDw8PDw8IC4rJCl8KF49PT09PT09JCl8KF4+Pj4+Pj4+IC4rJCkvZ1xuICAgICAgdGhpcy5zY2FuRWRpdG9yKCdmb3J3YXJkJywgcmVnZXgsIHtmcm9tfSwgKHttYXRjaCwgcmFuZ2UsIHN0b3B9KSA9PiB7XG4gICAgICAgIGlmIChtYXRjaFsxXSkge1xuICAgICAgICAgIC8vIGluY29tcGxldGUgY29uZmxpY3QgaHVuaywgd2Ugc2F3IG5leHQgY29uZmxpY3Qgc3RhcnRSb3cgd2lob3V0IHNlZWluZyBlbmRSb3dcbiAgICAgICAgICBzdG9wKClcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaFsyXSkge1xuICAgICAgICAgIHNlcGFyYXRvclJvdyA9IHJhbmdlLnN0YXJ0LnJvd1xuICAgICAgICB9IGVsc2UgaWYgKG1hdGNoWzNdKSB7XG4gICAgICAgICAgZW5kUm93ID0gcmFuZ2Uuc3RhcnQucm93XG4gICAgICAgICAgc3RvcCgpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICBpZiAoIWVuZFJvdykgcmV0dXJuXG4gICAgICBjb25zdCB3aG9sZSA9IG5ldyBSYW5nZShbc3RhcnRSb3csIDBdLCBbZW5kUm93LCBJbmZpbml0eV0pXG4gICAgICBjb25zdCBzZWN0aW9uT3VycyA9IG5ldyBSYW5nZSh3aG9sZS5zdGFydCwgWyhzZXBhcmF0b3JSb3cgfHwgZW5kUm93KSAtIDEsIEluZmluaXR5XSlcbiAgICAgIGNvbnN0IHNlY3Rpb25UaGVpcnMgPSBuZXcgUmFuZ2UoWyhzZXBhcmF0b3JSb3cgfHwgc3RhcnRSb3cpICsgMSwgMF0sIHdob2xlLmVuZClcblxuICAgICAgY29uc3QgYm9keU91cnNTdGFydCA9IHNlY3Rpb25PdXJzLnN0YXJ0LnRyYW5zbGF0ZShbMSwgMF0pXG4gICAgICBjb25zdCBib2R5T3VycyA9XG4gICAgICAgIHNlY3Rpb25PdXJzLmdldFJvd0NvdW50KCkgPT09IDFcbiAgICAgICAgICA/IG5ldyBSYW5nZShib2R5T3Vyc1N0YXJ0LCBib2R5T3Vyc1N0YXJ0KVxuICAgICAgICAgIDogbmV3IFJhbmdlKGJvZHlPdXJzU3RhcnQsIHNlY3Rpb25PdXJzLmVuZClcblxuICAgICAgY29uc3QgYm9keVRoZWlycyA9XG4gICAgICAgIHNlY3Rpb25UaGVpcnMuZ2V0Um93Q291bnQoKSA9PT0gMVxuICAgICAgICAgID8gbmV3IFJhbmdlKHNlY3Rpb25UaGVpcnMuc3RhcnQsIHNlY3Rpb25UaGVpcnMuc3RhcnQpXG4gICAgICAgICAgOiBzZWN0aW9uVGhlaXJzLnRyYW5zbGF0ZShbMCwgMF0sIFstMSwgMF0pXG4gICAgICByZXR1cm4ge3dob2xlLCBzZWN0aW9uT3Vycywgc2VjdGlvblRoZWlycywgYm9keU91cnMsIGJvZHlUaGVpcnN9XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBPcGVyYXRvcixcbiAgU2VsZWN0QmFzZSxcbiAgU2VsZWN0LFxuICBTZWxlY3RMYXRlc3RDaGFuZ2UsXG4gIFNlbGVjdFByZXZpb3VzU2VsZWN0aW9uLFxuICBTZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uLFxuICBTZWxlY3RPY2N1cnJlbmNlLFxuICBWaXN1YWxNb2RlU2VsZWN0LFxuICBDcmVhdGVQZXJzaXN0ZW50U2VsZWN0aW9uLFxuICBUb2dnbGVQZXJzaXN0ZW50U2VsZWN0aW9uLFxuICBUb2dnbGVQcmVzZXRPY2N1cnJlbmNlLFxuICBUb2dnbGVQcmVzZXRTdWJ3b3JkT2NjdXJyZW5jZSxcbiAgQWRkUHJlc2V0T2NjdXJyZW5jZUZyb21MYXN0T2NjdXJyZW5jZVBhdHRlcm4sXG4gIERlbGV0ZSxcbiAgRGVsZXRlUmlnaHQsXG4gIERlbGV0ZUxlZnQsXG4gIERlbGV0ZVRvTGFzdENoYXJhY3Rlck9mTGluZSxcbiAgRGVsZXRlTGluZSxcbiAgWWFuayxcbiAgWWFua0xpbmUsXG4gIFlhbmtUb0xhc3RDaGFyYWN0ZXJPZkxpbmUsXG4gIFlhbmtEaWZmSHVuayxcbiAgSW5jcmVhc2UsXG4gIERlY3JlYXNlLFxuICBJbmNyZW1lbnROdW1iZXIsXG4gIERlY3JlbWVudE51bWJlcixcbiAgUHV0QmVmb3JlLFxuICBQdXRBZnRlcixcbiAgUHV0QmVmb3JlV2l0aEF1dG9JbmRlbnQsXG4gIFB1dEFmdGVyV2l0aEF1dG9JbmRlbnQsXG4gIEFkZEJsYW5rTGluZUJlbG93LFxuICBBZGRCbGFua0xpbmVBYm92ZSxcbiAgUmVzb2x2ZUdpdENvbmZsaWN0XG59XG4iXX0=