import type { Schema, SchemaColumn, SchemaTable } from "../../domain/dataset/schema";

type Props = {
  schema: Schema;
};

/* ---- レイアウト（純関数。ErDiagram.spec.ts で検証） ---- */

export const BOX_WIDTH = 220;
export const HEADER_HEIGHT = 28;
export const ROW_HEIGHT = 22;
const COLUMN_GAP = 60;
const ROW_GAP = 28;
const PADDING = 16;
const SELF_LOOP_WIDTH = 36;

export type TableBox = {
  table: SchemaTable;
  x: number;
  y: number;
  width: number;
  height: number;
  /** 参照の深さ（参照先が無ければ 0）。列の位置に対応する */
  depth: number;
};

export type Edge = {
  from: { table: string; column: string };
  to: { table: string; column: string };
  path: string;
  self: boolean;
};

export type ErLayout = {
  width: number;
  height: number;
  boxes: TableBox[];
  edges: Edge[];
};

const boxHeight = (table: SchemaTable): number =>
  HEADER_HEIGHT + Math.max(table.columns.length, 1) * ROW_HEIGHT;

/**
 * 参照の深さを求める。参照先の無いテーブルが 0、それを参照するテーブルが 1 …。
 * 自己参照は無視する。循環参照があっても止まるように反復回数をテーブル数で打ち切る。
 */
const computeDepths = (tables: SchemaTable[]): Map<string, number> => {
  const depths = new Map<string, number>(tables.map((t) => [t.name, 0]));
  for (let i = 0; i < tables.length; i++) {
    let changed = false;
    for (const table of tables) {
      const refs = table.columns
        .map((c) => c.references?.table)
        .filter((name): name is string => name !== undefined && name !== table.name);
      const depth = refs.length === 0 ? 0 : Math.max(...refs.map((r) => depths.get(r) ?? 0)) + 1;
      if (depth !== depths.get(table.name)) {
        depths.set(table.name, depth);
        changed = true;
      }
    }
    if (!changed) break;
  }
  return depths;
};

const rowCenterY = (box: TableBox, columnName: string): number => {
  const index = Math.max(
    box.table.columns.findIndex((c) => c.name === columnName),
    0,
  );
  return box.y + HEADER_HEIGHT + index * ROW_HEIGHT + ROW_HEIGHT / 2;
};

/**
 * 外部キー列 → 参照先の主キー列への線。
 * 参照元は常に参照先より右の列にあるので、参照元の左辺から参照先の右辺へ曲線を引く。
 */
const edgePath = (from: TableBox, fromColumn: string, to: TableBox, toColumn: string): string => {
  const y1 = rowCenterY(from, fromColumn);
  const y2 = rowCenterY(to, toColumn);
  if (from === to) {
    const x = from.x + from.width;
    return `M ${x} ${y1} C ${x + SELF_LOOP_WIDTH} ${y1}, ${x + SELF_LOOP_WIDTH} ${y2}, ${x} ${y2}`;
  }
  const x1 = from.x;
  const x2 = to.x + to.width;
  const bend = (x1 - x2) / 2;
  return `M ${x1} ${y1} C ${x1 - bend} ${y1}, ${x2 + bend} ${y2}, ${x2} ${y2}`;
};

