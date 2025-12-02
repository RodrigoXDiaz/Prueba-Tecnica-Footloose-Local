# Plantilla de Importación de Productos

## Formato del archivo Excel

El archivo Excel debe contener las siguientes columnas (en este orden):

| name | brand | model | color | size | price | stock | imageUrl | description |
|------|-------|-------|-------|------|-------|-------|----------|-------------|
| Zapato Deportivo Nike Air Max | Nike | Air Max 270 | Negro | 42 | 129.99 | 50 | https://example.com/image.jpg | Zapato deportivo de alta calidad |
| Zapatilla Running Adidas | Adidas | Ultraboost 21 | Blanco | 43 | 149.99 | 30 | https://example.com/image2.jpg | Perfecta para correr |

## Campos Requeridos

- **name**: Nombre del producto (texto)
- **brand**: Marca del producto (texto)
- **model**: Modelo del producto (texto)
- **color**: Color del producto (texto)
- **size**: Talla del producto (texto)
- **price**: Precio del producto (número decimal)
- **stock**: Cantidad en stock (número entero)

## Campos Opcionales

- **imageUrl**: URL de la imagen del producto
- **description**: Descripción detallada del producto

## Ejemplo de Datos

```
name,brand,model,color,size,price,stock,imageUrl,description
Zapato Deportivo,Nike,Air Max 270,Negro,42,129.99,50,https://example.com/nike.jpg,Zapato deportivo de alta calidad
Zapatilla Running,Adidas,Ultraboost 21,Blanco,43,149.99,30,https://example.com/adidas.jpg,Perfecta para correr
Zapato Casual,Puma,Suede Classic,Azul,41,89.99,25,https://example.com/puma.jpg,Estilo clásico
Botín Cuero,Timberland,Classic 6 Inch,Marrón,44,199.99,15,https://example.com/timberland.jpg,Resistente al agua
Sandalia Deportiva,Teva,Hurricane XLT2,Verde,40,59.99,40,https://example.com/teva.jpg,Perfecta para verano
```

## Notas Importantes

1. Asegúrate de que todos los campos requeridos estén presentes
2. El precio debe ser un número positivo
3. El stock debe ser un número entero positivo
4. La primera fila debe contener los nombres de las columnas
5. Puedes usar nombres en español o inglés para las columnas (el sistema los detecta automáticamente)

## Columnas alternativas en español

También puedes usar estos nombres de columnas:

- name → Nombre
- brand → Marca
- model → Modelo
- color → Color
- size → Talla
- price → Precio
- stock → Stock
- imageUrl → URL Imagen
- description → Descripción
