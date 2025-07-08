export interface Observer {
    // O método que será chamado pelo "Sujeito" quando um evento ocorrer.
    update(data: any): void;
}