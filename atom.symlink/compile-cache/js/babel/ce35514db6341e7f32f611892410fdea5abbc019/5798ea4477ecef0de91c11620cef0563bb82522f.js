function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/* global emit */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atomLinter = require('atom-linter');

var _workerHelpers = require('./worker-helpers');

var Helpers = _interopRequireWildcard(_workerHelpers);

var _isConfigAtHomeRoot = require('./is-config-at-home-root');

var _isConfigAtHomeRoot2 = _interopRequireDefault(_isConfigAtHomeRoot);

'use babel';

process.title = 'linter-eslint helper';

function lintJob(_ref) {
  var cliEngineOptions = _ref.cliEngineOptions;
  var contents = _ref.contents;
  var eslint = _ref.eslint;
  var filePath = _ref.filePath;

  var cliEngine = new eslint.CLIEngine(cliEngineOptions);
  return cliEngine.executeOnText(contents, filePath);
}

function fixJob(_ref2) {
  var cliEngineOptions = _ref2.cliEngineOptions;
  var contents = _ref2.contents;
  var eslint = _ref2.eslint;
  var filePath = _ref2.filePath;

  var report = lintJob({ cliEngineOptions: cliEngineOptions, contents: contents, eslint: eslint, filePath: filePath });

  eslint.CLIEngine.outputFixes(report);

  if (!report.results.length || !report.results[0].messages.length) {
    return 'Linter-ESLint: Fix complete.';
  }
  return 'Linter-ESLint: Fix attempt complete, but linting errors remain.';
}

