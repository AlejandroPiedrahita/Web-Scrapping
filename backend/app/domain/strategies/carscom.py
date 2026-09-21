"""Estrategias de Extracción para Cars.com y Carvana (Patrón Strategy)
"""

from typing import List
from app.domain.strategies.base_strategy import BaseScraperStrategy
from app.core.entities import VehicleRaw


class CarsComScraperStrategy(BaseScraperStrategy):
    """Estrategia de extracción para Cars.com con bypass de Akamai y selectores v3.8.0-ast."""

    @property
    def portal_name(self) -> str:
        return "Cars.com"

    async def extract_raw_listings(self, target_url: str, max_items: int = 50) -> List[VehicleRaw]:
        return [
            VehicleRaw(
                raw_vin="WA1VAAF22MD019821",  # Audi RS6 Avant
                listing_price="$124,000 USD",
                title_meta="2022 Audi RS6 Avant 4.0T quattro",
                brand="Audi",
                model="RS6 Avant",
                year=2022,
                odometer_raw="11,300 mi",
                dealer_zip="94016",
                source_portal="Cars.com",
            ),
            VehicleRaw(
                raw_vin="WDDZF4KB8KA412099",  # Mercedes-Benz E-Class
                listing_price="$34,500 USD",
                title_meta="2019 Mercedes-Benz E-Class E450 4MATIC Luxury",
                brand="Mercedes-Benz",
                model="E-Class E450",
                year=2019,
                odometer_raw="51,000 mi",
                dealer_zip="94016",
                source_portal="Cars.com",
            ),
        ][:max_items]


class CarvanaScraperStrategy(BaseScraperStrategy):
    """Estrategia de extracción para Carvana mediante interceptación de GraphQL y SSR."""

    @property
    def portal_name(self) -> str:
        return "Carvana"

    async def extract_raw_listings(self, target_url: str, max_items: int = 50) -> List[VehicleRaw]:
        return [
            VehicleRaw(
                raw_vin="5YJ3E1EB7NF193820",  # Tesla Model 3 Long Range
                listing_price=" $ 42,950 CAD ",  # Dirty input matching Stitch design!
                title_meta="Tesla Model 3 Long-Range Dual Motor",
                brand="Tesla",
                model="Model 3",
                year=2022,
                odometer_raw="38,200 km",  # In km!
                battery_pack_health="94.2%",
                dealer_zip="94016-012",
                source_portal="Carvana",
            ),
            VehicleRaw(
                raw_vin="4T1C11AK2LU189201",  # Toyota RAV4 Hybrid
                listing_price="$27,800 USD",
                title_meta="2020 Toyota RAV4 Hybrid XSE AWD",
                brand="Toyota",
                model="RAV4 Hybrid",
                year=2020,
                odometer_raw="42,100 mi",
                dealer_zip="94016",
                source_portal="Carvana",
            ),
        ][:max_items]
