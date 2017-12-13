function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

// eslint-disable-next-line import/no-extraneous-dependencies, import/extensions

var _atom = require('atom');

// Dependencies
// NOTE: We are not directly requiring these in order to reduce the time it
// takes to require this file as that causes delays in Atom loading this package
'use babel';var path = undefined;
var helpers = undefined;
var workerHelpers = undefined;
var isConfigAtHomeRoot = undefined;

// Configuration
var scopes = [];
var showRule = undefined;
var lintHtmlFiles = undefined;
var ignoredRulesWhenModified = undefined;
var ignoredRulesWhenFixing = undefined;
var disableWhenNoEslintConfig = undefined;

// Internal variables
var idleCallbacks = new Set();

// Internal functions
var idsToIgnoredRules = function idsToIgnoredRules(ruleIds) {
  return ruleIds.reduce(function (ids, id) {
    ids[id] = 0; // 0 is the severity to turn off a rule
    return ids;
  }, {});
};

// Worker still hasn't initialized, since the queued idle callbacks are
// done in order, waiting on a newly queued idle callback will ensure that
// the worker has been initialized
var waitOnIdle = _asyncToGenerator(function* () {
  return new Promise(function (resolve) {
    var callbackID = window.requestIdleCallback(function () {
      idleCallbacks['delete'](callbackID);
      resolve();
    });
    idleCallbacks.add(callbackID);
  });
});

