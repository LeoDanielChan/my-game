'use strict';
// =====================================================================
//  DATOS DE BALANCE — todo lo que define el juego vive aquí.
//  Ambas facciones comparten estadísticas (facción espejo) para que el
//  balance dependa solo de la composición del escuadrón y la táctica.
// =====================================================================

const TS = 48;          // tamaño de casilla en px del canvas
const SPRITE = 16;      // tamaño del sprite pixel art
const MAX_UNITS = 6;

// Multiplicador de daño: tipo de daño -> tipo de armadura
const DMG_MULT = {
  kinetic:   { light: 1,    heavy: 0.75, mech: 0.5 },
  energy:    { light: 0.75, heavy: 1.25, mech: 1 },
  emp:       { light: 0.5,  heavy: 1,    mech: 1.5 },
  explosive: { light: 1,    heavy: 1,    mech: 1.25 },
};

// kind: ranged (distancia) | short (corto alcance) | melee (cuerpo a cuerpo)
const WEAPONS = {
  zapper:     { kind: 'ranged', dmgType: 'energy',    dmg: [1, 2], range: 7,  crit: 5 },
  rifle:      { kind: 'ranged', dmgType: 'kinetic',   dmg: [3, 4], range: 12, crit: 10 },
  shotgun:    { kind: 'short',  dmgType: 'kinetic',   dmg: [4, 6], range: 6,  crit: 20 },
  blade:      { kind: 'melee',  dmgType: 'energy',    dmg: [5, 7], range: 1.5, crit: 25 },
  smg:        { kind: 'short',  dmgType: 'energy',    dmg: [2, 4], range: 7,  crit: 10 },
  arc:        { kind: 'ranged', dmgType: 'emp',       dmg: [2, 3], range: 8,  crit: 5 },
  railgun:    { kind: 'ranged', dmgType: 'kinetic',   dmg: [5, 7], range: 20, crit: 25, scope: true },
  minigun:    { kind: 'short',  dmgType: 'kinetic',   dmg: [3, 5], range: 8,  crit: 10 },
  fist:       { kind: 'melee',  dmgType: 'kinetic',   dmg: [6, 8], range: 1.5, crit: 15 },
  autocannon: { kind: 'ranged', dmgType: 'explosive', dmg: [3, 4], range: 10, crit: 5 },
  turretgun:  { kind: 'ranged', dmgType: 'kinetic',   dmg: [2, 3], range: 9,  crit: 5 },
};

// cls: drone | infantry | heavy | vehicle | vip
const UNITS = {
  drone:    { cost: 1, hp: 3,  armor: 'mech',  mob: 7, aim: 60, def: 10, sight: 9, weapon: 'zapper',     abilities: ['mark'], flying: true, cls: 'drone' },
  rifleman: { cost: 2, hp: 6,  armor: 'light', mob: 5, aim: 70, def: 0,  sight: 7, weapon: 'rifle',      abilities: ['grenade'], cls: 'infantry' },
  assault:  { cost: 2, hp: 6,  armor: 'light', mob: 6, aim: 65, def: 5,  sight: 7, weapon: 'shotgun',    abilities: ['adrenaline'], cls: 'infantry' },
  ronin:    { cost: 3, hp: 7,  armor: 'light', mob: 6, aim: 85, def: 10, sight: 7, weapon: 'blade',      abilities: ['charge'], cls: 'infantry' },
  medic:    { cost: 3, hp: 6,  armor: 'light', mob: 5, aim: 65, def: 0,  sight: 7, weapon: 'smg',        abilities: ['heal'], cls: 'infantry' },
  engineer: { cost: 3, hp: 6,  armor: 'light', mob: 5, aim: 65, def: 0,  sight: 7, weapon: 'arc',        abilities: ['emp', 'turret'], cls: 'infantry' },
  sniper:   { cost: 4, hp: 5,  armor: 'light', mob: 4, aim: 80, def: 0,  sight: 8, weapon: 'railgun',    abilities: ['headshot'], squadsight: true, cls: 'infantry' },
  exo:      { cost: 5, hp: 10, armor: 'heavy', mob: 4, aim: 65, def: 0,  sight: 7, weapon: 'minigun',    abilities: ['suppress', 'rocket'], cls: 'heavy' },
  mech:     { cost: 7, hp: 16, armor: 'mech',  mob: 5, aim: 75, def: 0,  sight: 7, weapon: 'fist',       abilities: ['stomp'], vehicle: true, cls: 'vehicle' },
  apc:      { cost: 8, hp: 20, armor: 'mech',  mob: 6, aim: 65, def: 0,  sight: 8, weapon: 'autocannon', abilities: ['smoke'], vehicle: true, cls: 'vehicle' },
  turret:   { cost: 0, hp: 4,  armor: 'mech',  mob: 0, aim: 65, def: 0,  sight: 8, weapon: 'turretgun',  abilities: [], summon: true, autoWatch: true, vehicle: true, cls: 'drone' },
  vip:      { cost: 0, hp: 6,  armor: 'light', mob: 4, aim: 0,  def: 10, sight: 6, weapon: null,         abilities: [], cls: 'vip' },
};

