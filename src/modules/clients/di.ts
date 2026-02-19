import { InMemoryClientRepository } from "./infra/repositories/InMemoryClientRepository";
import { GetClients } from "./application/usecases/GetClients";

const clientRepository = new InMemoryClientRepository();

export const getClientsUseCase = new GetClients(clientRepository);