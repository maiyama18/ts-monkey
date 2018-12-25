export class Buffer {
    private buff: string;

    constructor() {
        this.buff = '';
    }

    public write(str: string): void {
        this.buff += str;
    }

    public toString(): string {
        return this.buff;
    }
}
