
import { Observer } from './Observer';
import { Usuario } from '../../Models/Entity/Usuario';

export class LogObserver implements Observer {
    update(data: any): void {
        if (data instanceof Usuario) {
            console.log(`[LogObserver]: Um novo usuário foi criado com sucesso! ID: ${data.id}, Email: ${data.email}`);
        }
    }
}