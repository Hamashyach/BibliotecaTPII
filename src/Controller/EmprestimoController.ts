import { 
    Body, Controller, Delete, Get, Path, Post, Put, Query, Route, Tags, SuccessResponse, Res, TsoaResponse 
} from "tsoa";
import { EmprestimoService } from '../Service/EmprestimoService';
import { EmprestimoDto } from '../Models/dto/EmprestimoDto';
import { EmprestimoRequestDto } from '../Models/dto/EmprestimoRequestdto';
import { RepositoryFactory } from '../patterns/Factory/RepositoryFactory';
import { CommandManager } from "../patterns/Command/CommandManager";
import { ICalculoMultaStrategy } from "../patterns/Strategy/ICalculoMultaStrategy";
import { MultaAtrasoSimplesStrategy } from "../patterns/Strategy/implementacoes/MultaAtrasoSimplesStrategy";
import { SemMultaStrategy } from "../patterns/Strategy/implementacoes/SemMultaStrategy"; // Importar SemMultaStrategy
import { DevolucaoDto } from "../Models/dto/DevolucaoDto";


@Route("emprestimos")
@Tags("Emprestimo")
export class EmprestimoController extends Controller {
    
    private emprestimoService = new EmprestimoService(new RepositoryFactory());
    private commandManager = new CommandManager();

    @Post()
    @SuccessResponse("201", "Created")
    public async cadastrarEmprestimo(
        @Body() dto: EmprestimoRequestDto,
        @Res() resError: TsoaResponse<404 | 409, { mensagem: string }>
    ): Promise<EmprestimoDto> { 
        try {
            const novoEmprestimo = await this.emprestimoService.criar(dto);
            this.setStatus(201);
            return novoEmprestimo; 
        } catch (error: any) {
            if (error.message.includes("não encontrado")) {
                resError(404, { mensagem: error.message });
            } else if (error.message.includes("já está emprestado") || error.message.includes("atingiu o limite")) {
                resError(409, { mensagem: error.message });
            } else {
                throw error; 
            }
            return undefined as any; 
        }
    }

    /**
     * Registra a devolução de um livro a partir do ID do empréstimo.
     * @param id 
     * @param body 
     */
    @Put("{id}/devolver")
    @SuccessResponse("200", "OK")
    public async devolverEmprestimo(
        @Path() id: number,
        @Body() body: { strategyType?: string }, 
        @Res() resError: TsoaResponse<404 | 409, { mensagem: string }>
    ): Promise<DevolucaoDto> {
        try {
            let estrategia: ICalculoMultaStrategy;
            if (body.strategyType === 'sem_multa') {
                estrategia = new SemMultaStrategy();
            } else {
                estrategia = new MultaAtrasoSimplesStrategy();
            }
            
            const resultadoDevolucao = await this.emprestimoService.devolver(id, estrategia);
        
            return resultadoDevolucao;

        } catch (error: any) {
            if (error.message.includes("não encontrado")) {
                resError(404, { mensagem: error.message });
            } else if (error.message.includes("já foi devolvido")) {
                resError(409, { mensagem: error.message });
            } else {
                throw error; 
            }
            return undefined as any; 
        }
    }

    @Post("desfazer")
    @SuccessResponse("200", "OK")
    public async desfazerUltimaAcao(
        @Res() resError: TsoaResponse<400, { mensagem: string }>
    ): Promise<{ mensagem: string }> {
        try {
            await this.commandManager.desfazer();
            return { mensagem: "Última ação desfeita com sucesso." };
        } catch(error: any) {
            return resError(400, { mensagem: error.message });
        }
    }

    /**
     * Lista todos os empréstimos registrados no sistema.
     */
    @Get() // Rota: GET /emprestimos
    public async listarTodosEmprestimos(): Promise<EmprestimoDto[]> {
        return this.emprestimoService.buscarTodos();
    }

    @Get("/atrasados") // Rota: GET /emprestimos/atrasados
    public async listarEmprestimosAtrasados(
        @Res() resError: TsoaResponse<500, { mensagem: string }>
    ): Promise<EmprestimoDto[]> {
        try {
            const emprestimos = await this.emprestimoService.buscarEmprestimosAtrasados();
            return emprestimos.map(e => this.emprestimoService.emprestimoParaDto(e));
        } catch (error: any) {
            console.error("Erro no backend ao listar empréstimos atrasados:", error);
            return resError(500, { mensagem: error.message || "Erro interno do servidor ao listar empréstimos atrasados." });
        }
    }

    /**
     * Busca um empréstimo específico pelo seu ID.
     */
    @Get("{id}") // Rota: GET /emprestimos/1
    public async filtrarEmprestimoPorId(
        @Path() id: number,
        @Res() resNaoEncontrado: TsoaResponse<404, { mensagem: string }>
    ): Promise<EmprestimoDto> {
        const emprestimo = await this.emprestimoService.buscarPorId(id);
        if (!emprestimo) {
            return resNaoEncontrado(404, { mensagem: "Empréstimo não encontrado." });
        }
        return emprestimo;
    }

    /**
     * Busca empréstimos pelo nome do usuário.
     * @param nome 
     */
    @Get("buscar-por-usuario") // Rota: GET /emprestimos/buscar-por-usuario?nome=Joao
    public async listarEmprestimosPorNomeUsuario(
        @Query() nome: string
    ): Promise<EmprestimoDto[]> {
        return this.emprestimoService.buscarPorNomeUsuario(nome);
    }

    



   
}