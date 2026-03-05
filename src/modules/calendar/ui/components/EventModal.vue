<template>
    <el-dialog :model-value="isOpen" :title="isEditing ? 'Editar Evento' : 'Novo Agendamento'" width="650px"
        @close="handleClose" destroy-on-close :close-on-click-modal="false" class="rounded-xl overflow-hidden">
        <el-tabs v-model="activeTab" class="px-2">
            <el-tab-pane label="Geral" name="general">
                <el-form ref="ruleFormRef" :model="form" :rules="rules" label-position="top" class="mt-2" status-icon>
                    <el-form-item label="Título" prop="title">
                        <el-input v-model="form.title" placeholder="Ex: Reunião Comercial" size="large" />
                    </el-form-item>

                    <div class="grid grid-cols-2 gap-4">
                        <el-form-item label="Agendar para (Profissional)" prop="userId">
                            <el-select v-model="form.userId" class="!w-full" placeholder="Selecione de quem é a agenda">
                                <template #prefix><el-icon>
                                        <User />
                                    </el-icon></template>
                                <el-option v-for="user in store.availableUsers" :key="user.id" :label="user.name"
                                    :value="user.id" />
                            </el-select>
                        </el-form-item>

                        <el-form-item label="Cliente" prop="client">
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

                    <div class="grid grid-cols-3 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <el-form-item label="Data" prop="date" class="!mb-0">
                            <el-date-picker v-model="form.date" type="date" format="DD/MM/YYYY"
                                value-format="YYYY-MM-DD" class="!w-full" :prefix-icon="Calendar" :clearable="false" />
                        </el-form-item>

                        <el-form-item label="Horário Início" class="!mb-0" prop="time">
                            <el-time-select v-model="form.time" start="00:00" step="00:15" end="23:45" class="!w-full"
                                placeholder="Início" @change="handleStartTimeChange" :clearable="false" />
                        </el-form-item>

                        <el-form-item label="Horário Fim" class="!mb-0" prop="endTime">
                            <el-time-select v-model="form.endTime" :min-time="form.time" start="00:00" step="00:15"
                                end="23:45" class="!w-full" placeholder="Fim" :clearable="false" />
                        </el-form-item>
                    </div>

                    <el-form-item label="Cor de Identificação" class="mt-4">
                        <div class="flex gap-2">
                            <div v-for="type in eventTypes" :key="type.hex" @click="selectType(type)"
                                :class="['w-8 h-8 rounded-full cursor-pointer flex items-center justify-center border-2 transition-all', form.dotClass === type.dot ? 'border-slate-600 scale-110' : 'border-transparent']"
                                :style="{ backgroundColor: type.hex }">
                                <el-icon v-if="form.dotClass === type.dot" color="#fff">
                                    <Check />
                                </el-icon>
                            </div>
                        </div>
                    </el-form-item>
                </el-form>
            </el-tab-pane>

            <el-tab-pane label="Detalhes" name="details">
                <el-form :model="form" label-position="top">
                    <el-form-item label="Descrição">
                        <el-input v-model="form.description" type="textarea" :rows="3"
                            placeholder="Detalhes adicionais do compromisso..." />
                    </el-form-item>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                    <el-form-item label="Agendado por (Responsável)">
                        <el-input v-model="form.createdBy" disabled><template #prefix><el-icon>
                                    <UserFilled />
                                </el-icon></template></el-input>
                    </el-form-item>
                </el-form>
            </el-tab-pane>

            <el-tab-pane label="Recorrência" name="recurrence">
                <div class="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4 flex items-center justify-between">
                    <div>
                        <h4 class="font-bold text-blue-800">Repetir Agendamento?</h4>
                        <p class="text-xs text-blue-600">Os horários da aba "Geral" serão mantidos.</p>
                    </div>
                    <el-switch v-model="form.isRecurring" />
                </div>

                <div v-if="form.isRecurring" class="flex flex-col gap-4 animate-fade-in">
                    <el-form-item label="Tipo de Repetição">
                        <el-radio-group v-model="form.recurrenceType" class="!w-full">
                            <el-radio-button label="daily" class="!w-1/3">Diário</el-radio-button>
                            <el-radio-button label="weekly" class="!w-1/3">Semanal</el-radio-button>
                            <el-radio-button label="monthly" class="!w-1/3">Mensal</el-radio-button>
                        </el-radio-group>
                    </el-form-item>

                    <div v-if="form.recurrenceType === 'weekly'"
                        class="bg-slate-50 p-3 rounded border border-slate-200">
                        <span class="text-xs font-bold text-slate-500 uppercase mb-2 block">Repetir nos dias:</span>
                        <el-checkbox-group v-model="form.recurrenceDays" size="small">
                            <el-checkbox-button v-for="(day, index) in weekDays" :key="index" :label="index">{{ day
                                }}</el-checkbox-button>
                        </el-checkbox-group>
                    </div>

                    <div v-if="form.recurrenceType === 'monthly'"
                        class="text-sm text-slate-500 bg-orange-50 p-2 rounded border border-orange-100 flex items-center gap-2">
                        <el-icon class="text-orange-500">
                            <InfoFilled />
                        </el-icon>
                        O evento repetirá todo dia <strong>{{ new Date(form.date).getDate() + 1 }}</strong> de cada mês.
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <el-form-item label="Data Final da Repetição">
                            <el-date-picker v-model="form.recurrenceEndDate" type="date" placeholder="Até quando?"
                                format="DD/MM/YYYY" value-format="YYYY-MM-DD" class="!w-full" />
                        </el-form-item>

                        <div class="text-right text-xs text-slate-400 flex flex-col justify-center">
                            <span>Início: {{ form.time }}</span>
                            <span>Fim: {{ form.endTime }}</span>
                        </div>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>

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
import { Check, Calendar, User, UserFilled, Briefcase, InfoFilled, Location, Search } from '@element-plus/icons-vue';
import { useEventModal } from '../composables/useEventModal';

const props = defineProps<{ isOpen: boolean; eventData?: any; }>();
const emit = defineEmits(['close', 'save', 'delete']);

const {
    store,
    ruleFormRef,
    activeTab,
    weekDays,
    isEditing,
    clientOptions,
    loadingClients,
    form,
    rules,
    eventTypes,
    formatAndSearchCep,
    handleStartTimeChange,
    searchClients,
    selectType,
    handleClose,
    submitForm
} = useEventModal(props, emit);
</script>