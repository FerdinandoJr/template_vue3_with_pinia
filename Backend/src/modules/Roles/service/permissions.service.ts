import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleTemplate, SystemModule } from '../data/permissions.entity';

const DEFAULT_MODULES = [
  {
    name: 'customer',
    displayName: 'Clientes',
    order: 0,
    features: [
      { key: 'create', displayName: 'Criar', order: 0 },
      { key: 'edit', displayName: 'Editar', order: 1 },
      { key: 'delete', displayName: 'Excluir', order: 2 },
    ],
  },
  {
    name: 'atendimentos',
    displayName: 'Atendimentos',
    order: 1,
    features: [
      { key: 'create_ticket', displayName: 'Criar Ticket', order: 0 },
      { key: 'edit_ticket', displayName: 'Editar Ticket', order: 1 },
      { key: 'delete_ticket', displayName: 'Excluir Ticket', order: 2 },
    ],
  },
  {
    name: 'chats',
    displayName: 'Chats',
    order: 2,
    features: [
      { key: 'take_over', displayName: 'Assumir Chat', order: 0 },
      { key: 'transfer_chat', displayName: 'Transferir Chat', order: 1 },
      { key: 'finish_chat', displayName: 'Encerrar Chat', order: 2 },
    ],
  },
  {
    name: 'kanban',
    displayName: 'Kanban',
    order: 3,
    features: [
      { key: 'move_cards', displayName: 'Mover Cards', order: 0 },
      { key: 'edit_cards', displayName: 'Editar Cards', order: 1 },
    ],
  },
  {
    name: 'calendar',
    displayName: 'Agenda',
    order: 4,
    features: [
      { key: 'create_event', displayName: 'Criar Evento', order: 0 },
      { key: 'edit_event', displayName: 'Editar Evento', order: 1 },
      { key: 'delete_event', displayName: 'Excluir Evento', order: 2 },
    ],
  },
  {
    name: 'relatorios',
    displayName: 'Relatórios',
    order: 5,
    features: [
      { key: 'view_metrics', displayName: 'Ver Métricas', order: 0 },
    ],
  },
  {
    name: 'kb',
    displayName: 'Base de Conhecimento',
    order: 6,
    features: [
      { key: 'create_article', displayName: 'Criar Artigo', order: 0 },
      { key: 'edit_article', displayName: 'Editar Artigo', order: 1 },
      { key: 'delete_article', displayName: 'Excluir Artigo', order: 2 },
    ],
  },
  {
    name: 'monitor',
    displayName: 'Monitor',
    order: 7,
    features: [
      { key: 'view_dashboard', displayName: 'Ver Dashboard', order: 0 },
    ],
  },
];

const DEFAULT_TEMPLATES = [
  {
    name: 'Administrador',
    isAdmin: true,
    defaultColor: '#ef4444',
    permissions: Object.fromEntries(
      DEFAULT_MODULES.map(m => [
        m.name,
        {
          active: true,
          features: Object.fromEntries(m.features.map(f => [f.key, true])),
        },
      ])
    ),
  },
  {
    name: 'Suporte',
    isAdmin: false,
    defaultColor: '#3b82f6',
    permissions: {
      customer: { active: true, features: { create: true, edit: true, delete: false } },
      atendimentos: { active: true, features: { create_ticket: true, edit_ticket: true, delete_ticket: false } },
      chats: { active: true, features: { take_over: true, transfer_chat: false, finish_chat: true } },
      kanban: { active: true, features: { move_cards: true, edit_cards: true } },
      calendar: { active: true, features: { create_event: true, edit_event: true, delete_event: true } },
      relatorios: { active: true, features: { view_metrics: true } },
      kb: { active: true, features: { create_article: false, edit_article: false, delete_article: false } },
      monitor: { active: false, features: { view_dashboard: false } },
    },
  },
  {
    name: 'Cliente',
    isAdmin: false,
    defaultColor: '#22c55e',
    permissions: {
      customer: { active: false, features: { create: false, edit: false, delete: false } },
      atendimentos: { active: true, features: { create_ticket: false, edit_ticket: false, delete_ticket: false } },
      chats: { active: false, features: { take_over: false, transfer_chat: false, finish_chat: false } },
      kanban: { active: false, features: { move_cards: false, edit_cards: false } },
      calendar: { active: false, features: { create_event: false, edit_event: false, delete_event: false } },
      relatorios: { active: false, features: { view_metrics: false } },
      kb: { active: true, features: { create_article: false, edit_article: false, delete_article: false } },
      monitor: { active: false, features: { view_dashboard: false } },
    },
  },
];

@Injectable()
export class PermissionsService implements OnModuleInit {
  constructor(
    @InjectRepository(RoleTemplate)
    private templatesRepository: Repository<RoleTemplate>,
    @InjectRepository(SystemModule)
    private modulesRepository: Repository<SystemModule>,
  ) {}

  async onModuleInit() {
    await this.seedModules();
    await this.seedTemplates();
  }

  private async seedModules() {
    const count = await this.modulesRepository.count();
    if (count === 0) {
      for (const module of DEFAULT_MODULES) {
        await this.modulesRepository.save(module);
      }
    }
  }

  private async seedTemplates() {
    const count = await this.templatesRepository.count();
    if (count === 0) {
      for (const template of DEFAULT_TEMPLATES) {
        await this.templatesRepository.save(template);
      }
    }
  }

  async getModules(): Promise<SystemModule[]> {
    return this.modulesRepository.find({ order: { order: 'ASC' } });
  }

  async getTemplates(): Promise<RoleTemplate[]> {
    return this.templatesRepository.find();
  }

  async getTemplateById(id: string): Promise<RoleTemplate | null> {
    return this.templatesRepository.findOne({ where: { id } });
  }

  async createTemplate(data: Partial<RoleTemplate>): Promise<RoleTemplate> {
    const template = this.templatesRepository.create(data);
    return this.templatesRepository.save(template);
  }

  async updateTemplate(id: string, data: Partial<RoleTemplate>): Promise<RoleTemplate> {
    const template = await this.getTemplateById(id);
    if (!template) {
      throw new Error('Template não encontrado');
    }
    Object.assign(template, data);
    return this.templatesRepository.save(template);
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.templatesRepository.delete(id);
  }

  async createModule(data: Partial<SystemModule>): Promise<SystemModule> {
    const module = this.modulesRepository.create(data);
    return this.modulesRepository.save(module);
  }

  async updateModule(id: string, data: Partial<SystemModule>): Promise<SystemModule> {
    const module = await this.modulesRepository.findOne({ where: { id } });
    if (!module) {
      throw new Error('Módulo não encontrado');
    }
    Object.assign(module, data);
    return this.modulesRepository.save(module);
  }

  async getFullPermissionsStructure(): Promise<{
    modules: SystemModule[];
    templates: RoleTemplate[];
  }> {
    const modules = await this.getModules();
    const templates = await this.getTemplates();
    return { modules, templates };
  }
}