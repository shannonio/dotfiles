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

var rulesMetadata = new Map();
var shouldSendRules = false;

function lintJob(_ref) {
  var cliEngineOptions = _ref.cliEngineOptions;
  var contents = _ref.contents;
  var eslint = _ref.eslint;
  var filePath = _ref.filePath;

  var cliEngine = new eslint.CLIEngine(cliEngineOptions);
  var report = cliEngine.executeOnText(contents, filePath);
  var rules = Helpers.getRules(cliEngine);
  shouldSendRules = Helpers.didRulesChange(rulesMetadata, rules);
  if (shouldSendRules) {
    // Rebuild rulesMetadata
    rulesMetadata.clear();
    rules.forEach(function (properties, rule) {
      return rulesMetadata.set(rule, properties);
    });
  }
  return report;
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
    // We catch all worker errors so that we can create a separate error emitter
    // for each emitKey, rather than adding multiple listeners for `task:error`
    var contents = jobConfig.contents;
    var type = jobConfig.type;
    var config = jobConfig.config;
    var filePath = jobConfig.filePath;
    var projectPath = jobConfig.projectPath;
    var rules = jobConfig.rules;
    var emitKey = jobConfig.emitKey;

    try {
      if (config.disableFSCache) {
        _atomLinter.FindCache.clear();
      }

      var fileDir = _path2['default'].dirname(filePath);
      var eslint = Helpers.getESLintInstance(fileDir, config, projectPath);
      var configPath = Helpers.getConfigPath(fileDir);
      var noProjectConfig = configPath === null || (0, _isConfigAtHomeRoot2['default'])(configPath);
      if (noProjectConfig && config.disableWhenNoEslintConfig) {
        emit(emitKey, { messages: [] });
        return;
      }

      var relativeFilePath = Helpers.getRelativePath(fileDir, filePath, config, projectPath);

      var cliEngineOptions = Helpers.getCLIEngineOptions(type, config, rules, relativeFilePath, fileDir, configPath);

      var response = undefined;
      if (type === 'lint') {
        var report = lintJob({ cliEngineOptions: cliEngineOptions, contents: contents, eslint: eslint, filePath: filePath });
        response = {
          messages: report.results.length ? report.results[0].messages : []
        };
        if (shouldSendRules) {
          // You can't emit Maps, convert to Array of Arrays to send back.
          response.updatedRules = Array.from(rulesMetadata);
        }
      } else if (type === 'fix') {
        response = fixJob({ cliEngineOptions: cliEngineOptions, contents: contents, eslint: eslint, filePath: filePath });
      } else if (type === 'debug') {
        var modulesDir = _path2['default'].dirname((0, _atomLinter.findCached)(fileDir, 'node_modules/eslint') || '');
        response = Helpers.findESLintDirectory(modulesDir, config, projectPath);
      }
      emit(emitKey, response);
    } catch (workerErr) {
      emit('workerError:' + emitKey, { msg: workerErr.message, stack: workerErr.stack });
    }
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmRvdGZpbGVzL2F0b20uc3ltbGluay9wYWNrYWdlcy9saW50ZXItZXNsaW50L3NyYy93b3JrZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7b0JBSWlCLE1BQU07Ozs7MEJBQ2UsYUFBYTs7NkJBQzFCLGtCQUFrQjs7SUFBL0IsT0FBTzs7a0NBQ1ksMEJBQTBCOzs7O0FBUHpELFdBQVcsQ0FBQTs7QUFTWCxPQUFPLENBQUMsS0FBSyxHQUFHLHNCQUFzQixDQUFBOztBQUV0QyxJQUFNLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQy9CLElBQUksZUFBZSxHQUFHLEtBQUssQ0FBQTs7QUFFM0IsU0FBUyxPQUFPLENBQUMsSUFBZ0QsRUFBRTtNQUFoRCxnQkFBZ0IsR0FBbEIsSUFBZ0QsQ0FBOUMsZ0JBQWdCO01BQUUsUUFBUSxHQUE1QixJQUFnRCxDQUE1QixRQUFRO01BQUUsTUFBTSxHQUFwQyxJQUFnRCxDQUFsQixNQUFNO01BQUUsUUFBUSxHQUE5QyxJQUFnRCxDQUFWLFFBQVE7O0FBQzdELE1BQU0sU0FBUyxHQUFHLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0FBQ3hELE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0FBQzFELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDekMsaUJBQWUsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQTtBQUM5RCxNQUFJLGVBQWUsRUFBRTs7QUFFbkIsaUJBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUNyQixTQUFLLENBQUMsT0FBTyxDQUFDLFVBQUMsVUFBVSxFQUFFLElBQUk7YUFBSyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUM7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QUMsUUFBUSxHQUFHLEVBQUU7U0FDbEUsQ0FBQTtBQUNELFlBQUksZUFBZSxFQUFFOztBQUVuQixrQkFBUSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO1NBQ2xEO09BQ0YsTUFBTSxJQUFJLElBQUksS0FBSyxLQUFLLEVBQUU7QUFDekIsZ0JBQVEsR0FBRyxNQUFNLENBQUMsRUFBRSxnQkFBZ0IsRUFBaEIsZ0JBQWdCLEVBQUUsUUFBUSxFQUFSLFFBQVEsRUFBRSxNQUFNLEVBQU4sTUFBTSxFQUFFLFFBQVEsRUFBUixRQUFRLEVBQUUsQ0FBQyxDQUFBO09BQ3BFLE1BQU0sSUFBSSxJQUFJLEtBQUssT0FBTyxFQUFFO0FBQzNCLFlBQU0sVUFBVSxHQUFHLGtCQUFLLE9BQU8sQ0FBQyw0QkFBVyxPQUFPLEVBQUUscUJBQXFCLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUNqRixnQkFBUSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFBO09BQ3hFO0FBQ0QsVUFBSSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUN4QixDQUFDLE9BQU8sU0FBUyxFQUFFO0FBQ2xCLFVBQUksa0JBQWdCLE9BQU8sRUFBSSxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQTtLQUNuRjtHQUNGLENBQUMsQ0FBQTtDQUNILENBQUEsQ0FBQSIsImZpbGUiOiIvVXNlcnMvc2hhbm5vbmJlcnR1Y2NpLy5kb3RmaWxlcy9hdG9tLnN5bWxpbmsvcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvd29ya2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuLyogZ2xvYmFsIGVtaXQgKi9cblxuaW1wb3J0IFBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IEZpbmRDYWNoZSwgZmluZENhY2hlZCB9IGZyb20gJ2F0b20tbGludGVyJ1xuaW1wb3J0ICogYXMgSGVscGVycyBmcm9tICcuL3dvcmtlci1oZWxwZXJzJ1xuaW1wb3J0IGlzQ29uZmlnQXRIb21lUm9vdCBmcm9tICcuL2lzLWNvbmZpZy1hdC1ob21lLXJvb3QnXG5cbnByb2Nlc3MudGl0bGUgPSAnbGludGVyLWVzbGludCBoZWxwZXInXG5cbmNvbnN0IHJ1bGVzTWV0YWRhdGEgPSBuZXcgTWFwKClcbmxldCBzaG91bGRTZW5kUnVsZXMgPSBmYWxzZVxuXG5mdW5jdGlvbiBsaW50Sm9iKHsgY2xpRW5naW5lT3B0aW9ucywgY29udGVudHMsIGVzbGludCwgZmlsZVBhdGggfSkge1xuICBjb25zdCBjbGlFbmdpbmUgPSBuZXcgZXNsaW50LkNMSUVuZ2luZShjbGlFbmdpbmVPcHRpb25zKVxuICBjb25zdCByZXBvcnQgPSBjbGlFbmdpbmUuZXhlY3V0ZU9uVGV4dChjb250ZW50cywgZmlsZVBhdGgpXG4gIGNvbnN0IHJ1bGVzID0gSGVscGVycy5nZXRSdWxlcyhjbGlFbmdpbmUpXG4gIHNob3VsZFNlbmRSdWxlcyA9IEhlbHBlcnMuZGlkUnVsZXNDaGFuZ2UocnVsZXNNZXRhZGF0YSwgcnVsZXMpXG4gIGlmIChzaG91bGRTZW5kUnVsZXMpIHtcbiAgICAvLyBSZWJ1aWxkIHJ1bGVzTWV0YWRhdGFcbiAgICBydWxlc01ldGFkYXRhLmNsZWFyKClcbiAgICBydWxlcy5mb3JFYWNoKChwcm9wZXJ0aWVzLCBydWxlKSA9PiBydWxlc01ldGFkYXRhLnNldChydWxlLCBwcm9wZXJ0aWVzKSlcbiAgfVxuICByZXR1cm4gcmVwb3J0XG59XG5cbmZ1bmN0aW9uIGZpeEpvYih7IGNsaUVuZ2luZU9wdGlvbnMsIGNvbnRlbnRzLCBlc2xpbnQsIGZpbGVQYXRoIH0pIHtcbiAgY29uc3QgcmVwb3J0ID0gbGludEpvYih7IGNsaUVuZ2luZU9wdGlvbnMsIGNvbnRlbnRzLCBlc2xpbnQsIGZpbGVQYXRoIH0pXG5cbiAgZXNsaW50LkNMSUVuZ2luZS5vdXRwdXRGaXhlcyhyZXBvcnQpXG5cbiAgaWYgKCFyZXBvcnQucmVzdWx0cy5sZW5ndGggfHwgIXJlcG9ydC5yZXN1bHRzWzBdLm1lc3NhZ2VzLmxlbmd0aCkge1xuICAgIHJldHVybiAnTGludGVyLUVTTGludDogRml4IGNvbXBsZXRlLidcbiAgfVxuICByZXR1cm4gJ0xpbnRlci1FU0xpbnQ6IEZpeCBhdHRlbXB0IGNvbXBsZXRlLCBidXQgbGludGluZyBlcnJvcnMgcmVtYWluLidcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhc3luYyAoKSA9PiB7XG4gIHByb2Nlc3Mub24oJ21lc3NhZ2UnLCAoam9iQ29uZmlnKSA9PiB7XG4gICAgLy8gV2UgY2F0Y2ggYWxsIHdvcmtlciBlcnJvcnMgc28gdGhhdCB3ZSBjYW4gY3JlYXRlIGEgc2VwYXJhdGUgZXJyb3IgZW1pdHRlclxuICAgIC8vIGZvciBlYWNoIGVtaXRLZXksIHJhdGhlciB0aGFuIGFkZGluZyBtdWx0aXBsZSBsaXN0ZW5lcnMgZm9yIGB0YXNrOmVycm9yYFxuICAgIGNvbnN0IHtcbiAgICAgIGNvbnRlbnRzLCB0eXBlLCBjb25maWcsIGZpbGVQYXRoLCBwcm9qZWN0UGF0aCwgcnVsZXMsIGVtaXRLZXlcbiAgICB9ID0gam9iQ29uZmlnXG4gICAgdHJ5IHtcbiAgICAgIGlmIChjb25maWcuZGlzYWJsZUZTQ2FjaGUpIHtcbiAgICAgICAgRmluZENhY2hlLmNsZWFyKClcbiAgICAgIH1cblxuICAgICAgY29uc3QgZmlsZURpciA9IFBhdGguZGlybmFtZShmaWxlUGF0aClcbiAgICAgIGNvbnN0IGVzbGludCA9IEhlbHBlcnMuZ2V0RVNMaW50SW5zdGFuY2UoZmlsZURpciwgY29uZmlnLCBwcm9qZWN0UGF0aClcbiAgICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBIZWxwZXJzLmdldENvbmZpZ1BhdGgoZmlsZURpcilcbiAgICAgIGNvbnN0IG5vUHJvamVjdENvbmZpZyA9IChjb25maWdQYXRoID09PSBudWxsIHx8IGlzQ29uZmlnQXRIb21lUm9vdChjb25maWdQYXRoKSlcbiAgICAgIGlmIChub1Byb2plY3RDb25maWcgJiYgY29uZmlnLmRpc2FibGVXaGVuTm9Fc2xpbnRDb25maWcpIHtcbiAgICAgICAgZW1pdChlbWl0S2V5LCB7IG1lc3NhZ2VzOiBbXSB9KVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVsYXRpdmVGaWxlUGF0aCA9IEhlbHBlcnMuZ2V0UmVsYXRpdmVQYXRoKGZpbGVEaXIsIGZpbGVQYXRoLCBjb25maWcsIHByb2plY3RQYXRoKVxuXG4gICAgICBjb25zdCBjbGlFbmdpbmVPcHRpb25zID0gSGVscGVyc1xuICAgICAgICAuZ2V0Q0xJRW5naW5lT3B0aW9ucyh0eXBlLCBjb25maWcsIHJ1bGVzLCByZWxhdGl2ZUZpbGVQYXRoLCBmaWxlRGlyLCBjb25maWdQYXRoKVxuXG4gICAgICBsZXQgcmVzcG9uc2VcbiAgICAgIGlmICh0eXBlID09PSAnbGludCcpIHtcbiAgICAgICAgY29uc3QgcmVwb3J0ID0gbGludEpvYih7IGNsaUVuZ2luZU9wdGlvbnMsIGNvbnRlbnRzLCBlc2xpbnQsIGZpbGVQYXRoIH0pXG4gICAgICAgIHJlc3BvbnNlID0ge1xuICAgICAgICAgIG1lc3NhZ2VzOiByZXBvcnQucmVzdWx0cy5sZW5ndGggPyByZXBvcnQucmVzdWx0c1swXS5tZXNzYWdlcyA6IFtdXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNob3VsZFNlbmRSdWxlcykge1xuICAgICAgICAgIC8vIFlvdSBjYW4ndCBlbWl0IE1hcHMsIGNvbnZlcnQgdG8gQXJyYXkgb2YgQXJyYXlzIHRvIHNlbmQgYmFjay5cbiAgICAgICAgICByZXNwb25zZS51cGRhdGVkUnVsZXMgPSBBcnJheS5mcm9tKHJ1bGVzTWV0YWRhdGEpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2ZpeCcpIHtcbiAgICAgICAgcmVzcG9uc2UgPSBmaXhKb2IoeyBjbGlFbmdpbmVPcHRpb25zLCBjb250ZW50cywgZXNsaW50LCBmaWxlUGF0aCB9KVxuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnZGVidWcnKSB7XG4gICAgICAgIGNvbnN0IG1vZHVsZXNEaXIgPSBQYXRoLmRpcm5hbWUoZmluZENhY2hlZChmaWxlRGlyLCAnbm9kZV9tb2R1bGVzL2VzbGludCcpIHx8ICcnKVxuICAgICAgICByZXNwb25zZSA9IEhlbHBlcnMuZmluZEVTTGludERpcmVjdG9yeShtb2R1bGVzRGlyLCBjb25maWcsIHByb2plY3RQYXRoKVxuICAgICAgfVxuICAgICAgZW1pdChlbWl0S2V5LCByZXNwb25zZSlcbiAgICB9IGNhdGNoICh3b3JrZXJFcnIpIHtcbiAgICAgIGVtaXQoYHdvcmtlckVycm9yOiR7ZW1pdEtleX1gLCB7IG1zZzogd29ya2VyRXJyLm1lc3NhZ2UsIHN0YWNrOiB3b3JrZXJFcnIuc3RhY2sgfSlcbiAgICB9XG4gIH0pXG59XG4iXX0=