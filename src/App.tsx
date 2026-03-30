import { useEffect, useRef, useState } from 'react';
import {
  APP_SUBTITLE,
  APP_TITLE,
  BUNNY_SWAP_PENALTY,
  DRESS_UP_OPTIONS,
  GOLDEN_RULES,
  MISSIONS,
  ROLE_DESCRIPTIONS,
  SPY_NAME_POOL,
  STORY_SETUP,
} from './content';
import {
  assignInitialAliases,
  codeMatches,
  createDefaultState,
  finalizeSetupEntries,
  loadStoredState,
  persistState,
  pickNextAlias,
  rotatePlayerRoles,
} from './game';
import {
  playErrorSound,
  playRollSound,
  playSuccessSound,
  playVictorySound,
} from './audio';
import type { GamePhase, GameState, Player, SetupEntry } from './types';

type FeedbackTone = 'idle' | 'error' | 'success';

const RETRY_MESSAGES = [
  'That code is still scrambled. Spy Bunnies, try again together.',
  'Mission Control says nope. Check the clue and send a better code.',
  'Close, but not quite. Gather the team and crack it again.',
];
const PARENT_PIN = '1234';

function App() {
  const [gameState, setGameState] = useState<GameState>(() => loadStoredState());
  const [prepOverlayOpen, setPrepOverlayOpen] = useState(false);
  const [setupError, setSetupError] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [codeFeedback, setCodeFeedback] = useState('');
  const [feedbackTone, setFeedbackTone] = useState<FeedbackTone>('idle');
  const [aliasPulse, setAliasPulse] = useState(0);
  const [spyDockExpanded, setSpyDockExpanded] = useState(false);
  const [parentPin, setParentPin] = useState('');
  const [parentPinError, setParentPinError] = useState('');
  const [parentPinVerified, setParentPinVerified] = useState(false);

  useEffect(() => {
    persistState(gameState);
  }, [gameState]);

  useEffect(() => {
    if (gameState.phase === 'prep') {
      setPrepOverlayOpen(false);
    }
  }, [gameState.phase]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    setCodeInput('');
    setCodeFeedback('');
    setFeedbackTone('idle');
  }, [gameState.currentMission, gameState.phase]);

  const prepOpen = prepOverlayOpen;
  const currentMission = MISSIONS[gameState.currentMission];
  const completedCount = gameState.completedMissionIds.length;
  const aliasIndex = gameState.players.findIndex(
    (player) => !gameState.lockedAliasIds.includes(player.id),
  );
  const activeAliasPlayer =
    aliasIndex === -1 ? null : gameState.players[aliasIndex];

  function playSound(effect: () => void): void {
    if (gameState.soundEnabled) {
      effect();
    }
  }

  function updateSetupEntry(
    index: number,
    field: keyof Pick<SetupEntry, 'realName' | 'age' | 'spyPhoto'>,
    value: string,
  ): void {
    setSetupError('');
    setGameState((current) => ({
      ...current,
      setupEntries: current.setupEntries.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry,
      ),
    }));
  }

  function beginSetup(): void {
    setSetupError('');
    setPrepOverlayOpen(false);
    setGameState((current) => ({
      ...current,
      phase: 'setup',
      currentMission: 0,
      completedMissionIds: [],
      lockedAliasIds: [],
      players: [],
    }));
  }

  function submitTeamSetup(): void {
    try {
      const players = assignInitialAliases(
        finalizeSetupEntries(gameState.setupEntries),
        SPY_NAME_POOL,
      );

      setGameState((current) => ({
        ...current,
        phase: 'aliases',
        players,
        lockedAliasIds: [],
        currentMission: 0,
        completedMissionIds: [],
      }));
      setSetupError('');
      playSound(playSuccessSound);
    } catch (error) {
      setSetupError(
        error instanceof Error
          ? error.message
          : 'Please finish all four bunny details.',
      );
      playSound(playErrorSound);
    }
  }

  function assignAlias(playerId: string, alias: string): void {
    setGameState((current) => ({
      ...current,
      players: current.players.map((player) =>
        player.id === playerId ? { ...player, spyAlias: alias } : player,
      ),
    }));
  }

  function rollAlias(): void {
    if (!activeAliasPlayer) {
      return;
    }

    const alias = pickNextAlias(SPY_NAME_POOL, activeAliasPlayer.spyAlias);
    assignAlias(activeAliasPlayer.id, alias);
    setAliasPulse((value) => value + 1);
    playSound(playRollSound);
  }

  function lockAlias(): void {
    if (!activeAliasPlayer?.spyAlias) {
      return;
    }

    const nextLockedIds = [...gameState.lockedAliasIds, activeAliasPlayer.id];
    const allLocked = nextLockedIds.length === gameState.players.length;

    setGameState((current) => ({
      ...current,
      phase: allLocked ? 'briefing' : 'aliases',
      lockedAliasIds: nextLockedIds,
    }));
    playSound(playSuccessSound);
  }

  function beginMissionOne(): void {
    setGameState((current) => ({
      ...current,
      phase: 'mission',
      currentMission: 0,
    }));
  }

  function submitMissionCode(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!currentMission) {
      return;
    }

    if (!codeInput.trim()) {
      setCodeFeedback('Type the mission code before sending it to Burrow Command.');
      setFeedbackTone('error');
      playSound(playErrorSound);
      return;
    }

    if (!codeMatches(currentMission.acceptedCodes, codeInput)) {
      setCodeFeedback(RETRY_MESSAGES[currentMission.id % RETRY_MESSAGES.length]);
      setFeedbackTone('error');
      playSound(playErrorSound);
      return;
    }

    const isFinalMission = gameState.currentMission === MISSIONS.length - 1;
    const nextCompleted = [
      ...new Set([...gameState.completedMissionIds, currentMission.id]),
    ];

    setGameState((current) => ({
      ...current,
      completedMissionIds: nextCompleted,
      currentMission: isFinalMission
        ? current.currentMission
        : current.currentMission + 1,
      phase: isFinalMission ? 'complete' : 'mission',
      players: isFinalMission
        ? current.players
        : rotatePlayerRoles(current.players, nextCompleted.length),
    }));

    setCodeFeedback(
      isFinalMission
        ? 'Treasure unlocked. Spy Bunnies, mission complete!'
        : `Code accepted. Mission ${currentMission.id + 1} is ready. Press Listen Now.`,
    );
    setFeedbackTone('success');

    if (isFinalMission) {
      playSound(playVictorySound);
    } else {
      playSound(playSuccessSound);
    }
  }

  function resetGame(): void {
    setGameState(createDefaultState());
    setPrepOverlayOpen(false);
    setParentPin('');
    setParentPinError('');
    setParentPinVerified(false);
    setSetupError('');
    setCodeInput('');
    setCodeFeedback('');
    setFeedbackTone('idle');
  }

  function requestParentsSetup(): void {
    setPrepOverlayOpen(true);
    setParentPin('');
    setParentPinError('');
    setParentPinVerified(false);
  }

  function unlockParentsSetup(): void {
    if (parentPin === PARENT_PIN) {
      setParentPinVerified(true);
      setParentPinError('');
      return;
    }

    setParentPinError('Incorrect PIN. Try again.');
  }

  function closeParentsSetup(): void {
    setPrepOverlayOpen(false);
    setParentPin('');
    setParentPinError('');
    setParentPinVerified(false);
  }

  function printAdminPack(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  const showSpyIdDock =
    gameState.players.length > 0 &&
    ['aliases', 'briefing', 'mission', 'complete'].includes(gameState.phase);

  return (
    <div className="app-shell">
      <div className="decor-orb decor-orb-left" aria-hidden="true" />
      <div className="decor-orb decor-orb-right" aria-hidden="true" />

      <header className="topbar">
        <div className="brand-lockup">
          <LogoMark />
          <div>
            <p className="eyebrow">{APP_TITLE}</p>
            <h1>{APP_SUBTITLE}</h1>
          </div>
        </div>

        <div className="topbar-actions">
          {!prepOverlayOpen ? (
            <button
              type="button"
              className="secondary-button"
              onClick={requestParentsSetup}
            >
              Agent Access
            </button>
          ) : null}
        </div>
      </header>

      {showSpyIdDock ? (
        <SpyIdDock
          expanded={spyDockExpanded}
          onToggle={() => setSpyDockExpanded((current) => !current)}
          players={gameState.players}
        />
      ) : null}

      {prepOpen ? (
        parentPinVerified ? (
          <PrepScreen
            currentPhase={gameState.phase}
            missionsCompleted={completedCount}
            players={gameState.players}
            onStart={beginSetup}
            onClose={closeParentsSetup}
            onPrint={printAdminPack}
            onReset={resetGame}
          />
        ) : (
          <ParentsPinScreen
            error={parentPinError}
            pin={parentPin}
            onCancel={closeParentsSetup}
            onChange={setParentPin}
            onUnlock={unlockParentsSetup}
          />
        )
      ) : gameState.phase === 'prep' ? (
        <LaunchScreen
          onOpenParents={requestParentsSetup}
          onStart={beginSetup}
        />
      ) : gameState.phase === 'setup' ? (
        <TeamSetupScreen
          entries={gameState.setupEntries}
          error={setupError}
          onChange={updateSetupEntry}
          onSubmit={submitTeamSetup}
        />
      ) : gameState.phase === 'aliases' ? (
        <AliasScreen
          activePlayer={activeAliasPlayer}
          aliasPulse={aliasPulse}
          lockedAliasIds={gameState.lockedAliasIds}
          players={gameState.players}
          onRoll={rollAlias}
          onLock={lockAlias}
        />
      ) : gameState.phase === 'briefing' ? (
        <BriefingScreen
          onLaunch={beginMissionOne}
        />
      ) : gameState.phase === 'mission' ? (
        <MissionScreen
          codeFeedback={codeFeedback}
          codeInput={codeInput}
          completedCount={completedCount}
          currentMission={currentMission}
          currentMissionIndex={gameState.currentMission}
          feedbackTone={feedbackTone}
          players={gameState.players}
          totalMissions={MISSIONS.length}
          onCodeChange={setCodeInput}
          onSubmit={submitMissionCode}
        />
      ) : (
        <CompleteScreen
          players={gameState.players}
          onReplay={resetGame}
        />
      )}
    </div>
  );
}

