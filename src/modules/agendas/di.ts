import { InMemoryAppointmentRepository } from "./infra/repositories/InMemoryAppointmentRepository";
import { GetAgenda } from "./application/usecases/GetAgenda";
import { CreateAppointment } from "./application/usecases/CreateAppointment";
import { ManageBlockedDates } from "./application/usecases/ManageBlockedDates";

const repository = new InMemoryAppointmentRepository();

export const getAgendaUseCase = new GetAgenda(repository);
export const createAppointmentUseCase = new CreateAppointment(repository);
export const manageBlockedDatesUseCase = new ManageBlockedDates(repository);