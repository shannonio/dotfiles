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
        throw new Error("Must override the base View static content member");
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
        throw new Error("Must override the base View static content member");
    };
    ScrollView.prototype.init = function () {
    };
    return ScrollView;
})(sp.ScrollView);
exports.ScrollView = ScrollView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1VzZXJzL3NoYW5ub25iZXJ0dWNjaS8uYXRvbS9wYWNrYWdlcy9hdG9tLXR5cGVzY3JpcHQvbGliL21haW4vYXRvbS92aWV3cy92aWV3LnRzIiwic291cmNlcyI6WyIvVXNlcnMvc2hhbm5vbmJlcnR1Y2NpLy5hdG9tL3BhY2thZ2VzL2F0b20tdHlwZXNjcmlwdC9saWIvbWFpbi9hdG9tL3ZpZXdzL3ZpZXcudHMiXSwibmFtZXMiOlsiVmlldyIsIlZpZXcuY29uc3RydWN0b3IiLCJWaWV3LiQiLCJWaWV3LmNvbnRlbnQiLCJWaWV3LmluaXQiLCJTY3JvbGxWaWV3IiwiU2Nyb2xsVmlldy5jb25zdHJ1Y3RvciIsIlNjcm9sbFZpZXcuJCIsIlNjcm9sbFZpZXcuY29udGVudCIsIlNjcm9sbFZpZXcuaW5pdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBTyxFQUFFLFdBQVcsc0JBQXNCLENBQUMsQ0FBQTtBQUUzQyxJQUFhLElBQUk7SUFBa0JBLFVBQXRCQSxJQUFJQSxVQUF5QkE7SUFTeENBLFNBVFdBLElBQUlBLENBU0lBLE9BQWdCQTtRQUNqQ0MsaUJBQU9BLENBQUFBO1FBRFVBLFlBQU9BLEdBQVBBLE9BQU9BLENBQVNBO1FBRWpDQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFBQTtJQUNiQSxDQUFDQTtJQVhERCxzQkFBSUEsbUJBQUNBO2FBQUxBO1lBQ0VFLE1BQU1BLENBQU1BLElBQUlBLENBQUFBO1FBQ2xCQSxDQUFDQTs7O09BQUFGO0lBRU1BLFlBQU9BLEdBQWRBO1FBQ0VHLE1BQU1BLElBQUlBLEtBQUtBLENBQUNBLG1EQUFtREEsQ0FBQ0EsQ0FBQUE7SUFDdEVBLENBQUNBO0lBTURILG1CQUFJQSxHQUFKQTtJQUFRSSxDQUFDQTtJQUNYSixXQUFDQTtBQUFEQSxDQUFDQSxBQWRELEVBQW1DLEVBQUUsQ0FBQyxJQUFJLEVBY3pDO0FBZFksWUFBSSxHQUFKLElBY1osQ0FBQTtBQUVVLFNBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBRW5CLElBQWEsVUFBVTtJQUFrQkssVUFBNUJBLFVBQVVBLFVBQStCQTtJQVNwREEsU0FUV0EsVUFBVUEsQ0FTRkEsT0FBZ0JBO1FBQ2pDQyxpQkFBT0EsQ0FBQUE7UUFEVUEsWUFBT0EsR0FBUEEsT0FBT0EsQ0FBU0E7UUFFakNBLElBQUlBLENBQUNBLElBQUlBLEVBQUVBLENBQUFBO0lBQ2JBLENBQUNBO0lBWERELHNCQUFJQSx5QkFBQ0E7YUFBTEE7WUFDRUUsTUFBTUEsQ0FBTUEsSUFBSUEsQ0FBQUE7UUFDbEJBLENBQUNBOzs7T0FBQUY7SUFFTUEsa0JBQU9BLEdBQWRBO1FBQ0VHLE1BQU1BLElBQUlBLEtBQUtBLENBQUNBLG1EQUFtREEsQ0FBQ0EsQ0FBQUE7SUFDdEVBLENBQUNBO0lBTURILHlCQUFJQSxHQUFKQTtJQUFRSSxDQUFDQTtJQUNYSixpQkFBQ0E7QUFBREEsQ0FBQ0EsQUFkRCxFQUF5QyxFQUFFLENBQUMsVUFBVSxFQWNyRDtBQWRZLGtCQUFVLEdBQVYsVUFjWixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHNwID0gcmVxdWlyZShcImF0b20tc3BhY2UtcGVuLXZpZXdzXCIpXG5cbmV4cG9ydCBjbGFzcyBWaWV3PE9wdGlvbnM+IGV4dGVuZHMgc3AuVmlldyB7XG4gIGdldCAkKCk6IEpRdWVyeSB7XG4gICAgcmV0dXJuIDxhbnk+dGhpc1xuICB9XG5cbiAgc3RhdGljIGNvbnRlbnQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTXVzdCBvdmVycmlkZSB0aGUgYmFzZSBWaWV3IHN0YXRpYyBjb250ZW50IG1lbWJlclwiKVxuICB9XG5cbiAgY29uc3RydWN0b3IocHVibGljIG9wdGlvbnM6IE9wdGlvbnMpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5pbml0KClcbiAgfVxuICBpbml0KCkge31cbn1cblxuZXhwb3J0IHZhciAkID0gc3AuJFxuXG5leHBvcnQgY2xhc3MgU2Nyb2xsVmlldzxPcHRpb25zPiBleHRlbmRzIHNwLlNjcm9sbFZpZXcge1xuICBnZXQgJCgpOiBKUXVlcnkge1xuICAgIHJldHVybiA8YW55PnRoaXNcbiAgfVxuXG4gIHN0YXRpYyBjb250ZW50KCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIk11c3Qgb3ZlcnJpZGUgdGhlIGJhc2UgVmlldyBzdGF0aWMgY29udGVudCBtZW1iZXJcIilcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBvcHRpb25zOiBPcHRpb25zKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuaW5pdCgpXG4gIH1cbiAgaW5pdCgpIHt9XG59XG4iXX0=