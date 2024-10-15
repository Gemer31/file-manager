import {MESSAGES} from "./constants.js";
import os from "os";

const SYSTEM_OPERATIONS = {
    CPUS: '--cpus',
    HOME_DIR: '--homedir',
    USER_NAME: '--username',
    EOL: '--EOF',
    ARCHITECTURE: '--architecture',
}

export function systemOperationValidate(operation) {
    return operation && Object.values(SYSTEM_OPERATIONS).some((item) => operation === item);
}

export function printSystemInfo(operation) {
    switch (operation) {
        case SYSTEM_OPERATIONS.HOME_DIR: {
            console.log('Home directory: ', os.homedir());
            break;
        }
        case SYSTEM_OPERATIONS.USER_NAME: {
            console.log('System user name: ', os.userInfo().username);
            break;
        }
        case SYSTEM_OPERATIONS.ARCHITECTURE: {
            console.log('This processor architecture: ', process.arch);
            break;
        }
        case SYSTEM_OPERATIONS.EOL: {
            console.log('EOL: ', JSON.stringify(os.EOL));
            break;
        }
        case SYSTEM_OPERATIONS.CPUS: {
            const res = os
                .cpus()
                .map((item) => ({
                    Model: item.model,
                    Rate: `${item.speed / 1000} GHz`
                }));
            console.log('Overall amount of CPUs: ', res.length);
            console.table(res);
            break;
        }
        default: {
            console.log(MESSAGES.invalidInput);
        }
    }
}
