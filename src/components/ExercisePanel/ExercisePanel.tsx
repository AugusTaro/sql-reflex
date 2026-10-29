import type { Exercise } from "../../domain/exercise/types";

type Props = {
  exercise: Exercise;
  solved: boolean;
};

export const ExercisePanel = ({ exercise, solved }: Props) => (
  <div className="exercise-panel">
    <div className="exercise-panel__meta">
      <span className="exercise-panel__id">{exercise.id}</span>
      <span className="exercise-panel__difficulty" title={`難易度 ${exercise.difficulty}`}>
        {"★".repeat(exercise.difficulty)}
        {"☆".repeat(5 - exercise.difficulty)}
      </span>
      {solved && <span className="exercise-panel__solved">解答済</span>}
    </div>
    <h2 className="exercise-panel__title">{exercise.title}</h2>
    <p className="exercise-panel__prompt">{exercise.prompt}</p>
    <div className="exercise-panel__tags">
      {exercise.tags.map((tag) => (
        <span key={tag} className="tag">
          {tag}
        </span>
      ))}
    </div>
    {exercise.hints && exercise.hints.length > 0 && (
      <details className="exercise-panel__hints">
        <summary>ヒント</summary>
        <ul>
          {exercise.hints.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      </details>
    )}
  </div>
);
