'use client';
import React from 'react';
import './plataforma.css';
import { PlataformaLogic, type PlataformaProps } from './logic';

export type { PlataformaProps };

/**
 * EUSSE WORLD Mayorista — comerciantes (tienda, producto, carrito, checkout, pedidos)
 * y panel del proveedor (resumen, órdenes, catálogo PDF, estampados).
 */
export default class PlataformaMayorista extends PlataformaLogic {
  render() {
    const v: any = this.renderVals();
    return (
      <>
<div style={{ minHeight: "100vh", background: "#f2f2f3", fontSize: "15px", lineHeight: "1.5" }}>

{!!(v.isAuth) && (<>
  <div data-screen-label="01 Registro" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "minmax(0,5fr) minmax(0,6fr)" }}>
    <div style={{ position: "relative", background: "#1d2d3d", color: "#f2f2f3", padding: "48px 56px", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: "0", backgroundImage: "linear-gradient(rgba(181,217,253,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(181,217,253,.06) 1px,transparent 1px)", backgroundSize: "72px 72px" }} />
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ width: "34px", height: "34px", border: "1px solid rgba(181,217,253,.55)", display: "grid", placeItems: "center" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b5d9fd" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg></span>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "21px", letterSpacing: ".14em" }}>EUSSE<span style={{ color: "#94bce3", fontWeight: "400" }}> WORLD</span></span>
        <span style={{ marginLeft: "6px", fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", padding: "3px 8px", border: "1px solid rgba(181,217,253,.4)", color: "#b5d9fd" }}>Mayorista</span>
      </div>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "24px" }}>
        <h1 style={{ margin: "0", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "76px", lineHeight: ".9", textTransform: "uppercase", maxWidth: "9ch" }}>Ropa al por mayor, directo del proveedor.</h1>
        <p style={{ margin: "0", maxWidth: "420px", color: "#d6ebff", fontSize: "17px" }}>Compra camisetas, sudaderas, camisas, pantalones y tenis a proveedores verificados. Personaliza con estampado y recibe en tu tienda.</p>
        <div style={{ display: "flex", gap: "28px", paddingTop: "24px", borderTop: "1px solid rgba(181,217,253,.2)" }}>
          <div style={{ display: "flex", flexDirection: "column" }}><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "36px", fontWeight: "600", lineHeight: "1" }}>6</span><span style={{ fontSize: "13px", color: "#94bce3" }}>artículos mínimos por proveedor</span></div>
          <div style={{ display: "flex", flexDirection: "column" }}><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "36px", fontWeight: "600", lineHeight: "1" }}>4</span><span style={{ fontSize: "13px", color: "#94bce3" }}>países con operación</span></div>
        </div>
      </div>
      <span style={{ position: "relative", fontSize: "12px", color: "#749dc4" }}>Colombia · Costa Rica · Nicaragua · Estados Unidos</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px" }}>
      <div style={{ width: "100%", maxWidth: "520px", display: "flex", flexDirection: "column", gap: "28px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "13px", letterSpacing: ".2em", textTransform: "uppercase", color: "#416180" }}>{v.authEyebrow}</span>
          <h2 style={{ margin: "0", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "44px", lineHeight: "1", textTransform: "uppercase" }}>{v.authTitle}</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {(v.roleOpts || []).map((r: any, $index: number) => (<React.Fragment key={$index}>
            <button type="button" onClick={r.onClick} style={{ textAlign: "left", padding: "18px", display: "flex", flexDirection: "column", gap: "10px", cursor: "pointer", background: r.bg, color: r.fg, border: `1px solid ${r.bd}`, transition: "background .2s" }}>
              <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "22px", textTransform: "uppercase" }}>{r.label}</span><span style={{ width: "16px", height: "16px", border: `1px solid ${r.dot}`, display: "grid", placeItems: "center" }}><span style={{ width: "8px", height: "8px", background: r.dotFill }} /></span></span>
              <span style={{ fontSize: "14px", opacity: ".85" }}>{r.sub}</span>
            </button>
          </React.Fragment>))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {!!(v.isRegister) && (<>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#5d5d60" }}>Nombre completo<input placeholder="Laura Gómez" style={{ height: "44px", padding: "0 12px", font: "inherit", fontSize: "15px", color: "#1d1f20", background: "#e9e9ea", border: "1px solid rgba(29,31,32,.16)", borderRadius: "0" }} /></label>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#5d5d60" }}>{v.bizLabel}<input placeholder={v.bizPh} style={{ height: "44px", padding: "0 12px", font: "inherit", fontSize: "15px", color: "#1d1f20", background: "#e9e9ea", border: "1px solid rgba(29,31,32,.16)", borderRadius: "0" }} /></label>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#5d5d60" }}>País<select style={{ height: "44px", padding: "0 10px", font: "inherit", fontSize: "15px", color: "#1d1f20", background: "#e9e9ea", border: "1px solid rgba(29,31,32,.16)", borderRadius: "0" }}><option>Colombia</option><option>Costa Rica</option><option>Nicaragua</option><option>Estados Unidos</option></select></label>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#5d5d60" }}>Documento / NIT<input placeholder="900.123.456-7" style={{ height: "44px", padding: "0 12px", font: "inherit", fontSize: "15px", color: "#1d1f20", background: "#e9e9ea", border: "1px solid rgba(29,31,32,.16)", borderRadius: "0" }} /></label>
          </>)}
          <label style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#5d5d60" }}>Correo electrónico<input type="email" placeholder="nombre@empresa.com" style={{ height: "44px", padding: "0 12px", font: "inherit", fontSize: "15px", color: "#1d1f20", background: "#e9e9ea", border: "1px solid rgba(29,31,32,.16)", borderRadius: "0" }} /></label>
          <label style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#5d5d60" }}>Contraseña<input type="password" placeholder="Mínimo 8 caracteres" style={{ height: "44px", padding: "0 12px", font: "inherit", fontSize: "15px", color: "#1d1f20", background: "#e9e9ea", border: "1px solid rgba(29,31,32,.16)", borderRadius: "0" }} /></label>
        </div>
        <button className="ewp-1" type="button" onClick={v.submitAuth} style={{ height: "52px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", background: "#5980a6", color: "#f2f2f3", border: "1px solid #5980a6", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "18px", letterSpacing: ".08em", textTransform: "uppercase" }}>{v.authCta}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></button>
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", fontSize: "14px", color: "#5d5d60" }}><span>{v.authSwitchText}</span><button type="button" onClick={v.toggleAuthMode} style={{ background: "none", border: "0", padding: "0", color: "#416180", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}>{v.authSwitchCta}</button></div>
      </div>
    </div>
  </div>
</>)}

