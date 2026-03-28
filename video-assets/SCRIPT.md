# PAMlab Demo Video — Script

## 🎬 Intro (30s)
**Visual:** PAMlab Logo + Tagline
**Narration:**
> "Was passiert, wenn du Privileged Access Management entwickelst — aber keinen Zugang zu Produktivsystemen hast?
> Fudo PAM, Active Directory, ServiceNow, Jira, Remedy, Matrix42 — alles Systeme, die tausende Euro pro Lizenz kosten.
> PAMlab löst dieses Problem. Eine Open-Source Dev-Umgebung, die alle 6 Systeme als realistische Mock-APIs simuliert."

---

## 🏗️ Part 1: Architektur (45s)
**Visual:** Architekturdiagramm (7 Services)
**Narration:**
> "PAMlab besteht aus 7 Microservices, die per Docker Compose hochfahren:
>
> 1. **Fudo PAM Mock** (Port 8443) — Privileged Session Management mit Sessions, Servern, Access Requests
> 2. **Active Directory Mock** (Port 8445) — LDAP-ähnliche User/Group/Computer-Verwaltung
> 3. **Matrix42 ESM Mock** (Port 8444) — Enterprise Service Management mit Tickets und Asset-Management
> 4. **ServiceNow ITSM Mock** (Port 8447) — Incidents, Changes, CMDB, Service Catalog
> 5. **Jira Service Management Mock** (Port 8448) — Issues, Workflows, Approvals, SLA, Assets
> 6. **BMC Remedy/Helix Mock** (Port 8449) — Incidents, Changes, CMDB, SLA, Work Orders
> 7. **Pipeline Engine** (Port 8446) — Orchestriert cross-system Workflows via YAML Pipelines
>
> Jeder Service hat realistische Seed-Daten: 10 AD-User, 6 Security Groups, 5 Server, Incidents, Changes — alles vernetzt."

---

## 🖥️ Part 2: PAMlab Studio (60s)
**Visual:** Dashboard mit Health-Status aller APIs
**Narration:**
> "PAMlab Studio ist das React-Frontend. Auf dem Dashboard siehst du sofort: alle 6 APIs grün.
> Jeder Service hat einen Healthcheck, der Live-Status und Latenz anzeigt."

**Visual:** Scenario Builder → "Onboarding" auswählen
**Narration:**
> "Der Scenario Builder bietet 15 vorgefertigte Workflows. Hier wählen wir 'Onboarding' —
> das erstellt automatisch einen AD-User, fügt ihn zu Security Groups hinzu,
> provisioniert Fudo PAM Zugang und erstellt ein ESM-Ticket. Alles in einem Script."

**Visual:** Code Editor mit generiertem PowerShell
**Narration:**
> "Das generierte Script nutzt PowerShell mit Invoke-RestMethod — genau wie in der echten Umgebung.
> Die API-Pfade sind identisch zu den Produktivsystemen. Du kannst hier entwickeln und testen,
> und dein Code läuft 1:1 gegen die echten APIs."

**Visual:** Results Panel mit Step-Ergebnissen
**Narration:**
> "Nach dem Run siehst du jeden Step einzeln: HTTP Status, Response Body, Timing.
> Grün = erfolgreich, Rot = Fehler. Der API Traffic wird mitgeloggt."

---

## 🔍 Part 3: API Explorer (30s)
**Visual:** API Explorer mit Endpoint-Liste
**Narration:**
> "Der API Explorer zeigt alle verfügbaren Endpoints aller 6 Systeme.
> Du kannst direkt aus der UI Requests abfeuern — GET, POST, PUT, DELETE.
> Ideal zum Experimentieren und Debuggen."

---

## 🔗 Part 4: Pipeline Engine (45s)
**Visual:** Pipeline YAML + Ausführung
**Narration:**
> "Das Herzstück für Automation: die Pipeline Engine.
> Workflows werden als YAML definiert. Hier ein Onboarding-Pipeline:
>
> Step 1: AD-User erstellen
> Step 2: Fudo PAM Access provisionieren
> Step 3: Matrix42 Ticket erstellen
>
> Die Engine hat Connectors für jedes System und unterstützt Dry-Run.
> Ein POST auf `/pipelines/run` startet die Pipeline, `/pipelines/runs` zeigt die Historie."

---

## 🧪 Part 5: Testen & Entwickeln (45s)
**Visual:** Terminal mit Test-Output
**Narration:**
> "Wie baue und teste ich damit? Drei Wege:
>
> **1. Manuell über Studio** — Scenarios auswählen, anpassen, ausführen
> **2. Automatisierte Tests** — 98 Integration Tests prüfen alle Endpoints, Cross-System Workflows, Auth, und Edge Cases
> **3. Pipeline Dry-Run** — Validiert Workflows ohne Side-Effects
>
> Die Tests decken ab:
> - Health Checks aller Services
> - CRUD Operations pro API
> - Cross-System Scenarios (Onboarding, Incident, Emergency Revoke)
> - Security (Auth-Validierung, ungültige Tokens)
> - Pipeline Engine (Validate, DryRun, Execute, History)
>
> Aktuelles Ergebnis: **82 passed, 8 failed, 8 warnings** — und die Failures waren echte Bugs, die wir direkt gefixed haben."

---

## ⚡ Part 6: Real-World Scenarios (30s)
**Visual:** Schneller Durchlauf der Szenarien
**Narration:**
> "15 Real-World Scenarios, darunter:
> - **Emergency Revoke** — Kompromittierten Account in Sekunden sperren
> - **JIT Access** — Just-In-Time Privileged Access mit automatischem Ablauf
> - **Cross-CMDB Audit** — Remedy, ServiceNow und JSM Assets vergleichen
> - **PAM Alert → SNOW Incident** — Security-Event wird automatisch zum Incident
> Jedes Szenario ist 1:1 übertragbar auf die echten Systeme."

---

## 🎯 Part 7: Outro (15s)
**Visual:** GitHub Repo Link
**Narration:**
> "PAMlab ist Open Source auf GitHub.
> `docker compose up` und du hast eine komplette IAM/PAM Dev-Umgebung in unter einer Minute.
> Kein Lizenz-Stress, keine Wartezeiten, keine Abhängigkeiten."

---

**Gesamtlänge: ~5 Minuten**
