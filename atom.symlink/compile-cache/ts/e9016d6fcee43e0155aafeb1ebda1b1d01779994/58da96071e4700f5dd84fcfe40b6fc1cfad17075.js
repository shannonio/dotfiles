// Ripped from lib.es6.d.ts with addtions for atom
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1VzZXJzL3NoYW5ub25iZXJ0dWNjaS8uZG90ZmlsZXMvYXRvbS5zeW1saW5rL3BhY2thZ2VzL2F0b20tdHlwZXNjcmlwdC9saWIvdHlwaW5ncy9hdG9tcHJvbWlzZS5kLnRzIiwic291cmNlcyI6WyIvVXNlcnMvc2hhbm5vbmJlcnR1Y2NpLy5kb3RmaWxlcy9hdG9tLnN5bWxpbmsvcGFja2FnZXMvYXRvbS10eXBlc2NyaXB0L2xpYi90eXBpbmdzL2F0b21wcm9taXNlLmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsa0RBQWtEO0FBa0dqRCIsInNvdXJjZXNDb250ZW50IjpbIi8vIFJpcHBlZCBmcm9tIGxpYi5lczYuZC50cyB3aXRoIGFkZHRpb25zIGZvciBhdG9tXG5cbi8qKlxuICogUmVwcmVzZW50cyB0aGUgY29tcGxldGlvbiBvZiBhbiBhc3luY2hyb25vdXMgb3BlcmF0aW9uXG4gKi9cbmludGVyZmFjZSBQcm9taXNlPFQ+IHtcbiAgICAvKipcbiAgICAqIEF0dGFjaGVzIGNhbGxiYWNrcyBmb3IgdGhlIHJlc29sdXRpb24gYW5kL29yIHJlamVjdGlvbiBvZiB0aGUgUHJvbWlzZS5cbiAgICAqIEBwYXJhbSBvbmZ1bGZpbGxlZCBUaGUgY2FsbGJhY2sgdG8gZXhlY3V0ZSB3aGVuIHRoZSBQcm9taXNlIGlzIHJlc29sdmVkLlxuICAgICogQHBhcmFtIG9ucmVqZWN0ZWQgVGhlIGNhbGxiYWNrIHRvIGV4ZWN1dGUgd2hlbiB0aGUgUHJvbWlzZSBpcyByZWplY3RlZC5cbiAgICAqIEByZXR1cm5zIEEgUHJvbWlzZSBmb3IgdGhlIGNvbXBsZXRpb24gb2Ygd2hpY2ggZXZlciBjYWxsYmFjayBpcyBleGVjdXRlZC5cbiAgICAqL1xuICAgIHRoZW48VFJlc3VsdD4ob25mdWxmaWxsZWQ/OiAodmFsdWU6IFQpID0+IFRSZXN1bHQgfCBQcm9taXNlPFRSZXN1bHQ+LCBvbnJlamVjdGVkPzogKHJlYXNvbjogYW55KSA9PiBUUmVzdWx0IHwgUHJvbWlzZTxUUmVzdWx0Pik6IFByb21pc2U8VFJlc3VsdD47XG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2hlcyBhIGNhbGxiYWNrIGZvciBvbmx5IHRoZSByZWplY3Rpb24gb2YgdGhlIFByb21pc2UuXG4gICAgICogQHBhcmFtIG9ucmVqZWN0ZWQgVGhlIGNhbGxiYWNrIHRvIGV4ZWN1dGUgd2hlbiB0aGUgUHJvbWlzZSBpcyByZWplY3RlZC5cbiAgICAgKiBAcmV0dXJucyBBIFByb21pc2UgZm9yIHRoZSBjb21wbGV0aW9uIG9mIHRoZSBjYWxsYmFjay5cbiAgICAgKi9cbiAgICBjYXRjaChvbnJlamVjdGVkPzogKHJlYXNvbjogYW55KSA9PiBUIHwgUHJvbWlzZTxUPik6IFByb21pc2U8VD47XG59XG5cbmludGVyZmFjZSBQcm9taXNlQ29uc3RydWN0b3Ige1xuICAgIC8qKlxuICAgICAgKiBBIHJlZmVyZW5jZSB0byB0aGUgcHJvdG90eXBlLlxuICAgICAgKi9cbiAgICBwcm90b3R5cGU6IFByb21pc2U8YW55PjtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgUHJvbWlzZS5cbiAgICAgKiBAcGFyYW0gaW5pdCBBIGNhbGxiYWNrIHVzZWQgdG8gaW5pdGlhbGl6ZSB0aGUgcHJvbWlzZS4gVGhpcyBjYWxsYmFjayBpcyBwYXNzZWQgdHdvIGFyZ3VtZW50czpcbiAgICAgKiBhIHJlc29sdmUgY2FsbGJhY2sgdXNlZCByZXNvbHZlIHRoZSBwcm9taXNlIHdpdGggYSB2YWx1ZSBvciB0aGUgcmVzdWx0IG9mIGFub3RoZXIgcHJvbWlzZSxcbiAgICAgKiBhbmQgYSByZWplY3QgY2FsbGJhY2sgdXNlZCB0byByZWplY3QgdGhlIHByb21pc2Ugd2l0aCBhIHByb3ZpZGVkIHJlYXNvbiBvciBlcnJvci5cbiAgICAgKi9cbiAgICBuZXcgPFQ+KGluaXQ6IChyZXNvbHZlOiAodmFsdWU/OiBUIHwgUHJvbWlzZTxUPikgPT4gdm9pZCwgcmVqZWN0OiAocmVhc29uPzogYW55KSA9PiB2b2lkKSA9PiB2b2lkKTogUHJvbWlzZTxUPjtcblxuICAgIDxUPihpbml0OiAocmVzb2x2ZTogKHZhbHVlPzogVCB8IFByb21pc2U8VD4pID0+IHZvaWQsIHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZCkgPT4gdm9pZCk6IFByb21pc2U8VD47XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdpdGggYW4gYXJyYXkgb2YgcmVzdWx0cyB3aGVuIGFsbCBvZiB0aGUgcHJvdmlkZWQgUHJvbWlzZXNcbiAgICAgKiByZXNvbHZlLCBvciByZWplY3RlZCB3aGVuIGFueSBQcm9taXNlIGlzIHJlamVjdGVkLlxuICAgICAqIEBwYXJhbSB2YWx1ZXMgQW4gYXJyYXkgb2YgUHJvbWlzZXMuXG4gICAgICogQHJldHVybnMgQSBuZXcgUHJvbWlzZS5cbiAgICAgKi9cbiAgICBhbGw8VD4odmFsdWVzOiAoVCB8IFByb21pc2U8VD4pW10pOiBQcm9taXNlPFRbXT47XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdpdGggYW4gYXJyYXkgb2YgcmVzdWx0cyB3aGVuIGFsbCBvZiB0aGUgcHJvdmlkZWQgUHJvbWlzZXNcbiAgICAgKiByZXNvbHZlLCBvciByZWplY3RlZCB3aGVuIGFueSBQcm9taXNlIGlzIHJlamVjdGVkLlxuICAgICAqIEBwYXJhbSB2YWx1ZXMgQW4gYXJyYXkgb2YgdmFsdWVzLlxuICAgICAqIEByZXR1cm5zIEEgbmV3IFByb21pc2UuXG4gICAgICovXG4gICAgYWxsKHZhbHVlczogUHJvbWlzZTx2b2lkPltdKTogUHJvbWlzZTx2b2lkPjtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgb3IgcmVqZWN0ZWQgd2hlbiBhbnkgb2YgdGhlIHByb3ZpZGVkIFByb21pc2VzIGFyZSByZXNvbHZlZFxuICAgICAqIG9yIHJlamVjdGVkLlxuICAgICAqIEBwYXJhbSB2YWx1ZXMgQW4gYXJyYXkgb2YgUHJvbWlzZXMuXG4gICAgICogQHJldHVybnMgQSBuZXcgUHJvbWlzZS5cbiAgICAgKi9cbiAgICByYWNlPFQ+KHZhbHVlczogKFQgfCBQcm9taXNlPFQ+KVtdKTogUHJvbWlzZTxUPjtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgcmVqZWN0ZWQgcHJvbWlzZSBmb3IgdGhlIHByb3ZpZGVkIHJlYXNvbi5cbiAgICAgKiBAcGFyYW0gcmVhc29uIFRoZSByZWFzb24gdGhlIHByb21pc2Ugd2FzIHJlamVjdGVkLlxuICAgICAqIEByZXR1cm5zIEEgbmV3IHJlamVjdGVkIFByb21pc2UuXG4gICAgICovXG4gICAgcmVqZWN0KHJlYXNvbjogYW55KTogUHJvbWlzZTx2b2lkPjtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgcmVqZWN0ZWQgcHJvbWlzZSBmb3IgdGhlIHByb3ZpZGVkIHJlYXNvbi5cbiAgICAgKiBAcGFyYW0gcmVhc29uIFRoZSByZWFzb24gdGhlIHByb21pc2Ugd2FzIHJlamVjdGVkLlxuICAgICAqIEByZXR1cm5zIEEgbmV3IHJlamVjdGVkIFByb21pc2UuXG4gICAgICovXG4gICAgcmVqZWN0PFQ+KHJlYXNvbjogYW55KTogUHJvbWlzZTxUPjtcblxuICAgIC8qKlxuICAgICAgKiBDcmVhdGVzIGEgbmV3IHJlc29sdmVkIHByb21pc2UgZm9yIHRoZSBwcm92aWRlZCB2YWx1ZS5cbiAgICAgICogQHBhcmFtIHZhbHVlIEEgcHJvbWlzZS5cbiAgICAgICogQHJldHVybnMgQSBwcm9taXNlIHdob3NlIGludGVybmFsIHN0YXRlIG1hdGNoZXMgdGhlIHByb3ZpZGVkIHByb21pc2UuXG4gICAgICAqL1xuICAgIHJlc29sdmU8VD4odmFsdWU6IFQgfCBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPjtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgcmVzb2x2ZWQgcHJvbWlzZSAuXG4gICAgICogQHJldHVybnMgQSByZXNvbHZlZCBwcm9taXNlLlxuICAgICAqL1xuICAgIHJlc29sdmUoKTogUHJvbWlzZTx2b2lkPjtcbn1cblxuaW50ZXJmYWNlIFByb21pc2VEZWZlcnJlZDxUPiB7XG4gICAgcHJvbWlzZTogUHJvbWlzZTxUPjsgcmVzb2x2ZSh2YWx1ZTogVCk6IGFueTsgcmVqZWN0KGVycm9yOiBUKTogYW55O1xufVxuXG5kZWNsYXJlIHZhciBQcm9taXNlOiBQcm9taXNlQ29uc3RydWN0b3I7XG5cbmRlY2xhcmUgbW9kdWxlICdwaW5raWUtcHJvbWlzZSd7XG4gICAgZXhwb3J0ID0gUHJvbWlzZTtcbn1cbiJdfQ==
//# sourceURL=/Users/shannonbertucci/.dotfiles/atom.symlink/packages/atom-typescript/lib/typings/atompromise.d.ts
