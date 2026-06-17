/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  SimulatedZkProver,
  CircuitPublicInputs,
  CircuitPrivateInputs,
  SnarkProof,
} from './zk-snark.js';

describe('SimulatedZkProver', () => {
  let prover: SimulatedZkProver;
  let validPublicInputs: CircuitPublicInputs;
  let validPrivateInputs: CircuitPrivateInputs;
  let validProof: SnarkProof;

  beforeEach(() => {
    prover = new SimulatedZkProver();
    validPublicInputs = {
      genesis_hash: '0xgenesis',
      gene_hash: '0xgene',
    };
    validPrivateInputs = {
      human_seed_sk: '0xsecret',
      raw_prompt: 'Hello world',
      biometric_sig: '0xsig',
    };
    validProof = {
      pi_a: ['0x123...', '0x456...', '0x789...'],
      pi_b: [
        ['0xabc...', '0xdef...'],
        ['0xghi...', '0xjkl...'],
      ],
      pi_c: ['0xmno...', '0xpqr...'],
      protocol: 'groth16',
      curve: 'bn128',
    };
  });

  describe('generateProof', () => {
    it('returns a mocked proof for valid inputs', async () => {
      const proof = await prover.generateProof(
        validPublicInputs,
        validPrivateInputs
      );
      expect(proof).toEqual(validProof);
    });

    it('throws when genesis_hash is missing', async () => {
      const publicInputs = { ...validPublicInputs, genesis_hash: '' };
      await expect(
        prover.generateProof(publicInputs, validPrivateInputs)
      ).rejects.toThrow('Invalid public inputs for ZK Circuit.');
    });

    it('throws when gene_hash is missing', async () => {
      const publicInputs = { ...validPublicInputs, gene_hash: '' };
      await expect(
        prover.generateProof(publicInputs, validPrivateInputs)
      ).rejects.toThrow('Invalid public inputs for ZK Circuit.');
    });

    it('throws when human_seed_sk is missing', async () => {
      const privateInputs = { ...validPrivateInputs, human_seed_sk: '' };
      await expect(
        prover.generateProof(validPublicInputs, privateInputs)
      ).rejects.toThrow('Invalid private inputs for ZK Circuit.');
    });

    it('throws when raw_prompt is missing', async () => {
      const privateInputs = { ...validPrivateInputs, raw_prompt: '' };
      await expect(
        prover.generateProof(validPublicInputs, privateInputs)
      ).rejects.toThrow('Invalid private inputs for ZK Circuit.');
    });
  });

  describe('verifyProof', () => {
    it('returns true for a valid proof structure', async () => {
      const result = await prover.verifyProof(validProof, validPublicInputs);
      expect(result).toBe(true);
    });

    it('returns false when protocol is not groth16', async () => {
      const invalidProof: SnarkProof = { ...validProof, protocol: 'plonk' };
      const result = await prover.verifyProof(invalidProof, validPublicInputs);
      expect(result).toBe(false);
    });

    it('returns false when curve is not bn128', async () => {
      const invalidProof: SnarkProof = { ...validProof, curve: 'bls12-381' };
      const result = await prover.verifyProof(invalidProof, validPublicInputs);
      expect(result).toBe(false);
    });

    it('returns false when pi_a does not have exactly 3 elements', async () => {
      const invalidProof: SnarkProof = { ...validProof, pi_a: ['0x1'] };
      const result = await prover.verifyProof(invalidProof, validPublicInputs);
      expect(result).toBe(false);
    });
  });
});
