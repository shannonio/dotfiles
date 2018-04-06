'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SearchModel = require('./search-model');

var _require = require('./motion');

var Motion = _require.Motion;

var SearchBase = (function (_Motion) {
  _inherits(SearchBase, _Motion);

  function SearchBase() {
    _classCallCheck(this, SearchBase);

    _get(Object.getPrototypeOf(SearchBase.prototype), 'constructor', this).apply(this, arguments);

    this.jump = true;
    this.backwards = false;
    this.useRegexp = true;
    this.landingPoint = null;
    this.defaultLandingPoint = 'start';
    this.relativeIndex = null;
    this.updatelastSearchPattern = true;
  }

  // /, ?
  // -------------------------

  _createClass(SearchBase, [{
    key: 'isBackwards',
    value: function isBackwards() {
      return this.backwards;
    }
  }, {
    key: 'resetState',
    value: function resetState() {
      _get(Object.getPrototypeOf(SearchBase.prototype), 'resetState', this).call(this);
      this.relativeIndex = null;
    }
  }, {
    key: 'isIncrementalSearch',
    value: function isIncrementalSearch() {
      return this['instanceof']('Search') && !this.repeated && this.getConfig('incrementalSearch');
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      var _this = this;

      this.onDidFinishOperation(function () {
        return _this.finish();
      });
      _get(Object.getPrototypeOf(SearchBase.prototype), 'initialize', this).call(this);
    }
  }, {
    key: 'getCount',
    value: function getCount() {
      return _get(Object.getPrototypeOf(SearchBase.prototype), 'getCount', this).call(this) * (this.isBackwards() ? -1 : 1);
    }
  }, {
    key: 'finish',
    value: function finish() {
      if (this.isIncrementalSearch() && this.getConfig('showHoverSearchCounter')) {
        this.vimState.hoverSearchCounter.reset();
      }
      if (this.searchModel) this.searchModel.destroy();

      this.relativeIndex = null;
      this.searchModel = null;
    }
  }, {
    key: 'getLandingPoint',
    value: function getLandingPoint() {
      if (!this.landingPoint) this.landingPoint = this.defaultLandingPoint;
      return this.landingPoint;
    }
  }, {
    key: 'getPoint',
    value: function getPoint(cursor) {
      if (this.searchModel) {
        this.relativeIndex = this.getCount() + this.searchModel.getRelativeIndex();
      } else if (this.relativeIndex == null) {
        this.relativeIndex = this.getCount();
      }

      var range = this.search(cursor, this.input, this.relativeIndex);

      this.searchModel.destroy();
      this.searchModel = null;

      if (range) return range[this.getLandingPoint()];
    }
  }, {
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      if (!this.input) return;
      var point = this.getPoint(cursor);

      if (point) {
        if (this.restoreEditorState) {
          this.restoreEditorState({ anchorPosition: point, skipRow: point.row });
          this.restoreEditorState = null; // HACK: dont refold on `n`, `N` repeat
        }
        cursor.setBufferPosition(point, { autoscroll: false });
      }

      if (!this.repeated) {
        this.globalState.set('currentSearch', this);
        this.vimState.searchHistory.save(this.input);
      }

      if (this.updatelastSearchPattern) {
        this.globalState.set('lastSearchPattern', this.getPattern(this.input));
      }
    }
  }, {
    key: 'getSearchModel',
    value: function getSearchModel() {
      if (!this.searchModel) {
        this.searchModel = new SearchModel(this.vimState, { incrementalSearch: this.isIncrementalSearch() });
      }
      return this.searchModel;
    }
  }, {
    key: 'search',
    value: function search(cursor, input, relativeIndex) {
      var searchModel = this.getSearchModel();
      if (input) {
        var fromPoint = this.getBufferPositionForCursor(cursor);
        return searchModel.search(fromPoint, this.getPattern(input), relativeIndex);
      }
      this.vimState.hoverSearchCounter.reset();
      searchModel.clearMarkers();
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return SearchBase;
})(Motion);

var Search = (function (_SearchBase) {
  _inherits(Search, _SearchBase);

  function Search() {
    _classCallCheck(this, Search);

    _get(Object.getPrototypeOf(Search.prototype), 'constructor', this).apply(this, arguments);

    this.caseSensitivityKind = 'Search';
    this.requireInput = true;
  }

  _createClass(Search, [{
    key: 'initialize',
    value: function initialize() {
      if (this.isIncrementalSearch()) {
        this.restoreEditorState = this.utils.saveEditorState(this.editor);
        this.onDidCommandSearch(this.handleCommandEvent.bind(this));
      }

      this.onDidConfirmSearch(this.handleConfirmSearch.bind(this));
      this.onDidCancelSearch(this.handleCancelSearch.bind(this));
      this.onDidChangeSearch(this.handleChangeSearch.bind(this));

      this.focusSearchInputEditor();

      _get(Object.getPrototypeOf(Search.prototype), 'initialize', this).call(this);
    }
  }, {
    key: 'focusSearchInputEditor',
    value: function focusSearchInputEditor() {
      var classList = this.isBackwards() ? ['backwards'] : [];
      this.vimState.searchInput.focus({ classList: classList });
    }
  }, {
    key: 'handleCommandEvent',
    value: function handleCommandEvent(event) {
      if (!event.input) return;

      if (event.name === 'visit') {
        var direction = event.direction;

        if (this.isBackwards() && this.getConfig('incrementalSearchVisitDirection') === 'relative') {
          direction = direction === 'next' ? 'prev' : 'next';
        }
        this.getSearchModel().visit(direction === 'next' ? +1 : -1);
      } else if (event.name === 'occurrence') {
        var operation = event.operation;
        var input = event.input;

        this.occurrenceManager.addPattern(this.getPattern(input), { reset: operation != null });
        this.occurrenceManager.saveLastPattern();

        this.vimState.searchHistory.save(input);
        this.vimState.searchInput.cancel();
        if (operation != null) this.vimState.operationStack.run(operation);
      } else if (event.name === 'project-find') {
        this.vimState.searchHistory.save(event.input);
        this.vimState.searchInput.cancel();
        this.utils.searchByProjectFind(this.editor, event.input);
      }
    }
  }, {
    key: 'handleCancelSearch',
    value: function handleCancelSearch() {
      if (!['visual', 'insert'].includes(this.mode)) this.vimState.resetNormalMode();

      if (this.restoreEditorState) this.restoreEditorState();
      this.vimState.reset();
      this.finish();
    }
  }, {
    key: 'isSearchRepeatCharacter',
    value: function isSearchRepeatCharacter(char) {
      return this.isIncrementalSearch() ? char === '' : ['', this.isBackwards() ? '?' : '/'].includes(char); // empty confirm or invoking-char
    }
  }, {
    key: 'handleConfirmSearch',
    value: function handleConfirmSearch(_ref) {
      var input = _ref.input;
      var landingPoint = _ref.landingPoint;

      this.input = input;
      this.landingPoint = landingPoint;
      if (this.isSearchRepeatCharacter(this.input)) {
        this.input = this.vimState.searchHistory.get('prev');
        if (!this.input) atom.beep();
      }
      this.processOperation();
    }
  }, {
    key: 'handleChangeSearch',
    value: function handleChangeSearch(input) {
      // If input starts with space, remove first space and disable useRegexp.
      if (input.startsWith(' ')) {
        // FIXME: Sould I remove this unknown hack and implement visible button to togle regexp?
        input = input.replace(/^ /, '');
        this.useRegexp = false;
      }
      this.vimState.searchInput.updateOptionSettings({ useRegexp: this.useRegexp });

      if (this.isIncrementalSearch()) {
        this.search(this.editor.getLastCursor(), input, this.getCount());
      }
    }
  }, {
    key: 'getPattern',
    value: function getPattern(term) {
      var modifiers = this.isCaseSensitive(term) ? 'g' : 'gi';
      // FIXME this prevent search \\c itself.
      // DONT thinklessly mimic pure Vim. Instead, provide ignorecase button and shortcut.
      if (term.indexOf('\\c') >= 0) {
        term = term.replace('\\c', '');
        if (!modifiers.includes('i')) modifiers += 'i';
      }

      if (this.useRegexp) {
        try {
          return new RegExp(term, modifiers);
        } catch (error) {}
      }
      return new RegExp(this._.escapeRegExp(term), modifiers);
    }
  }]);

  return Search;
})(SearchBase);

var SearchBackwards = (function (_Search) {
  _inherits(SearchBackwards, _Search);

  function SearchBackwards() {
    _classCallCheck(this, SearchBackwards);

    _get(Object.getPrototypeOf(SearchBackwards.prototype), 'constructor', this).apply(this, arguments);

    this.backwards = true;
  }

  // *, #
  // -------------------------
  return SearchBackwards;
})(Search);

var SearchCurrentWord = (function (_SearchBase2) {
  _inherits(SearchCurrentWord, _SearchBase2);

  function SearchCurrentWord() {
    _classCallCheck(this, SearchCurrentWord);

    _get(Object.getPrototypeOf(SearchCurrentWord.prototype), 'constructor', this).apply(this, arguments);

    this.caseSensitivityKind = 'SearchCurrentWord';
  }

  _createClass(SearchCurrentWord, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      if (this.input == null) {
        var wordRange = this.getCurrentWordBufferRange();
        if (wordRange) {
          this.editor.setCursorBufferPosition(wordRange.start);
          this.input = this.editor.getTextInBufferRange(wordRange);
        } else {
          this.input = '';
        }
      }

      _get(Object.getPrototypeOf(SearchCurrentWord.prototype), 'moveCursor', this).call(this, cursor);
    }
  }, {
    key: 'getPattern',
    value: function getPattern(term) {
      var escaped = this._.escapeRegExp(term);
      var source = /\W/.test(term) ? escaped + '\\b' : '\\b' + escaped + '\\b';
      return new RegExp(source, this.isCaseSensitive(term) ? 'g' : 'gi');
    }
  }, {
    key: 'getCurrentWordBufferRange',
    value: function getCurrentWordBufferRange() {
      var cursor = this.editor.getLastCursor();
      var point = cursor.getBufferPosition();

      var nonWordCharacters = this.utils.getNonWordCharactersForCursor(cursor);
      var regex = new RegExp('[^\\s' + this._.escapeRegExp(nonWordCharacters) + ']+', 'g');
      var options = { from: [point.row, 0], allowNextLine: false };
      return this.findInEditor('forward', regex, options, function (_ref2) {
        var range = _ref2.range;
        return range.end.isGreaterThan(point) && range;
      });
    }
  }]);

  return SearchCurrentWord;
})(SearchBase);

