type TypewriterOptions = {
  charsPerSecond?: number;
  minChunk?: number;
  maxChunk?: number;
};

export type TypewriterController = {
  push: (delta: string) => void;
  flush: () => void;
  stop: () => void;
  getText: () => string;
};

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

export const createTypewriter = (
  onUpdate: (text: string) => void,
  options: TypewriterOptions = {}
): TypewriterController => {
  const charsPerSecond = options.charsPerSecond ?? 60;
  const minChunk = options.minChunk ?? 1;
  const maxChunk = options.maxChunk ?? 10;

  let buffer = "";
  let output = "";
  let rafId: number | null = null;
  let lastTick = now();

  const tick = () => {
    const elapsed = Math.max(0, now() - lastTick);
    lastTick = now();
    if (!buffer.length) {
      rafId = null;
      return;
    }
    const rawChunk = Math.floor((elapsed / 1000) * charsPerSecond);
    const chunkSize = Math.min(
      buffer.length,
      Math.max(minChunk, Math.min(maxChunk, rawChunk || minChunk))
    );
    output += buffer.slice(0, chunkSize);
    buffer = buffer.slice(chunkSize);
    onUpdate(output);
    rafId = requestAnimationFrame(tick);
  };

  const start = () => {
    if (rafId != null) return;
    lastTick = now();
    rafId = requestAnimationFrame(tick);
  };

  return {
    push: (delta: string) => {
      if (!delta) return;
      buffer += delta;
      start();
    },
    flush: () => {
      if (buffer.length) {
        output += buffer;
        buffer = "";
        onUpdate(output);
      }
    },
    stop: () => {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
    getText: () => output,
  };
};
