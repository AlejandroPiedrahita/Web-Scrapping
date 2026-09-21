"""Suite de Pruebas QA para el Pipeline ETL (test_etl.py)
Verifica la conformidad con la especificación ISO-VIN-2024.B, transformación de divisas,
detección y rechazo de Script Injection / SQL Injection, y reglas de calidad de datos.
"""

import pytest
import pandas as pd
from app.core.entities import VehicleRaw, VehicleStatus
from app.core.exceptions import (
    InvalidVINChecksumException,
    PriceOutOfRangeException,
    SQLInjectionAttemptException,
    NullFieldThresholdExceededException,
)
from app.domain.cleaner import VehicleCleanerService


class TestVehicleETLCleaner:
    """Conjunto de pruebas de validación de reglas de negocio y calidad de datos."""

    def test_clean_valid_vehicle_success(
        self, cleaner_service: VehicleCleanerService, valid_porsche_raw: VehicleRaw
    ):
        """Verifica que un registro válido se limpie, normalice y retorne en estado Clean Valid."""
        clean_item = cleaner_service.clean_record(valid_porsche_raw)

        assert clean_item.vin == "WP0AB2A94NS249811"
        assert clean_item.brand == "Porsche"
        assert clean_item.model == "911 Carrera S"
        assert clean_item.year == 2021
        assert clean_item.mileage_mi == 18450
        assert clean_item.scraped_price_usd == 118900.00
        assert clean_item.est_depr_value_usd > 100000.00
        assert clean_item.status == VehicleStatus.CLEAN_VALID
        assert len(clean_item.checksum_hash) == 64  # SHA-256 hash de 64 caracteres

    def test_cad_to_usd_currency_and_km_to_miles(
        self, cleaner_service: VehicleCleanerService, valid_tesla_cad_raw: VehicleRaw
    ):
        """Verifica la conversión de CAD a USD (~0.7338) y de odómetro en km a millas (x0.621371).

        Prueba exactamente el caso de uso visible en el diseño de la interfaz Stitch.
        """
        clean_item = cleaner_service.clean_record(valid_tesla_cad_raw)

        # $42,950 CAD * 0.7338 = ~$31,516.71 USD
        assert 31000.00 <= clean_item.scraped_price_usd <= 32000.00
        # 38,200 km * 0.621371 = ~23,736 millas
        assert clean_item.mileage_mi == int(38200 * 0.621371)
        assert clean_item.battery_health_pct == 94.2
        assert clean_item.postal_code == "94016"  # Remueve el sufijo -012

    def test_invalid_vin_checksum_rejection(self, cleaner_service: VehicleCleanerService):
        """Verifica que un VIN con dígito verificador adulterado sea rechazado de inmediato."""
        corrupted_vin_raw = VehicleRaw(
            raw_vin="WP0AB2A90NS249811",  # '0' en vez de '9' en la posición 9
            listing_price="$100,000",
            source_portal="AutoTrader",
        )

        with pytest.raises(InvalidVINChecksumException) as exc_info:
            cleaner_service.clean_record(corrupted_vin_raw)

        assert "no superó la verificación de integridad ISO 3779" in exc_info.value.message
        assert exc_info.value.code == "ERR_SCHEMA_VIN_INVALID_CHECKSUM"

    def test_script_injection_sanitization_and_neutralization(
        self, cleaner_service: VehicleCleanerService, malicious_script_injection_payload: VehicleRaw
    ):
        """Caso Borde de Seguridad: Ataques XSS e inyección de etiquetas <script>

        deben ser detectados y abortados con una excepción de seguridad explícita.
        """
        with pytest.raises(SQLInjectionAttemptException) as exc_info:
            cleaner_service.clean_record(malicious_script_injection_payload)

        assert "ALERTA DE SEGURIDAD" in exc_info.value.message
        assert exc_info.value.code == "SEC_ERR_INJECTION_DETECTED"

    def test_sql_injection_rejection(
        self, cleaner_service: VehicleCleanerService, malicious_sql_injection_payload: VehicleRaw
    ):
        """Caso Borde de Seguridad: Intento de evasión con sintaxis SQL clásica

        (' OR '1'='1', DROP TABLE, UNION SELECT).
        """
        with pytest.raises(SQLInjectionAttemptException) as exc_info:
            cleaner_service.clean_record(malicious_sql_injection_payload)

        assert "ALERTA DE SEGURIDAD" in exc_info.value.message
        assert "SEC_ERR_INJECTION_DETECTED" == exc_info.value.code

    def test_price_out_of_bounds_rejection(self, cleaner_service: VehicleCleanerService):
        """Verifica que precios menores a $500 o mayores a $250,000 USD disparen PriceOutOfRangeException."""
        too_cheap_raw = VehicleRaw(
            raw_vin="WP0AB2A99NS249811",
            listing_price="$45.00 USD",  # Menor al piso de $500
            source_portal="AutoTrader",
        )
        with pytest.raises(PriceOutOfRangeException) as exc_info:
            cleaner_service.clean_record(too_cheap_raw)
        assert exc_info.value.code == "ERR_DATA_PRICE_OUT_OF_BOUNDS"

        too_expensive_raw = VehicleRaw(
            raw_vin="WP0AB2A99NS249811",
            listing_price="$999,999.00 USD",  # Mayor al techo de $250k
            source_portal="AutoTrader",
        )
        with pytest.raises(PriceOutOfRangeException) as exc_info:
            cleaner_service.clean_record(too_expensive_raw)
        assert exc_info.value.code == "ERR_DATA_PRICE_OUT_OF_BOUNDS"

    def test_null_field_sla_threshold_exceeded(self, cleaner_service: VehicleCleanerService):
        """Verifica que payloads con más de 3 atributos nulos sean rechazados por la regla SLA."""
        mostly_empty_raw = VehicleRaw(
            raw_vin="",
            listing_price=None,
            title_meta=None,
            odometer_raw=None,
            source_portal="AutoTrader",
        )
        with pytest.raises(NullFieldThresholdExceededException) as exc_info:
            cleaner_service.clean_record(mostly_empty_raw)
        assert exc_info.value.code == "ERR_SLA_NULL_THRESHOLD_EXCEEDED"

    def test_pandas_vectorized_batch_processing(self, cleaner_service: VehicleCleanerService):
        """Verifica el procesamiento vectorizado en lote utilizando Pandas DataFrame."""
        batch_data = [
            {
                "raw_vin": "WP0AB2A99NS249811",
                "listing_price": "$118,900 USD",
                "title_meta": "Porsche 911 Carrera S",
                "brand": "Porsche",
                "model": "911 Carrera S",
                "year": 2021,
                "odometer_raw": "18,450 mi",
                "dealer_zip": "94016",
                "source_portal": "AutoTrader",
            },
            {
                "raw_vin": "WA1VAAF22MD019821",
                "listing_price": "$124,000 USD",
                "title_meta": "Audi RS6 Avant",
                "brand": "Audi",
                "model": "RS6 Avant",
                "year": 2022,
                "odometer_raw": "11,300 mi",
                "dealer_zip": "94016",
                "source_portal": "Cars.com",
            },
        ]
        raw_df = pd.DataFrame(batch_data)
        clean_df = cleaner_service.process_dataframe_batch(raw_df)

        assert not clean_df.empty
        assert len(clean_df) == 2
        assert "est_depr_value_usd" in clean_df.columns
        assert "checksum_hash" in clean_df.columns
