# Paleta de Colores Exacta - NGX Transform

## 🎨 COLORES PRINCIPALES

### Electric Violet (Primary)
- **HEX**: `#6D00FF`
- **Usos**:
  - Botones principales
  - Enlaces y CTAs
  - Acentos de marca
  - Focus rings
  - Progress bars
  - Texto destacado

### Deep Purple (Accent)
- **HEX**: `#5B21B6`
- **Usos**:
  - Bordes de inputs
  - Acentos secundarios
  - Gradientes (con Electric Violet)

### Colores de Estado
- **Success Green**: `#00FF94`
- **Error Red**: `#EF4444` / `#FF3B30`
- **Warning Orange**: `#FF9500`
- **Info Blue**: `#0A84FF`

## 🖤 BACKGROUNDS

### Fondos Principales
- **Background Base**: `#0A0A0A` - Fondo principal de la app
- **Black Pure**: `#000000` / `black` - Usado en overlays y modales
- **Neutral 950**: `bg-neutral-950` - Fondo de páginas

### Cards y Superficies
- **Card Background**: `#0D0D10` - Variable CSS para cards
- **Card Actual**: `#0D0D10` con transparencias:
  - `bg-neutral-900/50` - 50% opacidad
  - `bg-neutral-900/80` - 80% opacidad
  - `bg-black/40` - 40% opacidad negro
  - `bg-black/60` - 60% opacidad negro
  - `bg-card/60` - 60% opacidad de card variable
  - `bg-card/80` - 80% opacidad de card variable

### Fondos de Input/Elementos
- **Input Background**: `#111116` - Variable CSS
- **Input Actual**: `bg-black/40` - Negro con 40% opacidad
- **Secondary Background**: `#111116`
- **Muted Background**: `#111113`
- **Neutral 900**: `bg-neutral-900`
- **Neutral 800**: `bg-neutral-800`

## 📝 TEXTO

### Colores de Texto Principal
- **Foreground Primary**: `#E6E6E6`
- **Foreground Secondary**: `#D6D6D6`
- **White**: `#FFFFFF` / `white`
- **Neutral 100**: `text-neutral-100`
- **Neutral 200**: `text-neutral-200`
- **Neutral 300**: `text-neutral-300`
- **Neutral 400**: `text-neutral-400`
- **Neutral 500**: `text-neutral-500`
- **Neutral 600**: `text-neutral-600`

### Texto Especial
- **Muted Foreground**: `#A1A1AA`
- **Electric Violet Text**: `text-[#6D00FF]`
- **Purple Light**: `text-[#B98CFF]`
- **Success Text**: `text-[#00FF94]`
- **Error Text**: `text-red-400`
- **Info Text**: `text-blue-400`
- **Success Alt**: `text-green-400`

## 🔲 BORDES

### Bordes Principales
- **Border Primary**: `#1F2937` (neutral-800)
- **Border Variable**: `border-border` (usa la variable CSS)
- **White 5%**: `border-white/5` - Blanco con 5% opacidad
- **White 10%**: `border-white/10` - Blanco con 10% opacidad
- **White 20%**: `border-white/20` - Blanco con 20% opacidad
- **White 30%**: `border-white/30` - Blanco con 30% opacidad

### Bordes con Color de Marca
- **Electric Violet Borders**:
  - `border-[#6D00FF]` - Sólido
  - `border-[#6D00FF]/30` - 30% opacidad
  - `border-[#6D00FF]/40` - 40% opacidad
  - `border-[#6D00FF]/50` - 50% opacidad
  - `border-[#6D00FF]/60` - 60% opacidad
  - `border-primary/50` - Variable con 50% opacidad

### Bordes de Input
- **Deep Purple**: `border-[#5B21B6]` - Bordes de inputs
- **Focus Border**: `focus:border-[#6D00FF]` - Al hacer focus

### Bordes de Estados
- **Neutral 800**: `border-neutral-800`
- **Success**: `border-[#00FF94]/30` - Verde con 30% opacidad
- **Error**: `border-[#FF3B30]/30` - Rojo con 30% opacidad

## 💍 RINGS (Focus States)

- **Ring Principal**: `ring-[#6D00FF]` - Electric Violet
- **Ring con Opacidad**: `ring-[#6D00FF]/60` - 60% opacidad
- **Focus Ring**: `focus-visible:ring-2 focus-visible:ring-[#6D00FF]`
- **Ring Base**: `ring-1` - 1px de ancho

