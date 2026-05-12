from __future__ import annotations

import json
import math
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
SOURCE_MIGRATION = ROOT / "prisma/migrations/20260512210000_import_products_from_sheets/migration.sql"
OUTPUT_MIGRATION = SOURCE_MIGRATION
AUDIT_JSON = ROOT / ".codex-temp/product-import-audit.json"
SUMMARY_JSON = ROOT / ".codex-temp/product-import-summary.json"
MEDIA_RECORDS_JSON = ROOT / ".codex-temp/media-records.json"
SHEETS_DIR = Path("C:/Users/bahaz/Desktop/Products_sheets")

CREATED_BY_ID = "cmnnfemzf00008wg9iwn6hacx"
MIN_STOCK = 3
MIN_TEMPLATE_CONFIDENCE = 80
MIN_SUBCATEGORY_CONFIDENCE = 80
MIN_BRAND_AUTOCREATE_COUNT = 3

SUBCATEGORY_LABELS = {
    1: "Carrelage extérieur",
    2: "Carrelage intérieur",
    3: "Faïence murale",
    4: "Plinthes et accessoires",
    6: "Mosaïque à l'italienne",
    7: "Sables et graviers",
    8: "Treillis soudés et fers à béton",
    9: "Ciments et produits en béton",
    10: "Briques",
    11: "Étanchéité",
    12: "Isolation thermique",
    13: "Éviers de cuisine",
    14: "Robinetterie",
    15: "Baignoires",
    16: "Jacuzzis",
    17: "Lavabos et vasques",
    18: "Espace douche",
    19: "Béton ciré",
    20: "Peintures d'intérieur",
    21: "Peintures d'extérieur",
    22: "Margelles et finitions",
    23: "Mosaïques",
    24: "Pierres de Bali",
    25: "Portes coulissantes",
    26: "Portes en bois",
    27: "Adjuvants",
    28: "Produits de pose & finition",
    29: "Grès effet parquet",
    30: "Grandes dalles",
    31: "Carrelage antidérapant R11",
    32: "Carrelage effet béton",
    33: "Grès effet pierre naturelle",
}

TEMPLATE_LABELS = {
    "carrelage-sol-mur": "Carrelage sol/mur",
    "mosaique-decor-listel": "Mosaïque, décor & listel",
    "profile-plinthe-baguette": "Profilé, plinthe & baguette",
    "produit-pose-carrelage": "Colle, joint & produit de pose",
    "lavabo-lave-main": "Lavabo & lave-main",
    "vasque-bol-a-poser": "Vasque / bol à poser",
    "plan-vasque": "Plan vasque",
    "cuvette-wc": "Cuvette WC",
    "abattant-wc": "Abattant WC",
    "bati-support-reservoir-wc": "Bâti-support & réservoir WC",
    "plaque-commande-wc": "Plaque de commande WC",
    "meuble-sous-vasque": "Meuble sous-vasque / meuble SDB",
    "colonne-armoire-sdb": "Colonne / armoire SDB",
    "miroir-eclairage-sdb": "Miroir & éclairage SDB",
    "accessoire-salle-de-bain": "Accessoire salle de bain",
    "mitigeur-lavabo-vasque": "Mitigeur lavabo / vasque",
    "mitigeur-douche-bain": "Mitigeur douche / bain-douche",
    "mitigeur-evier": "Mitigeur évier",
    "corps-encastre-inverseur": "Corps encastré & inverseur",
    "colonne-barre-douche": "Colonne / barre de douche",
    "douchette-tete-bras-flexible": "Douchette, tête, bras & flexible",
    "paroi-de-douche": "Paroi de douche",
    "cabine-de-douche": "Cabine de douche",
    "receveur-caniveau": "Receveur & caniveau",
    "baignoire": "Baignoire",
    "baignoire-balneo-hydromassage": "Baignoire balnéo / hydromassage",
    "accessoire-baignoire": "Accessoire baignoire",
    "evier-cuisine": "Évier de cuisine",
    "bonde-siphon-vidage": "Bonde, siphon & vidage",
    "flexible-raccord-eau": "Flexible & raccord eau",
    "raccord-pvc-evacuation": "Raccord PVC & évacuation",
    "materiau-batiment-jardin": "Matériau bâtiment / jardin",
    "luminaire-borne-exterieure": "Luminaire / borne extérieure",
    "porte-chassis": "Porte & châssis",
    "peinture": "Peinture",
    "beton-cire": "Béton ciré",
    "brique": "Brique",
    "sable-gravier": "Sable & gravier",
    "treillis-fer-beton": "Treillis & fer à béton",
}

EXTRA_TEMPLATES = [
    {
        "slug": "peinture",
        "name": "Peinture",
        "group_slug": "construction-exterieur",
        "description": "Peintures intérieures et extérieures, mastics décoratifs et finitions murales.",
        "sort_order": 830,
        "has_color": True,
        "has_finish": False,
        "preset_stock_unit": "PIECE",
        "preset_tags": "peinture intérieur extérieur finition décoration mur",
    },
    {
        "slug": "beton-cire",
        "name": "Béton ciré",
        "group_slug": "construction-exterieur",
        "description": "Béton ciré, enduits décoratifs et finitions minérales.",
        "sort_order": 840,
        "has_color": True,
        "has_finish": True,
        "preset_stock_unit": "PIECE",
        "preset_tags": "béton-ciré enduit décoratif finition minéral",
    },
    {
        "slug": "brique",
        "name": "Brique",
        "group_slug": "construction-exterieur",
        "description": "Briques, hourdis et produits de maçonnerie.",
        "sort_order": 850,
        "has_color": False,
        "has_finish": False,
        "preset_stock_unit": "PIECE",
        "preset_tags": "brique hourdis maçonnerie construction",
    },
    {
        "slug": "sable-gravier",
        "name": "Sable & gravier",
        "group_slug": "construction-exterieur",
        "description": "Sables, graviers, graves et granulats.",
        "sort_order": 860,
        "has_color": False,
        "has_finish": False,
        "preset_stock_unit": "PIECE",
        "preset_tags": "sable gravier granulat construction",
    },
    {
        "slug": "treillis-fer-beton",
        "name": "Treillis & fer à béton",
        "group_slug": "construction-exterieur",
        "description": "Treillis soudés, cadres, fils et fers à béton.",
        "sort_order": 870,
        "has_color": False,
        "has_finish": False,
        "preset_stock_unit": "PIECE",
        "preset_tags": "treillis fer-à-béton armature construction",
    },
]

BRAND_FALLBACK = {
    "geberit": "Geberit",
    "gsi": "GSI",
    "jaquar": "Jaquar",
    "lemon": "Lemon",
    "lilot": "Lilot",
    "grohe": "Grohe",
    "sopal": "Sopal",
    "sika": "Sika",
    "deutsch-color": "Deutsch Color",
    "vitrafix": "VitraFix",
    "somocer-group": "Somocer Group",
    "carthago-ceramic": "Carthago Ceramic",
    "ecoceramic-ceramica": "Ecoceramic Ceramica",
    "pamesa-ceramica": "Pamesa Ceramica",
    "marazzi": "Marazzi",
    "prissmacer-ceramica": "Prissmacer Ceramica",
    "geotiles-ceramica": "Geotiles Ceramica",
    "tau-ceramica": "TAU Ceramica",
    "ktl-ceramica": "KTL Ceramica",
    "alaplana-ceramica": "Alaplana Ceramica",
    "navarti-ceramica": "Navarti Ceramica",
}

BRAND_DESCRIPTIONS = {
    "GSI": "Marque sanitaire orientée céramique de salle de bain, lavabos, vasques, cuvettes et abattants.",
    "Lemon": "Marque d'éviers et solutions cuisine, notamment en granite composite.",
    "Lilot": "Marque d'équipements de salle de bain, baignoires, parois, receveurs et meubles.",
    "Duravit": "Marque internationale d'équipements sanitaires et meubles de salle de bain.",
    "Ideal Standard": "Marque d'équipements sanitaires, robinetterie et solutions de salle de bain.",
}

SOURCE_BRANDS = {
    "GEBRIT.xls": "Geberit",
    "GSI.xls": "GSI",
    "JAQUAR.xls": "Jaquar",
    "LEMON.xls": "Lemon",
    "LILOT.xls": "Lilot",
    "SOPAL.xls": "Sopal",
}

