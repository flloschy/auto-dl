import { getLogs } from "$lib/logs/get";

export function load() {
    return {lines:getLogs().split("\n")}
}