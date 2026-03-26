# 🔗 PAMlab Pipeline Engine

Die Pipeline Engine ist das Herzstück von PAMlab — sie verbindet die Mock-APIs zu automatisierten Workflows.

## Überblick

Die Engine ermöglicht es, **YAML-basierte Pipelines** zu definieren, die Aktionen über mehrere Systeme hinweg orchestrieren:

- **Fudo PAM** → Session-Management, Passwort-Rotation, Zugriffskontrolle
- **Matrix42 ESM** → Tickets, Provisionierung, Genehmigungen
- **Active Directory** → Benutzer, Gruppen, OUs

## Schnellstart

### Docker

```bash
# Im PAMlab-Root-Verzeichnis
docker-compose up
```

### Manuell

```bash
cd pipeline-engine
npm install
npm start
# → API läuft auf http://localhost:8446
```

## CLI-Nutzung

```bash
# Pipeline ausführen
node src/cli.js run pipelines/onboarding-with-approval.yaml \
  --vars user=j.doe,group=Server-Admins

# Nur simulieren (Dry-Run)
node src/cli.js dry-run pipelines/jit-temporary-access.yaml \
  --vars user=m.mueller,group=RDP-Admins,duration=4h

# Pipeline validieren
node src/cli.js validate pipelines/offboarding-emergency.yaml

# Alle Pipelines auflisten
node src/cli.js list-pipelines

# Connector-Actions anzeigen
node src/cli.js list-actions fudo-pam
node src/cli.js list-actions active-directory
node src/cli.js list-actions matrix42-esm
```

## REST API (Port 8446)

| Methode | Endpoint | Beschreibung |
|---------|----------|-------------|
| `GET` | `/health` | Health Check |
| `GET` | `/pipelines` | Verfügbare Pipelines auflisten |
| `GET` | `/pipelines/:name` | Pipeline-Definition abrufen |
| `POST` | `/pipelines/validate` | Pipeline validieren |
| `POST` | `/pipelines/run` | Pipeline ausführen |
| `GET` | `/pipelines/runs` | Letzte Runs auflisten |
| `GET` | `/pipelines/runs/:id` | Run-Details mit Step-Ergebnissen |
| `GET` | `/connectors` | Registrierte Connectors |
| `GET` | `/connectors/:name/actions` | Actions eines Connectors |

### Beispiel: Pipeline per API ausführen

```bash
curl -X POST http://localhost:8446/pipelines/run \
  -H "Content-Type: application/json" \
  -d '{
    "file": "onboarding-with-approval.yaml",
    "vars": { "user": "j.doe", "group": "Server-Admins" }
  }'
```

## Pipeline-Templates

| Template | Beschreibung |
|----------|-------------|
| `onboarding-with-approval.yaml` | M42 Ticket → AD Benutzer → Gruppe → Fudo Sync → Audit |
| `offboarding-emergency.yaml` | Fudo sperren → AD deaktivieren → M42 Incident |
| `jit-temporary-access.yaml` | Zeitbegrenzter Zugriff mit Auto-Widerruf |
| `password-rotation-campaign.yaml` | Passwort-Rotation durchführen und dokumentieren |
| `security-incident-response.yaml` | Sessions beenden → Sperren → Incident-Tickets |

## Pipeline-Format (YAML)

```yaml
name: "Meine Pipeline"
description: "Beschreibung"

trigger:
  source: matrix42
  event: access-request.created

steps:
  - name: "Benutzer anlegen"
    system: active-directory
    action: users.create
    params:
      sAMAccountName: "{{ trigger.user }}"
      mail: "{{ trigger.user }}@corp.local"

  - name: "Zur Gruppe hinzufügen"
    system: active-directory
    action: groups.add-member
    params:
      name: "{{ vars.group }}"
      member: "{{ trigger.user }}"

rollback:
  - system: active-directory
    action: groups.remove-member
    params:
      name: "{{ vars.group }}"
      member: "{{ trigger.user }}"
```

### Variablen-Interpolation

- `{{ trigger.user }}` — Trigger-Daten / CLI-Variablen
- `{{ vars.group }}` — Explizite Variablen
- `{{ steps.Benutzer anlegen.result.id }}` — Ergebnisse vorheriger Steps

## Connectors

### Fudo PAM (`fudo-pam`)
Authentifizierung, Benutzer, Gruppen, Sessions, Zugriffskontrolle, Passwort-Policies, AD-Sync

### Matrix42 ESM (`matrix42-esm`)
Tickets, Assets, Benutzer, Software, Provisionierung, Genehmigungen, Webhooks, Berichte

### Active Directory (`active-directory`)
Benutzer, Gruppen (inkl. zeitbegrenzt), OUs, Computer, Bulk-Operationen

## Umgebungsvariablen

| Variable | Standard | Beschreibung |
|----------|----------|-------------|
| `PORT` | `8446` | API-Port |
| `FUDO_URL` | `http://localhost:8443` | Fudo PAM API URL |
| `M42_URL` | `http://localhost:8444` | Matrix42 ESM API URL |
| `AD_URL` | `http://localhost:8445` | Active Directory API URL |
