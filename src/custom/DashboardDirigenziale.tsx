// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("DashboardDirigenziale");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("DashboardDirigenziale");
import { useState } from "react";
import { Button, Card, Dialog, useTable } from "../floware";

export default function DashboardDirigenziale(props) {__mk();
  const table = useTable("registro-protocolli");
  const [aperto, setAperto] = useState(false);
  if (!table) return <p>Registro protocolli non disponibile.</p>;
  const nomi = ["Data", "Ufficio assegnato", "Stato", "Tipo", "Scadenza"];
  const mancanti = nomi.filter((nome) => (__mk(), table.column(nome) < 0));
  if (mancanti.length) return <p>Colonne necessarie: {mancanti.join(", ")}.</p>;
  const data = table.column("Data");
  const ufficio = table.column("Ufficio assegnato");
  const stato = table.column("Stato");
  const tipo = table.column("Tipo");
  const scadenza = table.column("Scadenza");
  const righe = table.rows;
  const totale = righe.length;
  const oggi = new Date();
  const inizio = new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate()).getTime();
  const giorno = 86400000;
  function validata(r) {__mk();
    return (r[ufficio] || "").split(" · Esito: ")[1] === "Validata";
  }
  function gruppo(indice, pulisci) {__mk();
    const conteggi = new Map();
    for (const r of righe) {__mk();
      const testo = r[indice] || "";
      const voce = (pulisci ? testo.split(" · Esito: ")[0] : testo).trim() || "Non indicato";
      conteggi.set(voce, (conteggi.get(voce) || 0) + 1);
    }
    return [...conteggi.entries()].map(([nome, n]) => ((__mk(), {nome, n}))).sort((a, b) => (__mk(), b.n - a.n));
  }
  const uffici = gruppo(ufficio, true);
  const stati = gruppo(stato, false);
  const tipi = gruppo(tipo, false);
  const validate = righe.filter(validata).length;
  const rifiutate = righe.filter((r) => (__mk(), (r[ufficio] || "").split(" · Esito: ")[1] === "Non validata")).length;
  const giorni = new Map();
  for (const r of righe) {__mk();
    const nome = r[data] || "Data assente";
    const corrente = giorni.get(nome) || {nome, n: 0, validate: 0};
    giorni.set(nome, {nome, n: corrente.n + 1, validate: corrente.validate + (validata(r) ? 1 : 0)});
  }
  const andamento = [...giorni.values()].sort((a, b) => (__mk(), a.nome.localeCompare(b.nome)));
  let scadute = 0;
  let prossime = 0;
  let successive = 0;
  let assenti = 0;
  let completate = 0;
  for (const r of righe) {__mk();
    if ((r[stato] || "").toLowerCase() === "completato") {
      completate += 1;
    } else {
      const testo = r[scadenza] || "";
      const t = new Date(testo + "T00:00:00").getTime();
      if (!Number.isFinite(t)) assenti += 1;
      else if (t < inizio) scadute += 1;
      else if (t <= inizio + 3 * giorno) prossime += 1;
      else successive += 1;
    }
  }
  const scadenze = [{nome: "Scadute aperte", n: scadute}, {nome: "Da oggi ai prossimi 3 giorni", n: prossime}, {nome: "Oltre 3 giorni", n: successive}, {nome: "Senza scadenza valida", n: assenti}, {nome: "Completate (escluse)", n: completate}];
  function grafico(titolo, elenco) {__mk();
    const massimo = Math.max(1, ...elenco.map((v) => (__mk(), v.n)));
    return <Card title={titolo}><div className="space-y-3">{elenco.length === 0 && <p>Nessun dato.</p>}{elenco.map((v) => (__mk(), <div key={v.nome}><div className="flex justify-between gap-3 text-sm"><span>{v.nome}</span><strong>{v.n} · {totale ? Math.round(v.n * 100 / totale) : 0}%</strong></div><div className="h-3 rounded bg-(--mk-subtle)"><div className="h-3 rounded bg-(--mk-primary)" style={{width: String(v.n * 100 / massimo) + "%"}} /></div></div>))}</div></Card>;
  }
  function rapporto() {__mk();
    return <div className="space-y-4 text-(--mk-text)"><p className="text-sm text-(--mk-muted)">Fonte: Registro protocolli in memoria · Aggiornato al {oggi.toLocaleDateString("it-IT")}. Tutte le righe sono incluse, indipendentemente dai filtri della tabella. Dati inventati.</p><div className="grid gap-3 sm:grid-cols-2"><Card title="Protocolli totali"><strong className="text-2xl">{totale}</strong></Card><Card title="Assegnazioni validate"><strong className="text-2xl">{validate} / {totale}</strong><p>{totale ? Math.round(validate * 100 / totale) : 0}% del registro</p></Card><Card title="Validazione da registrare"><strong className="text-2xl">{totale - validate - rifiutate}</strong></Card><Card title="Esito esplicito non validato"><strong className="text-2xl">{rifiutate}</strong></Card></div><Card title="Validazioni per data di protocollo"><p className="mb-3 text-sm text-(--mk-muted)">Situazione attuale, non data di validazione. Barre: validate sul totale del giorno. L’assenza di un esito non equivale a un rifiuto.</p><div className="space-y-3">{andamento.map((v) => (__mk(), <div key={v.nome}><div className="flex justify-between gap-3 text-sm"><span>{v.nome}</span><strong>{v.validate} / {v.n}</strong></div><div className="h-3 rounded bg-(--mk-subtle)"><div className="h-3 rounded bg-(--mk-primary)" style={{width: String(v.validate * 100 / v.n) + "%"}} /></div></div>))}</div></Card><div className="grid gap-4 sm:grid-cols-2">{grafico("Assegnazioni per ufficio", uffici)}{grafico("Riepilogo per stato", stati)}{grafico("Riepilogo per tipo", tipi)}{grafico("Scadenze rispetto a oggi", scadenze)}</div><p className="text-sm text-(--mk-muted)">Distribuzioni: percentuali sul totale del registro; lunghezza delle barre relativa al valore massimo di ciascun grafico. Gli uffici sono aggregati senza il suffisso dell’esito. Gli indicatori di questo riquadro sono calcolati dal registro e non utilizzano i valori statici del cruscotto.</p></div>;
  }
  return <div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Dashboard dirigenziale dal registro</h2><Button onClick={() => (__mk(), setAperto(true))}>Apri rapporto dirigenziale</Button></div>{rapporto()}{aperto && <Dialog title="Rapporto dirigenziale" onClose={() => (__mk(), setAperto(false))} footer={<Button variant="secondary" onClick={() => (__mk(), setAperto(false))}>Chiudi</Button>}><p className="mb-4 text-sm text-(--mk-muted)">Anteprima consultabile. Generazione e download PDF non disponibili nel prototipo.</p>{rapporto()}</Dialog>}</div>;
}
