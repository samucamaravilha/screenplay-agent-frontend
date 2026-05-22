// Wire format: camelCase, matching backend Pydantic aliases.
// Keep these in sync with backend/api/schemas.py.

export type Subgenre =
  | 'regression'
  | 'reincarnation_isekai'
  | 'system_awakening'
  | 'murim_cultivation'
  | 'tower_dungeon'
  | 'necromancer_dark'
  | 'academy'
  | 'villain_reverse'

export type Setting =
  | 'modern_gate'
  | 'fantasy_kingdom'
  | 'ancient_murim'
  | 'modern_system'
  | 'cyber_future'
  | 'post_apocalypse'
  | 'magic_academy'
  | 'empire_court'

export type ProtagonistArchetype =
  | 'returnee'
  | 'weakest_to_strongest'
  | 'hidden_genius'
  | 'reborn_villain'
  | 'last_of_clan'
  | 'awakened_bloodline'
  | 'forced_player'
  | 'knowledge_holder'

export type AntagonistType =
  | 'tyrant_ruler'
  | 'demon_king'
  | 'rival_genius'
  | 'corrupt_system'
  | 'past_tormentor'
  | 'world_system'
  | 'apocalyptic_threat'
  | 'rival_clan'

export type Theme =
  | 'revenge'
  | 'redemption'
  | 'ascension'
  | 'knowledge_is_power'
  | 'underestimation'
  | 'loyalty_betrayal'
  | 'family_clan_honor'
  | 'justice_vs_survival'
  | 'isolation'
  | 'duty_and_sacrifice'

export type Tone =
  | 'dark_grim'
  | 'vengeful_cold'
  | 'hopeful_rising'
  | 'melancholic'
  | 'stoic_calculating'
  | 'mixed'

export type EndingType =
  | 'throne_of_world'
  | 'quiet_victory'
  | 'bittersweet'
  | 'cyclical'
  | 'open_continuation'
  | 'transcendent'

export type CliffhangerType =
  | 'knowledge_gap'
  | 'imminent_threat'
  | 'revelation'
  | 'decision_point'
  | 'power_reveal'
  | 'betrayal'
  | string // backend may emit values outside this list

export type TransitionType =
  | 'cut'
  | 'fade'
  | 'zoom_in'
  | 'zoom_out'
  | 'match_cut'
  | 'whip_pan'
  | 'system_overlay'
  | string

export type HookType = string

export type Series = {
  id: string
  title: string
  subgenre: Subgenre
  setting: Setting
  powerSystem: string
  protagonist: {
    archetype: ProtagonistArchetype
    name: string
    background: string
    coreMotivation: string
  }
  antagonist: {
    type: AntagonistType
    name: string
    threat: string
  }
  themes: Theme[]
  totalEpisodes: number
  tone: Tone
  ending: EndingType
  createdAt: string
  updatedAt: string
}

export type ArcBeat = {
  episodeNumber: number
  function: string
  keyEvent: string
  emotionalNote: string
}

export type Arc = {
  seriesId: string
  beats: ArcBeat[]
}

export type DialogueLine = {
  speaker: string
  line: string
  emotion: string
}

export type EpisodeBeat = {
  id: string
  index: number
  startTime: number
  duration: number
  imageDescription: string
  narration: string | null
  dialogue?: DialogueLine[]
  systemMessage?: string
  mood: string
  sfx: string[]
  transition: TransitionType
}

export type Hook = {
  type: HookType
  beat: EpisodeBeat
  reasoning: string
}

export type EpisodeMetadata = {
  estimatedDuration: number
  cliffhangerType: CliffhangerType
  generatedAt: string
  iterationCount: number
}

export type Episode = {
  id: string
  seriesId: string
  episodeNumber: number
  beats: EpisodeBeat[]
  entryHooks: Hook[]
  exitHooks: Hook[]
  metadata: EpisodeMetadata
}

export type Refinements = {
  tone?: string
  pacing?: string
  focus?: string
}
