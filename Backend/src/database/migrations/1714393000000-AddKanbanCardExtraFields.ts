import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddKanbanCardExtraFields1714393000000 {
  name = 'AddKanbanCardExtraFields1714393000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // priority
    await queryRunner.addColumn(
      'kanban_cards',
      new TableColumn({
        name: 'priority',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
    );

    // type
    await queryRunner.addColumn(
      'kanban_cards',
      new TableColumn({
        name: 'type',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
    );

    // customerId
    await queryRunner.addColumn(
      'kanban_cards',
      new TableColumn({
        name: 'customerId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // assignees
    await queryRunner.addColumn(
      'kanban_cards',
      new TableColumn({
        name: 'assignees',
        type: 'simple-array',
        isNullable: true,
      }),
    );

    // estimatedHours
    await queryRunner.addColumn(
      'kanban_cards',
      new TableColumn({
        name: 'estimatedHours',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
    );

    // tags
    await queryRunner.addColumn(
      'kanban_cards',
      new TableColumn({
        name: 'tags',
        type: 'jsonb',
        isNullable: true,
      }),
    );

    // checklist
    await queryRunner.addColumn(
      'kanban_cards',
      new TableColumn({
        name: 'checklist',
        type: 'jsonb',
        isNullable: true,
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('kanban_cards', 'checklist');
    await queryRunner.dropColumn('kanban_cards', 'tags');
    await queryRunner.dropColumn('kanban_cards', 'estimatedHours');
    await queryRunner.dropColumn('kanban_cards', 'assignees');
    await queryRunner.dropColumn('kanban_cards', 'customerId');
    await queryRunner.dropColumn('kanban_cards', 'type');
    await queryRunner.dropColumn('kanban_cards', 'priority');
  }
}