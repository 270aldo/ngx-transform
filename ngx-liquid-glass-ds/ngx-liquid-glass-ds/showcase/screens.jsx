// =====================================================================
// NGX · Mobile App · Liquid Glass · Screens v2
// 6 surfaces + variants. Generic components live in ngx-lg-tokens.css;
// screen layouts live here.
// =====================================================================

// ---- Icon set (NGX-style, currentColor, sharp caps) ----
function Icon({ name, size = 20 }) {
  const props = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'square', strokeLinejoin: 'miter',
  };
  switch (name) {
    case 'home':     return <svg {...props}><path d="M3 11.5L12 4l9 7.5"/><path d="M5 10v10h14V10"/></svg>;
    case 'dumbbell': return <svg {...props}><path d="M4 8v8M8 6v12M16 6v12M20 8v8M8 12h8"/></svg>;
    case 'trend':    return <svg {...props}><path d="M3 17l6-6 4 4 8-9"/><path d="M14 6h6v6"/></svg>;
    case 'coach':    return <svg {...props}><path d="M21 12a8 8 0 1 1-2.5-5.8L21 3v6h-6"/></svg>;
    case 'user':     return <svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>;
    case 'play':     return <svg {...props} fill="currentColor" stroke="none"><path d="M7 4l13 8-13 8z"/></svg>;
    case 'pause':    return <svg {...props} fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
    case 'skip':     return <svg {...props} fill="currentColor" stroke="none"><path d="M5 4l10 8-10 8z"/><rect x="16" y="4" width="3" height="16"/></svg>;
    case 'plus':     return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case 'mic':      return <svg {...props}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>;
    case 'send':     return <svg {...props} fill="currentColor" stroke="none"><path d="M3 11L21 3l-8 18-2-8-8-2z"/></svg>;
    case 'chev-r':   return <svg {...props}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chev-l':   return <svg {...props}><path d="M15 6l-6 6 6 6"/></svg>;
    case 'check':    return <svg {...props}><path d="M5 12l5 5L20 7"/></svg>;
    case 'x':        return <svg {...props}><path d="M5 5l14 14M19 5L5 19"/></svg>;
    case 'bell':     return <svg {...props}><path d="M6 9a6 6 0 0 1 12 0c0 6 3 7 3 7H3s3-1 3-7M10 21a2 2 0 0 0 4 0"/></svg>;
    case 'gear':     return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a7.8 7.8 0 0 0 0-6L21 7l-2-3-2 1a8 8 0 0 0-5-3l-1-2H9L8 2a8 8 0 0 0-5 3L1 4l-2 3 1.6 2a7.8 7.8 0 0 0 0 6L-1 17l2 3 2-1a8 8 0 0 0 5 3l1 2h2l1-2a8 8 0 0 0 5-3l2 1 2-3z"/></svg>;
    case 'watch':    return <svg {...props}><rect x="7" y="6" width="10" height="12" rx="2"/><path d="M9 6V3h6v3M9 18v3h6v-3"/></svg>;
    case 'flame':    return <svg {...props}><path d="M12 3c2 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 1 2 2 3 3 -3z"/></svg>;
    case 'heart':    return <svg {...props}><path d="M12 20s-7-5-7-11a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 6-7 11-7 11z"/></svg>;
    case 'moon':     return <svg {...props}><path d="M20 14a8 8 0 1 1-10-10 6 6 0 0 0 10 10z"/></svg>;
    case 'bolt':     return <svg {...props} fill="currentColor" stroke="none"><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg>;
    case 'cam':      return <svg {...props}><path d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.5"/></svg>;
    default: return null;
  }
}

// ---- Ring (SVG arc) ----
function Ring({ value = 79, color = '#A368FF', size = 84, stroke = 5 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: 'drop-shadow(0 0 6px rgba(109,0,255,0.35))' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
                transform={`rotate(-90 ${size/2} ${size/2})`}/>
      </svg>
      <div className="ring-cell__pct ngx-tabular" style={{ fontSize: Math.round(size * 0.26) }}>{value}</div>
    </div>
  );
}

