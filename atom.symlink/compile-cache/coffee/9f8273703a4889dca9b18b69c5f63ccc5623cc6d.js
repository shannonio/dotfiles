(function() {
  var $, Dialog, EditorView, View, path, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), $ = _ref.$, EditorView = _ref.EditorView, View = _ref.View;

  path = require('path');

  module.exports = Dialog = (function(_super) {
    __extends(Dialog, _super);

    function Dialog() {
      return Dialog.__super__.constructor.apply(this, arguments);
    }

    Dialog.content = function(_arg) {
      var prompt;
      prompt = (_arg != null ? _arg : {}).prompt;
      return this.div({
        "class": 'tree-view-dialog overlay from-top'
      }, (function(_this) {
        return function() {
          _this.label(prompt, {
            "class": 'icon',
            outlet: 'promptText'
          });
          _this.subview('miniEditor', new EditorView({
            mini: true
          }));
          return _this.div({
            "class": 'error-message',
            outlet: 'errorMessage'
          });
        };
      })(this));
    };

    Dialog.prototype.initialize = function(_arg) {
      var baseName, extension, iconClass, initialPath, range, select, selectionEnd, _ref1;
      _ref1 = _arg != null ? _arg : {}, initialPath = _ref1.initialPath, select = _ref1.select, iconClass = _ref1.iconClass;
      if (iconClass) {
        this.promptText.addClass(iconClass);
      }
      this.on('core:confirm', (function(_this) {
        return function() {
          return _this.onConfirm(_this.miniEditor.getText());
        };
      })(this));
      this.on('core:cancel', (function(_this) {
        return function() {
          return _this.cancel();
        };
      })(this));
      this.miniEditor.hiddenInput.on('focusout', (function(_this) {
        return function() {
          return _this.remove();
        };
      })(this));
      this.miniEditor.getEditor().getBuffer().on('changed', (function(_this) {
        return function() {
          return _this.showError();
        };
      })(this));
      this.miniEditor.setText(initialPath);
      if (select) {
        extension = path.extname(initialPath);
        baseName = path.basename(initialPath);
        if (baseName === extension) {
          selectionEnd = initialPath.length;
        } else {
          selectionEnd = initialPath.length - extension.length;
        }
        range = [[0, initialPath.length - baseName.length], [0, selectionEnd]];
        return this.miniEditor.getEditor().setSelectedBufferRange(range);
      }
    };

    Dialog.prototype.attach = function() {
      atom.workspaceView.append(this);
      this.miniEditor.focus();
      return this.miniEditor.scrollToCursorPosition();
    };

    Dialog.prototype.close = function() {
      this.remove();
      return atom.workspaceView.focus();
    };

    Dialog.prototype.cancel = function() {
      this.remove();
      return $('.tree-view').focus();
    };

    Dialog.prototype.showError = function(message) {
      if (message == null) {
        message = '';
      }
      this.errorMessage.text(message);
      if (message) {
        return this.flashError();
      }
    };

    return Dialog;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUF3QixPQUFBLENBQVEsTUFBUixDQUF4QixFQUFDLFNBQUEsQ0FBRCxFQUFJLGtCQUFBLFVBQUosRUFBZ0IsWUFBQSxJQUFoQixDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiw2QkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxNQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsSUFBRCxHQUFBO0FBQ1IsVUFBQSxNQUFBO0FBQUEsTUFEVSx5QkFBRCxPQUFXLElBQVYsTUFDVixDQUFBO2FBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLG1DQUFQO09BQUwsRUFBaUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUMvQyxVQUFBLEtBQUMsQ0FBQSxLQUFELENBQU8sTUFBUCxFQUFlO0FBQUEsWUFBQSxPQUFBLEVBQU8sTUFBUDtBQUFBLFlBQWUsTUFBQSxFQUFRLFlBQXZCO1dBQWYsQ0FBQSxDQUFBO0FBQUEsVUFDQSxLQUFDLENBQUEsT0FBRCxDQUFTLFlBQVQsRUFBMkIsSUFBQSxVQUFBLENBQVc7QUFBQSxZQUFBLElBQUEsRUFBTSxJQUFOO1dBQVgsQ0FBM0IsQ0FEQSxDQUFBO2lCQUVBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxlQUFQO0FBQUEsWUFBd0IsTUFBQSxFQUFRLGNBQWhDO1dBQUwsRUFIK0M7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqRCxFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLHFCQU1BLFVB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
//# sourceURL=/Users/Shannon/.dotfiles/atom.symlink/packages/tree-view/lib/dialog.coffee