BRAND_ALIASES = [
    ("GEBERIT", "Geberit"),
    ("GEBRIT", "Geberit"),
    ("GSI", "GSI"),
    ("JAQUAR", "Jaquar"),
    ("LEMON", "Lemon"),
    ("LILOT", "Lilot"),
    ("GROHE", "Grohe"),
    ("SOPAL", "Sopal"),
    ("SIKA", "Sika"),
    ("DEUTSCH COLOR", "Deutsch Color"),
    ("VITRAFIX", "VitraFix"),
    ("SOMOCER", "Somocer Group"),
    ("CARTHAGO", "Carthago Ceramic"),
    ("ECOCERAMIC", "Ecoceramic Ceramica"),
    ("PAMESA", "Pamesa Ceramica"),
    ("MARAZZI", "Marazzi"),
    ("PRISSMACER", "Prissmacer Ceramica"),
    ("GEOTILES", "Geotiles Ceramica"),
    ("TAU", "TAU Ceramica"),
    ("KTL", "KTL Ceramica"),
    ("ALAPLANA", "Alaplana Ceramica"),
    ("NAVARTI", "Navarti Ceramica"),
    ("IBERO", "Ibero"),
    ("DURAVIT", "Duravit"),
    ("IDEAL STANDARD", "Ideal Standard"),
    ("SANIMED", "Sanimed"),
    ("SANIBEL", "Sanibel"),
    ("SOFCA", "Sofcasud"),
    ("SOFCASUD", "Sofcasud"),
    ("ROCA", "Roca"),
    ("VADA", "Vada"),
    ("SOCER", "Socer"),
    ("DURAWOOD", "Durawood"),
    ("SOTEMAIL", "Sotemail"),
    ("ARTEMAIL", "Artemail"),
    ("DOREMAIL", "Doremail"),
    ("CINCA", "Cinca"),
    ("PRESTIGE", "Prestige Ceramic"),
    ("Q ONE", "Q One"),
    ("Q-ONE", "Q One"),
]

FINISH_DEFINITIONS = {
    "chrome": ("Chrome", "#C8CDD0"),
    "noir-mat": ("Noir mat", "#202020"),
    "chrome-noir": ("Chrome noir", "#111111"),
    "nickel-poli": ("Nickel poli", "#B8AD8F"),
    "nickel-brosse": ("Nickel brossé", "#8F8568"),
    "graphite": ("Graphite", "#444444"),
    "anthracite-graphite-dur": ("Anthracite - graphite dur", "#5F5853"),
    "anthracite-graphite-satine": ("Anthracite - graphite satiné", "#3A3A3A"),
    "blanc": ("Blanc", "#FFFFFF"),
    "blanc-chrome": ("Blanc chrome", "#E6E6E6"),
    "cuivre-antique": ("Cuivre antique", "#7B4C3A"),
    "acier-inoxydable": ("Acier inoxydable", "#BFC5C5"),
    "or-rose-pvd": ("Or rosé PVD", "#8A4C32"),
    "or-rose-brillant-pvd": ("Or rosé brillant PVD", "#A47A42"),
    "or-mat-pvd": ("Or mat PVD", "#8B6B37"),
    "or-brillant-pvd": ("Or brillant PVD", "#A08332"),
    "dore-cool-sunrise": ("Doré - Cool Sunrise", "#B8995E"),
    "dore-cool-sunrise-brosse": ("Doré - Cool Sunrise brossé", "#8B6C3F"),
    "bronze-warm-sunset-brosse": ("Bronze - Warm Sunset brossé", "#9B5C30"),
    "vert-sopal": ("Vert Sopal", "#3D5F45"),
    "bleu-sopal": ("Bleu Sopal", "#4B638D"),
}

COLOR_DEFINITIONS = {
    "blanc": ("Blanc", "#FFFFFF"),
    "noir": ("Noir", "#1E1E1C"),
    "gris": ("Gris", "#7D7F7D"),
    "gris-clair": ("Gris clair", "#C9C9C9"),
    "beige": ("Beige", "#D9C9A5"),
    "anthracite": ("Anthracite", "#3E4347"),
    "graphite": ("Graphite", "#4F5357"),
    "bleu": ("Bleu", "#282F98"),
    "rouge": ("Rouge", "#FF1F35"),
    "vert": ("Vert", "#3F5F4A"),
    "argent": ("Argent", "#CCCCCC"),
    "marron": ("Marron", "#7A5A46"),
    "terracotta": ("Cotto", "#B5654D"),
    "beige-18": ("Beige 18", "#D8C3A5"),
}

DISPLAY_REPLACEMENTS = [
    (r"\bABAT\b", "Abattant"),
    (r"\bCUV\b", "Cuvette"),
    (r"\bSUSP\b", "suspendue"),
    (r"\bLAV\b", "Lavabo"),
    (r"\bVASQ\b", "Vasque"),
    (r"\bEVI\b", "Évier"),
    (r"\bEVIER\b", "Évier"),
    (r"\bBATI\b", "Bâti"),
    (r"\bCHASSE\b", "chasse"),
    (r"\bMIT\b", "Mitigeur"),
    (r"\bMEL\b", "Mélangeur"),
    (r"\bMELANGEUR\b", "Mélangeur"),
    (r"\bDCH\b", "douche"),
    (r"\bDOUCH\b", "douche"),
    (r"\bFLEXIBE\b", "Flexible"),
    (r"\bFLEXIB\b", "Flexible"),
    (r"\bCARRE\b", "Carré"),
    (r"\bTETE\b", "Tête"),
    (r"\bMETALLISE\b", "métallisé"),
    (r"\bENCAS\b", "encastré"),
    (r"\bLAVAB\b", "lavabo"),
    (r"\bINV\b", "inverseur"),
    (r"\b2FONCT\b", "2 fonctions"),
    (r"\bP/SERVIETTE\b", "porte-serviette"),
    (r"\bS/B\b", "sous-vasque"),
    (r"\bGRE\b", "Grès"),
    (r"\bGRES\b", "Grès"),
    (r"\bCAR\b\.?", "Carrelage"),
    (r"(?<![A-Z0-9-])CHR(?![A-Z0-9-])", "Chrome"),
    (r"\bAMORT\b", "amortisseur"),
    (r"\bREF\b", "Réf."),
    (r"\bAVEC\b", "avec"),
    (r"\bSANS\b", "sans"),
]

ACRONYMS = {
    "WC",
    "PVC",
    "PVD",
    "R11",
    "LED",
    "PMR",
    "NF",
    "ISO",
    "SDB",
    "GSI",
    "GROHE",
}

SMALL_WORDS = {"de", "du", "des", "d", "à", "a", "avec", "sans", "pour", "en", "et"}


def extract_block(sql: str, tag: str) -> list[dict]:
    match = re.search(rf"\${tag}\$(.*?)\${tag}\$", sql, re.S)
    if not match:
        return []
    return json.loads(match.group(1))


def strip_accents(value: str) -> str:
    return "".join(ch for ch in unicodedata.normalize("NFKD", value) if not unicodedata.combining(ch))


