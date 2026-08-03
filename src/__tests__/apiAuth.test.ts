import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { checkCrewPin } from '../lib/apiAuth';

// Each test uses its own x-forwarded-for IP so the module-level rate-limit map (intentionally
// not reset between requests, mirroring how it behaves across real requests) can't leak
// attempt counts from one test into another.
function makeRequest(pin: string | null, ip: string): NextRequest {
  const headers: Record<string, string> = { 'x-forwarded-for': ip };
  if (pin !== null) headers['x-crew-pin'] = pin;
  return new NextRequest('http://localhost/api/crew', { headers });
}

describe('checkCrewPin', () => {
  const originalPin = process.env.CREW_ACCESS_PIN;

  beforeEach(() => {
    process.env.CREW_ACCESS_PIN = '246810';
  });

  afterEach(() => {
    process.env.CREW_ACCESS_PIN = originalPin;
  });

  it('returns 503 when CREW_ACCESS_PIN is not configured', () => {
    delete process.env.CREW_ACCESS_PIN;
    const result = checkCrewPin(makeRequest('246810', '10.0.0.1'));
    expect('error' in result).toBe(true);
    if ('error' in result) expect(result.error.status).toBe(503);
  });

  it('accepts the correct PIN', () => {
    const result = checkCrewPin(makeRequest('246810', '10.0.0.2'));
    expect('ok' in result).toBe(true);
  });

  it('rejects a wrong PIN with 401', () => {
    const result = checkCrewPin(makeRequest('000000', '10.0.0.3'));
    expect('error' in result).toBe(true);
    if ('error' in result) expect(result.error.status).toBe(401);
  });

  it('rejects a missing PIN header with 401', () => {
    const result = checkCrewPin(makeRequest(null, '10.0.0.4'));
    expect('error' in result).toBe(true);
    if ('error' in result) expect(result.error.status).toBe(401);
  });

  it('rejects a PIN of a different length than the configured one (no length-mismatch crash)', () => {
    const result = checkCrewPin(makeRequest('1', '10.0.0.5'));
    expect('error' in result).toBe(true);
    if ('error' in result) expect(result.error.status).toBe(401);
  });

  it('locks out an IP after repeated wrong-PIN attempts, independent of other IPs', () => {
    const attackerIp = '10.0.0.6';
    let lastStatus = 0;
    for (let i = 0; i < 15; i++) {
      const result = checkCrewPin(makeRequest('000000', attackerIp));
      if ('error' in result) lastStatus = result.error.status;
    }
    expect(lastStatus).toBe(429);

    // A different IP is unaffected by the attacker's lockout.
    const otherResult = checkCrewPin(makeRequest('246810', '10.0.0.7'));
    expect('ok' in otherResult).toBe(true);
  });
});
