import { defineStore } from "pinia";
import { ref, inject } from "vue";
import type { KanbanColumn } from "../../domain/entities/KanbanColumn";
import { KanbanDI } from "../../di";
import { useToast } from "@/core/composables/useToast";

export const useKanbanStore = defineStore('kanban', () => {
    const getBoardUseCase = inject(KanbanDI.GetBoard)!;
    const moveTaskUseCase = inject(KanbanDI.MoveTask)!;
    
    const { showToast } = useToast();

    const columns = ref<KanbanColumn[]>([]);
    const loading = ref(false);

    const loadBoard = async () => {
        loading.value = true;
        try {
            columns.value = await getBoardUseCase.execute();
        } catch (error) {
            console.error("[KanbanStore] Erro ao carregar o quadro:", error);
            showToast("Falha ao carregar o Kanban. Tente novamente.", "error");
        } finally {
            loading.value = false;
        }
    };

    const moveCard = async (taskId: number, fromColId: string, toColId: string) => {
        const sourceCol = columns.value.find(c => c.id === fromColId);
        const targetCol = columns.value.find(c => c.id === toColId);

        if (sourceCol && targetCol) {
            const taskIndex = sourceCol.tasks.findIndex(t => t.id === taskId);
            
            if (taskIndex !== -1) {
                const [task] = sourceCol.tasks.splice(taskIndex, 1);
                
                if (task) {
                    targetCol.tasks.push(task);
                    
                    try {
                        await moveTaskUseCase.execute(taskId, fromColId, toColId);
                    } catch (error) {
                        console.error("[KanbanStore] Erro ao mover card:", error);
                        
                        targetCol.tasks.pop();
                        sourceCol.tasks.splice(taskIndex, 0, task);
                        
                        showToast("Erro de conexão. A movimentação da tarefa foi desfeita.", "error");
                    }
                }
            }
        }
    };

    return { columns, loading, loadBoard, moveCard };
});