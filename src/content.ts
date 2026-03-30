import type { Mission } from './types';

export const APP_TITLE = 'Burrow Command';
export const APP_SUBTITLE = 'Spy Bunny Mission Base';

export const STORY_SETUP = [
  'Attention, Spy Bunnies. The Easter Bunny has hidden the treasure somewhere in this house.',
  'You must complete 12 secret missions as one team. No racing ahead, no grabbing a hidden code alone, and no running to the next mission before everyone arrives together.',
  'Every mission has one Finder Bunny, and that turn changes each round so everyone gets a fair chance.',
];

export const GOLDEN_RULES = [
  'No one grabs a hidden code alone.',
  'The team stays together at every mission.',
  'Only the Finder Bunny checks the hiding place for that mission, unless the clue says a helper may use one free hand.',
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

export const FINDER_RULE_DESCRIPTION =
  'Only the Finder Bunny checks the hiding place for that mission. Everyone else helps solve the clue, stays together, and waits for their next turn.';

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
      'Welcome, Spy Bunnies.\nBefore the hunt begins, check your Spy IDs and stay together.\n\nYour first mission is to find the cold keeper.\n\nRiddle:\nI keep milk cold and fruit nice too,\nOpen my door to find your code.',
    acceptedCodes: ['BEEP'],
    prepHint:
      'Start by handing over Mission 1. Hide the BEEP code slip in the fridge.',
    teamRule:
      'Everyone puts one hand in the middle and says "Spy Bunnies ready!" before the search begins.',
    leadPrompt:
      'The Finder Bunny does the main search after the team solves the clue.',
  },
  {
    id: 2,
    title: 'Frozen Fingers',
    clueText:
      'The next code is hidden where frozen things stay.\nBut first you must travel the Bunny Chain way.\n\nLine up youngest to oldest.\nHold hands the whole time.\nDo not let go.\nHop your way there together.\nHop your way back together too, still holding hands.\n\nThe Finder Bunny finds the code while the others may help with one free hand only.',
    acceptedCodes: ['HOPS'],
    prepHint:
      'Hide the HOPS code slip in the freezer under frozen chips or another safe item.',
    teamRule:
      'Move in age order, stay linked together, and let the Finder Bunny make the final grab.',
    leadPrompt:
      'The Finder Bunny makes the final grab while the team stays linked.',
  },
  {
    id: 3,
    title: 'Hop Code',
    clueText:
      'Spy code: DEB\n\nUnscramble it to find where next.\nThen the whole team must bunny-hop there together.',
    acceptedCodes: ['NIBS'],
    prepHint: 'Hide the NIBS code slip on a bed or tucked beneath a pillow.',
    teamRule:
      'Nobody sprints ahead. Solve the code together and hop there as one team.',
    leadPrompt:
      'The Finder Bunny does the main search once the team arrives together.',
  },
  {
    id: 4,
    title: 'Bedroom Team Scan',
    clueText:
      'You may not search yet.\nGo to the bedroom and find these things together:\n- one soft thing\n- one thing with a colour on it\n- one thing with letters on it\n- one thing you can wear\n\nTouch all 4, then solve this:\nI show films and cartoons too,\nIn the lounge waits your next code.',
    acceptedCodes: ['GLOW'],
    prepHint: 'Hide the GLOW code slip by the television in the lounge.',
    teamRule:
      'The team must complete the bedroom team scan before anyone searches or moves on.',
    leadPrompt:
      'The Finder Bunny begins the main search only after the whole team completes the bedroom team scan.',
  },
  {
    id: 5,
    title: 'Secret Acrostic',
    clueText:
      'Read the first letter of each line:\n\nCounting hours every day\nLooking quietly on display\nOn the wall or shelf I stay\nClicking never, come what may\nKeeping time in my own way',
    acceptedCodes: ['JOLT'],
    prepHint: 'Hide the JOLT code slip by a clock.',
    teamRule:
      'Nobody moves until the whole team says, "Code cracked."',
    leadPrompt:
      'The Finder Bunny starts the main search only after the whole team gives the signal.',
  },
  {
    id: 6,
    title: 'Spoon Balance Operation',
    clueText:
      'Mission first. Searching second.\n\nCarry one chocolate egg, pom-pom, or paper ball on a spoon from here to the next room.\nOnly the Finder Bunny holds the spoon.\nOne teammate may steady the Finder Bunny’s arm.\nIf it drops, everyone freezes and does 2 bunny hops before trying again.\n\nRiddle:\nI hold adventures, facts and tales,\nPaper worlds and pirate sails.',
    acceptedCodes: ['MINT'],
    prepHint: 'Hide the MINT code slip inside a book or on a bookshelf.',
    teamRule:
      'Complete the spoon mission before solving or searching for the next code.',
    leadPrompt:
      'The Finder Bunny carries the spoon while one teammate steadies their arm.',
  },
  {
    id: 7,
    title: 'Book Bunny Puzzle',
    clueText:
      'Take every second letter:\n\nsShHoOeEsS\n\nSolve it, then let the youngest bunny point to where you should go next.',
    acceptedCodes: ['DASH'],
    prepHint: 'Hide the DASH code slip in the shoe area.',
    teamRule:
      'The youngest bunny must point to the next location and the team follows that point together.',
    leadPrompt:
      'The Finder Bunny handles the search once the youngest bunny has pointed the way.',
  },
  {
    id: 8,
    title: 'Silly Parade Mission',
    clueText:
      'Before the next code may be earned:\n- the Finder Bunny must wear two odd shoes or slippers\n- the whole team must march in a silly spy parade\n- the whole team agrees when the parade is funny enough\n\nThen solve:\nLook beneath the staircase steep,\nWhere hidden things and coats may sleep.',
    acceptedCodes: ['ZOOM'],
    prepHint: 'Hide the ZOOM code slip in the cupboard under the stairs.',
    teamRule:
      'The parade must happen first, and the whole team agrees when it is funny enough.',
    leadPrompt:
      'The Finder Bunny wears the odd shoes and leads the parade before the search begins.',
  },
  {
    id: 9,
    title: 'Silent Spy Test',
    clueText:
      'This is a stealth mission.\nThe team must go to the next place as quietly as possible.\nIf anyone stomps loudly, everyone must go back and try again.\n\nRiddle:\nI run but have no feet,\nA twist will make me start.',
    acceptedCodes: ['WAVE'],
    prepHint: 'Hide the WAVE code slip by the bathroom sink.',
    teamRule:
      'Move in full stealth mode. If anyone stomps, restart the quiet walk together.',
    leadPrompt:
      'The Finder Bunny does the main search once the team completes the silent approach.',
  },
  {
    id: 10,
    title: 'Guided Bunny',
    clueText:
      'Trust mission.\nOne bunny closes their eyes.\nAnother bunny guides them using words only: "step left", "stop", "forward", and so on.\n\nWhen the mission is complete, solve this:\nI warm leftovers with a hum,\nPress my buttons, round they come.',
    acceptedCodes: ['PING'],
    prepHint: 'Hide the PING code slip near the microwave.',
    teamRule:
      'Only words may guide the chosen bunny. No pulling, pushing, or dragging.',
    leadPrompt:
      'The Finder Bunny completes the guided walk before the team starts searching.',
  },
  {
    id: 11,
    title: 'Bunny Cipher',
    clueText:
      'Move each letter back by one in the alphabet:\n\nHBNFT SPPN\n\nAsk one person at a time for help. Nobody shouts all at once.',
    acceptedCodes: ['BRIM'],
    prepHint: 'Hide the BRIM code slip in the games room.',
    teamRule:
      'Take turns speaking so the code is cracked calmly.',
    leadPrompt:
      'The Finder Bunny handles the main search after the code is solved.',
  },
  {
    id: 12,
    title: 'Final Mission',
    clueText:
      'Final team test.\nBefore the last location is revealed:\n- each bunny says one helpful thing another bunny did\n- all four put their hands together\n- everyone says, "Spy Bunnies never quit!"\n\nFinal clue:\nWhere people flop and chat and sprawl,\nLook underneath the softest of all.',
    acceptedCodes: ['GOLD'],
    prepHint:
      'Hide the GOLD code slip at the sofa or cushions, with the final treasure ready there too.',
    teamRule:
      'The mission only counts after every bunny shares something kind about another teammate.',
    leadPrompt:
      'The Finder Bunny makes the final treasure check once the whole team finishes the kindness round.',
  },
];
