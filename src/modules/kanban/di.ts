import type { App, InjectionKey } from 'vue';
import { InMemoryKanbanRepository } from "./infra/repositories/InMemoryKanbanRepository";
import { GetBoard } from "./application/usecases/GetBoard";
import { MoveTask } from "./application/usecases/MoveTask";

export const KanbanDI = {
    GetBoard: Symbol('GetBoard') as InjectionKey<GetBoard>,
    MoveTask: Symbol('MoveTask') as InjectionKey<MoveTask>
};

export function setupKanbanDI(app: App) {
    const repository = new InMemoryKanbanRepository();
    
    app.provide(KanbanDI.GetBoard, new GetBoard(repository));
    app.provide(KanbanDI.MoveTask, new MoveTask(repository));
}