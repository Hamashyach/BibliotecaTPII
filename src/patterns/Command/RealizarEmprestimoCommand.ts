import { Command } from "./Command";
import { EmprestimoService } from "../../Service/EmprestimoService";
import { EmprestimoRequestDto } from "../../Models/dto/EmprestimoRequestdto";
import { EmprestimoDto } from "../../Models/dto/EmprestimoDto";

export class RealizarEmprestimoCommand implements Command {
    // Guarda o estado do empréstimo criado para poder desfazê-lo
    private emprestimoCriado: EmprestimoDto | null = null;

    // O comando precisa do "Chef" (Service) e dos "ingredientes" (DTO)
    constructor(
        private emprestimoService: EmprestimoService,
        private dto: EmprestimoRequestDto
    ) {}

    public async execute(): Promise<EmprestimoDto> {
        console.log("Executando o comando: Realizar Empréstimo...");
        // Chama o serviço para realizar a ação principal
        this.emprestimoCriado = await this.emprestimoService.criar(this.dto);
        console.log(`Comando executado: Empréstimo ID ${this.emprestimoCriado.id} criado.`);
        return this.emprestimoCriado;
    }

    public async undo(): Promise<void> {
        // Só podemos desfazer se o comando foi executado com sucesso
        if (this.emprestimoCriado && this.emprestimoCriado.id) {
            console.log(`Desfazendo o comando: Deletando Empréstimo ID ${this.emprestimoCriado.id}...`);
            await this.emprestimoService.deletar(this.emprestimoCriado.id);
            console.log("Comando desfeito com sucesso.");
            this.emprestimoCriado = null;
        } else {
            console.log("Nada a ser desfeito.");
        }
    }
}