{!!(v.isMerchant) && (<>
  <header style={{ position: "sticky", top: "0", zIndex: "40", background: "#1d2d3d", color: "#f2f2f3", borderBottom: "1px solid #2c455d" }}>
    <div style={{ maxWidth: "1360px", margin: "0 auto", padding: "0 32px", height: "68px", display: "flex", alignItems: "center", gap: "28px" }}>
      <button type="button" onClick={v.goShop} style={{ display: "flex", alignItems: "center", gap: "10px", background: "none", border: "0", color: "#f2f2f3", cursor: "pointer", padding: "0", flex: "none" }}>
        <span style={{ width: "30px", height: "30px", border: "1px solid rgba(181,217,253,.55)", display: "grid", placeItems: "center" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b5d9fd" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg></span>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "19px", letterSpacing: ".14em" }}>EUSSE<span style={{ color: "#94bce3", fontWeight: "400" }}> WORLD</span></span>
      </button>
      <div style={{ flex: "1", maxWidth: "520px", position: "relative" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94bce3" strokeWidth="1.5" style={{ position: "absolute", left: "12px", top: "11px" }}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <input value={v.q} onChange={v.onSearch} placeholder="Buscar proveedor o prenda" style={{ width: "100%", height: "40px", padding: "0 12px 0 40px", font: "inherit", fontSize: "14px", color: "#f2f2f3", background: "#2c455d", border: "1px solid #416180", borderRadius: "0" }} />
      </div>
      <nav style={{ display: "flex", gap: "4px", marginLeft: "auto" }}>
        <button className="ewp-2" type="button" onClick={v.goShop} style={{ height: "40px", padding: "0 14px", background: "none", border: "0", color: "#d6ebff", cursor: "pointer", fontSize: "14px" }}>Proveedores</button>
        <button className="ewp-3" type="button" onClick={v.goOrders} style={{ height: "40px", padding: "0 14px", background: "none", border: "0", color: "#d6ebff", cursor: "pointer", fontSize: "14px" }}>Mis pedidos</button>
      </nav>
      <button className="ewp-4" type="button" onClick={v.goCart} style={{ position: "relative", height: "40px", display: "flex", alignItems: "center", gap: "8px", padding: "0 14px", background: "#5980a6", border: "1px solid #749dc4", color: "#f2f2f3", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "15px", letterSpacing: ".06em", textTransform: "uppercase" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>Carrito<span style={{ minWidth: "22px", height: "22px", padding: "0 6px", display: "grid", placeItems: "center", background: "#f2f2f3", color: "#1d2d3d", fontSize: "13px" }}>{v.cartQty}</span>
      </button>
      <span style={{ width: "36px", height: "36px", display: "grid", placeItems: "center", border: "1px solid #416180", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", color: "#b5d9fd" }}>LG</span>
    </div>
  </header>
</>)}

{!!(v.isShop) && (<>
  <main data-screen-label="02 Tienda" style={{ maxWidth: "1360px", margin: "0 auto", padding: "40px 32px 80px", display: "flex", flexDirection: "column", gap: "32px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "32px", flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "13px", letterSpacing: ".2em", textTransform: "uppercase", color: "#416180" }}>Tienda mayorista</span>
        <h1 style={{ margin: "0", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "56px", lineHeight: ".95", textTransform: "uppercase" }}>Proveedores</h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", border: "1px solid rgba(89,128,166,.4)", background: "#d6ebff", color: "#2c455d", fontSize: "14px", maxWidth: "460px" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flex: "none" }}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
        <span>Compra mínima de 6 artículos por proveedor. Puedes surtir modelos, colores y tallas.</span>
      </div>
    </div>
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingBottom: "24px", borderBottom: "1px solid rgba(29,31,32,.14)" }}>
      {(v.catChips || []).map((c: any, $index: number) => (<React.Fragment key={$index}>
        <button type="button" onClick={c.onClick} style={{ height: "36px", padding: "0 16px", cursor: "pointer", fontSize: "14px", background: c.bg, color: c.fg, border: `1px solid ${c.bd}` }}>{c.label}</button>
      </React.Fragment>))}
      <span style={{ marginLeft: "auto", alignSelf: "center", fontSize: "13px", color: "#7a7a7d" }}>{v.provCountText}</span>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "24px" }}>
      {(v.provCards || []).map((pv: any, $index: number) => (<React.Fragment key={$index}>
        <button className="ewp-5" type="button" onClick={pv.onOpen} style={{ textAlign: "left", padding: "0", cursor: "pointer", background: "#f2f2f3", border: "1px solid rgba(29,31,32,.16)", display: "flex", flexDirection: "column", color: "#1d1f20", transition: "border-color .2s,background .2s" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gridTemplateRows: "1fr 1fr", gap: "2px", height: "200px", width: "100%" }}>
            <div style={{ gridRow: "1/3", background: pv.c1, backgroundImage: "repeating-linear-gradient(135deg,rgba(255,255,255,.06) 0 1px,transparent 1px 10px)", display: "flex", alignItems: "flex-end", padding: "12px" }}><span style={{ fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase", color: pv.c1fg, opacity: ".8" }}>Foto de producto</span></div>
            <div style={{ background: pv.c2, backgroundImage: "repeating-linear-gradient(135deg,rgba(255,255,255,.06) 0 1px,transparent 1px 10px)" }} />
            <div style={{ background: pv.c3, backgroundImage: "repeating-linear-gradient(135deg,rgba(255,255,255,.06) 0 1px,transparent 1px 10px)" }} />
          </div>
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "26px", lineHeight: "1.05", textTransform: "uppercase" }}>{pv.name}</span><span style={{ fontSize: "13px", color: "#5d5d60" }}>{pv.loc}</span></div>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "13px", letterSpacing: ".14em", padding: "2px 8px", border: "1px solid rgba(29,31,32,.2)", color: "#416180" }}>{pv.country}</span>
            </div>
            <span style={{ fontSize: "14px", color: "#1d1f20" }}>{pv.cats}</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", paddingTop: "12px", borderTop: "1px solid rgba(29,31,32,.12)", fontSize: "12px", color: "#5d5d60" }}>
              <div style={{ display: "flex", flexDirection: "column" }}><span>Productos</span><span style={{ fontSize: "15px", color: "#1d1f20", fontWeight: "500" }}>{pv.count}</span></div>
              <div style={{ display: "flex", flexDirection: "column" }}><span>Despacho</span><span style={{ fontSize: "15px", color: "#1d1f20", fontWeight: "500" }}>{pv.lead}</span></div>
              <div style={{ display: "flex", flexDirection: "column" }}><span>Estampado</span><span style={{ fontSize: "15px", color: "#1d1f20", fontWeight: "500" }}>{pv.printShort}</span></div>
            </div>
          </div>
        </button>
      </React.Fragment>))}
    </div>
    {!!(v.noProvs) && (<><div style={{ padding: "64px", textAlign: "center", border: "1px dashed rgba(29,31,32,.25)", color: "#5d5d60" }}>No hay proveedores para esta búsqueda.</div></>)}
  </main>
</>)}

{!!(v.isProvider) && (<>
  <main data-screen-label="03 Proveedor" style={{ maxWidth: "1360px", margin: "0 auto", padding: "28px 32px 80px", display: "flex", flexDirection: "column", gap: "32px" }}>
    <div style={{ display: "flex", gap: "8px", fontSize: "13px", color: "#5d5d60" }}><button type="button" onClick={v.goShop} style={{ background: "none", border: "0", padding: "0", color: "#416180", cursor: "pointer" }}>Proveedores</button><span>/</span><span>{v.prov.name}</span></div>
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 380px", gap: "32px", alignItems: "stretch" }}>
      <div style={{ display: "flex", gap: "28px", padding: "32px", background: "#1d2d3d", color: "#f2f2f3" }}>
        <span style={{ width: "96px", height: "96px", flex: "none", display: "grid", placeItems: "center", border: "1px solid rgba(181,217,253,.4)", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "38px", color: "#b5d9fd" }}>{v.prov.initials}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", minWidth: "0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}><h1 style={{ margin: "0", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "48px", lineHeight: "1", textTransform: "uppercase" }}>{v.prov.name}</h1><span style={{ color: "#94bce3", fontSize: "14px" }}>{v.prov.loc} · Proveedor desde {v.prov.since}</span></div>
          <p style={{ margin: "0", maxWidth: "560px", color: "#d6ebff" }}>{v.prov.about}</p>
          <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", paddingTop: "14px", borderTop: "1px solid rgba(181,217,253,.2)", fontSize: "12px", color: "#94bce3" }}>
            <div style={{ display: "flex", flexDirection: "column" }}><span>Productos</span><span style={{ fontSize: "17px", color: "#f2f2f3" }}>{v.prov.count}</span></div>
            <div style={{ display: "flex", flexDirection: "column" }}><span>Despacho</span><span style={{ fontSize: "17px", color: "#f2f2f3" }}>{v.prov.lead}</span></div>
            <div style={{ display: "flex", flexDirection: "column" }}><span>Compra mínima</span><span style={{ fontSize: "17px", color: "#f2f2f3" }}>6 artículos</span></div>
            <button className="ewp-6" type="button" onClick={v.openPdf} style={{ marginLeft: "auto", alignSelf: "flex-end", display: "flex", alignItems: "center", gap: "8px", height: "38px", padding: "0 14px", background: "none", border: "1px solid rgba(181,217,253,.4)", color: "#d6ebff", cursor: "pointer", fontSize: "13px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>Ver catálogo PDF</button>
          </div>
        </div>
      </div>
      <div style={{ border: "1px solid rgba(29,31,32,.16)", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "13px", letterSpacing: ".2em", textTransform: "uppercase", color: "#416180" }}>Estampado de este proveedor</span>
        {!!(v.provPrint.on) && (<>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}><span style={{ fontSize: "12px", color: "#5d5d60" }}>Técnicas</span><div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{(v.provPrint.types || []).map((t: any, $index: number) => (<React.Fragment key={$index}><span style={{ fontSize: "13px", padding: "3px 10px", background: "#d6ebff", color: "#2c455d" }}>{t.label} · {t.extra}</span></React.Fragment>))}</div></div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}><span style={{ fontSize: "12px", color: "#5d5d60" }}>Tamaños</span><div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{(v.provPrint.sizes || []).map((t: any, $index: number) => (<React.Fragment key={$index}><span style={{ fontSize: "13px", padding: "3px 10px", border: "1px solid rgba(29,31,32,.2)" }}>{t.label}</span></React.Fragment>))}</div></div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}><span style={{ fontSize: "12px", color: "#5d5d60" }}>Ubicación</span><span style={{ fontSize: "14px" }}>{v.provPrint.placesText}</span></div>
        </>)}
        {!!(v.provPrint.off) && (<><p style={{ margin: "0", color: "#5d5d60", fontSize: "14px" }}>Este proveedor vende prendas sin personalización.</p></>)}
      </div>
    </div>
    {!!(v.provCart.has) && (<>
      <div style={{ display: "flex", alignItems: "center", gap: "20px", padding: "14px 20px", border: "1px solid rgba(29,31,32,.16)" }}>
        <span style={{ fontSize: "14px", whiteSpace: "nowrap" }}>Llevas <strong>{v.provCart.qty}</strong> de 6 artículos mínimos</span>
        <div style={{ flex: "1", height: "4px", background: "#e0e0e2" }}><div style={{ height: "4px", width: v.provCart.pct, background: v.provCart.bar, transition: "width .3s" }} /></div>
        <button type="button" onClick={v.goCart} style={{ background: "none", border: "0", padding: "0", color: "#416180", cursor: "pointer", fontSize: "14px", textDecoration: "underline", textUnderlineOffset: "3px" }}>Ver carrito</button>
      </div>
    </>)}
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
      {(v.provCatChips || []).map((c: any, $index: number) => (<React.Fragment key={$index}>
        <button type="button" onClick={c.onClick} style={{ height: "34px", padding: "0 14px", cursor: "pointer", fontSize: "14px", background: c.bg, color: c.fg, border: `1px solid ${c.bd}` }}>{c.label}</button>
      </React.Fragment>))}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "20px" }}>
      {(v.provProducts || []).map((p: any, $index: number) => (<React.Fragment key={$index}>
        <button className="ewp-7" type="button" onClick={p.onOpen} style={{ textAlign: "left", padding: "0", cursor: "pointer", background: "none", border: "1px solid rgba(29,31,32,.14)", display: "flex", flexDirection: "column", color: "#1d1f20", transition: "border-color .2s" }}>
          <div style={{ position: "relative", width: "100%", aspectRatio: "4/5", background: p.hex, backgroundImage: "repeating-linear-gradient(135deg,rgba(255,255,255,.07) 0 1px,transparent 1px 10px)", display: "flex", alignItems: "flex-end", padding: "12px" }}>
            <span style={{ fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase", color: p.fg, opacity: ".75" }}>Foto · {p.cat}</span>
            {!!(p.printable) && (<><span style={{ position: "absolute", top: "10px", left: "10px", fontSize: "11px", letterSpacing: ".08em", textTransform: "uppercase", padding: "3px 8px", background: "#f2f2f3", color: "#2c455d" }}>Personalizable</span></>)}
          </div>
          <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
            <span style={{ fontSize: "15px", fontWeight: "500", lineHeight: "1.3" }}>{p.name}</span>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "22px" }}>{p.priceText}</span>
              <span style={{ fontSize: "12px", color: "#5d5d60" }}>{p.sizeRange}</span>
            </div>
            <div style={{ display: "flex", gap: "5px" }}>{(p.dots || []).map((d: any, $index: number) => (<React.Fragment key={$index}><span title={d.n} style={{ width: "14px", height: "14px", background: d.hex, border: "1px solid rgba(29,31,32,.25)" }} /></React.Fragment>))}</div>
          </div>
        </button>
      </React.Fragment>))}
    </div>
  </main>
</>)}

