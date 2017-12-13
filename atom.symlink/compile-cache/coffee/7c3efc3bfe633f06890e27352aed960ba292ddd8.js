(function() {
  var $, SublimeTabView, TabView, path, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  path = require('path');

  $ = require('atom').$;

  TabView = require(atom.packages.resolvePackagePath('tabs') + '/lib/tab-view');

  module.exports = SublimeTabView = (function(_super) {
    __extends(SublimeTabView, _super);

    function SublimeTabView() {
      return SublimeTabView.__super__.constructor.apply(this, arguments);
    }

    SublimeTabView.prototype.initialize = function(item, pane, openPermanent, considerTemporary) {
      var _ref;
      this.item = item;
      this.pane = pane;
      if (openPermanent == null) {
        openPermanent = [];
      }
      SublimeTabView.__super__.initialize.call(this, this.item, this.pane);
      if (!considerTemporary) {
        return;
      }
      if (this.item.constructor.name === 'Editor' || this.item.constructor.name === 'ImageEditor') {
        if (_ref = this.item.getPath(), __indexOf.call(openPermanent, _ref) >= 0) {
          _.remove(openPermanent, this.item.getPath());
        } else {
          this.addClass('temp');
        }
      }
      return atom.workspaceView.command('sublime-tabs:keep-tab', (function(_this) {
        return function() {
          return _this.keepTab();
        };
      })(this));
    };

    SublimeTabView.prototype.updateModifiedStatus = function() {
      var _base;
      SublimeTabView.__super__.updateModifiedStatus.call(this);
      if (this.is('.temp') && (typeof (_base = this.item).isModified === "function" ? _base.isModified() : void 0)) {
        return this.removeClass('temp');
      }
    };

    SublimeTabView.prototype.keepTab = function() {
      if (this.is('.temp')) {
        return this.removeClass('temp');
      }
    };

    return SublimeTabView;

  })(TabView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1DQUFBO0lBQUE7O3lKQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFVLE9BQUEsQ0FBUSxpQkFBUixDQUFWLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQVUsT0FBQSxDQUFRLE1BQVIsQ0FEVixDQUFBOztBQUFBLEVBRUMsSUFBUyxPQUFBLENBQVEsTUFBUixFQUFULENBRkQsQ0FBQTs7QUFBQSxFQUdBLE9BQUEsR0FBVSxPQUFBLENBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBZCxDQUFpQyxNQUFqQyxDQUFBLEdBQTJDLGVBQW5ELENBSFYsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFFSixxQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsNkJBQUEsVUFBQSxHQUFZLFNBQUUsSUFBRixFQUFTLElBQVQsRUFBZSxhQUFmLEVBQWlDLGlCQUFqQyxHQUFBO0FBQ1YsVUFBQSxJQUFBO0FBQUEsTUFEVyxJQUFDLENBQUEsT0FBQSxJQUNaLENBQUE7QUFBQSxNQURrQixJQUFDLENBQUEsT0FBQSxJQUNuQixDQUFBOztRQUR5QixnQkFBYztPQUN2QztBQUFBLE1BQUEsK0NBQU0sSUFBQyxDQUFBLElBQVAsRUFBYSxJQUFDLENBQUEsSUFBZCxDQUFBLENBQUE7QUFDQSxNQUFBLElBQUEsQ0FBQSxpQkFBQTtBQUFBLGNBQUEsQ0FBQTtPQURBO0FBR0EsTUFBQSxJQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQWxCLEtBQTBCLFFBQTFCLElBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBbEIsS0FBMEIsYUFEN0I7QUFFRSxRQUFBLFdBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFOLENBQUEsQ0FBQSxFQUFBLGVBQW1CLGFBQW5CLEVBQUEsSUFBQSxNQUFIO0FBQ0UsVUFBQSxDQUFDLENBQUMsTUFBRixDQUFTLGFBQVQsRUFBd0IsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFOLENBQUEsQ0FBeEIsQ0FBQSxDQURGO1NBQUEsTUFBQTtBQUdFLFVBQUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLENBQUEsQ0FIRjtTQUZGO09BSEE7YUFVQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLHVCQUEzQixFQUFvRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxPQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBELEVBWFU7SUFBQSxDQUFaLENBQUE7O0FBQUEsNkJBYUEsb0JBQUEsR0FBc0IsU0FBQSxHQUFBO0FBQ3BCLFVBQUEsS0FBQTtBQUFBLE1BQUEsdURBQUEsQ0FBQSxDQUFBO0FBQ0EsTUFBQSxJQUF3QixJQUFDLENBQUEsRUFBRCxDQUFJLE9BQUosQ0FBQSxpRUFBc0IsQ0FBQyxzQkFBL0M7ZUFBQSxJQUFDLENBQUEsV0FBRCxDQUFhLE1BQWIsRUFBQTtPQUZvQjtJQUFBLENBYnRCLENBQUE7O0FBQUEsNkJBaUJBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQXdCLElBQUMsQ0FBQSxFQUFELENBQUksT0FBSixDQUF4QjtlQUFBLElBQUMsQ0FBQSxXQUFELENBQWEsTUFBYixFQUFBO09BRE87SUFBQSxDQWpCVCxDQUFBOzswQkFBQTs7S0FGMkIsUUFON0IsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/shannon/.dotfiles/atom.symlink/packages/sublime-tabs/lib/sublime-tab-view.coffee