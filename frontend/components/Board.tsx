interface BoardProps {
  board: string[];
  onCellClick: (index: number) => void;
  disabled: boolean;
}

export default function Board({ board, onCellClick, disabled }: BoardProps) {
  return (
    <div className="board">
      {board.map((cell, i) => (
        <button
          key={i}
          className={`cell ${cell.toLowerCase()}`}
          onClick={() => onCellClick(i)}
          disabled={disabled || cell !== ''}
          aria-label={`Cell ${i + 1}: ${cell || 'empty'}`}
        >
          {cell}
        </button>
      ))}
    </div>
  );
}