{!!(v.isProduct) && (<>
  <main data-screen-label="04 Producto" style={{ maxWidth: "1360px", margin: "0 auto", padding: "28px 32px 80px", display: "flex", flexDirection: "column", gap: "24px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", gap: "8px", fontSize: "13px", color: "#5d5d60" }}><button type="button" onClick={v.goShop} style={{ background: "none", border: "0", padding: "0", color: "#416180", cursor: "pointer" }}>Proveedores</button><span>/</span><button type="button" onClick={v.goProv} style={{ background: "none", border: "0", padding: "0", color: "#416180", cursor: "pointer" }}>{v.prov.name}</button><span>/</span><span>{v.pd.name}</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", color: "#5d5d60" }}><span style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>Diseño</span><div style={{ display: "flex", border: "1px solid rgba(29,31,32,.2)" }}>{(v.pdVarOpts || []).map((v: any, $index: number) => (<React.Fragment key={$index}><button type="button" onClick={v.onClick} style={{ height: "30px", padding: "0 14px", border: "0", cursor: "pointer", fontSize: "13px", background: v.bg, color: v.fg }}>{v.label}</button></React.Fragment>))}</div></div>
    </div>

    {!!(v.pdIsA) && (<>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "48px", alignItems: "start" }}>
        <div style={{ position: "sticky", top: "96px", display: "grid", gridTemplateColumns: "72px minmax(0,1fr)", gap: "12px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {(v.colorOpts || []).map((c: any, $index: number) => (<React.Fragment key={$index}>
              <button type="button" onClick={c.onClick} title={c.n} style={{ width: "72px", aspectRatio: "4/5", padding: "0", cursor: "pointer", background: c.hex, border: `2px solid ${c.ring}` }} />
            </React.Fragment>))}
          </div>
          <div style={{ position: "relative", aspectRatio: "4/5", background: v.pdHex, backgroundImage: "repeating-linear-gradient(135deg,rgba(255,255,255,.07) 0 1px,transparent 1px 12px)", overflow: "hidden" }}>
            <span style={{ position: "absolute", left: "16px", bottom: "14px", fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", color: v.pdFg, opacity: ".75" }}>Foto del catálogo · {v.pdColorName}</span>
            {!!(v.cfg.print) && (<>
              <div style={{ position: "absolute", left: v.mock.left, top: v.mock.top, width: v.mock.w, aspectRatio: "1", border: `1px dashed ${v.pdFg}`, display: "grid", placeItems: "center", overflow: "hidden", background: "rgba(255,255,255,.08)" }}>
                {!!(v.cfg.hasFile) && (<><div style={{ width: "100%", height: "100%", backgroundImage: v.cfg.fileBg, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} /></>)}
                {!!(v.cfg.noFile) && (<><span style={{ fontSize: "11px", color: v.pdFg, textAlign: "center", padding: "4px" }}>Tu diseño</span></>)}
              </div>
            </>)}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "13px", letterSpacing: ".2em", textTransform: "uppercase", color: "#416180" }}>{v.pd.cat} · {v.prov.name}</span>
            <h1 style={{ margin: "0", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "48px", lineHeight: "1", textTransform: "uppercase" }}>{v.pd.name}</h1>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "34px" }}>{v.unitText}</span><span style={{ fontSize: "14px", color: "#5d5d60" }}>por unidad {v.unitNote}</span></div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={{ fontSize: "13px", color: "#5d5d60" }}>Color · <strong style={{ color: "#1d1f20", fontWeight: "500" }}>{v.pdColorName}</strong></span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>{(v.colorOpts || []).map((c: any, $index: number) => (<React.Fragment key={$index}><button type="button" onClick={c.onClick} style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", padding: "0 12px 0 6px", cursor: "pointer", background: c.bg, border: `1px solid ${c.bd}`, fontSize: "13px", color: "#1d1f20" }}><span style={{ width: "24px", height: "24px", background: c.hex, border: "1px solid rgba(29,31,32,.25)" }} />{c.n}</button></React.Fragment>))}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#5d5d60" }}><span>Cantidad por talla</span><span>{v.cfg.qtyText}</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: "8px" }}>
              {(v.sizeRows || []).map((z: any, $index: number) => (<React.Fragment key={$index}>
                <div style={{ border: `1px solid ${z.bd}`, background: z.bg, padding: "8px", display: "flex", flexDirection: "column", gap: "6px", alignItems: "center" }}>
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "18px" }}>{z.size}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><button type="button" onClick={z.dec} style={{ width: "28px", height: "28px", background: "#e9e9ea", border: "1px solid rgba(29,31,32,.16)", cursor: "pointer" }}>−</button><span style={{ minWidth: "24px", textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{z.qty}</span><button type="button" onClick={z.inc} style={{ width: "28px", height: "28px", background: "#e9e9ea", border: "1px solid rgba(29,31,32,.16)", cursor: "pointer" }}>+</button></div>
                </div>
              </React.Fragment>))}
            </div>
          </div>
          {!!(v.printAvail) && (<>
            <div style={{ border: "1px solid rgba(29,31,32,.16)", display: "flex", flexDirection: "column" }}>
              <button type="button" onClick={v.togglePrint} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", padding: "16px 18px", background: "none", border: "0", cursor: "pointer", textAlign: "left", color: "#1d1f20" }}>
                <span style={{ display: "flex", flexDirection: "column" }}><span style={{ fontWeight: "500" }}>Agregar estampado</span><span style={{ fontSize: "13px", color: "#5d5d60" }}>Técnicas y tamaños disponibles con {v.prov.name}</span></span>
                <span style={{ flex: "none", width: "44px", height: "24px", padding: "2px", background: v.tg.bg, border: `1px solid ${v.tg.bd}`, display: "flex", justifyContent: v.tg.jc, transition: "background .2s" }}><span style={{ width: "18px", height: "18px", background: v.tg.knob }} /></span>
              </button>
              {!!(v.cfg.print) && (<>
                <div style={{ padding: "4px 18px 18px", display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid rgba(29,31,32,.1)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "12px" }}><span style={{ fontSize: "13px", color: "#5d5d60" }}>Técnica</span><div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>{(v.typeOpts || []).map((o: any, $index: number) => (<React.Fragment key={$index}><button type="button" onClick={o.onClick} style={{ height: "38px", padding: "0 14px", cursor: "pointer", fontSize: "14px", background: o.bg, color: o.fg, border: `1px solid ${o.bd}` }}>{o.label} <span style={{ opacity: ".7", fontSize: "12px" }}>{o.extra}</span></button></React.Fragment>))}</div></div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}><span style={{ fontSize: "13px", color: "#5d5d60" }}>Tamaño</span><div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>{(v.sizeOpts || []).map((o: any, $index: number) => (<React.Fragment key={$index}><button type="button" onClick={o.onClick} style={{ height: "38px", padding: "0 14px", cursor: "pointer", fontSize: "14px", background: o.bg, color: o.fg, border: `1px solid ${o.bd}` }}>{o.label} <span style={{ opacity: ".7", fontSize: "12px" }}>{o.extra}</span></button></React.Fragment>))}</div></div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}><span style={{ fontSize: "13px", color: "#5d5d60" }}>Ubicación</span><div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>{(v.placeOpts || []).map((o: any, $index: number) => (<React.Fragment key={$index}><button type="button" onClick={o.onClick} style={{ height: "38px", padding: "0 14px", cursor: "pointer", fontSize: "14px", background: o.bg, color: o.fg, border: `1px solid ${o.bd}` }}>{o.label}</button></React.Fragment>))}</div></div>
                  <label style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px", border: "1px dashed rgba(89,128,166,.6)", background: "#ececef", cursor: "pointer" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5980a6" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></svg>
                    <span style={{ display: "flex", flexDirection: "column", flex: "1", minWidth: "0" }}><span style={{ fontSize: "14px", fontWeight: "500" }}>{v.cfg.fileLabel}</span><span style={{ fontSize: "12px", color: "#5d5d60" }}>PNG, JPG o SVG. Fondo transparente recomendado.</span></span>
                    <input type="file" accept="image/*" onChange={v.onPrintFile} style={{ display: "none" }} />
                  </label>
                </div>
              </>)}
            </div>
          </>)}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", paddingTop: "20px", borderTop: "1px solid rgba(29,31,32,.14)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span style={{ color: "#5d5d60" }}>{v.cfg.qtyText} × {v.unitText}</span><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "30px" }}>{v.lineText}</span></div>
            <span style={{ fontSize: "13px", color: v.minNote.color }}>{v.minNote.text}</span>
            {!!(v.canAdd) && (<><button className="ewp-8" type="button" onClick={v.addToCart} style={{ height: "52px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", background: "#5980a6", color: "#f2f2f3", border: "1px solid #5980a6", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "18px", letterSpacing: ".08em", textTransform: "uppercase" }}>Agregar al carrito</button></>)}
            {!!(v.cantAdd) && (<><button type="button" disabled style={{ height: "52px", background: "#d9d9dc", color: "#7a7a7d", border: "1px solid #d9d9dc", cursor: "not-allowed", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "18px", letterSpacing: ".08em", textTransform: "uppercase" }}>Elige al menos una talla</button></>)}
          </div>
        </div>
      </div>
    </>)}

    {!!(v.pdIsB) && (<>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,7fr) minmax(0,5fr)", gap: "40px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0", border: "1px solid rgba(29,31,32,.16)" }}>
          <div style={{ padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "16px", borderBottom: "1px solid rgba(29,31,32,.16)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "13px", letterSpacing: ".2em", textTransform: "uppercase", color: "#416180" }}>{v.pd.cat} · {v.prov.name}</span><h1 style={{ margin: "0", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "40px", lineHeight: "1", textTransform: "uppercase" }}>{v.pd.name}</h1></div>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "28px", whiteSpace: "nowrap" }}>{v.basePriceText} <span style={{ fontFamily: "'Barlow',sans-serif", fontWeight: "400", fontSize: "13px", color: "#5d5d60" }}>/ u.</span></span>
          </div>
          {(v.steps || []).map((st: any, $index: number) => (<React.Fragment key={$index}>
            <div style={{ borderBottom: "1px solid rgba(29,31,32,.12)" }}>
              <button type="button" onClick={st.onClick} style={{ width: "100%", display: "flex", alignItems: "center", gap: "16px", padding: "18px 28px", background: "none", border: "0", cursor: "pointer", textAlign: "left", color: "#1d1f20" }}>
                <span style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "16px", background: st.nbg, color: st.nfg, border: `1px solid ${st.nbd}` }}>{st.n}</span>
                <span style={{ display: "flex", flexDirection: "column", flex: "1" }}><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "20px", textTransform: "uppercase" }}>{st.title}</span><span style={{ fontSize: "13px", color: "#5d5d60" }}>{st.summary}</span></span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5d5d60" strokeWidth="1.5" style={{ transform: `rotate(${st.rot})`, transition: "transform .2s" }}><path d="m6 9 6 6 6-6" /></svg>
              </button>
            </div>
          </React.Fragment>))}
          {!!(v.stepIs1) && (<>
            <div style={{ padding: "24px 28px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "12px", background: "#ececef" }}>
              {(v.colorOpts || []).map((c: any, $index: number) => (<React.Fragment key={$index}><button type="button" onClick={c.onClick} style={{ padding: "0", cursor: "pointer", background: "#f2f2f3", border: `2px solid ${c.ring}`, display: "flex", flexDirection: "column", textAlign: "left", color: "#1d1f20" }}><span style={{ width: "100%", height: "80px", background: c.hex }} /><span style={{ padding: "8px 10px", fontSize: "13px" }}>{c.n}</span></button></React.Fragment>))}
              <div style={{ gridColumn: "1/-1", display: "flex", justifyContent: "flex-end" }}><button type="button" onClick={v.toStep2} style={{ height: "42px", padding: "0 20px", background: "#1d2d3d", color: "#f2f2f3", border: "0", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "15px", letterSpacing: ".08em", textTransform: "uppercase" }}>Continuar a tallas</button></div>
            </div>
          </>)}
          {!!(v.stepIs2) && (<>
            <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "16px", background: "#ececef" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(96px,1fr))", borderTop: "1px solid rgba(29,31,32,.16)", borderLeft: "1px solid rgba(29,31,32,.16)" }}>
                {(v.sizeRows || []).map((z: any, $index: number) => (<React.Fragment key={$index}>
                  <div style={{ padding: "12px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", borderRight: "1px solid rgba(29,31,32,.16)", borderBottom: "1px solid rgba(29,31,32,.16)", background: z.bg }}>
                    <span style={{ fontSize: "12px", color: "#5d5d60" }}>Talla {z.size}</span>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "30px", lineHeight: "1", fontVariantNumeric: "tabular-nums" }}>{z.qty}</span>
                    <div style={{ display: "flex", gap: "4px" }}><button type="button" onClick={z.dec} style={{ width: "30px", height: "28px", background: "#f2f2f3", border: "1px solid rgba(29,31,32,.16)", cursor: "pointer" }}>−</button><button type="button" onClick={z.inc} style={{ width: "30px", height: "28px", background: "#f2f2f3", border: "1px solid rgba(29,31,32,.16)", cursor: "pointer" }}>+</button></div>
                  </div>
                </React.Fragment>))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: "8px" }}><button type="button" onClick={v.fillCurve} style={{ height: "36px", padding: "0 12px", background: "none", border: "1px solid rgba(29,31,32,.2)", cursor: "pointer", fontSize: "13px" }}>Curva surtida (S–XL)</button><button type="button" onClick={v.clearQty} style={{ height: "36px", padding: "0 12px", background: "none", border: "1px solid rgba(29,31,32,.2)", cursor: "pointer", fontSize: "13px" }}>Limpiar</button></div>
                <button type="button" onClick={v.toStep3} style={{ height: "42px", padding: "0 20px", background: "#1d2d3d", color: "#f2f2f3", border: "0", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "15px", letterSpacing: ".08em", textTransform: "uppercase" }}>{v.step2Next}</button>
              </div>
            </div>
          </>)}
          {!!(v.stepIs3) && (<>
            <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "18px", background: "#ececef" }}>
              {!!(v.printAvail) && (<>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <button type="button" onClick={v.printOff} style={{ padding: "14px", textAlign: "left", cursor: "pointer", background: v.pOff.bg, color: v.pOff.fg, border: `1px solid ${v.pOff.bd}` }}><span style={{ display: "block", fontWeight: "500" }}>Sin estampado</span><span style={{ fontSize: "13px", opacity: ".8" }}>Prenda lisa</span></button>
                  <button type="button" onClick={v.printOnFn} style={{ padding: "14px", textAlign: "left", cursor: "pointer", background: v.pOn.bg, color: v.pOn.fg, border: `1px solid ${v.pOn.bd}` }}><span style={{ display: "block", fontWeight: "500" }}>Con estampado</span><span style={{ fontSize: "13px", opacity: ".8" }}>Sube tu diseño</span></button>
                </div>
                {!!(v.cfg.print) && (<>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#5d5d60" }}>Técnica<select onChange={v.onTypeSel} value={v.cfg.type} style={{ height: "42px", padding: "0 10px", font: "inherit", fontSize: "14px", color: "#1d1f20", background: "#f2f2f3", border: "1px solid rgba(29,31,32,.16)", borderRadius: "0" }}>{(v.typeOpts || []).map((o: any, $index: number) => (<React.Fragment key={$index}><option value={o.i}>{o.label} ({o.extra})</option></React.Fragment>))}</select></label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#5d5d60" }}>Tamaño<select onChange={v.onSizeSel} value={v.cfg.size} style={{ height: "42px", padding: "0 10px", font: "inherit", fontSize: "14px", color: "#1d1f20", background: "#f2f2f3", border: "1px solid rgba(29,31,32,.16)", borderRadius: "0" }}>{(v.sizeOpts || []).map((o: any, $index: number) => (<React.Fragment key={$index}><option value={o.i}>{o.label} ({o.extra})</option></React.Fragment>))}</select></label>
                    <div style={{ gridColumn: "1/-1", display: "flex", gap: "8px", flexWrap: "wrap" }}>{(v.placeOpts || []).map((o: any, $index: number) => (<React.Fragment key={$index}><button type="button" onClick={o.onClick} style={{ height: "36px", padding: "0 14px", cursor: "pointer", fontSize: "13px", background: o.bg, color: o.fg, border: `1px solid ${o.bd}` }}>{o.label}</button></React.Fragment>))}</div>
                    <label style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: "14px", padding: "16px", border: "1px dashed rgba(89,128,166,.6)", background: "#f2f2f3", cursor: "pointer" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5980a6" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></svg>
                      <span style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: "14px", fontWeight: "500" }}>{v.cfg.fileLabel}</span><span style={{ fontSize: "12px", color: "#5d5d60" }}>PNG, JPG o SVG</span></span>
                      <input type="file" accept="image/*" onChange={v.onPrintFile} style={{ display: "none" }} />
                    </label>
                  </div>
                </>)}
              </>)}
              {!!(v.printNA) && (<><p style={{ margin: "0", color: "#5d5d60" }}>{v.prov.name} no ofrece estampado para este producto.</p></>)}
            </div>
          </>)}
        </div>

        <div style={{ position: "sticky", top: "96px", display: "flex", flexDirection: "column", border: "1px solid rgba(29,31,32,.16)" }}>
          <div style={{ position: "relative", aspectRatio: "1", background: v.pdHex, backgroundImage: "repeating-linear-gradient(135deg,rgba(255,255,255,.07) 0 1px,transparent 1px 12px)", overflow: "hidden" }}>
            <span style={{ position: "absolute", left: "16px", bottom: "14px", fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", color: v.pdFg, opacity: ".75" }}>Vista previa · {v.pdColorName}</span>
            {!!(v.cfg.print) && (<>
              <div style={{ position: "absolute", left: v.mock.left, top: v.mock.top, width: v.mock.w, aspectRatio: "1", border: `1px dashed ${v.pdFg}`, display: "grid", placeItems: "center", overflow: "hidden", background: "rgba(255,255,255,.08)", transition: "all .3s" }}>
                {!!(v.cfg.hasFile) && (<><div style={{ width: "100%", height: "100%", backgroundImage: v.cfg.fileBg, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} /></>)}
                {!!(v.cfg.noFile) && (<><span style={{ fontSize: "11px", color: v.pdFg, textAlign: "center", padding: "4px" }}>{v.cfg.sizeLabel}</span></>)}
              </div>
            </>)}
          </div>
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#5d5d60" }}>Color</span><span>{v.pdColorName}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}><span style={{ color: "#5d5d60" }}>Tallas</span><span style={{ textAlign: "right" }}>{v.cfg.sizesSummary}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#5d5d60" }}>Estampado</span><span>{v.cfg.printSummary}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#5d5d60" }}>Precio unitario</span><span>{v.unitText}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: "12px", borderTop: "1px solid rgba(29,31,32,.14)" }}><span>{v.cfg.qtyText}</span><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "30px" }}>{v.lineText}</span></div>
            <span style={{ fontSize: "13px", color: v.minNote.color }}>{v.minNote.text}</span>
            {!!(v.canAdd) && (<><button className="ewp-9" type="button" onClick={v.addToCart} style={{ height: "50px", background: "#5980a6", color: "#f2f2f3", border: "1px solid #5980a6", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "17px", letterSpacing: ".08em", textTransform: "uppercase" }}>Agregar al carrito</button></>)}
            {!!(v.cantAdd) && (<><button type="button" disabled style={{ height: "50px", background: "#d9d9dc", color: "#7a7a7d", border: "1px solid #d9d9dc", cursor: "not-allowed", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "17px", letterSpacing: ".08em", textTransform: "uppercase" }}>Elige al menos una talla</button></>)}
          </div>
        </div>
      </div>
    </>)}
  </main>
</>)}