// ---- iPhone shell ----
function Phone({ children, wallpaper = 'regular', pattern = true, dose = 'medium' }) {
  return (
    <div style={{
      width: 393, height: 852, borderRadius: 47, overflow: 'hidden',
      position: 'relative', background: '#000',
      boxShadow: '0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.10)',
      fontFamily: 'var(--font-text)',
      color: '#fff',
    }} data-dose={dose} data-pattern={pattern ? 'on' : 'off'}>
      <div className={`lg-wallpaper-${wallpaper}`} style={{ position: 'absolute', inset: 0 }} />
      <div style={{
        position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 122, height: 35, borderRadius: 24, background: '#000', zIndex: 60,
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 54,
        padding: '18px 30px 0', boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
        color: '#fff', zIndex: 50,
      }}>
        <span style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>9:41</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="19" height="11" viewBox="0 0 19 11">
            <rect x="0" y="6.5" width="3.2" height="4.5" rx="0.7" fill="currentColor"/>
            <rect x="4.8" y="4" width="3.2" height="7" rx="0.7" fill="currentColor"/>
            <rect x="9.6" y="1.5" width="3.2" height="9.5" rx="0.7" fill="currentColor"/>
            <rect x="14.4" y="-1" width="3.2" height="12" rx="0.7" fill="currentColor"/>
          </svg>
          <svg width="17" height="11" viewBox="0 0 17 13">
            <path d="M8.5 4C10.8 4 12.9 4.9 14.4 6.4L15.5 5.3C13.7 3.5 11.2 2.3 8.5 2.3C5.8 2.3 3.3 3.5 1.5 5.3L2.6 6.4C4.1 4.9 6.2 4 8.5 4Z" fill="currentColor"/>
            <path d="M8.5 7.6C9.9 7.6 11.1 8.1 12 9L13.1 7.9C11.8 6.7 10.2 5.9 8.5 5.9C6.8 5.9 5.2 6.7 3.9 7.9L5 9C5.9 8.1 7.1 7.6 8.5 7.6Z" fill="currentColor"/>
            <circle cx="8.5" cy="11.3" r="1.5" fill="currentColor"/>
          </svg>
          <svg width="25" height="12" viewBox="0 0 27 13">
            <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="currentColor" strokeOpacity="0.4" fill="none"/>
            <rect x="2" y="2" width="20" height="9" rx="2" fill="currentColor"/>
            <path d="M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z" fill="currentColor" fillOpacity="0.5"/>
          </svg>
        </div>
      </div>
      <div className="scr" style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        {children}
      </div>
      <div style={{
        position: 'absolute', bottom: 8, left: 0, right: 0, zIndex: 70,
        display: 'flex', justifyContent: 'center', pointerEvents: 'none',
      }}>
        <div style={{ width: 134, height: 5, borderRadius: 100, background: 'rgba(255,255,255,0.85)' }} />
      </div>
    </div>
  );
}

// ============================================================
// 01 · LOCK
// ============================================================
function ScreenLock({ tweaks }) {
  const { wallpaper, showPattern, dose, recoveryScore, lockVariant } = tweaks;
  return (
    <Phone wallpaper={wallpaper} pattern={showPattern} dose={dose}>
      <div style={{ position: 'absolute', top: 76, left: 0, right: 0, textAlign: 'center', zIndex: 2 }}>
        <div className="lock-date">Lun · 14 Sep</div>
        <div className="lock-time">9:41</div>
      </div>

      {lockVariant === 'widgets' && (
        <div style={{ position: 'absolute', top: 280, left: 18, right: 18, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 3 }}>
          <div className="lock-widget">
            <div className="lock-widget__head">
              <div className="lock-widget__brand"><span className="mark"></span>NGX · Recovery</div>
              <div className="ngx-caps">9:41</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: 12, alignItems: 'center' }}>
              <Ring value={recoveryScore} color="#A368FF" size={62} stroke={4.5}/>
              <div>
                <div className="bio__l">HRV</div>
                <div className="bio__v" style={{ fontSize: 22 }}>52<span className="bio__unit">ms</span></div>
                <div className="bio__d ngx-delta-up">+8</div>
              </div>
              <div>
                <div className="bio__l">RHR</div>
                <div className="bio__v" style={{ fontSize: 22 }}>44</div>
                <div className="bio__d ngx-delta-down">−4</div>
              </div>
              <div>
                <div className="bio__l">Sueño</div>
                <div className="bio__v ngx-tabular" style={{ fontSize: 22 }}>6<span className="bio__unit">h32</span></div>
                <div className="bio__d ngx-delta-flat">norm</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="lock-widget">
              <div className="lock-widget__head">
                <div className="lock-widget__brand"><span className="mark"></span>Hoy</div>
              </div>
              <div className="ngx-bignum" style={{ fontSize: 28, marginTop: 2 }}>5×5</div>
              <div className="ngx-caps" style={{ marginTop: 6 }}>Press &amp; Pull</div>
              <div style={{ marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,0.72)', lineHeight: 1.35 }}>
                Empuja. HRV en verde.
              </div>
            </div>
            <div className="lock-widget">
              <div className="lock-widget__head">
                <div className="lock-widget__brand"><span className="mark"></span>Strain</div>
                <div className="ngx-caps ngx-caps--purple">7d</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                <Ring value={71} color="#6D00FF" size={56} stroke={4}/>
              </div>
              <div className="ngx-caps" style={{ marginTop: 8, textAlign: 'center' }}>Output 71</div>
            </div>
          </div>
        </div>
      )}

      {lockVariant === 'live-activity' && (
        <div style={{ position: 'absolute', bottom: 110, left: 18, right: 18, zIndex: 3 }}>
          <div className="live-act">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#C29BFF,#6D00FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(109,0,255,0.55)' }}>
                  <Icon name="dumbbell" size={16}/>
                </div>
                <div>
                  <div className="ngx-caps ngx-caps--white" style={{ fontSize: 11 }}>Press &amp; Pull · Set 3 / 5</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>NGX · en curso</div>
                </div>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="pause" size={13}/>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'end', marginTop: 4 }}>
              <div>
                <div className="ngx-caps">Descanso</div>
                <div className="ngx-bignum" style={{ fontSize: 52, marginTop: 4, color: '#C29BFF' }}>0:42</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="ngx-caps">Próximo</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 16, marginTop: 4, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>Bench · 80kg</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>8 reps · RPE 7</div>
              </div>
            </div>
            <div className="set-tracker" style={{ marginTop: 12 }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} className={
                  i < 2 ? 'set-dot set-dot--done' :
                  i === 2 ? 'set-dot set-dot--active' : 'set-dot'
                }/>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 38, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 32px', zIndex: 4 }}>
        <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="bolt" size={20}/>
        </div>
        <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="cam" size={20}/>
        </div>
      </div>
    </Phone>
  );
}

