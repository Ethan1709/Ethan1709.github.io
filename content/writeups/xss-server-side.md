# XSS - Server Side — Write-up

**Plateforme :** Root-Me
**Challenge :** XSS - Server Side (20 pts)
**Catégorie :** Web Client
**Auteur :** Elf (HackDay 2023)

## Description

Une plateforme de génération d'attestations de participation permet de saisir un nom d'utilisateur et un message. Le tout est rendu sous forme de PDF côté serveur. Les développeurs assurent avoir échappé toutes les entrées utilisateur.

Le flag se trouve dans `/flag.txt`.

## Analyse

Le formulaire prend un message en entrée et génère un PDF via un moteur HTML-to-PDF côté serveur (type wkhtmltopdf). Le contenu HTML classique (`<script>`, `<iframe>`, `<b>`) est échappé et rendu en texte brut dans le PDF.

Cependant, certaines balises HTML comme `<object>` ne sont pas filtrées par le mécanisme d'échappement et sont interprétées par le moteur de rendu PDF.

## Exploitation

L'injection se fait au niveau du champ username lors du login. En utilisant la balise `<object>` avec le protocole `file://`, on peut lire des fichiers locaux sur le serveur :

```html
<object data="file:///flag.txt" width="500" height="200"></object>
```

Ensuite, en générant une attestation, le moteur HTML-to-PDF interprète la balise `<object>` et inclut le contenu de `/flag.txt` directement dans le PDF à la place du nom d'utilisateur.

## Flag

Le flag apparaît dans le PDF rendu, à l'emplacement où le nom d'utilisateur aurait dû s'afficher.
