var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var view = require('./view');
var $ = view.$;
var DocumentationView = (function (_super) {
    __extends(DocumentationView, _super);
    function DocumentationView() {
        _super.apply(this, arguments);
        this.shown = false;
    }
    DocumentationView.content = function () {
        var _this = this;
        return this.div({ class: 'atom-ts-documentation padded top' }, function () { return _this.div(function () {
            _this.h2({ outlet: 'header' });
            _this.p({ outlet: 'documentation' });
        }); });
    };
    DocumentationView.prototype.show = function () {
        this.$.addClass('active');
        this.shown = true;
    };
    DocumentationView.prototype.hide = function () {
        this.$.removeClass('active');
        this.shown = false;
    };
    DocumentationView.prototype.toggle = function () {
        if (this.shown) {
            this.hide();
        }
        else {
            this.show();
        }
    };
    DocumentationView.prototype.setContent = function (content) {
        this.header.html(content.display);
        content.documentation = content.documentation.replace(/(?:\r\n|\r|\n)/g, '<br />');
        this.documentation.html(content.documentation);
    };
    DocumentationView.prototype.autoPosition = function () {
        var editor = atom.workspace.getActiveTextEditor();
        var cursor = editor.getCursors()[0];
        var cursorTop = cursor.getPixelRect().top - editor.getScrollTop();
        var editorHeight = editor.getHeight();
        if (editorHeight - cursorTop < 100) {
            this.$.removeClass('bottom');
            this.$.addClass('top');
        }
        else {
            this.$.removeClass('top');
            this.$.addClass('bottom');
        }
    };
    return DocumentationView;
})(view.View);
exports.DocumentationView = DocumentationView;
exports.docView;
function attach() {
    if (exports.docView)
        return;
    exports.docView = new DocumentationView({});
    $(atom.views.getView(atom.workspace)).append(exports.docView.$);
    //    testDocumentationView();
}
exports.attach = attach;
function testDocumentationView() {
    exports.docView.setContent({
        display: "this is awesome",
        documentation: "\n    some docs\n    over\n    many\n    many li\n\n    lines\n    long\n    so\n    long\n    that\n    it\n    should\n\n    start\n    to\n    scroll\n    ",
        filePath: "some filepath"
    });
    exports.docView.show();
}
exports.testDocumentationView = testDocumentationView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1VzZXJzL3NoYW5ub25iZXJ0dWNjaS8uZG90ZmlsZXMvYXRvbS5zeW1saW5rL3BhY2thZ2VzL2F0b20tdHlwZXNjcmlwdC9saWIvbWFpbi9hdG9tL3ZpZXdzL2RvY3VtZW50YXRpb25WaWV3LnRzIiwic291cmNlcyI6WyIvVXNlcnMvc2hhbm5vbmJlcnR1Y2NpLy5kb3RmaWxlcy9hdG9tLnN5bWxpbmsvcGFja2FnZXMvYXRvbS10eXBlc2NyaXB0L2xpYi9tYWluL2F0b20vdmlld3MvZG9jdW1lbnRhdGlvblZpZXcudHMiXSwibmFtZXMiOlsiRG9jdW1lbnRhdGlvblZpZXciLCJEb2N1bWVudGF0aW9uVmlldy5jb25zdHJ1Y3RvciIsIkRvY3VtZW50YXRpb25WaWV3LmNvbnRlbnQiLCJEb2N1bWVudGF0aW9uVmlldy5zaG93IiwiRG9jdW1lbnRhdGlvblZpZXcuaGlkZSIsIkRvY3VtZW50YXRpb25WaWV3LnRvZ2dsZSIsIkRvY3VtZW50YXRpb25WaWV3LnNldENvbnRlbnQiLCJEb2N1bWVudGF0aW9uVmlldy5hdXRvUG9zaXRpb24iLCJhdHRhY2giLCJ0ZXN0RG9jdW1lbnRhdGlvblZpZXciXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQU8sSUFBSSxXQUFXLFFBQVEsQ0FBQyxDQUFDO0FBQ2hDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFFZixJQUFhLGlCQUFpQjtJQUFTQSxVQUExQkEsaUJBQWlCQSxVQUF1QkE7SUFBckRBLFNBQWFBLGlCQUFpQkE7UUFBU0MsOEJBQWNBO1FBZXpDQSxVQUFLQSxHQUFHQSxLQUFLQSxDQUFDQTtJQTBCMUJBLENBQUNBO0lBckNVRCx5QkFBT0EsR0FBZEE7UUFBQUUsaUJBUUNBO1FBUEdBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLEtBQUtBLEVBQUVBLGtDQUFrQ0EsRUFBRUEsRUFDekRBLGNBQU1BLE9BQUFBLEtBQUlBLENBQUNBLEdBQUdBLENBQ1ZBO1lBQ0lBLEtB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ZUFBT0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDcEJBLGVBQU9BLEdBQUdBLElBQUlBLGlCQUFpQkEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7SUFDcENBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLGVBQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ3hEQSw4QkFBOEJBO0FBQ2xDQSxDQUFDQTtBQUxlLGNBQU0sR0FBTixNQUtmLENBQUE7QUFFRCxTQUFnQixxQkFBcUI7SUFDakNDLGVBQU9BLENBQUNBLFVBQVVBLENBQUNBO1FBQ2ZBLE9BQU9BLEVBQUVBLGlCQUFpQkE7UUFBRUEsYUFBYUEsRUFBRUEsZ0tBaUI5Q0E7UUFBRUEsUUFBUUEsRUFBRUEsZUFBZUE7S0FDM0JBLENBQUNBLENBQUNBO0lBQ0hBLGVBQU9BLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO0FBQ25CQSxDQUFDQTtBQXRCZSw2QkFBcUIsR0FBckIscUJBc0JmLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdmlldyA9IHJlcXVpcmUoJy4vdmlldycpO1xudmFyICQgPSB2aWV3LiQ7XG5cbmV4cG9ydCBjbGFzcyBEb2N1bWVudGF0aW9uVmlldyBleHRlbmRzIHZpZXcuVmlldzxhbnk+IHtcblxuICAgIHByaXZhdGUgaGVhZGVyOiBKUXVlcnk7XG4gICAgcHJpdmF0ZSBkb2N1bWVudGF0aW9uOiBKUXVlcnk7XG4gICAgc3RhdGljIGNvbnRlbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpdih7IGNsYXNzOiAnYXRvbS10cy1kb2N1bWVudGF0aW9uIHBhZGRlZCB0b3AnIH0sXG4gICAgICAgICAgICAoKSA9PiB0aGlzLmRpdiggIC8vIFRPRE86IHJlcGVhdCBmb3IgZWFjaCBkb2N1bWVudGF0aW9uIGVudHJ5XG4gICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmgyKHsgb3V0bGV0OiAnaGVhZGVyJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wKHsgb3V0bGV0OiAnZG9jdW1lbnRhdGlvbicgfSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgfVxuXG5cbiAgICBwcml2YXRlIHNob3duID0gZmFsc2U7XG4gICAgc2hvdygpIHsgdGhpcy4kLmFkZENsYXNzKCdhY3RpdmUnKTsgdGhpcy5zaG93biA9IHRydWU7IH1cbiAgICBoaWRlKCkgeyB0aGlzLiQucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpOyB0aGlzLnNob3duID0gZmFsc2U7IH1cbiAgICB0b2dnbGUoKSB7IGlmICh0aGlzLnNob3duKSB7IHRoaXMuaGlkZSgpOyB9IGVsc2UgeyB0aGlzLnNob3coKTsgfSB9XG5cbiAgICBzZXRDb250ZW50KGNvbnRlbnQ6IHsgZGlzcGxheTogc3RyaW5nOyBkb2N1bWVudGF0aW9uOiBzdHJpbmc7IGZpbGVQYXRoOiBzdHJpbmcgfSkge1xuICAgICAgICB0aGlzLmhlYWRlci5odG1sKGNvbnRlbnQuZGlzcGxheSk7XG4gICAgICAgIGNvbnRlbnQuZG9jdW1lbnRhdGlvbiA9IGNvbnRlbnQuZG9jdW1lbnRhdGlvbi5yZXBsYWNlKC8oPzpcXHJcXG58XFxyfFxcbikvZywgJzxiciAvPicpO1xuICAgICAgICB0aGlzLmRvY3VtZW50YXRpb24uaHRtbChjb250ZW50LmRvY3VtZW50YXRpb24pO1xuICAgIH1cblxuICAgIGF1dG9Qb3NpdGlvbigpIHtcbiAgICAgICAgdmFyIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgICAgdmFyIGN1cnNvciA9IGVkaXRvci5nZXRDdXJzb3JzKClbMF07XG4gICAgICAgIHZhciBjdXJzb3JUb3AgPSBjdXJzb3IuZ2V0UGl4ZWxSZWN0KCkudG9wIC0gZWRpdG9yLmdldFNjcm9sbFRvcCgpO1xuICAgICAgICB2YXIgZWRpdG9ySGVpZ2h0ID0gZWRpdG9yLmdldEhlaWdodCgpO1xuXG4gICAgICAgIGlmIChlZGl0b3JIZWlnaHQgLSBjdXJzb3JUb3AgPCAxMDApIHtcbiAgICAgICAgICAgIHRoaXMuJC5yZW1vdmVDbGFzcygnYm90dG9tJyk7XG4gICAgICAgICAgICB0aGlzLiQuYWRkQ2xhc3MoJ3RvcCcpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy4kLnJlbW92ZUNsYXNzKCd0b3AnKTtcbiAgICAgICAgICAgIHRoaXMuJC5hZGRDbGFzcygnYm90dG9tJylcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IHZhciBkb2NWaWV3OiBEb2N1bWVudGF0aW9uVmlldztcblxuZXhwb3J0IGZ1bmN0aW9uIGF0dGFjaCgpIHtcbiAgICBpZiAoZG9jVmlldykgcmV0dXJuO1xuICAgIGRvY1ZpZXcgPSBuZXcgRG9jdW1lbnRhdGlvblZpZXcoe30pO1xuICAgICQoYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSkuYXBwZW5kKGRvY1ZpZXcuJCk7XG4gICAgLy8gICAgdGVzdERvY3VtZW50YXRpb25WaWV3KCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZXN0RG9jdW1lbnRhdGlvblZpZXcoKSB7XG4gICAgZG9jVmlldy5zZXRDb250ZW50KHtcbiAgICAgICAgZGlzcGxheTogXCJ0aGlzIGlzIGF3ZXNvbWVcIiwgZG9jdW1lbnRhdGlvbjogYFxuICAgIHNvbWUgZG9jc1xuICAgIG92ZXJcbiAgICBtYW55XG4gICAgbWFueSBsaVxuXG4gICAgbGluZXNcbiAgICBsb25nXG4gICAgc29cbiAgICBsb25nXG4gICAgdGhhdFxuICAgIGl0XG4gICAgc2hvdWxkXG5cbiAgICBzdGFydFxuICAgIHRvXG4gICAgc2Nyb2xsXG4gICAgYCwgZmlsZVBhdGg6IFwic29tZSBmaWxlcGF0aFwiXG4gICAgfSk7XG4gICAgZG9jVmlldy5zaG93KCk7XG59XG4iXX0=
//# sourceURL=/Users/shannonbertucci/.dotfiles/atom.symlink/packages/atom-typescript/lib/main/atom/views/documentationView.ts
