const STORAGE_PREFIX = "pyschool-solutions:v1";

export function getSolutionStorageKey(editor: HTMLElement): string {
  const roomPath = window.location.pathname.replace(/\/+$/, "") || "/";

  const editors = Array.from(
    document.querySelectorAll<HTMLElement>("[data-python-editor]"),
  );

  const editorIndex = editors.indexOf(editor);

  return `${STORAGE_PREFIX}:${roomPath}:${editorIndex}`;
}

export function getSavedSolution(storageKey: string): string | undefined {
  try {
    return window.localStorage.getItem(storageKey) ?? undefined;
  } catch {
    return undefined;
  }
}

export function saveSolution(storageKey: string, code: string): void {
  try {
    window.localStorage.setItem(storageKey, code);
  } catch {
    return;
  }
}
