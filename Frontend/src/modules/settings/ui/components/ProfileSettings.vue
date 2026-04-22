<template>
  <div v-if="localProfile" class="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm max-w-3xl">
    <h2 class="text-xl font-black text-slate-800 mb-6">Meu Perfil</h2>

    <div class="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
      <img :src="getAvatarUrl(localProfile)" class="w-24 h-24 rounded-full object-cover ring-4 ring-slate-50" />
      <div>
        <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="handleAvatarChange" />
        <button @click="triggerFileInput"
          class="bg-white border border-slate-200 text-slate-600 text-[12px] font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 mb-2">
          Alterar Foto
        </button>
        <p class="text-[11px] font-bold text-slate-400">JPG, GIF ou PNG. Máx de 2MB.</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6">
      <div class="col-span-2 md:col-span-1">
        <label class="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Nome Completo</label>
        <input type="text" v-model="localProfile.name"
          class="w-full bg-[#f8fafd] border border-transparent focus:border-blue-500 rounded-xl px-4 py-3 text-[13px] font-bold text-slate-700 outline-none transition-colors" />
      </div>
      <div class="col-span-2 md:col-span-1">
        <label class="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">E-mail</label>
        <input type="email" v-model="localProfile.email"
          class="w-full bg-[#f8fafd] border border-transparent focus:border-blue-500 rounded-xl px-4 py-3 text-[13px] font-bold text-slate-700 outline-none transition-colors" />
      </div>
      <div class="col-span-2 md:col-span-1">
        <label class="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
          Telefone / WhatsApp
          <span v-if="phoneError" class="text-red-500 normal-case font-bold ml-2">{{ phoneError }}</span>
        </label>
        <input type="text" v-model="localProfile.phone" @input="handlePhoneInput" maxlength="15"
          placeholder="(00) 00000-0000"
          :class="['w-full bg-[#f8fafd] border rounded-xl px-4 py-3 text-[13px] font-bold outline-none transition-colors',
            phoneError ? 'border-red-400 text-red-600 focus:border-red-500 bg-red-50' : 'border-transparent text-slate-700 focus:border-blue-500']" />
      </div>
      <div class="col-span-2 md:col-span-1">
        <label class="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Cargo</label>
        <input type="text" :value="localProfile.role" disabled
          class="w-full bg-slate-100 border border-transparent rounded-xl px-4 py-3 text-[13px] font-bold text-slate-400 cursor-not-allowed" />
      </div>
    </div>

    <div class="mt-10 pt-6 border-t border-slate-100 flex justify-end">
      <el-button type="primary" size="large" class="!rounded-xl !px-10 !font-bold" @click="handleSave">
        Salvar
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { settingsServices } from '../../data/settings.services';
import type { IUserProfile } from '../../domain/entities/settings';

const props = defineProps<{ profile: IUserProfile | null }>();
const localProfile = ref<IUserProfile | null>(null);
const phoneError = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleAvatarChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file || !localProfile.value) return;

  if (file.size > 2 * 1024 * 1024) {
    ElMessage.warning('A imagem deve ter no máximo 2MB.');
    return;
  }

  try {
    const profile = localProfile.value;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      profile.avatar = base64;
      await settingsServices.updateUserProfile({ avatar: base64 });
      ElMessage.success('Foto atualizada com sucesso!');
    };
    reader.readAsDataURL(file);
  } catch (error) {
    console.error('Erro ao atualizar foto:', error);
    ElMessage.error('Erro ao atualizar foto.');
  }
};

const getAvatarUrl = (profile: IUserProfile | null): string => {
  if (!profile) return '';
  const avatar = profile.avatar;
  if (avatar && typeof avatar === 'string' && avatar.trim()) {
    return avatar;
  }
  const name = profile?.name || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=96`;
};

const formatPhoneInitial = (phone: string) => {
  let v = phone.replace(/\D/g, '');
  if (v.length > 10) {
    v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
  } else if (v.length > 6) {
    v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  } else if (v.length > 2) {
    v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
  } else if (v.length > 0) {
    v = v.replace(/^(\d{0,2})/, '($1');
  }
  if (localProfile.value) localProfile.value.phone = v;
};

watch(() => props.profile, (newProfile) => {
  if (newProfile) {
    localProfile.value = { ...newProfile };
    if (localProfile.value.phone) {
      formatPhoneInitial(localProfile.value.phone);
    }
  }
}, { immediate: true });

const handlePhoneInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  let v = target.value.replace(/\D/g, '');
  v = v.substring(0, 11);

  if (v.length > 10) {
    v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
  } else if (v.length > 6) {
    v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  } else if (v.length > 2) {
    v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
  } else if (v.length > 0) {
    v = v.replace(/^(\d{0,2})/, '($1');
  }

  if (localProfile.value) localProfile.value.phone = v;
  phoneError.value = '';
};

const handleSave = async () => {
  if (!localProfile.value) return;
  if (!localProfile.value.name.trim()) {
    ElMessage.warning('O nome completo é obrigatório.');
    return;
  }
  const cleanPhone = localProfile.value.phone.replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    phoneError.value = '- Número incompleto';
    ElMessage.warning('Preencha um número de telefone válido (DDD + Número).');
    return;
  }
  try {
    await settingsServices.updateUserProfile({
      name: localProfile.value.name,
      phone: localProfile.value.phone,
      avatar: localProfile.value.avatar,
    });
    ElMessage.success('Dados pessoais atualizados com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar perfil:', error);
    ElMessage.error('Erro ao salvar. Tente novamente.');
  }
};
</script>