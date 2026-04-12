import { FilterXSS } from 'xss';

const xssFilter = new FilterXSS({
    stripIgnoreTag: true,
    whiteList: {},
});

export function sanitize(input: string): string {
    return xssFilter.process(input);
}
