/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, MapPin, GraduationCap, HeartPulse, ShieldCheck, 
  Camera, Upload, ChevronRight, ChevronLeft, CheckCircle2,
  LayoutDashboard, Users, FileText, Trash2, LogOut, Search,
  Download, Printer
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface AthleteData {
  id?: number;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  sexo: string;
  whatsapp: string;
  peso: string;
  altura: string;
  tam_kimono: string;
  num_calcado: string;
  foto_url: string;
  lado_dominante: string;
  graduacao_faixa: string;
  numero_nis: string;
  
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  
  escola: string;
  serie_ano: string;
  turno_estudo: string;
  
  restricao_medica: string;
  possui_alergias: string;
  tipo_sanguineo: string;
  contato_emergencia_nome: string;
  contato_emergencia_tel: string;
  
  responsavel_legal: string;
  responsavel_cpf: string;
  termo_aceite: boolean;
  created_at?: string;
}

const INITIAL_DATA: AthleteData = {
  nome_completo: '',
  cpf: '',
  data_nascimento: '',
  sexo: 'Masculino',
  whatsapp: '',
  peso: '',
  altura: '1.75',
  tam_kimono: '',
  num_calcado: '',
  foto_url: '',
  lado_dominante: 'Destro',
  graduacao_faixa: 'Branca',
  numero_nis: '',
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: '',
  uf: '',
  escola: '',
  serie_ano: '',
  turno_estudo: 'Manhã',
  restricao_medica: '',
  possui_alergias: '',
  tipo_sanguineo: '',
  contato_emergencia_nome: '',
  contato_emergencia_tel: '',
  responsavel_legal: '',
  responsavel_cpf: '',
  termo_aceite: false,
};

// --- Components ---

const Input = ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</label>
    <input 
      {...props}
      className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-zinc-800 placeholder:text-zinc-400"
    />
  </div>
);

