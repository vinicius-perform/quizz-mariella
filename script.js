/**
 * script.js - Quiz Premium de Pré-Avaliação
 * Controla o fluxo de perguntas, captura de dados, envio para Sheets e redirecionamento.
 */

// Array de perguntas conforme a especificação
const QUESTIONS = [
    {
        id: "incomodoPrincipal",
        question: "Qual é hoje o seu principal incômodo na região glútea?",
        options: [
            "Falta de volume ou projeção",
            "Flacidez",
            "Celulites ou irregularidades",
            "Assimetria entre os lados",
            "Falta de definição no contorno",
            "Tenho mais de uma dessas queixas",
            "Ainda não sei exatamente o que me incomoda"
        ]
    },
    {
        id: "desejoPrincipal",
        question: "O que você mais gostaria de melhorar?",
        options: [
            "Ter um contorno mais harmônico",
            "Melhorar a firmeza da região",
            "Valorizar a proporção do corpo",
            "Melhorar o caimento das roupas",
            "Corrigir algo que me incomoda há muito tempo",
            "Entender o que realmente é possível para o meu corpo"
        ]
    },
    {
        id: "expectativa",
        question: "Qual frase mais combina com o que você busca?",
        options: [
            "Quero um resultado natural e compatível com meu corpo",
            "Quero melhorar, mas sem exageros",
            "Quero entender se tenho indicação real",
            "Quero um resultado parecido com o de outra paciente",
            "Quero saber preço antes de qualquer coisa"
        ]
    },
    {
        id: "nivelPesquisa",
        question: "Você já pesquisou sobre tratamento glúteo antes?",
        options: [
            "Sim, já acompanho conteúdos sobre o assunto",
            "Sim, mas ainda tenho muitas dúvidas",
            "Já vi resultados, mas não sei como funciona",
            "Ainda estou começando a entender",
            "Nunca pesquisei profundamente"
        ]
    },
    {
        id: "procedimentoAnterior",
        question: "Você já realizou algum procedimento na região glútea?",
        options: [
            "Não, seria a primeira vez",
            "Sim, já fiz algum tratamento estético",
            "Sim, já fiz preenchimento ou bioestímulo",
            "Sim, mas não fiquei satisfeita",
            "Prefiro explicar para a equipe"
        ]
    },
    {
        id: "momentoAtual",
        question: "Em que momento você está hoje?",
        options: [
            "Quero agendar uma avaliação médica",
            "Quero entender se tenho indicação",
            "Estou comparando opções",
            "Tenho interesse, mas ainda estou insegura",
            "Só quero saber valores por enquanto"
        ]
    },
    {
        id: "prazoAvaliacao",
        question: "Você pretende realizar uma avaliação nos próximos dias ou semanas?",
        options: [
            "Sim, quero agendar o quanto antes",
            "Sim, nos próximos 30 dias",
            "Talvez nos próximos meses",
            "Ainda não sei",
            "No momento estou apenas pesquisando"
        ]
    },
    {
        id: "entendimentoInvestimento",
        question: "Você entende que um tratamento glúteo personalizado exige avaliação médica, planejamento e investimento individualizado?",
        options: [
            "Sim, entendo e quero avaliar meu caso",
            "Sim, mas quero entender melhor como funciona",
            "Tenho dúvidas sobre valores",
            "Estou buscando a opção mais barata"
        ]
    }
];

// Estado global do Quiz
let currentStep = 0; // 0 = Inicial, 1 a 8 = Perguntas, 9 = Captura, 10 = Carregando, 11 = Erro
let answers = {};
let utms = {};

// Inicialização do documento
document.addEventListener('DOMContentLoaded', () => {
    captureUTMs();
    setupPhoneMask();
    initMetaPixel(); // Inicializa o Meta Pixel
});

/**
 * Captura as UTMs diretamente da barra de endereços (URL)
 */
function captureUTMs() {
    const params = new URLSearchParams(window.location.search);
    const utmFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    
    utmFields.forEach(field => {
        utms[field] = params.get(field) || "";
    });
}

/**
 * Adiciona máscara dinâmica e validação para o campo de telefone brasileiro
 */
function setupPhoneMask() {
    const phoneInput = document.getElementById('input-whatsapp');
    if (!phoneInput) return;

    phoneInput.addEventListener('input', (e) => {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
        e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });
}