// ============================================================
// 02 · HOME (with homeLayout variant)
// ============================================================
function ScreenHome({ tweaks }) {
  const { wallpaper, showPattern, dose, recoveryScore, homeLayout } = tweaks;

  return (
    <Phone wallpaper={wallpaper} pattern={showPattern} dose={dose}>
      <div style={{ position: 'absolute', top: 64, left: 18, right: 18, bottom: 110, display: 'flex', flexDirection: 'column', gap: 14, zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="home-head__day">Día 042 · Lun</div>
            <div className="home-head__name">Recover<br/>&amp; Lift</div>
          </div>
          <div className="home-avatar"></div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {['Jue', 'Vie', 'Sáb', 'Dom', 'Lun', 'Mar', 'Mié'].map((d, i) => {
            const active = i === 4;
            const num = 11 + i;
            return (
              <div key={d} className={active ? 'lg-capsule lg-capsule--active' : 'lg-capsule'} style={{
                flex: 1, padding: '8px 0', justifyContent: 'center', flexDirection: 'column', gap: 2, fontSize: 9,
              }}>
                <span style={{ fontSize: 9, letterSpacing: '0.18em' }}>{d}</span>
                <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', fontVariantNumeric: 'tabular-nums' }}>{num}</span>
              </div>
            );
          })}
        </div>

        {homeLayout === 'triad' && (
          <div className="dose-glass rings-strip">
            <div className="rings-strip__div" style={{ left: '33.33%' }}/>
            <div className="rings-strip__div" style={{ left: '66.66%' }}/>
            <div className="ring-cell">
              <Ring value={71} color="#6D00FF" size={84} stroke={5}/>
              <div className="ring-cell__lbl">Strain</div>
            </div>
            <div className="ring-cell">
              <Ring value={recoveryScore} color="#A368FF" size={84} stroke={5}/>
              <div className="ring-cell__lbl">Recovery</div>
            </div>
            <div className="ring-cell">
              <Ring value={66} color="#C29BFF" size={84} stroke={5}/>
              <div className="ring-cell__lbl">Sueño</div>
            </div>
          </div>
        )}

        {homeLayout === 'featured' && (
          <div className="dose-glass hero-ring">
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <Ring value={recoveryScore} color="#A368FF" size={130} stroke={8}/>
              <div style={{ flex: 1 }}>
                <div className="ngx-caps ngx-caps--purple">Recovery · Hoy</div>
                <div className="ngx-bignum" style={{ fontSize: 36, marginTop: 6 }}>
                  {recoveryScore}<span style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginLeft: 4 }}>/100</span>
                </div>
                <div className="bio__d ngx-delta-up" style={{ marginTop: 8 }}>+8 ms HRV vs 7d</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
              <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 12, padding: '10px 12px' }}>
                <div className="ngx-caps">Strain</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  <div className="ngx-bignum" style={{ fontSize: 24 }}>71</div>
                  <Ring value={71} color="#6D00FF" size={28} stroke={3}/>
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 12, padding: '10px 12px' }}>
                <div className="ngx-caps">Sueño</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  <div className="ngx-bignum" style={{ fontSize: 24 }}>66</div>
                  <Ring value={66} color="#C29BFF" size={28} stroke={3}/>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="sect-l" style={{ marginTop: 2 }}>
          <span>Biomarkers · Hoy</span>
          <span className="more">Detalle →</span>
        </div>

        <div className="bio-row">
          <div className="dose-glass bio">
            <div className="bio__l">HRV</div>
            <div className="bio__v">52<span className="bio__unit">ms</span></div>
            <div className="bio__d ngx-delta-up">+8 vs 7d</div>
          </div>
          <div className="dose-glass bio">
            <div className="bio__l">RHR</div>
            <div className="bio__v">44<span className="bio__unit">bpm</span></div>
            <div className="bio__d ngx-delta-down">−12 vs avg</div>
          </div>
          <div className="dose-glass bio">
            <div className="bio__l">VO₂</div>
            <div className="bio__v">51</div>
            <div className="bio__d ngx-delta-flat">cardio fit</div>
          </div>
        </div>

        <div className="nudge">
          <div className="nudge__lbl">AI Coach · Insight</div>
          <div className="nudge__text">
            HRV <b>+8 ms</b> sobre baseline. Hoy puedes empujar — <b>Press &amp; Pull 5×5</b> a RPE 8.
          </div>
        </div>

        <div className="session">
          <div className="session__icon">
            <Icon name="dumbbell" size={22}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="session__title">Press &amp; Pull · 5×5</div>
            <div className="session__meta">Fuerza superior · 48 min · 8 ejercicios</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(180deg,#8530FF,#6D00FF)', boxShadow: 'var(--lg-glow-purple-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Icon name="play" size={14}/>
          </div>
        </div>
      </div>

      <TabBar active="home"/>
    </Phone>
  );
}