export const layoutSchema = (schema: Schema): ErLayout => {
  const depths = computeDepths(schema.tables);
  const columnTops = new Map<number, number>();
  const boxes: TableBox[] = schema.tables.map((table) => {
    const depth = depths.get(table.name) ?? 0;
    const y = columnTops.get(depth) ?? PADDING;
    const height = boxHeight(table);
    columnTops.set(depth, y + height + ROW_GAP);
    return {
      table,
      depth,
      x: PADDING + depth * (BOX_WIDTH + COLUMN_GAP),
      y,
      width: BOX_WIDTH,
      height,
    };
  });

  const byName = new Map(boxes.map((b) => [b.table.name, b]));
  const edges: Edge[] = boxes.flatMap((box) =>
    box.table.columns.flatMap((column) => {
      const ref = column.references;
      const target = ref ? byName.get(ref.table) : undefined;
      if (!ref || !target) return [];
      return [
        {
          from: { table: box.table.name, column: column.name },
          to: { table: ref.table, column: ref.column },
          path: edgePath(box, column.name, target, ref.column),
          self: target === box,
        },
      ];
    }),
  );

  const maxDepth = Math.max(0, ...boxes.map((b) => b.depth));
  const hasSelfLoop = edges.some((e) => e.self);
  return {
    width:
      PADDING * 2 +
      (maxDepth + 1) * BOX_WIDTH +
      maxDepth * COLUMN_GAP +
      (hasSelfLoop ? SELF_LOOP_WIDTH : 0),
    height: Math.max(0, ...Array.from(columnTops.values())) - ROW_GAP + PADDING,
    boxes,
    edges,
  };
};

/* ---- 描画 ---- */

const keyLabel = (column: SchemaColumn): string =>
  [column.primaryKey ? "PK" : "", column.references ? "FK" : ""].filter(Boolean).join(" ");

const ColumnRow = ({
  box,
  column,
  index,
}: {
  box: TableBox;
  column: SchemaColumn;
  index: number;
}) => {
  const y = box.y + HEADER_HEIGHT + index * ROW_HEIGHT;
  const label = keyLabel(column);
  // PK / FK ラベルの幅（"PK FK" は 2 つ分）だけ型の表示位置を左にずらす
  const labelWidth = label === "" ? 0 : label.includes(" ") ? 58 : 34;
  return (
    <g className={`er__row${column.primaryKey ? " er__row--pk" : ""}`}>
      <text x={box.x + 8} y={y + ROW_HEIGHT / 2} dominantBaseline="central">
        {column.name}
      </text>
      <text
        className="er__type"
        x={box.x + box.width - 8 - labelWidth}
        y={y + ROW_HEIGHT / 2}
        dominantBaseline="central"
        textAnchor="end"
      >
        {column.type}
      </text>
      {label && (
        <text
          className="er__key"
          x={box.x + box.width - 8}
          y={y + ROW_HEIGHT / 2}
          dominantBaseline="central"
          textAnchor="end"
        >
          {label}
        </text>
      )}
    </g>
  );
};

/**
 * schema の参照関係を SVG の ER 図として描く。
 * 外部キー列の行から参照先の主キー列の行へ線を引く（線の先端が参照先）。
 */
export const ErDiagram = ({ schema }: Props) => {
  const layout = layoutSchema(schema);
  if (layout.boxes.length === 0) return null;

  return (
    <svg
      className="er"
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      role="img"
      aria-label="ER 図"
    >
      <title>ER 図</title>
      <defs>
        <marker
          id="er-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      {layout.edges.map((edge) => (
        <path
          key={`${edge.from.table}.${edge.from.column}`}
          className="er__edge"
          d={edge.path}
          markerEnd="url(#er-arrow)"
        />
      ))}
      {layout.boxes.map((box) => (
        <g key={box.table.name} className="er__table">
          <rect
            className="er__box"
            x={box.x}
            y={box.y}
            width={box.width}
            height={box.height}
            rx={5}
          />
          <rect
            className="er__header"
            x={box.x}
            y={box.y}
            width={box.width}
            height={HEADER_HEIGHT}
            rx={5}
          />
          <rect
            className="er__header"
            x={box.x}
            y={box.y + HEADER_HEIGHT - 5}
            width={box.width}
            height={5}
          />
          <text
            className="er__name"
            x={box.x + 8}
            y={box.y + HEADER_HEIGHT / 2}
            dominantBaseline="central"
          >
            {box.table.name}
          </text>
          {box.table.columns.map((column, index) => (
            <ColumnRow key={column.name} box={box} column={column} index={index} />
          ))}
        </g>
      ))}
    </svg>
  );
};
