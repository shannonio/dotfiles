/**
 * For rename (move) files / folders
 * Waiting on https://github.com/atom/tree-view/issues/433
 */
function registerRenameHandling() {
    /** https://atom.io/docs/api/v0.190.0/Project#instance-onDidChangePaths */
    // var renameListener = atom.project.onDidChangePaths(function(projectPaths) {
    //     console.log(arguments);
    //     console.log(projectPaths);
    // });
}
exports.registerRenameHandling = registerRenameHandling;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1VzZXJzL3NoYW5ub25iZXJ0dWNjaS8uZG90ZmlsZXMvYXRvbS5zeW1saW5rL3BhY2thZ2VzL2F0b20tdHlwZXNjcmlwdC9saWIvbWFpbi9hdG9tL2NvbW1hbmRzL21vdmVGaWxlc0hhbmRsaW5nLnRzIiwic291cmNlcyI6WyIvVXNlcnMvc2hhbm5vbmJlcnR1Y2NpLy5kb3RmaWxlcy9hdG9tLnN5bWxpbmsvcGFja2FnZXMvYXRvbS10eXBlc2NyaXB0L2xpYi9tYWluL2F0b20vY29tbWFuZHMvbW92ZUZpbGVzSGFuZGxpbmcudHMiXSwibmFtZXMiOlsicmVnaXN0ZXJSZW5hbWVIYW5kbGluZyJdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsU0FBZ0Isc0JBQXNCO0lBQ2xDQSwwRUFBMEVBO0lBQzFFQSw4RUFBOEVBO0lBQzlFQSw4QkFBOEJBO0lBQzlCQSxpQ0FBaUNBO0lBQ2pDQSxNQUFNQTtBQUNWQSxDQUFDQTtBQU5lLDhCQUFzQixHQUF0QixzQkFNZixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBGb3IgcmVuYW1lIChtb3ZlKSBmaWxlcyAvIGZvbGRlcnNcbiAqIFdhaXRpbmcgb24gaHR0cHM6Ly9naXRodWIuY29tL2F0b20vdHJlZS12aWV3L2lzc3Vlcy80MzNcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJSZW5hbWVIYW5kbGluZygpIHtcbiAgICAvKiogaHR0cHM6Ly9hdG9tLmlvL2RvY3MvYXBpL3YwLjE5MC4wL1Byb2plY3QjaW5zdGFuY2Utb25EaWRDaGFuZ2VQYXRocyAqL1xuICAgIC8vIHZhciByZW5hbWVMaXN0ZW5lciA9IGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKGZ1bmN0aW9uKHByb2plY3RQYXRocykge1xuICAgIC8vICAgICBjb25zb2xlLmxvZyhhcmd1bWVudHMpO1xuICAgIC8vICAgICBjb25zb2xlLmxvZyhwcm9qZWN0UGF0aHMpO1xuICAgIC8vIH0pO1xufVxuIl19
//# sourceURL=/Users/shannonbertucci/.dotfiles/atom.symlink/packages/atom-typescript/lib/main/atom/commands/moveFilesHandling.ts
