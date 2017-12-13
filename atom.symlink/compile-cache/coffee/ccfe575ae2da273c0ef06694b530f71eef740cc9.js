(function() {
  var $, Directory, DirectoryView, File, FileView, View, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), $ = _ref.$, View = _ref.View;

  Directory = require('./directory');

  FileView = require('./file-view');

  File = require('./file');

  module.exports = DirectoryView = (function(_super) {
    __extends(DirectoryView, _super);

    function DirectoryView() {
      return DirectoryView.__super__.constructor.apply(this, arguments);
    }

    DirectoryView.content = function() {
      return this.li({
        "class": 'directory entry list-nested-item collapsed'
      }, (function(_this) {
        return function() {
          _this.div({
            outlet: 'header',
            "class": 'header list-item'
          }, function() {
            return _this.span({
              "class": 'name icon',
              outlet: 'directoryName'
            });
          });
          return _this.ol({
            "class": 'entries list-tree',
            outlet: 'entries'
          });
        };
      })(this));
    };

    DirectoryView.prototype.initialize = function(directory) {
      var iconClass, _ref1;
      this.directory = directory;
      if (this.directory.symlink) {
        iconClass = 'icon-file-symlink-directory';
      } else {
        iconClass = 'icon-file-directory';
        if (this.directory.isRoot) {
          if ((_ref1 = atom.project.getRepo()) != null ? _ref1.isProjectAtRoot() : void 0) {
            iconClass = 'icon-repo';
          }
        } else {
          if (this.directory.submodule) {
            iconClass = 'icon-file-submodule';
          }
        }
      }
      this.directoryName.addClass(iconClass);
      this.directoryName.text(this.directory.name);
      this.directoryName.attr('data-name', this.directory.name);
      this.directoryName.attr('data-path', this.directory.path);
      if (!this.directory.isRoot) {
        this.subscribe(this.directory.$status.onValue((function(_this) {
          return function(status) {
            _this.removeClass('status-ignored status-modified status-added');
            if (status != null) {
              return _this.addClass("status-" + status);
            }
          };
        })(this)));
      }
      if (this.directory.isExpanded) {
        return this.expand();
      }
    };

    DirectoryView.prototype.beforeRemove = function() {
      return this.directory.destroy();
    };

    DirectoryView.prototype.subscribeToDirectory = function() {
      this.subscribe(this.directory, 'entry-added', (function(_this) {
        return function(entry) {
          var insertionIndex, view;
          view = _this.createViewForEntry(entry);
          insertionIndex = entry.indexInParentDirectory;
          if (insertionIndex < _this.entries.children().length) {
            return _this.entries.children().eq(insertionIndex).before(view);
          } else {
            return _this.entries.append(view);
          }
        };
      })(this));
      return this.subscribe(this.directory, 'entry-added entry-removed', (function(_this) {
        return function() {
          if (_this.isExpanded) {
            return _this.trigger('tree-view:directory-modified');
          }
        };
      })(this));
    };

    DirectoryView.prototype.getPath = function() {
      return this.directory.path;
    };

    DirectoryView.prototype.createViewForEntry = function(entry) {
      var subscription, view;
      if (entry instanceof Directory) {
        view = new DirectoryView(entry);
      } else {
        view = new FileView(entry);
      }
      subscription = this.subscribe(this.directory, 'entry-removed', function(removedEntry) {
        if (entry === removedEntry) {
          view.remove();
          return subscription.off();
        }
      });
      return view;
    };

    DirectoryView.prototype.reload = function() {
      if (this.isExpanded) {
        return this.directory.reload();
      }
    };

    DirectoryView.prototype.toggleExpansion = function(isRecursive) {
      if (isRecursive == null) {
        isRecursive = false;
      }
      if (this.isExpanded) {
        return this.collapse(isRecursive);
      } else {
        return this.expand(isRecursive);
      }
    };

    DirectoryView.prototype.expand = function(isRecursive) {
      var child, childView, _i, _len, _ref1;
      if (isRecursive == null) {
        isRecursive = false;
      }
      if (!this.isExpanded) {
        this.addClass('expanded').removeClass('collapsed');
        this.subscribeToDirectory();
        this.directory.expand();
        this.isExpanded = true;
      }
      if (isRecursive) {
        _ref1 = this.entries.children();
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          child = _ref1[_i];
          childView = $(child).view();
          if (childView instanceof DirectoryView) {
            childView.expand(true);
          }
        }
      }
      return false;
    };

    DirectoryView.prototype.collapse = function(isRecursive) {
      var child, childView, _i, _len, _ref1;
      if (isRecursive == null) {
        isRecursive = false;
      }
      if (isRecursive) {
        _ref1 = this.entries.children();
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          child = _ref1[_i];
          childView = $(child).view();
          if (childView instanceof DirectoryView && childView.isExpanded) {
            childView.collapse(true);
          }
        }
      }
      this.removeClass('expanded').addClass('collapsed');
      this.directory.collapse();
      this.unsubscribe(this.directory);
      this.entries.empty();
      return this.isExpanded = false;
    };

    return DirectoryView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVEQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUFZLE9BQUEsQ0FBUSxNQUFSLENBQVosRUFBQyxTQUFBLENBQUQsRUFBSSxZQUFBLElBQUosQ0FBQTs7QUFBQSxFQUVBLFNBQUEsR0FBWSxPQUFBLENBQVEsYUFBUixDQUZaLENBQUE7O0FBQUEsRUFHQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FIWCxDQUFBOztBQUFBLEVBSUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBSlAsQ0FBQTs7QUFBQSxFQU1BLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixvQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxhQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxFQUFELENBQUk7QUFBQSxRQUFBLE9BQUEsRUFBTyw0Q0FBUDtPQUFKLEVBQXlELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDdkQsVUFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxNQUFBLEVBQVEsUUFBUjtBQUFBLFlBQWtCLE9BQUEsRUFBTyxrQkFBekI7V0FBTCxFQUFrRCxTQUFBLEdBQUE7bUJBQ2hELEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxjQUFBLE9BQUEsRUFBTyxXQUFQO0FBQUEsY0FBb0IsTUFBQSxFQUFRLGVBQTVCO2FBQU4sRUFEZ0Q7VUFBQSxDQUFsRCxDQUFBLENBQUE7aUJBRUEsS0FBQyxDQUFBLEVBQUQsQ0FBSTtBQUFBLFlBQUEsT0FBQSxFQUFPLG1CQUFQO0FBQUEsWUFBNEIsTUFBQSxFQUFRLFNBQXBDO1dBQUosRUFIdUQ7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6RCxFQURRO0lBQUEs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
//# sourceURL=/Users/Shannon/.dotfiles/atom.symlink/packages/tree-view/lib/directory-view.coffee