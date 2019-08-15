declare module '@sweet-potato/potato' {
    export class Potato {
        manipulate(): number;
        isDone(): boolean;
    }
    export function potato(soil: object): Potato;
    export function log(msg: string|any, ...sub: any[]): void;
}