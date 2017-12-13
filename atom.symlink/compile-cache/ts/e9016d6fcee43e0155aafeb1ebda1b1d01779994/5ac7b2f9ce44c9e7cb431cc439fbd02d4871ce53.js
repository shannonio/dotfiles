/// Not useful for user input validation
// But great for simple config validation 
// works only by "n" valid options
exports.types = {
    string: 'string',
    boolean: 'boolean',
    number: 'number'
};
var SimpleValidator = (function () {
    function SimpleValidator(validationInfo) {
        var _this = this;
        this.validationInfo = validationInfo;
        this.potentialLowerCaseMatch = {};
        Object.keys(validationInfo).forEach(function (k) { return _this.potentialLowerCaseMatch[k.toLowerCase()] = k; });
    }
    SimpleValidator.prototype.validate = function (config) {
        var _this = this;
        var keys = Object.keys(config);
        var errors = { invalidValues: [], extraKeys: [], errorMessage: '' };
        keys.forEach(function (k) {
            // Check extra keys
            if (!_this.validationInfo[k]) {
                if (_this.potentialLowerCaseMatch[k]) {
                    errors.extraKeys.push("Key: '" + k + "' is a potential lower case match for '" + _this.potentialLowerCaseMatch[k] + "'. Fix the casing.");
                }
                else {
                    errors.extraKeys.push("Unknown Option: " + k);
                }
            }
            else {
                var validationInfo = _this.validationInfo[k];
                var value = config[k];
                if (validationInfo.validValues && validationInfo.validValues.length) {
                    var validValues = validationInfo.validValues;
                    if (!validValues.some(function (valid) { return valid.toLowerCase() === value.toLowerCase(); })) {
                        errors.invalidValues.push("Key: '" + k + "' has an invalid value: " + value);
                    }
                }
                if (validationInfo.type && typeof value !== validationInfo.type) {
                    errors.invalidValues.push("Key: '" + k + "' has an invalid type: " + typeof value);
                }
            }
        });
        var total = errors.invalidValues.concat(errors.extraKeys);
        if (total.length) {
            errors.errorMessage = total.join("\n");
        }
        return errors;
    };
    return SimpleValidator;
})();
exports.SimpleValidator = SimpleValidator;
function createMap(arr) {
    return arr.reduce(function (result, key) {
        result[key] = true;
        return result;
    }, {});
}
exports.createMap = createMap;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1VzZXJzL3NoYW5ub25iZXJ0dWNjaS8uZG90ZmlsZXMvYXRvbS5zeW1saW5rL3BhY2thZ2VzL2F0b20tdHlwZXNjcmlwdC9saWIvbWFpbi90c2NvbmZpZy9zaW1wbGVWYWxpZGF0b3IudHMiLCJzb3VyY2VzIjpbIi9Vc2Vycy9zaGFubm9uYmVydHVjY2kvLmRvdGZpbGVzL2F0b20uc3ltbGluay9wYWNrYWdlcy9hdG9tLXR5cGVzY3JpcHQvbGliL21haW4vdHNjb25maWcvc2ltcGxlVmFsaWRhdG9yLnRzIl0sIm5hbWVzIjpbIlNpbXBsZVZhbGlkYXRvciIsIlNpbXBsZVZhbGlkYXRvci5jb25zdHJ1Y3RvciIsIlNpbXBsZVZhbGlkYXRvci52YWxpZGF0ZSIsImNyZWF0ZU1hcCJdLCJtYXBwaW5ncyI6IkFBQUEsd0NBQXdDO0FBQ3hDLDBDQUEwQztBQUMxQyxrQ0FBa0M7QUFFdkIsYUFBSyxHQUFHO0lBQ2YsTUFBTSxFQUFFLFFBQVE7SUFDaEIsT0FBTyxFQUFFLFNBQVM7SUFDbEIsTUFBTSxFQUFFLFFBQVE7Q0FDbkIsQ0FBQTtBQWVELElBQWEsZUFBZTtJQUd4QkEsU0FIU0EsZUFBZUEsQ0FHTEEsY0FBOEJBO1FBSHJEQyxpQkE0Q0NBO1FBekNzQkEsbUJBQWNBLEdBQWRBLGNBQWNBLENBQWdCQTtRQUM3Q0EsSUFBSUEsQ0FBQ0EsdUJBQXVCQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUNsQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBQUEsQ0FBQ0EsSUFBR0EsT0FBQUEsS0FBSUEsQ0FBQ0EsdUJBQXVCQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFqREEsQ0FBaURBLENBQUNBLENBQUNBO0lBQy9GQSxDQUFDQTtJQUVERCxrQ0FBUUEsR0FBUkEsVUFBU0EsTUFBV0E7UUFBcEJFLGlCQW1DQ0E7UUFsQ0dBLElBQUlBLElBQUlBLEdBQUdBLE1BQU1BLENB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LFNBQVMsQ0FBQyxHQUFhO0lBQ25DRyxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxDQUFDQSxVQUFDQSxNQUFrQ0EsRUFBRUEsR0FBV0E7UUFDOURBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1FBQ25CQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtJQUNsQkEsQ0FBQ0EsRUFBOEJBLEVBQUVBLENBQUNBLENBQUNBO0FBQ3ZDQSxDQUFDQTtBQUxlLGlCQUFTLEdBQVQsU0FLZixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIE5vdCB1c2VmdWwgZm9yIHVzZXIgaW5wdXQgdmFsaWRhdGlvblxuLy8gQnV0IGdyZWF0IGZvciBzaW1wbGUgY29uZmlnIHZhbGlkYXRpb24gXG4vLyB3b3JrcyBvbmx5IGJ5IFwiblwiIHZhbGlkIG9wdGlvbnNcblxuZXhwb3J0IHZhciB0eXBlcyA9IHtcbiAgICBzdHJpbmc6ICdzdHJpbmcnLFxuICAgIGJvb2xlYW46ICdib29sZWFuJyxcbiAgICBudW1iZXI6ICdudW1iZXInXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGlvbkluZm8ge1xuICAgIFtuYW1lOiBzdHJpbmddOiB7XG4gICAgICAgIHZhbGlkVmFsdWVzPzogc3RyaW5nW107XG4gICAgICAgIHR5cGU/OiBzdHJpbmc7XG4gICAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVycm9ycyB7XG4gICAgaW52YWxpZFZhbHVlczogc3RyaW5nW107XG4gICAgZXh0cmFLZXlzOiBzdHJpbmdbXTtcbiAgICBlcnJvck1lc3NhZ2U6IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIFNpbXBsZVZhbGlkYXRvciB7XG5cbiAgICBwcml2YXRlIHBvdGVudGlhbExvd2VyQ2FzZU1hdGNoOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyB2YWxpZGF0aW9uSW5mbzogVmFsaWRhdGlvbkluZm8pIHtcbiAgICAgICAgdGhpcy5wb3RlbnRpYWxMb3dlckNhc2VNYXRjaCA9IHt9O1xuICAgICAgICBPYmplY3Qua2V5cyh2YWxpZGF0aW9uSW5mbykuZm9yRWFjaChrPT4gdGhpcy5wb3RlbnRpYWxMb3dlckNhc2VNYXRjaFtrLnRvTG93ZXJDYXNlKCldID0gayk7XG4gICAgfVxuXG4gICAgdmFsaWRhdGUoY29uZmlnOiBhbnkpOiBFcnJvcnMge1xuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGNvbmZpZyk7XG4gICAgICAgIHZhciBlcnJvcnMgPSB7IGludmFsaWRWYWx1ZXM6IFtdLCBleHRyYUtleXM6IFtdLCBlcnJvck1lc3NhZ2U6ICcnIH07XG4gICAgICAgIGtleXMuZm9yRWFjaChrPT4ge1xuICAgICAgICAgICAgLy8gQ2hlY2sgZXh0cmEga2V5c1xuICAgICAgICAgICAgaWYgKCF0aGlzLnZhbGlkYXRpb25JbmZvW2tdKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucG90ZW50aWFsTG93ZXJDYXNlTWF0Y2hba10pIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JzLmV4dHJhS2V5cy5wdXNoKGBLZXk6ICcke2t9JyBpcyBhIHBvdGVudGlhbCBsb3dlciBjYXNlIG1hdGNoIGZvciAnJHt0aGlzLnBvdGVudGlhbExvd2VyQ2FzZU1hdGNoW2tdfScuIEZpeCB0aGUgY2FzaW5nLmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JzLmV4dHJhS2V5cy5wdXNoKGBVbmtub3duIE9wdGlvbjogJHtrfWApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSAgICAgXG4gICAgICAgICAgICAvLyBEbyB2YWxpZGF0aW9uXG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsaWRhdGlvbkluZm8gPSB0aGlzLnZhbGlkYXRpb25JbmZvW2tdO1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZTogYW55ID0gY29uZmlnW2tdO1xuICAgICAgICAgICAgICAgIGlmICh2YWxpZGF0aW9uSW5mby52YWxpZFZhbHVlcyAmJiB2YWxpZGF0aW9uSW5mby52YWxpZFZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbGlkVmFsdWVzID0gdmFsaWRhdGlvbkluZm8udmFsaWRWYWx1ZXM7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdmFsaWRWYWx1ZXMuc29tZSh2YWxpZCA9PiB2YWxpZC50b0xvd2VyQ2FzZSgpID09PSB2YWx1ZS50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JzLmludmFsaWRWYWx1ZXMucHVzaChgS2V5OiAnJHtrfScgaGFzIGFuIGludmFsaWQgdmFsdWU6ICR7dmFsdWV9YCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHZhbGlkYXRpb25JbmZvLnR5cGUgJiYgdHlwZW9mIHZhbHVlICE9PSB2YWxpZGF0aW9uSW5mby50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9ycy5pbnZhbGlkVmFsdWVzLnB1c2goYEtleTogJyR7a30nIGhhcyBhbiBpbnZhbGlkIHR5cGU6ICR7dHlwZW9mIHZhbHVlfWApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgdG90YWwgPSBlcnJvcnMuaW52YWxpZFZhbHVlcy5jb25jYXQoZXJyb3JzLmV4dHJhS2V5cyk7XG4gICAgICAgIGlmICh0b3RhbC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGVycm9ycy5lcnJvck1lc3NhZ2UgPSB0b3RhbC5qb2luKFwiXFxuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVycm9ycztcbiAgICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1hcChhcnI6IHN0cmluZ1tdKTogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0ge1xuICAgIHJldHVybiBhcnIucmVkdWNlKChyZXN1bHQ6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9LCBrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICByZXN1bHRba2V5XSA9IHRydWU7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgPHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9Pnt9KTtcbn1cbiJdfQ==
//# sourceURL=/Users/shannonbertucci/.dotfiles/atom.symlink/packages/atom-typescript/lib/main/tsconfig/simpleValidator.ts
