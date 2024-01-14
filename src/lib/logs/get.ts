import { readFileSync } from "fs";

export function getLogs() {
    return readFileSync('./data/log.txt', {encoding:'utf-8'})
}