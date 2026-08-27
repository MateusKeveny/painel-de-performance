import React, { useState, useEffect, useMemo } from "react";
import { Moon, Sun, LogOut, User, Loader2, List, ArrowLeft, CheckCircle2, Lock, Mail, ArrowUpDown, Shield } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uahkplwssonbxzydjytb.supabase.co";
const SUPABASE_KEY = "sb_publishable_lHDfFg_TeeEDTBIgqhgYBg_7oHN4M4w";
const BACKGROUND_URL = "https://i.postimg.cc/fT3Trm2M/Template-apresentacao-i-Green-pages-to-jpg-0011.png"; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const GOAL = 95;
const DEFAULT_PASSWORD = "iGreen@2026";

const ADMIN_EMAILS = [
  "mateus.silva@igreenenergy.com.br",
  "gestor@igreenenergy.com.br"
];

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
`;

function fmtPct(n) {
  if (!isFinite(n)) return "—";
  return n.toFixed(1).replace(".", ",") + "%";
}

const tokens = {
  light: { bg: "#F5F7F3", panel: "#FFFFFF", panel2: "#EEF2EA", text: "#0F1C1A", textSoft: "#4B5C55", border: "#DCE3D9", accent: "#1F9D6B", accentSoft: "#DFF3E8", warn: "#E8B94A", danger: "#C24A3D", needle: "#0F1C1A" },
  dark: { bg: "#0B1412", panel: "#101E1B", panel2: "#152420", text: "#EAF3EE", textSoft: "#93A69D", border: "#1F332C", accent: "#35D07F", accentSoft: "#12281F", warn: "#E8B94A", danger: "#E17163", needle: "#EAF3EE" },
};

function PerformanceChart({ weeklyData, t, teamAvg }) {
  const width = 500;
  const height = 250;
  const paddingX = 50;
  const paddingY = 40;
  
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const goalY = paddingY + chartH - ((GOAL / 100) * chartH);
  const avgY = paddingY + chartH - ((teamAvg / 100) * chartH); 

  const xStep = chartW / 3;
  const points = weeklyData.map((w, i) => {
    const x = paddingX + (i * xStep);
    const y = paddingY + chartH - ((w.pct / 100) * chartH);
    return { x, y, pct: w.pct, name: w.name, label: w.label, hasData: w.hasData };
  });

  const validPoints = points.filter(p => p.hasData);
  const pathD = validPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
      <line x1={paddingX} y1={paddingY - 10} x2={paddingX} y2={height - paddingY} stroke={t.textSoft} strokeWidth="3" strokeLinecap="round" />
      <line x1={paddingX} y1={height - paddingY} x2={width - paddingX + 10} y2={height - paddingY} stroke={t.textSoft} strokeWidth="3" strokeLinecap="round" />

      <line x1={paddingX} y1={avgY} x2={width - paddingX + 10} y2={avgY} stroke={t.textSoft} strokeWidth="2" strokeDasharray="4,4" opacity="0.6" />
      <text x={width - paddingX + 18} y={avgY + 4} fill={t.textSoft} fontSize="11" fontWeight="600" style={{ fontFamily: "'Montserrat', sans-serif" }}>Média ({fmtPct(teamAvg)})</text>

      <line x1={paddingX} y1={goalY} x2={width - paddingX + 10} y2={goalY} stroke={t.warn} strokeWidth="2" strokeDasharray="6,6" />
      <text x={width - paddingX + 18} y={goalY + 4} fill={t.warn} fontSize="12" fontWeight="bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>Meta 95%</text>

      {validPoints.length > 1 && (
        <path d={pathD} fill="none" stroke={t.accent} strokeWidth="3" opacity="0.5" />
      )}

      {points.map((p, i) => (
        <g key={i}>
          <text x={p.x} y={height - paddingY + 20} textAnchor="middle" fontSize="11" fill={t.textSoft} fontWeight="600" style={{ fontFamily: "'Inter', sans-serif" }}>{p.name}</text>
          <text x={p.x} y={height - paddingY + 34} textAnchor="middle" fontSize="9" fill={t.textSoft} opacity="0.7" style={{ fontFamily: "'Inter', sans-serif" }}>{p.label}</text>
          {p.hasData && (
            <>
              <circle cx={p.x} cy={p.y} r="6" fill={t.accent} />
              <circle cx={p.x} cy={p.y} r="3" fill={t.bg} />
              <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="13" fill={t.text} fontWeight="bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>{fmtPct(p.pct)}</text>
            </>
          )}
        </g>
      ))}
    </svg>
  );
}

function TeamBarChart({ data, t, goal, teamAvg }) {
  const width = Math.max(600, data.length * 80 + 100);
  const height = 280;
  const paddingX = 50;
  const paddingY = 40;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const goalY = paddingY + chartH - ((goal / 100) * chartH);
  const avgY = paddingY + chartH - ((teamAvg / 100) * chartH);

  const step = chartW / Math.max(data.length, 1);
  const barWidth = Math.min(40, step * 0.6);

  return (
    <div className="w-full overflow-x-auto pb-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[600px] overflow-visible">
        <line x1={paddingX} y1={paddingY - 10} x2={paddingX} y2={height - paddingY} stroke={t.textSoft} strokeWidth="3" strokeLinecap="round" />
        <line x1={paddingX} y1={height - paddingY} x2={width - paddingX + 10} y2={height - paddingY} stroke={t.textSoft} strokeWidth="3" strokeLinecap="round" />

        <line x1={paddingX} y1={avgY} x2={width - paddingX + 10} y2={avgY} stroke={t.textSoft} strokeWidth="2" strokeDasharray="4,4" opacity="0.6" />
        <text x={width - paddingX + 18} y={avgY + 4} fill={t.textSoft} fontSize="11" fontWeight="600" style={{ fontFamily: "'Montserrat', sans-serif" }}>Média</text>

        <line x1={paddingX} y1={goalY} x2={width - paddingX + 10} y2={goalY} stroke={t.warn} strokeWidth="2" strokeDasharray="6,6" />
        <text x={width - paddingX + 18} y={goalY + 4} fill={t.warn} fontSize="12" fontWeight="bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>Meta 95%</text>

        {data.map((d, i) => {
          const x = paddingX + (i * step) + (step / 2) - (barWidth / 2);
          const barH = (d.pct / 100) * chartH;
          const y = paddingY + chartH - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barWidth} height={barH} fill={d.pct >= goal ? t.accent : t.warn} rx="4" opacity="0.9" />
              <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fill={t.text} fontSize="12" fontWeight="bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>{fmtPct(d.pct)}</text>
              <text x={x + barWidth / 2} y={height - paddingY + 20} textAnchor="middle" fill={t.textSoft} fontSize="11" style={{ fontFamily: "'Inter', sans-serif" }}>{d.name}</text>
              <text x={x + barWidth / 2} y={height - paddingY + 34} textAnchor="middle" fill={t.textSoft} fontSize="9" opacity="0.7" style={{ fontFamily: "'Inter', sans-serif" }}>{d.total} av</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const getMetrificationWeek = (dateString) => {
  if (!dateString) return null;
  let d, m, y;
  const cleanDate = dateString.split('T')[0].split(' ')[0];
  if (cleanDate.includes('/')) [d, m, y] = cleanDate.split('/');
  else if (cleanDate.includes('-')) [y, m, d] = cleanDate.split('-');
  else return null;

  const month = parseInt(m, 10);
  const day = parseInt(d, 10);
  if ((month === 7 && day >= 26) || (month === 8 && day <= 2)) return 1;
  if (month === 8 && day >= 3 && day <= 10) return 2;
  if (month === 8 && day >= 11 && day <= 18) return 3;
  if (month === 8 && day >= 19 && day <= 25) return 4;
  return null;
};

const isValidRecord = (r) => {
  if (getMetrificationWeek(r.data) === null) return false;
  const val = Number(r.avaliacao);
  return [1, 2, 3, 4, 5].includes(val);
};

export default function CsatApp() {
  const [dark, setDark] = useState(true);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  
  const [allRecords, setAllRecords] = useState([]);
  const [view, setView] = useState("dashboard");
  const [savingId, setSavingId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'data', direction: 'desc' });
  const [selectedAgent, setSelectedAgent] = useState("ALL");

  const t = dark ? tokens.dark : tokens.light;

  const isAdmin = useMemo(() => {
    if (!session?.user?.email) return false;
    return ADMIN_EMAILS.includes(session.user.email.toLowerCase());
  }, [session]);

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
      let allFetchedData = [];
      let from = 0;
      const step = 1000;
      let hasMore = true;

      while (hasMore) {
        let query = supabase.from('atendimentos')
          .select('*')
          .gte('data', '2026-07-25')
          .lte('data', '2026-08-31')
          .order('criado_em', { ascending: false })
          .order('id', { ascending: true }) 
          .range(from, from + step - 1);
          
        if (!ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
          query = query.eq('atendente', session.user.email);
        }
        
        const { data, error } = await query;
        if (error) break;
        
        if (data && data.length > 0) {
          allFetchedData = [...allFetchedData, ...data];
          from += step;
          if (data.length < step) hasMore = false;
        } else {
          hasMore = false;
        }
      }
      if (mounted) {
        setAllRecords(allFetchedData);
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [session, needsPasswordChange]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email: emailInput.trim(), password: passwordInput });
    if (error) setAuthError("E-mail ou senha inválidos.");
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
    setSelectedAgent("ALL");
  };

  const saveRetorno = async (id, newValue) => {
    setSavingId(id);
    await supabase.from('atendimentos').update({ protocolo_retorno: newValue }).eq('id', id);
    setAllRecords(prev => prev.map(r => r.id === id ? { ...r, protocolo_retorno: newValue } : r));
    setTimeout(() => setSavingId(null), 1000);
  };

  const agentsList = useMemo(() => {
    if (!isAdmin) return [];
    return [...new Set(allRecords.map(r => r.atendente))].filter(Boolean).sort();
  }, [allRecords, isAdmin]);

  const displayRecords = useMemo(() => {
    if (isAdmin && selectedAgent !== "ALL") return allRecords.filter(r => r.atendente === selectedAgent);
    return allRecords;
  }, [allRecords, isAdmin, selectedAgent]);

  // --- NOVA REGRA EXATA DO EXCEL: SOMA APENAS OS OPERADORES COM MÉDIA MENSAL > 0% ---

  const allAgentsMap = useMemo(() => {
    const stats = {};
    allRecords.filter(isValidRecord).forEach(r => {
      const agent = r.atendente;
      if (!stats[agent]) stats[agent] = { total: 0, positive: 0 };
      stats[agent].total += 1;
      if (Number(r.avaliacao) >= 4) stats[agent].positive += 1;
    });
    return Object.entries(stats).map(([agent, d]) => ({
      email: agent,
      name: agent.split('@')[0],
      pct: d.total > 0 ? (d.positive / d.total) * 100 : 0,
      total: d.total,
      positive: d.positive
    }));
  }, [allRecords]);

  // Filtra estritamente apenas quem tem C-SAT > 0% no mês (exclui os zerados do cálculo da média geral)
  const validGlobalAgents = useMemo(() => {
    return allAgentsMap.filter(a => a.pct > 0);
  }, [allAgentsMap]);

  const validEmailsSet = useMemo(() => {
    return new Set(validGlobalAgents.map(a => a.email));
  }, [validGlobalAgents]);

  const effectiveRecords = useMemo(() => {
    if (isAdmin && selectedAgent === "ALL") {
      return displayRecords.filter(r => validEmailsSet.has(r.atendente));
    }
    return displayRecords;
  }, [displayRecords, isAdmin, selectedAgent, validEmailsSet]);

  // MÉDIA DA EQUIPE (Média aritmética apenas dos operadores com C-SAT > 0%)
  const liveTeamAvg = useMemo(() => {
    if (!isAdmin) return 82.93; 
    if (validGlobalAgents.length === 0) return 0;
    
    const sumOfPcts = validGlobalAgents.reduce((sum, a) => sum + a.pct, 0);
    return sumOfPcts / validGlobalAgents.length;
  }, [validGlobalAgents, isAdmin]);

  const myPct = useMemo(() => {
    if (isAdmin && selectedAgent === "ALL") return liveTeamAvg;
    
    const validRecords = effectiveRecords.filter(isValidRecord);
    if (validRecords.length === 0) return 0;
    
    const positiveRecords = validRecords.filter(r => Number(r.avaliacao) >= 4);
    return (positiveRecords.length / validRecords.length) * 100;
  }, [effectiveRecords, isAdmin, selectedAgent, liveTeamAvg]);

  const agentsStats = useMemo(() => {
    if (!isAdmin || selectedAgent !== "ALL") return [];
    return validGlobalAgents.sort((a, b) => b.pct - a.pct);
  }, [isAdmin, selectedAgent, validGlobalAgents]);

  // DESEMPENHO SEMANAL (Média apenas dos operadores que tiveram chamados válidos > 0% na semana)
  const weeklyStats = useMemo(() => {
    const stats = {
      1: { name: "1ª Semana", label: "26/07 a 02/08", agents: {} },
      2: { name: "2ª Semana", label: "03/08 a 10/08", agents: {} },
      3: { name: "3ª Semana", label: "11/08 a 18/08", agents: {} },
      4: { name: "4ª Semana", label: "19/08 a 25/08", agents: {} },
    };
    
    allRecords.forEach(r => {
      const weekId = getMetrificationWeek(r.data);
      if (weekId && isValidRecord(r)) {
        if (!stats[weekId].agents[r.atendente]) stats[weekId].agents[r.atendente] = { total: 0, pos: 0 };
        stats[weekId].agents[r.atendente].total += 1;
        if (Number(r.avaliacao) >= 4) stats[weekId].agents[r.atendente].pos += 1;
      }
    });
    
    return Object.values(stats).map(w => {
      // Pega apenas os agentes daquela semana que tiveram C-SAT > 0%
      const agentsInWeek = Object.values(w.agents).map(a => ({
        pct: (a.pos / a.total) * 100,
        total: a.total
      })).filter(a => a.pct > 0);
      
      let weekPct = 0;
      if (agentsInWeek.length > 0) {
         const sumPcts = agentsInWeek.reduce((sum, a) => sum + a.pct, 0);
         weekPct = sumPcts / agentsInWeek.length;
      }
      
      const totalCalls = agentsInWeek.reduce((sum, a) => sum + a.total, 0);
      return { name: w.name, label: w.label, total: totalCalls, pct: weekPct, hasData: agentsInWeek.length > 0 };
    });
  }, [allRecords]);

  // --- FIM DA LÓGICA ---

  const handleSort = (key) => {
    setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc' });
  };

  const sortedRecords = useMemo(() => {
    return [...displayRecords].sort((a, b) => {
      let aVal = a[sortConfig.key], bVal = b[sortConfig.key];
      if (sortConfig.key === 'avaliacao' || sortConfig.key === 'protocolo') {
        aVal = Number(aVal) || 0; bVal = Number(bVal) || 0;
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [displayRecords, sortConfig]);

  if (!session) {
    return (
      <div className="fixed inset-0 overflow-y-auto flex flex-col items-center justify-center p-6 bg-[#0A0A0A]" style={{ backgroundImage: `url('${BACKGROUND_URL}')`, backgroundSize: 'cover', backgroundPosition: 'left', fontFamily: "'Inter', sans-serif" }}>
        <style>{FONTS}</style>
        <div className="w-full max-w-md rounded-3xl border border-white/20 bg-black/60 backdrop-blur-md p-10 shadow-2xl">
          <h2 className="text-2xl font-bold mb-2 text-white text-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>Gestão de Resultados</h2>
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

  if (needsPasswordChange) {
    return (
      <div className="fixed inset-0 overflow-y-auto flex flex-col items-center justify-center p-6 bg-[#0A0A0A]" style={{ backgroundImage: `url('${BACKGROUND_URL}')`, backgroundSize: 'cover', backgroundPosition: 'left', fontFamily: "'Inter', sans-serif" }}>
        <style>{FONTS}</style>
        <div className="w-full max-w-md rounded-3xl border border-white/20 bg-black/60 backdrop-blur-md p-10 shadow-2xl">
          <h2 className="text-xl font-bold mb-2 text-white text-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>Defina sua Senha Pessoal</h2>
          <p className="text-sm text-gray-300 text-center mb-8">Como este é o seu primeiro acesso, crie uma senha segura.</p>
          <form onSubmit={handlePasswordChange} className="space-y-5">
            <input type="password" placeholder="Nova senha" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#1F9D6B]" />
            <input type="password" placeholder="Confirmar nova senha" required value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#1F9D6B]" />
            {authError && <div className="text-red-400 text-sm text-center">{authError}</div>}
            <button type="submit" disabled={authLoading} className="w-full py-3 bg-[#1F9D6B] text-white rounded-xl font-bold hover:bg-[#188057] flex justify-center items-center">
              {authLoading ? <Loader2 size={18} className="animate-spin" /> : "Salvar nova senha"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 overflow-y-auto transition-colors duration-300" 
      style={{ backgroundColor: t.bg, backgroundImage: `url('${BACKGROUND_URL}')`, backgroundSize: 'cover', backgroundPosition: 'left', backgroundAttachment: 'fixed', color: t.text, fontFamily: "'Inter', sans-serif" }}
    >
      <style>{FONTS}</style>
      <div className="min-h-full w-full max-w-7xl mx-auto p-4 sm:p-8">
        
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-12 w-full px-6 py-4 rounded-2xl border shadow-sm transition-colors duration-300" style={{ backgroundColor: t.panel, borderColor: t.border }}>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2 rounded-xl transition-colors duration-300 flex-shrink-0" style={{ backgroundColor: t.accentSoft }}>
              <img src="https://igreenenergy.com.br/wp-content/uploads/2023/11/logo_igreen-1-e1704289874457.png" alt="iGreen Logo" className="h-8 object-contain" onError={(e) => e.target.style.display='none'} />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
            {isAdmin && (
              <div className="flex items-center gap-2 border px-3 py-2 rounded-xl" style={{ backgroundColor: t.panel2, borderColor: t.border }}>
                <Shield size={16} color={t.warn} />
                <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="bg-transparent text-sm font-semibold outline-none cursor-pointer" style={{ color: t.text }}>
                  <option value="ALL">Visão Geral (Equipe)</option>
                  {agentsList.map(agent => <option key={agent} value={agent}>{agent}</option>)}
                </select>
              </div>
            )}

            <button onClick={() => setDark(!dark)} className="p-2.5 rounded-xl transition-colors duration-300 hover:opacity-80" style={{ backgroundColor: t.panel2, color: t.text }}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="border text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors duration-300" style={{ backgroundColor: t.panel2, color: t.textSoft, borderColor: t.border }}>
              <User size={16} /> {session.user.email.split('@')[0]}
            </div>
            <button onClick={handleLogout} className="p-2.5 rounded-xl text-white hover:opacity-80 transition-colors duration-300 flex-shrink-0" style={{ backgroundColor: t.danger }} title="Sair">
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
              <div className="flex flex-col lg:flex-row gap-12 w-full animate-in fade-in duration-500 items-start">
                
                {/* LADO ESQUERDO */}
                <div className="flex flex-col flex-1 gap-6 sticky top-8">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {isAdmin && selectedAgent === "ALL" ? "Painel da Equipe" : "Painel de Performance"}
                  </h2>
                  
                  <div className="flex flex-col gap-1">
                    <div className="text-xl flex items-center gap-2">
                      <span className="w-48 transition-colors duration-300 font-medium" style={{ color: t.textSoft }}>
                        {isAdmin && selectedAgent === "ALL" ? "C-SAT Consolidado:" : "Meu C-SAT Atual:"}
                      </span> 
                      <span className="font-bold text-2xl transition-colors duration-300" style={{ color: myPct >= GOAL ? t.accent : t.warn, fontFamily: "'Montserrat', sans-serif" }}>
                        {fmtPct(myPct)}
                      </span>
                    </div>
                    
                    {(!isAdmin || selectedAgent !== "ALL") && (
                      <div className="text-xl flex items-center gap-2">
                        <span className="w-48 transition-colors duration-300 font-medium" style={{ color: t.textSoft }}>Média da Equipe:</span> 
                        <span className="font-bold text-2xl transition-colors duration-300" style={{ color: t.text, fontFamily: "'Montserrat', sans-serif" }}>
                          {fmtPct(liveTeamAvg)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <button onClick={() => setView("list")} className="px-8 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all mt-4 w-full md:w-auto" style={{ backgroundColor: t.accent, fontFamily: "'Montserrat', sans-serif" }}>
                    <List size={18} /> Detalhar Atendimentos
                  </button>
                </div>

                {/* LADO DIREITO */}
                <div className="flex flex-col flex-[2] gap-8 w-full">
                  <div className="w-full border rounded-[2rem] p-6 shadow-sm transition-colors duration-300" style={{ backgroundColor: t.panel, borderColor: t.border }}>
                    <h3 className="text-center font-bold mb-6 text-lg" style={{ fontFamily: "'Montserrat', sans-serif" }}>Desempenho Semanal</h3>
                    <PerformanceChart weeklyData={weeklyStats} t={t} teamAvg={liveTeamAvg} />
                  </div>

                  {isAdmin && selectedAgent === "ALL" && agentsStats.length > 0 && (
                    <div className="w-full border rounded-[2rem] p-6 shadow-sm transition-colors duration-300" style={{ backgroundColor: t.panel, borderColor: t.border }}>
                      <h3 className="text-center font-bold mb-6 text-lg" style={{ fontFamily: "'Montserrat', sans-serif" }}>Ranking da Equipe (C-SAT Atual)</h3>
                      <TeamBarChart data={agentsStats} t={t} goal={GOAL} teamAvg={liveTeamAvg} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {view === "list" && (
              <div className="w-full animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setView("dashboard")} className="px-4 py-2 border rounded-xl flex items-center gap-2 hover:opacity-80 transition-colors duration-300 font-medium" style={{ backgroundColor: t.panel, borderColor: t.border, color: t.textSoft, fontFamily: "'Montserrat', sans-serif" }}>
                    <ArrowLeft size={16} /> Voltar ao Painel
                  </button>
                  <div className="text-sm transition-colors duration-300" style={{ color: t.textSoft }}>Exibindo <strong>{displayRecords.length}</strong> chamados</div>
                </div>

                <div className="border rounded-2xl overflow-hidden w-full shadow-sm transition-colors duration-300" style={{ backgroundColor: t.panel, borderColor: t.border }}>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-sm text-left">
                      <thead className="border-b transition-colors duration-300" style={{ backgroundColor: t.panel2, borderColor: t.border, color: t.textSoft }}>
                        <tr>
                          {isAdmin && selectedAgent === "ALL" && (
                            <th className="p-4 font-semibold cursor-pointer hover:opacity-70 transition-opacity" onClick={() => handleSort('atendente')}>
                              <div className="flex items-center gap-1">Operador <ArrowUpDown size={14} /></div>
                            </th>
                          )}
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
                          let badgeStyle = { backgroundColor: "transparent", color: t.textSoft, borderColor: t.border };
                          if (val === 1 || val === 2) badgeStyle = { backgroundColor: t.danger + "20", color: t.danger, borderColor: t.danger + "50" };
                          else if (val === 3) badgeStyle = { backgroundColor: t.warn + "20", color: t.warn, borderColor: t.warn + "50" };
                          else if (val === 4 || val === 5) badgeStyle = { backgroundColor: t.accentSoft, color: t.accent, borderColor: t.accent };

                          return (
                            <tr key={r.id} className="border-b hover:bg-black/5 transition-colors duration-300" style={{ borderColor: t.border }}>
                              {isAdmin && selectedAgent === "ALL" && (
                                <td className="p-4 font-medium opacity-80">{r.atendente.split('@')[0]}</td>
                              )}
                              <td className="p-4 font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>{r.protocolo}</td>
                              <td className="p-4 whitespace-nowrap">{r.data}</td>
                              <td className="p-4 text-center">
                                <span className="px-3 py-1 rounded-md border font-bold text-sm" style={{ ...badgeStyle, fontFamily: "'Montserrat', sans-serif" }}>{r.avaliacao}</span>
                              </td>
                              <td className="p-4 transition-colors duration-300" style={{ color: t.textSoft }}><div className="line-clamp-2 text-xs">{r.tabulacao || "—"}</div></td>
                              <td className="p-4">
                                <div className="relative">
                                  <input 
                                    value={r.protocolo_retorno || ""}
                                    onChange={(e) => {
                                      setAllRecords(prev => prev.map(rec => rec.id === r.id ? { ...rec, protocolo_retorno: e.target.value } : rec))
                                    }}
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
                    * Notas 0, -1 e vazias não impactam no resultado final
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