{!!(v.isCart) && (<>
  <main data-screen-label="05 Carrito" style={{ maxWidth: "1360px", margin: "0 auto", padding: "40px 32px 80px", display: "grid", gridTemplateColumns: "minmax(0,1fr) 380px", gap: "40px", alignItems: "start" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "13px", letterSpacing: ".2em", textTransform: "uppercase", color: "#416180" }}>Carrito</span><h1 style={{ margin: "0", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "48px", lineHeight: "1", textTransform: "uppercase" }}>{v.cartTitle}</h1></div>
      {!!(v.cartEmpty) && (<>
        <div style={{ padding: "64px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", border: "1px dashed rgba(29,31,32,.25)", textAlign: "center" }}><span style={{ color: "#5d5d60" }}>Tu carrito está vacío.</span><button type="button" onClick={v.goShop} style={{ height: "44px", padding: "0 20px", background: "#5980a6", color: "#f2f2f3", border: "0", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "16px", letterSpacing: ".08em", textTransform: "uppercase" }}>Ver proveedores</button></div>
      </>)}
      {(v.groups || []).map((g: any, $index: number) => (<React.Fragment key={$index}>
        <section style={{ border: "1px solid rgba(29,31,32,.16)" }}>
          <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: "12px", background: "#e9e9ea", borderBottom: "1px solid rgba(29,31,32,.14)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><span style={{ width: "36px", height: "36px", display: "grid", placeItems: "center", background: "#1d2d3d", color: "#b5d9fd", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600" }}>{g.initials}</span><span style={{ display: "flex", flexDirection: "column" }}><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "20px", textTransform: "uppercase", lineHeight: "1.1" }}>{g.name}</span><span style={{ fontSize: "12px", color: "#5d5d60" }}>{g.loc}</span></span></div>
              <button type="button" onClick={g.addMore} style={{ background: "none", border: "0", padding: "0", color: "#416180", cursor: "pointer", fontSize: "13px", textDecoration: "underline", textUnderlineOffset: "3px" }}>Agregar más de este proveedor</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}><div style={{ flex: "1", height: "4px", background: "#d4d4d7" }}><div style={{ height: "4px", width: g.pct, background: g.bar, transition: "width .3s" }} /></div><span style={{ fontSize: "13px", color: g.noteColor, whiteSpace: "nowrap" }}>{g.note}</span></div>
          </div>
          {(g.items || []).map((it: any, $index: number) => (<React.Fragment key={$index}>
            <div style={{ display: "grid", gridTemplateColumns: "72px minmax(0,1fr) auto auto", gap: "18px", alignItems: "center", padding: "16px 22px", borderBottom: "1px solid rgba(29,31,32,.1)" }}>
              <span style={{ position: "relative", width: "72px", aspectRatio: "4/5", background: it.hex, overflow: "hidden", display: "grid", placeItems: "center" }}>{!!(it.hasFile) && (<><span style={{ width: "50%", height: "50%", backgroundImage: it.fileBg, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} /></>)}</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: "0" }}><span style={{ fontWeight: "500" }}>{it.name}</span><span style={{ fontSize: "13px", color: "#5d5d60" }}>{it.colorName} · {it.sizesText}</span><span style={{ fontSize: "13px", color: "#416180" }}>{it.printText}</span></div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", fontSize: "13px", color: "#5d5d60" }}><span>{it.qty} u. × {it.unitText}</span><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "20px", color: "#1d1f20" }}>{it.totalText}</span></div>
              <button className="ewp-10" type="button" onClick={it.remove} title="Quitar" style={{ width: "34px", height: "34px", display: "grid", placeItems: "center", background: "none", border: "1px solid rgba(29,31,32,.16)", cursor: "pointer", color: "#5d5d60" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></button>
            </div>
          </React.Fragment>))}
          <div style={{ padding: "14px 22px", display: "flex", justifyContent: "flex-end", gap: "12px", fontSize: "14px" }}><span style={{ color: "#5d5d60" }}>Subtotal proveedor</span><strong style={{ fontWeight: "600" }}>{g.subtotalText}</strong></div>
        </section>
      </React.Fragment>))}
    </div>
    <aside style={{ position: "sticky", top: "96px", border: "1px solid rgba(29,31,32,.16)", padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "22px", textTransform: "uppercase" }}>Resumen</span>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}><span style={{ color: "#5d5d60" }}>Artículos</span><span>{v.cartQty}</span></div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}><span style={{ color: "#5d5d60" }}>Proveedores</span><span>{v.groupCount}</span></div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}><span style={{ color: "#5d5d60" }}>Productos</span><span>{v.cartSubtotalText}</span></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: "14px", borderTop: "1px solid rgba(29,31,32,.14)" }}><span>Subtotal</span><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "32px" }}>{v.cartSubtotalText}</span></div>
      <span style={{ fontSize: "12px", color: "#7a7a7d" }}>El envío se calcula en el siguiente paso según la dirección.</span>
      {!!(v.cartOk) && (<><button className="ewp-11" type="button" onClick={v.goCheckout} style={{ height: "52px", background: "#5980a6", color: "#f2f2f3", border: "1px solid #5980a6", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "18px", letterSpacing: ".08em", textTransform: "uppercase" }}>Continuar al pago</button></>)}
      {!!(v.cartBlocked) && (<><div style={{ display: "flex", flexDirection: "column", gap: "8px" }}><button type="button" disabled style={{ height: "52px", background: "#d9d9dc", color: "#7a7a7d", border: "1px solid #d9d9dc", cursor: "not-allowed", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "18px", letterSpacing: ".08em", textTransform: "uppercase" }}>Continuar al pago</button><span style={{ fontSize: "13px", color: "#8a4b1f" }}>{v.blockedText}</span></div></>)}
    </aside>
  </main>
