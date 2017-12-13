(function() {
  var $, $$$, ChildProcess, EditorView, RSpecView, ScrollView, TextFormatter, path, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), $ = _ref.$, $$$ = _ref.$$$, EditorView = _ref.EditorView, ScrollView = _ref.ScrollView;

  path = require('path');

  ChildProcess = require('child_process');

  TextFormatter = require('./text-formatter');

  module.exports = RSpecView = (function(_super) {
    __extends(RSpecView, _super);

    atom.deserializers.add(RSpecView);

    RSpecView.deserialize = function(_arg) {
      var filePath;
      filePath = _arg.filePath;
      return new RSpecView(filePath);
    };

    RSpecView.content = function() {
      return this.div({
        "class": 'rspec rspec-console',
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'rspec-spinner'
          }, 'Starting RSpec...');
          return _this.pre({
            "class": 'rspec-output'
          });
        };
      })(this));
    };

    RSpecView.prototype.initialize = function() {
      RSpecView.__super__.initialize.apply(this, arguments);
      return this.on({
        'core:copy': (function(_this) {
          return function() {
            return _this.copySelectedText();
          };
        })(this)
      });
    };

    function RSpecView(filePath) {
      this.onClose = __bind(this.onClose, this);
      this.onStdErr = __bind(this.onStdErr, this);
      this.onStdOut = __bind(this.onStdOut, this);
      this.addOutput = __bind(this.addOutput, this);
      this.terminalClicked = __bind(this.terminalClicked, this);
      RSpecView.__super__.constructor.apply(this, arguments);
      console.log("File path:", filePath);
      this.filePath = filePath;
      this.output = this.find(".rspec-output");
      this.spinner = this.find(".rspec-spinner");
      this.output.on("click", this.terminalClicked);
    }

    RSpecView.prototype.serialize = function() {
      return {
        deserializer: 'RSpecView',
        filePath: this.getPath()
      };
    };

    RSpecView.prototype.copySelectedText = function() {
      var text;
      text = window.getSelection().toString();
      if (text === '') {
        return;
      }
      return atom.clipboard.write(text);
    };

    RSpecView.prototype.getTitle = function() {
      return "RSpec - " + (path.basename(this.getPath()));
    };

    RSpecView.prototype.getURI = function() {
      return "rspec-output://" + (this.getPath());
    };

    RSpecView.prototype.getPath = function() {
      return this.filePath;
    };

    RSpecView.prototype.showError = function(result) {
      var failureMessage;
      failureMessage = "The error message";
      return this.html($$$(function() {
        this.h2('Running RSpec Failed');
        if (failureMessage != null) {
          return this.h3(failureMessage);
        }
      }));
    };

    RSpecView.prototype.terminalClicked = function(e) {
      var file, line, promise, _ref1;
      if ((_ref1 = e.target) != null ? _ref1.href : void 0) {
        line = $(e.target).data('line');
        file = $(e.target).data('file');
        console.log(file);
        file = "" + (atom.project.getPaths()[0]) + "/" + file;
        promise = atom.workspace.open(file, {
          searchAllPanes: true,
          initialLine: line
        });
        return promise.done(function(editor) {
          return editor.setCursorBufferPosition([line - 1, 0]);
        });
      }
    };

    RSpecView.prototype.run = function(lineNumber) {
      var command, options, projectPath, spawn, specCommand, terminal;
      if (atom.config.get("rspec.save_before_run")) {
        atom.workspace.saveAll();
      }
      this.spinner.show();
      this.output.empty();
      projectPath = atom.project.getPaths()[0];
      spawn = ChildProcess.spawn;
      specCommand = atom.config.get("rspec.command");
      options = " --tty";
      if (atom.config.get("rspec.force_colored_results")) {
        options += " --color";
      }
      command = "" + specCommand + " " + options + " " + this.filePath;
      if (lineNumber) {
        command = "" + command + ":" + lineNumber;
      }
      console.log("[RSpec] running: " + command);
      terminal = spawn("bash", ["-l"]);
      terminal.on('close', this.onClose);
      terminal.stdout.on('data', this.onStdOut);
      terminal.stderr.on('data', this.onStdErr);
      terminal.stdin.write("cd " + projectPath + " && " + command + "\n");
      return terminal.stdin.write("exit\n");
    };

    RSpecView.prototype.addOutput = function(output) {
      var formatter;
      formatter = new TextFormatter(output);
      output = formatter.htmlEscaped().colorized().fileLinked().text;
      this.spinner.hide();
      this.output.append("" + output);
      return this.scrollTop(this[0].scrollHeight);
    };

    RSpecView.prototype.onStdOut = function(data) {
      return this.addOutput(data);
    };

    RSpecView.prototype.onStdErr = function(data) {
      return this.addOutput(data);
    };

    RSpecView.prototype.onClose = function(code) {
      return console.log("[RSpec] exit with code: " + code);
    };

    return RSpecView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3NoYW5ub25iZXJ0dWNjaS8uZG90ZmlsZXMvYXRvbS5zeW1saW5rL3BhY2thZ2VzL3JzcGVjL2xpYi9yc3BlYy12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrRkFBQTtJQUFBOzttU0FBQTs7QUFBQSxFQUFBLE9BQW1DLE9BQUEsQ0FBUSxzQkFBUixDQUFuQyxFQUFDLFNBQUEsQ0FBRCxFQUFJLFdBQUEsR0FBSixFQUFTLGtCQUFBLFVBQVQsRUFBcUIsa0JBQUEsVUFBckIsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxZQUFBLEdBQWdCLE9BQUEsQ0FBUSxlQUFSLENBRmhCLENBQUE7O0FBQUEsRUFHQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUixDQUhoQixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLGdDQUFBLENBQUE7O0FBQUEsSUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQW5CLENBQXVCLFNBQXZCLENBQUEsQ0FBQTs7QUFBQSxJQUVBLFNBQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxJQUFELEdBQUE7QUFDWixVQUFBLFFBQUE7QUFBQSxNQURjLFdBQUQsS0FBQyxRQUNkLENBQUE7YUFBSSxJQUFBLFNBQUEsQ0FBVSxRQUFWLEVBRFE7SUFBQSxDQUZkLENBQUE7O0FBQUEsSUFLQSxTQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxxQkFBUDtBQUFBLFFBQThCLFFBQUEsRUFBVSxDQUFBLENBQXhDO09BQUwsRUFBaUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUMvQyxVQUFBLEtB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

//# sourceURL=/Users/shannonbertucci/.dotfiles/atom.symlink/packages/rspec/lib/rspec-view.coffee
