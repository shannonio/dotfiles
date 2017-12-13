(function() {
  var RSpec;

  RSpec = require('../lib/rspec');

  describe("Rspec", function() {
    var activationPromise;
    activationPromise = null;
    beforeEach(function() {
      atom.workspaceView = new WorkspaceView;
      return activationPromise = atom.packages.activatePackage('rspec');
    });
    return xdescribe("when the rspec:toggle event is triggered", function() {
      return it("attaches and then detaches the view", function() {
        expect(atom.workspaceView.find('.rspec')).not.toExist();
        atom.workspaceView.trigger('rspec:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          expect(atom.workspaceView.find('.rspec')).toExist();
          atom.workspaceView.trigger('rspec:toggle');
          return expect(atom.workspaceView.find('.rspec')).not.toExist();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3NoYW5ub25iZXJ0dWNjaS8uZG90ZmlsZXMvYXRvbS5zeW1saW5rL3BhY2thZ2VzL3JzcGVjL3NwZWMvcnNwZWMtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsS0FBQTs7QUFBQSxFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsY0FBUixDQUFSLENBQUE7O0FBQUEsRUFPQSxRQUFBLENBQVMsT0FBVCxFQUFrQixTQUFBLEdBQUE7QUFDaEIsUUFBQSxpQkFBQTtBQUFBLElBQUEsaUJBQUEsR0FBb0IsSUFBcEIsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBSSxDQUFDLGFBQUwsR0FBcUIsR0FBQSxDQUFBLGFBQXJCLENBQUE7YUFDQSxpQkFBQSxHQUFvQixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsT0FBOUIsRUFGWDtJQUFBLENBQVgsQ0FGQSxDQUFBO1dBTUEsU0FBQSxDQUFVLDBDQUFWLEVBQXNELFNBQUEsR0FBQTthQUNwRCxFQUFBLENBQUcscUNBQUgsRUFBMEMsU0FBQSxHQUFBO0FBQ3hDLFFBQUEsTUFBQSxDQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBbkIsQ0FBd0IsUUFBeEIsQ0FBUCxDQUF5QyxDQUFDLEdBQUcsQ0FBQyxPQUE5QyxDQUFBLENBQUEsQ0FBQTtBQUFBLFFBSUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQixjQUEzQixDQUpBLENBQUE7QUFBQSxRQU1BLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLGtCQURjO1FBQUEsQ0FBaEIsQ0FOQSxDQUFBO2VBU0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsTUFBQSxDQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBbkIsQ0FBd0IsUUFBeEIsQ0FBUCxDQUF5QyxDQUFDLE9BQTFDLENBQUEsQ0FBQSxDQUFBO0FBQUEsVUFDQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLGNBQTNCLENBREEsQ0FBQTtpQkFFQSxNQUFBLENBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFuQixDQUF3QixRQUF4QixDQUFQLENBQXlDLENBQUMsR0FBRyxDQUFDLE9BQTlDLENBQUEsRUFIRztRQUFBLENBQUwsRUFWd0M7TUFBQSxDQUExQyxFQURvRDtJQUFBLENBQXRELEVBUGdCO0VBQUEsQ0FBbEIsQ0FQQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/shannonbertucci/.dotfiles/atom.symlink/packages/rspec/spec/rspec-spec.coffee
