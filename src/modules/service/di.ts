import { InMemoryServiceRepository } from "./infra/repositories/InMemoryServiceRepository";
import { GetServiceHistory } from "./application/usecases/GetServiceHistory";
import { RegisterAttendance } from "./application/usecases/RegisterAttendance";

const repository = new InMemoryServiceRepository();

export const getServiceHistoryUseCase = new GetServiceHistory(repository);
export const registerAttendanceUseCase = new RegisterAttendance(repository);