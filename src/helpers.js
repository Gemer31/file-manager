import {existsSync} from "fs";

export function parseInput(input) {
    const splitted = input.split(' ');
    return [splitted[0], splitted.slice(1)];
}

export async function checkPathExistOrError(path) {
    if (!existsSync(path)) throw new Error();
}

export async function checkPathNotExistOrError(path) {
    if (existsSync(path)) throw new Error();
}
