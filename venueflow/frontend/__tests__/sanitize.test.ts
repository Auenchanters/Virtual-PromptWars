import { escapeHtml, clampInput } from '../src/utils/sanitize';

describe('escapeHtml', () => {
    it('escapes ampersands', () => {
        expect(escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('escapes angle brackets', () => {
        expect(escapeHtml('<script>alert("xss")</script>')).toBe(
            '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
        );
    });

    it('escapes single quotes', () => {
        expect(escapeHtml("it's")).toBe('it&#39;s');
    });

    it('handles empty string', () => {
        expect(escapeHtml('')).toBe('');
    });
});

describe('clampInput', () => {
    it('trims whitespace and truncates to maxLength', () => {
        expect(clampInput('  hello world  ', 5)).toBe('hello');
    });

    it('returns full string if under maxLength', () => {
        expect(clampInput('short', 100)).toBe('short');
    });

    it('trims before measuring length', () => {
        expect(clampInput('   ab   ', 2)).toBe('ab');
    });
});
