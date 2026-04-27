import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, UserRoleAssignment } from '../data/role.entity';
import { RoleTemplate } from '../data/permissions.entity';

interface CreateRoleDto {
  name: string;
  color?: string;
  templateId?: string;
  permissions?: Record<string, { active: boolean; features: Record<string, boolean> }>;
}

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(UserRoleAssignment)
    private userRolesRepository: Repository<UserRoleAssignment>,
    @InjectRepository(RoleTemplate)
    private templatesRepository: Repository<RoleTemplate>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultRoles();
  }

  private async seedDefaultRoles() {
    const existingRoles = await this.rolesRepository.find();
    if (existingRoles.length > 0) return;

    const templates = await this.templatesRepository.find();
    
    for (const template of templates) {
      await this.rolesRepository.save({
        name: template.name,
        color: template.defaultColor,
        isAdmin: template.isAdmin,
        permissions: template.permissions,
        order: templates.indexOf(template),
      });
    }
  }

  async findAllRoles(): Promise<Role[]> {
    return this.rolesRepository.find({ order: { order: 'ASC' } });
  }

  async findRoleById(id: string): Promise<Role | null> {
    return this.rolesRepository.findOne({ where: { id } });
  }

  async getTemplates(): Promise<RoleTemplate[]> {
    return this.templatesRepository.find();
  }

  async createRole(data: CreateRoleDto): Promise<Role> {
    const existing = await this.rolesRepository.findOne({ where: { name: data.name } });
    if (existing) {
      throw new BadRequestException('Cargo já existe');
    }

    const maxOrder = await this.rolesRepository
      .createQueryBuilder('role')
      .select('MAX(role.order)', 'max')
      .getRawOne();

    let permissions = data.permissions;

    if (data.templateId && !permissions) {
      const template = await this.templatesRepository.findOne({ where: { id: data.templateId } });
      if (template) {
        permissions = template.permissions;
      }
    }

    const role = this.rolesRepository.create({
      name: data.name,
      color: data.color || '#6366f1',
      isAdmin: false,
      order: (maxOrder?.max || 0) + 1,
      permissions: permissions || {},
    });

    return this.rolesRepository.save(role);
  }

  async updateRole(id: string, data: Partial<CreateRoleDto>): Promise<Role> {
    const role = await this.findRoleById(id);
    if (!role) {
      throw new NotFoundException('Cargo não encontrado');
    }

    if (role.isAdmin && role.name.toLowerCase() === 'administrador') {
      throw new BadRequestException('Não é permitido editar o cargo Administrador');
    }

    if (data.templateId && !data.permissions) {
      const template = await this.templatesRepository.findOne({ where: { id: data.templateId } });
      if (template) {
        data.permissions = template.permissions;
      }
    }

    Object.assign(role, data);
    return this.rolesRepository.save(role);
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.findRoleById(id);
    if (!role) {
      throw new NotFoundException('Cargo não encontrado');
    }

    if (role.isAdmin && role.name.toLowerCase() === 'administrador') {
      throw new BadRequestException('Não é permitido excluir o cargo Administrador');
    }

    await this.userRolesRepository.delete({ roleId: id });
    await this.rolesRepository.remove(role);
  }

  async reorderRoles(roleIds: string[]): Promise<Role[]> {
    for (let i = 0; i < roleIds.length; i++) {
      await this.rolesRepository.update(roleIds[i], { order: i });
    }
    return this.findAllRoles();
  }

  async assignRoleToUser(userId: string, roleId: string, tenantId: string): Promise<UserRoleAssignment> {
    const existing = await this.userRolesRepository.findOne({ where: { userId, roleId } });

    if (existing) {
      return existing;
    }

    const assignment = this.userRolesRepository.create({ userId, roleId, tenantId });
    return this.userRolesRepository.save(assignment);
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await this.userRolesRepository.delete({ userId, roleId });
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    const assignments = await this.userRolesRepository.find({ where: { userId } });
    const roles: Role[] = [];

    for (const assignment of assignments) {
      const role = await this.findRoleById(assignment.roleId);
      if (role) {
        roles.push(role);
      }
    }

    return roles;
  }

  async getUserRolesWithPermissions(userId: string): Promise<{
    roles: Role[];
    permissions: Record<string, any>;
  }> {
    const roles = await this.getUserRoles(userId);
    
    let permissions: Record<string, any> = {};
    
    for (const role of roles) {
      if (role.isAdmin) {
        return { roles, permissions: null };
      }
      
      if (role.permissions) {
        for (const [module, perms] of Object.entries(role.permissions)) {
          if (!permissions[module]) {
            permissions[module] = { active: false, features: {} };
          }
          
          const p = perms as { active: boolean; features: Record<string, boolean> };
          if (p.active) {
            permissions[module].active = true;
          }
          
          if (p.features) {
            for (const [feature, value] of Object.entries(p.features)) {
              if (value) {
                permissions[module].features[feature] = true;
              }
            }
          }
        }
      }
    }

    return { roles, permissions };
  }
}