</>)}

{!!(v.isCheckout) && (<>
  <main data-screen-label="06 Checkout" style={{ maxWidth: "1360px", margin: "0 auto", padding: "40px 32px 80px", display: "grid", gridTemplateColumns: "minmax(0,1fr) 400px", gap: "40px", alignItems: "start" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <div style={{ display: "flex", gap: "8px", fontSize: "13px", color: "#5d5d60" }}><button type="button" onClick={v.goCart} style={{ background: "none", border: "0", padding: "0", color: "#416180", cursor: "pointer" }}>Carrito</button><span>/</span><span>Pago</span></div>
      <section style={{ border: "1px solid rgba(29,31,32,.16)", padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><span style={{ width: "28px", height: "28px", display: "grid", placeItems: "center", background: "#1d2d3d", color: "#f2f2f3", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600" }}>1</span><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "22px", textTransform: "uppercase" }}>Dirección de entrega</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#5d5d60" }}>Nombre de quien recibe<input placeholder="Laura Gómez" style={{ height: "44px", padding: "0 12px", font: "inherit", fontSize: "15px", color: "#1d1f20", background: "#e9e9ea", border: "1px solid rgba(29,31,32,.16)", borderRadius: "0" }} /></label>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#5d5d60" }}>Teléfono<input placeholder="+57 300 000 0000" style={{ height: "44px", padding: "0 12px", font: "inherit", fontSize: "15px", color: "#1d1f20", background: "#e9e9ea", border: "1px solid rgba(29,31,32,.16)", borderRadius: "0" }} /></label>
          <label style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#5d5d60" }}>Dirección<input placeholder="Calle 70 # 45-12, local 3" style={{ height: "44px", padding: "0 12px", font: "inherit", fontSize: "15px", color: "#1d1f20", background: "#e9e9ea", border: "1px solid rgba(29,31,32,.16)", borderRadius: "0" }} /></label>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#5d5d60" }}>País<select style={{ height: "44px", padding: "0 10px", font: "inherit", fontSize: "15px", color: "#1d1f20", background: "#e9e9ea", border: "1px solid rgba(29,31,32,.16)", borderRadius: "0" }}><option>Colombia</option><option>Costa Rica</option><option>Nicaragua</option><option>Estados Unidos</option></select></label>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#5d5d60" }}>Ciudad<input placeholder="Medellín" style={{ height: "44px", padding: "0 12px", font: "inherit", fontSize: "15px", color: "#1d1f20", background: "#e9e9ea", border: "1px solid rgba(29,31,32,.16)", borderRadius: "0" }} /></label>
          <label style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#5d5d60" }}>Indicaciones (opcional)<input placeholder="Horario de recibo, punto de referencia" style={{ height: "44px", padding: "0 12px", font: "inherit", fontSize: "15px", color: "#1d1f20", background: "#e9e9ea", border: "1px solid rgba(29,31,32,.16)", borderRadius: "0" }} /></label>
        </div>
      </section>
      <section style={{ border: "1px solid rgba(29,31,32,.16)", padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><span style={{ width: "28px", height: "28px", display: "grid", placeItems: "center", background: "#1d2d3d", color: "#f2f2f3", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600" }}>2</span><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "22px", textTransform: "uppercase" }}>Método de pago</span><span style={{ marginLeft: "auto", fontSize: "12px", color: "#5d5d60" }}>Procesado por Wompi</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
          {(v.payOpts || []).map((o: any, $index: number) => (<React.Fragment key={$index}><button type="button" onClick={o.onClick} style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "4px", textAlign: "left", cursor: "pointer", background: o.bg, color: o.fg, border: `1px solid ${o.bd}` }}><span style={{ fontWeight: "500" }}>{o.label}</span><span style={{ fontSize: "12px", opacity: ".8" }}>{o.sub}</span></button></React.Fragment>))}
        </div>
        {!!(v.payIsCard) && (<>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "14px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#5d5d60" }}>Número de tarjeta<input placeholder="4242 4242 4242 4242" style={{ height: "44px", padding: "0 12px", font: "inherit", fontSize: "15px", color: "#1d1f20", background: "#e9e9ea", border: "1px solid rgba(29,31,32,.16)", borderRadius: "0" }} /></label>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#5d5d60" }}>Vence<input placeholder="MM / AA" style={{ height: "44px", padding: "0 12px", font: "inherit", fontSize: "15px", color: "#1d1f20", background: "#e9e9ea", border: "1px solid rgba(29,31,32,.16)", borderRadius: "0" }} /></label>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#5d5d60" }}>CVC<input placeholder="123" style={{ height: "44px", padding: "0 12px", font: "inherit", fontSize: "15px", color: "#1d1f20", background: "#e9e9ea", border: "1px solid rgba(29,31,32,.16)", borderRadius: "0" }} /></label>
          </div>
        </>)}
        {!!(v.payNotCard) && (<><p style={{ margin: "0", fontSize: "14px", color: "#5d5d60" }}>{v.payNote}</p></>)}
      </section>
    </div>
    <aside style={{ position: "sticky", top: "96px", border: "1px solid rgba(29,31,32,.16)", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(29,31,32,.14)" }}><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "22px", textTransform: "uppercase" }}>Tu pedido</span></div>
      {(v.groups || []).map((g: any, $index: number) => (<React.Fragment key={$index}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(29,31,32,.1)", display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><strong style={{ fontWeight: "600" }}>{g.name}</strong><span>{g.subtotalText}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#5d5d60", fontSize: "13px" }}><span>{g.qty} artículos · envío desde {g.loc}</span><span>{g.shipText}</span></div>
        </div>
      </React.Fragment>))}
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}><span style={{ color: "#5d5d60" }}>Envíos</span><span>{v.shipTotalText}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span>Total</span><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "34px" }}>{v.grandText}</span></div>
        <button className="ewp-12" type="button" onClick={v.pay} style={{ height: "54px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", background: "#5980a6", color: "#f2f2f3", border: "1px solid #5980a6", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "18px", letterSpacing: ".08em", textTransform: "uppercase" }}>
          {!!(v.paying) && (<><span style={{ width: "16px", height: "16px", border: "2px solid rgba(242,242,243,.4)", borderTopColor: "#f2f2f3", borderRadius: "50%", animation: "ewspin .8s linear infinite" }} /></>)}{v.payCta}
        </button>
        <span style={{ fontSize: "12px", color: "#7a7a7d", textAlign: "center" }}>Se genera un pedido independiente por cada proveedor.</span>
      </div>
    </aside>
  </main>
</>)}

{!!(v.isSuccess) && (<>
  <main data-screen-label="06b Pago aprobado" style={{ maxWidth: "720px", margin: "0 auto", padding: "96px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", textAlign: "center" }}>
    <span style={{ width: "72px", height: "72px", display: "grid", placeItems: "center", border: "1px solid #5980a6" }}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#5980a6" strokeWidth="1.5"><path d="M20 6 9 17l-5-5" /></svg></span>
    <h1 style={{ margin: "0", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "56px", lineHeight: "1", textTransform: "uppercase" }}>Pago aprobado</h1>
    <p style={{ margin: "0", color: "#5d5d60", maxWidth: "480px" }}>Enviamos tus pedidos a cada proveedor. Te avisaremos cuando confirmen y despachen.</p>
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>{(v.lastIds || []).map((id: any, $index: number) => (<React.Fragment key={$index}><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "16px", letterSpacing: ".1em", padding: "4px 12px", background: "#d6ebff", color: "#2c455d" }}>{id}</span></React.Fragment>))}</div>
    <button type="button" onClick={v.goOrders} style={{ marginTop: "12px", height: "48px", padding: "0 24px", background: "#5980a6", color: "#f2f2f3", border: "0", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "17px", letterSpacing: ".08em", textTransform: "uppercase" }}>Ver mis pedidos</button>
  </main>
</>)}

{!!(v.isOrders) && (<>
  <main data-screen-label="07 Mis pedidos" style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 32px 80px", display: "flex", flexDirection: "column", gap: "24px" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "13px", letterSpacing: ".2em", textTransform: "uppercase", color: "#416180" }}>Cuenta</span><h1 style={{ margin: "0", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "48px", lineHeight: "1", textTransform: "uppercase" }}>Mis pedidos</h1></div>
    {(v.mOrders || []).map((o: any, $index: number) => (<React.Fragment key={$index}>
      <article style={{ border: "1px solid rgba(29,31,32,.16)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 22px", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto auto auto", gap: "28px", alignItems: "center", borderBottom: "1px solid rgba(29,31,32,.12)" }}>
          <div style={{ display: "flex", flexDirection: "column" }}><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "20px", textTransform: "uppercase" }}>{o.prov}</span><span style={{ fontSize: "13px", color: "#5d5d60" }}>Pedido {o.id} · {o.date}</span></div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: "12px", color: "#5d5d60" }}><span>Artículos</span><span style={{ fontSize: "15px", color: "#1d1f20" }}>{o.qty}</span></div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: "12px", color: "#5d5d60" }}><span>Total</span><span style={{ fontSize: "15px", color: "#1d1f20" }}>{o.totalText}</span></div>
          <span style={{ fontSize: "12px", letterSpacing: ".06em", textTransform: "uppercase", padding: "4px 10px", background: o.sbg, color: o.sfg }}>{o.statusText}</span>
        </div>
        <div style={{ padding: "18px 22px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>
          {(o.track || []).map((t: any, $index: number) => (<React.Fragment key={$index}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}><div style={{ height: "3px", background: t.bar }} /><span style={{ fontSize: "13px", color: t.fg }}>{t.label}</span></div>
          </React.Fragment>))}
        </div>
      </article>
    </React.Fragment>))}
  </main>
