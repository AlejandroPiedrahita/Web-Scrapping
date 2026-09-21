"""Configuración de Pruebas y Fixtures (Pytest Conftest)
Define los generadores de datos crudos, payloads maliciosos y mocks de red.
"""

import pytest
from app.core.entities import VehicleRaw
from app.domain.cleaner import VehicleCleanerService


@pytest.fixture
def cleaner_service() -> VehicleCleanerService:
    """Fixture que proporciona una instancia del servicio de limpieza con cotas estándar."""
    return VehicleCleanerService(min_price=500.0, max_price=250000.0)


@pytest.fixture
def valid_porsche_raw() -> VehicleRaw:
    """Fixture de un vehículo Porsche con VIN verificado y precio en USD."""
    return VehicleRaw(
        raw_vin="WP0AB2A94NS249811",  # 17 chars, valid check digit (4 en pos 9)
        listing_price="$118,900 USD",
        title_meta="Porsche 911 Carrera S Coupe 2021",
        brand="Porsche",
        model="911 Carrera S",
        year=2021,
        odometer_raw="18,450 mi",
        dealer_zip="94016-012",
        source_portal="AutoTrader",
    )


@pytest.fixture
def valid_tesla_cad_raw() -> VehicleRaw:
    """Fixture del caso de prueba mostrado en la interfaz Stitch:

    Tesla Model 3 con precio sucio en CAD, odómetro en km y código postal con sufijo.
    """
    return VehicleRaw(
        raw_vin="5YJ3E1EB3NF193820",  # 17 chars, valid check digit (3 en pos 9)
        listing_price=" $ 42,950 CAD ",
        title_meta="Tesla Model 3 Long-Range Dual Motor",
        brand="Tesla",
        model="Model 3",
        year=2022,
        odometer_raw="38,200 km",
        battery_pack_health="94.2%",
        dealer_zip="94016-012",
        source_portal="Carvana",
    )


@pytest.fixture
def malicious_script_injection_payload() -> VehicleRaw:
    """Payload de prueba que simula un intento de ataque XSS mediante inyección de script."""
    return VehicleRaw(
        raw_vin="WP0AB2A94NS249811",
        listing_price="$45,000",
        title_meta="<script>alert('XSS_ATTACK_EXPLOIT');</script> Corvette Z06",
        brand="Chevrolet<script>",
        model="Corvette",
        year=2021,
        odometer_raw="10,000 mi",
        dealer_zip="94016",
        source_portal="AutoTrader",
    )


@pytest.fixture
def malicious_sql_injection_payload() -> VehicleRaw:
    """Payload de prueba que simula un intento de ataque de SQL Injection en el VIN o título."""
    return VehicleRaw(
        raw_vin="' OR '1'='1'; DROP TABLE vehicles_clean; --",
        listing_price="$50,000",
        title_meta="Mustang GT ' UNION SELECT null, username, password FROM users --",
        brand="Ford",
        model="Mustang",
        year=2022,
        odometer_raw="5,000 mi",
        dealer_zip="94016",
        source_portal="Cars.com",
    )
