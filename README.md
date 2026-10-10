# 🧩 Escape Room

Un **Escape Room de Python** creado para la **Pyschool** para aprender programación resolviendo desafíos.

Cada habitación tiene una temática distinta y propone pequeños problemas que van aumentando de dificultad. La idea es aprender Python de una forma simple, práctica y entretenida. 🐍

## 🚀 Empezar

Clona el repositorio e instala las dependencias:

```bash
pnpm install
```

Crea un archivo `.env`:

```env
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Luego inicia el proyecto:

```bash
pnpm dev
```

También puedes usar `npm` o `yarn` si lo prefieres.

## 🧠 ¿Qué aprenderás?

| Estación                 | Descripción                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| 🌳 **Laboratorio Oak**   | Aprende Python y ciencia de datos explorando y analizando datos de Pokémon.               |
| 🚀 **Estación Espacial** | Resuelve desafíos temáticos para practicar fundamentos de Python mediante un Escape Room. |

Cada habitación es una pequeña misión. Resuelve una, avanza a la siguiente y aprende en el camino. 🚀

## Requisitos

- [Node.js](https://nodejs.org/) `22.12.0` o superior.
- [pnpm](https://pnpm.io/installation) `10` o superior.
- Git.

Comprueba las versiones instaladas con:

```bash
node --version
pnpm --version
git --version
```

## Instalación local

Clona el repositorio e instala sus dependencias:

```bash
git clone https://github.com/python-chile/escape-room.git
cd escape-room
pnpm install
```

Si trabajas desde un fork, reemplaza la URL por la de tu fork.

Crea un archivo `.env` en la raíz del proyecto con las variables de Supabase:

```env
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Después inicia el servidor:

```bash
pnpm dev
```

Abre [http://localhost:4321](http://localhost:4321) en el navegador.

## Comandos útiles

```bash
pnpm check          # Revisión de tipos y componentes Astro
pnpm lint           # Revisión con ESLint
pnpm test           # Pruebas unitarias y de integración
pnpm test:python    # Pruebas E2E con Playwright
pnpm build          # Build de producción
pnpm verify         # Ejecuta todas las validaciones del proyecto
```

## Estructura principal

- `src/content/`: estaciones, salas y desafíos en Markdown/MDX.
- `src/components/`: componentes visuales y lógica interactiva.
- `src/pages/`: rutas de la aplicación.
- `public/`: imágenes y otros recursos estáticos.
- `tests/`: pruebas unitarias, de integración y E2E.

Para aportar al proyecto, revisa [CONTRIBUTING.md](CONTRIBUTING.md).
