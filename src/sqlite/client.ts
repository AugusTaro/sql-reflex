/**
 * UI スレッド側の Worker クライアント（企画書 §10 / §11）。
 * - Worker 生成直後に warmup を送り、WASM の初期化を先に済ませる（初回 Run のタイムアウトに含めない）
 * - Run ごとに ExecuteRequest を postMessage し、requestId で応答を突合する
 * - タイムアウトしたら Worker を terminate → 再生成して error を返す（暴走 SQL 対策）
 */
import type { ExecuteRequest, ExecuteResponse, WorkerResponse } from "../domain/exercise/types";

export const DEFAULT_TIMEOUT_MS = 2000;

export type SqlRunner = {
  run: (request: Omit<ExecuteRequest, "type" | "requestId">) => Promise<ExecuteResponse>;
  dispose: () => void;
};

type Pending = {
  resolve: (response: WorkerResponse) => void;
  timer?: ReturnType<typeof setTimeout>;
};

const spawnWorker = () => new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });

export const createSqlRunner = ({ timeoutMs = DEFAULT_TIMEOUT_MS } = {}): SqlRunner => {
  let nextRequestId = 1;
  const pending = new Map<number, Pending>();
  let worker: Worker;
  /** warmup の完了（成功なら undefined、失敗ならエラーメッセージ） */
  let ready: Promise<string | undefined>;

  const failAll = (message: string) => {
    for (const [requestId, entry] of pending) {
      clearTimeout(entry.timer);
      entry.resolve({ type: "error", requestId, message });
    }
    pending.clear();
  };

  const send = (
    target: Worker,
    request: Omit<ExecuteRequest, "requestId"> | { type: "warmup" },
    timer?: (requestId: number) => ReturnType<typeof setTimeout>,
  ): Promise<WorkerResponse> => {
    const requestId = nextRequestId++;
    return new Promise<WorkerResponse>((resolve) => {
      pending.set(requestId, { resolve, timer: timer?.(requestId) });
      target.postMessage({ ...request, requestId });
    });
  };

  const spawn = () => {
    worker = spawnWorker();
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const entry = pending.get(event.data.requestId);
      if (!entry) return;
      clearTimeout(entry.timer);
      pending.delete(event.data.requestId);
      entry.resolve(event.data);
    };
    worker.onerror = (event) => {
      failAll(event.message || "Worker でエラーが発生しました");
    };
    ready = send(worker, { type: "warmup" }).then((response) =>
      response.type === "error" ? response.message : undefined,
    );
  };

  const restart = () => {
    worker.terminate();
    spawn();
  };

  spawn();

  return {
    run: async (request) => {
      // 初期化が終わるまで待ち、タイムアウトの計測は SQL 実行分だけにする
      const initError = await ready;
      if (initError) return { type: "error", requestId: -1, message: initError };

      const response = await send(worker, { type: "execute", ...request }, (requestId) =>
        setTimeout(() => {
          const entry = pending.get(requestId);
          pending.delete(requestId);
          // 暴走 SQL は Worker ごと破棄して作り直す。DB は :memory: なので失うものは無い
          restart();
          entry?.resolve({
            type: "error",
            requestId,
            message: `タイムアウト（${timeoutMs / 1000} 秒）: SQL の実行を中断しました。無限再帰や巨大な結合になっていないか確認してください。`,
          });
        }, timeoutMs),
      );
      // ready は warmup 専用なので execute の応答としては来ない
      return response.type === "ready"
        ? { type: "error", requestId: response.requestId, message: "予期しない応答です" }
        : response;
    },
    dispose: () => {
      failAll("SqlRunner は破棄されました");
      worker.terminate();
    },
  };
};