const Select = ({ label, options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, options: string[] }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</label>
    <select 
      {...props}
      className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-zinc-800"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default function App() {
  const [view, setView] = useState<'form' | 'admin' | 'success'>('form');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<AthleteData>(INITIAL_DATA);
  const [athletes, setAthletes] = useState<AthleteData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (view === 'admin') {
      fetchAthletes();
    }
  }, [view]);

  const fetchAthletes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/athletes');
      const data = await res.json();
      setAthletes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, foto_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        setView('success');
      } else {
        alert("Erro ao cadastrar: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const deleteAthlete = async (id: number) => {
    if (!confirm("Deseja realmente excluir este cadastro?")) return;
    try {
      await fetch(`/api/athletes/${id}`, { method: 'DELETE' });
      fetchAthletes();
    } catch (err) {
      console.error(err);
    }
  };

  const generatePDF = (athlete: AthleteData) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(11, 30, 72); // Navy (#0B1E48)
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("FICHA CADASTRAL - ATLETA 2026", 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text("Sistema de Gestão Esportiva Integrada", 105, 30, { align: 'center' });

    // Photo placeholder or real photo if available
    if (athlete.foto_url) {
      try {
        doc.addImage(athlete.foto_url, 'JPEG', 160, 45, 40, 50);
      } catch (e) {
        doc.rect(160, 45, 40, 50);
        doc.text("FOTO", 180, 70, { align: 'center' });
      }
    } else {
      doc.rect(160, 45, 40, 50);
      doc.text("FOTO", 180, 70, { align: 'center' });
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("DADOS PESSOAIS", 10, 55);
    doc.setFontSize(10);
    doc.text(`Nome: ${athlete.nome_completo}`, 10, 65);
    doc.text(`CPF: ${athlete.cpf}`, 10, 72);
    doc.text(`Nascimento: ${athlete.data_nascimento}`, 10, 79);
    doc.text(`Sexo: ${athlete.sexo}`, 10, 86);
    doc.text(`WhatsApp: ${athlete.whatsapp}`, 10, 93);
    doc.text(`Peso: ${athlete.peso}kg | Altura: ${athlete.altura}m`, 10, 100);
    doc.text(`Kimono: ${athlete.tam_kimono} | Calçado: ${athlete.num_calcado}`, 10, 107);
    doc.text(`Lado Dominante: ${athlete.lado_dominante} | Faixa: ${athlete.graduacao_faixa}`, 10, 114);
    doc.text(`Número NIS: ${athlete.numero_nis}`, 10, 121);

    doc.setFontSize(14);
    doc.text("ENDEREÇO", 10, 135);
    doc.setFontSize(10);
    doc.text(`${athlete.logradouro}, ${athlete.numero}`, 10, 145);
    doc.text(`${athlete.bairro} - ${athlete.cidade}/${athlete.uf}`, 10, 152);

    doc.setFontSize(14);
    doc.text("VIDA ESCOLAR", 10, 165);
    doc.setFontSize(10);
    doc.text(`Escola: ${athlete.escola}`, 10, 175);
    doc.text(`Série: ${athlete.serie_ano} | Turno: ${athlete.turno_estudo}`, 10, 182);

    doc.setFontSize(14);
    doc.text("SAÚDE & EMERGÊNCIA", 10, 195);
    doc.setFontSize(10);
    doc.text(`Restrições: ${athlete.restricao_medica || 'Nenhuma'}`, 10, 205);
    doc.text(`Alergias: ${athlete.possui_alergias || 'Nenhuma'}`, 10, 212);
    doc.text(`Tipo Sanguíneo: ${athlete.tipo_sanguineo}`, 10, 219);
    doc.text(`Emergência: ${athlete.contato_emergencia_nome} (${athlete.contato_emergencia_tel})`, 10, 226);

    doc.setFontSize(14);
    doc.text("RESPONSABILIDADE", 10, 240);
    doc.setFontSize(10);
    doc.text(`Responsável: ${athlete.responsavel_legal}`, 10, 250);
    doc.text(`CPF Responsável: ${athlete.responsavel_cpf}`, 10, 257);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Documento gerado eletronicamente em " + new Date().toLocaleString(), 10, 285);
    doc.text("© 2026 Instituto Meio do Mundo", 105, 285, { align: 'center' });

    doc.save(`ficha_${athlete.nome_completo.replace(/\s+/g, '_')}.pdf`);
  };

  const filteredAthletes = athletes.filter(a => 
    a.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.cpf.includes(searchTerm)
  );

  if (view === 'success') {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-3xl shadow-2xl max-w-md w-full text-center flex flex-col items-center gap-6"
        >
          <div className="w-20 h-20 bg-navy/10 text-navy rounded-full flex items-center justify-center">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900">Inscrição Finalizada!</h1>
          <p className="text-zinc-600">Seus dados foram enviados com sucesso para a Temporada 2026. Bem-vindo ao time!</p>
          <button 
            onClick={() => { setView('form'); setStep(1); setFormData(INITIAL_DATA); }}
            className="w-full py-4 bg-navy hover:bg-navy/90 text-white font-bold rounded-xl transition-colors"
          >
            NOVA INSCRIÇÃO
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-zinc-900">
      {/* Header */}
      <header className="bg-navy border-b border-gold/30 sticky top-0 z-50 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-1 shadow-inner">
              <div className="w-full h-full bg-navy rounded-lg flex items-center justify-center text-gold font-black italic text-xl border-2 border-gold">
                EN
              </div>
            </div>
            <div className="text-white">
              <h1 className="font-black text-2xl leading-tight tracking-tighter uppercase">Judô Estrelas do Norte</h1>
              <p className="text-[10px] text-gold font-black uppercase tracking-[0.2em]">Temporada 2026</p>
            </div>
          </div>
          <button 
            onClick={() => setView(view === 'admin' ? 'form' : 'admin')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-light transition-all text-sm font-black text-navy uppercase tracking-wider shadow-lg"
          >
            {view === 'admin' ? <User size={18} /> : <LayoutDashboard size={18} />}
            {view === 'admin' ? 'Área do Atleta' : 'Painel Admin'}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {view === 'form' ? (
          <div className="max-w-2xl mx-auto">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-black text-zinc-900 mb-2">Ficha Cadastral</h2>
              <p className="text-zinc-500 font-medium">Sistema de Gestão Esportiva Integrada</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-12">
              <div className="flex justify-between mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="flex flex-col items-center gap-2">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-2",
                      step >= s ? "bg-navy border-navy text-gold" : "bg-white border-zinc-200 text-zinc-400"
                    )}>
                      {step > s ? <CheckCircle2 size={20} /> : s}
                    </div>
                    <span className={cn("text-[10px] uppercase font-bold tracking-tighter", step >= s ? "text-navy" : "text-zinc-400")}>
                      Etapa {s}
                    </span>
                  </div>
                ))}
              </div>
              <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-navy"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(step / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Form Steps */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><User size={24} /></div>
                      <h3 className="text-xl font-bold">Dados do Atleta</h3>
                    </div>

                    <div className="flex flex-col items-center gap-4 mb-8">
                      <div className="relative group">
                        <div className="w-32 h-32 bg-zinc-100 rounded-2xl border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-emerald-500">
                          {formData.foto_url ? (
                            <img src={formData.foto_url} className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <Camera className="text-zinc-400 mb-2" />
                              <span className="text-[10px] font-bold text-zinc-400 text-center px-4">CARREGAR FOTO</span>
                            </>
                          )}
                        </div>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    </div>

                    <Input label="Nome Completo" name="nome_completo" value={formData.nome_completo} onChange={handleInputChange} placeholder="Ex: João Silva" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="CPF" name="cpf" value={formData.cpf} onChange={handleInputChange} placeholder="000.000.000-00" />
                      <Input label="Data de Nascimento" name="data_nascimento" type="date" value={formData.data_nascimento} onChange={handleInputChange} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Select label="Sexo" name="sexo" value={formData.sexo} onChange={handleInputChange} options={['Masculino', 'Feminino', 'Outro']} />
                      <Input label="WhatsApp de Contato" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="(00) 00000-0000" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <Input label="Peso (kg)" name="peso" value={formData.peso} onChange={handleInputChange} placeholder="70" />
                      <Input label="Altura (m)" name="altura" value={formData.altura} onChange={handleInputChange} placeholder="1.75" />
                      <Input label="Tam. Kimono" name="tam_kimono" value={formData.tam_kimono} onChange={handleInputChange} placeholder="A2" />
                      <Input label="Nº Calçado" name="num_calcado" value={formData.num_calcado} onChange={handleInputChange} placeholder="40" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Select label="Lado Dominante" name="lado_dominante" value={formData.lado_dominante} onChange={handleInputChange} options={['Destro', 'Canhoto', 'Ambidestro']} />
                      <Select label="Graduação (Faixa)" name="graduacao_faixa" value={formData.graduacao_faixa} onChange={handleInputChange} options={['Branca', 'Cinza', 'Azul', 'Amarela', 'Laranja', 'Verde', 'Roxa', 'Marrom', 'Preta']} />
                      <Input label="Número NIS" name="numero_nis" value={formData.numero_nis} onChange={handleInputChange} placeholder="000.00000.00-0" />
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><MapPin size={24} /></div>
                      <h3 className="text-xl font-bold">Residência</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="md:col-span-3">
                        <Input label="Logradouro (Rua/Av)" name="logradouro" value={formData.logradouro} onChange={handleInputChange} />
                      </div>
                      <Input label="Número" name="numero" value={formData.numero} onChange={handleInputChange} />
                    </div>
                    <Input label="Bairro" name="bairro" value={formData.bairro} onChange={handleInputChange} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Cidade" name="cidade" value={formData.cidade} onChange={handleInputChange} />
                      <Input label="UF" name="uf" value={formData.uf} onChange={handleInputChange} placeholder="Ex: SP" />
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><GraduationCap size={24} /></div>
                      <h3 className="text-xl font-bold">Vida Escolar</h3>
                    </div>
                    <Input label="Escola" name="escola" value={formData.escola} onChange={handleInputChange} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Série / Ano" name="serie_ano" value={formData.serie_ano} onChange={handleInputChange} />
                      <Select label="Turno de Estudo" name="turno_estudo" value={formData.turno_estudo} onChange={handleInputChange} options={['Manhã', 'Tarde', 'Noite', 'Integral']} />
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div 
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><HeartPulse size={24} /></div>
                      <h3 className="text-xl font-bold">Saúde & Emergência</h3>
                    </div>
                    <Input label="Restrição Médica?" name="restricao_medica" value={formData.restricao_medica} onChange={handleInputChange} placeholder="Se houver, descreva aqui" />
                    <Input label="Possui Alergias?" name="possui_alergias" value={formData.possui_alergias} onChange={handleInputChange} placeholder="Se houver, descreva aqui" />
                    <Input label="Tipo Sanguíneo" name="tipo_sanguineo" value={formData.tipo_sanguineo} onChange={handleInputChange} placeholder="Ex: O+" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Contato Emergência" name="contato_emergencia_nome" value={formData.contato_emergencia_nome} onChange={handleInputChange} placeholder="Nome do contato" />
                      <Input label="Tel. Emergência" name="contato_emergencia_tel" value={formData.contato_emergencia_tel} onChange={handleInputChange} placeholder="(00) 00000-0000" />
                    </div>
                  </motion.div>
                )}

                {step === 5 && (
                  <motion.div 
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ShieldCheck size={24} /></div>
                      <h3 className="text-xl font-bold">Responsabilidade</h3>
                    </div>
                    <Input label="Responsável Legal" name="responsavel_legal" value={formData.responsavel_legal} onChange={handleInputChange} />
                    <Input label="CPF do Responsável" name="responsavel_cpf" value={formData.responsavel_cpf} onChange={handleInputChange} />
                    
                    <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200">
                      <h4 className="font-bold text-sm mb-3">Termo de Ciência e Compromisso</h4>
                      <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                        Declaro que as informações acima são verdadeiras e autorizo a participação do atleta nas atividades do Projeto Social Estrelas do Norte. Estou ciente e autorizo o uso de imagem para fins de divulgação pedagógica e institucional do projeto.
                      </p>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          name="termo_aceite" 
                          checked={formData.termo_aceite} 
                          onChange={handleInputChange}
                          className="w-5 h-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm font-bold text-zinc-700 group-hover:text-emerald-600 transition-colors">CONCORDO COM OS TERMOS</span>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="mt-10 flex gap-4">
                {step > 1 && (
                  <button 
                    onClick={() => setStep(s => s - 1)}
                    className="flex-1 py-4 flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl transition-all"
                  >
                    <ChevronLeft size={20} /> VOLTAR
                  </button>
                )}
                <button 
                  onClick={() => step < 5 ? setStep(s => s + 1) : handleSubmit()}
                  disabled={loading || (step === 5 && !formData.termo_aceite)}
                  className={cn(
                    "flex-[2] py-4 flex items-center justify-center gap-2 text-white font-bold rounded-xl transition-all shadow-lg shadow-navy/20",
                    loading || (step === 5 && !formData.termo_aceite) ? "bg-zinc-300 cursor-not-allowed" : "bg-navy hover:bg-navy/90"
                  )}
                >
                  {loading ? "PROCESSANDO..." : step === 5 ? "FINALIZAR INSCRIÇÃO" : "PRÓXIMA ETAPA"}
                  {step < 5 && !loading && <ChevronRight size={20} />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black text-zinc-900">Painel Administrativo</h2>
                <p className="text-zinc-500 font-medium">Gestão de Atletas Cadastrados</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar por nome ou CPF..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-full md:w-64"
                  />
                </div>
                <button 
                  onClick={fetchAthletes}
                  className="p-2.5 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors text-zinc-600"
                  title="Atualizar lista"
                >
                  <Users size={20} />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Atleta</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">CPF</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Escola</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Data Cadastro</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {loading ? (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-400 font-medium">Carregando dados...</td></tr>
                    ) : filteredAthletes.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-400 font-medium">Nenhum atleta encontrado.</td></tr>
                    ) : filteredAthletes.map((athlete) => (
                      <tr key={athlete.id} className="hover:bg-zinc-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200">
                              {athlete.foto_url ? (
                                <img src={athlete.foto_url} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-300"><User size={20} /></div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-zinc-900">{athlete.nome_completo}</p>
                              <p className="text-xs text-zinc-500">{athlete.whatsapp}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-zinc-600">{athlete.cpf}</td>
                        <td className="px-6 py-4 text-sm text-zinc-600">{athlete.escola}</td>
                        <td className="px-6 py-4 text-sm text-zinc-400">
                          {athlete.created_at ? new Date(athlete.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => generatePDF(athlete)}
                              className="p-2 text-navy hover:bg-navy/5 rounded-lg transition-colors"
                              title="Gerar PDF"
                            >
                              <FileText size={18} />
                            </button>
                            <button 
                              onClick={() => deleteAthlete(athlete.id!)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-navy border-t border-gold/30 py-16 mt-12 text-white">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-navy font-black italic text-lg border-2 border-gold shadow-lg">
              EN
            </div>
            <div>
              <span className="font-black text-xl uppercase tracking-tighter">Judô Estrelas do Norte</span>
              <p className="text-[10px] text-gold font-bold uppercase tracking-widest">Instituto Meio do Mundo</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">© 2026 Instituto Meio do Mundo</p>
            <p className="text-[10px] text-zinc-500">Desenvolvido por 3Brasil • Sistema de Gestão Esportiva</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
