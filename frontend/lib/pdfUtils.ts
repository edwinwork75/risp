// Remove static import
// import html2pdf from 'html2pdf.js';

export const exportToPdf = async (questions: any[], answers: Record<number, any>, filename: string = 'assessment_data.pdf') => {
    // Client-side check
    if (typeof window === 'undefined') return;

    // Dynamic import to avoid SSR errors
    const html2pdf = (await import('html2pdf.js')).default;
    // 1. Prepare Data
    const projectInfoAnswers = questions
        .filter(q => q.section === 'Project Information')
        .reduce((acc, q) => {
            acc[q.text] = answers[q.id]?.value || '';
            return acc;
        }, {} as Record<string, string>);

    const getPI = (key: string) => projectInfoAnswers[key] || '';

    const finishingVal = getPI('FINISHING SPECIFICATION');
    const elementVal = getPI('STRUCTURAL ELEMENT');
    const isBeam = elementVal === 'BEAM' ? '☒' : '☐';
    const isCol = elementVal === 'COLUMN' ? '☒' : '☐';
    const isOther = elementVal === 'OTHERS' ? '☒' : '☐';

    // Signatures
    const signatures = questions.filter(q => q.section === 'Signatures');
    const getSigVal = (txt: string) => {
        const q = signatures.find(sq => sq.text.includes(txt));
        return q ? (answers[q.id]?.value || '') : '';
    };

    const getSigImage = (txt: string) => {
        const q = signatures.find(sq => sq.text.includes(txt));
        if (!q) return null;
        const val = answers[q.id]?.value;
        return (typeof val === 'string' && val.startsWith('data:image')) ? val : null;
    };

    const subconSig = getSigImage('Subcon Rep Signature'); // verify exact text match from SignaturesSection/question text if possible, but IDs are safer if we had them. Using text heuristics as in excelUtils. Use IDs if possible.
    // In excelUtils we used IDs: 904 (Subcon), 907 (Maincon), 910 (SRE).
    // Let's use IDs if they are consistent.
    const getSigById = (id: number) => {
        const val = answers[id]?.value;
        return (typeof val === 'string' && val.startsWith('data:image')) ? val : null;
    };
    const subconSigImg = getSigById(904);
    const mainconSigImg = getSigById(907);
    const sreSigImg = getSigById(910);


    // 2. Build HTML
    const content = document.createElement('div');
    content.className = 'pdf-container';

    // Style
    const style = `
        <style>
            .pdf-container { font-family: Arial, sans-serif; font-size: 9px; color: #000; padding: 20px; box-sizing: border-box; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: auto; }
            tr { page-break-inside: avoid; }
            th, td { border: 1px solid #333; padding: 4px; vertical-align: top; word-wrap: break-word; }
            .header-table { margin-bottom: 10px; }
            .header-table td { padding: 6px; }
            .section-header { background-color: #f0f0f0; font-weight: bold; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .w-5 { width: 20px; }
            .w-45 { width: 250px; }
            .bg-blue-light { background-color: #f0f8ff; }
            .bg-yellow-light { background-color: #fffacd; }
            .signature-box { height: 60px; display: flex; align-items: center; justify-content: center; }
            .signature-img { max-height: 50px; max-width: 100px; }
            .no-border-right { border-right: none; }
            .no-border-left { border-left: none; }
        </style>
    `;

    // Header HTML
    const headerHtml = `
        <div style="text-align: center; font-weight: bold; text-decoration: underline; font-size: 14px; margin-bottom: 10px;">
            INSPECTION CHECKLIST - STRUCTURAL STEELWORKS
        </div>

        <table class="header-table">
            <tr>
                <td colspan="2" style="width: 70%;"></td>
                <td colspan="1" style="width: 30%;">RFI No. : ${getPI('RFI No.')}</td>
            </tr>
            <tr>
                <td colspan="2">PROJECT : ${getPI('PROJECT')}</td>
                <td colspan="1">DATE : ${getPI('DATE')}</td>
            </tr>
            <tr>
                <td colspan="2">STRUCTURAL STEEL SPECIALIST : ${getPI('STRUCTURAL STEEL SPECIALIST')}</td>
                <td colspan="1" rowspan="3" style="vertical-align: top;">LOCATION / GRIDLINES :<br/>${getPI('LOCATION / GRIDLINES')}</td>
            </tr>
             <tr>
                <td colspan="2">STEEL GRADE: ${getPI('STEEL GRADE')} &nbsp;&nbsp;&nbsp;&nbsp; CLASS OF STEEL : ${getPI('CLASS OF STEEL (CHECK CONSULTANT DRAWING)')}</td>
            </tr>
            <tr>
                <td colspan="2">
                    FINISHING SPECIFICATION: HOT DIPPED GALVANISED/PAINTING/VERMICULITE/INTUMESCENT <br/>
                    [Selected: ${finishingVal}]
                </td>
            </tr>
            <tr>
                <td colspan="3">STRUCTURAL ELEMENT :</td>
            </tr>
            <tr>
                <td colspan="3">
                    &nbsp;&nbsp;&nbsp; BEAM ${isBeam} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; COLUMN ${isCol} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; OTHERS ${isOther}
                </td>
            </tr>
        </table>
    `;

    // Items Section Logic
    const sectionsMap: Record<string, any[]> = {};
    questions.forEach(q => {
        if (q.section !== 'Project Information' && q.section !== 'Signatures') {
            if (!sectionsMap[q.section]) sectionsMap[q.section] = [];
            sectionsMap[q.section].push(q);
        }
    });

    let itemsRows = '';
    let globalIndex = 0;
    let sectionCounter = 1;

    Object.entries(sectionsMap).forEach(([sectionName, sectionQuestions]) => {
        // Section Header
        itemsRows += `
            <tr class="section-header">
                <td>${sectionCounter}</td>
                <td colspan="13">${sectionName.toUpperCase()}</td>
            </tr>
        `;
        sectionCounter++;

        sectionQuestions.forEach((q, idx) => {
            const answer = answers[q.id]?.value;
            const comment = answers[q.id]?.comment || '';
            const charIndex = String.fromCharCode(97 + idx);

            let cols = '';

            // Sub/Main columns
            if (q.type === 'dual-response-date' && typeof answer === 'object' && answer !== null) {
                const main = answer.main_contractor || {};
                const sub = answer.sub_contractor || {};

                const formatDate = (d: string | undefined) => d ? new Date(d).toLocaleDateString('en-GB') : '';

                const subYes = (sub.response === 'YES' || sub.response === 'Yes') ? '✓' : '';
                const subNo = (sub.response === 'NO' || sub.response === 'No') ? '✓' : '';
                const subDate = formatDate(sub.date);

                const mainYes = (main.response === 'YES' || main.response === 'Yes') ? '✓' : '';
                const mainNo = (main.response === 'NO' || main.response === 'No') ? '✓' : '';
                const mainDate = formatDate(main.date);

                cols += `<td class="text-center">${subYes}</td>`;
                cols += `<td class="text-center">${subNo}</td>`;
                cols += `<td class="text-center" style="white-space:nowrap;">${subDate}</td>`;
                cols += `<td>${comment}</td>`; // Subcon comment (using shared comment for now)

                cols += `<td class="text-center">${mainYes}</td>`;
                cols += `<td class="text-center">${mainNo}</td>`;
                cols += `<td class="text-center" style="white-space:nowrap;">${mainDate}</td>`;
                cols += `<td></td>`; // Maincon comment (empty)
            } else {
                cols += `<td></td><td></td><td></td><td>${comment}</td><td></td><td></td><td></td><td></td>`;
            }

            itemsRows += `
                <tr>
                    <td>${charIndex}</td>
                    <td>${q.text}</td>
                    <td></td> <!-- Method -->
                    <td></td> <!-- Criteria -->
                    ${cols}
                </tr>
            `;
        });
    });

    const itemsTable = `
        <table>
            <thead>
                <tr style="background-color: #efefef;">
                    <th rowspan="2" style="width: 20px;">NO.</th>
                    <th rowspan="2" style="width: 200px;">ITEMS TO BE CHECKED (where applicable)</th>
                    <th rowspan="2" style="width: 50px;">CHK METHOD</th>
                    <th rowspan="2" style="width: 50px;">CRITERIA</th>
                    <th colspan="4" class="bg-blue-light">Subcon CHECK</th>
                    <th colspan="4" class="bg-yellow-light">Maincon CHECK</th>
                </tr>
                <tr style="background-color: #efefef;">
                     <!-- Subcon -->
                    <th class="bg-blue-light" style="width: 20px;">YES</th>
                    <th class="bg-blue-light" style="width: 20px;">NO</th>
                    <th class="bg-blue-light" style="width: 50px;">Date</th>
                    <th class="bg-blue-light" style="width: 80px;">Comment</th>
                    <!-- Maincon -->
                    <th class="bg-yellow-light" style="width: 20px;">YES</th>
                    <th class="bg-yellow-light" style="width: 20px;">NO</th>
                    <th class="bg-yellow-light" style="width: 50px;">Date</th>
                    <th class="bg-yellow-light" style="width: 80px;">Comment</th>
                </tr>
            </thead>
            <tbody>
                ${itemsRows}
            </tbody>
        </table>
    `;

    // Footer / Signatures
    const footerHtml = `
        <table style="page-break-inside: avoid;">
            <tr>
                <th colspan="2">CHECKED AND SUBMITTED BY :</th>
                <th colspan="2">CHECKED BY :</th>
                <th colspan="2">CHECKED/ACKNOWLEDGED BY :</th>
            </tr>
            <tr style="height: 80px;">
                <td colspan="2" class="text-center" style="vertical-align: middle;">
                    ${subconSigImg ? `<img src="${subconSigImg}" class="signature-img" />` : ''}
                </td>
                <td colspan="2" class="text-center" style="vertical-align: middle;">
                     ${mainconSigImg ? `<img src="${mainconSigImg}" class="signature-img" />` : ''}
                </td>
                <td colspan="2" class="text-center" style="vertical-align: middle;">
                     ${sreSigImg ? `<img src="${sreSigImg}" class="signature-img" />` : ''}
                </td>
            </tr>
            <tr>
                <td colspan="2">NAME: ${getSigVal('Subcon Rep Name')}</td>
                <td colspan="2">NAME: ${getSigVal('Main Con Name')}</td>
                <td colspan="2">NAME: ${getSigVal('SRE Name')}</td>
            </tr>
            <tr>
                <td colspan="2">DATE: ${getSigVal('Subcon Rep Date')}</td>
                <td colspan="2">DATE: ${getSigVal('Main Con Date')}</td>
                <td colspan="2">DATE: ${getSigVal('SRE Date')}</td>
            </tr>
        </table>
    `;

    content.innerHTML = style + headerHtml + itemsTable + footerHtml;

    const opt = {
        margin: 5,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    } as any;

    html2pdf().set(opt).from(content).save();
};
