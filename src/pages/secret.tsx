import React, { useEffect, useRef, useState } from "react";
import { Toaster, toast } from "sonner";

const GRAVITY = 0.4;
const JUMP = -7;
const PIPE_WIDTH = 60;
const PIPE_GAP = 200;
const BREAD_SIZE = 40;
const BREAD_X = 80;

const getRandomPipeY = (screenHeight: number) =>
  Math.floor(Math.random() * (screenHeight - PIPE_GAP - 100)) + 50;

export default function FlappyBread() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [breadY, setBreadY] = useState(200);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState<{ x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [playing, setPlaying] = useState(false);

  const gameLoopRef = useRef<number | null>(null);

  const resize = () => {
    setScreenSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const resetGame = () => {
    setBreadY(screenSize.height / 2);
    setVelocity(0);
    setPipes([{ x: screenSize.width + 200, y: getRandomPipeY(screenSize.height) }]);
    setScore(0);
    setPlaying(true);
    toast("Los geht's, Brot! 🍞", { duration: 1500 });
  };

  const jump = () => {
    if (!playing) return;
    setVelocity(JUMP);
  };

  // Game Loop
  useEffect(() => {
    if (!playing || screenSize.height === 0) return;

    const loop = () => {
      setBreadY((prev) => Math.max(0, prev + velocity));
      setVelocity((v) => v + GRAVITY);

      setPipes((prev) =>
        prev
          .map((pipe) => ({ ...pipe, x: pipe.x - 2 }))
          .filter((pipe) => pipe.x + PIPE_WIDTH > 0)
      );

      if (pipes.length === 0 || pipes[pipes.length - 1].x < screenSize.width - 300) {
        setPipes((prev) => [
          ...prev,
          { x: screenSize.width + 100, y: getRandomPipeY(screenSize.height) },
        ]);
      }

      // Collision
      const breadTop = breadY;
      const breadBottom = breadY + BREAD_SIZE;

      for (let pipe of pipes) {
        const collidesX =
          BREAD_X + BREAD_SIZE > pipe.x && BREAD_X < pipe.x + PIPE_WIDTH;
        const collidesY =
          breadTop < pipe.y || breadBottom > pipe.y + PIPE_GAP;

        if (collidesX && collidesY) {
          toast.error("Crash! 🥲");
          setPlaying(false);
          return;
        }

        if (pipe.x + PIPE_WIDTH === BREAD_X) {
          setScore((s) => s + 1);
          toast.success("Punkt! ✨");
        }
      }

      if (breadY > screenSize.height - BREAD_SIZE || breadY < 0) {
        toast.error("Du bist runtergefallen! 💀");
        setPlaying(false);
      }

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(gameLoopRef.current!);
  }, [playing, screenSize, velocity, pipes]);

  return (
    <div
      ref={containerRef}
      onClick={jump}
      className="fixed inset-0 bg-gradient-to-b from-sky-300 to-blue-500 overflow-hidden"
    >
      <Toaster position="top-center" />
      {/* Score */}
      <div className="absolute top-4 left-4 text-white text-3xl font-bold drop-shadow-lg z-50">
        🍞 Punkte: {score}
      </div>

      {/* Brot */}
      <div
        className="absolute text-4xl z-40"
        style={{
          top: breadY,
          left: BREAD_X,
          transform: `rotate(${velocity * 2}deg)`,
        }}
      >
        🍞
      </div>

      {/* Pipes */}
      {pipes.map((pipe, i) => (
        <React.Fragment key={i}>
          <div
            className="absolute bg-green-700"
            style={{
              left: pipe.x,
              top: 0,
              width: PIPE_WIDTH,
              height: pipe.y,
            }}
          />
          <div
            className="absolute bg-green-700"
            style={{
              left: pipe.x,
              top: pipe.y + PIPE_GAP,
              width: PIPE_WIDTH,
              height: screenSize.height - (pipe.y + PIPE_GAP),
            }}
          />
        </React.Fragment>
      ))}

      {/* Start-Button */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-yellow-500 text-white font-bold rounded-xl shadow-lg hover:bg-yellow-600 transition-all text-xl"
          >
            {score > 0 ? "Nochmal spielen 🌀" : "Starten ▶️"}
          </button>
        </div>
      )}
    </div>
  );
}
