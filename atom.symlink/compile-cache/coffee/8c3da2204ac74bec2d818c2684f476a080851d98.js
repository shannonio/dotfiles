(function() {
  var $, BreadcrumbView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  $ = View.__super__.constructor;

  module.exports = BreadcrumbView = (function(_super) {
    __extends(BreadcrumbView, _super);

    function BreadcrumbView() {
      this.treeViewScrolled = __bind(this.treeViewScrolled, this);
      return BreadcrumbView.__super__.constructor.apply(this, arguments);
    }

    BreadcrumbView.content = function() {
      return this.div({
        "class": 'tree-view-breadcrumb tool-panel'
      }, (function(_this) {
        return function() {
          return _this.div({
            outlet: 'breadcrumb',
            "class": 'btn-group'
          }, function() {
            return _this.div({
              "class": 'btn'
            }, atom.project.getPath().split('/').pop());
          });
        };
      })(this));
    };

    BreadcrumbView.prototype.lastFirstVisibleTreeItem = null;

    BreadcrumbView.prototype.lastParent = null;

    BreadcrumbView.prototype.initialize = function(state) {
      var pollTreeView;
      pollTreeView = (function(_this) {
        return function() {
          _this.treeView = require(atom.packages.getLoadedPackage('tree-view').path).treeView;
          if (_this.treeView != null) {
            _this.treeViewScroller = _this.treeView.find('.tree-view-scroller');
            _this.treeViewScroller.on('scroll', _this.treeViewScrolled);
            _this.treeViewScrolled();
            return _this.breadcrumb.on('click', '.btn', function(e) {
              var item, target;
              target = $(e.target).data('target');
              item = _this.treeView.find("[data-path='" + target + "']");
              return _this.scrollToItem(_this.treeView.find("[data-path='" + target + "']"));
            });
          } else {
            return setTimeout(pollTreeView, 100);
          }
        };
      })(this);
      return pollTreeView();
    };

    BreadcrumbView.prototype.show = function() {
      this.attach();
      this.treeView.addClass('with-breadcrumb');
      return this.addClass('visible');
    };

    BreadcrumbView.prototype.hide = function() {
      this.removeClass('visible');
      this.treeView.removeClass('with-breadcrumb');
      return setTimeout(((function(_this) {
        return function() {
          return _this.detach();
        };
      })(this)), 300);
    };

    BreadcrumbView.prototype.attach = function() {
      atom.workspaceView.find('.tree-view-resizer').prepend(this);
      return this.attached = true;
    };

    BreadcrumbView.prototype.detach = function() {
      BreadcrumbView.__super__.detach.apply(this, arguments);
      return this.attached = false;
    };

    BreadcrumbView.prototype.destroy = function() {
      return this.detach();
    };

    BreadcrumbView.prototype.updateBreadcrumb = function(node) {
      var html, n, parents, path, _i, _len, _ref;
      node = $(node);
      html = [];
      parents = [];
      _ref = node.parents('.directory');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        parents.unshift(n);
      }
      parents.shift();
      path = [];
      parents.forEach(function(node, i) {
        var cls, label;
        label = $(node).children('.header').text();
        path.push(label);
        cls = 'btn';
        if (i === parents.length - 1) {
          cls += ' btn-primary';
        }
        return html.push("<div class='" + cls + "' data-target='" + (path.join('/')) + "'>\n  " + label + "\n</div>");
      });
      this.breadcrumb.html(html.join(''));
      if (atom.config.get('tree-view-breadcrumb.scrollToLastItem')) {
        return this.scrollLeft(this.element.scrollWidth);
      }
    };

    BreadcrumbView.prototype.scrollToItem = function(item) {
      var newScroll, oldScroll;
      oldScroll = this.treeView.scrollTop();
      newScroll = item.offset().top + oldScroll - this.breadcrumb.height();
      console.log(newScroll);
      return this.treeView.scrollTop(newScroll);
    };

    BreadcrumbView.prototype.treeViewScrolled = function() {
      var currentFirstVisibleTreeItem, currentParent, scrollTop;
      scrollTop = this.treeView.scrollTop();
      currentFirstVisibleTreeItem = this.firstVisibleTreeItem(scrollTop);
      currentParent = null;
      if ((currentFirstVisibleTreeItem != null) && currentFirstVisibleTreeItem !== this.lastFirstVisibleTreeItem) {
        this.lastFirstVisibleTreeItem = currentFirstVisibleTreeItem;
        currentParent = this.parentHeader(currentFirstVisibleTreeItem);
        if (currentParent !== this.lastParent) {
          this.updateBreadcrumb(currentParent);
          this.lastParent = currentParent;
        }
      }
      if (!this.attached && scrollTop > 0 && !this.breadcrumb.is(':empty')) {
        return this.show();
      } else if (this.attached && (scrollTop === 0 || this.breadcrumb.is(':empty'))) {
        this.lastFirstVisibleTreeItem = null;
        this.lastParent = null;
        return this.hide();
      }
    };

    BreadcrumbView.prototype.getItemHeight = function() {
      return this.treeView.find('.list-item.header').first().height();
    };

    BreadcrumbView.prototype.firstVisibleTreeItem = function(scrollTop) {
      var found, index, itemHeight, self;
      itemHeight = this.getItemHeight();
      index = Math.ceil(scrollTop / itemHeight);
      self = this;
      found = null;
      return this.treeView.find('.list-item.header, .list-item.file')[index];
    };

    BreadcrumbView.prototype.parentHeader = function(node) {
      return $(node).parents('ol').first().parent().children('.header')[0];
    };

    return BreadcrumbView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFdBRG5CLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0oscUNBQUEsQ0FBQTs7Ozs7S0FBQTs7QUFBQSxJQUFBLGNBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLGlDQUFQO09BQUwsRUFBK0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDN0MsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsTUFBQSxFQUFRLFlBQVI7QUFBQSxZQUFzQixPQUFBLEVBQU8sV0FBN0I7V0FBTCxFQUErQyxTQUFBLEdBQUE7bUJBQzdDLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxjQUFBLE9BQUEsRUFBTyxLQUFQO2FBQUwsRUFBbUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFiLENBQUEsQ0FBc0IsQ0FBQyxLQUF2QixDQUE2QixHQUE3QixDQUFpQyxDQUFDLEdBQWxDLENBQUEsQ0FBbkIsRUFENkM7VUFBQSxDQUEvQyxFQUQ2QztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQS9DLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsNkJBS0Esd0JBQUEsR0FBMEIsSUFMMUIsQ0FBQTs7QUFBQSw2QkFNQSxVQUFBLEdBQVksSUFOWixDQUFBOztBQUFBLDZCQVFBLFVBQUEsR0FBWSxTQUFDLEtBQUQsR0FBQTtBQUNWLFVBQUEsWUFBQTtBQUFBLE1BQUEsWUFB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
//# sourceURL=/Users/Shannon/.dotfiles/atom.symlink/packages/tree-view-breadcrumb/lib/breadcrumb-view.coffee