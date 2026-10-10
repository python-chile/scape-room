# Contribuir a PySchool

Gracias por tu interés en mejorar PySchool. Cualquier aporte sirve y será
valorado: contenido educativo, correcciones, mejoras visuales, accesibilidad,
pruebas y documentación.

## Antes de empezar

Revisa las [issues abiertas](https://github.com/python-chile/escape-room/issues)
para conocer el trabajo pendiente. Si quieres realizar un cambio grande, abre
primero una issue para conversar el alcance.

Consulta el [README](README.md) para instalar el proyecto y ejecutar las
validaciones.

## Ramas

Usamos una organización inspirada en Git Flow, pero somos flexibles. La rama
`main` contiene la versión estable y publicable. Para trabajar, crea una rama
con un nombre claro:

```text
feature/<descripcion>   nueva funcionalidad o contenido
fix/<descripcion>       corrección de un problema
docs/<descripcion>      documentación
test/<descripcion>      pruebas
refactor/<descripcion>  reorganización interna
chore/<descripcion>     mantenimiento
```

Ejemplo:

```bash
git switch main
git pull --rebase origin main
git switch -c docs/improve-installation
```

Usa minúsculas y guiones para describir la rama. Si el cambio es pequeño,
puedes elegir el prefijo que mejor lo represente.

## Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```text
tipo(alcance): descripción breve
```

Tipos habituales:

- `feat`: funcionalidad o contenido nuevo.
- `fix`: corrección de un error.
- `docs`: documentación.
- `test`: pruebas.
- `refactor`: reorganización sin cambiar el comportamiento.
- `style`: estilos o formato.
- `chore`: mantenimiento.

Ejemplos:

```text
docs: explain local installation
feat(space-station): add a room about dictionaries
fix(editor): improve syntax error feedback
```

Procura que cada commit represente un cambio coherente y no mezcle tareas sin
relación.

## Pull Requests

Antes de abrir un Pull Request, ejecuta las validaciones relacionadas con tu
cambio. Para una revisión completa:

```bash
pnpm check
pnpm lint
pnpm test
pnpm test:python
pnpm build
```

Publica tu rama y abre el Pull Request hacia `main`:

```bash
git push -u origin nombre-de-tu-rama
```

En la descripción explica:

- Qué problema resuelve el cambio.
- Qué modificaste.
- Cómo probarlo.
- Qué validaciones ejecutaste.
- Qué issue está relacionada, si corresponde.

Si cambias la interfaz, agrega capturas o una grabación. Si cambias un
desafío educativo, explica qué concepto aprende el estudiante y cómo se valida
la solución.

## Reportar problemas

Incluye pasos para reproducir el problema, resultado esperado, resultado
actual y, cuando sea útil, navegador, sistema operativo y versión de Node.js.

No publiques credenciales, tokens ni información privada en issues o Pull
Requests. Toda contribución, incluso una pequeña corrección, es bienvenida y
será valorada.
