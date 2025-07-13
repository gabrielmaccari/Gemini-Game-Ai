const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const form = document.getElementById('form')
const markdownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}
const aiResponse = document.getElementById('aiResponse')
const perguntarAI = async (question, game, apiKey) => {
    const model = "gemini-2.0-flash"
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const pergunta = `
    ##Especialidade
    Você é um especialista em ${game} e pode responder perguntas sobre o jogo.
    ##Tarefa
    Você deve responder a pergunta do usuário sobre o jogo ${game} de forma clara e objetiva.
    ##Regras
    -Se você não souber a resposta, diga que não sabe e não tente inventar uma resposta.
    -Se a pergunta não for sobre o jogo ${game}, diga que não pode responder.
    -Considere a data autal ${new Date().toLocaleDateString('pt-BR')} e não responda perguntas sobre eventos futuros ou passados.
    -Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    -Nunca responda itens que vc não tenha certeza que existem no jogo atual.
    ##Economiza na respostam seja direto e responda no máximo 500 caracteres. Responda em markdown
    -Não precisa fazer nenhuma saudação despedida, responda apenas o que o usuário está respondendo
    ##Pergunta do Usuário
    ${question}
    `
    const contents = [{
        role: "user",
        parts: [{
            text: pergunta
        }]
    }]
    const tools = [{
        google_search: {}}]

//chamada API
    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    body: JSON.stringify({
        contents,
        tools
    })
    })
    const data = await response.json()
    return data.candidates[0].content.parts[0].text
}
//chave api : AIzaSyBMqINhcq1lmlef9tKMy2vyV7w9BbROlh8
const enviarFormulário = async (event) => {
    event.preventDefault() /*Impede que ao clicar em perguntar, recarregue a página*/
    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionInput.value

    if(apiKey === '' || game === '' || question === '') {
        alert('Por favor, preencha todos os campos.')
        return
    }
    askButton.disabled = true
    askButton.textContent = 'Enviando...'
    askButton.classList.add('loading')
    try {
        const text = await perguntarAI(question, game, apiKey)
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
        aiResponse.classList.remove('escondido')
    } catch (error) {
        console.log('Erro:', error)
    } finally {
        askButton.disabled = false
        askButton.textContent = 'Perguntar'
        askButton.classList.remove('loading')
    }
}
form.addEventListener('submit',enviarFormulário)