import React, { useState, useEffect, useMemo } from "react";
import { LogOut, User, Gauge, Loader2, List, ArrowLeft, CheckCircle2, Lock, Mail, Key, ArrowUpDown } from "lucide-react";
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

// Gráfico Corrigido (sem cortes)
function Gauge95({ value }) {
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
      <path d={arcPath(0, 180, r)} stroke="#1F332C" strokeWidth="12" fill="none" strokeLinecap="round" />
      <path d={arcPath(0, angle, r)} stroke="#35D07F" strokeWidth="12" fill="none" strokeLinecap="round" />
      <line x1={gx} y1={gy} x2={cx - (r - 22) * Math.cos(((180 - goalAngle) * Math.PI) / 180)} y2={cy - (r - 22) * Math.sin(((180 - goalAngle) * Math.PI) / 180)} stroke="#E8B94A" strokeWidth="3" />
      <circle cx={cx} cy={cy} r="5" fill="#EAF3EE" />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#EAF3EE" strokeWidth="3" strokeLinecap="round" />
      <text x={cx} y={cy + 25} textAnchor="middle" className="font-mono text-2xl font-bold" fill="#EAF3EE">{fmtPct(value)}</text>
      <text x={0} y={115} className="font-sans text-[10px]" fill="#93A69D">0%</text>
      <text x={200} y={115} textAnchor="end" className="font-sans text-[10px]" fill="#93A69D">100%</text>
      <text x={gx} y={gy - 15} textAnchor="middle" className="font-sans text-[10px] font-bold" fill="#E8B94A">meta {GOAL}%</text>
    </svg>
  );
}

