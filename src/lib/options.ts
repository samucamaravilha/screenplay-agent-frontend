import type {
  AntagonistType,
  CliffhangerType,
  EndingType,
  ProtagonistArchetype,
  Setting,
  Subgenre,
  Theme,
  Tone,
} from './types'

type Option<T extends string> = {
  id: T
  label: string
  description?: string
}

export const SUBGENRES: Option<Subgenre>[] = [
  { id: 'regression', label: 'Regressão', description: 'Protagonista morre/falha e volta no tempo com conhecimento do futuro' },
  { id: 'reincarnation_isekai', label: 'Reencarnação / Isekai', description: 'Protagonista renasce em outro mundo, geralmente com vantagem' },
  { id: 'system_awakening', label: 'Sistema / Despertar', description: 'Mundo moderno + sistema RPG; protagonista desperta habilidade rara' },
  { id: 'murim_cultivation', label: 'Murim / Cultivo', description: 'Mundo de artes marciais sobrenaturais; ascensão por treinamento' },
  { id: 'tower_dungeon', label: 'Torre / Dungeon', description: 'Estrutura vertical com andares cada vez mais difíceis' },
  { id: 'necromancer_dark', label: 'Necromancer / Dark', description: 'Protagonista usa poder sombrio, geralmente desprezado pela sociedade' },
  { id: 'academy', label: 'Academia mágica', description: 'Escola/academia onde o protagonista é subestimado e ascende' },
  { id: 'villain_reverse', label: 'Vilão / Reverso', description: 'Protagonista é (ou era) o vilão; busca redenção ou domínio' },
]

export const SETTINGS: Option<Setting>[] = [
  { id: 'modern_gate', label: 'Mundo moderno + Gates', description: 'Cidade contemporânea com portais que liberam monstros' },
  { id: 'fantasy_kingdom', label: 'Reino de fantasia medieval', description: 'Reinos, nobreza, magia, espadas' },
  { id: 'ancient_murim', label: 'Murim antigo (Coreia/China)', description: 'Era de seitas, clãs de artes marciais, técnicas secretas' },
  { id: 'modern_system', label: 'Mundo moderno + Sistema RPG', description: 'Realidade normal onde subitamente status, níveis e quests existem' },
  { id: 'cyber_future', label: 'Cyberpunk / Futuro distópico', description: 'Megacorporações, augmentações, gangues' },
  { id: 'post_apocalypse', label: 'Pós-apocalipse', description: 'Civilização caiu; sobreviventes contra monstros ou outros humanos' },
  { id: 'magic_academy', label: 'Academia de magia', description: 'Escola de elite onde alunos competem por status' },
  { id: 'empire_court', label: 'Império / Corte palaciana', description: 'Política de corte, intrigas, sucessão imperial' },
]

export const PROTAGONIST_ARCHETYPES: Option<ProtagonistArchetype>[] = [
  { id: 'returnee', label: 'O Retornado', description: 'Voltou da morte ou do futuro; sabe o que vai acontecer' },
  { id: 'weakest_to_strongest', label: 'Do mais fraco ao mais forte', description: 'Começa humilhado, ascende por mérito e luta' },
  { id: 'hidden_genius', label: 'Gênio escondido', description: 'Parece fraco/comum, mas tem talento ou conhecimento raro' },
  { id: 'reborn_villain', label: 'Vilão renascido', description: 'Vida passada foi o vilão; agora tem segunda chance' },
  { id: 'last_of_clan', label: 'Último do clã', description: 'Sobrevivente solitário de um clã/família massacrada' },
  { id: 'awakened_bloodline', label: 'Sangue desperto', description: 'Linhagem rara/lendária se manifesta tardiamente' },
  { id: 'forced_player', label: 'Jogador forçado', description: 'Arrancado da vida normal pra um sistema/mundo que não pediu' },
  { id: 'knowledge_holder', label: 'Detentor do conhecimento', description: 'Sabe segredos do mundo que ninguém mais sabe' },
]

