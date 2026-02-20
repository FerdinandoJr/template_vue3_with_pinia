import type { App, InjectionKey } from 'vue';
import { InMemoryAppointmentRepository } from "./infra/repositories/InMemoryAppointmentRepository";
import { GetAgenda } from "./application/usecases/GetAgenda";
import { CreateAppointment } from "./application/usecases/CreateAppointment";
import { ManageBlockedDates } from "./application/usecases/ManageBlockedDates";
import { CheckAppointmentConflict } from "./application/usecases/CheckAppointmentConflict";
import { UpdateAppointment } from "./application/usecases/UpdateAppointment";
import { DeleteAppointment } from "./application/usecases/DeleteAppointment";

export const CalendarDI = {
    GetAgenda: Symbol('GetAgenda') as InjectionKey<GetAgenda>,
    CreateAppointment: Symbol('CreateAppointment') as InjectionKey<CreateAppointment>,
    ManageBlockedDates: Symbol('ManageBlockedDates') as InjectionKey<ManageBlockedDates>,
    CheckAppointmentConflict: Symbol('CheckAppointmentConflict') as InjectionKey<CheckAppointmentConflict>,
    UpdateAppointment: Symbol('UpdateAppointment') as InjectionKey<UpdateAppointment>,
    DeleteAppointment: Symbol('DeleteAppointment') as InjectionKey<DeleteAppointment>
};

export function setupCalendarDI(app: App) {
    const repository = new InMemoryAppointmentRepository();
    
    const checkAppointmentConflict = new CheckAppointmentConflict(repository);
    
    app.provide(CalendarDI.GetAgenda, new GetAgenda(repository));
    app.provide(CalendarDI.CreateAppointment, new CreateAppointment(repository));
    app.provide(CalendarDI.ManageBlockedDates, new ManageBlockedDates(repository));
    app.provide(CalendarDI.CheckAppointmentConflict, checkAppointmentConflict);
    app.provide(CalendarDI.UpdateAppointment, new UpdateAppointment(repository, checkAppointmentConflict));
    app.provide(CalendarDI.DeleteAppointment, new DeleteAppointment(repository));
}