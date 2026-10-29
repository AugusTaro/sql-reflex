import { SQLite, sql } from "@codemirror/lang-sql";
import { EditorState, Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { basicSetup, EditorView } from "codemirror";
import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** Cmd/Ctrl + Enter */
  onRun: () => void;
  autoFocus?: boolean;
};

/**
 * CodeMirror 6 の SQL エディタ。
 * EditorView は初回マウント時に 1 回だけ生成し、外部からの value 変更は dispatch で同期する。
 */
export const SqlEditor = ({ value, onChange, onRun, autoFocus = true }: Props) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView>(null);
  // 最新のコールバックを参照する（keymap は生成時に固定されるため）
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);
  onChangeRef.current = onChange;
  onRunRef.current = onRun;

  // value / autoFocus は初期値としてのみ使う。以後の value 同期は下の effect で行う
  // biome-ignore lint/correctness/useExhaustiveDependencies: EditorView は初回のみ生成する
  useEffect(() => {
    if (!hostRef.current) return;
    const view = new EditorView({
      parent: hostRef.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          // Mod-Enter は basicSetup の insertNewline より優先させる
          Prec.highest(
            keymap.of([
              {
                key: "Mod-Enter",
                run: () => {
                  onRunRef.current();
                  return true;
                },
              },
            ]),
          ),
          basicSetup,
          sql({ dialect: SQLite, upperCaseKeywords: true }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString());
          }),
          EditorView.theme({
            "&": { fontSize: "14px", height: "100%" },
            ".cm-scroller": { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" },
            ".cm-content": { minHeight: "200px" },
          }),
        ],
      }),
    });
    viewRef.current = view;
    if (autoFocus) view.focus();
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
  }, [value]);

  return <div ref={hostRef} className="sql-editor" />;
};
