# Rootkit - Cold case — Write-up

**Plateforme :** Root-Me
**Challenge :** Rootkit - Cold case (50 pts)
**Catégorie :** Forensic
**Auteur :** franb

## Description

On accède via SSH à une machine Linux 2.4.27 (Debian, circa 2003) compromise par un rootkit. L'objectif est de retrouver le PID du processus malveillant et le mot de passe volé. Format de réponse : `PID-PASSWORD`.

## Connexion

La machine utilise `ssh-dss` (DSA), algorithme retiré dans OpenSSH 10.2+. On utilise PuTTY (`plink`) qui supporte encore les algorithmes legacy :

```bash
plink -P 10116 ctf16-user@ctf16.root-me.org
```

## Étape 1 : Identification du processus malveillant

### Énumération des PIDs cachés

`ps aux` liste les processus visibles, mais un rootkit peut en cacher. On brute-force les PIDs en testant directement `/proc` :

```bash
for i in $(seq 1 1000); do
  [ -d /proc/$i ] && echo $i
done
```

On compare avec la sortie de `ps`. Le PID **11** apparaît dans `/proc` mais pas dans `ps` — il est caché par le rootkit.

### Analyse du PID 11

```bash
cat /proc/11/cmdline        # /sbin/init auto
ls -la /proc/11/fd/         # fd/3 -> /dev/kmem, fd/4 -> socket:[18]
cat /proc/11/maps           # Uniquement le binaire init mappe (pas de libc — anormal)
```

Indices clés :
- **fd/3 -> `/dev/kmem`** : le processus lit/écrit directement la mémoire du noyau
- **fd/4 -> `socket:[18]`** : un raw socket (backdoor réseau invisible dans netstat)
- **Pas de libc** dans les mappings mémoire : comportement anormal pour un processus standard

Le PID du processus malveillant est **11**.

## Étape 2 : Identification du rootkit

### Indices supplémentaires

```bash
cat /proc/net/tcp    # Segmentation fault — les hooks du rootkit perturbent la lecture
```

Les ressources du challenge pointent vers l'article Phrack "Linux on-the-fly kernel patching without LKM" par sd & devik, qui décrit le rootkit **SucKIT**. Ce rootkit :
- Patche la table des syscalls via `/dev/kmem` (sans module noyau)
- Hooke `getdents` pour cacher fichiers/répertoires contenant une chaîne spécifique
- Cache des PIDs de `ps`
- Fournit une backdoor via raw socket

### Localisation des fichiers du rootkit

SucKIT s'installe par défaut sous `/usr/share/locale/`. Le rootkit hooke `getdents`, donc `ls` et `find` ne montrent pas les fichiers cachés. On utilise `debugfs` pour lire le système de fichiers ext2 directement, en contournant les hooks du noyau :

```bash
debugfs /dev/hda1 -R "ls usr/share/locale"
```

Cela révèle un répertoire caché `.rtme` (invisible avec `ls` classique).

### Contenu du répertoire du rootkit

```bash
debugfs /dev/hda1 -R "ls usr/share/locale/.rtme"
```

Fichiers trouvés :
- `instrootme` — script d'installation du rootkit
- `lookinpasswd` — fichier contenant le mot de passe volé
- `sk` — le binaire SucKIT
- `.sniffer` — log du sniffer TTY (capture des frappes clavier)

### Analyse du script d'installation (`instrootme`)

Le script révèle la configuration :
- `HIDE=rtme` : chaîne utilisée pour cacher les fichiers (tout fichier/répertoire contenant "rtme" est invisible)
- `HOME=/usr/share/locale/.rtme` : répertoire d'installation
- Remplace `/sbin/init` par le binaire `sk`, sauvegarde l'original dans `/sbin/initrtme`
- Crée `.sniffer` pour capturer les mots de passe saisis sur les TTYs

## Étape 3 : Récupération du mot de passe volé

On extrait le fichier `lookinpasswd` via debugfs (pour contourner les hooks) :

```bash
debugfs /dev/hda1 -R "cat /usr/share/locale/.rtme/lookinpasswd"
```

Ce fichier contient le mot de passe volé par le rootkit.

## Flag

```
11-YesF13tP4rT0fFl4G
```