def norm(value: str) -> str:
    value = strip_accents(value).upper()
    value = re.sub(r"[^A-Z0-9/.,+&'\- ]+", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def slugify(value: str) -> str:
    value = strip_accents(value).lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return re.sub(r"-+", "-", value).strip("-") or "produit"


def compact(value: str) -> str:
    return re.sub(r"[^A-Z0-9]+", "", strip_accents(value).upper())


def quantity(value) -> float:
    if value is None:
        return 0.0
    try:
        if math.isnan(float(value)):
            return 0.0
    except (TypeError, ValueError):
        return 0.0
    return round(float(value), 3)


def clamp(value: str, max_len: int) -> str:
    value = re.sub(r"\s+", " ", value).strip()
    if len(value) <= max_len:
        return value
    clipped = value[: max_len + 1]
    if " " in clipped:
        clipped = clipped.rsplit(" ", 1)[0]
    return clipped[:max_len].rstrip(" .,;:-")


def money(value) -> float | None:
    if value is None:
        return None
    try:
        if math.isnan(float(value)):
            return None
    except (TypeError, ValueError):
        return None
    return round(float(value), 3)


def is_non_product(raw_name: str) -> bool:
    n = norm(raw_name)
    return bool(
        re.search(
            r"\b(ECHANTILLON|ECHANT|SAMPLE|DEMO|EXPO|AFFICHE|PRESENTOIR|CATALOGUE|TRANSPORT|MAIN D OEUVRE|REMISE|AVOIR)\b",
            n,
        )
    )


def refs(raw_name: str) -> list[str]:
    found = set()
    for pattern in [
        r"\(([A-Z0-9][A-Z0-9.\-/]{4,})\)",
        r"\bREF\.?\s*([A-Z0-9][A-Z0-9.\-/]{3,})\b",
        r"\b([A-Z]{2,4}-[A-Z0-9]{2,5}-[A-Z0-9\-]{3,})\b",
        r"\b(\d{3}\.\d{3}\.\d{2}\.\d)\b",
        r"\b(\d{3,4}[A-Z]\d{2,}[A-Z0-9]*)\b",
    ]:
        for match in re.findall(pattern, raw_name.upper()):
            if isinstance(match, tuple):
                match = match[0]
            found.add(match.strip(" .,-"))
    return sorted(found)


def dimensions(raw_name: str) -> list[str]:
    found = set()
    patterns = [
        r"\b(\d+(?:[,.]\d+)?\s*[xX/]\s*\d+(?:[,.]\d+)?(?:\s*[xX/]\s*\d+(?:[,.]\d+)?)?\s*(?:CM|MM|M)?)\b",
        r"\b(\d+(?:[,.]\d+)?)\s*(CM|MM|M)\b",
    ]
    for pattern in patterns:
        for match in re.findall(pattern, raw_name.upper()):
            value = match[0] if isinstance(match, tuple) else match
            unit = match[1] if isinstance(match, tuple) and len(match) > 1 else ""
            dim = (value + unit).replace(" ", "")
            if re.search(r"\d", dim):
                found.add(dim)
    return sorted(found)


def has_any(n: str, *needles: str) -> bool:
    return any(needle in n for needle in needles)


def classify(raw_name: str) -> dict:
    n = norm(raw_name)
    reasons: list[str] = []

    def result(template: str | None, t_conf: int, subcats: list[int], s_conf: int, reason: str):
        return {
            "template_slug": template,
            "template_confidence": t_conf,
            "subcategory_ids": subcats,
            "subcategory_confidence": s_conf,
            "classification_reason": reason,
        }

    if is_non_product(raw_name):
        return result(None, 0, [], 0, "Excluded: non-product/catalog/service row.")

    # Sanitary and plumbing: no fallback to a generic bathroom category when no exact subcategory exists.
    if re.search(r"\b(ABAT|ABATTANT)\b", n):
        return result("abattant-wc", 90, [], 0, "No exact WC-seat subcategory exists; needs taxonomy review.")
    if re.search(r"\b(CUV|CUVETTE)\b", n):
        return result("cuvette-wc", 90, [], 0, "No exact WC subcategory exists; needs taxonomy review.")
    if "BATI" in n and ("CHASSE" in n or "SUPPORT" in n):
        return result("bati-support-reservoir-wc", 90, [], 0, "No exact bâti-support WC subcategory exists; needs taxonomy review.")
    if "PLAQUE" in n and has_any(n, "GEBERIT", "GROHE", "SIGMA", "ALPHA", "CHASSE"):
        return result("plaque-commande-wc", 90, [], 0, "No exact plaque de commande WC subcategory exists; needs taxonomy review.")
    if "CORPS" in n and has_any(n, "ENCA", "ENCAST", "ENCASTR", "INVERSEUR", "INV") and has_any(n, "MIT", "ROBINET"):
        return result("corps-encastre-inverseur", 88, [14], 84, "Concealed faucet body/inverter under robinetterie.")
    if has_any(n, "MITIGEUR", "MIT.", "MIT ", "MELANGEUR", "MEL.", "ROBINET"):
        if has_any(n, "EVIER", "CUISINE"):
            return result("mitigeur-evier", 95, [14, 13], 92, "Kitchen faucet: robinetterie + évier cuisine.")
        if has_any(n, "BAIN", "BAIGNOIRE", "DOUCHE", "B/D"):
            return result("mitigeur-douche-bain", 95, [14, 18], 92, "Bath/shower faucet: robinetterie + espace douche.")
        return result("mitigeur-lavabo-vasque", 90, [14, 17], 88, "Lavabo/vasque faucet: robinetterie + lavabos.")
    if has_any(n, "COLONNE DE DOUCHE", "BARRE DE DOUCHE"):
        return result("colonne-barre-douche", 95, [18], 95, "Exact shower-space product.")
    if has_any(n, "DOUCHETTE", "FLEXIBLE DE DOUCHE", "FLEXIBE DE DOUCHE", "BRAS DE DOUCHE", "TETE DE DOUCHE", "POMMEAU"):
        return result("douchette-tete-bras-flexible", 92, [18], 92, "Shower accessory.")
    if "PAROI" in n and "DOUCHE" in n:
        return result("paroi-de-douche", 95, [18], 95, "Exact shower partition.")
    if "CABINE" in n and "DOUCHE" in n:
        return result("cabine-de-douche", 95, [18], 95, "Exact shower cabin.")
    if has_any(n, "RECEVEUR", "CANIVEAU"):
        return result("receveur-caniveau", 95, [18], 95, "Exact shower tray/channel.")
    if "BAIGNOIRE" in n:
        if has_any(n, "BALNEO", "HYDRO", "HYDROMASSAGE", "JACUZZI"):
            return result("baignoire-balneo-hydromassage", 95, [15, 16], 92, "Hydromassage bath.")
        return result("baignoire", 95, [15], 95, "Exact bath product.")
    if has_any(n, "EVIER", "EVIE ", "EVI "):
        return result("evier-cuisine", 95, [13], 95, "Exact kitchen sink product.")
    if has_any(n, "LAVABO", "LAV ", "VASQUE", "PLAN VASQUE", "BOL "):
        if "PLAN" in n and "VASQUE" in n:
            return result("plan-vasque", 92, [17], 90, "Plan vasque under lavabos.")
        if "VASQUE" in n or "BOL " in n:
            return result("vasque-bol-a-poser", 92, [17], 90, "Vasque under lavabos.")
        return result("lavabo-lave-main", 92, [17], 90, "Lavabo/lave-main.")
    if has_any(n, "MEUBLE SDB", "MEUBLE SOUS", "S/VASQUE", "SOUS VASQUE", "S/B"):
        return result("meuble-sous-vasque", 88, [17], 82, "Bathroom vanity under lavabos; close but accepted.")
    if has_any(n, "BONDE", "SIPHON", "VIDAGE"):
        if has_any(n, "EVIER", "CUISINE"):
            return result("bonde-siphon-vidage", 88, [13], 84, "Kitchen sink waste/accessory.")
        if has_any(n, "LAVABO", "VASQUE", "BAIN", "DOUCHE"):
            return result("bonde-siphon-vidage", 88, [17], 82, "Bathroom waste/accessory.")
        return result("bonde-siphon-vidage", 80, [], 0, "Waste/accessory without exact destination.")

    # Tiles and ceramic.
    tile_keyword = has_any(n, "CARRELAGE", "GRES", "GRE ", "CAR.", "FAIENCE", "FAÏENCE", "MOSA", "LISTEL", "PLINTHE")
    if tile_keyword:
        if has_any(n, "MOSA", "MOSAIQUE", "MOSAÏQUE", "LISTEL", "DECOR", "DÉCOR"):
            return result("mosaique-decor-listel", 94, [23], 94, "Mosaic/decor/listel.")
        if has_any(n, "PLINTHE", "BAGUETTE", "PROFILE", "PROFIL"):
            return result("profile-plinthe-baguette", 92, [4], 92, "Profile/plinth/accessory.")
        subcats = []
        if has_any(n, "R11", "ANTIDERAP", "ANTIDÉRAP", "EXTERIEUR", "EXT "):
            subcats.extend([1, 31])
        elif has_any(n, "FAIENCE", "FAÏENCE", "MURAL", "MUR "):
            subcats.append(3)
        else:
            subcats.append(2)
        if has_any(n, "PARQUET", "BOIS"):
            subcats.append(29)
        if has_any(n, "BETON", "BÉTON", "CIMENT"):
            subcats.append(32)
        if has_any(n, "PIERRE", "MARBRE", "TRAVERTIN", "ONYX"):
            subcats.append(33)
        if max_dimension(raw_name) >= 80:
            subcats.append(30)
        return result("carrelage-sol-mur", 88, sorted(set(subcats)), 86, "Ceramic/tile rule with explicit tile keyword.")
    if has_any(n, "MARGELLE"):
        return result("materiau-batiment-jardin", 86, [22], 86, "Margelle/finitions.")
    if has_any(n, "PIERRE DE BALI"):
        return result("materiau-batiment-jardin", 88, [24], 88, "Pierre de Bali.")

    # Building materials and finishing chemistry.
    if has_any(n, "CIMENT COLLE", "CARROJOINT", "JOINT", "COLLE", "MORTIER", "SIKACERAM", "VITRAFIX"):
        return result("produit-pose-carrelage", 94, [28], 94, "Tile adhesive/joint/finishing product.")
    if has_any(n, "ETANCH", "ÉTANCH", "BITU", "HYDRO", "ISOLINE", "WATERSTOP", "MEMBRANE"):
        return result("materiau-batiment-jardin", 84, [11], 84, "Waterproofing product.")
    if has_any(n, "SIKALATEX", "ADMIX", "ADJUVANT", "LATEX"):
        return result("materiau-batiment-jardin", 86, [27], 86, "Adjuvant/additive.")
    if has_any(n, "PEINTURE", "SPATORELLA", "HYDRO DC", "MASTIC"):
        subcat = 21 if has_any(n, "EXTER", "EXT ") else 20
        return result("peinture", 86, [subcat], 84, "Paint/decorative finish.")
    if has_any(n, "BETON CIRE", "BÉTON CIRÉ"):
        return result("beton-cire", 90, [19], 90, "Béton ciré.")
    if has_any(n, "BRIQUE", "HOURD", "HOURDIS"):
        return result("brique", 92, [10], 92, "Brick/hourdis.")
    if has_any(n, "SABLE", "GRAVIER", "GRAVE", "CONCASSAGE", "GRANULAT"):
        return result("sable-gravier", 92, [7], 92, "Sand/gravel/granulate.")
    if has_any(n, "TREILLIS", "FER A BETON", "FER À BETON", "FER À BÉTON", "FIL RECUIT", "CADRE", "EPINGLE", "ETRIER"):
        return result("treillis-fer-beton", 90, [8], 88, "Rebar/trellis/metal frame.")
    if "CIMENT" in n:
        return result("materiau-batiment-jardin", 86, [9], 86, "Cement product.")
    if has_any(n, "ISOLATION", "ISOLANT", "POLYANE"):
        return result("materiau-batiment-jardin", 84, [12], 84, "Thermal/insulation product.")
    if has_any(n, "PORTE COULISSANTE", "CHASSIS COULISSANT", "CHÂSSIS COULISSANT"):
        return result("porte-chassis", 88, [25], 88, "Sliding door/chassis.")
    if has_any(n, "PORTE BOIS", "PORTE EN BOIS"):
        return result("porte-chassis", 88, [26], 88, "Wooden door.")

    return result(None, 0, [], 0, "No strict product template/subcategory rule matched.")


def max_dimension(raw_name: str) -> float:
    values: list[float] = []
    for dim in dimensions(raw_name):
        for part in re.split(r"[Xx/]", dim):
            match = re.search(r"\d+(?:[,.]\d+)?", part)
            if match:
                try:
                    values.append(float(match.group(0).replace(",", ".")))
                except ValueError:
                    pass
    return max(values) if values else 0


def brand_name(slug: str | None, brand_records: dict[str, dict]) -> str | None:
    if not slug:
        return None
    if slug in brand_records:
        return brand_records[slug].get("name")
    return BRAND_FALLBACK.get(slug) or " ".join(part.capitalize() for part in slug.split("-"))


def detect_brand(raw_name: str, sources: set[str]) -> str | None:
    n = norm(raw_name)
    for alias, brand in BRAND_ALIASES:
        if re.search(rf"(^| ){re.escape(norm(alias))}( |$)", n):
            return brand
    for source in sorted(sources):
        if source in SOURCE_BRANDS:
            return SOURCE_BRANDS[source]
    return None


def detect_finish(raw_name: str) -> dict | None:
    n = norm(raw_name)
    patterns = [
        ("BLANC CHROME", "blanc-chrome"),
        ("CHROME NOIR", "chrome-noir"),
        ("NOIR MATT", "noir-mat"),
        ("NOIR MAT", "noir-mat"),
        ("BLACK MATT", "noir-mat"),
        ("BLM", "noir-mat"),
        ("NICKEL BROSSE", "nickel-brosse"),
        ("NICKEL BROSS", "nickel-brosse"),
        ("NICKEL POLI", "nickel-poli"),
        ("GRAPHITE SATIN", "anthracite-graphite-satine"),
        ("HARD GRAPHITE", "anthracite-graphite-dur"),
        ("ANTHRACITE", "anthracite-graphite-dur"),
        ("GRAPHITE", "graphite"),
        ("CUIVRE ANTIQUE", "cuivre-antique"),
        ("ACIER INOX", "acier-inoxydable"),
        ("INOX", "acier-inoxydable"),
        ("ROSE BRILLANT", "or-rose-brillant-pvd"),
        ("ROSE PVD", "or-rose-pvd"),
        ("OR BRILLANT", "or-brillant-pvd"),
        ("OR MATT", "or-mat-pvd"),
        ("OR MAT", "or-mat-pvd"),
        ("COOL SUNRISE BROSSE", "dore-cool-sunrise-brosse"),
        ("COOL SUNRISE", "dore-cool-sunrise"),
        ("WARM SUNSET", "bronze-warm-sunset-brosse"),
        ("SOPAL GREEN", "vert-sopal"),
        ("SOPAL BLUE", "bleu-sopal"),
        ("CHROME", "chrome"),
        (" CHR ", "chrome"),
        ("BLANC", "blanc"),
    ]
    padded = f" {n} "
    for needle, key in patterns:
        if needle in padded:
            label, hex_color = FINISH_DEFINITIONS[key]
            return {"key": key, "label": label, "hex_color": hex_color}
    return None


def detect_color(raw_name: str) -> dict | None:
    n = norm(raw_name)
    patterns = [
        ("GRIS CLAIR", "gris-clair"),
        ("ANTHRACITE", "anthracite"),
        ("GRAPHITE", "graphite"),
        ("BEIGE 18", "beige-18"),
        ("BEIGE", "beige"),
        ("BLANC", "blanc"),
        ("WHITE", "blanc"),
        ("NOIR", "noir"),
        ("BLACK", "noir"),
        ("GRIS", "gris"),
        ("BLEU", "bleu"),
        ("BLUE", "bleu"),
        ("ROUGE", "rouge"),
        ("RED", "rouge"),
        ("VERT", "vert"),
        ("GREEN", "vert"),
        ("ARGENT", "argent"),
        ("SILVER", "argent"),
        ("MARRON", "marron"),
        ("TERRACOTTA", "terracotta"),
    ]
    padded = f" {n} "
    for needle, key in patterns:
        if needle in padded:
            label, value = COLOR_DEFINITIONS[key]
            return {"key": key, "label": label, "value": value}
    return None


def load_sheet_rows() -> list[dict]:
    rows_by_sku: dict[str, dict] = {}
    source_files: dict[str, set[str]] = defaultdict(set)
    for path in sorted(SHEETS_DIR.glob("*.xls")):
        df = pd.read_excel(path, sheet_name="A", engine="xlrd", header=None, dtype=object)
        for _, series in df.iterrows():
            raw_code = series.iloc[0]
            if raw_code is None or (isinstance(raw_code, float) and math.isnan(raw_code)):
                continue
            sku = str(raw_code).strip()
            if not re.fullmatch(r"\d{5,}", sku):
                continue
            name = str(series.iloc[1]).strip() if not pd.isna(series.iloc[1]) else ""
            if not name or name.lower() == "nan":
                continue
            candidate = {
                "sku": sku,
                "name": name,
                "base_price": money(series.iloc[2]),
                "stock_available": quantity(series.iloc[3]),
                "source_file": path.name,
            }
            source_files[sku].add(path.name)
            current = rows_by_sku.get(sku)
            if current is None or (current["source_file"] == "SelArt1TOUT.xls" and path.name != "SelArt1TOUT.xls"):
                rows_by_sku[sku] = candidate

    media_records = json.loads(MEDIA_RECORDS_JSON.read_text(encoding="utf-8")) if MEDIA_RECORDS_JSON.exists() else []
    products = []
    for row in rows_by_sku.values():
        sources = source_files[row["sku"]]
        brand = detect_brand(row["name"], sources)
        brand_slug = slugify(brand) if brand else None
        finish = detect_finish(row["name"])
        color = detect_color(row["name"])
        attrs = derived_attributes(row["name"], finish, color)
        product = {
            "sku": row["sku"],
            "name": row["name"],
            "base_price": row["base_price"],
            "stock_available": row["stock_available"],
            "brand_slug": brand_slug,
            "media": media_candidates(row["name"], media_records),
            "attributes": attrs,
            "source_file": row["source_file"],
        }
        products.append(product)
    return products


def media_candidates(raw_name: str, media_records: list[dict]) -> list[dict]:
    product_media = [m for m in media_records if m.get("folder_id") in {4, 5}]
    name_norm = norm(raw_name)
    name_words = [w for w in name_norm.split() if len(w) >= 4 and w not in {"AVEC", "SANS", "POUR"}]
    reference_tokens = [compact(ref) for ref in refs(raw_name) if len(compact(ref)) >= 4]
    matches = []
    for media in product_media:
        filename = media.get("original_filename") or ""
        media_compact = compact(filename)
        media_words = set(norm(filename).split())
        score = 0
        if any(ref and ref in media_compact for ref in reference_tokens):
            score += 120
        shared = sum(1 for word in name_words if word in media_words)
        if shared >= 4:
            score += 90
        if score < 90:
            continue
        role = "TECHNICAL" if media.get("kind") == "DOCUMENT" or filename.lower().endswith(".pdf") else "GALLERY"
        matches.append(
            {
                "media_id": int(media["id"]),
                "role": role,
                "name": filename,
                "alt_text": clean_media_alt(raw_name),
                "sort_order": 0 if role == "GALLERY" else 10,
                "score": score,
            }
        )
    matches.sort(key=lambda item: (-item["score"], item["sort_order"], item["media_id"]))
    unique = []
    seen = set()
    for match in matches[:3]:
        media_id = match["media_id"]
        if media_id in seen:
            continue
        seen.add(media_id)
        match.pop("score", None)
        unique.append(match)
    return unique


def clean_media_alt(raw_name: str) -> str:
    return clamp(clean_display_name(raw_name, None, {}), 255)


def derived_attributes(raw_name: str, finish: dict | None, color: dict | None) -> list[dict]:
    attrs = []

    def add(key, label, value, unit=None, input_type="TEXT", group="Général", filterable=True):
        if value is None or str(value).strip() == "":
            return
        attrs.append(
            {
                "key": key,
                "label": label,
                "value": clamp(str(value), 255),
                "unit": unit,
                "input_type": input_type,
                "is_filterable": filterable,
                "group_name": group,
                "group_sort_order": 0,
                "sort_order": len(attrs) * 10,
            }
        )

    ref_values = refs(raw_name)
    if ref_values:
        add("manufacturer_ref", "Référence fabricant", ", ".join(ref_values), filterable=True)
    dim_values = dimensions(raw_name)
    if dim_values:
        add("dimensions_text", "Dimensions", " / ".join(dim_values), group="Dimensions")
    if finish:
        add("finish", "Finition", finish["label"], input_type="FINISH", group="Finition")
    if color:
        add("color", "Couleur", color["label"], input_type="COLOR", group="Couleur")
    n = norm(raw_name)
    if "AMORT" in n:
        add("soft_close", "Fermeture amortie", "true", input_type="BOOLEAN", group="Fonctions")
    if "SLIM" in n:
        add("slim_seat", "Design slim", "true", input_type="BOOLEAN", group="Fonctions")
    if "THERM" in n:
        add("thermostatic", "Thermostatique", "true", input_type="BOOLEAN", group="Fonctions")
    if "INVERSEUR" in n or "INV" in n:
        add("diverter", "Inverseur", "true", input_type="BOOLEAN", group="Fonctions")
    weight_match = re.search(r"\b(\d+(?:[,.]\d+)?)\s*KG\b", raw_name.upper())
    if weight_match:
        add("packaging_weight_kg", "Conditionnement", weight_match.group(1).replace(",", "."), "kg", "NUMBER", "Conditionnement")
    return attrs


def clean_display_name(raw_name: str, brand_slug: str | None, brand_records: dict[str, dict]) -> str:
    value = raw_name.strip()
    value = re.sub(r"\s+", " ", value)
    value = re.sub(r"(?<=[A-Za-z])\.(?=[A-Za-z])", " ", value)
    for pattern, replacement in DISPLAY_REPLACEMENTS:
        value = re.sub(pattern, replacement, value, flags=re.I)
    value = re.sub(r"\bD['’]encastré\b", "encastré", value, flags=re.I)
    value = re.sub(r"\bD['’]enca\b", "encastré", value, flags=re.I)
    value = value.replace("  ", " ")
    words = []
    for word in re.split(r"(\s+)", value):
        if not word or word.isspace():
            words.append(word)
            continue
        clean = word.strip("()[]")
        clean_lower = strip_accents(clean).lower()
        looks_like_ref = bool(re.search(r"\d", clean) and re.fullmatch(r"[A-Z0-9.\-/]+", clean))
        if clean.upper() in ACRONYMS or looks_like_ref:
            words.append(word.upper())
        elif clean_lower in SMALL_WORDS:
            words.append(clean_lower)
        elif re.search(r"[a-zà-ÿ]", word):
            words.append(word[:1].upper() + word[1:])
        else:
            words.append(word[:1].upper() + word[1:].lower())
    value = "".join(words)
    value = re.sub(r"\s+([),])", r"\1", value)
    value = re.sub(r"([(])\s+", r"\1", value)
    value = re.sub(r"\s+", " ", value).strip()
    brand = brand_name(brand_slug, brand_records)
    if brand:
        value = re.sub(rf"\b{re.escape(brand)}\b", "", value, flags=re.I)
        value = re.sub(r"\s+", " ", value).strip(" -")
        value = f"{brand} - {value}" if value else brand
    return clamp(value, 255)


def title_seo(display_name: str) -> str:
    suffix = " | COBAM GROUP"
    return f"{clamp(display_name, 60 - len(suffix))}{suffix}"


def seo_description(display_name: str, template_slug: str, brand_slug: str | None, brand_records: dict[str, dict]) -> str:
    brand = brand_name(brand_slug, brand_records)
    template = TEMPLATE_LABELS.get(template_slug, "produit")
    prefix = f"{display_name}"
    if brand and brand.lower() not in display_name.lower():
        prefix = f"{brand} {prefix}"
    return clamp(f"{prefix} : {template.lower()} sélectionné par COBAM GROUP en Tunisie.", 160)


def attr_value(attrs: list[dict], key: str) -> str | None:
    for attr in attrs:
        if attr.get("key") == key or attr.get("name") == key:
            value = attr.get("value")
            if value not in (None, ""):
                return str(value)
    return None


def rich_description(product: dict, brand_records: dict[str, dict]) -> dict:
    display = product["display_name"]
    template = TEMPLATE_LABELS.get(product["product_type_slug"], "produit")
    brand = brand_name(product.get("brand_slug"), brand_records)
    intro = f"{display} est un {template.lower()} sélectionné pour le catalogue COBAM GROUP."
    if brand:
        intro += f" La marque associée est {brand}."

    facts = [
        f"SKU : {product['sku']}",
        f"Type : {template}",
        f"Stock importé : {format_stock(product['stock_available'])}",
    ]
    for label, key in [
        ("Référence fabricant", "manufacturer_ref"),
        ("Dimensions", "dimensions_text"),
        ("Finition", "finish"),
        ("Couleur", "color"),
        ("Matière", "material"),
        ("Conditionnement", "packaging_weight_kg"),
    ]:
        value = attr_value(product.get("attributes", []), key)
        if value:
            facts.append(f"{label} : {value}")

    return {
        "type": "doc",
        "content": [
            {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": display}]},
            {"type": "paragraph", "content": [{"type": "text", "text": intro}]},
            {
                "type": "bulletList",
                "content": [
                    {
                        "type": "listItem",
                        "content": [{"type": "paragraph", "content": [{"type": "text", "text": fact}]}],
                    }
                    for fact in facts
                ],
            },
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": "Cette fiche a été générée depuis les feuilles article et doit rester vérifiable dans l'espace staff avant enrichissement commercial.",
                    }
                ],
            },
        ],
    }


