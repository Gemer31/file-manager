import {createHash} from 'crypto'
import {promisify} from 'util'
import {createReadStream} from "fs";
import {pipeline} from "stream";

export async function hash(filePath) {
    const hash = createHash('sha256');
    const asyncPipeline = promisify(pipeline);
    await asyncPipeline(createReadStream(filePath), hash);
    console.log(`Hash of ${filePath} is: ${hash.digest('hex')}`);
}
