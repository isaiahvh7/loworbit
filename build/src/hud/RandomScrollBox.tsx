import { useEffect, useRef, useState } from "react";

function RandomScrollBox() {
  const [lines, setLines] = useState<string[]>([]);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const randomMessages = [
    "SYS_CHECK :: OK",
    "PING 22.4ms",
    "RX_PACKET 0x7A91",
    "TEMP_DRIFT +0.02",
    "SIGNAL NOISE DETECTED",
    "SYNCING MODULE...",
    "DATA STREAM ACTIVE",
    "CRC PASS",
    "VECTOR OFFSET -003",
    "IDLE PROCESS RUNNING",
    "BUFFER FLUSHED",
    "SCAN COMPLETE"
  ];

  useEffect(() => {
    const interval = window.setInterval(() => {
      const msg =
        randomMessages[Math.floor(Math.random() * randomMessages.length)];

      setLines((prev: string[]) => {
        const next = [...prev, msg];
        return next.slice(-40);
      });
    }, 350);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const box = boxRef.current;

    if (box) {
      box.scrollTop = box.scrollHeight;
    }
  }, [lines]);

  return (
    <div id="scrollbox" ref={boxRef}>
      {lines.map((line, index) => (
        <p key={index}>{line}</p>
      ))}
    </div>
  );
}

export default RandomScrollBox;