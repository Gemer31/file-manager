import {parseInput} from "./utils.js";
import {MESSAGES} from "./constants.js";
import {createInterface} from "readline/promises";
import path from "path";
import {printSystemInfo, systemOperationValidate} from "./system.js";
import {printDirFilesList} from "./file.js";

const COMMANDS = {
    GO_TO_UPPER_DIR: 'up',
    GO_TO_DIR: 'cd',
    PRINT_DIR_FILES_LIST: 'ls',
    READ_FILE: 'cat',
    CREATE_FILE: 'add',
    RENAME_FILE: 'rn',
    COPY_FILE: 'cp',
    MOVE_FILE: 'mv',
    DELETE_FILE: 'rm',
    EXIT: '.exit',
    OPERATION_SYSTEM: 'os',
    HASH_FILE: 'hash',
    COMPRESS: 'compress',
    DECOMPRESS: 'decompress'
}

export class App {

    constructor(initPath) {
        this._currentPath = initPath;
    }

    _resolvePath(p) {
        return path.resolve(this._currentPath, p);
    }

    async ls() {
        await printDirFilesList(this._resolvePath(this._currentPath));
    }

    async os([operation]) {
        printSystemInfo(operation);
    }

    validate(command, args) {
        switch (command) {
            case COMMANDS.PRINT_DIR_FILES_LIST: {
                return true
            }
            case COMMANDS.OPERATION_SYSTEM: {
                return systemOperationValidate(args[0]);
            }
            default:
                return false;
        }
    }

    async start() {
        const rl = createInterface(process.stdin, process.stdout);

        while (true) {
            const input = await rl.question(`You are currently in ${this._currentPath}\n`);
            const [command, args] = parseInput(input);

            if (command === COMMANDS.EXIT) process.exit(0);

            if (this.validate(command, args)) {
                try {
                    await this[command](args);
                } catch {
                    console.log(MESSAGES.operationFailed);
                }
            } else {
                console.log(MESSAGES.invalidInput);
            }
        }
    }
}
