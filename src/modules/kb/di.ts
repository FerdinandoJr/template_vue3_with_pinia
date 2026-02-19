import { InMemoryKbRepository } from "./infra/repositories/InMemoryKbRepository";
import { GetArticles } from "./application/usecases/GetArticles";
import { GetCategories } from "./application/usecases/GetCategories";

const repository = new InMemoryKbRepository();

export const getArticlesUseCase = new GetArticles(repository);
export const getCategoriesUseCase = new GetCategories(repository);