#!/usr/bin/env bash
# ============================================================
#  update-rootme.sh — Met à jour les données Root-Me du portfolio
#  Fetches both FR and EN versions
# ============================================================

set -euo pipefail

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_FR="$SCRIPT_DIR/lib/rootme_data.json"
OUTPUT_EN="$SCRIPT_DIR/lib/rootme_data_en.json"
TMP_HTML_FR="/tmp/rootme_update_fr_$$.html"
TMP_HTML_EN="/tmp/rootme_update_en_$$.html"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Root-Me Portfolio Updater              ║${NC}"
echo -e "${GREEN}║   root@ethanbeny:~\$                      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""

# ── Étape 1 : Cookies ──────────────────────────────────────
echo -e "${CYAN}[1/5]${NC} ${BOLD}Cookies Root-Me${NC}"
echo -e "${DIM}Ouvre root-me.org → F12 → Application → Cookies${NC}"
echo ""

read -rp "  spip_session     : " SPIP_SESSION
read -rp "  anubis-cookie-auth : " ANUBIS_COOKIE

if [[ -z "$SPIP_SESSION" || -z "$ANUBIS_COOKIE" ]]; then
  echo -e "${RED}[ERREUR] Les deux cookies sont requis.${NC}"
  exit 1
fi

CURL_HEADERS=(
  -H "Cookie: spip_session=${SPIP_SESSION}; anubis-cookie-auth=${ANUBIS_COOKIE}"
  -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
  -H "Accept: text/html,application/xhtml+xml"
  -L
)

check_anubis() {
  local file="$1"
  if grep -q "Making sure you" "$file" || grep -q "Vérification" "$file"; then
    echo -e "${RED}[ERREUR] Bloqué par Anubis. Le cookie anubis-cookie-auth est expiré.${NC}"
    echo -e "${DIM}Recharge root-me.org dans ton navigateur et récupère un nouveau cookie.${NC}"
    rm -f "$TMP_HTML_FR" "$TMP_HTML_EN"
    exit 1
  fi
}

# ── Étape 2 : Fetch FR ───────────────────────────────────────
echo ""
echo -e "${CYAN}[2/5]${NC} ${BOLD}Récupération du profil (FR)...${NC}"

HTTP_CODE=$(curl -s -o "$TMP_HTML_FR" -w "%{http_code}" \
  "https://www.root-me.org/Ethanbeny?inc=score&lang=fr" \
  "${CURL_HEADERS[@]}")

if [[ "$HTTP_CODE" != "200" ]]; then
  echo -e "${RED}[ERREUR] HTTP $HTTP_CODE (FR) — vérifie tes cookies.${NC}"
  rm -f "$TMP_HTML_FR" "$TMP_HTML_EN"
  exit 1
fi
check_anubis "$TMP_HTML_FR"



TITLE=$(grep -oP '(?<=<title>)[^<]+' "$TMP_HTML_FR" | head -1)
echo -e "  ${GREEN}✓${NC} Page FR récupérée : ${DIM}${TITLE}${NC}"

# ── Étape 3 : Fetch EN ───────────────────────────────────────
echo ""
echo -e "${CYAN}[3/5]${NC} ${BOLD}Récupération du profil (EN)...${NC}"

HTTP_CODE=$(curl -s -o "$TMP_HTML_EN" -w "%{http_code}" \
  "https://www.root-me.org/Ethanbeny?inc=score&lang=en" \
  "${CURL_HEADERS[@]}")

if [[ "$HTTP_CODE" != "200" ]]; then
  echo -e "${RED}[ERREUR] HTTP $HTTP_CODE (EN) — vérifie tes cookies.${NC}"
  rm -f "$TMP_HTML_FR" "$TMP_HTML_EN"
  exit 1
fi
check_anubis "$TMP_HTML_EN"

TITLE=$(grep -oP '(?<=<title>)[^<]+' "$TMP_HTML_EN" | head -1)
echo -e "  ${GREEN}✓${NC} Page EN récupérée : ${DIM}${TITLE}${NC}"

# ── Étape 4 : Parse both ─────────────────────────────────────
echo ""
echo -e "${CYAN}[4/5]${NC} ${BOLD}Extraction des challenges (FR + EN)...${NC}"

TMP_FR="$TMP_HTML_FR" TMP_EN="$TMP_HTML_EN" OUT_FR="$OUTPUT_FR" OUT_EN="$OUTPUT_EN" python3 << 'PYEOF'
import re, json, sys, os

def clean(s):
    return s.strip()\
        .replace('&#8217;', "'")\
        .replace('&#8216;', "'")\
        .replace('&amp;', '&')\
        .replace('&nbsp;', ' ')\
        .replace('&#039;', "'")\
        .replace('&#233;', 'é').replace('&#232;', 'è').replace('&#224;', 'à')

