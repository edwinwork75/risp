import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToExcel = async (questions: any[], answers: Record<number, any>, filename: string = 'assessment_data.xlsx') => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inspection Form');

    // --- 1. SETUP COLUMNS & WIDTHS ---
    // A: NO. 
    // B: ITEMS 
    // C: METHOD
    // D: CRITERIA
    // E-G: Subcon
    // H-J: Maincon
    // K: COMMENTS
    // L-N: RE CHECK

    worksheet.columns = [
        { key: 'no', width: 5 },
        { key: 'item', width: 45 },
        { key: 'method', width: 12 },
        { key: 'criteria', width: 12 },
        { key: 'sc_yes', width: 4 },
        { key: 'sc_no', width: 4 },
        { key: 'sc_date', width: 10 },
        { key: 'mc_yes', width: 4 },
        { key: 'mc_no', width: 4 },
        { key: 'mc_date', width: 10 },
        { key: 'comments', width: 25 },
        { key: 'rc_yes', width: 4 },
        { key: 'rc_no', width: 4 },
        { key: 'rc_date', width: 10 },
    ];

    // --- 2. EXTRACT PROJECT INFO ---
    const projectInfoAnswers = questions
        .filter(q => q.section === 'Project Information')
        .reduce((acc, q) => {
            acc[q.text] = answers[q.id]?.value || '';
            return acc;
        }, {} as Record<string, string>);

    const getPI = (key: string) => projectInfoAnswers[key] || '';

    // --- 3. DRAW HEADER SECTION ---

    // Row 1: Title
    worksheet.mergeCells('A1:N1');
    const titleRow = worksheet.getRow(1);
    titleRow.getCell(1).value = 'INSPECTION CHECKLIST - STRUCTURAL STEELWORKS';
    titleRow.font = { bold: true, underline: true, size: 14 };
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
    titleRow.height = 25;

    // Row 2: RFI No (Top of box)
    // A2-J2 merged (Empty spacer left)
    // K2-N2 merged (RFI No)
    worksheet.mergeCells('A2:J2');
    worksheet.mergeCells('K2:N2');
    const rfiRow = worksheet.getRow(2);
    rfiRow.getCell('K').value = `RFI No. :  ${getPI('RFI No.')}`;
    rfiRow.getCell('K').alignment = { horizontal: 'left' }; // Usually text is left aligned in the box
    rfiRow.height = 20;

    // Row 3: Project | Date
    worksheet.mergeCells('A3:J3'); // Project
    worksheet.mergeCells('K3:N3'); // Date
    const row3 = worksheet.getRow(3);
    row3.getCell('A').value = `PROJECT :  ${getPI('PROJECT')}`;
    row3.getCell('K').value = `DATE :  ${getPI('DATE')}`;
    row3.height = 20;

    // Row 4: Specialist | Location (Start of merge)
    worksheet.mergeCells('A4:J4');
    // Location spans 3 rows (Row 4, 5, 6)
    worksheet.mergeCells('K4:N6');
    const row4 = worksheet.getRow(4);
    row4.getCell('A').value = `STRUCTURAL STEEL SPECIALIST :  ${getPI('STRUCTURAL STEEL SPECIALIST')}`;
    row4.getCell('K').value = `LOCATION / GRIDLINES : \n${getPI('LOCATION / GRIDLINES')}`;
    row4.getCell('K').alignment = { vertical: 'top', wrapText: true };
    row4.height = 20;

    // Row 5: Steel Grade / Class
    worksheet.mergeCells('A5:J5');
    const row5 = worksheet.getRow(5);
    row5.getCell('A').value = `STEEL GRADE:  ${getPI('STEEL GRADE')}          CLASS OF STEEL :  ${getPI('CLASS OF STEEL (CHECK CONSULTANT DRAWING)')}`;
    row5.height = 20;

    // Row 6: Finishing Spec
    worksheet.mergeCells('A6:J6');
    const row6 = worksheet.getRow(6);
    // Highlight selected finishing if possible? For now uppercase text.
    // We will construct a RichText value if we have time, but sticking to string for stability first.
    const finishingVal = getPI('FINISHING SPECIFICATION');
    // Let's try to simulate checking: 
    const finishingBase = "HOT DIPPED GALVANISED/PAINTING/VERMICULITE/INTUMESCENT";
    // Simple approach: Just append selected value if it's not obvious
    // But user wants structure "like this".
    row6.getCell('A').value = `FINISHING SPECIFICATION: ${finishingBase}  [Selected: ${finishingVal}]`;
    row6.height = 20;

    // Row 7: Structural Element Label (Full Width)
    worksheet.mergeCells('A7:N7');
    const row7 = worksheet.getRow(7);
    row7.getCell('A').value = 'STRUCTURAL ELEMENT :';
    row7.height = 20;

    // Row 8: Structural Element Checkboxes (Full Width)
    worksheet.mergeCells('A8:N8');
    const row8 = worksheet.getRow(8);
    const elementVal = getPI('STRUCTURAL ELEMENT');
    const isBeam = elementVal === 'BEAM' ? '☒' : '☐';
    const isCol = elementVal === 'COLUMN' ? '☒' : '☐';
    const isOther = elementVal === 'OTHERS' ? '☒' : '☐';

    row8.getCell('A').value = `      BEAM  ${isBeam}              COLUMN  ${isCol}              OTHERS  ${isOther}`;
    row8.height = 20;

    // Styling Header Box Borders
    // We need to apply borders to these cells manually
    // Rows 2 to 8
    for (let r = 2; r <= 8; r++) {
        const row = worksheet.getRow(r);
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            // We only care about columns 1 to 14 (A-N)
            if (colNumber <= 14) {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.font = { name: 'Arial', size: 10, bold: false };
                cell.alignment = { ...cell.alignment, vertical: 'middle', wrapText: true };

                // Bold labels logic (simple override)
                if (cell.value && typeof cell.value === 'string' && cell.value.includes(':')) {
                    // partial bolding is hard in exceljs without rich text objects for every cell
                    // we'll just bold the whole cell for specific header rows if desired
                    // but standard text is fine.
                }
            }
        });
    }

    // Clean up borders for merged cells (sometimes ExcelJS needs explicit border on the main cell of merge)
    ['A2', 'K2', 'A3', 'K3', 'A4', 'K4', 'A5', 'A6', 'A7', 'A8'].forEach(addr => {
        const cell = worksheet.getCell(addr);
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
        // Align left usually
        if (addr !== 'K4') { // K4 is Location, top aligned
            cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        }
    });


    // --- 4. DRAW TABLE HEADERS ---
    const headerRowStart = 10; // moved down

    // Headers
    worksheet.mergeCells(`A${headerRowStart}:A${headerRowStart + 1}`); // NO.
    worksheet.getCell(`A${headerRowStart}`).value = 'NO.';

    worksheet.mergeCells(`B${headerRowStart}:B${headerRowStart + 1}`); // ITEMS
    worksheet.getCell(`B${headerRowStart}`).value = 'ITEMS TO BE CHECKED (where applicable)';

    worksheet.mergeCells(`C${headerRowStart}:C${headerRowStart + 1}`); // METHOD
    worksheet.getCell(`C${headerRowStart}`).value = 'CHK METHOD';

    worksheet.mergeCells(`D${headerRowStart}:D${headerRowStart + 1}`); // CRITERIA
    worksheet.getCell(`D${headerRowStart}`).value = 'CRITERIA';

    // Subcon
    worksheet.mergeCells(`E${headerRowStart}:G${headerRowStart}`);
    worksheet.getCell(`E${headerRowStart}`).value = 'Subcon\nCHECK';

    // Maincon
    worksheet.mergeCells(`H${headerRowStart}:J${headerRowStart}`);
    worksheet.getCell(`H${headerRowStart}`).value = 'Maincom\nCHECK';

    // Comments
    worksheet.mergeCells(`K${headerRowStart}:K${headerRowStart + 1}`);
    worksheet.getCell(`K${headerRowStart}`).value = 'COMMENTS (for all parties)';

    // Recheck
    worksheet.mergeCells(`L${headerRowStart}:N${headerRowStart}`);
    worksheet.getCell(`L${headerRowStart}`).value = 'RE CHECK';

    // Subheaders
    const subHeaderRow = worksheet.getRow(headerRowStart + 1);
    subHeaderRow.getCell('E').value = 'YES';
    subHeaderRow.getCell('F').value = 'NO';
    subHeaderRow.getCell('G').value = 'Date';

    subHeaderRow.getCell('H').value = 'YES';
    subHeaderRow.getCell('I').value = 'NO';
    subHeaderRow.getCell('J').value = 'Date';

    subHeaderRow.getCell('L').value = 'YES';
    subHeaderRow.getCell('M').value = 'NO';
    subHeaderRow.getCell('N').value = 'DATE';

    // Header Styling
    [worksheet.getRow(headerRowStart), worksheet.getRow(headerRowStart + 1)].forEach(row => {
        row.font = { bold: true, size: 9, name: 'Arial' };
        row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        row.height = 30;
        row.eachCell((cell) => {
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFEFEF' } };
        });
    });

    // --- 5. DRAW DATA ROWS ---
    let currentRowIndex = headerRowStart + 2;
    let sectionCounter = 1;

    const sectionsMap: Record<string, any[]> = {};
    questions.forEach(q => {
        if (q.section !== 'Project Information' && q.section !== 'Signatures') {
            if (!sectionsMap[q.section]) sectionsMap[q.section] = [];
            sectionsMap[q.section].push(q);
        }
    });

    Object.entries(sectionsMap).forEach(([sectionName, sectionQuestions]) => {
        const sectionRow = worksheet.addRow([sectionCounter, sectionName.toUpperCase()]);
        sectionRow.font = { bold: true, name: 'Arial' };
        sectionRow.eachCell(cell => {
            cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
        });
        // Merge only B to N for section title to allow 'No' column to have the index
        // worksheet.mergeCells(`B${currentRowIndex}:N${currentRowIndex}`);
        // Actually typically section header spans all? Image shows '1' in 'No' col, 'SITE PREPARATION' in 'Items'.
        // Columns C-N should probably be empty borders.
        // Let's merge B to N for text overflow
        worksheet.mergeCells(`B${currentRowIndex}:N${currentRowIndex}`);

        currentRowIndex++;
        sectionCounter++;

        sectionQuestions.forEach((q, idx) => {
            const answer = answers[q.id]?.value;
            const comment = answers[q.id]?.comment || '';

            const rowValues: any[] = [
                String.fromCharCode(97 + idx),
                q.text,
                '', '', // Method, Criteria
            ];

            if (q.type === 'dual-response-date' && typeof answer === 'object' && answer !== null) {
                const main = answer.main_contractor || {};
                const sub = answer.sub_contractor || {};
                rowValues.push(sub.response === 'YES' || sub.response === 'Yes' ? '✓' : '');
                rowValues.push(sub.response === 'NO' || sub.response === 'No' ? '✓' : '');
                rowValues.push(sub.date || '');
                rowValues.push(main.response === 'YES' || main.response === 'Yes' ? '✓' : '');
                rowValues.push(main.response === 'NO' || main.response === 'No' ? '✓' : '');
                rowValues.push(main.date || '');
            } else {
                rowValues.push('', '', '', '', '', '');
            }

            rowValues.push(comment);
            rowValues.push('', '', '');

            const dataRow = worksheet.addRow(rowValues);
            dataRow.font = { name: 'Arial', size: 10 };
            dataRow.alignment = { vertical: 'middle', wrapText: true };
            dataRow.eachCell(cell => {
                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            });
            currentRowIndex++;
        });
    });

    worksheet.addRow([]);
    currentRowIndex++;

    // --- 6. SIGNATURES ---
    const signatures = questions.filter(q => q.section === 'Signatures');
    const getSigVal = (txt: string) => {
        const q = signatures.find(sq => sq.text.includes(txt));
        return q ? (answers[q.id]?.value || '') : '';
    };

    const footerStart = currentRowIndex;

    const footerHeader = worksheet.addRow(['CHECKED AND SUBMITTED BY :', '', '', '', 'CHECKED BY :', '', '', '', 'CHECKED/ACKNOWLEDGED BY :']);
    footerHeader.font = { bold: true, size: 8, name: 'Arial' };

    worksheet.mergeCells(`A${footerStart}:D${footerStart}`);
    worksheet.mergeCells(`E${footerStart}:H${footerStart}`);
    worksheet.mergeCells(`I${footerStart}:N${footerStart}`);

    worksheet.addRow([]);
    worksheet.addRow([]);
    worksheet.addRow([]);

    const nameRow = worksheet.addRow([
        'NAME: ' + getSigVal('Subcon Rep Name'), '', '', '',
        'NAME: ' + getSigVal('Main Con Name'), '', '', '',
        'NAME: ' + getSigVal('SRE Name')
    ]);
    worksheet.mergeCells(`A${footerStart + 4}:D${footerStart + 4}`);
    worksheet.mergeCells(`E${footerStart + 4}:H${footerStart + 4}`);
    worksheet.mergeCells(`I${footerStart + 4}:N${footerStart + 4}`);

    const dateRow = worksheet.addRow([
        'DATE: ' + getSigVal('Subcon Rep Date'), '', '', '',
        'DATE: ' + getSigVal('Main Con Date'), '', '', '',
        'DATE: ' + getSigVal('SRE Date')
    ]);
    worksheet.mergeCells(`A${footerStart + 5}:D${footerStart + 5}`);
    worksheet.mergeCells(`E${footerStart + 5}:H${footerStart + 5}`);
    worksheet.mergeCells(`I${footerStart + 5}:N${footerStart + 5}`);

    for (let r = footerStart; r <= footerStart + 5; r++) {
        const row = worksheet.getRow(r);
        row.eachCell(cell => {
            // Minimal borders for footer
            if (r === footerStart) cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
            else if (r === footerStart + 5) cell.border = { bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
            else cell.border = { left: { style: 'thin' }, right: { style: 'thin' } };
        });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, filename);
};
