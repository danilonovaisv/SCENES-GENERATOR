# Antigravity Rules - React 19 & "Ghost Era" Aesthetics

## 1. React 19 Best Practices

* **Server Components First:** Por padrão, todos os componentes são `RSC`. Use a diretiva `"use client"` estritamente na fronteira onde a iteratividade for necessária (e.g., binds de Three.js ou onClick events).
* **Data Fetching:** Abandone hooks e `useEffect` para chamadas a APIs. Priorize Server Components, fetch assíncrono padrão ou hook `use()` em Client Components.
* **Forms & State:** Utilize `useActionState`, `useFormStatus` e `useOptimistic` para controle de forms, reduzindo estados manuais.
* **Refs:** Não utilize `forwardRef` para refs; passe refs diretamente como prop com React 19.
* **Contexto:** Use diretamente `<Context>` em vez de `<Context.Provider>`.

## 2. Next.js 15+

* **App Router:** Navegação estrita pelo `src/app`.
* **Error Boundaries:** É obrigatória a criação de `error.tsx` acompanhando Layouts ou Pages principais. Erros graves no client-side devem ser capturados e reportados pelo *Sentinel Prime* virtualmente.
* **Asset Loading:** Sempre utilize features nativas como `next/image`, `next/font` para tipografias (TT Norms Pro preferencialmente), e preloading para recursos massivos.

## 3. Ghost System Aesthetics & WebGL (Three.js/R3F)

* **Arquitetura Visual:** Implemente a mentalidade "Ghost Era" - Minimalismo, Dark Mode Premium, animações micro-motion via framer-motion e alta performance.
* **Isolamento de Canvas (R3F):** A tag `<Canvas>` do React Three Fiber só pode existir em componentes com `"use client"`. Além disso, **todos os componentes WebGL devem ter fallbacks providenciados** para o caso do WebGL context ser perdido.
* **Componentes 3D Reutilizáveis:** Evite acoplamento alto: separe materials, lights e geomtry em mini-componentes modulares e reutilizáveis via ref forwarding quando aplicável.
* **CSS Grid & Layout:** Use Tailwind 4 massivamente. Sections devem usar classes estruturais consolidadas, como `.std-grid`. As cores da marca: `bluePrimary: #0048ff`, `blueAccent: #4fe6ff`, `background: #040013`.

## 4. Segurança e Dados

* **Firebase/Supabase Rules:** Toda comunicação externa a DBs deve ser envelopada em Auth e RLS estritos. Keys seguras no servidor, nunca vazadas pro Client.

A inobservância destas regras ativará falhas de QA via Antigravity Validators.