const DEPLOYABLE = ['drone', 'rifleman', 'assault', 'ronin', 'medic', 'engineer', 'sniper', 'exo', 'mech', 'apc'];

// target: enemy | ally | self | tile | self_aoe | charge | attack | tile_empty
// ends: termina el turno de la unidad al usarla
const ABILITIES = {
  mark:       { target: 'enemy', range: 12, cd: 2, ap: 1, ends: false, applies: 'exposed' },
  grenade:    { target: 'tile', range: 5, radius: 1.5, dmg: [2, 3], dmgType: 'explosive', destroy: 1, cd: 3, ap: 1, ends: true },
  adrenaline: { target: 'self', cd: 4, ap: 0, ends: false },
  charge:     { target: 'charge', extraMove: 2, cd: 3, ap: 1, ends: true },
  heal:       { target: 'ally', range: 1.5, heal: 4, shield: 2, cd: 2, ap: 1, ends: false },
  emp:        { target: 'tile', range: 6, radius: 1.5, dmg: [2, 3], dmgType: 'emp', stunMech: true, cd: 3, ap: 1, ends: true },
  turret:     { target: 'tile_empty', range: 1.5, cd: 5, ap: 1, ends: true },
  headshot:   { target: 'attack', aim: 15, crit: 50, cd: 3, ap: 1, ends: true },
  suppress:   { target: 'enemy', range: 8, cd: 2, ap: 1, ends: true, applies: 'suppressed' },
  rocket:     { target: 'tile', range: 9, radius: 1.5, dmg: [4, 5], dmgType: 'explosive', destroy: 2, cd: 4, ap: 1, ends: true },
  stomp:      { target: 'self_aoe', radius: 1.5, dmg: [3, 4], dmgType: 'explosive', destroy: 2, stun: true, cd: 3, ap: 1, ends: true },
  smoke:      { target: 'tile', range: 6, radius: 1.5, smoke: 2, cd: 4, ap: 1, ends: false },
};

// Sinergia: qué estado aplica cada tipo de ataque al impactar
const KIND_STATUS = { ranged: 'exposed', short: 'suppressed', melee: 'stunned' };

const DIFFICULTY = {
  easy:   { budget: 0.8,  aim: -10 },
  normal: { budget: 1.0,  aim: 0 },
  hard:   { budget: 1.25, aim: 10 },
};

// ---------------------------------------------------------------------
// MAPAS (20x14)
//  .  suelo          ,  escombros (suelo)
//  #  muro (cobertura completa, destructible con armas pesadas)
//  W  muro de catedral (cobertura completa, indestructible)
//  =  barricada (media cobertura, destructible)
//  T  terminal (media cobertura, objetivo)
//  P  despliegue jugador   E  despliegue enemigo
//  A B C  zonas de captura  X  extracción
// ---------------------------------------------------------------------
const MISSIONS = [
  {
    id: 'elim', objective: 'elim', budget: 20, turnLimit: 0,
    map: [
      'PP..=....##....=..EE',
      'PP..=....#.....=..EE',
      'PP.........=.......E',
      '....##..=......##...',
      '.=..#...=..WW..#..=.',
      '.=.....,...WW.......',
      '...==......,...==...',
      '...........,........',
      '.=..#..WW.....#..=..',
      '.=..#..WW..=..#..=..',
      '........=..=........',
      'PP..##.......##...EE',
      'PP.......=.......=EE',
      'PP..=...........=.EE',
    ],
  },
  {
    id: 'capture', objective: 'capture', budget: 18, turnLimit: 20, holdTurns: 3,
    map: [
      'PP...=...##...=...EE',
      'PP...=..AAAA..=...EE',
      'PP..#...AAAA...#..EE',
      '....#..=AAAA=..#....',
      '..=......,,......=..',
      '..=..##..=..=.##..=.',
      '........BBBB........',
      '.....=..BBBB..=.....',
      '........BBBB........',
      '..=..##..=..=.##..=.',
      '....#..=CCCC=..#....',
      'PP..#...CCCC...#..EE',
      'PP...=..CCCC..=...EE',
      'PP...=...##...=...EE',
    ],
  },
  {
    id: 'hack', objective: 'hack', budget: 16, turnLimit: 14, hackNeeded: 2,
    map: [
      'PP....=......##.....',
      'PP....=...........EE',
      'PP..##....=...#...EE',
      '........=.....#..=..',
      '..=..WW......=......',
      '..=..WW...##....=..E',
      '..........#...=T=..E',
      '........=......=...E',
      '..=..WW.....##......',
      '..=..WW..=..........',
      '.........=....#..=..',
      'PP..##........#...EE',
      'PP....=...........EE',
      'PP....=......##.....',
    ],
  },
  {
    id: 'extract', objective: 'extract', budget: 22, turnLimit: 12,
    map: [
      'PP...=....#....=.XXX',
      'PP...=....#....=.XXX',
      'PP..........E.....XX',
      '....##..=..EE..#....',
      '.=.......=.....#..=.',
      '.=..WW.......=......',
      '........##.......=..',
      '...=....##..E.......',
      '.=.....=.....EE..=..',
      '.=..WW.....=........',
      '....##..=......##...',
      'PP............=.....',
      'PP...=....#.......=.',
      'PP...=....#.........',
    ],
  },
];