</>)}

{!!(v.isPanel) && (<>
  <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "240px minmax(0,1fr)" }}>
    <aside style={{ position: "sticky", top: "0", height: "100vh", background: "#1d2d3d", color: "#d6ebff", display: "flex", flexDirection: "column", padding: "22px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 8px 22px", borderBottom: "1px solid #2c455d" }}>
        <span style={{ width: "28px", height: "28px", border: "1px solid rgba(181,217,253,.55)", display: "grid", placeItems: "center" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b5d9fd" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg></span>
        <span style={{ display: "flex", flexDirection: "column", lineHeight: "1.1" }}><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "17px", letterSpacing: ".12em", color: "#f2f2f3" }}>EUSSE WORLD</span><span style={{ fontSize: "11px", color: "#94bce3", letterSpacing: ".1em", textTransform: "uppercase" }}>Panel proveedor</span></span>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: "2px", paddingTop: "16px" }}>
        {(v.panelNav || []).map((n: any, $index: number) => (<React.Fragment key={$index}>
          <button type="button" onClick={n.onClick} style={{ display: "flex", alignItems: "center", gap: "12px", height: "42px", padding: "0 12px", background: n.bg, border: "0", borderLeft: `2px solid ${n.bd}`, color: n.fg, cursor: "pointer", fontSize: "14px", textAlign: "left" }}>{n.label}{!!(n.hasBadge) && (<><span style={{ marginLeft: "auto", minWidth: "20px", height: "20px", padding: "0 6px", display: "grid", placeItems: "center", background: "#5980a6", color: "#f2f2f3", fontSize: "12px" }}>{n.badge}</span></>)}</button>
        </React.Fragment>))}
      </nav>
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "10px", padding: "14px 8px 0", borderTop: "1px solid #2c455d" }}>
        <span style={{ width: "34px", height: "34px", display: "grid", placeItems: "center", background: "#2c455d", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", color: "#b5d9fd" }}>TA</span>
        <span style={{ display: "flex", flexDirection: "column", lineHeight: "1.2", fontSize: "13px" }}><span style={{ color: "#f2f2f3" }}>Textiles Andinos</span><span style={{ color: "#94bce3", fontSize: "12px" }}>Medellín, CO</span></span>
      </div>
    </aside>

    <div style={{ minWidth: "0", display: "flex", flexDirection: "column" }}>
      <div style={{ height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 36px", borderBottom: "1px solid rgba(29,31,32,.12)" }}>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "22px", textTransform: "uppercase" }}>{v.panelTitle}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "13px", color: "#5d5d60" }}><span>{v.todayText}</span><button type="button" onClick={v.goAuth} style={{ height: "34px", padding: "0 12px", background: "none", border: "1px solid rgba(29,31,32,.2)", cursor: "pointer", fontSize: "13px" }}>Cerrar sesión</button></div>
      </div>

      {!!(v.tabResumen) && (<>
        <div data-screen-label="08 Panel resumen" style={{ padding: "32px 36px 64px", display: "flex", flexDirection: "column", gap: "28px", maxWidth: "1240px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}><h1 style={{ margin: "0", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "40px", lineHeight: "1", textTransform: "uppercase" }}>Hola, Textiles Andinos</h1><span style={{ color: "#5d5d60" }}>{v.greetSub}</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", border: "1px solid rgba(29,31,32,.16)" }}>
            {(v.kpis || []).map((k: any, $index: number) => (<React.Fragment key={$index}>
              <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "6px", borderRight: "1px solid rgba(29,31,32,.12)" }}><span style={{ fontSize: "13px", color: "#5d5d60" }}>{k.label}</span><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "38px", lineHeight: "1" }}>{k.value}</span><span style={{ fontSize: "12px", color: "#416180" }}>{k.sub}</span></div>
            </React.Fragment>))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,460px),1fr))", gap: "28px", alignItems: "start" }}>
            <section style={{ border: "1px solid rgba(29,31,32,.16)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid rgba(29,31,32,.12)" }}><span style={{ fontWeight: "500" }}>Órdenes recientes</span><button type="button" onClick={v.toOrdersTab} style={{ background: "none", border: "0", padding: "0", color: "#416180", cursor: "pointer", fontSize: "13px" }}>Ver todas</button></div>
              {(v.recentRows || []).map((r: any, $index: number) => (<React.Fragment key={$index}>
                <button className="ewp-13" type="button" onClick={r.onClick} style={{ width: "100%", display: "grid", gridTemplateColumns: "90px minmax(120px,1fr) 56px 90px 120px", gap: "12px", alignItems: "center", padding: "13px 20px", background: "none", border: "0", borderBottom: "1px solid rgba(29,31,32,.08)", cursor: "pointer", textAlign: "left", fontSize: "14px", color: "#1d1f20" }}><span style={{ color: "#5d5d60", fontVariantNumeric: "tabular-nums" }}>{r.id}</span><span>{r.merchant}</span><span style={{ color: "#5d5d60" }}>{r.qty} u.</span><span>{r.totalText}</span><span style={{ justifySelf: "start", fontSize: "11px", letterSpacing: ".06em", textTransform: "uppercase", padding: "3px 8px", background: r.sbg, color: r.sfg }}>{r.statusText}</span></button>
              </React.Fragment>))}
            </section>
            <section style={{ border: "1px solid rgba(29,31,32,.16)", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(29,31,32,.12)", fontWeight: "500" }}>Pendientes</div>
              {(v.todos || []).map((t: any, $index: number) => (<React.Fragment key={$index}>
                <button className="ewp-14" type="button" onClick={t.onClick} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px 20px", background: "none", border: "0", borderBottom: "1px solid rgba(29,31,32,.08)", cursor: "pointer", textAlign: "left", color: "#1d1f20" }}><span style={{ width: "8px", height: "8px", marginTop: "7px", flex: "none", background: "#5980a6" }} /><span style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: "14px" }}>{t.title}</span><span style={{ fontSize: "12px", color: "#5d5d60" }}>{t.sub}</span></span></button>
              </React.Fragment>))}
            </section>
          </div>
        </div>
      </>)}

      {!!(v.tabOrders) && (<>
        <div data-screen-label="09 Panel órdenes" style={{ padding: "24px 36px 64px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {(v.statusFilters || []).map((f: any, $index: number) => (<React.Fragment key={$index}><button type="button" onClick={f.onClick} style={{ height: "34px", padding: "0 14px", cursor: "pointer", fontSize: "13px", background: f.bg, color: f.fg, border: `1px solid ${f.bd}` }}>{f.label} <span style={{ opacity: ".6" }}>{f.count}</span></button></React.Fragment>))}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", color: "#5d5d60" }}><span style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>Diseño</span><div style={{ display: "flex", border: "1px solid rgba(29,31,32,.2)" }}>{(v.panelVarOpts || []).map((v: any, $index: number) => (<React.Fragment key={$index}><button type="button" onClick={v.onClick} style={{ height: "30px", padding: "0 14px", border: "0", cursor: "pointer", fontSize: "13px", background: v.bg, color: v.fg }}>{v.label}</button></React.Fragment>))}</div></div>
          </div>

          {!!(v.pvIsA) && (<>
            <section style={{ border: "1px solid rgba(29,31,32,.16)", overflowX: "auto" }}>
              <div style={{ minWidth: "900px", display: "grid", gridTemplateColumns: "110px minmax(0,1.4fr) minmax(0,1fr) 90px 70px 110px 130px", gap: "12px", padding: "12px 20px", fontSize: "12px", letterSpacing: ".06em", textTransform: "uppercase", color: "#5d5d60", borderBottom: "1px solid rgba(29,31,32,.14)", background: "#e9e9ea" }}><span>Orden</span><span>Comerciante</span><span>Ciudad</span><span>Fecha</span><span>Uds.</span><span>Total</span><span>Estado</span></div>
              {(v.orderRows || []).map((r: any, $index: number) => (<React.Fragment key={$index}>
                <button className="ewp-15" type="button" onClick={r.onClick} style={{ width: "100%", minWidth: "900px", display: "grid", gridTemplateColumns: "110px minmax(0,1.4fr) minmax(0,1fr) 90px 70px 110px 130px", gap: "12px", alignItems: "center", padding: "14px 20px", background: r.rowBg, border: "0", borderBottom: "1px solid rgba(29,31,32,.08)", cursor: "pointer", textAlign: "left", fontSize: "14px", color: "#1d1f20" }}><span style={{ color: "#5d5d60", fontVariantNumeric: "tabular-nums" }}>{r.id}</span><span style={{ display: "flex", flexDirection: "column", lineHeight: "1.3" }}><span>{r.merchant}</span><span style={{ fontSize: "12px", color: "#5d5d60" }}>{r.contact}</span></span><span style={{ color: "#5d5d60" }}>{r.city}</span><span style={{ color: "#5d5d60" }}>{r.date}</span><span>{r.qty}</span><span>{r.totalText}</span><span style={{ justifySelf: "start", fontSize: "11px", letterSpacing: ".06em", textTransform: "uppercase", padding: "3px 8px", background: r.sbg, color: r.sfg }}>{r.statusText}</span></button>
              </React.Fragment>))}
            </section>
            {!!(v.drawerOpen) && (<>
              <div onClick={v.closeDrawer} style={{ position: "fixed", inset: "0", background: "rgba(29,45,61,.35)", zIndex: "70" }} />
              <aside style={{ position: "fixed", top: "0", right: "0", bottom: "0", width: "520px", maxWidth: "92vw", background: "#f2f2f3", zIndex: "71", overflow: "auto", borderLeft: "1px solid rgba(29,31,32,.2)", boxShadow: "-24px 0 48px rgba(29,45,61,.18)" }}>
                <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 16px 0" }}><button type="button" onClick={v.closeDrawer} style={{ width: "34px", height: "34px", display: "grid", placeItems: "center", background: "none", border: "1px solid rgba(29,31,32,.16)", cursor: "pointer" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></button></div>
                <div style={{ padding: "0 28px 28px", display: "flex", flexDirection: "column", gap: "22px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}><span style={{ fontSize: "13px", color: "#5d5d60" }}>Orden {v.od.id} · {v.od.date}</span><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "32px", lineHeight: "1", textTransform: "uppercase" }}>{v.od.merchant}</span></div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "6px" }}>{(v.od.track || []).map((t: any, $index: number) => (<React.Fragment key={$index}><div style={{ display: "flex", flexDirection: "column", gap: "6px" }}><div style={{ height: "3px", background: t.bar }} /><span style={{ fontSize: "12px", color: t.fg }}>{t.label}</span></div></React.Fragment>))}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "14px", padding: "16px", background: "#e9e9ea" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: "12px", color: "#5d5d60" }}>Contacto</span><span>{v.od.contact}</span><span style={{ color: "#5d5d60" }}>{v.od.phone}</span></div>
                    <div style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: "12px", color: "#5d5d60" }}>Entrega</span><span>{v.od.address}</span><span style={{ color: "#5d5d60" }}>{v.od.city}</span></div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {(v.od.items || []).map((it: any, $index: number) => (<React.Fragment key={$index}>
                      <div style={{ display: "grid", gridTemplateColumns: "52px minmax(0,1fr) auto", gap: "14px", padding: "14px 0", borderBottom: "1px solid rgba(29,31,32,.1)" }}><span style={{ width: "52px", aspectRatio: "4/5", background: it.hex, display: "grid", placeItems: "center" }}>{!!(it.hasFile) && (<><span style={{ width: "60%", height: "60%", backgroundImage: it.fileBg, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} /></>)}</span><div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "14px" }}><span style={{ fontWeight: "500" }}>{it.name}</span><span style={{ fontSize: "13px", color: "#5d5d60" }}>{it.color} · {it.sizes}</span><span style={{ fontSize: "13px", color: "#416180" }}>{it.print}</span></div><span style={{ fontSize: "14px" }}>{it.qty} u.</span></div>
                    </React.Fragment>))}
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "14px" }}><span style={{ color: "#5d5d60" }}>Total pagado</span><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "26px" }}>{v.od.totalText}</span></div>
                  </div>
                  {!!(v.od.canAdvance) && (<><button className="ewp-16" type="button" onClick={v.advanceOrder} style={{ height: "50px", background: "#5980a6", color: "#f2f2f3", border: "1px solid #5980a6", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "17px", letterSpacing: ".08em", textTransform: "uppercase" }}>{v.od.advanceLabel}</button></>)}
                </div>
              </aside>
            </>)}
          </>)}

          {!!(v.pvIsB) && (<>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(240px,320px) minmax(0,1fr)", border: "1px solid rgba(29,31,32,.16)", minHeight: "640px" }}>
              <div style={{ borderRight: "1px solid rgba(29,31,32,.14)", display: "flex", flexDirection: "column" }}>
                {(v.orderRows || []).map((r: any, $index: number) => (<React.Fragment key={$index}>
                  <button type="button" onClick={r.onSelect} style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "16px 18px", background: r.rowBg, border: "0", borderLeft: `3px solid ${r.rowBd}`, borderBottom: "1px solid rgba(29,31,32,.08)", cursor: "pointer", textAlign: "left", color: "#1d1f20" }}>
                    <span style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "12px", color: "#5d5d60" }}><span>{r.id}</span><span>{r.date}</span></span>
                    <span style={{ fontWeight: "500" }}>{r.merchant}</span>
                    <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}><span style={{ color: "#5d5d60" }}>{r.qty} u. · {r.totalText}</span><span style={{ fontSize: "11px", letterSpacing: ".06em", textTransform: "uppercase", padding: "2px 8px", background: r.sbg, color: r.sfg }}>{r.statusText}</span></span>
                  </button>
                </React.Fragment>))}
              </div>
              <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}><span style={{ fontSize: "13px", color: "#5d5d60" }}>Orden {v.od.id} · {v.od.date}</span><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "36px", lineHeight: "1", textTransform: "uppercase" }}>{v.od.merchant}</span></div>
                  {!!(v.od.canAdvance) && (<><button className="ewp-17" type="button" onClick={v.advanceOrder} style={{ height: "44px", padding: "0 18px", background: "#5980a6", color: "#f2f2f3", border: "1px solid #5980a6", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "15px", letterSpacing: ".08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{v.od.advanceLabel}</button></>)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>{(v.od.track || []).map((t: any, $index: number) => (<React.Fragment key={$index}><div style={{ display: "flex", flexDirection: "column", gap: "6px" }}><div style={{ height: "3px", background: t.bar }} /><span style={{ fontSize: "12px", color: t.fg }}>{t.label}</span></div></React.Fragment>))}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: "rgba(29,31,32,.12)", border: "1px solid rgba(29,31,32,.12)" }}>
                  <div style={{ background: "#f2f2f3", padding: "14px", display: "flex", flexDirection: "column", fontSize: "14px" }}><span style={{ fontSize: "12px", color: "#5d5d60" }}>Contacto</span><span>{v.od.contact}</span><span style={{ color: "#5d5d60" }}>{v.od.phone}</span></div>
                  <div style={{ background: "#f2f2f3", padding: "14px", display: "flex", flexDirection: "column", fontSize: "14px" }}><span style={{ fontSize: "12px", color: "#5d5d60" }}>Entrega</span><span>{v.od.address}</span><span style={{ color: "#5d5d60" }}>{v.od.city}</span></div>
                  <div style={{ background: "#f2f2f3", padding: "14px", display: "flex", flexDirection: "column", fontSize: "14px" }}><span style={{ fontSize: "12px", color: "#5d5d60" }}>Pago</span><span>{v.od.totalText}</span><span style={{ color: "#5d5d60" }}>Aprobado · Wompi</span></div>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "52px minmax(0,1.2fr) minmax(0,1fr) minmax(0,1fr) 60px", gap: "14px", paddingBottom: "10px", fontSize: "12px", letterSpacing: ".06em", textTransform: "uppercase", color: "#5d5d60", borderBottom: "1px solid rgba(29,31,32,.14)" }}><span /><span>Producto</span><span>Tallas</span><span>Estampado</span><span>Uds.</span></div>
                  {(v.od.items || []).map((it: any, $index: number) => (<React.Fragment key={$index}>
                    <div style={{ display: "grid", gridTemplateColumns: "52px minmax(0,1.2fr) minmax(0,1fr) minmax(0,1fr) 60px", gap: "14px", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(29,31,32,.08)", fontSize: "14px" }}><span style={{ width: "52px", aspectRatio: "4/5", background: it.hex, display: "grid", placeItems: "center" }}>{!!(it.hasFile) && (<><span style={{ width: "60%", height: "60%", backgroundImage: it.fileBg, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} /></>)}</span><span style={{ display: "flex", flexDirection: "column" }}><span style={{ fontWeight: "500" }}>{it.name}</span><span style={{ fontSize: "13px", color: "#5d5d60" }}>{it.color}</span></span><span style={{ fontSize: "13px" }}>{it.sizes}</span><span style={{ fontSize: "13px", color: "#416180" }}>{it.print}</span><span>{it.qty}</span></div>
                  </React.Fragment>))}
                </div>
              </div>
            </div>
          </>)}
        </div>
      </>)}

      {!!(v.tabCatalog) && (<>
        <div data-screen-label="10 Panel catálogo" style={{ padding: "32px 36px 64px", display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1240px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "24px" }}><div style={{ display: "flex", flexDirection: "column", gap: "4px" }}><h1 style={{ margin: "0", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "36px", lineHeight: "1", textTransform: "uppercase" }}>Catálogo</h1><span style={{ color: "#5d5d60" }}>Sube tu catálogo en PDF. Detectamos productos, tallas, colores y precios para que los revises antes de publicar.</span></div><span style={{ fontSize: "13px", color: "#5d5d60", whiteSpace: "nowrap" }}>{v.catalogStatus}</span></div>

          {!!(v.upIdle) && (<>
            <label className="ewp-18" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", padding: "64px 32px", border: "1px dashed #5980a6", background: "#ececef", cursor: "pointer", textAlign: "center" }}>
              <span style={{ width: "56px", height: "56px", display: "grid", placeItems: "center", border: "1px solid #5980a6" }}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5980a6" strokeWidth="1.5"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M12 18v-6" /><path d="m9 15 3-3 3 3" /></svg></span>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "24px", textTransform: "uppercase" }}>Arrastra tu catálogo o haz clic para elegirlo</span>
              <span style={{ fontSize: "14px", color: "#5d5d60" }}>Solo PDF · hasta 50 MB · incluye fotos, nombres, tallas, colores y precio mayorista</span>
              <input type="file" accept="application/pdf,.pdf" onChange={v.onPdf} style={{ display: "none" }} />
            </label>
            <div style={{ display: "flex", justifyContent: "center" }}><button type="button" onClick={v.demoPdf} style={{ background: "none", border: "0", padding: "0", color: "#416180", cursor: "pointer", fontSize: "14px", textDecoration: "underline", textUnderlineOffset: "3px" }}>Probar con un PDF de ejemplo</button></div>
          </>)}

          {!!(v.upWorking) && (<>
            <div style={{ border: "1px solid rgba(29,31,32,.16)", padding: "28px", display: "flex", flexDirection: "column", gap: "22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5980a6" strokeWidth="1.5"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg><span style={{ display: "flex", flexDirection: "column" }}><span style={{ fontWeight: "500" }}>{v.up.file}</span><span style={{ fontSize: "13px", color: "#5d5d60" }}>{v.upLabel}</span></span><span style={{ marginLeft: "auto", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "28px", fontVariantNumeric: "tabular-nums" }}>{v.upPctText}</span></div>
              <div style={{ height: "4px", background: "#e0e0e2" }}><div style={{ height: "4px", width: v.upPctText, background: "#5980a6", transition: "width .12s linear" }} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>{(v.upSteps || []).map((s: any, $index: number) => (<React.Fragment key={$index}><div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: s.fg }}><span style={{ width: "18px", height: "18px", display: "grid", placeItems: "center", border: `1px solid ${s.bd}`, background: s.bg, color: "#f2f2f3", fontSize: "11px" }}>{s.mark}</span>{s.label}</div></React.Fragment>))}</div>
            </div>
          </>)}

          {!!(v.upReview) && (<>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "14px 18px", background: "#d6ebff", color: "#2c455d", border: "1px solid rgba(89,128,166,.4)", fontSize: "14px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 6 9 17l-5-5" /></svg>
              <span>{v.reviewText}</span>
              <button type="button" onClick={v.resetUpload} style={{ marginLeft: "auto", background: "none", border: "0", padding: "0", color: "#2c455d", cursor: "pointer", fontSize: "13px", textDecoration: "underline", textUnderlineOffset: "3px" }}>Subir otro PDF</button>
            </div>
            <section style={{ border: "1px solid rgba(29,31,32,.16)", overflowX: "auto" }}>
              <div style={{ minWidth: "1000px", display: "grid", gridTemplateColumns: "56px minmax(0,1.5fr) 130px 100px minmax(0,1.2fr) 110px 60px 40px", gap: "12px", padding: "12px 18px", fontSize: "12px", letterSpacing: ".06em", textTransform: "uppercase", color: "#5d5d60", background: "#e9e9ea", borderBottom: "1px solid rgba(29,31,32,.14)" }}><span>Pág.</span><span>Producto</span><span>Categoría</span><span>Precio</span><span>Colores</span><span>Tallas</span><span /><span /></div>
              {(v.exRows || []).map((r: any, $index: number) => (<React.Fragment key={$index}>
                <div style={{ minWidth: "1000px", display: "grid", gridTemplateColumns: "56px minmax(0,1.5fr) 130px 100px minmax(0,1.2fr) 110px 60px 40px", gap: "12px", alignItems: "center", padding: "10px 18px", borderBottom: "1px solid rgba(29,31,32,.08)", background: r.bg }}>
                  <span style={{ width: "40px", aspectRatio: "3/4", background: "#d4d4d7", display: "grid", placeItems: "center", fontSize: "11px", color: "#5d5d60" }}>{r.page}</span>
                  <input value={r.name} onChange={r.onName} style={{ height: "36px", padding: "0 10px", font: "inherit", fontSize: "14px", color: "#1d1f20", background: "transparent", border: "1px solid rgba(29,31,32,.14)", borderRadius: "0", minWidth: "0" }} />
                  <select value={r.cat} onChange={r.onCat} style={{ height: "36px", padding: "0 6px", font: "inherit", fontSize: "13px", color: "#1d1f20", background: "transparent", border: "1px solid rgba(29,31,32,.14)", borderRadius: "0" }}><option>Camisetas</option><option>Camisas</option><option>Sudaderas</option><option>Pantalones</option><option>Tenis</option></select>
                  <input value={r.price} onChange={r.onPrice} placeholder="US$" style={{ height: "36px", padding: "0 10px", font: "inherit", fontSize: "14px", color: "#1d1f20", background: "transparent", border: `1px solid ${r.priceBd}`, borderRadius: "0", minWidth: "0" }} />
                  <span style={{ fontSize: "13px", color: "#5d5d60" }}>{r.colors}</span>
                  <span style={{ fontSize: "13px" }}>{r.sizes}</span>
                  <span title={r.flag} style={{ fontSize: "11px", letterSpacing: ".04em", textTransform: "uppercase", color: r.flagFg }}>{r.flagShort}</span>
                  <button className="ewp-19" type="button" onClick={r.remove} title="Quitar" style={{ width: "30px", height: "30px", display: "grid", placeItems: "center", background: "none", border: "0", cursor: "pointer", color: "#7a7a7d" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></button>
                </div>
              </React.Fragment>))}
            </section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}><span style={{ fontSize: "13px", color: v.flagsColor }}>{v.flagsText}</span><button className="ewp-20" type="button" onClick={v.publish} style={{ height: "48px", padding: "0 24px", background: "#5980a6", color: "#f2f2f3", border: "1px solid #5980a6", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "17px", letterSpacing: ".08em", textTransform: "uppercase" }}>{v.publishCta}</button></div>
          </>)}
        </div>
      </>)}

      {!!(v.tabPrint) && (<>
        <div data-screen-label="11 Panel estampados" style={{ padding: "32px 36px 64px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "28px", alignItems: "start", maxWidth: "1240px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}><h1 style={{ margin: "0", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "36px", lineHeight: "1", textTransform: "uppercase" }}>Estampados</h1><span style={{ color: "#5d5d60" }}>Define qué personalización ofreces. El comerciante solo verá lo que actives.</span></div>
            <button type="button" onClick={v.pcToggle} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", padding: "18px 20px", border: "1px solid rgba(29,31,32,.16)", background: "none", cursor: "pointer", textAlign: "left", color: "#1d1f20" }}><span style={{ display: "flex", flexDirection: "column" }}><span style={{ fontWeight: "500" }}>Ofrecer estampado</span><span style={{ fontSize: "13px", color: "#5d5d60" }}>Aplica a todas las prendas personalizables de tu catálogo</span></span><span style={{ flex: "none", width: "44px", height: "24px", padding: "2px", background: v.pcTg.bg, border: `1px solid ${v.pcTg.bd}`, display: "flex", justifyContent: v.pcTg.jc }}><span style={{ width: "18px", height: "18px", background: v.pcTg.knob }} /></span></button>
            {!!(v.pc.on) && (<>
              <section style={{ border: "1px solid rgba(29,31,32,.16)" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(29,31,32,.12)", display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: "500" }}>Técnicas</span><span style={{ fontSize: "13px", color: "#5d5d60" }}>Costo adicional por unidad</span></div>
                {(v.pcTypes || []).map((t: any, $index: number) => (<React.Fragment key={$index}>
                  <div style={{ display: "grid", gridTemplateColumns: "24px minmax(0,1fr) 120px", gap: "14px", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid rgba(29,31,32,.08)" }}>
                    <button type="button" onClick={t.toggle} style={{ width: "20px", height: "20px", padding: "0", display: "grid", placeItems: "center", background: t.cbg, border: `1px solid ${t.cbd}`, cursor: "pointer", color: "#f2f2f3" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg></button>
                    <span style={{ display: "flex", flexDirection: "column" }}><span style={{ color: t.fg }}>{t.n}</span><span style={{ fontSize: "12px", color: "#7a7a7d" }}>{t.desc}</span></span>
                    <label style={{ display: "flex", alignItems: "center", border: "1px solid rgba(29,31,32,.16)", background: "#e9e9ea" }}><span style={{ padding: "0 8px", fontSize: "13px", color: "#5d5d60" }}>+ US$</span><input value={t.price} onChange={t.onPrice} style={{ width: "100%", height: "36px", padding: "0 8px 0 0", font: "inherit", fontSize: "14px", background: "transparent", border: "0", minWidth: "0" }} /></label>
                  </div>
                </React.Fragment>))}
              </section>
              <section style={{ border: "1px solid rgba(29,31,32,.16)" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(29,31,32,.12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontWeight: "500" }}>Tamaños de estampado</span><button type="button" onClick={v.pcAddSize} style={{ height: "30px", padding: "0 12px", background: "none", border: "1px solid rgba(29,31,32,.2)", cursor: "pointer", fontSize: "13px" }}>+ Agregar tamaño</button></div>
                {(v.pcSizes || []).map((t: any, $index: number) => (<React.Fragment key={$index}>
                  <div style={{ display: "grid", gridTemplateColumns: "24px minmax(0,1fr) 120px 32px", gap: "14px", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid rgba(29,31,32,.08)" }}>
                    <button type="button" onClick={t.toggle} style={{ width: "20px", height: "20px", padding: "0", display: "grid", placeItems: "center", background: t.cbg, border: `1px solid ${t.cbd}`, cursor: "pointer", color: "#f2f2f3" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg></button>
                    <input value={t.n} onChange={t.onName} style={{ height: "36px", padding: "0 10px", font: "inherit", fontSize: "14px", background: "transparent", border: "1px solid rgba(29,31,32,.14)", borderRadius: "0", minWidth: "0" }} />
                    <label style={{ display: "flex", alignItems: "center", border: "1px solid rgba(29,31,32,.16)", background: "#e9e9ea" }}><span style={{ padding: "0 8px", fontSize: "13px", color: "#5d5d60" }}>+ US$</span><input value={t.price} onChange={t.onPrice} style={{ width: "100%", height: "36px", padding: "0 8px 0 0", font: "inherit", fontSize: "14px", background: "transparent", border: "0", minWidth: "0" }} /></label>
                    <button type="button" onClick={t.remove} title="Eliminar" style={{ width: "30px", height: "30px", display: "grid", placeItems: "center", background: "none", border: "0", cursor: "pointer", color: "#7a7a7d" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></button>
                  </div>
                </React.Fragment>))}
              </section>
              <section style={{ border: "1px solid rgba(29,31,32,.16)", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontWeight: "500" }}>Ubicaciones</span>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>{(v.pcPlaces || []).map((o: any, $index: number) => (<React.Fragment key={$index}><button type="button" onClick={o.onClick} style={{ height: "36px", padding: "0 14px", cursor: "pointer", fontSize: "14px", background: o.bg, color: o.fg, border: `1px solid ${o.bd}` }}>{o.label}</button></React.Fragment>))}</div>
              </section>
            </>)}
          </div>
          <aside style={{ position: "sticky", top: "24px", border: "1px solid rgba(29,31,32,.16)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(29,31,32,.12)", fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", color: "#416180" }}>Así lo ve el comerciante</div>
            <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {!!(v.pc.on) && (<>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}><span style={{ fontSize: "12px", color: "#5d5d60" }}>Técnica</span><div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{(v.pcPreview.types || []).map((t: any, $index: number) => (<React.Fragment key={$index}><span style={{ fontSize: "13px", padding: "5px 10px", border: "1px solid rgba(29,31,32,.2)" }}>{t.label} <span style={{ color: "#5d5d60", fontSize: "12px" }}>{t.extra}</span></span></React.Fragment>))}</div></div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}><span style={{ fontSize: "12px", color: "#5d5d60" }}>Tamaño</span><div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{(v.pcPreview.sizes || []).map((t: any, $index: number) => (<React.Fragment key={$index}><span style={{ fontSize: "13px", padding: "5px 10px", border: "1px solid rgba(29,31,32,.2)" }}>{t.label} <span style={{ color: "#5d5d60", fontSize: "12px" }}>{t.extra}</span></span></React.Fragment>))}</div></div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}><span style={{ fontSize: "12px", color: "#5d5d60" }}>Ubicación</span><span style={{ fontSize: "14px" }}>{v.pcPreview.placesText}</span></div>
              </>)}
              {!!(v.pcOff) && (<><span style={{ fontSize: "14px", color: "#5d5d60" }}>Tus prendas se mostrarán sin opción de estampado.</span></>)}
              <button className="ewp-21" type="button" onClick={v.pcSave} style={{ height: "44px", background: "#5980a6", color: "#f2f2f3", border: "1px solid #5980a6", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", fontSize: "16px", letterSpacing: ".08em", textTransform: "uppercase" }}>Guardar cambios</button>
            </div>
          </aside>
        </div>
      </>)}
    </div>
  </div>
</>)}

{!!(v.hasToast) && (<>
  <div style={{ position: "fixed", left: "50%", bottom: "28px", transform: "translateX(-50%)", zIndex: "90", padding: "14px 20px", background: "#1d2d3d", color: "#f2f2f3", fontSize: "14px", border: "1px solid #416180", boxShadow: "0 12px 32px rgba(29,45,61,.3)" }}>{v.toast}</div>
</>)}

<div style={{ position: "fixed", right: "20px", bottom: "20px", zIndex: "80", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
  {!!(v.jump) && (<>
    <div style={{ width: "250px", background: "#f2f2f3", border: "1px solid rgba(29,31,32,.2)", boxShadow: "0 16px 40px rgba(29,45,61,.2)", display: "flex", flexDirection: "column", padding: "6px" }}>
      {(v.jumpList || []).map((j: any, $index: number) => (<React.Fragment key={$index}><button className="ewp-22" type="button" onClick={j.onClick} style={{ display: "flex", gap: "10px", padding: "8px 10px", background: j.bg, border: "0", cursor: "pointer", textAlign: "left", fontSize: "13px", color: "#1d1f20" }}><span style={{ width: "22px", color: "#7a7a7d", fontVariantNumeric: "tabular-nums" }}>{j.n}</span>{j.label}</button></React.Fragment>))}
    </div>
  </>)}
  <button type="button" onClick={v.toggleJump} style={{ height: "40px", padding: "0 14px", display: "flex", alignItems: "center", gap: "8px", background: "#f2f2f3", border: "1px solid rgba(29,31,32,.25)", cursor: "pointer", fontSize: "13px", boxShadow: "0 8px 20px rgba(29,45,61,.15)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>Pantallas</button>
</div>

</div>
      </>
    );
  }
}
