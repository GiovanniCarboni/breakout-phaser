# Breakout with Pahser 3

![Alt text](./public/cover.png)

live demo: https://breakoutphaser.netlify.app/

## Index
- [Running and building the project](#running-and-building-the-project)
- [Debug](#debug)
- [Scenes](#scenes)

## Running and building the project
Install the dependencies
```bash
npm install
```
To start a development server, run
```bash
npm start
```
To bundle up the project run
```bash
npm run build
```
The build artifacts will be stored in the `./dist` directory.

## Debug
Locate the debug object in `./src/scripts/debug.ts`, edit the values to test one or more behaviors.
```javascript
const debug = {
    physics: false,
    level: false, // false, 2, 3, 4 ...
    fireBall: false,
    cannons: false,
    holdBall: false,
    shortPaddle: false, // either short or long, cant be both
    longPaddle: false,
    ctxMenu: false,
}
```

## Scenes
Representation of the scene flow
```mermaid
flowchart TD
%% style %%
	linkStyle default stroke-width:2px,stroke:gray 
	classDef notInteractive fill:#2374f7,stroke:#000,stroke-width:2px %% not interactive 
	classDef menuScene fill:#fc822d,stroke:#000,stroke-width:2px %% menu scene 
	classDef game fill:#16b552,stroke:#000,stroke-width:2px %% game 
	classDef customGame fill:magenta,stroke:#000,stroke-width:2px %% custom game 
	
	L([<font color=black>Load]):::notInteractive --> LS([<font color=black>LanguageSelection]):::menuScene 
	LS --> S([<font color=black>Start]):::menuScene 
	S <--> CL([<font color=black>CreatedLevels]):::customGame 
	S <--> PU([<font color=black>Powerups]):::menuScene
	S --> UI([<font color=black>UI]):::game 
	CL <--> LE([<font color=black>LevelEditor]):::customGame 
	S --> G([<font color=black>Game]):::game 
	G <--> GO([<font color=black>GameOver]):::menuScene 
	P([<font color=black>Pause]):::menuScene --> G 
	UI --> P
	G <--> WG([<font color=black>WinGame]):::menuScene 
	LE --> G 
	P --> S 
	P <--> O([<font color=black>Options]):::menuScene 
	O <--> S 
	GO --> S 
	WG --> S
```