# Dash.js fork

This repository is a fork of [dash.js](https://github.com/Dash-Industry-Forum/dash.js) v4.6.0,
this repository was not suitable to be public when started,
so the forking process is not done on GitHub, which forces the fork to be public.

This fork is for educational purposes only.

The original README of dash.js can be found [here](./original_README.md).

My [notes](./NOTES.md) while reading the source code.

## Modification

Add another ABR algorithm `./src/streaming/rules/abr/BBA0Rule.js`, with the BBA-0 algorithm described
in [A Buffer-Based Approach to Rate Adaptation](https://web.stanford.edu/class/cs244/papers/sigcomm2014-video.pdf).

I also modified the frontend HTML and controller to allow the BBA-0 ABR rule to be selected from the UI.

## Performance Test
