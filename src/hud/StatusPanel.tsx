import logo from "/knight-head-1color.png";

export default function StatusPanel() {
  return (
    <div className="StatusPanel">
      <div className="club-name">
        <p>Calvin</p>
        <p>CubeSat</p>
        <p>Club</p>
      </div>
      <img src={logo} className="club-logo" alt="Calvin CubeSat Club logo" />
    </div>
  );
}
