import type { Mission, Role } from './types';

export const APP_TITLE = 'Burrow Command';
export const APP_SUBTITLE = 'Spy Bunny Mission Base';

export const STORY_SETUP = [
  'Attention, Spy Bunnies. The Easter Bunny has hidden the treasure somewhere in this house.',
  'You must complete 12 secret missions as one team. No racing ahead, no opening clues alone, and no grabbing the next mission before everyone arrives together.',
  'Every mission has a lead agent, but every bunny must help.',
];

export const GOLDEN_RULES = [
  'No one opens or grabs a clue alone.',
  'The team stays together at every mission.',
  'If the Lead Bunny is the youngest, older helpers may use only one free hand to help.',
  'If anyone wants to swap early, the team must do the Bunny Swap Penalty first.',
];

export const BUNNY_SWAP_PENALTY = [
  'Stand still.',
  'Wiggle noses 5 times.',
  'Whisper "swap-a-bunny approved."',
  'Do 3 bunny hops together.',
];

export const DRESS_UP_OPTIONS = [
  'Sunglasses',
  'Bunny ears',
  'Paper badge',
  'Fluffy tail',
  'A toy bunny to carry',
];

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  'Lead Bunny': 'Does the main searching or main action for the current mission.',
  'Clue Reader': 'Reads the clue aloud or helps the team hear the mission clearly.',
  'Helper Bunny': 'Gives hands-on help to the Lead Bunny when needed.',
  'Checker Bunny': 'Makes sure the team follows the mission rule before moving on.',
};

export const SPY_NAME_POOL = [
  'Agent Carrot',
  'Captain Cottontail',
  'Shadow Hopper',
  'Jellybean Jumper',
  'Chief Hopper',
  'Whisper Whiskers',
  'Moonbeam Burrow',
  'Velvet Footsteps',
  'Agent Sniffles',
  'Secret Sprinkles',
  'Marshmallow Scout',
  'Midnight Muffin',
  'Carrot Comet',
  'Radar Rabbit',
  'Clover Sneaks',
  'Biscuit Bounce',
  'Mossy Mission',
  'Cloudy Cottontail',
  'Crackle Carrot',
  'Pebble Paws',
];

