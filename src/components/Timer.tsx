import { useEffect, useRef, useState } from "react";

type TimerProps = {
  onScoreChange: (score: number) => void;
  running: boolean;
  resetSignal: number;
  paused: boolean;
};

const Timer = ({ onScoreChange, running, resetSignal, paused }: TimerProps) => {
  const [points, setPoints] = useState(5);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const totalPausedDurationRef = useRef<number>(0);

  const DURATION = 6;

  // Reset
  useEffect(() => {
    clearInterval(intervalRef.current!);
    setElapsedSeconds(0);
    setPoints(5);
    onScoreChange(5);
    totalPausedDurationRef.current = 0;
    pausedAtRef.current = 0;
    startTimeRef.current = 0;
  }, [resetSignal]);

  // Pause
  useEffect(() => {
    if (!running || !paused) return;
    pausedAtRef.current = Date.now();
    clearInterval(intervalRef.current!);
  }, [paused]);

 
  useEffect(() => {
    if (!running || paused) return;

    if (pausedAtRef.current !== 0) {
      totalPausedDurationRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = 0;
    }

    if (!startTimeRef.current) startTimeRef.current = Date.now();

    intervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const elapsed = Math.min(DURATION, Math.floor((now - startTimeRef.current - totalPausedDurationRef.current) / 1000));

      setElapsedSeconds(elapsed);

     
      let newScore = 5;
      if (elapsed >= 6) {
        newScore = 1;
      } else if (elapsed >= 3) {
        newScore = 3;
      }

      setPoints(newScore);
      onScoreChange(newScore);

      if (elapsed >= DURATION) {
        clearInterval(intervalRef.current!);
      }
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [running, paused]);


  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = (circumference / DURATION) * elapsedSeconds;

  return (
    <div className="flex h-[4em] w-[4em] rounded-full flex-justify-center flex-items-center position-relative">
      <span>{points} pts</span>
      <svg className="absolute color-blue w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <circle
          className="opacity-35"
          cx="12"
          cy="12"
          r={radius}
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
        />
        <circle
          cx="12"
          cy="12"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          style={{ transition: 'stroke-dashoffset 0.25s ease' }}
        />
      </svg>
    </div>
  );
};

export default Timer;
