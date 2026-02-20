import { InMemoryAppointmentRepository } from "./infra/repositories/InMemoryAppointmentRepository";
// Descomente a linha abaixo quando for ligar com o Back-end real (Axios/Fetch)
// import { FetchAppointmentRepository } from "./infra/repositories/FetchAppointmentRepository";

import { GetAgenda } from "./application/usecases/GetAgenda";
import { CreateAppointment } from "./application/usecases/CreateAppointment";
import { ManageBlockedDates } from "./application/usecases/ManageBlockedDates";
import { CheckAppointmentConflict } from "./application/usecases/CheckAppointmentConflict";

// Para mudar para produção real, basta trocar para: const repository = new FetchAppointmentRepository();
const repository = new InMemoryAppointmentRepository();

export const getAgendaUseCase = new GetAgenda(repository);
export const createAppointmentUseCase = new CreateAppointment(repository);
export const manageBlockedDatesUseCase = new ManageBlockedDates(repository);
export const checkAppointmentConflictUseCase = new CheckAppointmentConflict(repository);