import { InMemorySettingsRepository } from "./infra/repositories/InMemorySettingsRepository";
import { GetSettings } from "./application/usecases/GetSettings";
import { UpdateSettings } from "./application/usecases/UpdateSettings";

const repository = new InMemorySettingsRepository();

export const getSettingsUseCase = new GetSettings(repository);
export const updateSettingsUseCase = new UpdateSettings(repository);
