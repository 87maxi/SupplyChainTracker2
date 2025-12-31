"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useToast = useToast;
const react_1 = require("react");
// Global state for toasts
let memoryToasts = [];
const listeners = new Set();
const emit = () => {
    console.log(`[useToast] Emitting to ${listeners.size} listeners. Current toasts:`, memoryToasts.length);
    listeners.forEach((listener) => listener([...memoryToasts]));
};
function useToast() {
    const [toasts, setToasts] = (0, react_1.useState)(memoryToasts);
    (0, react_1.useEffect)(() => {
        console.log("[useToast] Listener added");
        listeners.add(setToasts);
        return () => {
            console.log("[useToast] Listener removed");
            listeners.delete(setToasts);
        };
    }, []);
    const toast = (0, react_1.useCallback)((props) => {
        const id = Math.random().toString(36).substring(2, 9);
        console.log(`[useToast] Adding toast: ${props.title || 'No Title'} (ID: ${id})`);
        memoryToasts = [...memoryToasts, Object.assign(Object.assign({}, props), { id })];
        emit();
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            console.log(`[useToast] Auto-dismissing toast: ${id}`);
            memoryToasts = memoryToasts.filter((t) => t.id !== id);
            emit();
        }, 5000);
    }, []);
    const dismiss = (0, react_1.useCallback)((id) => {
        console.log(`[useToast] Manually dismissing toast: ${id}`);
        memoryToasts = memoryToasts.filter((t) => t.id !== id);
        emit();
    }, []);
    return {
        toasts,
        toast,
        dismiss,
    };
}
