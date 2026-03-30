export type GamePhase =
  | 'prep'
  | 'setup'
  | 'aliases'
  | 'briefing'
  | 'mission'
  | 'complete';

export type Role =
  | 'Lead Bunny'
  | 'Clue Reader'
  | 'Helper Bunny'
  | 'Checker Bunny';

export interface Player {
  id: string;
  realName: string;
  age: number;
  ageRank: number;
  spyAlias: string;
  spyPhoto: string;
  currentRole: Role;
}

export interface SetupEntry {
  id: string;
  realName: string;
  age: string;
  spyPhoto: string;
}

export interface Mission {
  id: number;
  title: string;
  clueText: string;
  acceptedCodes: string[];
  prepHint: string;
  teamRule: string;
  leadPrompt: string;
}

export interface GameState {
  phase: GamePhase;
  setupEntries: SetupEntry[];
  players: Player[];
  lockedAliasIds: string[];
  currentMission: number;
  completedMissionIds: number[];
  soundEnabled: boolean;
}
