'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Image as ImageIcon, Download, Copy, Loader2, LayoutDashboard, CheckCircle2 } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

type GeneratedScenes = {
  wide: string;
  medium: string;
  closeup: string;
};

export default function SceneGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pieceType, setPieceType] = useState('Post Instagram');
  const [artDirection, setArtDirection] = useState('Minimalista e Clean');
  const [sceneType, setSceneType] = useState('Estúdio Fotográfico Minimalista');
  const [characters, setCharacters] = useState('Sem personagens (Foco apenas no ambiente)');
  const [additionalDescription, setAdditionalDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedScenes | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith('image/')) {
      setFile(dropped);
      setPreviewUrl(URL.createObjectURL(dropped));
    }
  };

  const handleGenerate = async () => {
    if (!file) return;
    
    setIsGenerating(true);
    setResults(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pieceType', pieceType);
      formData.append('artDirection', artDirection);
      formData.append('sceneType', sceneType);
      formData.append('characters', characters);
      formData.append('additionalDescription', additionalDescription);

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to generate scenes');
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
      alert('Ocorreu um erro ao gerar as cenas. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadBatch = async () => {
    if (!results) return;
    const zip = new JSZip();
    
    const addBase64ToZip = (base64: string, filename: string) => {
      const data = base64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
      zip.file(filename, data, { base64: true });
    };

    addBase64ToZip(results.wide, 'scene-01-wide.png');
    addBase64ToZip(results.medium, 'scene-02-medium.png');
    addBase64ToZip(results.closeup, 'scene-03-closeup.png');

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'scene-generator-mockups.zip');
  };

  const handleCopyMarkdown = () => {
    if (!results) return;
    const markdown = `# Scene Generator Results\n\n**Peça:** ${pieceType}\n**Direção de Arte:** ${artDirection}\n**Cena:** ${sceneType}\n**Personagens:** ${characters}\n\n## 01. Wide Shot\n![Wide Shot](${results.wide})\n\n## 02. Medium Shot\n![Medium Shot](${results.medium})\n\n## 03. Close-up\n![Close-up](${results.closeup})`;
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-50">
      {/* Sidebar / Form Area */}
      <motion.aside 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full md:w-[400px] lg:w-[480px] bg-white border-r border-zinc-200 flex flex-col h-screen sticky top-0 overflow-y-auto"
      >
        <div className="p-8 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-sm">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Scene Generator</h1>
              <p className="text-xs text-zinc-500 font-medium">Art Director Workspace</p>
            </div>
          </div>

          <div className="space-y-8 flex-1">
            {/* Upload Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-900">1. Arte Original</label>
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden
                  ${previewUrl ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50'} 
                  flex flex-col items-center justify-center aspect-video`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-sm font-medium flex items-center gap-2">
                        <Upload size={16} /> Trocar imagem
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-zinc-500 gap-2">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-zinc-100 flex items-center justify-center mb-2">
                      <Upload size={20} className="text-zinc-400" />
                    </div>
                    <p className="text-sm font-medium text-zinc-700">Clique ou arraste a arte aqui</p>
                    <p className="text-xs text-zinc-400">PNG, JPG até 5MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Type Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-900">2. Tipo de Peça</label>
              <select 
                value={pieceType}
                onChange={(e) => setPieceType(e.target.value)}
                suppressHydrationWarning
                className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all appearance-none"
              >
                <option>Post Instagram</option>
                <option>Story Instagram</option>
                <option>Outdoor / Billboard</option>
                <option>Cartão de Visita</option>
                <option>Mupi / Totem</option>
                <option>Embalagem / Packaging</option>
                <option>Poster A4/A3</option>
                <option>Capa de Revista</option>
                <option>Tela de Computador / Web</option>
                <option>Tela de Telemóvel / Mobile</option>
              </select>
            </div>

            {/* Art Direction Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-900">3. Direção de Arte</label>
              <select 
                value={artDirection}
                onChange={(e) => setArtDirection(e.target.value)}
                suppressHydrationWarning
                className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all appearance-none"
              >
                <option>Minimalista e Clean</option>
                <option>Cyberpunk / Neon</option>
                <option>Vintage / Retrô</option>
                <option>Corporativo / Profissional</option>
                <option>Urbano / Street</option>
                <option>Natureza / Orgânico</option>
                <option>Luxo / High-end</option>
                <option>Pop Art / Colorido</option>
                <option>Cinematográfico / Dramático</option>
              </select>
            </div>

            {/* Scene Type Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-900">4. Tipo de Cena</label>
              <select 
                value={sceneType}
                onChange={(e) => setSceneType(e.target.value)}
                suppressHydrationWarning
                className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all appearance-none"
              >
                <option>Estúdio Fotográfico Minimalista</option>
                <option>Mesa de Café / Restaurante</option>
                <option>Estação de Metro / Comboio</option>
                <option>Cruzamento Movimentado</option>
                <option>Secretária de Escritório Moderno</option>
                <option>Sala de Estar Aconchegante</option>
                <option>Paragem de Autocarro</option>
                <option>Ambiente de Loja / Retalho</option>
                <option>Mãos a segurar o objeto</option>
              </select>
            </div>

            {/* Characters Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-900">5. Personagens na Cena</label>
              <select 
                value={characters}
                onChange={(e) => setCharacters(e.target.value)}
                suppressHydrationWarning
                className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all appearance-none"
              >
                <option>Sem personagens (Foco apenas no ambiente)</option>
                <option>Jovem adulto a usar o telemóvel</option>
                <option>Profissional de negócios em movimento</option>
                <option>Grupo de amigos a interagir</option>
                <option>Família num momento de lazer</option>
                <option>Skatista / Jovem urbano</option>
                <option>Modelo de moda a posar</option>
                <option>Mãos anónimas a interagir com a peça</option>
              </select>
            </div>

            {/* Additional Description Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-900">6. Detalhes Adicionais <span className="text-zinc-400 font-normal">(Opcional)</span></label>
              <textarea 
                value={additionalDescription}
                onChange={(e) => setAdditionalDescription(e.target.value)}
                suppressHydrationWarning
                placeholder="Ex: Adicionar luzes de neon azuis, ou colocar um café ao lado..."
                className="w-full h-20 p-3 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all resize-none"
              />
            </div>
          </div>

          <div className="pt-8 mt-auto">
            <button
              onClick={handleGenerate}
              disabled={!file || isGenerating}
              className="w-full h-12 rounded-xl bg-zinc-900 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Gerando Cenas...
                </>
              ) : (
                <>
                  <ImageIcon size={18} />
                  Gerar 3 Cenas
                </>
              )}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content / Gallery Area */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto h-screen">
        <div className="max-w-5xl mx-auto">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Galeria de Resultados</h2>
              <p className="text-sm text-zinc-500 mt-1">As suas cenas geradas aparecerão aqui.</p>
            </div>
            
            <AnimatePresence>
              {results && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3"
                >
                  <button 
                    onClick={handleCopyMarkdown}
                    className="h-10 px-4 rounded-lg bg-white border border-zinc-200 text-zinc-700 text-sm font-medium hover:bg-zinc-50 flex items-center gap-2 transition-all shadow-sm"
                  >
                    {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    {copied ? 'Copiado!' : 'Copy Markdown'}
                  </button>
                  <button 
                    onClick={handleDownloadBatch}
                    className="h-10 px-4 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Download size={16} />
                    Download Batch
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          {isGenerating ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-zinc-400 space-y-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-zinc-100"></div>
                <div className="w-24 h-24 rounded-full border-4 border-zinc-900 border-t-transparent animate-spin absolute inset-0"></div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-zinc-900 font-medium">A processar a sua arte...</p>
                <p className="text-sm">A aplicar texturas e a renderizar iluminação (Wide, Medium, Close-up).</p>
              </div>
            </div>
          ) : results ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <ResultCard title="01. Wide Shot" description="Contexto amplo do ambiente" image={results.wide} delay={0.1} />
              <ResultCard title="02. Medium Shot" description="Visão ao nível dos olhos e interação" image={results.medium} delay={0.2} />
              <ResultCard title="03. Close-up" description="Foco dramático na peça" image={results.closeup} delay={0.3} />
            </motion.div>
          ) : (
            <div className="h-[60vh] flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-3xl bg-white/50">
              <ImageIcon size={48} className="mb-4 text-zinc-300" />
              <p className="text-zinc-500 font-medium">Nenhuma cena gerada ainda.</p>
              <p className="text-sm mt-1">Preencha o formulário ao lado para começar.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ResultCard({ title, description, image, delay }: { title: string, description: string, image: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="group flex flex-col gap-4"
    >
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-sm">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
        <p className="text-xs text-zinc-500 mt-1">{description}</p>
      </div>
    </motion.div>
  );
}
