import React, { useState, useEffect, useMemo } from "react";
import { Moon, Sun, LogOut, User, Gauge, Loader2, List, ArrowLeft, CheckCircle2, Lock, Mail, Key } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// 1. Cole suas chaves e o link da imagem aqui embaixo:
const SUPABASE_URL = "https://uahkplwssonbxzydjytb.supabase.co";
const SUPABASE_KEY = "sb_publishable_lHDfFg_TeeEDTBIgqhgYBg_7oHN4M4w";
const BACKGROUND_URL = "https://i.postimg.cc/fT3Trm2M/Template-apresentacao-i-Green-pages-to-jpg-0011.png"; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');
`;

const GOAL = 95;
const DEFAULT_PASSWORD = "iGreen@2026";

function fmtPct(n) {
  if (!isFinite(n)) return "—";
  return n.toFixed(1).replace(".", ",") + "%";
}

const tokens = {
  light: { bg: "#F5F7F3", panel: "#FFFFFF", panel2: "#EEF2EA", text: "#0F1C1A", textSoft: "#4B5C55", border: "#DCE3D9", accent: "#1F9D6B", accentSoft: "#DFF3E8", warn: "#C9861A", danger: "#C24A3D", needle: "#0F1C1A" },
  dark: { bg: "#0B1412", panel: "#101E1B", panel2: "#152420", text: "#EAF3EE", textSoft: "#93A69D", border: "#1F332C", accent: "#35D07F", accentSoft: "#12281F", warn: "#E8B94A", danger: "#E17163", needle: "#EAF3EE" },
};

function Gauge95({ value, t }) {
  const clamped = Math.max(0, Math.min(100, value || 0));
  const angle = (clamped / 100) * 180;
  const goalAngle = (GOAL / 100) * 180;
  const r = 80;
  const cx = 100, cy = 100;
  const toXY = (deg) => {
    const rad = ((180 - deg) * Math.PI) / 180;
    return [cx - r * Math.cos(rad), cy - r * Math.sin(rad)];
  };
  const [nx, ny] = toXY(angle);
  const [gx, gy] = toXY(goalAngle);

  const arcPath = (fromDeg, toDeg, radius) => {
    const [x1, y1] = toXY(fromDeg);
    const [x2, y2] = (() => {
      const rad = ((180 - toDeg) * Math.PI) / 180;
      return [cx - radius * Math.cos(rad), cy - radius * Math.sin(rad)];
    })();
    const large = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <svg viewBox="0 0 200 118" className="w-full max-w-[320px]">
      <path d={arcPath(0, 180, r)} stroke={t.border} strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d={arcPath(0, angle, r)} stroke={t.accent} strokeWidth="14" fill="none" strokeLinecap="round" />
      <line x1={gx} y1={gy} x2={cx - (r - 18) * Math.cos(((180 - goalAngle) * Math.PI) / 180)} y2={cy - (r - 18) * Math.sin(((180 - goalAngle) * Math.PI) / 180)} stroke={t.warn} strokeWidth="3" />
      <circle cx={cx} cy={cy} r="4" fill={t.needle} />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={t.needle} strokeWidth="3" strokeLinecap="round" />
      <text x={cx} y={cy + 30} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="28" fontWeight="700" fill={t.text}>{fmtPct(value)}</text>
      <text x={8} y={112} fontFamily="Inter, sans-serif" fontSize="10" fill={t.textSoft}>0%</text>
      <text x={192} y={112} textAnchor="end" fontFamily="Inter, sans-serif" fontSize="10" fill={t.textSoft}>100%</text>
      <text x={gx} y={gy - 12} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="600" fill={t.warn}>meta {GOAL}%</text>
    </svg>
  );
}

export default function CsatApp() {
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [session, setSession] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [records, setRecords] = useState([]);
  const [view, setView] = useState("dashboard");
  const [savingId, setSavingId] = useState(null);

  const t = dark ? tokens.dark : tokens.light;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session || needsPasswordChange) {
      setLoading(false);
      return;
    }
    
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('atendimentos')
        .select('*')
        .eq('atendente', session.user.email)
        .order('criado_em', { ascending: false });
      
      if (mounted && data) {
        setRecords(data);
      }
      if (mounted) setLoading(false);
    })();
    return () => (mounted = false);
  }, [session, needsPasswordChange]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailInput.trim(),
      password: passwordInput,
    });

    if (error) {
      setAuthError(error.message);
    } else if (passwordInput === DEFAULT_PASSWORD) {
      setNeedsPasswordChange(true);
    }
    setAuthLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setAuthError("");

    if (newPassword !== confirmNewPassword) {
      setAuthError("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      setAuthError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setAuthLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setAuthError("Erro ao atualizar a senha. Tente novamente.");
    } else {
      setNeedsPasswordChange(false);
      setAuthError("");
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setNeedsPasswordChange(false);
    setEmailInput("");
    setPasswordInput("");
  };

  const handleRetornoChange = (id, newValue) => {
    setRecords(records.map(r => r.id === id ? { ...r, protocolo_retorno: newValue } : r));
  };

  const saveRetorno = async (id, newValue) => {
    setSavingId(id);
    await supabase
      .from('atendimentos')
      .update({ protocolo_retorno: newValue })
      .eq('id', id);
    setTimeout(() => setSavingId(null), 1000);
  };

  const avg = (list) => {
    if (!list.length) return NaN;
    const sum = list.reduce((a, r) => a + (Number(r.avaliacao) || 0), 0);
    return (sum / list.length) * 10; 
  };

  const myPct = avg(records);

  // TELA DE LOGIN (COM FUNDO AJUSTADO: bg-cover bg-left)
  if (!session) {
    return (
      <div 
        className="min-h-screen w-full flex items-center justify-center md:justify-between p-6 md:p-16 lg:p-24 bg-cover bg-left bg-no-repeat bg-[#0A0A0A]"
        style={{ backgroundImage: `url('${BACKGROUND_URL}')` }}
      >
        <style>{FONTS}</style>
        
        {/* Título na esquerda */}
        <div className="hidden md:flex flex-col text-white max-w-lg">
          <h1 style={{ fontFamily: "Montserrat, sans-serif" }} className="text-4xl lg:text-5xl font-bold tracking-wide leading-tight text-white/90 drop-shadow-lg">
            Gestão de<br/>Resultados
          </h1>
        </div>

        {/* Caixa de login na direita */}
        <div className="w-full max-w-md rounded-[2rem] border border-white/20 bg-black/40 backdrop-blur-md p-10 shadow-2xl">
          <h2 style={{ fontFamily: "Montserrat, sans-serif" }} className="text-2xl font-bold mb-2 text-white text-center">Acesso ao Painel</h2>
          <p className="text-sm text-gray-300 text-center mb-8 font-['Inter']">Faça login para ver seus resultados</p>
          
          <form onSubmit={handleLogin} className="space-y-5 font-['Inter']">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5 text-gray-400">E-mail corporativo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Mail size={18} /></div>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-3.5 outline-none focus:border-[#1F9D6B] focus:bg-white/10 transition-all text-sm text-white placeholder-gray-500"
                  placeholder="operador@igreenenergy.com.br"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5 text-gray-400">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Lock size={18} /></div>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-3.5 outline-none focus:border-[#1F9D6B] focus:bg-white/10 transition-all text-sm text-white placeholder-gray-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {authError && <div className="text-sm border border-red-500/50 bg-red-500/10 text-red-400 rounded-lg px-3 py-2 text-center">{authError}</div>}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full rounded-xl py-3.5 font-bold text-white bg-[#1F9D6B] hover:bg-[#188057] shadow-[0_0_15px_rgba(31,157,107,0.3)] transition-all flex justify-center items-center gap-2 mt-4"
            >
              {authLoading ? <Loader2 size={18} className="animate-spin" /> : "Entrar no sistema"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // TELA DE TROCA DE SENHA OBRIGATÓRIA
  if (needsPasswordChange) {
    return (
      <div 
        className="min-h-screen w-full flex items-center justify-center md:justify-between p-6 md:p-16 lg:p-24 bg-cover bg-left bg-no-repeat bg-[#0A0A0A]"
        style={{ backgroundImage: `url('${BACKGROUND_URL}')` }}
      >
        <style>{FONTS}</style>
        
        <div className="hidden md:flex flex-col text-white max-w-lg">
          <h1 style={{ fontFamily: "Montserrat, sans-serif" }} className="text-4xl lg:text-5xl font-bold tracking-wide leading-tight text-white/90 drop-shadow-lg">
            Atualização de<br/>Segurança
          </h1>
        </div>

        <div className="w-full max-w-md rounded-[2rem] border border-white/20 bg-black/40 backdrop-blur-md p-10 shadow-2xl">
          <div className="flex items-center justify-center gap-2 mb-4 text-amber-500">
            <Key size={36} />
          </div>
          <h2 style={{ fontFamily: "Montserrat, sans-serif" }} className="text-xl font-bold mb-2 text-white text-center">Defina sua Senha Pessoal</h2>
          <p className="text-sm text-gray-300 text-center mb-8 font-['Inter']">Como este é o seu primeiro acesso, crie uma senha segura.</p>
          
          <form onSubmit={handlePasswordChange} className="space-y-5 font-['Inter']">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5 text-gray-400">Nova Senha</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 outline-none focus:border-[#1F9D6B] focus:bg-white/10 transition-all text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5 text-gray-400">Confirmar Nova Senha</label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 outline-none focus:border-[#1F9D6B] focus:bg-white/10 transition-all text-sm text-white"
              />
            </div>

            {authError && <div className="text-sm border border-red-500/50 bg-red-500/10 text-red-400 rounded-lg px-3 py-2 text-center">{authError}</div>}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full rounded-xl py-3.5 font-bold text-white bg-[#1F9D6B] hover:bg-[#188057] shadow-[0_0_15px_rgba(31,157,107,0.3)] transition-all flex justify-center items-center gap-2 mt-4"
            >
              {authLoading ? <Loader2 size={18} className="animate-spin" /> : "Salvar nova senha"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // PAINEL PRINCIPAL
  return (
    <div style={{ background: t.bg, color: t.text, fontFamily: "Inter, sans-serif" }} className="min-h-screen w-full p-5 sm:p-8">
      <style>{FONTS}</style>
      <div className="flex items-center justify-between mb-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <div style={{ background: t.accentSoft }} className="p-2 rounded-lg">
            <Gauge size={24} color={t.accent} />
          </div>
          <div>
            <div style={{ fontFamily: "Montserrat, sans-serif" }} className="font-bold text-lg leading-none">Gestão de Resultados</div>
            <div style={{ color: t.textSoft }} className="text-sm">Meta C-SAT: {GOAL}%</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDark((d) => !d)} style={{ background: t.panel2, color: t.text }} className="p-2.5 rounded-lg hover:opacity-80 transition-opacity">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div style={{ background: t.panel2, color: t.textSoft }} className="text-sm px-4 py-2.5 rounded-lg font-mono flex items-center gap-2 border" style={{borderColor: t.border}}>
            <User size={15} /> {session.user.email}
          </div>
          <button onClick={handleLogout} style={{ background: t.danger, color: "#fff" }} className="p-2.5 rounded-lg hover:opacity-80 transition-opacity" title="Sair">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-32 justify-center" style={{ color: t.textSoft }}>
          <Loader2 className="animate-spin" size={24} /> 
          <span className="text-sm">Carregando seus resultados...</span>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          {view === "dashboard" && (
            <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div style={{ background: t.panel, borderColor: t.border }} className="rounded-3xl border p-10 flex flex-col items-center w-full max-w-lg shadow-sm mb-6">
                <div style={{ fontFamily: "Montserrat, sans-serif", color: t.textSoft }} className="text-sm uppercase tracking-widest mb-6 font-semibold">C-SAT Atual</div>
                <Gauge95 value={myPct} t={t} />
                <div style={{ color: t.textSoft }} className="text-sm mt-6 bg-opacity-50 px-4 py-1.5 rounded-full" style={{background: t.panel2}}>
                  Baseado em <strong>{records.length}</strong> atendimento(s)
                </div>
              </div>

              <button 
                onClick={() => setView("list")}
                style={{ background: t.accent }} 
                className="px-6 py-3.5 rounded-xl font-semibold text-white flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all font-['Montserrat']"
              >
                <List size={18} /> Detalhar Meus Atendimentos
              </button>
            </div>
          )}

          {view === "list" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => setView("dashboard")}
                  style={{ color: t.textSoft, borderColor: t.border, background: t.panel }} 
                  className="px-4 py-2 text-sm border rounded-lg flex items-center gap-2 hover:opacity-80 transition-opacity font-['Montserrat'] font-medium"
                >
                  <ArrowLeft size={16} /> Voltar ao Painel
                </button>
                <div style={{ color: t.textSoft }} className="text-sm">
                  Exibindo <strong>{records.length}</strong> chamados
                </div>
              </div>

              <div style={{ background: t.panel, borderColor: t.border }} className="rounded-2xl border overflow-hidden shadow-sm">
                {records.length === 0 ? (
                  <div style={{ color: t.textSoft }} className="p-10 text-center text-sm">
                    Nenhum atendimento vinculado ao seu e-mail foi encontrado.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderColor: t.border, color: t.textSoft, background: t.panel2 }} className="border-b text-left">
                          <th className="p-4 font-semibold whitespace-nowrap font-['Montserrat']">Protocolo</th>
                          <th className="p-4 font-semibold font-['Montserrat']">Data</th>
                          <th className="p-4 font-semibold text-center font-['Montserrat']">Nota</th>
                          <th className="p-4 font-semibold w-1/3 font-['Montserrat']">Tabulação (Análise)</th>
                          <th className="p-4 font-semibold w-64 font-['Montserrat']">Protocolo de Retorno</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.map((r) => (
                          <tr key={r.id} style={{ borderColor: t.border }} className="border-b last:border-0 hover:bg-opacity-50 transition-colors">
                            <td style={{ fontFamily: "JetBrains Mono, monospace" }} className="p-4 font-medium">{r.protocolo}</td>
                            <td className="p-4 whitespace-nowrap">{r.data}</td>
                            <td className="p-4 text-center">
                              <span style={{ background: t.accentSoft, color: t.accent }} className="px-2.5 py-1 rounded-md font-mono text-sm font-bold">
                                {r.avaliacao}
                              </span>
                            </td>
                            <td style={{ color: t.textSoft }} className="p-4">
                              <div className="line-clamp-2 text-xs" title={r.tabulacao}>{r.tabulacao || "—"}</div>
                            </td>
                            <td className="p-4">
                              <div className="relative">
                                <input 
                                  value={r.protocolo_retorno || ""}
                                  onChange={(e) => handleRetornoChange(r.id, e.target.value)}
                                  onBlur={(e) => saveRetorno(r.id, e.target.value)}
                                  placeholder="Digite e clique fora..."
                                  style={{ background: t.bg, borderColor: t.border, color: t.text }}
                                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-[#1F9D6B] focus:ring-1 focus:ring-[#1F9D6B] transition-all text-sm"
                                />
                                {savingId === r.id && (
                                  <div className="absolute right-3 top-2.5 animate-in fade-in" style={{color: t.accent}}>
                                    <CheckCircle2 size={16} />
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}