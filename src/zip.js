import {pipeline} from "stream";
import {createReadStream, createWriteStream} from "fs";
import {createBrotliCompress, createBrotliDecompress} from 'zlib'

async function processZip(srcPath, destinationPath, brotli) {
    await pipeline(
        createReadStream(srcPath),
        brotli,
        createWriteStream(destinationPath)
    );
}

export async function compress(srcPath, destinationPath) {
    await processZip(srcPath, destinationPath, createBrotliCompress());
}

export async function decompress(srcPath, destinationPath) {
    await processZip(srcPath, destinationPath, createBrotliDecompress());
}
