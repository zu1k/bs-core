export function createDebounce() {
  let timeout: ReturnType<typeof setTimeout>;
  return function (fnc: () => void, delayMs?: number) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fnc();
    }, delayMs || 300);
  };
}
