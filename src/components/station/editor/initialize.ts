import { createPythonCodeEditor } from "./code-editor";
import { getPythonEditorElements } from "./dom";
import {
  getErrorHelpPreference,
  setErrorHelpPreference,
} from "./python-error-help";
import { createPythonRunner } from "./runner";
import { initializePythonTerminal } from "./terminal";
import type { Challenge } from "./types";
import { createPythonEditorUi } from "./ui";
import {
  getSavedSolution,
  getSolutionStorageKey,
  saveSolution,
} from "./solution-storage";

const INITIALIZED_VALUE = "true";

function moveHintIntoEditor(
  editor: HTMLElement,
  hintSlot: HTMLElement,
): number {
  let sibling = editor.previousElementSibling;

  while (sibling) {
    if (
      sibling instanceof HTMLDetailsElement &&
      sibling.matches("[data-station-hint]")
    ) {
      const content = sibling.querySelector<HTMLElement>(
        "[data-station-hint-content]",
      );

      if (!content) {
        return 0;
      }

      content.dataset.embedded = "true";
      hintSlot.append(content);
      sibling.remove();

      return 1;
    }

    if (sibling.matches("[data-python-editor]")) {
      break;
    }

    sibling = sibling.previousElementSibling;
  }

  return 0;
}

function parseChallenge(value?: string): Challenge | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value) as Challenge;
  } catch {
    throw new Error(
      "La configuración del desafío Python no contiene JSON válido.",
    );
  }
}

function initializePythonEditor(editor: HTMLElement): void {
  if (editor.dataset.pythonInitialized === INITIALIZED_VALUE) {
    return;
  }

  editor.dataset.pythonInitialized = INITIALIZED_VALUE;

  const listeners = new AbortController();

  try {
    const elements = getPythonEditorElements(editor);

    const starterCode = editor.dataset.pythonStarterCode ?? "";

    const challenge = parseChallenge(editor.dataset.pythonChallenge);

    const solutionStorageKey = getSolutionStorageKey(editor);

    const initialCode = challenge
      ? (getSavedSolution(solutionStorageKey) ?? starterCode)
      : starterCode;

    const hintCount = moveHintIntoEditor(editor, elements.hintSlot);

    elements.hintCount.textContent = String(hintCount);

    elements.hintCount.hidden = hintCount === 0;
    elements.emptyHints.hidden = hintCount > 0;

    const editorView = createPythonCodeEditor(
      elements.codeElement,
      initialCode,
      {
        onRun() {
          elements.runButton.click();
        },
      },
    );

    const ui = createPythonEditorUi(elements);

    const terminal = initializePythonTerminal(elements, ui, {
      onLayoutChange() {
        editorView.requestMeasure();
      },
    });

    const errorHelpEnabled = getErrorHelpPreference();

    elements.errorHelpToggle.checked = errorHelpEnabled;

    ui.setErrorHelpEnabled(errorHelpEnabled);

    const runner = createPythonRunner({
      challenge,
      elements,
      getCode: () => editorView.state.doc.toString(),
      onChallengePassed(code) {
        saveSolution(solutionStorageKey, code);
      },
      ui,
    });

    let destroyed = false;

    function destroy(): void {
      if (destroyed) {
        return;
      }

      destroyed = true;

      listeners.abort();
      terminal.destroy();
      runner.destroy();
      editorView.destroy();

      delete editor.dataset.pythonInitialized;
    }

    elements.errorHelpToggle.addEventListener(
      "change",
      () => {
        const enabled = elements.errorHelpToggle.checked;

        setErrorHelpPreference(enabled);
        ui.setErrorHelpEnabled(enabled);
      },
      {
        signal: listeners.signal,
      },
    );

    elements.runButton.addEventListener(
      "click",
      () => {
        if (runner.isRunning()) {
          runner.stop();

          return;
        }

        void runner.run();
      },
      {
        signal: listeners.signal,
      },
    );

    elements.resetButton.addEventListener(
      "click",
      () => {
        const executionCancelled = runner.cancel();

        editorView.dispatch({
          changes: {
            from: 0,
            to: editorView.state.doc.length,
            insert: starterCode,
          },
        });

        ui.resetCode(executionCancelled ? false : runner.isReady());

        editorView.focus();
      },
      {
        signal: listeners.signal,
      },
    );

    window.addEventListener("pagehide", destroy, {
      once: true,
      signal: listeners.signal,
    });

    document.addEventListener("astro:before-swap", destroy, {
      once: true,
      signal: listeners.signal,
    });
  } catch (error) {
    listeners.abort();

    delete editor.dataset.pythonInitialized;

    throw error;
  }
}

export function initializePythonEditors(): void {
  document
    .querySelectorAll<HTMLElement>("[data-python-editor]")
    .forEach(initializePythonEditor);
}
