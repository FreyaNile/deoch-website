/**
 * @module UpkeepData
 * @description Central registry for game content, including the development timeline and bestiary.
 */
export const UpkeepData = {
    CHANGELOG: [
        {
            date: 'April 18, 2026',
            title: 'Website Migration & UI Refinement',
            bullets: [
                'Restored preferred timeline-style development updates',
                'Enhanced character sheet with responsive 3-column stat grid',
                'Enforced base-9 stat system with point-buy validation',
                'Resolved footer visual artifacts with seamless background assets',
                'Implemented global card-click interaction for the timeline',
                'Added navigation links for "Classes" and "Updates" cards'
            ]
        },
        {
            date: 'February 12, 2026',
            title: 'Deoch v.32 → v.32.1',
            bullets: [
                'Added a bonus to passive awareness on Smellwise and Pointed Ears traits',
                'Adjusted Silence spell',
                'Adjusted wizard rank ability',
                'Adjusted movement options',
                'Adjusted unarmed attack',
                'Adjusted character sheet',
                'Adjusted pavise wording',
                'Adjusted survivor and athlete feats',
                'Revamped renown',
                'Edited ToC'
            ]
        },
        {
            date: 'February 5, 2026',
            title: 'Deoch v.31.1 → v.32',
            bullets: [
                'Adjusted stat allocation progression',
                'Adjusted sage ability',
                'Adjusted magus ability',
                'Added mundane keyword',
                'Druid shift adjusted',
                'Names list added',
                'Adjusted dweller heritage trait',
                'Moved spells from master alphabetical list to class dedicated level ascending lists',
                'Experience requirements for leveling adjusted',
                'Removed lifestyle',
                'Adjusted TT scope, moved experience gain to training',
                'Added curfew rulings',
                'Added 3 factions',
                'Added stats rules excerpt',
                'Adjusted nadur spell effect',
                'Adjusted Druidwill spell effect',
                'Adjusted Hunger, Thirst and Ill conditions',
                'Adjust rest times',
                'Adjusted second chance',
                'Added Pristine spell',
                'Adjusted tusks ability',
                'Adjusted Aegisheir heritage excerpt',
                'Added Aegisheir heritage feat that was made into a general feat',
                'Patched hide mechanic, grapple and surprise mechanics',
                'Patched grapple mechanic',
                'Patched surprise mechanic',
                'Synergized carry/push&push/inventory/equipment',
                'Adjusted two-handed weapon property'
            ]
        },
        {
            date: 'January 29, 2026',
            title: 'Deoch v.31 → v.31.1',
            bullets: [
                'Added parchment into equipment',
                'Added lockpick to equipment',
                'Adjusted ruling groupings',
                'Adjusted blurb',
                'Adjusted gallivanting results',
                'Gallivanting moved from flat roll to CHA roll, and options expanded to 25',
                'Added option for swapping rank abilities/spells into guild training',
                'Research outcomes adjusted',
                'Renamed tournaments',
                'Moved unarmed ruling from Rules section and moved it into equipment',
                'Trip renamed'
            ]
        },
        {
            date: 'January 22, 2026',
            title: 'Deoch v.30 → v.31',
            bullets: [
                'Adjusted character creation section to flow better without oversight',
                'Tightened up equipment and inventory rulings',
                'Moved mastercraft to a general mechanic rather than a recipe',
                'Removed Nhazuulian Scion, added Nhazuulian sword',
                'Expanded age categories, traits & quirks excerpt for easier legibility',
                'Moved half elven max age ruling to the first page',
                'Mentioned interactions in the speed section of character creation',
                'Finalized character creation heritage lore excerpts',
                'Edited trinkets',
                'Overhauled character creation heritage excerpts',
                'Swapped heritage traits and feats to support thematic cohesiveness',
                'Decoupled recipes from starting gear',
                'Overhauled feats',
                'Adjusted monk abilities, moved wind step to level 6',
                'Added "Channeling" "Phylactery" and "Soulsnare" spells',
                'Decoupled festivals and gallivanting',
                'Added town types',
                'Removed default lifestyle'
            ]
        },
        {
            date: 'January 15, 2026',
            title: 'Deoch v.29.1 → v.30',
            bullets: [
                'Trip moved from the fighter rank abilities to attack augments',
                'Added smite augments to paladin rank abilities',
                'Adjusted class table format',
                'Created "Tempo" Fighter rank ability',
                'Created "Punishing Smite" "Daunting Smite" "Guiding Smite" Paladin rank abilities',
                'Created "Battlemage" "Preservation" "Disrupt" Sorcerer rank ability',
                'Created "Deny" "Wildsoul" "Ancient Psychometry" "Serenity" "Ironwood Aegis" "Gnarled Staff" Druid rank ability',
                'Renamed "Sanctuary" to "Cairn"',
                'Rebalanced class ability lists to ensure semi capstones landed on 5th level',
                'Adjust "Holy Weapon" spell description',
                'Adjusted "Telekinetic" feat',
                'Adjusted "Tutelage" times',
                'Adjusted "Villainy" results',
                'Created "Cunning" Rogue rank ability',
                'Adjusted mercy mechanic',
                'Adjusted hidden mechanic',
                'Adjusted hunger, thirst, illness',
                'Integrated "thief" rank ability into core class section',
                'Renamed "Lethal" to "Assassin Strike"',
                'Added "Shield of Faith" ability to paladin rank list',
                'Added equipment rulings to the character creation section',
                'Added options for rank swapping and spell swapping',
                'Hide moved from actions to reactions',
                'Created "Clemency" paladin rank ability',
                'Adjusted Rite of Inspiration rank ability',
                'Renamed level 9 paladin ability to Aingeal',
                'Adjusted "Genesis" paladin rank ability',
                'Adjusted date of the long day',
                'Adjusted Mystic Fist monk ability',
                'Expanded AoO triggers',
                'Adjusted Wolf Fang Fist monk ability'
            ]
        },
        {
            date: 'January 10, 2026',
            title: 'Online Closed Playtest',
            summary: 'Focus: High-level combat balancing and dungeon crawl mechanics',
            bullets: [
                'Testing the new "Sunburst" and "Lightning Bolt" disintegration effects',
                'Gathering data on the new WIS-based initiative system'
            ]
        },
        {
            date: 'January 8, 2026',
            title: 'Deoch v.29 → v.29.1',
            bullets: [
                'Created wizard ability "Controlled Channeling" & "Collector"',
                'Created sorcerer ability "Manifest"',
                '"Mute Casting" moved to feats',
                'Adjusted sorcerer\'s "Spell Resistance" & "Bypass"',
                'Removed "Foresight" sorcerer ability, reworked ability into prescience spell',
                'Added "Grant Experience" Paladin spell'
            ]
        },
        {
            date: 'January 8, 2026',
            title: 'Online Closed Playtest',
            summary: 'Focus: Mid-level social interactions and town generation testing',
            bullets: [
                'Testing the "Pursue Bounty" and "Piety" towntime activities',
                'Validation of the revised "Hidden" and "Assassin Strike" mechanics'
            ]
        },
        {
            date: 'January 5, 2026',
            title: 'Online Closed Playtest',
            summary: 'Focus: Early-game character progression and basic equipment economy',
            bullets: [
                'Stress-testing the new "Stamina" and "Mana" resource management',
                'Verifying the "Mercy" mechanic for inspiration use'
            ]
        },
        {
            date: 'January 1, 2026',
            title: 'Deoch v.28 → v.29',
            bullets: [
                'Revamped Rest & Sleep mechanics, separated full rest mechanic from towntime',
                'Wizard scrolls excerpt adjusted',
                'Fixed reach weapon property description',
                'Added dungeon generation rules',
                'Added town generation rules',
                'Adjusted class health and healing die values',
                'Coupled experience and currency, players gain experience via silver offerings',
                'Gain Rank excerpt adjusted',
                'Pain Eater adjusted and moved into main class',
                'Created "Talos Skin", "Effortless Evasion", "Battlehoned", "Adrenaline", "Iron Chin", "Warpath", "Sixth Sense", "Intimidating Presence" Barbarian abilities',
                'Created "Zero Error" Fighter ability',
                'Created "Trapwise", "Thief", "Counterfeiter", "Untouchable" Rogue abilities',
                'Created "Commoner" stat block',
                'Created "Ironwood" & "Spellwood" Druid abilities',
                'Created "Hierophant" Paladin ability',
                'Adjusted "Cleave"',
                'Coupled bleed mechanic and bloodied mechanic into a single mechanic',
                'Thirst and hunger moved from a submechanic of exhaustion to its own mechanic',
                'Adjusted Surprised condition',
                'Casting Focus effect adjusted'
            ]
        },
        {
            date: 'December 25, 2025',
            title: 'Deoch v.27 → v.28',
            bullets: [
                'Removed ambidextrous feat',
                'Light weapon attacks now apply stat mod to attack and damage as normal',
                'Removed 3 deity feats',
                'Added elven heritage feat',
                'Renamed Or\'uk Resilience to Or\'uk Brawn',
                'Mastercraft is now its own recipe, adjusted from a general ruling'
            ]
        },
        {
            date: 'December 18, 2025',
            title: 'Deoch v.26 → v.27',
            bullets: [
                'Rebalanced class spell lists',
                'Magic Missile, Mind Sliver, Acid Splash, Detect Magic, Cradh, Weaken, Cadal, and Slad are now Wizard spells',
                'Mage Armour moved to level 1 from level 2',
                'New spells added: Chaos, Vortex, Ghuul, Confusion',
                'Invisibility, See Invisibility, Prescience, Dust, Reverse Gravity and Time Stasis are now Sorcerer spells',
                'Meteor Swarm is now a Druid spell',
                'Blink\'s spell effect is now an upcast of Step',
                'Slow moved to 6th level',
                'Mage Hand, Levitate and the old Telekinesis spells have been compounded into the new Telekinesis spell',
                'Disintegrate spell removed, disintegrate effect now applies to Sunburst and Lightning Bolt',
                'Adjusted deity excerpt',
                'Added Freecast ruling in spellcasting'
            ]
        },
        {
            date: 'December 15, 2025',
            title: 'Live Twitch Session',
            summary: 'Live stream discussion focused on core mechanics',
            bullets: [
                'Behind-the-scenes look at world map development',
                'Interactive Q&A with the Twitch community'
            ]
        },
        {
            date: 'December 11, 2025',
            title: 'Deoch v.24 → v.26',
            bullets: [
                'Updated damage values on weapons',
                'Adjusted towntime to daily and weekly (player choice) instead of just weekly',
                'Removed "Survival" Towntime activity',
                'Added "Pursue Bounty" Towntime activity',
                'Added "Piety" option for lifestyle',
                'Removed Fate → Added Mercy mechanic for inspiration',
                'Adjusted Rest & Sleep Ruling',
                'Long rest renamed Full rest',
                'Full rest no longer requires 7 days of rest → requirement moved to resting within city or town',
                'Full rest no longer removes exhaustion, the function is served by sleeping entirely',
                'Full rests no longer remove wounds, healing must be sought out',
                'Removed Greatclub',
                'Added Simple & Advanced weapons',
                'Tweaked Hearty trait → Added Tough trait',
                'Adjusted loading property description',
                'Adjusted Armour description',
                'Adjusted Age mechanic',
                'Removed ration box',
                'Overhauled character sheet page 1 & 2',
                'Druid abilities shifted, domain moved to main class',
                'Adjusted Ranger Rank Titles',
                'Added "Totem" ability for main class druids',
                'Standardized class resources. Martials get stamina, casters get mana',
                'Spell list & Spellcasting section edits',
                'Adjusted weaver feat',
                'Adjusted feats of faith',
                'Elfrot now takes from max health instead of having its own effect',
                'Proficiency removed',
                'Forced March adjusted to fit current travel rules',
                'Reworked interactions, inventory, equipment action economy → inventory requires action, equipment requires interaction',
                'Light weapon property reworded',
                'D20 Check ruling adjusted, compounded contest ruling',
                'Initiative now based on WIS → used to be based on DEX',
                'Passive awareness equal to WIS score instead of 10 + mod',
                'Interaction cost 20 speed → increased from 15 speed',
                'Perpetual fog during daytime added via lore → vision obscured to 100 feet at most times',
                'AC calculation decreased from (10 + DEX mod) → (8 + DEX mod)',
                'Split "Notes" on page 3',
                'Change page 2 "Notes" to inventory',
                'Added spot for reputation - honor & infamy',
                'Create a place on the character sheet for components'
            ]
        },
        {
            date: 'December 4, 2025',
            title: 'Deoch v.08 → v.24',
            bullets: [
                'Lore update: Tirnoch is rich in magic metals, therefore this facilitates the conflicts in the small area, despite its small size',
                'Fixed proficiency at level 0 issue',
                'Fixed issues between powerful build, armour master, colossus and push & pull rules',
                'Fencer feat removed and replaced → Added Improved Parry',
                'Craftwise description expanded',
                'Changed tusk ability - final iteration',
                'Renamed Dwellen "Brave" to "Stubborn" and added in "charmed" alongside "frightened"',
                'Added CHA bonus to amaranthine trait',
                'Feat, Traits & Handicaps, Armour, Weapon systems and Adventuring equipment table and descriptions overhauled',
                'Added more heritage and faith feats',
                'Revised armour master and shield mastery feats to accommodate the new armour system',
                'Added estoc',
                'Equipment ruling added: You can\'t equip items over 9 lbs, except weapons or armor',
                'Added quill to ink bottle',
                'Changed piercing and slashing to sharp',
                'Made all weapons have finesse property',
                'Pricing overhaul based on real-time labour costs coupled with material costs',
                'Added melee weapon reaction +1 AC effect',
                'Added versatile ruling',
                'Added: Wagon → Handcart, recipe tools, Merchant Scale → Scale, retort, added bola weapon',
                'Removed: Outrigger vessel, acid vial, ball bearings, hunting trap, climber kit, paper, flask, parchment, whistle, perfume, magnifying glass, spyglass, shortbow',
                'Adjusted recipe requirements',
                'Removed natural armour, no longer compatible with the armour system',
                'Added bagmeister, bandage, leatherwork, meat pie, platesmith, pottage, pound cake, swordsmith, tailoring, talosmith, tanner, whisperfade, woodworker, windlash, wardencrest',
                'Complete the equipment list and description adjustment',
                'Towntime: Guilds',
                'Towntime: Training',
                'Towntime: Craft revision',
                'Poem Revision',
                'Towntime: Villainy',
                'Towntime: Run into a lower ranking member of your class that is seeking training',
                'Removed barrier to long resting during towntime',
                'Magic metals second adjustment, added aetherium and costs',
                'Magic metals adjusted based on the new mastercraft effect/armour system',
                'Tested reactions twice per round, actions once per turn - action economy',
                'Add parry reaction mechanic',
                'Equipment requires interaction, inventory requires action. Pouches create more equipment space',
                'Flying creature carrying weight / rules',
                'Removed bonus actions, +1 reaction instead',
                'Mastercraft effect adjusted and ruling entered',
                'Reintegrated \'Expertise\' away from toolkits',
                'Experience ruling needs to specify that you spend accumulated experience to level up',
                'Critical revamp',
                'D20 check excerpt overhaul',
                'Added chart for average uses for die categories',
                'Add renown system, integrate into towntime',
                'Structures no longer have AC but rather have DR and damage immunities',
                'Powerful build affects armour equips',
                'Push, Lift and Drag revamped to Push & Pull',
                'Fixed surprised condition',
                'Dashing is now an action',
                'Removed copper as a currency',
                'Inspiration use: "network" added, tested and removed',
                'Initiative based on WIS',
                'You no longer need to train to level up, training now instead offers additional benefits',
                'Added passive awareness, increased damage space, actions and reaction to char sheet'
            ]
        },
        {
            date: 'November 29, 2025',
            title: 'Changelog Protocol Initiated',
            bullets: [
                'Announcement of the formal version update changelog system',
                'Commitment to documenting all future mechanical shifts and lore expansions',
                'Streamlining developer-to-player communication for upcoming releases'
            ]
        },
        {
            date: 'November 17, 2024',
            title: 'RPG Alliance Con',
            bullets: [
                'Deoch was played in-person at RPG Alliance Con',
                'Fundraising event to raise money for charity',
                'Live play-testing and community engagement session'
            ]
        },
        {
            date: 'November 4, 2024',
            title: 'Randomworlds Q&A Collab',
            bullets: [
                'Collaboration and live Q&A session with Randomworlds',
                'In-depth discussion of Deoch\'s mechanics and world-building',
                'Community feedback integration into development'
            ]
        },
        {
            date: 'October 3, 2024',
            title: 'Website Created',
            bullets: [
                'Initial website launch',
                'Integrated character sheet prototype',
                'Added development timeline'
            ]
        },
        {
            date: 'July 10, 2023',
            title: 'Project Inception',
            bullets: [
                'The birth of the Deoch TTRPG concept',
                'Initial brainstorming of core mechanics and dark fantasy setting',
                'Setting the foundation for a legacy of shadows and magic'
            ]
        }
    ],

    BESTIARY: [
        {
            id: 'goblin',
            name: 'Goblin',
            type: 'Small Humanoid',
            icon: 'sword',
            ac: '12',
            hp: '7',
            mp: '0',
            speed: '30ft',
            summary: 'Skittish ambusher that relies on numbers and dirty tactics.',
            actions: ['Scimitar +3 to hit, 1d6+1 damage', 'Shortbow +3 to hit, 1d6+1 damage']
        },
        {
            id: 'spider',
            name: 'Spider',
            type: 'Tiny Beast',
            icon: 'bug',
            ac: '13',
            hp: '4',
            mp: '0',
            speed: '20ft, climb 20ft',
            summary: 'Venomous crawler suited for cramped spaces and surprise attacks.',
            actions: ['Bite +4 to hit, 1 damage, target checks against venom']
        },
        {
            id: 'horse',
            name: 'Horse',
            type: 'Large Beast',
            icon: 'paw-print',
            ac: '11',
            hp: '19',
            mp: '0',
            speed: '60ft',
            summary: 'Fast mount or battlefield obstacle with a strong kick.',
            actions: ['Hooves +4 to hit, 2d4+2 damage']
        }
    ]
};
