import React, { useState, useEffect, useMemo } from "react";
import { Moon, Sun, LogOut, User, Loader2, List, ArrowLeft, CheckCircle2, Lock, Mail, ArrowUpDown, Shield } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uahkplwssonbxzydjytb.supabase.co";
const SUPABASE_KEY = "sb_publishable_lHDfFg_TeeEDTBIgqhgYBg_7oHN4M4w";
const BACKGROUND_URL = "https://i.postimg.cc/fT3Trm2M/Template-apresentacao-i-Green-pages-to-jpg-0011.png"; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const GOAL = 95;
const TEAM_AVERAGE = 82.93; // Média atual consolidada da equipe
const DEFAULT_PASSWORD = "iGreen@2026";

// COLOQUE AQUI OS E-MAILS DOS GESTORES (Eles terão acesso a tudo)
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

// COMPONENTE: Gráfico de Linha/Pontos de Performance
function PerformanceChart({ weeklyData, t }) {
  const width = 500;
  const height = 250;
  const paddingX = 50;
  const paddingY = 40;
  
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const goalY = paddingY + chartH - ((GOAL / 100) * chartH);
  const avgY = paddingY + chartH - ((TEAM_AVERAGE / 100) * chartH); // Posição Y da média da equipe

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
      {/* Eixos */}
      <line x1={paddingX} y1={paddingY - 10} x2={paddingX} y2={height - paddingY} stroke={t.textSoft} strokeWidth="3" strokeLinecap="round" />
      <line x1={paddingX} y1={height - paddingY} x2={width - paddingX + 10} y2={height - paddingY} stroke={t.textSoft} strokeWidth="3" strokeLinecap="round" />

      {/* Linha da Média da Equipe (Cinza/Neutra) */}
      <line x1={paddingX} y1={avgY} x2={width - paddingX + 10} y2={avgY} stroke={t.textSoft} strokeWidth="2" strokeDasharray="4,4" opacity="0.6" />
      <text x={width - paddingX + 18} y={avgY + 4} fill={t.textSoft} fontSize="11" fontWeight="600" style={{ fontFamily: "'Montserrat', sans-serif" }}>Média</text>

      {/* Linha da Meta 95% (Amarela/Aviso) */}
      <line x1={paddingX} y1={goalY} x2={width - paddingX + 10} y2={goalY} stroke={t.warn} strokeWidth="2" strokeDasharray="6,6" />
      <text x={width - paddingX + 18} y={goalY + 4} fill={t.warn} fontSize="12" fontWeight="bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>95%</text>

      {/* Linha de Conexão dos Resultados (Verde) */}
      {validPoints.length > 1 && (
        <path d={pathD} fill="none" stroke={t.accent} strokeWidth="3" opacity="0.5" />
      )}

      {/* Pontos de Dados */}
      {points.map((p, i) => (
        <g key={i}>
          <text x={p.x} y={height - paddingY + 20} textAnchor="middle" fontSize="11" fill={t.textSoft} fontWeight="600" style={{ fontFamily: "'Inter', sans-serif" }}>{p.name}</text>
          <text x={p.x} y={height - paddingY + 34} textAnchor="middle" fontSize="9" fill={t.textSoft} opacity="0.7" style={{ fontFamily: "'Inter', sans-serif" }}>{p.label}</text>
          
          {p.hasData && (
            <>
              <circle cx={p.x} cy={p.y} r="6" fill={t.accent} />
              <circle cx={p.x} cy={p.y} r="3" fill={t.bg} />
              <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="13" fill={t.text} fontWeight="bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {fmtPct(p.pct)}
              </text>
            </>
          )}
        </g>
      ))}
    </svg>
  );
}

