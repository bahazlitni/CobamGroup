import fs from "node:fs";
import path from "node:path";

type TextMark = "bold" | "italic";

type TextPart =
  | string
  | {
      text: string;
      marks: TextMark[];
    };

type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: Array<{ type: TextMark }>;
  text?: string;
};

type ArticleSeed = {
  title: string;
  slug: string;
  categorySlug: string;
  principalKeyword: string;
  secondaryKeywords: string[];
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  tags: string[];
  body: TiptapNode[];
};

const AUTHOR_PREFERENCE_ID = "cmnnfemzf00008wg9iwn6hacx";

const CATEGORY_SEEDS = [
  {
    name: "Conseils & Guides",
    slug: "conseils-guides",
    color: "#0a8dc1",
  },
  {
    name: "Matériaux de construction",
    slug: "materiaux-de-construction",
    color: "#ff8a00",
  },
  {
    name: "Carrelage & Revêtement",
    slug: "carrelage-revetement",
    color: "#00aeef",
  },
  {
    name: "Salle de bain",
    slug: "salle-de-bain",
    color: "#0a8dc1",
  },
  {
    name: "Étanchéité",
    slug: "etancheite",
    color: "#0c8ec2",
  },
  {
    name: "Produits techniques",
    slug: "produits-techniques",
    color: "#5e5e5e",
  },
] as const;

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;

    if (process.env[key]) {
      continue;
    }

    let value = rawValue.trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function marked(text: string, marks: TextMark[]): TextPart {
  return { text, marks };
}

function bold(text: string): TextPart {
  return marked(text, ["bold"]);
}

function italic(text: string): TextPart {
  return marked(text, ["italic"]);
}

function textNodes(parts: TextPart[]): TiptapNode[] {
  return parts.flatMap((part) => {
    if (typeof part === "string") {
      return part ? [{ type: "text", text: part }] : [];
    }

    return part.text
      ? [
          {
            type: "text",
            text: part.text,
            marks: part.marks.map((type) => ({ type })),
          },
        ]
      : [];
  });
}

function p(...parts: TextPart[]): TiptapNode {
  return {
    type: "paragraph",
    content: textNodes(parts),
  };
}

function h(level: 2 | 3 | 4, text: string): TiptapNode {
  return {
    type: "heading",
    attrs: { level },
    content: [{ type: "text", text }],
  };
}

function ul(items: TextPart[][]): TiptapNode {
  return {
    type: "bulletList",
    content: items.map((item) => ({
      type: "listItem",
      content: [p(...item)],
    })),
  };
}

function doc(content: TiptapNode[]) {
  return {
    type: "doc",
    content,
  };
}

function collectText(node: TiptapNode, parts: string[]) {
  if (node.type === "text" && node.text) {
    parts.push(node.text);
  }

  if (node.content) {
    for (const child of node.content) {
      collectText(child, parts);
    }
  }
}

