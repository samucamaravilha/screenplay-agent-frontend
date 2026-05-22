# Story Workshop — Briefing para Claude Code (v2)

## 1. Contexto e objetivo

Estamos construindo o **Story Workshop**, uma ferramenta web pra acelerar a produção de roteiros de manhwa vertical animado por IA. Inspirado no mecanismo Story Workshop do jogo *Hollywood Animal*: o usuário compõe uma série a partir de escolhas estruturadas (gênero, setting, protagonista, antagonista, temas, eventos sequenciais, final), e o sistema gera roteiros episódio por episódio otimizados pro formato vertical curto (60-90 segundos por episódio).

A meta é mass-produzir roteiros consistentes, viciantes, fiéis aos tropes que funcionam em manhwa de power fantasy (isekai, regressão, sistema, murim, dungeons). Não estamos buscando primor literário — estamos buscando estrutura sólida e ganchos eficazes pro formato vertical.

**Escopo do v0:**
- Geração de UM episódio por vez (não o arco inteiro de uma vez)
- Interface tipo "studio" com regeneração de beats individuais, ajuste de tom e pacing
- Persistência local no frontend (localStorage) — sem auth, sem banco, sem multi-usuário
- Backend stateless (toda persistência mora no cliente)

## 2. Stack técnica (arquitetura de dois repos)

O projeto vive em **dois repositórios GitHub separados**, cada um com seu próprio deploy independente na Vercel. Essa escolha é deliberada e não vai mudar.

### Frontend
- **Repo:** `samucamaravilha/screenplay-agent-frontend`
- **Deploy:** https://screenplay-agent-frontend.vercel.app
- **Stack:** Vite + React 19 + TypeScript
- **Estilo:** Tailwind CSS v4 (via plugin `@tailwindcss/vite`, com `@import "tailwindcss"` em `src/index.css`). **Não existe `tailwind.config.js`** — a config da v4 é via CSS.
- **Componentes:** shadcn/ui (suportado oficialmente em Vite — manter como component lib)
- **HTTP client:** `src/lib/api.ts` (já existe) lê `VITE_API_BASE_URL` e faz `fetch` pro backend

### Backend
- **Repo:** `samucamaravilha/screenplay-agent-backend`
- **Deploy:** https://screenplay-agent-backend.vercel.app
- **Stack:** FastAPI (Python) rodando como serverless function na Vercel
- **Entrypoint:** `api/index.py` (já existe); `vercel.json` rewrita `/api/(.*)` pro handler
- **CORS:** configurado via env var `ALLOWED_ORIGINS` (já liberado pro frontend prod + `localhost:5173`)
- **Endpoints já existentes:** `/api/health`, `/api/hello`
- **SDK Anthropic:** pacote Python `anthropic` (do PyPI), não `@anthropic-ai/sdk`

### Variáveis de ambiente

**Backend (Vercel project do backend):**
- `ANTHROPIC_API_KEY` — chave da Anthropic, usada apenas server-side
- `ALLOWED_ORIGINS` — CSV de origens permitidas via CORS (já existe)

**Frontend (Vercel project do frontend):**
- `VITE_API_BASE_URL` — URL base do backend (já existe)

**Crítico:** a `ANTHROPIC_API_KEY` jamais aparece no frontend. Toda chamada à Anthropic API acontece em endpoints FastAPI no backend. O frontend só sabe falar com o backend.

**Modelo de IA:** `claude-opus-4-7`

## 3. Princípio orientador

A inteligência do produto está no **system prompt e no schema de output estruturado**, não na UI. A UI é um wrapper que captura escolhas estruturadas e renderiza o output. Investir tempo onde está o valor: prompt engineering primeiro, UI depois.

## 4. Modelo de dados

Três entidades em hierarquia: Série → Arco → Episódio.

Tipos definidos em **`frontend/src/lib/types.ts`** (TypeScript) com paridade manual em **`backend/api/schemas.py`** (Pydantic). Como os dois repos são independentes, não há geração automática de paridade — manter os schemas sincronizados manualmente. Quando alterar um, alterar o outro no mesmo ciclo de trabalho.

### TypeScript (frontend)

