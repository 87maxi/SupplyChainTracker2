"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENTS = exports.eventBus = void 0;
class EventBus {
    constructor() {
        this.listeners = {};
    }
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = new Set();
        }
        this.listeners[event].add(callback);
        return () => this.off(event, callback);
    }
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].delete(callback);
        }
    }
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}
exports.eventBus = new EventBus();
exports.EVENTS = {
    ROLE_UPDATED: 'ROLE_UPDATED',
    REQUESTS_UPDATED: 'REQUESTS_UPDATED',
};