def format_stock(value: float) -> str:
    return str(int(value)) if float(value).is_integer() else str(value)


def build_attributes(old_product: dict) -> list[dict]:
    attrs = []
    seen = set()
    for attr in old_product.get("attributes") or []:
        key = attr.get("key") or attr.get("name")
        if not key or key in seen:
            continue
        seen.add(key)
        value = attr.get("value")
        if value is None or str(value).strip() == "":
            continue
        attrs.append(
            {
                "key": key,
                "label": attr.get("label") or key.replace("_", " ").title(),
                "value": clamp(str(value), 255),
                "unit": attr.get("unit"),
                "input_type": attr.get("input_type") or "TEXT",
                "is_filterable": bool(attr.get("is_filterable", True)),
                "group_name": attr.get("group_name") or "Général",
                "group_sort_order": int(attr.get("group_sort_order") or 0),
                "sort_order": int(attr.get("sort_order") or len(attrs) * 10),
            }
        )
    return attrs


def family_base(product: dict) -> str:
    n = norm(product["name"])
    brand = product.get("brand_name")
    if brand:
        n = re.sub(rf"\b{re.escape(norm(brand))}\b", " ", n)
    for value in refs(product["name"]) + dimensions(product["name"]):
        n = n.replace(norm(value), " ")
    for attr in product.get("attributes", []):
        if attr.get("key") in {"finish", "color"}:
            n = n.replace(norm(str(attr.get("value") or "")), " ")
    n = re.sub(r"\b(CHR|CHROME|BLANC|NOIR|MAT|MATT|PVD|DOR[EÉ]|GOLD|GRIS|BEIGE|BLUE|GREEN)\b", " ", n)
    n = re.sub(r"\b(AVEC|SANS|REF|REFERENCE|1C|2C|3C|4C|DIST|SUPP|SUPPORT)\b", " ", n)
    n = re.sub(r"\b\d+(?:[,.]\d+)?\b", " ", n)
    n = re.sub(r"\s+", " ", n).strip()
    if len(n.split()) < 2:
        return ""
    return n


