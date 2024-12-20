import { useEffect, useState, useReducer, useRef } from "react";
import { clamp } from "../utils/utils";

export default function ResponseTimer({
  isPaused,
  onUpdate = () => {},
  startPoints = 5,
  resetToken,
}) {
  let timer = null;
  const [time, setTime] = useState(0);
  const [points, setPoints] = useState(startPoints);
  const circleRef = useRef();

  useEffect(() => {
    setTime(0);
    setPoints(startPoints);
    onUpdate(startPoints);
    circleRef.current.style.setProperty("--transition", "0px");
  }, [resetToken]);

  useEffect(() => {
    timer = window.setInterval(() => {
      setTime((time) => (!isPaused ? (time < 11 ? time + 1 : time) : time));
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [isPaused]);

  useEffect(() => {
    setPoints(() => {
      return clamp(1, startPoints - 2 * Math.trunc(time / 5), startPoints);
    });
    if (time > 1) {
      circleRef.current.style.setProperty("--transition", "999ms");
    }
    circleRef.current.style.setProperty(
      "--progress",
      `${1 - (1 / 10) * (time - 1)}px`,
    );
    onUpdate(points);
  }, [time]);

  return (
    <div className="response-timer">
      <span className="respone-timer_value">{points}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 52 52"
        className="icon"
      >
        <circle cx="26" cy="26" r="20" pathLength="1" className="bg"></circle>
        <circle
          ref={circleRef}
          cx="26"
          cy="26"
          r="20"
          pathLength="1"
          className="progress"
        ></circle>
      </svg>
    </div>
  );
}
