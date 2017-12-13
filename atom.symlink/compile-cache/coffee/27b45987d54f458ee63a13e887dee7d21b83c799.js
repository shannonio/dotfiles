(function() {
  var AngularjsView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  module.exports = AngularjsView = (function(_super) {
    __extends(AngularjsView, _super);

    function AngularjsView() {
      return AngularjsView.__super__.constructor.apply(this, arguments);
    }

    AngularjsView.content = function() {
      return this.div({
        "class": 'angularjs overlay from-top'
      }, (function(_this) {
        return function() {
          return _this.div("The Angularjs package is Alive! It's ALIVE!", {
            "class": "message"
          });
        };
      })(this));
    };

    AngularjsView.prototype.initialize = function(serializeState) {
      return atom.workspaceView.command("angularjs:toggle", (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
    };

    AngularjsView.prototype.serialize = function() {};

    AngularjsView.prototype.destroy = function() {
      return this.detach();
    };

    AngularjsView.prototype.toggle = function() {
      console.log("AngularjsView was toggled!");
      if (this.hasParent()) {
        return this.detach();
      } else {
        return atom.workspaceView.append(this);
      }
    };

    return AngularjsView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1CQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxPQUFRLE9BQUEsQ0FBUSxNQUFSLEVBQVIsSUFBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLG9DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGFBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLDRCQUFQO09BQUwsRUFBMEMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDeEMsS0FBQyxDQUFBLEdBQUQsQ0FBSyw2Q0FBTCxFQUFvRDtBQUFBLFlBQUEsT0FBQSxFQUFPLFNBQVA7V0FBcEQsRUFEd0M7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQyxFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLDRCQUlBLFVBQUEsR0FBWSxTQUFDLGNBQUQsR0FBQTthQUNWLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsa0JBQTNCLEVBQStDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0MsRUFEVTtJQUFBLENBSlosQ0FBQTs7QUFBQSw0QkFRQSxTQUFBLEdBQVcsU0FBQSxHQUFBLENBUlgsQ0FBQTs7QUFBQSw0QkFXQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQ1AsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQURPO0lBQUEsQ0FYVCxDQUFBOztBQUFBLDRCQWNBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksNEJBQVosQ0FBQSxDQUFBO0FBQ0EsTUFBQSxJQUFHLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBSDtlQUNFLElBQUMsQ0FBQSxNQUFELENBQUEsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQW5CLENBQTBCLElBQTFCLEVBSEY7T0FGTTtJQUFBLENBZFIsQ0FBQTs7eUJBQUE7O0tBRDBCLEtBSDVCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/shannon/.dotfiles/atom.symlink/packages/angularjs/lib/angularjs-view.coffee