export interface Command{
    execute(): Promise<any>;
    undo(): Promise<void>;
}