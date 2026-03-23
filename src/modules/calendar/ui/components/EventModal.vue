<template>
    <el-dialog :model-value="isOpen" :title="isEditing ? 'Editar Registo' : 'Novo Agendamento'" width="800px"
        @close="handleClose" destroy-on-close :close-on-click-modal="false"
        class="rounded-xl overflow-hidden custom-event-modal">

        <el-form ref="ruleFormRef" :model="form" :rules="rules" label-position="top" status-icon>

            <div class="mx-6 mt-4 mb-2 bg-slate-100 p-1 rounded-xl flex shadow-inner">
                <div @click="form.isBlocker = false"
                    :class="!form.isBlocker ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'"
                    class="flex-1 text-center py-2.5 rounded-lg font-black text-[11px] uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-2">
                    <el-icon>
                        <Calendar />
                    </el-icon> Agendamento
                </div>
                <div @click="form.isBlocker = true"
                    :class="form.isBlocker ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'"
                    class="flex-1 text-center py-2.5 rounded-lg font-black text-[11px] uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-2">
                    <el-icon>
                        <Lock />
                    </el-icon> Bloqueio de Horário
                </div>
            </div>

            <el-tabs v-model="activeTab" class="px-2">
                <el-tab-pane name="general">
                    <template #label>
                        <span class="flex items-center gap-1.5 font-bold">
                            <el-icon><EditPen /></el-icon> Geral
                        </span>
                    </template>
                    <div class="mt-2">
                        <div class="flex gap-4 items-end">
                            <el-form-item :label="form.isBlocker ? 'Motivo do Bloqueio' : 'Título'" prop="title"
                                class="flex-1 !mb-4">
                                <el-input v-model="form.title"
                                    :placeholder="form.isBlocker ? 'Ex: Horário de Almoço, Feriado...' : 'Ex: Reunião Comercial'"
                                    size="large" />
                            </el-form-item>

                            <el-form-item v-if="!form.isBlocker" label="Cor" class="!mb-4">
                                <el-popover placement="bottom-end" :width="240" trigger="click">
                                    <template #reference>
                                        <div
                                            class="flex items-center gap-2 cursor-pointer h-10 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
                                            <div class="w-5 h-5 rounded-full border border-black/10 shadow-inner"
                                                :style="{ backgroundColor: form.colorHex }"></div>
                                            <el-icon class="text-slate-400">
                                                <ArrowDown />
                                            </el-icon>
                                        </div>
                                    </template>

                                    <div class="p-1">
                                        <div class="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
                                            Cores do Evento</div>
                                        <div class="flex flex-wrap gap-2.5">
                                            <div v-for="color in preDefinedColors" :key="color.hex"
                                                @click="selectType(color)"
                                                class="w-7 h-7 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 shadow-sm border border-black/10 hover:scale-110"
                                                :class="form.colorHex === color.hex ? 'ring-2 ring-offset-2 scale-110' : ''"
                                                :style="{ backgroundColor: color.hex, '--tw-ring-color': color.hex }">
                                                <transition name="scale-check">
                                                    <el-icon v-if="form.colorHex === color.hex"
                                                        class="text-white font-extrabold text-[11px]">
                                                        <Check />
                                                    </el-icon>
                                                </transition>
                                            </div>
                                        </div>
                                    </div>
                                </el-popover>
                            </el-form-item>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <el-form-item label="Aplicar à agenda de:" prop="userId"
                                :class="form.isBlocker ? 'col-span-2' : ''">
                                <el-select v-model="form.userId" class="!w-full"
                                    placeholder="Selecione de quem é a agenda">
                                    <template #prefix><el-icon>
                                            <User />
                                        </el-icon></template>
                                    <el-option v-for="user in store.availableUsers" :key="user.id" :label="user.name"
                                        :value="user.id" />
                                </el-select>
                            </el-form-item>

                            <el-form-item v-if="!form.isBlocker" label="Cliente" prop="client">
                                <el-select v-model="form.client" placeholder="Selecione o Cliente" filterable remote
                                    :remote-method="searchClients" :loading="loadingClients" class="!w-full">
                                    <template #prefix><el-icon>
                                            <Briefcase />
                                        </el-icon></template>
                                    <el-option v-for="client in clientOptions" :key="client.id" :label="client.name"
                                        :value="client.name" />
                                </el-select>
                            </el-form-item>
                        </div>

                        <div class="grid grid-cols-3 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                            <el-form-item label="Data" prop="date" class="!mb-0">
                                <el-date-picker v-model="form.date" type="date" format="DD/MM/YYYY"
                                    value-format="YYYY-MM-DD" class="!w-full" :prefix-icon="Calendar"
                                    :clearable="false" />
                            </el-form-item>

                            <el-form-item label="Horário Início" class="!mb-0" prop="time">
                                <el-time-select v-model="form.time" start="00:00" step="00:15" end="23:45"
                                    class="!w-full" placeholder="Início" @change="handleStartTimeChange"
                                    :clearable="false" />
                            </el-form-item>

                            <el-form-item label="Horário Fim" class="!mb-0" prop="endTime">
                                <el-time-select v-model="form.endTime" :min-time="form.time" start="00:00" step="00:15"
                                    end="23:45" class="!w-full" placeholder="Fim" :clearable="false" />
                            </el-form-item>
                        </div>
                    </div>
                </el-tab-pane>

                <el-tab-pane name="details">
                    <template #label>
                        <span class="flex items-center gap-1.5 font-bold">
                            <el-icon><Document /></el-icon> Conteúdo da Reunião
                        </span>
                    </template>
                    <div class="mt-2">
                        <el-form-item label="Descrição / Notas" prop="description">
                            <div
                                class="w-full rounded-xl border border-slate-300 transition-all overflow-hidden bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 shadow-sm flex flex-col">
                                <QuillEditor v-model:content="form.description" contentType="html" theme="snow"
                                    toolbar="full"
                                    placeholder="Cole prints, crie listas, e digite detalhes adicionais..." />
                            </div>
                        </el-form-item>

                        <template v-if="!form.isBlocker">
                            <el-form-item label="Faturamento">
                                <div class="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200 w-full transition-all duration-300"
                                    :class="form.hasBilling ? 'bg-green-50 border-green-200' : ''">
                                    <el-switch v-model="form.hasBilling" active-color="#10b981" />
                                    <span v-if="form.hasBilling"
                                        class="text-sm font-medium text-green-700 transition-colors">
                                        <el-icon class="mr-1 translate-y-[2px]">
                                            <Money />
                                        </el-icon>
                                        Este agendamento gerará uma cobrança ao cliente.
                                    </span>
                                    <span v-else class="text-sm font-medium text-slate-500 transition-colors">
                                        <el-icon class="mr-1 translate-y-[2px]">
                                            <Money />
                                        </el-icon>
                                        Sem cobrança associada.
                                    </span>
                                </div>
                            </el-form-item>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                                <el-form-item label="CEP (Opcional)" class="md:col-span-1">
                                    <el-input v-model="form.cep" placeholder="00000-000" @input="formatAndSearchCep"
                                        maxlength="9">
                                        <template #prefix><el-icon>
                                                <Search />
                                            </el-icon></template>
                                    </el-input>
                                </el-form-item>

                                <el-form-item label="Local / Endereço" class="md:col-span-2">
                                    <el-input v-model="form.address" placeholder="Ex: Rua, Número, ou Link do Meet">
                                        <template #prefix><el-icon>
                                                <Location />
                                            </el-icon></template>
                                    </el-input>
                                </el-form-item>
                            </div>
                        </template>

                        <el-form-item label="Responsável da Ação">
                            <el-input v-model="form.createdBy" disabled>
                                <template #prefix><el-icon>
                                        <UserFilled />
                                    </el-icon></template>
                            </el-input>
                        </el-form-item>
                    </div>
                </el-tab-pane>

                <el-tab-pane name="postMeeting" v-if="!form.isBlocker">
                    <template #label>
                        <span class="flex items-center gap-1.5 font-bold">
                            <el-icon><ChatLineSquare /></el-icon> Pós-Reunião
                        </span>
                    </template>
                    <div class="mt-2 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 flex items-center gap-2">
                        <el-icon class="text-blue-500 text-lg"><InfoFilled /></el-icon>
                        Utilize este espaço <strong>após</strong> concluir a reunião para registrar resumos, próximos passos e acordos firmados.
                    </div>
                    <el-form-item prop="postMeetingNotes">
                        <div class="w-full rounded-xl border border-slate-300 transition-all overflow-hidden bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 shadow-sm flex flex-col">
                            <QuillEditor v-model:content="form.postMeetingNotes" contentType="html" theme="snow"
                                toolbar="full"
                                placeholder="Digite o resumo e principais acordos da reunião aqui..." />
                        </div>
                    </el-form-item>
                </el-tab-pane>

                <el-tab-pane name="recurrence">
                    <template #label>
                        <span class="flex items-center gap-1.5 font-bold">
                            <el-icon><Refresh /></el-icon> Recorrência
                        </span>
                    </template>
                    <div class="mt-2">
                        <div
                            class="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4 flex items-center justify-between">
                            <div>
                                <h4 class="font-bold text-blue-800">Repetir Automáticamente?</h4>
                                <p class="text-xs text-blue-600">Perfeito para almoços, feriados ou revisões fixas.</p>
                            </div>
                            <el-switch v-model="form.isRecurring" />
                        </div>

                        <div v-if="form.isRecurring" class="flex flex-col gap-4 animate-fade-in">
                            <el-form-item label="Tipo de Repetição">
                                <div
                                    class="flex w-full bg-slate-100 p-1 rounded-lg border border-slate-200 select-none">
                                    <div @click="form.recurrenceType = 'daily'"
                                        class="flex-1 text-center py-1.5 text-sm font-bold rounded-md cursor-pointer transition-all"
                                        :class="form.recurrenceType === 'daily' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'">
                                        Diário
                                    </div>
                                    <div @click="form.recurrenceType = 'weekly'"
                                        class="flex-1 text-center py-1.5 text-sm font-bold rounded-md cursor-pointer transition-all"
                                        :class="form.recurrenceType === 'weekly' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'">
                                        Semanal
                                    </div>
                                    <div @click="form.recurrenceType = 'monthly'"
                                        class="flex-1 text-center py-1.5 text-sm font-bold rounded-md cursor-pointer transition-all"
                                        :class="form.recurrenceType === 'monthly' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'">
                                        Mensal
                                    </div>
                                </div>
                            </el-form-item>

                            <div v-if="form.recurrenceType === 'weekly'"
                                class="bg-slate-50 p-3 rounded border border-slate-200">
                                <span class="text-xs font-bold text-slate-500 uppercase mb-2 block">Repetir nos
                                    dias:</span>
                                <el-checkbox-group v-model="form.recurrenceDays" size="small">
                                    <el-checkbox-button v-for="(day, index) in weekDays" :key="index" :label="index">{{
                                        day
                                    }}</el-checkbox-button>
                                </el-checkbox-group>
                            </div>

                            <div v-if="form.recurrenceType === 'monthly'"
                                class="text-sm text-slate-500 bg-orange-50 p-2 rounded border border-orange-100 flex items-center gap-2">
                                <el-icon class="text-orange-500">
                                    <InfoFilled />
                                </el-icon>
                                A ação repetirá todo dia <strong>{{ new Date(form.date).getDate() + 1 }}</strong> de
                                cada mês.
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <el-form-item label="Data Final da Repetição">
                                    <el-date-picker v-model="form.recurrenceEndDate" type="date"
                                        placeholder="Até quando?" format="DD/MM/YYYY" value-format="YYYY-MM-DD"
                                        class="!w-full" />
                                </el-form-item>

                                <div class="text-right text-xs text-slate-400 flex flex-col justify-center">
                                    <span>Início: {{ form.time }}</span>
                                    <span>Fim: {{ form.endTime }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </el-form>

        <template #footer>
            <div class="flex justify-between w-full pt-4 border-t border-slate-100">
                <el-button v-if="isEditing" type="danger" plain @click="$emit('delete', form.id)">Excluir</el-button>
                <div v-else></div>
                <div class="flex gap-2">
                    <el-button @click="handleClose">Cancelar</el-button>
                    <el-button type="primary" @click="submitForm" class="!px-6 !font-bold">Confirmar</el-button>
                </div>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { Check, Calendar, User, UserFilled, Briefcase, InfoFilled, Location, Search, Money, ArrowDown, Lock, Document, EditPen, Refresh, ChatLineSquare } from '@element-plus/icons-vue';
import { useEventModal } from '../composables/useEventModal';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const props = defineProps<{ isOpen: boolean; eventData?: any; }>();
const emit = defineEmits(['close', 'save', 'delete']);

const {
    store, ruleFormRef, activeTab, weekDays, isEditing, clientOptions, loadingClients,
    form, rules, preDefinedColors, formatAndSearchCep, handleStartTimeChange, searchClients,
    selectType, handleClose, submitForm
} = useEventModal(props, emit);
</script>

<style>
.custom-event-modal .el-dialog__header {
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 16px;
    margin-bottom: 0;
    font-weight: 800;
    color: #1e293b;
}

.custom-event-modal .el-form-item__label {
    font-weight: 600 !important;
    color: #475569 !important;
    padding-bottom: 4px !important;
}

.scale-check-enter-active,
.scale-check-leave-active {
    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.scale-check-enter-from,
.scale-check-leave-to {
    transform: scale(0);
    opacity: 0;
}

.custom-event-modal .el-tabs__content {
    height: 480px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.custom-event-modal .el-tab-pane {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.custom-event-modal .el-tabs__content::-webkit-scrollbar {
    width: 6px;
}

.custom-event-modal .el-tabs__content::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 10px;
}

.custom-event-modal .ql-toolbar.ql-snow {
    border: none;
    border-bottom: 1px solid #e2e8f0;
    background-color: #f1f5f9;
    font-family: inherit;
    border-radius: 8px 8px 0 0;
    padding: 8px;
}

.custom-event-modal .ql-container.ql-snow {
    border: none;
    font-family: inherit;
    font-size: 14px;
    min-height: 150px;
}

.custom-event-modal .ql-editor {
    min-height: 150px;
    color: #334155;
    padding: 1rem;
    line-height: 1.6;
}

.custom-event-modal .ql-editor.ql-blank::before {
    font-style: normal;
    color: #94a3b8;
}
</style>