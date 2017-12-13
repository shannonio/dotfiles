(function() {
  var path;

  path = require('path');

  atom.workspaceView.eachEditorView(function(editorView) {
    var editor;
    editor = editorView.getEditor();
    if (path.extname(editor.getPath()) === '.md') {
      return editor.setSoftWrap(true);
    }
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLElBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBRUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFuQixDQUFrQyxTQUFDLFVBQUQsR0FBQTtBQUNoQyxRQUFBLE1BQUE7QUFBQSxJQUFBLE1BQUEsR0FBUyxVQUFVLENBQUMsU0FBWCxDQUFBLENBQVQsQ0FBQTtBQUNBLElBQUEsSUFBRyxJQUFJLENBQUMsT0FBTCxDQUFhLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBYixDQUFBLEtBQWtDLEtBQXJDO2FBQ0UsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsSUFBbkIsRUFERjtLQUZnQztFQUFBLENBQWxDLENBRkEsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/shannon/.dotfiles/atom.symlink/init.coffee