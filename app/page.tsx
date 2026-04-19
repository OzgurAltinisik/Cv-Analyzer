"use client";
import { useState, useRef } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setAnalysis("");
    const formData = new FormData();
    formData.append("pdf", file);
    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setAnalysis(data.analysis);
    } catch {
      setError("Bir hata oluştu, tekrar dene.");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
    else alert("Lütfen PDF formatında bir dosya yükleyiniz!");
  };

  const parseAnalysis = (text: string) => {
    const scoreMatch = text.match(/(\d{1,3})\s*(?:\/\s*100|puan|\/100)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

    const sections: { title: string; emoji: string; color: string; items: string[] }[] = [];

    const patterns = [
      { regex: /1\.\s*(?:güçlü\s*yönler?|guclu\s*yonler?)([\s\S]*?)(?=2\.|$)/i, title: "Güçlü Yönler", emoji: "💪", color: "#22c55e" },
      { regex: /2\.\s*(?:zayıf\s*yönler?|zayif\s*yonler?)([\s\S]*?)(?=3\.|$)/i, title: "Zayıf Yönler", emoji: "⚠️", color: "#f59e0b" },
      { regex: /3\.\s*(?:öneriler?|oneriler?)([\s\S]*?)(?=4\.|$)/i, title: "Öneriler", emoji: "🚀", color: "#60a5fa" },
    ];

    for (const p of patterns) {
      const match = text.match(p.regex);
      if (match) {
        const raw = match[1];
        const items = raw
          .split(/\n/)
          .map((l) => l.replace(/^[-*+•]\s*|\*\*/g, "").trim())
          .filter((l) => l.length > 10);
        if (items.length > 0) sections.push({ title: p.title, emoji: p.emoji, color: p.color, items });
      }
    }

    return { score, sections };
  };

  const { score, sections } = analysis ? parseAnalysis(analysis) : { score: null, sections: [] };

  const scoreColor = score
    ? score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444"
    : "#a78bfa";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; min-height: 100vh; font-family: 'DM Sans', sans-serif; }
        .bg { min-height: 100vh; background: #0a0a0f; display: flex; align-items: flex-start; justify-content: center; padding: 40px 20px; }
        .orb1 { position: fixed; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%); top: -200px; right: -200px; pointer-events: none; }
        .orb2 { position: fixed; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%); bottom: -100px; left: -100px; pointer-events: none; }
        .card { width: 100%; max-width: 700px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 48px; backdrop-filter: blur(20px); }
        .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3); border-radius: 100px; padding: 6px 14px; font-size: 12px; color: #a78bfa; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 500; margin-bottom: 24px; }
        .dot { width: 6px; height: 6px; border-radius: 50%; background: #a78bfa; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        h1 { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 700; color: #fff; line-height: 1.15; margin-bottom: 12px; letter-spacing: -0.02em; }
        h1 span { background: linear-gradient(135deg, #a78bfa, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .subtitle { color: rgba(255,255,255,0.4); font-size: 15px; font-weight: 300; margin-bottom: 40px; line-height: 1.6; }
        .dropzone { border: 1.5px dashed rgba(255,255,255,0.12); border-radius: 16px; padding: 36px; text-align: center; cursor: pointer; transition: all 0.3s ease; margin-bottom: 20px; background: rgba(255,255,255,0.02); }
        .dropzone.active,.dropzone:hover { border-color: #a78bfa; background: rgba(139,92,246,0.06); }
        .dropzone.has-file { border-color: rgba(139,92,246,0.4); background: rgba(139,92,246,0.06); }
        .icon-wrap { width: 52px; height: 52px; background: rgba(139,92,246,0.15); border-radius: 14px; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; font-size: 22px; }
        .drop-title { color: rgba(255,255,255,0.7); font-size: 15px; margin-bottom: 4px; }
        .drop-sub { color: rgba(255,255,255,0.25); font-size: 13px; }
        .file-name { color: #a78bfa; font-size: 14px; font-weight: 500; margin-top: 6px; }
        .btn { width: 100%; padding: 16px; border-radius: 14px; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; transition: all 0.3s ease; }
        .btn-primary { background: linear-gradient(135deg, #7c3aed, #3b82f6); color: white; }
        .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(124,58,237,0.4); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .loading-wrap { display: flex; align-items: center; justify-content: center; gap: 10px; }
        .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .error-box { margin-top: 20px; padding: 16px 20px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; color: #f87171; font-size: 14px; }
        .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 32px 0; }
        .results { animation: fadeUp 0.5s ease; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

        /* SKOR */
        .score-wrap { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 18px; padding: 28px 32px; margin-bottom: 24px; }
        .score-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .score-label { font-family: 'Playfair Display', serif; font-size: 18px; color: white; }
        .score-num { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; }
        .bar-bg { height: 10px; background: rgba(255,255,255,0.07); border-radius: 100px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 100px; transition: width 1.5s cubic-bezier(0.22,1,0.36,1); }
        .score-desc { margin-top: 10px; font-size: 13px; color: rgba(255,255,255,0.35); }

        /* SECTION CARDS */
        .sections { display: flex; flex-direction: column; gap: 16px; }
        .section-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 18px; padding: 24px 28px; transition: border-color 0.3s; }
        .section-card:hover { border-color: rgba(255,255,255,0.13); }
        .section-head { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .section-emoji { font-size: 20px; }
        .section-title { font-family: 'Playfair Display', serif; font-size: 17px; color: white; font-weight: 700; }
        .section-line { flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
        .item-list { display: flex; flex-direction: column; gap: 10px; }
        .item { display: flex; align-items: flex-start; gap: 12px; }
        .item-dot { width: 6px; height: 6px; border-radius: 50%; margin-top: 7px; flex-shrink: 0; }
        .item-text { color: rgba(255,255,255,0.65); font-size: 14px; line-height: 1.7; }
        .raw-text { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.8; white-space: pre-wrap; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 20px; margin-top: 16px; }
      `}</style>

      <div className="bg">
        <div className="orb1" /><div className="orb2" />
        <div className="card">
          <div className="badge"><div className="dot" />AI Destekli</div>
          <h1>CV <span>Analiz</span><br />Aracı</h1>
          <p className="subtitle">CV'ni yükle, yapay zeka güçlü ve zayıf yönlerini analiz edip önerilerde bulunsun.</p>

          <div
            className={`dropzone ${dragging ? "active" : ""} ${file ? "has-file" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input ref={inputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected && selected.type !== "application/pdf") {
                alert("Lütfen PDF formatında bir dosya yükleyiniz!");
                e.target.value = "";
              } else {
                setFile(selected || null);
              }
}} />
            <div className="icon-wrap">{file ? "✅" : "📄"}</div>
            {file ? (
              <><div className="drop-title">Dosya seçildi</div><div className="file-name">{file.name}</div></>
            ) : (
              <><div className="drop-title">PDF'i buraya sürükle veya tıkla</div><div className="drop-sub">Yalnızca .pdf formatı desteklenir</div></>
            )}
          </div>

          <button className="btn btn-primary" onClick={handleSubmit} disabled={!file || loading || !!analysis}>
            {loading ? <div className="loading-wrap"><div className="spinner" />Analiz ediliyor...</div> : "CV'yi Analiz Et →"}
          </button>

          {error && <div className="error-box">⚠️ {error}</div>}

          {analysis && (
            <>
              <div className="divider" />
              <div className="results">

                {/* SKOR BARI */}
                {score !== null && (
                  <div className="score-wrap" style={{ borderColor: `${scoreColor}22` }}>
                    <div className="score-top">
                      <div className="score-label">Genel Puan</div>
                      <div className="score-num" style={{ color: scoreColor }}>{score}<span style={{ fontSize: 18, color: "rgba(255,255,255,0.3)" }}>/100</span></div>
                    </div>
                    <div className="bar-bg">
                      <div className="bar-fill" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${scoreColor}88, ${scoreColor})` }} />
                    </div>
                    <div className="score-desc">
                      {score >= 75 ? "🟢 Güçlü bir CV — küçük dokunuşlarla mükemmel olabilir." : score >= 50 ? "🟡 Orta seviye — önerilere dikkat et." : "🔴 Geliştirmeye ihtiyaç var — önerileri dikkatlice incele."}
                    </div>
                  </div>
                )}

                {/* SECTION KARTLARI */}
                {sections.length > 0 ? (
                  <div className="sections">
                    {sections.map((s, i) => (
                      <div className="section-card" key={i} style={{ borderColor: `${s.color}18` }}>
                        <div className="section-head">
                          <span className="section-emoji">{s.emoji}</span>
                          <span className="section-title">{s.title}</span>
                          <div className="section-line" />
                        </div>
                        <div className="item-list">
                          {s.items.map((item, j) => (
                            <div className="item" key={j}>
                              <div className="item-dot" style={{ background: s.color }} />
                              <div className="item-text">{item}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="raw-text">{analysis}</div>
                )}

              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}