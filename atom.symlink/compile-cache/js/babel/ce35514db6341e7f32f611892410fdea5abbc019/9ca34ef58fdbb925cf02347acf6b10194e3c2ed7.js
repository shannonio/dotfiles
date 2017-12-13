Object.defineProperty(exports, '__esModule', {
  value: true
});

/**
 * Send a job to the worker and return the results
 * @param  {Task} worker The worker Task to use
 * @param  {Object} config Configuration for the job to send to the worker
 * @return {Object|String|Error}        The data returned from the worker
 */

var sendJob = _asyncToGenerator(function* (worker, config) {
  // Ensure the worker is started
  startWorker(worker);
  // Expand the config with a unique ID to emit on
  // NOTE: Jobs _must_ have a unique ID as they are completely async and results
  // can arrive back in any order.
  config.emitKey = (0, _cryptoRandomString2['default'])(10);

  return new Promise(function (resolve, reject) {
    var errSub = worker.on('task:error', function () {
      // Re-throw errors from the task
      var error = new Error(arguments[0]);
      // Set the stack to the one given to us by the worker
      error.stack = arguments[1];
      reject(error);
    });
    var responseSub = worker.on(config.emitKey, function (data) {
      errSub.dispose();
      responseSub.dispose();
      resolve(data);
    });
    // Send the job on to the worker
    try {
      worker.send(config);
    } catch (e) {
      console.error(e);
    }
  });
});

exports.sendJob = sendJob;
exports.showError = showError;

var getDebugInfo = _asyncToGenerator(function* (worker) {
  var textEditor = atom.workspace.getActiveTextEditor();
  var filePath = undefined;
  var editorScopes = undefined;
  if (atom.workspace.isTextEditor(textEditor)) {
    filePath = textEditor.getPath();
    editorScopes = textEditor.getLastCursor().getScopeDescriptor().getScopesArray();
  } else {
    // Somehow this can be called with no active TextEditor, impossible I know...
    filePath = 'unknown';
    editorScopes = ['unknown'];
  }
  var packagePath = atom.packages.resolvePackagePath('linter-eslint');
  var linterEslintMeta = undefined;
  if (packagePath === undefined) {
    // Apparently for some users the package path fails to resolve
    linterEslintMeta = { version: 'unknown!' };
  } else {
    // eslint-disable-next-line import/no-dynamic-require
    linterEslintMeta = require((0, _path.join)(packagePath, 'package.json'));
  }
  var config = atom.config.get('linter-eslint');
  var hoursSinceRestart = Math.round(process.uptime() / 3600 * 10) / 10;
  var returnVal = undefined;
  try {
    var response = yield sendJob(worker, {
      type: 'debug',
      config: config,
      filePath: filePath
    });
    returnVal = {
      atomVersion: atom.getVersion(),
      linterEslintVersion: linterEslintMeta.version,
      linterEslintConfig: config,
      // eslint-disable-next-line import/no-dynamic-require
      eslintVersion: require((0, _path.join)(response.path, 'package.json')).version,
      hoursSinceRestart: hoursSinceRestart,
      platform: process.platform,
      eslintType: response.type,
      eslintPath: response.path,
      editorScopes: editorScopes
    };
  } catch (error) {
    atom.notifications.addError('' + error);
  }
  return returnVal;
});

exports.getDebugInfo = getDebugInfo;

var generateDebugString = _asyncToGenerator(function* (worker) {
  var debug = yield getDebugInfo(worker);
  var details = ['Atom version: ' + debug.atomVersion, 'linter-eslint version: ' + debug.linterEslintVersion, 'ESLint version: ' + debug.eslintVersion, 'Hours since last Atom restart: ' + debug.hoursSinceRestart, 'Platform: ' + debug.platform, 'Using ' + debug.eslintType + ' ESLint from: ' + debug.eslintPath, 'Current file\'s scopes: ' + JSON.stringify(debug.editorScopes, null, 2), 'linter-eslint configuration: ' + JSON.stringify(debug.linterEslintConfig, null, 2)];
  return details.join('\n');
});

exports.generateDebugString = generateDebugString;

/**
 * Given a raw response from ESLint, this processes the messages into a format
 * compatible with the Linter API.
 * @param  {Object}     response   The raw response from ESLint
 * @param  {TextEditor} textEditor The Atom::TextEditor of the file the messages belong to
 * @param  {bool}       showRule   Whether to show the rule in the messages
 * @param  {Object}     worker     The current Worker Task to send Debug jobs to
 * @return {Promise}               The messages transformed into Linter messages
 */

