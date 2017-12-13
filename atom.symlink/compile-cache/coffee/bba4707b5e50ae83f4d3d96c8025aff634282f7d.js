(function() {
  var File, Model, fs, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require('path');

  fs = require('fs-plus');

  Model = require('theorist').Model;

  module.exports = File = (function(_super) {
    __extends(File, _super);

    File.properties({
      file: null,
      status: null
    });

    File.prototype.accessor('name', function() {
      return this.file.getBaseName();
    });

    File.prototype.accessor('symlink', function() {
      return this.file.symlink;
    });

    File.prototype.accessor('type', function() {
      var extension;
      extension = path.extname(this.path);
      if (fs.isReadmePath(this.path)) {
        return 'readme';
      } else if (fs.isCompressedExtension(extension)) {
        return 'compressed';
      } else if (fs.isImageExtension(extension)) {
        return 'image';
      } else if (fs.isPdfExtension(extension)) {
        return 'pdf';
      } else if (fs.isBinaryExtension(extension)) {
        return 'binary';
      } else {
        return 'text';
      }
    });

    function File() {
      var error, repo;
      File.__super__.constructor.apply(this, arguments);
      repo = atom.project.getRepo();
      try {
        this.path = fs.realpathSync(this.file.getPath());
      } catch (_error) {
        error = _error;
        this.path = this.file.getPath();
      }
      if (repo != null) {
        this.subscribeToRepo(repo);
        this.updateStatus(repo);
      }
    }

    File.prototype.destroyed = function() {
      return this.unsubscribe();
    };

    File.prototype.subscribeToRepo = function() {
      var repo;
      repo = atom.project.getRepo();
      if (repo != null) {
        this.subscribe(repo, 'status-changed', (function(_this) {
          return function(changedPath, status) {
            if (changedPath === _this.path) {
              return _this.updateStatus(repo);
            }
          };
        })(this));
        return this.subscribe(repo, 'statuses-changed', (function(_this) {
          return function() {
            return _this.updateStatus(repo);
          };
        })(this));
      }
    };

    File.prototype.updateStatus = function(repo) {
      var newStatus, status;
      newStatus = null;
      if (repo.isPathIgnored(this.path)) {
        newStatus = 'ignored';
      } else {
        status = repo.getCachedPathStatus(this.path);
        if (repo.isStatusModified(status)) {
          newStatus = 'modified';
        } else if (repo.isStatusNew(status)) {
          newStatus = 'added';
        }
      }
      if (newStatus !== this.status) {
        return this.status = newStatus;
      }
    };

    return File;

  })(Model);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBREwsQ0FBQTs7QUFBQSxFQUVDLFFBQVMsT0FBQSxDQUFRLFVBQVIsRUFBVCxLQUZELENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osMkJBQUEsQ0FBQTs7QUFBQSxJQUFBLElBQUMsQ0FBQSxVQUFELENBQ0U7QUFBQSxNQUFBLElBQUEsRUFBTSxJQUFOO0FBQUEsTUFDQSxNQUFBLEVBQVEsSUFEUjtLQURGLENBQUEsQ0FBQTs7QUFBQSxJQUlBLElBQUMsQ0FBQSxTQUFFLENBQUEsUUFBSCxDQUFZLE1BQVosRUFBb0IsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQUEsRUFBSDtJQUFBLENBQXBCLENBSkEsQ0FBQTs7QUFBQSxJQUtBLElBQUMsQ0FBQSxTQUFFLENBQUEsUUFBSCxDQUFZLFNBQVosRUFBdUIsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFUO0lBQUEsQ0FBdkIsQ0FMQSxDQUFBOztBQUFBLElBTUEsSUFBQyxDQUFBLFNBQUUsQ0FBQSxRQUFILENBQVksTUFBWixFQUFvQixTQUFBLEdBQUE7QUFDbEIsVUFBQSxTQUFBO0FBQUEsTUFBQSxTQUFBLEdBQVksSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFDLENBQUEsSUFBZCxDQUFaLENBQUE7QUFDQSxNQUFBLElBQUcsRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsSUFBQyxDQUFBLElBQWpCLENBQUg7ZUFDRSxTQURGO09BQUEsTUFFSyxJQUFHLEVBQUUsQ0FBQyxxQkFBSCxD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
//# sourceURL=/Users/Shannon/.dotfiles/atom.symlink/packages/tree-view/lib/file.coffee