function getPlainText(nodes: TiptapNode[]) {
  const parts: string[] = [];

  for (const node of nodes) {
    collectText(node, parts);
    parts.push("\n");
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function getWordCount(nodes: TiptapNode[]) {
  const text = getPlainText(nodes);

  return text ? text.split(/\s+/).length : 0;
}

const articleSeeds: ArticleSeed[] = [
  {
    title: "Étanchéité sous carrelage : réussir une pièce humide",
    slug: "etancheite-sous-carrelage-piece-humide",
    categorySlug: "etancheite",
    principalKeyword: "étanchéité sous carrelage",
    secondaryKeywords: [
      "joint d'étanchéité",
      "sikalastic",
      "sikafill",
      "ciment colle",
      "salle de bain",
    ],
    seoTitle: "Étanchéité sous carrelage : guide pratique",
    seoDescription:
      "Guide COBAM GROUP pour réussir l'étanchéité sous carrelage dans une salle de bain, une douche ou une pièce humide.",
    excerpt:
      "Avant le carrelage, l'étanchéité protège les murs, les sols et la durée de vie d'une pièce humide.",
    tags: [
      "etancheite_sous_carrelage",
      "joint_etancheite",
      "salle_de_bain",
      "ciment_colle",
      "piece_humide",
    ],
    body: [
      p(
        "Dans une salle de bain, une douche ou une buanderie, le carrelage ne suffit pas à protéger durablement le support. L'eau peut passer par les joints, les angles, les raccords et les points singuliers. C'est pour cela que ",
        bold("l'étanchéité sous carrelage"),
        " doit être pensée avant la pose, surtout dans les projets de rénovation où les supports ne sont pas toujours réguliers.",
      ),
      p(
        "En Tunisie, les pièces humides subissent souvent une utilisation intensive, des variations de température et parfois une ventilation limitée. Un système bien préparé évite les infiltrations, les taches, les odeurs et les reprises coûteuses. L'objectif n'est pas de multiplier les produits, mais de choisir la bonne solution au bon endroit.",
      ),
      h(2, "Comprendre les zones à risque"),
      p(
        "Les points les plus sensibles sont rarement au centre d'un carreau. Ils se trouvent dans les angles, autour des receveurs, près des évacuations et au contact entre deux matériaux. Un ",
        italic("joint d'étanchéité"),
        " adapté doit accompagner ces zones sans créer de surépaisseur gênante pour la finition.",
      ),
      ul([
        ["Autour d'une douche, traiter les murs exposés aux projections directes."],
        ["Au sol, soigner les pentes et les raccords avec l'évacuation."],
        ["Dans les angles, renforcer les jonctions avant la pose du revêtement."],
        ["Sur un ancien support, vérifier l'adhérence, la propreté et la stabilité."],
      ]),
      h(2, "Choisir les produits avec méthode"),
      p(
        "Les familles de produits comme les membranes liquides, les primaires, les mortiers adaptés ou certaines solutions de type Sikalastic et Sikafill répondent à des usages différents. Il ne faut pas les choisir uniquement par nom connu : il faut vérifier le support, l'exposition à l'eau et la compatibilité avec le ciment colle ou le mortier de pose.",
      ),
      h(3, "Le rôle du support"),
      p(
        "Un support poussiéreux, fissuré ou trop humide réduit l'efficacité du système. Avant toute application, il faut nettoyer, réparer et laisser sécher. Le primaire, quand il est nécessaire, sert à régulariser l'absorption et à améliorer l'accroche. Cette étape paraît discrète, mais elle conditionne le résultat final.",
      ),
      h(3, "La pose du carrelage"),
      p(
        "Après l'étanchéité, la pose doit rester cohérente : colle adaptée, double encollage si le format l'exige, joints réguliers et temps de séchage respectés. Un chantier pressé peut sembler gagné sur le moment, mais il augmente le risque de défauts visibles après quelques mois.",
      ),
      h(2, "Les erreurs fréquentes"),
      ul([
        ["Confondre un joint décoratif avec une vraie protection contre l'eau."],
        ["Oublier les angles et les traversées de tuyauterie."],
        ["Poser sur un support instable ou mal dépoussiéré."],
        ["Mélanger des produits sans vérifier leur compatibilité."],
      ]),
      h(2, "Se faire accompagner"),
      p(
        "Pour un projet de salle de bain à Djerba ou ailleurs en Tunisie, l'équipe COBAM GROUP peut orienter le choix des systèmes d'étanchéité, du carrelage et des produits de pose. Une visite en showroom permet de comparer les solutions et de préparer un chantier plus sûr, sans improviser sur les points techniques.",
      ),
    ],
  },
  {
    title: "Joint de carrelage : rôle, choix et entretien",
    slug: "joint-carrelage-role-choix-entretien",
    categorySlug: "carrelage-revetement",
    principalKeyword: "joint de carrelage",
    secondaryKeywords: [
      "joint carreau",
      "joint d'étanchéité",
      "ciment colle",
      "carrelage",
      "faïence",
    ],
    seoTitle: "Joint de carrelage : choix et entretien",
    seoDescription:
      "Comprendre le rôle du joint de carrelage, choisir la bonne largeur, la bonne couleur et assurer un entretien durable.",
    excerpt:
      "Le joint de carrelage influence l'esthétique, la durabilité et la facilité d'entretien d'un revêtement.",
    tags: [
      "joint_carrelage",
      "joint_carreau",
      "faience",
      "revetement_mural",
      "entretien_carrelage",
    ],
    body: [
      p(
        "Le ",
        bold("joint de carrelage"),
        " est souvent perçu comme un détail de finition. En réalité, il participe à la lecture visuelle du revêtement, absorbe de légères variations dimensionnelles et protège les interstices entre les carreaux. Sa largeur, sa couleur et sa qualité d'application changent fortement le rendu final.",
      ),
      p(
        "Dans une cuisine, une salle de bain ou un sol très fréquenté, le joint doit rester propre, stable et facile à entretenir. Un beau carreau posé avec un joint mal choisi peut perdre une grande partie de son élégance. À l'inverse, un joint cohérent donne une impression de travail soigné.",
      ),
      h(2, "À quoi sert vraiment le joint ?"),
      p(
        "Le joint ne remplace pas un système d'étanchéité, mais il limite l'encrassement des espaces et accompagne le revêtement dans son usage quotidien. Pour les pièces humides, on distingue le joint de finition entre carreaux et le ",
        italic("joint d'étanchéité"),
        " placé aux raccords sensibles, par exemple entre mur et receveur.",
      ),
      h(3, "Largeur et régularité"),
      p(
        "La largeur dépend du format, du type de carreau et de l'effet recherché. Les grands formats demandent souvent une pose plus précise. Les carreaux à bords rectifiés permettent des joints plus fins, mais le support doit être bien préparé et la pose très régulière.",
      ),
      ul([
        ["Un joint fin donne un rendu contemporain, discret et continu."],
        ["Un joint plus visible peut valoriser un carreau artisanal ou texturé."],
        ["La largeur doit rester constante pour éviter un aspect irrégulier."],
      ]),
      h(2, "Choisir la bonne couleur"),
      p(
        "Un ton proche du carrelage agrandit visuellement la surface. Un contraste assumé souligne le calepinage et peut donner du caractère à une faïence murale. Dans les zones exposées aux salissures, les tons trop clairs demandent davantage d'entretien.",
      ),
      h(3, "Cuisine, douche et sol"),
      p(
        "En cuisine, les projections imposent un joint facile à nettoyer. Dans la douche, l'humidité rend la préparation du support et la ventilation indispensables. Sur un sol, la résistance à l'abrasion devient importante, surtout dans les entrées, commerces ou espaces très utilisés.",
      ),
      h(2, "Entretien et durabilité"),
      p(
        "L'entretien doit rester simple : nettoyage régulier, produits non agressifs et contrôle des zones sensibles. Si un joint se fissure ou se décolle, il faut comprendre la cause avant de réparer : mouvement du support, mauvais dosage, humidité ou produit inadapté.",
      ),
      h(4, "Le conseil COBAM GROUP"),
      p(
        "Avant de choisir un joint, comparez le carreau, le ciment colle, l'usage de la pièce et la couleur de finition. Les équipes COBAM GROUP peuvent vous aider à composer une solution cohérente, du produit de pose au revêtement final.",
      ),
    ],
  },
  {
    title: "Carrelage en Tunisie : choisir selon chaque pièce",
    slug: "carrelage-tunisie-choisir-selon-piece",
    categorySlug: "carrelage-revetement",
    principalKeyword: "carrelage Tunisie",
    secondaryKeywords: [
      "carrelage",
      "parterre Tunisie",
      "revêtement sol",
      "revêtement mural",
      "grès cérame",
    ],
    seoTitle: "Carrelage Tunisie : choisir pièce par pièce",
    seoDescription:
      "Guide pratique pour choisir un carrelage en Tunisie selon l'usage, le style, l'entretien et les contraintes de chaque pièce.",
    excerpt:
      "Un bon carrelage se choisit selon la pièce, le passage, l'humidité et l'ambiance recherchée.",
    tags: [
      "carrelage_tunisie",
      "parterre_tunisie",
      "revetement_sol",
      "revetement_mural",
      "gres_cerame",
    ],
    body: [
      p(
        "Le ",
        bold("carrelage en Tunisie"),
        " répond à des usages très variés : sol de maison familiale, faïence de cuisine, salle de bain, terrasse, commerce ou espace professionnel. Le bon choix ne dépend pas seulement du motif. Il dépend de la résistance, de l'entretien, de la glissance, du format et de la lumière de la pièce.",
      ),
      p(
        "Pour éviter les regrets, il vaut mieux raisonner pièce par pièce. Un carrelage magnifique dans un showroom peut devenir moins pratique s'il est placé dans un espace trop humide, trop passant ou mal éclairé. Le choix doit donc associer goût personnel et logique d'usage.",
      ),
      h(2, "Les pièces à fort passage"),
      p(
        "Entrée, couloir, salon et local commercial demandent un revêtement robuste. Le grès cérame est souvent apprécié pour sa résistance et sa variété de finitions. Il peut imiter la pierre, le béton, le bois ou le marbre tout en restant plus simple à vivre au quotidien.",
      ),
      ul([
        ["Privilégier une surface facile à nettoyer."],
        ["Choisir un format adapté à la taille réelle de la pièce."],
        ["Vérifier la résistance à l'usure pour les zones très fréquentées."],
      ]),
      h(2, "Cuisine et salle de bain"),
      p(
        "Dans les pièces humides, la priorité va à la sécurité et à l'entretien. Une faïence murale peut apporter de la lumière et protéger les murs. Au sol, il faut penser adhérence, joints et compatibilité avec l'étanchéité. Le rendu doit être beau, mais aussi fiable.",
      ),
      h(3, "Le rôle du format"),
      p(
        "Les grands formats donnent un style contemporain et réduisent le nombre de joints visibles. Les petits formats facilitent parfois les découpes ou les formes particulières. Le choix dépend donc du support, du calepinage et de la précision souhaitée.",
      ),
      h(2, "Couleurs et ambiance"),
      p(
        "Les tons clairs agrandissent visuellement l'espace, tandis que les teintes minérales créent une atmosphère plus chaleureuse. Dans une maison à Djerba, les couleurs sable, pierre, blanc cassé ou gris doux s'intègrent souvent naturellement à l'architecture locale.",
      ),
      h(2, "Préparer son choix en showroom"),
      p(
        "Voir un carreau en vrai reste essentiel. La texture, la brillance et la nuance changent selon la lumière. Chez COBAM GROUP, vous pouvez comparer les collections, demander conseil sur les produits de pose et construire une sélection cohérente pour l'ensemble du projet.",
      ),
      p(
        italic("Astuce pratique :"),
        " apportez les dimensions, quelques photos de la pièce et une idée du mobilier prévu. Le conseil sera plus précis et le risque d'erreur plus faible.",
      ),
    ],
  },
  {
    title: "Faïence cuisine Tunisie : styles et conseils pratiques",
    slug: "faience-cuisine-tunisie-styles-conseils",
    categorySlug: "carrelage-revetement",
    principalKeyword: "faïence cuisine Tunisie",
    secondaryKeywords: [
      "faïence cuisine",
      "faïence Tunisie",
      "carrelage mural cuisine",
      "crédence cuisine",
      "revêtement mural",
    ],
    seoTitle: "Faïence cuisine Tunisie : bien choisir",
    seoDescription:
      "Conseils pour choisir une faïence cuisine en Tunisie : style, format, entretien, crédence et harmonie avec le plan de travail.",
    excerpt:
      "La faïence de cuisine protège le mur, structure la crédence et donne du caractère à toute la pièce.",
    tags: [
      "faience_cuisine_tunisie",
      "faience_cuisine",
      "credence_cuisine",
      "carrelage_mural",
      "revetement_mural",
    ],
    body: [
      p(
        "La ",
        bold("faïence cuisine Tunisie"),
        " est à la fois un choix décoratif et une protection utile. Elle habille la crédence, protège le mur des éclaboussures et facilite le nettoyage autour du plan de travail. Dans une cuisine ouverte, elle participe aussi à l'identité visuelle de tout l'espace de vie.",
      ),
      p(
        "Le marché propose de nombreux styles : effet zellige, pierre, marbre, béton, carreau métro, motifs graphiques ou surfaces très sobres. Pour choisir sans se perdre, il faut partir de la cuisine existante ou du projet global : meubles, plan de travail, lumière, sol et robinetterie.",
      ),
      h(2, "Définir l'ambiance avant le format"),
      p(
        "Une cuisine lumineuse accepte facilement des tons doux, blancs ou beiges. Une cuisine plus contemporaine peut recevoir une faïence foncée, texturée ou contrastée. Le format influence ensuite la perception : petit format vivant, grand format plus uniforme, décor ponctuel plus expressif.",
      ),
      ul([
        ["Pour une ambiance discrète, choisir une teinte proche du plan de travail."],
        ["Pour donner du relief, utiliser un motif sur une zone limitée."],
        ["Pour agrandir visuellement, privilégier les surfaces claires et continues."],
      ]),
      h(2, "Penser entretien et usage quotidien"),
      p(
        "La cuisine est exposée à la graisse, à l'eau et aux produits de nettoyage. Une faïence trop poreuse ou un joint trop clair peut demander plus d'attention. Le choix du joint, de la finition et de la hauteur de crédence doit donc être pratique, pas seulement esthétique.",
      ),
      h(3, "Crédence complète ou bande décorative ?"),
      p(
        "Une crédence complète protège mieux et donne une finition nette. Une bande décorative peut suffire si le mur est peu exposé, mais elle doit rester cohérente avec la hotte, les prises et les meubles hauts. Les découpes doivent être anticipées pour éviter un rendu improvisé.",
      ),
      h(2, "Associer sol et mur"),
      p(
        "Si le sol est déjà très marqué, la faïence doit respirer. Si le sol est neutre, le mur peut devenir le point fort. L'erreur courante consiste à choisir chaque élément séparément. Une cuisine réussie vient plutôt d'un équilibre entre les matières.",
      ),
      h(2, "Conseil showroom"),
      p(
        "Chez COBAM GROUP, vous pouvez rapprocher les échantillons de faïence avec des idées de sol, de meuble ou de plan de travail. Cette comparaison concrète aide à valider les nuances et à choisir une solution élégante, facile à vivre et adaptée au projet.",
      ),
      p(
        italic("Bon réflexe :"),
        " demandez aussi les produits de pose recommandés afin que la finition murale soit durable et régulière.",
      ),
    ],
  },
  {
    title: "Grès cérame et parterre : sols solides et élégants",
    slug: "gres-cerame-parterre-sols-solides-elegants",
    categorySlug: "carrelage-revetement",
    principalKeyword: "parterre Tunisie",
    secondaryKeywords: [
      "grès cérame",
      "parterre",
      "prix m2 parterre Tunisie",
      "carrelage sol",
      "revêtement de sol",
    ],
    seoTitle: "Parterre Tunisie : grès cérame et sols durables",
    seoDescription:
      "Comment choisir un parterre en Tunisie : grès cérame, format, finition, entretien et cohérence avec l'usage de la pièce.",
    excerpt:
      "Le parterre doit supporter le passage, rester facile à nettoyer et donner le ton esthétique de la maison.",
    tags: ["parterre_tunisie", "gres_cerame", "carrelage_sol", "revetement_sol", "sol_durable"],
    body: [
      p(
        "Le mot ",
        bold("parterre"),
        " désigne souvent, dans l'usage courant en Tunisie, le revêtement de sol carrelé. Son choix engage toute l'ambiance d'une maison : luminosité, sensation d'espace, facilité d'entretien et résistance au passage. Il mérite donc plus qu'une décision rapide sur catalogue.",
      ),
      p(
        "Le grès cérame occupe une place importante parce qu'il réunit robustesse, variété de formats et nombreux effets de matière. Il peut accompagner un intérieur moderne, une maison familiale, un commerce ou une terrasse couverte, à condition de choisir la finition adaptée.",
      ),
      h(2, "Pourquoi le grès cérame est apprécié"),
      p(
        "Le grès cérame est dense, résistant et peu absorbant. Il permet d'obtenir des effets bois, pierre, béton ou marbre sans les contraintes d'entretien de certaines matières naturelles. Cela en fait une solution polyvalente pour les sols fortement sollicités.",
      ),
      ul([
        ["Bonne résistance au passage dans les pièces de vie."],
        ["Entretien simple avec des gestes réguliers."],
        ["Large choix de formats pour adapter le style à la surface."],
        ["Rendu contemporain possible avec des joints discrets."],
      ]),
      h(2, "Format, couleur et lumière"),
      p(
        "Un grand format agrandit visuellement l'espace, mais demande une pose précise. Un format moyen reste très polyvalent. Côté couleur, les beiges, gris chauds et tons pierre sont faciles à associer. Les surfaces très brillantes apportent de la lumière, mais montrent parfois davantage les traces.",
      ),
      h(3, "Penser au prix sans commencer par lui"),
      p(
        "Les recherches autour du prix au mètre carré sont naturelles, mais le prix seul ne suffit pas. Il faut intégrer la qualité du carreau, la préparation du support, la colle, les joints, les découpes et la main-d'œuvre. Un sol durable se juge sur plusieurs années.",
      ),
      h(2, "Éviter les ruptures visuelles"),
      p(
        "Dans un projet complet, il est utile de réfléchir au passage entre salon, cuisine, couloir et terrasse. Un même sol peut créer une continuité élégante. À l'inverse, changer trop souvent de motif fragmente l'espace et complique la décoration.",
      ),
      h(2, "Préparer son choix avec COBAM GROUP"),
      p(
        "En showroom, les conseillers COBAM GROUP peuvent aider à comparer les effets, les formats et les finitions selon l'usage réel. Une sélection bien préparée permet d'obtenir un sol solide, cohérent et agréable à vivre au quotidien.",
      ),
      p(
        italic("Conseil simple :"),
        " regardez toujours un carreau à plat et à la lumière naturelle avant de valider la nuance définitive.",
      ),
    ],
  },
  {
    title: "Salle de bain moderne : composer un espace cohérent",
    slug: "salle-de-bain-moderne-espace-coherent",
    categorySlug: "salle-de-bain",
    principalKeyword: "salle de bain",
    secondaryKeywords: [
      "lavabo salle de bain",
      "vasque salle de bain",
      "douche",
      "faïence salle de bain",
      "meuble salle de bain",
    ],
    seoTitle: "Salle de bain moderne : choix et harmonie",
    seoDescription:
      "Composer une salle de bain moderne avec lavabo, vasque, douche, meuble, faïence et robinetterie adaptés au quotidien.",
    excerpt:
      "Une salle de bain réussie associe esthétique, circulation, entretien et choix cohérent des équipements.",
    tags: ["salle_de_bain", "lavabo_salle_de_bain", "vasque", "douche", "meuble_salle_de_bain"],
    body: [
      p(
        "Une ",
        bold("salle de bain"),
        " moderne ne se résume pas à une belle vasque ou à une robinetterie tendance. C'est un ensemble : circulation, lumière, rangements, revêtements, douche, lavabo et facilité d'entretien. Quand ces éléments dialoguent, la pièce devient plus agréable et plus durable.",
      ),
      p(
        "Les projets en Tunisie combinent souvent contraintes d'espace, besoin de ventilation et envie d'un rendu élégant. Le défi consiste à obtenir une salle de bain pratique sans la surcharger. Chaque choix doit servir l'usage quotidien autant que l'esthétique.",
      ),
      h(2, "Commencer par le plan"),
      p(
        "Avant de choisir les produits, il faut observer les dimensions, les arrivées d'eau, l'évacuation et l'ouverture de la porte. Une douche confortable, un meuble bien placé et un passage dégagé valent mieux qu'une accumulation d'équipements trop grands.",
      ),
      ul([
        ["Prévoir un accès simple à la douche et au lavabo."],
        ["Garder des zones faciles à nettoyer autour des points d'eau."],
        ["Adapter la taille du meuble à la largeur disponible."],
        ["Éviter les angles morts où l'humidité s'installe."],
      ]),
      h(2, "Lavabo, vasque ou meuble complet ?"),
      p(
        "Le lavabo reste pratique et sobre. La vasque apporte une signature plus décorative. Le meuble de salle de bain ajoute du rangement et cache certains raccordements. Le bon choix dépend du style, mais aussi du nombre d'utilisateurs et du besoin de stockage.",
      ),
      h(3, "La douche comme point central"),
      p(
        "Une douche bien pensée améliore fortement le confort. Le choix du receveur, de la paroi, du mitigeur et du carrelage doit être cohérent avec l'étanchéité. Un beau design ne compense pas une pente mal préparée ou un entretien compliqué.",
      ),
      h(2, "Matières et couleurs"),
      p(
        "La faïence claire agrandit visuellement, les tons minéraux créent une ambiance apaisante et les détails noirs ou chromés structurent la pièce. Il vaut mieux choisir une palette courte, puis la répéter dans les accessoires.",
      ),
      h(2, "Accompagnement COBAM GROUP"),
      p(
        "COBAM GROUP accompagne les particuliers et professionnels dans la composition des salles de bain : revêtements, sanitaires, meubles et robinetterie. En showroom à Djerba, vous pouvez confronter les matières et construire une sélection adaptée à votre espace.",
      ),
      p(
        italic("Bon repère :"),
        " une salle de bain moderne réussie est celle que l'on apprécie encore après plusieurs années d'utilisation quotidienne.",
      ),
    ],
  },
  {
    title: "Mitigeur ou robinet : bien choisir sans se tromper",
    slug: "mitigeur-robinet-bien-choisir",
    categorySlug: "salle-de-bain",
    principalKeyword: "mitigeur",
    secondaryKeywords: ["robinet", "robinetterie", "robinet cuisine", "robinet toilette", "lavabo"],
    seoTitle: "Mitigeur ou robinet : guide de choix",
    seoDescription:
      "Guide pour choisir un mitigeur ou un robinet selon l'usage, la hauteur, la finition, le lavabo, la cuisine ou la douche.",
    excerpt:
      "Le bon mitigeur améliore le confort, l'entretien et l'harmonie entre lavabo, cuisine et salle de bain.",
    tags: ["mitigeur", "robinet", "robinetterie", "robinet_cuisine", "lavabo"],
    body: [
      p(
        "Le choix entre ",
        bold("mitigeur"),
        " et robinet dépend de l'usage, du point d'eau, du style et du confort attendu. Dans une salle de bain, une cuisine ou des toilettes, la robinetterie est manipulée tous les jours. Elle doit donc être agréable, fiable et cohérente avec le reste de l'installation.",
      ),
      p(
        "On remarque souvent la finition en premier : chrome, noir, brossé, doré ou aspect inox. Pourtant, la hauteur du bec, la profondeur, la compatibilité avec la vasque et la facilité d'entretien comptent tout autant. Un beau robinet mal dimensionné peut éclabousser ou gêner l'utilisation.",
      ),
      h(2, "Comprendre les usages"),
      p(
        "Pour un lavabo, le bec doit tomber naturellement vers le centre de la cuve. Pour une vasque à poser, il faut souvent un mitigeur plus haut ou mural. En cuisine, la mobilité, la hauteur et parfois la douchette deviennent importantes pour laver les grands récipients.",
      ),
      ul([
        ["Lavabo compact : privilégier un bec court et facile à nettoyer."],
        ["Vasque haute : vérifier la hauteur totale et la portée du bec."],
        ["Cuisine : penser au dégagement sous le bec et aux gestes quotidiens."],
        ["Douche : associer mitigeur, flexible, douchette et confort de réglage."],
      ]),
      h(2, "Finition et cohérence visuelle"),
      p(
        "La finition doit dialoguer avec les accessoires, la paroi, le miroir et les poignées du meuble. Le chrome reste lumineux et polyvalent. Les finitions noires ou dorées donnent du caractère, mais demandent une sélection plus attentive des autres éléments.",
      ),
      h(3, "Entretien au quotidien"),
      p(
        "Dans les régions où l'eau laisse des traces, l'entretien régulier est essentiel. Les produits trop agressifs peuvent abîmer certaines finitions. Il vaut mieux nettoyer souvent avec des gestes doux que corriger tardivement des dépôts installés.",
      ),
      h(2, "Ne pas oublier la technique"),
      p(
        "Avant l'achat, il faut vérifier les arrivées d'eau, le type de pose, la pression disponible et l'espace sous le plan. Pour une rénovation, les contraintes existantes orientent parfois le choix plus que le style souhaité.",
      ),
      h(2, "Le conseil COBAM GROUP"),
      p(
        "Les conseillers COBAM GROUP peuvent vous aider à associer robinetterie, lavabo, vasque, douche et revêtements. Cette approche globale évite les incohérences et permet de créer une salle de bain ou une cuisine plus confortable au quotidien.",
      ),
      p(
        italic("À retenir :"),
        " choisissez d'abord la bonne ergonomie, puis la finition. Le design fonctionne mieux quand l'usage est déjà juste.",
      ),
    ],
  },
  {
    title: "Panneau sandwich : usages et critères de choix",
    slug: "panneau-sandwich-usages-criteres-choix",
    categorySlug: "materiaux-de-construction",
    principalKeyword: "panneau sandwich",
    secondaryKeywords: [
      "prix panneau sandwich Tunisie",
      "panneau sandwich prix m2",
      "bardage",
      "toiture",
      "matériaux de construction",
    ],
    seoTitle: "Panneau sandwich : usages et critères",
    seoDescription:
      "Comprendre les usages du panneau sandwich pour toiture, bardage ou locaux techniques, et les critères à vérifier avant achat.",
    excerpt:
      "Le panneau sandwich est apprécié pour couvrir, isoler ou fermer rapidement certains espaces techniques.",
    tags: ["panneau_sandwich", "bardage", "toiture", "materiaux_construction", "isolation"],
    body: [
      p(
        "Le ",
        bold("panneau sandwich"),
        " est utilisé dans de nombreux projets de construction, d'extension ou d'aménagement technique. Il associe généralement deux parements et une âme isolante, ce qui permet de créer rapidement une couverture, un bardage ou une séparation performante selon les besoins du chantier.",
      ),
      p(
        "Les recherches autour du prix sont fréquentes, mais le choix ne doit pas commencer uniquement par le montant au mètre carré. L'épaisseur, la portée, le type de parement, l'exposition au vent, la finition et la mise en œuvre changent fortement la pertinence du produit.",
      ),
      h(2, "Où utiliser un panneau sandwich ?"),
      p(
        "On le retrouve sur des toitures légères, des locaux de stockage, des ateliers, des abris, des extensions et certains espaces professionnels. Il peut aussi servir en bardage lorsqu'on recherche une solution rapide, propre et relativement isolante.",
      ),
      ul([
        ["Toiture : vérifier les pentes, fixations et évacuations d'eau."],
        ["Bardage : choisir une finition adaptée à l'exposition extérieure."],
        ["Local technique : équilibrer isolation, résistance et facilité de pose."],
        ["Rénovation : contrôler la structure existante avant de charger."],
      ]),
      h(2, "Les critères à comparer"),
      p(
        "L'épaisseur influence l'isolation et la rigidité. Le type de tôle ou de parement joue sur la résistance et l'aspect. Les accessoires de fixation, rives, faîtières et joints doivent être prévus dès le départ pour éviter les improvisations sur chantier.",
      ),
      h(3, "La pose compte autant que le produit"),
      p(
        "Un panneau de bonne qualité peut perdre son efficacité si les fixations sont mal placées ou si les recouvrements sont négligés. Les points d'eau, les coupes et les jonctions doivent être traités avec soin pour préserver l'étanchéité de l'ensemble.",
      ),
      h(2, "Budget et durabilité"),
      p(
        "Comparer le prix du panneau sans inclure les accessoires, la livraison, la structure et la main-d'œuvre donne une vision incomplète. Pour un projet durable, il faut regarder le coût total et la compatibilité avec l'usage prévu.",
      ),
      h(2, "Préparer son chantier"),
      p(
        "COBAM GROUP peut accompagner les professionnels et particuliers dans l'identification des matériaux, accessoires et contraintes à anticiper. Une discussion technique avant achat permet de choisir une solution adaptée plutôt qu'un produit seulement attractif sur le papier.",
      ),
      p(
        italic("Conseil chantier :"),
        " arrivez avec les dimensions, l'usage du local et quelques photos de la structure. Le conseil sera plus concret.",
      ),
    ],
  },
  {
    title: "Quincaillerie de chantier : les essentiels à prévoir",
    slug: "quincaillerie-chantier-essentiels-prevoir",
    categorySlug: "produits-techniques",
    principalKeyword: "quincaillerie",
    secondaryKeywords: [
      "quincaillerie Tunisie",
      "poignée porte",
      "porte coulissante",
      "fixations",
      "accessoires chantier",
    ],
    seoTitle: "Quincaillerie de chantier : essentiels",
    seoDescription:
      "Liste pratique des essentiels de quincaillerie à prévoir pour portes, fixations, accessoires, finitions et organisation de chantier.",
    excerpt:
      "La quincaillerie paraît secondaire, mais elle conditionne la finition, la sécurité et la fluidité du chantier.",
    tags: [
      "quincaillerie",
      "quincaillerie_tunisie",
      "poignee_porte",
      "porte_coulissante",
      "accessoires_chantier",
    ],
    body: [
      p(
        "La ",
        bold("quincaillerie"),
        " regroupe une grande variété d'éléments : poignées, serrures, charnières, rails, fixations, accessoires de pose, petits consommables et solutions de finition. Sur un chantier, ces produits semblent parfois secondaires, mais ils évitent de nombreux blocages au moment de l'installation.",
      ),
      p(
        "Une porte sans les bonnes paumelles, une poignée mal adaptée ou une fixation absente peut retarder toute une journée de travail. Prévoir la quincaillerie tôt permet de gagner du temps, de réduire les allers-retours et de mieux maîtriser la qualité finale.",
      ),
      h(2, "Les familles à identifier"),
      p(
        "Il est utile de classer les besoins par usage : menuiserie, fixation, sécurité, finition et réglage. Cette méthode évite de mélanger les produits et facilite la préparation des achats avant intervention.",
      ),
      ul([
        ["Portes : poignées, serrures, cylindres, paumelles et butées."],
        ["Portes coulissantes : rails, guides, roulettes et accessoires de réglage."],
        ["Fixations : vis, chevilles, équerres et supports selon le support."],
        ["Finitions : caches, joints, profils et petits accessoires visibles."],
      ]),
      h(2, "Adapter la quincaillerie au support"),
      p(
        "La même fixation ne convient pas à un mur plein, une cloison légère, un support métallique ou une plaque de plâtre. Avant de choisir, il faut connaître la nature du support, la charge à reprendre et l'environnement : intérieur, extérieur, humidité ou usage intensif.",
      ),
      h(3, "La cohérence esthétique"),
      p(
        "Les poignées, charnières visibles et accessoires doivent rester cohérents avec le style de la porte, du meuble ou de la pièce. Une finition noire, chromée ou inox change immédiatement la perception d'un ensemble. La quincaillerie participe donc aussi au design.",
      ),
      h(2, "Préparer une liste claire"),
      p(
        "Pour un chantier complet, il vaut mieux créer une liste par pièce et par lot. Cette organisation limite les oublis, surtout lorsque plusieurs corps de métier interviennent. Les références doivent être validées avant la pose pour éviter les incompatibilités.",
      ),
      h(2, "Se faire conseiller"),
      p(
        "COBAM GROUP accompagne les clients dans le choix des accessoires et produits techniques adaptés aux projets de construction ou de rénovation. En magasin, une discussion avec les dimensions, photos et contraintes du chantier permet de sélectionner plus efficacement.",
      ),
      p(
        italic("Le bon réflexe :"),
        " ne laissez pas la quincaillerie pour la fin. Elle transforme souvent une installation correcte en finition vraiment propre.",
      ),
    ],
  },
  {
    title: "Placo et faux plafond : réussir les finitions intérieures",
    slug: "placo-faux-plafond-finitions-interieures",
    categorySlug: "materiaux-de-construction",
    principalKeyword: "placoplatre",
    secondaryKeywords: [
      "placoplatre Tunisie",
      "faux plafond",
      "plâtre",
      "prix m2 placoplatre Tunisie",
      "cloison sèche",
    ],
    seoTitle: "Placo et faux plafond : guide pratique",
    seoDescription:
      "Conseils pour réussir placo, plaques de plâtre et faux plafond : support, ossature, joints, isolation et finition intérieure.",
    excerpt:
      "Le placo et le faux plafond structurent l'intérieur, cachent les réseaux et préparent une finition propre.",
    tags: ["placoplatre", "faux_plafond", "platre", "cloison_seche", "finitions_interieures"],
    body: [
      p(
        "Le ",
        bold("placoplatre"),
        " et le faux plafond sont devenus incontournables dans les travaux intérieurs. Ils permettent de créer des cloisons, d'intégrer l'éclairage, de cacher certains réseaux, d'améliorer l'isolation et de préparer des surfaces prêtes à peindre ou à décorer.",
      ),
      p(
        "Le résultat final dépend autant de la plaque que de l'ossature, des fixations, du traitement des joints et de la compétence de pose. Un plafond parfaitement aligné ou une cloison nette donne immédiatement une impression de chantier maîtrisé.",
      ),
      h(2, "Bien définir l'usage"),
      p(
        "Une cloison de séparation, un doublage, un plafond décoratif ou un habillage technique ne demandent pas exactement les mêmes produits. Il faut tenir compte de l'humidité, de l'isolation souhaitée, des charges à fixer et des réseaux à intégrer.",
      ),
      ul([
        ["Pièce sèche : plaques standards et finition soignée."],
        ["Pièce humide : vérifier les plaques et traitements adaptés."],
        ["Plafond : contrôler les suspentes, niveaux et points lumineux."],
        ["Cloison : anticiper portes, meubles suspendus et renforts."],
      ]),
      h(2, "Pourquoi le prix au mètre carré varie"),
      p(
        "Les recherches sur le prix du placoplatre au mètre carré sont utiles, mais elles ne racontent pas tout. Le budget dépend de la plaque, de l'ossature, des bandes, enduits, isolants, accessoires, hauteurs, découpes et complexité du chantier.",
      ),
      h(3, "Les joints font la différence"),
      p(
        "Un joint mal traité se voit après peinture. Les bandes, les temps de séchage et le ponçage doivent être respectés. Cette étape demande de la patience, car la lumière rasante révèle très vite les défauts sur les plafonds et grands murs.",
      ),
      h(2, "Coordonner avec les autres lots"),
      p(
        "Électricité, climatisation, plomberie et menuiserie doivent être anticipées avant fermeture. Un faux plafond posé trop tôt peut obliger à rouvrir. La coordination évite les reprises et améliore la qualité finale.",
      ),
      h(2, "Préparer avec COBAM GROUP"),
      p(
        "COBAM GROUP peut orienter le choix des plaques, accessoires, produits de jointoiement et solutions complémentaires selon votre chantier. Avec un plan ou quelques photos, l'équipe peut aider à établir une liste plus fiable et éviter les achats incomplets.",
      ),
      p(
        italic("À retenir :"),
        " un intérieur propre commence par une structure précise, des joints bien traités et des matériaux adaptés à la pièce.",
      ),
    ],
  },
  {
    title: "Ciment-colle carrelage : choisir le bon produit",
    slug: "ciment-colle-carrelage-choisir-bon-produit",
    categorySlug: "produits-techniques",
    principalKeyword: "ciment colle",
    secondaryKeywords: [
      "ciment colle Tunisie",
      "colle carrelage",
      "grès cérame",
      "faïence",
      "produits de pose",
    ],
    seoTitle: "Ciment-colle carrelage : bien choisir",
    seoDescription:
      "Comprendre comment choisir un ciment-colle pour carrelage selon support, format, usage intérieur ou extérieur et type de revêtement.",
    excerpt:
      "Le ciment-colle relie le support au carrelage : son choix influence directement la tenue du revêtement.",
    tags: ["ciment_colle", "colle_carrelage", "produits_pose", "gres_cerame", "faience"],
    body: [
      p(
        "Le ",
        bold("ciment-colle"),
        " est l'un des produits les plus importants d'un chantier carrelage. Pourtant, il est parfois choisi trop rapidement. Sa mission est simple à comprendre mais exigeante : assurer l'adhérence entre le support et le carreau, malgré les contraintes d'usage, d'humidité, de format et de température.",
      ),
      p(
        "Un produit de pose inadapté peut provoquer des carreaux qui sonnent creux, des décollements, des fissures ou une usure prématurée. Le bon choix dépend du support, du type de carreau, de la taille, de l'emplacement et du temps de mise en œuvre.",
      ),
      h(2, "Support et préparation"),
      p(
        "Avant de parler de colle, il faut parler du support. Il doit être propre, stable, plan et compatible. Un sol poussiéreux, gras ou friable empêche l'adhérence. Dans une rénovation, cette étape demande encore plus d'attention car les anciennes surfaces réservent parfois des surprises.",
      ),
      ul([
        ["Contrôler la planéité avant la pose."],
        ["Dépoussiérer et réparer les zones fragiles."],
        ["Utiliser un primaire si le support l'exige."],
        ["Respecter les temps ouverts et les dosages indiqués."],
      ]),
      h(2, "Format et type de carreau"),
      p(
        "Les grands formats, le grès cérame dense et certaines poses murales imposent plus d'exigence. Le double encollage peut être nécessaire selon le format et l'usage. Une faïence légère en mur intérieur ne demande pas la même approche qu'un sol extérieur exposé.",
      ),
      h(3, "Intérieur, extérieur et pièce humide"),
      p(
        "À l'extérieur, les variations de température et l'eau imposent un système cohérent. En salle de bain, le ciment-colle s'inscrit dans une chaîne complète avec l'étanchéité, les joints et la ventilation. Chaque produit doit être compatible avec les autres.",
      ),
      h(2, "Ne pas choisir seulement au prix"),
      p(
        "Comparer les prix est normal, mais une colle moins adaptée peut coûter plus cher si elle entraîne une reprise. Le bon raisonnement consiste à mesurer le risque : support difficile, grand format, humidité ou passage intensif justifient souvent une solution plus technique.",
      ),
      h(2, "L'accompagnement utile"),
      p(
        "Chez COBAM GROUP, les conseillers peuvent orienter le choix des produits de pose selon le carreau, le support et la destination. Cette cohérence entre carrelage, colle et joint donne un chantier plus fiable et une finition plus durable.",
      ),
      p(
        italic("Avant d'acheter :"),
        " indiquez le format du carreau, le type de support et la pièce concernée. Ces trois informations changent le conseil.",
      ),
    ],
  },
  {
    title: "Lavabo et vasque : bien choisir pour la salle de bain",
    slug: "lavabo-vasque-bien-choisir-salle-de-bain",
    categorySlug: "salle-de-bain",
    principalKeyword: "lavabo salle de bain",
    secondaryKeywords: [
      "lavabo",
      "vasque salle de bain",
      "meuble salle de bain",
      "mitigeur",
      "robinetterie",
    ],
    seoTitle: "Lavabo et vasque : guide salle de bain",
    seoDescription:
      "Comment choisir lavabo, vasque, meuble et robinetterie selon l'espace, l'usage quotidien et le style de la salle de bain.",
    excerpt:
      "Lavabo ou vasque : le choix dépend de l'espace, du rangement, du style et du confort d'utilisation.",
    tags: ["lavabo_salle_de_bain", "vasque", "meuble_salle_de_bain", "mitigeur", "robinetterie"],
    body: [
      p(
        "Le ",
        bold("lavabo de salle de bain"),
        " et la vasque sont au cœur des gestes quotidiens. On les utilise le matin, le soir, parfois à plusieurs personnes. Leur choix doit donc combiner esthétique, ergonomie, rangement et facilité de nettoyage.",
      ),
      p(
        "Dans une petite salle de bain, quelques centimètres changent tout. Dans une grande pièce, le risque inverse existe : choisir un élément trop discret qui ne structure pas l'espace. Le bon équilibre dépend du plan, du meuble, du miroir et de la robinetterie.",
      ),
      h(2, "Lavabo classique ou vasque à poser ?"),
      p(
        "Le lavabo classique reste simple, pratique et souvent compact. La vasque à poser offre un rendu plus décoratif et contemporain. Elle demande toutefois de bien choisir la hauteur du meuble et du mitigeur pour éviter les éclaboussures ou une position inconfortable.",
      ),
      ul([
        ["Lavabo suspendu : idéal pour alléger visuellement une petite pièce."],
        ["Vasque à poser : élégante, mais à associer au bon meuble."],
        ["Plan vasque : pratique pour une finition intégrée et facile à vivre."],
        ["Double vasque : utile si deux personnes utilisent souvent la pièce ensemble."],
      ]),
      h(2, "Le meuble change l'usage"),
      p(
        "Un meuble bien dimensionné ajoute du rangement sans encombrer. Tiroirs, niches ou portes doivent correspondre aux habitudes de la famille. Il faut aussi prévoir les siphons, arrivées d'eau et évacuations pour ne pas perdre trop de volume utile.",
      ),
      h(3, "Robinetterie et hauteur"),
      p(
        "Le mitigeur doit être choisi avec la cuve. Un bec trop court mouille le bord, un bec trop haut peut éclabousser, un robinet mural demande une préparation technique précise. L'ensemble doit être testé sur plan avant validation.",
      ),
      h(2, "Matières et entretien"),
      p(
        "Les surfaces blanches restent faciles à intégrer, tandis que les finitions colorées ou texturées donnent une personnalité forte. Pour l'entretien, les formes simples et les surfaces accessibles sont souvent les plus confortables au quotidien.",
      ),
      h(2, "Choisir avec COBAM GROUP"),
      p(
        "COBAM GROUP propose une approche complète : lavabo, vasque, meuble, mitigeur, miroir et revêtements. En showroom, vous pouvez comparer les volumes et construire une salle de bain cohérente, adaptée à votre espace et à votre usage réel.",
      ),
      p(
        italic("Conseil pratique :"),
        " venez avec la largeur disponible, la position des arrivées d'eau et une photo de la pièce pour un choix plus précis.",
      ),
    ],
  },
].slice(0, 10);

const ARTICLE_EXPANSIONS: Record<string, TiptapNode[]> = {
  "etancheite-sous-carrelage-piece-humide": [
    h(2, "Les vérifications avant de carreler"),
    p(
      "Avant de recouvrir l'étanchéité, prenez le temps de contrôler les détails invisibles après la pose. Les angles doivent être continus, les bandes correctement noyées et les temps de séchage respectés. Cette vérification est simple, mais elle évite de découvrir trop tard une zone oubliée derrière la faïence.",
    ),
    p(
      "Il est aussi utile de photographier les étapes techniques du chantier. Ces images servent de mémoire si un artisan intervient plus tard, si un meuble est fixé au mur ou si une réparation doit être faite. Dans une pièce humide, savoir où passent les raccords et les renforcements fait gagner beaucoup de temps.",
    ),
    p(
      "Enfin, pensez à la ventilation. Même avec une bonne étanchéité, une salle de bain fermée et humide vieillit mal. Aération, pente, joints propres et entretien régulier forment un ensemble : c'est cette cohérence qui protège réellement la pièce.",
    ),
  ],
  "joint-carrelage-role-choix-entretien": [
    h(2, "Préparer la finition dès le calepinage"),
    p(
      "Le joint se décide avant la pose, pas à la dernière minute. Son épaisseur modifie les alignements, les découpes et la lecture des angles. En préparant le calepinage avec la largeur réelle du joint, on obtient des bords plus propres et des coupes mieux réparties.",
    ),
    p(
      "Dans les petites pièces, un joint trop contrasté peut rendre le sol chargé. Dans une grande surface, il peut au contraire structurer le rythme. L'essentiel est de regarder un échantillon complet, avec carreau et joint, plutôt qu'un carreau isolé.",
    ),
    p(
      "Après la pose, les premiers nettoyages comptent beaucoup. Les voiles de ciment doivent être retirés avec méthode, sans produits agressifs non adaptés. Un entretien doux et régulier garde la couleur plus stable et prolonge l'aspect neuf du revêtement.",
    ),
  ],
  "carrelage-tunisie-choisir-selon-piece": [
    h(2, "Construire une sélection cohérente"),
    p(
      "Pour une maison complète, il est préférable de limiter le nombre de références. Deux ou trois revêtements bien associés donnent souvent un résultat plus élégant qu'une accumulation de motifs. Le sol principal peut servir de base, puis les murs et pièces d'eau apportent des nuances.",
    ),
    p(
      "La lumière naturelle doit aussi guider le choix. Un carreau gris peut paraître chaud en showroom et froid dans une pièce sombre. À l'inverse, un beige très clair peut devenir éblouissant dans une pièce très exposée. Comparer les échantillons à différents moments de la journée reste un réflexe précieux.",
    ),
    p(
      "Enfin, pensez au mobilier. Les portes, plans de travail, meubles de salle de bain et menuiseries doivent dialoguer avec le carrelage. Une sélection réussie anticipe tout l'environnement, pas seulement le sol.",
    ),
  ],
  "faience-cuisine-tunisie-styles-conseils": [
    h(2, "Les détails qui changent le rendu"),
    p(
      "La hauteur de crédence, l'alignement avec les meubles hauts et la position des prises influencent beaucoup la finition. Une faïence bien choisie peut perdre son effet si les découpes tombent au mauvais endroit ou si les accessoires muraux coupent le motif.",
    ),
    p(
      "Pour les cuisines ouvertes, la faïence doit être regardée depuis le salon. Un décor trop fort peut fatiguer visuellement si la pièce est ouverte toute la journée. Un motif plus doux, répété sur une zone précise, apporte souvent un meilleur équilibre.",
    ),
    p(
      "Pensez aussi à la jonction avec le plan de travail. Un joint propre, une coupe nette et une couleur coordonnée donnent une impression de cuisine réalisée sur mesure, même avec une composition simple.",
    ),
  ],
  "gres-cerame-parterre-sols-solides-elegants": [
    h(2, "Penser à la vie réelle du sol"),
    p(
      "Un parterre est traversé avec des chaussures, nettoyé souvent, exposé aux meubles et parfois aux jouets, aux animaux ou aux charges ponctuelles. Le choix doit donc intégrer la vie réelle du foyer, pas seulement la photo d'inspiration.",
    ),
    p(
      "Dans une maison familiale, une finition légèrement texturée et une teinte nuancée pardonnent mieux les traces quotidiennes. Dans un espace plus formel, un grand format clair peut créer une impression de calme et de continuité, à condition que la pose soit très précise.",
    ),
    p(
      "Le joint reste un élément de design. Une couleur proche du carreau renforce l'effet de surface continue. Une couleur contrastée dessine davantage le quadrillage. Les deux choix peuvent être beaux, mais ils ne racontent pas la même ambiance.",
    ),
  ],
  "salle-de-bain-moderne-espace-coherent": [
    h(2, "Créer une pièce facile à vivre"),
    p(
      "Une salle de bain moderne doit rester agréable les jours pressés. Les rangements doivent être accessibles, le miroir bien éclairé et les surfaces faciles à essuyer. Les choix trop spectaculaires mais difficiles à entretenir vieillissent souvent moins bien.",
    ),
    p(
      "Le confort passe aussi par les hauteurs. Meuble, vasque, mitigeur, niche et accessoires doivent correspondre aux utilisateurs. Une pièce réussie donne une sensation naturelle : rien ne gêne, rien ne semble trop loin, et les gestes quotidiens deviennent fluides.",
    ),
    p(
      "Si plusieurs matériaux sont utilisés, gardez un fil conducteur. Une même finition métallique, une palette courte ou un rappel de couleur suffit à créer l'harmonie. Cette sobriété rend la salle de bain plus élégante et plus durable visuellement.",
    ),
  ],
  "mitigeur-robinet-bien-choisir": [
    h(2, "Comparer avant de valider"),
    p(
      "Avant de choisir une robinetterie, placez-la mentalement dans son environnement complet. La hauteur du miroir, la profondeur du plan, l'ouverture d'une fenêtre ou la présence d'une tablette peuvent modifier le confort d'utilisation. Un détail mal anticipé devient vite irritant au quotidien.",
    ),
    p(
      "Il faut aussi penser aux utilisateurs. Une poignée facile à manipuler, un réglage précis et un bec bien placé rendent le point d'eau plus confortable pour toute la famille. Le design est important, mais il doit accompagner le geste.",
    ),
    p(
      "Pour les projets coordonnés, choisir la robinetterie en même temps que la vasque, le meuble et les accessoires permet d'éviter les différences de finition. Le résultat paraît plus professionnel et plus calme visuellement.",
    ),
  ],
  "panneau-sandwich-usages-criteres-choix": [
    h(2, "Les informations à réunir avant achat"),
    p(
      "Pour recevoir un conseil utile, préparez les dimensions, la destination du local, l'exposition au soleil et au vent, ainsi que la structure prévue. Ces éléments orientent l'épaisseur, le type de fixation et les accessoires nécessaires.",
    ),
    p(
      "Les découpes et les recouvrements doivent être anticipés. Un chantier avec beaucoup de points singuliers demande plus d'accessoires et plus de précision qu'une surface simple. Le budget doit donc intégrer les finitions, pas uniquement les panneaux.",
    ),
    p(
      "Enfin, pensez à la maintenance future. Un accès facile aux zones sensibles, des fixations adaptées et une évacuation correcte de l'eau prolongent la durée de vie de l'ensemble. Le panneau sandwich fonctionne bien lorsqu'il est pensé comme un système complet.",
    ),
  ],
  "quincaillerie-chantier-essentiels-prevoir": [
    h(2, "Une méthode simple pour ne rien oublier"),
    p(
      "La meilleure méthode consiste à parcourir le chantier pièce par pièce. Pour chaque porte, fenêtre, meuble ou cloison, notez les accessoires visibles et invisibles. Cette liste évite de découvrir en fin de journée qu'une visserie, un arrêt ou une poignée manque.",
    ),
    p(
      "Il faut également séparer les produits de finition des produits techniques. Les premiers doivent être cohérents avec le style. Les seconds doivent répondre à la charge, au support et aux contraintes d'usage. Les deux catégories sont importantes, mais elles ne se choisissent pas avec les mêmes critères.",
    ),
    p(
      "Sur les projets professionnels, conserver les références utilisées facilite la maintenance. Une serrure, un rail ou une charnière remplaçable rapidement réduit les interruptions et simplifie les interventions futures.",
    ),
  ],
  "placo-faux-plafond-finitions-interieures": [
    h(2, "Anticiper les contraintes invisibles"),
    p(
      "Le placo et le faux plafond cachent souvent des réseaux. Avant de fermer, il faut vérifier les câbles, gaines, évacuations, attentes de luminaires et trappes d'accès. Ce contrôle évite de casser une finition neuve pour corriger un oubli technique.",
    ),
    p(
      "Les renforts sont un autre point essentiel. Un meuble suspendu, un miroir lourd ou un équipement mural ne doit pas être fixé au hasard. Prévoir les renforts au bon endroit rend l'installation plus sûre et plus propre.",
    ),
    p(
      "La finition dépend enfin de la lumière. Plus un plafond reçoit une lumière rasante, plus les défauts deviennent visibles. Un bon ponçage, des joints progressifs et une peinture adaptée permettent d'obtenir un rendu intérieur plus professionnel.",
    ),
  ],
};

for (const article of articleSeeds) {
  article.body.push(...(ARTICLE_EXPANSIONS[article.slug] ?? []));
}

function validateSeedData() {
  if (articleSeeds.length !== 10) {
    throw new Error(`Expected exactly 10 articles, got ${articleSeeds.length}.`);
  }

  const slugs = new Set<string>();

  for (const article of articleSeeds) {
    if (slugs.has(article.slug)) {
      throw new Error(`Duplicate article slug in seed data: ${article.slug}`);
    }

    slugs.add(article.slug);

    if (article.title.length > 70) {
      throw new Error(`Title is longer than 70 characters: ${article.title}`);
    }

    if (article.seoTitle.length > 60) {
      throw new Error(`SEO title is longer than 60 characters: ${article.seoTitle}`);
    }

    if (article.seoDescription.length > 160) {
      throw new Error(`SEO description is longer than 160 characters: ${article.slug}`);
    }

    const category = CATEGORY_SEEDS.find((candidate) => candidate.slug === article.categorySlug);

    if (!category) {
      throw new Error(`Unknown category slug for article ${article.slug}: ${article.categorySlug}`);
    }

    const document = doc(article.body);

    if (document.type !== "doc" || document.content.length === 0) {
      throw new Error(`Invalid Tiptap document for article: ${article.slug}`);
    }

    const wordCount = getWordCount(article.body);

    if (wordCount < 430 || wordCount > 760) {
      throw new Error(`Article ${article.slug} has ${wordCount} words; expected roughly 600.`);
    }
  }
}

function serializeArticleContent(nodes: TiptapNode[]) {
  return JSON.stringify(doc(nodes));
}

function serializeTags(tags: string[]) {
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))].join(" ");
}

