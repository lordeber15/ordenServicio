# Guia de Facturacion Electronica SUNAT - Firma Digital y Emision de Comprobantes

## Indice

1. [Requisitos Previos](#1-requisitos-previos)
2. [Certificado Digital](#2-certificado-digital)
3. [Estructura XML UBL 2.1](#3-estructura-xml-ubl-21)
4. [Proceso de Firma Digital](#4-proceso-de-firma-digital)
5. [Envio a SUNAT (Web Services SOAP)](#5-envio-a-sunat-web-services-soap)
6. [CDR - Constancia de Recepcion](#6-cdr---constancia-de-recepcion)
7. [Flujograma Completo](#7-flujograma-completo)
8. [Diferencias Factura vs Boleta](#8-diferencias-factura-vs-boleta)
9. [Resumen Diario y Comunicacion de Baja](#9-resumen-diario-y-comunicacion-de-baja)
10. [Archivos del Proyecto](#10-archivos-del-proyecto)
11. [Variables de Entorno](#11-variables-de-entorno)
12. [Catalogos SUNAT Importantes](#12-catalogos-sunat-importantes)

---

## 1. Requisitos Previos

Antes de poder emitir comprobantes electronicos necesitas cumplir estos requisitos:

### 1.1 Ante SUNAT

| Requisito | Descripcion |
|-----------|-------------|
| **RUC activo** | El emisor debe tener RUC en estado activo y condicion de habido |
| **Emisor electronico** | Estar habilitado en el Registro de Emisores Electronicos desde SUNAT Operaciones en Linea (SOL) |
| **Clave SOL secundaria** | Crear un usuario secundario con permisos de facturacion electronica |
| **Series autorizadas** | Facturas: serie `F___` (ej: F001). Boletas: serie `B___` (ej: B001) |
| **Homologacion** | Proceso de validacion en entorno beta antes de pasar a produccion |

### 1.2 Clave SOL (Usuario Secundario)

Para el envio por web service se necesita una **clave SOL secundaria** (no la principal):

- Se crea desde: **SUNAT Operaciones en Linea -> Menu SOL -> Mis Claves SOL -> Registro de Usuarios Secundarios**
- Datos necesarios:
  - `usuario_sol`: nombre del usuario secundario
  - `clave_sol`: contrasena del usuario secundario

**Para el entorno BETA (pruebas):**
```
RUC:          (el RUC del emisor)
Usuario SOL:  MODDATOS
Clave SOL:    MODDATOS
```

### 1.3 Certificado Digital

Ver seccion 2 completa mas abajo.

### 1.4 Software / Librerias Necesarias (Node.js)

| Libreria | Funcion |
|----------|---------|
| `node-forge` | Cargar certificado P12, extraer clave privada y certificado X.509 |
| `xml-crypto` | Firma digital XMLDSig (RSA-SHA1) |
| `soap` | Cliente SOAP para comunicarse con los web services de SUNAT |
| `adm-zip` | Comprimir XML en ZIP (envio) y descomprimir CDR (respuesta) |
| `@xmldom/xmldom` | Parsear XML de respuestas CDR |
| `qrcode` | Generar codigo QR para representacion impresa |
| `puppeteer` | Generar PDF de representacion impresa |

---

## 2. Certificado Digital

### 2.1 Que es

El certificado digital es un archivo criptografico (X.509) que contiene:
- **Clave privada**: Para firmar los documentos XML
- **Certificado publico**: Para que SUNAT verifique la firma
- **Cadena de confianza**: Certificados intermedios de la entidad certificadora

SUNAT lo exige para garantizar **autenticidad**, **integridad** y **no repudio** de cada comprobante.

### 2.2 Formatos

| Formato | Extension | Descripcion |
|---------|-----------|-------------|
| **PKCS#12** | `.p12`, `.pfx` | Contenedor binario con clave privada + certificado + cadena CA. **Es el formato que se usa.** |
| **PEM** | `.pem`, `.crt`, `.key` | Formato texto Base64. Se puede convertir desde P12 |
| **DER** | `.der`, `.cer` | Formato binario del certificado (sin clave privada) |

### 2.3 Donde obtenerlo

**Para produccion** - Proveedores acreditados por INDECOPI:
- RENIEC (certificados de persona juridica)
- Indenova (Camerfirma Peru)
- LLAMA.PE
- Acepta.com
- WISeKey Peru

El certificado debe ser de **persona juridica** vinculado al RUC del emisor, con clave RSA de al menos **2048 bits**.

**Para pruebas (beta)** - Se puede generar un certificado autofirmado:
```bash
# Generar clave privada y certificado autofirmado
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem -out cert.pem

# Empaquetar en formato P12
openssl pkcs12 -export -out certificado.p12 \
  -inkey key.pem -in cert.pem -passout pass:mi_contrasena
```

### 2.4 Como se carga en el proyecto

**Archivo:** `src/infrastructure/external_services/sunat/certificateLoader.js`

```
Certificado P12 (.p12/.pfx)
        |
        v
  node-forge extrae:
        |
        +-- privateKeyPem   --> Para firmar el XML (clave privada en formato PEM)
        |
        +-- certPem          --> Certificado publico en PEM
        |
        +-- certBase64       --> Certificado DER en Base64 (para <ds:X509Certificate>)
```

El certificado se cachea en memoria por 1 hora para evitar cargarlo en cada emision.

**Configuracion en `.env`:**
```
SUNAT_CERT_PATH=./storage/certs/certificado.p12
SUNAT_CERT_PASSWORD=contrasena_del_p12
```

---

## 3. Estructura XML UBL 2.1

SUNAT exige que los comprobantes electronicos se generen en formato **XML UBL 2.1** (Universal Business Language).

### 3.1 Namespaces obligatorios

```xml
<Invoice
  xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
  xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
```

### 3.2 Elementos obligatorios

```
Invoice (o CreditNote / DebitNote)
|
+-- UBLExtensions
|   +-- UBLExtension
|       +-- ExtensionContent    <-- Aqui se inyecta la firma digital
|
+-- UBLVersionID               = "2.1"
+-- CustomizationID            = "2.0"
+-- ID                         = "F001-00000001" (serie-correlativo)
+-- IssueDate                  = "2026-02-15"
+-- IssueTime                  = "10:30:00"
+-- InvoiceTypeCode            = "01" (factura) o "03" (boleta)
|   +-- listID                 = "0101" (contado) o "0102" (credito)
+-- DocumentCurrencyCode       = "PEN"
|
+-- Signature (cac)            = Referencia al firmante
|
+-- AccountingSupplierParty    = Datos del EMISOR
|   +-- RUC, razon social, direccion, ubigeo
|
+-- AccountingCustomerParty    = Datos del CLIENTE
|   +-- Tipo documento, numero, razon social
|
+-- PaymentTerms               = Forma de pago (Contado/Credito + cuotas)
|
+-- TaxTotal                   = Impuestos globales
|   +-- IGV (1000), EXO (9997), INA (9998), GRA (9996)
|
+-- LegalMonetaryTotal         = Totales monetarios
|   +-- op_gravadas, op_exoneradas, op_inafectas, igv, total
|
+-- InvoiceLine (x N)          = Lineas de detalle
    +-- cantidad, unidad, descripcion
    +-- precio unitario, valor venta
    +-- impuestos por linea
```

### 3.3 Nomenclatura de archivos

SUNAT exige un formato estricto para el nombre:

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Factura (01) | `{RUC}-01-{serie}-{correlativo}` | `20123456789-01-F001-00000001` |
| Boleta (03) | `{RUC}-03-{serie}-{correlativo}` | `20123456789-03-B001-00000001` |
| Nota Credito (07) | `{RUC}-07-{serie}-{correlativo}` | `20123456789-07-FC01-00000001` |
| Nota Debito (08) | `{RUC}-08-{serie}-{correlativo}` | `20123456789-08-FD01-00000001` |
| Resumen Diario | `{RUC}-RC-{YYYYMMDD}-{N}` | `20123456789-RC-20260215-1` |
| Comunicacion Baja | `{RUC}-RA-{YYYYMMDD}-{N}` | `20123456789-RA-20260215-1` |
| Guia Remision (09) | `{RUC}-09-{serie}-{correlativo}` | `20123456789-09-T001-00000001` |

---

## 4. Proceso de Firma Digital

### 4.1 Estandar requerido por SUNAT

SUNAT exige **XMLDSig** (XML Digital Signature) con perfil compatible con **XAdES-BES**:

| Componente | Algoritmo | URI |
|------------|-----------|-----|
| **Firma** | RSA-SHA1 | `http://www.w3.org/2000/09/xmldsig#rsa-sha1` |
| **Canonicalizacion** | C14N exclusivo | `http://www.w3.org/TR/2001/REC-xml-c14n-20010315` |
| **Digest (Hash)** | SHA-1 | `http://www.w3.org/2000/09/xmldsig#sha1` |
| **Transform 1** | Enveloped Signature | `http://www.w3.org/2000/09/xmldsig#enveloped-signature` |
| **Transform 2** | Canonical XML 1.0 | `http://www.w3.org/TR/2001/REC-xml-c14n-20010315` |

> **Nota:** SUNAT esta migrando progresivamente a SHA-256. Es recomendable evaluar la migracion para produccion.

### 4.2 Estructura de la firma (XMLDSig Enveloped)

La firma se inserta DENTRO del documento XML, en `<ext:ExtensionContent>`:

```xml
<ext:UBLExtensions>
  <ext:UBLExtension>
    <ext:ExtensionContent>

      <ds:Signature Id="SignatureKG">

        <!-- 1. QUE se firma y COMO -->
        <ds:SignedInfo>
          <ds:CanonicalizationMethod Algorithm="...xml-c14n..."/>
          <ds:SignatureMethod Algorithm="...rsa-sha1"/>
          <ds:Reference URI="">
            <ds:Transforms>
              <ds:Transform Algorithm="...enveloped-signature"/>
              <ds:Transform Algorithm="...xml-c14n..."/>
            </ds:Transforms>
            <ds:DigestMethod Algorithm="...sha1"/>
            <ds:DigestValue>aB3cD4eF5gH6i...</ds:DigestValue>
          </ds:Reference>
        </ds:SignedInfo>

        <!-- 2. La firma RSA del SignedInfo -->
        <ds:SignatureValue>MIIBpQYJKoZIhvc...</ds:SignatureValue>

        <!-- 3. Certificado X.509 para verificacion -->
        <ds:KeyInfo>
          <ds:X509Data>
            <ds:X509Certificate>MIICxTCCAa2g...</ds:X509Certificate>
          </ds:X509Data>
        </ds:KeyInfo>

      </ds:Signature>

    </ext:ExtensionContent>
  </ext:UBLExtension>
</ext:UBLExtensions>
```

### 4.3 Paso a paso del proceso de firma

```
PASO 1: Generar XML sin firma
    El builder genera el XML UBL 2.1 completo
    con <ext:ExtensionContent/> VACIO
            |
            v
PASO 2: Canonicalizar el documento
    Se aplica C14N (Canonical XML 1.0)
    Normaliza whitespace, ordena atributos, etc.
            |
            v
PASO 3: Calcular DigestValue
    Se aplican los transforms (enveloped-signature + C14N)
    al documento y se calcula hash SHA-1
    Se codifica en Base64 --> <ds:DigestValue>
            |
            v
PASO 4: Construir SignedInfo
    Se arma el bloque <ds:SignedInfo> con:
    - Metodo de canonicalizacion
    - Metodo de firma
    - Referencia (URI vacio = documento completo)
    - Transforms y DigestValue del paso anterior
            |
            v
PASO 5: Canonicalizar SignedInfo
    Se aplica C14N al bloque SignedInfo mismo
            |
            v
PASO 6: Firmar con clave privada
    Se firma el SignedInfo canonicalizado
    usando RSA-SHA1 con la clave privada del P12
    Resultado en Base64 --> <ds:SignatureValue>
            |
            v
PASO 7: Ensamblar Signature
    Se construye <ds:Signature> completo:
    SignedInfo + SignatureValue + KeyInfo (cert X.509)
            |
            v
PASO 8: Inyectar en ExtensionContent
    Se reemplaza <ext:ExtensionContent/> vacio
    con el bloque Signature completo
            |
            v
    XML FIRMADO LISTO PARA ENVIAR
```

### 4.4 Implementacion en el proyecto

**Archivo:** `src/infrastructure/external_services/sunat/xmlSigner.js`

Usa la libreria `xml-crypto` que implementa XMLDSig:

```javascript
const sig = new crypto.SignedXml({ idMode: "wssecurity" });
sig.signatureAlgorithm = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";
sig.canonicalizationAlgorithm = "http://www.w3.org/TR/2001/REC-xml-c14n-20010315";

sig.addReference({
  xpath: "/*",                    // Firma el documento completo
  digestAlgorithm: "...sha1",
  transforms: ["...enveloped-signature", "...xml-c14n..."],
});

sig.signingKey = privateKeyPem;   // Clave privada del certificado
sig.keyInfoProvider = {
  getKeyInfo: () =>
    `<ds:X509Data>
       <ds:X509Certificate>${certBase64}</ds:X509Certificate>
     </ds:X509Data>`,
};

sig.computeSignature(xmlString);  // Genera la firma
```

---

## 5. Envio a SUNAT (Web Services SOAP)

### 5.1 Endpoints

#### Entorno Beta / Homologacion

| Servicio | URL WSDL |
|----------|----------|
| Facturas, Boletas, NC, ND | `https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService?wsdl` |
| Guias de Remision | `https://e-beta.sunat.gob.pe/ol-ti-itemision-guia-pse1/billService?wsdl` |
| Resumenes y Bajas | `https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService?wsdl` |

#### Entorno Produccion

| Servicio | URL WSDL |
|----------|----------|
| Facturas, Boletas, NC, ND | `https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService?wsdl` |
| Guias de Remision | `https://e-guiaremision.sunat.gob.pe/ol-ti-itemision-guia-pse1/billService?wsdl` |
| Resumenes y Bajas | `https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService?wsdl` |

### 5.2 Operaciones SOAP

| Operacion | Tipo | Uso | Retorna |
|-----------|------|-----|---------|
| `sendBill` | Sincrono | Factura, Boleta individual, NC, ND, Guia | CDR (Base64 ZIP) |
| `sendSummary` | Asincrono | Resumen Diario (RC), Comunicacion de Baja (RA) | Ticket (string) |
| `getStatus` | Consulta | Resultado de sendSummary | statusCode + CDR |
| `getStatusCdr` | Consulta | Consultar CDR de un CPE previamente enviado | CDR (Base64 ZIP) |

### 5.3 Autenticacion (WSSecurity)

Todos los endpoints usan **WS-Security con UsernameToken**:

```
Username:  {RUC}{USUARIO_SOL}   (concatenados, ej: 20123456789MODDATOS)
Password:  {CLAVE_SOL}          (la contrasena SOL secundaria)
Tipo:      PasswordText
```

### 5.4 Formato del request SOAP

```xml
<soapenv:Envelope xmlns:soapenv="..." xmlns:ser="http://service.sunat.gob.pe">
  <soapenv:Header>
    <wsse:Security>
      <wsse:UsernameToken>
        <wsse:Username>20123456789MODDATOS</wsse:Username>
        <wsse:Password>MODDATOS</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
  </soapenv:Header>
  <soapenv:Body>
    <ser:sendBill>
      <fileName>20123456789-01-F001-00000001.zip</fileName>
      <contentFile>UEsDBBQAAAAI...</contentFile>  <!-- ZIP en Base64 -->
    </ser:sendBill>
  </soapenv:Body>
</soapenv:Envelope>
```

### 5.5 Proceso de envio paso a paso

```
XML FIRMADO
    |
    v
PASO 1: Comprimir en ZIP
    Nombre del ZIP: {RUC}-{tipo}-{serie}-{correlativo}.zip
    Contenido:      {RUC}-{tipo}-{serie}-{correlativo}.xml
            |
            v
PASO 2: Codificar en Base64
    zipBuffer.toString("base64")
            |
            v
PASO 3: Crear cliente SOAP
    soap.createClient(wsdlUrl)
    + Agregar WSSecurity (username + password)
            |
            v
PASO 4: Invocar sendBill
    Enviar: { fileName: "...zip", contentFile: "base64..." }
            |
            v
PASO 5: Recibir respuesta
    SUNAT retorna: applicationResponse (Base64 de un ZIP)
    Dentro del ZIP: R-{nombreOriginal}.xml (el CDR)
```

**Archivo:** `src/infrastructure/external_services/sunat/sunatClient.js`

---

## 6. CDR - Constancia de Recepcion

### 6.1 Que es

El CDR es la respuesta oficial de SUNAT. Es un ZIP en Base64 que contiene un XML `ApplicationResponse` UBL 2.1.

### 6.2 Codigos de respuesta

| ResponseCode | Significado | Accion |
|--------------|-------------|--------|
| `0` | **ACEPTADO** sin observaciones | CPE valido. Almacenar CDR |
| `2000-3999` | **ACEPTADO CON OBSERVACIONES** | CPE valido pero tiene warnings. Revisar notas |
| `1xxx` | **RECHAZADO** | CPE invalido. Corregir y reenviar |
| SOAP Fault | **Error de servicio** | Reintentar o corregir estructura |

### 6.3 Datos que se extraen del CDR

```
CDR (ZIP Base64)
    |
    v
Descomprimir --> R-{nombre}.xml
    |
    v
Parsear XML ApplicationResponse:
    |
    +-- responseCode      "0" = aceptado
    +-- description       "La Factura numero F001-1, ha sido aceptada"
    +-- notes[]           Observaciones adicionales
    +-- digestValue       Hash del CPE (necesario para el QR)
```

**Archivo:** `src/infrastructure/external_services/sunat/cdrParser.js`

### 6.4 Codigo QR

Despues de obtener el `digestValue` del CDR, se genera un QR con este formato (pipe-delimited):

```
{RUC}|{tipo}|{serie}|{correlativo}|{IGV}|{total}|{fecha}|{tipoDocCliente}|{nroDocCliente}|{hash}
```

Ejemplo:
```
20123456789|01|F001|00000001|18.00|118.00|2026-02-15|6|20987654321|aB3cD4eF5g==
```

**Archivo:** `src/infrastructure/external_services/sunat/qrGenerator.js`

---

## 7. Flujograma Completo

### 7.1 Emision de Factura/Boleta (flujo sincrono)

```
+------------------+
| INICIO           |
| Usuario crea     |
| comprobante en   |
| el frontend      |
+--------+---------+
         |
         v
+------------------+
| Frontend envia   |
| POST /comprobante|
| (crea cabecera   |
| + detalles en BD)|
+--------+---------+
         |
         v
+------------------+
| Frontend envia   |
| POST /comprobante|
| /emitir          |
+--------+---------+
         |
         v
+------------------+
| Backend carga    |
| Comprobante +    |
| relaciones de BD |
| (Emisor, Cliente,|
| Detalles, etc.)  |
+--------+---------+
         |
         v
+------------------+
| Validar:         |
| - No enviado     |
| - Tipo soportado |
| - Emisor existe  |
+--------+---------+
         |
         v
+------------------+         +------------------+
| Seleccionar      |         | facturaBuilder   |
| Builder segun    +-------->| boletaBuilder    |
| tipo_comprobante |         | (UBL 2.1)       |
+------------------+         +--------+---------+
                                      |
                                      v
                             +------------------+
                             | XML sin firma    |
                             | generado         |
                             +--------+---------+
                                      |
                                      v
                             +------------------+
                             | Cargar           |
                             | certificado P12  |
                             | (certificateLoader)|
                             +--------+---------+
                                      |
                                      v
                             +------------------+
                             | Firmar XML       |
                             | RSA-SHA1         |
                             | (xmlSigner)      |
                             +--------+---------+
                                      |
                                      v
                             +------------------+
                             | Guardar XML      |
                             | firmado en disco  |
                             | storage/xml/     |
                             +--------+---------+
                                      |
                                      v
                             +------------------+
                             | Comprimir XML    |
                             | en ZIP + Base64  |
                             +--------+---------+
                                      |
                                      v
                             +------------------+
                             | Enviar a SUNAT   |
                             | via SOAP         |
                             | (sunatClient     |
                             |  .sendBill)      |
                             +--------+---------+
                                      |
                           +----------+----------+
                           |                     |
                           v                     v
                  +----------------+    +----------------+
                  | SUNAT ACEPTA   |    | SUNAT RECHAZA  |
                  | (code 0/2xxx)  |    | (code 1xxx)    |
                  +-------+--------+    +-------+--------+
                          |                     |
                          v                     v
                  +----------------+    +----------------+
                  | Guardar CDR    |    | estado = "RR"  |
                  | Parsear resp.  |    | Guardar error  |
                  | Extraer hash   |    | Responder 422  |
                  +-------+--------+    +----------------+
                          |
                          v
                  +----------------+
                  | Generar QR     |
                  | con hash CPE   |
                  +-------+--------+
                          |
                          v
                  +----------------+
                  | Actualizar BD: |
                  | estado = "AC"  |
                  | hash_cpe       |
                  | codigo_sunat   |
                  | nombre_xml     |
                  +-------+--------+
                          |
                          v
                  +----------------+
                  | Incrementar    |
                  | correlativo    |
                  | de la Serie    |
                  +-------+--------+
                          |
                          v
                  +----------------+
                  | Responder JSON |
                  | con resultado  |
                  | + URLs pdf/xml |
                  +----------------+
```

### 7.2 Flujo de descarga de PDF

```
GET /comprobante/:id/pdf
         |
         v
Cargar Comprobante + relaciones
         |
         v
Existe PDF en storage/pdf/?
    |             |
   SI            NO
    |             |
    v             v
Enviar PDF   Generar HTML con datos
             + QR Code
                  |
                  v
             Puppeteer renderiza
             HTML --> PDF (A4)
                  |
                  v
             Guardar en storage/pdf/
                  |
                  v
             Enviar PDF al cliente
```

---

## 8. Diferencias Factura vs Boleta

| Caracteristica | Factura (01) | Boleta (03) |
|---------------|--------------|-------------|
| **Serie** | Empieza con `F` (F001) | Empieza con `B` (B001) |
| **Cliente** | RUC obligatorio (tipo doc 6) | Puede ser anonimo (tipo doc 0) o DNI |
| **listID Contado** | `0101` | `0301` |
| **listID Credito** | `0102` | `0302` |
| **Envio a SUNAT** | Sincrono obligatorio (`sendBill`) | Sincrono individual o via Resumen Diario |
| **Plazo envio** | 7 dias calendario | Individual: 7 dias / RC: dia siguiente |
| **Anulacion** | Via Comunicacion de Baja (RA) | Via Resumen Diario con condicion `3` |

---

## 9. Resumen Diario y Comunicacion de Baja

### 9.1 Resumen Diario (RC)

**Proposito:** Informar a SUNAT sobre las boletas emitidas en un dia, enviadas en lote al dia siguiente.

```
PASO 1: Recolectar boletas del dia
         |
         v
PASO 2: Construir XML RC
    - ID: RC-{YYYYMMDD}-{correlativo}
    - ReferenceDate: fecha de las boletas
    - IssueDate: fecha de envio (dia siguiente)
    - Una SummaryDocumentsLine por boleta
         |
         v
PASO 3: Firmar XML
         |
         v
PASO 4: Enviar via sendSummary (asincrono)
    SUNAT retorna un TICKET (string)
         |
         v
PASO 5: Esperar procesamiento
    (puede tardar segundos a minutos)
         |
         v
PASO 6: Consultar estado con getStatus(ticket)
    - statusCode "0"  = procesado OK
    - statusCode "98" = aun en proceso (reintentar)
    - statusCode "99" = error
         |
         v
PASO 7: Parsear CDR si statusCode = "0"
```

**Condiciones por linea:**
| Codigo | Significado |
|--------|-------------|
| `1` | Adicion (boleta nueva) |
| `2` | Modificacion (correccion) |
| `3` | Anulacion de boleta |

### 9.2 Comunicacion de Baja (RA)

**Proposito:** Anular facturas, NC o ND ya aceptadas por SUNAT.

- Mismo flujo asincrono que el RC (sendSummary -> ticket -> getStatus)
- Plazo maximo: **7 dias naturales** despues de la emision
- Solo para tipos 01 (Factura), 07 (NC), 08 (ND)
- Las boletas se anulan via Resumen Diario con condicion `3`

---

## 10. Archivos del Proyecto

### 10.1 Servicios SUNAT (Backend)

```
Backend_servicios_imprenta/
|
+-- src/infrastructure/external_services/sunat/
|   |
|   +-- certificateLoader.js     Carga certificado P12, extrae privateKey y certBase64
|   +-- xmlSigner.js             Firma XML con RSA-SHA1, inyecta en ExtensionContent
|   +-- sunatClient.js           Cliente SOAP con WSSecurity (sendBill, sendSummary, getStatus)
|   +-- cdrParser.js             Descomprime ZIP CDR, parsea ResponseCode/Description/DigestValue
|   +-- qrGenerator.js           Genera QR en formato pipe-delimited de SUNAT
|   +-- pdfGenerator.js          Genera PDF via Puppeteer (representacion impresa)
|   +-- storageHelper.js         Gestiona almacenamiento en disco (XML, CDR, PDF)
|   |
|   +-- xmlBuilders/
|       +-- facturaBuilder.js         Genera XML Factura + NC/ND (UBL 2.1)
|       +-- boletaBuilder.js          Genera XML Boleta (wrapper sobre facturaBuilder)
|       +-- resumenDiarioBuilder.js   Genera XML Resumen Diario RC
|       +-- comunicacionBajaBuilder.js Genera XML Comunicacion de Baja RA
|       +-- guiaRemisionBuilder.js    Genera XML Guia de Remision
|
+-- src/infrastructure/web/
|   +-- controllers/facturacion/
|   |   +-- sunat.controller.js       Orquesta todo el flujo de emision (5 endpoints)
|   |
|   +-- routes/facturacion/
|       +-- sunat.routes.js           Define las rutas Express
|
+-- storage/                          Almacenamiento persistente
    +-- xml/                          XMLs firmados
    +-- pdf/                          PDFs generados
    +-- cdr/                          Respuestas CDR de SUNAT (ZIP)
    +-- certs/                        Certificado digital (.p12)
```

### 10.2 Endpoints disponibles

| Metodo | Ruta | Funcion |
|--------|------|---------|
| `POST` | `/comprobante/emitir` | Emitir comprobante a SUNAT |
| `POST` | `/comprobante/:id/reenviar` | Reintentar envio rechazado |
| `GET` | `/comprobante/:id/estado` | Consultar estado SUNAT |
| `GET` | `/comprobante/:id/pdf` | Descargar PDF |
| `GET` | `/comprobante/:id/xml` | Descargar XML firmado |
| `POST` | `/resumen-diario` | Enviar resumen diario de boletas |
| `POST` | `/comunicacion-baja` | Enviar comunicacion de baja |
| `POST` | `/guia/emitir` | Emitir guia de remision |

### 10.3 Frontend (Servicios)

```
ordenServicio/src/
|
+-- modules/Billing/services/
|   +-- comprobantes.js          getPdfUrl(), getXmlUrl()
|
+-- shared/services/
    +-- caja.js                  getVentasDia() (lista ventas con tipo)
```

---

## 11. Variables de Entorno

```env
# ========== CERTIFICADO DIGITAL ==========
SUNAT_CERT_PATH=./storage/certs/certificado.p12
SUNAT_CERT_PASSWORD=contrasena_del_p12

# ========== ENTORNO ==========
SUNAT_ENV=beta                  # Cambiar a "produccion" cuando este listo

# ========== WEB SERVICES - BETA ==========
SUNAT_WS_FACTURAS=https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService?wsdl
SUNAT_WS_GUIAS=https://e-beta.sunat.gob.pe/ol-ti-itemision-guia-pse1/billService?wsdl
SUNAT_WS_RESUMEN=https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService?wsdl

# ========== WEB SERVICES - PRODUCCION (activar cuando corresponda) ==========
# SUNAT_WS_FACTURAS=https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService?wsdl
# SUNAT_WS_GUIAS=https://e-guiaremision.sunat.gob.pe/ol-ti-itemision-guia-pse1/billService?wsdl
# SUNAT_WS_RESUMEN=https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService?wsdl

# ========== ALMACENAMIENTO ==========
SUNAT_STORAGE_PATH=./storage
```

---

## 12. Catalogos SUNAT Importantes

### Catalogo 01 - Tipo de Documento

| Codigo | Documento |
|--------|-----------|
| `01` | Factura |
| `03` | Boleta de Venta |
| `07` | Nota de Credito |
| `08` | Nota de Debito |
| `09` | Guia de Remision |

### Catalogo 05 - Tipo de Tributo

| Codigo | Nombre | Codigo Internacional |
|--------|--------|---------------------|
| `1000` | IGV (18%) | `VAT` |
| `9997` | Exonerado | `VAT` |
| `9998` | Inafecto | `FRE` |
| `9996` | Gratuito | `FRE` |
| `7152` | ICBPER (bolsas plasticas) | `OTH` |

### Catalogo 06 - Tipo de Documento de Identidad

| Codigo | Documento |
|--------|-----------|
| `0` | Sin documento |
| `1` | DNI |
| `4` | Carnet de Extranjeria |
| `6` | RUC |
| `7` | Pasaporte |

### Catalogo 07 - Tipo de Afectacion IGV

| Codigo | Tipo |
|--------|------|
| `10` | Gravado - Operacion Onerosa |
| `20` | Exonerado - Operacion Onerosa |
| `30` | Inafecto - Operacion Onerosa |
| `40` | Exportacion |

### Catalogo 15 - Forma de Pago (listID)

| Codigo | Tipo |
|--------|------|
| `0101` | Factura - Contado |
| `0102` | Factura - Credito |
| `0301` | Boleta - Contado |
| `0302` | Boleta - Credito |

---

## Validaciones que hace SUNAT al recibir un CPE

1. Estructura XML valida contra esquema UBL 2.1
2. Firma digital valida (certificado vigente, hash correcto)
3. RUC del emisor activo y habido
4. Correlativo no duplicado para la serie
5. Serie autorizada para el tipo de comprobante
6. Consistencia de montos (totales = suma de lineas)
7. Tipo de afectacion IGV correcto por linea
8. Tipo de documento del cliente valido segun tipo de comprobante

## Plazos Legales

| Documento | Plazo maximo de envio |
|-----------|----------------------|
| Factura | 7 dias calendario desde emision |
| Boleta (individual) | 7 dias calendario desde emision |
| Resumen Diario | Dia siguiente a la fecha de las boletas |
| Comunicacion de Baja | 7 dias calendario desde emision del comprobante |
