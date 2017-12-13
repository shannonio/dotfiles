var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _path = require('path');

var Path = _interopRequireWildcard(_path);

var _srcWorkerHelpers = require('../src/worker-helpers');

var Helpers = _interopRequireWildcard(_srcWorkerHelpers);

'use babel';

var getFixturesPath = function getFixturesPath(path) {
  return Path.join(__dirname, 'fixtures', path);
};

var globalNodePath = process.platform === 'win32' ? Path.join(getFixturesPath('global-eslint'), 'lib') : getFixturesPath('global-eslint');

describe('Worker Helpers', function () {
  describe('findESLintDirectory', function () {
    it('returns an object with path and type keys', function () {
      var modulesDir = Path.join(getFixturesPath('local-eslint'), 'node_modules');
      var foundEslint = Helpers.findESLintDirectory(modulesDir, {});
      expect(typeof foundEslint === 'object').toBe(true);
      expect(foundEslint.path).toBeDefined();
      expect(foundEslint.type).toBeDefined();
    });

    it('finds a local eslint when useGlobalEslint is false', function () {
      var modulesDir = Path.join(getFixturesPath('local-eslint'), 'node_modules');
      var foundEslint = Helpers.findESLintDirectory(modulesDir, { useGlobalEslint: false });
      var expectedEslintPath = Path.join(getFixturesPath('local-eslint'), 'node_modules', 'eslint');
      expect(foundEslint.path).toEqual(expectedEslintPath);
      expect(foundEslint.type).toEqual('local project');
    });

    it('does not find a local eslint when useGlobalEslint is true', function () {
      var modulesDir = Path.join(getFixturesPath('local-eslint'), 'node_modules');
      var config = { useGlobalEslint: true, globalNodePath: globalNodePath };
      var foundEslint = Helpers.findESLintDirectory(modulesDir, config);
      var expectedEslintPath = Path.join(getFixturesPath('local-eslint'), 'node_modules', 'eslint');
      expect(foundEslint.path).not.toEqual(expectedEslintPath);
      expect(foundEslint.type).not.toEqual('local project');
    });

    it('finds a global eslint when useGlobalEslint is true and a valid globalNodePath is provided', function () {
      var modulesDir = Path.join(getFixturesPath('local-eslint'), 'node_modules');
      var config = { useGlobalEslint: true, globalNodePath: globalNodePath };
      var foundEslint = Helpers.findESLintDirectory(modulesDir, config);
      var expectedEslintPath = process.platform === 'win32' ? Path.join(globalNodePath, 'node_modules', 'eslint') : Path.join(globalNodePath, 'lib', 'node_modules', 'eslint');
      expect(foundEslint.path).toEqual(expectedEslintPath);
      expect(foundEslint.type).toEqual('global');
    });

    it('falls back to the packaged eslint when no local eslint is found', function () {
      var modulesDir = 'not/a/real/path';
      var config = { useGlobalEslint: false };
      var foundEslint = Helpers.findESLintDirectory(modulesDir, config);
      var expectedBundledPath = Path.join(__dirname, '..', 'node_modules', 'eslint');
      expect(foundEslint.path).toEqual(expectedBundledPath);
      expect(foundEslint.type).toEqual('bundled fallback');
    });
  });

  describe('getESLintInstance && getESLintFromDirectory', function () {
    it('tries to find an indirect local eslint using an absolute path', function () {
      var path = Path.join(getFixturesPath('indirect-local-eslint'), 'testing', 'eslint', 'node_modules');
      var eslint = Helpers.getESLintInstance('', {
        useGlobalEslint: false,
        advancedLocalNodeModules: path
      });
      expect(eslint).toBe('located');
    });

    it('tries to find an indirect local eslint using a relative path', function () {
      var path = Path.join(getFixturesPath('indirect-local-eslint'), 'testing', 'eslint', 'node_modules');

      var _atom$project$relativizePath = atom.project.relativizePath(path);

      var _atom$project$relativizePath2 = _slicedToArray(_atom$project$relativizePath, 2);

      var projectPath = _atom$project$relativizePath2[0];
      var relativePath = _atom$project$relativizePath2[1];

      var eslint = Helpers.getESLintInstance('', {
        useGlobalEslint: false,
        advancedLocalNodeModules: relativePath
      }, projectPath);

      expect(eslint).toBe('located');
    });

    it('tries to find a local eslint', function () {
      var eslint = Helpers.getESLintInstance(getFixturesPath('local-eslint'), {});
      expect(eslint).toBe('located');
    });

    it('cries if local eslint is not found', function () {
      expect(function () {
        Helpers.getESLintInstance(getFixturesPath('files', {}));
      }).toThrow();
    });

    it('tries to find a global eslint if config is specified', function () {
      var eslint = Helpers.getESLintInstance(getFixturesPath('local-eslint'), {
        useGlobalEslint: true,
        globalNodePath: globalNodePath
      });
      expect(eslint).toBe('located');
    });

    it('cries if global eslint is not found', function () {
      expect(function () {
        Helpers.getESLintInstance(getFixturesPath('local-eslint'), {
          useGlobalEslint: true,
          globalNodePath: getFixturesPath('files')
        });
      }).toThrow();
    });

    it('tries to find a local eslint with nested node_modules', function () {
      var fileDir = Path.join(getFixturesPath('local-eslint'), 'lib', 'foo.js');
      var eslint = Helpers.getESLintInstance(fileDir, {});
      expect(eslint).toBe('located');
    });
  });

  describe('getConfigPath', function () {
    it('finds .eslintrc', function () {
      var fileDir = getFixturesPath(Path.join('configs', 'no-ext'));
      var expectedPath = Path.join(fileDir, '.eslintrc');
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });

    it('finds .eslintrc.yaml', function () {
      var fileDir = getFixturesPath(Path.join('configs', 'yaml'));
      var expectedPath = Path.join(fileDir, '.eslintrc.yaml');
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });

    it('finds .eslintrc.yml', function () {
      var fileDir = getFixturesPath(Path.join('configs', 'yml'));
      var expectedPath = Path.join(fileDir, '.eslintrc.yml');
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });

    it('finds .eslintrc.js', function () {
      var fileDir = getFixturesPath(Path.join('configs', 'js'));
      var expectedPath = Path.join(fileDir, '.eslintrc.js');
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });

    it('finds .eslintrc.json', function () {
      var fileDir = getFixturesPath(Path.join('configs', 'json'));
      var expectedPath = Path.join(fileDir, '.eslintrc.json');
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });

    it('finds package.json with an eslintConfig property', function () {
      var fileDir = getFixturesPath(Path.join('configs', 'package-json'));
      var expectedPath = Path.join(fileDir, 'package.json');
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });

    it('ignores package.json with no eslintConfig property', function () {
      var fileDir = getFixturesPath(Path.join('configs', 'package-json', 'nested'));
      var expectedPath = getFixturesPath(Path.join('configs', 'package-json', 'package.json'));
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });
  });

  describe('getRelativePath', function () {
    it('return path relative of ignore file if found', function () {
      var fixtureDir = getFixturesPath('eslintignore');
      var fixtureFile = Path.join(fixtureDir, 'ignored.js');
      var relativePath = Helpers.getRelativePath(fixtureDir, fixtureFile, {});
      var expectedPath = Path.relative(Path.join(__dirname, '..'), fixtureFile);
      expect(relativePath).toBe(expectedPath);
    });

    it('does not return path relative to ignore file if config overrides it', function () {
      var fixtureDir = getFixturesPath('eslintignore');
      var fixtureFile = Path.join(fixtureDir, 'ignored.js');
      var relativePath = Helpers.getRelativePath(fixtureDir, fixtureFile, { disableEslintIgnore: true });
      expect(relativePath).toBe('ignored.js');
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcGVjL3dvcmtlci1oZWxwZXJzLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztvQkFFc0IsTUFBTTs7SUFBaEIsSUFBSTs7Z0NBQ1MsdUJBQXVCOztJQUFwQyxPQUFPOztBQUhuQixXQUFXLENBQUE7O0FBS1gsSUFBTSxlQUFlLEdBQUcsU0FBbEIsZUFBZSxDQUFHLElBQUk7U0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDO0NBQUEsQ0FBQTs7QUFHdEUsSUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLFFBQVEsS0FBSyxPQUFPLEdBQ2pELElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUNsRCxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUE7O0FBRWxDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxZQUFNO0FBQy9CLFVBQVEsQ0FBQyxxQkFBcUIsRUFBRSxZQUFNO0FBQ3BDLE1BQUUsQ0FBQywyQ0FBMkMsRUFBRSxZQUFNO0FBQ3BELFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFBO0FBQzdFLFVBQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDL0QsWUFBTSxDQUFDLE9BQU8sV0FBVyxLQUFLLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNsRCxZQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ3RDLFlBQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUE7S0FDdkMsQ0FBQyxDQUFBOztBQUVG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RUFBRSxZQUFNO0FBQzlFLFVBQU0sVUFBVSxHQUFHLGVBQWUsQ0FBQyxjQUFjLENBQUMsQ0FBQTtBQUNsRCxVQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQTtBQUN2RCxVQUFNLFlBQVksR0FDaEIsT0FBTyxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUNqRixZQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO0tBQ3hDLENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTtDQUNILENBQUMsQ0FBQSIsImZpbGUiOiIvVXNlcnMvc2hhbm5vbmJlcnR1Y2NpLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3BlYy93b3JrZXItaGVscGVycy1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0ICogYXMgUGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0ICogYXMgSGVscGVycyBmcm9tICcuLi9zcmMvd29ya2VyLWhlbHBlcnMnXG5cbmNvbnN0IGdldEZpeHR1cmVzUGF0aCA9IHBhdGggPT4gUGF0aC5qb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzJywgcGF0aClcblxuXG5jb25zdCBnbG9iYWxOb2RlUGF0aCA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgP1xuICBQYXRoLmpvaW4oZ2V0Rml4dHVyZXNQYXRoKCdnbG9iYWwtZXNsaW50JyksICdsaWInKSA6XG4gIGdldEZpeHR1cmVzUGF0aCgnZ2xvYmFsLWVzbGludCcpXG5cbmRlc2NyaWJlKCdXb3JrZXIgSGVscGVycycsICgpID0+IHtcbiAgZGVzY3JpYmUoJ2ZpbmRFU0xpbnREaXJlY3RvcnknLCAoKSA9PiB7XG4gICAgaXQoJ3JldHVybnMgYW4gb2JqZWN0IHdpdGggcGF0aCBhbmQgdHlwZSBrZXlzJywgKCkgPT4ge1xuICAgICAgY29uc3QgbW9kdWxlc0RpciA9IFBhdGguam9pbihnZXRGaXh0dXJlc1BhdGgoJ2xvY2FsLWVzbGludCcpLCAnbm9kZV9tb2R1bGVzJylcbiAgICAgIGNvbnN0IGZvdW5kRXNsaW50ID0gSGVscGVycy5maW5kRVNMaW50RGlyZWN0b3J5KG1vZHVsZXNEaXIsIHt9KVxuICAgICAgZXhwZWN0KHR5cGVvZiBmb3VuZEVzbGludCA9PT0gJ29iamVjdCcpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChmb3VuZEVzbGludC5wYXRoKS50b0JlRGVmaW5lZCgpXG4gICAgICBleHBlY3QoZm91bmRFc2xpbnQudHlwZSkudG9CZURlZmluZWQoKVxuICAgIH0pXG5cbiAgICBpdCgnZmluZHMgYSBsb2NhbCBlc2xpbnQgd2hlbiB1c2VHbG9iYWxFc2xpbnQgaXMgZmFsc2UnLCAoKSA9PiB7XG4gICAgICBjb25zdCBtb2R1bGVzRGlyID0gUGF0aC5qb2luKGdldEZpeHR1cmVzUGF0aCgnbG9jYWwtZXNsaW50JyksICdub2RlX21vZHVsZXMnKVxuICAgICAgY29uc3QgZm91bmRFc2xpbnQgPSBIZWxwZXJzLmZpbmRFU0xpbnREaXJlY3RvcnkobW9kdWxlc0RpciwgeyB1c2VHbG9iYWxFc2xpbnQ6IGZhbHNlIH0pXG4gICAgICBjb25zdCBleHBlY3RlZEVzbGludFBhdGggPSBQYXRoLmpvaW4oZ2V0Rml4dHVyZXNQYXRoKCdsb2NhbC1lc2xpbnQnKSwgJ25vZGVfbW9kdWxlcycsICdlc2xpbnQnKVxuICAgICAgZXhwZWN0KGZvdW5kRXNsaW50LnBhdGgpLnRvRXF1YWwoZXhwZWN0ZWRFc2xpbnRQYXRoKVxuICAgICAgZXhwZWN0KGZvdW5kRXNsaW50LnR5cGUpLnRvRXF1YWwoJ2xvY2FsIHByb2plY3QnKVxuICAgIH0pXG5cbiAgICBpdCgnZG9lcyBub3QgZmluZCBhIGxvY2FsIGVzbGludCB3aGVuIHVzZUdsb2JhbEVzbGludCBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgY29uc3QgbW9kdWxlc0RpciA9IFBhdGguam9pbihnZXRGaXh0dXJlc1BhdGgoJ2xvY2FsLWVzbGludCcpLCAnbm9kZV9tb2R1bGVzJylcbiAgICAgIGNvbnN0IGNvbmZpZyA9IHsgdXNlR2xvYmFsRXNsaW50OiB0cnVlLCBnbG9iYWxOb2RlUGF0aCB9XG4gICAgICBjb25zdCBmb3VuZEVzbGludCA9IEhlbHBlcnMuZmluZEVTTGludERpcmVjdG9yeShtb2R1bGVzRGlyLCBjb25maWcpXG4gICAgICBjb25zdCBleHBlY3RlZEVzbGludFBhdGggPSBQYXRoLmpvaW4oZ2V0Rml4dHVyZXNQYXRoKCdsb2NhbC1lc2xpbnQnKSwgJ25vZGVfbW9kdWxlcycsICdlc2xpbnQnKVxuICAgICAgZXhwZWN0KGZvdW5kRXNsaW50LnBhdGgpLm5vdC50b0VxdWFsKGV4cGVjdGVkRXNsaW50UGF0aClcbiAgICAgIGV4cGVjdChmb3VuZEVzbGludC50eXBlKS5ub3QudG9FcXVhbCgnbG9jYWwgcHJvamVjdCcpXG4gICAgfSlcblxuICAgIGl0KCdmaW5kcyBhIGdsb2JhbCBlc2xpbnQgd2hlbiB1c2VHbG9iYWxFc2xpbnQgaXMgdHJ1ZSBhbmQgYSB2YWxpZCBnbG9iYWxOb2RlUGF0aCBpcyBwcm92aWRlZCcsICgpID0+IHtcbiAgICAgIGNvbnN0IG1vZHVsZXNEaXIgPSBQYXRoLmpvaW4oZ2V0Rml4dHVyZXNQYXRoKCdsb2NhbC1lc2xpbnQnKSwgJ25vZGVfbW9kdWxlcycpXG4gICAgICBjb25zdCBjb25maWcgPSB7IHVzZUdsb2JhbEVzbGludDogdHJ1ZSwgZ2xvYmFsTm9kZVBhdGggfVxuICAgICAgY29uc3QgZm91bmRFc2xpbnQgPSBIZWxwZXJzLmZpbmRFU0xpbnREaXJlY3RvcnkobW9kdWxlc0RpciwgY29uZmlnKVxuICAgICAgY29uc3QgZXhwZWN0ZWRFc2xpbnRQYXRoID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJ1xuICAgICAgICA/IFBhdGguam9pbihnbG9iYWxOb2RlUGF0aCwgJ25vZGVfbW9kdWxlcycsICdlc2xpbnQnKVxuICAgICAgICA6IFBhdGguam9pbihnbG9iYWxOb2RlUGF0aCwgJ2xpYicsICdub2RlX21vZHVsZXMnLCAnZXNsaW50JylcbiAgICAgIGV4cGVjdChmb3VuZEVzbGludC5wYXRoKS50b0VxdWFsKGV4cGVjdGVkRXNsaW50UGF0aClcbiAgICAgIGV4cGVjdChmb3VuZEVzbGludC50eXBlKS50b0VxdWFsKCdnbG9iYWwnKVxuICAgIH0pXG5cbiAgICBpdCgnZmFsbHMgYmFjayB0byB0aGUgcGFja2FnZWQgZXNsaW50IHdoZW4gbm8gbG9jYWwgZXNsaW50IGlzIGZvdW5kJywgKCkgPT4ge1xuICAgICAgY29uc3QgbW9kdWxlc0RpciA9ICdub3QvYS9yZWFsL3BhdGgnXG4gICAgICBjb25zdCBjb25maWcgPSB7IHVzZUdsb2JhbEVzbGludDogZmFsc2UgfVxuICAgICAgY29uc3QgZm91bmRFc2xpbnQgPSBIZWxwZXJzLmZpbmRFU0xpbnREaXJlY3RvcnkobW9kdWxlc0RpciwgY29uZmlnKVxuICAgICAgY29uc3QgZXhwZWN0ZWRCdW5kbGVkUGF0aCA9IFBhdGguam9pbihfX2Rpcm5hbWUsICcuLicsICdub2RlX21vZHVsZXMnLCAnZXNsaW50JylcbiAgICAgIGV4cGVjdChmb3VuZEVzbGludC5wYXRoKS50b0VxdWFsKGV4cGVjdGVkQnVuZGxlZFBhdGgpXG4gICAgICBleHBlY3QoZm91bmRFc2xpbnQudHlwZSkudG9FcXVhbCgnYnVuZGxlZCBmYWxsYmFjaycpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnZ2V0RVNMaW50SW5zdGFuY2UgJiYgZ2V0RVNMaW50RnJvbURpcmVjdG9yeScsICgpID0+IHtcbiAgICBpdCgndHJpZXMgdG8gZmluZCBhbiBpbmRpcmVjdCBsb2NhbCBlc2xpbnQgdXNpbmcgYW4gYWJzb2x1dGUgcGF0aCcsICgpID0+IHtcbiAgICAgIGNvbnN0IHBhdGggPSBQYXRoLmpvaW4oXG4gICAgICAgIGdldEZpeHR1cmVzUGF0aCgnaW5kaXJlY3QtbG9jYWwtZXNsaW50JyksICd0ZXN0aW5nJywgJ2VzbGludCcsICdub2RlX21vZHVsZXMnKVxuICAgICAgY29uc3QgZXNsaW50ID0gSGVscGVycy5nZXRFU0xpbnRJbnN0YW5jZSgnJywge1xuICAgICAgICB1c2VHbG9iYWxFc2xpbnQ6IGZhbHNlLFxuICAgICAgICBhZHZhbmNlZExvY2FsTm9kZU1vZHVsZXM6IHBhdGhcbiAgICAgIH0pXG4gICAgICBleHBlY3QoZXNsaW50KS50b0JlKCdsb2NhdGVkJylcbiAgICB9KVxuXG4gICAgaXQoJ3RyaWVzIHRvIGZpbmQgYW4gaW5kaXJlY3QgbG9jYWwgZXNsaW50IHVzaW5nIGEgcmVsYXRpdmUgcGF0aCcsICgpID0+IHtcbiAgICAgIGNvbnN0IHBhdGggPSBQYXRoLmpvaW4oXG4gICAgICAgIGdldEZpeHR1cmVzUGF0aCgnaW5kaXJlY3QtbG9jYWwtZXNsaW50JyksICd0ZXN0aW5nJywgJ2VzbGludCcsICdub2RlX21vZHVsZXMnKVxuICAgICAgY29uc3QgW3Byb2plY3RQYXRoLCByZWxhdGl2ZVBhdGhdID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKHBhdGgpXG5cbiAgICAgIGNvbnN0IGVzbGludCA9IEhlbHBlcnMuZ2V0RVNMaW50SW5zdGFuY2UoJycsIHtcbiAgICAgICAgdXNlR2xvYmFsRXNsaW50OiBmYWxzZSxcbiAgICAgICAgYWR2YW5jZWRMb2NhbE5vZGVNb2R1bGVzOiByZWxhdGl2ZVBhdGhcbiAgICAgIH0sIHByb2plY3RQYXRoKVxuXG4gICAgICBleHBlY3QoZXNsaW50KS50b0JlKCdsb2NhdGVkJylcbiAgICB9KVxuXG4gICAgaXQoJ3RyaWVzIHRvIGZpbmQgYSBsb2NhbCBlc2xpbnQnLCAoKSA9PiB7XG4gICAgICBjb25zdCBlc2xpbnQgPSBIZWxwZXJzLmdldEVTTGludEluc3RhbmNlKGdldEZpeHR1cmVzUGF0aCgnbG9jYWwtZXNsaW50JyksIHt9KVxuICAgICAgZXhwZWN0KGVzbGludCkudG9CZSgnbG9jYXRlZCcpXG4gICAgfSlcblxuICAgIGl0KCdjcmllcyBpZiBsb2NhbCBlc2xpbnQgaXMgbm90IGZvdW5kJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgSGVscGVycy5nZXRFU0xpbnRJbnN0YW5jZShnZXRGaXh0dXJlc1BhdGgoJ2ZpbGVzJywge30pKVxuICAgICAgfSkudG9UaHJvdygpXG4gICAgfSlcblxuICAgIGl0KCd0cmllcyB0byBmaW5kIGEgZ2xvYmFsIGVzbGludCBpZiBjb25maWcgaXMgc3BlY2lmaWVkJywgKCkgPT4ge1xuICAgICAgY29uc3QgZXNsaW50ID0gSGVscGVycy5nZXRFU0xpbnRJbnN0YW5jZShnZXRGaXh0dXJlc1BhdGgoJ2xvY2FsLWVzbGludCcpLCB7XG4gICAgICAgIHVzZUdsb2JhbEVzbGludDogdHJ1ZSxcbiAgICAgICAgZ2xvYmFsTm9kZVBhdGhcbiAgICAgIH0pXG4gICAgICBleHBlY3QoZXNsaW50KS50b0JlKCdsb2NhdGVkJylcbiAgICB9KVxuXG4gICAgaXQoJ2NyaWVzIGlmIGdsb2JhbCBlc2xpbnQgaXMgbm90IGZvdW5kJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgSGVscGVycy5nZXRFU0xpbnRJbnN0YW5jZShnZXRGaXh0dXJlc1BhdGgoJ2xvY2FsLWVzbGludCcpLCB7XG4gICAgICAgICAgdXNlR2xvYmFsRXNsaW50OiB0cnVlLFxuICAgICAgICAgIGdsb2JhbE5vZGVQYXRoOiBnZXRGaXh0dXJlc1BhdGgoJ2ZpbGVzJylcbiAgICAgICAgfSlcbiAgICAgIH0pLnRvVGhyb3coKVxuICAgIH0pXG5cbiAgICBpdCgndHJpZXMgdG8gZmluZCBhIGxvY2FsIGVzbGludCB3aXRoIG5lc3RlZCBub2RlX21vZHVsZXMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlRGlyID0gUGF0aC5qb2luKGdldEZpeHR1cmVzUGF0aCgnbG9jYWwtZXNsaW50JyksICdsaWInLCAnZm9vLmpzJylcbiAgICAgIGNvbnN0IGVzbGludCA9IEhlbHBlcnMuZ2V0RVNMaW50SW5zdGFuY2UoZmlsZURpciwge30pXG4gICAgICBleHBlY3QoZXNsaW50KS50b0JlKCdsb2NhdGVkJylcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdnZXRDb25maWdQYXRoJywgKCkgPT4ge1xuICAgIGl0KCdmaW5kcyAuZXNsaW50cmMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlRGlyID0gZ2V0Rml4dHVyZXNQYXRoKFBhdGguam9pbignY29uZmlncycsICduby1leHQnKSlcbiAgICAgIGNvbnN0IGV4cGVjdGVkUGF0aCA9IFBhdGguam9pbihmaWxlRGlyLCAnLmVzbGludHJjJylcbiAgICAgIGV4cGVjdChIZWxwZXJzLmdldENvbmZpZ1BhdGgoZmlsZURpcikpLnRvQmUoZXhwZWN0ZWRQYXRoKVxuICAgIH0pXG5cbiAgICBpdCgnZmluZHMgLmVzbGludHJjLnlhbWwnLCAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlRGlyID0gZ2V0Rml4dHVyZXNQYXRoKFBhdGguam9pbignY29uZmlncycsICd5YW1sJykpXG4gICAgICBjb25zdCBleHBlY3RlZFBhdGggPSBQYXRoLmpvaW4oZmlsZURpciwgJy5lc2xpbnRyYy55YW1sJylcbiAgICAgIGV4cGVjdChIZWxwZXJzLmdldENvbmZpZ1BhdGgoZmlsZURpcikpLnRvQmUoZXhwZWN0ZWRQYXRoKVxuICAgIH0pXG5cbiAgICBpdCgnZmluZHMgLmVzbGludHJjLnltbCcsICgpID0+IHtcbiAgICAgIGNvbnN0IGZpbGVEaXIgPSBnZXRGaXh0dXJlc1BhdGgoUGF0aC5qb2luKCdjb25maWdzJywgJ3ltbCcpKVxuICAgICAgY29uc3QgZXhwZWN0ZWRQYXRoID0gUGF0aC5qb2luKGZpbGVEaXIsICcuZXNsaW50cmMueW1sJylcbiAgICAgIGV4cGVjdChIZWxwZXJzLmdldENvbmZpZ1BhdGgoZmlsZURpcikpLnRvQmUoZXhwZWN0ZWRQYXRoKVxuICAgIH0pXG5cbiAgICBpdCgnZmluZHMgLmVzbGludHJjLmpzJywgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsZURpciA9IGdldEZpeHR1cmVzUGF0aChQYXRoLmpvaW4oJ2NvbmZpZ3MnLCAnanMnKSlcbiAgICAgIGNvbnN0IGV4cGVjdGVkUGF0aCA9IFBhdGguam9pbihmaWxlRGlyLCAnLmVzbGludHJjLmpzJylcbiAgICAgIGV4cGVjdChIZWxwZXJzLmdldENvbmZpZ1BhdGgoZmlsZURpcikpLnRvQmUoZXhwZWN0ZWRQYXRoKVxuICAgIH0pXG5cbiAgICBpdCgnZmluZHMgLmVzbGludHJjLmpzb24nLCAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlRGlyID0gZ2V0Rml4dHVyZXNQYXRoKFBhdGguam9pbignY29uZmlncycsICdqc29uJykpXG4gICAgICBjb25zdCBleHBlY3RlZFBhdGggPSBQYXRoLmpvaW4oZmlsZURpciwgJy5lc2xpbnRyYy5qc29uJylcbiAgICAgIGV4cGVjdChIZWxwZXJzLmdldENvbmZpZ1BhdGgoZmlsZURpcikpLnRvQmUoZXhwZWN0ZWRQYXRoKVxuICAgIH0pXG5cbiAgICBpdCgnZmluZHMgcGFja2FnZS5qc29uIHdpdGggYW4gZXNsaW50Q29uZmlnIHByb3BlcnR5JywgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsZURpciA9IGdldEZpeHR1cmVzUGF0aChQYXRoLmpvaW4oJ2NvbmZpZ3MnLCAncGFja2FnZS1qc29uJykpXG4gICAgICBjb25zdCBleHBlY3RlZFBhdGggPSBQYXRoLmpvaW4oZmlsZURpciwgJ3BhY2thZ2UuanNvbicpXG4gICAgICBleHBlY3QoSGVscGVycy5nZXRDb25maWdQYXRoKGZpbGVEaXIpKS50b0JlKGV4cGVjdGVkUGF0aClcbiAgICB9KVxuXG4gICAgaXQoJ2lnbm9yZXMgcGFja2FnZS5qc29uIHdpdGggbm8gZXNsaW50Q29uZmlnIHByb3BlcnR5JywgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsZURpciA9IGdldEZpeHR1cmVzUGF0aChQYXRoLmpvaW4oJ2NvbmZpZ3MnLCAncGFja2FnZS1qc29uJywgJ25lc3RlZCcpKVxuICAgICAgY29uc3QgZXhwZWN0ZWRQYXRoID0gZ2V0Rml4dHVyZXNQYXRoKFBhdGguam9pbignY29uZmlncycsICdwYWNrYWdlLWpzb24nLCAncGFja2FnZS5qc29uJykpXG4gICAgICBleHBlY3QoSGVscGVycy5nZXRDb25maWdQYXRoKGZpbGVEaXIpKS50b0JlKGV4cGVjdGVkUGF0aClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdnZXRSZWxhdGl2ZVBhdGgnLCAoKSA9PiB7XG4gICAgaXQoJ3JldHVybiBwYXRoIHJlbGF0aXZlIG9mIGlnbm9yZSBmaWxlIGlmIGZvdW5kJywgKCkgPT4ge1xuICAgICAgY29uc3QgZml4dHVyZURpciA9IGdldEZpeHR1cmVzUGF0aCgnZXNsaW50aWdub3JlJylcbiAgICAgIGNvbnN0IGZpeHR1cmVGaWxlID0gUGF0aC5qb2luKGZpeHR1cmVEaXIsICdpZ25vcmVkLmpzJylcbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IEhlbHBlcnMuZ2V0UmVsYXRpdmVQYXRoKGZpeHR1cmVEaXIsIGZpeHR1cmVGaWxlLCB7fSlcbiAgICAgIGNvbnN0IGV4cGVjdGVkUGF0aCA9IFBhdGgucmVsYXRpdmUoUGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJyksIGZpeHR1cmVGaWxlKVxuICAgICAgZXhwZWN0KHJlbGF0aXZlUGF0aCkudG9CZShleHBlY3RlZFBhdGgpXG4gICAgfSlcblxuICAgIGl0KCdkb2VzIG5vdCByZXR1cm4gcGF0aCByZWxhdGl2ZSB0byBpZ25vcmUgZmlsZSBpZiBjb25maWcgb3ZlcnJpZGVzIGl0JywgKCkgPT4ge1xuICAgICAgY29uc3QgZml4dHVyZURpciA9IGdldEZpeHR1cmVzUGF0aCgnZXNsaW50aWdub3JlJylcbiAgICAgIGNvbnN0IGZpeHR1cmVGaWxlID0gUGF0aC5qb2luKGZpeHR1cmVEaXIsICdpZ25vcmVkLmpzJylcbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9XG4gICAgICAgIEhlbHBlcnMuZ2V0UmVsYXRpdmVQYXRoKGZpeHR1cmVEaXIsIGZpeHR1cmVGaWxlLCB7IGRpc2FibGVFc2xpbnRJZ25vcmU6IHRydWUgfSlcbiAgICAgIGV4cGVjdChyZWxhdGl2ZVBhdGgpLnRvQmUoJ2lnbm9yZWQuanMnKVxuICAgIH0pXG4gIH0pXG59KVxuIl19