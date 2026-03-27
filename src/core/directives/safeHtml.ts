import DOMPurify from 'dompurify';
import type { App, DirectiveBinding } from 'vue';

export const safeHtmlDirective = {
    install(app: App) {
        app.directive('safe-html', {
            mounted(el: HTMLElement, binding: DirectiveBinding) {
                el.innerHTML = DOMPurify.sanitize(binding.value, {
                });
            },
            updated(el: HTMLElement, binding: DirectiveBinding) {
                el.innerHTML = DOMPurify.sanitize(binding.value);
            }
        });
    }
};