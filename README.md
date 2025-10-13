# ERP Backend - Instalación y arranque


## Requisitos

- Node.js >= 16 (recomendado). Comprueba con:

```cmd
node -v
```

- npm (viene con Node.js):

```cmd
npm -v
```

- MySQL accesible en `localhost` o en el host que indiques en `.env`.

## Pasos de instalación

1. Clona el repositorio (si no lo has hecho):

```cmd
git clone https://github.com/gabnunezm/ProyectoFinal-ERP_Backend.git
```

2. Instala dependencias:

```cmd
npm install
```

3. Copia el archivo de ejemplo de variables de entorno y edítalo:

```cmd
copy env.example .env
```

Abre `.env` con tu editor y actualiza las variables:

- `DB_HOST` (por defecto `localhost`)
- `DB_PORT` (por defecto `3306`)
- `DB_USER` (usuario de MySQL, p. ej. `root` o un usuario dedicado)
- `DB_PASS` (contraseña del usuario de la base de datos)  <-- muy importante
- `DB_NAME` (por defecto `erp_academico`)
- `JWT_SECRET` (clave para firmar tokens JWT)

Asegúrate de que `DB_PASS` contiene la contraseña correcta. Si queda vacía, la aplicación intentará conectar sin contraseña y MySQL puede rechazar la conexión (error: "Access denied ... (using password: NO)").

4. Crear la base de datos e importar esquema (si no existe):

Primero, crea la base de datos (opcional si el .sql ya la crea):

```cmd
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS erp_academico;"
```

Importa el fichero SQL proporcionado:

```cmd
mysql -u root -p erp_academico < database\erp_academico.sql
```

Sustituye `root` por el usuario que corresponda o usa las credenciales que hayas puesto en `.env`.

> Nota: Si tu cuenta `root` usa un plugin de autenticación distinto (p. ej. auth_socket) o no acepta contraseña, crea un usuario específico para la app:

```sql
-- en el cliente mysql:
CREATE USER 'erp_user'@'localhost' IDENTIFIED BY 'erp_password';
GRANT ALL PRIVILEGES ON erp_academico.* TO 'erp_user'@'localhost';
FLUSH PRIVILEGES;
```

Y pon `DB_USER=erp_user` y `DB_PASS=erp_password` en `.env`.

## Ejecutar la API

- En producción:

```cmd
npm start
```

- En desarrollo (con recarga automática si tienes `nodemon` instalado):

```cmd
npm run dev
```

Por defecto el servidor escucha en el puerto `4000` (puedes cambiarlo en `.env` con `PORT`).

## Probar endpoints

- Obtener estudiante por id (ejemplo):

```cmd
curl http://localhost:4000/api/estudiantes/1
```

(En Windows puedes usar `curl` integrado o usar Postman / Insomnia).

## Errores comunes y soluciones

- "Access denied for user 'root'@'localhost' (using password: NO)":
  - Significa que la app intentó conectar sin contraseña. Asegúrate de haber copiado `env.example` a `.env` y de haber puesto `DB_PASS` con la contraseña correcta.
  - Verifica que puedes conectarte manualmente con:

    ```cmd
    mysql -u %DB_USER% -p
    ```

  - Si no quieres usar `root`, crea un usuario dedicado para la app y dale permisos sobre la base de datos (ver sección anterior).

- "ER_ACCESS_DENIED_ERROR" u otros errores de conexión:
  - Verifica host/puerto, credenciales y que el servicio MySQL esté en ejecución.
  - Asegúrate de que `DB_NAME` existe e importaste `database\erp_academico.sql`.

- Variables de entorno no aplicadas:
  - Comprueba que `require('dotenv').config()` está presente (ya lo está) y que el `.env` está en la raíz donde ejecutas `npm start`.

## Recomendaciones adicionales

- No uses el usuario `root` en producción. Crea un usuario con los privilegios mínimos necesarios.
- Guarda secretos (`DB_PASS`, `JWT_SECRET`) en un gestor de secretos en producción.
- Considera añadir una comprobación al inicio del servidor que intente una conexión a la BD y detenga el arranque si falla, mostrando un mensaje claro.

## ¿Necesitas ayuda?

Si tienes problemas, pega la salida exacta del error del terminal y el contenido (sólo los nombres de variables, NO la contraseña) de tu `.env` y te ayudo a diagnosticarlo.
