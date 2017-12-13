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

      serverProcess = new _atom.BufferedNodeProcess({
        command: liveServer,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmRvdGZpbGVzL2F0b20uc3ltbGluay9wYWNrYWdlcy9hdG9tLWxpdmUtc2VydmVyL2xpYi9hdG9tLWxpdmUtc2VydmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztvQkFFaUIsTUFBTTs7OztrQkFDUixJQUFJOzs7O21CQUNILEtBQUs7Ozs7b0JBQ29DLE1BQU07O3dCQUN4QyxVQUFVOztxQkFDZixPQUFPOzs7O0FBUHpCLFdBQVcsQ0FBQzs7QUFTWixJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDekUsSUFBTSxVQUFVLEdBQUcsa0JBQUssSUFBSSxDQUFDLFdBQVcsRUFBRSwwQ0FBMEMsQ0FBQyxDQUFDOztBQUV0RixJQUFJLGFBQWEsWUFBQSxDQUFDO0FBQ2xCLElBQUksV0FBVyxZQUFBLENBQUM7QUFDaEIsSUFBSSxTQUFTLFlBQUEsQ0FBQzs7QUFFZCxTQUFTLFlBQVksR0FBRztBQUN0QixhQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQ3pCLENBQUM7QUFDQyxTQUFLLEVBQUUsVUFBVTtBQUNqQixXQUFPLEVBQUcsQ0FBQztBQUNULFdBQUssRUFBRSxrQkFBa0I7QUFDekIsYUFBTyxFQUFHLENBQUM7QUFDVCxhQUFLLEVBQUUsY0FBYztBQUNyQixlQUFPLGdDQUFnQztPQUN4QyxDQUFDO0tBQ0gsQ0FBQztHQUNILENBQUMsQ0FDSCxDQUFDO0NBQ0g7O3FCQUVjO0FBQ2IsZUFBYSxFQUFFLElBQUk7O0FBRW5CLFVBQVEsRUFBQSxrQkFBQyxLQUFLLEVBQUU7OztBQUNkLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUM7O0FBRS9DLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ3pELG1DQUE2QixFQUFF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S0FDbEI7O0FBRUQsaUJBQWEsR0FBRyxJQUFJLENBQUM7QUFDckIsUUFBTSxlQUFlLEdBQUcsV0FBVyxDQUFDO0FBQ3BDLGdCQUFZLEVBQUUsQ0FBQztBQUNmLG1CQUFlLElBQUksZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzdDLFFBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLHVDQUF1QyxDQUFDLENBQUM7R0FDeEU7Q0FDRiIsImZpbGUiOiIvVXNlcnMvc2hhbm5vbmJlcnR1Y2NpLy5kb3RmaWxlcy9hdG9tLnN5bWxpbmsvcGFja2FnZXMvYXRvbS1saXZlLXNlcnZlci9saWIvYXRvbS1saXZlLXNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgdXJsIGZyb20gJ3VybCc7XG5pbXBvcnQgeyBCdWZmZXJlZE5vZGVQcm9jZXNzLCBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgeyByZW1vdGUgfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgSlNPTjUgZnJvbSAnanNvbjUnO1xuXG5jb25zdCBwYWNrYWdlUGF0aCA9IGF0b20ucGFja2FnZXMucmVzb2x2ZVBhY2thZ2VQYXRoKCdhdG9tLWxpdmUtc2VydmVyJyk7XG5jb25zdCBsaXZlU2VydmVyID0gcGF0aC5qb2luKHBhY2thZ2VQYXRoLCAnL25vZGVfbW9kdWxlcy9saXZlLXNlcnZlci9saXZlLXNlcnZlci5qcycpO1xuXG5sZXQgc2VydmVyUHJvY2VzcztcbmxldCBkaXNwb3NlTWVudTtcbmxldCBub0Jyb3dzZXI7XG5cbmZ1bmN0aW9uIGFkZFN0YXJ0TWVudSgpIHtcbiAgZGlzcG9zZU1lbnUgPSBhdG9tLm1lbnUuYWRkKFxuICAgIFt7XG4gICAgICBsYWJlbDogJ1BhY2thZ2VzJyxcbiAgICAgIHN1Ym1lbnUgOiBbe1xuICAgICAgICBsYWJlbDogJ2F0b20tbGl2ZS1zZXJ2ZXInLFxuICAgICAgICBzdWJtZW51IDogW3tcbiAgICAgICAgICBsYWJlbDogJ1N0YXJ0IHNlcnZlcicsXG4gICAgICAgICAgY29tbWFuZDogYGF0b20tbGl2ZS1zZXJ2ZXI6c3RhcnRTZXJ2ZXJgXG4gICAgICAgIH1dXG4gICAgICB9XVxuICAgIH1dXG4gICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgc3Vic2NyaXB0aW9uczogbnVsbCxcblxuICBhY3RpdmF0ZShzdGF0ZSkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdhdG9tLWxpdmUtc2VydmVyOnN0YXJ0LTMwMDAnOiAoKSA9PiB0aGlzLnN0YXJ0U2VydmVyKDMwMDApLFxuICAgICAgJ2F0b20tbGl2ZS1zZXJ2ZXI6c3RhcnQtNDAwMCc6ICgpID0+IHRoaXMuc3RhcnRTZXJ2ZXIoNDAwMCksXG4gICAgICAnYXRvbS1saXZlLXNlcnZlcjpzdGFydC01MDAwJzogKCkgPT4gdGhpcy5zdGFydFNlcnZlcig1MDAwKSxcbiAgICAgICdhdG9tLWxpdmUtc2VydmVyOnN0YXJ0LTgwMDAnOiAoKSA9PiB0aGlzLnN0YXJ0U2VydmVyKDgwMDApLFxuICAgICAgJ2F0b20tbGl2ZS1zZXJ2ZXI6c3RhcnQtOTAwMCc6ICgpID0+IHRoaXMuc3RhcnRTZXJ2ZXIoOTAwMCksXG4gICAgICAnYXRvbS1saXZlLXNlcnZlcjpzdGFydFNlcnZlcic6ICgpID0+IHRoaXMuc3RhcnRTZXJ2ZXIoKSxcbiAgICAgICdhdG9tLWxpdmUtc2VydmVyOnN0b3BTZXJ2ZXInOiAoKSA9PiB0aGlzLnN0b3BTZXJ2ZXIoKVxuICAgIH0pKTtcblxuICAgIGFkZFN0YXJ0TWVudSgpO1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5zdG9wU2VydmVyKCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfSxcblxuICBzdGFydFNlcnZlcihwb3J0ID0gMzAwMCkge1xuICAgIGlmIChzZXJ2ZXJQcm9jZXNzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdGFyZ2V0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdO1xuXG4gICAgaWYgKCF0YXJnZXRQYXRoKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnW0xpdmUgU2VydmVyXSBZb3UgaGF2ZW5cXCd0IG9wZW5lZCBhIFByb2plY3QsIHlvdSBtdXN0IG9wZW4gb25lLicpXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbm9Ccm93c2VyID0gZmFsc2U7XG4gICAgY29uc3QgYXJncyA9IFtdO1xuICAgIGNvbnN0IHN0ZG91dCA9IG91dHB1dCA9PiB7XG4gICAgICBpZiAob3V0cHV0LmluZGV4T2YoJ1NlcnZpbmcgJykgPT09IDApIHtcbiAgICAgICAgY29uc3Qgc2VydmVyVXJsID0gb3V0cHV0LnNwbGl0KCcgYXQgJylbMV07XG4gICAgICAgIGNvbnN0IHBvcnQgPSB1cmwucGFyc2Uoc2VydmVyVXJsKS5wb3J0O1xuICAgICAgICBjb25zdCBkaXNwb3NlU3RhcnRNZW51ID0gZGlzcG9zZU1lbnU7XG4gICAgICAgIGRpc3Bvc2VNZW51ID0gYXRvbS5tZW51LmFkZChcbiAgICAgICAgICBbe1xuICAgICAgICAgICAgbGFiZWw6ICdQYWNrYWdlcycsXG4gICAgICAgICAgICBzdWJtZW51IDogW3tcbiAgICAgICAgICAgICAgbGFiZWw6ICdhdG9tLWxpdmUtc2VydmVyJyxcbiAgICAgICAgICAgICAgc3VibWVudSA6IFt7XG4gICAgICAgICAgICAgICAgbGFiZWw6IG91dHB1dC5yZXBsYWNlKCdTZXJ2aW5nICcsICdTdG9wICcpLFxuICAgICAgICAgICAgICAgIGNvbW1hbmQ6IGBhdG9tLWxpdmUtc2VydmVyOnN0b3BTZXJ2ZXJgXG4gICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9XVxuICAgICAgICAgIH1dXG4gICAgICAgICk7XG5cbiAgICAgICAgZGlzcG9zZVN0YXJ0TWVudS5kaXNwb3NlKCk7XG5cbiAgICAgICAgaWYgKG5vQnJvd3Nlcikge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKGBbTGl2ZSBTZXJ2ZXJdIExpdmUgc2VydmVyIHN0YXJ0ZWQgYXQgJHtzZXJ2ZXJVcmx9LmApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnNvbGUubG9nKGBbTGl2ZSBTZXJ2ZXJdICR7b3V0cHV0fWApO1xuICAgIH07XG5cbiAgICBjb25zdCBleGl0ID0gY29kZSA9PiB7XG4gICAgICBjb25zb2xlLmluZm8oYFtMaXZlIFNlcnZlcl0gRXhpdGVkIHdpdGggY29kZSAke2NvZGV9YCk7XG4gICAgICB0aGlzLnN0b3BTZXJ2ZXIoKTtcbiAgICB9XG5cbiAgICBmcy5vcGVuKHBhdGguam9pbih0YXJnZXRQYXRoLCAnLmF0b20tbGl2ZS1zZXJ2ZXIuanNvbicpLCAncicsIChlcnIsIGZkKSA9PiB7XG4gICAgICBpZiAoIWVycikge1xuICAgICAgICBjb25zdCB1c2VyQ29uZmlnID0gSlNPTjUucGFyc2UoZnMucmVhZEZpbGVTeW5jKGZkLCAndXRmOCcpKTtcblxuICAgICAgICBPYmplY3Qua2V5cyh1c2VyQ29uZmlnKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ25vLWJyb3dzZXInKSB7XG4gICAgICAgICAgICBpZiAodXNlckNvbmZpZ1trZXldID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgIGFyZ3MucHVzaChgLS0ke2tleX1gKTtcbiAgICAgICAgICAgICAgbm9Ccm93c2VyID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoa2V5ID09PSAncm9vdCcpIHtcbiAgICAgICAgICAgICAgYXJncy51bnNoaWZ0KGAke3VzZXJDb25maWdba2V5XX1gKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICBhcmdzLnB1c2goYC0tJHtrZXl9PSR7dXNlckNvbmZpZ1trZXldfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICghYXJncy5sZW5ndGgpIHtcbiAgICAgICAgYXJncy5wdXNoKGAtLXBvcnQ9JHtwb3J0fWApO1xuICAgICAgfVxuXG4gICAgICBzZXJ2ZXJQcm9jZXNzID0gbmV3IEJ1ZmZlcmVkTm9kZVByb2Nlc3Moe1xuICAgICAgICBjb21tYW5kOiBsaXZlU2VydmVyLFxuICAgICAgICBhcmdzLFxuICAgICAgICBzdGRvdXQsXG4gICAgICAgIGV4aXQsXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICBjd2Q6IHRhcmdldFBhdGhcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnNvbGUuaW5mbyhgW0xpdmUgU2VydmVyXSBsaXZlLXNlcnZlciAke2FyZ3Muam9pbignICcpfWApO1xuICAgIH0pO1xuICB9LFxuXG4gIHN0b3BTZXJ2ZXIoKSB7XG4gICAgdHJ5IHtcbiAgICAgIHNlcnZlclByb2Nlc3Mua2lsbCgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuXG4gICAgc2VydmVyUHJvY2VzcyA9IG51bGw7XG4gICAgY29uc3QgZGlzcG9zZVN0b3BNZW51ID0gZGlzcG9zZU1lbnU7XG4gICAgYWRkU3RhcnRNZW51KCk7XG4gICAgZGlzcG9zZVN0b3BNZW51ICYmIGRpc3Bvc2VTdG9wTWVudS5kaXNwb3NlKCk7XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MoJ1tMaXZlIFNlcnZlcl0gTGl2ZSBzZXJ2ZXIgaXMgc3RvcHBlZC4nKTtcbiAgfVxufTtcbiJdfQ==