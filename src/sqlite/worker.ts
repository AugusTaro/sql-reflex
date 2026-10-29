/**
 * SQLite 実行用 Web Worker（企画書 §10）。
 * 旧 Worker1 / Promiser API は使わず、通常の Worker として executeRequest を配線するだけ。
 */
import type { WorkerRequest, WorkerResponse } from "../domain/exercise/types";
import { executeRequest, warmup } from "./execute";

const handle = async (request: WorkerRequest): Promise<WorkerResponse> => {
  if (request.type === "warmup") {
    try {
      await warmup();
      return { type: "ready", requestId: request.requestId };
    } catch (error) {
      return {
        type: "error",
        requestId: request.requestId,
        message: `SQLite の初期化に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
  return executeRequest(request);
};

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  self.postMessage(await handle(event.data));
};