var processESLintMessages = _asyncToGenerator(function* (response, textEditor, showRule, worker) {
  return Promise.all(response.map(_asyncToGenerator(function* (_ref) {
    var fatal = _ref.fatal;
    var originalMessage = _ref.message;
    var line = _ref.line;
    var severity = _ref.severity;
    var ruleId = _ref.ruleId;
    var column = _ref.column;
    var fix = _ref.fix;
    var endLine = _ref.endLine;
    var endColumn = _ref.endColumn;

    var message = fatal ? originalMessage.split('\n')[0] : originalMessage;
    var filePath = textEditor.getPath();
    var textBuffer = textEditor.getBuffer();
    var linterFix = null;
    if (fix) {
      var fixRange = new _atom.Range(textBuffer.positionForCharacterIndex(fix.range[0]), textBuffer.positionForCharacterIndex(fix.range[1]));
      linterFix = {
        position: fixRange,
        replaceWith: fix.text
      };
    }
    var msgCol = undefined;
    var msgEndLine = undefined;
    var msgEndCol = undefined;
    var eslintFullRange = false;

    /*
     Note: ESLint positions are 1-indexed, while Atom expects 0-indexed,
     positions. We are subtracting 1 from these values here so we don't have to
     keep doing so in later uses.
     */
    var msgLine = line - 1;
    if (typeof endColumn !== 'undefined' && typeof endLine !== 'undefined') {
      eslintFullRange = true;
      // Here we always want the column to be a number
      msgCol = Math.max(0, column - 1);
      msgEndLine = endLine - 1;
      msgEndCol = endColumn - 1;
    } else {
      // We want msgCol to remain undefined if it was initially so
      // `generateRange` will give us a range over the entire line
      msgCol = typeof column !== 'undefined' ? column - 1 : column;
    }

    var ret = undefined;
    var range = undefined;
    try {
      if (eslintFullRange) {
        validatePoint(textEditor, msgLine, msgCol);
        validatePoint(textEditor, msgEndLine, msgEndCol);
        range = [[msgLine, msgCol], [msgEndLine, msgEndCol]];
      } else {
        range = (0, _atomLinter.generateRange)(textEditor, msgLine, msgCol);
      }
      ret = {
        severity: severity === 1 ? 'warning' : 'error',
        location: {
          file: filePath,
          position: range
        }
      };

      if (ruleId) {
        ret.url = (0, _eslintRuleDocumentation2['default'])(ruleId).url;
      }

      var ruleAppendix = showRule ? ' (' + (ruleId || 'Fatal') + ')' : '';
      ret.excerpt = '' + message + ruleAppendix;

      if (linterFix) {
        ret.solutions = [linterFix];
      }
    } catch (err) {
      if (!err.message.startsWith('Line number ') && !err.message.startsWith('Column start ')) {
        // This isn't an invalid point error from `generateRange`, re-throw it
        throw err;
      }
      ret = yield generateInvalidTrace(msgLine, msgCol, msgEndLine, msgEndCol, eslintFullRange, filePath, textEditor, ruleId, message, worker);
    }

    return ret;
  })));
});

exports.processESLintMessages = processESLintMessages;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _path = require('path');

var _eslintRuleDocumentation = require('eslint-rule-documentation');

var _eslintRuleDocumentation2 = _interopRequireDefault(_eslintRuleDocumentation);

var _atomLinter = require('atom-linter');

var _cryptoRandomString = require('crypto-random-string');

var _cryptoRandomString2 = _interopRequireDefault(_cryptoRandomString);

// eslint-disable-next-line import/no-extraneous-dependencies, import/extensions

var _atom = require('atom');

/**
 * Start the worker process if it hasn't already been started
 * @param  {Task} worker The worker process reference to act on
 * @return {undefined}
 */
'use babel';

var startWorker = function startWorker(worker) {
  if (worker.started) {
    // Worker start request has already been sent
    return;
  }
  // Send empty arguments as we don't use them in the worker
  worker.start([]);
  // NOTE: Modifies the Task of the worker, but it's the only clean way to track this
  worker.started = true;
};
function showError(givenMessage) {
  var givenDetail = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  var detail = undefined;
  var message = undefined;
  if (message instanceof Error) {
    detail = message.stack;
    message = message.message;
  } else {
    detail = givenDetail;
    message = givenMessage;
  }
  atom.notifications.addError('[Linter-ESLint] ' + message, {
    detail: detail,
    dismissable: true
  });
}

function validatePoint(textEditor, line, col) {
  var buffer = textEditor.getBuffer();
  // Clip the given point to a valid one, and check if it equals the original
  if (!buffer.clipPosition([line, col]).isEqual([line, col])) {
    throw new Error(line + ':' + col + ' isn\'t a valid point!');
  }
}

