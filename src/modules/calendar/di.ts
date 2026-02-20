import { InMemoryAppointmentRepository } from "./infra/repositories/InMemoryAppointmentRepository";
import { GetAgenda } from "./application/usecases/GetAgenda";
import { CreateAppointment } from "./application/usecases/CreateAppointment";
import { ManageBlockedDates } from "./application/usecases/ManageBlockedDates";
import { CheckAppointmentConflict } from "./application/usecases/CheckAppointmentConflict";
import { UpdateAppointment } from "./application/usecases/UpdateAppointment";
import { DeleteAppointment } from "./application/usecases/DeleteAppointment";

const repository = new InMemoryAppointmentRepository();

export const checkAppointmentConflictUseCase = new CheckAppointmentConflict(repository);
export const getAgendaUseCase = new GetAgenda(repository);
export const createAppointmentUseCase = new CreateAppointment(repository);
export const manageBlockedDatesUseCase = new ManageBlockedDates(repository);
export const updateAppointmentUseCase = new UpdateAppointment(repository, checkAppointmentConflictUseCase);
export const deleteAppointmentUseCase = new DeleteAppointment(repository);