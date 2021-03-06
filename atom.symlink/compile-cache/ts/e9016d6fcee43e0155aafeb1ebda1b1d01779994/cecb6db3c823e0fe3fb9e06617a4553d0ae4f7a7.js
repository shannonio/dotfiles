var mainPanelView = require('./views/mainPanelView');
var lineMessageView = require('./views/lineMessageView');
var gotoHistory = require('./gotoHistory');
function getTitle(errorCount) {
    var title = '<span class="icon-circuit-board"></span> TypeScript Build';
    if (errorCount > 0) {
        title = title + (" (\n            <span class=\"text-highlight\" style=\"font-weight: bold\"> " + errorCount + " </span>\n            <span class=\"text-error\" style=\"font-weight: bold;\"> error" + (errorCount === 1 ? "" : "s") + " </span>\n        )");
    }
    return title;
}
function setBuildOutput(buildOutput) {
    mainPanelView.panelView.clearBuild();
    if (buildOutput.counts.errors) {
        mainPanelView.panelView.setBuildPanelCount(buildOutput.counts.errors);
    }
    else {
        mainPanelView.panelView.setBuildPanelCount(0);
    }
    // Update the errors list for goto history
    gotoHistory.buildOutput.members = [];
    buildOutput.outputs.forEach(function (output) {
        if (output.success) {
            return;
        }
        output.errors.forEach(function (error) {
            mainPanelView.panelView.addBuild(new lineMessageView.LineMessageView({
                goToLine: function (filePath, line, col) { return gotoHistory.gotoLine(filePath, line, col, gotoHistory.buildOutput); },
                message: error.message,
                line: error.startPos.line + 1,
                col: error.startPos.col,
                file: error.filePath,
                preview: error.preview
            }));
            // Update the errors list for goto history
            gotoHistory.buildOutput.members.push({ filePath: error.filePath, line: error.startPos.line + 1, col: error.startPos.col });
        });
    });
    if (!buildOutput.counts.errors) {
        atom.notifications.addSuccess("Build success");
    }
    else if (buildOutput.counts.emitErrors) {
        atom.notifications.addError("Emits errors: " + buildOutput.counts.emitErrors + " files.");
    }
    else {
        atom.notifications.addWarning('Compile failed but emit succeeded');
    }
}
exports.setBuildOutput = setBuildOutput;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1VzZXJzL3NoYW5ub25iZXJ0dWNjaS8uZG90ZmlsZXMvYXRvbS5zeW1saW5rL3BhY2thZ2VzL2F0b20tdHlwZXNjcmlwdC9saWIvbWFpbi9hdG9tL2J1aWxkVmlldy50cyIsInNvdXJjZXMiOlsiL1VzZXJzL3NoYW5ub25iZXJ0dWNjaS8uZG90ZmlsZXMvYXRvbS5zeW1saW5rL3BhY2thZ2VzL2F0b20tdHlwZXNjcmlwdC9saWIvbWFpbi9hdG9tL2J1aWxkVmlldy50cyJdLCJuYW1lcyI6WyJnZXRUaXRsZSIsInNldEJ1aWxkT3V0cHV0Il0sIm1hcHBpbmdzIjoiQUFTQSxJQUFPLGFBQWEsV0FBVyx1QkFBdUIsQ0FBQyxDQUFDO0FBQ3hELElBQU8sZUFBZSxXQUFXLHlCQUF5QixDQUFDLENBQUM7QUFDNUQsSUFBTyxXQUFXLFdBQVcsZUFBZSxDQUFDLENBQUM7QUFFOUMsU0FBUyxRQUFRLENBQUMsVUFBa0I7SUFDaENBLElBQUlBLEtBQUtBLEdBQUdBLDJEQUEyREEsQ0FBQ0E7SUFDeEVBLEVBQUVBLENBQUNBLENBQUNBLFVBQVVBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ2pCQSxLQUFLQSxHQUFHQSxLQUFLQSxHQUFHQSxrRkFDOENBLFVBQVVBLDZGQUNSQSxVQUFVQSxLQUFLQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxHQUFHQSwwQkFDekZBLENBQUNBO0lBQ1BBLENBQUNBO0lBQ0RBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO0FBQ2pCQSxDQUFDQTtBQUdELFNBQWdCLGNBQWMsQ0FBQyxXQUF3QjtJQUVuREMsYUFBYUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0E7SUFFckNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1FBQzVCQSxhQUFhQSxDQUFDQSxTQUFTQSxDQUFDQSxrQkFBa0JBLENBQUNBLFdBQVdBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0lBQzFFQSxDQUFDQTtJQUNEQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNGQSxhQUFhQSxDQUFDQSxTQUFTQSxDQUFDQSxrQkFBa0JBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ2xEQSxDQUFDQTtJQUdEQSxBQURBQSwwQ0FBMENBO0lBQzFDQSxXQUFXQSxDQUFDQSxXQUFXQSxDQUFDQSxPQUFPQSxHQUFHQSxFQUFFQSxDQUFDQTtJQUVyQ0EsV0FBV0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBQUEsTUFBTUE7UUFDOUJBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO1lBQ2pCQSxNQUFNQSxDQUFDQTtRQUNYQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFBQSxLQUFLQTtZQUN2QkEsYUFBYUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsZUFBZUEsQ0FBQ0EsZUFBZUEsQ0FBQ0E7Z0JBQ2pFQSxRQUFRQSxFQUFFQSxVQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQSxJQUFLQSxPQUFBQSxXQUFXQSxDQUFDQSxRQUFRQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxXQUFXQSxDQUFDQSxXQUFXQSxDQUFDQSxFQUFsRUEsQ0FBa0VBO2dCQUNyR0EsT0FBT0EsRUFBRUEsS0FBS0EsQ0FBQ0EsT0FBT0E7Z0JBQ3RCQSxJQUFJQSxFQUFFQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQTtnQkFDN0JBLEdBQUdBLEVBQUVBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLEdBQUdBO2dCQUN2QkEsSUFBSUEsRUFBRUEsS0FBS0EsQ0FBQ0EsUUFBUUE7Z0JBQ3BCQSxPQUFPQSxFQUFFQSxLQUFLQSxDQUFDQSxPQUFPQTthQUN6QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFFSkEsQUFEQUEsMENBQTBDQTtZQUMxQ0EsV0FBV0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsUUFBUUEsRUFBRUEsS0FBS0EsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsRUFBRUEsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsRUFBRUEsR0FBR0EsRUFBRUEsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDL0hBLENBQUNBLENBQUNBLENBQUNBO0lBQ1BBLENBQUNBLENBQUNBLENBQUNBO0lBRUhBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1FBQzdCQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxVQUFVQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQTtJQUNuREEsQ0FBQ0E7SUFDREEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDckNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLFFBQVFBLENBQUNBLGdCQUFnQkEsR0FBR0EsV0FBV0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsVUFBVUEsR0FBR0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7SUFDOUZBLENBQUNBO0lBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ0pBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLFVBQVVBLENBQUNBLG1DQUFtQ0EsQ0FBQ0EsQ0FBQ0E7SUFDdkVBLENBQUNBO0FBQ0xBLENBQUNBO0FBeENlLHNCQUFjLEdBQWQsY0F3Q2YsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4vLy90czppbXBvcnQ9dXRpbHNcbmltcG9ydCB1dGlscyA9IHJlcXVpcmUoJy4uL2xhbmcvdXRpbHMnKTsgLy8vdHM6aW1wb3J0OmdlbmVyYXRlZFxuLy8vdHM6aW1wb3J0PXByb2plY3RcbmltcG9ydCBwcm9qZWN0ID0gcmVxdWlyZSgnLi4vbGFuZy9jb3JlL3Byb2plY3QnKTsgLy8vdHM6aW1wb3J0OmdlbmVyYXRlZFxuXG5pbXBvcnQgb3MgPSByZXF1aXJlKCdvcycpXG5cbmltcG9ydCBtYWluUGFuZWxWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9tYWluUGFuZWxWaWV3Jyk7XG5pbXBvcnQgbGluZU1lc3NhZ2VWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9saW5lTWVzc2FnZVZpZXcnKTtcbmltcG9ydCBnb3RvSGlzdG9yeSA9IHJlcXVpcmUoJy4vZ290b0hpc3RvcnknKTtcblxuZnVuY3Rpb24gZ2V0VGl0bGUoZXJyb3JDb3VudDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICB2YXIgdGl0bGUgPSAnPHNwYW4gY2xhc3M9XCJpY29uLWNpcmN1aXQtYm9hcmRcIj48L3NwYW4+IFR5cGVTY3JpcHQgQnVpbGQnO1xuICAgIGlmIChlcnJvckNvdW50ID4gMCkge1xuICAgICAgICB0aXRsZSA9IHRpdGxlICsgYCAoXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQtaGlnaGxpZ2h0XCIgc3R5bGU9XCJmb250LXdlaWdodDogYm9sZFwiPiAke2Vycm9yQ291bnR9IDwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC1lcnJvclwiIHN0eWxlPVwiZm9udC13ZWlnaHQ6IGJvbGQ7XCI+IGVycm9yJHtlcnJvckNvdW50ID09PSAxID8gXCJcIiA6IFwic1wifSA8L3NwYW4+XG4gICAgICAgIClgO1xuICAgIH1cbiAgICByZXR1cm4gdGl0bGU7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEJ1aWxkT3V0cHV0KGJ1aWxkT3V0cHV0OiBCdWlsZE91dHB1dCkge1xuXG4gICAgbWFpblBhbmVsVmlldy5wYW5lbFZpZXcuY2xlYXJCdWlsZCgpO1xuXG4gICAgaWYgKGJ1aWxkT3V0cHV0LmNvdW50cy5lcnJvcnMpIHtcbiAgICAgICAgbWFpblBhbmVsVmlldy5wYW5lbFZpZXcuc2V0QnVpbGRQYW5lbENvdW50KGJ1aWxkT3V0cHV0LmNvdW50cy5lcnJvcnMpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbWFpblBhbmVsVmlldy5wYW5lbFZpZXcuc2V0QnVpbGRQYW5lbENvdW50KDApO1xuICAgIH1cbiAgICBcbiAgICAvLyBVcGRhdGUgdGhlIGVycm9ycyBsaXN0IGZvciBnb3RvIGhpc3RvcnlcbiAgICBnb3RvSGlzdG9yeS5idWlsZE91dHB1dC5tZW1iZXJzID0gW107XG5cbiAgICBidWlsZE91dHB1dC5vdXRwdXRzLmZvckVhY2gob3V0cHV0ID0+IHtcbiAgICAgICAgaWYgKG91dHB1dC5zdWNjZXNzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgb3V0cHV0LmVycm9ycy5mb3JFYWNoKGVycm9yID0+IHtcbiAgICAgICAgICAgIG1haW5QYW5lbFZpZXcucGFuZWxWaWV3LmFkZEJ1aWxkKG5ldyBsaW5lTWVzc2FnZVZpZXcuTGluZU1lc3NhZ2VWaWV3KHtcbiAgICAgICAgICAgICAgICBnb1RvTGluZTogKGZpbGVQYXRoLCBsaW5lLCBjb2wpID0+IGdvdG9IaXN0b3J5LmdvdG9MaW5lKGZpbGVQYXRoLCBsaW5lLCBjb2wsIGdvdG9IaXN0b3J5LmJ1aWxkT3V0cHV0KSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIGxpbmU6IGVycm9yLnN0YXJ0UG9zLmxpbmUgKyAxLFxuICAgICAgICAgICAgICAgIGNvbDogZXJyb3Iuc3RhcnRQb3MuY29sLFxuICAgICAgICAgICAgICAgIGZpbGU6IGVycm9yLmZpbGVQYXRoLFxuICAgICAgICAgICAgICAgIHByZXZpZXc6IGVycm9yLnByZXZpZXdcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgZXJyb3JzIGxpc3QgZm9yIGdvdG8gaGlzdG9yeVxuICAgICAgICAgICAgZ290b0hpc3RvcnkuYnVpbGRPdXRwdXQubWVtYmVycy5wdXNoKHsgZmlsZVBhdGg6IGVycm9yLmZpbGVQYXRoLCBsaW5lOiBlcnJvci5zdGFydFBvcy5saW5lICsgMSwgY29sOiBlcnJvci5zdGFydFBvcy5jb2wgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaWYgKCFidWlsZE91dHB1dC5jb3VudHMuZXJyb3JzKSB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKFwiQnVpbGQgc3VjY2Vzc1wiKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoYnVpbGRPdXRwdXQuY291bnRzLmVtaXRFcnJvcnMpIHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFwiRW1pdHMgZXJyb3JzOiBcIiArIGJ1aWxkT3V0cHV0LmNvdW50cy5lbWl0RXJyb3JzICsgXCIgZmlsZXMuXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdDb21waWxlIGZhaWxlZCBidXQgZW1pdCBzdWNjZWVkZWQnKTtcbiAgICB9XG59XG4iXX0=
//# sourceURL=/Users/shannonbertucci/.dotfiles/atom.symlink/packages/atom-typescript/lib/main/atom/buildView.ts
