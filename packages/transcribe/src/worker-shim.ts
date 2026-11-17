// Parte del paquete de TensorFlow.js asume que existe `window`; en un worker no existe.
// Este módulo se importa primero en worker.ts para que `window` apunte al propio worker.
Object.assign(globalThis, { window: globalThis });
export {};
