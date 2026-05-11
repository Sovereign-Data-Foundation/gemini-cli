/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RecursiveRuntime } from './recursive-runtime.js';
import { BanachCurationOperator } from './banach-curation.js';
import { HumanSeed } from './persistent-root-kernel.js';
import * as crypto from 'node:crypto';

describe('RecursiveRuntime', () => {
  let runtime: RecursiveRuntime;
  let mockSeed: HumanSeed;

  beforeEach(() => {
    runtime = new RecursiveRuntime();
    mockSeed = {
      api_key: 'test_api_key',
      genesis_hash: 'test_genesis_hash',
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return a valid VerifiedGene when a contractive path is found', () => {
    // 100 * (1 / 1.618033988749895) is approx 61.8
    // So target is 61.8, we return 60 to satisfy the condition
    const calculateMetricSpy = vi.spyOn(BanachCurationOperator.prototype, 'calculateMetric')
      .mockReturnValueOnce(100) // First call: original failedState delta
      .mockReturnValueOnce(60); // Second call: recomputed content delta

    const applySpy = vi.spyOn(BanachCurationOperator.prototype, 'apply')
      .mockReturnValue('contracted');

    const result = runtime.recompute('failed_state_content', mockSeed);

    expect(calculateMetricSpy).toHaveBeenCalledTimes(2);
    expect(calculateMetricSpy).toHaveBeenNthCalledWith(1, 'failed_state_content');
    expect(calculateMetricSpy).toHaveBeenNthCalledWith(2, 'contracted');
    expect(applySpy).toHaveBeenCalledTimes(1);
    expect(applySpy).toHaveBeenCalledWith('failed_state_content');

    const expectedSignature = crypto
      .createHash('sha256')
      .update('contracted' + mockSeed.genesis_hash + 'REACTION')
      .digest('hex');

    expect(result).toEqual({
      content: 'contracted',
      signature: expectedSignature,
      genesis_hash: mockSeed.genesis_hash,
      raw_prompt: 'failed_state_content',
      human_seed: mockSeed,
    });
  });

  it('should return null when a contractive path is not found', () => {
    // 100 * (1 / 1.618033988749895) is approx 61.8
    // So target is 61.8, we return 80 to fail the condition
    const calculateMetricSpy = vi.spyOn(BanachCurationOperator.prototype, 'calculateMetric')
      .mockReturnValueOnce(100) // First call: original failedState delta
      .mockReturnValueOnce(80); // Second call: recomputed content delta

    const applySpy = vi.spyOn(BanachCurationOperator.prototype, 'apply')
      .mockReturnValue('contracted');

    const result = runtime.recompute('failed_state_content', mockSeed);

    expect(calculateMetricSpy).toHaveBeenCalledTimes(2);
    expect(calculateMetricSpy).toHaveBeenNthCalledWith(1, 'failed_state_content');
    expect(calculateMetricSpy).toHaveBeenNthCalledWith(2, 'contracted');
    expect(applySpy).toHaveBeenCalledTimes(1);
    expect(applySpy).toHaveBeenCalledWith('failed_state_content');

    expect(result).toBeNull();
  });
});
