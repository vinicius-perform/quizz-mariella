/**
 * config.js - Arquivo de Configuração do Quiz Premium
 * 
 * Altere as variáveis abaixo com as credenciais da clínica da Dra. Mariella Palmeira.
 */

const CONFIG = {
    // URL do Webhook do Google Sheets (gerada pelo Make, Zapier, n8n ou Google Apps Script)
    GOOGLE_SHEETS_WEBHOOK_URL: "https://script.google.com/macros/s/AKfycbzSPkh9BOEXw_xNRqVyIExrzFrY7n5WRWhbbOlzufg6Xfc5B5qdSFs38UX-o6f24VZLjQ/exec",

    // Número do WhatsApp da clínica no formato internacional: Código do País + DDD + Número (apenas números, sem espaços ou símbolos)
    // Exemplo para São Paulo: 5511999999999
    WHATSAPP_NUMBER: "5511936236073",

    // ID do Pixel do Meta (Facebook) para tráfego pago
    META_PIXEL_ID: "1669219930794686"
};
