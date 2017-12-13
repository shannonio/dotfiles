(function() {
  var path;

  path = require('path');

  module.exports = {
    configDefaults: {
      hideVcsIgnoredFiles: false,
      hideIgnoredNames: false,
      showOnRightSide: false
    },
    treeView: null,
    activate: function(state) {
      var _base;
      this.state = state;
      if (this.shouldAttach()) {
        if ((_base = this.state).attached == null) {
          _base.attached = true;
        }
      }
      if (this.state.attached) {
        this.createView();
      }
      atom.workspaceView.command('tree-view:show', (function(_this) {
        return function() {
          return _this.createView().show();
        };
      })(this));
      atom.workspaceView.command('tree-view:toggle', (function(_this) {
        return function() {
          return _this.createView().toggle();
        };
      })(this));
      atom.workspaceView.command('tree-view:toggle-focus', (function(_this) {
        return function() {
          return _this.createView().toggleFocus();
        };
      })(this));
      atom.workspaceView.command('tree-view:reveal-active-file', (function(_this) {
        return function() {
          return _this.createView().revealActiveFile();
        };
      })(this));
      atom.workspaceView.command('tree-view:toggle-side', (function(_this) {
        return function() {
          return _this.createView().toggleSide();
        };
      })(this));
      atom.workspaceView.command('tree-view:add-file', (function(_this) {
        return function() {
          return _this.createView().add(true);
        };
      })(this));
      atom.workspaceView.command('tree-view:add-folder', (function(_this) {
        return function() {
          return _this.createView().add(false);
        };
      })(this));
      atom.workspaceView.command('tree-view:duplicate', (function(_this) {
        return function() {
          return _this.createView().copySelectedEntry();
        };
      })(this));
      return atom.workspaceView.command('tree-view:remove', (function(_this) {
        return function() {
          return _this.createView().removeSelectedEntries();
        };
      })(this));
    },
    deactivate: function() {
      var _ref;
      if ((_ref = this.treeView) != null) {
        _ref.deactivate();
      }
      return this.treeView = null;
    },
    serialize: function() {
      if (this.treeView != null) {
        return this.treeView.serialize();
      } else {
        return this.state;
      }
    },
    createView: function() {
      var TreeView;
      if (this.treeView == null) {
        TreeView = require('./tree-view');
        this.treeView = new TreeView(this.state);
      }
      return this.treeView;
    },
    shouldAttach: function() {
      if (atom.workspace.getActivePaneItem()) {
        return false;
      } else if (path.basename(atom.project.getPath()) === '.git') {
        return atom.project.getPath() === atom.getLoadSettings().pathToOpen;
      } else {
        return true;
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLElBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsY0FBQSxFQUNFO0FBQUEsTUFBQSxtQkFBQSxFQUFxQixLQUFyQjtBQUFBLE1BQ0EsZ0JBQUEsRUFBa0IsS0FEbEI7QUFBQSxNQUVBLGVBQUEsRUFBaUIsS0FGakI7S0FERjtBQUFBLElBS0EsUUFBQSxFQUFVLElBTFY7QUFBQSxJQU9BLFFBQUEsRUFBVSxTQUFFLEtBQUYsR0FBQTtBQUNSLFVBQUEsS0FBQTtBQUFBLE1BRFMsSUFBQyxDQUFBLFFBQUEsS0FDVixDQUFBO0FBQUEsTUFBQSxJQUEyQixJQUFDLENBQUEsWUFBRCxDQUFBLENBQTNCOztlQUFNLENBQUMsV0FBWTtTQUFuQjtPQUFBO0FBRUEsTUFBQSxJQUFpQixJQUFDLENBQUEsS0FBSyxDQUFDLFFBQXhCO0FBQUEsUUFBQSxJQUFDLENBQUEsVUFBRCxDQUFBLENBQUEsQ0FBQTtPQUZBO0FBQUEsTUFHQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLGdCQUEzQixFQUE2QyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxVQUFELENBQUEsQ0FBYSxDQUFDLElBQWQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0MsQ0FIQSxDQUFBO0FBQUEsTUFJQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLGtCQUEzQixFQUErQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxVQUFELENBQUEsQ0FBYSxDQUFDLE1B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
//# sourceURL=/Users/Shannon/.dotfiles/atom.symlink/packages/tree-view/lib/tree.coffee