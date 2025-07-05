import React, { useEffect, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import clsx from "clsx";

const GRAVITY = 0.5;
const JUMP = -8;
const PIPE_WIDTH = 50;
const PIPE_GAP = 150;
const BREAD_SIZE = 40;
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;

const getRandomPipeY = () => Math.floor(Math.random() * (GAME_HEIGHT - PIPE_GAP - 100)) + 50;

export default function FlappyBread() {
  const [breadY, setBreadY] = useState(GAME_HEIGHT / 2);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState<{ x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [playing, setPlaying] = useState(false);

  const gameLoopRef = useRef<number | null>(null);

  const resetGame = () => {
    setBreadY(GAME_HEIGHT / 2);
    setVelocity(0);
    setPipes([{ x: GAME_WIDTH + 100, y: getRandomPipeY() }]);
    setScore(0);
    setPlaying(true);
    toast("Los geht's, kleines Brot! 🥖", { duration: 2000 });
  };

  const jump = () => {
    if (!playing) return;
    setVelocity(JUMP);
  };

  // Game loop
  useEffect(() => {
    if (!playing) return;

    const loop = () => {
      setBreadY((prev) => Math.max(0, prev + velocity));
      setVelocity((v) => v + GRAVITY);

      setPipes((prev) =>
        prev
          .map((pipe) => ({ ...pipe, x: pipe.x - 2 }))
          .filter((pipe) => pipe.x + PIPE_WIDTH > 0)
      );

      if (pipes.length === 0 || pipes[pipes.length - 1].x < GAME_WIDTH - 200) {
        setPipes((prev) => [...prev, { x: GAME_WIDTH, y: getRandomPipeY() }]);
      }

      // Collision
      const breadTop = breadY;
      const breadBottom = breadY + BREAD_SIZE;
      const breadX = 60;

      for (let pipe of pipes) {
        const pipeTop = pipe.y;
        const pipeBottom = pipe.y + PIPE_GAP;

        const collidesX = breadX + BREAD_SIZE > pipe.x && breadX < pipe.x + PIPE_WIDTH;
        const collidesY = breadTop < pipeTop || breadBottom > pipeBottom;

        if (collidesX && collidesY) {
          toast.error("Du bist gegen ein Hindernis geflogen! 💥");
          setPlaying(false);
          return;
        }

        // Scoring
        if (pipe.x + PIPE_WIDTH === breadX) {
          setScore((s) => s + 1);
          toast.success("Punkt! 🥖");
        }
      }

      // Game over: ground or top
      if (breadY > GAME_HEIGHT - BREAD_SIZE || breadY < 0) {
        toast.error("Runtergefallen! 😵");
        setPlaying(false);
      }

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(gameLoopRef.current!);
  }, [playing, breadY, velocity, pipes]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100">
      <Toaster position="top-center" />
      <h1 className="text-4xl font-bold mb-4">Flappy Bread 🥖</h1>
      <div
        className="relative overflow-hidden border-4 border-brown-500 rounded bg-blue-300"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        onClick={jump}
      >
        {/* Bread */}
        <div
          className="absolute bg-yellow-300 rounded-full border border-yellow-500 shadow-lg transition-transform"
          style={{
            top: breadY,
            left: 60,
            width: BREAD_SIZE,
            height: BREAD_SIZE,
            transform: `rotate(${velocity * 2}deg)`,
          }}
        >
          🥖
        </div>

        {/* Pipes */}
        {pipes.map((pipe, idx) => (
          <React.Fragment key={idx}>
            <div
              className="absolute bg-green-600"
              style={{
                left: pipe.x,
                top: 0,
                width: PIPE_WIDTH,
                height: pipe.y,
              }}
            />
            <div
              className="absolute bg-green-600"
              style={{
                left: pipe.x,
                top: pipe.y + PIPE_GAP,
                width: PIPE_WIDTH,
                height: GAME_HEIGHT - (pipe.y + PIPE_GAP),
              }}
            />
          </React.Fragment>
        ))}

        {/* Ground */}
        <div className="absolute bottom-0 w-full h-6 bg-brown-600" />
      </div>

      <div className="mt-4">
        <p className="text-lg">Punkte: {score}</p>
        <button
          className={clsx(
            "mt-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded",
            { hidden: playing }
          )}
          onClick={resetGame}
        >
          {score > 0 ? "Nochmal spielen 🔁" : "Spiel starten ▶️"}
        </button>
      </div>
    </div>
  );
}
