-- Agregar políticas RLS para permitir que admins autenticados inserten, actualicen y eliminen vestidos

-- Política para INSERT: Permitir a usuarios autenticados insertar nuevos vestidos
CREATE POLICY "Allow authenticated admins to insert dresses" 
  ON public.dresses 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Política para UPDATE: Permitir a usuarios autenticados actualizar vestidos
CREATE POLICY "Allow authenticated admins to update dresses" 
  ON public.dresses 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Política para DELETE: Permitir a usuarios autenticados eliminar vestidos
CREATE POLICY "Allow authenticated admins to delete dresses" 
  ON public.dresses 
  FOR DELETE 
  USING (auth.role() = 'authenticated');
