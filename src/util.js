export function getType(target) {
    return Object.prototype.toString.call(target).replace(/^\[object (.+)\]$/, '$1').toLowerCase();
}