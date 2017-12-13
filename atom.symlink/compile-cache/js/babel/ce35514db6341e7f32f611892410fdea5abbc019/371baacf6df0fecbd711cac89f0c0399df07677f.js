var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _indieDelegate = require('./indie-delegate');

var _indieDelegate2 = _interopRequireDefault(_indieDelegate);

var _validate = require('./validate');

var IndieRegistry = (function () {
  function IndieRegistry() {
    _classCallCheck(this, IndieRegistry);

    this.emitter = new _atom.Emitter();
    this.delegates = new Set();
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.emitter);
  }

  _createClass(IndieRegistry, [{
    key: 'register',
    value: function register(config, version) {
      var _this = this;

      if (!(0, _validate.indie)(config)) {
        throw new Error('Error registering Indie Linter');
      }
      var indieLinter = new _indieDelegate2['default'](config, version);
      this.delegates.add(indieLinter);
      indieLinter.onDidDestroy(function () {
        _this.delegates['delete'](indieLinter);
      });
      indieLinter.onDidUpdate(function (messages) {
        _this.emitter.emit('did-update', { linter: indieLinter, messages: messages });
      });
      this.emitter.emit('observe', indieLinter);

      return indieLinter;
    }
  }, {
    key: 'observe',
    value: function observe(callback) {
      this.delegates.forEach(callback);
      return this.emitter.on('observe', callback);
    }
  }, {
    key: 'onDidUpdate',
    value: function onDidUpdate(callback) {
      return this.emitter.on('did-update', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      for (var entry of this.delegates) {
        entry.dispose();
      }
      this.subscriptions.dispose();
    }
  }]);

  return IndieRegistry;
})();

module.exports = IndieRegistry;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmRvdGZpbGVzL2F0b20uc3ltbGluay9wYWNrYWdlcy9saW50ZXIvbGliL2luZGllLXJlZ2lzdHJ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztvQkFFNkMsTUFBTTs7NkJBR3pCLGtCQUFrQjs7Ozt3QkFDTCxZQUFZOztJQUc3QyxhQUFhO0FBS04sV0FMUCxhQUFhLEdBS0g7MEJBTFYsYUFBYTs7QUFNZixRQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUE7QUFDNUIsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQzFCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7O0FBRTlDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtHQUNyQzs7ZUFYRyxhQUFhOztXQVlULGtCQUFDLE1BQWEsRUFBRSxPQUFjLEVBQWlCOzs7QUFDckQsVUFBSSxDQUFDLHFCQUFjLE1BQU0sQ0FBQyxFQUFFO0FBQzFCLGNBQU0sSUFBSSxLQUFLLENBQUMsZ0NBQWdDLENBQUMsQ0FBQTtPQUNsRDtBQUNELFVBQU0sV0FBVyxHQUFHLCtCQUFrQixNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUE7QUFDdEQsVUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDL0IsaUJBQVcsQ0FBQyxZQUFZLENBQUMsWUFBTTtBQUM3QixjQUFLLFNBQVMsVUFBTyxDQUFDLFdBQVcsQ0FBQyxDQUFBO09BQ25DLENBQUMsQ0FBQTtBQUNGLGlCQUFXLENBQUMsV0FBVyxDQUFDLFVBQUMsUUFBUSxFQUFLO0FBQ3BDLGNBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBUixRQUFRLEVBQUUsQ0FBQyxDQUFBO09BQ25FLENBQUMsQ0FBQTtBQUNGLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQTs7QUFFekMsYUFBTyxXQUFXLENBQUE7S0FDbkI7OztXQUNNLGlCQUFDLFFBQWtCLEVBQWM7QUFDdEMsVUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDaEMsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDNUM7OztXQUNVLHFCQUFDLFFBQWtCLEVBQWM7QUFDMUMsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDL0M7OztXQUNNLG1CQUFHO0FBQ1IsV0FBSyxJQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ2xDLGFBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQTtPQUNoQjtBQUNELFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDN0I7OztTQXhDRyxhQUFhOzs7QUEyQ25CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmRvdGZpbGVzL2F0b20uc3ltbGluay9wYWNrYWdlcy9saW50ZXIvbGliL2luZGllLXJlZ2lzdHJ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgRW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgdHlwZSB7IERpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuXG5pbXBvcnQgSW5kaWVEZWxlZ2F0ZSBmcm9tICcuL2luZGllLWRlbGVnYXRlJ1xuaW1wb3J0IHsgaW5kaWUgYXMgdmFsaWRhdGVJbmRpZSB9IGZyb20gJy4vdmFsaWRhdGUnXG5pbXBvcnQgdHlwZSB7IEluZGllIH0gZnJvbSAnLi90eXBlcydcblxuY2xhc3MgSW5kaWVSZWdpc3RyeSB7XG4gIGVtaXR0ZXI6IEVtaXR0ZXI7XG4gIGRlbGVnYXRlczogU2V0PEluZGllRGVsZWdhdGU+O1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLmRlbGVnYXRlcyA9IG5ldyBTZXQoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5lbWl0dGVyKVxuICB9XG4gIHJlZ2lzdGVyKGNvbmZpZzogSW5kaWUsIHZlcnNpb246IDEgfCAyKTogSW5kaWVEZWxlZ2F0ZSB7XG4gICAgaWYgKCF2YWxpZGF0ZUluZGllKGNvbmZpZykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXJyb3IgcmVnaXN0ZXJpbmcgSW5kaWUgTGludGVyJylcbiAgICB9XG4gICAgY29uc3QgaW5kaWVMaW50ZXIgPSBuZXcgSW5kaWVEZWxlZ2F0ZShjb25maWcsIHZlcnNpb24pXG4gICAgdGhpcy5kZWxlZ2F0ZXMuYWRkKGluZGllTGludGVyKVxuICAgIGluZGllTGludGVyLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICB0aGlzLmRlbGVnYXRlcy5kZWxldGUoaW5kaWVMaW50ZXIpXG4gICAgfSlcbiAgICBpbmRpZUxpbnRlci5vbkRpZFVwZGF0ZSgobWVzc2FnZXMpID0+IHtcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtdXBkYXRlJywgeyBsaW50ZXI6IGluZGllTGludGVyLCBtZXNzYWdlcyB9KVxuICAgIH0pXG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ29ic2VydmUnLCBpbmRpZUxpbnRlcilcblxuICAgIHJldHVybiBpbmRpZUxpbnRlclxuICB9XG4gIG9ic2VydmUoY2FsbGJhY2s6IEZ1bmN0aW9uKTogRGlzcG9zYWJsZSB7XG4gICAgdGhpcy5kZWxlZ2F0ZXMuZm9yRWFjaChjYWxsYmFjaylcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdvYnNlcnZlJywgY2FsbGJhY2spXG4gIH1cbiAgb25EaWRVcGRhdGUoY2FsbGJhY2s6IEZ1bmN0aW9uKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLXVwZGF0ZScsIGNhbGxiYWNrKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiB0aGlzLmRlbGVnYXRlcykge1xuICAgICAgZW50cnkuZGlzcG9zZSgpXG4gICAgfVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEluZGllUmVnaXN0cnlcbiJdfQ==