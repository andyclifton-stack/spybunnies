import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test } from 'vitest';
import App from './App';
import { STORAGE_KEY, finalizeSetupEntries } from './game';
import type { GameState, Player } from './types';

function makePlayers(): Player[] {
  return finalizeSetupEntries([
    { id: 'p1', realName: 'Dot', age: '4', spyPhoto: 'photo-dot' },
    { id: 'p2', realName: 'Ava', age: '12', spyPhoto: 'photo-ava' },
    { id: 'p3', realName: 'Beau', age: '10', spyPhoto: 'photo-beau' },
    { id: 'p4', realName: 'Coco', age: '6', spyPhoto: 'photo-coco' },
  ]).map((player, index) => ({
    ...player,
    spyAlias: ['Agent Carrot', 'Shadow Hopper', 'Jellybean Jumper', 'Chief Hopper'][index],
  }));
}

function storeState(state: GameState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('runs through setup, alias locking, and launches mission 1', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /start team setup/i }));

    await user.type(screen.getByLabelText(/bunny 1 name/i), 'Dot');
    await user.type(screen.getByLabelText(/bunny 1 age/i), '4');
    await user.type(screen.getByLabelText(/bunny 2 name/i), 'Ava');
    await user.type(screen.getByLabelText(/bunny 2 age/i), '12');
    await user.type(screen.getByLabelText(/bunny 3 name/i), 'Beau');
    await user.type(screen.getByLabelText(/bunny 3 age/i), '10');
    await user.type(screen.getByLabelText(/bunny 4 name/i), 'Coco');
    await user.type(screen.getByLabelText(/bunny 4 age/i), '6');

    expect(
      screen.getByText(/every bunny needs a saved spy id photo before the team can move on/i),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /build the team roster/i }),
    );

    expect(
      screen.getByText(/bunny 1 needs a saved spy id photo/i),
    ).toBeInTheDocument();
  });

  test('launches alias flow when all four photos are saved', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /start team setup/i }));

    await user.type(screen.getByLabelText(/bunny 1 name/i), 'Dot');
    await user.type(screen.getByLabelText(/bunny 1 age/i), '4');
    await user.type(screen.getByLabelText(/bunny 2 name/i), 'Ava');
    await user.type(screen.getByLabelText(/bunny 2 age/i), '12');
    await user.type(screen.getByLabelText(/bunny 3 name/i), 'Beau');
    await user.type(screen.getByLabelText(/bunny 3 age/i), '10');
    await user.type(screen.getByLabelText(/bunny 4 name/i), 'Coco');
    await user.type(screen.getByLabelText(/bunny 4 age/i), '6');

    const usePhoto = ['photo-dot', 'photo-ava', 'photo-beau', 'photo-coco'];

    usePhoto.forEach((photo, index) => {
      const nameField = screen.getByLabelText(
        new RegExp(`bunny ${index + 1} name`, 'i'),
      );
      const card = nameField.closest('.setup-card');

      if (!card) {
        throw new Error('Setup card not found.');
      }

      const previewImg = document.createElement('img');
      previewImg.className = 'spy-photo-preview';
      previewImg.setAttribute('src', photo);
      previewImg.setAttribute('alt', `Draft Spy ID ${index + 1}`);
      card.appendChild(previewImg);
    });

    const originalToDataUrl = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function toDataURL() {
      return usePhoto.shift() ?? 'photo-fallback';
    };

    const originalGetUserMedia = navigator.mediaDevices?.getUserMedia;
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: async () =>
          ({
            getTracks: () => [{ stop: () => undefined }],
          }) as MediaStream,
      },
    });

    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: () => Promise.resolve(),
    });

    Object.defineProperty(HTMLVideoElement.prototype, 'videoWidth', {
      configurable: true,
      value: 100,
    });

    Object.defineProperty(HTMLVideoElement.prototype, 'videoHeight', {
      configurable: true,
      value: 100,
    });

    const contextStub = {
      drawImage: () => undefined,
    } as Partial<CanvasRenderingContext2D>;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: () => contextStub as CanvasRenderingContext2D,
    });

    for (let index = 0; index < 4; index += 1) {
      await user.click(screen.getAllByRole('button', { name: /take spy id photo/i })[0]);
      await user.click(screen.getByRole('button', { name: /capture photo/i }));
      await user.click(screen.getByRole('button', { name: /use this photo/i }));
    }

    await user.click(
      screen.getByRole('button', { name: /build the team roster/i }),
    );

    expect(
      screen.getByRole('heading', {
        name: /mission control has generated a secret agent name/i,
      }),
    ).toBeInTheDocument();

    for (let index = 0; index < 4; index += 1) {
      await user.click(screen.getByRole('button', { name: /lock in spy name/i }));
    }

    expect(
      screen.getByRole('heading', { name: /the squad is ready/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /launch mission 1/i }));

    expect(
      screen.getByRole('heading', {
        name: /mission 1: spy bunnies assemble/i,
      }),
    ).toBeInTheDocument();

    HTMLCanvasElement.prototype.toDataURL = originalToDataUrl;
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: originalGetUserMedia,
      },
    });
  });

  test('rejects wrong codes, accepts correct codes, and rotates the finder turn', async () => {
    const user = userEvent.setup();
    const players = makePlayers();

    storeState({
      phase: 'mission',
      setupEntries: [
        { id: 'p1', realName: 'Dot', age: '4', spyPhoto: 'photo-dot' },
        { id: 'p2', realName: 'Ava', age: '12', spyPhoto: 'photo-ava' },
        { id: 'p3', realName: 'Beau', age: '10', spyPhoto: 'photo-beau' },
        { id: 'p4', realName: 'Coco', age: '6', spyPhoto: 'photo-coco' },
      ],
      players,
      lockedAliasIds: players.map((player) => player.id),
      currentMission: 0,
      completedMissionIds: [],
      soundEnabled: false,
    });

    render(<App />);

    await user.type(screen.getByLabelText(/mission code/i), 'NIBS');
    await user.click(
      screen.getByRole('button', { name: /unlock next mission/i }),
    );

    expect(
      screen.getByText(/Mission Control says nope|Close, but not quite|That code is still scrambled/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /mission 1: spy bunnies assemble/i,
      }),
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/mission code/i));
    await user.type(screen.getByLabelText(/mission code/i), 'BEEP');
    await user.click(
      screen.getByRole('button', { name: /unlock next mission/i }),
    );

    expect(
      screen.getByRole('heading', { name: /mission 2: frozen fingers/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Jellybean Jumper/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Finder Bunny/i).length).toBeGreaterThan(0);
  });

  test('restores setup progress after refresh and reset returns to prep', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.click(screen.getByRole('button', { name: /start team setup/i }));
    await user.type(screen.getByLabelText(/bunny 1 name/i), 'Dot');
    await user.type(screen.getByLabelText(/bunny 1 age/i), '4');

    unmount();
    render(<App />);

    expect(screen.getByDisplayValue('Dot')).toBeInTheDocument();
    expect(screen.getByDisplayValue('4')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /agent access/i }));
    await user.type(screen.getByLabelText(/^pin$/i), '1234');
    await user.click(screen.getByRole('button', { name: /unlock/i }));
    await user.click(screen.getByRole('button', { name: /reset game/i }));

    expect(
      screen.getByRole('button', { name: /start team setup/i }),
    ).toBeInTheDocument();
  });
});
