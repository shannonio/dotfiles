function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libAtomLiveServer = require('../lib/atom-live-server');

var _libAtomLiveServer2 = _interopRequireDefault(_libAtomLiveServer);

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

'use babel';

describe('AtomLiveServer', function () {
  var workspaceElement = undefined,
      activationPromise = undefined;

  beforeEach(function () {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('atom-live-server');
  });

  describe('when the atom-live-server:toggle event is triggered', function () {
    it('hides and shows the modal panel', function () {
      // Before the activation event the view is not on the DOM, and no panel
      // has been created
      expect(workspaceElement.querySelector('.atom-live-server')).not.toExist();

      // This is an activation event, triggering it will cause the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'atom-live-server:toggle');

      waitsForPromise(function () {
        return activationPromise;
      });

      runs(function () {
        expect(workspaceElement.querySelector('.atom-live-server')).toExist();

        var atomLiveServerElement = workspaceElement.querySelector('.atom-live-server');
        expect(atomLiveServerElement).toExist();

        var atomLiveServerPanel = atom.workspace.panelForItem(atomLiveServerElement);
        expect(atomLiveServerPanel.isVisible()).toBe(true);
        atom.commands.dispatch(workspaceElement, 'atom-live-server:toggle');
        expect(atomLiveServerPanel.isVisible()).toBe(false);
      });
    });

    it('hides and shows the view', function () {
      // This test shows you an integration test testing at the view level.

      // Attaching the workspaceElement to the DOM is required to allow the
      // `toBeVisible()` matchers to work. Anything testing visibility or focus
      // requires that the workspaceElement is on the DOM. Tests that attach the
      // workspaceElement to the DOM are generally slower than those off DOM.
      jasmine.attachToDOM(workspaceElement);

      expect(workspaceElement.querySelector('.atom-live-server')).not.toExist();

      // This is an activation event, triggering it causes the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'atom-live-server:toggle');

      waitsForPromise(function () {
        return activationPromise;
      });

      runs(function () {
        // Now we can test for view visibility
        var atomLiveServerElement = workspaceElement.querySelector('.atom-live-server');
        expect(atomLiveServerElement).toBeVisible();
        atom.commands.dispatch(workspaceElement, 'atom-live-server:toggle');
        expect(atomLiveServerElement).not.toBeVisible();
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmF0b20vcGFja2FnZXMvYXRvbS1saXZlLXNlcnZlci9zcGVjL2F0b20tbGl2ZS1zZXJ2ZXItc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztpQ0FFMkIseUJBQXlCOzs7Ozs7Ozs7QUFGcEQsV0FBVyxDQUFDOztBQVNaLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxZQUFNO0FBQy9CLE1BQUksZ0JBQWdCLFlBQUE7TUFBRSxpQkFBaUIsWUFBQSxDQUFDOztBQUV4QyxZQUFVLENBQUMsWUFBTTtBQUNmLG9CQUFnQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN0RCxxQkFBaUIsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0dBQ3ZFLENBQUMsQ0FBQzs7QUFFSCxVQUFRLENBQUMscURBQXFELEVBQUUsWUFBTTtBQUNwRSxNQUFFLENBQUMsaUNBQWlDLEVBQUUsWUFBTTs7O0FBRzFDLFlBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7OztBQUkxRSxVQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDOztBQUVwRSxxQkFBZSxDQUFDLFlBQU07QUFDcEIsZUFBTyxpQkFBaUIsQ0FBQztPQUMxQixDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLFlBQU07QUFDVCxjQUFNLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFdEUsWUFBSSxxQkFBcUIsR0FBRyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNoRixjQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFeEMsWUFBSSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQzdFLGNBQU0sQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuRCxZQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO0FBQ3BFLGNBQU0sQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUNyRCxDQUFDLENBQUM7S0FDSixDQUFDLENBQUM7O0FBRUgsTUFBRSxDQUFDLDBCQUEwQixFQUFFLFlBQU07Ozs7Ozs7QUFPbkMsYUFBTyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOztBQUV0QyxZQUFNLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7Ozs7QUFJMUUsVUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUseUJBQXlCLENBQUMsQ0FBQzs7QUFFcEUscUJBQWUsQ0FBQyxZQUFNO0FBQ3BCLGVBQU8saUJBQWlCLENBQUM7T0FDMUIsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxZQUFNOztBQUVULFlBQUkscUJBQXFCLEdBQUcsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDaEYsY0FBTSxDQUFDLHFCQUFxQixDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDNUMsWUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUseUJBQXlCLENBQUMsQ0FBQztBQUNwRSxjQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7T0FDakQsQ0FBQyxDQUFDO0tBQ0osQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDO0NBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6Ii9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmF0b20vcGFja2FnZXMvYXRvbS1saXZlLXNlcnZlci9zcGVjL2F0b20tbGl2ZS1zZXJ2ZXItc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgQXRvbUxpdmVTZXJ2ZXIgZnJvbSAnLi4vbGliL2F0b20tbGl2ZS1zZXJ2ZXInO1xuXG4vLyBVc2UgdGhlIGNvbW1hbmQgYHdpbmRvdzpydW4tcGFja2FnZS1zcGVjc2AgKGNtZC1hbHQtY3RybC1wKSB0byBydW4gc3BlY3MuXG4vL1xuLy8gVG8gcnVuIGEgc3BlY2lmaWMgYGl0YCBvciBgZGVzY3JpYmVgIGJsb2NrIGFkZCBhbiBgZmAgdG8gdGhlIGZyb250IChlLmcuIGBmaXRgXG4vLyBvciBgZmRlc2NyaWJlYCkuIFJlbW92ZSB0aGUgYGZgIHRvIHVuZm9jdXMgdGhlIGJsb2NrLlxuXG5kZXNjcmliZSgnQXRvbUxpdmVTZXJ2ZXInLCAoKSA9PiB7XG4gIGxldCB3b3Jrc3BhY2VFbGVtZW50LCBhY3RpdmF0aW9uUHJvbWlzZTtcblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKTtcbiAgICBhY3RpdmF0aW9uUHJvbWlzZSA9IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdhdG9tLWxpdmUtc2VydmVyJyk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd3aGVuIHRoZSBhdG9tLWxpdmUtc2VydmVyOnRvZ2dsZSBldmVudCBpcyB0cmlnZ2VyZWQnLCAoKSA9PiB7XG4gICAgaXQoJ2hpZGVzIGFuZCBzaG93cyB0aGUgbW9kYWwgcGFuZWwnLCAoKSA9PiB7XG4gICAgICAvLyBCZWZvcmUgdGhlIGFjdGl2YXRpb24gZXZlbnQgdGhlIHZpZXcgaXMgbm90IG9uIHRoZSBET00sIGFuZCBubyBwYW5lbFxuICAgICAgLy8gaGFzIGJlZW4gY3JlYXRlZFxuICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmF0b20tbGl2ZS1zZXJ2ZXInKSkubm90LnRvRXhpc3QoKTtcblxuICAgICAgLy8gVGhpcyBpcyBhbiBhY3RpdmF0aW9uIGV2ZW50LCB0cmlnZ2VyaW5nIGl0IHdpbGwgY2F1c2UgdGhlIHBhY2thZ2UgdG8gYmVcbiAgICAgIC8vIGFjdGl2YXRlZC5cbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2F0b20tbGl2ZS1zZXJ2ZXI6dG9nZ2xlJyk7XG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgIHJldHVybiBhY3RpdmF0aW9uUHJvbWlzZTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmF0b20tbGl2ZS1zZXJ2ZXInKSkudG9FeGlzdCgpO1xuXG4gICAgICAgIGxldCBhdG9tTGl2ZVNlcnZlckVsZW1lbnQgPSB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hdG9tLWxpdmUtc2VydmVyJyk7XG4gICAgICAgIGV4cGVjdChhdG9tTGl2ZVNlcnZlckVsZW1lbnQpLnRvRXhpc3QoKTtcblxuICAgICAgICBsZXQgYXRvbUxpdmVTZXJ2ZXJQYW5lbCA9IGF0b20ud29ya3NwYWNlLnBhbmVsRm9ySXRlbShhdG9tTGl2ZVNlcnZlckVsZW1lbnQpO1xuICAgICAgICBleHBlY3QoYXRvbUxpdmVTZXJ2ZXJQYW5lbC5pc1Zpc2libGUoKSkudG9CZSh0cnVlKTtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYXRvbS1saXZlLXNlcnZlcjp0b2dnbGUnKTtcbiAgICAgICAgZXhwZWN0KGF0b21MaXZlU2VydmVyUGFuZWwuaXNWaXNpYmxlKCkpLnRvQmUoZmFsc2UpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnaGlkZXMgYW5kIHNob3dzIHRoZSB2aWV3JywgKCkgPT4ge1xuICAgICAgLy8gVGhpcyB0ZXN0IHNob3dzIHlvdSBhbiBpbnRlZ3JhdGlvbiB0ZXN0IHRlc3RpbmcgYXQgdGhlIHZpZXcgbGV2ZWwuXG5cbiAgICAgIC8vIEF0dGFjaGluZyB0aGUgd29ya3NwYWNlRWxlbWVudCB0byB0aGUgRE9NIGlzIHJlcXVpcmVkIHRvIGFsbG93IHRoZVxuICAgICAgLy8gYHRvQmVWaXNpYmxlKClgIG1hdGNoZXJzIHRvIHdvcmsuIEFueXRoaW5nIHRlc3RpbmcgdmlzaWJpbGl0eSBvciBmb2N1c1xuICAgICAgLy8gcmVxdWlyZXMgdGhhdCB0aGUgd29ya3NwYWNlRWxlbWVudCBpcyBvbiB0aGUgRE9NLiBUZXN0cyB0aGF0IGF0dGFjaCB0aGVcbiAgICAgIC8vIHdvcmtzcGFjZUVsZW1lbnQgdG8gdGhlIERPTSBhcmUgZ2VuZXJhbGx5IHNsb3dlciB0aGFuIHRob3NlIG9mZiBET00uXG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKHdvcmtzcGFjZUVsZW1lbnQpO1xuXG4gICAgICBleHBlY3Qod29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYXRvbS1saXZlLXNlcnZlcicpKS5ub3QudG9FeGlzdCgpO1xuXG4gICAgICAvLyBUaGlzIGlzIGFuIGFjdGl2YXRpb24gZXZlbnQsIHRyaWdnZXJpbmcgaXQgY2F1c2VzIHRoZSBwYWNrYWdlIHRvIGJlXG4gICAgICAvLyBhY3RpdmF0ZWQuXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdhdG9tLWxpdmUtc2VydmVyOnRvZ2dsZScpO1xuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gYWN0aXZhdGlvblByb21pc2U7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIC8vIE5vdyB3ZSBjYW4gdGVzdCBmb3IgdmlldyB2aXNpYmlsaXR5XG4gICAgICAgIGxldCBhdG9tTGl2ZVNlcnZlckVsZW1lbnQgPSB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hdG9tLWxpdmUtc2VydmVyJyk7XG4gICAgICAgIGV4cGVjdChhdG9tTGl2ZVNlcnZlckVsZW1lbnQpLnRvQmVWaXNpYmxlKCk7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2F0b20tbGl2ZS1zZXJ2ZXI6dG9nZ2xlJyk7XG4gICAgICAgIGV4cGVjdChhdG9tTGl2ZVNlcnZlckVsZW1lbnQpLm5vdC50b0JlVmlzaWJsZSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iXX0=