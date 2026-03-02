<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-hidden flex justify-end">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>

        <div
            class="relative w-screen max-w-2xl transform transition-transform ease-in-out duration-300 bg-slate-50 shadow-2xl flex flex-col overflow-hidden border-l border-slate-200 animate-in slide-in-from-right">

            <template v-if="customer">
                <div class="bg-white border-b border-slate-200 shrink-0">
                    <div class="h-28 bg-gradient-to-r from-slate-800 to-slate-700 relative">
                        <button @click="$emit('close')"
                            class="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                                stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <div class="px-8 -mt-12 relative flex justify-between items-end pb-4">
                        <div class="flex items-end gap-5">
                            <div
                                class="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg border border-slate-100 relative">
                                <div
                                    class="w-full h-full bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-4xl font-black shadow-inner">
                                    {{ customer.avatar }}
                                </div>
                                <div class="absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"
                                    :class="customer.status === 'active' ? 'bg-green-500' : 'bg-slate-400'"></div>
                            </div>
                            <div class="pb-1">
                                <h2 class="font-black text-2xl text-slate-800 leading-tight">
                                    {{ (customer as any).tradeName || customer.companyName }}
                                </h2>
                                <div class="flex items-center gap-2 mt-1.5">
                                    <p v-if="(customer as any).tradeName && (customer as any).tradeName !== customer.companyName"
                                        class="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                                        {{ customer.companyName }}
                                    </p>
                                    <p v-if="customer.document"
                                        class="text-xs font-bold text-slate-400 flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                        {{ customer.document }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-2 pb-1">
                            <button
                                class="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1.5 border border-blue-200">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round">
                                    <path d="M12 20h9"></path>
                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                                </svg>
                                Editar
                            </button>
                        </div>
                    </div>

                    <div class="flex px-8 gap-6 border-t border-slate-100 mt-2">
                        <button @click="activeTab = 'overview'"
                            :class="['py-4 text-sm font-bold border-b-2 transition-colors relative', activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700']">
                            Visão Geral
                        </button>
                        <button @click="activeTab = 'contacts'"
                            :class="['py-4 text-sm font-bold border-b-2 transition-colors relative flex items-center gap-2', activeTab === 'contacts' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700']">
                            Contatos Vinculados
                            <span v-if="customer.contacts?.length"
                                class="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-[10px]">{{
                                    customer.contacts.length }}</span>
                        </button>
                        <button @click="activeTab = 'history'"
                            :class="['py-4 text-sm font-bold border-b-2 transition-colors relative', activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700']">
                            Histórico & Chamados
                        </button>
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">

                    <div v-show="activeTab === 'overview'" class="space-y-8 animate-in fade-in duration-300">

                        <div class="grid grid-cols-3 gap-4">
                            <div
                                class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                                <span
                                    class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status
                                    do Cliente</span>
                                <div class="flex items-center gap-1.5">
                                    <span class="w-2.5 h-2.5 rounded-full"
                                        :class="customer.status === 'active' ? 'bg-green-500' : 'bg-slate-400'"></span>
                                    <span class="text-sm font-bold text-slate-700">{{ customer.status === 'active' ?
                                        'Ativo na Base' : 'Inativo' }}</span>
                                </div>
                            </div>
                            <div
                                class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                                <span
                                    class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Satisfação
                                    (CSAT)</span>
                                <div class="flex items-baseline gap-1">
                                    <span class="text-xl font-black"
                                        :class="customer.csat >= 4 ? 'text-green-600' : 'text-amber-500'">{{
                                            Number(customer.csat).toFixed(1) }}</span>
                                    <span class="text-xs font-bold text-slate-400">/ 5.0</span>
                                </div>
                            </div>
                            <div
                                class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                                <span
                                    class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tickets
                                    Abertos</span>
                                <div class="flex items-baseline gap-1">
                                    <span class="text-xl font-black text-blue-600">{{ customer.openTickets || 0
                                    }}</span>
                                    <span class="text-xs font-bold text-slate-400">chamados</span>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <div class="px-6 py-4 border-b border-slate-100 bg-slate-50">
                                <h3
                                    class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                                        stroke-linejoin="round" class="text-blue-500">
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                    </svg>
                                    Informações Fiscais e Empresa
                                </h3>
                            </div>
                            <div class="p-6 grid grid-cols-2 gap-y-6 gap-x-8">
                                <div>
                                    <label
                                        class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Razão
                                        Social</label>
                                    <p class="text-sm font-medium text-slate-800">{{ customer.companyName }}</p>
                                </div>
                                <div>
                                    <label
                                        class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nome
                                        Fantasia</label>
                                    <p class="text-sm font-medium text-slate-800">{{ (customer as any).tradeName ||
                                        'Idêntico à Razão Social' }}</p>
                                </div>
                                <div>
                                    <label
                                        class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CNPJ
                                        / Documento</label>
                                    <p v-if="customer.document" class="text-sm font-medium text-slate-800">{{
                                        customer.document }}</p>
                                    <p v-else class="text-sm font-medium text-slate-400 italic">Não preenchido</p>
                                </div>
                                <div>
                                    <label
                                        class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Website
                                        / Domínio</label>
                                    <a v-if="customer.website" :href="customer.website" target="_blank"
                                        class="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
                                        {{ customer.website }}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                            <polyline points="15 3 21 3 21 9"></polyline>
                                            <line x1="10" y1="14" x2="21" y2="3"></line>
                                        </svg>
                                    </a>
                                    <p v-else class="text-sm font-medium text-slate-400 italic">Não preenchido</p>
                                </div>
                                <div>
                                    <label
                                        class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Origem
                                        do Lead</label>
                                    <p class="text-sm font-medium text-slate-800">{{ customer.source }}</p>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                                    stroke-linejoin="round" class="text-red-500">
                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider">Endereço
                                    Comercial</h3>
                            </div>
                            <div class="p-6">
                                <div v-if="(customer as any).street" class="grid grid-cols-2 gap-y-5 gap-x-8">
                                    <div class="col-span-2 sm:col-span-1">
                                        <label
                                            class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Logradouro
                                            (Rua/Av)</label>
                                        <p class="text-sm font-medium text-slate-800">{{ (customer as any).street }}, {{
                                            (customer as any).number || 'S/N' }}</p>
                                    </div>
                                    <div>
                                        <label
                                            class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Complemento</label>
                                        <p class="text-sm font-medium text-slate-800">{{ (customer as any).complement ||
                                            '-' }}</p>
                                    </div>
                                    <div>
                                        <label
                                            class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bairro</label>
                                        <p class="text-sm font-medium text-slate-800">{{ (customer as any).neighborhood
                                            || '-' }}</p>
                                    </div>
                                    <div>
                                        <label
                                            class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cidade
                                            / UF</label>
                                        <p class="text-sm font-medium text-slate-800">{{ (customer as any).city || '-'
                                        }} - {{ (customer as any).state || '-' }}</p>
                                    </div>
                                    <div>
                                        <label
                                            class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CEP</label>
                                        <p class="text-sm font-medium text-slate-800">{{ (customer as any).zipCode ||
                                            '-' }}</p>
                                    </div>
                                </div>
                                <div v-else class="text-center py-6">
                                    <span class="text-3xl mb-2 block opacity-30">📍</span>
                                    <p class="text-sm text-slate-500 font-medium">Nenhum endereço cadastrado para esta
                                        empresa.</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div v-show="activeTab === 'contacts'" class="space-y-6 animate-in fade-in duration-300">

                        <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <div class="px-6 py-4 border-b border-slate-100 bg-slate-50">
                                <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider">Responsável
                                    Principal</h3>
                            </div>
                            <div class="p-6 flex items-center gap-6">
                                <div
                                    class="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-xl font-black text-indigo-600 border border-indigo-100 shrink-0">
                                    {{ customer.name.charAt(0).toUpperCase() }}
                                </div>
                                <div class="flex-1 grid grid-cols-2 gap-4">
                                    <div>
                                        <p
                                            class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                                            Nome Completo</p>
                                        <p class="text-sm font-bold text-slate-800">{{ customer.name }}</p>
                                    </div>
                                    <div>
                                        <p
                                            class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                                            Telefone Base</p>
                                        <p class="text-sm font-medium text-slate-800">{{ customer.phone }}</p>
                                    </div>
                                    <div class="col-span-2">
                                        <p
                                            class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                                            E-mail de Contato</p>
                                        <p class="text-sm font-medium text-slate-800">{{ customer.email }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <div
                                class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <h3
                                    class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                    <span class="text-green-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                                            stroke-linecap="round" stroke-linejoin="round">
                                            <path
                                                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z">
                                            </path>
                                        </svg>
                                    </span>
                                    Números de WhatsApp Vinculados
                                </h3>
                            </div>

                            <div class="p-6">
                                <div v-if="customer.contacts && customer.contacts.length > 0" class="space-y-3">
                                    <div v-for="(chatId, index) in customer.contacts" :key="index"
                                        class="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl hover:border-green-300 hover:shadow-md transition-all group">
                                        <div class="flex items-center gap-4">
                                            <div
                                                class="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path>
                                                </svg>
                                            </div>
                                            <div>
                                                <span class="text-sm font-bold text-slate-800 block mb-0.5">Sessão de
                                                    Atendimento Ativa</span>
                                                <div class="flex items-center gap-2">
                                                    <span
                                                        class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                    <span
                                                        class="text-xs text-slate-500 font-medium uppercase tracking-wider">ID:
                                                        {{ chatId }}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            class="px-4 py-2 text-xs font-bold text-white bg-slate-800 rounded-lg hover:bg-slate-900 transition-colors shadow-md">
                                            Histórico do Chat
                                        </button>
                                    </div>
                                </div>

                                <div v-else
                                    class="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <div
                                        class="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl mx-auto shadow-sm border border-slate-100 mb-4 opacity-80">
                                        📱</div>
                                    <h4 class="text-sm font-bold text-slate-700 mb-1">Nenhum canal conectado</h4>
                                    <p class="text-xs text-slate-500 max-w-sm mx-auto">Vá até o módulo de Atendimentos
                                        (Chats) para vincular o número de WhatsApp de um cliente a este cadastro.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-show="activeTab === 'history'" class="animate-in fade-in duration-300">
                        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider mb-8">Linha do Tempo
                                de Interações</h3>

                            <div
                                class="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">

                                <div
                                    class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div
                                        class="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z">
                                            </path>
                                        </svg>
                                    </div>
                                    <div
                                        class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                                        <div class="flex items-center justify-between mb-1">
                                            <span class="font-bold text-slate-800 text-sm">Mensagem via WhatsApp</span>
                                            <span
                                                class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{
                                                    formatDate(customer.lastInteraction) }}</span>
                                        </div>
                                        <p class="text-sm text-slate-600 mt-2">"Gostaria de saber o status da integração
                                            com a API."</p>
                                    </div>
                                </div>

                                <div
                                    class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                    <div
                                        class="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-100 text-emerald-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                    </div>
                                    <div
                                        class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                                        <div class="flex items-center justify-between mb-1">
                                            <span class="font-bold text-slate-800 text-sm">Ticket Kanban
                                                Concluído</span>
                                            <span
                                                class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semanas
                                                Atrás</span>
                                        </div>
                                        <p class="text-sm text-slate-600 mt-2 font-medium">Revisão do contrato anual
                                            finalizada e enviada para assinatura.</p>
                                        <span
                                            class="inline-block mt-3 bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">Resolvido</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div class="p-5 border-t border-slate-200 bg-white shrink-0 flex gap-4">
                    <button @click="$emit('close')"
                        class="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                        Fechar
                    </button>
                    <button
                        class="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Abrir Novo Chamado / Ticket
                    </button>
                </div>
            </template>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ICustomer } from '../../../customer/domain/entities/customer';

const props = defineProps<{
    isOpen: boolean;
    customer?: ICustomer;
}>();

defineEmits(['close']);

// Controle da aba atual
const activeTab = ref('overview');

// Reseta a aba para "overview" toda vez que abre o drawer para um novo cliente
watch(() => props.isOpen, (newVal) => {
    if (newVal) activeTab.value = 'overview';
});

const formatDate = (date: Date | string) => {
    if (!date) return '--/--/----';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 20px;
}
</style>