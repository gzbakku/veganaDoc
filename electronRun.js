const electron = require('electron');
const proc = require('child_process');
proc.spawn(electron,["electro.js"],{stdio: [process.stdin, process.stdout, process.stderr]});