/**
 * Transiciona entre as etapas com animação de fade-in sutil
 */
function goToStep(step) {
    // Esconde todos os passos
    document.querySelectorAll('.quiz-step').forEach(el => {
        el.classList.remove('active');
    });
    
    currentStep = step;
    
    // Configura e exibe o passo atual
    if (step >= 1 && step <= 8) {
        renderQuestion(step);
        document.getElementById('step-questions-container').classList.add('active');
        
        // Rastreamento das etapas de perguntas no Meta Pixel
        if (typeof fbq === 'function') {
            fbq('trackCustom', `Quiz_Pergunta_${step}`);
        }
    } else if (step === 0) {
        document.getElementById('step-0').classList.add('active');
        
        // Rastreamento do início do quiz
        if (typeof fbq === 'function') {
            fbq('trackCustom', 'Quiz_Inicio');
        }
    } else if (step === 9) {
        document.getElementById('step-capture').classList.add('active');
        
        // Rastreamento da chegada ao formulário final de dados
        if (typeof fbq === 'function') {
            fbq('trackCustom', 'Quiz_Formulario');
        }
    } else if (step === 10) {
        document.getElementById('step-loading').classList.add('active');
    } else if (step === 11) {
        document.getElementById('step-error-fallback').classList.add('active');
    }
}

/**
 * Inicia o Quiz mudando do passo inicial para a primeira pergunta
 */
window.startQuiz = function() {
    goToStep(1);
};

/**
 * Renderiza dinamicamente no HTML a pergunta e opções do passo atual
 */
function renderQuestion(stepIndex) {
    const questionData = QUESTIONS[stepIndex - 1];
    
    // Atualiza a barra de progresso
    updateProgress(stepIndex);
    
    // Insere os textos da pergunta
    document.getElementById('question-title').textContent = questionData.question;
    
    // Limpa e reconstrói as opções de botões
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    questionData.options.forEach(optionText => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'option-button';
        
        // Verifica se esta opção já havia sido selecionada anteriormente
        if (answers[questionData.id] === optionText) {
            button.classList.add('selected');
        }
        
        button.textContent = optionText;
        button.onclick = () => selectOption(questionData.id, optionText, button);
        
        optionsContainer.appendChild(button);
    });
}

/**
 * O Usuário seleciona uma opção: salva no estado e avança
 */
