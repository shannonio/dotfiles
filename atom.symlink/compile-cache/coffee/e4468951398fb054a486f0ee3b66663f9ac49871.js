(function() {
  var RSpecView, url;

  url = require('url');

  RSpecView = require('./rspec-view');

  module.exports = {
    configDefaults: {
      command: "rspec",
      spec_directory: "spec",
      force_colored_results: true,
      save_before_run: false
    },
    activate: function(state) {
      if (state != null) {
        this.lastFile = state.lastFile;
        this.lastLine = state.lastLine;
      }
      atom.config.setDefaults("atom-rspec", {
        command: this.configDefaults.command,
        spec_directory: this.configDefaults.spec_directory,
        save_before_run: this.configDefaults.save_before_run,
        force_colored_results: this.configDefaults.force_colored_results
      });
      atom.commands.add('atom-workspace', {
        'rspec:run': (function(_this) {
          return function() {
            return _this.run();
          };
        })(this),
        'rspec:run-for-line': (function(_this) {
          return function() {
            return _this.runForLine();
          };
        })(this),
        'rspec:run-last': (function(_this) {
          return function() {
            return _this.runLast();
          };
        })(this),
        'rspec:run-all': (function(_this) {
          return function() {
            return _this.runAll();
          };
        })(this)
      });
      return atom.workspace.addOpener(function(uriToOpen) {
        var pathname, protocol, _ref;
        _ref = url.parse(uriToOpen), protocol = _ref.protocol, pathname = _ref.pathname;
        if (protocol !== 'rspec-output:') {
          return;
        }
        return new RSpecView(pathname);
      });
    },
    rspecView: null,
    deactivate: function() {
      return this.rspecView.destroy();
    },
    serialize: function() {
      return {
        rspecViewState: this.rspecView.serialize(),
        lastFile: this.lastFile,
        lastLine: this.lastLine
      };
    },
    openUriFor: function(file, lineNumber) {
      var previousActivePane, uri;
      this.lastFile = file;
      this.lastLine = lineNumber;
      previousActivePane = atom.workspace.getActivePane();
      uri = "rspec-output://" + file;
      return atom.workspace.open(uri, {
        split: 'right',
        activatePane: false,
        searchAllPanes: true
      }).done(function(rspecView) {
        if (rspecView instanceof RSpecView) {
          rspecView.run(lineNumber);
          return previousActivePane.activate();
        }
      });
    },
    runForLine: function() {
      var cursor, editor, line;
      console.log("Starting runForLine...");
      editor = atom.workspace.getActiveTextEditor();
      console.log("Editor", editor);
      if (editor == null) {
        return;
      }
      cursor = editor.getLastCursor();
      console.log("Cursor", cursor);
      line = cursor.getBufferRow() + 1;
      console.log("Line", line);
      return this.openUriFor(editor.getPath(), line);
    },
    runLast: function() {
      if (this.lastFile == null) {
        return;
      }
      return this.openUriFor(this.lastFile, this.lastLine);
    },
    run: function() {
      var editor;
      console.log("RUN");
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return;
      }
      return this.openUriFor(editor.getPath());
    },
    runAll: function() {
      var project;
      project = atom.project;
      if (project == null) {
        return;
      }
      return this.openUriFor(project.getPaths()[0] + "/" + atom.config.get("atom-rspec.spec_directory"), this.lastLine);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3NoYW5ub25iZXJ0dWNjaS8uZG90ZmlsZXMvYXRvbS5zeW1saW5rL3BhY2thZ2VzL3JzcGVjL2xpYi9yc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsY0FBQTs7QUFBQSxFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUixDQUFOLENBQUE7O0FBQUEsRUFFQSxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVIsQ0FGWixDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsY0FBQSxFQUNFO0FBQUEsTUFBQSxPQUFBLEVBQVMsT0FBVDtBQUFBLE1BQ0EsY0FBQSxFQUFnQixNQURoQjtBQUFBLE1BRUEscUJBQUEsRUFBdUIsSUFGdkI7QUFBQSxNQUdBLGVBQUEsRUFBaUIsS0FIakI7S0FERjtBQUFBLElBTUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FBQ1IsTUFBQSxJQUFHLGFBQUg7QUFDRSxRQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksS0FBSyxDQUFDLFFBQWxCLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxRQUFELEdBQVksS0FBSyxDQUFDLFFBRGxCLENBREY7T0FBQTtBQUFBLE1BSUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLFlBQXhCLEVBQ0U7QUFBQSxRQUFBLE9BQUEsRUFBdUIsSUFBQyxDQUFBLGNBQWMsQ0FBQyxPQUF2QztBQUFBLFFBQ0EsY0FBQSxFQUF1QixJQUFDLENBQUEsY0FBYyxDQUFDLGNBRHZDO0FBQUEsUUFFQSxlQUFBLEVBQXVCLElBQUMsQ0FBQSxjQUFjLENBQUMsZUFGdkM7QUFBQSxRQUdBLHFCQUFBLEVBQXVCLElBQUMsQ0FBQSxjQUFjLENBQUMscUJBSHZDO09BREYsQ0FKQSxDQUFBO0FBQUEsTUFVQSxJQUFJLENBQUMs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

//# sourceURL=/Users/shannonbertucci/.dotfiles/atom.symlink/packages/rspec/lib/rspec.coffee