## 🌟 SOMBRAS Y GLOWS

### Sombras de Botón
- **Neon Glow Base**: `shadow-[0_0_10px_rgba(109,0,255,0.6)]`
- **Hover Glow**: `hover:shadow-[0_0_24px_rgba(109,0,255,0.25)]`
- **Active Glow**: `shadow-[0_0_15px_rgba(109,0,255,0.3)]`
- **White Glow**: `shadow-[0_0_15px_rgba(255,255,255,0.3)]`

### Sombras de Card
- **Card Shadow**: Múltiples capas:
  ```
  0 1px 0 rgba(255,255,255,0.03) inset,
  0 10px 30px rgba(0,0,0,0.35)
  ```

### Text Shadows
- **Label Shadow**: `0 0 10px rgba(0,0,0,0.8)`

## 🎯 GRADIENTES

### Text Gradient (Títulos)
```css
background: linear-gradient(90deg, #6D00FF, #5B21B6)
```

### Hero Background Glow
```css
radial-gradient(60% 40% at 50% 0%, rgba(109,0,255,0.12), transparent 60%),
radial-gradient(40% 40% at 80% 20%, rgba(91,33,182,0.10), transparent 60%)
```

### Card Background Gradient
```css
linear-gradient(180deg, rgba(18,18,18,0.9), rgba(10,10,10,0.9))
```

### Overlay Gradients
```css
/* Bottom to Top */
bg-gradient-to-t from-black via-black/90 to-transparent

/* Top to Bottom con opacidad */
bg-gradient-to-t from-black via-black/20 to-transparent opacity-90

/* Lateral */
bg-gradient-to-r from-black/60 via-transparent to-black/60 opacity-80
```

### HR Soft (Divisor)
```css
linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)
```

## 🔢 VALORES DE OPACIDAD COMUNES

### Opacidades de Negro
- `black/30` - 30%
- `black/40` - 40%
- `black/60` - 60%
- `black/90` - 90%

### Opacidades de Blanco
- `white/5` - 5%
- `white/10` - 10%
- `white/20` - 20%
- `white/30` - 30%

### Opacidades de Electric Violet
- `#6D00FF/20` - 20% (backgrounds)
- `#6D00FF/30` - 30% (borders)
- `#6D00FF/40` - 40% (borders ghost)
- `#6D00FF/50` - 50% (hovers)
- `#6D00FF/60` - 60% (borders default)
- `#6D00FF33` - 20% en hex (tabs active)

### Opacidades Neutras
- `neutral-900/50` - 50%
- `neutral-900/80` - 80%
- `neutral-800` - Sólido

## 🎨 COLORES DE ACENTOS (Sliders/Ranges)

- **Electric Violet**: `accent-[#6D00FF]` - Slider principal
- **Red**: `accent-red-500` - Slider de estrés
- **Blue**: `accent-blue-500` - Slider de sueño
- **Green**: `accent-green-500` - Slider de disciplina

## 🔄 ESTADOS INTERACTIVOS

### Hover States
- **Brightness**: `hover:brightness-110` - Aumenta brillo 10%
- **Background Changes**:
  - `hover:bg-neutral-900`
  - `hover:bg-neutral-800`
  - `hover:bg-white/20`
  - `hover:bg-card/80`
  - `hover:border-white/20`
  - `hover:border-primary/50`

### Disabled States
- **Opacity**: `disabled:opacity-50`
- **Cursor**: `disabled:pointer-events-none`
- **Color**: `disabled:cursor-not-allowed`

### Active States
- **Scale**: `active:scale-95`

## 📐 VALORES EXACTOS DE TAILWIND

### Neutral Scale Completo
- `neutral-50` → `neutral-950`
- Más usados:
  - `neutral-100` - Texto claro
  - `neutral-300` - Texto secundario
  - `neutral-400` - Texto desenfatizado
  - `neutral-500` - Placeholders
  - `neutral-600` - Texto muy sutil
  - `neutral-800` - Bordes
  - `neutral-900` - Fondos
  - `neutral-950` - Fondo página

### Destructive/Error
- `red-400` - Texto de error
- `red-500` - Fondo destructivo
- `bg-red-500` - Botón destructivo
- `hover:bg-red-400` - Hover destructivo

Este documento contiene TODOS los valores exactos de colores utilizados en la aplicación NGX Transform.