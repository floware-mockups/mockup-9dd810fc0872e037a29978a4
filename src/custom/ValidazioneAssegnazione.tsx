// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("ValidazioneAssegnazione");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("ValidazioneAssegnazione");
import { useState } from "react";
import { Badge, Button, Dialog, Field, useTable, type CellProps } from "../floware";

export default function ValidazioneAssegnazione({ pageId, rowIndex, value }: CellProps) {__mk();
  const table = useTable(pageId);
  const [scelta, setScelta] = useState("");
  if (!table) return <span>{value}</span>;
  const colonna = table.column("Ufficio assegnato");
  const numeroCol = table.column("Numero protocollo");
  if (colonna < 0 || !table.rows[rowIndex]) return <span>{value}</span>;
  const separatore = " · Esito: ";
  const ufficio = value.split(separatore)[0];
  const parti = value.split(separatore);
  const validata = parti.length > 1 && parti[1] === "Validata";
  const esito = validata ? "Validata" : "Non validata";
  const numero = numeroCol >= 0 ? table.value(rowIndex, numeroCol) : "Protocollo";
  function conferma() {__mk();
    const attuale = table.value(rowIndex, colonna).split(separatore)[0];
    table.setCell(rowIndex, colonna, attuale + separatore + (scelta === "valida" ? "Validata" : "Non validata"));
    setScelta("");
  }
  return (
    <div className="space-y-2">
      <div>{value}</div>
      <Badge tone={validata ? "primary" : "neutral"}>{esito}</Badge>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" disabled={!ufficio.trim()} onClick={() => (__mk(), setScelta("valida"))}>Valida</Button>
        <Button variant="secondary" onClick={() => (__mk(), setScelta("rifiuta"))}>Rifiuta</Button>
      </div>
      {scelta && (
        <Dialog title={scelta === "valida" ? "Validare l’assegnazione?" : "Rifiutare l’assegnazione?"} onClose={() => (__mk(), setScelta(""))} footer={<><Button variant="secondary" onClick={() => (__mk(), setScelta(""))}>Annulla</Button><Button variant={scelta === "valida" ? "primary" : "danger"} onClick={conferma}>Conferma</Button></>}>
          <div className="space-y-3">
            <Field label="Protocollo">{numero}</Field>
            <Field label="Ufficio proposto">{ufficio || "Non indicato"}</Field>
            <p>{scelta === "valida" ? "L’assegnazione sarà segnata come Validata." : "L’assegnazione sarà segnata come Non validata. L’ufficio proposto resterà visibile per la revisione."}</p>
          </div>
        </Dialog>
      )}
    </div>
  );
}
