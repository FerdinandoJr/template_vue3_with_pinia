export function generateUUIDv7(): string {
    const now = Date.now();
    const value = new Uint8Array(16);
    crypto.getRandomValues(value);
    value[0] = (now >> 40) & 0xff;
    value[1] = (now >> 32) & 0xff;
    value[2] = (now >> 24) & 0xff;
    value[3] = (now >> 16) & 0xff;
    value[4] = (now >> 8) & 0xff;
    value[5] = now & 0xff;
    value[6] = ((value[6] ?? 0) & 0x0f) | 0x70;
    value[8] = ((value[8] ?? 0) & 0x3f) | 0x80;
    return [...value].map((b) => b.toString(16).padStart(2, '0')).join('')
        .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
}

export function getTimeWeight(timeStr: string): number {
    if (!timeStr) return 0;
    const t = timeStr.toLowerCase().trim();
    if (t === 'agora') return Date.now() + 1000;
    if (t === 'ontem') return Date.now() - 86400000;
    if (t.includes(':') && !t.includes('/')) {
        const parts = t.split(':').map(Number);
        const h = parts[0] ?? 0;
        const m = parts[1] ?? 0;
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return d.getTime();
    }
    if (t.includes('/')) {
        const parts = t.split('/').map(Number);
        const day = parts[0] ?? 1;
        const month = (parts[1] ?? 1) - 1;
        const year = parts[2] ?? new Date().getFullYear();
        const d = new Date(year, month, day);
        return d.getTime();
    }
    return 0;
}

export function formatCpfCnpj(value: string): string {
    const v = value.replace(/\D/g, '');

    if (v.length <= 11) {
        return v.replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
        return v.substring(0, 14)
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    }
}

export function isValidCpfCnpj(value: string): boolean {
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue) return true;

    if (cleanValue.length === 11) {
        if (/^(\d)\1{10}$/.test(cleanValue)) return false;
        let sum = 0, rest;
        for (let i = 1; i <= 9; i++) sum = sum + parseInt(cleanValue.substring(i - 1, i)) * (11 - i);
        rest = (sum * 10) % 11;
        if ((rest === 10) || (rest === 11)) rest = 0;
        if (rest !== parseInt(cleanValue.substring(9, 10))) return false;
        sum = 0;
        for (let i = 1; i <= 10; i++) sum = sum + parseInt(cleanValue.substring(i - 1, i)) * (12 - i);
        rest = (sum * 10) % 11;
        if ((rest === 10) || (rest === 11)) rest = 0;
        if (rest !== parseInt(cleanValue.substring(10, 11))) return false;
        return true;
    } else if (cleanValue.length === 14) {
        if (/^(\d)\1{13}$/.test(cleanValue)) return false;
        let size = cleanValue.length - 2;
        let numbers = cleanValue.substring(0, size);
        const digits = cleanValue.substring(size);
        let sum = 0;
        let pos = size - 7;
        for (let i = size; i >= 1; i--) {
            sum += parseInt(numbers.charAt(size - i)) * pos--;
            if (pos < 2) pos = 9;
        }
        let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(0))) return false;
        size = size + 1;
        numbers = cleanValue.substring(0, size);
        sum = 0;
        pos = size - 7;
        for (let i = size; i >= 1; i--) {
            sum += parseInt(numbers.charAt(size - i)) * pos--;
            if (pos < 2) pos = 9;
        }
        result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(1))) return false;
        return true;
    }

    return false;
}