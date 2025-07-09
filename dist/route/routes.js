"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterRoutes = RegisterRoutes;
const runtime_1 = require("@tsoa/runtime");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const UsuarioController_1 = require("./../Controller/UsuarioController");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const LivroController_1 = require("./../Controller/LivroController");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const EmprestimoController_1 = require("./../Controller/EmprestimoController");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const models = {
    "UsuarioDto": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "double", "required": true },
            "nome": { "dataType": "string", "required": true },
            "email": { "dataType": "string", "required": true },
            "perfil": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["admin"] }, { "dataType": "enum", "enums": ["usuario"] }] },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginRequestDto": {
        "dataType": "refObject",
        "properties": {
            "email": { "dataType": "string", "required": true },
            "senha": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_Usuario.Exclude_keyofUsuario.id__": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "nome": { "dataType": "string", "required": true }, "email": { "dataType": "string", "required": true }, "senha": { "dataType": "string", "required": true }, "perfil": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["admin"] }, { "dataType": "enum", "enums": ["usuario"] }], "required": true } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Omit_Usuario.id_": {
        "dataType": "refAlias",
        "type": { "ref": "Pick_Usuario.Exclude_keyofUsuario.id__", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BasicResponseDto": {
        "dataType": "refObject",
        "properties": {
            "mensagem": { "dataType": "string", "required": true },
            "objeto": { "dataType": "any", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_Omit_UsuarioDto.id__": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "nome": { "dataType": "string" }, "email": { "dataType": "string" }, "perfil": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["admin"] }, { "dataType": "enum", "enums": ["usuario"] }] } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LivroDto": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "double", "required": true },
            "titulo": { "dataType": "string", "required": true },
            "autor": { "dataType": "string", "required": true },
            "categoria": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LivroRequestDto": {
        "dataType": "refObject",
        "properties": {
            "titulo": { "dataType": "string", "required": true },
            "autor": { "dataType": "string", "required": true },
            "categoria": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EmprestimoDto": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "double", "required": true },
            "livroId": { "dataType": "double", "required": true },
            "usuarioId": { "dataType": "double", "required": true },
            "dataEmprestimo": { "dataType": "datetime", "required": true },
            "dataDevolucao": { "dataType": "union", "subSchemas": [{ "dataType": "datetime" }, { "dataType": "enum", "enums": [null] }], "required": true },
            "dataDevolucaoPrevista": { "dataType": "datetime", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EmprestimoRequestDto": {
        "dataType": "refObject",
        "properties": {
            "livroId": { "dataType": "double", "required": true },
            "usuarioId": { "dataType": "double", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DevolucaoDto": {
        "dataType": "refObject",
        "properties": {
            "emprestimo": { "ref": "EmprestimoDto", "required": true },
            "valorMulta": { "dataType": "double", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new runtime_1.ExpressTemplateService(models, { "noImplicitAdditionalProperties": "throw-on-extras", "bodyCoercion": true });
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
function RegisterRoutes(app) {
    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################
    const argsUsuarioController_login = {
        dto: { "in": "body", "name": "dto", "required": true, "ref": "LoginRequestDto" },
        resError: { "in": "res", "name": "401", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "mensagem": { "dataType": "string", "required": true } } },
    };
    app.post('/usuarios/login', ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController)), ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController.prototype.login)), function UsuarioController_login(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUsuarioController_login, request, response });
                const controller = new UsuarioController_1.UsuarioController();
                yield templateService.apiHandler({
                    methodName: 'login',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: undefined,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsUsuarioController_cadastrarUsuario = {
        dadosCriacao: { "in": "body", "name": "dadosCriacao", "required": true, "ref": "Omit_Usuario.id_" },
        resError: { "in": "res", "name": "409", "required": true, "ref": "BasicResponseDto" },
    };
    app.post('/usuarios', ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController)), ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController.prototype.cadastrarUsuario)), function UsuarioController_cadastrarUsuario(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUsuarioController_cadastrarUsuario, request, response });
                const controller = new UsuarioController_1.UsuarioController();
                yield templateService.apiHandler({
                    methodName: 'cadastrarUsuario',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: 201,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsUsuarioController_listarTodosUsuarios = {};
    app.get('/usuarios', ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController)), ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController.prototype.listarTodosUsuarios)), function UsuarioController_listarTodosUsuarios(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUsuarioController_listarTodosUsuarios, request, response });
                const controller = new UsuarioController_1.UsuarioController();
                yield templateService.apiHandler({
                    methodName: 'listarTodosUsuarios',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: undefined,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsUsuarioController_filtrarUsuarioPorId = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
        resNaoEncontrado: { "in": "res", "name": "404", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "mensagem": { "dataType": "string", "required": true } } },
    };
    app.get('/usuarios/:id', ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController)), ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController.prototype.filtrarUsuarioPorId)), function UsuarioController_filtrarUsuarioPorId(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUsuarioController_filtrarUsuarioPorId, request, response });
                const controller = new UsuarioController_1.UsuarioController();
                yield templateService.apiHandler({
                    methodName: 'filtrarUsuarioPorId',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: undefined,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsUsuarioController_deletarUsuario = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
        resNaoEncontrado: { "in": "res", "name": "404", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "mensagem": { "dataType": "string", "required": true } } },
    };
    app.delete('/usuarios/:id', ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController)), ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController.prototype.deletarUsuario)), function UsuarioController_deletarUsuario(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUsuarioController_deletarUsuario, request, response });
                const controller = new UsuarioController_1.UsuarioController();
                yield templateService.apiHandler({
                    methodName: 'deletarUsuario',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: 204,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsUsuarioController_atualizarUsuario = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
        dadosAtualizacao: { "in": "body", "name": "dadosAtualizacao", "required": true, "ref": "Partial_Omit_UsuarioDto.id__" },
        resNaoEncontrado: { "in": "res", "name": "404", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "mensagem": { "dataType": "string", "required": true } } },
    };
    app.put('/usuarios/:id', ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController)), ...((0, runtime_1.fetchMiddlewares)(UsuarioController_1.UsuarioController.prototype.atualizarUsuario)), function UsuarioController_atualizarUsuario(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUsuarioController_atualizarUsuario, request, response });
                const controller = new UsuarioController_1.UsuarioController();
                yield templateService.apiHandler({
                    methodName: 'atualizarUsuario',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: undefined,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLivroController_cadastrarLivro = {
        dto: { "in": "body", "name": "dto", "required": true, "ref": "LivroRequestDto" },
        resError: { "in": "res", "name": "409", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "mensagem": { "dataType": "string", "required": true } } },
    };
    app.post('/livros', ...((0, runtime_1.fetchMiddlewares)(LivroController_1.LivroController)), ...((0, runtime_1.fetchMiddlewares)(LivroController_1.LivroController.prototype.cadastrarLivro)), function LivroController_cadastrarLivro(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLivroController_cadastrarLivro, request, response });
                const controller = new LivroController_1.LivroController();
                yield templateService.apiHandler({
                    methodName: 'cadastrarLivro',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: 201,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLivroController_listarTodosLivros = {};
    app.get('/livros', ...((0, runtime_1.fetchMiddlewares)(LivroController_1.LivroController)), ...((0, runtime_1.fetchMiddlewares)(LivroController_1.LivroController.prototype.listarTodosLivros)), function LivroController_listarTodosLivros(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLivroController_listarTodosLivros, request, response });
                const controller = new LivroController_1.LivroController();
                yield templateService.apiHandler({
                    methodName: 'listarTodosLivros',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: undefined,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLivroController_filtrarLivroPorId = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
        resNaoEncontrado: { "in": "res", "name": "404", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "mensagem": { "dataType": "string", "required": true } } },
    };
    app.get('/livros/:id', ...((0, runtime_1.fetchMiddlewares)(LivroController_1.LivroController)), ...((0, runtime_1.fetchMiddlewares)(LivroController_1.LivroController.prototype.filtrarLivroPorId)), function LivroController_filtrarLivroPorId(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLivroController_filtrarLivroPorId, request, response });
                const controller = new LivroController_1.LivroController();
                yield templateService.apiHandler({
                    methodName: 'filtrarLivroPorId',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: undefined,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEmprestimoController_cadastrarEmprestimo = {
        dto: { "in": "body", "name": "dto", "required": true, "ref": "EmprestimoRequestDto" },
        resError: { "in": "res", "name": "409", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "mensagem": { "dataType": "string", "required": true } } },
    };
    app.post('/emprestimos', ...((0, runtime_1.fetchMiddlewares)(EmprestimoController_1.EmprestimoController)), ...((0, runtime_1.fetchMiddlewares)(EmprestimoController_1.EmprestimoController.prototype.cadastrarEmprestimo)), function EmprestimoController_cadastrarEmprestimo(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEmprestimoController_cadastrarEmprestimo, request, response });
                const controller = new EmprestimoController_1.EmprestimoController();
                yield templateService.apiHandler({
                    methodName: 'cadastrarEmprestimo',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: 201,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEmprestimoController_devolverEmprestimo = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
        resError: { "in": "res", "name": "409", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "mensagem": { "dataType": "string", "required": true } } },
    };
    app.put('/emprestimos/:id/devolver', ...((0, runtime_1.fetchMiddlewares)(EmprestimoController_1.EmprestimoController)), ...((0, runtime_1.fetchMiddlewares)(EmprestimoController_1.EmprestimoController.prototype.devolverEmprestimo)), function EmprestimoController_devolverEmprestimo(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEmprestimoController_devolverEmprestimo, request, response });
                const controller = new EmprestimoController_1.EmprestimoController();
                yield templateService.apiHandler({
                    methodName: 'devolverEmprestimo',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: 200,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEmprestimoController_desfazerUltimaAcao = {
        resError: { "in": "res", "name": "400", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "mensagem": { "dataType": "string", "required": true } } },
    };
    app.post('/emprestimos/desfazer', ...((0, runtime_1.fetchMiddlewares)(EmprestimoController_1.EmprestimoController)), ...((0, runtime_1.fetchMiddlewares)(EmprestimoController_1.EmprestimoController.prototype.desfazerUltimaAcao)), function EmprestimoController_desfazerUltimaAcao(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEmprestimoController_desfazerUltimaAcao, request, response });
                const controller = new EmprestimoController_1.EmprestimoController();
                yield templateService.apiHandler({
                    methodName: 'desfazerUltimaAcao',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: 200,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEmprestimoController_listarTodosEmprestimos = {};
    app.get('/emprestimos', ...((0, runtime_1.fetchMiddlewares)(EmprestimoController_1.EmprestimoController)), ...((0, runtime_1.fetchMiddlewares)(EmprestimoController_1.EmprestimoController.prototype.listarTodosEmprestimos)), function EmprestimoController_listarTodosEmprestimos(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEmprestimoController_listarTodosEmprestimos, request, response });
                const controller = new EmprestimoController_1.EmprestimoController();
                yield templateService.apiHandler({
                    methodName: 'listarTodosEmprestimos',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: undefined,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEmprestimoController_filtrarEmprestimoPorId = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
        resNaoEncontrado: { "in": "res", "name": "404", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "mensagem": { "dataType": "string", "required": true } } },
    };
    app.get('/emprestimos/:id', ...((0, runtime_1.fetchMiddlewares)(EmprestimoController_1.EmprestimoController)), ...((0, runtime_1.fetchMiddlewares)(EmprestimoController_1.EmprestimoController.prototype.filtrarEmprestimoPorId)), function EmprestimoController_filtrarEmprestimoPorId(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEmprestimoController_filtrarEmprestimoPorId, request, response });
                const controller = new EmprestimoController_1.EmprestimoController();
                yield templateService.apiHandler({
                    methodName: 'filtrarEmprestimoPorId',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: undefined,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEmprestimoController_listarEmprestimosPorNomeUsuario = {
        nome: { "in": "query", "name": "nome", "required": true, "dataType": "string" },
    };
    app.get('/emprestimos/buscar-por-usuario', ...((0, runtime_1.fetchMiddlewares)(EmprestimoController_1.EmprestimoController)), ...((0, runtime_1.fetchMiddlewares)(EmprestimoController_1.EmprestimoController.prototype.listarEmprestimosPorNomeUsuario)), function EmprestimoController_listarEmprestimosPorNomeUsuario(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEmprestimoController_listarEmprestimosPorNomeUsuario, request, response });
                const controller = new EmprestimoController_1.EmprestimoController();
                yield templateService.apiHandler({
                    methodName: 'listarEmprestimosPorNomeUsuario',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: undefined,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEmprestimoController_listarEmprestimosAtrasados = {};
    app.get('/emprestimos/atrasados', ...((0, runtime_1.fetchMiddlewares)(EmprestimoController_1.EmprestimoController)), ...((0, runtime_1.fetchMiddlewares)(EmprestimoController_1.EmprestimoController.prototype.listarEmprestimosAtrasados)), function EmprestimoController_listarEmprestimosAtrasados(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEmprestimoController_listarEmprestimosAtrasados, request, response });
                const controller = new EmprestimoController_1.EmprestimoController();
                yield templateService.apiHandler({
                    methodName: 'listarEmprestimosAtrasados',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: undefined,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
