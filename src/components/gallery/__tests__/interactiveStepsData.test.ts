import { describe, it, expect } from 'vitest';
import { VISUALGO_ITEMS } from '../visuAlgoData';
import { getInteractiveSteps } from '../interactiveStepsData';

describe('Interactive Algorithm Playgrounds (26 modules)', () => {
  it('has interactive steps for each of the 26 topics without throwing', () => {
    for (const item of VISUALGO_ITEMS) {
      const steps = getInteractiveSteps(item.id, item.themeColor || '#D6523A');
      expect(steps.length, `Expected steps for ${item.id}`).toBeGreaterThanOrEqual(2);
      
      for (let sIdx = 0; sIdx < steps.length; sIdx++) {
        const step = steps[sIdx];
        expect(step.title, `Step ${sIdx} in ${item.id} has title`).toBeTruthy();
        expect(step.description, `Step ${sIdx} in ${item.id} has description`).toBeTruthy();
        expect(typeof step.render, `Step ${sIdx} in ${item.id} has render function`).toBe('function');
        
        // Execute the render function to make sure SVG/JSX evaluates without throwing
        const rendered = step.render();
        expect(rendered, `Rendered output for ${item.id} step ${sIdx}`).not.toBeNull();
      }
    }
  });
});
