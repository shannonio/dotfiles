Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getNodePrefixPath = getNodePrefixPath;
exports.findESLintDirectory = findESLintDirectory;
exports.getESLintFromDirectory = getESLintFromDirectory;
exports.refreshModulesPath = refreshModulesPath;
exports.getESLintInstance = getESLintInstance;
exports.getConfigPath = getConfigPath;
exports.getRelativePath = getRelativePath;
exports.getCLIEngineOptions = getCLIEngineOptions;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _resolveEnv = require('resolve-env');

var _resolveEnv2 = _interopRequireDefault(_resolveEnv);

var _atomLinter = require('atom-linter');

var _consistentPath = require('consistent-path');

var _consistentPath2 = _interopRequireDefault(_consistentPath);

'use babel';

var Cache = {
  ESLINT_LOCAL_PATH: _path2['default'].normalize(_path2['default'].join(__dirname, '..', 'node_modules', 'eslint')),
  NODE_PREFIX_PATH: null,
  LAST_MODULES_PATH: null
};

function getNodePrefixPath() {
  if (Cache.NODE_PREFIX_PATH === null) {
    var npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    try {
      Cache.NODE_PREFIX_PATH = _child_process2['default'].spawnSync(npmCommand, ['get', 'prefix'], {
        env: Object.assign(Object.assign({}, process.env), { PATH: (0, _consistentPath2['default'])() })
      }).output[1].toString().trim();
    } catch (e) {
      throw new Error('Unable to execute `npm get prefix`. Please make sure Atom is getting $PATH correctly.');
    }
  }
  return Cache.NODE_PREFIX_PATH;
}

function isDirectory(dirPath) {
  var isDir = undefined;
  try {
    isDir = _fs2['default'].statSync(dirPath).isDirectory();
  } catch (e) {
    isDir = false;
  }
  return isDir;
}

function findESLintDirectory(modulesDir, config, projectPath) {
  var eslintDir = null;
  var locationType = null;
  if (config.useGlobalEslint) {
    locationType = 'global';
    var prefixPath = config.globalNodePath || getNodePrefixPath();
    // NPM on Windows and Yarn on all platforms
    eslintDir = _path2['default'].join(prefixPath, 'node_modules', 'eslint');
    if (!isDirectory(eslintDir)) {
      // NPM on platforms other than Windows
      eslintDir = _path2['default'].join(prefixPath, 'lib', 'node_modules', 'eslint');
    }
  } else if (!config.advancedLocalNodeModules) {
    locationType = 'local project';
    eslintDir = _path2['default'].join(modulesDir || '', 'eslint');
  } else if (_path2['default'].isAbsolute(config.advancedLocalNodeModules)) {
    locationType = 'advanced specified';
    eslintDir = _path2['default'].join(config.advancedLocalNodeModules || '', 'eslint');
  } else {
    locationType = 'advanced specified';
    eslintDir = _path2['default'].join(projectPath, config.advancedLocalNodeModules, 'eslint');
  }
  if (isDirectory(eslintDir)) {
    return {
      path: eslintDir,
      type: locationType
    };
  } else if (config.useGlobalEslint) {
    throw new Error('ESLint not found, please ensure the global Node path is set correctly.');
  }
  return {
    path: Cache.ESLINT_LOCAL_PATH,
    type: 'bundled fallback'
  };
}

function getESLintFromDirectory(modulesDir, config, projectPath) {
  var _findESLintDirectory = findESLintDirectory(modulesDir, config, projectPath);

  var ESLintDirectory = _findESLintDirectory.path;

  try {
    // eslint-disable-next-line import/no-dynamic-require
    return require(ESLintDirectory);
  } catch (e) {
    if (config.useGlobalEslint && e.code === 'MODULE_NOT_FOUND') {
      throw new Error('ESLint not found, try restarting Atom to clear caches.');
    }
    // eslint-disable-next-line import/no-dynamic-require
    return require(Cache.ESLINT_LOCAL_PATH);
  }
}

function refreshModulesPath(modulesDir) {
  if (Cache.LAST_MODULES_PATH !== modulesDir) {
    Cache.LAST_MODULES_PATH = modulesDir;
    process.env.NODE_PATH = modulesDir || '';
    require('module').Module._initPaths();
  }
}