// ============================================================
// 03 · WORKOUT ACTIVE (timer vs video variant)
// ============================================================
function ScreenWorkout({ tweaks }) {
  const { showPattern, dose, setsTotal, workoutMode } = tweaks;
  const sets = Array.from({ length: setsTotal }, (_, i) => i);
  const activeSet = Math.floor(setsTotal / 2);

  const size = 280; const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const prog = 0.62;

  if (workoutMode === 'video') {
    return (
      <Phone wallpaper="bloom" pattern={showPattern} dose={dose}>
        <div className="workout-video">
          <div className="workout-video__bg"></div>
          <div className="workout-video__silhouette"></div>
          <div className="workout-video__shadow-top"></div>
          <div className="workout-video__shadow-bot"></div>
        </div>

        <div className="workout-top">
          <div className="next-up">
            <div className="next-up__thumb"></div>
            <div className="next-up__txt">
              <b>Próx → Set {activeSet + 2} de {setsTotal}</b><br/>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Bench Press · 80 kg · 8 reps</span>
            </div>
            <Icon name="chev-r" size={16}/>
          </div>
          <div className="set-tracker">
            {sets.map(i => (
              <div key={i} className={
                i < activeSet ? 'set-dot set-dot--done' :
                i === activeSet ? 'set-dot set-dot--active' : 'set-dot'
              }/>
            ))}
          </div>
        </div>

        <div className="workout-video__exname">
          <div className="workout-exname__eyebrow">Set {activeSet + 1} de {setsTotal} · Descanso</div>
          <div className="workout-exname__name">Press &amp; Pull</div>
        </div>

        <div className="workout-video__timer">0:42</div>

        <div className="workout-hud">
          <div className="workout-hud__row">
            <div className="hud-cell">
              <div className="hud-cell__l">Peso</div>
              <div className="hud-cell__v">80<span className="hud-cell__u">kg</span></div>
            </div>
            <div className="hud-cell">
              <div className="hud-cell__l">Reps</div>
              <div className="hud-cell__v">8</div>
            </div>
            <div className="hud-cell">
              <div className="hud-cell__l">RPE</div>
              <div className="hud-cell__v">7<span className="hud-cell__u">/10</span></div>
            </div>
          </div>
          <div className="workout-hud__ctas">
            <div className="icon-btn"><Icon name="chev-l" size={18}/></div>
            <button className="log-btn">
              <Icon name="check" size={16}/> Loguear set
            </button>
            <div className="icon-btn"><Icon name="skip" size={18}/></div>
          </div>
        </div>
      </Phone>
    );
  }

  return (
    <Phone wallpaper="bloom" pattern={showPattern} dose={dose}>
      <div className="workout-top">
        <div className="next-up">
          <div className="next-up__thumb"></div>
          <div className="next-up__txt">
            <b>Próx → Set {activeSet + 2} de {setsTotal}</b><br/>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Bench Press · 80 kg · 8 reps</span>
          </div>
          <Icon name="chev-r" size={16}/>
        </div>
        <div className="set-tracker">
          {sets.map(i => (
            <div key={i} className={
              i < activeSet ? 'set-dot set-dot--done' :
              i === activeSet ? 'set-dot set-dot--active' : 'set-dot'
            }/>
          ))}
        </div>
      </div>

      <div className="workout-exname">
        <div className="workout-exname__eyebrow">Set {activeSet + 1} de {setsTotal} · Descanso</div>
        <div className="workout-exname__name">Press &amp; Pull</div>
      </div>

      <div className="workout-disc">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0, filter: 'drop-shadow(0 0 24px rgba(109,0,255,0.5))' }}>
          <defs>
            <linearGradient id="discg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#C29BFF"/>
              <stop offset="1" stopColor="#6D00FF"/>
            </linearGradient>
          </defs>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#discg)" strokeWidth={stroke}
                  strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - c * prog}
                  transform={`rotate(-90 ${size/2} ${size/2})`}/>
        </svg>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0, opacity: 0.45 }}>
          {Array.from({ length: 60 }).map((_, i) => {
            const a = (i * 6 - 90) * Math.PI / 180;
            const inner = r - 12;
            const outer = r - 4;
            const x1 = size/2 + Math.cos(a) * inner;
            const y1 = size/2 + Math.sin(a) * inner;
            const x2 = size/2 + Math.cos(a) * outer;
            const y2 = size/2 + Math.sin(a) * outer;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 5 === 0 ? '#ffffff' : 'rgba(255,255,255,0.4)'} strokeWidth={i % 5 === 0 ? 1.5 : 0.8}/>;
          })}
        </svg>
        <div className="workout-disc__time">
          <div className="workout-disc__state">Descanso</div>
          <div className="workout-disc__num">0:42</div>
        </div>
      </div>

      <div className="workout-hud">
        <div className="workout-hud__row">
          <div className="hud-cell">
            <div className="hud-cell__l">Peso</div>
            <div className="hud-cell__v">80<span className="hud-cell__u">kg</span></div>
          </div>
          <div className="hud-cell">
            <div className="hud-cell__l">Reps</div>
            <div className="hud-cell__v">8</div>
          </div>
          <div className="hud-cell">
            <div className="hud-cell__l">RPE</div>
            <div className="hud-cell__v">7<span className="hud-cell__u">/10</span></div>
          </div>
        </div>
        <div className="workout-hud__ctas">
          <div className="icon-btn"><Icon name="chev-l" size={18}/></div>
          <button className="log-btn">
            <Icon name="check" size={16}/> Loguear set
          </button>
          <div className="icon-btn"><Icon name="skip" size={18}/></div>
        </div>
      </div>
    </Phone>
  );
}

