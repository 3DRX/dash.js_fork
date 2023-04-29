# Notes taken when reading the source code of dash.js

> by Jingyang Kang

Line 130 of `./samples/dash-if-reference-player/index.html` is the button that toggles "Show Options".

Around line 300 of `./samples/dash-if-reference-player/index.html` is where the ABR Strategy is selected.
Add a new group called "Custom Strategy", which can be used to select my own ABR Strategy.

Line 521 of `./samples/dash-if-reference-player/app/main.js` is the function called when selection on the UI changed.

`./src/streaming/rules/abr/ABRRulesCollection.js` is the file that use the rules.

ABR algorithms are at `./src/streaming/rules/abr/`,
the controller of all ABR algorithms is `./src/streaming/controllers/AbrController.js`.

