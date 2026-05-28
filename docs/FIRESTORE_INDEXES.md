# Firestore Indexes (Required)

Este proyecto usa consultas compuestas que requieren índices. Si Firestore devuelve un error con link de índice, créalo en la consola y documenta aquí.

## Sesiones
- `sessions`: `ownerUid` ASC, `createdAt` DESC
  - Usado en: `/api/sessions/me`

- `sessions`: `status` ASC, `createdAt` ASC
  - Usado en: `/api/cron/cleanup` (query con `status in` + `createdAt <` + `orderBy createdAt`)

- `sessions`: `status` ASC, `generatedAt` ASC
  - Usado en: `/api/counter` (conteo semanal con `status == ready` + `generatedAt >= weekStart`)

- `sessions`: `status` ASC, `updatedAt` DESC
  - Reservado para vistas/admin de sesiones por estado y recencia.

## Jobs
- `jobs`: `status` ASC, `updatedAt` ASC
  - Usado en: `cleanupStaleJobs` (status in + updatedAt <)

## Email Sequences
- `email_sequences`: `status` ASC, `nextSend` ASC
  - Usado en: `getDueSequences` (status == + nextSend <=)

## Referrals
- `referrals`: `inviteeId` ASC, `completedAt` ASC
  - Usado en: `completeReferral` (inviteeId == + completedAt == null)

- `referrals`: `referrerId` ASC, `rewardClaimed` ASC, `completedAt` ASC
  - Usado en: `claimReferralReward` (referrerId == + completedAt != null + rewardClaimed == false)

## Despliegue

```bash
firebase deploy --only firestore:indexes
firebase deploy --only firestore:rules
firebase deploy --only storage
```

> Nota: índices con `in` o `!=` suelen requerir compuesto. Si Firestore genera un índice automático, agrega la definición aquí para mantenerlo rastreable.
