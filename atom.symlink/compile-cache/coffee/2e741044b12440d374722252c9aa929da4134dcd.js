(function() {
  var $;

  $ = require('atom').$;

  module.exports = {
    configDefaults: {
      includeStagedDiff: true,
      openInPane: true,
      splitPane: 'right',
      wordDiff: true,
      amountOfCommitsToShow: 25,
      gitPath: 'git'
    },
    activate: function(state) {
      var GitAdd, GitAddAllAndCommit, GitAddAndCommit, GitCommit, GitDiff, GitDiffAll, GitLog, GitPaletteView, GitPull, GitPush, GitStatus;
      GitAdd = require('./models/git-add');
      GitAddAllAndCommit = require('./models/git-add-all-and-commit');
      GitAddAndCommit = require('./models/git-add-and-commit');
      GitCommit = require('./models/git-commit');
      GitDiff = require('./models/git-diff');
      GitDiffAll = require('./models/git-diff-all');
      GitLog = require('./models/git-log');
      GitPaletteView = require('./views/git-palette-view');
      GitStatus = require('./models/git-status');
      GitPush = require('./models/git-push');
      GitPull = require('./models/git-pull');
      atom.workspaceView.command('git-plus:menu', function() {
        return new GitPaletteView();
      });
      $(window).on('git-plus:add', function() {
        return GitAdd();
      });
      $(window).on('git-plus:add-all-and-commit', function() {
        return GitAddAllAndCommit();
      });
      $(window).on('git-plus:add-and-commit', function() {
        return GitAddAndCommit();
      });
      $(window).on('git-plus:commit', function() {
        return new GitCommit();
      });
      $(window).on('git-plus:diff', function() {
        return GitDiff();
      });
      $(window).on('git-plus:diff-all', function() {
        return GitDiffAll();
      });
      $(window).on('git-plus:log', function() {
        return GitLog();
      });
      $(window).on('git-plus:status', function() {
        return GitStatus();
      });
      $(window).on('git-plus:push', function() {
        return GitPush();
      });
      return $(window).on('git-plus:pull', function() {
        return GitPull();
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLENBQUE7O0FBQUEsRUFBQyxJQUFLLE9BQUEsQ0FBUSxNQUFSLEVBQUwsQ0FBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsY0FBQSxFQUNFO0FBQUEsTUFBQSxpQkFBQSxFQUFtQixJQUFuQjtBQUFBLE1BQ0EsVUFBQSxFQUFZLElBRFo7QUFBQSxNQUVBLFNBQUEsRUFBVyxPQUZYO0FBQUEsTUFHQSxRQUFBLEVBQVUsSUFIVjtBQUFBLE1BSUEscUJBQUEsRUFBdUIsRUFKdkI7QUFBQSxNQUtBLE9BQUEsRUFBUyxLQUxUO0tBREY7QUFBQSxJQVFBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTtBQUNSLFVBQUEsZ0lBQUE7QUFBQSxNQUFBLE1BQUEsR0FBcUIsT0FBQSxDQUFRLGtCQUFSLENBQXJCLENBQUE7QUFBQSxNQUNBLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSxpQ0FBUixDQURyQixDQUFBO0FBQUEsTUFFQSxlQUFBLEdBQXFCLE9BQUEsQ0FBUSw2QkFBUixDQUZyQixDQUFBO0FBQUEsTUFHQSxTQUFBLEdBQXFCLE9BQUEsQ0FBUSxxQkFBUixDQUhyQixDQUFBO0FBQUEsTUFJQSxPQUFBLEdBQXFCLE9BQUEsQ0FBUSxtQkFBUixDQUpyQixDQUFBO0FBQUEsTUFLQSxVQUFBLEdBQXFCLE9BQUEsQ0FBUSx1QkFBUixDQUxyQixDQUFBO0FBQUEsTUFNQSxNQUFBLEdBQXFCLE9BQUEsQ0FBUSxrQkFBUixDQU5yQixDQUFBO0FBQUEsTUFPQSxjQUFBLEdBQXFCLE9BQUEsQ0FBUSwwQkFBUixDQVByQixDQUFBO0FBQUEsTUFRQSxTQUFBLEdBQXFCLE9BQUEsQ0FBUSxxQkFBUixDQVJyQixDQUFBO0FBQUEsTUFTQSxPQUFBLEdBQXFCLE9BQUEsQ0FBUSxtQkFBUixDQVRyQixDQUFBO0FBQUEsTUFVQSxPQUFBLEdBQXFCLE9BQUEsQ0FBUSxtQkFBUixDQVZyQixDQUFBO0FBQUEsTUFZQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLGVBQTNCLEVBQTRDLFNBQUEsR0FBQTtlQUFPLElBQUEsY0FBQSxDQUFBLEVBQVA7TUFBQSxDQUE1QyxDQVpBLENBQUE7QUFBQSxNQWVBLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxFQUFWLENBQWEsY0FBYixFQUE0QyxTQUFBLEdBQUE7ZUFBRyxNQUFBLENBQUEsRUFBSDtNQUFBLENBQTVDLENBZkEsQ0FBQTtBQUFBLE1BZ0JBLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxFQUFWLENBQWEsNkJBQWIsRUFBNEMsU0FBQSxHQUFBO2VBQUcsa0JBQUEsQ0FBQSxFQUFIO01BQUEsQ0FBNUMsQ0FoQkEsQ0FBQTtBQUFBLE1BaUJBLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxFQUFWLENBQWEseUJBQWIsRUFBNEMsU0FBQSxHQUFBO2VBQUcsZUFBQSxDQUFBLEVBQUg7TUFBQSxDQUE1QyxDQWpCQSxDQUFBO0FBQUEsTUFrQkEsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEVBQVYsQ0FBYSxpQkFBYixFQUE0QyxTQUFBLEdBQUE7ZUFBTyxJQUFBLFNBQUEsQ0FBQSxFQUFQO01BQUEsQ0FBNUMsQ0FsQkEsQ0FBQTtBQUFBLE1BbUJBLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxFQUFWLENBQWEsZUFBYixFQUE0QyxTQUFBLEdBQUE7ZUFBRyxPQUFBLENBQUEsRUFBSDtNQUFBLENBQTVDLENBbkJBLENBQUE7QUFBQSxNQW9CQSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsRUFBVixDQUFhLG1CQUFiLEVBQTRDLFNBQUEsR0FBQTtlQUFHLFVBQUEsQ0FBQSxFQUFIO01BQUEsQ0FBNUMsQ0FwQkEsQ0FBQTtBQUFBLE1BcUJBLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxFQUFWLENBQWEsY0FBYixFQUE0QyxTQUFBLEdBQUE7ZUFBRyxNQUFBLENBQUEsRUFBSDtNQUFBLENBQTVDLENBckJBLENBQUE7QUFBQSxNQXNCQSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsRUFBVixDQUFhLGlCQUFiLEVBQTRDLFNBQUEsR0FBQTtlQUFHLFNBQUEsQ0FBQSxFQUFIO01BQUEsQ0FBNUMsQ0F0QkEsQ0FBQTtBQUFBLE1BdUJBLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxFQUFWLENBQWEsZUFBYixFQUE0QyxTQUFBLEdBQUE7ZUFBRyxPQUFBLENBQUEsRUFBSDtNQUFBLENBQTVDLENBdkJBLENBQUE7YUF3QkEsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEVBQVYsQ0FBYSxlQUFiLEVBQTRDLFNBQUEsR0FBQTtlQUFHLE9BQUEsQ0FBQSxFQUFIO01BQUEsQ0FBNUMsRUF6QlE7SUFBQSxDQVJWO0dBSEYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/shannon/.dotfiles/atom.symlink/packages/git-plus/lib/git-plus.coffee