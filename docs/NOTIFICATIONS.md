# Sistema de Notificaciones Push

Sistema completo de notificaciones push usando Firebase Cloud Messaging (FCM) para alertar a los usuarios sobre cambios de precios, ofertas y novedades.

## 📋 Características

- ✅ Notificaciones automáticas cuando baja el precio de productos seguidos
- ✅ Preferencias personalizables por usuario
- ✅ Historial de notificaciones
- ✅ Seguir/dejar de seguir productos
- ✅ Notificaciones masivas para administradores
- ✅ Integración automática con cambios de precio

## 🔧 Configuración Backend

### Colecciones de Firebase Firestore

El sistema crea automáticamente estas colecciones:

#### `user_notifications`
```typescript
{
  userId: string,              // ID del usuario
  fcmToken: string,            // Token FCM del dispositivo
  preferences: {
    priceDrops: boolean,       // Alertas de bajada de precio
    newDiscounts: boolean,     // Ofertas y descuentos
    stockAlerts: boolean,      // Producto disponible
    generalNews: boolean       // Noticias generales
  },
  subscribedProducts: string[], // IDs de productos seguidos
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `notification_history`
```typescript
{
  userId: string,
  type: 'price_drop' | 'discount' | 'stock' | 'news',
  title: string,
  body: string,
  productId?: string,
  oldPrice?: number,
  newPrice?: number,
  discount?: number,
  imageUrl?: string,
  sentAt: Timestamp,
  read: boolean
}
```

## 📡 Endpoints REST API

### 1. Suscribir Usuario a Notificaciones

**POST** `/api/v1/notifications/subscribe`

Registra el token FCM del usuario para recibir notificaciones.

**Body:**
```json
{
  "userId": "abc123xyz",
  "fcmToken": "dXp2K3h8L9m6N...",
  "preferences": {
    "priceDrops": true,
    "newDiscounts": true,
    "stockAlerts": false,
    "generalNews": false
  }
}
```

**Response:**
```json
{
  "message": "Suscripción exitosa",
  "preferences": {
    "priceDrops": true,
    "newDiscounts": true,
    "stockAlerts": false,
    "generalNews": false
  }
}
```

**Ejemplo PowerShell:**
```powershell
$body = @{
  userId = "user123"
  fcmToken = "eXaMpLe_ToKeN_fRoM_fLuTtEr"
  preferences = @{
    priceDrops = $true
    newDiscounts = $true
    stockAlerts = $true
    generalNews = $false
  }
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/api/v1/notifications/subscribe" `
  -Body $body `
  -ContentType "application/json"
```

---

### 2. Actualizar Preferencias

**PUT** `/api/v1/notifications/preferences/{userId}`

Actualiza las preferencias de notificaciones del usuario.

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "priceDrops": true,
  "newDiscounts": false,
  "stockAlerts": true,
  "generalNews": false
}
```

**Response:**
```json
{
  "message": "Preferencias actualizadas exitosamente",
  "preferences": {
    "priceDrops": true,
    "newDiscounts": false,
    "stockAlerts": true,
    "generalNews": false
  }
}
```

**Ejemplo PowerShell:**
```powershell
$token = "tu-firebase-token"
$body = @{
  priceDrops = $true
  newDiscounts = $false
} | ConvertTo-Json

Invoke-RestMethod -Method Put `
  -Uri "http://localhost:3000/api/v1/notifications/preferences/user123" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body $body `
  -ContentType "application/json"
```

---

### 3. Seguir un Producto

**POST** `/api/v1/notifications/follow`

El usuario seguirá este producto y recibirá alertas cuando baje su precio.

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "userId": "user123",
  "productId": "product456"
}
```

**Response:**
```json
{
  "message": "Ahora sigues este producto. Te notificaremos sobre cambios de precio.",
  "subscribedProducts": ["product1", "product2", "product456"]
}
```

**Ejemplo PowerShell:**
```powershell
$token = "tu-firebase-token"
$body = @{
  userId = "user123"
  productId = "abc123xyz"
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/api/v1/notifications/follow" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body $body `
  -ContentType "application/json"
```

---

### 4. Dejar de Seguir Producto

**DELETE** `/api/v1/notifications/unfollow/{userId}/{productId}`

Deja de recibir alertas de este producto.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Dejaste de seguir este producto",
  "subscribedProducts": ["product1", "product2"]
}
```

**Ejemplo PowerShell:**
```powershell
$token = "tu-firebase-token"

Invoke-RestMethod -Method Delete `
  -Uri "http://localhost:3000/api/v1/notifications/unfollow/user123/product456" `
  -Headers @{ Authorization = "Bearer $token" }
```

---

### 5. Obtener Historial de Notificaciones

**GET** `/api/v1/notifications/history/{userId}?limit=50`

