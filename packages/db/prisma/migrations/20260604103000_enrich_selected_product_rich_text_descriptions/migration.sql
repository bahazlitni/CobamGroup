WITH "seed" (
  "product_id", "heading", "intro", "usage", "highlights", "advice"
) AS (
VALUES
  (
    3,
    $txt$Bras de douche mural carré Jaquar$txt$,
    $txt$Ce bras de douche mural carré Jaquar apporte une sortie nette et moderne pour installer une pomme de douche haute. Sa ligne droite et sa finition chromée s’intègrent facilement dans une salle de bain contemporaine, avec un rendu discret mais soigné.$txt$,
    $txt$Il convient aux douches murales où l’on souhaite positionner la tête de douche à distance du mur tout en gardant une esthétique carrée coordonnée avec la robinetterie.$txt$,
    ARRAY[
      $txt$Format mural carré, adapté aux compositions de douche modernes.$txt$,
      $txt$Longueur L400, pratique pour dégager la pomme de douche du mur.$txt$,
      $txt$Finition chromée facile à associer avec mitigeurs, colonnes et accessoires chromés.$txt$,
      $txt$Référence ALI-SHA-CHR-455L400, pensée pour une installation sobre et précise.$txt$
    ]::TEXT[],
    $txt$Avant commande, vérifiez le type de raccord, la longueur souhaitée et le poids de la pomme de douche afin de garantir une pose stable et confortable.$txt$
  ),
  (
    62,
    $txt$Bras de douche carré mural Sopal G1/2 L360$txt$,
    $txt$Ce bras de douche Sopal permet de créer une sortie murale propre pour une pomme de douche haute. Son dessin carré, son angle à 90° et sa longueur L360 donnent un aspect structuré à l’espace douche.$txt$,
    $txt$Il est adapté aux salles de bain résidentielles ou aux projets de rénovation qui recherchent une solution murale simple, durable et visuellement cohérente avec une robinetterie angulaire.$txt$,
    ARRAY[
      $txt$Raccord G1/2, format courant pour de nombreuses têtes de douche.$txt$,
      $txt$Longueur L360 pour un bon déport depuis le mur.$txt$,
      $txt$Angle 90° pour une sortie haute bien alignée.$txt$,
      $txt$Design carré assorti aux ensembles de douche contemporains.$txt$
    ]::TEXT[],
    $txt$Contrôlez l’implantation du point d’eau et la compatibilité avec la pomme de douche choisie avant la pose.$txt$
  ),
  (
    1169,
    $txt$Abattant WC Sanimed Azur/Lavanta CS$txt$,
    $txt$Cet abattant WC Sanimed est prévu pour compléter ou remplacer l’assise des cuvettes compatibles Azur/Lavanta CS. Sa finition blanche reste facile à intégrer dans une salle de bain claire et sobre.$txt$,
    $txt$Il convient aux sanitaires domestiques, aux bureaux ou aux espaces recevant du public lorsqu’un remplacement propre et cohérent avec la cuvette existante est nécessaire.$txt$,
    ARRAY[
      $txt$Compatible avec les gammes Azur/Lavanta CS indiquées dans la référence produit.$txt$,
      $txt$Coloris blanc, simple à assortir à la céramique sanitaire.$txt$,
      $txt$Solution utile pour remplacement, entretien ou remise à niveau d’un WC existant.$txt$,
      $txt$Forme enveloppante pensée pour un usage quotidien confortable.$txt$
    ]::TEXT[],
    $txt$Vérifiez toujours la forme de la cuvette, les entraxes et le système de fixation avant de confirmer l’achat.$txt$
  ),
  (
    1212,
    $txt$Abattant WC Ideal San Émeraude thermodur avec amortisseur$txt$,
    $txt$Cet abattant WC Ideal San en thermodur offre une assise rigide, stable et plus silencieuse grâce à son système de fermeture amortie. Il apporte une finition propre à la cuvette tout en améliorant le confort d’usage.$txt$,
    $txt$Il est conseillé pour les salles de bain familiales, les espaces hôteliers, les bureaux et les sanitaires utilisés régulièrement, où l’on recherche une fermeture douce et une bonne tenue dans le temps.$txt$,
    ARRAY[
      $txt$Matière thermodur, appréciée pour sa rigidité et son toucher qualitatif.$txt$,
      $txt$Fermeture avec amortisseur pour limiter les claquements.$txt$,
      $txt$Finition blanche adaptée aux ensembles sanitaires classiques.$txt$,
      $txt$Référence associée à la gamme Émeraude Ideal San.$txt$
    ]::TEXT[],
    $txt$Assurez-vous que l’abattant correspond bien à la cuvette en place, notamment au niveau de la forme et des fixations.$txt$
  ),
  (
    1567,
    $txt$Brique plâtrière Essahel$txt$,
    $txt$La brique plâtrière Essahel est une brique creuse en terre cuite destinée aux travaux de cloisonnement intérieur et de maçonnerie légère. Elle permet de réaliser des séparations simples avant enduit ou finition.$txt$,
    $txt$Elle est adaptée aux aménagements intérieurs, doublages et cloisons non porteuses lorsque l’on souhaite une solution minérale, respirante et facile à mettre en œuvre sur chantier.$txt$,
    ARRAY[
      $txt$Brique creuse en terre cuite pour travaux de plâtrerie et cloisonnement.$txt$,
      $txt$Format pratique pour réaliser des séparations intérieures.$txt$,
      $txt$Support compatible avec les enduits adaptés à la terre cuite.$txt$,
      $txt$Solution économique pour les chantiers de construction ou de rénovation.$txt$
    ]::TEXT[],
    $txt$Prévoyez le mortier, l’enduit et les quantités avec une marge de coupe afin d’éviter les ruptures d’approvisionnement en cours de chantier.$txt$
  ),
  (
    1568,
    $txt$Brique hourdis H16 BCM/SBM$txt$,
    $txt$Cette brique hourdis H16 est un élément creux en terre cuite destiné aux planchers hourdis compatibles. Elle participe au remplissage entre poutrelles et facilite la réalisation de planchers dans les ouvrages de gros œuvre.$txt$,
    $txt$Elle convient aux chantiers de construction qui demandent des entrevous réguliers, faciles à manipuler et adaptés aux systèmes de plancher prévus par le concepteur.$txt$,
    ARRAY[
      $txt$Format H16 indiqué pour les applications de plancher hourdis.$txt$,
      $txt$Élément creux en terre cuite, léger à manipuler sur chantier.$txt$,
      $txt$Adapté aux travaux de gros œuvre avec poutrelles compatibles.$txt$,
      $txt$Produit destiné à une mise en œuvre selon plan de structure.$txt$
    ]::TEXT[],
    $txt$La compatibilité avec les poutrelles, les portées et les charges doit être validée par le responsable technique ou le bureau d’études.$txt$
  ),
  (
    1569,
    $txt$Brique de 06$txt$,
    $txt$La brique de 06 est une brique creuse en terre cuite destinée aux cloisons fines et aux travaux de maçonnerie légère. Son épaisseur réduite permet d’aménager des séparations sans surcharger inutilement l’ouvrage.$txt$,
    $txt$Elle convient aux travaux intérieurs, aux doublages et aux petites séparations non porteuses lorsque l’on recherche une brique simple à poser et facile à enduire.$txt$,
    ARRAY[
      $txt$Épaisseur catalogue 06, adaptée aux cloisons fines.$txt$,
      $txt$Conditionnement mentionné 680 pièces par palette.$txt$,
      $txt$Terre cuite creuse, pratique pour la manutention et la pose.$txt$,
      $txt$Solution adaptée aux travaux courants d’aménagement intérieur.$txt$
    ]::TEXT[],
    $txt$Calculez les quantités avec les pertes de coupe et choisissez un mortier compatible avec la destination de la cloison.$txt$
  ),
  (
    1570,
    $txt$Brique de 08 Essahel$txt$,
    $txt$La brique de 08 Essahel est une brique creuse en terre cuite destinée aux cloisons et remplissages de maçonnerie courante. Elle offre une épaisseur plus confortable qu’une brique de 06 tout en restant facile à manipuler.$txt$,
    $txt$Elle peut être utilisée pour les séparations intérieures, les remplissages et les petits ouvrages non structurels, selon les prescriptions du chantier.$txt$,
    ARRAY[
      $txt$Épaisseur catalogue 08 pour cloisons et remplissages courants.$txt$,
      $txt$Terre cuite creuse, adaptée aux travaux intérieurs.$txt$,
      $txt$Bon compromis entre légèreté et épaisseur de cloison.$txt$,
      $txt$Compatible avec une finition par enduit approprié.$txt$
    ]::TEXT[],
    $txt$Vérifiez le type d’enduit, le mortier et l’épaisseur finale souhaitée avant de lancer la pose.$txt$
  ),
  (
    1571,
    $txt$Brique de 12 BCM$txt$,
    $txt$La brique de 12 BCM est une brique creuse en terre cuite pour maçonnerie courante, cloisons plus épaisses et travaux de remplissage. Elle apporte davantage de présence qu’une cloison fine tout en conservant une mise en œuvre simple.$txt$,
    $txt$Elle est adaptée aux aménagements intérieurs ou aux remplissages non porteurs qui demandent une épaisseur plus généreuse et une bonne base pour enduit.$txt$,
    ARRAY[
      $txt$Épaisseur catalogue 12, adaptée aux cloisons plus robustes.$txt$,
      $txt$Brique creuse en terre cuite pour maçonnerie courante.$txt$,
      $txt$Bon support pour enduits compatibles.$txt$,
      $txt$Produit utile pour construction neuve et rénovation.$txt$
    ]::TEXT[],
    $txt$Confirmez le calepinage, les quantités et les contraintes de l’ouvrage avant livraison sur chantier.$txt$
  ),
  (
    103,
    $txt$Ciment colle FM-ECO blanc Deutsch Color$txt$,
    $txt$FM-ECO blanc Deutsch Color est un mortier colle monocomposant à base de ciment pour la pose de carreaux céramiques en intérieur. Sa formule C1TE selon EN 12004 combine adhérence normale, résistance au glissement et temps ouvert allongé.$txt$,
    $txt$Il est destiné aux supports courants comme le béton, le ciment et le plâtre correctement préparé. C’est une solution adaptée aux travaux de pose intérieurs lorsque l’on recherche un produit simple, régulier et facile à travailler.$txt$,
    ARRAY[
      $txt$Classe C1TE selon EN 12004 pour pose intérieure de carreaux céramiques.$txt$,
      $txt$Bonne ouvrabilité pour faciliter l’application au peigne.$txt$,
      $txt$Temps ouvert allongé et délai d’ajustabilité confortable.$txt$,
      $txt$Coloris blanc, utile avec des revêtements clairs ou joints clairs.$txt$
    ]::TEXT[],
    $txt$Préparez un support propre, stable et suffisamment sec. Respectez le taux de gâchage et les temps d’emploi pour conserver les performances du mortier colle.$txt$
  ),
  (
    104,
    $txt$Ciment colle FM1000 blanc Deutsch Color$txt$,
    $txt$FM1000 blanc Deutsch Color est un mortier colle flexible à base de ciment pour carreaux céramiques. Classé C1TE selon EN 12004, il offre une bonne ouvrabilité, un temps ouvert allongé et une résistance au glissement adaptée aux poses courantes.$txt$,
    $txt$Il convient en intérieur comme en extérieur sur supports à base de ciment, béton et plâtre traité avec le primaire approprié. Il répond aux besoins des chantiers de carrelage classiques sur murs et sols compatibles.$txt$,
    ARRAY[
      $txt$Classe C1TE selon EN 12004.$txt$,
      $txt$Utilisable en intérieur et extérieur sur supports préparés.$txt$,
      $txt$Vie en pot indicative de 4 heures selon la fiche technique.$txt$,
      $txt$Consommation indicative d’environ 3,5 à 5 kg/m² selon support et format.$txt$
    ]::TEXT[],
    $txt$Pour un résultat durable, le support doit être propre, stable, plan et débarrassé des huiles, peintures ou poussières pouvant gêner l’adhérence.$txt$
  ),
  (
    105,
    $txt$Ciment colle FM2000 blanc Deutsch Color$txt$,
    $txt$FM2000 blanc Deutsch Color est un mortier colle flexible amélioré pour carreaux céramiques, porcelaine et grès. Sa classe C2TE selon EN 12004 indique une adhérence améliorée, une résistance au glissement et un temps ouvert allongé.$txt$,
    $txt$Il convient aux travaux intérieurs et extérieurs, y compris les environnements humides, les supports à base de ciment, le gypse traité et les anciens carrelages correctement préparés.$txt$,
    ARRAY[
      $txt$Classe C2TE pour une adhérence renforcée.$txt$,
      $txt$Adapté aux carreaux céramiques, porcelaine et grès.$txt$,
      $txt$Compatible avec anciens carrelages préparés selon les prescriptions.$txt$,
      $txt$Peut être renforcé avec additif latex pour certains supports déformables.$txt$
    ]::TEXT[],
    $txt$Choisissez le peigne, le simple ou double encollage et le primaire selon le format du carreau, la porosité et l’état du support.$txt$
  ),
  (
    106,
    $txt$Ciment colle FM3000 piscine Deutsch Color$txt$,
    $txt$FM3000 Deutsch Color est un mortier colle flexible hautes performances pour carreaux céramiques, porcelaine et grès. Sa classe C2TE S1 selon EN 12004 le rend adapté aux conditions de collage exigeantes et aux supports nécessitant plus de déformabilité.$txt$,
    $txt$Il est conseillé pour les travaux intérieurs et extérieurs, les zones humides, les anciens carrelages préparés, les planchers chauffants et les applications de type piscine lorsque les supports sont conformes.$txt$,
    ARRAY[
      $txt$Classe C2TE S1 : adhérence élevée et comportement déformable.$txt$,
      $txt$Adapté aux endroits humides et aux supports difficiles.$txt$,
      $txt$Temps ouvert et délai d’ajustabilité allongés pour une pose maîtrisée.$txt$,
      $txt$Résistance thermique indicative de -30 °C à +90 °C.$txt$
    ]::TEXT[],
    $txt$Respectez strictement la préparation du support, le taux de gâchage et les délais de mise en service, en particulier pour piscine ou sol soumis à fortes contraintes.$txt$
  ),
  (
    1563,
    $txt$Admix ciment Deutsch Color 1 kg$txt$,
    $txt$Admix Cem Deutsch Color est un additif en poudre conçu pour améliorer l’imperméabilisation des mortiers, bétons, mortiers de ciment et mortiers bâtards. Il s’ajoute au mélange pour aider à réaliser des ouvrages plus résistants à la pénétration de l’eau.$txt$,
    $txt$Il est utile pour murs, façades, cuvelages, chapes, formes de protection d’étanchéité, piscines, réservoirs, chapes d’arase et coupures de capillarité, selon les règles de mise en œuvre adaptées.$txt$,
    ARRAY[
      $txt$Format pratique en sachet de 1 kg.$txt$,
      $txt$Dosage indicatif : 1 kg pour un sac de ciment.$txt$,
      $txt$Aide à obtenir des mortiers et chapes plus imperméables.$txt$,
      $txt$Convient aux travaux exposés à l’humidité lorsque le mortier est correctement formulé.$txt$
    ]::TEXT[],
    $txt$Dosez l’additif selon la quantité de ciment et mélangez soigneusement pour obtenir une répartition homogène dans le mortier.$txt$
  ),
  (
    1576,
    $txt$Ciment colle SikaCeram 103 blanc sac 25 kg$txt$,
    $txt$SikaCeram 103 Stop Eau est un mortier-colle hydrofuge à base de ciment pour travaux intérieurs. Classé C1 selon EN 12004, il est formulé pour la pose de carreaux céramiques en couche mince avec simple addition d’eau.$txt$,
    $txt$Il est recommandé pour sols et murs intérieurs, travaux neufs et pièces humides, sur supports courants comme béton, mortier, pierre ou brique lorsque ceux-ci sont propres et correctement préparés.$txt$,
    ARRAY[
      $txt$Mortier-colle hydrofuge pour carreaux céramiques.$txt$,
      $txt$Classe C1 selon EN 12004.$txt$,
      $txt$Bonne maniabilité pour faciliter la mise en œuvre.$txt$,
      $txt$Conditionnement en sac de 25 kg.$txt$
    ]::TEXT[],
    $txt$Préparez le support avec soin et respectez le temps ouvert, la quantité d’eau et le type d’encollage adaptés au carreau.$txt$
  ),
  (
    1577,
    $txt$Ciment colle SikaCeram 106 blanc sac 25 kg$txt$,
    $txt$SikaCeram 106 Extra est un mortier-colle prémélangé monocomposant pour travaux neufs. Classé C1TE selon EN 12004, il combine temps ouvert prolongé, résistance au glissement vertical et facilité de mise en œuvre.$txt$,
    $txt$Il convient à la pose de revêtements céramiques et similaires sur sols et murs intérieurs, notamment dans les pièces humides, sur béton, mortier, pierre, brique ou béton cellulaire intérieur.$txt$,
    ARRAY[
      $txt$Classe C1TE selon EN 12004.$txt$,
      $txt$Recommandé pour pièces humides en intérieur.$txt$,
      $txt$Temps ouvert prolongé pour plus de confort pendant la pose.$txt$,
      $txt$Dosage indicatif : environ 5,75 à 6 litres d’eau par sac de 25 kg.$txt$
    ]::TEXT[],
    $txt$Appliquez sur support sain, propre et protégé de l’humidité excessive. Respectez le temps d’ajustement pour garantir une pose régulière.$txt$
  ),
  (
    1578,
    $txt$Ciment colle SikaCeram 206 blanc sac 25 kg$txt$,
    $txt$SikaCeram 206 Flow est un mortier-colle amélioré polyvalent à double consistance pour carreaux céramiques de grandes tailles. Sa classe C2TEG répond aux chantiers qui demandent une meilleure adhérence et une grande souplesse d’application.$txt$,
    $txt$Il convient aux sols et murs, en intérieur comme en extérieur, sur supports neufs ou anciens. Il peut être utilisé en rénovation sur ancien carrelage préparé et dans des zones exigeantes comme piscines, sols industriels ou zones à fort trafic.$txt$,
    ARRAY[
      $txt$Classe C2TEG pour applications performantes.$txt$,
      $txt$Double consistance : normale ou fluide selon le besoin de pose.$txt$,
      $txt$Adapté aux grands formats et carreaux à porosité réduite.$txt$,
      $txt$Pose possible de marbre et pierre naturelle non sensibles à l’eau.$txt$
    ]::TEXT[],
    $txt$Déterminez la consistance, le peigne et le simple ou double encollage selon le format du carreau, le support et l’usage de la zone.$txt$
  ),
  (
    1579,
    $txt$Ciment Gabès CPA par sac$txt$,
    $txt$Le ciment Gabès CPA est un ciment en sac destiné aux préparations de béton et de mortier de chantier. Il répond aux besoins courants de construction lorsque l’on recherche une base régulière pour maçonnerie, scellements ou petits ouvrages béton.$txt$,
    $txt$Il peut être utilisé pour les travaux généraux du bâtiment, selon les dosages adaptés à l’ouvrage : mortiers de pose, enduits, bétons courants ou réparations simples.$txt$,
    ARRAY[
      $txt$Ciment en sac pour approvisionnement chantier.$txt$,
      $txt$Adapté aux mortiers et bétons courants.$txt$,
      $txt$Utilisable pour maçonnerie, scellement et petits ouvrages.$txt$,
      $txt$Produit polyvalent pour les besoins quotidiens de construction.$txt$
    ]::TEXT[],
    $txt$Le dosage doit être choisi selon l’usage, les granulats, l’eau de gâchage et les performances attendues de l’ouvrage.$txt$
  ),
  (
    1580,
    $txt$Ciment Gabès H.R.S par sac$txt$,
    $txt$Le ciment Gabès H.R.S est un ciment en sac destiné aux ouvrages exposés à des environnements plus agressifs, notamment lorsque la résistance aux sulfates est recherchée.$txt$,
    $txt$Il est pertinent pour certains bétons et mortiers de fondations, ouvrages enterrés, zones humides ou travaux soumis à des contraintes chimiques particulières, sous réserve de validation technique.$txt$,
    ARRAY[
      $txt$Désignation H.R.S : haute résistance aux sulfates.$txt$,
      $txt$Conditionnement en sac pour chantier.$txt$,
      $txt$Adapté aux contextes où l’environnement est plus contraignant.$txt$,
      $txt$À privilégier lorsque la prescription technique exige ce type de ciment.$txt$
    ]::TEXT[],
    $txt$Confirmez la classe de ciment, les dosages et l’adéquation au milieu d’exposition avec le responsable technique du chantier.$txt$
  ),
  (
    1581,
    $txt$Ciment Gabès Normal 32.5 par sac$txt$,
    $txt$Le ciment Gabès Normal 32.5 est un ciment en sac pour les travaux courants de maçonnerie, mortiers et bétons ordinaires. Il constitue une base pratique pour les usages généraux du bâtiment.$txt$,
    $txt$Il convient aux enduits, mortiers de pose, petits scellements et préparations courantes lorsque la classe 32.5 correspond aux exigences de résistance de l’ouvrage.$txt$,
    ARRAY[
      $txt$Classe indiquée : 32.5.$txt$,
      $txt$Format sac, facile à stocker et à doser sur chantier.$txt$,
      $txt$Adapté aux mortiers et bétons ordinaires.$txt$,
      $txt$Solution courante pour construction et rénovation.$txt$
    ]::TEXT[],
    $txt$Stockez les sacs à l’abri de l’humidité et adaptez le dosage selon le type de mortier ou de béton à préparer.$txt$
  ),
  (
    1582,
    $txt$Sika AnchorFix-1 150 ml$txt$,
    $txt$Sika AnchorFix-1 est une résine de scellement chimique bicomposant à prise rapide, sans solvant ni styrène. Elle permet de réaliser des ancrages fiables dans différents supports lorsque les fixations mécaniques seules ne suffisent pas.$txt$,
    $txt$Elle convient au scellement de fers à béton, tiges filetées, boulons et systèmes de fixation dans le béton, la maçonnerie pleine ou creuse, la pierre dure et certains supports minéraux compatibles.$txt$,
    ARRAY[
      $txt$Cartouche de 150 ml pour interventions ciblées.$txt$,
      $txt$Prise rapide, pratique pour les travaux de fixation.$txt$,
      $txt$Utilisable avec pistolets standards selon le format compatible.$txt$,
      $txt$Bonne capacité de charge lorsque le support et le perçage sont conformes.$txt$
    ]::TEXT[],
    $txt$Nettoyez soigneusement le trou de perçage et respectez le temps de prise avant mise en charge. Faites un essai préalable sur supports sensibles ou inconnus.$txt$
  ),
  (
    409,
    $txt$Sika BituSeal T-140 PG rouleau d’étanchéité$txt$,
    $txt$Sika BituSeal T-140 PG est une membrane d’étanchéité bitumineuse APP de 4 mm d’épaisseur, renforcée par une armature polyester non tissée. Elle est conçue pour protéger les ouvrages contre l’eau et l’humidité.$txt$,
    $txt$Elle s’utilise pour toitures plates, balcons, terrasses sous tuiles, murs de soutènement et ouvrages enterrés soumis à l’humidité du sol, selon les règles de pose des membranes bitumineuses.$txt$,
    ARRAY[
      $txt$Rouleau de 1 m x 10 m.$txt$,
      $txt$Application au chalumeau sur support compatible.$txt$,
      $txt$Bonne résistance au vieillissement, aux intempéries et aux impacts mécaniques.$txt$,
      $txt$Solution adaptée aux systèmes multicouches d’étanchéité.$txt$
    ]::TEXT[],
    $txt$La pose doit se faire sur support propre, sec et préparé, par une personne formée à l’application des membranes bitumineuses.$txt$
  ),
  (
    1584,
    $txt$Sika Chapdur Premix gris 25 kg$txt$,
    $txt$Sika Chapdur Premix est un durcisseur de surface prêt à l’emploi pour dallages en béton. Il est composé de ciment, pigments, adjuvants et agrégats durs sélectionnés pour améliorer les performances de la surface.$txt$,
    $txt$Il est destiné aux sols soumis à des sollicitations mécaniques importantes : entrepôts, quais, couloirs de circulation, ateliers, parkings, stations-services et garages.$txt$,
    ARRAY[
      $txt$Sac de 25 kg en coloris gris ciment.$txt$,
      $txt$Augmente la résistance à l’abrasion.$txt$,
      $txt$Réduit le poussiérage de surface.$txt$,
      $txt$Améliore la résistance aux chocs, huiles et graisses.$txt$
    ]::TEXT[],
    $txt$Incorporez le produit au bon moment sur béton frais et soignez le talochage pour obtenir une surface régulière et durable.$txt$
  ),
  (
    1585,
    $txt$SikaLatex bidon 1 L$txt$,
    $txt$SikaLatex est une résine d’accrochage haute performance à mélanger à l’eau de gâchage des mortiers de ciment. Son format 1 L est pratique pour les petites interventions, réparations ou reprises localisées.$txt$,
    $txt$Il améliore l’adhérence des mortiers, barbotines, enduits, chapes, jointoiements, réparations, reprises de bétonnage et travaux d’imperméabilisation.$txt$,
    ARRAY[
      $txt$Bidon 1 L, adapté aux petits travaux et réparations ponctuelles.$txt$,
      $txt$Améliore l’adhérence sur béton, pierre, brique, céramique et supports compatibles.$txt$,
      $txt$Rend le mortier plus plastique et plus facile à appliquer.$txt$,
      $txt$Contribue à limiter la fissuration et à améliorer la dureté de surface.$txt$
    ]::TEXT[],
    $txt$Diluez le produit selon l’usage prévu et préparez toujours un support propre, solide et débarrassé des parties friables.$txt$
  ),
  (
    1586,
    $txt$SikaLatex bidon 20 L$txt$,
    $txt$SikaLatex en bidon 20 L est destiné aux chantiers qui consomment un volume important de résine d’accrochage pour mortiers de ciment. Il permet d’améliorer l’adhérence, la plasticité et la durabilité des mélanges.$txt$,
    $txt$Ce format convient aux chapes, enduits, barbotines d’accrochage, réparations, reprises de bétonnage, jointoiements et enduits imperméables sur surfaces plus étendues.$txt$,
    ARRAY[
      $txt$Bidon 20 L pour usage chantier ou applications répétées.$txt$,
      $txt$Améliore l’accrochage du mortier sur de nombreux supports.$txt$,
      $txt$Aide à obtenir des mortiers plus maniables et plus résistants.$txt$,
      $txt$Adapté aux travaux de reprise, réparation et imperméabilisation.$txt$
    ]::TEXT[],
    $txt$Homogénéisez le mélange et respectez les dosages SikaLatex afin de conserver les performances attendues sur toute la surface traitée.$txt$
  ),
  (
    1587,
    $txt$SikaLatex bidon 5 L$txt$,
    $txt$SikaLatex en bidon 5 L est un format polyvalent pour améliorer les mortiers de ciment lors de travaux de rénovation, réparation ou pose. Il se mélange à l’eau de gâchage pour renforcer l’accrochage et la maniabilité.$txt$,
    $txt$Il est adapté aux reprises, ragréages localisés, barbotines, enduits, chapes et jointoiements lorsque l’on souhaite un mortier plus adhérent et plus résistant.$txt$,
    ARRAY[
      $txt$Bidon 5 L, bon compromis entre petite intervention et chantier moyen.$txt$,
      $txt$Améliore l’adhérence même sur supports lisses compatibles.$txt$,
      $txt$Augmente les résistances à la traction des mortiers.$txt$,
      $txt$Aide à limiter la fissuration et à améliorer l’imperméabilisation.$txt$
    ]::TEXT[],
    $txt$Nettoyez le support, éliminez les poussières et respectez le dosage recommandé selon le type de mortier préparé.$txt$
  ),
  (
    1588,
    $txt$Sikalite 1 kg par sachet$txt$,
    $txt$Super Sikalite est un additif en poudre pour l’imperméabilisation des mortiers et bétons. Il agit dans les mortiers de ciment ou mortiers bâtards pour améliorer la compacité et la résistance à la pénétration de l’eau.$txt$,
    $txt$Il est conseillé pour murs, façades, cuvelages, chapes, toitures terrasses, piscines, réservoirs, chapes d’arase et coupures de capillarité lorsque la formulation du mortier est adaptée.$txt$,
    ARRAY[
      $txt$Sachet 1 kg, facile à doser pour les travaux courants.$txt$,
      $txt$Améliore l’imperméabilisation des mortiers et bétons.$txt$,
      $txt$Rend le mortier plus onctueux et favorise la compacité.$txt$,
      $txt$Peut améliorer la résistance au gel des mortiers durcis.$txt$
    ]::TEXT[],
    $txt$Respectez les dosages et les épaisseurs recommandés, notamment pour piscines, réservoirs ou ouvrages soumis à l’eau.$txt$
  )
),
"rich_payload" AS (
  SELECT
    "seed"."product_id",
    jsonb_build_object(
      'type', 'doc',
      'content', jsonb_build_array(
        jsonb_build_object(
          'type', 'heading',
          'attrs', jsonb_build_object('level', 2),
          'content', jsonb_build_array(jsonb_build_object(
            'type', 'text',
            'text', "seed"."heading"
          ))
        ),
        jsonb_build_object(
          'type', 'paragraph',
          'content', jsonb_build_array(jsonb_build_object(
            'type', 'text',
            'text', "seed"."intro"
          ))
        ),
        jsonb_build_object(
          'type', 'heading',
          'attrs', jsonb_build_object('level', 3),
          'content', jsonb_build_array(jsonb_build_object(
            'type', 'text',
            'text', 'Usages recommandés'
          ))
        ),
        jsonb_build_object(
          'type', 'paragraph',
          'content', jsonb_build_array(jsonb_build_object(
            'type', 'text',
            'text', "seed"."usage"
          ))
        ),
        jsonb_build_object(
          'type', 'heading',
          'attrs', jsonb_build_object('level', 3),
          'content', jsonb_build_array(jsonb_build_object(
            'type', 'text',
            'text', 'Points forts'
          ))
        ),
        jsonb_build_object(
          'type', 'bulletList',
          'content', (
            SELECT jsonb_agg(
              jsonb_build_object(
                'type', 'listItem',
                'content', jsonb_build_array(jsonb_build_object(
                  'type', 'paragraph',
                  'content', jsonb_build_array(jsonb_build_object(
                    'type', 'text',
                    'text', "highlight"."text"
                  ))
                ))
              )
              ORDER BY "highlight"."position"
            )
            FROM unnest("seed"."highlights") WITH ORDINALITY AS "highlight"("text", "position")
          )
        ),
        jsonb_build_object(
          'type', 'heading',
          'attrs', jsonb_build_object('level', 3),
          'content', jsonb_build_array(jsonb_build_object(
            'type', 'text',
            'text', 'Conseil de choix'
          ))
        ),
        jsonb_build_object(
          'type', 'paragraph',
          'content', jsonb_build_array(jsonb_build_object(
            'type', 'text',
            'text', "seed"."advice"
          ))
        )
      )
    ) AS "rich_text_description"
  FROM "seed"
)
UPDATE "products" "product"
SET
  "rich_text_description" = "rich_payload"."rich_text_description",
  "updated_at" = CURRENT_TIMESTAMP
FROM "rich_payload"
WHERE "product"."id" = "rich_payload"."product_id";
