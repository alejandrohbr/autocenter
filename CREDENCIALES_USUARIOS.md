# Credenciales de Usuarios del Sistema

## Instrucciones de Configuración Inicial

Para configurar los usuarios iniciales del sistema, sigue estos pasos:

### 1. Crear el Super Admin (Primera vez)

Como el Super Admin no aparece en el selector de roles, debe ser creado directamente en Supabase:

1. Ve a tu dashboard de Supabase
2. Navega a: **Authentication** → **Users**
3. Haz clic en **Add User** → **Create new user**
4. Ingresa:
   - **Email**: `super@sears.com`
   - **Password**: `123`
   - Marca: **Auto Confirm User**
5. Copia el **User ID** generado
6. Ve a: **Table Editor** → **user_profiles**
7. Haz clic en **Insert** → **Insert row**
8. Ingresa:
   - **id**: (pega el User ID copiado)
   - **email**: `super@sears.com`
   - **full_name**: `Super Administrador`
   - **role**: `super_admin`
   - **is_active**: `true`

### 2. Iniciar Sesión como Super Admin

Una vez creado el Super Admin:

1. Ve a la aplicación: http://localhost:4200/login
2. Ingresa:
   - **Email**: `super@sears.com`
   - **Password**: `123`
3. Haz clic en **Iniciar Sesión**

### 3. Crear los Demás Usuarios

Una vez autenticado como Super Admin, puedes crear los demás usuarios desde la aplicación:

1. Haz clic en el botón **"Usuarios"** en la barra superior
2. Haz clic en **"+ Crear Usuario"**
3. Crea cada usuario con estas credenciales:

## Credenciales de Todos los Roles

### Super Admin (Crear manualmente primero)
```
Email: super@sears.com
Password: 123
Rol: super_admin (no aparece en select - crear manualmente)
Nombre: Super Administrador
```
**Permisos**: Control total del sistema + auditoría completa

---

### Admin Corporativo (Crear desde la app)
```
Email: admin@sears.com
Password: 123
Rol: Admin Corporativo
Nombre: Admin Corporativo
```
**Permisos**: Gestión de usuarios (gerente, técnico, asesor) sin acceso a auditoría

---

### Gerente (Crear desde la app)
```
Email: gerente@sears.com
Password: 123
Rol: Gerente
Nombre: Gerente General
```
**Permisos**: Supervisión y reportes

---

### Técnico (Crear desde la app)
```
Email: tecnico@sears.com
Password: 123
Rol: Técnico
Nombre: Técnico Automotriz
```
**Permisos**: Crear y buscar pedidos

---

### Asesor Técnico (Crear desde la app)
```
Email: asesor@sears.com
Password: 123
Rol: Asesor Técnico
Nombre: Asesor Técnico
```
**Permisos**: Soporte y diagnósticos

---

## Estructura de Roles

```
Super Admin (acceso total)
    ↓
Admin Corporativo (gestión usuarios)
    ↓
Gerente (supervisión y reportes)
    ↓
Técnico (operaciones)
    ↓
Asesor Técnico (soporte)
```

## Notas Importantes

⚠️ **SEGURIDAD**:
- Estas son credenciales de DESARROLLO/PRUEBA
- En PRODUCCIÓN, cambiar TODAS las contraseñas
- Usar contraseñas fuertes y únicas para cada usuario

🔐 **Acceso a Funciones**:
- **Super Admin**: Ve TODO + botones "Usuarios" y "Auditoría"
- **Admin Corporativo**: Ve botón "Usuarios" pero NO auditoría
- **Gerente**: Ve "Reportes"
- **Técnico/Asesor**: Solo funciones operativas

📝 **Sistema de Auditoría**:
- Solo Super Admin puede ver el registro completo
- Se registran: logins, creación/modificación de usuarios, operaciones en pedidos
- Se rastrean sesiones activas en tiempo real

## Verificación del Sistema

Para verificar que todo funciona correctamente:

1. ✅ Inicia sesión con cada rol
2. ✅ Verifica que cada usuario ve solo sus menús correspondientes
3. ✅ Prueba crear un usuario como Admin Corporativo
4. ✅ Verifica que NO puedas ver "Auditoría" como Admin Corporativo
5. ✅ Como Super Admin, revisa el registro de auditoría

## Soporte

Si tienes problemas al crear usuarios, verifica:
- Que Supabase esté conectado correctamente
- Que las migraciones se hayan aplicado
- Que el email no esté ya registrado
- Que la contraseña tenga mínimo 6 caracteres