Devuelve las últimas notificaciones recibidas.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "total": 10,
  "notifications": [
    {
      "id": "notif1",
      "type": "price_drop",
      "title": "¡Oferta! 🔥",
      "body": "Zapatilla Nike bajó de S/ 200.00 a S/ 150.00 (25% OFF)",
      "productId": "prod123",
      "oldPrice": 200,
      "newPrice": 150,
      "discount": 25,
      "imageUrl": "https://cloudinary.com/...",
      "sentAt": "2024-11-29T10:30:00Z",
      "read": false
    }
  ]
}
```

**Ejemplo PowerShell:**
```powershell
$token = "tu-firebase-token"

Invoke-RestMethod -Method Get `
  -Uri "http://localhost:3000/api/v1/notifications/history/user123?limit=20" `
  -Headers @{ Authorization = "Bearer $token" }
```

---

### 6. Enviar Notificación General (Admin)

**POST** `/api/v1/notifications/send/general`

Permite al administrador enviar notificaciones masivas.

**Headers:**
```
Authorization: Bearer {admin-token}
```

**Body:**
```json
{
  "title": "¡Nueva Colección Disponible! 👟",
  "body": "Descubre nuestra nueva colección de zapatillas deportivas con 30% de descuento",
  "imageUrl": "https://example.com/banner.jpg",
  "type": "discount"
}
```

**Types:** `discount`, `stock`, `news`

**Response:**
```json
{
  "sent": 150,
  "failed": 0,
  "message": "Notificación enviada a 150 usuarios"
}
```

**Ejemplo PowerShell:**
```powershell
$adminToken = "tu-admin-token"
$body = @{
  title = "¡Black Friday! 🔥"
  body = "Hasta 50% de descuento en toda la tienda"
  type = "discount"
  imageUrl = "https://example.com/blackfriday.jpg"
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/api/v1/notifications/send/general" `
  -Headers @{ Authorization = "Bearer $adminToken" } `
  -Body $body `
  -ContentType "application/json"
```

---

## 🚀 Notificaciones Automáticas

### Cambio de Precio

Las notificaciones se envían **automáticamente** cuando:
1. Un administrador actualiza el precio de un producto
2. El nuevo precio es **menor** al precio anterior (bajada de precio)
3. Hay usuarios siguiendo ese producto con `priceDrops: true`

**Ejemplo de flujo:**
```
1. Admin actualiza producto: PATCH /api/v1/products/abc123
   { "price": 150 }  // Precio anterior: 200

2. ProductService detecta bajada de precio

3. NotificationService envía push notification automáticamente

4. Usuarios reciben: "¡Oferta! 🔥 Zapatilla Nike bajó de S/ 200.00 a S/ 150.00 (25% OFF)"
```

---

## 📱 Implementación en Flutter

### 1. Instalar Dependencias

```yaml
# pubspec.yaml
dependencies:
  firebase_messaging: ^14.7.0
  firebase_core: ^2.24.0
```

### 2. Obtener Token FCM

```dart
import 'package:firebase_messaging/firebase_messaging.dart';

Future<void> subscribeToNotifications(String userId) async {
  // Obtener token FCM
  String? fcmToken = await FirebaseMessaging.instance.getToken();
  
  if (fcmToken != null) {
    // Enviar al backend
    final response = await http.post(
      Uri.parse('http://localhost:3000/api/v1/notifications/subscribe'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'userId': userId,
        'fcmToken': fcmToken,
        'preferences': {
          'priceDrops': true,
          'newDiscounts': true,
          'stockAlerts': true,
          'generalNews': false,
        }
      }),
    );
    
    print('Suscrito: ${response.body}');
  }
}
```

### 3. Escuchar Notificaciones

```dart
void setupNotifications() {
  // Notificación cuando la app está en primer plano
  FirebaseMessaging.onMessage.listen((RemoteMessage message) {
    print('Notificación recibida: ${message.notification?.title}');
    
    // Mostrar in-app notification
    if (message.notification != null) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text(message.notification!.title ?? ''),
          content: Text(message.notification!.body ?? ''),
          actions: [
            TextButton(
              onPressed: () {
                // Navegar al producto
                String? productId = message.data['productId'];
                if (productId != null) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => ProductDetailPage(productId: productId),
                    ),
                  );
                }
              },
              child: Text('Ver Producto'),
            ),
          ],
        ),
      );
    }
  });

  // Notificación cuando usuario hace tap en ella (app cerrada/background)
  FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
    String? productId = message.data['productId'];
    if (productId != null) {
      // Navegar al producto
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => ProductDetailPage(productId: productId),
        ),
      );
    }
  });
}
```

### 4. Seguir/Dejar de Seguir Producto

```dart
Future<void> followProduct(String userId, String productId, String token) async {
  final response = await http.post(
    Uri.parse('http://localhost:3000/api/v1/notifications/follow'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
    body: jsonEncode({
      'userId': userId,
      'productId': productId,
    }),
  );
  
  print('Siguiendo producto: ${response.body}');
}

Future<void> unfollowProduct(String userId, String productId, String token) async {
  final response = await http.delete(
    Uri.parse('http://localhost:3000/api/v1/notifications/unfollow/$userId/$productId'),
    headers: {'Authorization': 'Bearer $token'},
  );
  
  print('Dejaste de seguir: ${response.body}');
}
```

### 5. Pantalla de Preferencias

```dart
class NotificationPreferencesScreen extends StatefulWidget {
  final String userId;
  final String token;

  const NotificationPreferencesScreen({
    required this.userId,
    required this.token,
  });

  @override
  _NotificationPreferencesScreenState createState() => _NotificationPreferencesScreenState();
}

class _NotificationPreferencesScreenState extends State<NotificationPreferencesScreen> {
  bool priceDrops = true;
  bool newDiscounts = true;
  bool stockAlerts = false;
  bool generalNews = false;

  Future<void> updatePreferences() async {
    final response = await http.put(
      Uri.parse('http://localhost:3000/api/v1/notifications/preferences/${widget.userId}'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${widget.token}',
      },
      body: jsonEncode({
        'priceDrops': priceDrops,
        'newDiscounts': newDiscounts,
        'stockAlerts': stockAlerts,
        'generalNews': generalNews,
      }),
    );

    if (response.statusCode == 200) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Preferencias actualizadas')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Notificaciones')),
      body: ListView(
        children: [
          SwitchListTile(
            title: Text('Bajadas de precio'),
            subtitle: Text('Recibir alertas cuando bajen los precios'),
            value: priceDrops,
            onChanged: (value) {
              setState(() => priceDrops = value);
              updatePreferences();
            },
          ),
          SwitchListTile(
            title: Text('Ofertas y descuentos'),
            subtitle: Text('Nuevas promociones y descuentos'),
            value: newDiscounts,
            onChanged: (value) {
              setState(() => newDiscounts = value);
              updatePreferences();
            },
          ),
          SwitchListTile(
            title: Text('Alertas de stock'),
            subtitle: Text('Cuando productos agotados vuelvan'),
            value: stockAlerts,
            onChanged: (value) {
              setState(() => stockAlerts = value);
              updatePreferences();
            },
          ),
          SwitchListTile(
            title: Text('Noticias generales'),
            subtitle: Text('Novedades de la tienda'),
            value: generalNews,
            onChanged: (value) {
              setState(() => generalNews = value);
              updatePreferences();
            },
          ),
        ],
      ),
    );
  }
}
```

---

## 🧪 Pruebas

### Test 1: Suscribir Usuario
```powershell
# Paso 1: Suscribir usuario
$body = @{
  userId = "testuser123"
  fcmToken = "fake_token_for_testing"
  preferences = @{
    priceDrops = $true
    newDiscounts = $true
    stockAlerts = $true
    generalNews = $false
  }
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/api/v1/notifications/subscribe" `
  -Body $body `
  -ContentType "application/json"
```

### Test 2: Seguir Producto y Cambiar Precio
```powershell
# Paso 1: Seguir producto
$token = "tu-token"
$body = @{
  userId = "testuser123"
  productId = "abc123"
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/api/v1/notifications/follow" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body $body `
  -ContentType "application/json"

# Paso 2: Cambiar precio (bajar)
$updateBody = @{ price = 120 } | ConvertTo-Json

Invoke-RestMethod -Method Patch `
  -Uri "http://localhost:3000/api/v1/products/abc123" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body $updateBody `
  -ContentType "application/json"

# ✅ Notificación automática enviada!
```

---

## 🎯 Estructura de Notificación FCM

```json
{
  "notification": {
    "title": "¡Oferta! 🔥",
    "body": "Zapatilla Nike bajó de S/ 200.00 a S/ 150.00 (25% OFF)",
    "imageUrl": "https://cloudinary.com/image.jpg"
  },
  "data": {
    "productId": "abc123",
    "oldPrice": "200",
    "newPrice": "150",
    "discount": "25",
    "type": "price_drop"
  }
}
```

---

## ✅ Checklist de Implementación Flutter

- [ ] Instalar `firebase_messaging` y `firebase_core`
- [ ] Configurar Firebase en Android (`google-services.json`)
- [ ] Configurar Firebase en iOS (`GoogleService-Info.plist`)
- [ ] Obtener token FCM y enviar al backend
- [ ] Implementar listeners de notificaciones
- [ ] Crear pantalla de preferencias
- [ ] Implementar botón "Seguir producto"
- [ ] Probar notificaciones en primer plano
- [ ] Probar notificaciones en background
- [ ] Implementar navegación desde notificación al producto

---

## 📝 Notas

- Las notificaciones usan **Firebase Cloud Messaging** (no email)
- El token FCM se obtiene automáticamente en Flutter
- Las notificaciones funcionan en **Android** e **iOS**
- El backend ya está configurado con Firebase Admin SDK
- Las notificaciones son **gratis** con Firebase (hasta ciertos límites)

---

## 🆘 Troubleshooting

### Usuario no recibe notificaciones
1. Verificar que el token FCM esté registrado en Firebase
2. Verificar que las preferencias estén activadas
3. Verificar que el usuario esté siguiendo el producto
4. Revisar logs del backend

### Error al enviar notificación
1. Verificar que Firebase Admin SDK esté configurado
2. Verificar que el token FCM sea válido
3. Verificar que el producto tenga imageUrl

---

**¡Sistema de notificaciones listo para conectar con Flutter!** 🚀