function getESLintInstance(fileDir, config, projectPath) {
  var modulesDir = _path2['default'].dirname((0, _atomLinter.findCached)(fileDir, 'node_modules/eslint') || '');
  refreshModulesPath(modulesDir);
  return getESLintFromDirectory(modulesDir, config, projectPath || '');
}

function getConfigPath(_x) {
  var _again = true;

  _function: while (_again) {
    var fileDir = _x;
    _again = false;

    var configFile = (0, _atomLinter.findCached)(fileDir, ['.eslintrc.js', '.eslintrc.yaml', '.eslintrc.yml', '.eslintrc.json', '.eslintrc', 'package.json']);
    if (configFile) {
      if (_path2['default'].basename(configFile) === 'package.json') {
        // eslint-disable-next-line import/no-dynamic-require
        if (require(configFile).eslintConfig) {
          return configFile;
        }
        // If we are here, we found a package.json without an eslint config
        // in a dir without any other eslint config files
        // (because 'package.json' is last in the call to findCached)
        // So, keep looking from the parent directory
        _x = _path2['default'].resolve(_path2['default'].dirname(configFile), '..');
        _again = true;
        configFile = undefined;
        continue _function;
      }
      return configFile;
    }
    return null;
  }
}

function getRelativePath(fileDir, filePath, config) {
  var ignoreFile = config.disableEslintIgnore ? null : (0, _atomLinter.findCached)(fileDir, '.eslintignore');

  if (ignoreFile) {
    var ignoreDir = _path2['default'].dirname(ignoreFile);
    process.chdir(ignoreDir);
    return _path2['default'].relative(ignoreDir, filePath);
  }
  process.chdir(fileDir);
  return _path2['default'].basename(filePath);
}

