(function() {
  var AngularjsView;

  AngularjsView = require('./angularjs-view');

  module.exports = {
    angularjsView: null,
    activate: function(state) {
      return this.angularjsView = new AngularjsView(state.angularjsViewState);
    },
    deactivate: function() {
      return this.angularjsView.destroy();
    },
    serialize: function() {
      return {
        angularjsViewState: this.angularjsView.serialize()
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGFBQUE7O0FBQUEsRUFBQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUixDQUFoQixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsYUFBQSxFQUFlLElBQWY7QUFBQSxJQUVBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTthQUNSLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsYUFBQSxDQUFjLEtBQUssQ0FBQyxrQkFBcEIsRUFEYjtJQUFBLENBRlY7QUFBQSxJQUtBLFVBQUEsRUFBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxFQURVO0lBQUEsQ0FMWjtBQUFBLElBUUEsU0FBQSxFQUFXLFNBQUEsR0FBQTthQUNUO0FBQUEsUUFBQSxrQkFBQSxFQUFvQixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQWYsQ0FBQSxDQUFwQjtRQURTO0lBQUEsQ0FSWDtHQUhGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/shannon/.dotfiles/atom.symlink/packages/angularjs/lib/angularjs.coffee