const getMetrificationWeek = (dateString) => {
  if (!dateString) return null;
  const [y, m, d] = dateString.split(' ')[0].split('-');
  
  if ((m === '07' && d >= '26') || (m === '08' && d <= '02')) return 1;
  if (m === '08' && d >= '03' && d <= '10') return 2;
  if (m === '08' && d >= '11' && d <= '18') return 3;
  if (m === '08' && d >= '19' && d <= '25') return 4;
  return null;
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
  
  // VARIÁVEIS GLOBAIS DE DADOS
  const [allRecords, setAllRecords] = useState([]);
  const [view, setView] = useState("dashboard");
  const [savingId, setSavingId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'data', direction: 'desc' });
  const [selectedAgent, setSelectedAgent] = useState("ALL"); // Filtro do Gestor

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
      
      // GESTOR puxa TODOS os dados da base. OPERADOR puxa SÓ os dele.
      let query = supabase.from('atendimentos').select('*').order('criado_em', { ascending: false });
      if (!ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
        query = query.eq('atendente', session.user.email);
      }
      
      const { data } = await query;
      if (mounted && data) setAllRecords(data);
      if (mounted) setLoading(false);
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

  // --- FILTROS DE EXIBIÇÃO (BASEADOS NO ACESSO) ---
  const agentsList = useMemo(() => {
    if (!isAdmin) return [];
    const uniqueAgents = [...new Set(allRecords.map(r => r.atendente))];
    return uniqueAgents.filter(Boolean).sort();
  }, [allRecords, isAdmin]);

  const displayRecords = useMemo(() => {
    if (isAdmin && selectedAgent !== "ALL") {
      return allRecords.filter(r => r.atendente === selectedAgent);
    }
    return allRecords; // Se for operador comum ou Gestor em "Visão Geral", exibe a base atual
  }, [allRecords, isAdmin, selectedAgent]);

  // --- CÁLCULO TOP BOX (Notas 4 e 5) ---
  const myPct = useMemo(() => {
    const validRecords = displayRecords.filter(r => {
      const n = Number(r.avaliacao);
      return !isNaN(n) && n > 0;
    });
    if (validRecords.length === 0) return 0;
    const positiveRecords = validRecords.filter(r => {
      const n = Number(r.avaliacao);
      return n === 4 || n === 5;
    });
    return (positiveRecords.length / validRecords.length) * 100;
  }, [displayRecords]);

  const weeklyStats = useMemo(() => {
    const stats = {
      1: { name: "1ª Semana", label: "26/07 a 02/08", items: [] },
      2: { name: "2ª Semana", label: "03/08 a 10/08", items: [] },
      3: { name: "3ª Semana", label: "11/08 a 18/08", items: [] },
      4: { name: "4ª Semana", label: "19/08 a 25/08", items: [] },
    };

    displayRecords.forEach(r => {
      const weekId = getMetrificationWeek(r.data);
      if (weekId && stats[weekId]) {
        stats[weekId].items.push(r);
      }
    });

    return Object.values(stats).map(w => {
      const validInWeek = w.items.filter(r => {
        const n = Number(r.avaliacao);
        return !isNaN(n) && n > 0;
      });
      const positiveInWeek = validInWeek.filter(r => {
        const n = Number(r.avaliacao);
        return n === 4 || n === 5;
      });
      const pct = validInWeek.length > 0 ? (positiveInWeek.length / validInWeek.length) * 100 : 0;

      return { 
        name: w.name, 
        label: w.label,
        total: validInWeek.length, 
        pct: pct,
        hasData: validInWeek.length > 0
      };
    });
  }, [displayRecords]);

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
      style={{ 
        backgroundColor: t.bg, 
        backgroundImage: `url('${BACKGROUND_URL}')`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'left', 
        backgroundAttachment: 'fixed',
        color: t.text,
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <style>{FONTS}</style>
      <div className="min-h-full w-full max-w-7xl mx-auto p-4 sm:p-8">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-12 w-full px-6 py-4 rounded-2xl border shadow-sm transition-colors duration-300" style={{ backgroundColor: t.panel, borderColor: t.border }}>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2 rounded-xl transition-colors duration-300 flex-shrink-0" style={{ backgroundColor: t.accentSoft }}>
              <img src="https://igreenenergy.com.br/wp-content/uploads/2023/11/logo_igreen-1-e1704289874457.png" alt="iGreen Logo" className="h-8 object-contain" onError={(e) => e.target.style.display='none'} />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
            
            {/* NOVO: Menu do Administrador para Filtragel */}
            {isAdmin && (
              <div className="flex items-center gap-2 border px-3 py-2 rounded-xl" style={{ backgroundColor: t.panel2, borderColor: t.border }}>
                <Shield size={16} color={t.warn} />
                <select 
                  value={selectedAgent} 
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="bg-transparent text-sm font-semibold outline-none cursor-pointer"
                  style={{ color: t.text }}
                >
                  <option value="ALL">Visão Geral (Equipe)</option>
                  {agentsList.map(agent => (
                    <option key={agent} value={agent}>{agent}</option>
                  ))}
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
            
            {/* TELA INICIAL */}
            {view === "dashboard" && (
              <div className="flex flex-col lg:flex-row gap-12 w-full animate-in fade-in duration-500">
                
                {/* Coluna Esquerda: Textos */}
                <div className="flex flex-col flex-1 gap-6 justify-center">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {isAdmin && selectedAgent === "ALL" ? "Painel da Equipe" : "Painel de performance"}
                  </h2>
                  
                  <div className="flex flex-col gap-1">
                    <div className="text-xl flex items-center gap-2">
                      <span className="w-44 transition-colors duration-300 font-medium" style={{ color: t.textSoft }}>C-sat atual:</span> 
                      <span className="font-bold text-2xl transition-colors duration-300" style={{ color: myPct >= GOAL ? t.accent : t.warn, fontFamily: "'Montserrat', sans-serif" }}>
                        {fmtPct(myPct)}
                      </span>
                    </div>
                    
                    <div className="text-xl flex items-center gap-2">
                      <span className="w-44 transition-colors duration-300 font-medium" style={{ color: t.textSoft }}>Média da equipe:</span> 
                      <span className="font-bold text-2xl transition-colors duration-300" style={{ color: t.text, fontFamily: "'Montserrat', sans-serif" }}>
                        {fmtPct(TEAM_AVERAGE)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Coluna Direita: Gráfico e Botão */}
                <div className="flex flex-col flex-[1.5] gap-6 items-center">
                  <div className="w-full border rounded-[2rem] p-6 shadow-sm transition-colors duration-300" style={{ backgroundColor: t.panel, borderColor: t.border }}>
                    <PerformanceChart weeklyData={weeklyStats} t={t} />
                  </div>
                  
                  <button 
                    onClick={() => setView("list")} 
                    className="px-8 py-4 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all mt-4" 
                    style={{ backgroundColor: t.accent, fontFamily: "'Montserrat', sans-serif" }}
                  >
                    <List size={18} /> Detalhar Atendimentos e Notas
                  </button>
                </div>
              </div>
            )}

            {/* TELA DA TABELA */}
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
                    * Notas 0 e -1 não impactam no resultado
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