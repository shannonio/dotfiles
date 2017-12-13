(function() {
  var BreadcrumbView;

  BreadcrumbView = require('./breadcrumb-view');

  module.exports = {
    breadcrumbView: null,
    configDefaults: {
      scrollToLastItem: true
    },
    activate: function(state) {
      if (atom.workspaceView.find('.tree-view')) {
        return this.breadcrumbView = new BreadcrumbView(state.breadcrumbState);
      }
    },
    deactivate: function() {
      var _ref;
      return (_ref = this.breadcrumbView) != null ? _ref.destroy() : void 0;
    },
    serialize: function() {
      var _ref;
      return {
        breadcrumbState: (_ref = this.breadcrumbView) != null ? _ref.serialize() : void 0
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGNBQUE7O0FBQUEsRUFBQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxtQkFBUixDQUFqQixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsY0FBQSxFQUFnQixJQUFoQjtBQUFBLElBQ0EsY0FBQSxFQUNFO0FBQUEsTUFBQSxnQkFBQSxFQUFrQixJQUFsQjtLQUZGO0FBQUEsSUFJQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixNQUFBLElBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFuQixDQUF3QixZQUF4QixDQUFIO2VBQ0UsSUFBQyxDQUFBLGNBQUQsR0FBc0IsSUFBQSxjQUFBLENBQWUsS0FBSyxDQUFDLGVBQXJCLEVBRHhCO09BRFE7SUFBQSxDQUpWO0FBQUEsSUFRQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1YsVUFBQSxJQUFBO3dEQUFlLENBQUUsT0FBakIsQ0FBQSxXQURVO0lBQUEsQ0FSWjtBQUFBLElBV0EsU0FBQSxFQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsSUFBQTthQUFBO0FBQUEsUUFBQSxlQUFBLDZDQUFnQyxDQUFFLFNBQWpCLENBQUEsVUFBakI7UUFEUztJQUFBLENBWFg7R0FIRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/Shannon/.dotfiles/atom.symlink/packages/tree-view-breadcrumb/lib/tree-view-breadcrumb.coffee