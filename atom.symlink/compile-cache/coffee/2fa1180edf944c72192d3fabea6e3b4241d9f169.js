(function() {
  var FileView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  module.exports = FileView = (function(_super) {
    __extends(FileView, _super);

    function FileView() {
      return FileView.__super__.constructor.apply(this, arguments);
    }

    FileView.content = function() {
      return this.li({
        "class": 'file entry list-item'
      }, (function(_this) {
        return function() {
          return _this.span({
            "class": 'name icon',
            outlet: 'fileName'
          });
        };
      })(this));
    };

    FileView.prototype.initialize = function(file) {
      this.file = file;
      this.fileName.text(this.file.name);
      this.fileName.attr('data-name', this.file.name);
      this.fileName.attr('data-path', this.file.path);
      if (this.file.symlink) {
        this.fileName.addClass('icon-file-symlink-file');
      } else {
        switch (this.file.type) {
          case 'binary':
            this.fileName.addClass('icon-file-binary');
            break;
          case 'compressed':
            this.fileName.addClass('icon-file-zip');
            break;
          case 'image':
            this.fileName.addClass('icon-file-media');
            break;
          case 'pdf':
            this.fileName.addClass('icon-file-pdf');
            break;
          case 'readme':
            this.fileName.addClass('icon-book');
            break;
          case 'text':
            this.fileName.addClass('icon-file-text');
        }
      }
      return this.subscribe(this.file.$status.onValue((function(_this) {
        return function(status) {
          _this.removeClass('status-ignored status-modified status-added');
          if (status != null) {
            return _this.addClass("status-" + status);
          }
        };
      })(this)));
    };

    FileView.prototype.getPath = function() {
      return this.file.path;
    };

    FileView.prototype.beforeRemove = function() {
      return this.file.destroy();
    };

    return FileView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGNBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLE9BQVEsT0FBQSxDQUFRLE1BQVIsRUFBUixJQUFELENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osK0JBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsUUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsRUFBRCxDQUFJO0FBQUEsUUFBQSxPQUFBLEVBQU8sc0JBQVA7T0FBSixFQUFtQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUNqQyxLQUFDLENBQUEsSUFBRCxDQUFNO0FBQUEsWUFBQSxPQUFBLEVBQU8sV0FBUDtBQUFBLFlBQW9CLE1BQUEsRUFBUSxVQUE1QjtXQUFOLEVBRGlDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkMsRUFEUTtJQUFBLENBQVYsQ0FBQTs7QUFBQSx1QkFJQSxVQUFBLEdBQVksU0FBRSxJQUFGLEdBQUE7QUFDVixNQURXLElBQUMsQ0FBQSxPQUFBLElBQ1osQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFyQixDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFlLFdBQWYsRUFBNEIsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFsQyxDQURBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFlLFdBQWYsRUFBNEIsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFsQyxDQUZBLENBQUE7QUFJQSxNQUFBLElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFUO0FBQ0UsUUFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVYsQ0FBbUIsd0JBQW5CLENBQUEsQ0FERjtPQUFBLE1BQUE7QUFHRSxnQkFBTyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQWI7QUFBQSxlQUNPLFFBRFA7QUFDeUIsWUFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVYsQ0FBbUIsa0JBQW5CLENBQUEsQ0FEekI7QUFDTztBQURQLGVBRU8sWUFGUDtBQUV5QixZQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsUUFBVixDQUFtQixlQUFuQixDQUFBLENBRnpCO0FBRU87QUFGUCxlQUdPLE9BSFA7QUFHeUIsWUFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVYsQ0FBbUIsaUJBQW5CLENBQUEsQ0FIekI7QUFHTztBQUhQLGVBSU8sS0FKUDtBQUl5QixZQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsUUFBVixDQUFtQixlQUFuQixDQUFBLENBSnpCO0FBSU87QUFKUCxlQUtPLFFBTFA7QUFLeUIsWUFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVYsQ0FBbUIsV0FBbkIsQ0FBQSxDQUx6QjtBQUtPO0FBTFAsZUFNTyxNQU5QO0FBTXlCLFlBQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUFWLENBQW1CLGdCQUFuQixDQUFBLENBTnpCO0FBQUEsU0FIRjtPQUpBO2FBZUEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFkLENBQXNCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE1BQUQsR0FBQTtBQUMvQixVQUFBLEtBQUMsQ0FBQSxXQUFELENBQWEsNkNBQWIsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxJQUFpQyxjQUFqQzttQkFBQSxLQUFDLENBQUEsUUFBRCxDQUFXLFNBQUEsR0FBUSxNQUFuQixFQUFBO1dBRitCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEIsQ0FBWCxFQWhCVTtJQUFBLENBSlosQ0FBQTs7QUFBQSx1QkF3QkEsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNQLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FEQztJQUFBLENBeEJULENBQUE7O0FBQUEsdUJBMkJBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFDWixJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBQSxFQURZO0lBQUEsQ0EzQmQsQ0FBQTs7b0JBQUE7O0tBRHFCLEtBSHZCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/Shannon/.dotfiles/atom.symlink/packages/tree-view/lib/file-view.coffee