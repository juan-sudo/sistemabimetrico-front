import { PlusCircle } from "lucide-react"
import type { Dispatch, FormEvent, SetStateAction } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Area, FormState } from "../interfaces/area"
import { needsParent } from "../utils/area"

type Props = {
  open: boolean
  editingId: number | null
  saving: boolean
  form: FormState
  parentsDisponibles: Area[]
  setForm: Dispatch<SetStateAction<FormState>>
  onSubmit: (e: FormEvent) => Promise<void>
  onOpenChange: (next: boolean) => void
  onCreateNew: () => void
}

export default function AreaFormDialog({ open, editingId, saving, form, parentsDisponibles, setForm, onSubmit, onOpenChange, onCreateNew }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-emerald-700"
        >
          <PlusCircle size={16} />
          Nueva Area
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editingId ? "Editar Area" : "Nueva Area"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-3">
          <Input placeholder="Codigo" required value={form.codigo} onChange={(e) => setForm((p) => ({ ...p, codigo: e.target.value }))} />
          <Input placeholder="Nombre del area" required value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} />
          <select
            className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-700"
            value={form.tipo}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                tipo: e.target.value as FormState["tipo"],
                parent: "",
              }))
            }
          >
            <option value="GERENCIA">Gerencia</option>
            <option value="OFICINA">Oficina</option>
            <option value="SUBGERENCIA">Subgerencia</option>
            <option value="UNIDAD">Unidad</option>
          </select>
          {needsParent(form.tipo) && (
            <select
              required
              className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-700"
              value={form.parent}
              onChange={(e) => setForm((p) => ({ ...p, parent: e.target.value }))}
            >
              <option value="">Seleccione area padre</option>
              {parentsDisponibles.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.codigo} - {x.nombre}
                </option>
              ))}
            </select>
          )}
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.activo} onChange={(e) => setForm((p) => ({ ...p, activo: e.target.checked }))} />
            Activo
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