def has_variant_signal(product: dict) -> bool:
    keys = {attr.get("key") for attr in product.get("attributes", [])}
    return bool(keys & {"finish", "color", "dimensions_text", "tile_size_cm", "packaging_weight_kg"})


def assign_families(products: list[dict]) -> None:
    groups: dict[str, list[dict]] = defaultdict(list)
    for product in products:
        base = family_base(product)
        if not base:
            continue
        key = "|".join([product.get("brand_slug") or "", product["product_type_slug"], base])
        groups[key].append(product)

    used_slugs: set[str] = set()
    for key, members in sorted(groups.items()):
        if len(members) < 2 or len(members) > 50:
            continue
        if not any(has_variant_signal(member) for member in members):
            continue
        brand_part, template_slug, base = key.split("|", 2)
        family_name = clean_display_name(base, brand_part or None, {})
        family_name = re.sub(r"^Unknown - ", "", family_name)
        family_slug_base = slugify(family_name)
        family_slug = family_slug_base
        if family_slug in used_slugs:
            family_slug = slugify(f"{family_slug_base}-{brand_part or template_slug}")
        index = 2
        while family_slug in used_slugs:
            family_slug = slugify(f"{family_slug_base}-{brand_part or template_slug}-{index}")
            index += 1
        used_slugs.add(family_slug)
        for sort_order, member in enumerate(sorted(members, key=lambda row: (row["display_name"], row["sku"]))):
            member["kind"] = "VARIANT"
            member["family_slug"] = family_slug
            member["family_name"] = family_name
            member["family_subtitle"] = TEMPLATE_LABELS.get(template_slug)
            member["family_description"] = f"Famille de variantes {TEMPLATE_LABELS.get(template_slug, 'produit').lower()}."
            member["family_description_seo"] = clamp(
                f"{family_name} : variantes {TEMPLATE_LABELS.get(template_slug, 'produit').lower()} chez COBAM GROUP.",
                160,
            )
            member["family_sort_order"] = sort_order


