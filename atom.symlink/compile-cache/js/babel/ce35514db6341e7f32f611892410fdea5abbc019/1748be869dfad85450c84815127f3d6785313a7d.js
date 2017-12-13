var getNotification = _asyncToGenerator(function* (expectedMessage) {
  return new Promise(function (resolve) {
    var notificationSub = undefined;
    var newNotification = function newNotification(notification) {
      if (notification.getMessage() !== expectedMessage) {
        // As the specs execute asynchronously, it's possible a notification
        // from a different spec was grabbed, if the message doesn't match what
        // is expected simply return and keep waiting for the next message.
        return;
      }
      // Dispose of the notificaiton subscription
      notificationSub.dispose();
      resolve(notification);
    };
    // Subscribe to Atom's notifications
    notificationSub = atom.notifications.onDidAddNotification(newNotification);
  });
});

var makeFixes = _asyncToGenerator(function* (textEditor) {
  return new Promise(_asyncToGenerator(function* (resolve) {
    // Subscribe to the file reload event
    var editorReloadSub = textEditor.getBuffer().onDidReload(_asyncToGenerator(function* () {
      editorReloadSub.dispose();
      // File has been reloaded in Atom, notification checking will happen
      // async either way, but should already be finished at this point
      resolve();
    }));

    // Now that all the required subscriptions are active, send off a fix request
    atom.commands.dispatch(atom.views.getView(textEditor), 'linter-eslint:fix-file');
    var expectedMessage = 'Linter-ESLint: Fix complete.';
    var notification = yield getNotification(expectedMessage);

    expect(notification.getMessage()).toBe(expectedMessage);
    expect(notification.getType()).toBe('success');
  }));
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _os = require('os');

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

// eslint-disable-next-line no-unused-vars

var _jasmineFix = require('jasmine-fix');

var _srcMain = require('../src/main');

var _srcMain2 = _interopRequireDefault(_srcMain);

'use babel';

var fixturesDir = path.join(__dirname, 'fixtures');

var goodPath = path.join(fixturesDir, 'files', 'good.js');
var badPath = path.join(fixturesDir, 'files', 'bad.js');
var badInlinePath = path.join(fixturesDir, 'files', 'badInline.js');
var emptyPath = path.join(fixturesDir, 'files', 'empty.js');
var fixPath = path.join(fixturesDir, 'files', 'fix.js');
var cachePath = path.join(fixturesDir, 'files', '.eslintcache');
var configPath = path.join(fixturesDir, 'configs', '.eslintrc.yml');
var importingpath = path.join(fixturesDir, 'import-resolution', 'nested', 'importing.js');
var badImportPath = path.join(fixturesDir, 'import-resolution', 'nested', 'badImport.js');
var ignoredPath = path.join(fixturesDir, 'eslintignore', 'ignored.js');
var modifiedIgnorePath = path.join(fixturesDir, 'modified-ignore-rule', 'foo.js');
var modifiedIgnoreSpacePath = path.join(fixturesDir, 'modified-ignore-rule', 'foo-space.js');
var endRangePath = path.join(fixturesDir, 'end-range', 'no-unreachable.js');
var badCachePath = path.join(fixturesDir, 'badCache');

/**
 * Async helper to copy a file from one place to another on the filesystem.
 * @param  {string} fileToCopyPath  Path of the file to be copied
 * @param  {string} destinationDir  Directory to paste the file into
 * @return {string}                 Full path of the file in copy destination
 */
function copyFileToDir(fileToCopyPath, destinationDir) {
  return new Promise(function (resolve) {
    var destinationPath = path.join(destinationDir, path.basename(fileToCopyPath));
    var ws = fs.createWriteStream(destinationPath);
    ws.on('close', function () {
      return resolve(destinationPath);
    });
    fs.createReadStream(fileToCopyPath).pipe(ws);
  });
}

/**
 * Utility helper to copy a file into the OS temp directory.
 *
 * @param  {string} fileToCopyPath  Path of the file to be copied
 * @return {string}                 Full path of the file in copy destination
 */
function copyFileToTempDir(fileToCopyPath) {
  return new Promise(_asyncToGenerator(function* (resolve) {
    var tempFixtureDir = fs.mkdtempSync((0, _os.tmpdir)() + path.sep);
    resolve((yield copyFileToDir(fileToCopyPath, tempFixtureDir)));
  }));
}

describe('The eslint provider for Linter', function () {
  var linterProvider = _srcMain2['default'].provideLinter();
  var lint = linterProvider.lint;

  (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
    atom.config.set('linter-eslint.disableFSCache', false);
    atom.config.set('linter-eslint.disableEslintIgnore', true);

    // Activate the JavaScript language so Atom knows what the files are
    yield atom.packages.activatePackage('language-javascript');
    // Activate the provider
    yield atom.packages.activatePackage('linter-eslint');
  }));

  describe('checks bad.js and', function () {
    var editor = null;
    (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
      editor = yield atom.workspace.open(badPath);
    }));

    (0, _jasmineFix.it)('verifies the messages', _asyncToGenerator(function* () {
      var messages = yield lint(editor);
      expect(messages.length).toBe(2);

      var expected0 = "'foo' is not defined. (no-undef)";
      var expected0Url = 'http://eslint.org/docs/rules/no-undef';
      var expected1 = 'Extra semicolon. (semi)';
      var expected1Url = 'http://eslint.org/docs/rules/semi';

      expect(messages[0].severity).toBe('error');
      expect(messages[0].excerpt).toBe(expected0);
      expect(messages[0].url).toBe(expected0Url);
      expect(messages[0].location.file).toBe(badPath);
      expect(messages[0].location.position).toEqual([[0, 0], [0, 3]]);
      expect(messages[0].solutions).not.toBeDefined();

      expect(messages[1].severity).toBe('error');
      expect(messages[1].excerpt).toBe(expected1);
      expect(messages[1].url).toBe(expected1Url);
      expect(messages[1].location.file).toBe(badPath);
      expect(messages[1].location.position).toEqual([[0, 8], [0, 9]]);
      expect(messages[1].solutions.length).toBe(1);
      expect(messages[1].solutions[0].position).toEqual([[0, 6], [0, 9]]);
      expect(messages[1].solutions[0].replaceWith).toBe('42');
    }));
  });

  (0, _jasmineFix.it)('finds nothing wrong with an empty file', _asyncToGenerator(function* () {
    var editor = yield atom.workspace.open(emptyPath);
    var messages = yield lint(editor);

    expect(messages.length).toBe(0);
  }));

  (0, _jasmineFix.it)('finds nothing wrong with a valid file', _asyncToGenerator(function* () {
    var editor = yield atom.workspace.open(goodPath);
    var messages = yield lint(editor);

    expect(messages.length).toBe(0);
  }));

  (0, _jasmineFix.it)('reports the fixes for fixable errors', _asyncToGenerator(function* () {
    var editor = yield atom.workspace.open(fixPath);
    var messages = yield lint(editor);

    expect(messages[0].solutions[0].position).toEqual([[0, 10], [1, 8]]);
    expect(messages[0].solutions[0].replaceWith).toBe('6\nfunction');

    expect(messages[1].solutions[0].position).toEqual([[2, 0], [2, 1]]);
    expect(messages[1].solutions[0].replaceWith).toBe('  ');
  }));

  describe('when resolving import paths using eslint-plugin-import', function () {
    (0, _jasmineFix.it)('correctly resolves imports from parent', _asyncToGenerator(function* () {
      var editor = yield atom.workspace.open(importingpath);
      var messages = yield lint(editor);

      expect(messages.length).toBe(0);
    }));

    (0, _jasmineFix.it)('shows a message for an invalid import', _asyncToGenerator(function* () {
      var editor = yield atom.workspace.open(badImportPath);
      var messages = yield lint(editor);
      var expected = "Unable to resolve path to module '../nonexistent'. (import/no-unresolved)";
      var expectedUrl = 'https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-unresolved.md';

      expect(messages.length).toBe(1);
      expect(messages[0].severity).toBe('error');
      expect(messages[0].excerpt).toBe(expected);
      expect(messages[0].url).toBe(expectedUrl);
      expect(messages[0].location.file).toBe(badImportPath);
      expect(messages[0].location.position).toEqual([[0, 24], [0, 39]]);
      expect(messages[0].solutions).not.toBeDefined();
    }));
  });

  describe('when a file is specified in an .eslintignore file', function () {
    (0, _jasmineFix.beforeEach)(function () {
      atom.config.set('linter-eslint.disableEslintIgnore', false);
    });

    (0, _jasmineFix.it)('will not give warnings when linting the file', _asyncToGenerator(function* () {
      var editor = yield atom.workspace.open(ignoredPath);
      var messages = yield lint(editor);

      expect(messages.length).toBe(0);
    }));

    (0, _jasmineFix.it)('will not give warnings when autofixing the file', _asyncToGenerator(function* () {
      var editor = yield atom.workspace.open(ignoredPath);
      atom.commands.dispatch(atom.views.getView(editor), 'linter-eslint:fix-file');
      var expectedMessage = 'Linter-ESLint: Fix complete.';
      var notification = yield getNotification(expectedMessage);

      expect(notification.getMessage()).toBe(expectedMessage);
    }));
  });

  describe('fixes errors', function () {
    var firstLint = _asyncToGenerator(function* (textEditor) {
      var messages = yield lint(textEditor);
      // The original file has two errors
      expect(messages.length).toBe(2);
    });

    var editor = undefined;
    var tempDir = undefined;

    (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
      // Copy the file to a temporary folder
      var tempFixturePath = yield copyFileToTempDir(fixPath);
      editor = yield atom.workspace.open(tempFixturePath);
      tempDir = path.dirname(tempFixturePath);
      // Copy the config to the same temporary directory
      yield copyFileToDir(configPath, tempDir);
    }));

    afterEach(function () {
      // Remove the temporary directory
      _rimraf2['default'].sync(tempDir);
    });

    (0, _jasmineFix.it)('should fix linting errors', _asyncToGenerator(function* () {
      yield firstLint(editor);
      yield makeFixes(editor);
      var messagesAfterFixing = yield lint(editor);

      expect(messagesAfterFixing.length).toBe(0);
    }));

    // NOTE: This actually works, but if both specs in this describe() are enabled
    // a bug within Atom is somewhat reliably triggered, so this needs to stay
    // disabled for now
    xit('should not fix linting errors for rules that are disabled with rulesToDisableWhileFixing', _asyncToGenerator(function* () {
      atom.config.set('linter-eslint.rulesToDisableWhileFixing', ['semi']);

      yield firstLint(editor);
      yield makeFixes(editor);
      var messagesAfterFixing = yield lint(editor);
      var expected = 'Extra semicolon. (semi)';
      var expectedUrl = 'http://eslint.org/docs/rules/semi';

      expect(messagesAfterFixing.length).toBe(1);
      expect(messagesAfterFixing[0].excerpt).toBe(expected);
      expect(messagesAfterFixing[0].url).toBe(expectedUrl);
    }));
  });

  describe('when an eslint cache file is present', function () {
    var editor = undefined;
    var tempDir = undefined;

    (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
      // Copy the file to a temporary folder
      var tempFixturePath = yield copyFileToTempDir(fixPath);
      editor = yield atom.workspace.open(tempFixturePath);
      tempDir = path.dirname(tempFixturePath);
      // Copy the config to the same temporary directory
      yield copyFileToDir(configPath, tempDir);
    }));

    afterEach(function () {
      // Remove the temporary directory
      _rimraf2['default'].sync(tempDir);
    });

    (0, _jasmineFix.it)('does not delete the cache file when performing fixes', _asyncToGenerator(function* () {
      var tempCacheFile = yield copyFileToDir(cachePath, tempDir);
      var checkCachefileExists = function checkCachefileExists() {
        fs.statSync(tempCacheFile);
      };
      expect(checkCachefileExists).not.toThrow();
      yield makeFixes(editor);
      expect(checkCachefileExists).not.toThrow();
    }));
  });

  describe('Ignores specified rules when editing', function () {
    var expected = 'Trailing spaces not allowed. (no-trailing-spaces)';
    var expectedUrl = 'http://eslint.org/docs/rules/no-trailing-spaces';

    (0, _jasmineFix.it)('does nothing on saved files', _asyncToGenerator(function* () {
      atom.config.set('linter-eslint.rulesToSilenceWhileTyping', ['no-trailing-spaces']);
      var editor = yield atom.workspace.open(modifiedIgnoreSpacePath);
      var messages = yield lint(editor);

      expect(messages.length).toBe(1);
      expect(messages[0].severity).toBe('error');
      expect(messages[0].excerpt).toBe(expected);
      expect(messages[0].url).toBe(expectedUrl);
      expect(messages[0].location.file).toBe(modifiedIgnoreSpacePath);
      expect(messages[0].location.position).toEqual([[0, 9], [0, 10]]);
    }));

    (0, _jasmineFix.it)('works when the file is modified', _asyncToGenerator(function* () {
      var editor = yield atom.workspace.open(modifiedIgnorePath);

      // Verify no error before
      var firstMessages = yield lint(editor);
      expect(firstMessages.length).toBe(0);

      // Insert a space into the editor
      editor.getBuffer().insert([0, 9], ' ');

      // Verify the space is showing an error
      var messages = yield lint(editor);
      expect(messages.length).toBe(1);
      expect(messages[0].severity).toBe('error');
      expect(messages[0].excerpt).toBe(expected);
      expect(messages[0].url).toBe(expectedUrl);
      expect(messages[0].location.file).toBe(modifiedIgnorePath);
      expect(messages[0].location.position).toEqual([[0, 9], [0, 10]]);

      // Enable the option under test
      atom.config.set('linter-eslint.rulesToSilenceWhileTyping', ['no-trailing-spaces']);

      // Check the lint results
      var newMessages = yield lint(editor);
      expect(newMessages.length).toBe(0);
    }));
  });

  describe('prints debugging information with the `debug` command', function () {
    var editor = undefined;
    var expectedMessage = 'linter-eslint debugging information';
    (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
      editor = yield atom.workspace.open(goodPath);
    }));

    (0, _jasmineFix.it)('shows an info notification', _asyncToGenerator(function* () {
      atom.commands.dispatch(atom.views.getView(editor), 'linter-eslint:debug');
      var notification = yield getNotification(expectedMessage);

      expect(notification.getMessage()).toBe(expectedMessage);
      expect(notification.getType()).toEqual('info');
    }));

    (0, _jasmineFix.it)('includes debugging information in the details', _asyncToGenerator(function* () {
      atom.commands.dispatch(atom.views.getView(editor), 'linter-eslint:debug');
      var notification = yield getNotification(expectedMessage);
      var detail = notification.getDetail();

      expect(detail.includes('Atom version: ' + atom.getVersion())).toBe(true);
      expect(detail.includes('linter-eslint version:')).toBe(true);
      expect(detail.includes('Platform: ' + process.platform)).toBe(true);
      expect(detail.includes('linter-eslint configuration:')).toBe(true);
      expect(detail.includes('Using local project ESLint')).toBe(true);
    }));
  });

  (0, _jasmineFix.it)('handles ranges in messages', _asyncToGenerator(function* () {
    var editor = yield atom.workspace.open(endRangePath);
    var messages = yield lint(editor);
    var expected = 'Unreachable code. (no-unreachable)';
    var expectedUrl = 'http://eslint.org/docs/rules/no-unreachable';

    expect(messages[0].severity).toBe('error');
    expect(messages[0].excerpt).toBe(expected);
    expect(messages[0].url).toBe(expectedUrl);
    expect(messages[0].location.file).toBe(endRangePath);
    expect(messages[0].location.position).toEqual([[5, 2], [6, 15]]);
  }));

  describe('when setting `disableWhenNoEslintConfig` is false', function () {
    var editor = undefined;
    var tempFixtureDir = undefined;

    (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
      atom.config.set('linter-eslint.disableWhenNoEslintConfig', false);

      var tempFilePath = yield copyFileToTempDir(badInlinePath);
      editor = yield atom.workspace.open(tempFilePath);
      tempFixtureDir = path.dirname(tempFilePath);
    }));

    afterEach(function () {
      _rimraf2['default'].sync(tempFixtureDir);
    });

    (0, _jasmineFix.it)('errors when no config file is found', _asyncToGenerator(function* () {
      var didError = undefined;
      var gotLintingErrors = undefined;

      try {
        var messages = yield lint(editor);
        // Older versions of ESLint will report an error
        // (or if current user running tests has a config in their home directory)
        var expected = "'foo' is not defined. (no-undef)";
        var expectedUrl = 'http://eslint.org/docs/rules/no-undef';
        expect(messages.length).toBe(1);
        expect(messages[0].excerpt).toBe(expected);
        expect(messages[0].url).toBe(expectedUrl);
        gotLintingErrors = true;
      } catch (err) {
        // Newer versions of ESLint will throw an exception
        expect(err.message).toBe('No ESLint configuration found.');
        didError = true;
      }

      expect(didError || gotLintingErrors).toBe(true);
    }));
  });

  describe('when `disableWhenNoEslintConfig` is true', function () {
    var editor = undefined;
    var tempFixtureDir = undefined;

    (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
      atom.config.set('linter-eslint.disableWhenNoEslintConfig', true);

      var tempFilePath = yield copyFileToTempDir(badInlinePath);
      editor = yield atom.workspace.open(tempFilePath);
      tempFixtureDir = path.dirname(tempFilePath);
    }));

    afterEach(function () {
      _rimraf2['default'].sync(tempFixtureDir);
    });

    (0, _jasmineFix.it)('does not report errors when no config file is found', _asyncToGenerator(function* () {
      var messages = yield lint(editor);

      expect(messages.length).toBe(0);
    }));
  });

  describe('lets ESLint handle configuration', function () {
    (0, _jasmineFix.it)('works when the cache fails', _asyncToGenerator(function* () {
      // Ensure the cache is enabled, since we will be taking advantage of
      // a failing in it's operation
      atom.config.set('linter-eslint.disableFSCache', false);
      var fooPath = path.join(badCachePath, 'temp', 'foo.js');
      var newConfigPath = path.join(badCachePath, 'temp', '.eslintrc.js');
      var editor = yield atom.workspace.open(fooPath);
      function undefMsg(varName) {
        return '\'' + varName + '\' is not defined. (no-undef)';
      }
      var expectedUrl = 'http://eslint.org/docs/rules/no-undef';

      // Trigger a first lint to warm up the cache with the first config result
      var messages = yield lint(editor);
      expect(messages.length).toBe(2);
      expect(messages[0].severity).toBe('error');
      expect(messages[0].excerpt).toBe(undefMsg('console'));
      expect(messages[0].url).toBe(expectedUrl);
      expect(messages[0].location.file).toBe(fooPath);
      expect(messages[0].location.position).toEqual([[1, 2], [1, 9]]);
      expect(messages[1].severity).toBe('error');
      expect(messages[1].excerpt).toBe(undefMsg('bar'));
      expect(messages[1].url).toBe(expectedUrl);
      expect(messages[1].location.file).toBe(fooPath);
      expect(messages[1].location.position).toEqual([[1, 14], [1, 17]]);

      // Write the new configuration file
      var newConfig = {
        env: {
          browser: true
        }
      };
      var configContents = 'module.exports = ' + JSON.stringify(newConfig, null, 2) + '\n';
      fs.writeFileSync(newConfigPath, configContents);

      // Lint again, ESLint should recognise the new configuration
      // The cached config results are still pointing at the _parent_ file. ESLint
      // would partially handle this situation if the config file was specified
      // from the cache.
      messages = yield lint(editor);
      expect(messages.length).toBe(1);
      expect(messages[0].severity).toBe('error');
      expect(messages[0].excerpt).toBe(undefMsg('bar'));
      expect(messages[0].url).toBe(expectedUrl);
      expect(messages[0].location.file).toBe(fooPath);
      expect(messages[0].location.position).toEqual([[1, 14], [1, 17]]);

      // Update the configuration
      newConfig.rules = {
        'no-undef': 'off'
      };
      configContents = 'module.exports = ' + JSON.stringify(newConfig, null, 2) + '\n';
      fs.writeFileSync(newConfigPath, configContents);

      // Lint again, if the cache was specifying the file ESLint at this point
      // would fail to update the configuration fully, and would still report a
      // no-undef error.
      messages = yield lint(editor);
      expect(messages.length).toBe(0);

      // Delete the temporary configuration file
      fs.unlinkSync(newConfigPath);
    }));
  });

  describe('works with HTML files', function () {
    var embeddedScope = 'source.js.embedded.html';
    var scopes = linterProvider.grammarScopes;

    (0, _jasmineFix.it)('adds the HTML scope when the setting is enabled', function () {
      expect(scopes.includes(embeddedScope)).toBe(false);
      atom.config.set('linter-eslint.lintHtmlFiles', true);
      expect(scopes.includes(embeddedScope)).toBe(true);
      atom.config.set('linter-eslint.lintHtmlFiles', false);
      expect(scopes.includes(embeddedScope)).toBe(false);
    });

    (0, _jasmineFix.it)('keeps the HTML scope with custom scopes', function () {
      expect(scopes.includes(embeddedScope)).toBe(false);
      atom.config.set('linter-eslint.lintHtmlFiles', true);
      expect(scopes.includes(embeddedScope)).toBe(true);
      atom.config.set('linter-eslint.scopes', ['foo.bar']);
      expect(scopes.includes(embeddedScope)).toBe(true);
    });
  });

  describe('handles the Show Rule ID in Messages option', function () {
    var expectedUrl = 'https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-unresolved.md';

    (0, _jasmineFix.it)('shows the rule ID when enabled', _asyncToGenerator(function* () {
      atom.config.set('linter-eslint.showRuleIdInMessage', true);
      var editor = yield atom.workspace.open(badImportPath);
      var messages = yield lint(editor);
      var expected = "Unable to resolve path to module '../nonexistent'. (import/no-unresolved)";

      expect(messages.length).toBe(1);
      expect(messages[0].severity).toBe('error');
      expect(messages[0].excerpt).toBe(expected);
      expect(messages[0].url).toBe(expectedUrl);
      expect(messages[0].location.file).toBe(badImportPath);
      expect(messages[0].location.position).toEqual([[0, 24], [0, 39]]);
      expect(messages[0].solutions).not.toBeDefined();
    }));

    (0, _jasmineFix.it)("doesn't show the rule ID when disabled", _asyncToGenerator(function* () {
      atom.config.set('linter-eslint.showRuleIdInMessage', false);
      var editor = yield atom.workspace.open(badImportPath);
      var messages = yield lint(editor);
      var expected = "Unable to resolve path to module '../nonexistent'.";

      expect(messages.length).toBe(1);
      expect(messages[0].severity).toBe('error');
      expect(messages[0].excerpt).toBe(expected);
      expect(messages[0].url).toBe(expectedUrl);
      expect(messages[0].location.file).toBe(badImportPath);
      expect(messages[0].location.position).toEqual([[0, 24], [0, 39]]);
      expect(messages[0].solutions).not.toBeDefined();
    }));
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcGVjL2xpbnRlci1lc2xpbnQtc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiSUEyRGUsZUFBZSxxQkFBOUIsV0FBK0IsZUFBZSxFQUFFO0FBQzlDLFNBQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUs7QUFDOUIsUUFBSSxlQUFlLFlBQUEsQ0FBQTtBQUNuQixRQUFNLGVBQWUsR0FBRyxTQUFsQixlQUFlLENBQUksWUFBWSxFQUFLO0FBQ3hDLFVBQUksWUFBWSxDQUFDLFVBQVUsRUFBRSxLQUFLLGVBQWUsRUFBRTs7OztBQUlqRCxlQUFNO09BQ1A7O0FBRUQscUJBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUN6QixhQUFPLENBQUMsWUFBWSxDQUFDLENBQUE7S0FDdEIsQ0FBQTs7QUFFRCxtQkFBZSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsZUFBZSxDQUFDLENBQUE7R0FDM0UsQ0FBQyxDQUFBO0NBQ0g7O0lBRWMsU0FBUyxxQkFBeEIsV0FBeUIsVUFBVSxFQUFFO0FBQ25DLFNBQU8sSUFBSSxPQUFPLG1CQUFDLFdBQU8sT0FBTyxFQUFLOztBQUVwQyxRQUFNLGVBQWUsR0FBRyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsV0FBVyxtQkFBQyxhQUFZO0FBQ3JFLHFCQUFlLENBQUMsT0FBTyxFQUFFLENBQUE7OztBQUd6QixhQUFPLEVBQUUsQ0FBQTtLQUNWLEVBQUMsQ0FBQTs7O0FBR0YsUUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsd0JBQXdCLENBQUMsQ0FBQTtBQUNoRixRQUFNLGVBQWUsR0FBRyw4QkFBOEIsQ0FBQTtBQUN0RCxRQUFNLFlBQVksR0FBRyxNQUFNLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQTs7QUFFM0Qs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QyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2pFLFlBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFBO0tBQ2hELEVBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTtDQUNILENBQUMsQ0FBQSIsImZpbGUiOiIvVXNlcnMvc2hhbm5vbmJlcnR1Y2NpLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3BlYy9saW50ZXItZXNsaW50LXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcydcbmltcG9ydCB7IHRtcGRpciB9IGZyb20gJ29zJ1xuaW1wb3J0IHJpbXJhZiBmcm9tICdyaW1yYWYnXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCB7IGJlZm9yZUVhY2gsIGl0LCBmaXQgfSBmcm9tICdqYXNtaW5lLWZpeCdcbmltcG9ydCBsaW50ZXJFc2xpbnQgZnJvbSAnLi4vc3JjL21haW4nXG5cbmNvbnN0IGZpeHR1cmVzRGlyID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzJylcblxuY29uc3QgZ29vZFBhdGggPSBwYXRoLmpvaW4oZml4dHVyZXNEaXIsICdmaWxlcycsICdnb29kLmpzJylcbmNvbnN0IGJhZFBhdGggPSBwYXRoLmpvaW4oZml4dHVyZXNEaXIsICdmaWxlcycsICdiYWQuanMnKVxuY29uc3QgYmFkSW5saW5lUGF0aCA9IHBhdGguam9pbihmaXh0dXJlc0RpciwgJ2ZpbGVzJywgJ2JhZElubGluZS5qcycpXG5jb25zdCBlbXB0eVBhdGggPSBwYXRoLmpvaW4oZml4dHVyZXNEaXIsICdmaWxlcycsICdlbXB0eS5qcycpXG5jb25zdCBmaXhQYXRoID0gcGF0aC5qb2luKGZpeHR1cmVzRGlyLCAnZmlsZXMnLCAnZml4LmpzJylcbmNvbnN0IGNhY2hlUGF0aCA9IHBhdGguam9pbihmaXh0dXJlc0RpciwgJ2ZpbGVzJywgJy5lc2xpbnRjYWNoZScpXG5jb25zdCBjb25maWdQYXRoID0gcGF0aC5qb2luKGZpeHR1cmVzRGlyLCAnY29uZmlncycsICcuZXNsaW50cmMueW1sJylcbmNvbnN0IGltcG9ydGluZ3BhdGggPSBwYXRoLmpvaW4oZml4dHVyZXNEaXIsXG4gICdpbXBvcnQtcmVzb2x1dGlvbicsICduZXN0ZWQnLCAnaW1wb3J0aW5nLmpzJylcbmNvbnN0IGJhZEltcG9ydFBhdGggPSBwYXRoLmpvaW4oZml4dHVyZXNEaXIsXG4gICdpbXBvcnQtcmVzb2x1dGlvbicsICduZXN0ZWQnLCAnYmFkSW1wb3J0LmpzJylcbmNvbnN0IGlnbm9yZWRQYXRoID0gcGF0aC5qb2luKGZpeHR1cmVzRGlyLCAnZXNsaW50aWdub3JlJywgJ2lnbm9yZWQuanMnKVxuY29uc3QgbW9kaWZpZWRJZ25vcmVQYXRoID0gcGF0aC5qb2luKGZpeHR1cmVzRGlyLFxuICAnbW9kaWZpZWQtaWdub3JlLXJ1bGUnLCAnZm9vLmpzJylcbmNvbnN0IG1vZGlmaWVkSWdub3JlU3BhY2VQYXRoID0gcGF0aC5qb2luKGZpeHR1cmVzRGlyLFxuICAnbW9kaWZpZWQtaWdub3JlLXJ1bGUnLCAnZm9vLXNwYWNlLmpzJylcbmNvbnN0IGVuZFJhbmdlUGF0aCA9IHBhdGguam9pbihmaXh0dXJlc0RpciwgJ2VuZC1yYW5nZScsICduby11bnJlYWNoYWJsZS5qcycpXG5jb25zdCBiYWRDYWNoZVBhdGggPSBwYXRoLmpvaW4oZml4dHVyZXNEaXIsICdiYWRDYWNoZScpXG5cbi8qKlxuICogQXN5bmMgaGVscGVyIHRvIGNvcHkgYSBmaWxlIGZyb20gb25lIHBsYWNlIHRvIGFub3RoZXIgb24gdGhlIGZpbGVzeXN0ZW0uXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGZpbGVUb0NvcHlQYXRoICBQYXRoIG9mIHRoZSBmaWxlIHRvIGJlIGNvcGllZFxuICogQHBhcmFtICB7c3RyaW5nfSBkZXN0aW5hdGlvbkRpciAgRGlyZWN0b3J5IHRvIHBhc3RlIHRoZSBmaWxlIGludG9cbiAqIEByZXR1cm4ge3N0cmluZ30gICAgICAgICAgICAgICAgIEZ1bGwgcGF0aCBvZiB0aGUgZmlsZSBpbiBjb3B5IGRlc3RpbmF0aW9uXG4gKi9cbmZ1bmN0aW9uIGNvcHlGaWxlVG9EaXIoZmlsZVRvQ29weVBhdGgsIGRlc3RpbmF0aW9uRGlyKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIGNvbnN0IGRlc3RpbmF0aW9uUGF0aCA9IHBhdGguam9pbihkZXN0aW5hdGlvbkRpciwgcGF0aC5iYXNlbmFtZShmaWxlVG9Db3B5UGF0aCkpXG4gICAgY29uc3Qgd3MgPSBmcy5jcmVhdGVXcml0ZVN0cmVhbShkZXN0aW5hdGlvblBhdGgpXG4gICAgd3Mub24oJ2Nsb3NlJywgKCkgPT4gcmVzb2x2ZShkZXN0aW5hdGlvblBhdGgpKVxuICAgIGZzLmNyZWF0ZVJlYWRTdHJlYW0oZmlsZVRvQ29weVBhdGgpLnBpcGUod3MpXG4gIH0pXG59XG5cbi8qKlxuICogVXRpbGl0eSBoZWxwZXIgdG8gY29weSBhIGZpbGUgaW50byB0aGUgT1MgdGVtcCBkaXJlY3RvcnkuXG4gKlxuICogQHBhcmFtICB7c3RyaW5nfSBmaWxlVG9Db3B5UGF0aCAgUGF0aCBvZiB0aGUgZmlsZSB0byBiZSBjb3BpZWRcbiAqIEByZXR1cm4ge3N0cmluZ30gICAgICAgICAgICAgICAgIEZ1bGwgcGF0aCBvZiB0aGUgZmlsZSBpbiBjb3B5IGRlc3RpbmF0aW9uXG4gKi9cbmZ1bmN0aW9uIGNvcHlGaWxlVG9UZW1wRGlyKGZpbGVUb0NvcHlQYXRoKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgIGNvbnN0IHRlbXBGaXh0dXJlRGlyID0gZnMubWtkdGVtcFN5bmModG1wZGlyKCkgKyBwYXRoLnNlcClcbiAgICByZXNvbHZlKGF3YWl0IGNvcHlGaWxlVG9EaXIoZmlsZVRvQ29weVBhdGgsIHRlbXBGaXh0dXJlRGlyKSlcbiAgfSlcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0Tm90aWZpY2F0aW9uKGV4cGVjdGVkTWVzc2FnZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBsZXQgbm90aWZpY2F0aW9uU3ViXG4gICAgY29uc3QgbmV3Tm90aWZpY2F0aW9uID0gKG5vdGlmaWNhdGlvbikgPT4ge1xuICAgICAgaWYgKG5vdGlmaWNhdGlvbi5nZXRNZXNzYWdlKCkgIT09IGV4cGVjdGVkTWVzc2FnZSkge1xuICAgICAgICAvLyBBcyB0aGUgc3BlY3MgZXhlY3V0ZSBhc3luY2hyb25vdXNseSwgaXQncyBwb3NzaWJsZSBhIG5vdGlmaWNhdGlvblxuICAgICAgICAvLyBmcm9tIGEgZGlmZmVyZW50IHNwZWMgd2FzIGdyYWJiZWQsIGlmIHRoZSBtZXNzYWdlIGRvZXNuJ3QgbWF0Y2ggd2hhdFxuICAgICAgICAvLyBpcyBleHBlY3RlZCBzaW1wbHkgcmV0dXJuIGFuZCBrZWVwIHdhaXRpbmcgZm9yIHRoZSBuZXh0IG1lc3NhZ2UuXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgLy8gRGlzcG9zZSBvZiB0aGUgbm90aWZpY2FpdG9uIHN1YnNjcmlwdGlvblxuICAgICAgbm90aWZpY2F0aW9uU3ViLmRpc3Bvc2UoKVxuICAgICAgcmVzb2x2ZShub3RpZmljYXRpb24pXG4gICAgfVxuICAgIC8vIFN1YnNjcmliZSB0byBBdG9tJ3Mgbm90aWZpY2F0aW9uc1xuICAgIG5vdGlmaWNhdGlvblN1YiA9IGF0b20ubm90aWZpY2F0aW9ucy5vbkRpZEFkZE5vdGlmaWNhdGlvbihuZXdOb3RpZmljYXRpb24pXG4gIH0pXG59XG5cbmFzeW5jIGZ1bmN0aW9uIG1ha2VGaXhlcyh0ZXh0RWRpdG9yKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgIC8vIFN1YnNjcmliZSB0byB0aGUgZmlsZSByZWxvYWQgZXZlbnRcbiAgICBjb25zdCBlZGl0b3JSZWxvYWRTdWIgPSB0ZXh0RWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkUmVsb2FkKGFzeW5jICgpID0+IHtcbiAgICAgIGVkaXRvclJlbG9hZFN1Yi5kaXNwb3NlKClcbiAgICAgIC8vIEZpbGUgaGFzIGJlZW4gcmVsb2FkZWQgaW4gQXRvbSwgbm90aWZpY2F0aW9uIGNoZWNraW5nIHdpbGwgaGFwcGVuXG4gICAgICAvLyBhc3luYyBlaXRoZXIgd2F5LCBidXQgc2hvdWxkIGFscmVhZHkgYmUgZmluaXNoZWQgYXQgdGhpcyBwb2ludFxuICAgICAgcmVzb2x2ZSgpXG4gICAgfSlcblxuICAgIC8vIE5vdyB0aGF0IGFsbCB0aGUgcmVxdWlyZWQgc3Vic2NyaXB0aW9ucyBhcmUgYWN0aXZlLCBzZW5kIG9mZiBhIGZpeCByZXF1ZXN0XG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcodGV4dEVkaXRvciksICdsaW50ZXItZXNsaW50OmZpeC1maWxlJylcbiAgICBjb25zdCBleHBlY3RlZE1lc3NhZ2UgPSAnTGludGVyLUVTTGludDogRml4IGNvbXBsZXRlLidcbiAgICBjb25zdCBub3RpZmljYXRpb24gPSBhd2FpdCBnZXROb3RpZmljYXRpb24oZXhwZWN0ZWRNZXNzYWdlKVxuXG4gICAgZXhwZWN0KG5vdGlmaWNhdGlvbi5nZXRNZXNzYWdlKCkpLnRvQmUoZXhwZWN0ZWRNZXNzYWdlKVxuICAgIGV4cGVjdChub3RpZmljYXRpb24uZ2V0VHlwZSgpKS50b0JlKCdzdWNjZXNzJylcbiAgfSlcbn1cblxuZGVzY3JpYmUoJ1RoZSBlc2xpbnQgcHJvdmlkZXIgZm9yIExpbnRlcicsICgpID0+IHtcbiAgY29uc3QgbGludGVyUHJvdmlkZXIgPSBsaW50ZXJFc2xpbnQucHJvdmlkZUxpbnRlcigpXG4gIGNvbnN0IGxpbnQgPSBsaW50ZXJQcm92aWRlci5saW50XG5cbiAgYmVmb3JlRWFjaChhc3luYyAoKSA9PiB7XG4gICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItZXNsaW50LmRpc2FibGVGU0NhY2hlJywgZmFsc2UpXG4gICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItZXNsaW50LmRpc2FibGVFc2xpbnRJZ25vcmUnLCB0cnVlKVxuXG4gICAgLy8gQWN0aXZhdGUgdGhlIEphdmFTY3JpcHQgbGFuZ3VhZ2Ugc28gQXRvbSBrbm93cyB3aGF0IHRoZSBmaWxlcyBhcmVcbiAgICBhd2FpdCBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtamF2YXNjcmlwdCcpXG4gICAgLy8gQWN0aXZhdGUgdGhlIHByb3ZpZGVyXG4gICAgYXdhaXQgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xpbnRlci1lc2xpbnQnKVxuICB9KVxuXG4gIGRlc2NyaWJlKCdjaGVja3MgYmFkLmpzIGFuZCcsICgpID0+IHtcbiAgICBsZXQgZWRpdG9yID0gbnVsbFxuICAgIGJlZm9yZUVhY2goYXN5bmMgKCkgPT4ge1xuICAgICAgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihiYWRQYXRoKVxuICAgIH0pXG5cbiAgICBpdCgndmVyaWZpZXMgdGhlIG1lc3NhZ2VzJywgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgbWVzc2FnZXMgPSBhd2FpdCBsaW50KGVkaXRvcilcbiAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMilcblxuICAgICAgY29uc3QgZXhwZWN0ZWQwID0gXCInZm9vJyBpcyBub3QgZGVmaW5lZC4gKG5vLXVuZGVmKVwiXG4gICAgICBjb25zdCBleHBlY3RlZDBVcmwgPSAnaHR0cDovL2VzbGludC5vcmcvZG9jcy9ydWxlcy9uby11bmRlZidcbiAgICAgIGNvbnN0IGV4cGVjdGVkMSA9ICdFeHRyYSBzZW1pY29sb24uIChzZW1pKSdcbiAgICAgIGNvbnN0IGV4cGVjdGVkMVVybCA9ICdodHRwOi8vZXNsaW50Lm9yZy9kb2NzL3J1bGVzL3NlbWknXG5cbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5zZXZlcml0eSkudG9CZSgnZXJyb3InKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmV4Y2VycHQpLnRvQmUoZXhwZWN0ZWQwKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnVybCkudG9CZShleHBlY3RlZDBVcmwpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0ubG9jYXRpb24uZmlsZSkudG9CZShiYWRQYXRoKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmxvY2F0aW9uLnBvc2l0aW9uKS50b0VxdWFsKFtbMCwgMF0sIFswLCAzXV0pXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0uc29sdXRpb25zKS5ub3QudG9CZURlZmluZWQoKVxuXG4gICAgICBleHBlY3QobWVzc2FnZXNbMV0uc2V2ZXJpdHkpLnRvQmUoJ2Vycm9yJylcbiAgICAgIGV4cGVjdChtZXNzYWdlc1sxXS5leGNlcnB0KS50b0JlKGV4cGVjdGVkMSlcbiAgICAgIGV4cGVjdChtZXNzYWdlc1sxXS51cmwpLnRvQmUoZXhwZWN0ZWQxVXJsKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzFdLmxvY2F0aW9uLmZpbGUpLnRvQmUoYmFkUGF0aClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1sxXS5sb2NhdGlvbi5wb3NpdGlvbikudG9FcXVhbChbWzAsIDhdLCBbMCwgOV1dKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzFdLnNvbHV0aW9ucy5sZW5ndGgpLnRvQmUoMSlcbiAgICAgIGV4cGVjdChtZXNzYWdlc1sxXS5zb2x1dGlvbnNbMF0ucG9zaXRpb24pLnRvRXF1YWwoW1swLCA2XSwgWzAsIDldXSlcbiAgICAgIGV4cGVjdChtZXNzYWdlc1sxXS5zb2x1dGlvbnNbMF0ucmVwbGFjZVdpdGgpLnRvQmUoJzQyJylcbiAgICB9KVxuICB9KVxuXG4gIGl0KCdmaW5kcyBub3RoaW5nIHdyb25nIHdpdGggYW4gZW1wdHkgZmlsZScsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBlZGl0b3IgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKGVtcHR5UGF0aClcbiAgICBjb25zdCBtZXNzYWdlcyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuXG4gICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgwKVxuICB9KVxuXG4gIGl0KCdmaW5kcyBub3RoaW5nIHdyb25nIHdpdGggYSB2YWxpZCBmaWxlJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oZ29vZFBhdGgpXG4gICAgY29uc3QgbWVzc2FnZXMgPSBhd2FpdCBsaW50KGVkaXRvcilcblxuICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMClcbiAgfSlcblxuICBpdCgncmVwb3J0cyB0aGUgZml4ZXMgZm9yIGZpeGFibGUgZXJyb3JzJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oZml4UGF0aClcbiAgICBjb25zdCBtZXNzYWdlcyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuXG4gICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnNvbHV0aW9uc1swXS5wb3NpdGlvbikudG9FcXVhbChbWzAsIDEwXSwgWzEsIDhdXSlcbiAgICBleHBlY3QobWVzc2FnZXNbMF0uc29sdXRpb25zWzBdLnJlcGxhY2VXaXRoKS50b0JlKCc2XFxuZnVuY3Rpb24nKVxuXG4gICAgZXhwZWN0KG1lc3NhZ2VzWzFdLnNvbHV0aW9uc1swXS5wb3NpdGlvbikudG9FcXVhbChbWzIsIDBdLCBbMiwgMV1dKVxuICAgIGV4cGVjdChtZXNzYWdlc1sxXS5zb2x1dGlvbnNbMF0ucmVwbGFjZVdpdGgpLnRvQmUoJyAgJylcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiByZXNvbHZpbmcgaW1wb3J0IHBhdGhzIHVzaW5nIGVzbGludC1wbHVnaW4taW1wb3J0JywgKCkgPT4ge1xuICAgIGl0KCdjb3JyZWN0bHkgcmVzb2x2ZXMgaW1wb3J0cyBmcm9tIHBhcmVudCcsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oaW1wb3J0aW5ncGF0aClcbiAgICAgIGNvbnN0IG1lc3NhZ2VzID0gYXdhaXQgbGludChlZGl0b3IpXG5cbiAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMClcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3dzIGEgbWVzc2FnZSBmb3IgYW4gaW52YWxpZCBpbXBvcnQnLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBlZGl0b3IgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKGJhZEltcG9ydFBhdGgpXG4gICAgICBjb25zdCBtZXNzYWdlcyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuICAgICAgY29uc3QgZXhwZWN0ZWQgPSBcIlVuYWJsZSB0byByZXNvbHZlIHBhdGggdG8gbW9kdWxlICcuLi9ub25leGlzdGVudCcuIChpbXBvcnQvbm8tdW5yZXNvbHZlZClcIlxuICAgICAgY29uc3QgZXhwZWN0ZWRVcmwgPSAnaHR0cHM6Ly9naXRodWIuY29tL2Jlbm1vc2hlci9lc2xpbnQtcGx1Z2luLWltcG9ydC9ibG9iL21hc3Rlci9kb2NzL3J1bGVzL25vLXVucmVzb2x2ZWQubWQnXG5cbiAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMSlcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5zZXZlcml0eSkudG9CZSgnZXJyb3InKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmV4Y2VycHQpLnRvQmUoZXhwZWN0ZWQpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0udXJsKS50b0JlKGV4cGVjdGVkVXJsKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmxvY2F0aW9uLmZpbGUpLnRvQmUoYmFkSW1wb3J0UGF0aClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5sb2NhdGlvbi5wb3NpdGlvbikudG9FcXVhbChbWzAsIDI0XSwgWzAsIDM5XV0pXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0uc29sdXRpb25zKS5ub3QudG9CZURlZmluZWQoKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gYSBmaWxlIGlzIHNwZWNpZmllZCBpbiBhbiAuZXNsaW50aWdub3JlIGZpbGUnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1lc2xpbnQuZGlzYWJsZUVzbGludElnbm9yZScsIGZhbHNlKVxuICAgIH0pXG5cbiAgICBpdCgnd2lsbCBub3QgZ2l2ZSB3YXJuaW5ncyB3aGVuIGxpbnRpbmcgdGhlIGZpbGUnLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBlZGl0b3IgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKGlnbm9yZWRQYXRoKVxuICAgICAgY29uc3QgbWVzc2FnZXMgPSBhd2FpdCBsaW50KGVkaXRvcilcblxuICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgwKVxuICAgIH0pXG5cbiAgICBpdCgnd2lsbCBub3QgZ2l2ZSB3YXJuaW5ncyB3aGVuIGF1dG9maXhpbmcgdGhlIGZpbGUnLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBlZGl0b3IgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKGlnbm9yZWRQYXRoKVxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKSwgJ2xpbnRlci1lc2xpbnQ6Zml4LWZpbGUnKVxuICAgICAgY29uc3QgZXhwZWN0ZWRNZXNzYWdlID0gJ0xpbnRlci1FU0xpbnQ6IEZpeCBjb21wbGV0ZS4nXG4gICAgICBjb25zdCBub3RpZmljYXRpb24gPSBhd2FpdCBnZXROb3RpZmljYXRpb24oZXhwZWN0ZWRNZXNzYWdlKVxuXG4gICAgICBleHBlY3Qobm90aWZpY2F0aW9uLmdldE1lc3NhZ2UoKSkudG9CZShleHBlY3RlZE1lc3NhZ2UpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnZml4ZXMgZXJyb3JzJywgKCkgPT4ge1xuICAgIGxldCBlZGl0b3JcbiAgICBsZXQgdGVtcERpclxuXG4gICAgYmVmb3JlRWFjaChhc3luYyAoKSA9PiB7XG4gICAgICAvLyBDb3B5IHRoZSBmaWxlIHRvIGEgdGVtcG9yYXJ5IGZvbGRlclxuICAgICAgY29uc3QgdGVtcEZpeHR1cmVQYXRoID0gYXdhaXQgY29weUZpbGVUb1RlbXBEaXIoZml4UGF0aClcbiAgICAgIGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4odGVtcEZpeHR1cmVQYXRoKVxuICAgICAgdGVtcERpciA9IHBhdGguZGlybmFtZSh0ZW1wRml4dHVyZVBhdGgpXG4gICAgICAvLyBDb3B5IHRoZSBjb25maWcgdG8gdGhlIHNhbWUgdGVtcG9yYXJ5IGRpcmVjdG9yeVxuICAgICAgYXdhaXQgY29weUZpbGVUb0Rpcihjb25maWdQYXRoLCB0ZW1wRGlyKVxuICAgIH0pXG5cbiAgICBhZnRlckVhY2goKCkgPT4ge1xuICAgICAgLy8gUmVtb3ZlIHRoZSB0ZW1wb3JhcnkgZGlyZWN0b3J5XG4gICAgICByaW1yYWYuc3luYyh0ZW1wRGlyKVxuICAgIH0pXG5cbiAgICBhc3luYyBmdW5jdGlvbiBmaXJzdExpbnQodGV4dEVkaXRvcikge1xuICAgICAgY29uc3QgbWVzc2FnZXMgPSBhd2FpdCBsaW50KHRleHRFZGl0b3IpXG4gICAgICAvLyBUaGUgb3JpZ2luYWwgZmlsZSBoYXMgdHdvIGVycm9yc1xuICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgyKVxuICAgIH1cblxuICAgIGl0KCdzaG91bGQgZml4IGxpbnRpbmcgZXJyb3JzJywgYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgZmlyc3RMaW50KGVkaXRvcilcbiAgICAgIGF3YWl0IG1ha2VGaXhlcyhlZGl0b3IpXG4gICAgICBjb25zdCBtZXNzYWdlc0FmdGVyRml4aW5nID0gYXdhaXQgbGludChlZGl0b3IpXG5cbiAgICAgIGV4cGVjdChtZXNzYWdlc0FmdGVyRml4aW5nLmxlbmd0aCkudG9CZSgwKVxuICAgIH0pXG5cbiAgICAvLyBOT1RFOiBUaGlzIGFjdHVhbGx5IHdvcmtzLCBidXQgaWYgYm90aCBzcGVjcyBpbiB0aGlzIGRlc2NyaWJlKCkgYXJlIGVuYWJsZWRcbiAgICAvLyBhIGJ1ZyB3aXRoaW4gQXRvbSBpcyBzb21ld2hhdCByZWxpYWJseSB0cmlnZ2VyZWQsIHNvIHRoaXMgbmVlZHMgdG8gc3RheVxuICAgIC8vIGRpc2FibGVkIGZvciBub3dcbiAgICB4aXQoJ3Nob3VsZCBub3QgZml4IGxpbnRpbmcgZXJyb3JzIGZvciBydWxlcyB0aGF0IGFyZSBkaXNhYmxlZCB3aXRoIHJ1bGVzVG9EaXNhYmxlV2hpbGVGaXhpbmcnLCBhc3luYyAoKSA9PiB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1lc2xpbnQucnVsZXNUb0Rpc2FibGVXaGlsZUZpeGluZycsIFsnc2VtaSddKVxuXG4gICAgICBhd2FpdCBmaXJzdExpbnQoZWRpdG9yKVxuICAgICAgYXdhaXQgbWFrZUZpeGVzKGVkaXRvcilcbiAgICAgIGNvbnN0IG1lc3NhZ2VzQWZ0ZXJGaXhpbmcgPSBhd2FpdCBsaW50KGVkaXRvcilcbiAgICAgIGNvbnN0IGV4cGVjdGVkID0gJ0V4dHJhIHNlbWljb2xvbi4gKHNlbWkpJ1xuICAgICAgY29uc3QgZXhwZWN0ZWRVcmwgPSAnaHR0cDovL2VzbGludC5vcmcvZG9jcy9ydWxlcy9zZW1pJ1xuXG4gICAgICBleHBlY3QobWVzc2FnZXNBZnRlckZpeGluZy5sZW5ndGgpLnRvQmUoMSlcbiAgICAgIGV4cGVjdChtZXNzYWdlc0FmdGVyRml4aW5nWzBdLmV4Y2VycHQpLnRvQmUoZXhwZWN0ZWQpXG4gICAgICBleHBlY3QobWVzc2FnZXNBZnRlckZpeGluZ1swXS51cmwpLnRvQmUoZXhwZWN0ZWRVcmwpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiBhbiBlc2xpbnQgY2FjaGUgZmlsZSBpcyBwcmVzZW50JywgKCkgPT4ge1xuICAgIGxldCBlZGl0b3JcbiAgICBsZXQgdGVtcERpclxuXG4gICAgYmVmb3JlRWFjaChhc3luYyAoKSA9PiB7XG4gICAgICAvLyBDb3B5IHRoZSBmaWxlIHRvIGEgdGVtcG9yYXJ5IGZvbGRlclxuICAgICAgY29uc3QgdGVtcEZpeHR1cmVQYXRoID0gYXdhaXQgY29weUZpbGVUb1RlbXBEaXIoZml4UGF0aClcbiAgICAgIGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4odGVtcEZpeHR1cmVQYXRoKVxuICAgICAgdGVtcERpciA9IHBhdGguZGlybmFtZSh0ZW1wRml4dHVyZVBhdGgpXG4gICAgICAvLyBDb3B5IHRoZSBjb25maWcgdG8gdGhlIHNhbWUgdGVtcG9yYXJ5IGRpcmVjdG9yeVxuICAgICAgYXdhaXQgY29weUZpbGVUb0Rpcihjb25maWdQYXRoLCB0ZW1wRGlyKVxuICAgIH0pXG5cbiAgICBhZnRlckVhY2goKCkgPT4ge1xuICAgICAgLy8gUmVtb3ZlIHRoZSB0ZW1wb3JhcnkgZGlyZWN0b3J5XG4gICAgICByaW1yYWYuc3luYyh0ZW1wRGlyKVxuICAgIH0pXG5cbiAgICBpdCgnZG9lcyBub3QgZGVsZXRlIHRoZSBjYWNoZSBmaWxlIHdoZW4gcGVyZm9ybWluZyBmaXhlcycsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IHRlbXBDYWNoZUZpbGUgPSBhd2FpdCBjb3B5RmlsZVRvRGlyKGNhY2hlUGF0aCwgdGVtcERpcilcbiAgICAgIGNvbnN0IGNoZWNrQ2FjaGVmaWxlRXhpc3RzID0gKCkgPT4ge1xuICAgICAgICBmcy5zdGF0U3luYyh0ZW1wQ2FjaGVGaWxlKVxuICAgICAgfVxuICAgICAgZXhwZWN0KGNoZWNrQ2FjaGVmaWxlRXhpc3RzKS5ub3QudG9UaHJvdygpXG4gICAgICBhd2FpdCBtYWtlRml4ZXMoZWRpdG9yKVxuICAgICAgZXhwZWN0KGNoZWNrQ2FjaGVmaWxlRXhpc3RzKS5ub3QudG9UaHJvdygpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnSWdub3JlcyBzcGVjaWZpZWQgcnVsZXMgd2hlbiBlZGl0aW5nJywgKCkgPT4ge1xuICAgIGNvbnN0IGV4cGVjdGVkID0gJ1RyYWlsaW5nIHNwYWNlcyBub3QgYWxsb3dlZC4gKG5vLXRyYWlsaW5nLXNwYWNlcyknXG4gICAgY29uc3QgZXhwZWN0ZWRVcmwgPSAnaHR0cDovL2VzbGludC5vcmcvZG9jcy9ydWxlcy9uby10cmFpbGluZy1zcGFjZXMnXG5cbiAgICBpdCgnZG9lcyBub3RoaW5nIG9uIHNhdmVkIGZpbGVzJywgYXN5bmMgKCkgPT4ge1xuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItZXNsaW50LnJ1bGVzVG9TaWxlbmNlV2hpbGVUeXBpbmcnLCBbJ25vLXRyYWlsaW5nLXNwYWNlcyddKVxuICAgICAgY29uc3QgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3Blbihtb2RpZmllZElnbm9yZVNwYWNlUGF0aClcbiAgICAgIGNvbnN0IG1lc3NhZ2VzID0gYXdhaXQgbGludChlZGl0b3IpXG5cbiAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMSlcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5zZXZlcml0eSkudG9CZSgnZXJyb3InKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmV4Y2VycHQpLnRvQmUoZXhwZWN0ZWQpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0udXJsKS50b0JlKGV4cGVjdGVkVXJsKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmxvY2F0aW9uLmZpbGUpLnRvQmUobW9kaWZpZWRJZ25vcmVTcGFjZVBhdGgpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0ubG9jYXRpb24ucG9zaXRpb24pLnRvRXF1YWwoW1swLCA5XSwgWzAsIDEwXV0pXG4gICAgfSlcblxuICAgIGl0KCd3b3JrcyB3aGVuIHRoZSBmaWxlIGlzIG1vZGlmaWVkJywgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3Blbihtb2RpZmllZElnbm9yZVBhdGgpXG5cbiAgICAgIC8vIFZlcmlmeSBubyBlcnJvciBiZWZvcmVcbiAgICAgIGNvbnN0IGZpcnN0TWVzc2FnZXMgPSBhd2FpdCBsaW50KGVkaXRvcilcbiAgICAgIGV4cGVjdChmaXJzdE1lc3NhZ2VzLmxlbmd0aCkudG9CZSgwKVxuXG4gICAgICAvLyBJbnNlcnQgYSBzcGFjZSBpbnRvIHRoZSBlZGl0b3JcbiAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5pbnNlcnQoWzAsIDldLCAnICcpXG5cbiAgICAgIC8vIFZlcmlmeSB0aGUgc3BhY2UgaXMgc2hvd2luZyBhbiBlcnJvclxuICAgICAgY29uc3QgbWVzc2FnZXMgPSBhd2FpdCBsaW50KGVkaXRvcilcbiAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMSlcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5zZXZlcml0eSkudG9CZSgnZXJyb3InKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmV4Y2VycHQpLnRvQmUoZXhwZWN0ZWQpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0udXJsKS50b0JlKGV4cGVjdGVkVXJsKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmxvY2F0aW9uLmZpbGUpLnRvQmUobW9kaWZpZWRJZ25vcmVQYXRoKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmxvY2F0aW9uLnBvc2l0aW9uKS50b0VxdWFsKFtbMCwgOV0sIFswLCAxMF1dKVxuXG4gICAgICAvLyBFbmFibGUgdGhlIG9wdGlvbiB1bmRlciB0ZXN0XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1lc2xpbnQucnVsZXNUb1NpbGVuY2VXaGlsZVR5cGluZycsIFsnbm8tdHJhaWxpbmctc3BhY2VzJ10pXG5cbiAgICAgIC8vIENoZWNrIHRoZSBsaW50IHJlc3VsdHNcbiAgICAgIGNvbnN0IG5ld01lc3NhZ2VzID0gYXdhaXQgbGludChlZGl0b3IpXG4gICAgICBleHBlY3QobmV3TWVzc2FnZXMubGVuZ3RoKS50b0JlKDApXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgncHJpbnRzIGRlYnVnZ2luZyBpbmZvcm1hdGlvbiB3aXRoIHRoZSBgZGVidWdgIGNvbW1hbmQnLCAoKSA9PiB7XG4gICAgbGV0IGVkaXRvclxuICAgIGNvbnN0IGV4cGVjdGVkTWVzc2FnZSA9ICdsaW50ZXItZXNsaW50IGRlYnVnZ2luZyBpbmZvcm1hdGlvbidcbiAgICBiZWZvcmVFYWNoKGFzeW5jICgpID0+IHtcbiAgICAgIGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oZ29vZFBhdGgpXG4gICAgfSlcblxuICAgIGl0KCdzaG93cyBhbiBpbmZvIG5vdGlmaWNhdGlvbicsIGFzeW5jICgpID0+IHtcbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvciksICdsaW50ZXItZXNsaW50OmRlYnVnJylcbiAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbiA9IGF3YWl0IGdldE5vdGlmaWNhdGlvbihleHBlY3RlZE1lc3NhZ2UpXG5cbiAgICAgIGV4cGVjdChub3RpZmljYXRpb24uZ2V0TWVzc2FnZSgpKS50b0JlKGV4cGVjdGVkTWVzc2FnZSlcbiAgICAgIGV4cGVjdChub3RpZmljYXRpb24uZ2V0VHlwZSgpKS50b0VxdWFsKCdpbmZvJylcbiAgICB9KVxuXG4gICAgaXQoJ2luY2x1ZGVzIGRlYnVnZ2luZyBpbmZvcm1hdGlvbiBpbiB0aGUgZGV0YWlscycsIGFzeW5jICgpID0+IHtcbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvciksICdsaW50ZXItZXNsaW50OmRlYnVnJylcbiAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbiA9IGF3YWl0IGdldE5vdGlmaWNhdGlvbihleHBlY3RlZE1lc3NhZ2UpXG4gICAgICBjb25zdCBkZXRhaWwgPSBub3RpZmljYXRpb24uZ2V0RGV0YWlsKClcblxuICAgICAgZXhwZWN0KGRldGFpbC5pbmNsdWRlcyhgQXRvbSB2ZXJzaW9uOiAke2F0b20uZ2V0VmVyc2lvbigpfWApKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QoZGV0YWlsLmluY2x1ZGVzKCdsaW50ZXItZXNsaW50IHZlcnNpb246JykpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChkZXRhaWwuaW5jbHVkZXMoYFBsYXRmb3JtOiAke3Byb2Nlc3MucGxhdGZvcm19YCkpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChkZXRhaWwuaW5jbHVkZXMoJ2xpbnRlci1lc2xpbnQgY29uZmlndXJhdGlvbjonKSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KGRldGFpbC5pbmNsdWRlcygnVXNpbmcgbG9jYWwgcHJvamVjdCBFU0xpbnQnKSkudG9CZSh0cnVlKVxuICAgIH0pXG4gIH0pXG5cbiAgaXQoJ2hhbmRsZXMgcmFuZ2VzIGluIG1lc3NhZ2VzJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oZW5kUmFuZ2VQYXRoKVxuICAgIGNvbnN0IG1lc3NhZ2VzID0gYXdhaXQgbGludChlZGl0b3IpXG4gICAgY29uc3QgZXhwZWN0ZWQgPSAnVW5yZWFjaGFibGUgY29kZS4gKG5vLXVucmVhY2hhYmxlKSdcbiAgICBjb25zdCBleHBlY3RlZFVybCA9ICdodHRwOi8vZXNsaW50Lm9yZy9kb2NzL3J1bGVzL25vLXVucmVhY2hhYmxlJ1xuXG4gICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnNldmVyaXR5KS50b0JlKCdlcnJvcicpXG4gICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmV4Y2VycHQpLnRvQmUoZXhwZWN0ZWQpXG4gICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnVybCkudG9CZShleHBlY3RlZFVybClcbiAgICBleHBlY3QobWVzc2FnZXNbMF0ubG9jYXRpb24uZmlsZSkudG9CZShlbmRSYW5nZVBhdGgpXG4gICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmxvY2F0aW9uLnBvc2l0aW9uKS50b0VxdWFsKFtbNSwgMl0sIFs2LCAxNV1dKVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3aGVuIHNldHRpbmcgYGRpc2FibGVXaGVuTm9Fc2xpbnRDb25maWdgIGlzIGZhbHNlJywgKCkgPT4ge1xuICAgIGxldCBlZGl0b3JcbiAgICBsZXQgdGVtcEZpeHR1cmVEaXJcblxuICAgIGJlZm9yZUVhY2goYXN5bmMgKCkgPT4ge1xuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItZXNsaW50LmRpc2FibGVXaGVuTm9Fc2xpbnRDb25maWcnLCBmYWxzZSlcblxuICAgICAgY29uc3QgdGVtcEZpbGVQYXRoID0gYXdhaXQgY29weUZpbGVUb1RlbXBEaXIoYmFkSW5saW5lUGF0aClcbiAgICAgIGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4odGVtcEZpbGVQYXRoKVxuICAgICAgdGVtcEZpeHR1cmVEaXIgPSBwYXRoLmRpcm5hbWUodGVtcEZpbGVQYXRoKVxuICAgIH0pXG5cbiAgICBhZnRlckVhY2goKCkgPT4ge1xuICAgICAgcmltcmFmLnN5bmModGVtcEZpeHR1cmVEaXIpXG4gICAgfSlcblxuICAgIGl0KCdlcnJvcnMgd2hlbiBubyBjb25maWcgZmlsZSBpcyBmb3VuZCcsIGFzeW5jICgpID0+IHtcbiAgICAgIGxldCBkaWRFcnJvclxuICAgICAgbGV0IGdvdExpbnRpbmdFcnJvcnNcblxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbWVzc2FnZXMgPSBhd2FpdCBsaW50KGVkaXRvcilcbiAgICAgICAgLy8gT2xkZXIgdmVyc2lvbnMgb2YgRVNMaW50IHdpbGwgcmVwb3J0IGFuIGVycm9yXG4gICAgICAgIC8vIChvciBpZiBjdXJyZW50IHVzZXIgcnVubmluZyB0ZXN0cyBoYXMgYSBjb25maWcgaW4gdGhlaXIgaG9tZSBkaXJlY3RvcnkpXG4gICAgICAgIGNvbnN0IGV4cGVjdGVkID0gXCInZm9vJyBpcyBub3QgZGVmaW5lZC4gKG5vLXVuZGVmKVwiXG4gICAgICAgIGNvbnN0IGV4cGVjdGVkVXJsID0gJ2h0dHA6Ly9lc2xpbnQub3JnL2RvY3MvcnVsZXMvbm8tdW5kZWYnXG4gICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMSlcbiAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmV4Y2VycHQpLnRvQmUoZXhwZWN0ZWQpXG4gICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS51cmwpLnRvQmUoZXhwZWN0ZWRVcmwpXG4gICAgICAgIGdvdExpbnRpbmdFcnJvcnMgPSB0cnVlXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgLy8gTmV3ZXIgdmVyc2lvbnMgb2YgRVNMaW50IHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uXG4gICAgICAgIGV4cGVjdChlcnIubWVzc2FnZSkudG9CZSgnTm8gRVNMaW50IGNvbmZpZ3VyYXRpb24gZm91bmQuJylcbiAgICAgICAgZGlkRXJyb3IgPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIGV4cGVjdChkaWRFcnJvciB8fCBnb3RMaW50aW5nRXJyb3JzKS50b0JlKHRydWUpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiBgZGlzYWJsZVdoZW5Ob0VzbGludENvbmZpZ2AgaXMgdHJ1ZScsICgpID0+IHtcbiAgICBsZXQgZWRpdG9yXG4gICAgbGV0IHRlbXBGaXh0dXJlRGlyXG5cbiAgICBiZWZvcmVFYWNoKGFzeW5jICgpID0+IHtcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLWVzbGludC5kaXNhYmxlV2hlbk5vRXNsaW50Q29uZmlnJywgdHJ1ZSlcblxuICAgICAgY29uc3QgdGVtcEZpbGVQYXRoID0gYXdhaXQgY29weUZpbGVUb1RlbXBEaXIoYmFkSW5saW5lUGF0aClcbiAgICAgIGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4odGVtcEZpbGVQYXRoKVxuICAgICAgdGVtcEZpeHR1cmVEaXIgPSBwYXRoLmRpcm5hbWUodGVtcEZpbGVQYXRoKVxuICAgIH0pXG5cbiAgICBhZnRlckVhY2goKCkgPT4ge1xuICAgICAgcmltcmFmLnN5bmModGVtcEZpeHR1cmVEaXIpXG4gICAgfSlcblxuICAgIGl0KCdkb2VzIG5vdCByZXBvcnQgZXJyb3JzIHdoZW4gbm8gY29uZmlnIGZpbGUgaXMgZm91bmQnLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBtZXNzYWdlcyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuXG4gICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDApXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnbGV0cyBFU0xpbnQgaGFuZGxlIGNvbmZpZ3VyYXRpb24nLCAoKSA9PiB7XG4gICAgaXQoJ3dvcmtzIHdoZW4gdGhlIGNhY2hlIGZhaWxzJywgYXN5bmMgKCkgPT4ge1xuICAgICAgLy8gRW5zdXJlIHRoZSBjYWNoZSBpcyBlbmFibGVkLCBzaW5jZSB3ZSB3aWxsIGJlIHRha2luZyBhZHZhbnRhZ2Ugb2ZcbiAgICAgIC8vIGEgZmFpbGluZyBpbiBpdCdzIG9wZXJhdGlvblxuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItZXNsaW50LmRpc2FibGVGU0NhY2hlJywgZmFsc2UpXG4gICAgICBjb25zdCBmb29QYXRoID0gcGF0aC5qb2luKGJhZENhY2hlUGF0aCwgJ3RlbXAnLCAnZm9vLmpzJylcbiAgICAgIGNvbnN0IG5ld0NvbmZpZ1BhdGggPSBwYXRoLmpvaW4oYmFkQ2FjaGVQYXRoLCAndGVtcCcsICcuZXNsaW50cmMuanMnKVxuICAgICAgY29uc3QgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3Blbihmb29QYXRoKVxuICAgICAgZnVuY3Rpb24gdW5kZWZNc2codmFyTmFtZSkge1xuICAgICAgICByZXR1cm4gYCcke3Zhck5hbWV9JyBpcyBub3QgZGVmaW5lZC4gKG5vLXVuZGVmKWBcbiAgICAgIH1cbiAgICAgIGNvbnN0IGV4cGVjdGVkVXJsID0gJ2h0dHA6Ly9lc2xpbnQub3JnL2RvY3MvcnVsZXMvbm8tdW5kZWYnXG5cbiAgICAgIC8vIFRyaWdnZXIgYSBmaXJzdCBsaW50IHRvIHdhcm0gdXAgdGhlIGNhY2hlIHdpdGggdGhlIGZpcnN0IGNvbmZpZyByZXN1bHRcbiAgICAgIGxldCBtZXNzYWdlcyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgyKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnNldmVyaXR5KS50b0JlKCdlcnJvcicpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0uZXhjZXJwdCkudG9CZSh1bmRlZk1zZygnY29uc29sZScpKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnVybCkudG9CZShleHBlY3RlZFVybClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5sb2NhdGlvbi5maWxlKS50b0JlKGZvb1BhdGgpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0ubG9jYXRpb24ucG9zaXRpb24pLnRvRXF1YWwoW1sxLCAyXSwgWzEsIDldXSlcbiAgICAgIGV4cGVjdChtZXNzYWdlc1sxXS5zZXZlcml0eSkudG9CZSgnZXJyb3InKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzFdLmV4Y2VycHQpLnRvQmUodW5kZWZNc2coJ2JhcicpKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzFdLnVybCkudG9CZShleHBlY3RlZFVybClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1sxXS5sb2NhdGlvbi5maWxlKS50b0JlKGZvb1BhdGgpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMV0ubG9jYXRpb24ucG9zaXRpb24pLnRvRXF1YWwoW1sxLCAxNF0sIFsxLCAxN11dKVxuXG4gICAgICAvLyBXcml0ZSB0aGUgbmV3IGNvbmZpZ3VyYXRpb24gZmlsZVxuICAgICAgY29uc3QgbmV3Q29uZmlnID0ge1xuICAgICAgICBlbnY6IHtcbiAgICAgICAgICBicm93c2VyOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgfVxuICAgICAgbGV0IGNvbmZpZ0NvbnRlbnRzID0gYG1vZHVsZS5leHBvcnRzID0gJHtKU09OLnN0cmluZ2lmeShuZXdDb25maWcsIG51bGwsIDIpfVxcbmBcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMobmV3Q29uZmlnUGF0aCwgY29uZmlnQ29udGVudHMpXG5cbiAgICAgIC8vIExpbnQgYWdhaW4sIEVTTGludCBzaG91bGQgcmVjb2duaXNlIHRoZSBuZXcgY29uZmlndXJhdGlvblxuICAgICAgLy8gVGhlIGNhY2hlZCBjb25maWcgcmVzdWx0cyBhcmUgc3RpbGwgcG9pbnRpbmcgYXQgdGhlIF9wYXJlbnRfIGZpbGUuIEVTTGludFxuICAgICAgLy8gd291bGQgcGFydGlhbGx5IGhhbmRsZSB0aGlzIHNpdHVhdGlvbiBpZiB0aGUgY29uZmlnIGZpbGUgd2FzIHNwZWNpZmllZFxuICAgICAgLy8gZnJvbSB0aGUgY2FjaGUuXG4gICAgICBtZXNzYWdlcyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgxKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnNldmVyaXR5KS50b0JlKCdlcnJvcicpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0uZXhjZXJwdCkudG9CZSh1bmRlZk1zZygnYmFyJykpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0udXJsKS50b0JlKGV4cGVjdGVkVXJsKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmxvY2F0aW9uLmZpbGUpLnRvQmUoZm9vUGF0aClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5sb2NhdGlvbi5wb3NpdGlvbikudG9FcXVhbChbWzEsIDE0XSwgWzEsIDE3XV0pXG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgY29uZmlndXJhdGlvblxuICAgICAgbmV3Q29uZmlnLnJ1bGVzID0ge1xuICAgICAgICAnbm8tdW5kZWYnOiAnb2ZmJyxcbiAgICAgIH1cbiAgICAgIGNvbmZpZ0NvbnRlbnRzID0gYG1vZHVsZS5leHBvcnRzID0gJHtKU09OLnN0cmluZ2lmeShuZXdDb25maWcsIG51bGwsIDIpfVxcbmBcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMobmV3Q29uZmlnUGF0aCwgY29uZmlnQ29udGVudHMpXG5cbiAgICAgIC8vIExpbnQgYWdhaW4sIGlmIHRoZSBjYWNoZSB3YXMgc3BlY2lmeWluZyB0aGUgZmlsZSBFU0xpbnQgYXQgdGhpcyBwb2ludFxuICAgICAgLy8gd291bGQgZmFpbCB0byB1cGRhdGUgdGhlIGNvbmZpZ3VyYXRpb24gZnVsbHksIGFuZCB3b3VsZCBzdGlsbCByZXBvcnQgYVxuICAgICAgLy8gbm8tdW5kZWYgZXJyb3IuXG4gICAgICBtZXNzYWdlcyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgwKVxuXG4gICAgICAvLyBEZWxldGUgdGhlIHRlbXBvcmFyeSBjb25maWd1cmF0aW9uIGZpbGVcbiAgICAgIGZzLnVubGlua1N5bmMobmV3Q29uZmlnUGF0aClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3b3JrcyB3aXRoIEhUTUwgZmlsZXMnLCAoKSA9PiB7XG4gICAgY29uc3QgZW1iZWRkZWRTY29wZSA9ICdzb3VyY2UuanMuZW1iZWRkZWQuaHRtbCdcbiAgICBjb25zdCBzY29wZXMgPSBsaW50ZXJQcm92aWRlci5ncmFtbWFyU2NvcGVzXG5cbiAgICBpdCgnYWRkcyB0aGUgSFRNTCBzY29wZSB3aGVuIHRoZSBzZXR0aW5nIGlzIGVuYWJsZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3Qoc2NvcGVzLmluY2x1ZGVzKGVtYmVkZGVkU2NvcGUpKS50b0JlKGZhbHNlKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItZXNsaW50LmxpbnRIdG1sRmlsZXMnLCB0cnVlKVxuICAgICAgZXhwZWN0KHNjb3Blcy5pbmNsdWRlcyhlbWJlZGRlZFNjb3BlKSkudG9CZSh0cnVlKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItZXNsaW50LmxpbnRIdG1sRmlsZXMnLCBmYWxzZSlcbiAgICAgIGV4cGVjdChzY29wZXMuaW5jbHVkZXMoZW1iZWRkZWRTY29wZSkpLnRvQmUoZmFsc2UpXG4gICAgfSlcblxuICAgIGl0KCdrZWVwcyB0aGUgSFRNTCBzY29wZSB3aXRoIGN1c3RvbSBzY29wZXMnLCAoKSA9PiB7XG4gICAgICBleHBlY3Qoc2NvcGVzLmluY2x1ZGVzKGVtYmVkZGVkU2NvcGUpKS50b0JlKGZhbHNlKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItZXNsaW50LmxpbnRIdG1sRmlsZXMnLCB0cnVlKVxuICAgICAgZXhwZWN0KHNjb3Blcy5pbmNsdWRlcyhlbWJlZGRlZFNjb3BlKSkudG9CZSh0cnVlKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItZXNsaW50LnNjb3BlcycsIFsnZm9vLmJhciddKVxuICAgICAgZXhwZWN0KHNjb3Blcy5pbmNsdWRlcyhlbWJlZGRlZFNjb3BlKSkudG9CZSh0cnVlKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ2hhbmRsZXMgdGhlIFNob3cgUnVsZSBJRCBpbiBNZXNzYWdlcyBvcHRpb24nLCAoKSA9PiB7XG4gICAgY29uc3QgZXhwZWN0ZWRVcmwgPSAnaHR0cHM6Ly9naXRodWIuY29tL2Jlbm1vc2hlci9lc2xpbnQtcGx1Z2luLWltcG9ydC9ibG9iL21hc3Rlci9kb2NzL3J1bGVzL25vLXVucmVzb2x2ZWQubWQnXG5cbiAgICBpdCgnc2hvd3MgdGhlIHJ1bGUgSUQgd2hlbiBlbmFibGVkJywgYXN5bmMgKCkgPT4ge1xuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItZXNsaW50LnNob3dSdWxlSWRJbk1lc3NhZ2UnLCB0cnVlKVxuICAgICAgY29uc3QgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihiYWRJbXBvcnRQYXRoKVxuICAgICAgY29uc3QgbWVzc2FnZXMgPSBhd2FpdCBsaW50KGVkaXRvcilcbiAgICAgIGNvbnN0IGV4cGVjdGVkID0gXCJVbmFibGUgdG8gcmVzb2x2ZSBwYXRoIHRvIG1vZHVsZSAnLi4vbm9uZXhpc3RlbnQnLiAoaW1wb3J0L25vLXVucmVzb2x2ZWQpXCJcblxuICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgxKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnNldmVyaXR5KS50b0JlKCdlcnJvcicpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0uZXhjZXJwdCkudG9CZShleHBlY3RlZClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS51cmwpLnRvQmUoZXhwZWN0ZWRVcmwpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0ubG9jYXRpb24uZmlsZSkudG9CZShiYWRJbXBvcnRQYXRoKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmxvY2F0aW9uLnBvc2l0aW9uKS50b0VxdWFsKFtbMCwgMjRdLCBbMCwgMzldXSlcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5zb2x1dGlvbnMpLm5vdC50b0JlRGVmaW5lZCgpXG4gICAgfSlcblxuICAgIGl0KFwiZG9lc24ndCBzaG93IHRoZSBydWxlIElEIHdoZW4gZGlzYWJsZWRcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItZXNsaW50LnNob3dSdWxlSWRJbk1lc3NhZ2UnLCBmYWxzZSlcbiAgICAgIGNvbnN0IGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oYmFkSW1wb3J0UGF0aClcbiAgICAgIGNvbnN0IG1lc3NhZ2VzID0gYXdhaXQgbGludChlZGl0b3IpXG4gICAgICBjb25zdCBleHBlY3RlZCA9IFwiVW5hYmxlIHRvIHJlc29sdmUgcGF0aCB0byBtb2R1bGUgJy4uL25vbmV4aXN0ZW50Jy5cIlxuXG4gICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDEpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0uc2V2ZXJpdHkpLnRvQmUoJ2Vycm9yJylcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5leGNlcnB0KS50b0JlKGV4cGVjdGVkKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnVybCkudG9CZShleHBlY3RlZFVybClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5sb2NhdGlvbi5maWxlKS50b0JlKGJhZEltcG9ydFBhdGgpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0ubG9jYXRpb24ucG9zaXRpb24pLnRvRXF1YWwoW1swLCAyNF0sIFswLCAzOV1dKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnNvbHV0aW9ucykubm90LnRvQmVEZWZpbmVkKClcbiAgICB9KVxuICB9KVxufSlcbiJdfQ==