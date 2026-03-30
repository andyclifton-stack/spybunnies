import type { GameState, Player, Role, SetupEntry } from './types';

export const STORAGE_KEY = 'burrow-command-state';

export const STARTING_ROLE_ORDER: Role[] = [
  'Clue Reader',
  'Checker Bunny',
  'Helper Bunny',
  'Lead Bunny',
];

const PHASES = new Set([
  'prep',
  'setup',
  'aliases',
  'briefing',
  'mission',
  'complete',
]);

export function createSetupEntries(): SetupEntry[] {
  return Array.from({ length: 4 }, (_, index) => ({
    id: `player-${index + 1}`,
    realName: '',
    age: '',
    spyPhoto: '',
  }));
}

export function createDefaultState(): GameState {
  return {
    phase: 'prep',
    setupEntries: createSetupEntries(),
    players: [],
    lockedAliasIds: [],
    currentMission: 0,
    completedMissionIds: [],
    soundEnabled: true,
  };
}

function coerceSetupEntries(value: unknown): SetupEntry[] {
  if (!Array.isArray(value) || value.length !== 4) {
    return createSetupEntries();
  }

  return value.map((entry, index) => {
    const candidate = entry as Partial<SetupEntry> | undefined;

    return {
      id:
        typeof candidate?.id === 'string'
          ? candidate.id
          : `player-${index + 1}`,
      realName:
        typeof candidate?.realName === 'string' ? candidate.realName : '',
      age: typeof candidate?.age === 'string' ? candidate.age : '',
      spyPhoto:
        typeof candidate?.spyPhoto === 'string' ? candidate.spyPhoto : '',
    };
  });
}

function coercePlayers(value: unknown): Player[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((player) => player as Partial<Player> | undefined)
    .filter(
      (player): player is Partial<Player> =>
        typeof player?.id === 'string' &&
        typeof player.realName === 'string' &&
        typeof player.spyAlias === 'string' &&
        typeof player.spyPhoto === 'string' &&
        typeof player.age === 'number' &&
        typeof player.ageRank === 'number' &&
        STARTING_ROLE_ORDER.includes(player.currentRole as Role),
    )
    .map((player) => ({
      id: player.id!,
      realName: player.realName!,
      age: player.age!,
      ageRank: player.ageRank!,
      spyAlias: player.spyAlias!,
      spyPhoto: player.spyPhoto!,
      currentRole: player.currentRole as Role,
    }));
}

export function loadStoredState(): GameState {
  if (typeof window === 'undefined') {
    return createDefaultState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return createDefaultState();
    }

    const parsed = JSON.parse(raw) as Partial<GameState>;
    const phase = PHASES.has(parsed.phase ?? '') ? parsed.phase! : 'prep';
    const currentMission =
      typeof parsed.currentMission === 'number' &&
      Number.isInteger(parsed.currentMission) &&
      parsed.currentMission >= 0
        ? parsed.currentMission
        : 0;

    return {
      phase,
      setupEntries: coerceSetupEntries(parsed.setupEntries),
      players: coercePlayers(parsed.players),
      lockedAliasIds: Array.isArray(parsed.lockedAliasIds)
        ? parsed.lockedAliasIds.filter(
            (entry): entry is string => typeof entry === 'string',
          )
        : [],
      currentMission,
      completedMissionIds: Array.isArray(parsed.completedMissionIds)
        ? parsed.completedMissionIds.filter(
            (entry): entry is number => typeof entry === 'number',
          )
        : [],
      soundEnabled:
        typeof parsed.soundEnabled === 'boolean'
          ? parsed.soundEnabled
          : true,
    };
  } catch {
    return createDefaultState();
  }
}

export function persistState(state: GameState): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function finalizeSetupEntries(entries: SetupEntry[]): Player[] {
  if (entries.length !== 4) {
    throw new Error('Exactly four spy bunnies are required.');
  }

  const normalizedEntries = entries.map((entry, index) => {
    const realName = entry.realName.trim();
    const age = Number(entry.age);

    if (!realName) {
      throw new Error(`Bunny ${index + 1} needs a real name.`);
    }

    if (!Number.isFinite(age) || age <= 0) {
      throw new Error(`Bunny ${index + 1} needs a valid age.`);
    }

    if (!entry.spyPhoto.trim()) {
      throw new Error(`Bunny ${index + 1} needs a saved Spy ID photo.`);
    }

    return {
      id: entry.id,
      realName,
      age: Math.round(age),
      spyPhoto: entry.spyPhoto,
      originalOrder: index,
    };
  });

  return normalizedEntries
    .sort(
      (left, right) =>
        right.age - left.age || left.originalOrder - right.originalOrder,
    )
    .map((entry, index) => ({
      id: entry.id,
      realName: entry.realName,
      age: entry.age,
      ageRank: index + 1,
      spyAlias: '',
      spyPhoto: entry.spyPhoto,
      currentRole: STARTING_ROLE_ORDER[index],
    }));
}

export function rotatePlayerRoles(
  players: Player[],
  completedMissionCount: number,
): Player[] {
  return players.map((player, index) => ({
    ...player,
    currentRole:
      STARTING_ROLE_ORDER[
        (index + completedMissionCount) % STARTING_ROLE_ORDER.length
      ],
  }));
}

export function normalizeCode(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function codeMatches(
  acceptedCodes: string[],
  candidate: string,
): boolean {
  const normalizedCandidate = normalizeCode(candidate);

  return acceptedCodes.some(
    (acceptedCode) => normalizeCode(acceptedCode) === normalizedCandidate,
  );
}

export function pickNextAlias(
  aliases: string[],
  currentAlias: string,
  randomValue = Math.random(),
): string {
  if (aliases.length === 0) {
    return currentAlias;
  }

  const startingIndex = Math.floor(randomValue * aliases.length);

  for (let offset = 0; offset < aliases.length; offset += 1) {
    const candidate = aliases[(startingIndex + offset) % aliases.length];

    if (candidate !== currentAlias || aliases.length === 1) {
      return candidate;
    }
  }

  return aliases[0];
}

export function assignInitialAliases<T extends { spyAlias: string }>(
  items: T[],
  aliases: string[],
): T[] {
  if (aliases.length === 0) {
    return items;
  }

  const startIndex = Math.floor(Math.random() * aliases.length);

  return items.map((item, index) => ({
    ...item,
    spyAlias: aliases[(startIndex + index) % aliases.length],
  }));
}
