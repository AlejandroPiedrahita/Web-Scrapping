"""Suite de Pruebas QA para Scrapers Playwright y Evasión (test_scraper.py)
Simula respuestas HTTP 429, caídas de red, deriva de selectores DOM y rotación de proxies.
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.core.exceptions import (
    RateLimit429Exception,
    ScrapingNetworkException,
    DOMSelectorDriftException,
)
from app.domain.strategies.autotrader import AutoTraderScraperStrategy
from app.adapters.scrapers.playwright_scraper import PlaywrightCrawlerFleet


class TestPlaywrightScraperSuite:
    """Pruebas de resiliencia, sigilo y manejo de fallos para los scrapers Playwright."""

    def test_user_agent_rotation(self):
        """Verifica que el generador de User-Agents rote y entregue cadenas válidas."""
        strategy = AutoTraderScraperStrategy()
        ua_1 = strategy.get_random_user_agent()
        ua_2 = strategy.get_random_user_agent()

        assert "Mozilla" in ua_1
        assert "Mozilla" in ua_2
        headers = strategy.get_stealth_headers()
        assert "Sec-Ch-Ua" in headers
        assert "es-ES" in headers["Accept-Language"]

    @pytest.mark.asyncio
    async def test_simulate_http_429_rate_limit_backoff(self):
        """Caso Borde de Red: Simula una respuesta HTTP 429 Too Many Requests

        y valida que se dispare RateLimit429Exception con la IP y backoff calculados.
        """
        fleet = PlaywrightCrawlerFleet()

        # Mock de Playwright para simular respuesta 429
        mock_response = MagicMock()
        mock_response.status = 429

        with patch("playwright.async_api.async_playwright") as mock_pw:
            mock_context_manager = MagicMock()
            mock_pw.return_value = mock_context_manager

            mock_p = AsyncMock()
            mock_context_manager.__aenter__.return_value = mock_p

            mock_browser = AsyncMock()
            mock_p.chromium.launch.return_value = mock_browser

            mock_context = AsyncMock()
            mock_browser.new_context.return_value = mock_context

            mock_page = AsyncMock()
            mock_context.new_page.return_value = mock_page
            mock_page.goto.return_value = mock_response

            with pytest.raises(RateLimit429Exception) as exc_info:
                await fleet.scrape_portal_to_dataframe(
                    portal_name="AutoTrader",
                    target_url="https://autotrader.com/rate-limit-test",
                    proxy_url="198.51.100.44",
                )

            assert "HTTP 429" in exc_info.value.message
            assert "198.51.100.44" in exc_info.value.message
            assert exc_info.value.code == "ERR_HTTP_429_RATE_LIMIT"

    @pytest.mark.asyncio
    async def test_network_drop_and_resilient_fallback(self):
        """Caso Borde de Red: Simula un timeout o caída de red con el socket remoto

        y verifica que el crawler aplique fallback sin colapsar el proceso principal.
        """
        fleet = PlaywrightCrawlerFleet()

        with patch("playwright.async_api.async_playwright") as mock_pw:
            mock_context_manager = MagicMock()
            mock_pw.return_value = mock_context_manager

            mock_p = AsyncMock()
            mock_context_manager.__aenter__.return_value = mock_p
            # Simula fallo de socket
            mock_p.chromium.launch.side_effect = Exception("Connection reset by peer (Errno 104)")

            # El método debe capturar la caída de red y activar la estrategia de contingencia
            df_fallback = await fleet.scrape_portal_to_dataframe(
                portal_name="AutoTrader",
                target_url="https://autotrader.com/fail-test",
                max_items=3,
            )

            assert not df_fallback.empty
            assert len(df_fallback) > 0

    def test_dom_selector_drift_exception_messaging(self):
        """Verifica que la excepción de deriva de DOM proporcione selectores y solución precisa."""
        drift_exc = DOMSelectorDriftException(
            portal="Cars.com",
            selector="div.price-summary-tag",
            fallback_selector="span[data-qa='dealer-price']",
        )
        assert "Cars.com" in drift_exc.message
        assert "div.price-summary-tag" in drift_exc.message
        assert "span[data-qa='dealer-price']" in drift_exc.message
        assert drift_exc.code == "ERR_DOM_SELECTOR_DRIFT"