def quality_reasons(row: dict) -> list[str]:
    reasons = []
    if row["stock_available"] < MIN_STOCK:
        reasons.append(f"Stock below threshold ({format_stock(row['stock_available'])} < {MIN_STOCK}).")
    if row["template_confidence"] < MIN_TEMPLATE_CONFIDENCE:
        reasons.append(f"Template confidence below threshold ({row['template_confidence']} < {MIN_TEMPLATE_CONFIDENCE}).")
    if row["subcategory_confidence"] < MIN_SUBCATEGORY_CONFIDENCE:
        reasons.append(
            f"Subcategory confidence below threshold ({row['subcategory_confidence']} < {MIN_SUBCATEGORY_CONFIDENCE})."
        )
    if not row.get("subcategory_ids"):
        reasons.append("No strict subcategory assigned.")
    if len(row["display_name"]) < 6:
        reasons.append("Display name too short.")
    return reasons


def clean_products(source_products: list[dict], brand_records: dict[str, dict]) -> tuple[list[dict], list[dict]]:
    stage = []
    for old in source_products:
        classification = classify(old["name"])
        brand_slug = old.get("brand_slug")
        display = clean_display_name(old["name"], brand_slug, brand_records)
        stock = float(old.get("stock_available") or 0)
        attrs = build_attributes(old)
        row = {
            "sku": old["sku"],
            "name": old["name"],
            "display_name": display,
            "stock_available": stock,
            "base_price": money(old.get("base_price")),
            "brand_slug": brand_slug,
            "brand_name": brand_name(brand_slug, brand_records),
            "product_type_slug": classification["template_slug"],
            "template_confidence": classification["template_confidence"],
            "subcategory_ids": classification["subcategory_ids"],
            "subcategory_confidence": classification["subcategory_confidence"],
            "classification_reason": classification["classification_reason"],
            "attributes": attrs,
            "media": old.get("media") or [],
            "old_product_type_slug": old.get("product_type_slug"),
            "old_subcategory_ids": old.get("subcategory_ids") or [],
            "source_decision": "pending",
        }
        row["quality_reasons"] = quality_reasons(row)
        stage.append(row)

    imported: list[dict] = []
    audit: list[dict] = []
    seen_slugs: set[str] = set()
    for index, row in enumerate(stage):
        row = dict(row)
        if row["quality_reasons"]:
            row["source_decision"] = "review"
            audit.append(row)
            continue
        slug = slugify(row["display_name"])
        if slug in seen_slugs:
            slug = f"{slug}-{row['sku']}"
        seen_slugs.add(slug)
        row["slug"] = slug
        row["kind"] = "SINGLE"
        row["family_slug"] = None
        row["family_name"] = None
        row["family_subtitle"] = None
        row["family_description"] = None
        row["family_description_seo"] = None
        row["family_sort_order"] = 0
        row["stock_unit"] = "PIECE"
        row["stock_availability"] = "IN_STOCK"
        row["short_description"] = clamp(
            f"{row['display_name']} - {TEMPLATE_LABELS.get(row['product_type_slug'], 'produit')}.", 500
        )
        row["title_seo"] = title_seo(row["display_name"])
        row["description_seo"] = seo_description(row["display_name"], row["product_type_slug"], row.get("brand_slug"), brand_records)
        tag_parts = [
            row["product_type_slug"].replace("-", "_"),
            *(slugify(SUBCATEGORY_LABELS[subcat]).replace("-", "_") for subcat in row["subcategory_ids"]),
        ]
        if row.get("brand_slug"):
            tag_parts.append(row["brand_slug"].replace("-", "_"))
        row["tags"] = " ".join(dict.fromkeys(tag_parts))
        row["sort_order"] = index
        imported.append(row)

    assign_families(imported)
    for row in imported:
        row["rich_text_description"] = rich_description(row, brand_records)
    return imported, audit


def used_brands(products: list[dict], brand_records: dict[str, dict]) -> list[dict]:
    rows = []
    for slug in sorted({product.get("brand_slug") for product in products if product.get("brand_slug")}):
        name = brand_name(slug, brand_records)
        rows.append(
            {
                "slug": slug,
                "name": name,
                "description": BRAND_DESCRIPTIONS.get(name or "")
                or (brand_records.get(slug) or {}).get("description")
                or "Marque produit importée depuis les feuilles article COBAM GROUP.",
            }
        )
    return rows


def used_attribute_definitions(products: list[dict], source_defs: list[dict]) -> list[dict]:
    source_by_key = {row.get("key"): row for row in source_defs}
    rows = []
    for key in sorted({attr["key"] for product in products for attr in product.get("attributes", [])}):
        source = source_by_key.get(key) or {}
        sample = next(attr for product in products for attr in product.get("attributes", []) if attr["key"] == key)
        rows.append(
            {
                "key": key,
                "label": source.get("label") or sample.get("label") or key.replace("_", " ").title(),
                "unit": source.get("unit") or sample.get("unit"),
                "input_type": source.get("input_type") or sample.get("input_type") or "TEXT",
                "select_options": source.get("select_options") or [],
            }
        )
    return rows


def used_source_rows(products: list[dict], source_rows: list[dict], key: str) -> list[dict]:
    used_labels = {attr.get("value") for product in products for attr in product.get("attributes", []) if attr.get("key") == key}
    return [row for row in source_rows if row.get("label") in used_labels]


