-- Seed organizations from the former static brand/reference table.
-- value and logoUrl are intentionally ignored; logo_media_id is left untouched for manual setup.

INSERT INTO "organizations" (
  "slug",
  "name",
  "description",
  "is_product_brand",
  "is_reference",
  "is_partner",
  "created_at",
  "updated_at"
)
VALUES
  ('geotiles-ceramica', $$Geotiles Ceramica$$, $$Marque espagnole renommée pour ses revêtements de sol et muraux en céramique au design avant-gardiste.$$, true, false, true, now(), now()),
  ('sopal', $$Sopal$$, $$Leader tunisien dans la fabrication de robinetterie, d'articles sanitaires et d'accessoires de plomberie.$$, true, false, true, now(), now()),
  ('carthago-ceramic', $$Carthago Ceramic$$, $$L'un des principaux producteurs tunisiens de carreaux céramiques, grès cérame et équipements sanitaires.$$, true, false, true, now(), now()),
  ('ktl-ceramica', $$KTL Ceramica$$, $$Fabricant espagnol de céramique proposant des solutions innovantes et durables pour les sols et les murs.$$, true, false, true, now(), now()),
  ('tau-ceramica', $$TAU Ceramica$$, $$Référence mondiale dans la production de céramique espagnole, reconnue pour sa qualité et son innovation technique.$$, true, false, true, now(), now()),
  ('prissmacer-ceramica', $$Prissmacer Ceramica$$, $$Marque espagnole de carrelage offrant une large gamme de produits céramiques de haute qualité à des prix compétitifs.$$, true, false, true, now(), now()),
  ('geberit', $$Geberit$$, $$Groupe suisse et leader européen dans le domaine des produits sanitaires et des systèmes de tuyauterie.$$, true, false, true, now(), now()),
  ('deutsch-color', $$Deutsch Color$$, $$Fabricant international spécialisé dans la production de peintures, mastics et matériaux de construction.$$, true, false, true, now(), now()),
  ('rocersa', $$Rocersa$$, $$Entreprise espagnole pionnière dans la fabrication de grès cérame de grandes dimensions et de solutions pour l'extérieur.$$, true, false, true, now(), now()),
  ('sika', $$Sika$$, $$Groupe suisse leader dans les produits chimiques de spécialité pour la construction et l'industrie, notamment l'étanchéité.$$, true, false, true, now(), now()),
  ('undefasa', $$Undefasa$$, $$Fabricant espagnol de carreaux de céramique alliant une forte tradition industrielle à des designs contemporains.$$, true, false, true, now(), now()),
  ('alaplana-ceramica', $$Alaplana Ceramica$$, $$Marque espagnole innovante spécialisée dans les revêtements de sol et muraux en céramique.$$, true, false, true, now(), now()),
  ('navarti-ceramica', $$Navarti Ceramica$$, $$Entreprise espagnole produisant une vaste sélection de carreaux de sol et de mur de haute qualité.$$, true, false, true, now(), now()),
  ('pamesa-ceramica', $$Pamesa Ceramica$$, $$Groupe industriel espagnol de premier plan, spécialiste mondial du grès cérame et des revêtements céramiques.$$, true, false, true, now(), now()),
  ('new-tiles', $$New Tiles$$, $$Fabricant de céramique proposant des designs modernes et élégants adaptés aux divers espaces architecturaux.$$, true, false, true, now(), now()),
  ('somocer-group', $$Somocer Group$$, $$Acteur majeur en Tunisie dans la production et la commercialisation de carreaux en céramique et d'articles sanitaires.$$, true, false, true, now(), now()),
  ('ecoceramic-ceramica', $$Ecoceramic Ceramica$$, $$Marque espagnole proposant des produits céramiques écologiques, durables et innovants pour l'habitat.$$, true, false, true, now(), now()),
  ('marazzi', $$Marazzi$$, $$Marque italienne d'envergure internationale, symbole du meilleur design et de la qualité dans le secteur des carreaux de céramique.$$, true, false, true, now(), now()),
  ('san-marco', $$San Marco$$, $$Entreprise italienne spécialisée dans les systèmes de peinture et les revêtements décoratifs professionnels pour le bâtiment.$$, true, false, true, now(), now()),
  ('jaquar', $$Jaquar$$, $$Fabricant mondial d'équipements de salle de bains complets, incluant la robinetterie haut de gamme et les sanitaires.$$, true, false, false, now(), now()),
  ('grohe', $$Grohe$$, $$Marque allemande de renommée mondiale fournissant des équipements sanitaires et des systèmes d'eau innovants.$$, true, false, false, now(), now()),
  ('ciment-de-gabes', $$Ciment de Gabès$$, $$Société tunisienne de référence spécialisée dans la production et la distribution de ciment et de matériaux de construction.$$, true, false, false, now(), now()),
  ('robinson', $$Robinson$$, $$Chaîne de clubs de vacances premium, notamment présente avec son célèbre Club Robinson à Djerba.$$, false, true, false, now(), now()),
  ('djerba-land', $$Djerba Land$$, $$Parc d'attractions et de loisirs emblématique situé à Djerba, offrant diverses activités pour les familles.$$, false, true, false, now(), now()),
  ('pole-hospitalier-international-echifa', $$Pôle Hospitalier International Echifa$$, $$Établissement de santé privé, multidisciplinaire et moderne situé à Houmt Souk sur l'île de Djerba.$$, false, true, false, now(), now()),
  ('welcome-meridiana', $$Welcome Meridiana$$, $$Complexe hôtelier de charme situé à Djerba, réputé pour son architecture authentique et ses services de qualité.$$, false, true, false, now(), now()),
  ('vis-a-vis-immo-djerba', $$Vis-à-Vis Immo Djerba$$, $$Agence immobilière agréée basée à Midoun (Djerba), spécialisée dans l'achat, la vente et la construction clé en main.$$, false, true, false, now(), now()),
  ('djerba-beach-hotel', $$Djerba Beach Hotel$$, $$Hôtel balnéaire étoilé offrant des séjours de détente sur les plages paradisiaques de l'île de Djerba.$$, false, true, false, now(), now()),
  ('arij-polyclinique', $$Arij Polyclinique$$, $$Polyclinique moderne inaugurée en 2020 près de Midoun (Djerba), proposant des soins médicaux de pointe et des urgences 24h/24.$$, false, true, false, now(), now()),
  ('hotel-les-quatre-saisons', $$Hôtel les quatre saisons$$, $$Établissement hôtelier tunisien réputé offrant un accueil chaleureux et des prestations d'hébergement confortables.$$, false, true, false, now(), now()),
  ('polyclinique-djerba-internationale', $$Polyclinique Djerba Internationale$$, $$Centre hospitalier privé de référence à Djerba, équipé de technologies médicales de dernière génération.$$, false, true, false, now(), now()),
  ('vitrafix', $$VitraFix$$, $$Vitrafix est une marque spécialisée dans les produits de pose pour carrelage (colles, joints, étanchéité). Elle propose des solutions fiables et performantes adaptées aux travaux en intérieur comme en extérieur.$$, true, false, false, now(), now()),
  ('turkqua', $$Turkqua$$, $$Turkqua propose des produits écologiques de haute technologie leader dans le domaine de la construction moderne pour les produits de mortier sec, d'additif, d'primaire, d'étanchéité, d'enduit, de peinture et d'isolation thermique tout en respectant la nature.$$, true, false, false, now(), now())
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "is_product_brand" = EXCLUDED."is_product_brand",
  "is_reference" = EXCLUDED."is_reference",
  "is_partner" = EXCLUDED."is_partner",
  "updated_at" = now();