function getCLIEngineOptions(type, config, rules, filePath, fileDir, givenConfigPath) {
  var cliEngineConfig = {
    rules: rules,
    ignore: !config.disableEslintIgnore,
    warnIgnored: false,
    fix: type === 'fix'
  };

  var ignoreFile = config.disableEslintIgnore ? null : (0, _atomLinter.findCached)(fileDir, '.eslintignore');
  if (ignoreFile) {
    cliEngineConfig.ignorePath = ignoreFile;
  }

  if (config.eslintRulesDir) {
    var rulesDir = (0, _resolveEnv2['default'])(config.eslintRulesDir);
    if (!_path2['default'].isAbsolute(rulesDir)) {
      rulesDir = (0, _atomLinter.findCached)(fileDir, rulesDir);
    }
    if (rulesDir) {
      cliEngineConfig.rulePaths = [rulesDir];
    }
  }

  if (givenConfigPath === null && config.eslintrcPath) {
    // If we didn't find a configuration use the fallback from the settings
    cliEngineConfig.configFile = (0, _resolveEnv2['default'])(config.eslintrcPath);
  }

  return cliEngineConfig;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvd29ya2VyLWhlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7b0JBRWlCLE1BQU07Ozs7a0JBQ1IsSUFBSTs7Ozs2QkFDTSxlQUFlOzs7OzBCQUNqQixhQUFhOzs7OzBCQUNULGFBQWE7OzhCQUNwQixpQkFBaUI7Ozs7QUFQckMsV0FBVyxDQUFBOztBQVNYLElBQU0sS0FBSyxHQUFHO0FBQ1osbUJBQWlCLEVBQUUsa0JBQUssU0FBUyxDQUFDLGtCQUFLLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN2RixrQkFBZ0IsRUFBRSxJQUFJO0FBQ3RCLG1CQUFpQixFQUFFLElBQUk7Q0FDeEIsQ0FBQTs7QUFFTSxTQUFTLGlCQUFpQixHQUFHO0FBQ2xDLE1BQUksS0FBSyxDQUFDLGdCQUFnQixLQUFLLElBQUksRUFBRTtBQUNuQyxRQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sR0FBRyxTQUFTLEdBQUcsS0FBSyxDQUFBO0FBQ25FLFFBQUk7QUFDRixXQUFLLENBQUMsZ0JBQWdCLEdBQ3BCLDJCQUFhLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLEVBQUU7QUFDcEQsV0FBRyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLGtDQUFTLEVBQUUsQ0FBQztPQUN4RSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFBO0tBQ2pDLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixZQUFNLElBQUksS0FBSyxDQUNiLHVGQUF1RixDQUN4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QUFRLENBQUMsQ0FBQTtLQUN6QztBQUNELFFBQUksUUFBUSxFQUFFO0FBQ1oscUJBQWUsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUN2QztHQUNGOztBQUVELE1BQUksZUFBZSxLQUFLLElBQUksSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFOztBQUVuRCxtQkFBZSxDQUFDLFVBQVUsR0FBRyw2QkFBVyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUE7R0FDN0Q7O0FBRUQsU0FBTyxlQUFlLENBQUE7Q0FDdkIiLCJmaWxlIjoiL1VzZXJzL3NoYW5ub25iZXJ0dWNjaS8uYXRvbS9wYWNrYWdlcy9saW50ZXItZXNsaW50L3NyYy93b3JrZXItaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBQYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgQ2hpbGRQcm9jZXNzIGZyb20gJ2NoaWxkX3Byb2Nlc3MnXG5pbXBvcnQgcmVzb2x2ZUVudiBmcm9tICdyZXNvbHZlLWVudidcbmltcG9ydCB7IGZpbmRDYWNoZWQgfSBmcm9tICdhdG9tLWxpbnRlcidcbmltcG9ydCBnZXRQYXRoIGZyb20gJ2NvbnNpc3RlbnQtcGF0aCdcblxuY29uc3QgQ2FjaGUgPSB7XG4gIEVTTElOVF9MT0NBTF9QQVRIOiBQYXRoLm5vcm1hbGl6ZShQYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAnbm9kZV9tb2R1bGVzJywgJ2VzbGludCcpKSxcbiAgTk9ERV9QUkVGSVhfUEFUSDogbnVsbCxcbiAgTEFTVF9NT0RVTEVTX1BBVEg6IG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vZGVQcmVmaXhQYXRoKCkge1xuICBpZiAoQ2FjaGUuTk9ERV9QUkVGSVhfUEFUSCA9PT0gbnVsbCkge1xuICAgIGNvbnN0IG5wbUNvbW1hbmQgPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInID8gJ25wbS5jbWQnIDogJ25wbSdcbiAgICB0cnkge1xuICAgICAgQ2FjaGUuTk9ERV9QUkVGSVhfUEFUSCA9XG4gICAgICAgIENoaWxkUHJvY2Vzcy5zcGF3blN5bmMobnBtQ29tbWFuZCwgWydnZXQnLCAncHJlZml4J10sIHtcbiAgICAgICAgICBlbnY6IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgcHJvY2Vzcy5lbnYpLCB7IFBBVEg6IGdldFBhdGgoKSB9KVxuICAgICAgICB9KS5vdXRwdXRbMV0udG9TdHJpbmcoKS50cmltKClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdVbmFibGUgdG8gZXhlY3V0ZSBgbnBtIGdldCBwcmVmaXhgLiBQbGVhc2UgbWFrZSBzdXJlIEF0b20gaXMgZ2V0dGluZyAkUEFUSCBjb3JyZWN0bHkuJ1xuICAgICAgKVxuICAgIH1cbiAgfVxuICByZXR1cm4gQ2FjaGUuTk9ERV9QUkVGSVhfUEFUSFxufVxuXG5mdW5jdGlvbiBpc0RpcmVjdG9yeShkaXJQYXRoKSB7XG4gIGxldCBpc0RpclxuICB0cnkge1xuICAgIGlzRGlyID0gZnMuc3RhdFN5bmMoZGlyUGF0aCkuaXNEaXJlY3RvcnkoKVxuICB9IGNhdGNoIChlKSB7XG4gICAgaXNEaXIgPSBmYWxzZVxuICB9XG4gIHJldHVybiBpc0RpclxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZEVTTGludERpcmVjdG9yeShtb2R1bGVzRGlyLCBjb25maWcsIHByb2plY3RQYXRoKSB7XG4gIGxldCBlc2xpbnREaXIgPSBudWxsXG4gIGxldCBsb2NhdGlvblR5cGUgPSBudWxsXG4gIGlmIChjb25maWcudXNlR2xvYmFsRXNsaW50KSB7XG4gICAgbG9jYXRpb25UeXBlID0gJ2dsb2JhbCdcbiAgICBjb25zdCBwcmVmaXhQYXRoID0gY29uZmlnLmdsb2JhbE5vZGVQYXRoIHx8IGdldE5vZGVQcmVmaXhQYXRoKClcbiAgICAvLyBOUE0gb24gV2luZG93cyBhbmQgWWFybiBvbiBhbGwgcGxhdGZvcm1zXG4gICAgZXNsaW50RGlyID0gUGF0aC5qb2luKHByZWZpeFBhdGgsICdub2RlX21vZHVsZXMnLCAnZXNsaW50JylcbiAgICBpZiAoIWlzRGlyZWN0b3J5KGVzbGludERpcikpIHtcbiAgICAgIC8vIE5QTSBvbiBwbGF0Zm9ybXMgb3RoZXIgdGhhbiBXaW5kb3dzXG4gICAgICBlc2xpbnREaXIgPSBQYXRoLmpvaW4ocHJlZml4UGF0aCwgJ2xpYicsICdub2RlX21vZHVsZXMnLCAnZXNsaW50JylcbiAgICB9XG4gIH0gZWxzZSBpZiAoIWNvbmZpZy5hZHZhbmNlZExvY2FsTm9kZU1vZHVsZXMpIHtcbiAgICBsb2NhdGlvblR5cGUgPSAnbG9jYWwgcHJvamVjdCdcbiAgICBlc2xpbnREaXIgPSBQYXRoLmpvaW4obW9kdWxlc0RpciB8fCAnJywgJ2VzbGludCcpXG4gIH0gZWxzZSBpZiAoUGF0aC5pc0Fic29sdXRlKGNvbmZpZy5hZHZhbmNlZExvY2FsTm9kZU1vZHVsZXMpKSB7XG4gICAgbG9jYXRpb25UeXBlID0gJ2FkdmFuY2VkIHNwZWNpZmllZCdcbiAgICBlc2xpbnREaXIgPSBQYXRoLmpvaW4oY29uZmlnLmFkdmFuY2VkTG9jYWxOb2RlTW9kdWxlcyB8fCAnJywgJ2VzbGludCcpXG4gIH0gZWxzZSB7XG4gICAgbG9jYXRpb25UeXBlID0gJ2FkdmFuY2VkIHNwZWNpZmllZCdcbiAgICBlc2xpbnREaXIgPSBQYXRoLmpvaW4ocHJvamVjdFBhdGgsIGNvbmZpZy5hZHZhbmNlZExvY2FsTm9kZU1vZHVsZXMsICdlc2xpbnQnKVxuICB9XG4gIGlmIChpc0RpcmVjdG9yeShlc2xpbnREaXIpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBhdGg6IGVzbGludERpcixcbiAgICAgIHR5cGU6IGxvY2F0aW9uVHlwZSxcbiAgICB9XG4gIH0gZWxzZSBpZiAoY29uZmlnLnVzZUdsb2JhbEVzbGludCkge1xuICAgIHRocm93IG5ldyBFcnJvcignRVNMaW50IG5vdCBmb3VuZCwgcGxlYXNlIGVuc3VyZSB0aGUgZ2xvYmFsIE5vZGUgcGF0aCBpcyBzZXQgY29ycmVjdGx5LicpXG4gIH1cbiAgcmV0dXJuIHtcbiAgICBwYXRoOiBDYWNoZS5FU0xJTlRfTE9DQUxfUEFUSCxcbiAgICB0eXBlOiAnYnVuZGxlZCBmYWxsYmFjaycsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVTTGludEZyb21EaXJlY3RvcnkobW9kdWxlc0RpciwgY29uZmlnLCBwcm9qZWN0UGF0aCkge1xuICBjb25zdCB7IHBhdGg6IEVTTGludERpcmVjdG9yeSB9ID0gZmluZEVTTGludERpcmVjdG9yeShtb2R1bGVzRGlyLCBjb25maWcsIHByb2plY3RQYXRoKVxuICB0cnkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tZHluYW1pYy1yZXF1aXJlXG4gICAgcmV0dXJuIHJlcXVpcmUoRVNMaW50RGlyZWN0b3J5KVxuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGNvbmZpZy51c2VHbG9iYWxFc2xpbnQgJiYgZS5jb2RlID09PSAnTU9EVUxFX05PVF9GT1VORCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRVNMaW50IG5vdCBmb3VuZCwgdHJ5IHJlc3RhcnRpbmcgQXRvbSB0byBjbGVhciBjYWNoZXMuJylcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby1keW5hbWljLXJlcXVpcmVcbiAgICByZXR1cm4gcmVxdWlyZShDYWNoZS5FU0xJTlRfTE9DQUxfUEFUSClcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVmcmVzaE1vZHVsZXNQYXRoKG1vZHVsZXNEaXIpIHtcbiAgaWYgKENhY2hlLkxBU1RfTU9EVUxFU19QQVRIICE9PSBtb2R1bGVzRGlyKSB7XG4gICAgQ2FjaGUuTEFTVF9NT0RVTEVTX1BBVEggPSBtb2R1bGVzRGlyXG4gICAgcHJvY2Vzcy5lbnYuTk9ERV9QQVRIID0gbW9kdWxlc0RpciB8fCAnJ1xuICAgIHJlcXVpcmUoJ21vZHVsZScpLk1vZHVsZS5faW5pdFBhdGhzKClcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RVNMaW50SW5zdGFuY2UoZmlsZURpciwgY29uZmlnLCBwcm9qZWN0UGF0aCkge1xuICBjb25zdCBtb2R1bGVzRGlyID0gUGF0aC5kaXJuYW1lKGZpbmRDYWNoZWQoZmlsZURpciwgJ25vZGVfbW9kdWxlcy9lc2xpbnQnKSB8fCAnJylcbiAgcmVmcmVzaE1vZHVsZXNQYXRoKG1vZHVsZXNEaXIpXG4gIHJldHVybiBnZXRFU0xpbnRGcm9tRGlyZWN0b3J5KG1vZHVsZXNEaXIsIGNvbmZpZywgcHJvamVjdFBhdGggfHwgJycpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb25maWdQYXRoKGZpbGVEaXIpIHtcbiAgY29uc3QgY29uZmlnRmlsZSA9XG4gICAgZmluZENhY2hlZChmaWxlRGlyLCBbXG4gICAgICAnLmVzbGludHJjLmpzJywgJy5lc2xpbnRyYy55YW1sJywgJy5lc2xpbnRyYy55bWwnLCAnLmVzbGludHJjLmpzb24nLCAnLmVzbGludHJjJywgJ3BhY2thZ2UuanNvbidcbiAgICBdKVxuICBpZiAoY29uZmlnRmlsZSkge1xuICAgIGlmIChQYXRoLmJhc2VuYW1lKGNvbmZpZ0ZpbGUpID09PSAncGFja2FnZS5qc29uJykge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby1keW5hbWljLXJlcXVpcmVcbiAgICAgIGlmIChyZXF1aXJlKGNvbmZpZ0ZpbGUpLmVzbGludENvbmZpZykge1xuICAgICAgICByZXR1cm4gY29uZmlnRmlsZVxuICAgICAgfVxuICAgICAgLy8gSWYgd2UgYXJlIGhlcmUsIHdlIGZvdW5kIGEgcGFja2FnZS5qc29uIHdpdGhvdXQgYW4gZXNsaW50IGNvbmZpZ1xuICAgICAgLy8gaW4gYSBkaXIgd2l0aG91dCBhbnkgb3RoZXIgZXNsaW50IGNvbmZpZyBmaWxlc1xuICAgICAgLy8gKGJlY2F1c2UgJ3BhY2thZ2UuanNvbicgaXMgbGFzdCBpbiB0aGUgY2FsbCB0byBmaW5kQ2FjaGVkKVxuICAgICAgLy8gU28sIGtlZXAgbG9va2luZyBmcm9tIHRoZSBwYXJlbnQgZGlyZWN0b3J5XG4gICAgICByZXR1cm4gZ2V0Q29uZmlnUGF0aChQYXRoLnJlc29sdmUoUGF0aC5kaXJuYW1lKGNvbmZpZ0ZpbGUpLCAnLi4nKSlcbiAgICB9XG4gICAgcmV0dXJuIGNvbmZpZ0ZpbGVcbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVsYXRpdmVQYXRoKGZpbGVEaXIsIGZpbGVQYXRoLCBjb25maWcpIHtcbiAgY29uc3QgaWdub3JlRmlsZSA9IGNvbmZpZy5kaXNhYmxlRXNsaW50SWdub3JlID8gbnVsbCA6IGZpbmRDYWNoZWQoZmlsZURpciwgJy5lc2xpbnRpZ25vcmUnKVxuXG4gIGlmIChpZ25vcmVGaWxlKSB7XG4gICAgY29uc3QgaWdub3JlRGlyID0gUGF0aC5kaXJuYW1lKGlnbm9yZUZpbGUpXG4gICAgcHJvY2Vzcy5jaGRpcihpZ25vcmVEaXIpXG4gICAgcmV0dXJuIFBhdGgucmVsYXRpdmUoaWdub3JlRGlyLCBmaWxlUGF0aClcbiAgfVxuICBwcm9jZXNzLmNoZGlyKGZpbGVEaXIpXG4gIHJldHVybiBQYXRoLmJhc2VuYW1lKGZpbGVQYXRoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q0xJRW5naW5lT3B0aW9ucyh0eXBlLCBjb25maWcsIHJ1bGVzLCBmaWxlUGF0aCwgZmlsZURpciwgZ2l2ZW5Db25maWdQYXRoKSB7XG4gIGNvbnN0IGNsaUVuZ2luZUNvbmZpZyA9IHtcbiAgICBydWxlcyxcbiAgICBpZ25vcmU6ICFjb25maWcuZGlzYWJsZUVzbGludElnbm9yZSxcbiAgICB3YXJuSWdub3JlZDogZmFsc2UsXG4gICAgZml4OiB0eXBlID09PSAnZml4J1xuICB9XG5cbiAgY29uc3QgaWdub3JlRmlsZSA9IGNvbmZpZy5kaXNhYmxlRXNsaW50SWdub3JlID8gbnVsbCA6IGZpbmRDYWNoZWQoZmlsZURpciwgJy5lc2xpbnRpZ25vcmUnKVxuICBpZiAoaWdub3JlRmlsZSkge1xuICAgIGNsaUVuZ2luZUNvbmZpZy5pZ25vcmVQYXRoID0gaWdub3JlRmlsZVxuICB9XG5cbiAgaWYgKGNvbmZpZy5lc2xpbnRSdWxlc0Rpcikge1xuICAgIGxldCBydWxlc0RpciA9IHJlc29sdmVFbnYoY29uZmlnLmVzbGludFJ1bGVzRGlyKVxuICAgIGlmICghUGF0aC5pc0Fic29sdXRlKHJ1bGVzRGlyKSkge1xuICAgICAgcnVsZXNEaXIgPSBmaW5kQ2FjaGVkKGZpbGVEaXIsIHJ1bGVzRGlyKVxuICAgIH1cbiAgICBpZiAocnVsZXNEaXIpIHtcbiAgICAgIGNsaUVuZ2luZUNvbmZpZy5ydWxlUGF0aHMgPSBbcnVsZXNEaXJdXG4gICAgfVxuICB9XG5cbiAgaWYgKGdpdmVuQ29uZmlnUGF0aCA9PT0gbnVsbCAmJiBjb25maWcuZXNsaW50cmNQYXRoKSB7XG4gICAgLy8gSWYgd2UgZGlkbid0IGZpbmQgYSBjb25maWd1cmF0aW9uIHVzZSB0aGUgZmFsbGJhY2sgZnJvbSB0aGUgc2V0dGluZ3NcbiAgICBjbGlFbmdpbmVDb25maWcuY29uZmlnRmlsZSA9IHJlc29sdmVFbnYoY29uZmlnLmVzbGludHJjUGF0aClcbiAgfVxuXG4gIHJldHVybiBjbGlFbmdpbmVDb25maWdcbn1cbiJdfQ==