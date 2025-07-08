import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
import { UsuarioController } from './../Controller/UsuarioController';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';