def parse_profile(html_path, output_path, cat_names, cat_href_prefix):
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    rank_m  = re.search(r'&nbsp;(\d+)</h3>\s*<span[^>]*>(Position|Place)', html)
    score_m = re.search(r'&nbsp;(\d+)</h3>\s*<span[^>]*>Points', html)
    total_m = re.search(r'&nbsp;(\d+)</h3>\s*<span[^>]*>Challenges', html)

    rank  = int(rank_m.group(1))  if rank_m  else 0
    score = int(score_m.group(1)) if score_m else 0
    total = int(total_m.group(1)) if total_m else 0

    boxes = re.split(r'<div class="animated_box"', html)
    categories = []

    for box in boxes[1:]:
        pct_m = re.search(r'(\d+)%', box)
        cat_m = re.search(r'href="' + cat_href_prefix + r'/Challenges/([^/"]+)/"', box)
        pts_m = re.search(r'<b>(\d+)</b>&nbsp;Points.*?<b>(\d+)</b>&nbsp;/&nbsp;(\d+)', box, re.DOTALL)

        pct   = int(pct_m.group(1)) if pct_m else 0
        cat_k = cat_m.group(1) if cat_m else ''
        cat_n = cat_names.get(cat_k, cat_k)
        pts   = int(pts_m.group(1)) if pts_m else 0
        done  = int(pts_m.group(2)) if pts_m else 0
        tot   = int(pts_m.group(3)) if pts_m else 0

        solved   = [clean(c) for c in re.findall(r'o&nbsp;([^<\n]+)', box)]
        unsolved = [clean(c) for c in re.findall(r'x&nbsp;([^<\n]+)', box)]

        categories.append({
            "name":     cat_n,
            "percent":  pct,
            "points":   pts,
            "solved":   done,
            "total":    tot,
            "solved_challenges":   solved,
            "unsolved_challenges": unsolved,
        })

    data = {
        "username":     "Ethanbeny",
        "rank":         rank,
        "score":        score,
        "total_solved": total,
        "categories":   categories,
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"  rank={rank} score={score} total={total} cats={len(categories)}")
    for c in categories:
        print(f"    {c['name']:22s} {c['solved']:3d}/{c['total']:3d}  ({c['percent']}%)")

# FR category names (URL slug → display name)
CAT_FR = {
    'App-Script':    'App - Script',
    'App-Systeme':   'App - Système',
    'Cracking':      'Cracking',
    'Cryptanalyse':  'Cryptanalyse',
    'Forensic':      'Forensic',
    'Programmation': 'Programmation',
    'Realiste':      'Réaliste',
    'Reseau':        'Réseau',
    'Steganographie':'Stéganographie',
    'Web-Client':    'Web - Client',
    'Web-Serveur':   'Web - Serveur',
}

# EN category names (URL slug → display name)
CAT_EN = {
    'App-Script':    'App - Script',
    'App-System':    'App - System',
    'Cracking':      'Cracking',
    'Cryptanalysis': 'Cryptanalysis',
    'Forensic':      'Forensic',
    'Programming':   'Programming',
    'Realistic':     'Realistic',
    'Network':       'Network',
    'Steganography': 'Steganography',
    'Web-Client':    'Web - Client',
    'Web-Server':    'Web - Server',
}

tmp_fr = os.environ['TMP_FR']
tmp_en = os.environ['TMP_EN']
out_fr = os.environ['OUT_FR']
out_en = os.environ['OUT_EN']

print("  --- FR ---")
parse_profile(tmp_fr, out_fr, CAT_FR, "fr")
print("  --- EN ---")
parse_profile(tmp_en, out_en, CAT_EN, "en")
PYEOF

echo -e "  ${GREEN}✓${NC} JSON FR : ${DIM}${OUTPUT_FR}${NC}"
echo -e "  ${GREEN}✓${NC} JSON EN : ${DIM}${OUTPUT_EN}${NC}"

# ── Étape 5 : Rebuild ──────────────────────────────────────
echo ""
echo -e "${CYAN}[5/5]${NC} ${BOLD}Rebuild du site...${NC}"

cd "$SCRIPT_DIR"
npm run build 2>&1 | grep -E '(✓|⨯|Error|Route|○|●)' | head -20

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓  Portfolio mis à jour avec succès !   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo -e "  Lance ${CYAN}npm run dev${NC} pour voir le résultat."
echo ""

# Nettoyage
rm -f "$TMP_HTML_FR" "$TMP_HTML_EN"