module.exports = _asyncToGenerator(function* () {
  process.on('message', function (jobConfig) {
    var contents = jobConfig.contents;
    var type = jobConfig.type;
    var config = jobConfig.config;
    var filePath = jobConfig.filePath;
    var projectPath = jobConfig.projectPath;
    var rules = jobConfig.rules;
    var emitKey = jobConfig.emitKey;

    if (config.disableFSCache) {
      _atomLinter.FindCache.clear();
    }

    var fileDir = _path2['default'].dirname(filePath);
    var eslint = Helpers.getESLintInstance(fileDir, config, projectPath);
    var configPath = Helpers.getConfigPath(fileDir);
    var noProjectConfig = configPath === null || (0, _isConfigAtHomeRoot2['default'])(configPath);
    if (noProjectConfig && config.disableWhenNoEslintConfig) {
      emit(emitKey, []);
      return;
    }

    var relativeFilePath = Helpers.getRelativePath(fileDir, filePath, config);

    var cliEngineOptions = Helpers.getCLIEngineOptions(type, config, rules, relativeFilePath, fileDir, configPath);

    var response = undefined;
    if (type === 'lint') {
      var report = lintJob({ cliEngineOptions: cliEngineOptions, contents: contents, eslint: eslint, filePath: filePath });
      response = report.results.length ? report.results[0].messages : [];
    } else if (type === 'fix') {
      response = fixJob({ cliEngineOptions: cliEngineOptions, contents: contents, eslint: eslint, filePath: filePath });
    } else if (type === 'debug') {
      var modulesDir = _path2['default'].dirname((0, _atomLinter.findCached)(fileDir, 'node_modules/eslint') || '');
      response = Helpers.findESLintDirectory(modulesDir, config);
    }
    emit(emitKey, response);
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvd29ya2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O29CQUlpQixNQUFNOzs7OzBCQUNlLGFBQWE7OzZCQUMxQixrQkFBa0I7O0lBQS9CLE9BQU87O2tDQUNZLDBCQUEwQjs7OztBQVB6RCxXQUFXLENBQUE7O0FBU1gsT0FBTyxDQUFDLEtBQUssR0FBRyxzQkFBc0IsQ0FBQTs7QUFFdEMsU0FBUyxPQUFPLENBQUMsSUFBZ0QsRUFBRTtNQUFoRCxnQkFBZ0IsR0FBbEIsSUFBZ0QsQ0FBOUMsZ0JBQWdCO01BQUUsUUFBUSxHQUE1QixJQUFnRCxDQUE1QixRQUFRO01BQUUsTUFBTSxHQUFwQyxJQUFnRCxDQUFsQixNQUFNO01BQUUsUUFBUSxHQUE5QyxJQUFnRCxDQUFWLFFBQVE7O0FBQzdELE1BQU0sU0FBUyxHQUFHLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0FBQ3hELFNBQU8sU0FBUyxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUE7Q0FDbkQ7O0FBRUQsU0FBUyxNQUFNLENBQUMsS0FBZ0QsRUFBRTtNQUFoRCxnQkFBZ0IsR0FBbEIsS0FBZ0QsQ0FBOUMsZ0JBQWdCO01BQUUsUUFBUSxHQUE1QixLQUFnRCxDQUE1QixRQUFRO01BQUUsTUFBTSxHQUFwQyxLQUFnRCxDQUFsQixNQUFNO01BQUUsUUFBUSxHQUE5QyxLQUFnRCxDQUFWLFFBQVE7O0FBQzVELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxFQUFFLGdCQUFnQixFQUFoQixnQkFBZ0IsRUFBRSxRQUFRLEVBQVIsUUFBUSxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUUsUUFBUSxFQUFSLFFBQVEsRUFBRSxDQUFDLENBQUE7O0FBRXhFLFFBQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFBOztBQUVw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c2Vycy9zaGFubm9uYmVydHVjY2kvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvd29ya2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuLyogZ2xvYmFsIGVtaXQgKi9cblxuaW1wb3J0IFBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IEZpbmRDYWNoZSwgZmluZENhY2hlZCB9IGZyb20gJ2F0b20tbGludGVyJ1xuaW1wb3J0ICogYXMgSGVscGVycyBmcm9tICcuL3dvcmtlci1oZWxwZXJzJ1xuaW1wb3J0IGlzQ29uZmlnQXRIb21lUm9vdCBmcm9tICcuL2lzLWNvbmZpZy1hdC1ob21lLXJvb3QnXG5cbnByb2Nlc3MudGl0bGUgPSAnbGludGVyLWVzbGludCBoZWxwZXInXG5cbmZ1bmN0aW9uIGxpbnRKb2IoeyBjbGlFbmdpbmVPcHRpb25zLCBjb250ZW50cywgZXNsaW50LCBmaWxlUGF0aCB9KSB7XG4gIGNvbnN0IGNsaUVuZ2luZSA9IG5ldyBlc2xpbnQuQ0xJRW5naW5lKGNsaUVuZ2luZU9wdGlvbnMpXG4gIHJldHVybiBjbGlFbmdpbmUuZXhlY3V0ZU9uVGV4dChjb250ZW50cywgZmlsZVBhdGgpXG59XG5cbmZ1bmN0aW9uIGZpeEpvYih7IGNsaUVuZ2luZU9wdGlvbnMsIGNvbnRlbnRzLCBlc2xpbnQsIGZpbGVQYXRoIH0pIHtcbiAgY29uc3QgcmVwb3J0ID0gbGludEpvYih7IGNsaUVuZ2luZU9wdGlvbnMsIGNvbnRlbnRzLCBlc2xpbnQsIGZpbGVQYXRoIH0pXG5cbiAgZXNsaW50LkNMSUVuZ2luZS5vdXRwdXRGaXhlcyhyZXBvcnQpXG5cbiAgaWYgKCFyZXBvcnQucmVzdWx0cy5sZW5ndGggfHwgIXJlcG9ydC5yZXN1bHRzWzBdLm1lc3NhZ2VzLmxlbmd0aCkge1xuICAgIHJldHVybiAnTGludGVyLUVTTGludDogRml4IGNvbXBsZXRlLidcbiAgfVxuICByZXR1cm4gJ0xpbnRlci1FU0xpbnQ6IEZpeCBhdHRlbXB0IGNvbXBsZXRlLCBidXQgbGludGluZyBlcnJvcnMgcmVtYWluLidcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiAoKSB7XG4gIHByb2Nlc3Mub24oJ21lc3NhZ2UnLCAoam9iQ29uZmlnKSA9PiB7XG4gICAgY29uc3QgeyBjb250ZW50cywgdHlwZSwgY29uZmlnLCBmaWxlUGF0aCwgcHJvamVjdFBhdGgsIHJ1bGVzLCBlbWl0S2V5IH0gPSBqb2JDb25maWdcbiAgICBpZiAoY29uZmlnLmRpc2FibGVGU0NhY2hlKSB7XG4gICAgICBGaW5kQ2FjaGUuY2xlYXIoKVxuICAgIH1cblxuICAgIGNvbnN0IGZpbGVEaXIgPSBQYXRoLmRpcm5hbWUoZmlsZVBhdGgpXG4gICAgY29uc3QgZXNsaW50ID0gSGVscGVycy5nZXRFU0xpbnRJbnN0YW5jZShmaWxlRGlyLCBjb25maWcsIHByb2plY3RQYXRoKVxuICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBIZWxwZXJzLmdldENvbmZpZ1BhdGgoZmlsZURpcilcbiAgICBjb25zdCBub1Byb2plY3RDb25maWcgPSAoY29uZmlnUGF0aCA9PT0gbnVsbCB8fCBpc0NvbmZpZ0F0SG9tZVJvb3QoY29uZmlnUGF0aCkpXG4gICAgaWYgKG5vUHJvamVjdENvbmZpZyAmJiBjb25maWcuZGlzYWJsZVdoZW5Ob0VzbGludENvbmZpZykge1xuICAgICAgZW1pdChlbWl0S2V5LCBbXSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IHJlbGF0aXZlRmlsZVBhdGggPSBIZWxwZXJzLmdldFJlbGF0aXZlUGF0aChmaWxlRGlyLCBmaWxlUGF0aCwgY29uZmlnKVxuXG4gICAgY29uc3QgY2xpRW5naW5lT3B0aW9ucyA9IEhlbHBlcnMuZ2V0Q0xJRW5naW5lT3B0aW9ucyhcbiAgICAgIHR5cGUsIGNvbmZpZywgcnVsZXMsIHJlbGF0aXZlRmlsZVBhdGgsIGZpbGVEaXIsIGNvbmZpZ1BhdGhcbiAgICApXG5cbiAgICBsZXQgcmVzcG9uc2VcbiAgICBpZiAodHlwZSA9PT0gJ2xpbnQnKSB7XG4gICAgICBjb25zdCByZXBvcnQgPSBsaW50Sm9iKHsgY2xpRW5naW5lT3B0aW9ucywgY29udGVudHMsIGVzbGludCwgZmlsZVBhdGggfSlcbiAgICAgIHJlc3BvbnNlID0gcmVwb3J0LnJlc3VsdHMubGVuZ3RoID8gcmVwb3J0LnJlc3VsdHNbMF0ubWVzc2FnZXMgOiBbXVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2ZpeCcpIHtcbiAgICAgIHJlc3BvbnNlID0gZml4Sm9iKHsgY2xpRW5naW5lT3B0aW9ucywgY29udGVudHMsIGVzbGludCwgZmlsZVBhdGggfSlcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdkZWJ1ZycpIHtcbiAgICAgIGNvbnN0IG1vZHVsZXNEaXIgPSBQYXRoLmRpcm5hbWUoZmluZENhY2hlZChmaWxlRGlyLCAnbm9kZV9tb2R1bGVzL2VzbGludCcpIHx8ICcnKVxuICAgICAgcmVzcG9uc2UgPSBIZWxwZXJzLmZpbmRFU0xpbnREaXJlY3RvcnkobW9kdWxlc0RpciwgY29uZmlnKVxuICAgIH1cbiAgICBlbWl0KGVtaXRLZXksIHJlc3BvbnNlKVxuICB9KVxufVxuIl19