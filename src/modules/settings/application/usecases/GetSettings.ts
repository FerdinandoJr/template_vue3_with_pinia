import type { ISettingsRepository } from "../../domain/repositories/ISettingsRepository";
import type { UserSettings } from "../../domain/entities/UserSettings";

export class GetSettings {
  constructor(private readonly repository: ISettingsRepository) {}

  async execute(): Promise<UserSettings> {
    return await this.repository.getSettings();
  }
}