```typescript
// frontend/src/lib/types.ts

// Definida uma vez pelo usuário. Persistida em localStorage.
export type Series = {
  id: string;
  title: string;
  subgenre: Subgenre;
  setting: Setting;
  powerSystem: string;          // texto livre com regras do sistema de poder
  protagonist: {
    archetype: ProtagonistArchetype;
    name: string;
    background: string;         // 2-3 frases
    coreMotivation: string;     // 1 frase
  };
  antagonist: {
    type: AntagonistType;
    name: string;
    threat: string;             // o que ele representa
  };
  themes: Theme[];              // 2-4 temas selecionados
  totalEpisodes: number;        // padrão 60
  tone: Tone;
  ending: EndingType;
  createdAt: string;
  updatedAt: string;
};

// Gerado a partir da Série pelo backend. Persistido em localStorage. Editável.
export type Arc = {
  seriesId: string;
  beats: ArcBeat[];             // N beats, um por episódio
};

export type ArcBeat = {
  episodeNumber: number;
  function: string;
  keyEvent: string;
  emotionalNote: string;
};

// Gerado por demanda a partir de Série + ArcBeat correspondente.
export type Episode = {
  id: string;
  seriesId: string;
  episodeNumber: number;
  beats: EpisodeBeat[];          // 8-12 beats por episódio
  entryHooks: Hook[];            // 3 variações pro hook de abertura
  exitHooks: Hook[];             // 3 variações pro hook de saída
  metadata: {
    estimatedDuration: number;
    cliffhangerType: CliffhangerType;
    generatedAt: string;
    iterationCount: number;
  };
};

export type EpisodeBeat = {
  id: string;
  index: number;
  startTime: number;             // segundos desde o início
  duration: number;              // 5-10 segundos
  imageDescription: string;
  narration: string | null;
  dialogue?: { speaker: string; line: string; emotion: string }[];
  systemMessage?: string;
  mood: string;
  sfx: string[];
  transition: TransitionType;
};

export type Hook = {
  type: HookType;
  beat: EpisodeBeat;
  reasoning: string;
};
```

### Pydantic (backend, paridade manual)

```python
# backend/api/schemas.py

from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class ProtagonistInfo(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    archetype: str
    name: str
    background: str
    core_motivation: str = Field(alias="coreMotivation")

class AntagonistInfo(BaseModel):
    type: str
    name: str
    threat: str

class Series(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: str
    title: str
    subgenre: str
    setting: str
    power_system: str = Field(alias="powerSystem")
    protagonist: ProtagonistInfo
    antagonist: AntagonistInfo
    themes: list[str]
    total_episodes: int = Field(alias="totalEpisodes")
    tone: str
    ending: str
    created_at: str = Field(alias="createdAt")
    updated_at: str = Field(alias="updatedAt")

class ArcBeat(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    episode_number: int = Field(alias="episodeNumber")
    function: str
    key_event: str = Field(alias="keyEvent")
    emotional_note: str = Field(alias="emotionalNote")

class Arc(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    series_id: str = Field(alias="seriesId")
    beats: list[ArcBeat]

class DialogueLine(BaseModel):
    speaker: str
    line: str
    emotion: str

class EpisodeBeat(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: str
    index: int
    start_time: float = Field(alias="startTime")
    duration: float
    image_description: str = Field(alias="imageDescription")
    narration: Optional[str] = None
    dialogue: Optional[list[DialogueLine]] = None
    system_message: Optional[str] = Field(default=None, alias="systemMessage")
    mood: str
    sfx: list[str]
    transition: str

class Hook(BaseModel):
    type: str
    beat: EpisodeBeat
    reasoning: str

class EpisodeMetadata(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    estimated_duration: float = Field(alias="estimatedDuration")
    cliffhanger_type: str = Field(alias="cliffhangerType")
    generated_at: str = Field(alias="generatedAt")
    iteration_count: int = Field(alias="iterationCount")

class Episode(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: str
    series_id: str = Field(alias="seriesId")
    episode_number: int = Field(alias="episodeNumber")
    beats: list[EpisodeBeat]
    entry_hooks: list[Hook] = Field(alias="entryHooks")
    exit_hooks: list[Hook] = Field(alias="exitHooks")
    metadata: EpisodeMetadata

# Requests pros endpoints

class GenerateArcRequest(BaseModel):
    series: Series

class Refinements(BaseModel):
    tone: Optional[str] = None
    pacing: Optional[str] = None
    focus: Optional[str] = None

class GenerateEpisodeRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    series: Series
    arc: Arc
    episode_number: int = Field(alias="episodeNumber")
    previous_episodes: list[Episode] = Field(alias="previousEpisodes", default_factory=list)
    refinements: Optional[Refinements] = None
```

**Convenção de naming:** o frontend usa camelCase (idiomático TS); o backend usa snake_case interno mas serializa/desserializa em camelCase via `Field(alias=...)` nos modelos Pydantic.

## 5. Opções curadas (a parte Hollywood Animal)

