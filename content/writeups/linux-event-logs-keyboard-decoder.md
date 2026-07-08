# Linux - Event logs, keyboard decoder — Write-up

**Plateforme :** Root-Me
**Challenge :** Linux - Event logs, keyboard decoder
**Catégorie :** Forensic

## Description

Retrouver le contenu du fichier `/tmp/flag` à partir d'une capture de `/dev/input/event0` encodée en base64.

## Environnement

- **Python** : 2.7.13
- **Clavier** : AZERTY Français (`setxkbmap fr`)
- **Capture** : `cat /dev/input/event0 > /tmp/ch24` puis `base64 /tmp/ch24 > /tmp/ch24.txt`

## Analyse du format binaire

Le fichier est une capture brute de `/dev/input/event0`. Chaque événement fait **24 octets** et correspond à la structure C `input_event` :

```c
struct input_event {
    struct timeval time;   // tv_sec (8 octets) + tv_usec (8 octets)
    __u16 type;            // 1 = EV_KEY (evenement clavier)
    __u16 code;            // keycode Linux (ex: 28 = ENTER, 103 = UP)
    __s32 value;           // 1 = key down, 0 = key up, 2 = repeat
};
```

En xxd, un événement ressemble à :

```
d930 0b5a 0000 0000  ← tv_sec  (little-endian) = 0x5A0B30D9 = 1510682841
0417 0b00 0000 0000  ← tv_usec
0100 1c00 0100 0000  ← type=1 (EV_KEY), code=0x1C=28 (ENTER), value=1 (down)
```

Important : chaque touche physique génère plusieurs events (down, up, sync). Pour décoder, on ne garde que `type == 1` et `value == 1` (key down).

## Étape 1 : Décoder le base64

```bash
base64 -d ch24.txt > ch24.bin
```

## Étape 2 : Décoder les frappes clavier

On parse les events binaires en Python, en gérant :
- **État SHIFT** (codes 42/54) : pour les majuscules et symboles shifts
- **État AltGr** (code 100) : pour @, |, #, [, ], etc. sur AZERTY
- **BACKSPACE** (code 14) : supprime le caractère précédent
- **Dead keys** : sur AZERTY, `^` (code 26) est une touche morte — deux appuis = un seul `^`

```python
import struct, hashlib

azerty_fr = {
    2:('&','1',''), 3:('e','2','~'), 4:('"','3','#'), 5:("'",'4','{'),
    6:('(','5','['), 7:('-','6','|'), 8:('e','7','`'), 9:('_','8','\\'),
    10:('c','9','^'), 11:('a','0','@'), 12:(')','°',']'), 13:('=','+','}'),
    14:('BKSP','BKSP','BKSP'), 15:('TAB','TAB','TAB'),
    16:('a','A',''), 17:('z','Z',''), 18:('e','E',''), 19:('r','R',''),
    20:('t','T',''), 21:('y','Y',''), 22:('u','U',''), 23:('i','I',''),
    24:('o','O',''), 25:('p','P',''), 26:('^','',''), 27:('$','£',''),
    28:('\n','\n','\n'),
    30:('q','Q',''), 31:('s','S',''), 32:('d','D',''), 33:('f','F',''),
    34:('g','G',''), 35:('h','H',''), 36:('j','J',''), 37:('k','K',''),
    38:('l','L',''), 39:('m','M',''), 40:('u','%',''),
    42:('LSHIFT','',''), 43:('*','u',''),
    44:('w','W',''), 45:('x','X',''), 46:('c','C',''), 47:('v','V',''),
    48:('b','B',''), 49:('n','N',''), 50:(',','?',''), 51:(';','.',''),
    52:(':','/',''), 53:('!','§',''), 54:('RSHIFT','',''),
    56:('LALT','',''), 57:(' ',' ',' '),
    86:('<','>',''), 96:('\n','\n','\n'), 100:('ALTGR','',''),
    103:('UP','',''),
    71:('7','',''), 72:('8','',''), 73:('9','',''), 74:('-','',''),
    75:('4','',''), 76:('5','',''), 77:('6','',''), 78:('+','',''),
    79:('1','',''), 80:('2','',''), 81:('3','',''), 82:('0','',''),
    83:('.','',''),
}

