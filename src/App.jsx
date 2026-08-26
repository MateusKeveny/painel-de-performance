import React, { useState, useEffect, useMemo } from "react";
import { Moon, Sun, LogOut, User, Gauge, Loader2, List, ArrowLeft, CheckCircle2, Lock, Mail, Key, ArrowUpDown } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

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

  // Ordenação da tabela
  const [sortConfig, setSortConfig] = useState({ key: 'data', direction: 'desc' });

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

  // Cálculo geral (ignorando notas 0 e -1)
  const myPct = useMemo(() => {
    const valid = records.filter(r => {
      const n = Number(r.avaliacao);
      return !isNaN(n) && n > 0;
    });
    if (!valid.length) return 0;
    const sum = valid.reduce((a, r) => a + Number(r.avaliacao), 0);
    return (sum / (valid.length * 5)) * 100;
  }, [records]);

  // Agrupamento por Semana para a Tela Inicial
  const weeklyStats = useMemo(() => {
    const weeks = {};
    records.forEach(r => {
      if (!r.data) return;
      const dateObj = new Date(r.data);
      if (isNaN(dateObj)) return;
      // Identifica o número da semana no ano
      const startOfYear = new Date(dateObj.getFullYear(), 0, 1);
      const weekNum = Math.ceil((((dateObj - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);
      const weekKey = `Semana ${weekNum} (${dateObj.getFullYear()})`;

      if (!weeks[weekKey]) {
        weeks[weekKey] = { name: weekKey, items: [] };
      }
      weeks[weekKey].items.push(r);
    });

    return Object.values(weeks).map(w => {
      const valid = w.items.filter(r => {
        const n = Number(r.avaliacao);
        return !isNaN(n) && n > 0;
      });
      const sum = valid.reduce((acc, curr) => acc + Number(curr.avaliacao), 0);
      const pct = valid.length > 0 ? (sum / (valid.length * 5)) * 100 : 0;
      return {
        name: w.name,
        total: w.items.length,
        pct
      };
    });
  }, [records]);

  // Cores das notas conforme solicitado (1,2 vermelho | 3 amarelo | 4,5 verde | 0,-1/vazio branco)
  const getNoteStyle = (val) => {
    const n = Number(val);
    if (n === 1 || n === 2) return { bg: "#C24A3D20", color: "#C24A3D", border: "#C24A3D50" };
    if (n === 3) return { bg: "#C9861A20", color: "#C9861A", border: "#C9861A50" };
    if (n === 4 || n === 5) return { bg: t.accentSoft, color: t.accent, border: t.accent };
    return { bg: "transparent", color: t.text, border: t.border }; // 0, -1 ou vazios ficam brancos/neutros
  };

  // Ordenação da tabela
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedRecords = useMemo(() => {
    let sortable = [...records];
    sortable.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (sortConfig.key === 'avaliacao' || sortConfig.key === 'protocolo') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortable;
  }, [records, sortConfig]);

  // Se não estiver logado
  if (!session) {
    return (
      <div className="min-h-screen w-full flex items-center justify-between p-6 md:p-16 lg:p-24 bg-cover bg-left bg-no-repeat bg-[#0A0A0A]" style={{ backgroundImage: `url('${BACKGROUND_URL}')` }}>
        <style>{FONTS}</style>
        <div className="hidden md:flex flex-col text-white max-w-lg">
          <h1 style={{ fontFamily: "Montserrat, sans-serif" }} className="text-4xl lg:text-5xl font-bold tracking-wide leading-tight text-white/90 drop-shadow-lg">
            Painel de<br/>Performance
          </h1>
        </div>
        <div className="w-full max-w-md rounded-[2rem] border border-white/20 bg-black/40 backdrop-blur-md p-10 shadow-2xl">
          <h2 style={{ fontFamily: "Montserrat, sans-serif" }} className="text-2xl font-bold mb-2 text-white text-center">Acesso ao Painel</h2>
          <p className="text-sm text-gray-300 text-center mb-8 font-['Inter']">Faça login para ver seus resultados</p>
          <form onSubmit={handleLogin} className="space-y-5 font-['Inter']">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5 text-gray-400">E-mail corporativo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Mail size={18} /></div>
                <input type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-3.5 outline-none focus:border-[#1F9D6B] focus:bg-white/10 transition-all text-sm text-white placeholder-gray-500" placeholder="operador@igreenenergy.com.br" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5 text-gray-400">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Lock size={18} /></div>
                <input type="password" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-3.5 outline-none focus:border-[#1F9D6B] focus:bg-white/10 transition-all text-sm text-white" placeholder="••••••••" />
              </div>
            </div>
            {authError && <div className="text-sm border border-red-500/50 bg-red-500/10 text-red-400 rounded-lg px-3 py-2 text-center">{authError}</div>}
            <button type="submit" disabled={authLoading} className="w-full rounded-xl py-3.5 font-bold text-white bg-[#1F9D6B] hover:bg-[#188057] transition-all flex justify-center items-center gap-2 mt-4">
              {authLoading ? <Loader2 size={18} className="animate-spin" /> : "Entrar no sistema"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (needsPasswordChange) {
    return (
      <div className="min-h-screen w-full flex items-center justify-between p-6 md:p-16 lg:p-24 bg-cover bg-left bg-no-repeat bg-[#0A0A0A]" style={{ backgroundImage: `url('${BACKGROUND_URL}')` }}>
        <style>{FONTS}</style>
        <div className="w-full max-w-md rounded-[2rem] border border-white/20 bg-black/40 backdrop-blur-md p-10 shadow-2xl mx-auto">
          <h2 className="text-xl font-bold mb-2 text-white text-center">Defina sua Senha Pessoal</h2>
          <form onSubmit={handlePasswordChange} className="space-y-5 mt-6">
            <input type="password" placeholder="Nova senha" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white" />
            <input type="password" placeholder="Confirmar nova senha" required value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white" />
            {authError && <div className="text-red-400 text-sm text-center">{authError}</div>}
            <button type="submit" className="w-full py-3 bg-[#1F9D6B] text-white rounded-xl font-bold">Salvar nova senha</button>
          </form>
        </div>
      </div>
    );
  }

  // PAINEL PRINCIPAL COM LARGURA FLUIDA DE PONTA A PONTA
  return (
    <div style={{ background: t.bg, color: t.text, fontFamily: "Inter, sans-serif" }} className="min-h-screen w-full p-4 sm:p-8">
      <style>{FONTS}</style>
      
      {/* Cabeçalho expandido */}
      <div className="flex items-center justify-between mb-8 w-full px-4 py-3 rounded-2xl" style={{ background: t.panel, borderColor: t.border, border: '1px solid' }}>
        <div className="flex items-center gap-3">
          <div style={{ background: t.accentSoft }} className="p-2.5 rounded-xl">
            <Gauge size={26} color={t.accent} />
          </div>
          <div>
            <div style={{ fontFamily: "Montserrat, sans-serif" }} className="font-bold text-xl leading-tight">Painel de Performance</div>
            <div style={{ color: t.textSoft }} className="text-sm">Meta C-SAT: {GOAL}%</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setDark((d) => !d)} style={{ background: t.panel2, color: t.text }} className="p-2.5 rounded-xl hover:opacity-80 transition-opacity">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div style={{ background: t.panel2, color: t.textSoft, borderColor: t.border }} className="text-sm px-4 py-2.5 rounded-xl font-mono flex items-center gap-2 border">
            <User size={16} /> {session.user.email}
          </div>
          <button onClick={handleLogout} style={{ background: t.danger, color: "#fff" }} className="p-2.5 rounded-xl hover:opacity-80 transition-opacity" title="Sair">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-32 justify-center" style={{ color: t.textSoft }}>
          <Loader2 className="animate-spin" size={28} /> 
          <span className="text-sm">Carregando seus resultados...</span>
        </div>
      ) : (
        <div className="w-full">
          {view === "dashboard" && (
            <div className="flex flex-col items-center animate-in fade-in duration-300">
              <div style={{ background: t.panel, borderColor: t.border }} className="rounded-3xl border p-8 flex flex-col items-center w-full max-w-2xl shadow-sm mb-6">
                <div style={{ fontFamily: "Montserrat, sans-serif", color: t.textSoft }} className="text-sm uppercase tracking-widest mb-4 font-semibold">C-SAT Geral Atual</div>
                <Gauge95 value={myPct} t={t} />
                <div style={{ color: t.textSoft, background: t.panel2 }} className="text-sm mt-6 px-4 py-1.5 rounded-full">
                  Baseado em <strong>{records.length}</strong> atendimento(s)
                </div>
              </div>

              {/* Seção de Resultados por Semana */}
              <div className="w-full max-w-4xl mb-8">
                <h3 style={{ fontFamily: "Montserrat, sans-serif" }} className="text-lg font-bold mb-4">Resultados por Semana</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {weeklyStats.map((week, idx) => (
                    <div key={idx} style={{ background: t.panel, borderColor: t.border }} className="border rounded-2xl p-5 shadow-sm">
                      <div className="font-bold text-sm mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>{week.name}</div>
                      <div className="text-2xl font-bold font-mono mb-1" style={{ color: week.pct >= GOAL ? t.accent : t.warn }}>
                        {fmtPct(week.pct)}
                      </div>
                      <div className="text-xs" style={{ color: t.textSoft }}>{week.total} atendimento(s) no período</div>
                    </div>
                  ))}
                  {weeklyStats.length === 0 && (
                    <div className="text-sm" style={{ color: t.textSoft }}>Nenhum dado semanal encontrado.</div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => setView("list")}
                style={{ background: t.accent }} 
                className="px-8 py-4 rounded-xl font-semibold text-white flex items-center gap-2 shadow-lg hover:shadow-xl transition-all font-['Montserrat']"
              >
                <List size={18} /> Detalhar Meus Atendimentos e Notas
              </button>
            </div>
          )}

          {view === "list" && (
            <div className="animate-in fade-in duration-300 w-full">
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => setView("dashboard")}
                  style={{ color: t.textSoft, borderColor: t.border, background: t.panel }} 
                  className="px-4 py-2 text-sm border rounded-xl flex items-center gap-2 hover:opacity-80 font-['Montserrat'] font-medium"
                >
                  <ArrowLeft size={16} /> Voltar ao Painel
                </button>
                <div style={{ color: t.textSoft }} className="text-sm">
                  Exibindo <strong>{records.length}</strong> chamados
                </div>
              </div>

              <div style={{ background: t.panel, borderColor: t.border }} className="rounded-2xl border overflow-hidden shadow-sm w-full">
                {records.length === 0 ? (
                  <div style={{ color: t.textSoft }} className="p-10 text-center text-sm">
                    Nenhum atendimento vinculado ao seu e-mail foi encontrado.
                  </div>
                ) : (
                  <div>
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr style={{ borderColor: t.border, color: t.textSoft, background: t.panel2 }} className="border-b">
                            <th className="p-4 font-semibold cursor-pointer" onClick={() => handleSort('protocolo')}>
                              <div className="flex items-center gap-1">Protocolo <ArrowUpDown size={14} /></div>
                            </th>
                            <th className="p-4 font-semibold cursor-pointer" onClick={() => handleSort('data')}>
                              <div className="flex items-center gap-1">Data <ArrowUpDown size={14} /></div>
                            </th>
                            <th className="p-4 font-semibold text-center cursor-pointer" onClick={() => handleSort('avaliacao')}>
                              <div className="flex items-center justify-center gap-1">Nota <ArrowUpDown size={14} /></div>
                            </th>
                            <th className="p-4 font-semibold w-1/3">Tabulação (Análise)</th>
                            <th className="p-4 font-semibold w-64">Protocolo de Retorno</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedRecords.map((r) => {
                            const noteStyle = getNoteStyle(r.avaliacao);
                            return (
                              <tr key={r.id} style={{ borderColor: t.border }} className="border-b last:border-0 hover:bg-opacity-50 transition-colors">
                                <td style={{ fontFamily: "JetBrains Mono, monospace" }} className="p-4 font-medium">{r.protocolo}</td>
                                <td className="p-4 whitespace-nowrap">{r.data}</td>
                                <td className="p-4 text-center">
                                  <span style={{ background: noteStyle.bg, color: noteStyle.color, borderColor: noteStyle.border }} className="px-3 py-1 rounded-md font-mono text-sm font-bold border">
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
                                      className="w-full rounded-lg border px-3 py-2 outline-none focus:border-[#1F9D6B] text-sm"
                                    />
                                    {savingId === r.id && (
                                      <div className="absolute right-3 top-2.5" style={{color: t.accent}}>
                                        <CheckCircle2 size={16} />
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {/* Nota de rodapé explicativa sobre notas 0 e -1 */}
                    <div className="p-4 text-xs italic border-t" style={{ borderColor: t.border, color: t.textSoft }}>
                      * Notas 0 e -1 não impactam no seu resultado
                    </div>
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