Estas listas são o **conhecimento de produto** embutido no app. Devem aparecer como dropdowns/seletores no formulário de Série. Curadas com base nos manhwa de maior sucesso (Solo Leveling, Tower of God, Omniscient Reader, The Beginning After the End, Nano Machine, Trash of the Count's Family, etc.).

Definidas em **`frontend/src/lib/options.ts`**. O backend não precisa dessas listas — ele recebe os strings escolhidos diretamente no request body.

### Subgêneros (escolher 1)

```typescript
export const SUBGENRES = [
  { id: "regression", label: "Regressão", description: "Protagonista morre/falha e volta no tempo com conhecimento do futuro" },
  { id: "reincarnation_isekai", label: "Reencarnação / Isekai", description: "Protagonista renasce em outro mundo, geralmente com vantagem" },
  { id: "system_awakening", label: "Sistema / Despertar", description: "Mundo moderno + sistema RPG; protagonista desperta habilidade rara" },
  { id: "murim_cultivation", label: "Murim / Cultivo", description: "Mundo de artes marciais sobrenaturais; ascensão por treinamento" },
  { id: "tower_dungeon", label: "Torre / Dungeon", description: "Estrutura vertical com andares cada vez mais difíceis" },
  { id: "necromancer_dark", label: "Necromancer / Dark", description: "Protagonista usa poder sombrio, geralmente desprezado pela sociedade" },
  { id: "academy", label: "Academia mágica", description: "Escola/academia onde o protagonista é subestimado e ascende" },
  { id: "villain_reverse", label: "Vilão / Reverso", description: "Protagonista é (ou era) o vilão; busca redenção ou domínio" },
];
```

### Settings (escolher 1)

```typescript
export const SETTINGS = [
  { id: "modern_gate", label: "Mundo moderno + Gates", description: "Cidade contemporânea com portais que liberam monstros" },
  { id: "fantasy_kingdom", label: "Reino de fantasia medieval", description: "Reinos, nobreza, magia, espadas" },
  { id: "ancient_murim", label: "Murim antigo (Coreia/China)", description: "Era de seitas, clãs de artes marciais, técnicas secretas" },
  { id: "modern_system", label: "Mundo moderno + Sistema RPG", description: "Realidade normal onde subitamente status, níveis e quests existem" },
  { id: "cyber_future", label: "Cyberpunk / Futuro distópico", description: "Megacorporações, augmentações, gangues" },
  { id: "post_apocalypse", label: "Pós-apocalipse", description: "Civilização caiu; sobreviventes contra monstros ou outros humanos" },
  { id: "magic_academy", label: "Academia de magia", description: "Escola de elite onde alunos competem por status" },
  { id: "empire_court", label: "Império / Corte palaciana", description: "Política de corte, intrigas, sucessão imperial" },
];
```

### Arquétipos de protagonista (escolher 1)

```typescript
export const PROTAGONIST_ARCHETYPES = [
  { id: "returnee", label: "O Retornado", description: "Voltou da morte ou do futuro; sabe o que vai acontecer" },
  { id: "weakest_to_strongest", label: "Do mais fraco ao mais forte", description: "Começa humilhado, ascende por mérito e luta" },
  { id: "hidden_genius", label: "Gênio escondido", description: "Parece fraco/comum, mas tem talento ou conhecimento raro" },
  { id: "reborn_villain", label: "Vilão renascido", description: "Vida passada foi o vilão; agora tem segunda chance" },
  { id: "last_of_clan", label: "Último do clã", description: "Sobrevivente solitário de um clã/família massacrada" },
  { id: "awakened_bloodline", label: "Sangue desperto", description: "Linhagem rara/lendária se manifesta tardiamente" },
  { id: "forced_player", label: "Jogador forçado", description: "Arrancado da vida normal pra um sistema/mundo que não pediu" },
  { id: "knowledge_holder", label: "Detentor do conhecimento", description: "Sabe segredos do mundo que ninguém mais sabe (ex: leu o livro/jogou o jogo)" },
];
```

### Tipos de antagonista (escolher 1)

```typescript
export const ANTAGONIST_TYPES = [
  { id: "tyrant_ruler", label: "Tirano governante", description: "Imperador, rei ou líder corrupto que oprime" },
  { id: "demon_king", label: "Rei demônio / Entidade ancestral", description: "Ameaça cósmica ou sobrenatural antiga" },
  { id: "rival_genius", label: "Gênio rival", description: "Outro talento da mesma geração, opositor direto" },
  { id: "corrupt_system", label: "Sistema corrupto", description: "Instituição (academia, guild, governo) podre por dentro" },
  { id: "past_tormentor", label: "Algoz do passado", description: "Aquele que destruiu o protagonista na vida anterior" },
  { id: "world_system", label: "O próprio mundo / sistema", description: "Regras do mundo são hostis ao protagonista" },
  { id: "apocalyptic_threat", label: "Ameaça apocalíptica", description: "Cataclismo, gates abrindo, fim do mundo se aproximando" },
  { id: "rival_clan", label: "Clã/seita rival", description: "Facção opositora numericamente superior" },
];
```

### Temas (escolher 2-4)

```typescript
export const THEMES = [
  { id: "revenge", label: "Vingança" },
  { id: "redemption", label: "Redenção" },
  { id: "ascension", label: "Ascensão / Crescimento" },
  { id: "knowledge_is_power", label: "Conhecimento é poder" },
  { id: "underestimation", label: "Subestimação" },
  { id: "loyalty_betrayal", label: "Lealdade e traição" },
  { id: "family_clan_honor", label: "Honra familiar/clã" },
  { id: "justice_vs_survival", label: "Justiça vs sobrevivência" },
  { id: "isolation", label: "Solidão / Isolamento" },
  { id: "duty_and_sacrifice", label: "Dever e sacrifício" },
];
```

### Tom geral (escolher 1)

```typescript
export const TONES = [
  { id: "dark_grim", label: "Sombrio / Grim" },
  { id: "vengeful_cold", label: "Vingativo / Frio" },
  { id: "hopeful_rising", label: "Esperançoso / Ascendente" },
  { id: "melancholic", label: "Melancólico" },
  { id: "stoic_calculating", label: "Estoico / Calculista" },
  { id: "mixed", label: "Misto / Multifacetado" },
];
```

### Tipo de final (escolher 1)

```typescript
export const ENDING_TYPES = [
  { id: "throne_of_world", label: "Trono do mundo", description: "Protagonista se torna o mais forte, governa" },
  { id: "quiet_victory", label: "Vitória silenciosa", description: "Venceu tudo, se retirou em paz" },
  { id: "bittersweet", label: "Agridoce", description: "Atingiu objetivo mas perdeu algo essencial" },
  { id: "cyclical", label: "Cíclico", description: "Tornou-se aquilo contra o qual lutou" },
  { id: "open_continuation", label: "Aberto / Continuação", description: "Pronto pra próxima aventura" },
  { id: "transcendent", label: "Transcendente", description: "Ultrapassou o plano mortal/humano" },
];
```

### Tipos de cliffhanger (usado por episódio)

```typescript
export const CLIFFHANGER_TYPES = [
  { id: "knowledge_gap", label: "Lacuna de conhecimento", description: "Algo é revelado parcialmente — espectador quer saber o resto" },
  { id: "imminent_threat", label: "Ameaça iminente", description: "Inimigo aparece no último frame" },
  { id: "revelation", label: "Revelação chocante", description: "Verdade que muda tudo é revelada" },
  { id: "decision_point", label: "Ponto de decisão", description: "Protagonista enfrenta escolha impossível" },
  { id: "power_reveal", label: "Revelação de poder", description: "Novo poder/habilidade se manifesta inesperadamente" },
  { id: "betrayal", label: "Traição", description: "Aliado se vira contra protagonista" },
];
```

### Tipos de transição (entre beats)

```typescript
export const TRANSITIONS = ["cut", "fade", "zoom_in", "zoom_out", "match_cut", "whip_pan", "system_overlay"];
```

## 6. UI / UX (modo studio)

Três telas principais. shadcn/ui pra todos os componentes, layout vertical com sidebar lateral fina pra navegação entre telas. Tema dark fixo (manhwa pede dark).

### Tela 1 — Series Setup

Formulário pra criar/editar uma série. Single page com seções colapsáveis pra revisão fácil.

Seções:
1. **Identidade:** título + subgênero + setting
2. **Sistema de poder:** textarea livre (placeholder com exemplo: "Sistema de cultivo em 10 estágios. Avanços requerem absorver essência de monstros. Nível visível como aura colorida.")
3. **Protagonista:** arquétipo + nome + background (textarea) + motivação core
4. **Antagonista:** tipo + nome + threat (o que representa)
5. **Temas:** multi-select (2-4)
6. **Tom geral:** select
7. **Final:** select + número total de episódios

Botão "Gerar arco" no final. Salva a série no localStorage e dispara `POST /api/generate-arc`.

### Tela 2 — Arc Overview

Após gerar a série, chamada ao backend produz o arco completo (60 beats, um por episódio). Exibido como lista vertical scrollável:

```
[01] Introdução do protagonista
     EVENTO: Kaito é humilhado no torneio anual da academia.
     MOOD: humilhação, raiva contida

[02] Trigger da regressão
     EVENTO: Confronto fatal com o rival; Kaito morre; sistema oferece regressão.
     MOOD: morte, revelação cósmica

[03] Acordando 10 anos no passado
     ...
```

Cada item editável (texto pode ser ajustado manualmente). Botão "Regenerar este beat" e "Regenerar do beat X em diante" (re-chamam o backend com o contexto apropriado). Salva no localStorage.

Botão "Ir pra episódio N" leva pra Tela 3.

### Tela 3 — Episode Studio (a tela principal)

Layout em 3 colunas:

**Coluna esquerda (estreita, ~280px) — Contexto:**
- Resumo da série (badges com subgênero, setting, tom)
- Função do episódio (do arco beat)
- Botões: "Episódio anterior", "Próximo episódio", "Regenerar episódio inteiro"

**Coluna central (larga, flex-1) — Beats:**
- Card vertical por beat, do beat 1 ao 8-12
- Cada card mostra: índice, timing (ex: "0:08 — 0:15"), descrição visual, narração/diálogo, mood, SFX, transição
- Botões por card: "Regenerar este beat", "Editar manualmente", "Refinar tom" (abre dropdown com opções)
- Card é colapsável (mostra só headline quando colapsado)

**Coluna direita (estreita, ~280px) — Hooks:**
- Seção "Hook de entrada" (com 3 variações em cards pequenos, usuário escolhe a ativa)
- Seção "Hook de saída / Cliffhanger" (3 variações + dropdown de tipo de cliffhanger)
- Botão "Regenerar hooks"
- Botão "Exportar episódio (JSON)"

### Estados de loading

Toda chamada ao backend mostra skeleton no card específico + spinner pequeno. Não bloqueia a UI inteira. Idealmente usar streaming via SSE (ver seção 9) pra mostrar texto chegando em tempo real nos cards.

## 7. O SYSTEM PROMPT pra geração de episódio

Esta é a parte mais importante. É o coração do produto. Vive no backend em **`backend/api/prompts/episode_system.py`** como string Python.

```python
# backend/api/prompts/episode_system.py

EPISODE_SYSTEM_PROMPT = """Você é um roteirista especialista em manhwa coreano vertical animado em formato curto (60-90 segundos por episódio). Sua função é gerar roteiros estruturados que sejam viciantes, fiéis aos tropes do gênero, e otimizados pro formato de scroll vertical.

# Princípios não-negociáveis

1. **Estrutura por beats, não por cenas.** Cada episódio é 8-12 beats. Cada beat dura 5-10 segundos. Cada beat tem uma imagem-âncora, narração curta ou diálogo, mood, SFX, e uma transição.

2. **Cadência de escalação a cada 8 segundos.** O formato vertical não tolera lentidão. A cada beat algo precisa avançar: nova informação, mudança emocional, virada, ou intensificação visual. Beats expositivos puros são proibidos.

3. **Hook duplo é obrigatório.** Beat 1 prende sem contexto (espectador entra no meio da rolagem). Último beat cria dúvida narrativa (espectador precisa ver o próximo). Gere 3 variações de cada — não 1.

4. **Narração curta. Sempre.** Manhwa-recap não tem espaço pra parágrafos. Cada linha de narração deve ser ≤ 15 palavras. Cada linha de diálogo ≤ 12 palavras. Sub-frases pungentes batem mais que frases corretas.

5. **Tropes específicos de manhwa são features, não bugs.** Use sem vergonha: tela azul de sistema com texto; status visível como aura; flashbacks rápidos pra "vida anterior"; momento de subestimação seguido de virada; números/níveis visíveis; declarações internas em voz monológica do protagonista.

6. **System messages tem peso.** Quando o sistema do mundo "fala" (notificações de sistema, declarações cósmicas, anúncios de nível), use o campo `systemMessage` separado. Esse texto será renderizado como overlay visual sobre a cena. Mantenha conciso: "[REGRESSÃO ATIVADA — 10 ANOS NO PASSADO]" funciona melhor que parágrafos.

7. **Cliffhangers funcionam por dúvida, não por surpresa.** O espectador deve sair sabendo que ALGO específico está prestes a acontecer, sem saber exatamente o quê. "Quem está atrás dele?" > "Algo acontece."

# Estrutura de saída

Você sempre retorna a saída via tool use (submit_episode). Nenhum texto fora do tool call.

# Estilo de descrição visual

Cada beat tem um campo `imageDescription` que será usado pra gerar imagem por IA. Escreva descrições visuais ricas e específicas, pensando em composição manhwa vertical:
- Enquadramento: close-up dramático, plano médio, low-angle heroic, high-angle de poder
- Iluminação: rim light, neon, chuva refletindo, sombra dramática
- Composição: protagonista no terço inferior com céu vazio acima funciona muito bem em vertical
- Estilo: manhwa coreano, traço definido, sombras flat com gradientes, palette consistente com o tom da série

Exemplo bom: "Close-up baixo do protagonista, olhar gélido, sangue escorrendo do canto da boca, fundo de chamas desfocadas em laranja sobre céu noturno, rim light azul no cabelo molhado pela chuva."

Exemplo ruim: "Protagonista parece bravo."

# Dialogue voice direction

Quando houver diálogo, sempre incluir o campo `emotion` com direção específica pra atuação ("sussurro de desprezo", "raiva contida que explode na última palavra", "monótono e cansado", "alegria forçada cobrindo medo"). Isso vai pro ElevenLabs depois.

# Coerência narrativa

Você recebe contexto: a série completa (subgênero, setting, sistema de poder, protagonista, antagonista, tom), o arco completo (todos os 60 beats), e o beat específico do episódio sendo gerado. Use todo esse contexto. Episódio 12 conhece o que aconteceu até o ep 11 e onde a história vai. Nunca contradiga a série bible.

# Anti-padrões a evitar

- Narração descrevendo o que se vê na imagem ("Ele caminha pela rua chuvosa" enquanto a imagem mostra exatamente isso). Narração deve adicionar camada: pensamento interno, ironia, revelação.
- Beat sem progressão emocional ou narrativa.
- Diálogo expositivo ("Como você sabe, sou o filho do imperador..."). Reveal por ação, não por explicação.
- Cliffhanger genérico ("O que vai acontecer?"). Ser específico sobre a dúvida narrativa.
- Voz neutra. O protagonista tem perspectiva. Toda narração deve soar como ele (ou como narrador onisciente com voz definida pelo tom da série).
"""
```

E o user message é a montagem do contexto + a instrução específica, também em Python:

```python
# backend/api/prompts/episode_user.py

def build_episode_user_prompt(
    series: dict,
    arc: dict,
    episode_number: int,
    previous_episodes: list[dict],
    refinements: dict | None = None,
) -> str:
    arc_beat = next(
        (b for b in arc["beats"] if b["episodeNumber"] == episode_number),
        None
    )

    arc_summary = "\n".join(
        f"[{b['episodeNumber']:02d}] {b['function']} — {b['keyEvent']}"
        for b in arc["beats"]
    )

    prev_summary = "\n\n".join(
        f"Ep {ep['episodeNumber']}: " + " ".join(
            b.get("narration", "") for b in ep["beats"][:3] if b.get("narration")
        )
        for ep in previous_episodes
    )

    refinements_block = ""
    if refinements:
        parts = []
        if refinements.get("tone"):
            parts.append(f"Ajustar tom: {refinements['tone']}")
        if refinements.get("pacing"):
            parts.append(f"Ajustar pacing: {refinements['pacing']}")
        if refinements.get("focus"):
            parts.append(f"Foco adicional: {refinements['focus']}")
        if parts:
            refinements_block = "\n\n# Refinamentos solicitados pelo usuário\n" + "\n".join(parts)

    return f"""# Série
Título: {series['title']}
Subgênero: {series['subgenre']}
Setting: {series['setting']}
Sistema de poder: {series['powerSystem']}
Tom geral: {series['tone']}

# Protagonista
{series['protagonist']['name']} ({series['protagonist']['archetype']})
Background: {series['protagonist']['background']}
Motivação core: {series['protagonist']['coreMotivation']}

# Antagonista
{series['antagonist']['name']} ({series['antagonist']['type']})
Threat: {series['antagonist']['threat']}

# Temas
{", ".join(series['themes'])}

# Arco completo (resumido)
{arc_summary}

# Episódios anteriores (resumo dos últimos)
{prev_summary}

# EPISÓDIO A GERAR: {episode_number}
Função no arco: {arc_beat['function'] if arc_beat else 'N/A'}
Evento-chave: {arc_beat['keyEvent'] if arc_beat else 'N/A'}
Mood do episódio: {arc_beat['emotionalNote'] if arc_beat else 'N/A'}
{refinements_block}

Gere o episódio completo usando a tool submit_episode."""
```

Análogo pro arco: `backend/api/prompts/arc_system.py` + função `build_arc_user_prompt` que recebe apenas a `Series` e pede a tool `submit_arc`.

## 8. Endpoints FastAPI

Dois endpoints principais, ambos POST. Vivem em `backend/api/index.py` (ou em routers separados se preferir organização — Claude Code decide).

### POST /api/generate-arc

**Request body:** `GenerateArcRequest` (apenas a `Series`)
**Response:** `Arc` (com N beats correspondentes aos `series.totalEpisodes`)

Lógica:
1. Validar request via Pydantic
2. Montar system + user prompt
3. Chamar Anthropic API com tool `submit_arc` forçado
4. Extrair tool input da resposta
5. Validar contra schema `Arc`
6. Retornar como JSON (`response_model=Arc`)

### POST /api/generate-episode

**Request body:** `GenerateEpisodeRequest`
**Response:** `Episode`

Lógica análoga, tool `submit_episode` forçada.

### Cliente Anthropic (Python)

```python
# backend/api/anthropic_client.py

import os
from anthropic import Anthropic

_client = None

def get_client() -> Anthropic:
    global _client
    if _client is None:
        _client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    return _client

MODEL = "claude-opus-4-7"

EPISODE_TOOL = {
    "name": "submit_episode",
    "description": "Submit the structured episode with all beats and hooks.",
    "input_schema": {
        # JSON schema correspondente ao schema Pydantic Episode (sem id, seriesId, episodeNumber,
        # metadata.generatedAt, metadata.iterationCount — preenchidos pelo backend)
        # Claude Code: derivar este schema a partir do Pydantic model usando model_json_schema()
        # e remover os campos automáticos
        ...
    }
}

ARC_TOOL = {
    "name": "submit_arc",
    "description": "Submit the structured arc with all beats.",
    "input_schema": {
        # JSON schema correspondente a Arc (sem seriesId — preenchido pelo backend)
        ...
    }
}
```

Dica: gerar `input_schema` automaticamente a partir do Pydantic via `Episode.model_json_schema()` e remover propriedades automáticas. Isso mantém uma única fonte de verdade no backend.

### CORS

Já configurado via `ALLOWED_ORIGINS`. Quando rodar local, garantir que `http://localhost:5173` está na lista (já está). Backend não precisa de mudanças.

### Tratamento de erros

```python
from fastapi import HTTPException
from uuid import uuid4
from datetime import datetime
import anthropic
from pydantic import ValidationError

try:
    response = client.messages.create(...)
    tool_use_block = next(
        (b for b in response.content if b.type == "tool_use"),
        None,
    )
    if not tool_use_block:
        raise HTTPException(status_code=502, detail="Model did not return tool use")

    episode = Episode(**{
        **tool_use_block.input,
        "id": str(uuid4()),
        "seriesId": request.series.id,
        "episodeNumber": request.episode_number,
        "metadata": {
            **tool_use_block.input.get("metadata", {}),
            "generatedAt": datetime.utcnow().isoformat(),
            "iterationCount": 1,
        }
    })
    return episode

except anthropic.APIError as e:
    raise HTTPException(status_code=502, detail=f"Anthropic API error: {e}")
except ValidationError as e:
    raise HTTPException(status_code=502, detail=f"Schema validation failed: {e}")
```

## 9. Ordem de desenvolvimento

Construir nesta ordem, testando cada passo antes de avançar. Os passos no **backend** vêm primeiro porque o teste de qualidade do output mora lá.

### Backend (repo screenplay-agent-backend)

**1. Setup de dependências (~30min)**
- Adicionar ao `requirements.txt`: `anthropic`, `pydantic` (já vem com FastAPI), `python-dotenv` (dev)
- Garantir que `ANTHROPIC_API_KEY` está nas env vars da Vercel do backend

**2. Schemas Pydantic (~1h)**
- Criar `backend/api/schemas.py` com todos os modelos da seção 4

**3. System prompts (~30min)**
- Criar `backend/api/prompts/episode_system.py` (string da seção 7)
- Criar `backend/api/prompts/arc_system.py` (escrever análogo focado em arcos)
- Criar funções `build_episode_user_prompt` e `build_arc_user_prompt`

**4. Cliente Anthropic e tools (~2h)**
- Criar `backend/api/anthropic_client.py` com cliente e definições de tool (`EPISODE_TOOL`, `ARC_TOOL`)
- Derivar `input_schema` de cada tool a partir do Pydantic via `model_json_schema()`, ajustando campos automáticos
- Função utilitária `extract_tool_use(response, tool_name) -> dict`

**5. Endpoints (~2h)**
- Implementar `POST /api/generate-arc` em `backend/api/index.py` (ou router separado)
- Implementar `POST /api/generate-episode`
- Tratamento de erro completo (Anthropic API errors, schema validation, missing tool use)

**6. Teste cru via curl/httpie (~1h)**
- Criar um `tests/fixtures/series_mock.json` com uma série completa
- Rodar `curl -X POST http://localhost:8000/api/generate-arc -d @tests/fixtures/series_mock.json -H "Content-Type: application/json"`
- Validar output: arco bem estruturado, função e key event de cada beat coerentes
- Repetir pra `/api/generate-episode` com `arc_mock.json` + número do episódio
- **GATE:** o output gerado é qualidade aceitável? Se sim, prosseguir. Se não, iterar nos prompts antes de tocar no frontend.

### Frontend (repo screenplay-agent-frontend)

**7. Tipos e dados curados (~1h)**
- Criar `frontend/src/lib/types.ts` com todos os tipos da seção 4
- Criar `frontend/src/lib/options.ts` com todas as listas da seção 5

**8. Persistência local (~1h)**
- Criar `frontend/src/lib/storage/series.ts`, `arcs.ts`, `episodes.ts` com get/set/list em localStorage
- Hooks React (`useSeries`, `useArc`, `useEpisode`) abstraem localStorage

**9. Adaptar cliente HTTP (~30min)**
- Estender `frontend/src/lib/api.ts` (já existe) com funções `generateArc(series)` e `generateEpisode(series, arc, episodeNumber, previousEpisodes, refinements)`
- Manter o pattern existente do client (usar `VITE_API_BASE_URL`)

**10. Tela 1: Series Setup (~3h)**
- Componente em `frontend/src/components/SeriesSetup.tsx`
- Formulário com todas as opções curadas
- Validação básica (título obrigatório, pelo menos 2 temas, etc.)
- Botão "Gerar arco" chama `api.generateArc()` → salva no localStorage → navega pra Tela 2

**11. Tela 2: Arc Overview (~2h)**
- Componente em `frontend/src/components/ArcOverview.tsx`
- Render do arco como lista vertical
- Edição inline de cada beat
- Regenerar beat individual / a partir de um ponto
- Botão pra entrar em cada episódio

**12. Tela 3: Episode Studio (~6h)**
- Componente em `frontend/src/components/EpisodeStudio.tsx`
- Layout 3 colunas
- Render de beats em cards
- Regeneração de beat individual chama API passando beat index + refinements (a API regenera o episódio inteiro com refinements focados — v0 não tem regeneração granular real; é uma simplificação aceitável)
- Render de hooks com escolha ativa
- Exportar episódio como JSON download

### Streaming (depois do MVP funcional)

**13. Streaming via SSE (~4h)**
- Adicionar endpoint paralelo `POST /api/generate-episode/stream` no backend retornando `StreamingResponse(event_stream(), media_type="text/event-stream")`
- Backend usa `client.messages.stream(...)` da Anthropic, transforma deltas em eventos SSE
- Frontend consome via `fetch` + `ReadableStream` (não dá pra usar `EventSource` direto porque ele não suporta POST com body; alternativa é `fetch` + ler `response.body` chunk a chunk)
- Parser tolerante a JSON parcial no frontend (lib sugerida: `partial-json-parser` ou `best-effort-json-parser`)
- Render incremental dos beats à medida que JSON chega

### Polish (~variável)

**14. Refinos finais**
- Toasts pra erros (shadcn/ui toast)
- Loading states caprichados
- Atalhos de teclado (cmd+enter pra regenerar)
- Tema dark fixo

## 10. Critérios de sucesso

O Story Workshop funciona quando:

- [ ] Series Setup leva ≤ 3 minutos pra preencher
- [ ] Geração de arco completo de 60 episódios em ≤ 60 segundos
- [ ] Geração de um episódio em ≤ 15 segundos (≤ 5s com streaming)
- [ ] Regeneração de beat individual em ≤ 5 segundos
- [ ] Output JSON estruturado em 100% dos casos (zero malformed)
- [ ] Episódios mantêm consistência de personagem e mundo do beat 1 ao 60
- [ ] Hooks de saída de 80%+ dos episódios geram "preciso ver o próximo" no leitor humano

## 11. Notas pro Claude Code

- **API key vive apenas no backend.** Toda chamada à Anthropic API acontece em endpoints FastAPI. Frontend não importa o pacote `anthropic` em hipótese alguma. Frontend só fala com o próprio backend via `fetch`.
- **Repos separados, PRs separados.** Mudanças que tocam frontend + backend precisam de PRs coordenados. Quando alterar schema, alterar `src/lib/types.ts` e `api/schemas.py` no mesmo ciclo de trabalho.
- **camelCase no JSON wire format.** Frontend é camelCase nativo, backend usa `Field(alias=...)` em Pydantic pra serializar como camelCase. Internamente o Python usa snake_case.
- **Sem auth no v0.** Single user, persistência inteira em localStorage no frontend. Backend é stateless. Quando migrar pra multi-user, refatorar persistência e adicionar auth.
- **Tratamento de erro de IA:** Anthropic API pode falhar (rate limit, malformed tool input, timeout, missing tool use). Sempre wrap em try/catch no backend, retornar HTTPException estruturado, mostrar toast no frontend.
- **Tokens não são gratuitos.** Episode = ~3-5k tokens output. Arco = ~15-20k tokens output. Logar uso (`response.usage`) em desenvolvimento pra calibrar custos.
- **Não inventar features.** Se algo neste briefing está ambíguo, perguntar antes de implementar. Especialmente sobre UX e endpoints adicionais.
- **Tailwind v4 não tem `tailwind.config.js`.** Configuração de tema (cores, fontes, etc.) vai via CSS em `src/index.css` usando `@theme {...}`. Não tentar criar `tailwind.config.js` — vai ser ignorado.
- **shadcn/ui em Vite:** suportado oficialmente. Instalar componentes via `npx shadcn@latest add ...` (o projeto usa npm). Garantir que o `components.json` está configurado pra Vite + Tailwind v4 (a CLI detecta).
- **`api/index.py` é o entrypoint Vercel.** Toda rota FastAPI precisa estar acessível a partir do app exportado nesse arquivo. Routers separados são OK, mas precisam ser registrados via `app.include_router(...)` em `index.py`.

## 12. Próximo passo imediato

Comece pelo **backend, passos 1-6** da ordem de desenvolvimento — schemas, system prompts, cliente Anthropic, endpoints, teste cru via `curl` ou `httpie`.

Antes de tocar em uma linha do frontend, o teste é: rodar localmente `uvicorn api.index:app --reload`, fazer `curl -X POST http://localhost:8000/api/generate-arc -d @tests/fixtures/series_mock.json -H "Content-Type: application/json"`, e ver se sai um arco JSON bem estruturado e qualidade aceitável. Repetir pro `/api/generate-episode`.

Se isso funciona, todo o frontend é encanamento. Se não funciona, nenhuma UI bonita salva o produto.
