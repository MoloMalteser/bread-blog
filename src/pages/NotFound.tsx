import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const [showGame, setShowGame] = useState(false);
  const [score, setScore] = useState(0);
  const [grid, setGrid] = useState<number[][]>([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Initialize 2048 game
  const initGame = () => {
    const newGrid = Array(4).fill(null).map(() => Array(4).fill(0));
    addNewTile(newGrid);
    addNewTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setShowGame(true);
  };

  const addNewTile = (currentGrid: number[][]) => {
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (currentGrid[i][j] === 0) emptyCells.push([i, j]);
      }
    }
    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      currentGrid[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const move = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;
    
    let newGrid = grid.map(row => [...row]);
    let moved = false;
    let newScore = score;

    const moveAndMerge = (line: number[]) => {
      const filtered = line.filter(cell => cell !== 0);
      const merged: number[] = [];
      let i = 0;
      while (i < filtered.length) {
        if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
          const mergedValue = filtered[i] * 2;
          merged.push(mergedValue);
          newScore += mergedValue;
          i += 2;
          moved = true;
        } else {
          merged.push(filtered[i]);
          i++;
        }
      }
      while (merged.length < 4) merged.push(0);
      return merged;
    };

    if (direction === 'left') {
      for (let i = 0; i < 4; i++) {
        const newRow = moveAndMerge(newGrid[i]);
        if (JSON.stringify(newRow) !== JSON.stringify(newGrid[i])) moved = true;
        newGrid[i] = newRow;
      }
    } else if (direction === 'right') {
      for (let i = 0; i < 4; i++) {
        const newRow = moveAndMerge(newGrid[i].reverse()).reverse();
        if (JSON.stringify(newRow) !== JSON.stringify(newGrid[i])) moved = true;
        newGrid[i] = newRow;
      }
    } else if (direction === 'up') {
      for (let j = 0; j < 4; j++) {
        const column = [newGrid[0][j], newGrid[1][j], newGrid[2][j], newGrid[3][j]];
        const newColumn = moveAndMerge(column);
        if (JSON.stringify(newColumn) !== JSON.stringify(column)) moved = true;
        for (let i = 0; i < 4; i++) newGrid[i][j] = newColumn[i];
      }
    } else if (direction === 'down') {
      for (let j = 0; j < 4; j++) {
        const column = [newGrid[3][j], newGrid[2][j], newGrid[1][j], newGrid[0][j]];
        const newColumn = moveAndMerge(column).reverse();
        if (JSON.stringify(newColumn) !== JSON.stringify([newGrid[0][j], newGrid[1][j], newGrid[2][j], newGrid[3][j]])) moved = true;
        for (let i = 0; i < 4; i++) newGrid[i][j] = newColumn[i];
      }
    }

    if (moved) {
      addNewTile(newGrid);
      setGrid(newGrid);
      setScore(newScore);
      
      // Check for game over
      const hasEmptyCell = newGrid.some(row => row.includes(0));
      const hasPossibleMerge = newGrid.some((row, i) => 
        row.some((cell, j) => 
          (i < 3 && cell === newGrid[i + 1][j]) || 
          (j < 3 && cell === row[j + 1])
        )
      );
      if (!hasEmptyCell && !hasPossibleMerge) setGameOver(true);
    }
  };

  useEffect(() => {
    if (!showGame) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.key === 'ArrowLeft') move('left');
      else if (e.key === 'ArrowRight') move('right');
      else if (e.key === 'ArrowUp') move('up');
      else if (e.key === 'ArrowDown') move('down');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGame, grid, gameOver]);

  const getTileColor = (value: number) => {
    const colors: Record<number, string> = {
      0: 'bg-muted',
      2: 'bg-amber-200',
      4: 'bg-amber-300',
      8: 'bg-orange-400',
      16: 'bg-orange-500',
      32: 'bg-red-400',
      64: 'bg-red-500',
      128: 'bg-yellow-400',
      256: 'bg-yellow-500',
      512: 'bg-yellow-600',
      1024: 'bg-green-500',
      2048: 'bg-green-600',
    };
    return colors[value] || 'bg-primary';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-2xl w-full">
        <h1 className="text-6xl font-bold mb-4 text-foreground">404</h1>
        <p className="text-2xl text-muted-foreground mb-8">Oops! Page not found</p>
        
        {!showGame ? (
          <div className="space-y-4">
            <p className="text-muted-foreground mb-6">But hey, want to play 2048 while you're here?</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={initGame} variant="default" size="lg">
                Play 2048 🎮
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="/">Return Home</a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-bold">Score: {score}</div>
              <Button onClick={initGame} variant="outline">New Game</Button>
            </div>
            
            {gameOver && (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-4">
                <p className="text-lg font-semibold text-destructive">Game Over!</p>
                <p className="text-muted-foreground">Final Score: {score}</p>
              </div>
            )}
            
            <div className="inline-block bg-muted p-4 rounded-xl">
              <div className="grid grid-cols-4 gap-3">
                {grid.map((row, i) =>
                  row.map((cell, j) => (
                    <div
                      key={`${i}-${j}`}
                      className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-lg ${getTileColor(cell)} transition-all duration-200 font-bold text-xl ${
                        cell > 0 ? 'text-foreground' : 'text-transparent'
                      }`}
                    >
                      {cell > 0 ? cell : ''}
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground mt-4">
              Use arrow keys to play • Combine tiles to reach 2048!
            </div>
            
            {/* Mobile controls */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto md:hidden">
              <div />
              <Button onClick={() => move('up')} variant="outline" size="lg">↑</Button>
              <div />
              <Button onClick={() => move('left')} variant="outline" size="lg">←</Button>
              <div />
              <Button onClick={() => move('right')} variant="outline" size="lg">→</Button>
              <div />
              <Button onClick={() => move('down')} variant="outline" size="lg">↓</Button>
              <div />
            </div>
            
            <Button onClick={() => setShowGame(false)} variant="ghost" className="mt-4">
              Back to 404
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotFound;
