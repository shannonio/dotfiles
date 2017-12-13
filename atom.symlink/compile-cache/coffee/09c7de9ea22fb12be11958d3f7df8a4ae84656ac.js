(function() {
  var $, SublimeTabBarView, SublimeTabView, TabBarView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $ = require('atom').$;

  TabBarView = require(atom.packages.resolvePackagePath('tabs') + '/lib/tab-bar-view');

  SublimeTabView = require('./sublime-tab-view');

  module.exports = SublimeTabBarView = (function(_super) {
    __extends(SublimeTabBarView, _super);

    function SublimeTabBarView() {
      return SublimeTabBarView.__super__.constructor.apply(this, arguments);
    }

    SublimeTabBarView.prototype.initialize = function(pane) {
      this.pane = pane;
      this.considerTemp = false;
      SublimeTabBarView.__super__.initialize.call(this, this.pane);
      if (this.openPermanent == null) {
        this.openPermanent = [];
      }
      this.subscribe($(window), 'window:open-path', (function(_this) {
        return function(event, _arg) {
          var path, pathToOpen, _ref, _ref1;
          pathToOpen = _arg.pathToOpen;
          path = (_ref = (_ref1 = atom.project) != null ? _ref1.relativize(pathToOpen) : void 0) != null ? _ref : pathToOpen;
          if (__indexOf.call(_this.openPermanent, pathToOpen) < 0) {
            return _this.openPermanent.push(pathToOpen);
          }
        };
      })(this));
      this.considerTemp = true;
      return this.on('dblclick', '.tab', function(_arg) {
        var tab, target;
        target = _arg.target;
        tab = $(target).closest('.tab').view();
        if (tab.is('.temp')) {
          tab.removeClass('temp');
        }
        return false;
      });
    };

    SublimeTabBarView.prototype.addTabForItem = function(item, index) {
      var tab, tabView, _i, _len, _ref;
      _ref = this.getTabs();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tab = _ref[_i];
        if (tab.is('.temp')) {
          this.closeTab(tab);
        }
      }
      tabView = new SublimeTabView(item, this.pane, this.openPermanent, this.considerTemp);
      this.insertTabAtIndex(tabView, index);
      return this.updateActiveTab();
    };

    return SublimeTabBarView;

  })(TabBarView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdEQUFBO0lBQUE7O3lKQUFBOztBQUFBLEVBQUMsSUFBaUIsT0FBQSxDQUFRLE1BQVIsRUFBakIsQ0FBRCxDQUFBOztBQUFBLEVBRUEsVUFBQSxHQUFrQixPQUFBLENBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBZCxDQUFpQyxNQUFqQyxDQUFBLEdBQTJDLG1CQUFuRCxDQUZsQixDQUFBOztBQUFBLEVBR0EsY0FBQSxHQUFrQixPQUFBLENBQVEsb0JBQVIsQ0FIbEIsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFFSix3Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsZ0NBQUEsVUFBQSxHQUFZLFNBQUUsSUFBRixHQUFBO0FBSVYsTUFKVyxJQUFDLENBQUEsT0FBQSxJQUlaLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxZQUFELEdBQWdCLEtBQWhCLENBQUE7QUFBQSxNQUVBLGtEQUFNLElBQUMsQ0FBQSxJQUFQLENBRkEsQ0FBQTs7UUFHQSxJQUFDLENBQUEsZ0JBQWlCO09BSGxCO0FBQUEsTUFJQSxJQUFDLENBQUEsU0FBRCxDQUFXLENBQUEsQ0FBRSxNQUFGLENBQVgsRUFBc0Isa0JBQXRCLEVBQTBDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEtBQUQsRUFBUSxJQUFSLEdBQUE7QUFDeEMsY0FBQSw2QkFBQTtBQUFBLFVBRGlELGFBQUQsS0FBQyxVQUNqRCxDQUFBO0FBQUEsVUFBQSxJQUFBLG9HQUE4QyxVQUE5QyxDQUFBO0FBQ0EsVUFBQSxJQUFzQyxlQUFjLEtBQUMsQ0FBQSxhQUFmLEVBQUEsVUFBQSxLQUF0QzttQkFBQSxLQUFDLENBQUEsYUFBYSxDQUFDLElBQWYsQ0FBb0IsVUFBcEIsRUFBQTtXQUZ3QztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFDLENBSkEsQ0FBQTtBQUFBLE1BU0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFUaEIsQ0FBQTthQVdBLElBQUMsQ0FBQSxFQUFELENBQUksVUFBSixFQUFnQixNQUFoQixFQUF3QixTQUFDLElBQUQsR0FBQTtBQUN0QixZQUFBLFdBQUE7QUFBQSxRQUR3QixTQUFELEtBQUMsTUFDeEIsQ0FBQTtBQUFBLFFBQUEsR0FBQSxHQUFNLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxPQUFWLENBQWtCLE1BQWxCLENBQXlCLENBQUMsSUFBMUIsQ0FBQSxDQUFOLENBQUE7QUFDQSxRQUFBLElBQTJCLEdBQUcsQ0FBQyxFQUFKLENBQU8sT0FBUCxDQUEzQjtBQUFBLFVBQUEsR0FBRyxDQUFDLFdBQUosQ0FBZ0IsTUFBaEIsQ0FBQSxDQUFBO1NBREE7ZUFFQSxNQUhzQjtNQUFBLENBQXhCLEVBZlU7SUFBQSxDQUFaLENBQUE7O0FBQUEsZ0NBb0JBLGFBQUEsR0FBZSxTQUFDLElBQUQsRUFBTyxLQUFQLEdBQUE7QUFDYixVQUFBLDRCQUFBO0FBQUE7QUFBQSxXQUFBLDJDQUFBO3VCQUFBO0FBQ0UsUUFBQSxJQUFrQixHQUFHLENBQUMsRUFBSixDQUFPLE9BQVAsQ0FBbEI7QUFBQSxVQUFBLElBQUMsQ0FBQSxRQUFELENBQVUsR0FBVixDQUFBLENBQUE7U0FERjtBQUFBLE9BQUE7QUFBQSxNQUdBLE9BQUEsR0FBYyxJQUFBLGNBQUEsQ0FBZSxJQUFmLEVBQXFCLElBQUMsQ0FBQSxJQUF0QixFQUE0QixJQUFDLENBQUEsYUFBN0IsRUFBNEMsSUFBQyxDQUFBLFlBQTdDLENBSGQsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLGdCQUFELENBQWtCLE9BQWxCLEVBQTJCLEtBQTNCLENBSkEsQ0FBQTthQUtBLElBQUMsQ0FBQSxlQUFELENBQUEsRUFOYTtJQUFBLENBcEJmLENBQUE7OzZCQUFBOztLQUY4QixXQU5oQyxDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/shannon/.dotfiles/atom.symlink/packages/sublime-tabs/lib/sublime-tab-bar-view.coffee