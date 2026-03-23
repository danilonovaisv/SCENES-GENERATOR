---
description: Pipeline de Criação de Cena 3D
---
# Workflow de Criação de Cena 3D - Antigravity

Este workflow define as etapas exatas para a concepção, montagem, otimização e integração de componentes Three.js via R3F no Next.js do `SCENES-GENERATOR`. Siga a risca para evitar problemas comuns de performance WebGL e memory leaks.

## Fase 1: Análise e Inicialização

1. Confirme qual a geometria do objecto principal desejada e valide compatibilidades (modelos `.glb`/`.gltf` vs gerados proceduralmente).
2. Se depender de modelos GLTF:
   - Acione um processo que passe o `.glb` pelo `gltf-pipeline` ou similar para Draco Compression.
   - Use a CLI `gltfjsx` para gerar o boilerplate do modelo imperativo R3F via bash.
   - Salve o asset final em `public/models/` com extensões enxutas (`.glb` apenas).

## Fase 2: Estruturação R3F (`"use client"`)

1. Crie ou modifique um arquivo UI correspondente no diretório `components/3d/` ou via subpastas dedicadas em App Router se escopada.
2. Defina o wrapper `<Canvas>`. Use de preferência: `camera={{ position: [0, 0, 5], fov: 75 }}`, mas adapte ao layout.
3. Insira o `<Suspense>` nativo envolvendo a malha carregada para impedir bloqueios enquanto os models ou texturas terminam de baixar.
4. Inclua fallbacks robustos HTML caso haja um `R3F Error` (Exigência do Sentinel Prime).

## Fase 3: Adição de Efeitos, Motion e Estilo

1. Adicione Controles se interativo (e.g. `OrbitControls`, `PresentationControls` do `@react-three/drei`).
2. Aplique iluminação atmosférica (ex: Ambient, SpotLight, RectAreaLight) que combine com cores base da UX (e.g. `blueAccent: #4fe6ff`).
3. Para animar entradas visuais do DOM junto à cena 3D, utilize `framer-motion` em wrappers HTML normais.
4. Caso a cena precise de shaders personalizados (FBO, GPGPU ou shaders crues), extraia a lógica do WebGL fragment e vertex shaders para arquivos isolados visando clean architecture.

## Fase 4: Validação (Quality Assurance)

1. **Performance Check:** Pelo menos 60FPS? A quantidade de draw calls está exagerada?
2. **Context Degradation:** Assegure-se de que a tag `<Canvas>` faz o dispose adequado de Geometries e Materials quando a tela é desmontada.
3. Teste redimensionando a tela repetidas vezes e valide se o ratio é atualizado.
