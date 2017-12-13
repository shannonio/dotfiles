var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var sp = require("atom-space-pen-views");
var View = (function (_super) {
    __extends(View, _super);
    function View(options) {
        _super.call(this);
        this.options = options;
        this.init();
    }
    Object.defineProperty(View.prototype, "$", {
        get: function () {
            return this;
        },
        enumerable: true,
        configurable: true
    });
    View.content = function () {
        throw new Error('Must override the base View static content member');
    };
    View.prototype.init = function () {
    };
    return View;
})(sp.View);
exports.View = View;
exports.$ = sp.$;
var ScrollView = (function (_super) {
    __extends(ScrollView, _super);
    function ScrollView(options) {
        _super.call(this);
        this.options = options;
        this.init();
    }
    Object.defineProperty(ScrollView.prototype, "$", {
        get: function () {
            return this;
        },
        enumerable: true,
        configurable: true
    });
    ScrollView.content = function () {
        throw new Error('Must override the base View static content member');
    };
    ScrollView.prototype.init = function () {
    };
    return ScrollView;
})(sp.ScrollView);
exports.ScrollView = ScrollView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1VzZXJzL3NoYW5ub25iZXJ0dWNjaS8uYXRvbS9wYWNrYWdlcy9hdG9tLXR5cGVzY3JpcHQvbGliL21haW4vYXRvbS92aWV3cy92aWV3LnRzIiwic291cmNlcyI6WyIvVXNlcnMvc2hhbm5vbmJlcnR1Y2NpLy5hdG9tL3BhY2thZ2VzL2F0b20tdHlwZXNjcmlwdC9saWIvbWFpbi9hdG9tL3ZpZXdzL3ZpZXcudHMiXSwibmFtZXMiOlsiVmlldyIsIlZpZXcuY29uc3RydWN0b3IiLCJWaWV3LiQiLCJWaWV3LmNvbnRlbnQiLCJWaWV3LmluaXQiLCJTY3JvbGxWaWV3IiwiU2Nyb2xsVmlldy5jb25zdHJ1Y3RvciIsIlNjcm9sbFZpZXcuJCIsIlNjcm9sbFZpZXcuY29udGVudCIsIlNjcm9sbFZpZXcuaW5pdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBTyxFQUFFLFdBQVcsc0JBQXNCLENBQUMsQ0FBQztBQUU1QyxJQUFhLElBQUk7SUFBa0JBLFVBQXRCQSxJQUFJQSxVQUF5QkE7SUFTdENBLFNBVFNBLElBQUlBLENBU01BLE9BQWdCQTtRQUMvQkMsaUJBQU9BLENBQUNBO1FBRE9BLFlBQU9BLEdBQVBBLE9BQU9BLENBQVNBO1FBRS9CQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtJQUNoQkEsQ0FBQ0E7SUFYREQsc0JBQUlBLG1CQUFDQTthQUFMQTtZQUNJRSxNQUFNQSxDQUFNQSxJQUFJQSxDQUFDQTtRQUNyQkEsQ0FBQ0E7OztPQUFBRjtJQUVNQSxZQUFPQSxHQUFkQTtRQUNJRyxNQUFNQSxJQUFJQSxLQUFLQSxDQUFDQSxtREFBbURBLENBQUNBLENBQUNBO0lBQ3pFQSxDQUFDQTtJQU1ESCxtQkFBSUEsR0FBSkE7SUFBU0ksQ0FBQ0E7SUFDZEosV0FBQ0E7QUFBREEsQ0FBQ0EsQUFkRCxFQUFtQyxFQUFFLENBQUMsSUFBSSxFQWN6QztBQWRZLFlBQUksR0FBSixJQWNaLENBQUE7QUFFVSxTQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUVwQixJQUFhLFVBQVU7SUFBa0JLLFVBQTVCQSxVQUFVQSxVQUErQkE7SUFTbERBLFNBVFNBLFVBQVVBLENBU0FBLE9BQWdCQTtRQUMvQkMsaUJBQU9BLENBQUNBO1FBRE9BLFlBQU9BLEdBQVBBLE9BQU9BLENBQVNBO1FBRS9CQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtJQUNoQkEsQ0FBQ0E7SUFYREQsc0JBQUlBLHlCQUFDQTthQUFMQTtZQUNJRSxNQUFNQSxDQUFNQSxJQUFJQSxDQUFDQTtRQUNyQkEsQ0FBQ0E7OztPQUFBRjtJQUVNQSxrQkFBT0EsR0FBZEE7UUFDSUcsTUFBTUEsSUFBSUEsS0FBS0EsQ0FBQ0EsbURBQW1EQSxDQUFDQSxDQUFDQTtJQUN6RUEsQ0FBQ0E7SUFNREgseUJBQUlBLEdBQUpBO0lBQVNJLENBQUNBO0lBQ2RKLGlCQUFDQTtBQUFEQSxDQUFDQSxBQWRELEVBQXlDLEVBQUUsQ0FBQyxVQUFVLEVBY3JEO0FBZFksa0JBQVUsR0FBVixVQWNaLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgc3AgPSByZXF1aXJlKFwiYXRvbS1zcGFjZS1wZW4tdmlld3NcIik7XG5cbmV4cG9ydCBjbGFzcyBWaWV3PE9wdGlvbnM+IGV4dGVuZHMgc3AuVmlldyB7XG4gICAgZ2V0ICQoKTogSlF1ZXJ5IHtcbiAgICAgICAgcmV0dXJuIDxhbnk+dGhpcztcbiAgICB9XG5cbiAgICBzdGF0aWMgY29udGVudCgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNdXN0IG92ZXJyaWRlIHRoZSBiYXNlIFZpZXcgc3RhdGljIGNvbnRlbnQgbWVtYmVyJyk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IocHVibGljIG9wdGlvbnM6IE9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuICAgIGluaXQoKSB7IH1cbn1cblxuZXhwb3J0IHZhciAkID0gc3AuJDtcblxuZXhwb3J0IGNsYXNzIFNjcm9sbFZpZXc8T3B0aW9ucz4gZXh0ZW5kcyBzcC5TY3JvbGxWaWV3IHtcbiAgICBnZXQgJCgpOiBKUXVlcnkge1xuICAgICAgICByZXR1cm4gPGFueT50aGlzO1xuICAgIH1cblxuICAgIHN0YXRpYyBjb250ZW50KCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ011c3Qgb3ZlcnJpZGUgdGhlIGJhc2UgVmlldyBzdGF0aWMgY29udGVudCBtZW1iZXInKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgb3B0aW9uczogT3B0aW9ucykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG4gICAgaW5pdCgpIHsgfVxufVxuIl19