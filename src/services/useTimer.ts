import { useRef, useState } from "react";

const useTimer = (sendMessage: () => void) => {
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  function startTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      sendMessage();
      setTimerRunning(false);
    }, 4000);
    setTimerRunning(true);
  }

  function resetTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      setTimerRunning(false);
    }
  }

  return { timerRunning, startTimer, resetTimer };
};


export { useTimer }