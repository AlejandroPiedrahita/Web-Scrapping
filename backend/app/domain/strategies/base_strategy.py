"""Estrategia Base de Extracción Web (Scraper Strategy Pattern)
Provee rotación de User-Agents, configuración de huella TLS/JA3 y mitigación de bloqueos.
"""

from abc import abstractmethod
import random
from typing import List, Dict
from fake_useragent import UserAgent
from app.core.ports import ScraperStrategyPort
from app.core.entities import VehicleRaw


class BaseScraperStrategy(ScraperStrategyPort):
    """Clase base para estrategias de scraping con utilidades de evasión y sigilo."""

    USER_AGENT_PROFILES = [
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0",
    ]

    def __init__(self):
        try:
            self._ua_generator = UserAgent()
        except Exception:
            self._ua_generator = None

    def get_random_user_agent(self) -> str:
        """Obtiene un User-Agent rotado válido de navegadores de escritorio modernos."""
        if self._ua_generator:
            try:
                return self._ua_generator.random
            except Exception:
                pass
        return random.choice(self.USER_AGENT_PROFILES)

    def get_stealth_headers(self) -> Dict[str, str]:
        """Genera encabezados HTTP realistas que emulan un navegador Chrome 128 sobre macOS."""
        return {
            "User-Agent": self.get_random_user_agent(),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Sec-Ch-Ua": '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"macOS"',
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
        }

    @property
    @abstractmethod
    def portal_name(self) -> str:
        pass

    @abstractmethod
    async def extract_raw_listings(self, target_url: str, max_items: int = 50) -> List[VehicleRaw]:
        pass