loadEnvFile(path.join(process.cwd(), "apps/cobam-group/.env"));
validateSeedData();

const [{ prisma }, { ArticleStatus, UserStatus }] = await Promise.all([
  import("@cobam/db"),
  import("@prisma/client"),
]);

const result = await prisma.$transaction(
  async (tx) => {
    const preferredAuthor = await tx.user.findFirst({
      where: {
        id: AUTHOR_PREFERENCE_ID,
        portal: "STAFF",
        status: {
          notIn: [UserStatus.BANNED, UserStatus.CLOSED],
        },
      },
      select: { id: true },
    });

    const fallbackAuthor =
      preferredAuthor ??
      (await tx.user.findFirst({
        where: {
          portal: "STAFF",
          status: {
            notIn: [UserStatus.BANNED, UserStatus.CLOSED],
          },
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        select: { id: true },
      }));

    if (!fallbackAuthor) {
      throw new Error("No active staff user found to assign as article author.");
    }

    const authorId = fallbackAuthor.id;
    const categoryBySlug = new Map<string, { id: bigint; slug: string }>();

    for (const category of CATEGORY_SEEDS) {
      const record = await tx.articleCategory.upsert({
        where: { slug: category.slug },
        create: {
          name: category.name,
          slug: category.slug,
          color: category.color,
          createdByUserId: authorId,
          updatedByUserId: authorId,
        },
        update: {
          name: category.name,
          color: category.color,
          updatedByUserId: authorId,
        },
        select: {
          id: true,
          slug: true,
        },
      });

      categoryBySlug.set(record.slug, record);
    }

    const articleResults: Array<{
      title: string;
      slug: string;
      principalKeyword: string;
      categorySlug: string;
      action: "inserted" | "updated";
      wordCount: number;
    }> = [];

    for (const article of articleSeeds) {
      const category = categoryBySlug.get(article.categorySlug);

      if (!category) {
        throw new Error(`Category not found after upsert: ${article.categorySlug}`);
      }

      const existing = await tx.article.findUnique({
        where: { slug: article.slug },
        select: {
          id: true,
          publishedAt: true,
          coverMediaId: true,
          ogImageMediaId: true,
        },
      });

      const content = serializeArticleContent(article.body);
      const emptyContent = serializeArticleContent([{ type: "paragraph" }]);
      const baseData = {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        introductionContent: emptyContent,
        bodyContent: content,
        conclusionContent: emptyContent,
        titleSeo: article.seoTitle,
        descriptionSeo: article.seoDescription,
        tags: serializeTags(article.tags),
        status: ArticleStatus.PUBLISHED,
        publishedAt: existing?.publishedAt ?? new Date(),
        createdByUserId: authorId,
        updatedByUserId: authorId,
        publishedByUserId: authorId,
        categoryId: category.id,
        coverMediaId: existing?.coverMediaId ?? null,
        ogTitle: article.seoTitle,
        ogDescription: article.seoDescription,
        ogImageMediaId: existing?.ogImageMediaId ?? null,
        noIndex: false,
      };

      const record = existing
        ? await tx.article.update({
            where: { id: existing.id },
            data: baseData,
            select: { id: true },
          })
        : await tx.article.create({
            data: baseData,
            select: { id: true },
          });

      articleResults.push({
        title: article.title,
        slug: article.slug,
        principalKeyword: article.principalKeyword,
        categorySlug: article.categorySlug,
        action: existing ? "updated" : "inserted",
        wordCount: getWordCount(article.body),
      });
    }

    return {
      authorId,
      articles: articleResults,
    };
  },
  {
    timeout: 60_000,
  },
);

const validationRecords = await prisma.article.findMany({
  where: {
    slug: {
      in: articleSeeds.map((article) => article.slug),
    },
  },
  orderBy: { slug: "asc" },
  select: {
    id: true,
    title: true,
    slug: true,
    bodyContent: true,
    descriptionSeo: true,
    status: true,
    publishedAt: true,
    coverMediaId: true,
    ogImageMediaId: true,
    noIndex: true,
    category: {
      select: {
        name: true,
        slug: true,
      },
    },
  },
});

if (validationRecords.length !== 10) {
  throw new Error(`Validation failed: expected 10 articles, got ${validationRecords.length}.`);
}

const seenValidationSlugs = new Set<string>();

for (const article of validationRecords) {
  if (seenValidationSlugs.has(article.slug)) {
    throw new Error(`Validation failed: duplicate slug ${article.slug}.`);
  }

  seenValidationSlugs.add(article.slug);

  const parsed = JSON.parse(article.bodyContent) as { type?: string; content?: unknown[] };

  if (parsed.type !== "doc" || !Array.isArray(parsed.content) || parsed.content.length === 0) {
    throw new Error(`Validation failed: invalid Tiptap JSON for ${article.slug}.`);
  }

  if (!article.category) {
    throw new Error(`Validation failed: article has no category ${article.slug}.`);
  }

  if (article.title.length > 70) {
    throw new Error(`Validation failed: title too long ${article.slug}.`);
  }

  if (article.descriptionSeo && article.descriptionSeo.length > 160) {
    throw new Error(`Validation failed: SEO description too long ${article.slug}.`);
  }

  if (
    article.coverMediaId !== null ||
    article.ogImageMediaId !== null ||
    article.noIndex ||
    article.status !== ArticleStatus.PUBLISHED ||
    article.publishedAt === null
  ) {
    throw new Error(`Validation failed: unexpected article metadata for ${article.slug}.`);
  }
}

console.log(
  JSON.stringify(
    {
      authorId: result.authorId,
      articles: result.articles,
      validation: validationRecords.map((article) => ({
        id: article.id.toString(),
        title: article.title,
        slug: article.slug,
        status: article.status,
        category: article.category?.name ?? null,
        categorySlug: article.category?.slug ?? null,
      })),
    },
    null,
    2,
  ),
);

await prisma.$disconnect();
