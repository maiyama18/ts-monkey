export class Buffer {
    private buff: string;

    constructor() {
        this.buff = '';
    }

    public write(str: string): void {
        this.buff += str;
    }

    public empty(): boolean {
        return this.buff.length === 0;
    }

    public toString(): string {
        return this.buff;
    }
}
