'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Instrumentador } from '@/lib/types';

interface AddInstrumentadorFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Instrumentador, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export function AddInstrumentadorForm({ open, onClose, onSubmit }: AddInstrumentadorFormProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    matricula_provincial: '',
    cuit: '',
    especialidad: '',
    grupo_personal: '',
    perfil: '',
    activo: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({
      ...formData,
      [field]: value
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        nombre: formData.nombre.trim(),
        matricula_provincial: formData.matricula_provincial.trim() || null,
        cuit: formData.cuit.trim() || null,
        especialidad: formData.especialidad.trim() || null,
        grupo_personal: formData.grupo_personal.trim() || null,
        perfil: formData.perfil.trim() || null,
        activo: formData.activo
      });
      
      // Resetear formulario y cerrar
      setFormData({
        nombre: '',
        matricula_provincial: '',
        cuit: '',
        especialidad: '',
        grupo_personal: '',
        perfil: '',
        activo: true
      });
      onClose();
    } catch (err) {
      console.error('Error submitting:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar el instrumentador');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setFormData({
        nombre: '',
        matricula_provincial: '',
        cuit: '',
        especialidad: '',
        grupo_personal: '',
        perfil: '',
        activo: true
      });
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Instrumentador</DialogTitle>
          <DialogDescription>
            Complete los datos del instrumentador. Solo el nombre es obligatorio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Ej: Juan Pérez"
                disabled={submitting}
                required
              />
            </div>

            {/* Matrícula Provincial */}
            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula Provincial</Label>
              <Input
                id="matricula"
                value={formData.matricula_provincial}
                onChange={(e) => handleChange('matricula_provincial', e.target.value)}
                placeholder="Ej: 12345"
                disabled={submitting}
              />
            </div>

            {/* CUIT */}
            <div className="space-y-2">
              <Label htmlFor="cuit">CUIT</Label>
              <Input
                id="cuit"
                value={formData.cuit}
                onChange={(e) => handleChange('cuit', e.target.value)}
                placeholder="Ej: 20-12345678-9"
                disabled={submitting}
              />
            </div>

            {/* Especialidad */}
            <div className="space-y-2">
              <Label htmlFor="especialidad">Especialidad</Label>
              <Input
                id="especialidad"
                value={formData.especialidad}
                onChange={(e) => handleChange('especialidad', e.target.value)}
                placeholder="Ej: Instrumentador"
                disabled={submitting}
              />
            </div>

            {/* Grupo Personal */}
            <div className="space-y-2">
              <Label htmlFor="grupo_personal">Grupo Personal</Label>
              <Input
                id="grupo_personal"
                value={formData.grupo_personal}
                onChange={(e) => handleChange('grupo_personal', e.target.value)}
                placeholder="Ej: Grupo A"
                disabled={submitting}
              />
            </div>

            {/* Perfil */}
            <div className="space-y-2">
              <Label htmlFor="perfil">Perfil</Label>
              <Input
                id="perfil"
                value={formData.perfil}
                onChange={(e) => handleChange('perfil', e.target.value)}
                placeholder="Ej: Senior"
                disabled={submitting}
              />
            </div>

            {/* Activo */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => handleChange('activo', checked === true)}
                disabled={submitting}
              />
              <Label
                htmlFor="activo"
                className="text-sm font-normal cursor-pointer"
              >
                Activo
              </Label>
            </div>

            {/* Error message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

