'use client';
import { useEffect, useRef } from 'react';
import './eusse-world.css';
import { initEusse } from './fx';

/**
 * EUSSE WORLD — landing page.
 * Animaciones: globo 3D (three.js), parallax, revelado al hacer scroll,
 * contenedor 3D que recorre el proceso y marquesina reactiva al scroll.
 */
export default function EusseWorldLanding() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    return initEusse(rootRef.current, () => import('./globe'));
  }, []);

  return (
    <div ref={rootRef} data-eusse-root="" style={{"position":"relative","background":"#f2f2f3","color":"#1d1f20","fontFamily":"'Barlow',system-ui,sans-serif","fontSize":"16px","lineHeight":"1.55","overflowX":"clip"}}>
      <header data-nav="" style={{"position":"fixed","top":"0","left":"0","right":"0","zIndex":"60","borderBottom":"1px solid rgba(181,217,253,0)","transition":"background .4s ease,border-color .4s ease"}}>
        <div style={{"maxWidth":"1440px","margin":"0 auto","padding":"16px clamp(20px,4vw,56px)","display":"flex","alignItems":"center","gap":"32px"}}>
          <a href="#top" style={{"display":"flex","alignItems":"center","gap":"12px","textDecoration":"none","color":"#f2f2f3","flex":"none"}}>
            <span style={{"position":"relative","width":"34px","height":"34px","border":"1px solid rgba(181,217,253,.55)","display":"grid","placeItems":"center"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b5d9fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </span>
            <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"21px","letterSpacing":".14em","lineHeight":"1"}}>EUSSE<span style={{"color":"#94bce3","fontWeight":"400"}}> WORLD</span></span>
          </a>
          <nav style={{"flex":"1 1 auto","minWidth":"0","height":"22px","overflow":"hidden","display":"flex","flexWrap":"wrap","justifyContent":"center","gap":"4px 36px"}}>
            <a className="ew-1" href="#servicios" style={{"color":"#d6ebff","textDecoration":"none","fontSize":"14px","letterSpacing":".06em","textTransform":"uppercase"}}>Servicios</a>
            <a className="ew-2" href="#red" style={{"color":"#d6ebff","textDecoration":"none","fontSize":"14px","letterSpacing":".06em","textTransform":"uppercase"}}>Red</a>
            <a className="ew-3" href="#proceso" style={{"color":"#d6ebff","textDecoration":"none","fontSize":"14px","letterSpacing":".06em","textTransform":"uppercase"}}>Proceso</a>
            <a className="ew-4" href="#contacto" style={{"color":"#d6ebff","textDecoration":"none","fontSize":"14px","letterSpacing":".06em","textTransform":"uppercase"}}>Contacto</a>
          </nav>
          <a className="ew-5" href="#contacto" style={{"flex":"none","display":"inline-flex","alignItems":"center","gap":"10px","padding":"11px 18px","background":"#5980a6","color":"#f2f2f3","textDecoration":"none","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"15px","letterSpacing":".08em","textTransform":"uppercase","border":"1px solid #749dc4","transition":"background .2s"}}>
            Cotizar envío
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>
          </a>
        </div>
      </header>
      <section id="top" data-hero="" data-screen-label="Hero" style={{"position":"relative","minHeight":"100svh","background":"#1d2d3d","color":"#f2f2f3","overflow":"hidden","display":"flex","flexDirection":"column"}}>
        <div data-hero-grid="" style={{"position":"absolute","inset":"-20% 0 0 0","backgroundImage":"linear-gradient(rgba(181,217,253,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(181,217,253,.06) 1px,transparent 1px)","backgroundSize":"88px 88px","pointerEvents":"none"}} />
        <div data-hero-globe="" style={{"position":"absolute","top":"50%","right":"-26vw","width":"min(118vw,1500px)","aspectRatio":"1","marginTop":"calc(min(118vw,1500px) / -2)","willChange":"transform"}}><div data-globe="" style={{"position":"absolute","inset":"0"}} /></div>
        <div style={{"position":"absolute","inset":"0","background":"linear-gradient(90deg,#1d2d3d 18%,rgba(29,45,61,.55) 48%,rgba(29,45,61,0) 70%)","pointerEvents":"none"}} />
        <div style={{"position":"absolute","left":"0","right":"0","bottom":"0","height":"30%","background":"linear-gradient(0deg,#1d2d3d,rgba(29,45,61,0))","pointerEvents":"none"}} />
        <div data-hero-content="" style={{"position":"relative","zIndex":"2","flex":"1","maxWidth":"1440px","width":"100%","margin":"0 auto","padding":"clamp(120px,18vh,200px) clamp(20px,4vw,56px) 48px","display":"flex","flexDirection":"column","justifyContent":"center","willChange":"transform,opacity"}}>
          <div data-intro="" style={{"display":"flex","alignItems":"center","gap":"14px","marginBottom":"28px"}}>
            <span style={{"width":"8px","height":"8px","background":"#94bce3","boxShadow":"0 0 0 4px rgba(148,188,227,.18)"}} />
            <span style={{"fontSize":"13px","letterSpacing":".22em","textTransform":"uppercase","color":"#b5d9fd"}}>Logística internacional · Compras · Distribución</span>
          </div>
          <h1 data-intro="" style={{"margin":"0","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"clamp(56px,9.4vw,156px)","lineHeight":".88","letterSpacing":"-.01em","textTransform":"uppercase","maxWidth":"11ch","textWrap":"balance"}}>Conectamos mercados.</h1>
          <h1 data-intro="" style={{"margin":"0 0 36px","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"400","fontSize":"clamp(56px,9.4vw,156px)","lineHeight":".88","letterSpacing":"-.01em","textTransform":"uppercase","color":"#94bce3","maxWidth":"11ch"}}>Impulsamos negocios.</h1>
          <p data-intro="" style={{"margin":"0 0 40px","maxWidth":"520px","fontSize":"clamp(17px,1.4vw,20px)","lineHeight":"1.55","color":"#d6ebff","textWrap":"pretty"}}>Conectamos mercados entre Colombia, Costa Rica, Nicaragua, Estados Unidos y seguimos expandiendo nuestras operaciones.</p>
          <div data-intro="" style={{"display":"flex","flexWrap":"wrap","gap":"20px"}}>
            <a className="ew-6" href="#contacto" style={{"position":"relative","display":"inline-flex","alignItems":"center","gap":"12px","padding":"18px 28px","background":"#5980a6","color":"#f2f2f3","textDecoration":"none","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"18px","letterSpacing":".08em","textTransform":"uppercase","border":"1px solid #749dc4","transition":"background .2s"}}>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","top":"-6px","left":"-6px","color":"#b5d9fd"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","top":"-6px","right":"-6px","color":"#b5d9fd"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","bottom":"-6px","left":"-6px","color":"#b5d9fd"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","bottom":"-6px","right":"-6px","color":"#b5d9fd"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
               Solicitar cotización 
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </a>
            <a className="ew-7" href="#servicios" style={{"display":"inline-flex","alignItems":"center","gap":"12px","padding":"18px 28px","color":"#f2f2f3","textDecoration":"none","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"18px","letterSpacing":".08em","textTransform":"uppercase","border":"1px solid rgba(181,217,253,.35)","transition":"background .2s,border-color .2s"}}>Ver servicios</a>
          </div>
        </div>
        <div data-hero-strip="" style={{"position":"relative","zIndex":"2","maxWidth":"1440px","width":"100%","margin":"0 auto","padding":"0 clamp(20px,4vw,56px) 40px","willChange":"transform,opacity"}}><div data-intro="">
          <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(170px,1fr))","borderTop":"1px solid rgba(181,217,253,.18)"}}>
            <div style={{"padding":"20px 20px 0 0","display":"flex","flexDirection":"column","gap":"4px"}}>
              <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"13px","letterSpacing":".2em","color":"#94bce3"}}>CO · BOG</span>
              <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"24px","fontWeight":"500"}}>Colombia</span>
              <span style={{"fontSize":"12px","color":"#94bce3","fontVariantNumeric":"tabular-nums"}}>04.71°N · 74.07°W</span>
            </div>
            <div style={{"padding":"20px 20px 0 20px","borderLeft":"1px solid rgba(181,217,253,.18)","display":"flex","flexDirection":"column","gap":"4px"}}>
              <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"13px","letterSpacing":".2em","color":"#94bce3"}}>CR · SJO</span>
              <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"24px","fontWeight":"500"}}>Costa Rica</span>
              <span style={{"fontSize":"12px","color":"#94bce3","fontVariantNumeric":"tabular-nums"}}>09.93°N · 84.08°W</span>
            </div>
            <div style={{"padding":"20px 20px 0 20px","borderLeft":"1px solid rgba(181,217,253,.18)","display":"flex","flexDirection":"column","gap":"4px"}}>
              <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"13px","letterSpacing":".2em","color":"#94bce3"}}>NI · MGA</span>
              <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"24px","fontWeight":"500"}}>Nicaragua</span>
              <span style={{"fontSize":"12px","color":"#94bce3","fontVariantNumeric":"tabular-nums"}}>12.13°N · 86.25°W</span>
            </div>
            <div style={{"padding":"20px 20px 0 20px","borderLeft":"1px solid rgba(181,217,253,.18)","display":"flex","flexDirection":"column","gap":"4px"}}>
              <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"13px","letterSpacing":".2em","color":"#94bce3"}}>US · MIA</span>
              <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"24px","fontWeight":"500"}}>Estados Unidos</span>
              <span style={{"fontSize":"12px","color":"#94bce3","fontVariantNumeric":"tabular-nums"}}>25.76°N · 80.19°W</span>
            </div>
          </div>
        </div></div>
      </section>
      <div style={{"position":"relative","background":"#5980a6","color":"#f2f2f3","overflow":"hidden","padding":"22px 0","borderBottom":"1px solid #416180"}}>
        <div data-marquee="" style={{"display":"flex","width":"max-content","willChange":"transform"}}>
          <div style={{"display":"flex","alignItems":"center","gap":"40px","paddingRight":"40px","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"500","fontSize":"clamp(22px,2.4vw,32px)","letterSpacing":".06em","textTransform":"uppercase","whiteSpace":"nowrap"}}>
            <span>Transporte internacional</span>
            <span style={{"color":"#d6ebff"}}>/</span>
            <span>Importaciones</span>
            <span style={{"color":"#d6ebff"}}>/</span>
            <span>Exportaciones</span>
            <span style={{"color":"#d6ebff"}}>/</span>
            <span>Personal Shopper</span>
            <span style={{"color":"#d6ebff"}}>/</span>
            <span>Abastecimiento comercial</span>
            <span style={{"color":"#d6ebff"}}>/</span>
            <span>Almacenamiento</span>
            <span style={{"color":"#d6ebff"}}>/</span>
            <span>Distribución</span>
            <span style={{"color":"#d6ebff"}}>/</span>
            <span>Última milla</span>
            <span style={{"color":"#d6ebff"}}>/</span>
          </div>
          <div aria-hidden="true" style={{"display":"flex","alignItems":"center","gap":"40px","paddingRight":"40px","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"500","fontSize":"clamp(22px,2.4vw,32px)","letterSpacing":".06em","textTransform":"uppercase","whiteSpace":"nowrap"}}>
            <span>Transporte internacional</span>
            <span style={{"color":"#d6ebff"}}>/</span>
            <span>Importaciones</span>
            <span style={{"color":"#d6ebff"}}>/</span>
            <span>Exportaciones</span>
            <span style={{"color":"#d6ebff"}}>/</span>
            <span>Personal Shopper</span>
            <span style={{"color":"#d6ebff"}}>/</span>
            <span>Abastecimiento comercial</span>
            <span style={{"color":"#d6ebff"}}>/</span>
            <span>Almacenamiento</span>
            <span style={{"color":"#d6ebff"}}>/</span>
            <span>Distribución</span>
            <span style={{"color":"#d6ebff"}}>/</span>
            <span>Última milla</span>
            <span style={{"color":"#d6ebff"}}>/</span>
          </div>
        </div>
      </div>
      <section data-manifesto="" data-screen-label="Manifiesto" style={{"position":"relative","padding":"clamp(100px,16vw,220px) clamp(20px,4vw,56px)","overflow":"hidden"}}>
        <div data-px="-0.25" style={{"position":"absolute","left":"0","right":"0","top":"50%","marginTop":"-0.5em","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"700","fontSize":"clamp(160px,26vw,420px)","lineHeight":"1","letterSpacing":"-.02em","color":"rgba(89,128,166,.07)","whiteSpace":"nowrap","textAlign":"center","pointerEvents":"none","willChange":"transform"}}>EUSSE WORLD</div>
        <div style={{"position":"relative","maxWidth":"1240px","margin":"0 auto","display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(min(100%,260px),1fr))","gap":"40px 64px","alignItems":"start"}}>
          <div data-reveal="" style={{"display":"flex","flexDirection":"column","gap":"10px","maxWidth":"260px"}}>
            <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"14px","letterSpacing":".22em","textTransform":"uppercase","color":"#416180"}}>00 — Quiénes somos</span>
            <span style={{"width":"48px","height":"1px","background":"#5980a6"}} />
          </div>
          <p style={{"gridColumn":"span 3","minWidth":"min(100%,560px)","margin":"0","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"500","fontSize":"clamp(36px,5.2vw,80px)","lineHeight":"1.02","letterSpacing":"-.01em","textWrap":"balance"}}>
            <span data-phrase="" style={{"transition":"opacity .25s linear"}}>En EUSSE WORLD no solo movemos mercancía;</span>
            <span data-phrase="" style={{"color":"#416180","transition":"opacity .25s linear"}}>impulsamos negocios,</span>
            <span data-phrase="" style={{"color":"#416180","transition":"opacity .25s linear"}}>conectamos oportunidades</span>
            <span data-phrase="" style={{"transition":"opacity .25s linear"}}>y construimos relaciones de confianza.</span>
          </p>
        </div>
      </section>
      <section id="servicios" data-screen-label="Servicios" style={{"position":"relative","padding":"0 clamp(20px,4vw,56px) clamp(100px,12vw,180px)"}}>
        <div style={{"maxWidth":"1440px","margin":"0 auto"}}>
          <div style={{"display":"flex","flexWrap":"wrap","alignItems":"flex-end","justifyContent":"space-between","gap":"24px 64px","paddingBottom":"48px","marginBottom":"56px","borderBottom":"1px solid rgba(29,31,32,.16)"}}>
            <div data-reveal="" style={{"display":"flex","flexDirection":"column","gap":"18px"}}>
              <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"14px","letterSpacing":".22em","textTransform":"uppercase","color":"#416180"}}>01 — Servicios</span>
              <h2 style={{"margin":"0","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"clamp(44px,6vw,92px)","lineHeight":".92","textTransform":"uppercase","letterSpacing":"-.01em","maxWidth":"12ch"}}>Toda la cadena, una sola operación.</h2>
            </div>
            <p data-reveal="" data-delay="120" style={{"margin":"0","maxWidth":"400px","fontSize":"17px","color":"#5d5d60","textWrap":"pretty"}}>Desde la compra en origen hasta la entrega final. Coordinamos cada tramo para que su mercancía llegue a tiempo y su negocio siga en movimiento.</p>
          </div>
          <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(min(100%,330px),1fr))","gap":"28px"}}>
            <article className="ew-8" data-reveal="" style={{"position":"relative","border":"1px solid rgba(29,31,32,.16)","padding":"32px","minHeight":"340px","display":"flex","flexDirection":"column","gap":"20px","transition":"background .35s ease,border-color .35s ease"}}>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","top":"-6px","left":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","top":"-6px","right":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","bottom":"-6px","left":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","bottom":"-6px","right":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <div style={{"display":"flex","justifyContent":"space-between","alignItems":"flex-start"}}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#5980a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 10.189V14" />
                  <path d="M12 2v3" />
                  <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6" />
                  <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76" />
                  <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                </svg>
                <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"15px","letterSpacing":".14em","color":"#7a7a7d"}}>01</span>
              </div>
              <h3 style={{"margin":"auto 0 0","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"32px","lineHeight":"1","textTransform":"uppercase"}}>Transporte internacional de mercancías</h3>
              <p style={{"margin":"0","fontSize":"15px","color":"#5d5d60","textWrap":"pretty"}}>Carga aérea, marítima y terrestre coordinada de origen a destino, con seguimiento en cada tramo.</p>
            </article>
            <article className="ew-9" data-reveal="" data-delay="80" style={{"position":"relative","border":"1px solid rgba(29,31,32,.16)","padding":"32px","minHeight":"340px","display":"flex","flexDirection":"column","gap":"20px","transition":"background .35s ease,border-color .35s ease"}}>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","top":"-6px","left":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","top":"-6px","right":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","bottom":"-6px","left":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","bottom":"-6px","right":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <div style={{"display":"flex","justifyContent":"space-between","alignItems":"flex-start"}}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#5980a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3 4 7l4 4" />
                  <path d="M4 7h16" />
                  <path d="m16 21 4-4-4-4" />
                  <path d="M20 17H4" />
                </svg>
                <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"15px","letterSpacing":".14em","color":"#7a7a7d"}}>02</span>
              </div>
              <h3 style={{"margin":"auto 0 0","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"32px","lineHeight":"1","textTransform":"uppercase"}}>Importaciones y exportaciones</h3>
              <p style={{"margin":"0","fontSize":"15px","color":"#5d5d60","textWrap":"pretty"}}>Gestión documental, clasificación arancelaria y acompañamiento aduanero en cada país de la ruta.</p>
            </article>
            <article className="ew-10" data-reveal="" data-delay="160" style={{"position":"relative","border":"1px solid rgba(29,31,32,.16)","padding":"32px","minHeight":"340px","display":"flex","flexDirection":"column","gap":"20px","transition":"background .35s ease,border-color .35s ease"}}>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","top":"-6px","left":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","top":"-6px","right":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","bottom":"-6px","left":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","bottom":"-6px","right":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <div style={{"display":"flex","justifyContent":"space-between","alignItems":"flex-start"}}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#5980a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"15px","letterSpacing":".14em","color":"#7a7a7d"}}>03</span>
              </div>
              <h3 style={{"margin":"auto 0 0","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"32px","lineHeight":"1","textTransform":"uppercase"}}>Compras internacionales <span style={{"color":"#5980a6"}}>(Personal Shopper)</span></h3>
              <p style={{"margin":"0","fontSize":"15px","color":"#5d5d60","textWrap":"pretty"}}>Compramos por usted en el exterior: verificamos proveedores, consolidamos pedidos y los enviamos a su destino.</p>
            </article>
            <article className="ew-11" data-reveal="" style={{"position":"relative","border":"1px solid rgba(29,31,32,.16)","padding":"32px","minHeight":"340px","display":"flex","flexDirection":"column","gap":"20px","transition":"background .35s ease,border-color .35s ease"}}>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","top":"-6px","left":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","top":"-6px","right":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","bottom":"-6px","left":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","bottom":"-6px","right":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <div style={{"display":"flex","justifyContent":"space-between","alignItems":"flex-start"}}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#5980a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m7.5 4.27 9 5.15" />
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="m3.3 7 8.7 5 8.7-5" />
                  <path d="M12 22V12" />
                </svg>
                <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"15px","letterSpacing":".14em","color":"#7a7a7d"}}>04</span>
              </div>
              <h3 style={{"margin":"auto 0 0","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"32px","lineHeight":"1","textTransform":"uppercase"}}>Abastecimiento comercial</h3>
              <p style={{"margin":"0","fontSize":"15px","color":"#5d5d60","textWrap":"pretty"}}>Búsqueda de producto y proveedores para mantener su inventario continuo y competitivo.</p>
            </article>
            <article className="ew-12" data-reveal="" data-delay="80" style={{"position":"relative","border":"1px solid rgba(29,31,32,.16)","padding":"32px","minHeight":"340px","display":"flex","flexDirection":"column","gap":"20px","transition":"background .35s ease,border-color .35s ease"}}>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","top":"-6px","left":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","top":"-6px","right":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","bottom":"-6px","left":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","bottom":"-6px","right":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <div style={{"display":"flex","justifyContent":"space-between","alignItems":"flex-start"}}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#5980a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" />
                  <path d="M6 18h12" />
                  <path d="M6 14h12" />
                  <rect width="12" height="12" x="6" y="10" />
                </svg>
                <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"15px","letterSpacing":".14em","color":"#7a7a7d"}}>05</span>
              </div>
              <h3 style={{"margin":"auto 0 0","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"32px","lineHeight":"1","textTransform":"uppercase"}}>Almacenamiento y distribución</h3>
              <p style={{"margin":"0","fontSize":"15px","color":"#5d5d60","textWrap":"pretty"}}>Recepción, bodegaje, control de inventario y despacho según la demanda de su operación.</p>
            </article>
            <article className="ew-13" data-reveal="" data-delay="160" style={{"position":"relative","border":"1px solid rgba(29,31,32,.16)","padding":"32px","minHeight":"340px","display":"flex","flexDirection":"column","gap":"20px","transition":"background .35s ease,border-color .35s ease"}}>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","top":"-6px","left":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","top":"-6px","right":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","bottom":"-6px","left":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","bottom":"-6px","right":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
              <div style={{"display":"flex","justifyContent":"space-between","alignItems":"flex-start"}}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#5980a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                  <path d="M15 18H9" />
                  <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                  <circle cx="17" cy="18" r="2" />
                  <circle cx="7" cy="18" r="2" />
                </svg>
                <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"15px","letterSpacing":".14em","color":"#7a7a7d"}}>06</span>
              </div>
              <h3 style={{"margin":"auto 0 0","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"32px","lineHeight":"1","textTransform":"uppercase"}}>Última milla y logística empresarial</h3>
              <p style={{"margin":"0","fontSize":"15px","color":"#5d5d60","textWrap":"pretty"}}>Entrega final a clientes y puntos de venta, y diseño de la cadena logística de su empresa.</p>
            </article>
          </div>
        </div>
      </section>
      <section id="red" data-screen-label="Red" style={{"position":"relative","padding":"clamp(100px,12vw,180px) clamp(20px,4vw,56px)","background":"#e9e9ea","overflow":"hidden","borderTop":"1px solid rgba(29,31,32,.12)"}}>
        <div data-px="0.18" style={{"position":"absolute","right":"-4vw","top":"8%","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"700","fontSize":"clamp(140px,20vw,340px)","lineHeight":".85","color":"rgba(89,128,166,.08)","textTransform":"uppercase","textAlign":"right","pointerEvents":"none","willChange":"transform"}}>Rutas<br />activas</div>
        <div style={{"position":"relative","maxWidth":"1440px","margin":"0 auto"}}>
          <div data-reveal="" style={{"display":"flex","flexDirection":"column","gap":"18px","marginBottom":"72px","maxWidth":"820px"}}>
            <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"14px","letterSpacing":".22em","textTransform":"uppercase","color":"#416180"}}>02 — Nuestra red</span>
            <h2 style={{"margin":"0","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"clamp(44px,6vw,92px)","lineHeight":".92","textTransform":"uppercase","letterSpacing":"-.01em"}}>Cuatro países. Un mismo equipo.</h2>
            <p style={{"margin":"8px 0 0","maxWidth":"520px","fontSize":"17px","color":"#5d5d60","textWrap":"pretty"}}>Operamos con aliados y procesos propios en cada mercado, lo que nos permite mover carga en ambas direcciones sin perder el control.</p>
          </div>
          <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(min(100%,250px),1fr))","borderTop":"1px solid rgba(29,31,32,.2)","borderLeft":"1px solid rgba(29,31,32,.2)"}}>
            <div className="ew-14" data-reveal="" style={{"padding":"28px","borderRight":"1px solid rgba(29,31,32,.2)","borderBottom":"1px solid rgba(29,31,32,.2)","display":"flex","flexDirection":"column","gap":"14px","minHeight":"300px","transition":"background .3s"}}>
              <div style={{"display":"flex","justifyContent":"space-between","fontFamily":"'Barlow Condensed',sans-serif","fontSize":"14px","letterSpacing":".16em","color":"#416180"}}><span>CO</span><span>BOG</span></div>
              <span style={{"marginTop":"auto","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"clamp(64px,7vw,104px)","lineHeight":".85","color":"#5980a6"}}>CO</span>
              <h3 style={{"margin":"0","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"28px","textTransform":"uppercase","lineHeight":"1"}}>Colombia</h3>
              <div style={{"display":"flex","flexWrap":"wrap","gap":"6px"}}>
                <span style={{"fontSize":"12px","padding":"3px 10px","background":"#d6ebff","color":"#2c455d"}}>Importación</span>
                <span style={{"fontSize":"12px","padding":"3px 10px","background":"#d6ebff","color":"#2c455d"}}>Exportación</span>
                <span style={{"fontSize":"12px","padding":"3px 10px","background":"#d6ebff","color":"#2c455d"}}>Distribución</span>
              </div>
            </div>
            <div className="ew-15" data-reveal="" data-delay="80" style={{"padding":"28px","borderRight":"1px solid rgba(29,31,32,.2)","borderBottom":"1px solid rgba(29,31,32,.2)","display":"flex","flexDirection":"column","gap":"14px","minHeight":"300px","transition":"background .3s"}}>
              <div style={{"display":"flex","justifyContent":"space-between","fontFamily":"'Barlow Condensed',sans-serif","fontSize":"14px","letterSpacing":".16em","color":"#416180"}}><span>CR</span><span>SJO</span></div>
              <span style={{"marginTop":"auto","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"clamp(64px,7vw,104px)","lineHeight":".85","color":"#5980a6"}}>CR</span>
              <h3 style={{"margin":"0","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"28px","textTransform":"uppercase","lineHeight":"1"}}>Costa Rica</h3>
              <div style={{"display":"flex","flexWrap":"wrap","gap":"6px"}}>
                <span style={{"fontSize":"12px","padding":"3px 10px","background":"#d6ebff","color":"#2c455d"}}>Importación</span>
                <span style={{"fontSize":"12px","padding":"3px 10px","background":"#d6ebff","color":"#2c455d"}}>Exportación</span>
                <span style={{"fontSize":"12px","padding":"3px 10px","background":"#d6ebff","color":"#2c455d"}}>Distribución</span>
              </div>
            </div>
            <div className="ew-16" data-reveal="" data-delay="160" style={{"padding":"28px","borderRight":"1px solid rgba(29,31,32,.2)","borderBottom":"1px solid rgba(29,31,32,.2)","display":"flex","flexDirection":"column","gap":"14px","minHeight":"300px","transition":"background .3s"}}>
              <div style={{"display":"flex","justifyContent":"space-between","fontFamily":"'Barlow Condensed',sans-serif","fontSize":"14px","letterSpacing":".16em","color":"#416180"}}><span>NI</span><span>MGA</span></div>
              <span style={{"marginTop":"auto","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"clamp(64px,7vw,104px)","lineHeight":".85","color":"#5980a6"}}>NI</span>
              <h3 style={{"margin":"0","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"28px","textTransform":"uppercase","lineHeight":"1"}}>Nicaragua</h3>
              <div style={{"display":"flex","flexWrap":"wrap","gap":"6px"}}>
                <span style={{"fontSize":"12px","padding":"3px 10px","background":"#d6ebff","color":"#2c455d"}}>Importación</span>
                <span style={{"fontSize":"12px","padding":"3px 10px","background":"#d6ebff","color":"#2c455d"}}>Exportación</span>
                <span style={{"fontSize":"12px","padding":"3px 10px","background":"#d6ebff","color":"#2c455d"}}>Distribución</span>
              </div>
            </div>
            <div className="ew-17" data-reveal="" data-delay="240" style={{"padding":"28px","borderRight":"1px solid rgba(29,31,32,.2)","borderBottom":"1px solid rgba(29,31,32,.2)","display":"flex","flexDirection":"column","gap":"14px","minHeight":"300px","transition":"background .3s"}}>
              <div style={{"display":"flex","justifyContent":"space-between","fontFamily":"'Barlow Condensed',sans-serif","fontSize":"14px","letterSpacing":".16em","color":"#416180"}}><span>US</span><span>MIA</span></div>
              <span style={{"marginTop":"auto","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"clamp(64px,7vw,104px)","lineHeight":".85","color":"#5980a6"}}>US</span>
              <h3 style={{"margin":"0","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"28px","textTransform":"uppercase","lineHeight":"1"}}>Estados Unidos</h3>
              <div style={{"display":"flex","flexWrap":"wrap","gap":"6px"}}>
                <span style={{"fontSize":"12px","padding":"3px 10px","background":"#d6ebff","color":"#2c455d"}}>Compras</span>
                <span style={{"fontSize":"12px","padding":"3px 10px","background":"#d6ebff","color":"#2c455d"}}>Consolidación</span>
                <span style={{"fontSize":"12px","padding":"3px 10px","background":"#d6ebff","color":"#2c455d"}}>Exportación</span>
              </div>
            </div>
            <div data-reveal="" data-delay="320" style={{"padding":"28px","borderRight":"1px solid rgba(29,31,32,.2)","borderBottom":"1px solid rgba(29,31,32,.2)","display":"flex","flexDirection":"column","gap":"14px","minHeight":"300px","backgroundImage":"repeating-linear-gradient(135deg,rgba(89,128,166,.09) 0 1px,transparent 1px 12px)"}}>
              <div style={{"display":"flex","justifyContent":"space-between","fontFamily":"'Barlow Condensed',sans-serif","fontSize":"14px","letterSpacing":".16em","color":"#416180"}}><span>+</span><span>Próximamente</span></div>
              <span style={{"marginTop":"auto","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"400","fontSize":"clamp(64px,7vw,104px)","lineHeight":".85","color":"#94bce3"}}>+</span>
              <h3 style={{"margin":"0","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"28px","textTransform":"uppercase","lineHeight":"1"}}>Nuevos mercados</h3>
              <p style={{"margin":"0","fontSize":"14px","color":"#5d5d60"}}>Seguimos expandiendo nuestras operaciones.</p>
            </div>
          </div>
        </div>
      </section>
      <section id="proceso" data-process="" data-screen-label="Proceso" style={{"position":"relative","height":"340vh","background":"#1d2d3d","color":"#f2f2f3"}}>
        <div style={{"position":"sticky","top":"0","height":"100svh","overflow":"hidden","display":"flex","flexDirection":"column","padding":"clamp(96px,13vh,140px) clamp(20px,4vw,56px) clamp(32px,6vh,64px)"}}>
          <div style={{"position":"absolute","inset":"0","backgroundImage":"linear-gradient(rgba(181,217,253,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(181,217,253,.05) 1px,transparent 1px)","backgroundSize":"88px 88px","pointerEvents":"none"}} />
          <div style={{"position":"relative","maxWidth":"1440px","width":"100%","margin":"0 auto","display":"flex","flexWrap":"wrap","justifyContent":"space-between","alignItems":"flex-end","gap":"24px"}}>
            <div style={{"display":"flex","flexDirection":"column","gap":"16px"}}>
              <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"14px","letterSpacing":".22em","textTransform":"uppercase","color":"#94bce3"}}>03 — Cómo trabajamos</span>
              <h2 style={{"margin":"0","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"clamp(40px,5.4vw,84px)","lineHeight":".92","textTransform":"uppercase","letterSpacing":"-.01em"}}>De origen a destino</h2>
            </div>
            <div style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"clamp(56px,7vw,112px)","fontWeight":"300","lineHeight":".8","color":"#94bce3","fontVariantNumeric":"tabular-nums"}}>
              <span data-step-count="">01</span>
              <span style={{"color":"rgba(181,217,253,.35)"}}>/04</span>
            </div>
          </div>
          <div style={{"position":"relative","flex":"1","maxWidth":"1440px","width":"100%","margin":"0 auto","display":"flex","flexDirection":"column","justifyContent":"center","minHeight":"120px"}}>
            <div style={{"position":"relative","margin":"0 clamp(40px,6vw,90px)"}}>
              <div data-track="" style={{"position":"relative","height":"1px","background":"rgba(181,217,253,.25)"}}>
                <div data-fill="" style={{"position":"absolute","inset":"0","background":"#b5d9fd","transformOrigin":"left","transform":"scaleX(0)"}} />
                <span data-node="" style={{"position":"absolute","left":"0","top":"-7px","width":"15px","height":"15px","marginLeft":"-7px","border":"1px solid rgba(181,217,253,.4)","background":"#1d2d3d","transform":"rotate(45deg)","transition":"background .3s,border-color .3s"}} />
                <span data-node="" style={{"position":"absolute","left":"33.333%","top":"-7px","width":"15px","height":"15px","marginLeft":"-7px","border":"1px solid rgba(181,217,253,.4)","background":"#1d2d3d","transform":"rotate(45deg)","transition":"background .3s,border-color .3s"}} />
                <span data-node="" style={{"position":"absolute","left":"66.666%","top":"-7px","width":"15px","height":"15px","marginLeft":"-7px","border":"1px solid rgba(181,217,253,.4)","background":"#1d2d3d","transform":"rotate(45deg)","transition":"background .3s,border-color .3s"}} />
                <span data-node="" style={{"position":"absolute","left":"100%","top":"-7px","width":"15px","height":"15px","marginLeft":"-7px","border":"1px solid rgba(181,217,253,.4)","background":"#1d2d3d","transform":"rotate(45deg)","transition":"background .3s,border-color .3s"}} />
                <div data-box="" style={{"position":"absolute","left":"0","bottom":"24px","width":"0","height":"0","willChange":"transform"}}>
                  <div style={{"position":"absolute","left":"0","bottom":"0","width":"0","height":"0","perspective":"900px"}}>
                    <div style={{"position":"absolute","left":"-150px","bottom":"-14px","width":"300px","height":"22px","background":"radial-gradient(closest-side,rgba(0,0,0,.45),rgba(0,0,0,0))","filter":"blur(2px)"}} />
                    <div data-box-rot="" style={{"position":"absolute","left":"0","bottom":"60px","width":"0","height":"0","transformStyle":"preserve-3d","transform":"rotateX(-18deg) rotateY(-32deg)"}}>
                      <div style={{"position":"absolute","width":"260px","height":"110px","margin":"-55px 0 0 -130px","transform":"translateZ(55px)","background":"#5980a6","backgroundImage":"repeating-linear-gradient(90deg,rgba(255,255,255,.12) 0 2px,rgba(0,0,0,.12) 2px 4px,transparent 4px 13px)","border":"2px solid #416180","display":"flex","alignItems":"center","justifyContent":"center","backfaceVisibility":"hidden"}}>
                        <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"700","fontSize":"26px","letterSpacing":".18em","color":"#eef6ff","background":"#416180","padding":"2px 10px"}}>EUSSE WORLD</span>
                      </div>
                      <div style={{"position":"absolute","width":"260px","height":"110px","margin":"-55px 0 0 -130px","transform":"rotateY(180deg) translateZ(55px)","background":"#4d7194","backgroundImage":"repeating-linear-gradient(90deg,rgba(255,255,255,.1) 0 2px,rgba(0,0,0,.12) 2px 4px,transparent 4px 13px)","border":"2px solid #416180","backfaceVisibility":"hidden"}} />
                      <div style={{"position":"absolute","width":"110px","height":"110px","margin":"-55px 0 0 -55px","transform":"rotateY(90deg) translateZ(130px)","background":"#416180","border":"2px solid #2c455d","display":"grid","gridTemplateColumns":"1fr 1fr","gap":"4px","padding":"8px","backfaceVisibility":"hidden"}}>
                        <span style={{"border":"1px solid rgba(238,246,255,.3)","backgroundImage":"repeating-linear-gradient(90deg,rgba(255,255,255,.08) 0 2px,transparent 2px 8px)"}} />
                        <span style={{"border":"1px solid rgba(238,246,255,.3)","backgroundImage":"repeating-linear-gradient(90deg,rgba(255,255,255,.08) 0 2px,transparent 2px 8px)"}} />
                      </div>
                      <div style={{"position":"absolute","width":"110px","height":"110px","margin":"-55px 0 0 -55px","transform":"rotateY(-90deg) translateZ(130px)","background":"#416180","border":"2px solid #2c455d","backfaceVisibility":"hidden"}} />
                      <div style={{"position":"absolute","width":"260px","height":"110px","margin":"-55px 0 0 -130px","transform":"rotateX(90deg) translateZ(55px)","background":"#749dc4","backgroundImage":"repeating-linear-gradient(90deg,rgba(255,255,255,.14) 0 1px,transparent 1px 13px)","border":"2px solid #597ea3","backfaceVisibility":"hidden"}} />
                      <div style={{"position":"absolute","width":"260px","height":"110px","margin":"-55px 0 0 -130px","transform":"rotateX(-90deg) translateZ(55px)","background":"#2c455d","backfaceVisibility":"hidden"}} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{"position":"relative","maxWidth":"1440px","width":"100%","margin":"0 auto","display":"grid","gridTemplateColumns":"repeat(4,minmax(0,1fr))","gap":"clamp(10px,2vw,32px)"}}>
            <div data-step="" style={{"display":"flex","flexDirection":"column","gap":"8px","paddingTop":"18px","borderTop":"1px solid rgba(181,217,253,.25)","transition":"opacity .4s ease,transform .4s ease"}}>
              <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"14px","letterSpacing":".18em","color":"#94bce3"}}>01</span>
              <h3 style={{"margin":"0","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"clamp(15px,2vw,30px)","textTransform":"uppercase","lineHeight":"1","overflowWrap":"anywhere"}}>Diagnóstico y cotización</h3>
              <p style={{"margin":"0","fontSize":"clamp(12px,1.2vw,15px)","lineHeight":"1.4","color":"#d6ebff","textWrap":"pretty"}}>Definimos origen, destino, tipo de carga y tiempos de entrega.</p>
            </div>
            <div data-step="" style={{"display":"flex","flexDirection":"column","gap":"8px","paddingTop":"18px","borderTop":"1px solid rgba(181,217,253,.25)","opacity":".28","transition":"opacity .4s ease,transform .4s ease"}}>
              <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"14px","letterSpacing":".18em","color":"#94bce3"}}>02</span>
              <h3 style={{"margin":"0","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"clamp(15px,2vw,30px)","textTransform":"uppercase","lineHeight":"1","overflowWrap":"anywhere"}}>Compra y consolidación</h3>
              <p style={{"margin":"0","fontSize":"clamp(12px,1.2vw,15px)","lineHeight":"1.4","color":"#d6ebff","textWrap":"pretty"}}>Adquirimos, recibimos y agrupamos su mercancía en origen.</p>
            </div>
            <div data-step="" style={{"display":"flex","flexDirection":"column","gap":"8px","paddingTop":"18px","borderTop":"1px solid rgba(181,217,253,.25)","opacity":".28","transition":"opacity .4s ease,transform .4s ease"}}>
              <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"14px","letterSpacing":".18em","color":"#94bce3"}}>03</span>
              <h3 style={{"margin":"0","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"clamp(15px,2vw,30px)","textTransform":"uppercase","lineHeight":"1","overflowWrap":"anywhere"}}>Transporte y aduanas</h3>
              <p style={{"margin":"0","fontSize":"clamp(12px,1.2vw,15px)","lineHeight":"1.4","color":"#d6ebff","textWrap":"pretty"}}>Movemos la carga y gestionamos la nacionalización en destino.</p>
            </div>
            <div data-step="" style={{"display":"flex","flexDirection":"column","gap":"8px","paddingTop":"18px","borderTop":"1px solid rgba(181,217,253,.25)","opacity":".28","transition":"opacity .4s ease,transform .4s ease"}}>
              <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"14px","letterSpacing":".18em","color":"#94bce3"}}>04</span>
              <h3 style={{"margin":"0","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"clamp(15px,2vw,30px)","textTransform":"uppercase","lineHeight":"1","overflowWrap":"anywhere"}}>Entrega y distribución</h3>
              <p style={{"margin":"0","fontSize":"clamp(12px,1.2vw,15px)","lineHeight":"1.4","color":"#d6ebff","textWrap":"pretty"}}>Almacenamos y entregamos en el punto final, hasta la última milla.</p>
            </div>
          </div>
        </div>
      </section>
      <section id="contacto" data-screen-label="Contacto" style={{"position":"relative","padding":"clamp(100px,12vw,180px) clamp(20px,4vw,56px)"}}>
        <div style={{"maxWidth":"1440px","margin":"0 auto","display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(min(100%,420px),1fr))","gap":"64px clamp(40px,6vw,120px)","alignItems":"start"}}>
          <div data-reveal="" style={{"display":"flex","flexDirection":"column","gap":"22px","position":"sticky","top":"120px"}}>
            <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"14px","letterSpacing":".22em","textTransform":"uppercase","color":"#416180"}}>04 — Contacto</span>
            <h2 style={{"margin":"0","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"clamp(48px,6.4vw,104px)","lineHeight":".9","textTransform":"uppercase","letterSpacing":"-.01em"}}>Hablemos de su próxima operación.</h2>
            <p style={{"margin":"0","maxWidth":"440px","fontSize":"17px","color":"#5d5d60","textWrap":"pretty"}}>Cuéntenos qué necesita mover, comprar o almacenar. Un asesor le responde con una propuesta para su ruta.</p>
          </div>
          <form data-form="" data-reveal="" data-delay="120" style={{"position":"relative","border":"1px solid rgba(29,31,32,.16)","padding":"clamp(24px,3vw,44px)","display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(min(100%,220px),1fr))","gap":"22px"}}>
            <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","top":"-6px","left":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
            <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","top":"-6px","right":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
            <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","bottom":"-6px","left":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
            <svg width="11" height="11" viewBox="0 0 11 11" style={{"position":"absolute","bottom":"-6px","right":"-6px","color":"rgba(29,31,32,.5)"}}><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" /></svg>
            <label style={{"display":"flex","flexDirection":"column","gap":"8px","fontSize":"13px","letterSpacing":".04em","color":"#5d5d60"}}>
              Nombre
              <input className="ew-18" required name="nombre" placeholder="Nombre y apellido" style={{"height":"48px","padding":"0 14px","font":"inherit","fontSize":"16px","color":"#1d1f20","background":"#e9e9ea","border":"1px solid rgba(29,31,32,.16)","borderRadius":"0"}} />
            </label>
            <label style={{"display":"flex","flexDirection":"column","gap":"8px","fontSize":"13px","letterSpacing":".04em","color":"#5d5d60"}}>
              Empresa
              <input className="ew-19" name="empresa" placeholder="Nombre de la empresa" style={{"height":"48px","padding":"0 14px","font":"inherit","fontSize":"16px","color":"#1d1f20","background":"#e9e9ea","border":"1px solid rgba(29,31,32,.16)","borderRadius":"0"}} />
            </label>
            <label style={{"display":"flex","flexDirection":"column","gap":"8px","fontSize":"13px","letterSpacing":".04em","color":"#5d5d60"}}>
              Correo electrónico
              <input className="ew-20" required type="email" name="correo" placeholder="nombre@empresa.com" style={{"height":"48px","padding":"0 14px","font":"inherit","fontSize":"16px","color":"#1d1f20","background":"#e9e9ea","border":"1px solid rgba(29,31,32,.16)","borderRadius":"0"}} />
            </label>
            <label style={{"display":"flex","flexDirection":"column","gap":"8px","fontSize":"13px","letterSpacing":".04em","color":"#5d5d60"}}>
              Servicio 
              <select className="ew-21" name="servicio" style={{"height":"48px","padding":"0 14px","font":"inherit","fontSize":"16px","color":"#1d1f20","background":"#e9e9ea","border":"1px solid rgba(29,31,32,.16)","borderRadius":"0"}}>
                <option>Transporte internacional</option>
                <option>Importaciones y exportaciones</option>
                <option>Personal Shopper</option>
                <option>Abastecimiento comercial</option>
                <option>Almacenamiento y distribución</option>
                <option>Última milla</option>
              </select>
            </label>
            <label style={{"display":"flex","flexDirection":"column","gap":"8px","fontSize":"13px","letterSpacing":".04em","color":"#5d5d60"}}>
              Origen 
              <select className="ew-22" name="origen" style={{"height":"48px","padding":"0 14px","font":"inherit","fontSize":"16px","color":"#1d1f20","background":"#e9e9ea","border":"1px solid rgba(29,31,32,.16)","borderRadius":"0"}}>
                <option>Estados Unidos</option>
                <option>Colombia</option>
                <option>Costa Rica</option>
                <option>Nicaragua</option>
                <option>Otro</option>
              </select>
            </label>
            <label style={{"display":"flex","flexDirection":"column","gap":"8px","fontSize":"13px","letterSpacing":".04em","color":"#5d5d60"}}>
              Destino 
              <select className="ew-23" name="destino" style={{"height":"48px","padding":"0 14px","font":"inherit","fontSize":"16px","color":"#1d1f20","background":"#e9e9ea","border":"1px solid rgba(29,31,32,.16)","borderRadius":"0"}}>
                <option>Colombia</option>
                <option>Costa Rica</option>
                <option>Nicaragua</option>
                <option>Estados Unidos</option>
                <option>Otro</option>
              </select>
            </label>
            <label style={{"gridColumn":"1/-1","display":"flex","flexDirection":"column","gap":"8px","fontSize":"13px","letterSpacing":".04em","color":"#5d5d60"}}>
              Detalles de la carga
              <textarea className="ew-24" name="mensaje" rows={4} placeholder="Tipo de mercancía, volumen aproximado, fechas…" style={{"padding":"12px 14px","font":"inherit","fontSize":"16px","color":"#1d1f20","background":"#e9e9ea","border":"1px solid rgba(29,31,32,.16)","borderRadius":"0","resize":"vertical"}} />
            </label>
            <div style={{"gridColumn":"1/-1","display":"flex","flexWrap":"wrap","alignItems":"center","justifyContent":"space-between","gap":"16px"}}>
              <span style={{"fontSize":"13px","color":"#7a7a7d"}}>Respuesta en horario laboral.</span>
              <button className="ew-25 ew-26" type="submit" style={{"display":"inline-flex","alignItems":"center","gap":"12px","padding":"16px 26px","background":"#5980a6","color":"#f2f2f3","border":"1px solid #5980a6","borderRadius":"0","cursor":"pointer","fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"18px","letterSpacing":".08em","textTransform":"uppercase","transition":"background .2s"}}>
                Enviar solicitud
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </button>
            </div>
            <div data-sent="" style={{"display":"none","position":"absolute","inset":"0","background":"#f2f2f3","flexDirection":"column","alignItems":"center","justifyContent":"center","gap":"14px","textAlign":"center","padding":"32px"}}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#5980a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
              <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"32px","textTransform":"uppercase"}}>Solicitud recibida</span>
              <span style={{"fontSize":"15px","color":"#5d5d60","maxWidth":"320px"}}>Gracias. Un asesor de EUSSE WORLD se pondrá en contacto con usted.</span>
            </div>
          </form>
        </div>
      </section>
      <footer style={{"position":"relative","background":"#1d2d3d","color":"#d6ebff","overflow":"hidden"}}>
        <div style={{"maxWidth":"1440px","margin":"0 auto","padding":"72px clamp(20px,4vw,56px) 32px","display":"flex","flexDirection":"column","gap":"56px"}}>
          <div style={{"display":"flex","flexWrap":"wrap","justifyContent":"space-between","gap":"40px"}}>
            <div style={{"display":"flex","flexDirection":"column","gap":"14px","maxWidth":"360px"}}>
              <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"600","fontSize":"24px","letterSpacing":".14em","color":"#f2f2f3"}}>EUSSE<span style={{"color":"#94bce3","fontWeight":"400"}}> WORLD</span></span>
              <p style={{"margin":"0","fontSize":"15px","color":"#94bce3"}}>Compras internacionales y logística empresarial.</p>
            </div>
            <div style={{"display":"flex","flexWrap":"wrap","gap":"56px"}}>
              <div style={{"display":"flex","flexDirection":"column","gap":"10px","fontSize":"15px"}}>
                <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"13px","letterSpacing":".2em","textTransform":"uppercase","color":"#749dc4"}}>Operamos en</span>
                <span>Colombia</span>
                <span>Costa Rica</span>
                <span>Nicaragua</span>
                <span>Estados Unidos</span>
              </div>
              <div style={{"display":"flex","flexDirection":"column","gap":"10px","fontSize":"15px"}}>
                <span style={{"fontFamily":"'Barlow Condensed',sans-serif","fontSize":"13px","letterSpacing":".2em","textTransform":"uppercase","color":"#749dc4"}}>Navegación</span>
                <a className="ew-27" href="#servicios" style={{"color":"#d6ebff","textDecoration":"none"}}>Servicios</a>
                <a className="ew-28" href="#red" style={{"color":"#d6ebff","textDecoration":"none"}}>Red</a>
                <a className="ew-29" href="#proceso" style={{"color":"#d6ebff","textDecoration":"none"}}>Proceso</a>
                <a className="ew-30" href="#contacto" style={{"color":"#d6ebff","textDecoration":"none"}}>Contacto</a>
              </div>
            </div>
          </div>
          <div style={{"fontFamily":"'Barlow Condensed',sans-serif","fontWeight":"700","fontSize":"clamp(72px,16.5vw,290px)","lineHeight":".8","letterSpacing":"-.01em","color":"#2c455d","whiteSpace":"nowrap","textAlign":"center","userSelect":"none"}}>EUSSE WORLD</div>
          <div style={{"display":"flex","flexWrap":"wrap","justifyContent":"space-between","gap":"12px","paddingTop":"20px","borderTop":"1px solid rgba(181,217,253,.14)","fontSize":"13px","color":"#749dc4"}}>
            <span>© 2026 EUSSE WORLD. Todos los derechos reservados.</span>
            <span>Colombia · Costa Rica · Nicaragua · Estados Unidos</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