// ============================================================
// 04 · COACH (text vs voice variant)
// ============================================================
function ScreenCoach({ tweaks }) {
  const { wallpaper, showPattern, dose, coachStyle, coachMode } = tweaks;
  return (
    <Phone wallpaper={wallpaper} pattern={showPattern} dose={dose}>
      <div className="coach-backdrop">
        <div style={{ padding: '70px 18px', display: 'flex', flexDirection: 'column', gap: 14, opacity: 0.9 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 28, color: '#fff' }}>RECOVER<br/>&amp; LIFT</div>
          <div style={{ height: 130, borderRadius: 22, background: 'rgba(255,255,255,0.05)' }}/>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            <div style={{ height: 80, borderRadius: 14, background: 'rgba(255,255,255,0.05)' }}/>
            <div style={{ height: 80, borderRadius: 14, background: 'rgba(255,255,255,0.05)' }}/>
            <div style={{ height: 80, borderRadius: 14, background: 'rgba(255,255,255,0.05)' }}/>
          </div>
          <div style={{ height: 100, borderRadius: 22, background: 'rgba(109,0,255,0.18)' }}/>
        </div>
      </div>

      <div className={'coach-sheet ' + (coachStyle === 'solid' ? 'coach-sheet--solid' : '')}>
        <div className="coach-grabber"></div>
        <div className="coach-head">
          <div className="coach-head__avatar"></div>
          <div style={{ flex: 1 }}>
            <div className="coach-head__name">NGX Coach</div>
            <div className="coach-head__status">{coachMode === 'voice' ? 'Escuchando · voz activa' : 'Activo · Lee tus métricas'}</div>
          </div>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={14}/>
          </div>
        </div>

        <div className="coach-feed">
          <div className="msg msg--coach">
            <div className="msg__eyebrow">Lectura · Hoy 9:41</div>
            Tu HRV cerró en <b>52 ms</b>, +8 vs baseline. RHR bajó a <b>44 bpm</b>. Hoy puedes empujar.
            <div className="msg__data">
              <div><div className="bio__l">HRV</div><div className="bio__v">52</div></div>
              <div><div className="bio__l">RHR</div><div className="bio__v">44</div></div>
              <div><div className="bio__l">Sleep</div><div className="bio__v">66<span className="bio__unit" style={{ fontSize: 8 }}>%</span></div></div>
            </div>
          </div>

          <div className="msg msg--user">¿Me toca pierna o vuelvo a press?</div>

          <div className="msg msg--coach">
            <div className="msg__eyebrow">Recomendación</div>
            Press &amp; Pull <b>5×5</b> a RPE 8. Tu volumen de pierna esta semana ya cubre el target; salvarías recovery para mañana.
          </div>

          {coachMode !== 'voice' && (
            <div className="msg msg--coach" style={{ background: 'transparent', border: 'none', padding: 0 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div className="lg-capsule lg-capsule--active" style={{ fontSize: 10 }}>Aceptar plan</div>
                <div className="lg-capsule" style={{ fontSize: 10 }}>Editar</div>
                <div className="lg-capsule" style={{ fontSize: 10 }}>Otro día</div>
              </div>
            </div>
          )}
        </div>

        {coachMode === 'text' && (
          <>
            <div className="coach-suggest">
              <div className="coach-suggest__pill">¿Por qué subió mi HRV?</div>
              <div className="coach-suggest__pill">Programa próxima semana</div>
              <div className="coach-suggest__pill">Comparar vs último mes</div>
            </div>
            <div className="coach-input">
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="plus" size={16}/>
              </div>
              <div className="coach-input__field">Pregúntale al coach…</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)' }}>
                  <Icon name="mic" size={16}/>
                </div>
                <div className="coach-input__send">
                  <Icon name="send" size={14}/>
                </div>
              </div>
            </div>
          </>
        )}

        {coachMode === 'voice' && (
          <div className="coach-voice">
            <div className="coach-voice__wave">
              {Array.from({ length: 32 }).map((_, i) => {
                const h = 8 + Math.abs(Math.sin(i * 0.7)) * 30 + Math.abs(Math.cos(i * 0.3)) * 8;
                return <span key={i} style={{ height: h, animationDelay: `${i * 60}ms` }}/>;
              })}
            </div>
            <div className="coach-voice__mic">
              <Icon name="mic" size={26}/>
            </div>
            <div className="coach-voice__hint">Tocá para pausar · desliza ↓ para escribir</div>
          </div>
        )}
      </div>
    </Phone>
  );
}

// ============================================================
// 05 · PROFILE
// ============================================================
function ScreenProfile({ tweaks }) {
  const { wallpaper, showPattern, dose } = tweaks;
  return (
    <Phone wallpaper={wallpaper} pattern={showPattern} dose={dose}>
      <div style={{ position: 'absolute', top: 64, left: 0, right: 0, bottom: 110, overflowY: 'auto', zIndex: 2, display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 20 }}>
        <div className="profile-hero">
          <div className="profile-avatar"></div>
          <div>
            <div className="profile-name">Alex Ramírez</div>
            <div className="profile-meta" style={{ marginTop: 8, justifyContent: 'center' }}>
              <span><b>Pro</b> · 142 días</span>
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>|</span>
              <span>Coach · M. León</span>
            </div>
          </div>
        </div>

        <div className="profile-stats">
          <div className="dose-glass bio">
            <div className="bio__l">Racha</div>
            <div className="bio__v">42<span className="bio__unit">d</span></div>
            <div className="bio__d ngx-delta-up">+3 vs ant.</div>
          </div>
          <div className="dose-glass bio">
            <div className="bio__l">PR</div>
            <div className="bio__v">7</div>
            <div className="bio__d ngx-delta-flat">este mes</div>
          </div>
          <div className="dose-glass bio">
            <div className="bio__l">Sesiones</div>
            <div className="bio__v">186</div>
            <div className="bio__d ngx-delta-flat">total</div>
          </div>
        </div>

        <div style={{ margin: '0 14px' }}>
          <div className="nudge">
            <div className="nudge__lbl">Programa actual</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, letterSpacing: '-0.02em', textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>Longevity · 12 sem</div>
                <div style={{ fontFamily: 'var(--font-text)', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>Semana 6 · 50% completado</div>
              </div>
              <div className="ngx-bignum" style={{ fontSize: 42, color: '#C29BFF' }}>50<span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginLeft: 2 }}>%</span></div>
            </div>
            <div style={{ marginTop: 12, height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.4)', overflow: 'hidden' }}>
              <div style={{ width: '50%', height: '100%', background: 'linear-gradient(90deg,#C29BFF,#6D00FF)', boxShadow: '0 0 10px #6D00FF' }}/>
            </div>
          </div>
        </div>

        <div>
          <div className="sect-l" style={{ padding: '0 22px 6px' }}>
            <span>Dispositivos &amp; fuentes</span>
          </div>
          <div className="list-card" style={{ margin: '0 14px' }}>
            <ListRow icon="watch" title="Apple Watch · S9" sub="Conectado · sincronizado 9:41" chip="Activo"/>
            <ListRow icon="heart" title="Whoop 4.0" sub="HRV · Recovery · Strain"/>
            <ListRow icon="moon" title="Oura Ring" sub="Sueño · temperatura"/>
          </div>
        </div>

        <div>
          <div className="sect-l" style={{ padding: '0 22px 6px' }}>
            <span>Coach &amp; comunicación</span>
          </div>
          <div className="list-card" style={{ margin: '0 14px' }}>
            <ListRow icon="coach" title="Estilo del AI Coach" sub="Directo · datos primero" chip="Directo" purple/>
            <ListRow icon="bell" title="Notificaciones" sub="3 diarias · ventana 7–22h"/>
            <ListRow icon="gear" title="Unidades" sub="Métrico · kg / ms / bpm"/>
          </div>
        </div>

        <div>
          <div className="sect-l" style={{ padding: '0 22px 6px' }}>
            <span>Cuenta</span>
          </div>
          <div className="list-card" style={{ margin: '0 14px' }}>
            <ListRow icon="user" title="Perfil &amp; metas" sub="Performance &amp; longevity"/>
            <ListRow icon="flame" title="Plan NGX Pro" sub="Renueva el 14 oct" chip="$24/mes"/>
          </div>
        </div>
      </div>

      <TabBar active="profile"/>
    </Phone>
  );
}

function ListRow({ icon, title, sub, chip, purple }) {
  return (
    <div className="list-row">
      <div className={'list-row__icon ' + (purple ? 'list-row__icon--purple' : '')}>
        <Icon name={icon} size={16}/>
      </div>
      <div className="list-row__body">
        <div className="list-row__title">{title}</div>
        <div className="list-row__sub">{sub}</div>
      </div>
      {chip && <span className="list-row__chip">{chip}</span>}
      <div className="list-row__chev"><Icon name="chev-r" size={16}/></div>
    </div>
  );
}

// ============================================================
// 06 · ONBOARDING — 5-step flow
// ============================================================

function OnbShell({ tweaks, step, total = 5, label, children, primaryLabel = 'Continuar', backLabel = 'Atrás', primaryFull = false }) {
  const { wallpaper, showPattern, dose } = tweaks;
  return (
    <Phone wallpaper={wallpaper} pattern={showPattern} dose={dose}>
      <div style={{ position: 'absolute', top: 64, left: 22, right: 22, bottom: 110, zIndex: 2, display: 'flex', flexDirection: 'column' }}>
        <div className="onb-step" style={{ marginBottom: 22 }}>
          <span>Step {step} / {total}</span>
          <div className="onb-step__bar"><div style={{ width: `${(step / total) * 100}%` }}/></div>
          <span style={{ color: 'var(--ngx-purple-300)' }}>{label}</span>
        </div>
        {children}
      </div>
      <div className="onb-cta-row">
        {!primaryFull && (
          <button className="lg-cta lg-cta--secondary">
            <Icon name="chev-l" size={14}/> {backLabel}
          </button>
        )}
        <button className="lg-cta lg-cta--primary">
          {primaryLabel} <Icon name="chev-r" size={14}/>
        </button>
      </div>
    </Phone>
  );
}

// Step 1 · Welcome
function OnbWelcome({ tweaks }) {
  return (
    <OnbShell tweaks={tweaks} step={1} label="Welcome" primaryLabel="Empezar" primaryFull>
      <div className="onb-brand">
        <div className="onb-brand__mark">
          <svg width="48" height="48" viewBox="0 0 24 24">
            <path d="M3 3L21 21M21 3L3 21" stroke="#fff" strokeWidth="3.5" strokeLinecap="square"/>
          </svg>
        </div>
        <div className="ngx-caps ngx-caps--purple" style={{ fontSize: 11 }}>NeoGen-X · Performance &amp; Longevity</div>
        <div className="onb-title" style={{ fontSize: 40 }}>Push hard.<br/><span className="charge">Live long.</span></div>
        <div className="onb-sub" style={{ maxWidth: 300 }}>
          Tu coach con AI lee HRV, recovery y sueño en tiempo real. Programa, ajusta y empuja en el momento justo. Sin guesswork.
        </div>
      </div>
      <div style={{ flex: 1 }}/>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <a style={{ fontFamily: 'var(--font-text)', fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'underline' }}>
          Ya tengo cuenta · Iniciar sesión
        </a>
      </div>
    </OnbShell>
  );
}

// Step 2 · Identity
function OnbIdentity({ tweaks }) {
  return (
    <OnbShell tweaks={tweaks} step={2} label="Identity">
      <div className="onb-title">Contame de vos.</div>
      <div className="onb-sub">Edad y composición — para calibrar baselines reales, no genéricos.</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
        <div className="id-row">
          <span className="id-row__lbl">Edad</span>
          <span className="id-row__val ngx-tabular">38<span className="unit">años</span></span>
        </div>

        <div className="id-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
          <span className="id-row__lbl">Sexo biológico</span>
          <div className="seg">
            <div className="seg__opt seg__opt--active">Hombre</div>
            <div className="seg__opt">Mujer</div>
            <div className="seg__opt">Otro</div>
          </div>
        </div>

        <div className="id-row">
          <span className="id-row__lbl">Altura</span>
          <span className="id-row__val ngx-tabular">178<span className="unit">cm</span></span>
        </div>

        <div className="id-row">
          <span className="id-row__lbl">Peso</span>
          <span className="id-row__val ngx-tabular">82<span className="unit">kg</span></span>
        </div>
      </div>
    </OnbShell>
  );
}

// Step 3 · Goals
function OnbGoals({ tweaks }) {
  const [selected, setSelected] = React.useState('performance');
  const opts = [
    { id: 'health',      icon: 'heart', title: 'Salud base', sub: 'Sentirme bien, bajar inflamación, dormir mejor.' },
    { id: 'fitness',     icon: 'flame', title: 'Composición', sub: 'Bajar grasa, ganar músculo, verme atlético.' },
    { id: 'performance', icon: 'bolt',  title: 'Performance', sub: 'PRs nuevos, output máximo, competir.' },
    { id: 'longevity',   icon: 'moon',  title: 'Longevidad', sub: 'Capacidad funcional a 60+, biomarkers en rango óptimo.' },
  ];
  return (
    <OnbShell tweaks={tweaks} step={3} label="Goals">
      <div className="onb-title">¿Qué te trae<br/>a <span className="charge">NGX</span>?</div>
      <div className="onb-sub">Tu objetivo principal define cómo el coach lee tus métricas y arma cada sesión. Podés cambiarlo después.</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
        {opts.map(o => (
          <div key={o.id}
               className={'opt-card ' + (selected === o.id ? 'opt-card--active' : '')}
               onClick={() => setSelected(o.id)}>
            <div className="opt-card__icon"><Icon name={o.icon} size={22}/></div>
            <div className="opt-card__body">
              <div className="opt-card__title">{o.title}</div>
              <div className="opt-card__sub">{o.sub}</div>
            </div>
            <div className="opt-card__check">
              {selected === o.id && <Icon name="check" size={14}/>}
            </div>
          </div>
        ))}
      </div>
    </OnbShell>
  );
}

// Step 4 · Devices
function OnbDevices({ tweaks }) {
  const [connected, setConnected] = React.useState({ watch: true, whoop: false, oura: true });
  const devs = [
    { id: 'watch', icon: 'watch', title: 'Apple Watch', sub: 'HR · workouts · cardio fit · sueño' },
    { id: 'whoop', icon: 'heart', title: 'Whoop 4.0',   sub: 'HRV · recovery · strain · estricto' },
    { id: 'oura',  icon: 'moon',  title: 'Oura Ring',   sub: 'Sueño · temperatura · readiness' },
  ];
  return (
    <OnbShell tweaks={tweaks} step={4} label="Devices">
      <div className="onb-title">Tus<br/><span className="charge">sensores</span>.</div>
      <div className="onb-sub">Conectá lo que ya usás. Mientras más fuentes, mejor lectura — pero con una sola alcanza para empezar.</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
        {devs.map(d => {
          const on = connected[d.id];
          return (
            <div key={d.id}
                 className={'opt-card ' + (on ? 'opt-card--active' : '')}
                 onClick={() => setConnected(s => ({ ...s, [d.id]: !s[d.id] }))}>
              <div className="opt-card__icon"><Icon name={d.icon} size={22}/></div>
              <div className="opt-card__body">
                <div className="opt-card__title">{d.title}</div>
                <div className="opt-card__sub">{d.sub}</div>
              </div>
              <div style={{
                width: 44, height: 26, borderRadius: 13,
                background: on ? 'var(--ngx-purple)' : 'rgba(0,0,0,0.4)',
                boxShadow: on ? 'var(--lg-glow-purple-sm)' : 'none',
                border: '1px solid rgba(255,255,255,0.18)',
                position: 'relative',
                flex: '0 0 44px',
              }}>
                <div style={{
                  position: 'absolute', top: 2, left: on ? 20 : 2,
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  transition: 'left 200ms',
                }}/>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 18, padding: '12px 14px', background: 'rgba(0,0,0,0.35)', border: '1px solid var(--lg-rim-thin)', borderRadius: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Icon name="bell" size={16}/>
        <div style={{ fontFamily: 'var(--font-text)', fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>
          Vas a ver una pantalla nativa de iOS para autorizar Health. NGX <b>solo lee</b> — nunca escribe en tus apps.
        </div>
      </div>
    </OnbShell>
  );
}

// Step 5 · Plan ready
function OnbReady({ tweaks }) {
  return (
    <OnbShell tweaks={tweaks} step={5} label="Plan" primaryLabel="Abrir mi plan" primaryFull>
      <div className="onb-ready">
        <div className="onb-ready__eyebrow">Tu plan está listo</div>
        <div className="onb-ready__title">Longevity<br/><span style={{ background: 'linear-gradient(180deg,#fff,#6D00FF)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>12 semanas</span></div>
      </div>

      <div className="onb-stats">
        <div className="dose-glass bio" style={{ alignItems: 'center', textAlign: 'center' }}>
          <div className="bio__l">Sesiones</div>
          <div className="bio__v">4<span className="bio__unit">/sem</span></div>
        </div>
        <div className="dose-glass bio" style={{ alignItems: 'center', textAlign: 'center' }}>
          <div className="bio__l">Duración</div>
          <div className="bio__v">48<span className="bio__unit">min</span></div>
        </div>
        <div className="dose-glass bio" style={{ alignItems: 'center', textAlign: 'center' }}>
          <div className="bio__l">Foco</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 16, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.005em', marginTop: 2 }}>Fuerza<br/>+ Z2</div>
        </div>
      </div>

      <div className="nudge" style={{ marginTop: 6 }}>
        <div className="nudge__lbl">Coach · Tu primer insight</div>
        <div className="nudge__text">
          Empezamos con <b>Press &amp; Pull 5×5</b> a RPE 7. Vas a notar el ajuste cuando tu HRV suba — ahí pisamos más fuerte.
        </div>
      </div>

      <div style={{ flex: 1 }}/>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '12px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#C29BFF,#6D00FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--lg-glow-purple-sm)' }}>
          <Icon name="check" size={16}/>
        </div>
        <div style={{ fontFamily: 'var(--font-text)', fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>
          <b style={{ fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>14 días free.</b> Cancelás cuando quieras desde Perfil.
        </div>
      </div>
    </OnbShell>
  );
}

// ============================================================
// Tab bar
// ============================================================
function TabBar({ active = 'home' }) {
  const tabs = [
    { id: 'home',     lbl: 'Hoy',     icon: 'home' },
    { id: 'train',    lbl: 'Train',   icon: 'dumbbell' },
    { id: 'trends',   lbl: 'Trends',  icon: 'trend' },
    { id: 'coach',    lbl: 'Coach',   icon: 'coach' },
    { id: 'profile',  lbl: 'Perfil',  icon: 'user' },
  ];
  return (
    <div className="mtab">
      {tabs.map(t => (
        <div key={t.id} className={t.id === active ? 'mtab__tab mtab__tab--active' : 'mtab__tab'}>
          <Icon name={t.icon} size={20}/>
          <span className="mtab__lbl">{t.lbl}</span>
        </div>
      ))}
    </div>
  );
}

// ---- Export to window ----
Object.assign(window, {
  Icon, Ring, Phone, TabBar, ListRow,
  ScreenLock, ScreenHome, ScreenWorkout, ScreenCoach, ScreenProfile,
  OnbWelcome, OnbIdentity, OnbGoals, OnbDevices, OnbReady,
});
