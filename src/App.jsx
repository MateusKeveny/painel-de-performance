import React, { useState, useEffect, useMemo } from "react";
import { Moon, Sun, LogOut, User, Gauge, Loader2, List, ArrowLeft, CheckCircle2, Lock, Mail, Key, ArrowUpDown } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uahkplwssonbxzydjytb.supabase.co";
const SUPABASE_KEY = "sb_publishable_lHDfFg_TeeEDTBIgqhgYBg_7oHN4M4w";
const BACKGROUND_URL = "https://i.postimg.cc/fT3Trm2M/Template-apresentacao-i-Green-pages-to-jpg-0011.png"; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
    <svg viewBox="0 0 200 130" className="w-full max-w-[300px] overflow-visible">
      <path d={arcPath(0, 180, r)} stroke={t.border} strokeWidth="12" fill="none" strokeLinecap="round" />
      <path d={arcPath(0, angle, r)} stroke={t.accent} strokeWidth="12" fill="none" strokeLinecap="round" />
      <line x1={gx} y1={gy} x2={cx - (r - 22) * Math.cos(((180 - goalAngle) * Math.PI) / 180)} y2={cy - (r - 22) * Math.sin(((180 - goalAngle) * Math.PI) / 180)} stroke={t.warn} strokeWidth="3" />
      <circle cx={cx} cy={cy} r="5" fill={t.needle} />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={t.needle} strokeWidth="3" strokeLinecap="round" />
      <text x={cx} y={cy + 25} textAnchor="middle" className="font-mono text-2xl font-bold" fill={t.text}>{fmtPct(value)}</text>
      <text x={0} y={115} className="font-sans text-[10px]" fill={t.textSoft}>0%</text>
      <text x={200} y={115} textAnchor="end" className="font-sans text-[10px]" fill={t.textSoft}>100%</text>
      <text x={gx} y={gy - 15} textAnchor="middle" className="font-sans text-[10px] font-bold" fill={t.warn}>meta {GOAL}%</text>
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
  const [sortConfig, setSortConfig] = useState({ key: 'data', direction: 'desc' });

  const t = dark ? tokens.dark : tokens.light;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
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
      const { data } = await supabase.from('atendimentos').select('*').eq('atendente', session.user.email).order('criado_em', { ascending: false });
      if (mounted && data) setRecords(data);
      if (mounted) setLoading(false);
    })();
    return () => (mounted = false);
  }, [session, needsPasswordChange]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email: emailInput.trim(), password: passwordInput });
    if (error) setAuthError(error.message);
    else if (passwordInput === DEFAULT_PASSWORD) setNeedsPasswordChange(true);
    setAuthLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setAuthError("");
    if (newPassword !== confirmNewPassword) return setAuthError("As senhas não coincidem.");
    if (newPassword.length < 6) return setAuthError("A senha precisa ter pelo menos 6 caracteres.");
    setAuthLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setAuthError("Erro ao atualizar a senha.");
    else { setNeedsPasswordChange(false); setAuthError(""); }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setNeedsPasswordChange(false);
    setEmailInput("");
    setPasswordInput("");
  };

  const saveRetorno = async (id, newValue) => {
    setSavingId(id);
    await supabase.from('atendimentos').update({ protocolo_retorno: newValue }).eq('id', id);
    setTimeout(() => setSavingId(null), 1000);
  };

  const myPct = useMemo(() => {
    const valid = records.filter(r => !isNaN(Number(r.avaliacao)) && Number(r.avaliacao) > 0);
    if (!valid.length) return 0;
    return (valid.reduce((a, r) => a + Number(r.avaliacao), 0) / (valid.length * 5)) * 100;
  }, [records]);

  const weeklyStats = useMemo(() => {
    const weeks = {};
    records.forEach(r => {
      if (!r.data) return;
      const d = new Date(r.data);
      if (isNaN(d)) return;
      const startOfYear = new Date(d.getFullYear(), 0, 1);
      const weekNum = Math.ceil((((d - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);
      const weekKey = `Semana ${weekNum} (${d.getFullYear()})`;
      if (!weeks[weekKey]) weeks[weekKey] = { name: weekKey, items: [] };
      weeks[weekKey].items.push(r);
    });
    return Object.values(weeks).map(w => {
      const valid = w.items.filter(r => !isNaN(Number(r.avaliacao)) && Number(r.avaliacao) > 0);
      const sum = valid.reduce((acc, curr) => acc + Number(curr.avaliacao), 0);
      return { name: w.name, total: w.items.length, pct: valid.length > 0 ? (sum / (valid.length * 5)) * 100 : 0 };
    });
  }, [records]);

  const handleSort = (key) => {
    setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc' });
  };

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      let aVal = a[sortConfig.key], bVal = b[sortConfig.key];
      if (sortConfig.key === 'avaliacao' || sortConfig.key === 'protocolo') {
        aVal = Number(aVal) || 0; bVal = Number(bVal) || 0;
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [records, sortConfig]);

  if (!session) {
    return (
      <div className="fixed inset-0 overflow-y-auto bg-[#0A0A0A] flex flex-col items-center justify-center p-6" style={{ backgroundImage: `url('${BACKGROUND_URL}')`, backgroundSize: 'cover', backgroundPosition: 'left' }}>
        <div className="w-full max-w-md rounded-3xl border border-white/20 bg-black/60 backdrop-blur-md p-10 shadow-2xl">
          <h2 className="text-2xl font-bold mb-2 text-white text-center">Gestão de Resultados</h2>
          <p className="text-sm text-gray-300 text-center mb-8">Faça login para ver seus resultados</p>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5 text-gray-400">E-mail corporativo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Mail size={18} /></div>
                <input type="email" required value={emailInput} onChange={e => setEmailInput(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-3 outline-none text-sm text-white focus:border-[#1F9D6B]" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5 text-gray-400">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Lock size={18} /></div>
                <input type="password" required value={passwordInput} onChange={e => setPasswordInput(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-3 outline-none text-sm text-white focus:border-[#1F9D6B]" />
              </div>
            </div>
            {authError && <div className="text-sm border border-red-500/50 bg-red-500/10 text-red-400 rounded-lg px-3 py-2 text-center">{authError}</div>}
            <button type="submit" disabled={authLoading} className="w-full rounded-xl py-3 font-bold text-white bg-[#1F9D6B] hover:bg-[#188057] transition-all flex justify-center items-center gap-2 mt-4">
              {authLoading ? <Loader2 size={18} className="animate-spin" /> : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==== O LAYOUT FLUIDO + AS CORES DINÂMICAS ====
  return (
    <div className="fixed inset-0 overflow-y-auto font-sans transition-colors duration-300" style={{ backgroundColor: t.bg, color: t.text }}>
      <div className="min-h-full w-full p-4 sm:p-8">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-8 w-full px-6 py-4 rounded-2xl border shadow-sm transition-colors duration-300" style={{ backgroundColor: t.panel, borderColor: t.border }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl transition-colors duration-300" style={{ backgroundColor: t.accentSoft }}>
              <Gauge size={26} color={t.accent} />
            </div>
            <div>
              <div className="font-bold text-xl">Painel de Performance</div>
              <div className="text-sm transition-colors duration-300" style={{ color: t.textSoft }}>Meta C-SAT: {GOAL}%</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* O BOTÃO DE TEMA VOLTOU AQUI */}
            <button onClick={() => setDark(!dark)} className="p-2.5 rounded-xl transition-colors duration-300 hover:opacity-80" style={{ backgroundColor: t.panel2, color: t.text }}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="border text-sm px-4 py-2.5 rounded-xl font-mono flex items-center gap-2 transition-colors duration-300" style={{ backgroundColor: t.panel2, color: t.textSoft, borderColor: t.border }}>
              <User size={16} /> {session.user.email}
            </div>
            <button onClick={handleLogout} className="p-2.5 rounded-xl text-white hover:opacity-80 transition-colors duration-300" style={{ backgroundColor: t.danger }} title="Sair">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 transition-colors duration-300" style={{ color: t.textSoft }}>
            <Loader2 className="animate-spin mb-2" size={28} />
            Carregando resultados...
          </div>
        ) : (
          <div className="w-full">
            {view === "dashboard" && (
              <div className="flex flex-col items-center w-full animate-in fade-in duration-300">
                
                {/* Gráfico Principal */}
                <div className="border rounded-3xl p-8 flex flex-col items-center w-full max-w-2xl mb-8 shadow-sm transition-colors duration-300" style={{ backgroundColor: t.panel, borderColor: t.border }}>
                  <div className="text-sm uppercase tracking-widest mb-6 font-semibold transition-colors duration-300" style={{ color: t.textSoft }}>C-SAT Geral Atual</div>
                  <Gauge95 value={myPct} t={t} />
                  <div className="text-sm mt-8 px-5 py-2 rounded-full transition-colors duration-300" style={{ backgroundColor: t.panel2, color: t.textSoft }}>
                    Baseado em <strong>{records.length}</strong> atendimento(s)
                  </div>
                </div>

                {/* Semanas */}
                <div className="w-full mb-8">
                  <h3 className="text-xl font-bold mb-4 px-2">Resultados por Semana</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    {weeklyStats.map((week, idx) => (
                      <div key={idx} className="border rounded-2xl p-6 shadow-sm transition-colors duration-300" style={{ backgroundColor: t.panel, borderColor: t.border }}>
                        <div className="font-bold text-sm mb-3 transition-colors duration-300" style={{ color: t.textSoft }}>{week.name}</div>
                        <div className="text-3xl font-mono font-bold mb-2 transition-colors duration-300" style={{ color: week.pct >= GOAL ? t.accent : t.warn }}>
                          {fmtPct(week.pct)}
                        </div>
                        <div className="text-xs transition-colors duration-300" style={{ color: t.textSoft }}>{week.total} chamado(s)</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={() => setView("list")} className="px-8 py-4 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all mb-10" style={{ backgroundColor: t.accent }}>
                  <List size={18} /> Detalhar Meus Atendimentos e Notas
                </button>
              </div>
            )}

            {view === "list" && (
              <div className="w-full animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setView("dashboard")} className="px-4 py-2 border rounded-xl flex items-center gap-2 hover:opacity-80 transition-colors duration-300" style={{ backgroundColor: t.panel, borderColor: t.border, color: t.textSoft }}>
                    <ArrowLeft size={16} /> Voltar ao Painel
                  </button>
                  <div className="text-sm transition-colors duration-300" style={{ color: t.textSoft }}>Exibindo <strong>{records.length}</strong> chamados</div>
                </div>

                <div className="border rounded-2xl overflow-hidden w-full shadow-sm transition-colors duration-300" style={{ backgroundColor: t.panel, borderColor: t.border }}>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-sm text-left">
                      <thead className="border-b transition-colors duration-300" style={{ backgroundColor: t.panel2, borderColor: t.border, color: t.textSoft }}>
                        <tr>
                          <th className="p-4 font-semibold cursor-pointer hover:opacity-70 transition-opacity" onClick={() => handleSort('protocolo')}>
                            <div className="flex items-center gap-1">Protocolo <ArrowUpDown size={14} /></div>
                          </th>
                          <th className="p-4 font-semibold cursor-pointer hover:opacity-70 transition-opacity" onClick={() => handleSort('data')}>
                            <div className="flex items-center gap-1">Data <ArrowUpDown size={14} /></div>
                          </th>
                          <th className="p-4 font-semibold text-center cursor-pointer hover:opacity-70 transition-opacity" onClick={() => handleSort('avaliacao')}>
                            <div className="flex items-center justify-center gap-1">Nota <ArrowUpDown size={14} /></div>
                          </th>
                          <th className="p-4 font-semibold w-1/3">Tabulação (Análise)</th>
                          <th className="p-4 font-semibold w-64">Protocolo de Retorno</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedRecords.map((r) => {
                          const val = Number(r.avaliacao);
                          // Lógica dinâmica de cores das notas baseada no tema
                          let badgeStyle = { backgroundColor: "transparent", color: t.textSoft, borderColor: t.border };
                          if (val === 1 || val === 2) badgeStyle = { backgroundColor: t.danger + "20", color: t.danger, borderColor: t.danger + "50" };
                          else if (val === 3) badgeStyle = { backgroundColor: t.warn + "20", color: t.warn, borderColor: t.warn + "50" };
                          else if (val === 4 || val === 5) badgeStyle = { backgroundColor: t.accentSoft, color: t.accent, borderColor: t.accent };

                          return (
                            <tr key={r.id} className="border-b hover:bg-black/5 transition-colors duration-300" style={{ borderColor: t.border }}>
                              <td className="p-4 font-mono font-medium">{r.protocolo}</td>
                              <td className="p-4 whitespace-nowrap">{r.data}</td>
                              <td className="p-4 text-center">
                                <span className="px-3 py-1 rounded-md border font-mono font-bold text-sm" style={badgeStyle}>{r.avaliacao}</span>
                              </td>
                              <td className="p-4 transition-colors duration-300" style={{ color: t.textSoft }}><div className="line-clamp-2 text-xs">{r.tabulacao || "—"}</div></td>
                              <td className="p-4">
                                <div className="relative">
                                  <input 
                                    value={r.protocolo_retorno || ""}
                                    onChange={(e) => setRecords(records.map(rec => rec.id === r.id ? { ...rec, protocolo_retorno: e.target.value } : rec))}
                                    onBlur={(e) => saveRetorno(r.id, e.target.value)}
                                    placeholder="Digite e clique fora..."
                                    className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-1 transition-colors duration-300"
                                    style={{ backgroundColor: t.bg, borderColor: t.border, color: t.text, focusBorderColor: t.accent }}
                                  />
                                  {savingId === r.id && <CheckCircle2 size={16} className="absolute right-3 top-2.5" style={{ color: t.accent }} />}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 text-xs italic border-t transition-colors duration-300" style={{ borderColor: t.border, color: t.textSoft }}>
                    * Notas 0 e -1 não impactam no seu resultado
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}