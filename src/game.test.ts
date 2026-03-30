import { describe, expect, test } from 'vitest';
import { codeMatches, finalizeSetupEntries, normalizeCode, rotatePlayerRoles } from './game';
import type { SetupEntry } from './types';

function makeEntries(): SetupEntry[] {
  return [
    { id: 'p1', realName: 'Dot', age: '4', spyPhoto: 'photo-dot' },
    { id: 'p2', realName: 'Ava', age: '12', spyPhoto: 'photo-ava' },
    { id: 'p3', realName: 'Beau', age: '10', spyPhoto: 'photo-beau' },
    { id: 'p4', realName: 'Coco', age: '6', spyPhoto: 'photo-coco' },
  ];
}

describe('game logic', () => {
  test('sorts ages descending and assigns the opening roles', () => {
    const players = finalizeSetupEntries(makeEntries());

    expect(players.map((player) => player.realName)).toEqual([
      'Ava',
      'Beau',
      'Coco',
      'Dot',
    ]);
    expect(players.map((player) => player.currentRole)).toEqual([
      'Clue Reader',
      'Checker Bunny',
      'Helper Bunny',
      'Lead Bunny',
    ]);
  });

  test('rotates roles so the lead moves fairly through the age order', () => {
    const openingPlayers = finalizeSetupEntries(makeEntries());
    const missionTwoPlayers = rotatePlayerRoles(openingPlayers, 1);
    const missionThreePlayers = rotatePlayerRoles(openingPlayers, 2);

    expect(
      missionTwoPlayers.find((player) => player.currentRole === 'Lead Bunny')
        ?.realName,
    ).toBe('Coco');
    expect(
      missionThreePlayers.find((player) => player.currentRole === 'Lead Bunny')
        ?.realName,
    ).toBe('Beau');
  });

  test('normalizes and matches codes with forgiving spacing and synonyms', () => {
    expect(normalizeCode('  b-e-e-p  ')).toBe('B E E P');
    expect(codeMatches(['BEEP'], 'beep')).toBe(true);
    expect(codeMatches(['GOLD'], ' gold ')).toBe(true);
    expect(codeMatches(['HOPS'], 'fridge')).toBe(false);
  });
});
