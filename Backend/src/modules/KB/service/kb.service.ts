import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { KbArticle } from '../data/kb.entity';

@Injectable()
export class KbService {
  constructor(
    @InjectRepository(KbArticle)
    private kbRepository: Repository<KbArticle>,
  ) {}

  async findAll(tenantId: string, category?: string): Promise<KbArticle[]> {
    const where: any = { tenantId };
    if (category) where.category = category;
    return this.kbRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<KbArticle | null> {
    return this.kbRepository.findOne({ where: { id } });
  }

  async search(tenantId: string, query: string): Promise<KbArticle[]> {
    return this.kbRepository.find({
      where: [
        { tenantId, title: ILike(`%${query}%`) },
        { tenantId, content: ILike(`%${query}%`) },
      ],
    });
  }

  async create(tenantId: string, data: Partial<KbArticle>): Promise<KbArticle> {
    const article = this.kbRepository.create({ ...data, tenantId });
    return this.kbRepository.save(article);
  }

  async update(id: string, data: Partial<KbArticle>): Promise<KbArticle> {
    const article = await this.findById(id);
    if (!article) throw new NotFoundException('Artigo não encontrado');
    Object.assign(article, data);
    return this.kbRepository.save(article);
  }

  async delete(id: string): Promise<void> {
    const article = await this.findById(id);
    if (!article) throw new NotFoundException('Artigo não encontrado');
    await this.kbRepository.remove(article);
  }

  async findCategories(tenantId: string): Promise<{ id: string; name: string }[]> {
    const articles = await this.kbRepository.find({
      where: { tenantId },
      select: ['category'],
    });
    const categoryNames = [...new Set(articles.map(a => a.category).filter(Boolean))];
    return categoryNames.map(name => ({ id: name, name }));
  }

  async createCategory(tenantId: string, name: string): Promise<{ id: string; name: string }> {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    return { id, name };
  }

  async updateCategory(id: string, name: string): Promise<{ id: string; name: string }> {
    return { id, name };
  }

  async deleteCategory(id: string): Promise<void> {
  }
}