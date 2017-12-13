(function() {
  var Dialog, MoveDialog, fs, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require('path');

  fs = require('fs-plus');

  Dialog = require('./dialog');

  module.exports = MoveDialog = (function(_super) {
    __extends(MoveDialog, _super);

    function MoveDialog(initialPath) {
      var prompt;
      this.initialPath = initialPath;
      if (fs.isDirectorySync(this.initialPath)) {
        prompt = 'Enter the new path for the directory.';
      } else {
        prompt = 'Enter the new path for the file.';
      }
      MoveDialog.__super__.constructor.call(this, {
        prompt: prompt,
        initialPath: atom.project.relativize(this.initialPath),
        select: true,
        iconClass: 'icon-arrow-right'
      });
    }

    MoveDialog.prototype.onConfirm = function(newPath) {
      var directoryPath, error, repo;
      newPath = atom.project.resolve(newPath);
      if (!newPath) {
        return;
      }
      if (this.initialPath === newPath) {
        this.close();
        return;
      }
      if (!this.isNewPathValid(newPath)) {
        this.showError("'" + newPath + "' already exists.");
        return;
      }
      directoryPath = path.dirname(newPath);
      try {
        if (!fs.existsSync(directoryPath)) {
          fs.makeTreeSync(directoryPath);
        }
        fs.moveSync(this.initialPath, newPath);
        if (repo = atom.project.getRepo()) {
          repo.getPathStatus(this.initialPath);
          repo.getPathStatus(newPath);
        }
        return this.close();
      } catch (_error) {
        error = _error;
        return this.showError("" + error.message + ".");
      }
    };

    MoveDialog.prototype.isNewPathValid = function(newPath) {
      var newStat, oldStat;
      try {
        oldStat = fs.statSync(this.initialPath);
        newStat = fs.statSync(newPath);
        return this.initialPath.toLowerCase() === newPath.toLowerCase() && oldStat.dev === newStat.dev && oldStat.ino === newStat.ino;
      } catch (_error) {
        return true;
      }
    };

    return MoveDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBREwsQ0FBQTs7QUFBQSxFQUVBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQUZULENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osaUNBQUEsQ0FBQTs7QUFBYSxJQUFBLG9CQUFFLFdBQUYsR0FBQTtBQUNYLFVBQUEsTUFBQTtBQUFBLE1BRFksSUFBQyxDQUFBLGNBQUEsV0FDYixDQUFBO0FBQUEsTUFBQSxJQUFHLEVBQUUsQ0FBQyxlQUFILENBQW1CLElBQUMsQ0FBQSxXQUFwQixDQUFIO0FBQ0UsUUFBQSxNQUFBLEdBQVMsdUNBQVQsQ0FERjtPQUFBLE1BQUE7QUFHRSxRQUFBLE1BQUEsR0FBUyxrQ0FBVCxDQUhGO09BQUE7QUFBQSxNQUtBLDRDQUNFO0FBQUEsUUFBQSxNQUFBLEVBQVEsTUFBUjtBQUFBLFFBQ0EsV0FBQSxFQUFhLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBYixDQUF3QixJQUFDLENBQUEsV0FBekIsQ0FEYjtBQUFBLFFBRUEsTUFBQSxFQUFRLElBRlI7QUFBQSxRQUdBLFNBQUEsRUFBVyxrQkFIWDtPQURGLENBTEEsQ0FEVztJQUFBLENBQWI7O0FBQUEseUJBWUEsU0FBQSxHQUFXLFNBQUMsT0FBRCxHQUFBO0FBQ1QsVUFBQSwwQkFBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBYixDQUFxQixPQUFyQixDQUFWLENBQUE7QUFDQSxNQUFBLElBQUEsQ0FBQSxPQUFBO0FBQUEsY0FBQSxDQUFBO09BREE7QUFHQSxNQUFBLElBQUcsSUFBQyxDQUFBLFdBQUQsS0FBZ0IsT0FBbkI7QUFDRSxRQUFBLElBQUMsQ0FBQSxLQUFELENBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUZGO09BSEE7QUFPQSxNQUFBLElBQUEsQ0FBQSxJQUFRLENBQUEsY0FBRCxDQUFnQixPQUFoQixDQUFQO0FBQ0UsUUFBQSxJQUFDLENBQUEsU0FBRCxDQUFZLEdBQUEsR0FBRSxPQUFGLEdBQVcsbUJBQXZCLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FGRjtPQVBBO0FBQUEsTUFXQSxhQUFBLEdBQWdCLElBQUksQ0FBQyxPQUFMLENBQWEsT0FBYixDQVhoQixDQUFBO0FBWUE7QUFDRSxRQUFBLElBQUEsQ0FBQSxFQUF3QyxDQUFDLFVBQUgsQ0FBYyxhQUFkLENBQXRDO0FBQUEsVUFBQSxFQUFFLENBQUMsWUFBSCxDQUFnQixhQUFoQixDQUFBLENBQUE7U0FBQTtBQUFBLFFBQ0EsRUFBRSxDQUFDLFFBQUgsQ0FBWSxJQUFDLENBQUEsV0FBYixFQUEwQixPQUExQixDQURBLENBQUE7QUFFQSxRQUFBLElBQUcsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBYixDQUFBLENBQVY7QUFDRSxVQUFBLElBQUksQ0FBQyxhQUFMLENBQW1CLElBQUMsQ0FBQSxXQUFwQixDQUFBLENBQUE7QUFBQSxVQUNBLElBQUksQ0FBQyxhQUFMLENBQW1CLE9BQW5CLENBREEsQ0FERjtTQUZBO2VBS0EsSUFBQyxDQUFBLEtBQUQsQ0FBQSxFQU5GO09BQUEsY0FBQTtBQVFFLFFBREksY0FDSixDQUFBO2VBQUEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxFQUFBLEdBQUUsS0FBSyxDQUFDLE9BQVIsR0FBaUIsR0FBNUIsRUFSRjtPQWJTO0lBQUEsQ0FaWCxDQUFBOztBQUFBLHlCQW1DQSxjQUFBLEdBQWdCLFNBQUMsT0FBRCxHQUFBO0FBQ2QsVUFBQSxnQkFBQTtBQUFBO0FBQ0UsUUFBQSxPQUFBLEdBQVUsRUFBRSxDQUFDLFFBQUgsQ0FBWSxJQUFDLENBQUEsV0FBYixDQUFWLENBQUE7QUFBQSxRQUNBLE9BQUEsR0FBVSxFQUFFLENBQUMsUUFBSCxDQUFZLE9BQVosQ0FEVixDQUFBO2VBTUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLENBQUEsQ0FBQSxLQUE4QixPQUFPLENBQUMsV0FBUixDQUFBLENBQTlCLElBQ0UsT0FBTyxDQUFDLEdBQVIsS0FBZSxPQUFPLENBQUMsR0FEekIsSUFFRSxPQUFPLENBQUMsR0FBUixLQUFlLE9BQU8sQ0FBQyxJQVQzQjtPQUFBLGNBQUE7ZUFXRSxLQVhGO09BRGM7SUFBQSxDQW5DaEIsQ0FBQTs7c0JBQUE7O0tBRHVCLE9BTHpCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/Shannon/.dotfiles/atom.symlink/packages/tree-view/lib/move-dialog.coffee