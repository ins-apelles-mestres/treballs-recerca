# Web de Treballs de Recerca — INS Apel·les Mestres

Web estàtica per mostrar els treballs de recerca de l'INS Apel·les Mestres, connectada a un Google Spreadsheet.

---

## Configuració inicial (fer una sola vegada)

### 1. Prepara el Google Spreadsheet

El full ha de tenir exactament aquests noms de columna a la primera fila:

| Títol | Autor | Tutor | Enllaç PDF | Any de defensa | Ha optat a premi | Ha guanyat premi i quin |
|---|---|---|---|---|---|---|

A la columna **"Ha optat a premi"** escriu `Sí` o `No`.  
A **"Ha guanyat premi i quin"** deixa la cel·la buida si no ha guanyat, o escriu el nom del premi.

### 2. Publica el full com a CSV

1. Obre el Google Sheet
2. Menú **Fitxer > Compartir > Publicar al web**
3. Selecciona el full i el format **"Valors separats per comes (.csv)"**
4. Fes clic a **"Publicar"** i copia la URL

### 3. Configura l'URL al codi

Obre el fitxer `js/app.js` i busca aquesta línia:

```javascript
const CSV_URL = 'ENGANXA_AQUÍ_LA_URL_DEL_CSV';
```

Substitueix el text per la URL copiada. Per exemple:

```javascript
const CSV_URL = 'https://docs.google.com/spreadsheets/d/XXXXX/pub?gid=0&single=true&output=csv';
```

### 4. Configura GitHub Pages

1. Crea un repositori públic a GitHub anomenat `treballs-recerca`
2. Puja tots els fitxers d'aquest projecte
3. Ves a **Settings > Pages** i a "Source" selecciona **"GitHub Actions"**
4. La web estarà disponible a `https://<el-teu-usuari>.github.io/treballs-recerca/`

---

## Actualitzar les dades

Edita el Google Sheet i **refresca la web**. Els canvis es veuen automàticament (Google tarda uns 5 minuts a propagar els canvis).

---

## Personalització

### Canviar colors

Obre `css/style.css` i modifica les variables al principi del fitxer:

```css
:root {
  --color-primari: #f0a500;   /* taronja de la capçalera */
  --color-accent:  #7a1a3a;   /* bordeus dels botons, taula i títols */
}
```

### Canviar el nom de l'institut

Obre `index.html` i edita les línies:

```html
<h1>Treballs de Recerca</h1>
<p class="header-subtitol">Institut · Arxiu de treballs</p>
```

### Canviar quants treballs apareixen a "Recents"

Obre `js/app.js` i canvia:

```javascript
const N_RECENTS = 5;
```
