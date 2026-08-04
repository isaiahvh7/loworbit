import { useEffect, useState } from "react";


export default function StatusPanel() {
    const [counter, setCounter] = useState(0);

  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();

    const update = (currentTime: number) => {
      const delta = currentTime - lastTime;

      if (delta >= 1) {
        setCounter((prev) => prev + 1);
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(update);
    };

    animationId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <>
    <div className='StatusPanel'>
        <p>Uptime: {counter} ms</p>
        <p>Connection: STRONG</p>
        <p>Last Pass: 40 minutes ago</p>
    </div>
    </>
  );
}