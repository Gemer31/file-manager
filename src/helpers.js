import {existsSync} from "fs";

export function parseInput(input) {
    const regex = /(?:[^\s"']+|"[^"]*"|'[^']*')+/g;
    const matches = input.match(regex).map(match => match.replace(/^["']|["']$/g, ''));
    return [matches[0], matches.slice(1)];
}

export async function checkPathExistOrError(path) {
    if (!existsSync(path)) throw new Error();
}

export async function checkPathNotExistOrError(path) {
    if (existsSync(path)) throw new Error();
}
