
import './App.css'
import StatusPanel from './hud/StatusPanel.tsx'
import TelemetryPanel from './hud/TelemetryPanel.tsx'
import RandomScrollBox from './hud/RandomScrollBox.tsx'
import futureCircle from './assets/futureCircle.png'
import GlobeScene from "./scene/GlobeScene";
//import visserImage from "./assets/big V.jpg";

function App() {
  return (
    <main className="app-shell">
      <section id="middle">
        <div className="globe">
          <GlobeScene />
        </div>
      </section>

      <section id="topleft" className="hud-panel">
        <StatusPanel />
      </section>

      <section id="topright" className="hud-panel">
        <TelemetryPanel />
      </section>

      <section id="lowerright" className="hud-panel">
        <RandomScrollBox />
      </section>

      <section id="lowerleft" className="hud-panel">
        <div className="futuristicCircleInner">
          <img
            src={futureCircle}
            className="futureCircle"
            width="333"
            height="183"
            alt=""
          />
        </div>
      </section>

    </main>
  );
}

export default App;