(function() {
  var Directory, File, Model, path, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require('path');

  Model = require('theorist').Model;

  _ = require('underscore-plus');

  File = require('./file');

  module.exports = Directory = (function(_super) {
    __extends(Directory, _super);

    Directory.properties({
      directory: null,
      isRoot: false,
      isExpanded: false,
      status: null,
      entries: function() {
        return {};
      },
      expandedEntries: function() {
        return {};
      }
    });

    Directory.prototype.accessor('name', function() {
      return this.directory.getBaseName() || this.path;
    });

    Directory.prototype.accessor('path', function() {
      return this.directory.getPath();
    });

    Directory.prototype.accessor('submodule', function() {
      var _ref;
      return (_ref = atom.project.getRepo()) != null ? _ref.isSubmodule(this.path) : void 0;
    });

    Directory.prototype.accessor('symlink', function() {
      return this.directory.symlink;
    });

    function Directory() {
      var repo;
      Directory.__super__.constructor.apply(this, arguments);
      repo = atom.project.getRepo();
      if (repo != null) {
        this.subscribeToRepo(repo);
        this.updateStatus(repo);
      }
    }

    Directory.prototype.destroyed = function() {
      this.unwatch();
      return this.unsubscribe();
    };

    Directory.prototype.subscribeToRepo = function(repo) {
      this.subscribe(repo, 'status-changed', (function(_this) {
        return function(changedPath, status) {
          if (changedPath.indexOf("" + _this.path + path.sep) === 0) {
            return _this.updateStatus(repo);
          }
        };
      })(this));
      return this.subscribe(repo, 'statuses-changed', (function(_this) {
        return function() {
          return _this.updateStatus(repo);
        };
      })(this));
    };

    Directory.prototype.updateStatus = function(repo) {
      var newStatus, status;
      newStatus = null;
      if (repo.isPathIgnored(this.path)) {
        newStatus = 'ignored';
      } else {
        status = repo.getDirectoryStatus(this.path);
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

    Directory.prototype.isPathIgnored = function(filePath) {
      var extension, ignoredNames, name, repo, _ref;
      if (atom.config.get('tree-view.hideVcsIgnoredFiles')) {
        repo = atom.project.getRepo();
        if ((repo != null) && repo.isProjectAtRoot() && repo.isPathIgnored(filePath)) {
          return true;
        }
      }
      if (atom.config.get('tree-view.hideIgnoredNames')) {
        ignoredNames = (_ref = atom.config.get('core.ignoredNames')) != null ? _ref : [];
        if (typeof ignoredNames === 'string') {
          ignoredNames = [ignoredNames];
        }
        name = path.basename(filePath);
        if (_.contains(ignoredNames, name)) {
          return true;
        }
        extension = path.extname(filePath);
        if (extension && _.contains(ignoredNames, "*" + extension)) {
          return true;
        }
      }
      return false;
    };

    Directory.prototype.createEntry = function(entry, index) {
      var expandedEntries, isExpanded;
      if (entry.getEntriesSync != null) {
        expandedEntries = this.expandedEntries[entry.getBaseName()];
        isExpanded = expandedEntries != null;
        entry = new Directory({
          directory: entry,
          isExpanded: isExpanded,
          expandedEntries: expandedEntries
        });
      } else {
        entry = new File({
          file: entry
        });
      }
      entry.indexInParentDirectory = index;
      return entry;
    };

    Directory.prototype.contains = function(pathToCheck) {
      return this.directory.contains(pathToCheck);
    };

    Directory.prototype.unwatch = function() {
      var entry, key, _ref, _results;
      if (this.watchSubscription != null) {
        this.watchSubscription.off();
        this.watchSubscription = null;
        if (this.isAlive()) {
          _ref = this.entries;
          _results = [];
          for (key in _ref) {
            entry = _ref[key];
            entry.destroy();
            _results.push(delete this.entries[key]);
          }
          return _results;
        }
      }
    };

    Directory.prototype.watch = function() {
      if (this.watchSubscription == null) {
        this.watchSubscription = this.directory.on('contents-changed', (function(_this) {
          return function() {
            return _this.reload();
          };
        })(this));
        return this.subscribe(this.watchSubscription);
      }
    };

    Directory.prototype.reload = function() {
      var entry, index, name, newEntries, removedEntries, _i, _j, _len, _len1, _ref, _ref1, _results;
      newEntries = [];
      removedEntries = _.clone(this.entries);
      index = 0;
      _ref = this.directory.getEntriesSync();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        name = entry.getBaseName();
        if (this.entries.hasOwnProperty(name)) {
          delete removedEntries[name];
          index++;
        } else if (!this.isPathIgnored(entry.path)) {
          newEntries.push([entry, index]);
          index++;
        }
      }
      for (name in removedEntries) {
        entry = removedEntries[name];
        entry.destroy();
        delete this.entries[name];
        delete this.expandedEntries[name];
        this.emit('entry-removed', entry);
      }
      _results = [];
      for (_j = 0, _len1 = newEntries.length; _j < _len1; _j++) {
        _ref1 = newEntries[_j], entry = _ref1[0], index = _ref1[1];
        entry = this.createEntry(entry, index);
        this.entries[entry.name] = entry;
        _results.push(this.emit('entry-added', entry));
      }
      return _results;
    };

    Directory.prototype.collapse = function() {
      this.isExpanded = false;
      this.expandedEntries = this.serializeExpansionStates();
      return this.unwatch();
    };

    Directory.prototype.expand = function() {
      this.isExpanded = true;
      this.reload();
      return this.watch();
    };

    Directory.prototype.serializeExpansionStates = function() {
      var entry, expandedEntries, name, _ref;
      expandedEntries = {};
      _ref = this.entries;
      for (name in _ref) {
        entry = _ref[name];
        if (entry.isExpanded) {
          expandedEntries[name] = entry.serializeExpansionStates();
        }
      }
      return expandedEntries;
    };

    return Directory;

  })(Model);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBRUMsUUFBUyxPQUFBLENBQVEsVUFBUixFQUFULEtBRkQsQ0FBQTs7QUFBQSxFQUdBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FISixDQUFBOztBQUFBLEVBS0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBTFAsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixnQ0FBQSxDQUFBOztBQUFBLElBQUEsU0FBQyxDQUFBLFVBQUQsQ0FDRTtBQUFBLE1BQUEsU0FBQSxFQUFXLElBQVg7QUFBQSxNQUNBLE1BQUEsRUFBUSxLQURSO0FBQUEsTUFFQSxVQUFBLEVBQVksS0FGWjtBQUFBLE1BR0EsTUFBQSxFQUFRLElBSFI7QUFBQSxNQUlBLE9BQUEsRUFBUyxTQUFBLEdBQUE7ZUFBRyxHQUFIO01BQUEsQ0FKVDtBQUFBLE1BS0EsZUFBQSxFQUFpQixTQUFBLEdBQUE7ZUFBRyxHQUFIO01BQUEsQ0FMakI7S0FERixDQUFBLENBQUE7O0FBQUEsSUFRQSxTQUFDLENBQUEsU0FBRSxDQUFBLFFBQUgsQ0FBWSxNQUFaLEVBQW9CLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxTQUFTLENBQUMsV0FBWCxDQUFBLENBQUEsSUFBNEIsSUFBQyxDQUFBLEtBQWhDO0lBQUEsQ0FBcEIsQ0FSQSxDQUFBOztBQUFBLElBU0EsU0FBQyxDQUFBLFNBQUUsQ0FBQSxRQUFILENBQVksTUFBWixFQUFvQixTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsU0FBUyxDQUFDLE9BQVgsQ0FBQSxFQUFIO0lBQUEsQ0FBcEIsQ0FUQSxDQUFBOztBQUFBLElBVUEs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
//# sourceURL=/Users/Shannon/.dotfiles/atom.symlink/packages/tree-view/lib/directory.coffee