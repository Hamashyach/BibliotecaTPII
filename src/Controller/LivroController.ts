import { Body, Query, Controller, Get, Path, Post, Put, Route, Tags, SuccessResponse, Res, TsoaResponse } from "tsoa";
import { LivroService } from '../Service/LivroService';
import { LivroDto } from '../Models/dto/LivroDto';
import { LivroRequestDto } from '../Models/dto/LivroRequestDto';
import { RepositoryFactory } from '../patterns/Factory/RepositoryFactory';


@Route("livros")
@Tags("Livro")
export class LivroController extends Controller {
    
    private livroService = new LivroService(new RepositoryFactory());

    @Post()
    @SuccessResponse("201", "Created")
    public async cadastrarLivro(
        @Body() dto: LivroRequestDto,
        @Res() resError: TsoaResponse<409, { mensagem: string }>
    ): Promise<LivroDto> {
        try {
            const novoLivro = await this.livroService.criar(dto);
            this.setStatus(201);
            return novoLivro;
        } catch (error: any) {
            if (error.message.includes("já existe")) {
                return resError(409, { mensagem: error.message });
            }
            throw error;
        }
    }

    @Get()
    public async listarTodosLivros(): Promise<LivroDto[]> {
        return this.livroService.buscarTodos();
    }

    /**
     * Lista livros, com opção de filtro por termo (título, autor, categoria, ID).
     * @param termo 
     */
    @Get("/buscar") // Rota: GET /livros/buscar?termo=exemplo
    public async buscarLivrosComFiltro(
        @Query() termo?: string
    ): Promise<LivroDto[]> {
        return this.livroService.buscarLivrosComFiltro(termo);
    }

    @Get("{id}")
    public async filtrarLivroPorId(
        @Path() id: number,
        @Res() resNaoEncontrado: TsoaResponse<404, { mensagem: string }>
    ): Promise<LivroDto> {
        const livro = await this.livroService.buscarPorId(id);
        if (!livro) {
            return resNaoEncontrado(404, { mensagem: "Livro não encontrado." });
        }
        return livro;
    }

    
}