export const MISSIONS: Mission[] = [
  {
    id: 1,
    title: 'Spy Bunnies Assemble',
    clueText:
      'Welcome, Spy Bunnies.\nBefore the hunt begins, choose your role cards and stay together.\n\nYour first mission is to find the cold keeper.\n\nRiddle:\nI keep milk cold and fruit nice too,\nOpen my door to find your clue.',
    acceptedCodes: ['BEEP'],
    prepHint: 'Give this clue by hand and hide the next one in the fridge.',
    teamRule:
      'Everyone puts one hand in the middle and says "Spy Bunnies ready!" before the search begins.',
    leadPrompt:
      'Lead Bunny does the main search after the team solves the clue.',
  },
  {
    id: 2,
    title: 'Frozen Fingers',
    clueText:
      'The next clue is hidden where frozen things stay.\nBut first you must travel the Bunny Chain way.\n\nLine up youngest to oldest.\nHold hands the whole time.\nDo not let go.\n\nThe youngest bunny finds the clue while the others may help with one free hand only.',
    acceptedCodes: ['HOPS'],
    prepHint:
      'Hide this clue in the freezer under frozen chips or another safe item.',
    teamRule:
      'Move in age order, stay linked together, and help the youngest Lead Bunny with only one free hand each.',
    leadPrompt:
      'Lead Bunny makes the final grab while the team stays linked.',
  },
  {
    id: 3,
    title: 'Hop Code',
    clueText:
      'Spy code: DEB\n\nUnscramble it to find where next.\nThen the whole team must bunny-hop there together.',
    acceptedCodes: ['NIBS'],
    prepHint: 'Hide this clue on a bed or tucked beneath a pillow.',
    teamRule:
      'Nobody sprints ahead. Solve the code together and hop there as one team.',
    leadPrompt:
      'Lead Bunny does the main search once the team arrives together.',
  },
  {
    id: 4,
    title: 'Bedroom Memory Test',
    clueText:
      'You may not search yet.\nFirst, study this room for 15 seconds.\nThen close your eyes.\n\nThe team must name:\n- one soft thing\n- one thing with a colour on it\n- one thing with letters on it\n\nWhen all 3 are answered, solve this:\nI show films and cartoons too,\nIn the lounge waits your next clue.',
    acceptedCodes: ['GLOW'],
    prepHint: 'Hide this clue by the television in the lounge.',
    teamRule:
      'The team must complete the memory test before anyone searches or moves on.',
    leadPrompt:
      'Lead Bunny begins the main search only after the whole team completes the memory challenge.',
  },
  {
    id: 5,
    title: 'Secret Acrostic',
    clueText:
      'Read the first letter of each line:\n\nCounting hours every day\nLooking quietly on display\nOn the wall or shelf I stay\nClicking never, come what may\nKeeping time in my own way',
    acceptedCodes: ['JOLT'],
    prepHint: 'Hide this clue by a clock.',
    teamRule:
      'Nobody moves until the Checker Bunny says, "Code cracked."',
    leadPrompt:
      'Lead Bunny starts the main search only after the Checker Bunny gives the signal.',
  },
  {
    id: 6,
    title: 'Spoon Balance Operation',
    clueText:
      'Mission first. Searching second.\n\nCarry one chocolate egg, pom-pom, or paper ball on a spoon from here to the next room.\nOnly the Lead Bunny holds the spoon.\nHelper Bunny may steady the Lead Bunny’s arm.\nIf it drops, everyone freezes and does 2 bunny hops before trying again.\n\nRiddle:\nI hold adventures, facts and tales,\nPaper worlds and pirate sails.',
    acceptedCodes: ['MINT'],
    prepHint: 'Hide this clue inside a book or on a bookshelf.',
    teamRule:
      'Complete the spoon mission before solving or searching for the next clue.',
    leadPrompt:
      'Lead Bunny carries the spoon while the Helper Bunny steadies their arm.',
  },
  {
    id: 7,
    title: 'Book Bunny Puzzle',
    clueText:
      'Take every second letter:\n\nsShHoOeEsS\n\nSolve it, then let the youngest bunny point to where you should go next.',
    acceptedCodes: ['DASH'],
    prepHint: 'Hide this clue in the shoe area.',
    teamRule:
      'The youngest bunny must point to the next location and the team follows that point together.',
    leadPrompt:
      'Lead Bunny handles the search once the youngest bunny has pointed the way.',
  },
  {
    id: 8,
    title: 'Silly Parade Mission',
    clueText:
      'Before the next clue may be earned:\n- the Lead Bunny must wear two odd shoes or slippers\n- the whole team must march in a silly spy parade\n- the Checker Bunny decides when the parade is funny enough\n\nThen solve:\nUp and down I always go,\nBut never leave the house below.',
    acceptedCodes: ['ZOOM'],
    prepHint: 'Hide this clue on the stairs.',
    teamRule:
      'The parade must happen first, and only the Checker Bunny can declare it funny enough.',
    leadPrompt:
      'Lead Bunny wears the odd shoes and leads the parade before the search begins.',
  },
  {
    id: 9,
    title: 'Silent Stair Spy Test',
    clueText:
      'This is a stealth mission.\nThe team must go to the next place as quietly as possible.\nIf anyone stomps loudly, everyone must go back and try again.\n\nRiddle:\nI run but have no feet,\nI have a ring but no finger.\nTurn me on to wash your hands.',
    acceptedCodes: ['WAVE'],
    prepHint: 'Hide this clue by the bathroom sink.',
    teamRule:
      'Move in full stealth mode. If anyone stomps, restart the quiet walk together.',
    leadPrompt:
      'Lead Bunny does the main search once the team completes the silent approach.',
  },
  {
    id: 10,
    title: 'Guided Bunny',
    clueText:
      'Trust mission.\nOne bunny closes their eyes.\nAnother bunny guides them using words only: "step left", "stop", "forward", and so on.\n\nWhen the mission is complete, solve this:\nI warm leftovers with a hum,\nPress my buttons, round they come.',
    acceptedCodes: ['PING'],
    prepHint: 'Hide this clue near the microwave.',
    teamRule:
      'Only words may guide the chosen bunny. No pulling, pushing, or dragging.',
    leadPrompt:
      'Lead Bunny completes the guided walk before the team starts searching.',
  },
  {
    id: 11,
    title: 'Bunny Cipher',
    clueText:
      'Move each letter back by one in the alphabet:\n\nDPBU DVQCPBSE\n\nClue Reader may ask one person at a time for help. Nobody shouts all at once.',
    acceptedCodes: ['BRIM'],
    prepHint: 'Hide this clue in the coat cupboard.',
    teamRule:
      'The Checker Bunny chooses who speaks next so the code is cracked calmly.',
    leadPrompt:
      'Lead Bunny handles the main search after the code is solved.',
  },
  {
    id: 12,
    title: 'Final Mission',
    clueText:
      'Final team test.\nBefore the last location is revealed:\n- each bunny says one helpful thing another bunny did\n- all four put their hands together\n- everyone says, "Spy Bunnies never quit!"\n\nFinal clue:\nWhere people flop and chat and sprawl,\nLook underneath the softest of all.',
    acceptedCodes: ['GOLD'],
    prepHint: 'Hide the final treasure under the sofa or inside the cushions.',
    teamRule:
      'The mission only counts after every bunny shares something kind about another teammate.',
    leadPrompt:
      'Lead Bunny makes the final treasure check once the whole team finishes the kindness round.',
  },
];
