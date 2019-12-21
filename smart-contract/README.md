# Dragon Badges Contract Setup

### Sample Install Command

```
dctl c c dragonbadges \
yourdockerhub/dragonbadges:latest \
node index.js \
-r YOURDOCKERHUBUSERNAMEPASSWORDBASE64PAIR \
-S '{"privateSigningKey": "-----BEGIN RSA PRIVATE KEY-----\nMIICXQIBAAKBgQC/O+n/iTFIK2mDVHAdLJ6AR3TZAYEODA8onmwcK6BCquwF/Fdj\nHrOFesZqOPeLUhTJNXMItqM/pjdLmah2dU/PFENRDvpDVjsWXzukKVGsXMYJPoY3\nm0//u9xDv9m6JSUzo2J2lQRfmB3741cs3f0gHkrvgTkdn52swZLW7VG99wIDAQAB\nAoGBAIyIGgi4qCeyB2MEjTNTU9NPL7Y9XbqV8BnYefglsyrq8nHfo9RqfmCr/d2X\nqYqPski+559SoBspKd97twn+Ybu1OTFXC0N85FBEdfG21l0uo/mANyRYMoPtDNd7\n7LtYZ7a4RUXNeM5nj5xehwl75GQJFDIajI/erKJWUiKXJmLxAkEA6MnGAIXzrY05\nDXAf9rSDxMF8BNOxr+if9G6U9ub47r3muC9+osI6qALfLDuO9z2l0QZpJPBv8lwl\n6+uuM0nFfwJBANJNaourIIv4nvWPKcmW+f4mJ9Cvp7P9jA856CrEscfnjWKgvRbP\nUyIM4KusDLQTb7+Af6tsQ3SviUvAFX5hc4kCQAOymMuPVSSPlrVo74kKqwEoFaE5\n/5uMtWW7j/AwEQoxyAVq87cAINBkY0kflRDGUOj2Eht9GjoeTpflwXmdFV8CQFWC\nArtNVktzSHbBwhTkXTtYGkJA2ahWhFdAjUSuezaz0In0n02h+MRUhhlnODcT3BD6\nV27E81yDbwiszlB3oTkCQQCyFOYOcAB4vssgjwFf42FXh5Hx30fuW7nqxPsDigy9\n6+VMIjkyFMOUHPpDNsrELXodlEH2jTNzZnEUC/abSFww\n-----END RSA PRIVATE KEY-----\n", "publicSigningKey": "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC/O+n/iTFIK2mDVHAdLJ6AR3TZ\nAYEODA8onmwcK6BCquwF/FdjHrOFesZqOPeLUhTJNXMItqM/pjdLmah2dU/PFENR\nDvpDVjsWXzukKVGsXMYJPoY3m0//u9xDv9m6JSUzo2J2lQRfmB3741cs3f0gHkrv\ngTkdn52swZLW7VG99wIDAQAB\n-----END PUBLIC KEY-----\n"}' \
--customIndexes '[{"fieldName":"response_type","path":"$.response.type","type":"tag"},{"fieldName":"entity_type","path":"$.response.entity.type","type":"tag"},{"fieldName":"entity_id","path":"$.response.entity.entityId","type":"tag"},{"fieldName":"badge_class_issuer_id","path":"$.response.entity.issuerEntityId","type":"tag"},{"fieldName":"assertion_badge_class_id","path":"$.response.entity.badgeClassEntityId","type":"tag"}]'
```

***Note: Obviously that's not a safe key pair now... I've used it exclusively for testing this, so feel free to use in testing as well.***