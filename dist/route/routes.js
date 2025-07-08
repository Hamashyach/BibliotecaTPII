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
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