def sql_json(value) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def generate_sql(products: list[dict], audit: list[dict], source: dict[str, list[dict]], brand_records: dict[str, dict]) -> str:
    brands = used_brands(products, brand_records)
    attribute_defs = used_attribute_definitions(products, source.get("attrs", []))
    colors = used_source_rows(products, source.get("colors", []), "color")
    finishes = used_source_rows(products, source.get("finishes", []), "finish")
    templates = [tpl for tpl in EXTRA_TEMPLATES if any(product["product_type_slug"] == tpl["slug"] for product in products)]

    product_payload = []
    for product in products:
        product_payload.append(
            {
                "sku": product["sku"],
                "slug": product["slug"],
                "name": product["name"],
                "display_name": product["display_name"],
                "short_description": product["short_description"],
                "rich_text_description": product["rich_text_description"],
                "title_seo": product["title_seo"],
                "description_seo": product["description_seo"],
                "tags": product["tags"],
                "brand_slug": product.get("brand_slug"),
                "product_type_slug": product["product_type_slug"],
                "kind": product["kind"],
                "family_slug": product.get("family_slug"),
                "family_name": product.get("family_name"),
                "family_subtitle": product.get("family_subtitle"),
                "family_description": product.get("family_description"),
                "family_description_seo": product.get("family_description_seo"),
                "stock_available": product["stock_available"],
                "stock_unit": product["stock_unit"],
                "stock_availability": product["stock_availability"],
                "base_price": product["base_price"],
                "subcategory_ids": product["subcategory_ids"],
                "media": product.get("media") or [],
                "attributes": product.get("attributes") or [],
                "sort_order": product.get("family_sort_order") or product.get("sort_order") or 0,
            }
        )

    return f"""-- Clean import products from COBAM spreadsheet files.
-- This migration intentionally resets product and family data.
-- Cleanup gates:
--   * stock must be >= {MIN_STOCK}
--   * product template confidence must be >= {MIN_TEMPLATE_CONFIDENCE}
--   * subcategory confidence must be >= {MIN_SUBCATEGORY_CONFIDENCE}
--   * rows without an exact/strict subcategory are excluded to the audit workbook
-- Generated summary: {len(products)} imported, {len(audit)} sent to review.

BEGIN;

ALTER TABLE "products"
  ALTER COLUMN "created_by_id" TYPE VARCHAR(191) USING "created_by_id"::TEXT,
  ALTER COLUMN "last_updated_by_id" TYPE VARCHAR(191) USING "last_updated_by_id"::TEXT;

DELETE FROM "product_family_members";
UPDATE "product_families" SET "default_product_id" = NULL;
DELETE FROM "product_families";
DELETE FROM "product_attributes";
DELETE FROM "product_media";
DELETE FROM "product_subcategory_links";
DELETE FROM "products";

ALTER SEQUENCE IF EXISTS "product_families_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "product_attributes_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "product_media_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "products_id_seq" RESTART WITH 1;

CREATE TEMP TABLE "_import_brands" ON COMMIT DROP AS
SELECT *
FROM jsonb_to_recordset($brands${sql_json(brands)}$brands$::jsonb)
  AS "x"("slug" TEXT, "name" TEXT, "description" TEXT);

INSERT INTO "organizations" (
  "slug", "name", "description", "is_product_brand", "is_reference", "is_partner", "created_at", "updated_at"
)
SELECT "slug", "name", "description", true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "_import_brands"
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = COALESCE("organizations"."description", EXCLUDED."description"),
  "is_product_brand" = true,
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_import_templates" ON COMMIT DROP AS
SELECT *
FROM jsonb_to_recordset($templates${sql_json(templates)}$templates$::jsonb)
  AS "x"(
    "slug" TEXT, "name" TEXT, "group_slug" TEXT, "description" TEXT, "sort_order" INTEGER,
    "has_color" BOOLEAN, "has_finish" BOOLEAN, "preset_stock_unit" TEXT, "preset_tags" TEXT
  );

INSERT INTO "product_type_templates" (
  "group_id", "name", "slug", "description", "sort_order", "has_color", "has_finish",
  "preset_tags", "preset_stock_unit", "preset_vat_rate", "preset_guarantee_months", "created_at", "updated_at"
)
SELECT
  "groups"."id", "templates"."name", "templates"."slug", "templates"."description", "templates"."sort_order",
  "templates"."has_color", "templates"."has_finish", "templates"."preset_tags",
  "templates"."preset_stock_unit"::"StockUnit", 19.000, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "_import_templates" "templates"
JOIN "product_type_groups" "groups" ON "groups"."slug" = "templates"."group_slug"
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "has_color" = EXCLUDED."has_color",
  "has_finish" = EXCLUDED."has_finish",
  "preset_tags" = EXCLUDED."preset_tags",
  "preset_stock_unit" = EXCLUDED."preset_stock_unit",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_import_colors" ON COMMIT DROP AS
SELECT *
FROM jsonb_to_recordset($colors${sql_json(colors)}$colors$::jsonb)
  AS "x"("key" TEXT, "label" TEXT, "value" TEXT);

INSERT INTO "product_colors" ("key", "label", "value", "created_at", "updated_at")
SELECT "key", "label", "value", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "_import_colors"
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "value" = EXCLUDED."value",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_import_finishes" ON COMMIT DROP AS
SELECT *
FROM jsonb_to_recordset($finishes${sql_json(finishes)}$finishes$::jsonb)
  AS "x"("key" TEXT, "label" TEXT, "hex_color" TEXT);

INSERT INTO "product_finishes" ("key", "label", "hex_color", "created_at", "updated_at")
SELECT "key", "label", "hex_color", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "_import_finishes"
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "hex_color" = EXCLUDED."hex_color",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_import_attribute_definitions" ON COMMIT DROP AS
SELECT *
FROM jsonb_to_recordset($attrs${sql_json(attribute_defs)}$attrs$::jsonb)
  AS "x"("key" TEXT, "label" TEXT, "unit" TEXT, "input_type" TEXT, "select_options" TEXT[]);

INSERT INTO "product_attribute_definitions" (
  "key", "label", "unit", "input_type", "select_options", "created_at", "updated_at"
)
SELECT
  "key", "label", "unit", "input_type"::"ProductTypeAttributeInputType",
  COALESCE("select_options", ARRAY[]::TEXT[]), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "_import_attribute_definitions"
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "unit" = EXCLUDED."unit",
  "input_type" = EXCLUDED."input_type",
  "select_options" = EXCLUDED."select_options",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_import_products" ON COMMIT DROP AS
SELECT *
FROM jsonb_to_recordset($products${sql_json(product_payload)}$products$::jsonb)
  AS "x"(
    "sku" TEXT, "slug" TEXT, "name" TEXT, "display_name" TEXT, "short_description" TEXT,
    "rich_text_description" JSONB, "title_seo" TEXT, "description_seo" TEXT, "tags" TEXT,
    "brand_slug" TEXT, "product_type_slug" TEXT, "kind" TEXT,
    "family_slug" TEXT, "family_name" TEXT, "family_subtitle" TEXT, "family_description" TEXT,
    "family_description_seo" TEXT, "stock_available" NUMERIC, "stock_unit" TEXT,
    "stock_availability" TEXT, "base_price" NUMERIC, "subcategory_ids" JSONB, "media" JSONB,
    "attributes" JSONB, "sort_order" INTEGER
  );

INSERT INTO "product_families" (
  "slug", "name", "subtitle", "description", "description_seo", "created_at", "updated_at"
)
SELECT DISTINCT ON ("family_slug")
  "family_slug", "family_name", "family_subtitle", "family_description", "family_description_seo",
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "_import_products"
WHERE "family_slug" IS NOT NULL
ORDER BY "family_slug", "family_name"
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "subtitle" = EXCLUDED."subtitle",
  "description" = EXCLUDED."description",
  "description_seo" = EXCLUDED."description_seo",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "products" (
  "sku", "slug", "kind", "brand_id", "product_type_id", "name", "display_name",
  "richTextDescription", "short_description", "title_seo", "description_seo", "tags",
  "guarantee_months", "visible_ecommerce", "visible_vitrine", "is_featured", "is_promoted", "is_new",
  "stock_available", "stock_alert_threshold", "stock_unit", "stock_availability", "stock_visibility",
  "base_price_ttc_tnd", "current_price_ttc_tnd", "vat_rate", "price_visibility",
  "created_by_id", "last_updated_by_id", "created_at", "updated_at"
)
SELECT
  "imported"."sku", "imported"."slug", "imported"."kind"::"ProductKind",
  "brands"."id", "types"."id", "imported"."name", "imported"."display_name",
  "imported"."rich_text_description", "imported"."short_description", "imported"."title_seo",
  "imported"."description_seo", "imported"."tags", 0, true, true, false, false, false,
  "imported"."stock_available", 0, "imported"."stock_unit"::"StockUnit",
  "imported"."stock_availability"::"ProductAvailability", 'AUTO'::"ProductInventoryVisibility",
  "imported"."base_price", "imported"."base_price", 19.000, 'AUTO'::"ProductPricingVisibility",
  '{CREATED_BY_ID}', '{CREATED_BY_ID}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "_import_products" "imported"
LEFT JOIN "organizations" "brands" ON "brands"."slug" = "imported"."brand_slug"
JOIN "product_type_templates" "types" ON "types"."slug" = "imported"."product_type_slug"
ON CONFLICT ("sku") DO UPDATE SET
  "slug" = EXCLUDED."slug",
  "kind" = EXCLUDED."kind",
  "brand_id" = EXCLUDED."brand_id",
  "product_type_id" = EXCLUDED."product_type_id",
  "name" = EXCLUDED."name",
  "display_name" = EXCLUDED."display_name",
  "richTextDescription" = EXCLUDED."richTextDescription",
  "short_description" = EXCLUDED."short_description",
  "title_seo" = EXCLUDED."title_seo",
  "description_seo" = EXCLUDED."description_seo",
  "tags" = EXCLUDED."tags",
  "stock_available" = EXCLUDED."stock_available",
  "stock_unit" = EXCLUDED."stock_unit",
  "stock_availability" = EXCLUDED."stock_availability",
  "base_price_ttc_tnd" = EXCLUDED."base_price_ttc_tnd",
  "current_price_ttc_tnd" = EXCLUDED."current_price_ttc_tnd",
  "last_updated_by_id" = EXCLUDED."last_updated_by_id",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_family_members" ("family_id", "product_id", "sort_order")
SELECT "families"."id", "products"."id", COALESCE("imported"."sort_order", 0)
FROM "_import_products" "imported"
JOIN "products" ON "products"."sku" = "imported"."sku"
JOIN "product_families" "families" ON "families"."slug" = "imported"."family_slug"
WHERE "imported"."family_slug" IS NOT NULL
ON CONFLICT ("family_id", "product_id") DO UPDATE SET
  "sort_order" = EXCLUDED."sort_order";

WITH "ranked_defaults" AS (
  SELECT
    "families"."id" AS "family_id",
    "products"."id" AS "product_id",
    ROW_NUMBER() OVER (
      PARTITION BY "families"."id"
      ORDER BY "products"."stock_available" DESC, "imported"."sort_order" ASC, "products"."id" ASC
    ) AS "rank"
  FROM "_import_products" "imported"
  JOIN "products" ON "products"."sku" = "imported"."sku"
  JOIN "product_families" "families" ON "families"."slug" = "imported"."family_slug"
  WHERE "imported"."family_slug" IS NOT NULL
)
UPDATE "product_families" "families"
SET "default_product_id" = "ranked_defaults"."product_id"
FROM "ranked_defaults"
WHERE "families"."id" = "ranked_defaults"."family_id"
  AND "ranked_defaults"."rank" = 1;

INSERT INTO "product_subcategory_links" ("product_id", "subcategory_id", "role")
SELECT "products"."id", ("subcategory"."value")::BIGINT, 'BOTH'::"ProductSubcategoryRole"
FROM "_import_products" "imported"
JOIN "products" ON "products"."sku" = "imported"."sku"
CROSS JOIN LATERAL jsonb_array_elements_text("imported"."subcategory_ids") AS "subcategory"("value")
ON CONFLICT ("product_id", "subcategory_id") DO UPDATE SET
  "role" = EXCLUDED."role";

INSERT INTO "product_media" (
  "product_id", "media_id", "role", "name", "alt_text", "sort_order", "created_at", "updated_at"
)
SELECT
  "products"."id", ("media"."media_id")::BIGINT, ("media"."role")::"ProductMediaRole",
  "media"."name", "media"."alt_text", COALESCE("media"."sort_order", 0), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "_import_products" "imported"
JOIN "products" ON "products"."sku" = "imported"."sku"
CROSS JOIN LATERAL jsonb_to_recordset("imported"."media")
  AS "media"("media_id" BIGINT, "role" TEXT, "name" TEXT, "alt_text" TEXT, "sort_order" INTEGER)
ON CONFLICT ("product_id", "media_id") DO UPDATE SET
  "role" = EXCLUDED."role",
  "name" = EXCLUDED."name",
  "alt_text" = EXCLUDED."alt_text",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_attributes" (
  "product_id", "attribute_def_id", "name", "label", "value", "unit", "input_type",
  "is_required", "is_filterable", "group_name", "group_sort_order", "sort_order"
)
SELECT
  "products"."id", "defs"."id", "attrs"."key", "attrs"."label", "attrs"."value", "attrs"."unit",
  "attrs"."input_type"::"ProductTypeAttributeInputType", false, COALESCE("attrs"."is_filterable", true),
  "attrs"."group_name", COALESCE("attrs"."group_sort_order", 0), COALESCE("attrs"."sort_order", 0)
FROM "_import_products" "imported"
JOIN "products" ON "products"."sku" = "imported"."sku"
CROSS JOIN LATERAL jsonb_to_recordset("imported"."attributes")
  AS "attrs"(
    "key" TEXT, "label" TEXT, "value" TEXT, "unit" TEXT, "input_type" TEXT,
    "is_filterable" BOOLEAN, "group_name" TEXT, "group_sort_order" INTEGER, "sort_order" INTEGER
  )
LEFT JOIN "product_attribute_definitions" "defs" ON "defs"."key" = "attrs"."key";

COMMIT;
"""


