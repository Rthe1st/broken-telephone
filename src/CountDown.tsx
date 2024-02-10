import { useEffect, useState } from "react";

export function CountDown(props: {
  expiryTime: number;
  onFinished: () => void;
}) {
  const { expiryTime, onFinished } = props;

  const calculateMSRemaining = (expiryTime: number): number => {
    const now = Date.now();
    if (now > expiryTime) {
      return 0;
    } else {
      return expiryTime - now;
    }
  };

  const [msRemaining, setMSRemaining] = useState(
    calculateMSRemaining(expiryTime)
  );
  const [intervalId, setIntervalId] = useState<any | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const newRemainingTime = calculateMSRemaining(expiryTime);
      if (newRemainingTime === 0) {
        // if (interval !== null) {
        //   clearInterval(interval);
        // }
        onFinished();
      }
      setMSRemaining(newRemainingTime);
    }, 100);
    setIntervalId(interval);

    return () => clearInterval(interval);
  }, [onFinished, expiryTime]);

  return (
    <div>
      <p>Seconds left: {Math.round(msRemaining / 100) / 10}</p>
    </div>
  );
}
