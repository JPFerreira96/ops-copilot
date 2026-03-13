import { describe, it, expect } from 'vitest';
import { MockAIProvider } from './index';

describe('MockAIProvider', () => {
    it('should return a properly formatted AIResponse', async () => {
        const provider = new MockAIProvider();

        const input = {
            title: 'Sistema fora do ar',
            description: 'O sistema principal não está respondendo desde as 10h da manhã.'
        };

        const startTime = Date.now();
        const result = await provider.generateSummary(input);
        const endTime = Date.now();

        // Verify it implements the delay (approx 800ms)
        expect(endTime - startTime).toBeGreaterThanOrEqual(700);

        // Verify the response shape
        expect(result).toHaveProperty('summary');
        expect(typeof result.summary).toBe('string');

        expect(result).toHaveProperty('nextSteps');
        expect(Array.isArray(result.nextSteps)).toBe(true);
        expect(result.nextSteps.length).toBeGreaterThan(0);

        expect(result).toHaveProperty('riskLevel');
        expect(['low', 'medium', 'high']).toContain(result.riskLevel);

        expect(result).toHaveProperty('categories');
        expect(Array.isArray(result.categories)).toBe(true);
    });
});
