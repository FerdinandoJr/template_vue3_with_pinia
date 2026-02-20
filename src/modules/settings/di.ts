import type { App, InjectionKey } from 'vue';
import { InMemorySettingsRepository } from "./infra/repositories/InMemorySettingsRepository";
import { GetSettings } from "./application/usecases/GetSettings";
import { UpdateSettings } from "./application/usecases/UpdateSettings";

export const SettingsDI = {
    GetSettings: Symbol() as InjectionKey<GetSettings>,
    UpdateSettings: Symbol() as InjectionKey<UpdateSettings>
};

export function setupSettingsDI(app: App) {
    const repository = new InMemorySettingsRepository();
    app.provide(SettingsDI.GetSettings, new GetSettings(repository));
    app.provide(SettingsDI.UpdateSettings, new UpdateSettings(repository));
}