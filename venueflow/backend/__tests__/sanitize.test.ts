import { sanitize } from '../src/utils/sanitize';

describe('sanitize utility', () => {
    it('strips script tags (text content preserved as harmless plaintext)', () => {
        const result = sanitize('<script>alert(1)</script>Hello');
        expect(result).not.toContain('<script>');
        expect(result).not.toContain('</script>');
        expect(result).toContain('Hello');
    });

    it('strips all HTML tags with empty whitelist', () => {
        expect(sanitize('<b>bold</b> and <i>italic</i>')).toBe('bold and italic');
    });

    it('returns plain text unchanged', () => {
        expect(sanitize('normal text')).toBe('normal text');
    });

    it('handles empty string', () => {
        expect(sanitize('')).toBe('');
    });

    it('strips event handler attributes and tags', () => {
        const result = sanitize('<img onerror="alert(1)" src=x>');
        expect(result).not.toContain('onerror');
        expect(result).not.toContain('<img');
    });

    it('strips nested tags', () => {
        const result = sanitize('<div><b>text</b></div>');
        expect(result).not.toContain('<div>');
        expect(result).not.toContain('<b>');
        expect(result).toContain('text');
    });

    it('preserves ampersands and safe entities', () => {
        expect(sanitize('A & B')).toBe('A & B');
    });
});
