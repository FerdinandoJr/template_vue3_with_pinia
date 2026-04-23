import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPermissions } from '../../../database/postgres/user-permissions.entity';

@Injectable()
export class UserPermissionsService {
  constructor(
    @InjectRepository(UserPermissions)
    private permissionsRepository: Repository<UserPermissions>,
  ) {}

  async findByUserId(userId: string): Promise<UserPermissions | null> {
    return this.permissionsRepository.findOne({ where: { userId } });
  }

  async findAll(): Promise<UserPermissions[]> {
    return this.permissionsRepository.find();
  }

  async upsert(userId: string, permissions: Record<string, any>): Promise<UserPermissions> {
    console.log('[UserPermissionsService] upsert START - userId:', userId, 'permissions:', JSON.stringify(permissions));
    
    try {
      let userPerm = await this.permissionsRepository.findOne({ where: { userId } });
      console.log('[UserPermissionsService] Found existing:', userPerm ? userPerm.id : 'NONE');
      
      if (userPerm) {
        userPerm.permissions = permissions;
        const saved = await this.permissionsRepository.save(userPerm);
        console.log('[UserPermissionsService] Updated saved:', saved.id);
        return saved;
      } else {
        console.log('[UserPermissionsService] Creating new record');
        const newPerm = this.permissionsRepository.create({ userId, permissions });
        const saved = await this.permissionsRepository.save(newPerm);
        console.log('[UserPermissionsService] Created saved:', saved.id);
        return saved;
      }
    } catch (error) {
      console.error('[UserPermissionsService] ERROR:', error);
      throw error;
    }
  }

  async delete(userId: string): Promise<void> {
    const userPerm = await this.findByUserId(userId);
    if (userPerm) {
      await this.permissionsRepository.remove(userPerm);
    }
  }
}