# Low Orbit Satellite Visualizer

A real-time 3D satellite visualizer built with **React**, **Vite**, **Three.js**, and **React Three Fiber**.

The application displays a globe with satellite orbital information and is designed to run continuously on a TV or large display.

## Features

* Real-time 3D Earth visualization
* Live satellite position tracking
* Satellite orbital path visualization
* Starfield background
* Earth rotation based on current Greenwich Mean Sidereal Time
* Automatic camera rotation
* Automatic TLE data refresh
* Designed for 24/7 TV/display use
* URL-controlled display brightness

## Technologies

* React
* Vite
* Three.js
* React Three Fiber
* React Three Drei
* satellite.js

## Satellite Data

The visualizer currently tracks the **International Space Station (ISS)** using its NORAD catalog ID:

25544

TLE (Two-Line Element) data is loaded through the project's satellite API and automatically refreshed every **15 minutes**.

## Brightness Control

Because the visualizer is intended to run on TVs and other large displays, the brightness can be controlled directly through the URL.

The brightness value is specified after the `#` in the URL.

### Examples

Normal brightness:

https://isaiahvh7.github.io/loworbit/

25% brighter:

https://isaiahvh7.github.io/loworbit/#1.25

50% brighter:

https://isaiahvh7.github.io/loworbit/#1.5

Twice as bright:

https://isaiahvh7.github.io/loworbit/#2

Half brightness:

https://isaiahvh7.github.io/loworbit/#0.5

If no brightness value is provided, the default is:

1


The brightness value is applied using the CSS `brightness()` filter on the Three.js canvas.

The brightness can also be changed while the page is running by changing the URL hash.

## Controls

* **Scroll** — Zoom
* **Mouse drag** — Rotate the camera
* **Automatic rotation** — Enabled by default

The visualizer is primarily intended to run unattended, so manual interaction is optional.

## Running Locally

Clone the repository:

```bash
git clone https://github.com/YOUR-USERNAME/loworbit.git
cd loworbit
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will provide a local development URL, typically:

```text
http://localhost:5173
```

## Building

Create a production build:

```bash
npm run build
```

The production files will be generated in the `dist` directory.

To preview the production build locally:

```bash
npm run preview
```

## Deployment

The project is designed to be hosted using GitHub Pages.

After deployment, the visualizer can be accessed at:

```text
https://YOUR-USERNAME.github.io/loworbit/
```

Brightness can then be configured directly in the URL:

```text
https://YOUR-USERNAME.github.io/loworbit/#1.5
```

## Project Structure

A simplified overview of the project:

```text
src/
├── api/
│   └── SatelliteApi.ts
│
├── components/
│   ├── GlobeScene.tsx
│   ├── OrbitLine.tsx
│   ├── SatelliteMarker.tsx
│   └── Starfield.tsx
│
├── App.tsx
└── main.tsx

public/
└── textures/
    └── earth-outline.png
```

The exact structure may vary depending on the current project organization.

## 24/7 Display

This project is intended to be displayed continuously on a TV.

For the best results:

* Disable the TV's power-saving or eco mode.
* Increase the TV backlight if the scene appears too dark.
* Use the URL brightness control to compensate for different displays.
* Avoid leaving browser UI visible when using the visualizer as a permanent display.
* Make sure the display does not automatically turn off.

For example, a TV that appears slightly dim could use:

```text
https://YOUR-USERNAME.github.io/loworbit/#1.25
```
.