def audit_rows_for_export(rows: list[dict]) -> list[dict]:
    export = []
    for row in rows:
        export.append(
            {
                "sku": row["sku"],
                "raw_name": row["name"],
                "stock": row["stock_available"],
                "price": row.get("base_price"),
                "brand": row.get("brand_slug") or "",
                "proposed_display": row.get("display_name") or "",
                "proposed_template": row.get("product_type_slug") or "",
                "template_confidence": row.get("template_confidence"),
                "proposed_subcategories": ", ".join(SUBCATEGORY_LABELS.get(x, str(x)) for x in row.get("subcategory_ids") or []),
                "subcategory_confidence": row.get("subcategory_confidence"),
                "old_template": row.get("old_product_type_slug") or "",
                "old_subcategories": ", ".join(SUBCATEGORY_LABELS.get(x, str(x)) for x in row.get("old_subcategory_ids") or []),
                "decision": row.get("source_decision", "review"),
                "reasons": " | ".join(row.get("quality_reasons") or [row.get("classification_reason", "")]),
            }
        )
    return export


def main() -> None:
    source_products = load_sheet_rows()
    detected_brand_slugs = sorted({row.get("brand_slug") for row in source_products if row.get("brand_slug")})
    brand_records = {
        slug: {
            "slug": slug,
            "name": brand_name(slug, {}),
            "description": BRAND_DESCRIPTIONS.get(brand_name(slug, {}) or "")
            or "Marque produit importée depuis les feuilles article COBAM GROUP.",
        }
        for slug in detected_brand_slugs
    }
    color_rows = [
        {"key": key, "label": label, "value": value}
        for key, (label, value) in sorted(COLOR_DEFINITIONS.items())
    ]
    finish_rows = [
        {"key": key, "label": label, "hex_color": hex_color}
        for key, (label, hex_color) in sorted(FINISH_DEFINITIONS.items())
    ]
    attr_rows = []
    try:
        sql = SOURCE_MIGRATION.read_text(encoding="utf-8")
        attr_rows = extract_block(sql, "attrs")
    except FileNotFoundError:
        attr_rows = []
    source = {
        "products": source_products,
        "brands": list(brand_records.values()),
        "templates": EXTRA_TEMPLATES,
        "colors": color_rows,
        "finishes": finish_rows,
        "attrs": attr_rows,
    }
    products, audit = clean_products(source["products"], brand_records)

    OUTPUT_MIGRATION.write_text(generate_sql(products, audit, source, brand_records), encoding="utf-8")
    audit_export = audit_rows_for_export(audit)
    imported_export = audit_rows_for_export([{**row, "source_decision": "import", "quality_reasons": []} for row in products])

    summary = {
        "stock_threshold": MIN_STOCK,
        "template_confidence_threshold": MIN_TEMPLATE_CONFIDENCE,
        "subcategory_confidence_threshold": MIN_SUBCATEGORY_CONFIDENCE,
        "source_products": len(source["products"]),
        "imported_products": len(products),
        "review_rows": len(audit),
        "families": len({row.get("family_slug") for row in products if row.get("family_slug")}),
        "variants": sum(1 for row in products if row.get("kind") == "VARIANT"),
        "single_products": sum(1 for row in products if row.get("kind") == "SINGLE"),
        "brands": len({row.get("brand_slug") for row in products if row.get("brand_slug")}),
        "media_links": sum(len(row.get("media") or []) for row in products),
        "template_counts": Counter(row["product_type_slug"] for row in products).most_common(),
        "subcategory_counts": Counter(subcat for row in products for subcat in row["subcategory_ids"]).most_common(),
        "review_reason_counts": Counter(reason for row in audit for reason in row.get("quality_reasons", [])).most_common(50),
    }

    AUDIT_JSON.write_text(
        json.dumps({"summary": summary, "imported": imported_export, "review": audit_export}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    SUMMARY_JSON.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
