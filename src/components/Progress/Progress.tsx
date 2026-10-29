type Props = {
  solvedCount: number;
  totalCount: number;
  streak: number;
};

export const Progress = ({ solvedCount, totalCount, streak }: Props) => (
  <div className="progress">
    <span className="progress__count">
      {solvedCount} / {totalCount}
    </span>
    {streak > 0 && (
      <span className="progress__streak" title="連続正解">
        🔥 {streak}
      </span>
    )}
  </div>
);
