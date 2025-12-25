import { Chamado } from './chamado';
import { Instalacao } from './instalacao';

/**
 * Union type representing all service types in the agenda
 */
export type ServicoAgenda = Chamado | Instalacao;