export default function CsatApp() {
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
                <input type="email" required value={emailInput} onChange={e => setEmailInput(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-3 outline-none text-sm text-white" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5 text-gray-400">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Lock size={18} /></div>
                <input type="password" required value={passwordInput} onChange={e => setPasswordInput(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-3 outline-none text-sm text-white" />
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

  // ==== O TRUQUE MESTRE ====
  // 'fixed inset-0 overflow-y-auto' faz o React descolar de qualquer limite imposto pelo Vite
  // e força 100% da sua tela a ser esse painel escuro.
  return (
    <div className="fixed inset-0 overflow-y-auto bg-[#0B1412] text-[#EAF3EE] font-sans">
      <div className="min-h-full w-full p-4 sm:p-8">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-8 w-full px-6 py-4 rounded-2xl bg-[#101E1B] border border-[#1F332C]">
          <div className="flex items-center gap-3">
            <div className="bg-[#12281F] p-3 rounded-xl"><Gauge size={26} color="#35D07F" /></div>
            <div>
              <div className="font-bold text-xl">Painel de Performance</div>
              <div className="text-sm text-[#93A69D]">Meta C-SAT: {GOAL}%</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#152420] text-[#93A69D] border border-[#1F332C] text-sm px-4 py-2.5 rounded-xl font-mono flex items-center gap-2">
              <User size={16} /> {session.user.email}
            </div>
            <button onClick={handleLogout} className="p-2.5 rounded-xl bg-[#E17163] text-white hover:opacity-80"><LogOut size={18} /></button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-[#93A69D]">
            <Loader2 className="animate-spin mb-2" size={28} />
            Carregando resultados...
          </div>
        ) : (
          <div className="w-full">
            {view === "dashboard" && (
              <div className="flex flex-col items-center w-full">
                
                {/* Gráfico Principal */}
                <div className="bg-[#101E1B] border border-[#1F332C] rounded-3xl p-8 flex flex-col items-center w-full max-w-2xl mb-8 shadow-lg">
                  <div className="text-sm uppercase tracking-widest mb-6 font-semibold text-[#93A69D]">C-SAT Geral Atual</div>
                  <Gauge95 value={myPct} />
                  <div className="bg-[#152420] text-[#93A69D] text-sm mt-8 px-5 py-2 rounded-full">
                    Baseado em <strong>{records.length}</strong> atendimento(s)
                  </div>
                </div>

                {/* Semanas */}
                <div className="w-full mb-8">
                  <h3 className="text-xl font-bold mb-4 text-[#EAF3EE]">Resultados por Semana</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    {weeklyStats.map((week, idx) => (
                      <div key={idx} className="bg-[#101E1B] border border-[#1F332C] rounded-2xl p-6">
                        <div className="font-bold text-sm mb-3 text-[#93A69D]">{week.name}</div>
                        <div className={`text-3xl font-mono font-bold mb-2 ${week.pct >= GOAL ? "text-[#35D07F]" : "text-[#E8B94A]"}`}>
                          {fmtPct(week.pct)}
                        </div>
                        <div className="text-xs text-[#93A69D]">{week.total} chamado(s)</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={() => setView("list")} className="px-8 py-4 rounded-xl font-bold text-white bg-[#35D07F] hover:bg-[#2CB36C] flex items-center gap-2 shadow-lg mb-10">
                  <List size={18} /> Detalhar Meus Atendimentos e Notas
                </button>
              </div>
            )}

            {view === "list" && (
              <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setView("dashboard")} className="px-4 py-2 border border-[#1F332C] bg-[#101E1B] rounded-xl flex items-center gap-2 text-[#93A69D] hover:text-white">
                    <ArrowLeft size={16} /> Voltar ao Painel
                  </button>
                  <div className="text-sm text-[#93A69D]">Exibindo <strong>{records.length}</strong> chamados</div>
                </div>

                <div className="bg-[#101E1B] border border-[#1F332C] rounded-2xl overflow-hidden w-full">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-[#152420] border-b border-[#1F332C] text-[#93A69D]">
                        <tr>
                          <th className="p-4 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('protocolo')}>
                            <div className="flex items-center gap-1">Protocolo <ArrowUpDown size={14} /></div>
                          </th>
                          <th className="p-4 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('data')}>
                            <div className="flex items-center gap-1">Data <ArrowUpDown size={14} /></div>
                          </th>
                          <th className="p-4 font-semibold text-center cursor-pointer hover:text-white" onClick={() => handleSort('avaliacao')}>
                            <div className="flex items-center justify-center gap-1">Nota <ArrowUpDown size={14} /></div>
                          </th>
                          <th className="p-4 font-semibold w-1/3">Tabulação (Análise)</th>
                          <th className="p-4 font-semibold w-64">Protocolo de Retorno</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedRecords.map((r) => {
                          const val = Number(r.avaliacao);
                          let badge = "bg-transparent text-[#93A69D] border-[#1F332C]";
                          if (val === 1 || val === 2) badge = "bg-[#E17163]/20 text-[#E17163] border-[#E17163]/50";
                          else if (val === 3) badge = "bg-[#E8B94A]/20 text-[#E8B94A] border-[#E8B94A]/50";
                          else if (val === 4 || val === 5) badge = "bg-[#12281F] text-[#35D07F] border-[#35D07F]";

                          return (
                            <tr key={r.id} className="border-b border-[#1F332C] hover:bg-[#152420]/50">
                              <td className="p-4 font-mono">{r.protocolo}</td>
                              <td className="p-4">{r.data}</td>
                              <td className="p-4 text-center">
                                <span className={`px-3 py-1 rounded border font-mono font-bold ${badge}`}>{r.avaliacao}</span>
                              </td>
                              <td className="p-4 text-[#93A69D]"><div className="line-clamp-2 text-xs">{r.tabulacao || "—"}</div></td>
                              <td className="p-4">
                                <div className="relative">
                                  <input 
                                    value={r.protocolo_retorno || ""}
                                    onChange={(e) => setRecords(records.map(rec => rec.id === r.id ? { ...rec, protocolo_retorno: e.target.value } : rec))}
                                    onBlur={(e) => saveRetorno(r.id, e.target.value)}
                                    className="w-full rounded-lg border border-[#1F332C] bg-[#0B1412] px-3 py-2 text-[#EAF3EE] outline-none focus:border-[#35D07F]"
                                  />
                                  {savingId === r.id && <CheckCircle2 size={16} className="absolute right-3 top-2.5 text-[#35D07F]" />}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 text-xs italic border-t border-[#1F332C] text-[#93A69D]">
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