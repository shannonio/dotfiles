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
exports.getRules = getRules;
exports.didRulesChange = didRulesChange;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

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

/**
 * Takes a path and translates `~` to the user's home directory, and replaces
 * all environment variables with their value.
 * @param  {string} path The path to remove "strangeness" from
 * @return {string}      The cleaned path
 */
var cleanPath = function cleanPath(path) {
  return path ? (0, _resolveEnv2['default'])(_fsPlus2['default'].normalize(path)) : '';
};

function getNodePrefixPath() {
  if (Cache.NODE_PREFIX_PATH === null) {
    var npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    try {
      Cache.NODE_PREFIX_PATH = _child_process2['default'].spawnSync(npmCommand, ['get', 'prefix'], {
        env: Object.assign(Object.assign({}, process.env), { PATH: (0, _consistentPath2['default'])() })
      }).output[1].toString().trim();
    } catch (e) {
      var errMsg = 'Unable to execute `npm get prefix`. Please make sure ' + 'Atom is getting $PATH correctly.';
      throw new Error(errMsg);
    }
  }
  return Cache.NODE_PREFIX_PATH;
}

function isDirectory(dirPath) {
  var isDir = undefined;
  try {
    isDir = _fsPlus2['default'].statSync(dirPath).isDirectory();
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
    var configGlobal = cleanPath(config.globalNodePath);
    var prefixPath = configGlobal || getNodePrefixPath();
    // NPM on Windows and Yarn on all platforms
    eslintDir = _path2['default'].join(prefixPath, 'node_modules', 'eslint');
    if (!isDirectory(eslintDir)) {
      // NPM on platforms other than Windows
      eslintDir = _path2['default'].join(prefixPath, 'lib', 'node_modules', 'eslint');
    }
  } else if (!config.advancedLocalNodeModules) {
    locationType = 'local project';
    eslintDir = _path2['default'].join(modulesDir || '', 'eslint');
  } else if (_path2['default'].isAbsolute(cleanPath(config.advancedLocalNodeModules))) {
    locationType = 'advanced specified';
    eslintDir = _path2['default'].join(cleanPath(config.advancedLocalNodeModules), 'eslint');
  } else {
    locationType = 'advanced specified';
    eslintDir = _path2['default'].join(projectPath || '', cleanPath(config.advancedLocalNodeModules), 'eslint');
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
    // eslint-disable-next-line no-underscore-dangle
    require('module').Module._initPaths();
  }
}

