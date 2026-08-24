
import './App.css'
import StatusPanel from './hud/StatusPanel.tsx'
import TelemetryPanel from './hud/TelemetryPanel.tsx'
import RandomScrollBox from './hud/RandomScrollBox.tsx'
import GroundTrackMap from './hud/GroundTrackMap.tsx'
//import futureCircle from './assets/futureCircle.png'
import GlobeScene from "./scene/GlobeScene";
//import logo from "/knight-head-1color.png";
//import visserImage from "./assets/big V.jpg";

function App() {
  return (
    <main className="app-shell">
      <section id="middle">
        <div className="globe">
          <GlobeScene />
        </div>
      </section>

      <div id="topleft-stack">
        <section id="topleft" className="hud-panel">
          <StatusPanel />
        </section>

        {/* Unboxed map-style legend, stars show through behind it */}
        <div id="tracking-legend">
          <p className="legend-title">Currently Tracking</p>
          <p className="legend-item">
            <span className="legend-dot" />
            ISS
          </p>
        </div>
      </div>

      <section id="topright" className="hud-panel">
        <TelemetryPanel />
      </section>

      <section id="lowerright" className="hud-panel">
        <RandomScrollBox />
      </section>

      <section id="lowerleft" className="hud-panel">
        <GroundTrackMap />
        {/*
        <img src={logo} className="logo" width="150" height="200" alt="Logo" />
        <div className="futuristicCircleInner">
          <img
            src={futureCircle}
            className="futureCircle"
            width="333"
            height="183"
            alt=""
          />
        </div>
        */}
      </section>

    </main>
  );
}

export default App;