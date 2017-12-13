Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _atom = require('atom');

var _electron = require('electron');

var _json5 = require('json5');

var _json52 = _interopRequireDefault(_json5);

'use babel';

var packagePath = atom.packages.resolvePackagePath('atom-live-server');
var liveServer = _path2['default'].join(packagePath, '/node_modules/live-server/live-server.js');
var node = _path2['default'].resolve(process.env.NODE_PATH, '../../app/apm/bin/node');

var serverProcess = undefined;
var disposeMenu = undefined;
var noBrowser = undefined;

function addStartMenu() {
  disposeMenu = atom.menu.add([{
    label: 'Packages',
    submenu: [{
      label: 'atom-live-server',
      submenu: [{
        label: 'Start server',
        command: 'atom-live-server:startServer'
      }]
    }]
  }]);
}

exports['default'] = {
  subscriptions: null,

  activate: function activate(state) {
    var _this = this;

    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-live-server:start-3000': function atomLiveServerStart3000() {
        return _this.startServer(3000);
      },
      'atom-live-server:start-4000': function atomLiveServerStart4000() {
        return _this.startServer(4000);
      },
      'atom-live-server:start-5000': function atomLiveServerStart5000() {
        return _this.startServer(5000);
      },
      'atom-live-server:start-8000': function atomLiveServerStart8000() {
        return _this.startServer(8000);
      },
      'atom-live-server:start-9000': function atomLiveServerStart9000() {
        return _this.startServer(9000);
      },
      'atom-live-server:startServer': function atomLiveServerStartServer() {
        return _this.startServer();
      },
      'atom-live-server:stopServer': function atomLiveServerStopServer() {
        return _this.stopServer();
      }
    }));

    addStartMenu();
  },

  deactivate: function deactivate() {
    this.stopServer();
    this.subscriptions.dispose();
  },

  startServer: function startServer() {
    var _this2 = this;

    var port = arguments.length <= 0 || arguments[0] === undefined ? 3000 : arguments[0];

    if (serverProcess) {
      return;
    }

    var targetPath = atom.project.getPaths()[0];

    if (!targetPath) {
      atom.notifications.addWarning('[Live Server] You haven\'t opened a Project, you must open one.');
      return;
    }

    noBrowser = false;
    var args = [];
    var stdout = function stdout(output) {
      if (output.indexOf('Serving ') === 0) {
        var serverUrl = output.split(' at ')[1];
        var _port = _url2['default'].parse(serverUrl).port;
        var disposeStartMenu = disposeMenu;
        disposeMenu = atom.menu.add([{
          label: 'Packages',
          submenu: [{
            label: 'atom-live-server',
            submenu: [{
              label: output.replace('Serving ', 'Stop '),
              command: 'atom-live-server:stopServer'
            }]
          }]
        }]);

        disposeStartMenu.dispose();

        if (noBrowser) {
          atom.notifications.addSuccess('[Live Server] Live server started at ' + serverUrl + '.');
        }
      }

      console.log('[Live Server] ' + output);
    };

    var exit = function exit(code) {
      console.info('[Live Server] Exited with code ' + code);
      _this2.stopServer();
    };

    _fs2['default'].open(_path2['default'].join(targetPath, '.atom-live-server.json'), 'r', function (err, fd) {
      if (!err) {
        (function () {
          var userConfig = _json52['default'].parse(_fs2['default'].readFileSync(fd, 'utf8'));

          Object.keys(userConfig).forEach(function (key) {
            if (key === 'no-browser') {
              if (userConfig[key] === true) {
                args.push('--' + key);
                noBrowser = true;
              }
            } else if (key === 'root') {
              args.unshift('' + userConfig[key]);
            } else {
              args.push('--' + key + '=' + userConfig[key]);
            }
          });
        })();
      }

      if (!args.length) {
        args.push('--port=' + port);
      }

      args.unshift(liveServer);

      serverProcess = new _atom.BufferedProcess({
        command: node,
        args: args,
        stdout: stdout,
        exit: exit,
        options: {
          cwd: targetPath
        }
      });

      console.info('[Live Server] live-server ' + args.join(' '));
    });
  },

  stopServer: function stopServer() {
    try {
      serverProcess.kill();
    } catch (e) {
      console.error(e);
    }

    serverProcess = null;
    var disposeStopMenu = disposeMenu;
    addStartMenu();
    disposeStopMenu && disposeStopMenu.dispose();
    atom.notifications.addSuccess('[Live Server] Live server is stopped.');
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmRvdGZpbGVzL2F0b20uc3ltbGluay9wYWNrYWdlcy9hdG9tLWxpdmUtc2VydmVyL2xpYi9hdG9tLWxpdmUtc2VydmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztvQkFFaUIsTUFBTTs7OztrQkFDUixJQUFJOzs7O21CQUNILEtBQUs7Ozs7b0JBQ2dDLE1BQU07O3dCQUNwQyxVQUFVOztxQkFDZixPQUFPOzs7O0FBUHpCLFdBQVcsQ0FBQzs7QUFTWixJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDekUsSUFBTSxVQUFVLEdBQUcsa0JBQUssSUFBSSxDQUFDLFdBQVcsRUFBRSwwQ0FBMEMsQ0FBQyxDQUFDO0FBQ3RGLElBQU0sSUFBSSxHQUFHLGtCQUFLLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDOztBQUUzRSxJQUFJLGFBQWEsWUFBQSxDQUFDO0FBQ2xCLElBQUksV0FBVyxZQUFBLENBQUM7QUFDaEIsSUFBSSxTQUFTLFlBQUEsQ0FBQzs7QUFFZCxTQUFTLFlBQVksR0FBRztBQUN0QixhQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQ3pCLENBQUM7QUFDQyxTQUFLLEVBQUUsVUFBVTtBQUNqQixXQUFPLEVBQUcsQ0FBQztBQUNULFdBQUssRUFBRSxrQkFBa0I7QUFDekIsYUFBTyxFQUFHLENBQUM7QUFDVCxhQUFLLEVBQUUsY0FBYztBQUNyQixlQUFPLGdDQUFnQztPQUN4QyxDQUFDO0tBQ0gsQ0FBQztHQUNILENBQUMsQ0FDSCxDQUFDO0NBQ0g7O3FCQUVjO0FBQ2IsZUFBYSxFQUFFLElBQUk7O0FBRW5CLFVBQVEsRUFBQSxrQkFBQyxLQUFLLEVBQUU7OztBQUNkLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUM7O0FBRS9DLFFBQUks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RCxZQUFVLEVBQUEsc0JBQUc7QUFDWCxRQUFJO0FBQ0YsbUJBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUN0QixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsYUFBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNsQjs7QUFFRCxpQkFBYSxHQUFHLElBQUksQ0FBQztBQUNyQixRQUFNLGVBQWUsR0FBRyxXQUFXLENBQUM7QUFDcEMsZ0JBQVksRUFBRSxDQUFDO0FBQ2YsbUJBQWUsSUFBSSxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDN0MsUUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsdUNBQXVDLENBQUMsQ0FBQztHQUN4RTtDQUNGIiwiZmlsZSI6Ii9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmRvdGZpbGVzL2F0b20uc3ltbGluay9wYWNrYWdlcy9hdG9tLWxpdmUtc2VydmVyL2xpYi9hdG9tLWxpdmUtc2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCB1cmwgZnJvbSAndXJsJztcbmltcG9ydCB7IEJ1ZmZlcmVkUHJvY2VzcywgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHsgcmVtb3RlIH0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IEpTT041IGZyb20gJ2pzb241JztcblxuY29uc3QgcGFja2FnZVBhdGggPSBhdG9tLnBhY2thZ2VzLnJlc29sdmVQYWNrYWdlUGF0aCgnYXRvbS1saXZlLXNlcnZlcicpO1xuY29uc3QgbGl2ZVNlcnZlciA9IHBhdGguam9pbihwYWNrYWdlUGF0aCwgJy9ub2RlX21vZHVsZXMvbGl2ZS1zZXJ2ZXIvbGl2ZS1zZXJ2ZXIuanMnKTtcbmNvbnN0IG5vZGUgPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5lbnYuTk9ERV9QQVRILCAnLi4vLi4vYXBwL2FwbS9iaW4vbm9kZScpO1xuXG5sZXQgc2VydmVyUHJvY2VzcztcbmxldCBkaXNwb3NlTWVudTtcbmxldCBub0Jyb3dzZXI7XG5cbmZ1bmN0aW9uIGFkZFN0YXJ0TWVudSgpIHtcbiAgZGlzcG9zZU1lbnUgPSBhdG9tLm1lbnUuYWRkKFxuICAgIFt7XG4gICAgICBsYWJlbDogJ1BhY2thZ2VzJyxcbiAgICAgIHN1Ym1lbnUgOiBbe1xuICAgICAgICBsYWJlbDogJ2F0b20tbGl2ZS1zZXJ2ZXInLFxuICAgICAgICBzdWJtZW51IDogW3tcbiAgICAgICAgICBsYWJlbDogJ1N0YXJ0IHNlcnZlcicsXG4gICAgICAgICAgY29tbWFuZDogYGF0b20tbGl2ZS1zZXJ2ZXI6c3RhcnRTZXJ2ZXJgXG4gICAgICAgIH1dXG4gICAgICB9XVxuICAgIH1dXG4gICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgc3Vic2NyaXB0aW9uczogbnVsbCxcblxuICBhY3RpdmF0ZShzdGF0ZSkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdhdG9tLWxpdmUtc2VydmVyOnN0YXJ0LTMwMDAnOiAoKSA9PiB0aGlzLnN0YXJ0U2VydmVyKDMwMDApLFxuICAgICAgJ2F0b20tbGl2ZS1zZXJ2ZXI6c3RhcnQtNDAwMCc6ICgpID0+IHRoaXMuc3RhcnRTZXJ2ZXIoNDAwMCksXG4gICAgICAnYXRvbS1saXZlLXNlcnZlcjpzdGFydC01MDAwJzogKCkgPT4gdGhpcy5zdGFydFNlcnZlcig1MDAwKSxcbiAgICAgICdhdG9tLWxpdmUtc2VydmVyOnN0YXJ0LTgwMDAnOiAoKSA9PiB0aGlzLnN0YXJ0U2VydmVyKDgwMDApLFxuICAgICAgJ2F0b20tbGl2ZS1zZXJ2ZXI6c3RhcnQtOTAwMCc6ICgpID0+IHRoaXMuc3RhcnRTZXJ2ZXIoOTAwMCksXG4gICAgICAnYXRvbS1saXZlLXNlcnZlcjpzdGFydFNlcnZlcic6ICgpID0+IHRoaXMuc3RhcnRTZXJ2ZXIoKSxcbiAgICAgICdhdG9tLWxpdmUtc2VydmVyOnN0b3BTZXJ2ZXInOiAoKSA9PiB0aGlzLnN0b3BTZXJ2ZXIoKVxuICAgIH0pKTtcblxuICAgIGFkZFN0YXJ0TWVudSgpO1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5zdG9wU2VydmVyKCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfSxcblxuICBzdGFydFNlcnZlcihwb3J0ID0gMzAwMCkge1xuICAgIGlmIChzZXJ2ZXJQcm9jZXNzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdGFyZ2V0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdO1xuXG4gICAgaWYgKCF0YXJnZXRQYXRoKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnW0xpdmUgU2VydmVyXSBZb3UgaGF2ZW5cXCd0IG9wZW5lZCBhIFByb2plY3QsIHlvdSBtdXN0IG9wZW4gb25lLicpXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbm9Ccm93c2VyID0gZmFsc2U7XG4gICAgY29uc3QgYXJncyA9IFtdO1xuICAgIGNvbnN0IHN0ZG91dCA9IG91dHB1dCA9PiB7XG4gICAgICBpZiAob3V0cHV0LmluZGV4T2YoJ1NlcnZpbmcgJykgPT09IDApIHtcbiAgICAgICAgY29uc3Qgc2VydmVyVXJsID0gb3V0cHV0LnNwbGl0KCcgYXQgJylbMV07XG4gICAgICAgIGNvbnN0IHBvcnQgPSB1cmwucGFyc2Uoc2VydmVyVXJsKS5wb3J0O1xuICAgICAgICBjb25zdCBkaXNwb3NlU3RhcnRNZW51ID0gZGlzcG9zZU1lbnU7XG4gICAgICAgIGRpc3Bvc2VNZW51ID0gYXRvbS5tZW51LmFkZChcbiAgICAgICAgICBbe1xuICAgICAgICAgICAgbGFiZWw6ICdQYWNrYWdlcycsXG4gICAgICAgICAgICBzdWJtZW51IDogW3tcbiAgICAgICAgICAgICAgbGFiZWw6ICdhdG9tLWxpdmUtc2VydmVyJyxcbiAgICAgICAgICAgICAgc3VibWVudSA6IFt7XG4gICAgICAgICAgICAgICAgbGFiZWw6IG91dHB1dC5yZXBsYWNlKCdTZXJ2aW5nICcsICdTdG9wICcpLFxuICAgICAgICAgICAgICAgIGNvbW1hbmQ6IGBhdG9tLWxpdmUtc2VydmVyOnN0b3BTZXJ2ZXJgXG4gICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9XVxuICAgICAgICAgIH1dXG4gICAgICAgICk7XG5cbiAgICAgICAgZGlzcG9zZVN0YXJ0TWVudS5kaXNwb3NlKCk7XG5cbiAgICAgICAgaWYgKG5vQnJvd3Nlcikge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKGBbTGl2ZSBTZXJ2ZXJdIExpdmUgc2VydmVyIHN0YXJ0ZWQgYXQgJHtzZXJ2ZXJVcmx9LmApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnNvbGUubG9nKGBbTGl2ZSBTZXJ2ZXJdICR7b3V0cHV0fWApO1xuICAgIH07XG5cbiAgICBjb25zdCBleGl0ID0gY29kZSA9PiB7XG4gICAgICBjb25zb2xlLmluZm8oYFtMaXZlIFNlcnZlcl0gRXhpdGVkIHdpdGggY29kZSAke2NvZGV9YCk7XG4gICAgICB0aGlzLnN0b3BTZXJ2ZXIoKTtcbiAgICB9XG5cbiAgICBmcy5vcGVuKHBhdGguam9pbih0YXJnZXRQYXRoLCAnLmF0b20tbGl2ZS1zZXJ2ZXIuanNvbicpLCAncicsIChlcnIsIGZkKSA9PiB7XG4gICAgICBpZiAoIWVycikge1xuICAgICAgICBjb25zdCB1c2VyQ29uZmlnID0gSlNPTjUucGFyc2UoZnMucmVhZEZpbGVTeW5jKGZkLCAndXRmOCcpKTtcblxuICAgICAgICBPYmplY3Qua2V5cyh1c2VyQ29uZmlnKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ25vLWJyb3dzZXInKSB7XG4gICAgICAgICAgICBpZiAodXNlckNvbmZpZ1trZXldID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgIGFyZ3MucHVzaChgLS0ke2tleX1gKTtcbiAgICAgICAgICAgICAgbm9Ccm93c2VyID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoa2V5ID09PSAncm9vdCcpIHtcbiAgICAgICAgICAgICAgYXJncy51bnNoaWZ0KGAke3VzZXJDb25maWdba2V5XX1gKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICBhcmdzLnB1c2goYC0tJHtrZXl9PSR7dXNlckNvbmZpZ1trZXldfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICghYXJncy5sZW5ndGgpIHtcbiAgICAgICAgYXJncy5wdXNoKGAtLXBvcnQ9JHtwb3J0fWApO1xuICAgICAgfVxuXG4gICAgICBhcmdzLnVuc2hpZnQobGl2ZVNlcnZlcik7XG5cbiAgICAgIHNlcnZlclByb2Nlc3MgPSBuZXcgQnVmZmVyZWRQcm9jZXNzKHtcbiAgICAgICAgY29tbWFuZDogbm9kZSxcbiAgICAgICAgYXJncyxcbiAgICAgICAgc3Rkb3V0LFxuICAgICAgICBleGl0LFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgY3dkOiB0YXJnZXRQYXRoLFxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY29uc29sZS5pbmZvKGBbTGl2ZSBTZXJ2ZXJdIGxpdmUtc2VydmVyICR7YXJncy5qb2luKCcgJyl9YCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgc3RvcFNlcnZlcigpIHtcbiAgICB0cnkge1xuICAgICAgc2VydmVyUHJvY2Vzcy5raWxsKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG5cbiAgICBzZXJ2ZXJQcm9jZXNzID0gbnVsbDtcbiAgICBjb25zdCBkaXNwb3NlU3RvcE1lbnUgPSBkaXNwb3NlTWVudTtcbiAgICBhZGRTdGFydE1lbnUoKTtcbiAgICBkaXNwb3NlU3RvcE1lbnUgJiYgZGlzcG9zZVN0b3BNZW51LmRpc3Bvc2UoKTtcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcygnW0xpdmUgU2VydmVyXSBMaXZlIHNlcnZlciBpcyBzdG9wcGVkLicpO1xuICB9XG59O1xuIl19