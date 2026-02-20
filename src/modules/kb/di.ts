import type { App, InjectionKey } from 'vue';
import { InMemoryKbRepository } from "./infra/repositories/InMemoryKbRepository";
import { GetArticles } from "./application/usecases/GetArticles";
import { GetCategories } from "./application/usecases/GetCategories";

export const KbDI = {
    GetArticles: Symbol('GetArticles') as InjectionKey<GetArticles>,
    GetCategories: Symbol('GetCategories') as InjectionKey<GetCategories>
};

export function setupKbDI(app: App) {
    const repository = new InMemoryKbRepository();
    
    app.provide(KbDI.GetArticles, new GetArticles(repository));
    app.provide(KbDI.GetCategories, new GetCategories(repository));
}