import {checkPathExistOrError, checkPathNotExistOrError, parseInput} from "./helpers.js";
import {MESSAGES} from "./constants.js";
import {createInterface} from "readline/promises";
import path from "path";
import {printSystemInfo, systemOperationValidate} from "./system.js";
import {compress, decompress} from "./zip.js";
import {createReadStream, createWriteStream, existsSync} from "fs";
import {readdir, rename, rm, writeFile} from "fs/promises";
import {pipeline} from "stream/promises";
import {createHash} from "crypto";

const COMMAND_SUCCEED = {
    READ_FILE: 'cat',
    CREATE_FILE: 'add',
    RENAME_FILE: 'rn',
    COPY_FILE: 'cp',
    MOVE_FILE: 'mv',
    DELETE_FILE: 'rm',
}

const COMMANDS = {
    GO_TO_UPPER_DIR: 'up',
    GO_TO_DIR: 'cd',
    PRINT_DIR_FILES_LIST: 'ls',
    OPERATION_SYSTEM: 'os',
    HASH_FILE: 'hash',
    COMPRESS: 'compress',
    DECOMPRESS: 'decompress',
    EXIT: '.exit',
    ...COMMAND_SUCCEED,
}

export class App {
    constructor(initPath) {
        this._currentPath = initPath;
    }

    _resolvePath(p) {
        return path.resolve(this._currentPath, p);
    }

    async up() {
        await this.cd('..');
    }

    async cd(p) {
        const newPath = (existsSync(p) && p !== '..') ? p : this._resolvePath(p);
        await checkPathExistOrError(newPath);
        this._currentPath = newPath;
    }

    async cp(srcPath, destinationPath) {
        const resolvedSrcPath = this._resolvePath(srcPath);
        const resolvedDestinationPath = this._resolvePath(destinationPath);
        await checkPathExistOrError(resolvedSrcPath);
        await checkPathNotExistOrError(resolvedDestinationPath);
        await pipeline(
            createReadStream(resolvedSrcPath),
            createWriteStream(resolvedDestinationPath),
        );
    }

    async mv(srcPath, destinationPath) {
        await this.cp(srcPath, destinationPath);
        await this.rm(srcPath);
    }

    async cat(srcPath) {
        const resolvedPath = this._resolvePath(srcPath);
        await checkPathExistOrError(resolvedPath);
        const stream = createReadStream(resolvedPath, 'utf-8');
        stream.pipe(process.stdout);
        await new Promise((resolve, reject) => {
            stream.on('error', reject);
            stream.on('end', resolve);
        });
    }

    async add(srcPath) {
        const resolvedSrcPath = this._resolvePath(srcPath);
        await checkPathNotExistOrError(resolvedSrcPath);
        await writeFile(resolvedSrcPath, '', {flag: 'wx'});
    }

    async rm(srcPath) {
        const resolvedSrcPath = this._resolvePath(srcPath);
        await checkPathExistOrError(resolvedSrcPath);
        await rm(resolvedSrcPath);
    }

    async rn(srcPath, destinationPath) {
        const resolvedSrcPath = this._resolvePath(srcPath);
        const resolvedDestinationPath = this._resolvePath(destinationPath);
        await checkPathExistOrError(this._resolvePath(srcPath));
        await rename(resolvedSrcPath, resolvedDestinationPath);
    }

    async hash(srcPath) {
        const resolvedSrcPath = this._resolvePath(srcPath);
        await checkPathExistOrError(resolvedSrcPath);
        const hash = createHash('sha256');
        await pipeline(createReadStream(resolvedSrcPath), hash);
        console.log(`Hash of ${resolvedSrcPath} is: ${hash.digest('hex')}`);
    }

    async ls() {
        const dirList = await readdir(this._currentPath, {withFileTypes: true});
        const table = dirList
            ?.filter((item) => (!item.isSymbolicLink()))
            ?.sort((first, second) => (first.isFile() - second.isFile()))
            ?.map((item) => ({Name: item.name, Type: item.isFile() ? 'file' : 'directory'}));
        console.table(table);
    }

    async os(operation) {
        printSystemInfo(operation);
    }

    async compress(srcPath, destinationPath) {
        const resolvedSrcPath = this._resolvePath(srcPath);
        const resolvedDestinationPath = this._resolvePath(destinationPath);
        await checkPathExistOrError(resolvedSrcPath);
        await checkPathNotExistOrError(resolvedDestinationPath);
        await compress(resolvedSrcPath, resolvedDestinationPath);
    }

    async decompress(srcPath, destinationPath) {
        const resolvedSrcPath = this._resolvePath(srcPath);
        const resolvedDestinationPath = this._resolvePath(destinationPath);
        await checkPathExistOrError(resolvedSrcPath);
        await checkPathNotExistOrError(resolvedDestinationPath);
        await decompress(resolvedSrcPath, resolvedDestinationPath);
    }

    validate(command, args) {
        switch (command) {
            case COMMANDS.GO_TO_UPPER_DIR:
            case COMMANDS.PRINT_DIR_FILES_LIST: {
                return true
            }

            case COMMANDS.CREATE_FILE:
            case COMMANDS.GO_TO_DIR:
            case COMMANDS.READ_FILE:
            case COMMANDS.DELETE_FILE:
            case COMMANDS.HASH_FILE: {
                return args[0];
            }

            case COMMANDS.RENAME_FILE:
            case COMMANDS.COPY_FILE:
            case COMMANDS.MOVE_FILE:
            case COMMANDS.COMPRESS:
            case COMMANDS.DECOMPRESS: {
                return args[0] && args[1];
            }

            case COMMANDS.OPERATION_SYSTEM: {
                return systemOperationValidate(args[0]);
            }

            default:
                return false;
        }
    }

    async start() {
        const rl = createInterface({input: process.stdin, output: process.stdout, terminal: false});

        while (true) {
            const input = await rl.question(`You are currently in ${this._currentPath}\n`);
            const [command, args] = parseInput(input);

            if (command === COMMANDS.EXIT) process.exit(0);

            if (this.validate(command, args)) {
                try {
                    await this[command](...args);

                    if (Object.values(COMMAND_SUCCEED).includes(command)) {
                        console.log('\n' + MESSAGES.operationSuccessful);
                    }
                } catch {
                    console.log(MESSAGES.operationFailed);
                }
            } else {
                console.log(MESSAGES.invalidInput);
            }
        }
    }
}