with open("ch24.bin", "rb") as f:
    events = []
    while True:
        data = f.read(24)
        if len(data) < 24: break
        parsed = struct.unpack('<QQ HHi', data)
        tv_sec, tv_usec, ev_type, code, value = parsed
        if ev_type == 1:
            events.append((tv_sec, code, value))

shift = altgr = False
output = []
for ts, code, value in events:
    if code in (42, 54): shift = (value != 0); continue
    if code == 100: altgr = (value != 0); continue
    if value != 1: continue
    if code == 14:
        if output and output[-1][1] not in ('\n',):
            output.pop()
        continue
    if code not in azerty_fr: continue
    n, s, a = azerty_fr[code]
    if altgr and a: ch = a
    elif shift: ch = s
    else: ch = n
    output.append((ts, ch))

for ts, ch in output:
    print(f"{ts} {repr(ch)}")
```

## Étape 3 : Reconstituer les commandes

Le décodage révèle la session complète :

```bash
# Ouverture d'un terminal
Alt+F2 → xt (xterm)

# Connexion SSH
ssh app-systeme-ch7@challenge02.root-me.org -p 2222
yes
app-systeme-ch7    # mot de passe

# Exploration
ls -l
cat ch7.c
exit

# Configuration vim
echo syntax enable > ~/.vimrc

# Creation du script hihi.py
vim hihi.py
# Contenu tape dans vim :
#!/usr/bin/python

from sys import argv

if len(argv) < 2:
    print("Usage : %s <to be xored>" % argv[0])
    exit(2)

def myXor(d):
    a = ''
    for i in d:
        a+= chr(157 ^ ord(i))
    return a

print(myXor(argv[1]))
# :x pour sauvegarder

# Generation du flag
echo c0nGralut4t10n__$(./hihi.py $(date +%s) | sha1sum | grep -o '^[0-9a-f]\+')_hoh0 > /tmp/flag
chmod +x *.py

# Re-execution du echo (UP UP ENTER)
↑↑ ENTER

exit
```

## Étape 4 : Trouver le bon timestamp

La commande qui génère le flag utilise `date +%s` (timestamp UNIX). Chaque event du fichier contient son propre timestamp, donc on sait exactement quand chaque touche a été pressée.

La commande echo est exécutée **deux fois** :
1. Première exécution : ENTER à `tv_sec = 1510683187`
2. Ré-exécution via UP UP ENTER : ENTER à `tv_sec = 1510683198`

C'est la **deuxième exécution** qui écrit le `/tmp/flag` final (elle écrase le premier).

On peut vérifier en cherchant les UP arrows dans le xxd :

```bash
xxd ch24.bin | grep "0100 6700 0100"
# 00013e40: 0100 6700 0100 0000 3c32 0b5a ...  (UP #1)
# 00013ed0: 0100 6700 0100 0000 3d32 0b5a ...  (UP #2)
```

## Étape 5 : Calculer le flag

Point critique : le système utilise **Python 2.7.13**. En Python 2, `chr()` produit des octets bruts (1 octet par caractère), alors qu'en Python 3, les caractères > 127 deviennent multi-octets en UTF-8. Le hash SHA1 sera différent.

```python
import hashlib

def myXor(d):
    """Simule le comportement Python 2"""
    result = bytes()
    for i in d:
        result += bytes([157 ^ ord(i)])
    return result

# Timestamp de la 2eme execution (UP UP ENTER)
ts = 1510683198
xored = myXor(str(ts))
# print en Python 2 ajoute \n
data = xored + b'\n'
sha1 = hashlib.sha1(data).hexdigest()
flag = f"c0nGralut4t10n__{sha1}_hoh0"
print(flag)
```

## Flag

```
c0nGralut4t10n__6e866a5f89d514c290e49256d267326aedd89c4c_hoh0
```

## Points clés

- Le format `/dev/input/event0` est une structure de 24 octets par event, **pas** des codes ASCII/ANSI
- Il faut gérer les modificateurs (SHIFT, AltGr) comme un état qui affecte les touches suivantes
- Il faut traiter BACKSPACE en supprimant le caractère précédent
- Sur AZERTY, `^` est une dead key : deux appuis = un seul `^`
- **Python 2 vs 3** change le résultat du XOR+SHA1 pour les valeurs > 127
- Le timestamp est dans le fichier event, pas à calculer soi-même
