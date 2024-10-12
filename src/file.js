import fs from "fs/promises";

export async function printDirFilesList(currentPath) {
    const dirList = await fs.readdir(currentPath, {withFileTypes: true});
    const table = dirList
        ?.filter((item) => (!item.isSymbolicLink()))
        ?.sort((first, second) => (first.isFile() - second.isFile()))
        ?.map((item) => ({Name: item.name, Type: item.isFile() ? 'file' : 'directory'}));
    console.table(table);
}
