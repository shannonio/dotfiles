(function() {
  var $, $$$, EditorView, ScrollView, TextFormatter, _ref;

  _ref = require('atom-space-pen-views'), $ = _ref.$, $$$ = _ref.$$$, EditorView = _ref.EditorView, ScrollView = _ref.ScrollView;

  TextFormatter = (function() {
    function TextFormatter(text) {
      this.text = text;
    }

    TextFormatter.prototype.htmlEscaped = function() {
      return new TextFormatter($('<div/>').text(this.text).html());
    };

    TextFormatter.prototype.fileLinked = function() {
      var text;
      text = this.text.replace(/([\\\/.][^\s]*:[0-9]+)([^\d]|$)/g, (function(_this) {
        return function(match) {
          var file, fileAndLine, fileLineEnd, line, matchWithoutFileAndLine;
          file = match.split(":")[0];
          line = match.split(":")[1].replace(/[^\d]*$/, '');
          fileLineEnd = file.length + line.length;
          fileAndLine = "" + file + ":" + line;
          matchWithoutFileAndLine = match.substr(fileLineEnd + 1);
          return ("<a href=\"" + file + "\" data-line=\"" + line + "\" data-file=\"" + file + "\">") + ("" + fileAndLine + "</a>" + matchWithoutFileAndLine);
        };
      })(this));
      return new TextFormatter(text);
    };

    TextFormatter.prototype.colorized = function() {
      var colorEndCount, colorStartCount, i, replaceCount, text, _i, _ref1, _ref2;
      text = this.text;
      colorStartCount = ((_ref1 = text.match(/\[3[0-7]m/g)) != null ? _ref1.length : void 0) || 0;
      colorEndCount = ((_ref2 = text.match(/\[0m/g)) != null ? _ref2.length : void 0) || 0;
      replaceCount = colorStartCount;
      if (colorEndCount < colorStartCount) {
        replaceCount = colorEndCount;
      }
      for (i = _i = 0; 0 <= replaceCount ? _i <= replaceCount : _i >= replaceCount; i = 0 <= replaceCount ? ++_i : --_i) {
        text = text.replace(/\[(3[0-7])m/, (function(_this) {
          return function(match, colorCode) {
            return "<p class=\"rspec-color tty-" + colorCode + "\">";
          };
        })(this));
        text = text.replace(/\[0m/g, '</p>');
      }
      return new TextFormatter(text);
    };

    return TextFormatter;

  })();

  module.exports = TextFormatter;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3NoYW5ub25iZXJ0dWNjaS8uZG90ZmlsZXMvYXRvbS5zeW1saW5rL3BhY2thZ2VzL3JzcGVjL2xpYi90ZXh0LWZvcm1hdHRlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsbURBQUE7O0FBQUEsRUFBQSxPQUFtQyxPQUFBLENBQVEsc0JBQVIsQ0FBbkMsRUFBQyxTQUFBLENBQUQsRUFBSSxXQUFBLEdBQUosRUFBUyxrQkFBQSxVQUFULEVBQXFCLGtCQUFBLFVBQXJCLENBQUE7O0FBQUEsRUFFTTtBQUNTLElBQUEsdUJBQUUsSUFBRixHQUFBO0FBQVEsTUFBUCxJQUFDLENBQUEsT0FBQSxJQUFNLENBQVI7SUFBQSxDQUFiOztBQUFBLDRCQUVBLFdBQUEsR0FBYSxTQUFBLEdBQUE7YUFDUCxJQUFBLGFBQUEsQ0FBZSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsSUFBWixDQUFpQixJQUFDLENBQUEsSUFBbEIsQ0FBdUIsQ0FBQyxJQUF4QixDQUFBLENBQWYsRUFETztJQUFBLENBRmIsQ0FBQTs7QUFBQSw0QkFLQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFOLENBQWMsa0NBQWQsRUFBa0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsS0FBRCxHQUFBO0FBQ3ZELGNBQUEsNkRBQUE7QUFBQSxVQUFBLElBQUEsR0FBTyxLQUFLLENBQUMsS0FBTixDQUFZLEdBQVosQ0FBaUIsQ0FBQSxDQUFBLENBQXhCLENBQUE7QUFBQSxVQUNBLElBQUEsR0FBTyxLQUFLLENBQUMsS0FBTixDQUFZLEdBQVosQ0FBaUIsQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFwQixDQUE0QixTQUE1QixFQUF1QyxFQUF2QyxDQURQLENBQUE7QUFBQSxVQUdBLFdBQUEsR0FBYyxJQUFJLENBQUMsTUFBTCxHQUFjLElBQUksQ0FBQyxNQUhqQyxDQUFBO0FBQUEsVUFJQSxXQUFBLEdBQWMsRUFBQSxHQUFHLElBQUgsR0FBUSxHQUFSLEdBQVcsSUFKekIsQ0FBQTtBQUFBLFVBS0EsdUJBQUEsR0FBMEIsS0FBSyxDQUFDLE1BQU4sQ0FBYSxXQUFBLEdBQWMsQ0FBM0IsQ0FMMUIsQ0FBQTtpQkFPQSxDQUFDLFlBQUEsR0FBWSxJQUFaLEdBQWlCLGlCQUFqQixHQUFrQyxJQUFsQyxHQUF1QyxpQkFBdkMsR0FBd0QsSUFBeEQsR0FBNkQsS0FBOUQsQ0FBQSxHQUNBLENBQUEsRUFBQSxHQUFHLFdBQUgsR0FBZSxNQUFmLEdBQXFCLHVCQUFyQixFQVR1RDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxELENBQVAsQ0FBQTthQVVJLElBQUEsYUFBQSxDQUFjLElBQWQsRUFYTTtJQUFBLENBTFosQ0FBQTs7QUFBQSw0QkFrQkEsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsdUVBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsSUFBUixDQUFBO0FBQUEsTUFFQSxlQUFBLHNEQUEwQyxDQUFFLGdCQUExQixJQUFvQyxDQUZ0RCxDQUFBO0FBQUEsTUFHQSxhQUFBLGlEQUFtQyxDQUFFLGdCQUFyQixJQUErQixDQUgvQyxDQUFBO0FBQUEsTUFNQSxZQUFBLEdBQWUsZUFOZixDQUFBO0FBT0EsTUFBQSxJQUFnQyxhQUFBLEdBQWdCLGVBQWhEO0FBQUEsUUFBQSxZQUFBLEdBQWUsYUFBZixDQUFBO09BUEE7QUFTQSxXQUFTLDRHQUFULEdBQUE7QUFDRSxRQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLGFBQWIsRUFBNEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLEtBQUQsRUFBUSxTQUFSLEdBQUE7bUJBQ2hDLDZCQUFBLEdBQTZCLFNBQTdCLEdBQXVDLE1BRFA7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QixDQUFQLENBQUE7QUFBQSxRQUVBLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLE9BQWIsRUFBc0IsTUFBdEIsQ0FGUCxDQURGO0FBQUEsT0FUQTthQWNJLElBQUEsYUFBQSxDQUFjLElBQWQsRUFmSztJQUFBLENBbEJYLENBQUE7O3lCQUFBOztNQUhGLENBQUE7O0FBQUEsRUFzQ0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsYUF0Q2pCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/shannonbertucci/.dotfiles/atom.symlink/packages/rspec/lib/text-formatter.coffee
