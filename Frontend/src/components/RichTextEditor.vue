<template>
  <div class="border border-slate-300 rounded-lg bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200 flex flex-col">
    
    <div v-if="editor && !props.readonly" class="bg-slate-50/80 border-b border-slate-200 px-3 py-2 flex flex-wrap gap-x-1.5 gap-y-2 items-center rounded-t-lg">
      
      <div class="flex items-center gap-0.5">
        <button type="button" @click.prevent="editor.chain().focus().toggleBold().run()" :class="['p-1.5 rounded transition-colors', editor.isActive('bold') ? 'bg-slate-200 text-slate-900 shadow-inner' : 'text-slate-600 hover:bg-slate-200']" title="Negrito">
          <BoldIcon class="w-4 h-4" />
        </button>
        <button type="button" @click.prevent="editor.chain().focus().toggleItalic().run()" :class="['p-1.5 rounded transition-colors', editor.isActive('italic') ? 'bg-slate-200 text-slate-900 shadow-inner' : 'text-slate-600 hover:bg-slate-200']" title="Itálico">
          <ItalicIcon class="w-4 h-4" />
        </button>
        <button type="button" @click.prevent="editor.chain().focus().toggleUnderline().run()" :class="['p-1.5 rounded transition-colors', editor.isActive('underline') ? 'bg-slate-200 text-slate-900 shadow-inner' : 'text-slate-600 hover:bg-slate-200']" title="Sublinhado">
          <UnderlineIcon class="w-4 h-4" />
        </button>
        <button type="button" @click.prevent="editor.chain().focus().toggleStrike().run()" :class="['p-1.5 rounded transition-colors', editor.isActive('strike') ? 'bg-slate-200 text-slate-900 shadow-inner' : 'text-slate-600 hover:bg-slate-200']" title="Tachado">
          <StrikethroughIcon class="w-4 h-4" />
        </button>
      </div>

      <div class="w-px h-5 bg-slate-300 mx-1"></div>

      <div class="flex items-center gap-1 px-1">
        
        <el-popover placement="bottom" trigger="click" :teleported="false" :width="200" :show-arrow="false" popper-class="!p-3 !rounded-xl !shadow-lg">
          <template #reference>
            <button type="button" class="flex flex-col items-center justify-center w-8 h-8 rounded transition-colors hover:bg-slate-200" title="Cor do Texto">
              <BaselineIcon class="w-4 h-4 text-slate-700" />
              <div class="w-4 h-1 mt-0.5 rounded-sm" :style="{ backgroundColor: textColor }"></div>
            </button>
          </template>
          <div>
            <div class="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Cor da Fonte</div>
            <div class="grid grid-cols-5 gap-2">
              <button type="button" v-for="color in textPalette" :key="'text-'+color" @click.stop="setTextColor(color)"
                class="w-6 h-6 rounded-full shadow-sm border border-black/10 hover:scale-110 transition-transform relative"
                :class="textColor === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''"
                :style="{ backgroundColor: color }">
              </button>
            </div>
          </div>
        </el-popover>

        <el-popover placement="bottom" trigger="click" :teleported="false" :width="200" :show-arrow="false" popper-class="!p-3 !rounded-xl !shadow-lg">
          <template #reference>
            <button type="button" class="flex flex-col items-center justify-center w-8 h-8 rounded transition-colors hover:bg-slate-200" title="Cor de Destaque">
              <HighlighterIcon class="w-4 h-4 text-slate-700" />
              <div class="w-4 h-1 mt-0.5 rounded-sm border border-black/10" :style="{ backgroundColor: highlightColor || 'transparent' }"></div>
            </button>
          </template>
          <div>
            <div class="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Cor de Destaque</div>
            <div class="grid grid-cols-5 gap-2">
              <button type="button" v-for="color in highlightPalette" :key="'bg-'+color" @click.stop="setHighlightColor(color)"
                class="w-6 h-6 rounded-full shadow-sm border border-black/10 hover:scale-110 transition-transform relative overflow-hidden"
                :class="highlightColor === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''"
                :style="{ backgroundColor: color === 'transparent' ? '#ffffff' : color }">
                <div v-if="color === 'transparent'" class="absolute inset-0 flex items-center justify-center">
                   <div class="w-full h-[2px] bg-red-500 rotate-45"></div>
                </div>
              </button>
            </div>
          </div>
        </el-popover>

      </div>

      <div class="w-px h-5 bg-slate-300 mx-1"></div>

      <div class="flex items-center gap-0.5">
        <button type="button" @click.prevent="editor.chain().focus().setTextAlign('left').run()" :class="['p-1.5 rounded transition-colors', editor.isActive({ textAlign: 'left' }) ? 'bg-slate-200 text-slate-900 shadow-inner' : 'text-slate-600 hover:bg-slate-200']" title="Alinhar à Esquerda">
          <AlignLeftIcon class="w-4 h-4" />
        </button>
        <button type="button" @click.prevent="editor.chain().focus().setTextAlign('center').run()" :class="['p-1.5 rounded transition-colors', editor.isActive({ textAlign: 'center' }) ? 'bg-slate-200 text-slate-900 shadow-inner' : 'text-slate-600 hover:bg-slate-200']" title="Centralizar">
          <AlignCenterIcon class="w-4 h-4" />
        </button>
        <button type="button" @click.prevent="editor.chain().focus().setTextAlign('right').run()" :class="['p-1.5 rounded transition-colors', editor.isActive({ textAlign: 'right' }) ? 'bg-slate-200 text-slate-900 shadow-inner' : 'text-slate-600 hover:bg-slate-200']" title="Alinhar à Direita">
          <AlignRightIcon class="w-4 h-4" />
        </button>
        <button type="button" @click.prevent="editor.chain().focus().setTextAlign('justify').run()" :class="['p-1.5 rounded transition-colors', editor.isActive({ textAlign: 'justify' }) ? 'bg-slate-200 text-slate-900 shadow-inner' : 'text-slate-600 hover:bg-slate-200']" title="Justificar">
          <AlignJustifyIcon class="w-4 h-4" />
        </button>
      </div>

      <div class="w-px h-5 bg-slate-300 mx-1"></div>

      <div class="flex items-center gap-0.5">
        <button type="button" @click.prevent="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="['px-2 py-1.5 rounded transition-colors font-bold text-[13px]', editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 text-slate-900 shadow-inner' : 'text-slate-600 hover:bg-slate-200']" title="Título Principal">
          H1
        </button>
        <button type="button" @click.prevent="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="['px-2 py-1.5 rounded transition-colors font-bold text-[13px]', editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-slate-900 shadow-inner' : 'text-slate-600 hover:bg-slate-200']" title="Subtítulo">
          H2
        </button>
        <button type="button" @click.prevent="editor.chain().focus().toggleBlockquote().run()" :class="['p-1.5 rounded transition-colors', editor.isActive('blockquote') ? 'bg-slate-200 text-slate-900 shadow-inner' : 'text-slate-600 hover:bg-slate-200']" title="Citação">
          <QuoteIcon class="w-4 h-4" />
        </button>
      </div>

      <div class="w-px h-5 bg-slate-300 mx-1"></div>

      <div class="flex items-center gap-0.5">
        <button type="button" @click.prevent="editor.chain().focus().toggleBulletList().run()" :class="['p-1.5 rounded transition-colors', editor.isActive('bulletList') ? 'bg-slate-200 text-slate-900 shadow-inner' : 'text-slate-600 hover:bg-slate-200']" title="Lista de Marcadores">
          <ListIcon class="w-4 h-4" />
        </button>
        <button type="button" @click.prevent="editor.chain().focus().toggleOrderedList().run()" :class="['p-1.5 rounded transition-colors', editor.isActive('orderedList') ? 'bg-slate-200 text-slate-900 shadow-inner' : 'text-slate-600 hover:bg-slate-200']" title="Lista Numerada">
          <ListOrderedIcon class="w-4 h-4" />
        </button>
        <button type="button" @click.prevent="setLink" :class="['p-1.5 rounded transition-colors ml-1', editor.isActive('link') ? 'bg-blue-100 text-blue-700 shadow-inner' : 'text-slate-600 hover:bg-slate-200']" title="Inserir/Editar Link">
          <LinkIcon class="w-4 h-4" />
        </button>
      </div>

    </div>

    <div class="flex-1 bg-white relative text-base rounded-b-lg" :class="props.readonly ? 'cursor-default' : 'cursor-text'">
      <editor-content :editor="editor" class="tiptap-editor-wrapper p-5" @click="!props.readonly && editor?.commands.focus()" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'

import { 
  Bold as BoldIcon, 
  Italic as ItalicIcon, 
  Underline as UnderlineIcon,
  Strikethrough as StrikethroughIcon, 
  List as ListIcon, 
  ListOrdered as ListOrderedIcon,
  AlignLeft as AlignLeftIcon,
  AlignCenter as AlignCenterIcon,
  AlignRight as AlignRightIcon,
  AlignJustify as AlignJustifyIcon,
  Highlighter as HighlighterIcon,
  Baseline as BaselineIcon,
  Quote as QuoteIcon,
  Link as LinkIcon
} from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Digite seu texto aqui...' },
  readonly: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const textColor = ref('#000000')
const highlightColor = ref('')

const textPalette = [
  '#000000', '#475569', '#ef4444', '#f97316', '#eab308', 
  '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
]

const highlightPalette = [
  'transparent', '#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8',
  '#fecaca', '#fed7aa', '#e9d5ff', '#cbd5e1', '#d1d5db'
]

const editor = useEditor({
  content: props.modelValue,
  editable: !props.readonly,
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
      emptyEditorClass: 'is-editor-empty',
    }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-600 underline cursor-pointer',
      },
    })
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-slate prose-sm max-w-none focus:outline-none min-h-[250px]',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
  onSelectionUpdate: ({ editor }) => {
    textColor.value = editor.getAttributes('textStyle').color || '#000000'
    highlightColor.value = editor.getAttributes('highlight').color || ''
  }
})

const setTextColor = (color: string) => {
  editor.value?.chain().focus().setColor(color).run()
  textColor.value = color
}

const setHighlightColor = (color: string) => {
  if (color === 'transparent') {
    editor.value?.chain().focus().unsetHighlight().run()
    highlightColor.value = ''
  } else {
    editor.value?.chain().focus().setHighlight({ color }).run()
    highlightColor.value = color
  }
}

const setLink = () => {
  const previousUrl = editor.value?.getAttributes('link').href
  const url = window.prompt('URL do Link', previousUrl)
  if (url === null) return
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

watch(() => props.modelValue, (value) => {
  const isSame = editor.value?.getHTML() === value
  if (!isSame && editor.value) {
    editor.value.commands.setContent(value, false)
  }
})

watch(() => props.readonly, (isReadonly) => {
  editor.value?.setEditable(!isReadonly)
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style>
.tiptap-editor-wrapper .ProseMirror {
  min-height: 250px;
  outline: none !important;
}

.is-editor-empty:first-child::before {
  color: #94a3b8;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
  font-style: italic;
}

.ProseMirror blockquote {
  border-left: 3px solid #cbd5e1;
  padding-left: 1rem;
  color: #64748b;
  font-style: italic;
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>