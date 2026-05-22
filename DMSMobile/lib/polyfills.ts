import { Buffer } from "buffer";

// Polyfill Buffer
if (typeof global.Buffer === "undefined") {
    global.Buffer = Buffer;
}

// Polyfill setImmediate (required by some libs)
if (typeof global.setImmediate === "undefined") {
    global.setImmediate = ((
        callback: (...args: any[]) => void,
        ...args: any[]
    ) => {
        return setTimeout(callback, 0, ...args);
    }) as any;
}

// Helper to suppress some common benign warnings if needed
// LogBox.ignoreLogs(['...']);
