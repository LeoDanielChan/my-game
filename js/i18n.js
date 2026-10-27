'use strict';
// Textos en español e inglés.

const I18N = {
  lang: 'es',
  dict: {
    es: {
      tagline: 'Solo queda la guerra',
      lore: 'Siglo XXXIX. La Tierra es un cementerio de catedrales de acero bajo un cielo de ceniza. Las naciones murieron, los dioses callaron y las máquinas que construimos para salvarnos despertaron con hambre. La <b>Vanguardia de Hierro</b>, último ejército de la humanidad, defiende cada ruina contra el <b>Enjambre Sintético</b>. No hay victoria final. Solo la próxima batalla.',
      'menu.play': 'Al frente',
      'menu.howto': 'Cómo jugar',
      'menu.lang': 'Idioma',
      'menu.diff': 'Dificultad',
      'menu.soundOn': '♪ Sonido: Sí',
      'menu.soundOff': '♪ Sonido: No',
      'menu.back': '← Volver',
      'diff.easy': 'Recluta',
      'diff.normal': 'Veterano',
      'diff.hard': 'Inquisidor',
      'diff.easy.desc': 'El enemigo despliega con 80% del presupuesto y −10 de puntería.',
      'diff.normal.desc': 'Ambos bandos con el mismo presupuesto. Guerra justa.',
      'diff.hard.desc': 'El enemigo despliega con 125% del presupuesto y +10 de puntería.',

      'missions.title': 'Selecciona el frente',
      'mission.budget': 'Tu presupuesto',
      'mission.enemyBudget': 'Presupuesto enemigo',
      'mission.turns': 'Límite: {n} rondas',
      'mission.noLimit': 'Sin límite de rondas',
      'mission.elim.name': 'Catedral de Ceniza',
      'mission.elim.obj': 'Eliminación',
      'mission.elim.desc': 'Las naves de la catedral arden. Purga hasta la última máquina.',
      'mission.capture.name': 'Trincheras de Óxido',
      'mission.capture.obj': 'Control de zonas',
      'mission.capture.desc': 'Controla 2 de las 3 zonas durante 3 rondas seguidas. El enemigo intentará lo mismo.',
      'mission.hack.name': 'Relicario Silente',
      'mission.hack.obj': 'Hackeo',
      'mission.hack.desc': 'Una terminal antigua guarda los códigos del Enjambre. Hackéala 2 veces antes de que acabe el tiempo.',
      'mission.extract.name': 'Éxodo del Códice',
      'mission.extract.obj': 'Escolta',
      'mission.extract.desc': 'Escolta al Portador del Códice hasta la zona de extracción. Si cae, todo se pierde.',

      'squad.title': 'Arma tu escuadrón',
      'squad.budget': 'Presupuesto: {n} / {m}',
      'squad.units': 'Unidades: {n} / {m}',
      'squad.empty': 'Haz clic en una unidad para añadirla.',
      'squad.free': 'gratis',
      'squad.remove': 'Quitar',
      'squad.synergy': 'Sinergias del escuadrón',
      'synergy.rs': 'Distancia expone → Corto alcance +50% crítico',
      'synergy.sm': 'Corto alcance suprime → Cuerpo a cuerpo +50% daño',
      'synergy.mr': 'Cuerpo a cuerpo aturde → Distancia impacto 100%',
      'squad.random': 'Aleatorio',
      'squad.clear': 'Vaciar',
      'squad.deploy': 'Desplegar ▶',
      'squad.back': '← Frentes',
      vs: 'Rival:',

      'unit.drone': 'Dron Vigía', 'unit.rifleman': 'Fusilero', 'unit.assault': 'Asaltante', 'unit.ronin': 'Ronin',
      'unit.medic': 'Médico', 'unit.engineer': 'Ingeniero', 'unit.sniper': 'Francotirador', 'unit.exo': 'Exo-traje',
      'unit.mech': 'Mech Penitente', 'unit.apc': 'Blindado', 'unit.turret': 'Torreta', 'unit.vip': 'Portador del Códice',
      'unitE.drone': 'Ojo-Larva', 'unitE.rifleman': 'Autómata', 'unitE.assault': 'Desgarrador', 'unitE.ronin': 'Segador',
      'unitE.medic': 'Reparador', 'unitE.engineer': 'Tejedor', 'unitE.sniper': 'Ojo Muerto', 'unitE.exo': 'Coloso',
      'unitE.mech': 'Titán', 'unitE.apc': 'Portador', 'unitE.turret': 'Aguijón', 'unitE.vip': 'Núcleo',

      'role.drone': 'Explorador barato. Ve lejos, vuela sobre barricadas y marca objetivos para el equipo.',
      'role.rifleman': 'Columna vertebral del escuadrón. Preciso a media distancia; sus granadas destruyen cobertura.',
      'role.assault': 'Flanqueador rápido. Devastador de cerca, sobre todo contra objetivos expuestos.',
      'role.ronin': 'Espada de plasma. Ignora la cobertura y aturde, pero debe acercarse bajo fuego.',
      'role.medic': 'Mantiene vivo al escuadrón con nanoescudos. Su subfusil suprime enemigos.',
      'role.engineer': 'Antiblindaje. Su EMP destroza vehículos y despliega torretas de vigilancia.',
      'role.sniper': 'Disparo letal a gran distancia. Puede disparar a lo que vea cualquier aliado. Frágil.',
      'role.exo': 'Infantería pesada. Suprime, aguanta y lanza cohetes que derriban muros.',
      'role.mech': 'Caminante de asalto. Aplasta barricadas al moverse y su pisotón aturde a todos alrededor.',
      'role.apc': 'Fortaleza móvil. Sirve de cobertura a los aliados y cubre el avance con humo.',
      'role.turret': 'Torreta automática. Entra en vigilancia al final de cada turno.',
      'role.vip': 'Debe llegar a la extracción.',

      'cls.drone': 'Dron', 'cls.infantry': 'Infantería', 'cls.heavy': 'Pesada', 'cls.vehicle': 'Vehículo', 'cls.vip': 'Objetivo',
      'armor.light': 'Ligera', 'armor.heavy': 'Pesada', 'armor.mech': 'Mecánica',
      'stat.hp': 'VIDA', 'stat.mob': 'MOV', 'stat.aim': 'PUN', 'stat.def': 'DEF', 'stat.sight': 'VIS', 'stat.dmg': 'Daño', 'stat.range': 'Alc.',
      'weapon.zapper': 'Descargador', 'weapon.rifle': 'Rifle de pulsos', 'weapon.shotgun': 'Escopeta de asalto', 'weapon.blade': 'Espada de plasma',
      'weapon.smg': 'Subfusil láser', 'weapon.arc': 'Pistola de arco', 'weapon.railgun': 'Cañón de riel', 'weapon.minigun': 'Cañón rotativo',
      'weapon.fist': 'Puño hidráulico', 'weapon.autocannon': 'Autocañón', 'weapon.turretgun': 'Ametralladora',
      'kind.ranged': 'Distancia', 'kind.short': 'Corto alcance', 'kind.melee': 'Cuerpo a cuerpo',
      'dmg.kinetic': 'Cinético', 'dmg.energy': 'Energía', 'dmg.emp': 'EMP', 'dmg.explosive': 'Explosivo',

      'ability.mark': 'Marcar', 'ability.mark.desc': 'Aplica Expuesto a un enemigo visible sin terminar el turno.',
      'ability.grenade': 'Granada', 'ability.grenade.desc': 'Explosivo 2-3 en área. Destruye barricadas.',
      'ability.adrenaline': 'Adrenalina', 'ability.adrenaline.desc': 'Gana +1 PA este turno.',
      'ability.charge': 'Carga', 'ability.charge.desc': 'Corre hasta MOV+2 sin provocar vigilancia y ataca cuerpo a cuerpo.',
      'ability.heal': 'Nanoescudo', 'ability.heal.desc': 'Cura 4 y otorga 2 de escudo a un aliado orgánico adyacente (o a sí mismo).',
      'ability.emp': 'Granada EMP', 'ability.emp.desc': 'EMP 2-3 en área. Aturde unidades mecánicas.',
      'ability.turret': 'Torreta', 'ability.turret.desc': 'Despliega una torreta automática en una casilla adyacente.',
      'ability.headshot': 'Tiro a la cabeza', 'ability.headshot.desc': 'Disparo con +15 puntería y +50% crítico.',
      'ability.suppress': 'Supresión', 'ability.suppress.desc': 'Suprime al objetivo sin tirada: −30 puntería y no puede vigilar.',
      'ability.rocket': 'Cohete', 'ability.rocket.desc': 'Explosivo 4-5 en área. Derriba muros y barricadas.',
      'ability.stomp': 'Pisotón', 'ability.stomp.desc': 'Explosivo 3-4 alrededor, aturde y destruye cobertura adyacente.',
      'ability.smoke': 'Humo', 'ability.smoke.desc': 'Nube de humo: −20 a impactar a las unidades dentro durante 2 rondas.',

      'hud.cooldown': 'Enfriamiento {n}',
      'hud.move': 'Mover', 'hud.attack': 'Atacar', 'hud.overwatch': 'Vigilancia', 'hud.hack': 'Hackear',
      'hud.round': 'Ronda {n}', 'hud.yourTurn': 'TU TURNO', 'hud.enemyTurn': 'TURNO ENEMIGO',
      'hud.noSelection': 'Selecciona una unidad.', 'hud.ap': 'PA', 'hud.target': 'Objetivo',
      'hud.hit': 'Impacto', 'hud.crit': 'Crítico', 'hud.damage': 'Daño', 'hud.armorMult': 'Armadura',
      'hud.noTargets': 'Sin objetivos', 'hud.destroysCover': 'Destruye cobertura.',
      'hud.endTurn': 'Fin de turno ⏎', 'hud.menu': 'Retirada', 'hud.help': '?',
      'tip.move': 'Azul: 1 PA. Amarillo: carrera (2 PA). Los escudos muestran la cobertura.',
      'tip.attack': 'Disparar con el arma principal. Termina el turno de la unidad.',
      'tip.overwatch': 'Dispara al primer enemigo que se mueva a la vista (−15 puntería).',
      'tip.hack': 'Junto a la terminal: avanza el hackeo. Termina el turno.',
      'objtext.elim': 'Elimina a todas las fuerzas enemigas',
      'objtext.capture': 'Controla 2 de 3 zonas',
      'objtext.hold': 'Tú {p}/{n} · Enemigo {e}/{n}',
      'objtext.hack': 'Hackea la terminal ({p}/{n})',
      'objtext.extract': 'Lleva al Portador del Códice a la extracción (verde)',

      'status.exposed': 'Expuesto', 'status.suppressed': 'Suprimido', 'status.stunned': 'Aturdido',
      'status.exposed.desc': '+10 a impactarle. Los ataques de corto alcance obtienen +50% crítico.',
      'status.suppressed.desc': '−30 de puntería, no puede vigilar. Cuerpo a cuerpo le hace +50% daño.',
      'status.stunned.desc': 'Pierde 1 PA en su turno. Los ataques a distancia impactan siempre.',
      'icon.exposed': 'E', 'icon.suppressed': 'S', 'icon.stunned': 'A',
      'mod.aim': 'Puntería', 'mod.range': 'Distancia', 'mod.halfcover': 'Media cobertura', 'mod.fullcover': 'Cobertura completa',
      'mod.defense': 'Defensa', 'mod.smoke': 'Humo', 'mod.exposed': 'Expuesto', 'mod.suppressed': 'Suprimido',
      'mod.reaction': 'Disparo de reacción', 'mod.ability': 'Habilidad', 'mod.difficulty': 'Dificultad', 'mod.flank': 'Flanqueo',
      'mod.comboExposed': 'Combo: Expuesto → +50% crítico', 'mod.comboStunned': 'Combo: Aturdido → impacto garantizado',
      'mod.comboSuppressed': 'Combo: Suprimido → +50% daño',
      'float.miss': 'FALLO', 'float.combo': '¡COMBO!', 'float.crit': 'CRÍTICO', 'float.overwatch': 'VIGILANCIA', 'float.hack': 'HACKEO', 'float.ap': '+1 PA',

      'log.miss': '{a} falla contra {t}.',
      'log.hit': '{a} impacta a {t}: {d} de daño.',
      'log.crit': '¡CRÍTICO! {a} destroza a {t}: {d} de daño.',
      'log.kill': '✝ {t} ha caído.',
      'log.coverDestroyed': 'Cobertura destruida.',
      'log.spotted': '¡Contacto enemigo!',
      'log.reaction': '¡Fuego de reacción de {a}!',
      'log.overwatch': '{a} entra en vigilancia.',
      'log.hack': 'Hackeo {n}/{m}.',
      'log.ability': '{a} usa {ab}.',

      'result.victory': 'VICTORIA', 'result.defeat': 'DERROTA',
      'result.rounds': 'Rondas', 'result.kills': 'Bajas enemigas', 'result.losses': 'Caídos', 'result.accuracy': 'Precisión',
      'result.retry': 'Repetir', 'result.squad': 'Cambiar escuadrón', 'result.menu': 'Menú',
      'reason.elim': 'El Enjambre ha sido purgado de este sector.',
      'reason.capture': 'Las zonas están bajo control de la Vanguardia.',
      'reason.hack': 'Los códigos del Enjambre son nuestros.',
      'reason.extract': 'El Códice ha sido extraído.',
      'reason.captureLost': 'El Enjambre controla el campo de batalla.',
      'reason.time': 'Se acabó el tiempo. Los refuerzos enemigos arrasan la posición.',
      'reason.vip': 'El Portador del Códice ha caído.',
      'reason.wiped': 'Tu escuadrón ha sido aniquilado.',
      'quote.win': '«Hoy vivimos. Mañana, otra ruina, otra guerra.»',
      'quote.lose': '«Sus nombres serán grabados en el muro. Hay mucho espacio todavía.»',
      'confirm.leave': '¿Abandonar la batalla?',

      'help.html': `<h2>Cómo jugar</h2>
<h3>Turnos</h3>
<p>Cada unidad tiene <b>2 PA</b> por turno. Moverse en la zona azul cuesta 1 PA; en la amarilla (carrera), 2 PA. <b>Atacar termina el turno de la unidad.</b> La <b>vigilancia</b> dispara al primer enemigo que se mueva a la vista.</p>
<h3>Cobertura</h3>
<p>Las barricadas dan <b>media cobertura (−20)</b> y los muros <b>completa (−40)</b> contra ataques desde ese lado. Los vehículos sirven de cobertura móvil. Si atacas por un lado sin cobertura, <b>flanqueas</b>: +40% crítico. Los explosivos destruyen barricadas; cohetes y pisotones derriban muros.</p>
<h3>Triángulo de sinergias</h3>
<ul>
<li><b style="color:#5ad1ff">Distancia</b> aplica <b>Expuesto</b> → <b style="color:#ff8a3d">Corto alcance</b> obtiene +50% crítico.</li>
<li><b style="color:#ff8a3d">Corto alcance</b> aplica <b>Suprimido</b> → <b style="color:#e05a8a">Cuerpo a cuerpo</b> hace +50% daño.</li>
<li><b style="color:#e05a8a">Cuerpo a cuerpo</b> aplica <b>Aturdido</b> → <b style="color:#5ad1ff">Distancia</b> impacta siempre.</li>
</ul>
<p>Los estados duran hasta el final del siguiente turno del afectado. Ordena tus ataques para encadenar combos.</p>
<h3>Armadura vs. daño</h3>
{armorTable}
<h3>Despliegue</h3>
<p>Cada frente tiene un presupuesto y un máximo de 6 unidades. ¿Enjambre de infantería barata, élite de veteranos o un vehículo con escolta? El enemigo usa las mismas reglas.</p>
<h3>Niebla de guerra</h3>
<p>Solo ves lo que tus unidades ven. El francotirador puede disparar a lo que vea cualquier aliado.</p>
<h3>Controles</h3>
<p>Clic: seleccionar / mover / atacar · <kbd>1-5</kbd> acciones · <kbd>Tab</kbd> siguiente unidad · <kbd>Esc</kbd> cancelar · <kbd>Enter</kbd> fin de turno.</p>`,
    },

    en: {
      tagline: 'Only war remains',
      lore: 'The 39th century. Earth is a graveyard of steel cathedrals beneath a sky of ash. Nations died, gods fell silent, and the machines we built to save us awoke hungry. The <b>Iron Vanguard</b>, humanity\'s last army, holds every ruin against the <b>Synthetic Swarm</b>. There is no final victory. Only the next battle.',
      'menu.play': 'To the front',
      'menu.howto': 'How to play',
      'menu.lang': 'Language',
      'menu.diff': 'Difficulty',
      'menu.soundOn': '♪ Sound: On',
      'menu.soundOff': '♪ Sound: Off',
      'menu.back': '← Back',
      'diff.easy': 'Recruit',
      'diff.normal': 'Veteran',
      'diff.hard': 'Inquisitor',
      'diff.easy.desc': 'The enemy deploys with 80% budget and −10 aim.',
      'diff.normal.desc': 'Both sides share the same budget. A fair war.',
      'diff.hard.desc': 'The enemy deploys with 125% budget and +10 aim.',

      'missions.title': 'Choose the front',
      'mission.budget': 'Your budget',
      'mission.enemyBudget': 'Enemy budget',
      'mission.turns': 'Limit: {n} rounds',
      'mission.noLimit': 'No round limit',
      'mission.elim.name': 'Cathedral of Ash',
      'mission.elim.obj': 'Elimination',
      'mission.elim.desc': 'The cathedral naves are burning. Purge every last machine.',
      'mission.capture.name': 'Rust Trenches',
      'mission.capture.obj': 'Zone control',
      'mission.capture.desc': 'Hold 2 of the 3 zones for 3 rounds in a row. The enemy will try the same.',
      'mission.hack.name': 'Silent Reliquary',
      'mission.hack.obj': 'Hack',
      'mission.hack.desc': 'An ancient terminal holds the Swarm\'s codes. Hack it twice before time runs out.',
      'mission.extract.name': 'Exodus of the Codex',
      'mission.extract.obj': 'Escort',
      'mission.extract.desc': 'Escort the Codex Bearer to the extraction zone. If they fall, all is lost.',

      'squad.title': 'Build your squad',
      'squad.budget': 'Budget: {n} / {m}',
      'squad.units': 'Units: {n} / {m}',
      'squad.empty': 'Click a unit to add it.',
      'squad.free': 'free',
      'squad.remove': 'Remove',
      'squad.synergy': 'Squad synergies',
      'synergy.rs': 'Ranged exposes → Short range +50% crit',
      'synergy.sm': 'Short range suppresses → Melee +50% damage',
      'synergy.mr': 'Melee stuns → Ranged 100% hit',
      'squad.random': 'Random',
      'squad.clear': 'Clear',
      'squad.deploy': 'Deploy ▶',
      'squad.back': '← Fronts',
      vs: 'Rival:',

      'unit.drone': 'Watcher Drone', 'unit.rifleman': 'Rifleman', 'unit.assault': 'Assaulter', 'unit.ronin': 'Ronin',
      'unit.medic': 'Medic', 'unit.engineer': 'Engineer', 'unit.sniper': 'Sniper', 'unit.exo': 'Exosuit',
      'unit.mech': 'Penitent Mech', 'unit.apc': 'APC', 'unit.turret': 'Turret', 'unit.vip': 'Codex Bearer',
      'unitE.drone': 'Larva Eye', 'unitE.rifleman': 'Automaton', 'unitE.assault': 'Ripper', 'unitE.ronin': 'Reaper',
      'unitE.medic': 'Mender', 'unitE.engineer': 'Weaver', 'unitE.sniper': 'Deadeye', 'unitE.exo': 'Colossus',
      'unitE.mech': 'Titan', 'unitE.apc': 'Carrier', 'unitE.turret': 'Stinger', 'unitE.vip': 'Core',

      'role.drone': 'Cheap scout. Sees far, flies over barricades and marks targets for the team.',
      'role.rifleman': 'The squad\'s backbone. Accurate at mid range; grenades destroy cover.',
      'role.assault': 'Fast flanker. Devastating up close, especially against exposed targets.',
      'role.ronin': 'Plasma blade. Ignores cover and stuns, but must close in under fire.',
      'role.medic': 'Keeps the squad alive with nano-shields. The SMG suppresses enemies.',
      'role.engineer': 'Anti-armor. EMP wrecks vehicles; deploys overwatch turrets.',
      'role.sniper': 'Lethal at long range. Can shoot anything an ally sees. Fragile.',
      'role.exo': 'Heavy infantry. Suppresses, endures and fires wall-breaking rockets.',
      'role.mech': 'Assault walker. Crushes barricades while moving; its stomp stuns everything around.',
      'role.apc': 'Mobile fortress. Acts as cover for allies and screens the advance with smoke.',
      'role.turret': 'Automated turret. Goes on overwatch at the end of each turn.',
      'role.vip': 'Must reach extraction.',

      'cls.drone': 'Drone', 'cls.infantry': 'Infantry', 'cls.heavy': 'Heavy', 'cls.vehicle': 'Vehicle', 'cls.vip': 'Objective',
      'armor.light': 'Light', 'armor.heavy': 'Heavy', 'armor.mech': 'Mechanical',
      'stat.hp': 'HP', 'stat.mob': 'MOV', 'stat.aim': 'AIM', 'stat.def': 'DEF', 'stat.sight': 'SGT', 'stat.dmg': 'Dmg', 'stat.range': 'Rng',
      'weapon.zapper': 'Zapper', 'weapon.rifle': 'Pulse rifle', 'weapon.shotgun': 'Assault shotgun', 'weapon.blade': 'Plasma blade',
      'weapon.smg': 'Laser SMG', 'weapon.arc': 'Arc pistol', 'weapon.railgun': 'Railgun', 'weapon.minigun': 'Rotary cannon',
      'weapon.fist': 'Hydraulic fist', 'weapon.autocannon': 'Autocannon', 'weapon.turretgun': 'Machine gun',
      'kind.ranged': 'Ranged', 'kind.short': 'Short range', 'kind.melee': 'Melee',
      'dmg.kinetic': 'Kinetic', 'dmg.energy': 'Energy', 'dmg.emp': 'EMP', 'dmg.explosive': 'Explosive',

      'ability.mark': 'Mark', 'ability.mark.desc': 'Applies Exposed to a visible enemy without ending the turn.',
      'ability.grenade': 'Grenade', 'ability.grenade.desc': 'Explosive 2-3 area damage. Destroys barricades.',
      'ability.adrenaline': 'Adrenaline', 'ability.adrenaline.desc': 'Gain +1 AP this turn.',
      'ability.charge': 'Charge', 'ability.charge.desc': 'Dash up to MOV+2 without triggering overwatch and strike in melee.',
      'ability.heal': 'Nano-shield', 'ability.heal.desc': 'Heals 4 and grants 2 shield to an adjacent organic ally (or self).',
      'ability.emp': 'EMP grenade', 'ability.emp.desc': 'EMP 2-3 area damage. Stuns mechanical units.',
      'ability.turret': 'Turret', 'ability.turret.desc': 'Deploy an automated turret on an adjacent tile.',
      'ability.headshot': 'Headshot', 'ability.headshot.desc': 'Shot with +15 aim and +50% crit.',
      'ability.suppress': 'Suppression', 'ability.suppress.desc': 'Suppresses the target, no roll: −30 aim and no overwatch.',
      'ability.rocket': 'Rocket', 'ability.rocket.desc': 'Explosive 4-5 area damage. Brings down walls and barricades.',
      'ability.stomp': 'Stomp', 'ability.stomp.desc': 'Explosive 3-4 around, stuns and destroys adjacent cover.',
      'ability.smoke': 'Smoke', 'ability.smoke.desc': 'Smoke cloud: −20 to hit units inside for 2 rounds.',

      'hud.cooldown': 'Cooldown {n}',
      'hud.move': 'Move', 'hud.attack': 'Attack', 'hud.overwatch': 'Overwatch', 'hud.hack': 'Hack',
      'hud.round': 'Round {n}', 'hud.yourTurn': 'YOUR TURN', 'hud.enemyTurn': 'ENEMY TURN',
      'hud.noSelection': 'Select a unit.', 'hud.ap': 'AP', 'hud.target': 'Target',
      'hud.hit': 'Hit', 'hud.crit': 'Crit', 'hud.damage': 'Damage', 'hud.armorMult': 'Armor',
      'hud.noTargets': 'No targets', 'hud.destroysCover': 'Destroys cover.',
      'hud.endTurn': 'End turn ⏎', 'hud.menu': 'Retreat', 'hud.help': '?',
      'tip.move': 'Blue: 1 AP. Yellow: dash (2 AP). Shields show cover.',
      'tip.attack': 'Fire the primary weapon. Ends the unit\'s turn.',
      'tip.overwatch': 'Shoot the first enemy that moves in sight (−15 aim).',
      'tip.hack': 'Next to the terminal: advance the hack. Ends the turn.',
      'objtext.elim': 'Eliminate all enemy forces',
      'objtext.capture': 'Hold 2 of 3 zones',
      'objtext.hold': 'You {p}/{n} · Enemy {e}/{n}',
      'objtext.hack': 'Hack the terminal ({p}/{n})',
      'objtext.extract': 'Bring the Codex Bearer to extraction (green)',

      'status.exposed': 'Exposed', 'status.suppressed': 'Suppressed', 'status.stunned': 'Stunned',
      'status.exposed.desc': '+10 to hit. Short range attacks gain +50% crit.',
      'status.suppressed.desc': '−30 aim, cannot overwatch. Melee deals +50% damage to it.',
      'status.stunned.desc': 'Loses 1 AP on its turn. Ranged attacks always hit.',
      'icon.exposed': 'E', 'icon.suppressed': 'S', 'icon.stunned': 'St',
      'mod.aim': 'Aim', 'mod.range': 'Range', 'mod.halfcover': 'Half cover', 'mod.fullcover': 'Full cover',
      'mod.defense': 'Defense', 'mod.smoke': 'Smoke', 'mod.exposed': 'Exposed', 'mod.suppressed': 'Suppressed',
      'mod.reaction': 'Reaction shot', 'mod.ability': 'Ability', 'mod.difficulty': 'Difficulty', 'mod.flank': 'Flank',
      'mod.comboExposed': 'Combo: Exposed → +50% crit', 'mod.comboStunned': 'Combo: Stunned → guaranteed hit',
      'mod.comboSuppressed': 'Combo: Suppressed → +50% damage',
      'float.miss': 'MISS', 'float.combo': 'COMBO!', 'float.crit': 'CRIT', 'float.overwatch': 'OVERWATCH', 'float.hack': 'HACK', 'float.ap': '+1 AP',

      'log.miss': '{a} misses {t}.',
      'log.hit': '{a} hits {t}: {d} damage.',
      'log.crit': 'CRITICAL! {a} shreds {t}: {d} damage.',
      'log.kill': '✝ {t} has fallen.',
      'log.coverDestroyed': 'Cover destroyed.',
      'log.spotted': 'Enemy contact!',
      'log.reaction': 'Reaction fire from {a}!',
      'log.overwatch': '{a} goes on overwatch.',
      'log.hack': 'Hack {n}/{m}.',
      'log.ability': '{a} uses {ab}.',

      'result.victory': 'VICTORY', 'result.defeat': 'DEFEAT',
      'result.rounds': 'Rounds', 'result.kills': 'Enemy kills', 'result.losses': 'Fallen', 'result.accuracy': 'Accuracy',
      'result.retry': 'Retry', 'result.squad': 'Change squad', 'result.menu': 'Menu',
      'reason.elim': 'The Swarm has been purged from this sector.',
      'reason.capture': 'The zones are under Vanguard control.',
      'reason.hack': 'The Swarm\'s codes are ours.',
      'reason.extract': 'The Codex has been extracted.',
      'reason.captureLost': 'The Swarm controls the battlefield.',
      'reason.time': 'Time is up. Enemy reinforcements overrun the position.',
      'reason.vip': 'The Codex Bearer has fallen.',
      'reason.wiped': 'Your squad has been annihilated.',
      'quote.win': '"Today we live. Tomorrow, another ruin, another war."',
      'quote.lose': '"Their names will be carved on the wall. There is still plenty of room."',
      'confirm.leave': 'Abandon the battle?',

      'help.html': `<h2>How to play</h2>
<h3>Turns</h3>
<p>Each unit has <b>2 AP</b> per turn. Moving within the blue area costs 1 AP; the yellow area (dash) costs 2 AP. <b>Attacking ends the unit's turn.</b> <b>Overwatch</b> shoots the first enemy that moves in sight.</p>
<h3>Cover</h3>
<p>Barricades give <b>half cover (−20)</b> and walls <b>full cover (−40)</b> against attacks from that side. Vehicles act as mobile cover. Attack from an uncovered side to <b>flank</b>: +40% crit. Explosives destroy barricades; rockets and stomps bring down walls.</p>
<h3>Synergy triangle</h3>
<ul>
<li><b style="color:#5ad1ff">Ranged</b> applies <b>Exposed</b> → <b style="color:#ff8a3d">Short range</b> gets +50% crit.</li>
<li><b style="color:#ff8a3d">Short range</b> applies <b>Suppressed</b> → <b style="color:#e05a8a">Melee</b> deals +50% damage.</li>
<li><b style="color:#e05a8a">Melee</b> applies <b>Stunned</b> → <b style="color:#5ad1ff">Ranged</b> always hits.</li>
</ul>
<p>Statuses last until the end of the affected unit's next turn. Order your attacks to chain combos.</p>
<h3>Armor vs. damage</h3>
{armorTable}
<h3>Deployment</h3>
<p>Each front has a budget and a maximum of 6 units. A swarm of cheap infantry, a veteran elite, or a vehicle with escort? The enemy follows the same rules.</p>
<h3>Fog of war</h3>
<p>You only see what your units see. The sniper can shoot anything an ally sees.</p>
<h3>Controls</h3>
<p>Click: select / move / attack · <kbd>1-5</kbd> actions · <kbd>Tab</kbd> next unit · <kbd>Esc</kbd> cancel · <kbd>Enter</kbd> end turn.</p>`,
    },
  },

  t(key, params) {
    let s = this.dict[this.lang][key];
    if (s == null) s = this.dict.es[key];
    if (s == null) return key;
    if (params) for (const k in params) s = s.split('{' + k + '}').join(params[k]);
    return s;
  },

  apply(root = document) {
    document.documentElement.lang = this.lang;
    root.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = this.t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-tip]').forEach(el => { el.dataset.tip = this.t(el.dataset.i18nTip); });
  },
};

const t = (k, p) => I18N.t(k, p);
