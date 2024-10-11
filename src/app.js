import path from 'path';
import {createInterface} from 'readline/promises'
import {COMMANDS, MESSAGES} from "./constants.js";

export default class App {
    constructor(initPath) {
        this._currentPath = initPath;
    }

    _resolvePath(p) {
        return path.resolve(this._currentPath, p);
    }

    validate(command, args) {
        switch (command) {
            case COMMANDS.GO_TO_UPPER_DIR:
            case COMMANDS.PRINT_DIR_FILES_LIST: {
                return true
            }

            case COMMANDS.GO_TO_DIR:
            case COMMANDS.READ_FILE:
            case COMMANDS.DELETE_FILE:
            case COMMANDS.OPERATION_SYSTEM:
            case COMMANDS.HASH_FILE: {
                return args[0];
            }

            case COMMANDS.MOVE_FILE:
            case COMMANDS.COPY_FILE:
            case COMMANDS.COMPRESS:
            case COMMANDS.DECOMPRESS: {
                return args[0] && args[1];
            }

            case COMMANDS.CREATE_FILE: {
                return args[0] /*&& isPathToFile(args[0]);*/
            }

            case COMMANDS.RENAME_FILE: {
                return args[0] && args[1] /*&& isPathToFile(args[1]);*/;
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

function parseInput(input) {
    const splitted = input.split(' ');
    return [splitted[0], splitted.slice(1)];
}