var generateInvalidTrace = _asyncToGenerator(function* (msgLine, msgCol, msgEndLine, msgEndCol, eslintFullRange, filePath, textEditor, ruleId, message, worker) {
  var errMsgRange = msgLine + 1 + ':' + msgCol;
  if (eslintFullRange) {
    errMsgRange += ' - ' + (msgEndLine + 1) + ':' + (msgEndCol + 1);
  }
  var rangeText = 'Requested ' + (eslintFullRange ? 'start point' : 'range') + ': ' + errMsgRange;
  var issueURL = 'https://github.com/AtomLinter/linter-eslint/issues/new';
  var titleText = 'Invalid position given by \'' + ruleId + '\'';
  var title = encodeURIComponent(titleText);
  var body = encodeURIComponent(['ESLint returned a point that did not exist in the document being edited.', 'Rule: `' + ruleId + '`', rangeText, '', '', '<!-- If at all possible, please include code to reproduce this issue! -->', '', '', 'Debug information:', '```json', JSON.stringify((yield getDebugInfo(worker)), null, 2), '```'].join('\n'));

  var location = {
    file: filePath,
    position: (0, _atomLinter.generateRange)(textEditor, 0)
  };
  var newIssueURL = issueURL + '?title=' + title + '&body=' + body;

  return {
    severity: 'error',
    excerpt: titleText + '. See the description for details. ' + 'Click the URL to open a new issue!',
    url: newIssueURL,
    location: location,
    description: rangeText + '\nOriginal message: ' + message
  };
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvaGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQWdDc0IsT0FBTyxxQkFBdEIsV0FBdUIsTUFBTSxFQUFFLE1BQU0sRUFBRTs7QUFFNUMsYUFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFBOzs7O0FBSW5CLFFBQU0sQ0FBQyxPQUFPLEdBQUcscUNBQW1CLEVBQUUsQ0FBQyxDQUFBOztBQUV2QyxTQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBSztBQUN0QyxRQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxZQUFZOztBQUVqRCxVQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxVQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7O0FBRS9CLFdBQUssQ0FBQyxLQUFLLEdBQUcsVUFBSSxDQUFDLENBQUMsQ0FBQTtBQUNwQixZQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7S0FDZCxDQUFDLENBQUE7QUFDRixRQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsVUFBQyxJQUFJLEVBQUs7QUFDdEQsWUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ2hCLGlCQUFXLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDckIsYUFBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQ2QsQ0FBQyxDQUFBOztBQUVGLFFBQUk7QUFDRixZQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0tBQ3BCLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixhQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ2pCO0dBQ0YsQ0FBQyxDQUFBO0NBQ0g7Ozs7O0lBMEJxQixZQUFZLHFCQUEzQixXQUE0QixNQUFNLEVBQUU7QUFDekMsTUFBTSxVQUFV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UixRQUFRO0FBQ1IsZUFBVyxFQUFLLFNBQVMsNEJBQXVCLE9BQU8sQUFBRTtHQUMxRCxDQUFBO0NBQ0YsQ0FBQSxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJ1xuaW1wb3J0IHJ1bGVVUkkgZnJvbSAnZXNsaW50LXJ1bGUtZG9jdW1lbnRhdGlvbidcbmltcG9ydCB7IGdlbmVyYXRlUmFuZ2UgfSBmcm9tICdhdG9tLWxpbnRlcidcbmltcG9ydCBjcnlwdG9SYW5kb21TdHJpbmcgZnJvbSAnY3J5cHRvLXJhbmRvbS1zdHJpbmcnXG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXMsIGltcG9ydC9leHRlbnNpb25zXG5pbXBvcnQgeyBSYW5nZSB9IGZyb20gJ2F0b20nXG5cbi8qKlxuICogU3RhcnQgdGhlIHdvcmtlciBwcm9jZXNzIGlmIGl0IGhhc24ndCBhbHJlYWR5IGJlZW4gc3RhcnRlZFxuICogQHBhcmFtICB7VGFza30gd29ya2VyIFRoZSB3b3JrZXIgcHJvY2VzcyByZWZlcmVuY2UgdG8gYWN0IG9uXG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gKi9cbmNvbnN0IHN0YXJ0V29ya2VyID0gKHdvcmtlcikgPT4ge1xuICBpZiAod29ya2VyLnN0YXJ0ZWQpIHtcbiAgICAvLyBXb3JrZXIgc3RhcnQgcmVxdWVzdCBoYXMgYWxyZWFkeSBiZWVuIHNlbnRcbiAgICByZXR1cm5cbiAgfVxuICAvLyBTZW5kIGVtcHR5IGFyZ3VtZW50cyBhcyB3ZSBkb24ndCB1c2UgdGhlbSBpbiB0aGUgd29ya2VyXG4gIHdvcmtlci5zdGFydChbXSlcbiAgLy8gTk9URTogTW9kaWZpZXMgdGhlIFRhc2sgb2YgdGhlIHdvcmtlciwgYnV0IGl0J3MgdGhlIG9ubHkgY2xlYW4gd2F5IHRvIHRyYWNrIHRoaXNcbiAgd29ya2VyLnN0YXJ0ZWQgPSB0cnVlXG59XG5cbi8qKlxuICogU2VuZCBhIGpvYiB0byB0aGUgd29ya2VyIGFuZCByZXR1cm4gdGhlIHJlc3VsdHNcbiAqIEBwYXJhbSAge1Rhc2t9IHdvcmtlciBUaGUgd29ya2VyIFRhc2sgdG8gdXNlXG4gKiBAcGFyYW0gIHtPYmplY3R9IGNvbmZpZyBDb25maWd1cmF0aW9uIGZvciB0aGUgam9iIHRvIHNlbmQgdG8gdGhlIHdvcmtlclxuICogQHJldHVybiB7T2JqZWN0fFN0cmluZ3xFcnJvcn0gICAgICAgIFRoZSBkYXRhIHJldHVybmVkIGZyb20gdGhlIHdvcmtlclxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZEpvYih3b3JrZXIsIGNvbmZpZykge1xuICAvLyBFbnN1cmUgdGhlIHdvcmtlciBpcyBzdGFydGVkXG4gIHN0YXJ0V29ya2VyKHdvcmtlcilcbiAgLy8gRXhwYW5kIHRoZSBjb25maWcgd2l0aCBhIHVuaXF1ZSBJRCB0byBlbWl0IG9uXG4gIC8vIE5PVEU6IEpvYnMgX211c3RfIGhhdmUgYSB1bmlxdWUgSUQgYXMgdGhleSBhcmUgY29tcGxldGVseSBhc3luYyBhbmQgcmVzdWx0c1xuICAvLyBjYW4gYXJyaXZlIGJhY2sgaW4gYW55IG9yZGVyLlxuICBjb25maWcuZW1pdEtleSA9IGNyeXB0b1JhbmRvbVN0cmluZygxMClcblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGVyclN1YiA9IHdvcmtlci5vbigndGFzazplcnJvcicsICguLi5lcnIpID0+IHtcbiAgICAgIC8vIFJlLXRocm93IGVycm9ycyBmcm9tIHRoZSB0YXNrXG4gICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihlcnJbMF0pXG4gICAgICAvLyBTZXQgdGhlIHN0YWNrIHRvIHRoZSBvbmUgZ2l2ZW4gdG8gdXMgYnkgdGhlIHdvcmtlclxuICAgICAgZXJyb3Iuc3RhY2sgPSBlcnJbMV1cbiAgICAgIHJlamVjdChlcnJvcilcbiAgICB9KVxuICAgIGNvbnN0IHJlc3BvbnNlU3ViID0gd29ya2VyLm9uKGNvbmZpZy5lbWl0S2V5LCAoZGF0YSkgPT4ge1xuICAgICAgZXJyU3ViLmRpc3Bvc2UoKVxuICAgICAgcmVzcG9uc2VTdWIuZGlzcG9zZSgpXG4gICAgICByZXNvbHZlKGRhdGEpXG4gICAgfSlcbiAgICAvLyBTZW5kIHRoZSBqb2Igb24gdG8gdGhlIHdvcmtlclxuICAgIHRyeSB7XG4gICAgICB3b3JrZXIuc2VuZChjb25maWcpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKVxuICAgIH1cbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dFcnJvcihnaXZlbk1lc3NhZ2UsIGdpdmVuRGV0YWlsID0gbnVsbCkge1xuICBsZXQgZGV0YWlsXG4gIGxldCBtZXNzYWdlXG4gIGlmIChtZXNzYWdlIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICBkZXRhaWwgPSBtZXNzYWdlLnN0YWNrXG4gICAgbWVzc2FnZSA9IG1lc3NhZ2UubWVzc2FnZVxuICB9IGVsc2Uge1xuICAgIGRldGFpbCA9IGdpdmVuRGV0YWlsXG4gICAgbWVzc2FnZSA9IGdpdmVuTWVzc2FnZVxuICB9XG4gIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgW0xpbnRlci1FU0xpbnRdICR7bWVzc2FnZX1gLCB7XG4gICAgZGV0YWlsLFxuICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gIH0pXG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlUG9pbnQodGV4dEVkaXRvciwgbGluZSwgY29sKSB7XG4gIGNvbnN0IGJ1ZmZlciA9IHRleHRFZGl0b3IuZ2V0QnVmZmVyKClcbiAgLy8gQ2xpcCB0aGUgZ2l2ZW4gcG9pbnQgdG8gYSB2YWxpZCBvbmUsIGFuZCBjaGVjayBpZiBpdCBlcXVhbHMgdGhlIG9yaWdpbmFsXG4gIGlmICghYnVmZmVyLmNsaXBQb3NpdGlvbihbbGluZSwgY29sXSkuaXNFcXVhbChbbGluZSwgY29sXSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7bGluZX06JHtjb2x9IGlzbid0IGEgdmFsaWQgcG9pbnQhYClcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RGVidWdJbmZvKHdvcmtlcikge1xuICBjb25zdCB0ZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gIGxldCBmaWxlUGF0aFxuICBsZXQgZWRpdG9yU2NvcGVzXG4gIGlmIChhdG9tLndvcmtzcGFjZS5pc1RleHRFZGl0b3IodGV4dEVkaXRvcikpIHtcbiAgICBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpXG4gICAgZWRpdG9yU2NvcGVzID0gdGV4dEVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ2V0U2NvcGVEZXNjcmlwdG9yKCkuZ2V0U2NvcGVzQXJyYXkoKVxuICB9IGVsc2Uge1xuICAgIC8vIFNvbWVob3cgdGhpcyBjYW4gYmUgY2FsbGVkIHdpdGggbm8gYWN0aXZlIFRleHRFZGl0b3IsIGltcG9zc2libGUgSSBrbm93Li4uXG4gICAgZmlsZVBhdGggPSAndW5rbm93bidcbiAgICBlZGl0b3JTY29wZXMgPSBbJ3Vua25vd24nXVxuICB9XG4gIGNvbnN0IHBhY2thZ2VQYXRoID0gYXRvbS5wYWNrYWdlcy5yZXNvbHZlUGFja2FnZVBhdGgoJ2xpbnRlci1lc2xpbnQnKVxuICBsZXQgbGludGVyRXNsaW50TWV0YVxuICBpZiAocGFja2FnZVBhdGggPT09IHVuZGVmaW5lZCkge1xuICAgIC8vIEFwcGFyZW50bHkgZm9yIHNvbWUgdXNlcnMgdGhlIHBhY2thZ2UgcGF0aCBmYWlscyB0byByZXNvbHZlXG4gICAgbGludGVyRXNsaW50TWV0YSA9IHsgdmVyc2lvbjogJ3Vua25vd24hJyB9XG4gIH0gZWxzZSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby1keW5hbWljLXJlcXVpcmVcbiAgICBsaW50ZXJFc2xpbnRNZXRhID0gcmVxdWlyZShqb2luKHBhY2thZ2VQYXRoLCAncGFja2FnZS5qc29uJykpXG4gIH1cbiAgY29uc3QgY29uZmlnID0gYXRvbS5jb25maWcuZ2V0KCdsaW50ZXItZXNsaW50JylcbiAgY29uc3QgaG91cnNTaW5jZVJlc3RhcnQgPSBNYXRoLnJvdW5kKChwcm9jZXNzLnVwdGltZSgpIC8gMzYwMCkgKiAxMCkgLyAxMFxuICBsZXQgcmV0dXJuVmFsXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBzZW5kSm9iKHdvcmtlciwge1xuICAgICAgdHlwZTogJ2RlYnVnJyxcbiAgICAgIGNvbmZpZyxcbiAgICAgIGZpbGVQYXRoXG4gICAgfSlcbiAgICByZXR1cm5WYWwgPSB7XG4gICAgICBhdG9tVmVyc2lvbjogYXRvbS5nZXRWZXJzaW9uKCksXG4gICAgICBsaW50ZXJFc2xpbnRWZXJzaW9uOiBsaW50ZXJFc2xpbnRNZXRhLnZlcnNpb24sXG4gICAgICBsaW50ZXJFc2xpbnRDb25maWc6IGNvbmZpZyxcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tZHluYW1pYy1yZXF1aXJlXG4gICAgICBlc2xpbnRWZXJzaW9uOiByZXF1aXJlKGpvaW4ocmVzcG9uc2UucGF0aCwgJ3BhY2thZ2UuanNvbicpKS52ZXJzaW9uLFxuICAgICAgaG91cnNTaW5jZVJlc3RhcnQsXG4gICAgICBwbGF0Zm9ybTogcHJvY2Vzcy5wbGF0Zm9ybSxcbiAgICAgIGVzbGludFR5cGU6IHJlc3BvbnNlLnR5cGUsXG4gICAgICBlc2xpbnRQYXRoOiByZXNwb25zZS5wYXRoLFxuICAgICAgZWRpdG9yU2NvcGVzLFxuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYCR7ZXJyb3J9YClcbiAgfVxuICByZXR1cm4gcmV0dXJuVmFsXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZURlYnVnU3RyaW5nKHdvcmtlcikge1xuICBjb25zdCBkZWJ1ZyA9IGF3YWl0IGdldERlYnVnSW5mbyh3b3JrZXIpXG4gIGNvbnN0IGRldGFpbHMgPSBbXG4gICAgYEF0b20gdmVyc2lvbjogJHtkZWJ1Zy5hdG9tVmVyc2lvbn1gLFxuICAgIGBsaW50ZXItZXNsaW50IHZlcnNpb246ICR7ZGVidWcubGludGVyRXNsaW50VmVyc2lvbn1gLFxuICAgIGBFU0xpbnQgdmVyc2lvbjogJHtkZWJ1Zy5lc2xpbnRWZXJzaW9ufWAsXG4gICAgYEhvdXJzIHNpbmNlIGxhc3QgQXRvbSByZXN0YXJ0OiAke2RlYnVnLmhvdXJzU2luY2VSZXN0YXJ0fWAsXG4gICAgYFBsYXRmb3JtOiAke2RlYnVnLnBsYXRmb3JtfWAsXG4gICAgYFVzaW5nICR7ZGVidWcuZXNsaW50VHlwZX0gRVNMaW50IGZyb206ICR7ZGVidWcuZXNsaW50UGF0aH1gLFxuICAgIGBDdXJyZW50IGZpbGUncyBzY29wZXM6ICR7SlNPTi5zdHJpbmdpZnkoZGVidWcuZWRpdG9yU2NvcGVzLCBudWxsLCAyKX1gLFxuICAgIGBsaW50ZXItZXNsaW50IGNvbmZpZ3VyYXRpb246ICR7SlNPTi5zdHJpbmdpZnkoZGVidWcubGludGVyRXNsaW50Q29uZmlnLCBudWxsLCAyKX1gXG4gIF1cbiAgcmV0dXJuIGRldGFpbHMuam9pbignXFxuJylcbn1cblxuY29uc3QgZ2VuZXJhdGVJbnZhbGlkVHJhY2UgPSBhc3luYyAoXG4gIG1zZ0xpbmUsIG1zZ0NvbCwgbXNnRW5kTGluZSwgbXNnRW5kQ29sLFxuICBlc2xpbnRGdWxsUmFuZ2UsIGZpbGVQYXRoLCB0ZXh0RWRpdG9yLCBydWxlSWQsIG1lc3NhZ2UsIHdvcmtlclxuKSA9PiB7XG4gIGxldCBlcnJNc2dSYW5nZSA9IGAke21zZ0xpbmUgKyAxfToke21zZ0NvbH1gXG4gIGlmIChlc2xpbnRGdWxsUmFuZ2UpIHtcbiAgICBlcnJNc2dSYW5nZSArPSBgIC0gJHttc2dFbmRMaW5lICsgMX06JHttc2dFbmRDb2wgKyAxfWBcbiAgfVxuICBjb25zdCByYW5nZVRleHQgPSBgUmVxdWVzdGVkICR7ZXNsaW50RnVsbFJhbmdlID8gJ3N0YXJ0IHBvaW50JyA6ICdyYW5nZSd9OiAke2Vyck1zZ1JhbmdlfWBcbiAgY29uc3QgaXNzdWVVUkwgPSAnaHR0cHM6Ly9naXRodWIuY29tL0F0b21MaW50ZXIvbGludGVyLWVzbGludC9pc3N1ZXMvbmV3J1xuICBjb25zdCB0aXRsZVRleHQgPSBgSW52YWxpZCBwb3NpdGlvbiBnaXZlbiBieSAnJHtydWxlSWR9J2BcbiAgY29uc3QgdGl0bGUgPSBlbmNvZGVVUklDb21wb25lbnQodGl0bGVUZXh0KVxuICBjb25zdCBib2R5ID0gZW5jb2RlVVJJQ29tcG9uZW50KFtcbiAgICAnRVNMaW50IHJldHVybmVkIGEgcG9pbnQgdGhhdCBkaWQgbm90IGV4aXN0IGluIHRoZSBkb2N1bWVudCBiZWluZyBlZGl0ZWQuJyxcbiAgICBgUnVsZTogXFxgJHtydWxlSWR9XFxgYCxcbiAgICByYW5nZVRleHQsXG4gICAgJycsICcnLFxuICAgICc8IS0tIElmIGF0IGFsbCBwb3NzaWJsZSwgcGxlYXNlIGluY2x1ZGUgY29kZSB0byByZXByb2R1Y2UgdGhpcyBpc3N1ZSEgLS0+JyxcbiAgICAnJywgJycsXG4gICAgJ0RlYnVnIGluZm9ybWF0aW9uOicsXG4gICAgJ2BgYGpzb24nLFxuICAgIEpTT04uc3RyaW5naWZ5KGF3YWl0IGdldERlYnVnSW5mbyh3b3JrZXIpLCBudWxsLCAyKSxcbiAgICAnYGBgJ1xuICBdLmpvaW4oJ1xcbicpKVxuXG4gIGNvbnN0IGxvY2F0aW9uID0ge1xuICAgIGZpbGU6IGZpbGVQYXRoLFxuICAgIHBvc2l0aW9uOiBnZW5lcmF0ZVJhbmdlKHRleHRFZGl0b3IsIDApLFxuICB9XG4gIGNvbnN0IG5ld0lzc3VlVVJMID0gYCR7aXNzdWVVUkx9P3RpdGxlPSR7dGl0bGV9JmJvZHk9JHtib2R5fWBcblxuICByZXR1cm4ge1xuICAgIHNldmVyaXR5OiAnZXJyb3InLFxuICAgIGV4Y2VycHQ6IGAke3RpdGxlVGV4dH0uIFNlZSB0aGUgZGVzY3JpcHRpb24gZm9yIGRldGFpbHMuIGAgK1xuICAgICAgJ0NsaWNrIHRoZSBVUkwgdG8gb3BlbiBhIG5ldyBpc3N1ZSEnLFxuICAgIHVybDogbmV3SXNzdWVVUkwsXG4gICAgbG9jYXRpb24sXG4gICAgZGVzY3JpcHRpb246IGAke3JhbmdlVGV4dH1cXG5PcmlnaW5hbCBtZXNzYWdlOiAke21lc3NhZ2V9YFxuICB9XG59XG5cbi8qKlxuICogR2l2ZW4gYSByYXcgcmVzcG9uc2UgZnJvbSBFU0xpbnQsIHRoaXMgcHJvY2Vzc2VzIHRoZSBtZXNzYWdlcyBpbnRvIGEgZm9ybWF0XG4gKiBjb21wYXRpYmxlIHdpdGggdGhlIExpbnRlciBBUEkuXG4gKiBAcGFyYW0gIHtPYmplY3R9ICAgICByZXNwb25zZSAgIFRoZSByYXcgcmVzcG9uc2UgZnJvbSBFU0xpbnRcbiAqIEBwYXJhbSAge1RleHRFZGl0b3J9IHRleHRFZGl0b3IgVGhlIEF0b206OlRleHRFZGl0b3Igb2YgdGhlIGZpbGUgdGhlIG1lc3NhZ2VzIGJlbG9uZyB0b1xuICogQHBhcmFtICB7Ym9vbH0gICAgICAgc2hvd1J1bGUgICBXaGV0aGVyIHRvIHNob3cgdGhlIHJ1bGUgaW4gdGhlIG1lc3NhZ2VzXG4gKiBAcGFyYW0gIHtPYmplY3R9ICAgICB3b3JrZXIgICAgIFRoZSBjdXJyZW50IFdvcmtlciBUYXNrIHRvIHNlbmQgRGVidWcgam9icyB0b1xuICogQHJldHVybiB7UHJvbWlzZX0gICAgICAgICAgICAgICBUaGUgbWVzc2FnZXMgdHJhbnNmb3JtZWQgaW50byBMaW50ZXIgbWVzc2FnZXNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByb2Nlc3NFU0xpbnRNZXNzYWdlcyhyZXNwb25zZSwgdGV4dEVkaXRvciwgc2hvd1J1bGUsIHdvcmtlcikge1xuICByZXR1cm4gUHJvbWlzZS5hbGwocmVzcG9uc2UubWFwKGFzeW5jICh7XG4gICAgZmF0YWwsIG1lc3NhZ2U6IG9yaWdpbmFsTWVzc2FnZSwgbGluZSwgc2V2ZXJpdHksIHJ1bGVJZCwgY29sdW1uLCBmaXgsIGVuZExpbmUsIGVuZENvbHVtblxuICB9KSA9PiB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGZhdGFsID8gb3JpZ2luYWxNZXNzYWdlLnNwbGl0KCdcXG4nKVswXSA6IG9yaWdpbmFsTWVzc2FnZVxuICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKClcbiAgICBjb25zdCB0ZXh0QnVmZmVyID0gdGV4dEVkaXRvci5nZXRCdWZmZXIoKVxuICAgIGxldCBsaW50ZXJGaXggPSBudWxsXG4gICAgaWYgKGZpeCkge1xuICAgICAgY29uc3QgZml4UmFuZ2UgPSBuZXcgUmFuZ2UoXG4gICAgICAgIHRleHRCdWZmZXIucG9zaXRpb25Gb3JDaGFyYWN0ZXJJbmRleChmaXgucmFuZ2VbMF0pLFxuICAgICAgICB0ZXh0QnVmZmVyLnBvc2l0aW9uRm9yQ2hhcmFjdGVySW5kZXgoZml4LnJhbmdlWzFdKVxuICAgICAgKVxuICAgICAgbGludGVyRml4ID0ge1xuICAgICAgICBwb3NpdGlvbjogZml4UmFuZ2UsXG4gICAgICAgIHJlcGxhY2VXaXRoOiBmaXgudGV4dFxuICAgICAgfVxuICAgIH1cbiAgICBsZXQgbXNnQ29sXG4gICAgbGV0IG1zZ0VuZExpbmVcbiAgICBsZXQgbXNnRW5kQ29sXG4gICAgbGV0IGVzbGludEZ1bGxSYW5nZSA9IGZhbHNlXG5cbiAgICAvKlxuICAgICBOb3RlOiBFU0xpbnQgcG9zaXRpb25zIGFyZSAxLWluZGV4ZWQsIHdoaWxlIEF0b20gZXhwZWN0cyAwLWluZGV4ZWQsXG4gICAgIHBvc2l0aW9ucy4gV2UgYXJlIHN1YnRyYWN0aW5nIDEgZnJvbSB0aGVzZSB2YWx1ZXMgaGVyZSBzbyB3ZSBkb24ndCBoYXZlIHRvXG4gICAgIGtlZXAgZG9pbmcgc28gaW4gbGF0ZXIgdXNlcy5cbiAgICAgKi9cbiAgICBjb25zdCBtc2dMaW5lID0gbGluZSAtIDFcbiAgICBpZiAodHlwZW9mIGVuZENvbHVtbiAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGVuZExpbmUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBlc2xpbnRGdWxsUmFuZ2UgPSB0cnVlXG4gICAgICAvLyBIZXJlIHdlIGFsd2F5cyB3YW50IHRoZSBjb2x1bW4gdG8gYmUgYSBudW1iZXJcbiAgICAgIG1zZ0NvbCA9IE1hdGgubWF4KDAsIGNvbHVtbiAtIDEpXG4gICAgICBtc2dFbmRMaW5lID0gZW5kTGluZSAtIDFcbiAgICAgIG1zZ0VuZENvbCA9IGVuZENvbHVtbiAtIDFcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gV2Ugd2FudCBtc2dDb2wgdG8gcmVtYWluIHVuZGVmaW5lZCBpZiBpdCB3YXMgaW5pdGlhbGx5IHNvXG4gICAgICAvLyBgZ2VuZXJhdGVSYW5nZWAgd2lsbCBnaXZlIHVzIGEgcmFuZ2Ugb3ZlciB0aGUgZW50aXJlIGxpbmVcbiAgICAgIG1zZ0NvbCA9IHR5cGVvZiBjb2x1bW4gIT09ICd1bmRlZmluZWQnID8gY29sdW1uIC0gMSA6IGNvbHVtblxuICAgIH1cblxuICAgIGxldCByZXRcbiAgICBsZXQgcmFuZ2VcbiAgICB0cnkge1xuICAgICAgaWYgKGVzbGludEZ1bGxSYW5nZSkge1xuICAgICAgICB2YWxpZGF0ZVBvaW50KHRleHRFZGl0b3IsIG1zZ0xpbmUsIG1zZ0NvbClcbiAgICAgICAgdmFsaWRhdGVQb2ludCh0ZXh0RWRpdG9yLCBtc2dFbmRMaW5lLCBtc2dFbmRDb2wpXG4gICAgICAgIHJhbmdlID0gW1ttc2dMaW5lLCBtc2dDb2xdLCBbbXNnRW5kTGluZSwgbXNnRW5kQ29sXV1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJhbmdlID0gZ2VuZXJhdGVSYW5nZSh0ZXh0RWRpdG9yLCBtc2dMaW5lLCBtc2dDb2wpXG4gICAgICB9XG4gICAgICByZXQgPSB7XG4gICAgICAgIHNldmVyaXR5OiBzZXZlcml0eSA9PT0gMSA/ICd3YXJuaW5nJyA6ICdlcnJvcicsXG4gICAgICAgIGxvY2F0aW9uOiB7XG4gICAgICAgICAgZmlsZTogZmlsZVBhdGgsXG4gICAgICAgICAgcG9zaXRpb246IHJhbmdlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHJ1bGVJZCkge1xuICAgICAgICByZXQudXJsID0gcnVsZVVSSShydWxlSWQpLnVybFxuICAgICAgfVxuXG4gICAgICBjb25zdCBydWxlQXBwZW5kaXggPSBzaG93UnVsZSA/IGAgKCR7cnVsZUlkIHx8ICdGYXRhbCd9KWAgOiAnJ1xuICAgICAgcmV0LmV4Y2VycHQgPSBgJHttZXNzYWdlfSR7cnVsZUFwcGVuZGl4fWBcblxuICAgICAgaWYgKGxpbnRlckZpeCkge1xuICAgICAgICByZXQuc29sdXRpb25zID0gW2xpbnRlckZpeF1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGlmICghZXJyLm1lc3NhZ2Uuc3RhcnRzV2l0aCgnTGluZSBudW1iZXIgJykgJiZcbiAgICAgICAgIWVyci5tZXNzYWdlLnN0YXJ0c1dpdGgoJ0NvbHVtbiBzdGFydCAnKVxuICAgICAgKSB7XG4gICAgICAgIC8vIFRoaXMgaXNuJ3QgYW4gaW52YWxpZCBwb2ludCBlcnJvciBmcm9tIGBnZW5lcmF0ZVJhbmdlYCwgcmUtdGhyb3cgaXRcbiAgICAgICAgdGhyb3cgZXJyXG4gICAgICB9XG4gICAgICByZXQgPSBhd2FpdCBnZW5lcmF0ZUludmFsaWRUcmFjZShcbiAgICAgICAgbXNnTGluZSwgbXNnQ29sLCBtc2dFbmRMaW5lLCBtc2dFbmRDb2wsXG4gICAgICAgIGVzbGludEZ1bGxSYW5nZSwgZmlsZVBhdGgsIHRleHRFZGl0b3IsIHJ1bGVJZCwgbWVzc2FnZSwgd29ya2VyXG4gICAgICApXG4gICAgfVxuXG4gICAgcmV0dXJuIHJldFxuICB9KSlcbn1cbiJdfQ==