import { Injectable, Logger } from '@nestjs/common';
import { TicketStatus } from '../../modules/Tickets/data/ticket.entity';

export interface TicketStatusChangedEvent {
  ticketId: string;
  newStatus: TicketStatus;
  oldStatus?: TicketStatus;
}

export interface CardMovedEvent {
  cardId: string;
  newColumnId: string;
  oldColumnId?: string;
}

@Injectable()
export class KanbanTicketEvents {
  private readonly logger = new Logger(KanbanTicketEvents.name);

  private listeners: Map<string, Array<(data: any) => void | Promise<void>>> = new Map();

  emitTicketStatusChanged(event: TicketStatusChangedEvent): void {
    this.logger.debug(`Emitindo evento: ticket ${event.ticketId} mudou para ${event.newStatus}`);
    const callbacks = this.listeners.get('ticket.status.changed') || [];
    callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        this.logger.error(`Erro no listener de ticket.status.changed: ${error.message}`);
      }
    });
  }

  emitCardMoved(event: CardMovedEvent): void {
    this.logger.debug(`Emitindo evento: card ${event.cardId} movido para coluna ${event.newColumnId}`);
    const callbacks = this.listeners.get('card.moved') || [];
    callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        this.logger.error(`Erro no listener de card.moved: ${error.message}`);
      }
    });
  }

  on(event: string, callback: (data: any) => void | Promise<void>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data: any) => void | Promise<void>): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
}