function LogoMark() {
  return (
    <div className="logo-mark" aria-hidden="true">
      <svg viewBox="0 0 120 120" role="presentation">
        <defs>
          <linearGradient id="badgeGlow" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#ffcb6b" />
            <stop offset="100%" stopColor="#ff8c42" />
          </linearGradient>
        </defs>
        <path
          d="M60 10c8 0 14 5 17 12l5 12 13-4c9-3 18 4 18 13v17l11 8c7 5 8 15 2 22l-9 12 9 12c6 7 5 17-2 22l-11 8v17c0 9-9 16-18 13l-13-4-5 12c-3 7-9 12-17 12s-14-5-17-12l-5-12-13 4c-9 3-18-4-18-13v-17l-11-8c-7-5-8-15-2-22l9-12-9-12c-6-7-5-17 2-22l11-8V43c0-9 9-16 18-13l13 4 5-12c3-7 9-12 17-12Z"
          fill="url(#badgeGlow)"
        />
        <path
          d="M39 48c0-16 9-30 21-30s21 14 21 30"
          fill="none"
          stroke="#213547"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <circle cx="45" cy="63" r="7" fill="#213547" />
        <circle cx="75" cy="63" r="7" fill="#213547" />
        <path
          d="M50 82c6 8 14 12 23 12 9 0 17-4 23-12"
          fill="none"
          stroke="#213547"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M34 28 22 4M86 28l12-24"
          fill="none"
          stroke="#213547"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function LaunchScreen({
  onOpenParents,
  onStart,
}: {
  onOpenParents: () => void;
  onStart: () => void;
}) {
  const launchBrief =
    'Attention, Spy Bunnies. Burrow Command is online. Gather your whole team at the console and get ready to receive your secret spy names before the missions begin.';

  return (
    <main className="screen">
      <section className="hero-card terminal-hero launch-hero">
        <div className="hero-copy">
          <p className="eyebrow">Burrow Command Online</p>
          <h2>Spy Bunnies, report for mission check-in.</h2>
          <NarratedRevealPanel
            buttonLabel="Play Mission Check-In"
            lockedLabel="Mission check-in locked. Press play to hear and reveal it."
            panelTitle="Mission Check-In Transmission"
            text={launchBrief}
          />
        </div>
      </section>

      <section className="content-grid">
        <article className="panel">
          <h3>Mission Launch Steps</h3>
          <ol className="detail-list numbered-list">
            <li>Gather all four Spy Bunnies.</li>
            <li>Start Team Setup and let Mission Control assign the spy names.</li>
            <li>Stay together for every mission.</li>
          </ol>
        </article>

        <article className="panel">
          <h3>Spy Console Status</h3>
          <div className="status-stack">
            <p className="console-line">CHANNEL: HOUSE OPS</p>
            <p className="console-line">MODE: TREASURE RECOVERY</p>
            <p className="console-line">RULE: NO BUNNY LEFT BEHIND</p>
          </div>
        </article>
      </section>

      <div className="button-row">
        <button type="button" className="primary-button" onClick={onStart}>
          Start Team Setup
        </button>
      </div>
    </main>
  );
}

function PrepScreen({
  currentPhase,
  missionsCompleted,
  players,
  onStart,
  onClose,
  onPrint,
  onReset,
}: {
  currentPhase: GamePhase;
  missionsCompleted: number;
  players: Player[];
  onStart: () => void;
  onClose: () => void;
  onPrint: () => void;
  onReset: () => void;
}) {
  const hasProgress = currentPhase !== 'prep';

  return (
    <main className="screen prep-screen">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Parents Setup</p>
          <h2>Set the stage before the Spy Bunnies arrive.</h2>
          <p>
            Burrow Command runs the whole hunt from one shared screen. Use this
            panel to review the story, prep the hiding spots, and reset the
            mission if you need a clean start.
          </p>
        </div>

        <div className="status-panel parent-pin-panel">
          <div className="status-chip">
            {missionsCompleted} / {MISSIONS.length} missions solved
          </div>
          {players.length === 4 ? (
            <p className="status-copy">
              Current squad: {players.map((player) => player.realName).join(', ')}
            </p>
          ) : (
            <p className="status-copy">No squad locked in yet.</p>
          )}
        </div>
      </section>

      <section className="panel">
        <h3>Code Slip Pack</h3>
        <div className="mission-list">
          {MISSIONS.map((mission) => (
            <article className="mission-item" key={mission.id}>
              <div>
                <p className="mission-kicker">Mission {mission.id}</p>
                <h4>{mission.title}</h4>
                <p>{mission.prepHint}</p>
                <div className="admin-clue-block admin-code-card">
                  <p className="spy-id-kicker">Code Slip To Hide</p>
                  <p className="admin-code">{mission.acceptedCodes[0]}</p>
                </div>
                <div className="admin-clue-block">
                  <p className="spy-id-kicker">Mission app clue reference</p>
                  <TextBlocks text={mission.clueText} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="button-row">
        <button type="button" className="primary-button" onClick={onStart}>
          {currentPhase === 'prep' ? 'Start Team Setup' : 'Restart Team Setup'}
        </button>
        {hasProgress ? (
          <button type="button" className="secondary-button" onClick={onClose}>
            Back to Mission
          </button>
        ) : null}
        <button type="button" className="secondary-button" onClick={onPrint}>
          Print Code Pack
        </button>
        <button type="button" className="danger-button" onClick={onReset}>
          Reset Game
        </button>
      </div>
    </main>
  );
}

function ParentsPinScreen({
  error,
  pin,
  onCancel,
  onChange,
  onUnlock,
}: {
  error: string;
  pin: string;
  onCancel: () => void;
  onChange: (value: string) => void;
  onUnlock: () => void;
}) {
  return (
    <main className="screen">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Parents Setup Locked</p>
          <h2>Enter the PIN to open the command controls.</h2>
          <p>
            This keeps the admin clues, codes, and print pack tucked away from
            curious Spy Bunnies.
          </p>
        </div>
        <div className="status-panel parent-pin-panel">
          <label className="field">
            <span>PIN</span>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Enter PIN"
            />
          </label>
          {error ? <p className="feedback-banner feedback-error">{error}</p> : null}
          <div className="button-row">
            <button type="button" className="primary-button" onClick={onUnlock}>
              Unlock
            </button>
            <button type="button" className="secondary-button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function TeamSetupScreen({
  entries,
  error,
  onChange,
  onSubmit,
}: {
  entries: SetupEntry[];
  error: string;
  onChange: (
    index: number,
    field: keyof Pick<SetupEntry, 'realName' | 'age' | 'spyPhoto'>,
    value: string,
  ) => void;
  onSubmit: () => void;
}) {
  return (
    <main className="screen">
      <section className="hero-card split-hero">
        <div className="hero-copy">
          <p className="eyebrow">Team Setup</p>
          <h2>Enter the real names and ages for all 4 Spy Bunnies.</h2>
        </div>
        <div className="status-panel">
          <p className="status-copy">
            Every bunny needs a saved Spy ID photo before the team can move on.
          </p>
        </div>
      </section>

      <section className="setup-grid">
        {entries.map((entry, index) => (
          <SpySetupCard
            entry={entry}
            index={index}
            key={entry.id}
            onChange={onChange}
          />
        ))}
      </section>

      {error ? <p className="feedback-banner feedback-error">{error}</p> : null}

      <div className="button-row">
        <button type="button" className="primary-button" onClick={onSubmit}>
          Build the Team Roster
        </button>
      </div>
    </main>
  );
}

function SpySetupCard({
  entry,
  index,
  onChange,
}: {
  entry: SetupEntry;
  index: number;
  onChange: (
    index: number,
    field: keyof Pick<SetupEntry, 'realName' | 'age' | 'spyPhoto'>,
    value: string,
  ) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [draftPhoto, setDraftPhoto] = useState('');

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play().catch(() => {
        setCameraError('The camera preview could not start.');
      });
    }
  }, [cameraOpen]);

  async function openCamera(): Promise<void> {
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraError('This browser could not open the camera.');
      return;
    }

    stopCamera();
    setCameraError('');
    setDraftPhoto('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      setCameraError('Camera access was blocked or unavailable.');
      setCameraOpen(false);
    }
  }

  function stopCamera(): void {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  function closeCamera(): void {
    stopCamera();
    setCameraOpen(false);
    setDraftPhoto('');
  }

  function capturePhoto(): void {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
      setCameraError('The camera was not ready for a photo yet.');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');

    if (!context) {
      setCameraError('The photo tool could not capture this image.');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setDraftPhoto(canvas.toDataURL('image/jpeg', 0.82));
  }

  function confirmPhoto(): void {
    if (!draftPhoto) {
      return;
    }

    onChange(index, 'spyPhoto', draftPhoto);
    closeCamera();
  }

  function clearPhoto(): void {
    onChange(index, 'spyPhoto', '');
  }

  return (
    <article className="panel setup-card">
      <p className="mission-kicker">Bunny Slot {index + 1}</p>
      <label className="field">
        <span>Bunny {index + 1} name</span>
        <input
          type="text"
          value={entry.realName}
          onChange={(event) => onChange(index, 'realName', event.target.value)}
          placeholder="Real name"
        />
      </label>
      <label className="field">
        <span>Bunny {index + 1} age</span>
        <input
          type="number"
          min="1"
          max="99"
          value={entry.age}
          onChange={(event) => onChange(index, 'age', event.target.value)}
          placeholder="Age"
        />
      </label>

      <div className="spy-photo-block">
        <span className="field-label">Spy ID photo</span>

        {entry.spyPhoto ? (
          <div className="photo-preview-card">
            <img
              alt={`Spy ID for ${entry.realName || `Bunny ${index + 1}`}`}
              className="spy-photo-preview"
              src={entry.spyPhoto}
            />
            <div className="button-row">
              <button
                type="button"
                className="secondary-button"
                onClick={openCamera}
              >
                Retake Spy ID
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={clearPhoto}
              >
                Clear Photo
              </button>
            </div>
          </div>
        ) : (
          <div className="photo-callout">
            <p className="status-copy">
              Take the Spy ID photo, then press <strong>Use This Photo</strong> to
              save it.
            </p>
            <button
              type="button"
              className="secondary-button"
              onClick={openCamera}
            >
              Take Spy ID Photo
            </button>
          </div>
        )}

        {cameraError ? (
          <p className="feedback-banner feedback-error">{cameraError}</p>
        ) : null}

        {cameraOpen ? (
          <div className="camera-stage">
            <div className="camera-frame">
              {draftPhoto ? (
                <img
                  alt={`Draft Spy ID for ${entry.realName || `Bunny ${index + 1}`}`}
                  className="spy-photo-preview"
                  src={draftPhoto}
                />
              ) : (
                <video
                  aria-label={`Camera preview for Bunny ${index + 1}`}
                  autoPlay
                  muted
                  playsInline
                  ref={videoRef}
                />
              )}
            </div>

            <canvas className="hidden-canvas" ref={canvasRef} />

            <div className="button-row">
              {draftPhoto ? (
                <>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={confirmPhoto}
                  >
                    Use This Photo
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setDraftPhoto('')}
                  >
                    Retake
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="primary-button"
                  onClick={capturePhoto}
                >
                  Capture Photo
                </button>
              )}

              <button
                type="button"
                className="secondary-button"
                onClick={closeCamera}
              >
                Cancel Camera
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function AliasScreen({
  activePlayer,
  aliasPulse,
  lockedAliasIds,
  players,
  onRoll,
  onLock,
}: {
  activePlayer: Player | null;
  aliasPulse: number;
  lockedAliasIds: string[];
  players: Player[];
  onRoll: () => void;
  onLock: () => void;
}) {
  return (
    <main className="screen">
      <section className="hero-card split-hero">
        <div className="hero-copy">
          <p className="eyebrow">Spy Name Generator</p>
          <h2>Mission Control has generated a secret agent name for each bunny.</h2>
          <NarratedRevealPanel
            buttonLabel="Play Spy Name Briefing"
            lockedLabel="Spy name briefing locked. Press play to hear and reveal it."
            panelTitle="Spy Name Briefing"
            text="Mission Control has assigned a funny secret spy name. If a bunny wants a different one, reroll it. When the codename feels right, lock it in."
          />
        </div>
        <div className="status-panel">
          <p className="status-copy">
            Locked in: {lockedAliasIds.length} / {players.length}
          </p>
        </div>
      </section>

      <section className="alias-layout">
        <article className="panel alias-stage">
          {activePlayer ? (
            <>
              <p className="mission-kicker">Now Locking In</p>
              <SpyPhotoFrame player={activePlayer} />
              <h3>{activePlayer.realName}</h3>
              <p className="alias-role">Age {activePlayer.age}</p>

              <div className="dice-orb" key={`${activePlayer.id}-${aliasPulse}`}>
                <span>{activePlayer.spyAlias}</span>
              </div>

              <div className="button-row">
                <button type="button" className="primary-button" onClick={onRoll}>
                  Reroll Spy Name
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={onLock}
                  disabled={!activePlayer.spyAlias}
                >
                  Lock In Spy Name
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mission-kicker">All Aliases Ready</p>
              <h3>Spy squad cleared for briefing.</h3>
            </>
          )}
        </article>

        <article className="panel">
          <h3>Squad Cards</h3>
          <div className="role-grid">
            {players.map((player) => {
              const locked = lockedAliasIds.includes(player.id);

              return (
                <article
                  className={`role-card ${locked ? 'role-card-locked' : ''}`}
                  key={player.id}
                >
                  <SpyPhotoFrame player={player} />
                  <p className="role-tag">
                    {locked ? 'Locked' : 'Waiting'} • {player.currentRole}
                  </p>
                  <h4>{player.spyAlias || 'Spy name pending'}</h4>
                  <p>
                    {player.realName}, age {player.age}
                  </p>
                </article>
              );
            })}
          </div>
        </article>
      </section>
    </main>
  );
}

function BriefingScreen({ onLaunch }: { onLaunch: () => void }) {
  const briefingText = [
    ...STORY_SETUP,
    'Everyone helps. Nobody grabs the clue alone. Every mission rotates the roles, so each bunny gets a fair turn in the spotlight.',
  ].join(' ');

  return (
    <main className="screen">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Mission Briefing</p>
          <h2>The squad is ready. Time to begin the house-wide hunt.</h2>
          <NarratedRevealPanel
            buttonLabel="Play Mission Briefing"
            lockedLabel="Mission briefing locked. Press play to hear and reveal it."
            panelTitle="Opening Briefing Transmission"
            text={briefingText}
          />
        </div>
        <button type="button" className="primary-button" onClick={onLaunch}>
          Launch Mission 1
        </button>
      </section>

      <section className="content-grid">
        <article className="panel">
          <h3>Story Setup</h3>
          {STORY_SETUP.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </article>

        <article className="panel">
          <h3>Dress-Up Spark</h3>
          <ul className="detail-list">
            {DRESS_UP_OPTIONS.map((option) => (
              <li key={option}>{option}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <h3>Role Cards</h3>
          <div className="role-grid compact-grid">
            {Object.entries(ROLE_DESCRIPTIONS).map(([role, description]) => (
              <article className="role-card" key={role}>
                <p className="role-tag">{role}</p>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="panel">
          <h3>Golden Team Rules</h3>
          <ul className="detail-list">
            {GOLDEN_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          <h4>Bunny Swap Penalty</h4>
          <ul className="detail-list">
            {BUNNY_SWAP_PENALTY.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}

function MissionScreen({
  currentMission,
  currentMissionIndex,
  totalMissions,
  players,
  codeInput,
  codeFeedback,
  feedbackTone,
  completedCount,
  onCodeChange,
  onSubmit,
}: {
  currentMission: (typeof MISSIONS)[number];
  currentMissionIndex: number;
  totalMissions: number;
  players: Player[];
  codeInput: string;
  codeFeedback: string;
  feedbackTone: FeedbackTone;
  completedCount: number;
  onCodeChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const progress = Math.round((completedCount / totalMissions) * 100);

  return (
    <main className="screen">
      <section className="hero-card split-hero">
        <div className="hero-copy">
          <p className="eyebrow">
            Mission {currentMissionIndex + 1} of {totalMissions}
          </p>
          <h2>
            Mission {currentMission.id}: {currentMission.title}
          </h2>
          <p>
            Stay together, solve the clue first, and let the Lead Bunny do the
            main action when the team is ready.
          </p>
        </div>
        <div className="status-panel">
          <p className="status-copy">
            Progress: {completedCount} solved
          </p>
          <div className="progress-bar" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          <p className="status-copy">
            Use the Spy ID Board above to see who is leading this mission.
          </p>
        </div>
      </section>

      <section className="screen">
        <MissionTransmissionPanel mission={currentMission} />

        <article className="panel">
          <h3>Mission Team</h3>
          <div className="rule-box">
            <p className="mission-kicker">Team Rule</p>
            <p>{currentMission.teamRule}</p>
          </div>
          <p className="status-copy">
            Check the Spy ID Board above to see each bunny&apos;s current role.
          </p>
        </article>

        <article className="panel mission-primary-panel">
          <h3>Mission Control Code Entry</h3>
          <p>When the team solves the clue, enter the four-letter mission code.</p>
          <form className="code-form" onSubmit={onSubmit}>
            <label className="field field-inline">
              <span>Mission code</span>
              <input
                type="text"
                value={codeInput}
                onChange={(event) => onCodeChange(event.target.value)}
                placeholder="Type the mission code"
                autoComplete="off"
                maxLength={4}
              />
            </label>
            <button type="submit" className="primary-button">
              Unlock Next Mission
            </button>
          </form>

          {codeFeedback ? (
            <p
              className={`feedback-banner ${
                feedbackTone === 'error'
                  ? 'feedback-error'
                  : feedbackTone === 'success'
                    ? 'feedback-success'
                    : ''
              }`}
            >
              {codeFeedback}
            </p>
          ) : null}
        </article>
      </section>
    </main>
  );
}

function MissionTransmissionPanel({
  mission,
}: {
  mission: (typeof MISSIONS)[number];
}) {
  return (
    <NarratedRevealPanel
      buttonLabel="Listen Now"
      lockedLabel="Mission locked. Press Listen Now to hear and reveal it."
      panelTitle="Secure Mission Transmission"
      replayLabel="Listen Again"
      speechText={`${mission.title}. ${mission.clueText.replace(/\n/g, ' ')} Team rule. ${mission.teamRule}`}
      text={mission.clueText}
    />
  );
}

function NarratedRevealPanel({
  buttonLabel,
  lockedLabel,
  panelTitle,
  replayLabel,
  speechText,
  text,
}: {
  buttonLabel: string;
  lockedLabel: string;
  panelTitle: string;
  replayLabel?: string;
  speechText?: string;
  text: string;
}) {
  const [revealedLength, setRevealedLength] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const panelKey = `${panelTitle}-${text.length}`;

  useEffect(() => {
    setRevealedLength(0);
    setHasStarted(false);
    setIsPlaying(false);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [text]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function startTransmission(): void {
    setHasStarted(true);
    setRevealedLength(0);
    setIsPlaying(true);

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      setRevealedLength((current) => {
        if (current >= text.length) {
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return current;
        }

        return current + 1;
      });
    }, 38);

    if (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof SpeechSynthesisUtterance !== 'undefined'
    ) {
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(
        (speechText ?? text).replace(/\n/g, ' '),
      );
      utterance.rate = 0.94;
      utterance.pitch = 0.98;
      utterance.onend = () => {
        setIsPlaying(false);
        setRevealedLength(text.length);
      };
      utterance.onerror = () => {
        setIsPlaying(false);
        setRevealedLength(text.length);
      };
      synth.speak(utterance);
    } else {
      setIsPlaying(false);
    }
  }

  const revealedText = text.slice(0, revealedLength);

  return (
    <article className="panel mission-primary-panel">
      <div className="mission-panel-header">
        <div>
          <h3>{panelTitle}</h3>
          <p className="status-copy">
            Mission text stays locked until the team asks Mission Control to
            play it.
          </p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={startTransmission}
        >
          {hasStarted ? replayLabel ?? buttonLabel : buttonLabel}
        </button>
      </div>

      {hasStarted ? (
        <div className="transmission-screen" aria-live="polite">
          {renderTransmissionText(revealedText, panelKey)}
          {isPlaying ? <span className="transmission-cursor" /> : null}
        </div>
      ) : (
        <div className="transmission-locked">
          <p>{lockedLabel}</p>
        </div>
      )}
    </article>
  );
}

function CompleteScreen({
  players,
  onReplay,
}: {
  players: Player[];
  onReplay: () => void;
}) {
  return (
    <main className="screen">
      <section className="hero-card celebration-card">
        <div className="hero-copy">
          <p className="eyebrow">Treasure Secured</p>
          <h2>Spy Bunnies never quit.</h2>
          <NarratedRevealPanel
            buttonLabel="Play Victory Transmission"
            lockedLabel="Victory transmission locked. Press play to hear and reveal it."
            panelTitle="Victory Transmission"
            text="Treasure secured. The Spy Bunnies completed all twelve missions, cracked every code, and found the treasure together."
          />
        </div>

        <div className="celebration-eggs" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="content-grid">
        <article className="panel">
          <h3>Mission Summary</h3>
          <p>The Spy ID Board above still shows the full squad.</p>
          <ul className="detail-list">
            <li>{players.length} Spy Bunnies completed the mission.</li>
            <li>12 missions were solved as one team.</li>
            <li>The final treasure was secured together.</li>
          </ul>
        </article>

        <article className="panel">
          <h3>What Made It Work</h3>
          <ul className="detail-list">
            <li>They stayed together.</li>
            <li>They rotated the spotlight fairly.</li>
            <li>They solved every clue before moving on.</li>
            <li>They found the treasure as one team.</li>
          </ul>
        </article>
      </section>

      <div className="button-row">
        <button type="button" className="primary-button" onClick={onReplay}>
          Play Again From the Start
        </button>
      </div>
    </main>
  );
}

function RoleRoster({ players }: { players: Player[] }) {
  return (
    <div className="role-grid spy-id-grid">
      {players.map((player) => (
        <article className="role-card spy-id-card" key={player.id}>
          <p className="spy-id-kicker">Burrow Command Spy ID</p>
          <SpyPhotoFrame player={player} />
          <p className="role-tag">{player.currentRole}</p>
          <p className="spy-id-line">
            <span>Codename</span>
            <strong>{player.spyAlias || player.realName}</strong>
          </p>
          <p className="spy-id-line">
            <span>Agent</span>
            <strong>{player.realName}</strong>
          </p>
          <p className="spy-id-line">
            <span>Age Level</span>
            <strong>{player.age}</strong>
          </p>
          <p className="spy-id-line">
            <span>Assignment</span>
            <strong>{player.currentRole}</strong>
          </p>
        </article>
      ))}
    </div>
  );
}

function SpyIdDock({
  expanded,
  onToggle,
  players,
}: {
  expanded: boolean;
  onToggle: () => void;
  players: Player[];
}) {
  return (
    <section className="spy-id-dock" aria-label="Spy IDs">
      <div className="spy-id-dock-header">
        <div>
          <p className="eyebrow">Spy ID Board</p>
          <h3>{expanded ? 'Full Agent Dossiers' : 'Live Agent Snapshots'}</h3>
        </div>
        <button type="button" className="secondary-button" onClick={onToggle}>
          {expanded ? 'Collapse IDs' : 'Expand IDs'}
        </button>
      </div>

      {expanded ? (
        <RoleRoster players={players} />
      ) : (
        <div className="spy-id-dock-strip">
          {players.map((player) => (
            <article className="spy-id-dock-card" key={player.id}>
              <SpyPhotoFrame player={player} />
              <div className="spy-id-dock-copy">
                <p>{player.spyAlias || player.realName}</p>
                <span>{player.currentRole}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function SpyPhotoFrame({ player }: { player: Player }) {
  if (!player.spyPhoto) {
    return (
      <div className="spy-photo-fallback" aria-hidden="true">
        <span>{player.realName.slice(0, 1).toUpperCase()}</span>
      </div>
    );
  }

  return (
    <img
      alt={`Spy ID for ${player.realName}`}
      className="spy-photo-thumb"
      src={player.spyPhoto}
    />
  );
}

function TextBlocks({ text }: { text: string }) {
  return (
    <div className="text-stack">
      {text.split('\n\n').map((block) => {
        const lines = block.split('\n');

        return (
          <p key={block}>
            {lines.map((line, index) => (
              <span key={`${line}-${index}`}>
                {line}
                {index < lines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function renderTransmissionText(revealedText: string, panelKey: string) {
  const tokens = revealedText.match(/[^\s]+|\s+/g) ?? [];

  return tokens.map((token, tokenIndex) => {
    if (/^\s+$/.test(token)) {
      return token.split('').map((character, characterIndex) =>
        character === '\n' ? (
          <br key={`${panelKey}-space-${tokenIndex}-${characterIndex}`} />
        ) : (
          <span
            className="transmission-char"
            key={`${panelKey}-space-${tokenIndex}-${characterIndex}`}
          >
            {character}
          </span>
        ),
      );
    }

    return (
      <span className="transmission-word" key={`${panelKey}-word-${tokenIndex}`}>
        {token.split('').map((character, characterIndex) => (
          <span
            className="transmission-char"
            key={`${panelKey}-char-${tokenIndex}-${characterIndex}`}
          >
            {character}
          </span>
        ))}
      </span>
    );
  });
}

export default App;
