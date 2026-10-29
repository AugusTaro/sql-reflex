import { MAX_RESULT_ROWS, type ResultSet } from "../../domain/exercise/types";

type Props = {
  result: ResultSet;
  truncated?: boolean;
  caption?: string;
};

const formatCell = (value: unknown): string => {
  if (value === null || value === undefined) return "NULL";
  if (value instanceof Uint8Array) return `<BLOB ${value.length} bytes>`;
  return String(value);
};

export const ResultTable = ({ result, truncated = false, caption }: Props) => {
  if (result.columns.length === 0) {
    return (
      <div className="result-table">
        {caption && <div className="result-table__caption">{caption}</div>}
        <p className="result-table__empty">結果セットなし（DDL / DML など）</p>
      </div>
    );
  }

  return (
    <div className="result-table">
      {caption && <div className="result-table__caption">{caption}</div>}
      <div className="result-table__scroll">
        <table>
          <thead>
            <tr>
              {/* 列名は重複し得るため index を key にする */}
              {result.columns.map((column, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: 列名は重複し得る
                <th key={i}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, rowIndex) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 行に一意キーが無い
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: 同上
                  <td key={cellIndex} className={cell === null ? "is-null" : undefined}>
                    {formatCell(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="result-table__footer">
        {result.rows.length} 行{truncated && `（${MAX_RESULT_ROWS} 行で打ち切り）`}
      </div>
    </div>
  );
};
