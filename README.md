# 🛵 MiRuta — Ganancias del día

**PWA para calcular y registrar las ganancias diarias de un domiciliario.**

---

## ¿Qué hace?

- Ingresa el **dinero base** con el que iniciaste el día
- Ingresa el **dinero final** separado en efectivo y transferencias
- Calcula automáticamente la **ganancia neta**
- Guarda un **historial por fecha** con estadísticas acumuladas
- Funciona **sin internet** después de la primera visita

---

## Cómo usar

### En el navegador
Abre la app en: `https://<tu-usuario>.github.io/domiciliario-app/`

### Instalar en el celular (Android)
1. Abre el enlace en **Chrome**
2. Toca el menú (⋮) → **"Añadir a pantalla de inicio"**
3. Confirma y la app queda instalada como nativa

### Instalar en el celular (iPhone)
1. Abre el enlace en **Safari**
2. Toca el ícono de compartir (cuadro con flecha)
3. Selecciona **"Añadir a pantalla de inicio"**

---

## Subir a GitHub Pages

```bash
# 1. Crea un repo en GitHub llamado: domiciliario-app
# 2. Clona y sube los archivos
git init
git add .
git commit -m "MiRuta PWA - primera versión"
git branch -M main
git remote add origin https://github.com/<TU_USUARIO>/domiciliario-app.git
git push -u origin main

# 3. Activa GitHub Pages:
# Settings → Pages → Source: "Deploy from a branch" → main → / (root) → Save
```

En unos minutos la app estará disponible en:
`https://<TU_USUARIO>.github.io/domiciliario-app/`

---

## Tecnologías
- HTML + CSS + JavaScript vanilla
- PWA (Service Worker + Web App Manifest)
- localStorage para persistencia local
- Sin dependencias ni frameworks
