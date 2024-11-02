// Inicializa um array para armazenar as devoluções
let devolucoes = carregarDevolucoes();

// Função para carregar devoluções do localStorage
function carregarDevolucoes() {
    const devolucoesStorage = localStorage.getItem('devolucoes');
    return devolucoesStorage ? JSON.parse(devolucoesStorage) : [];
}

// Função para salvar devoluções no localStorage
function salvarDevolucoes() {
    localStorage.setItem('devolucoes', JSON.stringify(devolucoes));
}

// Função para adicionar uma nova devolução
document.getElementById('devolucaoForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Impede o envio padrão do formulário

    const material = document.getElementById('material').value;
    const quantidade = document.getElementById('quantidade').value;
    const conferente = document.getElementById('conferente').value;
    const motivo = document.getElementById('motivo').value;
    const nRomaneio = document.getElementById('NRomaneio').value;
    const data = document.getElementById('data').value;
    const fotos = document.getElementById('foto').files;

    // Verifica se há fotos selecionadas
    let fotosArray = [];
    if (fotos.length > 0) {
        for (let i = 0; i < fotos.length; i++) {
            fotosArray.push(URL.createObjectURL(fotos[i]));
        }
    }

    // Adiciona a devolução ao array
    devolucoes.push({
        material,
        quantidade,
        conferente,
        motivo,
        data,
        fotos: fotosArray,
        nRomaneio
    });

    // Salva as devoluções no localStorage
    salvarDevolucoes();

    // Atualiza a tabela
    atualizarTabela();
    this.reset(); // Limpa o formulário
});

// Função para atualizar a tabela de devoluções
function atualizarTabela() {
    const tabelaCorpo = document.querySelector('#tabelaDevolucoes tbody');
    tabelaCorpo.innerHTML = ''; // Limpa o corpo da tabela

    devolucoes.forEach((devolucao, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${devolucao.material}</td>
            <td>${devolucao.quantidade}</td>
            <td>${devolucao.conferente}</td>
            <td>${devolucao.motivo}</td>
            <td>${devolucao.data}</td>
            <td>${devolucao.fotos.map(foto => `<img src="${foto}" alt="Foto" width="50" height="50">`).join(' ')}</td>
            <td>${devolucao.nRomaneio}</td>
            <td>
                <button onclick="removerDevolucao(${index})">Remover</button>
            </td>
        `;
        tabelaCorpo.appendChild(row);
    });
}

// Função para remover uma devolução
function removerDevolucao(index) {
    devolucoes.splice(index, 1);
    salvarDevolucoes(); // Atualiza o localStorage
    atualizarTabela();
}

// Função para gerar o PDF
document.getElementById('gerarPdf').addEventListener('click', function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Definindo o tamanho da página e as margens
    doc.setFont('Helvetica');
    doc.setFontSize(14);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Título
    doc.setFontSize(26);
    doc.setTextColor(25, 118, 210); // Azul moderno
    doc.text('Relatório de Devoluções de Materiais', 14, 30);
    
    // Subtítulo com a data atual
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0); // Preto
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, 40);
    
    // Cabeçalho da tabela
    const headers = ["Material", "Quantidade", "Conferente", "Motivo", "Data", "N°-Romaneio"];
    const columnWidth = [30, 30, 30, 31, 30, 30];
    const startX = 14;
    let startY = 50;

    // Estilo do cabeçalho
    doc.setFillColor(25, 118, 210); // Azul moderno
    doc.rect(startX, startY, pageWidth - 28, 10, 'F');
    doc.setTextColor(255); // Branco
    headers.forEach((header, index) => {
        doc.text(header, startX + index * columnWidth[index], startY + 7, { baseline: 'middle' });
    });

    // Estilo da linha
    doc.setTextColor(0); // Preto
    startY += 10; // Mover para a linha abaixo

    // Adicionando os dados
    devolucoes.forEach(devolucao => {
        doc.setFontSize(12);
        doc.setFillColor(255); // Branco
        doc.rect(startX, startY, pageWidth - 28, 10, 'F'); // Linha branca para cada entrada
        doc.text(devolucao.material, startX + 0, startY + 7, { baseline: 'middle' });
        doc.text(devolucao.quantidade.toString(), startX + columnWidth[0], startY + 7, { baseline: 'middle' });
        doc.text(devolucao.conferente, startX + columnWidth[0] + columnWidth[1], startY + 7, { baseline: 'middle' });
        doc.text(devolucao.motivo, startX + columnWidth[0] + columnWidth[1] + columnWidth[2], startY + 7, { baseline: 'middle' });
        doc.text(devolucao.data, startX + columnWidth[0] + columnWidth[1] + columnWidth[2] + columnWidth[3], startY + 7, { baseline: 'middle' });
        doc.text(devolucao.nRomaneio, startX + columnWidth[0] + columnWidth[1] + columnWidth[2] + columnWidth[3] + columnWidth[4], startY + 7, { baseline: 'middle' });
        startY += 10;
    });

    // Adicionando uma seção para fotos
    devolucoes.forEach(devolucao => {
        if (devolucao.fotos.length > 0) {
            doc.addPage();
            doc.setFontSize(20);
            doc.setTextColor(25, 118, 210);
            doc.text(`Fotos da Devolução: ${devolucao.material}`, 14, 20);
            devolucao.fotos.forEach((foto, index) => {
                doc.addImage(foto, 'JPEG', 10, 30 + index * 60, 190, 50); // Ajuste as dimensões conforme necessário
            });
        }
    });

    // Rodapé com informações de contato
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Contato: suporte@aramesul.com', 14, pageHeight - 10);
    doc.text('Telefone: (00) 0000-0000', 14, pageHeight - 5);

    // Salvar PDF
    doc.save('devolucoes.pdf');
});

// Função para exportar para Excel
document.getElementById('exportarExcel').addEventListener('click', function () {
    const workbook = XLSX.utils.book_new();
    const worksheetData = [['Material', 'Quantidade', 'Conferente', 'Motivo', 'Data', 'N° Romaneio']];
    
    devolucoes.forEach(devolucao => {
        worksheetData.push([
            devolucao.material,
            devolucao.quantidade,
            devolucao.conferente,
            devolucao.motivo,
            devolucao.data,
            devolucao.nRomaneio
        ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Devoluções');
    XLSX.writeFile(workbook, 'devolucoes.xlsx');
});

// Atualiza a tabela ao carregar a página
atualizarTabela();
