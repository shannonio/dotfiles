(function() {
  var $$$, TextEditorView, View, _ref;

  _ref = require('atom-space-pen-views'), $$$ = _ref.$$$, View = _ref.View, TextEditorView = _ref.TextEditorView;

  module.exports = function() {
    return this.div({
      tabIndex: -1,
      "class": 'atomts-rename-view'
    }, (function(_this) {
      return function() {
        _this.div({
          "class": 'block'
        }, function() {
          return _this.div(function() {
            _this.span({
              outlet: 'title'
            }, function() {
              return 'Rename Variable';
            });
            return _this.span({
              "class": 'subtle-info-message'
            }, function() {
              _this.span('Close this panel with ');
              _this.span({
                "class": 'highlight'
              }, 'esc');
              _this.span(' key. And commit with the ');
              _this.span({
                "class": 'highlight'
              }, 'enter');
              return _this.span('key.');
            });
          });
        });
        _this.div({
          "class": 'find-container block'
        }, function() {
          return _this.div({
            "class": 'editor-container'
          }, function() {
            return _this.subview('newNameEditor', new TextEditorView({
              mini: true,
              placeholderText: 'new name'
            }));
          });
        });
        _this.div({
          outlet: 'fileCount'
        }, function() {});
        _this.br({});
        return _this.div({
          "class": 'highlight-error',
          style: 'display:none',
          outlet: 'validationMessage'
        });
      };
    })(this));
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3NoYW5ub25iZXJ0dWNjaS8uZG90ZmlsZXMvYXRvbS5zeW1saW5rL3BhY2thZ2VzL2F0b20tdHlwZXNjcmlwdC92aWV3cy9yZW5hbWVWaWV3Lmh0bWwuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtCQUFBOztBQUFBLEVBQUEsT0FBOEIsT0FBQSxDQUFRLHNCQUFSLENBQTlCLEVBQUMsV0FBQSxHQUFELEVBQU0sWUFBQSxJQUFOLEVBQVksc0JBQUEsY0FBWixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDSSxTQUFBLEdBQUE7V0FDSSxJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsTUFBQSxRQUFBLEVBQVUsQ0FBQSxDQUFWO0FBQUEsTUFBYyxPQUFBLEVBQU8sb0JBQXJCO0tBQUwsRUFBZ0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtBQUM1QyxRQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxVQUFBLE9BQUEsRUFBTyxPQUFQO1NBQUwsRUFBcUIsU0FBQSxHQUFBO2lCQUNqQixLQUFDLENBQUEsR0FBRCxDQUFLLFNBQUEsR0FBQTtBQUNELFlBQUEsS0FBQyxDQUFBLElBQUQsQ0FBTTtBQUFBLGNBQUMsTUFBQSxFQUFRLE9BQVQ7YUFBTixFQUF5QixTQUFBLEdBQUE7cUJBQUcsa0JBQUg7WUFBQSxDQUF6QixDQUFBLENBQUE7bUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTTtBQUFBLGNBQUEsT0FBQSxFQUFPLHFCQUFQO2FBQU4sRUFBb0MsU0FBQSxHQUFBO0FBQ2hDLGNBQUEsS0FBQyxDQUFBLElBQUQsQ0FBTSx3QkFBTixDQUFBLENBQUE7QUFBQSxjQUNBLEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxnQkFBQSxPQUFBLEVBQU0sV0FBTjtlQUFOLEVBQXlCLEtBQXpCLENBREEsQ0FBQTtBQUFBLGNBRUEsS0FBQyxDQUFBLElBQUQsQ0FBTSw0QkFBTixDQUZBLENBQUE7QUFBQSxjQUdBLEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxnQkFBQSxPQUFBLEVBQU0sV0FBTjtlQUFOLEVBQXlCLE9BQXpCLENBSEEsQ0FBQTtxQkFJQSxLQUFDLENBQUEsSUFBRCxDQUFNLE1BQU4sRUFMZ0M7WUFBQSxDQUFwQyxFQUZDO1VBQUEsQ0FBTCxFQURpQjtRQUFBLENBQXJCLENBQUEsQ0FBQTtBQUFBLFFBVUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFVBQUEsT0FBQSxFQUFPLHNCQUFQO1NBQUwsRUFBb0MsU0FBQSxHQUFBO2lCQUNoQyxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sa0JBQVA7V0FBTCxFQUFnQyxTQUFBLEdBQUE7bUJBQzVCLEtBQUMsQ0FBQSxPQUFELENBQVMsZUFBVCxFQUE4QixJQUFBLGNBQUEsQ0FBZTtBQUFBLGNBQUEsSUFBQSxFQUFNLElBQU47QUFBQSxjQUFZLGVBQUEsRUFBaUIsVUFBN0I7YUFBZixDQUE5QixFQUQ0QjtVQUFBLENBQWhDLEVBRGdDO1FBQUEsQ0FBcEMsQ0FWQSxDQUFBO0FBQUEsUUFjQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsVUFBQyxNQUFBLEVBQU8sV0FBUjtTQUFMLEVBQTJCLFNBQUEsR0FBQSxDQUEzQixDQWRBLENBQUE7QUFBQSxRQWVBLEtBQUMsQ0FBQSxFQUFELENBQUksRUFBSixDQWZBLENBQUE7ZUFnQkEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFVBQUMsT0FBQSxFQUFPLGlCQUFSO0FBQUEsVUFBMkIsS0FBQSxFQUFNLGNBQWpDO0FBQUEsVUFBaUQsTUFBQSxFQUFPLG1CQUF4RDtTQUFMLEVBakI0QztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhELEVBREo7RUFBQSxDQUhKLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/shannonbertucci/.dotfiles/atom.symlink/packages/atom-typescript/views/renameView.html.coffee
