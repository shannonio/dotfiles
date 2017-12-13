(function() {
  var TextFormatter;

  TextFormatter = require('../lib/text-formatter');

  describe('htmlEscaped', function() {
    return it('escapes html tags', function() {
      var formatter;
      formatter = new TextFormatter('<b>bold</b> text');
      return expect(formatter.htmlEscaped().text).toBe('&lt;b&gt;bold&lt;/b&gt; text');
    });
  });

  describe('fileLinked', function() {
    it('adds atom hyperlinks on files with line numbers', function() {
      var formatter, text;
      text = '# ./foo/bar_spec.rb:123:in `block (3 levels) in <top (required)>';
      formatter = new TextFormatter(text);
      return expect(formatter.fileLinked().text).toBe('# <a href="./foo/bar_spec.rb" ' + 'data-line="123" data-file="./foo/bar_spec.rb">./foo/bar_spec.rb:123</a>' + ':in `block (3 levels) in <top (required)>');
    });
    it('adds links when line number is at the end of line', function() {
      var formatter, text;
      text = './foo/bar_spec.rb:123\n';
      formatter = new TextFormatter(text);
      return expect(formatter.fileLinked().text).toBe('<a href="./foo/bar_spec.rb" ' + 'data-line="123" data-file="./foo/bar_spec.rb">./foo/bar_spec.rb:123</a>\n');
    });
    it('adds links when file paths is wrapped with color marks', function() {
      var formatter, text;
      text = '[31m./foo/bar_spec.rb:123[0m';
      formatter = new TextFormatter(text);
      return expect(formatter.fileLinked().text).toBe('[31m<a href="./foo/bar_spec.rb" ' + 'data-line="123" data-file="./foo/bar_spec.rb">./foo/bar_spec.rb:123</a>[0m');
    });
    return it('adds links when file path is absolute', function() {
      var formatter, text;
      text = '/foo/bar_spec.rb:123';
      formatter = new TextFormatter(text);
      return expect(formatter.fileLinked().text).toBe('<a href="/foo/bar_spec.rb" ' + 'data-line="123" data-file="/foo/bar_spec.rb">/foo/bar_spec.rb:123</a>');
    });
  });

  describe('colorized', function() {
    return it('corretly sets colors to fail/pass marks', function() {
      var formatter;
      formatter = new TextFormatter("[31mF[0m[31mF[0m[31mF[0m[33m*[0m[33m*[0m[31mF[0m");
      return expect(formatter.colorized().text).toBe('<p class="rspec-color tty-31">F</p>' + '<p class="rspec-color tty-31">F</p>' + '<p class="rspec-color tty-31">F</p>' + '<p class="rspec-color tty-33">*</p>' + '<p class="rspec-color tty-33">*</p>' + '<p class="rspec-color tty-31">F</p>');
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3NoYW5ub25iZXJ0dWNjaS8uZG90ZmlsZXMvYXRvbS5zeW1saW5rL3BhY2thZ2VzL3JzcGVjL3NwZWMvdGV4dC1mb3JtYXR0ZXItc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsYUFBQTs7QUFBQSxFQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLHVCQUFSLENBQWhCLENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBLEdBQUE7V0FDdEIsRUFBQSxDQUFHLG1CQUFILEVBQXdCLFNBQUEsR0FBQTtBQUN0QixVQUFBLFNBQUE7QUFBQSxNQUFBLFNBQUEsR0FBZ0IsSUFBQSxhQUFBLENBQWMsa0JBQWQsQ0FBaEIsQ0FBQTthQUNBLE1BQUEsQ0FBTyxTQUFTLENBQUMsV0FBVixDQUFBLENBQXVCLENBQUMsSUFBL0IsQ0FBb0MsQ0FBQyxJQUFyQyxDQUEwQyw4QkFBMUMsRUFGc0I7SUFBQSxDQUF4QixFQURzQjtFQUFBLENBQXhCLENBRkEsQ0FBQTs7QUFBQSxFQU9BLFFBQUEsQ0FBUyxZQUFULEVBQXVCLFNBQUEsR0FBQTtBQUNyQixJQUFBLEVBQUEsQ0FBRyxpREFBSCxFQUFzRCxTQUFBLEdBQUE7QUFDcEQsVUFBQSxlQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sa0VBQVAsQ0FBQTtBQUFBLE1BQ0EsU0FBQSxHQUFnQixJQUFBLGFBQUEsQ0FBYyxJQUFkLENBRGhCLENBQUE7YUFFQSxNQUFBLENBQU8sU0FBUyxDQUFDLFVBQVYsQ0FBQSxDQUFzQixDQUFDLElBQTlCLENBQW1DLENBQUMsSUFBcEMsQ0FBeUMsZ0NBQUEsR0FDdkMseUVBRHVDLEdBRXZDLDJDQUZGLEVBSG9EO0lBQUEsQ0FBdEQsQ0FBQSxDQUFBO0FBQUEsSUFRQSxFQUFBLENBQUcsbURBQUgsRUFBd0QsU0FBQSxHQUFBO0FBQ3RELFVBQUEsZUFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLHlCQUFQLENBQUE7QUFBQSxNQUNBLFNBQUEsR0FBZ0IsSUFBQSxhQUFBLENBQWMsSUFBZCxDQURoQixDQUFBO2FBRUEsTUFBQSxDQUFPLFNBQVMsQ0FBQyxVQUFWLENBQUEsQ0FBc0IsQ0FBQyxJQUE5QixDQUFtQyxDQUFDLElBQXBDLENBQXlDLDhCQUFBLEdBQ3ZDLDJFQURGLEVBSHNEO0lBQUEsQ0FBeEQsQ0FSQSxDQUFBO0FBQUEsSUFjQSxFQUFBLENBQUcsd0RBQUgsRUFBNkQsU0FBQSxHQUFBO0FBQzNELFVBQUEsZUFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLDhCQUFQLENBQUE7QUFBQSxNQUNBLFNBQUEsR0FBZ0IsSUFBQSxhQUFBLENBQWMsSUFBZCxDQURoQixDQUFBO2FBRUEsTUFBQSxDQUFPLFNBQVMsQ0FBQyxVQUFWLENBQUEsQ0FBc0IsQ0FBQyxJQUE5QixDQUFtQyxDQUFDLElBQXBDLENBQXlDLGtDQUFBLEdBQ3ZDLDRFQURGLEVBSDJEO0lBQUEsQ0FBN0QsQ0FkQSxDQUFBO1dBb0JBLEVBQUEsQ0FBRyx1Q0FBSCxFQUE0QyxTQUFBLEdBQUE7QUFDMUMsVUFBQSxlQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sc0JBQVAsQ0FBQTtBQUFBLE1BQ0EsU0FBQSxHQUFnQixJQUFBLGFBQUEsQ0FBYyxJQUFkLENBRGhCLENBQUE7YUFFQSxNQUFBLENBQU8sU0FBUyxDQUFDLFVBQVYsQ0FBQSxDQUFzQixDQUFDLElBQTlCLENBQW1DLENBQUMsSUFBcEMsQ0FBeUMsNkJBQUEsR0FDdkMsdUVBREYsRUFIMEM7SUFBQSxDQUE1QyxFQXJCcUI7RUFBQSxDQUF2QixDQVBBLENBQUE7O0FBQUEsRUFrQ0EsUUFBQSxDQUFTLFdBQVQsRUFBc0IsU0FBQSxHQUFBO1dBQ3BCLEVBQUEsQ0FBRyx5Q0FBSCxFQUE4QyxTQUFBLEdBQUE7QUFDNUMsVUFBQSxTQUFBO0FBQUEsTUFBQSxTQUFBLEdBQWdCLElBQUEsYUFBQSxDQUFjLGtEQUFkLENBQWhCLENBQUE7YUFDQSxNQUFBLENBQU8sU0FBUyxDQUFDLFNBQVYsQ0FBQSxDQUFxQixDQUFDLElBQTdCLENBQWtDLENBQUMsSUFBbkMsQ0FDRSxxQ0FBQSxHQUNBLHFDQURBLEdBRUEscUNBRkEsR0FHQSxxQ0FIQSxHQUlBLHFDQUpBLEdBS0EscUNBTkYsRUFGNEM7SUFBQSxDQUE5QyxFQURvQjtFQUFBLENBQXRCLENBbENBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/shannonbertucci/.dotfiles/atom.symlink/packages/rspec/spec/text-formatter-spec.coffee
