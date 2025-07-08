import { Command } from "./Command";

export class CommandManager {
    private historico: Command[] = [];

    async executar(comando: Command): Promise<any> {
        const resultado = await comando.execute();
        this.historico.push(comando);
        return resultado;
    }

    async desfazer(): Promise<void> {
        const ultimoComando = this.historico.pop();
        if (ultimoComando) {
            await ultimoComando.undo();
        } else {
            console.log("Nenhum comando no histórico para ser desfeito.");
        }
    }
}