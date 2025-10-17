# Guía para Crear el Super Admin

## ⚡ MÉTODO MÁS RÁPIDO: Usar la Edge Function

He creado una función especial que crea el Super Admin automáticamente. Solo tienes que abrir esta URL en tu navegador:

**👉 https://hdtsihoxwxlmlhnundue.supabase.co/functions/v1/create-super-admin**

Cuando la abras, verás un mensaje JSON indicando que el usuario fue creado exitosamente. ¡Y listo! Ya puedes iniciar sesión con:

- **Email**: `super@sears.com`
- **Password**: `123`

Si ya existe el usuario, te dirá "Super Admin ya existe" y también podrás usar las credenciales arriba.

---

## Método 1: Usando el Dashboard de Supabase

### Paso 1: Crear el Usuario de Autenticación

1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. En el menú lateral, ve a **Authentication** → **Users**
4. Haz clic en **Add User** (botón verde)
5. Selecciona **Create new user**
6. Completa el formulario:
   - **Email**: `super@sears.com`
   - **Password**: `123`
   - ✅ Marca **Auto Confirm User** (muy importante)
7. Haz clic en **Create User**
8. **IMPORTANTE**: Copia el **UUID** del usuario que se muestra (algo como: `550e8400-e29b-41d4-a716-446655440000`)

### Paso 2: Crear el Perfil del Usuario

1. En el menú lateral, ve a **Table Editor**
2. Selecciona la tabla **user_profiles**
3. Haz clic en **Insert** → **Insert row**
4. Completa los campos:
   - **id**: Pega el UUID que copiaste en el paso anterior
   - **email**: `super@sears.com`
   - **full_name**: `Super Administrador`
   - **role**: `super_admin`
   - **is_active**: `true` (marca el checkbox)
   - **created_by**: deja en NULL
5. Haz clic en **Save**

### Paso 3: Verificar el Login

1. Ve a tu aplicación: http://localhost:4200/login
2. Selecciona cualquier tipo de usuario del dropdown
3. Ingresa:
   - **Email**: `super@sears.com`
   - **Password**: `123`
4. Haz clic en **Iniciar Sesión**

✅ **¡Listo!** Deberías poder acceder como Super Admin

---

## Método 2: Usando SQL en Supabase (AVANZADO)

Si prefieres usar SQL directamente:

### Paso 1: Ejecutar en SQL Editor

Ve a **SQL Editor** en Supabase y ejecuta:

```sql
-- Crear el usuario en auth.users manualmente no es posible por seguridad
-- Debes usar el método 1 (Dashboard) o la API de Supabase
```

**Nota**: Por seguridad, Supabase no permite crear usuarios de autenticación directamente con SQL. Debes usar el Dashboard o la API de administración.

---

## Método 3: Usando la API de Supabase (PARA DESARROLLADORES)

Si tienes acceso a la Service Role Key:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'TU_SUPABASE_URL',
  'TU_SERVICE_ROLE_KEY' // ⚠️ NUNCA expongas esto en el cliente
)

async function createSuperAdmin() {
  // Crear usuario en auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'super@sears.com',
    password: '123',
    email_confirm: true
  })

  if (authError) {
    console.error('Error:', authError)
    return
  }

  // Crear perfil
  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      id: authData.user.id,
      email: 'super@sears.com',
      full_name: 'Super Administrador',
      role: 'super_admin',
      is_active: true
    })

  if (profileError) {
    console.error('Error:', profileError)
  } else {
    console.log('✅ Super Admin creado exitosamente')
  }
}

createSuperAdmin()
```

---

## Solución de Problemas

### Error: "Email o contraseña incorrectos"
- ✅ Verifica que creaste el usuario en **Authentication** → **Users**
- ✅ Verifica que marcaste **Auto Confirm User**
- ✅ Verifica que el UUID en `user_profiles.id` coincide con el de `auth.users`

### Error: "Usuario inactivo o no encontrado"
- ✅ Verifica que el registro existe en la tabla `user_profiles`
- ✅ Verifica que `is_active` está en `true`
- ✅ Verifica que el `role` es exactamente `super_admin`

### El usuario se crea pero no puede hacer login
- ✅ Verifica que el email coincide exactamente en ambas tablas
- ✅ Verifica que el usuario está confirmado (email_confirmed_at no es NULL)
- ✅ Intenta hacer logout completo y volver a intentar

---

## Después de Crear el Super Admin

Una vez que hayas creado el Super Admin y puedas acceder:

1. Haz clic en el botón **"Usuarios"** en la barra superior
2. Crea los demás usuarios desde la interfaz:
   - Admin Corporativo: `admin@sears.com` / `123`
   - Gerente: `gerente@sears.com` / `123`
   - Técnico: `tecnico@sears.com` / `123`
   - Asesor Técnico: `asesor@sears.com` / `123`

¡Y listo! Ya tendrás todos tus usuarios configurados. 🎉