module.exports = {
  activate: function activate() {
    var _this = this;

    var callbackID = undefined;
    var installLinterEslintDeps = function installLinterEslintDeps() {
      idleCallbacks['delete'](callbackID);
      if (!atom.inSpecMode()) {
        require('atom-package-deps').install('linter-eslint');
      }
    };
    callbackID = window.requestIdleCallback(installLinterEslintDeps);
    idleCallbacks.add(callbackID);

    this.subscriptions = new _atom.CompositeDisposable();
    this.worker = null;

    var embeddedScope = 'source.js.embedded.html';
    this.subscriptions.add(atom.config.observe('linter-eslint.lintHtmlFiles', function (value) {
      lintHtmlFiles = value;
      if (lintHtmlFiles) {
        scopes.push(embeddedScope);
      } else if (scopes.indexOf(embeddedScope) !== -1) {
        scopes.splice(scopes.indexOf(embeddedScope), 1);
      }
    }));

    this.subscriptions.add(atom.config.observe('linter-eslint.scopes', function (value) {
      // Remove any old scopes
      scopes.splice(0, scopes.length);
      // Add the current scopes
      Array.prototype.push.apply(scopes, value);
      // Ensure HTML linting still works if the setting is updated
      if (lintHtmlFiles && !scopes.includes(embeddedScope)) {
        scopes.push(embeddedScope);
      }
    }));

    this.subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
      editor.onDidSave(_asyncToGenerator(function* () {
        var validScope = editor.getCursors().some(function (cursor) {
          return cursor.getScopeDescriptor().getScopesArray().some(function (scope) {
            return scopes.includes(scope);
          });
        });
        if (validScope && atom.config.get('linter-eslint.fixOnSave')) {
          yield _this.fixJob(true);
        }
      }));
    }));

    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'linter-eslint:debug': _asyncToGenerator(function* () {
        if (!helpers) {
          helpers = require('./helpers');
        }
        if (!_this.worker) {
          yield waitOnIdle();
        }
        var debugString = yield helpers.generateDebugString(_this.worker);
        var notificationOptions = { detail: debugString, dismissable: true };
        atom.notifications.addInfo('linter-eslint debugging information', notificationOptions);
      })
    }));

    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'linter-eslint:fix-file': _asyncToGenerator(function* () {
        yield _this.fixJob();
      })
    }));

    this.subscriptions.add(atom.config.observe('linter-eslint.showRuleIdInMessage', function (value) {
      showRule = value;
    }));

    this.subscriptions.add(atom.config.observe('linter-eslint.disableWhenNoEslintConfig', function (value) {
      disableWhenNoEslintConfig = value;
    }));

    this.subscriptions.add(atom.config.observe('linter-eslint.rulesToSilenceWhileTyping', function (ids) {
      ignoredRulesWhenModified = idsToIgnoredRules(ids);
    }));

    this.subscriptions.add(atom.config.observe('linter-eslint.rulesToDisableWhileFixing', function (ids) {
      ignoredRulesWhenFixing = idsToIgnoredRules(ids);
    }));

    var initializeESLintWorker = function initializeESLintWorker() {
      _this.worker = new _atom.Task(require.resolve('./worker.js'));
    };
    // Initialize the worker during an idle time
    window.requestIdleCallback(initializeESLintWorker);
  },

  deactivate: function deactivate() {
    if (this.worker !== null) {
      this.worker.terminate();
      this.worker = null;
    }
    idleCallbacks.forEach(function (callbackID) {
      return window.cancelIdleCallback(callbackID);
    });
    idleCallbacks.clear();
    this.subscriptions.dispose();
  },

  provideLinter: function provideLinter() {
    var _this2 = this;

    return {
      name: 'ESLint',
      grammarScopes: scopes,
      scope: 'file',
      lintsOnChange: true,
      lint: _asyncToGenerator(function* (textEditor) {
        var text = textEditor.getText();
        if (text.length === 0) {
          return [];
        }
        var filePath = textEditor.getPath();

        var rules = {};
        if (textEditor.isModified() && Object.keys(ignoredRulesWhenModified).length > 0) {
          rules = ignoredRulesWhenModified;
        }

        if (!helpers) {
          helpers = require('./helpers');
        }

        if (!_this2.worker) {
          yield waitOnIdle();
        }

        var response = yield helpers.sendJob(_this2.worker, {
          type: 'lint',
          contents: text,
          config: atom.config.get('linter-eslint'),
          rules: rules,
          filePath: filePath,
          projectPath: atom.project.relativizePath(filePath)[0] || ''
        });

        if (textEditor.getText() !== text) {
          /*
             The editor text has been modified since the lint was triggered,
             as we can't be sure that the results will map properly back to
             the new contents, simply return `null` to tell the
             `provideLinter` consumer not to update the saved results.
           */
          return null;
        }
        return helpers.processESLintMessages(response, textEditor, showRule, _this2.worker);
      })
    };
  },

  fixJob: _asyncToGenerator(function* () {
    var isSave = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    var textEditor = atom.workspace.getActiveTextEditor();

    if (!textEditor || textEditor.isModified()) {
      // Abort for invalid or unsaved text editors
      var message = 'Linter-ESLint: Please save before fixing';
      atom.notifications.addError(message);
    }

    if (!path) {
      path = require('path');
    }
    if (!isConfigAtHomeRoot) {
      isConfigAtHomeRoot = require('./is-config-at-home-root');
    }
    if (!workerHelpers) {
      workerHelpers = require('./worker-helpers');
    }

    var filePath = textEditor.getPath();
    var fileDir = path.dirname(filePath);
    var projectPath = atom.project.relativizePath(filePath)[0];

    // Get the text from the editor, so we can use executeOnText
    var text = textEditor.getText();
    // Do not try to make fixes on an empty file
    if (text.length === 0) {
      return;
    }

    // Do not try to fix if linting should be disabled
    var configPath = workerHelpers.getConfigPath(fileDir);
    var noProjectConfig = configPath === null || isConfigAtHomeRoot(configPath);
    if (noProjectConfig && disableWhenNoEslintConfig) {
      return;
    }

    var rules = {};
    if (Object.keys(ignoredRulesWhenFixing).length > 0) {
      rules = ignoredRulesWhenFixing;
    }

    if (!helpers) {
      helpers = require('./helpers');
    }
    if (!this.worker) {
      yield waitOnIdle();
    }

    try {
      var response = yield helpers.sendJob(this.worker, {
        type: 'fix',
        config: atom.config.get('linter-eslint'),
        contents: text,
        rules: rules,
        filePath: filePath,
        projectPath: projectPath
      });
      if (!isSave) {
        atom.notifications.addSuccess(response);
      }
    } catch (err) {
      atom.notifications.addWarning(err.message);
    }
  })
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O29CQUcwQyxNQUFNOzs7OztBQUhoRCxXQUFXLENBQUEsQUFRWCxJQUFJLElBQUksWUFBQSxDQUFBO0FBQ1IsSUFBSSxPQUFPLFlBQUEsQ0FBQTtBQUNYLElBQUksYUFBYSxZQUFBLENBQUE7QUFDakIsSUFBSSxrQkFBa0IsWUFBQSxDQUFBOzs7QUFHdEIsSUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFBO0FBQ2pCLElBQUksUUFBUSxZQUFBLENBQUE7QUFDWixJQUFJLGFBQWEsWUFBQSxDQUFBO0FBQ2pCLElBQUksd0JBQXdCLFlBQUEsQ0FBQTtBQUM1QixJQUFJLHNCQUFzQixZQUFBLENBQUE7QUFDMUIsSUFBSSx5QkFBeUIsWUFBQSxDQUFBOzs7QUFHN0IsSUFBTSxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTs7O0FBRy9CLElBQU0saUJBQWlCLEdBQUcsU0FBcEIsaUJBQWlCLENBQUcsT0FBTztTQUMvQixPQUFPLENBQUMsTUFBTSxDQUFDLFVBQUMsR0FBRyxFQUFFLEVBQUUsRUFBSztBQUMxQixPQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1gsV0FBTyxHQUFHLENBQUE7R0FDWCxFQUFFLEVBQUUsQ0FBQztDQUFBLENBQUE7Ozs7O0FBS1IsSUFBTSxVQUFVLHFCQUFHO1NBQ2pCLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFLO0FBQ3ZCLFFBQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxZQUFNO0FBQ2xELG1CQUFhLFVBQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUNoQyxhQUFPLEVBQUUsQ0FBQTtLQUNWLENBQUMsQ0FBQTtBQUNGLGlCQUFhLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0dBQzlCLENBQUM7Q0FBQSxDQUFBLENB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RCxRQUFJLEtBQUssR0FBRyxFQUFFLENBQUE7QUFDZCxRQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ2xELFdBQUssR0FBRyxzQkFBc0IsQ0FBQTtLQUMvQjs7QUFFRCxRQUFJLENBQUMsT0FBTyxFQUFFO0FBQ1osYUFBTyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQTtLQUMvQjtBQUNELFFBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ2hCLFlBQU0sVUFBVSxFQUFFLENBQUE7S0FDbkI7O0FBRUQsUUFBSTtBQUNGLFVBQU0sUUFBUSxHQUFHLE1BQU0sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ2xELFlBQUksRUFBRSxLQUFLO0FBQ1gsY0FBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQztBQUN4QyxnQkFBUSxFQUFFLElBQUk7QUFDZCxhQUFLLEVBQUwsS0FBSztBQUNMLGdCQUFRLEVBQVIsUUFBUTtBQUNSLG1CQUFXLEVBQVgsV0FBVztPQUNaLENBQUMsQ0FBQTtBQUNGLFVBQUksQ0FBQyxNQUFNLEVBQUU7QUFDWCxZQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQTtPQUN4QztLQUNGLENBQUMsT0FBTyxHQUFHLEVBQUU7QUFDWixVQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUE7S0FDM0M7R0FDRixDQUFBO0NBQ0YsQ0FBQSIsImZpbGUiOiIvVXNlcnMvc2hhbm5vbmJlcnR1Y2NpLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzLCBpbXBvcnQvZXh0ZW5zaW9uc1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgVGFzayB9IGZyb20gJ2F0b20nXG5cbi8vIERlcGVuZGVuY2llc1xuLy8gTk9URTogV2UgYXJlIG5vdCBkaXJlY3RseSByZXF1aXJpbmcgdGhlc2UgaW4gb3JkZXIgdG8gcmVkdWNlIHRoZSB0aW1lIGl0XG4vLyB0YWtlcyB0byByZXF1aXJlIHRoaXMgZmlsZSBhcyB0aGF0IGNhdXNlcyBkZWxheXMgaW4gQXRvbSBsb2FkaW5nIHRoaXMgcGFja2FnZVxubGV0IHBhdGhcbmxldCBoZWxwZXJzXG5sZXQgd29ya2VySGVscGVyc1xubGV0IGlzQ29uZmlnQXRIb21lUm9vdFxuXG4vLyBDb25maWd1cmF0aW9uXG5jb25zdCBzY29wZXMgPSBbXVxubGV0IHNob3dSdWxlXG5sZXQgbGludEh0bWxGaWxlc1xubGV0IGlnbm9yZWRSdWxlc1doZW5Nb2RpZmllZFxubGV0IGlnbm9yZWRSdWxlc1doZW5GaXhpbmdcbmxldCBkaXNhYmxlV2hlbk5vRXNsaW50Q29uZmlnXG5cbi8vIEludGVybmFsIHZhcmlhYmxlc1xuY29uc3QgaWRsZUNhbGxiYWNrcyA9IG5ldyBTZXQoKVxuXG4vLyBJbnRlcm5hbCBmdW5jdGlvbnNcbmNvbnN0IGlkc1RvSWdub3JlZFJ1bGVzID0gcnVsZUlkcyA9PlxuICBydWxlSWRzLnJlZHVjZSgoaWRzLCBpZCkgPT4ge1xuICAgIGlkc1tpZF0gPSAwIC8vIDAgaXMgdGhlIHNldmVyaXR5IHRvIHR1cm4gb2ZmIGEgcnVsZVxuICAgIHJldHVybiBpZHNcbiAgfSwge30pXG5cbi8vIFdvcmtlciBzdGlsbCBoYXNuJ3QgaW5pdGlhbGl6ZWQsIHNpbmNlIHRoZSBxdWV1ZWQgaWRsZSBjYWxsYmFja3MgYXJlXG4vLyBkb25lIGluIG9yZGVyLCB3YWl0aW5nIG9uIGEgbmV3bHkgcXVldWVkIGlkbGUgY2FsbGJhY2sgd2lsbCBlbnN1cmUgdGhhdFxuLy8gdGhlIHdvcmtlciBoYXMgYmVlbiBpbml0aWFsaXplZFxuY29uc3Qgd2FpdE9uSWRsZSA9IGFzeW5jICgpID0+XG4gIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgY29uc3QgY2FsbGJhY2tJRCA9IHdpbmRvdy5yZXF1ZXN0SWRsZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgIGlkbGVDYWxsYmFja3MuZGVsZXRlKGNhbGxiYWNrSUQpXG4gICAgICByZXNvbHZlKClcbiAgICB9KVxuICAgIGlkbGVDYWxsYmFja3MuYWRkKGNhbGxiYWNrSUQpXG4gIH0pXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhY3RpdmF0ZSgpIHtcbiAgICBsZXQgY2FsbGJhY2tJRFxuICAgIGNvbnN0IGluc3RhbGxMaW50ZXJFc2xpbnREZXBzID0gKCkgPT4ge1xuICAgICAgaWRsZUNhbGxiYWNrcy5kZWxldGUoY2FsbGJhY2tJRClcbiAgICAgIGlmICghYXRvbS5pblNwZWNNb2RlKCkpIHtcbiAgICAgICAgcmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsKCdsaW50ZXItZXNsaW50JylcbiAgICAgIH1cbiAgICB9XG4gICAgY2FsbGJhY2tJRCA9IHdpbmRvdy5yZXF1ZXN0SWRsZUNhbGxiYWNrKGluc3RhbGxMaW50ZXJFc2xpbnREZXBzKVxuICAgIGlkbGVDYWxsYmFja3MuYWRkKGNhbGxiYWNrSUQpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy53b3JrZXIgPSBudWxsXG5cbiAgICBjb25zdCBlbWJlZGRlZFNjb3BlID0gJ3NvdXJjZS5qcy5lbWJlZGRlZC5odG1sJ1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWVzbGludC5saW50SHRtbEZpbGVzJyxcbiAgICAgICh2YWx1ZSkgPT4ge1xuICAgICAgICBsaW50SHRtbEZpbGVzID0gdmFsdWVcbiAgICAgICAgaWYgKGxpbnRIdG1sRmlsZXMpIHtcbiAgICAgICAgICBzY29wZXMucHVzaChlbWJlZGRlZFNjb3BlKVxuICAgICAgICB9IGVsc2UgaWYgKHNjb3Blcy5pbmRleE9mKGVtYmVkZGVkU2NvcGUpICE9PSAtMSkge1xuICAgICAgICAgIHNjb3Blcy5zcGxpY2Uoc2NvcGVzLmluZGV4T2YoZW1iZWRkZWRTY29wZSksIDEpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1lc2xpbnQuc2NvcGVzJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIC8vIFJlbW92ZSBhbnkgb2xkIHNjb3Blc1xuICAgICAgICBzY29wZXMuc3BsaWNlKDAsIHNjb3Blcy5sZW5ndGgpXG4gICAgICAgIC8vIEFkZCB0aGUgY3VycmVudCBzY29wZXNcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoc2NvcGVzLCB2YWx1ZSlcbiAgICAgICAgLy8gRW5zdXJlIEhUTUwgbGludGluZyBzdGlsbCB3b3JrcyBpZiB0aGUgc2V0dGluZyBpcyB1cGRhdGVkXG4gICAgICAgIGlmIChsaW50SHRtbEZpbGVzICYmICFzY29wZXMuaW5jbHVkZXMoZW1iZWRkZWRTY29wZSkpIHtcbiAgICAgICAgICBzY29wZXMucHVzaChlbWJlZGRlZFNjb3BlKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKChlZGl0b3IpID0+IHtcbiAgICAgIGVkaXRvci5vbkRpZFNhdmUoYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCB2YWxpZFNjb3BlID0gZWRpdG9yLmdldEN1cnNvcnMoKS5zb21lKGN1cnNvciA9PlxuICAgICAgICAgIGN1cnNvci5nZXRTY29wZURlc2NyaXB0b3IoKS5nZXRTY29wZXNBcnJheSgpLnNvbWUoc2NvcGUgPT5cbiAgICAgICAgICAgIHNjb3Blcy5pbmNsdWRlcyhzY29wZSkpKVxuICAgICAgICBpZiAodmFsaWRTY29wZSAmJiBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci1lc2xpbnQuZml4T25TYXZlJykpIHtcbiAgICAgICAgICBhd2FpdCB0aGlzLmZpeEpvYih0cnVlKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsIHtcbiAgICAgICdsaW50ZXItZXNsaW50OmRlYnVnJzogYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIWhlbHBlcnMpIHtcbiAgICAgICAgICBoZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJylcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMud29ya2VyKSB7XG4gICAgICAgICAgYXdhaXQgd2FpdE9uSWRsZSgpXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGVidWdTdHJpbmcgPSBhd2FpdCBoZWxwZXJzLmdlbmVyYXRlRGVidWdTdHJpbmcodGhpcy53b3JrZXIpXG4gICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbk9wdGlvbnMgPSB7IGRldGFpbDogZGVidWdTdHJpbmcsIGRpc21pc3NhYmxlOiB0cnVlIH1cbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ2xpbnRlci1lc2xpbnQgZGVidWdnaW5nIGluZm9ybWF0aW9uJywgbm90aWZpY2F0aW9uT3B0aW9ucylcbiAgICAgIH1cbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCB7XG4gICAgICAnbGludGVyLWVzbGludDpmaXgtZmlsZSc6IGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgdGhpcy5maXhKb2IoKVxuICAgICAgfVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItZXNsaW50LnNob3dSdWxlSWRJbk1lc3NhZ2UnLFxuICAgICAgKHZhbHVlKSA9PiB7XG4gICAgICAgIHNob3dSdWxlID0gdmFsdWVcbiAgICAgIH0pXG4gICAgKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItZXNsaW50LmRpc2FibGVXaGVuTm9Fc2xpbnRDb25maWcnLFxuICAgICAgKHZhbHVlKSA9PiB7XG4gICAgICAgIGRpc2FibGVXaGVuTm9Fc2xpbnRDb25maWcgPSB2YWx1ZVxuICAgICAgfSlcbiAgICApXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1lc2xpbnQucnVsZXNUb1NpbGVuY2VXaGlsZVR5cGluZycsIChpZHMpID0+IHtcbiAgICAgIGlnbm9yZWRSdWxlc1doZW5Nb2RpZmllZCA9IGlkc1RvSWdub3JlZFJ1bGVzKGlkcylcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWVzbGludC5ydWxlc1RvRGlzYWJsZVdoaWxlRml4aW5nJywgKGlkcykgPT4ge1xuICAgICAgaWdub3JlZFJ1bGVzV2hlbkZpeGluZyA9IGlkc1RvSWdub3JlZFJ1bGVzKGlkcylcbiAgICB9KSlcblxuICAgIGNvbnN0IGluaXRpYWxpemVFU0xpbnRXb3JrZXIgPSAoKSA9PiB7XG4gICAgICB0aGlzLndvcmtlciA9IG5ldyBUYXNrKHJlcXVpcmUucmVzb2x2ZSgnLi93b3JrZXIuanMnKSlcbiAgICB9XG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgd29ya2VyIGR1cmluZyBhbiBpZGxlIHRpbWVcbiAgICB3aW5kb3cucmVxdWVzdElkbGVDYWxsYmFjayhpbml0aWFsaXplRVNMaW50V29ya2VyKVxuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgaWYgKHRoaXMud29ya2VyICE9PSBudWxsKSB7XG4gICAgICB0aGlzLndvcmtlci50ZXJtaW5hdGUoKVxuICAgICAgdGhpcy53b3JrZXIgPSBudWxsXG4gICAgfVxuICAgIGlkbGVDYWxsYmFja3MuZm9yRWFjaChjYWxsYmFja0lEID0+IHdpbmRvdy5jYW5jZWxJZGxlQ2FsbGJhY2soY2FsbGJhY2tJRCkpXG4gICAgaWRsZUNhbGxiYWNrcy5jbGVhcigpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9LFxuXG4gIHByb3ZpZGVMaW50ZXIoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdFU0xpbnQnLFxuICAgICAgZ3JhbW1hclNjb3Blczogc2NvcGVzLFxuICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgIGxpbnRzT25DaGFuZ2U6IHRydWUsXG4gICAgICBsaW50OiBhc3luYyAodGV4dEVkaXRvcikgPT4ge1xuICAgICAgICBjb25zdCB0ZXh0ID0gdGV4dEVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgaWYgKHRleHQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIFtdXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKVxuXG4gICAgICAgIGxldCBydWxlcyA9IHt9XG4gICAgICAgIGlmICh0ZXh0RWRpdG9yLmlzTW9kaWZpZWQoKSAmJiBPYmplY3Qua2V5cyhpZ25vcmVkUnVsZXNXaGVuTW9kaWZpZWQpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBydWxlcyA9IGlnbm9yZWRSdWxlc1doZW5Nb2RpZmllZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFoZWxwZXJzKSB7XG4gICAgICAgICAgaGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMud29ya2VyKSB7XG4gICAgICAgICAgYXdhaXQgd2FpdE9uSWRsZSgpXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGhlbHBlcnMuc2VuZEpvYih0aGlzLndvcmtlciwge1xuICAgICAgICAgIHR5cGU6ICdsaW50JyxcbiAgICAgICAgICBjb250ZW50czogdGV4dCxcbiAgICAgICAgICBjb25maWc6IGF0b20uY29uZmlnLmdldCgnbGludGVyLWVzbGludCcpLFxuICAgICAgICAgIHJ1bGVzLFxuICAgICAgICAgIGZpbGVQYXRoLFxuICAgICAgICAgIHByb2plY3RQYXRoOiBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoZmlsZVBhdGgpWzBdIHx8ICcnXG4gICAgICAgIH0pXG5cbiAgICAgICAgaWYgKHRleHRFZGl0b3IuZ2V0VGV4dCgpICE9PSB0ZXh0KSB7XG4gICAgICAgICAgLypcbiAgICAgICAgICAgICBUaGUgZWRpdG9yIHRleHQgaGFzIGJlZW4gbW9kaWZpZWQgc2luY2UgdGhlIGxpbnQgd2FzIHRyaWdnZXJlZCxcbiAgICAgICAgICAgICBhcyB3ZSBjYW4ndCBiZSBzdXJlIHRoYXQgdGhlIHJlc3VsdHMgd2lsbCBtYXAgcHJvcGVybHkgYmFjayB0b1xuICAgICAgICAgICAgIHRoZSBuZXcgY29udGVudHMsIHNpbXBseSByZXR1cm4gYG51bGxgIHRvIHRlbGwgdGhlXG4gICAgICAgICAgICAgYHByb3ZpZGVMaW50ZXJgIGNvbnN1bWVyIG5vdCB0byB1cGRhdGUgdGhlIHNhdmVkIHJlc3VsdHMuXG4gICAgICAgICAgICovXG4gICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGVscGVycy5wcm9jZXNzRVNMaW50TWVzc2FnZXMocmVzcG9uc2UsIHRleHRFZGl0b3IsIHNob3dSdWxlLCB0aGlzLndvcmtlcilcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgYXN5bmMgZml4Sm9iKGlzU2F2ZSA9IGZhbHNlKSB7XG4gICAgY29uc3QgdGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuXG4gICAgaWYgKCF0ZXh0RWRpdG9yIHx8IHRleHRFZGl0b3IuaXNNb2RpZmllZCgpKSB7XG4gICAgICAvLyBBYm9ydCBmb3IgaW52YWxpZCBvciB1bnNhdmVkIHRleHQgZWRpdG9yc1xuICAgICAgY29uc3QgbWVzc2FnZSA9ICdMaW50ZXItRVNMaW50OiBQbGVhc2Ugc2F2ZSBiZWZvcmUgZml4aW5nJ1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKG1lc3NhZ2UpXG4gICAgfVxuXG4gICAgaWYgKCFwYXRoKSB7XG4gICAgICBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG4gICAgfVxuICAgIGlmICghaXNDb25maWdBdEhvbWVSb290KSB7XG4gICAgICBpc0NvbmZpZ0F0SG9tZVJvb3QgPSByZXF1aXJlKCcuL2lzLWNvbmZpZy1hdC1ob21lLXJvb3QnKVxuICAgIH1cbiAgICBpZiAoIXdvcmtlckhlbHBlcnMpIHtcbiAgICAgIHdvcmtlckhlbHBlcnMgPSByZXF1aXJlKCcuL3dvcmtlci1oZWxwZXJzJylcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpXG4gICAgY29uc3QgZmlsZURpciA9IHBhdGguZGlybmFtZShmaWxlUGF0aClcbiAgICBjb25zdCBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChmaWxlUGF0aClbMF1cblxuICAgIC8vIEdldCB0aGUgdGV4dCBmcm9tIHRoZSBlZGl0b3IsIHNvIHdlIGNhbiB1c2UgZXhlY3V0ZU9uVGV4dFxuICAgIGNvbnN0IHRleHQgPSB0ZXh0RWRpdG9yLmdldFRleHQoKVxuICAgIC8vIERvIG5vdCB0cnkgdG8gbWFrZSBmaXhlcyBvbiBhbiBlbXB0eSBmaWxlXG4gICAgaWYgKHRleHQubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBEbyBub3QgdHJ5IHRvIGZpeCBpZiBsaW50aW5nIHNob3VsZCBiZSBkaXNhYmxlZFxuICAgIGNvbnN0IGNvbmZpZ1BhdGggPSB3b3JrZXJIZWxwZXJzLmdldENvbmZpZ1BhdGgoZmlsZURpcilcbiAgICBjb25zdCBub1Byb2plY3RDb25maWcgPSAoY29uZmlnUGF0aCA9PT0gbnVsbCB8fCBpc0NvbmZpZ0F0SG9tZVJvb3QoY29uZmlnUGF0aCkpXG4gICAgaWYgKG5vUHJvamVjdENvbmZpZyAmJiBkaXNhYmxlV2hlbk5vRXNsaW50Q29uZmlnKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBsZXQgcnVsZXMgPSB7fVxuICAgIGlmIChPYmplY3Qua2V5cyhpZ25vcmVkUnVsZXNXaGVuRml4aW5nKS5sZW5ndGggPiAwKSB7XG4gICAgICBydWxlcyA9IGlnbm9yZWRSdWxlc1doZW5GaXhpbmdcbiAgICB9XG5cbiAgICBpZiAoIWhlbHBlcnMpIHtcbiAgICAgIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKVxuICAgIH1cbiAgICBpZiAoIXRoaXMud29ya2VyKSB7XG4gICAgICBhd2FpdCB3YWl0T25JZGxlKClcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBoZWxwZXJzLnNlbmRKb2IodGhpcy53b3JrZXIsIHtcbiAgICAgICAgdHlwZTogJ2ZpeCcsXG4gICAgICAgIGNvbmZpZzogYXRvbS5jb25maWcuZ2V0KCdsaW50ZXItZXNsaW50JyksXG4gICAgICAgIGNvbnRlbnRzOiB0ZXh0LFxuICAgICAgICBydWxlcyxcbiAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgIHByb2plY3RQYXRoXG4gICAgICB9KVxuICAgICAgaWYgKCFpc1NhdmUpIHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MocmVzcG9uc2UpXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhlcnIubWVzc2FnZSlcbiAgICB9XG4gIH0sXG59XG4iXX0=