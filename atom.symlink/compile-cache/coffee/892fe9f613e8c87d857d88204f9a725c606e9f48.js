(function() {
  var AddDialog, Dialog, fs, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require('path');

  fs = require('fs-plus');

  Dialog = require('./dialog');

  module.exports = AddDialog = (function(_super) {
    __extends(AddDialog, _super);

    function AddDialog(initialPath, isCreatingFile) {
      var directoryPath, relativeDirectoryPath;
      this.isCreatingFile = isCreatingFile;
      if (fs.isFileSync(initialPath)) {
        directoryPath = path.dirname(initialPath);
      } else {
        directoryPath = initialPath;
      }
      relativeDirectoryPath = atom.project.relativize(directoryPath);
      if (relativeDirectoryPath.length > 0) {
        relativeDirectoryPath += '/';
      }
      AddDialog.__super__.constructor.call(this, {
        prompt: "Enter the path for the new " + (isCreatingFile ? "file." : "folder."),
        initialPath: relativeDirectoryPath,
        select: false,
        iconClass: isCreatingFile ? 'icon-file-add' : 'icon-file-directory-create'
      });
    }

    AddDialog.prototype.onConfirm = function(relativePath) {
      var endsWithDirectorySeparator, error, pathToCreate, _ref;
      endsWithDirectorySeparator = /\/$/.test(relativePath);
      pathToCreate = atom.project.resolve(relativePath);
      if (!pathToCreate) {
        return;
      }
      try {
        if (fs.existsSync(pathToCreate)) {
          return this.showError("'" + pathToCreate + "' already exists.");
        } else if (this.isCreatingFile) {
          if (endsWithDirectorySeparator) {
            return this.showError("File names must not end with a '/' character.");
          } else {
            fs.writeFileSync(pathToCreate, '');
            if ((_ref = atom.project.getRepo()) != null) {
              _ref.getPathStatus(pathToCreate);
            }
            this.trigger('file-created', [pathToCreate]);
            return this.close();
          }
        } else {
          fs.makeTreeSync(pathToCreate);
          this.trigger('directory-created', [pathToCreate]);
          return this.cancel();
        }
      } catch (_error) {
        error = _error;
        return this.showError("" + error.message + ".");
      }
    };

    return AddDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBREwsQ0FBQTs7QUFBQSxFQUVBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQUZULENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osZ0NBQUEsQ0FBQTs7QUFBYSxJQUFBLG1CQUFDLFdBQUQsRUFBYyxjQUFkLEdBQUE7QUFDWCxVQUFBLG9DQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsY0FBRCxHQUFrQixjQUFsQixDQUFBO0FBRUEsTUFBQSxJQUFHLEVBQUUsQ0FBQyxVQUFILENBQWMsV0FBZCxDQUFIO0FBQ0UsUUFBQSxhQUFBLEdBQWdCLElBQUksQ0FBQyxPQUFMLENBQWEsV0FBYixDQUFoQixDQURGO09BQUEsTUFBQTtBQUdFLFFBQUEsYUFBQSxHQUFnQixXQUFoQixDQUhGO09BRkE7QUFBQSxNQU1BLHFCQUFBLEdBQXdCLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBYixDQUF3QixhQUF4QixDQU54QixDQUFBO0FBT0EsTUFBQSxJQUFnQyxxQkFBcUIsQ0FBQyxNQUF0QixHQUErQixDQUEvRDtBQUFBLFFBQUEscUJBQUEsSUFBeUIsR0FBekIsQ0FBQTtPQVBBO0FBQUEsTUFTQSwyQ0FDRTtBQUFBLFFBQUEsTUFBQSxFQUFRLDZCQUFBLEdBQWdDLENBQUcsY0FBSCxHQUF1QixPQUF2QixHQUFvQyxTQUFwQyxDQUF4QztBQUFBLFFBQ0EsV0FBQSxFQUFhLHFCQURiO0FBQUEsUUFFQSxNQUFBLEVBQVEsS0FGUjtBQUFBLFFBR0EsU0FBQSxFQUFjLGNBQUgsR0FBdUIsZUFBdkIsR0FBNEMsNEJBSHZEO09BREYsQ0FUQSxDQURXO0lBQUEsQ0FBYjs7QUFBQSx3QkFnQkEsU0FBQSxHQUFXLFNBQUMsWUFBRCxHQUFBO0FBQ1QsVUFBQSxxREFBQTtBQUFBLE1BQUEsMEJBQUEsR0FBNkIsS0FBSyxDQUFDLElBQU4sQ0FBVyxZQUFYLENBQTdCLENBQUE7QUFBQSxNQUNBLFlBQUEsR0FBZSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQWIsQ0FBcUIsWUFBckIsQ0FEZixDQUFBO0FBRUEsTUFBQSxJQUFBLENBQUEsWUFBQTtBQUFBLGNBQUEsQ0FBQTtPQUZBO0FBSUE7QUFDRSxRQUFBLElBQUcsRUFBRSxDQUFDLFVBQUgsQ0FBYyxZQUFkLENBQUg7aUJBQ0UsSUFBQyxDQUFBLFNBQUQsQ0FBWSxHQUFBLEdBQUUsWUFBRixHQUFnQixtQkFBNUIsRUFERjtTQUFBLE1BRUssSUFBRyxJQUFDLENBQUEsY0FBSjtBQUNILFVBQUEsSUFBRywwQkFBSDttQkFDRSxJQUFDLENBQUEsU0FBRCxDQUFXLCtDQUFYLEVBREY7V0FBQSxNQUFBO0FBR0UsWUFBQSxFQUFFLENBQUMsYUFBSCxDQUFpQixZQUFqQixFQUErQixFQUEvQixDQUFBLENBQUE7O2tCQUNzQixDQUFFLGFBQXhCLENBQXNDLFlBQXRDO2FBREE7QUFBQSxZQUVBLElBQUMsQ0FBQSxPQUFELENBQVMsY0FBVCxFQUF5QixDQUFDLFlBQUQsQ0FBekIsQ0FGQSxDQUFBO21CQUdBLElBQUMsQ0FBQSxLQUFELENBQUEsRUFORjtXQURHO1NBQUEsTUFBQTtBQVNILFVBQUEsRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsWUFBaEIsQ0FBQSxDQUFBO0FBQUEsVUFDQSxJQUFDLENBQUEsT0FBRCxDQUFTLG1CQUFULEVBQThCLENBQUMsWUFBRCxDQUE5QixDQURBLENBQUE7aUJBRUEsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQVhHO1NBSFA7T0FBQSxjQUFBO0FBZ0JFLFFBREksY0FDSixDQUFBO2VBQUEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxFQUFBLEdBQUUsS0FBSyxDQUFDLE9BQVIsR0FBaUIsR0FBNUIsRUFoQkY7T0FMUztJQUFBLENBaEJYLENBQUE7O3FCQUFBOztLQURzQixPQUx4QixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/Shannon/.dotfiles/atom.symlink/packages/tree-view/lib/add-dialog.coffee