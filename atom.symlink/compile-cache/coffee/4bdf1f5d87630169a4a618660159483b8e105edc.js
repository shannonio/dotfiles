(function() {
  describe('Linter Config', function() {
    var CP, FS, Helpers, getLinter, getMessage, linter, _ref;
    linter = null;
    _ref = require('./common'), getLinter = _ref.getLinter, getMessage = _ref.getMessage;
    CP = require('child_process');
    FS = require('fs');
    Helpers = require('../lib/helpers');
    beforeEach(function() {
      return waitsForPromise(function() {
        return atom.packages.activatePackage('linter').then(function() {
          return linter = atom.packages.getActivePackage('linter').mainModule.instance;
        });
      });
    });
    describe('ignoredMessageTypes', function() {
      return it('ignores certain types of messages', function() {
        var linterProvider;
        linterProvider = getLinter();
        expect(linter.messages.publicMessages.length).toBe(0);
        linter.messages.set({
          linter: linterProvider,
          messages: [getMessage('Error'), getMessage('Warning')]
        });
        linter.messages.updatePublic();
        expect(linter.messages.publicMessages.length).toBe(2);
        atom.config.set('linter.ignoredMessageTypes', ['Error']);
        linter.messages.set({
          linter: linterProvider,
          messages: [getMessage('Error'), getMessage('Warning')]
        });
        linter.messages.updatePublic();
        return expect(linter.messages.publicMessages.length).toBe(1);
      });
    });
    describe('statusIconScope', function() {
      return it('only shows messages of the current scope', function() {
        var linterProvider;
        linterProvider = getLinter();
        expect(linter.views.bottomContainer.status.count).toBe(0);
        linter.messages.set({
          linter: linterProvider,
          messages: [getMessage('Error', '/tmp/test.coffee')]
        });
        linter.messages.updatePublic();
        expect(linter.views.bottomContainer.status.count).toBe(1);
        atom.config.set('linter.statusIconScope', 'File');
        expect(linter.views.bottomContainer.status.count).toBe(0);
        atom.config.set('linter.statusIconScope', 'Project');
        return expect(linter.views.bottomContainer.status.count).toBe(1);
      });
    });
    describe('ignoreVCSIgnoredFiles', function() {
      return it('ignores the file if its ignored by the VCS', function() {
        var filePath, linterProvider;
        filePath = "/tmp/linter_test_file";
        FS.writeFileSync(filePath, "'use strict'\n");
        atom.config.set('linter.ignoreVCSIgnoredFiles', true);
        linterProvider = getLinter();
        spyOn(linterProvider, 'lint');
        spyOn(Helpers, 'isPathIgnored').andCallFake(function() {
          return true;
        });
        linter.addLinter(linterProvider);
        return waitsForPromise(function() {
          return atom.workspace.open(filePath).then(function() {
            linter.commands.lint();
            expect(linterProvider.lint).not.toHaveBeenCalled();
            atom.config.set('linter.ignoreVCSIgnoredFiles', false);
            linter.commands.lint();
            expect(linterProvider.lint).toHaveBeenCalled();
            return CP.execSync("rm -f " + filePath);
          });
        });
      });
    });
    return describe('ignoreMatchedFiles', function() {
      return it('ignores the file if it matches pattern', function() {
        var filePath, linterProvider;
        filePath = '/tmp/linter_spec_test.min.js';
        FS.writeFileSync(filePath, "'use strict'\n");
        atom.config.set('linter.ignoreMatchedFiles', '/**/*.min.{js,css}');
        linterProvider = getLinter();
        spyOn(linterProvider, 'lint');
        linter.addLinter(linterProvider);
        return waitsForPromise(function() {
          return atom.workspace.open(filePath).then(function() {
            linter.commands.lint();
            expect(linterProvider.lint).not.toHaveBeenCalled();
            atom.config.set('linter.ignoreMatchedFiles', '/**/*.min.css');
            linter.commands.lint();
            expect(linterProvider.lint).toHaveBeenCalled();
            return CP.execSync("rm -f " + filePath);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3NoYW5ub25iZXJ0dWNjaS8uZG90ZmlsZXMvYXRvbS5zeW1saW5rL3BhY2thZ2VzL2xpbnRlci9zcGVjL2NvbmZpZy1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBLEdBQUE7QUFDeEIsUUFBQSxvREFBQTtBQUFBLElBQUEsTUFBQSxHQUFTLElBQVQsQ0FBQTtBQUFBLElBQ0EsT0FBMEIsT0FBQSxDQUFRLFVBQVIsQ0FBMUIsRUFBQyxpQkFBQSxTQUFELEVBQVksa0JBQUEsVUFEWixDQUFBO0FBQUEsSUFFQSxFQUFBLEdBQUssT0FBQSxDQUFRLGVBQVIsQ0FGTCxDQUFBO0FBQUEsSUFHQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FITCxDQUFBO0FBQUEsSUFJQSxPQUFBLEdBQVUsT0FBQSxDQUFRLGdCQUFSLENBSlYsQ0FBQTtBQUFBLElBS0EsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUNULGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFFBQTlCLENBQXVDLENBQUMsSUFBeEMsQ0FBNkMsU0FBQSxHQUFBO2lCQUMzQyxNQUFBLEdBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixRQUEvQixDQUF3QyxDQUFDLFVBQVUsQ0FBQyxTQURsQjtRQUFBLENBQTdDLEVBRGM7TUFBQSxDQUFoQixFQURTO0lBQUEsQ0FBWCxDQUxBLENBQUE7QUFBQSxJQVVBLFFBQUEsQ0FBUyxxQkFBVCxFQUFnQyxTQUFBLEdBQUE7YUFDOUIsRUFBQSxDQUFHLG1DQUFILEVBQXdDLFNBQUEsR0FBQTtBQUN0QyxZQUFBLGNBQUE7QUFBQSxRQUFBLGNBQUEsR0FBaUIsU0FBQSxDQUFBLENBQWpCLENBQUE7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

//# sourceURL=/Users/shannonbertucci/.dotfiles/atom.symlink/packages/linter/spec/config-spec.coffee