var SearchCurrentWordBackwards = (function (_SearchCurrentWord) {
  _inherits(SearchCurrentWordBackwards, _SearchCurrentWord);

  function SearchCurrentWordBackwards() {
    _classCallCheck(this, SearchCurrentWordBackwards);

    _get(Object.getPrototypeOf(SearchCurrentWordBackwards.prototype), 'constructor', this).apply(this, arguments);

    this.backwards = true;
  }

  return SearchCurrentWordBackwards;
})(SearchCurrentWord);

module.exports = {
  SearchBase: SearchBase,
  Search: Search,
  SearchBackwards: SearchBackwards,
  SearchCurrentWord: SearchCurrentWord,
  SearchCurrentWordBackwards: SearchCurrentWordBackwards
};
// ['start' or 'end']
// ['start' or 'end']
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmRvdGZpbGVzL2F0b20uc3ltbGluay9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9tb3Rpb24tc2VhcmNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7OztBQUVYLElBQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBOztlQUM1QixPQUFPLENBQUMsVUFBVSxDQUFDOztJQUE3QixNQUFNLFlBQU4sTUFBTTs7SUFFUCxVQUFVO1lBQVYsVUFBVTs7V0FBVixVQUFVOzBCQUFWLFVBQVU7OytCQUFWLFVBQVU7O1NBRWQsSUFBSSxHQUFHLElBQUk7U0FDWCxTQUFTLEdBQUcsS0FBSztTQUNqQixTQUFTLEdBQUcsSUFBSTtTQUNoQixZQUFZLEdBQUcsSUFBSTtTQUNuQixtQkFBbUIsR0FBRyxPQUFPO1NBQzdCLGFBQWEsR0FBRyxJQUFJO1NBQ3BCLHVCQUF1QixHQUFHLElBQUk7Ozs7OztlQVIxQixVQUFVOztXQVVGLHVCQUFHO0FBQ2IsYUFBTyxJQUFJLENBQUMsU0FBUyxDQUFBO0tBQ3RCOzs7V0FFVSxzQkFBRztBQUNaLGlDQWZFLFVBQVUsNENBZU07QUFDbEIsVUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUE7S0FDMUI7OztXQUVtQiwrQkFBRztBQUNyQixhQUFPLElBQUksY0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLENBQUE7S0FDMUY7OztXQUVVLHNCQUFHOzs7QUFDWixVQUFJLENBQUMsb0JBQW9CLENBQUM7ZUFBTSxNQUFLLE1BQU0sRUFBRTtPQUFBLENBQUMsQ0FBQTtBQUM5QyxpQ0F6QkUsVUFBVSw0Q0F5Qk07S0FDbkI7OztXQUVRLG9CQUFHO0FBQ1YsYUFBTywyQkE3QkwsVUFBVSw2Q0E2QmUsSUFBSSxDQUFDLFdBQVcsRUFBRSxH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QUMsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFDLENBQUE7QUFDNUQsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFVBQUMsS0FBTztZQUFOLEtBQUssR0FBTixLQUFPLENBQU4sS0FBSztlQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUs7T0FBQSxDQUFDLENBQUE7S0FDMUc7OztTQS9CRyxpQkFBaUI7R0FBUyxVQUFVOztJQWtDcEMsMEJBQTBCO1lBQTFCLDBCQUEwQjs7V0FBMUIsMEJBQTBCOzBCQUExQiwwQkFBMEI7OytCQUExQiwwQkFBMEI7O1NBQzlCLFNBQVMsR0FBRyxJQUFJOzs7U0FEWiwwQkFBMEI7R0FBUyxpQkFBaUI7O0FBSTFELE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixZQUFVLEVBQVYsVUFBVTtBQUNWLFFBQU0sRUFBTixNQUFNO0FBQ04saUJBQWUsRUFBZixlQUFlO0FBQ2YsbUJBQWlCLEVBQWpCLGlCQUFpQjtBQUNqQiw0QkFBMEIsRUFBMUIsMEJBQTBCO0NBQzNCLENBQUEiLCJmaWxlIjoiL1VzZXJzL3NoYW5ub25iZXJ0dWNjaS8uZG90ZmlsZXMvYXRvbS5zeW1saW5rL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi1zZWFyY2guanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5jb25zdCBTZWFyY2hNb2RlbCA9IHJlcXVpcmUoJy4vc2VhcmNoLW1vZGVsJylcbmNvbnN0IHtNb3Rpb259ID0gcmVxdWlyZSgnLi9tb3Rpb24nKVxuXG5jbGFzcyBTZWFyY2hCYXNlIGV4dGVuZHMgTW90aW9uIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBqdW1wID0gdHJ1ZVxuICBiYWNrd2FyZHMgPSBmYWxzZVxuICB1c2VSZWdleHAgPSB0cnVlXG4gIGxhbmRpbmdQb2ludCA9IG51bGwgLy8gWydzdGFydCcgb3IgJ2VuZCddXG4gIGRlZmF1bHRMYW5kaW5nUG9pbnQgPSAnc3RhcnQnIC8vIFsnc3RhcnQnIG9yICdlbmQnXVxuICByZWxhdGl2ZUluZGV4ID0gbnVsbFxuICB1cGRhdGVsYXN0U2VhcmNoUGF0dGVybiA9IHRydWVcblxuICBpc0JhY2t3YXJkcyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuYmFja3dhcmRzXG4gIH1cblxuICByZXNldFN0YXRlICgpIHtcbiAgICBzdXBlci5yZXNldFN0YXRlKClcbiAgICB0aGlzLnJlbGF0aXZlSW5kZXggPSBudWxsXG4gIH1cblxuICBpc0luY3JlbWVudGFsU2VhcmNoICgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnN0YW5jZW9mKCdTZWFyY2gnKSAmJiAhdGhpcy5yZXBlYXRlZCAmJiB0aGlzLmdldENvbmZpZygnaW5jcmVtZW50YWxTZWFyY2gnKVxuICB9XG5cbiAgaW5pdGlhbGl6ZSAoKSB7XG4gICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB0aGlzLmZpbmlzaCgpKVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZ2V0Q291bnQgKCkge1xuICAgIHJldHVybiBzdXBlci5nZXRDb3VudCgpICogKHRoaXMuaXNCYWNrd2FyZHMoKSA/IC0xIDogMSlcbiAgfVxuXG4gIGZpbmlzaCAoKSB7XG4gICAgaWYgKHRoaXMuaXNJbmNyZW1lbnRhbFNlYXJjaCgpICYmIHRoaXMuZ2V0Q29uZmlnKCdzaG93SG92ZXJTZWFyY2hDb3VudGVyJykpIHtcbiAgICAgIHRoaXMudmltU3RhdGUuaG92ZXJTZWFyY2hDb3VudGVyLnJlc2V0KClcbiAgICB9XG4gICAgaWYgKHRoaXMuc2VhcmNoTW9kZWwpIHRoaXMuc2VhcmNoTW9kZWwuZGVzdHJveSgpXG5cbiAgICB0aGlzLnJlbGF0aXZlSW5kZXggPSBudWxsXG4gICAgdGhpcy5zZWFyY2hNb2RlbCA9IG51bGxcbiAgfVxuXG4gIGdldExhbmRpbmdQb2ludCAoKSB7XG4gICAgaWYgKCF0aGlzLmxhbmRpbmdQb2ludCkgdGhpcy5sYW5kaW5nUG9pbnQgPSB0aGlzLmRlZmF1bHRMYW5kaW5nUG9pbnRcbiAgICByZXR1cm4gdGhpcy5sYW5kaW5nUG9pbnRcbiAgfVxuXG4gIGdldFBvaW50IChjdXJzb3IpIHtcbiAgICBpZiAodGhpcy5zZWFyY2hNb2RlbCkge1xuICAgICAgdGhpcy5yZWxhdGl2ZUluZGV4ID0gdGhpcy5nZXRDb3VudCgpICsgdGhpcy5zZWFyY2hNb2RlbC5nZXRSZWxhdGl2ZUluZGV4KClcbiAgICB9IGVsc2UgaWYgKHRoaXMucmVsYXRpdmVJbmRleCA9PSBudWxsKSB7XG4gICAgICB0aGlzLnJlbGF0aXZlSW5kZXggPSB0aGlzLmdldENvdW50KClcbiAgICB9XG5cbiAgICBjb25zdCByYW5nZSA9IHRoaXMuc2VhcmNoKGN1cnNvciwgdGhpcy5pbnB1dCwgdGhpcy5yZWxhdGl2ZUluZGV4KVxuXG4gICAgdGhpcy5zZWFyY2hNb2RlbC5kZXN0cm95KClcbiAgICB0aGlzLnNlYXJjaE1vZGVsID0gbnVsbFxuXG4gICAgaWYgKHJhbmdlKSByZXR1cm4gcmFuZ2VbdGhpcy5nZXRMYW5kaW5nUG9pbnQoKV1cbiAgfVxuXG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIGlmICghdGhpcy5pbnB1dCkgcmV0dXJuXG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50KGN1cnNvcilcblxuICAgIGlmIChwb2ludCkge1xuICAgICAgaWYgKHRoaXMucmVzdG9yZUVkaXRvclN0YXRlKSB7XG4gICAgICAgIHRoaXMucmVzdG9yZUVkaXRvclN0YXRlKHthbmNob3JQb3NpdGlvbjogcG9pbnQsIHNraXBSb3c6IHBvaW50LnJvd30pXG4gICAgICAgIHRoaXMucmVzdG9yZUVkaXRvclN0YXRlID0gbnVsbCAvLyBIQUNLOiBkb250IHJlZm9sZCBvbiBgbmAsIGBOYCByZXBlYXRcbiAgICAgIH1cbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludCwge2F1dG9zY3JvbGw6IGZhbHNlfSlcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMucmVwZWF0ZWQpIHtcbiAgICAgIHRoaXMuZ2xvYmFsU3RhdGUuc2V0KCdjdXJyZW50U2VhcmNoJywgdGhpcylcbiAgICAgIHRoaXMudmltU3RhdGUuc2VhcmNoSGlzdG9yeS5zYXZlKHRoaXMuaW5wdXQpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMudXBkYXRlbGFzdFNlYXJjaFBhdHRlcm4pIHtcbiAgICAgIHRoaXMuZ2xvYmFsU3RhdGUuc2V0KCdsYXN0U2VhcmNoUGF0dGVybicsIHRoaXMuZ2V0UGF0dGVybih0aGlzLmlucHV0KSlcbiAgICB9XG4gIH1cblxuICBnZXRTZWFyY2hNb2RlbCAoKSB7XG4gICAgaWYgKCF0aGlzLnNlYXJjaE1vZGVsKSB7XG4gICAgICB0aGlzLnNlYXJjaE1vZGVsID0gbmV3IFNlYXJjaE1vZGVsKHRoaXMudmltU3RhdGUsIHtpbmNyZW1lbnRhbFNlYXJjaDogdGhpcy5pc0luY3JlbWVudGFsU2VhcmNoKCl9KVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zZWFyY2hNb2RlbFxuICB9XG5cbiAgc2VhcmNoIChjdXJzb3IsIGlucHV0LCByZWxhdGl2ZUluZGV4KSB7XG4gICAgY29uc3Qgc2VhcmNoTW9kZWwgPSB0aGlzLmdldFNlYXJjaE1vZGVsKClcbiAgICBpZiAoaW5wdXQpIHtcbiAgICAgIGNvbnN0IGZyb21Qb2ludCA9IHRoaXMuZ2V0QnVmZmVyUG9zaXRpb25Gb3JDdXJzb3IoY3Vyc29yKVxuICAgICAgcmV0dXJuIHNlYXJjaE1vZGVsLnNlYXJjaChmcm9tUG9pbnQsIHRoaXMuZ2V0UGF0dGVybihpbnB1dCksIHJlbGF0aXZlSW5kZXgpXG4gICAgfVxuICAgIHRoaXMudmltU3RhdGUuaG92ZXJTZWFyY2hDb3VudGVyLnJlc2V0KClcbiAgICBzZWFyY2hNb2RlbC5jbGVhck1hcmtlcnMoKVxuICB9XG59XG5cbi8vIC8sID9cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFNlYXJjaCBleHRlbmRzIFNlYXJjaEJhc2Uge1xuICBjYXNlU2Vuc2l0aXZpdHlLaW5kID0gJ1NlYXJjaCdcbiAgcmVxdWlyZUlucHV0ID0gdHJ1ZVxuXG4gIGluaXRpYWxpemUgKCkge1xuICAgIGlmICh0aGlzLmlzSW5jcmVtZW50YWxTZWFyY2goKSkge1xuICAgICAgdGhpcy5yZXN0b3JlRWRpdG9yU3RhdGUgPSB0aGlzLnV0aWxzLnNhdmVFZGl0b3JTdGF0ZSh0aGlzLmVkaXRvcilcbiAgICAgIHRoaXMub25EaWRDb21tYW5kU2VhcmNoKHRoaXMuaGFuZGxlQ29tbWFuZEV2ZW50LmJpbmQodGhpcykpXG4gICAgfVxuXG4gICAgdGhpcy5vbkRpZENvbmZpcm1TZWFyY2godGhpcy5oYW5kbGVDb25maXJtU2VhcmNoLmJpbmQodGhpcykpXG4gICAgdGhpcy5vbkRpZENhbmNlbFNlYXJjaCh0aGlzLmhhbmRsZUNhbmNlbFNlYXJjaC5iaW5kKHRoaXMpKVxuICAgIHRoaXMub25EaWRDaGFuZ2VTZWFyY2godGhpcy5oYW5kbGVDaGFuZ2VTZWFyY2guYmluZCh0aGlzKSlcblxuICAgIHRoaXMuZm9jdXNTZWFyY2hJbnB1dEVkaXRvcigpXG5cbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGZvY3VzU2VhcmNoSW5wdXRFZGl0b3IgKCkge1xuICAgIGNvbnN0IGNsYXNzTGlzdCA9IHRoaXMuaXNCYWNrd2FyZHMoKSA/IFsnYmFja3dhcmRzJ10gOiBbXVxuICAgIHRoaXMudmltU3RhdGUuc2VhcmNoSW5wdXQuZm9jdXMoe2NsYXNzTGlzdH0pXG4gIH1cblxuICBoYW5kbGVDb21tYW5kRXZlbnQgKGV2ZW50KSB7XG4gICAgaWYgKCFldmVudC5pbnB1dCkgcmV0dXJuXG5cbiAgICBpZiAoZXZlbnQubmFtZSA9PT0gJ3Zpc2l0Jykge1xuICAgICAgbGV0IHtkaXJlY3Rpb259ID0gZXZlbnRcbiAgICAgIGlmICh0aGlzLmlzQmFja3dhcmRzKCkgJiYgdGhpcy5nZXRDb25maWcoJ2luY3JlbWVudGFsU2VhcmNoVmlzaXREaXJlY3Rpb24nKSA9PT0gJ3JlbGF0aXZlJykge1xuICAgICAgICBkaXJlY3Rpb24gPSBkaXJlY3Rpb24gPT09ICduZXh0JyA/ICdwcmV2JyA6ICduZXh0J1xuICAgICAgfVxuICAgICAgdGhpcy5nZXRTZWFyY2hNb2RlbCgpLnZpc2l0KGRpcmVjdGlvbiA9PT0gJ25leHQnID8gKzEgOiAtMSlcbiAgICB9IGVsc2UgaWYgKGV2ZW50Lm5hbWUgPT09ICdvY2N1cnJlbmNlJykge1xuICAgICAgY29uc3Qge29wZXJhdGlvbiwgaW5wdXR9ID0gZXZlbnRcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybih0aGlzLmdldFBhdHRlcm4oaW5wdXQpLCB7cmVzZXQ6IG9wZXJhdGlvbiAhPSBudWxsfSlcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuc2F2ZUxhc3RQYXR0ZXJuKClcblxuICAgICAgdGhpcy52aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LnNhdmUoaW5wdXQpXG4gICAgICB0aGlzLnZpbVN0YXRlLnNlYXJjaElucHV0LmNhbmNlbCgpXG4gICAgICBpZiAob3BlcmF0aW9uICE9IG51bGwpIHRoaXMudmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKG9wZXJhdGlvbilcbiAgICB9IGVsc2UgaWYgKGV2ZW50Lm5hbWUgPT09ICdwcm9qZWN0LWZpbmQnKSB7XG4gICAgICB0aGlzLnZpbVN0YXRlLnNlYXJjaEhpc3Rvcnkuc2F2ZShldmVudC5pbnB1dClcbiAgICAgIHRoaXMudmltU3RhdGUuc2VhcmNoSW5wdXQuY2FuY2VsKClcbiAgICAgIHRoaXMudXRpbHMuc2VhcmNoQnlQcm9qZWN0RmluZCh0aGlzLmVkaXRvciwgZXZlbnQuaW5wdXQpXG4gICAgfVxuICB9XG5cbiAgaGFuZGxlQ2FuY2VsU2VhcmNoICgpIHtcbiAgICBpZiAoIVsndmlzdWFsJywgJ2luc2VydCddLmluY2x1ZGVzKHRoaXMubW9kZSkpIHRoaXMudmltU3RhdGUucmVzZXROb3JtYWxNb2RlKClcblxuICAgIGlmICh0aGlzLnJlc3RvcmVFZGl0b3JTdGF0ZSkgdGhpcy5yZXN0b3JlRWRpdG9yU3RhdGUoKVxuICAgIHRoaXMudmltU3RhdGUucmVzZXQoKVxuICAgIHRoaXMuZmluaXNoKClcbiAgfVxuXG4gIGlzU2VhcmNoUmVwZWF0Q2hhcmFjdGVyIChjaGFyKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNJbmNyZW1lbnRhbFNlYXJjaCgpID8gY2hhciA9PT0gJycgOiBbJycsIHRoaXMuaXNCYWNrd2FyZHMoKSA/ICc/JyA6ICcvJ10uaW5jbHVkZXMoY2hhcikgLy8gZW1wdHkgY29uZmlybSBvciBpbnZva2luZy1jaGFyXG4gIH1cblxuICBoYW5kbGVDb25maXJtU2VhcmNoICh7aW5wdXQsIGxhbmRpbmdQb2ludH0pIHtcbiAgICB0aGlzLmlucHV0ID0gaW5wdXRcbiAgICB0aGlzLmxhbmRpbmdQb2ludCA9IGxhbmRpbmdQb2ludFxuICAgIGlmICh0aGlzLmlzU2VhcmNoUmVwZWF0Q2hhcmFjdGVyKHRoaXMuaW5wdXQpKSB7XG4gICAgICB0aGlzLmlucHV0ID0gdGhpcy52aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LmdldCgncHJldicpXG4gICAgICBpZiAoIXRoaXMuaW5wdXQpIGF0b20uYmVlcCgpXG4gICAgfVxuICAgIHRoaXMucHJvY2Vzc09wZXJhdGlvbigpXG4gIH1cblxuICBoYW5kbGVDaGFuZ2VTZWFyY2ggKGlucHV0KSB7XG4gICAgLy8gSWYgaW5wdXQgc3RhcnRzIHdpdGggc3BhY2UsIHJlbW92ZSBmaXJzdCBzcGFjZSBhbmQgZGlzYWJsZSB1c2VSZWdleHAuXG4gICAgaWYgKGlucHV0LnN0YXJ0c1dpdGgoJyAnKSkge1xuICAgICAgLy8gRklYTUU6IFNvdWxkIEkgcmVtb3ZlIHRoaXMgdW5rbm93biBoYWNrIGFuZCBpbXBsZW1lbnQgdmlzaWJsZSBidXR0b24gdG8gdG9nbGUgcmVnZXhwP1xuICAgICAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKC9eIC8sICcnKVxuICAgICAgdGhpcy51c2VSZWdleHAgPSBmYWxzZVxuICAgIH1cbiAgICB0aGlzLnZpbVN0YXRlLnNlYXJjaElucHV0LnVwZGF0ZU9wdGlvblNldHRpbmdzKHt1c2VSZWdleHA6IHRoaXMudXNlUmVnZXhwfSlcblxuICAgIGlmICh0aGlzLmlzSW5jcmVtZW50YWxTZWFyY2goKSkge1xuICAgICAgdGhpcy5zZWFyY2godGhpcy5lZGl0b3IuZ2V0TGFzdEN1cnNvcigpLCBpbnB1dCwgdGhpcy5nZXRDb3VudCgpKVxuICAgIH1cbiAgfVxuXG4gIGdldFBhdHRlcm4gKHRlcm0pIHtcbiAgICBsZXQgbW9kaWZpZXJzID0gdGhpcy5pc0Nhc2VTZW5zaXRpdmUodGVybSkgPyAnZycgOiAnZ2knXG4gICAgLy8gRklYTUUgdGhpcyBwcmV2ZW50IHNlYXJjaCBcXFxcYyBpdHNlbGYuXG4gICAgLy8gRE9OVCB0aGlua2xlc3NseSBtaW1pYyBwdXJlIFZpbS4gSW5zdGVhZCwgcHJvdmlkZSBpZ25vcmVjYXNlIGJ1dHRvbiBhbmQgc2hvcnRjdXQuXG4gICAgaWYgKHRlcm0uaW5kZXhPZignXFxcXGMnKSA+PSAwKSB7XG4gICAgICB0ZXJtID0gdGVybS5yZXBsYWNlKCdcXFxcYycsICcnKVxuICAgICAgaWYgKCFtb2RpZmllcnMuaW5jbHVkZXMoJ2knKSkgbW9kaWZpZXJzICs9ICdpJ1xuICAgIH1cblxuICAgIGlmICh0aGlzLnVzZVJlZ2V4cCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAodGVybSwgbW9kaWZpZXJzKVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gICAgfVxuICAgIHJldHVybiBuZXcgUmVnRXhwKHRoaXMuXy5lc2NhcGVSZWdFeHAodGVybSksIG1vZGlmaWVycylcbiAgfVxufVxuXG5jbGFzcyBTZWFyY2hCYWNrd2FyZHMgZXh0ZW5kcyBTZWFyY2gge1xuICBiYWNrd2FyZHMgPSB0cnVlXG59XG5cbi8vICosICNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFNlYXJjaEN1cnJlbnRXb3JkIGV4dGVuZHMgU2VhcmNoQmFzZSB7XG4gIGNhc2VTZW5zaXRpdml0eUtpbmQgPSAnU2VhcmNoQ3VycmVudFdvcmQnXG5cbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgaWYgKHRoaXMuaW5wdXQgPT0gbnVsbCkge1xuICAgICAgY29uc3Qgd29yZFJhbmdlID0gdGhpcy5nZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlKClcbiAgICAgIGlmICh3b3JkUmFuZ2UpIHtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24od29yZFJhbmdlLnN0YXJ0KVxuICAgICAgICB0aGlzLmlucHV0ID0gdGhpcy5lZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2Uod29yZFJhbmdlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5pbnB1dCA9ICcnXG4gICAgICB9XG4gICAgfVxuXG4gICAgc3VwZXIubW92ZUN1cnNvcihjdXJzb3IpXG4gIH1cblxuICBnZXRQYXR0ZXJuICh0ZXJtKSB7XG4gICAgY29uc3QgZXNjYXBlZCA9IHRoaXMuXy5lc2NhcGVSZWdFeHAodGVybSlcbiAgICBjb25zdCBzb3VyY2UgPSAvXFxXLy50ZXN0KHRlcm0pID8gYCR7ZXNjYXBlZH1cXFxcYmAgOiBgXFxcXGIke2VzY2FwZWR9XFxcXGJgXG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoc291cmNlLCB0aGlzLmlzQ2FzZVNlbnNpdGl2ZSh0ZXJtKSA/ICdnJyA6ICdnaScpXG4gIH1cblxuICBnZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlICgpIHtcbiAgICBjb25zdCBjdXJzb3IgPSB0aGlzLmVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICBjb25zdCBwb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgICBjb25zdCBub25Xb3JkQ2hhcmFjdGVycyA9IHRoaXMudXRpbHMuZ2V0Tm9uV29yZENoYXJhY3RlcnNGb3JDdXJzb3IoY3Vyc29yKVxuICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgW15cXFxccyR7dGhpcy5fLmVzY2FwZVJlZ0V4cChub25Xb3JkQ2hhcmFjdGVycyl9XStgLCAnZycpXG4gICAgY29uc3Qgb3B0aW9ucyA9IHtmcm9tOiBbcG9pbnQucm93LCAwXSwgYWxsb3dOZXh0TGluZTogZmFsc2V9XG4gICAgcmV0dXJuIHRoaXMuZmluZEluRWRpdG9yKCdmb3J3YXJkJywgcmVnZXgsIG9wdGlvbnMsICh7cmFuZ2V9KSA9PiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihwb2ludCkgJiYgcmFuZ2UpXG4gIH1cbn1cblxuY2xhc3MgU2VhcmNoQ3VycmVudFdvcmRCYWNrd2FyZHMgZXh0ZW5kcyBTZWFyY2hDdXJyZW50V29yZCB7XG4gIGJhY2t3YXJkcyA9IHRydWVcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFNlYXJjaEJhc2UsXG4gIFNlYXJjaCxcbiAgU2VhcmNoQmFja3dhcmRzLFxuICBTZWFyY2hDdXJyZW50V29yZCxcbiAgU2VhcmNoQ3VycmVudFdvcmRCYWNrd2FyZHNcbn1cbiJdfQ==