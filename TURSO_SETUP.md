# Turso Database Setup für Custom Shapes

## CLI-Befehle die Sie ausführen müssen:

### 1. Login und Gruppe wählen
```bash
# Login (falls noch nicht eingeloggt)
turso auth login

# Michi Gruppe verwenden
turso group use Michi
```

### 2. Database erstellen
```bash
# Database für Custom Shapes erstellen
turso db create image-cropper-shapes --group Michi
```

### 3. Database Schema erstellen
```bash
# Shell öffnen
turso db shell image-cropper-shapes

# SQL Schema ausführen (im Shell):
CREATE TABLE custom_shapes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  points TEXT NOT NULL,
  canvas_size TEXT NOT NULL,
  category TEXT DEFAULT 'Custom',
  description TEXT,
  icon TEXT DEFAULT '🎨',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT
);

# Shell verlassen mit: .exit
```

### 4. Connection Token erstellen
```bash
# Token für die App erstellen
turso db tokens create image-cropper-shapes
```

### 5. Database URL und Token speichern

Nach Ausführung der Befehle benötigen wir:
- **TURSO_DATABASE_URL**: Die Database URL
- **TURSO_AUTH_TOKEN**: Das generierte Token

Diese werden in die `.env.local` Datei eingetragen.

## Befehle kopieren und nacheinander ausführen

1. `turso auth login`
2. `turso group use Michi` 
3. `turso db create image-cropper-shapes --group Michi`
4. `turso db shell image-cropper-shapes`
5. SQL Schema einfügen und ausführen
6. `.exit` (um Shell zu verlassen)
7. `turso db tokens create image-cropper-shapes`

**Bitte führen Sie diese Befehle aus und teilen Sie mir dann die TURSO_DATABASE_URL und den TOKEN mit, damit ich die Integration vervollständigen kann.**