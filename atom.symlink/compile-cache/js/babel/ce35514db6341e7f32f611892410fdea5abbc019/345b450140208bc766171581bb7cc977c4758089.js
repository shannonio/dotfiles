function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/* eslint-disable import/prefer-default-export */

var _userHome = require('user-home');

var _userHome2 = _interopRequireDefault(_userHome);

var _path = require('path');

/**
 * Check if a config is directly inside a user's home directory.
 * Such config files are used by ESLint as a fallback, only for situations
 * when there is no other config file between a file being linted and root.
 *
 * @param  {string}  configPath - The path of the config file being checked
 * @return {Boolean}              True if the file is directly in the current user's home
 */
'use babel';module.exports = function isConfigAtHomeRoot(configPath) {
  return (0, _path.dirname)(configPath) === _userHome2['default'];
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvaXMtY29uZmlnLWF0LWhvbWUtcm9vdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O3dCQUlxQixXQUFXOzs7O29CQUNSLE1BQU07Ozs7Ozs7Ozs7QUFMOUIsV0FBVyxDQUFBLEFBZVgsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLGtCQUFrQixDQUFDLFVBQVUsRUFBRTtBQUN2RCxTQUFRLG1CQUFRLFVBQVUsQ0FBQywwQkFBYSxDQUFDO0NBQzFDLENBQUEiLCJmaWxlIjoiL1VzZXJzL3NoYW5ub25iZXJ0dWNjaS8uYXRvbS9wYWNrYWdlcy9saW50ZXItZXNsaW50L3NyYy9pcy1jb25maWctYXQtaG9tZS1yb290LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuLyogZXNsaW50LWRpc2FibGUgaW1wb3J0L3ByZWZlci1kZWZhdWx0LWV4cG9ydCAqL1xuXG5pbXBvcnQgdXNlckhvbWUgZnJvbSAndXNlci1ob21lJ1xuaW1wb3J0IHsgZGlybmFtZSB9IGZyb20gJ3BhdGgnXG5cbi8qKlxuICogQ2hlY2sgaWYgYSBjb25maWcgaXMgZGlyZWN0bHkgaW5zaWRlIGEgdXNlcidzIGhvbWUgZGlyZWN0b3J5LlxuICogU3VjaCBjb25maWcgZmlsZXMgYXJlIHVzZWQgYnkgRVNMaW50IGFzIGEgZmFsbGJhY2ssIG9ubHkgZm9yIHNpdHVhdGlvbnNcbiAqIHdoZW4gdGhlcmUgaXMgbm8gb3RoZXIgY29uZmlnIGZpbGUgYmV0d2VlbiBhIGZpbGUgYmVpbmcgbGludGVkIGFuZCByb290LlxuICpcbiAqIEBwYXJhbSAge3N0cmluZ30gIGNvbmZpZ1BhdGggLSBUaGUgcGF0aCBvZiB0aGUgY29uZmlnIGZpbGUgYmVpbmcgY2hlY2tlZFxuICogQHJldHVybiB7Qm9vbGVhbn0gICAgICAgICAgICAgIFRydWUgaWYgdGhlIGZpbGUgaXMgZGlyZWN0bHkgaW4gdGhlIGN1cnJlbnQgdXNlcidzIGhvbWVcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0NvbmZpZ0F0SG9tZVJvb3QoY29uZmlnUGF0aCkge1xuICByZXR1cm4gKGRpcm5hbWUoY29uZmlnUGF0aCkgPT09IHVzZXJIb21lKVxufVxuIl19