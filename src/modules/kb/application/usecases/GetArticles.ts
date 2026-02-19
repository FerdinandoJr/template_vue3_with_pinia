import type { Article } from "../../domain/entities/Article";
import type { IKbRepository } from "../../domain/repositories/IKbRepository";

export class GetArticles {
    constructor(private readonly repository: IKbRepository) {}

    async execute(): Promise<Article[]> {
        return await this.repository.getArticles();
    }
}