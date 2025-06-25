import { useEffect, useRef, useState } from "react";

type TimerProps = {
  onScoreChange: (score: number) => void;
  running: boolean;
  resetSignal: number;
  paused: boolean;
};

const Timer = ({ onScoreChange, running, resetSignal, paused }: TimerProps) => {
  const [points, setPoints] = useState(5);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const totalPausedDurationRef = useRef<number>(0);

  // Reset timer
  useEffect(() => {
    clearInterval(intervalRef.current!);
    setPoints(5);
    onScoreChange(5);
    totalPausedDurationRef.current = 0;
    pausedAtRef.current = 0;
  }, [resetSignal]);

  // Gère pause/reprise
  useEffect(() => {
    if (!running || !paused) return;

    // Pause → note l’instant
    pausedAtRef.current = Date.now();
    clearInterval(intervalRef.current!);
  }, [paused]);

  useEffect(() => {
    if (!running || paused) return;

    // Reprise
    if (pausedAtRef.current !== 0) {
      totalPausedDurationRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = 0;
    }

    startTimeRef.current = startTimeRef.current || Date.now();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - startTimeRef.current - totalPausedDurationRef.current) / 1000;

      if (elapsed >= 6) {
        clearInterval(intervalRef.current!);
        return;
      }

      if (elapsed >= 3) {
        const newPoints = Math.max(1, 3 - Math.floor(elapsed - 3));
        setPoints(newPoints);
        onScoreChange(newPoints);
      } else {
        setPoints(5);
        onScoreChange(5);
      }
    }, 100);

    return () => clearInterval(intervalRef.current!);
  }, [running, paused]);

  return <p>Points : {points}</p>;
};

export default Timer;