function selectOption(questionId, selectedValue, buttonElement) {
    // Remove classe selecionado de todos os outros botões do contêiner
    const container = buttonElement.parentNode;
    container.querySelectorAll('.option-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Marca o botão atual como selecionado no estado e na classe CSS
    buttonElement.classList.add('selected');
    answers[questionId] = selectedValue;
    
    // Pequeno atraso para dar feedback visual da seleção antes de ir ao próximo slide
    setTimeout(() => {
        nextStep();
    }, 280);
}

/**
 * Atualiza o progresso visual do topo (barra dourada e texto)
 */
function updateProgress(stepIndex) {
    const fillPercent = (stepIndex / QUESTIONS.length) * 100;
    document.getElementById('progress-fill').style.width = fillPercent + '%';
    document.getElementById('progress-text').textContent = `Etapa ${stepIndex} de ${QUESTIONS.length}`;
}

/**
 * Avança para a etapa seguinte
 */
window.nextStep = function() {
    if (currentStep >= 1 && currentStep <= 8) {
        const currentQuestion = QUESTIONS[currentStep - 1];
        
        // Impede prosseguir se não houver resposta selecionada
        if (!answers[currentQuestion.id]) {
            alert("Por favor, selecione uma opção para continuar.");
            return;
        }
        
        if (currentStep === 8) {
            goToStep(9); // Vai para tela de captura cadastral
        } else {
            goToStep(currentStep + 1);
        }
    }
};

/**
 * Retrocede para a etapa anterior
 */
window.prevStep = function() {
    if (currentStep === 9) {
        goToStep(8);
    } else if (currentStep > 1) {
        goToStep(currentStep - 1);
    } else if (currentStep === 1) {
        goToStep(0); // Volta para capa inicial do quiz
    }
};

/**
 * Submete o Quiz: Valida campos e faz integração Sheets + WhatsApp
 */
window.submitQuiz = async function(event) {
    event.preventDefault();
    
    // Limpa erros anteriores
    document.querySelectorAll('.form-group').forEach(el => el.classList.remove('has-error'));
    
    const nome = document.getElementById('input-nome').value.trim();
    const whatsapp = document.getElementById('input-whatsapp').value.trim();
    const cidade = document.getElementById('input-cidade').value.trim();
    const melhorHorario = document.getElementById('input-horario').value;
    
    let hasValidationError = false;
    
    // Validação de nome
    if (nome === "") {
        document.getElementById('error-nome').parentNode.classList.add('has-error');
        hasValidationError = true;
    }
    
    // Validação de WhatsApp (mínimo 10 dígitos numéricos para DDD + Número)
    const rawPhone = whatsapp.replace(/\D/g, '');
    if (rawPhone.length < 10) {
        document.getElementById('error-whatsapp').parentNode.classList.add('has-error');
        hasValidationError = true;
    }
    
    // Validação de cidade
    if (cidade === "") {
        document.getElementById('error-cidade').parentNode.classList.add('has-error');
        hasValidationError = true;
    }
    
    if (hasValidationError) return;
    
    // Dispara o evento de conversão do Facebook/Meta Pixel
    if (typeof fbq === 'function') {
        fbq('trackCustom', 'Lead Quizz');
    }
    
    // Passo 10: Mostra tela de envio
    goToStep(10);
    
    // Mapeia o JSON para o Webhook exatamente como solicitado
    const payload = {
        timestamp: new Date().toISOString(),
        nome: nome,
        whatsapp: whatsapp,
        cidade: cidade,
        melhorHorario: melhorHorario,
        incomodoPrincipal: answers["incomodoPrincipal"] || "",
        desejoPrincipal: answers["desejoPrincipal"] || "",
        expectativa: answers["expectativa"] || "",
        nivelPesquisa: answers["nivelPesquisa"] || "",
        procedimentoAnterior: answers["procedimentoAnterior"] || "",
        momentoAtual: answers["momentoAtual"] || "",
        prazoAvaliacao: answers["prazoAvaliacao"] || "",
        entendimentoInvestimento: answers["entendimentoInvestimento"] || "",
        utm_source: utms["utm_source"] || "",
        utm_medium: utms["utm_medium"] || "",
        utm_campaign: utms["utm_campaign"] || "",
        utm_content: utms["utm_content"] || "",
        utm_term: utms["utm_term"] || "",
        origem: "Quiz Tratamento Glúteo Dra. Mariella"
    };
    
    // Configura o link de redirecionamento final do WhatsApp (mensagem exata e limpa)
    const textMsg = encodeURIComponent("Oi, finalizei as perguntas e quero agendar uma consulta com a Dra. Mariella.");
    const whatsappCleanNumber = CONFIG.WHATSAPP_NUMBER.replace(/\D/g, '');
    const whatsappLink = `https://wa.me/${whatsappCleanNumber}?text=${textMsg}`;
    
    try {
        // Envio para o Google Sheets com timeout para não prender o usuário eternamente
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6500); // 6.5s timeout
        
        const response = await fetch(CONFIG.GOOGLE_SHEETS_WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors', // Evita bloqueios de CORS por parte do cliente para chamadas diretas
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Redireciona imediatamente
        window.location.href = whatsappLink;
        
    } catch (error) {
        console.error("Falha ao registrar respostas no webhook do Google Sheets:", error);
        
        // Atualiza a URL do botão de contingência da tela de erro
        const fallbackBtn = document.getElementById('btn-fallback-whatsapp');
        if (fallbackBtn) {
            fallbackBtn.href = whatsappLink;
        }
        
        // Passo 11: Direciona para tela de erro/fallback amigável
        goToStep(11);
    }
};

/**
 * Inicializa o Meta Pixel (Facebook Pixel) utilizando o ID do config.js
 */
function initMetaPixel() {
    if (!CONFIG.META_PIXEL_ID || CONFIG.META_PIXEL_ID === "SUO_PIXEL_ID_AQUI") return;

    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    
    fbq('init', CONFIG.META_PIXEL_ID);
    fbq('track', 'PageView');
}
