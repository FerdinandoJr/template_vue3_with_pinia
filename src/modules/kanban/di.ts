import { InMemoryKanbanRepository } from "./infra/repositories/InMemoryKanbanRepository";
import { GetBoard } from "./application/usecases/GetBoard";
import { MoveTask } from "./application/usecases/MoveTask";

const repository = new InMemoryKanbanRepository();

export const getBoardUseCase = new GetBoard(repository);
export const moveTaskUseCase = new MoveTask(repository);