import os from 'os';
import App from "./app.js";

const USER_NAME_ARG = '--username=';

const userName = process
    .argv
    ?.slice(2)
    ?.find((item) => item.startsWith(USER_NAME_ARG))
    ?.replace(USER_NAME_ARG, '')
    ?.trim() || 'Anonymous';

console.log(`Welcome to the File Manager, ${userName}`);

process.on('exit', () => {
    console.log(`Thank you for using File Manager, ${userName}, goodbye!`);
})

const app = new App(os.homedir());
await app.start();
