# Specs — Cybercafé 24hs

Plan de trabajo en formato *spec-driven*: cada ítem describe el **problema**, el
**criterio de aceptación** (cómo se verifica que quedó resuelto) y los **archivos**
involucrados. Un PR por ítem salvo que se indique lo contrario.

| ID | Título | Prioridad | Estado |
|----|--------|-----------|--------|
| [B1](bugs.md#b1) | El sorteo trae películas con 2 votos | 1 | ✅ Hecho |
| [B2](bugs.md#b2) | Race condition en el catálogo | 1 | ✅ Hecho |
| [B3](bugs.md#b3) | Modales sin Escape / foco / `role="dialog"` | 1 | ✅ Hecho |
| [B4](bugs.md#b4) | Sinopsis generada siempre en español | 1 | ✅ Hecho |
| [B5](bugs.md#b5) | Strings sin traducir | 1 | ✅ Hecho |
| [B6](bugs.md#b6) | Login "Google" manual falso | 1 | ✅ Hecho |
| [O1](optimizaciones.md#o1) | Pósters más pesados de lo necesario | 2 | ✅ Hecho |
| [O2](optimizaciones.md#o2) | `alert()` para errores | 2 | ✅ Hecho |
| [O3](optimizaciones.md#o3) | Migración legacy en cada lectura de localStorage | 2 | ✅ Hecho |
| [O4](optimizaciones.md#o4) | Tests + CI | 2 | ✅ Hecho |
| [M1](mejoras-ux.md#m1) | Feedback inmediato al abrir una ficha | 2 | ⬜ Pendiente |
| [M2](mejoras-ux.md#m2) | Paginación: ir a página | 2 | ⬜ Pendiente |
| [M3](mejoras-ux.md#m3) | Marquee por región | 2 | ⬜ Pendiente |
| [M4](mejoras-ux.md#m4) | `prefers-reduced-motion` | 2 | ⬜ Pendiente |
| [M5](mejoras-ux.md#m5) | SEO / PWA mínimo | 2 | ⬜ Pendiente |
| [I1](innovaciones.md#i1) | Links compartibles a una película | 3 | ⬜ Pendiente |
| [I2](innovaciones.md#i2) | Sorteo con semilla compartida | 3 | ⬜ Pendiente |
| [I3](innovaciones.md#i3) | Backup / restore de "La vi" e historial | 3 | ⬜ Pendiente |
| [I4](innovaciones.md#i4) | Modo maratón | 3 | ⬜ Pendiente |
| [I5](innovaciones.md#i5) | Subtítulos en Torrentio | 3 | ⬜ Pendiente |

## Orden sugerido

1. O4 → red de seguridad (tests + CI) para todo lo demás.
2. B1 + B2 → calidad del sorteo y del catálogo.
3. B3 + B4 + B5 → accesibilidad e i18n, un solo PR.
4. B6 → limpieza del login.
5. O1–O3, M1–M5 → PRs chicos, uno por ítem.
6. I1 → I2 → I3 → features de comunidad.

## Convenciones

- Cada PR referencia su ID en el título (`[B3] ...`) y actualiza el estado en esta tabla.
- Todo cambio en `src/lib/*` que sea lógica pura lleva test en `src/lib/*.test.ts` (`npm test`).
- `npm run lint`, `npm test` y `npm run build` corren en CI en cada PR.
