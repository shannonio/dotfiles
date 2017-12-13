(function() {
  var $$$, TextEditorView, View, ref;

  ref = require('atom-space-pen-views'), $$$ = ref.$$$, View = ref.View, TextEditorView = ref.TextEditorView;

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
        return _this.div({
          "class": 'highlight-error',
          style: 'display:none',
          outlet: 'validationMessage'
        });
      };
    })(this));
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3NoYW5ub25iZXJ0dWNjaS8uYXRvbS9wYWNrYWdlcy9hdG9tLXR5cGVzY3JpcHQvdmlld3MvcmVuYW1lVmlldy5odG1sLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBOEIsT0FBQSxDQUFRLHNCQUFSLENBQTlCLEVBQUMsYUFBRCxFQUFNLGVBQU4sRUFBWTs7RUFFWixNQUFNLENBQUMsT0FBUCxHQUNJLFNBQUE7V0FDSSxJQUFDLENBQUEsR0FBRCxDQUFLO01BQUEsUUFBQSxFQUFVLENBQUMsQ0FBWDtNQUFjLENBQUEsS0FBQSxDQUFBLEVBQU8sb0JBQXJCO0tBQUwsRUFBZ0QsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFBO1FBQzVDLEtBQUMsQ0FBQSxHQUFELENBQUs7VUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE9BQVA7U0FBTCxFQUFxQixTQUFBO2lCQUNqQixLQUFDLENBQUEsR0FBRCxDQUFLLFNBQUE7WUFDRCxLQUFDLENBQUEsSUFBRCxDQUFNO2NBQUMsTUFBQSxFQUFRLE9BQVQ7YUFBTixFQUF5QixTQUFBO3FCQUFHO1lBQUgsQ0FBekI7bUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTTtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8scUJBQVA7YUFBTixFQUFvQyxTQUFBO2NBQ2hDLEtBQUMsQ0FBQSxJQUFELENBQU0sd0JBQU47Y0FDQSxLQUFDLENBQUEsSUFBRCxDQUFNO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sV0FBTjtlQUFOLEVBQXlCLEtBQXpCO2NBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSw0QkFBTjtjQUNBLEtBQUMsQ0FBQSxJQUFELENBQU07Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxXQUFOO2VBQU4sRUFBeUIsT0FBekI7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxNQUFOO1lBTGdDLENBQXBDO1VBRkMsQ0FBTDtRQURpQixDQUFyQjtRQVVBLEtBQUMsQ0FBQSxHQUFELENBQUs7VUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHNCQUFQO1NBQUwsRUFBb0MsU0FBQTtpQkFDaEMsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sa0JBQVA7V0FBTCxFQUFnQyxTQUFBO21CQUM1QixLQUFDLENBQUEsT0FBRCxDQUFTLGVBQVQsRUFBOEIsSUFBQSxjQUFBLENBQWU7Y0FBQSxJQUFBLEVBQU0sSUFBTjtjQUFZLGVBQUEsRUFBaUIsVUFBN0I7YUFBZixDQUE5QjtVQUQ0QixDQUFoQztRQURnQyxDQUFwQztlQUlBLEtBQUMsQ0FBQSxHQUFELENBQUs7VUFBQyxDQUFBLEtBQUEsQ0FBQSxFQUFPLGlCQUFSO1VBQTJCLEtBQUEsRUFBTSxjQUFqQztVQUFpRCxNQUFBLEVBQU8sbUJBQXhEO1NBQUw7TUFmNEM7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhEO0VBREo7QUFISiIsInNvdXJjZXNDb250ZW50IjpbInskJCQsIFZpZXcsIFRleHRFZGl0b3JWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gICAgLT5cbiAgICAgICAgQGRpdiB0YWJJbmRleDogLTEsIGNsYXNzOiAnYXRvbXRzLXJlbmFtZS12aWV3JywgPT5cbiAgICAgICAgICAgIEBkaXYgY2xhc3M6ICdibG9jaycsID0+XG4gICAgICAgICAgICAgICAgQGRpdiA9PlxuICAgICAgICAgICAgICAgICAgICBAc3BhbiB7b3V0bGV0OiAndGl0bGUnfSwgPT4gJ1JlbmFtZSBWYXJpYWJsZSdcbiAgICAgICAgICAgICAgICAgICAgQHNwYW4gY2xhc3M6ICdzdWJ0bGUtaW5mby1tZXNzYWdlJywgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIEBzcGFuICdDbG9zZSB0aGlzIHBhbmVsIHdpdGggJ1xuICAgICAgICAgICAgICAgICAgICAgICAgQHNwYW4gY2xhc3M6J2hpZ2hsaWdodCcsICdlc2MnXG4gICAgICAgICAgICAgICAgICAgICAgICBAc3BhbiAnIGtleS4gQW5kIGNvbW1pdCB3aXRoIHRoZSAnXG4gICAgICAgICAgICAgICAgICAgICAgICBAc3BhbiBjbGFzczonaGlnaGxpZ2h0JywgJ2VudGVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgQHNwYW4gJ2tleS4nXG5cbiAgICAgICAgICAgIEBkaXYgY2xhc3M6ICdmaW5kLWNvbnRhaW5lciBibG9jaycsID0+XG4gICAgICAgICAgICAgICAgQGRpdiBjbGFzczogJ2VkaXRvci1jb250YWluZXInLCA9PlxuICAgICAgICAgICAgICAgICAgICBAc3VidmlldyAnbmV3TmFtZUVkaXRvcicsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlLCBwbGFjZWhvbGRlclRleHQ6ICduZXcgbmFtZScpXG5cbiAgICAgICAgICAgIEBkaXYge2NsYXNzOiAnaGlnaGxpZ2h0LWVycm9yJywgc3R5bGU6J2Rpc3BsYXk6bm9uZScsIG91dGxldDondmFsaWRhdGlvbk1lc3NhZ2UnfSxcbiJdfQ==
