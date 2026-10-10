import { withBase } from "@/lib/paths";
import { completeRoom } from "@/lib/progress";

import { celebrate } from "./celebrate";
import {
  getExecutionTime,
  MAX_DATASET_SIZE_BYTES,
  MAX_LOADING_TIME,
} from "./constants";
import type { PythonEditorElements } from "./dom";
import {
  isRunnerMessage,
  type ParentRunnerMessage,
  type RunnerDataset,
  type RunnerMessage,
} from "./protocol";
import type { Challenge } from "./types";
import type { PythonEditorUi } from "./ui";
import { playSuccessSound } from "./success-sound";

type PythonRunnerOptions = {
  challenge?: Challenge;
  elements: PythonEditorElements;
  getCode: () => string;
  ui: PythonEditorUi;
};

export type PythonRunnerController = {
  cancel: () => boolean;
  destroy: () => void;
  isReady: () => boolean;
  isRunning: () => boolean;
  run: () => Promise<void>;
  stop: () => boolean;
};

function getUtf8Size(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

export function createPythonRunner({
  challenge,
  elements,
  getCode,
  ui,
}: PythonRunnerOptions): PythonRunnerController {
  const listeners = new AbortController();

  let isReady = false;
  let isDestroyed = false;
  let activeRequestId: string | undefined;
  let timeoutId: number | undefined;

  function clearRunTimeout(): void {
    if (timeoutId === undefined) {
      return;
    }

    window.clearTimeout(timeoutId);
    timeoutId = undefined;
  }

  function postMessage(message: ParentRunnerMessage): void {
    if (isDestroyed) {
      return;
    }

    elements.runner.contentWindow?.postMessage(message, "*");
  }

  function announceParentIsReady(): void {
    postMessage({
      type: "python-parent-ready",
    });
  }

  function resetRunner(): void {
    if (isDestroyed) {
      return;
    }

    clearRunTimeout();

    activeRequestId = undefined;
    isReady = false;

    elements.runButton.disabled = true;

    elements.runner.src = `${withBase(
      "/python-runner.html",
    )}?instance=${crypto.randomUUID()}`;
  }

  function finishRun(result: string, status: "success" | "error"): void {
    clearRunTimeout();

    activeRequestId = undefined;

    ui.showResult(result, status);
  }

  function handleExecutionStarted(
    message: Extract<RunnerMessage, { type: "python-execution-started" }>,
  ): void {
    if (isDestroyed || message.requestId !== activeRequestId) {
      return;
    }

    clearRunTimeout();

    const executionTime = getExecutionTime(challenge);

    ui.setRunning();

    timeoutId = window.setTimeout(() => {
      if (isDestroyed || message.requestId !== activeRequestId) {
        return;
      }

      ui.showExecutionTimeout(executionTime);
      resetRunner();
    }, executionTime);
  }

  function handleResult(
    message: Extract<RunnerMessage, { type: "python-result" }>,
  ): void {
    if (isDestroyed || message.requestId !== activeRequestId) {
      return;
    }

    finishRun(message.output, message.status);

    if (message.chart) {
      ui.showChart(message.chart);
    } else {
      ui.clearChart();
    }

    if (message.status !== "success" || !message.validation) {
      return;
    }

    const { feedback, passed } = message.validation;

    ui.showFeedback(feedback, passed);

    if (passed) {
      completeRoom();
      celebrate();
      playSuccessSound();
    }

    if (passed && challenge?.successHref) {
      ui.showNextLink(
        challenge.successHref,
        challenge.successLabel ?? "Continuar",
      );
    } else {
      ui.hideNextLink();
    }
  }

  function handleRunnerMessage(event: MessageEvent<unknown>): void {
    if (
      isDestroyed ||
      event.source !== elements.runner.contentWindow ||
      !isRunnerMessage(event.data)
    ) {
      return;
    }

    const message = event.data;

    switch (message.type) {
      case "python-runner-ready":
        if (!isReady) {
          isReady = true;
          ui.setReady();
        }

        break;

      case "python-execution-started":
        handleExecutionStarted(message);
        break;

      case "python-result":
        handleResult(message);
        break;
    }
  }

  async function loadDataset(): Promise<RunnerDataset | undefined> {
    if (!challenge?.dataset) {
      return undefined;
    }

    const response = await fetch(challenge.dataset.source);

    if (!response.ok) {
      throw new Error("No fue posible cargar los datos de la misión.");
    }

    const declaredSize = Number(response.headers.get("content-length"));

    if (
      Number.isFinite(declaredSize) &&
      declaredSize > MAX_DATASET_SIZE_BYTES
    ) {
      throw new Error(
        "El archivo de datos supera el límite permitido de 2 MB.",
      );
    }

    const content = await response.text();

    if (getUtf8Size(content) > MAX_DATASET_SIZE_BYTES) {
      throw new Error(
        "El archivo de datos supera el límite permitido de 2 MB.",
      );
    }

    return {
      fileName: challenge.dataset.fileName,
      content,
    };
  }

  async function run(): Promise<void> {
    if (
      isDestroyed ||
      !isReady ||
      activeRequestId ||
      !elements.runner.contentWindow
    ) {
      return;
    }

    const requestId = crypto.randomUUID();

    activeRequestId = requestId;

    ui.prepareRun();

    timeoutId = window.setTimeout(() => {
      if (isDestroyed || activeRequestId !== requestId) {
        return;
      }

      ui.showLoadingTimeout();
      resetRunner();
    }, MAX_LOADING_TIME);

    try {
      const dataset = await loadDataset();

      if (
        isDestroyed ||
        activeRequestId !== requestId ||
        !isReady ||
        !elements.runner.contentWindow
      ) {
        return;
      }

      postMessage({
        type: "run-python",
        requestId,
        code: getCode(),
        challenge,
        dataset,
      });
    } catch (error) {
      if (isDestroyed || activeRequestId !== requestId) {
        return;
      }

      clearRunTimeout();
      activeRequestId = undefined;

      ui.showUnexpectedError(error);
    }
  }

  function stop(): boolean {
    if (isDestroyed || !activeRequestId) {
      return false;
    }

    ui.showExecutionStopped();
    resetRunner();

    return true;
  }

  function cancel(): boolean {
    if (isDestroyed || !activeRequestId) {
      return false;
    }

    resetRunner();

    return true;
  }

  function destroy(): void {
    if (isDestroyed) {
      return;
    }

    isDestroyed = true;
    isReady = false;
    activeRequestId = undefined;

    clearRunTimeout();
    listeners.abort();

    elements.runner.src = "about:blank";
  }

  elements.runner.addEventListener("load", announceParentIsReady, {
    signal: listeners.signal,
  });

  window.addEventListener("message", handleRunnerMessage, {
    signal: listeners.signal,
  });

  announceParentIsReady();

  return {
    cancel,
    destroy,
    isReady: () => isReady,
    isRunning: () => activeRequestId !== undefined,
    run,
    stop,
  };
}
