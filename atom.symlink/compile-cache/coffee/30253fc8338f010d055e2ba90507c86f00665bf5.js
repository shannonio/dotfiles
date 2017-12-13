(function() {
  var NoticeView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  NoticeView = (function(_super) {
    __extends(NoticeView, _super);

    function NoticeView() {
      return NoticeView.__super__.constructor.apply(this, arguments);
    }

    NoticeView.content = function() {
      return this.div({
        tabindex: -1,
        "class": 'dont-use-this-notice overlay from-top',
        click: 'dismiss'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'block highlight-error padded'
          }, 'Wait, what are you doing here');
          _this.p({
            "class": 'block'
          }, function() {
            _this.text('The package you actually want to install is ');
            _this.strong('merge-conflicts');
            return _this.text('.');
          });
          _this.p({
            "class": 'block'
          }, function() {
            _this.text("You've got ");
            _this.strong('git-merge-conflicts');
            return _this.text(' instead.');
          });
          return _this.p({
            "class": 'block text-subtle'
          }, 'click to dismiss');
        };
      })(this));
    };

    NoticeView.prototype.dismiss = function() {
      return this.hide('fast', (function(_this) {
        return function() {
          return _this.remove();
        };
      })(this));
    };

    return NoticeView;

  })(View);

  module.exports = {
    activate: function(state) {
      return atom.workspaceView.append(new NoticeView());
    },
    deactivate: function() {},
    serialize: function() {}
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxPQUFRLE9BQUEsQ0FBUSxNQUFSLEVBQVIsSUFBRCxDQUFBOztBQUFBLEVBRU07QUFDSixpQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxVQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLFFBQUEsRUFBVSxDQUFBLENBQVY7QUFBQSxRQUFjLE9BQUEsRUFBTyx1Q0FBckI7QUFBQSxRQUE4RCxLQUFBLEVBQU8sU0FBckU7T0FBTCxFQUFxRixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ25GLFVBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLDhCQUFQO1dBQUwsRUFBNEMsK0JBQTVDLENBQUEsQ0FBQTtBQUFBLFVBQ0EsS0FBQyxDQUFBLENBQUQsQ0FBRztBQUFBLFlBQUEsT0FBQSxFQUFPLE9BQVA7V0FBSCxFQUFtQixTQUFBLEdBQUE7QUFDakIsWUFBQSxLQUFDLENBQUEsSUFBRCxDQUFNLDhDQUFOLENBQUEsQ0FBQTtBQUFBLFlBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBUSxpQkFBUixDQURBLENBQUE7bUJBRUEsS0FBQyxDQUFBLElBQUQsQ0FBTSxHQUFOLEVBSGlCO1VBQUEsQ0FBbkIsQ0FEQSxDQUFBO0FBQUEsVUFLQSxLQUFDLENBQUEsQ0FBRCxDQUFHO0FBQUEsWUFBQSxPQUFBLEVBQU8sT0FBUDtXQUFILEVBQW1CLFNBQUEsR0FBQTtBQUNqQixZQUFBLEtBQUMsQ0FBQSxJQUFELENBQU0sYUFBTixDQUFBLENBQUE7QUFBQSxZQUNBLEtBQUMsQ0FBQSxNQUFELENBQVEscUJBQVIsQ0FEQSxDQUFBO21CQUVBLEtBQUMsQ0FBQSxJQUFELENBQU0sV0FBTixFQUhpQjtVQUFBLENBQW5CLENBTEEsQ0FBQTtpQkFTQSxLQUFDLENBQUEsQ0FBRCxDQUFHO0FBQUEsWUFBQSxPQUFBLEVBQU8sbUJBQVA7V0FBSCxFQUErQixrQkFBL0IsRUFWbUY7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyRixFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLHlCQWFBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFDUCxJQUFDLENBQUEsSUFBRCxDQUFNLE1BQU4sRUFBYyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxNQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWQsRUFETztJQUFBLENBYlQsQ0FBQTs7c0JBQUE7O0tBRHVCLEtBRnpCLENBQUE7O0FBQUEsRUFtQkEsTUFBTSxDQUFDLE9BQVAsR0FFRTtBQUFBLElBQUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO2FBQ1IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFuQixDQUE4QixJQUFBLFVBQUEsQ0FBQSxDQUE5QixFQURRO0lBQUEsQ0FBVjtBQUFBLElBR0EsVUFBQSxFQUFZLFNBQUEsR0FBQSxDQUhaO0FBQUEsSUFLQSxTQUFBLEVBQVcsU0FBQSxHQUFBLENBTFg7R0FyQkYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/shannon/.dotfiles/atom.symlink/packages/git-merge-conflicts/lib/git-merge-conflicts.coffee