export const ANTAGONIST_TYPES: Option<AntagonistType>[] = [
  { id: 'tyrant_ruler', label: 'Tirano governante', description: 'Imperador, rei ou líder corrupto que oprime' },
  { id: 'demon_king', label: 'Rei demônio / Entidade ancestral', description: 'Ameaça cósmica ou sobrenatural antiga' },
  { id: 'rival_genius', label: 'Gênio rival', description: 'Outro talento da mesma geração, opositor direto' },
  { id: 'corrupt_system', label: 'Sistema corrupto', description: 'Instituição (academia, guild, governo) podre por dentro' },
  { id: 'past_tormentor', label: 'Algoz do passado', description: 'Aquele que destruiu o protagonista na vida anterior' },
  { id: 'world_system', label: 'O próprio mundo / sistema', description: 'Regras do mundo são hostis ao protagonista' },
  { id: 'apocalyptic_threat', label: 'Ameaça apocalíptica', description: 'Cataclismo, gates abrindo, fim do mundo se aproximando' },
  { id: 'rival_clan', label: 'Clã/seita rival', description: 'Facção opositora numericamente superior' },
]

export const THEMES: Option<Theme>[] = [
  { id: 'revenge', label: 'Vingança' },
  { id: 'redemption', label: 'Redenção' },
  { id: 'ascension', label: 'Ascensão / Crescimento' },
  { id: 'knowledge_is_power', label: 'Conhecimento é poder' },
  { id: 'underestimation', label: 'Subestimação' },
  { id: 'loyalty_betrayal', label: 'Lealdade e traição' },
  { id: 'family_clan_honor', label: 'Honra familiar/clã' },
  { id: 'justice_vs_survival', label: 'Justiça vs sobrevivência' },
  { id: 'isolation', label: 'Solidão / Isolamento' },
  { id: 'duty_and_sacrifice', label: 'Dever e sacrifício' },
]

export const TONES: Option<Tone>[] = [
  { id: 'dark_grim', label: 'Sombrio / Grim' },
  { id: 'vengeful_cold', label: 'Vingativo / Frio' },
  { id: 'hopeful_rising', label: 'Esperançoso / Ascendente' },
  { id: 'melancholic', label: 'Melancólico' },
  { id: 'stoic_calculating', label: 'Estoico / Calculista' },
  { id: 'mixed', label: 'Misto / Multifacetado' },
]

export const ENDING_TYPES: Option<EndingType>[] = [
  { id: 'throne_of_world', label: 'Trono do mundo', description: 'Protagonista se torna o mais forte, governa' },
  { id: 'quiet_victory', label: 'Vitória silenciosa', description: 'Venceu tudo, se retirou em paz' },
  { id: 'bittersweet', label: 'Agridoce', description: 'Atingiu objetivo mas perdeu algo essencial' },
  { id: 'cyclical', label: 'Cíclico', description: 'Tornou-se aquilo contra o qual lutou' },
  { id: 'open_continuation', label: 'Aberto / Continuação', description: 'Pronto pra próxima aventura' },
  { id: 'transcendent', label: 'Transcendente', description: 'Ultrapassou o plano mortal/humano' },
]

export const CLIFFHANGER_TYPES: Option<CliffhangerType>[] = [
  { id: 'knowledge_gap', label: 'Lacuna de conhecimento', description: 'Algo é revelado parcialmente — espectador quer saber o resto' },
  { id: 'imminent_threat', label: 'Ameaça iminente', description: 'Inimigo aparece no último frame' },
  { id: 'revelation', label: 'Revelação chocante', description: 'Verdade que muda tudo é revelada' },
  { id: 'decision_point', label: 'Ponto de decisão', description: 'Protagonista enfrenta escolha impossível' },
  { id: 'power_reveal', label: 'Revelação de poder', description: 'Novo poder/habilidade se manifesta inesperadamente' },
  { id: 'betrayal', label: 'Traição', description: 'Aliado se vira contra protagonista' },
]

export function labelFor<T extends string>(
  options: Option<T>[],
  id: T | string | undefined,
): string {
  if (!id) return ''
  return options.find((o) => o.id === id)?.label ?? id
}