function getESLintInstance(fileDir, config, projectPath) {
  var modulesDir = _path2['default'].dirname((0, _atomLinter.findCached)(fileDir, 'node_modules/eslint') || '');
  refreshModulesPath(modulesDir);
  return getESLintFromDirectory(modulesDir, config, projectPath);
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

function getRelativePath(fileDir, filePath, config, projectPath) {
  var ignoreFile = config.disableEslintIgnore ? null : (0, _atomLinter.findCached)(fileDir, '.eslintignore');

  // If we can find an .eslintignore file, we can set cwd there
  // (because they are expected to be at the project root)
  if (ignoreFile) {
    var ignoreDir = _path2['default'].dirname(ignoreFile);
    process.chdir(ignoreDir);
    return _path2['default'].relative(ignoreDir, filePath);
  }
  // Otherwise, we'll set the cwd to the atom project root as long as that exists
  if (projectPath) {
    process.chdir(projectPath);
    return _path2['default'].relative(projectPath, filePath);
  }
  // If all else fails, use the file location itself
  process.chdir(fileDir);
  return _path2['default'].basename(filePath);
}

function getCLIEngineOptions(type, config, rules, filePath, fileDir, givenConfigPath) {
  var cliEngineConfig = {
    rules: rules,
    ignore: !config.disableEslintIgnore,
    fix: type === 'fix'
  };

  var ignoreFile = config.disableEslintIgnore ? null : (0, _atomLinter.findCached)(fileDir, '.eslintignore');
  if (ignoreFile) {
    cliEngineConfig.ignorePath = ignoreFile;
  }

  cliEngineConfig.rulePaths = config.eslintRulesDirs.map(function (path) {
    var rulesDir = cleanPath(path);
    if (!_path2['default'].isAbsolute(rulesDir)) {
      return (0, _atomLinter.findCached)(fileDir, rulesDir);
    }
    return rulesDir;
  }).filter(function (path) {
    return path;
  });

  if (givenConfigPath === null && config.eslintrcPath) {
    // If we didn't find a configuration use the fallback from the settings
    cliEngineConfig.configFile = cleanPath(config.eslintrcPath);
  }

  return cliEngineConfig;
}

/**
 * Gets the list of rules used for a lint job
 * @param  {Object} cliEngine The CLIEngine instance used for the lint job
 * @return {Map}              A Map of the rules used, rule names as keys, rule
 *                            properties as the contents.
 */

function getRules(cliEngine) {
  // Pull the list of rules used directly from the CLIEngine
  // Added in https://github.com/eslint/eslint/pull/9782
  if (Object.prototype.hasOwnProperty.call(cliEngine, 'getRules')) {
    return cliEngine.getRules();
  }

  // Attempt to use the internal (undocumented) `linter` instance attached to
  // the CLIEngine to get the loaded rules (including plugin rules).
  // Added in ESLint v4
  if (Object.prototype.hasOwnProperty.call(cliEngine, 'linter')) {
    return cliEngine.linter.getRules();
  }

  // Older versions of ESLint don't (easily) support getting a list of rules
  return new Map();
}

/**
 * Given an exiting rule list and a new rule list, determines whether there
 * have been changes.
 * NOTE: This only accounts for presence of the rules, changes to their metadata
 * are not taken into account.
 * @param  {Map} newRules     A Map of the new rules
 * @param  {Map} currentRules A Map of the current rules
 * @return {boolean}             Whether or not there were changes
 */

function didRulesChange(currentRules, newRules) {
  return !(currentRules.size === newRules.size && Array.from(currentRules.keys()).every(function (ruleId) {
    return newRules.has(ruleId);
  }));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmRvdGZpbGVzL2F0b20uc3ltbGluay9wYWNrYWdlcy9saW50ZXItZXNsaW50L3NyYy93b3JrZXItaGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O29CQUVpQixNQUFNOzs7O3NCQUNSLFNBQVM7Ozs7NkJBQ0MsZUFBZTs7OzswQkFDakIsYUFBYTs7OzswQkFDVCxhQUFhOzs4QkFDcEIsaUJBQWlCOzs7O0FBUHJDLFdBQVcsQ0FBQTs7QUFTWCxJQUFNLEtBQUssR0FBRztBQUNaLG1CQUFpQixFQUFFLGtCQUFLLFNBQVMsQ0FBQyxrQkFBSyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdkYsa0JBQWdCLEVBQUUsSUFBSTtBQUN0QixtQkFBaUIsRUFBRSxJQUFJO0NBQ3hCLENBQUE7Ozs7Ozs7O0FBUUQsSUFBTSxTQUFTLEdBQUcsU0FBWixTQUFTLENBQUcsSUFBSTtTQUFLLElBQUksR0FBRyw2QkFBVyxvQkFBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFO0NBQUMsQ0FBQTs7QUFFL0QsU0FBUyxpQkFBaUIsR0FBRztBQUNsQyxNQUFJLEtBQUssQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJLEVBQUU7QUFDbkMsUUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFFBQVEsS0FBSyxPQUFPLEdBQUcsU0FBUyxHQUFHLEtBQUssQ0FBQTtBQUNuRSxRQUFJO0FBQ0YsV0FBSyxDQUFDLGdCQUFnQixHQUNwQiwyQkFBYSxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxFQUFFO0FBQ3BELFdBQUcsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxrQ0FBUyxFQUFF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QU8sU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQTtHQUNuQzs7O0FBR0QsU0FBTyxJQUFJLEdBQUcsRUFBRSxDQUFBO0NBQ2pCOzs7Ozs7Ozs7Ozs7QUFXTSxTQUFTLGNBQWMsQ0FBQyxZQUFZLEVBQUUsUUFBUSxFQUFFO0FBQ3JELFNBQU8sRUFBRSxZQUFZLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxJQUFJLElBQzFDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQUEsTUFBTTtXQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO0dBQUEsQ0FBQyxDQUFBLEFBQUMsQ0FBQTtDQUN6RSIsImZpbGUiOiIvVXNlcnMvc2hhbm5vbmJlcnR1Y2NpLy5kb3RmaWxlcy9hdG9tLnN5bWxpbmsvcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvd29ya2VyLWhlbHBlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgUGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzLXBsdXMnXG5pbXBvcnQgQ2hpbGRQcm9jZXNzIGZyb20gJ2NoaWxkX3Byb2Nlc3MnXG5pbXBvcnQgcmVzb2x2ZUVudiBmcm9tICdyZXNvbHZlLWVudidcbmltcG9ydCB7IGZpbmRDYWNoZWQgfSBmcm9tICdhdG9tLWxpbnRlcidcbmltcG9ydCBnZXRQYXRoIGZyb20gJ2NvbnNpc3RlbnQtcGF0aCdcblxuY29uc3QgQ2FjaGUgPSB7XG4gIEVTTElOVF9MT0NBTF9QQVRIOiBQYXRoLm5vcm1hbGl6ZShQYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAnbm9kZV9tb2R1bGVzJywgJ2VzbGludCcpKSxcbiAgTk9ERV9QUkVGSVhfUEFUSDogbnVsbCxcbiAgTEFTVF9NT0RVTEVTX1BBVEg6IG51bGxcbn1cblxuLyoqXG4gKiBUYWtlcyBhIHBhdGggYW5kIHRyYW5zbGF0ZXMgYH5gIHRvIHRoZSB1c2VyJ3MgaG9tZSBkaXJlY3RvcnksIGFuZCByZXBsYWNlc1xuICogYWxsIGVudmlyb25tZW50IHZhcmlhYmxlcyB3aXRoIHRoZWlyIHZhbHVlLlxuICogQHBhcmFtICB7c3RyaW5nfSBwYXRoIFRoZSBwYXRoIHRvIHJlbW92ZSBcInN0cmFuZ2VuZXNzXCIgZnJvbVxuICogQHJldHVybiB7c3RyaW5nfSAgICAgIFRoZSBjbGVhbmVkIHBhdGhcbiAqL1xuY29uc3QgY2xlYW5QYXRoID0gcGF0aCA9PiAocGF0aCA/IHJlc29sdmVFbnYoZnMubm9ybWFsaXplKHBhdGgpKSA6ICcnKVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Tm9kZVByZWZpeFBhdGgoKSB7XG4gIGlmIChDYWNoZS5OT0RFX1BSRUZJWF9QQVRIID09PSBudWxsKSB7XG4gICAgY29uc3QgbnBtQ29tbWFuZCA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgPyAnbnBtLmNtZCcgOiAnbnBtJ1xuICAgIHRyeSB7XG4gICAgICBDYWNoZS5OT0RFX1BSRUZJWF9QQVRIID1cbiAgICAgICAgQ2hpbGRQcm9jZXNzLnNwYXduU3luYyhucG1Db21tYW5kLCBbJ2dldCcsICdwcmVmaXgnXSwge1xuICAgICAgICAgIGVudjogT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBwcm9jZXNzLmVudiksIHsgUEFUSDogZ2V0UGF0aCgpIH0pXG4gICAgICAgIH0pLm91dHB1dFsxXS50b1N0cmluZygpLnRyaW0oKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnN0IGVyck1zZyA9ICdVbmFibGUgdG8gZXhlY3V0ZSBgbnBtIGdldCBwcmVmaXhgLiBQbGVhc2UgbWFrZSBzdXJlICcgK1xuICAgICAgICAnQXRvbSBpcyBnZXR0aW5nICRQQVRIIGNvcnJlY3RseS4nXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyTXNnKVxuICAgIH1cbiAgfVxuICByZXR1cm4gQ2FjaGUuTk9ERV9QUkVGSVhfUEFUSFxufVxuXG5mdW5jdGlvbiBpc0RpcmVjdG9yeShkaXJQYXRoKSB7XG4gIGxldCBpc0RpclxuICB0cnkge1xuICAgIGlzRGlyID0gZnMuc3RhdFN5bmMoZGlyUGF0aCkuaXNEaXJlY3RvcnkoKVxuICB9IGNhdGNoIChlKSB7XG4gICAgaXNEaXIgPSBmYWxzZVxuICB9XG4gIHJldHVybiBpc0RpclxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZEVTTGludERpcmVjdG9yeShtb2R1bGVzRGlyLCBjb25maWcsIHByb2plY3RQYXRoKSB7XG4gIGxldCBlc2xpbnREaXIgPSBudWxsXG4gIGxldCBsb2NhdGlvblR5cGUgPSBudWxsXG4gIGlmIChjb25maWcudXNlR2xvYmFsRXNsaW50KSB7XG4gICAgbG9jYXRpb25UeXBlID0gJ2dsb2JhbCdcbiAgICBjb25zdCBjb25maWdHbG9iYWwgPSBjbGVhblBhdGgoY29uZmlnLmdsb2JhbE5vZGVQYXRoKVxuICAgIGNvbnN0IHByZWZpeFBhdGggPSBjb25maWdHbG9iYWwgfHwgZ2V0Tm9kZVByZWZpeFBhdGgoKVxuICAgIC8vIE5QTSBvbiBXaW5kb3dzIGFuZCBZYXJuIG9uIGFsbCBwbGF0Zm9ybXNcbiAgICBlc2xpbnREaXIgPSBQYXRoLmpvaW4ocHJlZml4UGF0aCwgJ25vZGVfbW9kdWxlcycsICdlc2xpbnQnKVxuICAgIGlmICghaXNEaXJlY3RvcnkoZXNsaW50RGlyKSkge1xuICAgICAgLy8gTlBNIG9uIHBsYXRmb3JtcyBvdGhlciB0aGFuIFdpbmRvd3NcbiAgICAgIGVzbGludERpciA9IFBhdGguam9pbihwcmVmaXhQYXRoLCAnbGliJywgJ25vZGVfbW9kdWxlcycsICdlc2xpbnQnKVxuICAgIH1cbiAgfSBlbHNlIGlmICghY29uZmlnLmFkdmFuY2VkTG9jYWxOb2RlTW9kdWxlcykge1xuICAgIGxvY2F0aW9uVHlwZSA9ICdsb2NhbCBwcm9qZWN0J1xuICAgIGVzbGludERpciA9IFBhdGguam9pbihtb2R1bGVzRGlyIHx8ICcnLCAnZXNsaW50JylcbiAgfSBlbHNlIGlmIChQYXRoLmlzQWJzb2x1dGUoY2xlYW5QYXRoKGNvbmZpZy5hZHZhbmNlZExvY2FsTm9kZU1vZHVsZXMpKSkge1xuICAgIGxvY2F0aW9uVHlwZSA9ICdhZHZhbmNlZCBzcGVjaWZpZWQnXG4gICAgZXNsaW50RGlyID0gUGF0aC5qb2luKGNsZWFuUGF0aChjb25maWcuYWR2YW5jZWRMb2NhbE5vZGVNb2R1bGVzKSwgJ2VzbGludCcpXG4gIH0gZWxzZSB7XG4gICAgbG9jYXRpb25UeXBlID0gJ2FkdmFuY2VkIHNwZWNpZmllZCdcbiAgICBlc2xpbnREaXIgPSBQYXRoLmpvaW4ocHJvamVjdFBhdGggfHwgJycsIGNsZWFuUGF0aChjb25maWcuYWR2YW5jZWRMb2NhbE5vZGVNb2R1bGVzKSwgJ2VzbGludCcpXG4gIH1cbiAgaWYgKGlzRGlyZWN0b3J5KGVzbGludERpcikpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcGF0aDogZXNsaW50RGlyLFxuICAgICAgdHlwZTogbG9jYXRpb25UeXBlLFxuICAgIH1cbiAgfSBlbHNlIGlmIChjb25maWcudXNlR2xvYmFsRXNsaW50KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFU0xpbnQgbm90IGZvdW5kLCBwbGVhc2UgZW5zdXJlIHRoZSBnbG9iYWwgTm9kZSBwYXRoIGlzIHNldCBjb3JyZWN0bHkuJylcbiAgfVxuICByZXR1cm4ge1xuICAgIHBhdGg6IENhY2hlLkVTTElOVF9MT0NBTF9QQVRILFxuICAgIHR5cGU6ICdidW5kbGVkIGZhbGxiYWNrJyxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RVNMaW50RnJvbURpcmVjdG9yeShtb2R1bGVzRGlyLCBjb25maWcsIHByb2plY3RQYXRoKSB7XG4gIGNvbnN0IHsgcGF0aDogRVNMaW50RGlyZWN0b3J5IH0gPSBmaW5kRVNMaW50RGlyZWN0b3J5KG1vZHVsZXNEaXIsIGNvbmZpZywgcHJvamVjdFBhdGgpXG4gIHRyeSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby1keW5hbWljLXJlcXVpcmVcbiAgICByZXR1cm4gcmVxdWlyZShFU0xpbnREaXJlY3RvcnkpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoY29uZmlnLnVzZUdsb2JhbEVzbGludCAmJiBlLmNvZGUgPT09ICdNT0RVTEVfTk9UX0ZPVU5EJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFU0xpbnQgbm90IGZvdW5kLCB0cnkgcmVzdGFydGluZyBBdG9tIHRvIGNsZWFyIGNhY2hlcy4nKVxuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLWR5bmFtaWMtcmVxdWlyZVxuICAgIHJldHVybiByZXF1aXJlKENhY2hlLkVTTElOVF9MT0NBTF9QQVRIKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWZyZXNoTW9kdWxlc1BhdGgobW9kdWxlc0Rpcikge1xuICBpZiAoQ2FjaGUuTEFTVF9NT0RVTEVTX1BBVEggIT09IG1vZHVsZXNEaXIpIHtcbiAgICBDYWNoZS5MQVNUX01PRFVMRVNfUEFUSCA9IG1vZHVsZXNEaXJcbiAgICBwcm9jZXNzLmVudi5OT0RFX1BBVEggPSBtb2R1bGVzRGlyIHx8ICcnXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVyc2NvcmUtZGFuZ2xlXG4gICAgcmVxdWlyZSgnbW9kdWxlJykuTW9kdWxlLl9pbml0UGF0aHMoKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFU0xpbnRJbnN0YW5jZShmaWxlRGlyLCBjb25maWcsIHByb2plY3RQYXRoKSB7XG4gIGNvbnN0IG1vZHVsZXNEaXIgPSBQYXRoLmRpcm5hbWUoZmluZENhY2hlZChmaWxlRGlyLCAnbm9kZV9tb2R1bGVzL2VzbGludCcpIHx8ICcnKVxuICByZWZyZXNoTW9kdWxlc1BhdGgobW9kdWxlc0RpcilcbiAgcmV0dXJuIGdldEVTTGludEZyb21EaXJlY3RvcnkobW9kdWxlc0RpciwgY29uZmlnLCBwcm9qZWN0UGF0aClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZ1BhdGgoZmlsZURpcikge1xuICBjb25zdCBjb25maWdGaWxlID1cbiAgICBmaW5kQ2FjaGVkKGZpbGVEaXIsIFtcbiAgICAgICcuZXNsaW50cmMuanMnLCAnLmVzbGludHJjLnlhbWwnLCAnLmVzbGludHJjLnltbCcsICcuZXNsaW50cmMuanNvbicsICcuZXNsaW50cmMnLCAncGFja2FnZS5qc29uJ1xuICAgIF0pXG4gIGlmIChjb25maWdGaWxlKSB7XG4gICAgaWYgKFBhdGguYmFzZW5hbWUoY29uZmlnRmlsZSkgPT09ICdwYWNrYWdlLmpzb24nKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLWR5bmFtaWMtcmVxdWlyZVxuICAgICAgaWYgKHJlcXVpcmUoY29uZmlnRmlsZSkuZXNsaW50Q29uZmlnKSB7XG4gICAgICAgIHJldHVybiBjb25maWdGaWxlXG4gICAgICB9XG4gICAgICAvLyBJZiB3ZSBhcmUgaGVyZSwgd2UgZm91bmQgYSBwYWNrYWdlLmpzb24gd2l0aG91dCBhbiBlc2xpbnQgY29uZmlnXG4gICAgICAvLyBpbiBhIGRpciB3aXRob3V0IGFueSBvdGhlciBlc2xpbnQgY29uZmlnIGZpbGVzXG4gICAgICAvLyAoYmVjYXVzZSAncGFja2FnZS5qc29uJyBpcyBsYXN0IGluIHRoZSBjYWxsIHRvIGZpbmRDYWNoZWQpXG4gICAgICAvLyBTbywga2VlcCBsb29raW5nIGZyb20gdGhlIHBhcmVudCBkaXJlY3RvcnlcbiAgICAgIHJldHVybiBnZXRDb25maWdQYXRoKFBhdGgucmVzb2x2ZShQYXRoLmRpcm5hbWUoY29uZmlnRmlsZSksICcuLicpKVxuICAgIH1cbiAgICByZXR1cm4gY29uZmlnRmlsZVxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRSZWxhdGl2ZVBhdGgoZmlsZURpciwgZmlsZVBhdGgsIGNvbmZpZywgcHJvamVjdFBhdGgpIHtcbiAgY29uc3QgaWdub3JlRmlsZSA9IGNvbmZpZy5kaXNhYmxlRXNsaW50SWdub3JlID8gbnVsbCA6IGZpbmRDYWNoZWQoZmlsZURpciwgJy5lc2xpbnRpZ25vcmUnKVxuXG4gIC8vIElmIHdlIGNhbiBmaW5kIGFuIC5lc2xpbnRpZ25vcmUgZmlsZSwgd2UgY2FuIHNldCBjd2QgdGhlcmVcbiAgLy8gKGJlY2F1c2UgdGhleSBhcmUgZXhwZWN0ZWQgdG8gYmUgYXQgdGhlIHByb2plY3Qgcm9vdClcbiAgaWYgKGlnbm9yZUZpbGUpIHtcbiAgICBjb25zdCBpZ25vcmVEaXIgPSBQYXRoLmRpcm5hbWUoaWdub3JlRmlsZSlcbiAgICBwcm9jZXNzLmNoZGlyKGlnbm9yZURpcilcbiAgICByZXR1cm4gUGF0aC5yZWxhdGl2ZShpZ25vcmVEaXIsIGZpbGVQYXRoKVxuICB9XG4gIC8vIE90aGVyd2lzZSwgd2UnbGwgc2V0IHRoZSBjd2QgdG8gdGhlIGF0b20gcHJvamVjdCByb290IGFzIGxvbmcgYXMgdGhhdCBleGlzdHNcbiAgaWYgKHByb2plY3RQYXRoKSB7XG4gICAgcHJvY2Vzcy5jaGRpcihwcm9qZWN0UGF0aClcbiAgICByZXR1cm4gUGF0aC5yZWxhdGl2ZShwcm9qZWN0UGF0aCwgZmlsZVBhdGgpXG4gIH1cbiAgLy8gSWYgYWxsIGVsc2UgZmFpbHMsIHVzZSB0aGUgZmlsZSBsb2NhdGlvbiBpdHNlbGZcbiAgcHJvY2Vzcy5jaGRpcihmaWxlRGlyKVxuICByZXR1cm4gUGF0aC5iYXNlbmFtZShmaWxlUGF0aClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENMSUVuZ2luZU9wdGlvbnModHlwZSwgY29uZmlnLCBydWxlcywgZmlsZVBhdGgsIGZpbGVEaXIsIGdpdmVuQ29uZmlnUGF0aCkge1xuICBjb25zdCBjbGlFbmdpbmVDb25maWcgPSB7XG4gICAgcnVsZXMsXG4gICAgaWdub3JlOiAhY29uZmlnLmRpc2FibGVFc2xpbnRJZ25vcmUsXG4gICAgZml4OiB0eXBlID09PSAnZml4J1xuICB9XG5cbiAgY29uc3QgaWdub3JlRmlsZSA9IGNvbmZpZy5kaXNhYmxlRXNsaW50SWdub3JlID8gbnVsbCA6IGZpbmRDYWNoZWQoZmlsZURpciwgJy5lc2xpbnRpZ25vcmUnKVxuICBpZiAoaWdub3JlRmlsZSkge1xuICAgIGNsaUVuZ2luZUNvbmZpZy5pZ25vcmVQYXRoID0gaWdub3JlRmlsZVxuICB9XG5cbiAgY2xpRW5naW5lQ29uZmlnLnJ1bGVQYXRocyA9IGNvbmZpZy5lc2xpbnRSdWxlc0RpcnMubWFwKChwYXRoKSA9PiB7XG4gICAgY29uc3QgcnVsZXNEaXIgPSBjbGVhblBhdGgocGF0aClcbiAgICBpZiAoIVBhdGguaXNBYnNvbHV0ZShydWxlc0RpcikpIHtcbiAgICAgIHJldHVybiBmaW5kQ2FjaGVkKGZpbGVEaXIsIHJ1bGVzRGlyKVxuICAgIH1cbiAgICByZXR1cm4gcnVsZXNEaXJcbiAgfSkuZmlsdGVyKHBhdGggPT4gcGF0aClcblxuICBpZiAoZ2l2ZW5Db25maWdQYXRoID09PSBudWxsICYmIGNvbmZpZy5lc2xpbnRyY1BhdGgpIHtcbiAgICAvLyBJZiB3ZSBkaWRuJ3QgZmluZCBhIGNvbmZpZ3VyYXRpb24gdXNlIHRoZSBmYWxsYmFjayBmcm9tIHRoZSBzZXR0aW5nc1xuICAgIGNsaUVuZ2luZUNvbmZpZy5jb25maWdGaWxlID0gY2xlYW5QYXRoKGNvbmZpZy5lc2xpbnRyY1BhdGgpXG4gIH1cblxuICByZXR1cm4gY2xpRW5naW5lQ29uZmlnXG59XG5cbi8qKlxuICogR2V0cyB0aGUgbGlzdCBvZiBydWxlcyB1c2VkIGZvciBhIGxpbnQgam9iXG4gKiBAcGFyYW0gIHtPYmplY3R9IGNsaUVuZ2luZSBUaGUgQ0xJRW5naW5lIGluc3RhbmNlIHVzZWQgZm9yIHRoZSBsaW50IGpvYlxuICogQHJldHVybiB7TWFwfSAgICAgICAgICAgICAgQSBNYXAgb2YgdGhlIHJ1bGVzIHVzZWQsIHJ1bGUgbmFtZXMgYXMga2V5cywgcnVsZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllcyBhcyB0aGUgY29udGVudHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRSdWxlcyhjbGlFbmdpbmUpIHtcbiAgLy8gUHVsbCB0aGUgbGlzdCBvZiBydWxlcyB1c2VkIGRpcmVjdGx5IGZyb20gdGhlIENMSUVuZ2luZVxuICAvLyBBZGRlZCBpbiBodHRwczovL2dpdGh1Yi5jb20vZXNsaW50L2VzbGludC9wdWxsLzk3ODJcbiAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChjbGlFbmdpbmUsICdnZXRSdWxlcycpKSB7XG4gICAgcmV0dXJuIGNsaUVuZ2luZS5nZXRSdWxlcygpXG4gIH1cblxuICAvLyBBdHRlbXB0IHRvIHVzZSB0aGUgaW50ZXJuYWwgKHVuZG9jdW1lbnRlZCkgYGxpbnRlcmAgaW5zdGFuY2UgYXR0YWNoZWQgdG9cbiAgLy8gdGhlIENMSUVuZ2luZSB0byBnZXQgdGhlIGxvYWRlZCBydWxlcyAoaW5jbHVkaW5nIHBsdWdpbiBydWxlcykuXG4gIC8vIEFkZGVkIGluIEVTTGludCB2NFxuICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNsaUVuZ2luZSwgJ2xpbnRlcicpKSB7XG4gICAgcmV0dXJuIGNsaUVuZ2luZS5saW50ZXIuZ2V0UnVsZXMoKVxuICB9XG5cbiAgLy8gT2xkZXIgdmVyc2lvbnMgb2YgRVNMaW50IGRvbid0IChlYXNpbHkpIHN1cHBvcnQgZ2V0dGluZyBhIGxpc3Qgb2YgcnVsZXNcbiAgcmV0dXJuIG5ldyBNYXAoKVxufVxuXG4vKipcbiAqIEdpdmVuIGFuIGV4aXRpbmcgcnVsZSBsaXN0IGFuZCBhIG5ldyBydWxlIGxpc3QsIGRldGVybWluZXMgd2hldGhlciB0aGVyZVxuICogaGF2ZSBiZWVuIGNoYW5nZXMuXG4gKiBOT1RFOiBUaGlzIG9ubHkgYWNjb3VudHMgZm9yIHByZXNlbmNlIG9mIHRoZSBydWxlcywgY2hhbmdlcyB0byB0aGVpciBtZXRhZGF0YVxuICogYXJlIG5vdCB0YWtlbiBpbnRvIGFjY291bnQuXG4gKiBAcGFyYW0gIHtNYXB9IG5ld1J1bGVzICAgICBBIE1hcCBvZiB0aGUgbmV3IHJ1bGVzXG4gKiBAcGFyYW0gIHtNYXB9IGN1cnJlbnRSdWxlcyBBIE1hcCBvZiB0aGUgY3VycmVudCBydWxlc1xuICogQHJldHVybiB7Ym9vbGVhbn0gICAgICAgICAgICAgV2hldGhlciBvciBub3QgdGhlcmUgd2VyZSBjaGFuZ2VzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaWRSdWxlc0NoYW5nZShjdXJyZW50UnVsZXMsIG5ld1J1bGVzKSB7XG4gIHJldHVybiAhKGN1cnJlbnRSdWxlcy5zaXplID09PSBuZXdSdWxlcy5zaXplICYmXG4gICAgQXJyYXkuZnJvbShjdXJyZW50UnVsZXMua2V5cygpKS5ldmVyeShydWxlSWQgPT4gbmV3UnVsZXMuaGFzKHJ1bGVJZCkpKVxufVxuIl19