"""Excepciones de Dominio y Pipeline ETL (Core Exceptions)
Todos los mensajes de error están redactados en español técnico, claros, precisos y orientados a la acción.
"""


class AutoDataPipelineException(Exception):
    """Excepción base para todos los fallos controlados del sistema AutoData ETL."""

    def __init__(self, message: str, code: str = "ERR_PIPELINE_BASE"):
        self.message = message
        self.code = code
        super().__init__(f"[{self.code}] {self.message}")


class ScrapingNetworkException(AutoDataPipelineException):
    """Lanzada cuando un nodo o trabajador pierde conectividad con el portal objetivo."""

    def __init__(self, portal: str, original_error: str):
        super().__init__(
            message=f"Fallo de conectividad de red con el portal '{portal}'. "
                    f"Detalle técnico de socket: {original_error}. Se activa reintento con backoff exponencial.",
            code="ERR_SCRAPER_NETWORK_TIMEOUT",
        )


class RateLimit429Exception(AutoDataPipelineException):
    """Lanzada cuando el portal objetivo responde con HTTP 429 Too Many Requests."""

    def __init__(self, portal: str, proxy_ip: str, backoff_seconds: float):
        super().__init__(
            message=f"Límite de tasa excedido (HTTP 429) en '{portal}' utilizando el proxy '{proxy_ip}'. "
                    f"Rotación automática de IP ejecutada y espera obligatoria de {backoff_seconds:.1f} segundos.",
            code="ERR_HTTP_429_RATE_LIMIT",
        )


class DOMSelectorDriftException(AutoDataPipelineException):
    """Lanzada cuando la estructura HTML o el árbol DOM del portal cambia y no coinciden los selectores XPath/CSS."""

    def __init__(self, portal: str, selector: str, fallback_selector: str):
        super().__init__(
            message=f"Deriva de selectores DOM en '{portal}': El selector principal '{selector}' no produjo nodos válidos. "
                    f"Se activó la heurística de rescate con selector alternativo '{fallback_selector}'.",
            code="ERR_DOM_SELECTOR_DRIFT",
        )


class InvalidVINChecksumException(AutoDataPipelineException):
    """Lanzada cuando un VIN de 17 caracteres no cumple con la regla de dígito verificador ISO 3779 (módulo 11)."""

    def __init__(self, vin: str, expected_check: str, calculated_check: str):
        super().__init__(
            message=f"El VIN '{vin}' no superó la verificación de integridad ISO 3779 (Mod-11). "
                    f"Dígito esperado en posición 9: '{expected_check}', calculado: '{calculated_check}'. Registro enviado a DLQ.",
            code="ERR_SCHEMA_VIN_INVALID_CHECKSUM",
        )


class PriceOutOfRangeException(AutoDataPipelineException):
    """Lanzada cuando el precio extraído se encuentra fuera de los límites de negocio ($500 - $250,000 USD)."""

    def __init__(self, raw_price: str, parsed_price: float, min_val: float, max_val: float):
        super().__init__(
            message=f"Precio extraído fuera de los límites permitidos: Valor analizado ${parsed_price:,.2f} USD "
                    f"(cadena cruda: '{raw_price}') fuera del rango admisible [${min_val:,.2f} - ${max_val:,.2f} USD].",
            code="ERR_DATA_PRICE_OUT_OF_BOUNDS",
        )


class SQLInjectionAttemptException(AutoDataPipelineException):
    """Lanzada cuando se detecta un intento de inyección SQL o scripts maliciosos en campos alfanuméricos."""

    def __init__(self, field_name: str, suspicious_payload: str):
        super().__init__(
            message=f"ALERTA DE SEGURIDAD: Se detectó un patrón malicioso sospechoso en el campo '{field_name}'. "
                    f"Contenido neutralizado: '{suspicious_payload[:60]}...'. Se aborta la persistencia y se audita el incidente.",
            code="SEC_ERR_INJECTION_DETECTED",
        )


class NullFieldThresholdExceededException(AutoDataPipelineException):
    """Lanzada cuando un payload entrante excede el número máximo tolerado de campos nulos (> 3 campos nulos)."""

    def __init__(self, vin: str, null_count: int, threshold: int):
        super().__init__(
            message=f"Incumplimiento de SLA de calidad: El registro con VIN '{vin}' contiene {null_count} atributos nulos, "
                    f"superando el umbral máximo de {threshold}. Enrutado inmediatamente a la cola de mensajes muertos (DLQ).",
            code="ERR_SLA_NULL_THRESHOLD_EXCEEDED",
        )
