import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as cp from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import path from 'node:path';

// Mock factories
vi.mock('node:child_process', () => {
    const mockCp = {
        spawn: vi.fn(),
        exec: vi.fn(),
        execSync: vi.fn(),
    };
    return {
        ...mockCp,
        default: mockCp,
    };
});

vi.mock('node:fs', () => {
    const mockFs = {
        realpathSync: vi.fn((p) => p),
        existsSync: vi.fn(() => true),
        readFileSync: vi.fn(() => ''),
        mkdirSync: vi.fn(),
        writeFileSync: vi.fn(),
        resolve: vi.fn(),
        promises: {
            readFile: vi.fn(),
        },
        constants: {},
    };
    return {
        ...mockFs,
        default: mockFs,
    };
});

vi.mock('node:os', () => {
    const mockOs = {
        platform: vi.fn(() => 'darwin'), // sandbox-exec is macOS only
        tmpdir: vi.fn(() => '/tmp'),
        homedir: vi.fn(() => '/home/user'),
        userInfo: vi.fn(),
        release: vi.fn(() => '1.0.0'),
        type: vi.fn(() => 'Darwin'),
    };
    return {
        ...mockOs,
        default: mockOs,
    };
});

vi.mock('@google/gemini-cli-core', () => ({
  Config: class {
      getDebugMode() { return false; }
      getTargetDir() { return '/target'; }
      getWorkspaceContext() {
          return {
              getDirectories() { return ['/dir1']; }
          };
      }
  },
}));

// Import subject under test AFTER mocks
import { start_sandbox } from './sandbox.js';

describe('sandbox security repro', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };
    process.env.GEMINI_SANDBOX_PROXY_COMMAND = 'echo proxy';
    process.env.SEATBELT_PROFILE = 'permissive-open';

    vi.mocked(os.platform).mockReturnValue('darwin');
    vi.mocked(os.tmpdir).mockReturnValue('/tmp');
    vi.mocked(os.homedir).mockReturnValue('/home/user');

    vi.mocked(fs.realpathSync).mockImplementation((p) => p.toString());
    vi.mocked(fs.existsSync).mockReturnValue(true);

    // Mock exec for curl check
    // @ts-ignore
    vi.mocked(cp.exec).mockImplementation(((cmd: string, options: any, cb: any) => {
        if (typeof options === 'function') {
            cb = options;
            options = {};
        }
        if (cb) cb(null, 'ok', '');
        return { unref: vi.fn(), on: vi.fn() } as any;
    }) as any);

    vi.mocked(cp.execSync).mockReturnValue('mock-output');

    // Mock spawn process logic
    const baseMockProcess = {
        on: vi.fn(),
        stdout: { on: vi.fn(), removeListener: vi.fn() },
        stderr: { on: vi.fn(), removeListener: vi.fn() },
        pid: 123,
        kill: vi.fn(),
    };

    // @ts-ignore
    vi.mocked(cp.spawn).mockImplementation((cmd, args, opts) => {
        const mockP = { ...baseMockProcess };
        mockP.on = vi.fn().mockImplementation((event, cb) => {
            if (event === 'close') {
                setImmediate(() => cb(0, null));
            }
            return mockP;
        });
        return mockP as any;
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('no longer uses shell: true for GEMINI_SANDBOX_PROXY_COMMAND in sandbox-exec path', async () => {
    const config = {
      command: 'sandbox-exec',
      image: 'test-image',
    };

    await start_sandbox(config as any);

    const spawnCalls = vi.mocked(cp.spawn).mock.calls;

    // In the fixed version, the proxy command is called as spawn(cmd, args, options)
    // For 'echo proxy', it should be spawn('echo', ['proxy'], options)
    const proxyCall = spawnCalls.find(call => {
        return call[0] === 'echo';
    });

    expect(proxyCall).toBeDefined();
    const args = proxyCall![1] as string[];
    expect(args).toEqual(['proxy']);

    const options = proxyCall![2] as any;
    expect(options.shell).toBeUndefined();
  });
});
