# PGen.xyz — is your helper for secure passwords

PGen.xyz is your helper for generating strong passwords and checking how reliable they are. The app works fully in the browser (no backend), so you can run it locally, show it on defense, and keep your data on your device.

Features

Password Generator
	•	Set password length (4–64)
	•	Choose character sets:
	•	lowercase / uppercase
	•	digits
	•	symbols
	•	One-click generation
	•	Copy to clipboard
	•	Save passwords to local history (up to 10)

Strength Checker
	•	Real-time analysis while typing
	•	Scoring (0–100) with a visual progress bar
	•	Checks for:
	•	length
	•	character variety (lower/upper/digits/symbols)
	•	repeating characters
	•	Tips list to improve password strength


Tech Stack
	•	HTML + CSS
	•	JavaScript (Vanilla)
	•	Three.js (via CDN, ES module) for the 3D hero object
	•	localStorage (history persistence)
	•	Clipboard API (copy feature)

Project Structure
	•	index.html — layout (hero + app UI)
	•	styles.css — all styling (poster hero + app cards)
	•	app.js — generator + checker logic, history, clipboard
	•	ui.js — animations, smooth scroll, scroll reveal, 3D scene

How to Run

 VS Code Live Server
	1.	Open the project folder in VS Code
	2.	Install Live Server
	3.	Right-click index.html - Open with Live Server
