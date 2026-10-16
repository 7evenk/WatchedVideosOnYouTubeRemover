# Einheitliche Extension-Struktur / Unified extension layout

In Chrome immer den Unterordner **extension** auswählen, niemals den Repository-Hauptordner und nicht dist.

```text
<repository>/
  extension/       Manifest, Laufzeitdateien, Icons und Übersetzungen
  tools/           Build und Prüfungen
  test/            Automatisierte Tests und synthetische Fixtures
  docs/            Dokumentation und Store-Unterlagen
  dist/            Versionierter entpackter Build, ZIP, Prüfsumme und Buildmanifest (ignoriert)
  package.json
```

PowerShell im Repository-Hauptordner, Node.js 24 oder neuer:

```powershell
npm test
npm run check
npm run build
```

**Chrome:** chrome://extensions → Entwicklermodus → Entpackte Erweiterung laden → extension.
Nach Codeänderungen npm run build ausführen, dann die Erweiterung und die Zielseite neu laden. Beim Album Sorter kompiliert der Build die Quellen aus src/ nach extension/; dieser generierte Ordner ist aus Git ausgeschlossen. Bei den anderen Erweiterungen liegen die Laufzeitquellen direkt in extension/.

Eine bisher aus Hauptordner oder dist geladene **Entwicklungskopie** einmal entfernen und neu aus extension laden; andernfalls bleibt der alte Ladepfad gespeichert. Chrome kann wegen des Pfadwechsels eine neue Entwicklungs-ID vergeben, daher lokale Einstellungen gegebenenfalls neu setzen. Bestehende Store-Installationen und veröffentlichte Pakete werden nicht verändert.

Der Build packt nur die fest erlaubten Laufzeitdateien. Manifest und Skripte liegen im ZIP direkt an dessen Wurzel; das ZIP zuerst entpacken, bevor der enthaltene Ordner in Chrome geladen wird. Bereits vorhandene gleichnamige Build-Artefakte bleiben unter dist/archive erhalten.

This convention matches Kids Planner Connect: load **extension/**, use **dist/** for versioned delivery artifacts. Development scripts, test data and Store artwork never enter the ZIP. Versions, runtime behavior and permissions remain unchanged by this migration. A real Chrome reload is still required; automated checks alone are not a live website test.

Tracking: https://github.com/7evenk/WatchedVideosOnYouTubeRemover/issues/29
