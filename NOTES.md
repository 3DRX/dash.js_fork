# Notes taken when reading the source code of dash.js

> by Jingyang Kang

Line 130 of `./samples/dash-if-reference-player/index.html` is the button that toggles "Show Options".

Around line 300 of `./samples/dash-if-reference-player/index.html` is where the ABR Strategy is selected.
Add a new group called "Custom Strategy", which can be used to select my own ABR Strategy.

Line 521 of `./samples/dash-if-reference-player/app/main.js` is the function called when selection on the UI changed.

`./src/streaming/rules/abr/ABRRulesCollection.js` is the file that use the rules.

ABR algorithms are at `./src/streaming/rules/abr/`,
    the controller of all ABR algorithms is `./src/streaming/controllers/AbrController.js`.

## How an ABR algorithm is called during the streaming process

- `./src/streaming/MediaPlayer.js` gets an instance of AbrController.

- `./src/streaming/controllers/AbrController.js` gets an instance of ABRRulesCollection.

- `./src/streaming/rules/abr/ABRRulesCollection.js` have an array of rules instances.

### The `context` parameter each rule takes in

Created in `./src/streaming/controllers/AbrController.js` line 634, `rulesContext` have following elements

```javascript
instance = {
    getMediaType,
    getMediaInfo,
    getDroppedFramesHistory,
    getCurrentRequest,
    getSwitchHistory,
    getStreamInfo,
    getScheduleController,
    getAbrController,
    getRepresentationInfo,
    useBufferOccupancyABR,
    useL2AABR,
    useLoLPABR,
    getVideoModel
};
```

