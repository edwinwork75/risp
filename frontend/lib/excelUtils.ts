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

    // --- 1. SETUP COLUMNS & WIDTHS ---
    // A: NO. 
    // B: ITEMS 
    // C: METHOD
    // D: CRITERIA
    // E-G: Subcon Check
    // H: Subcon Comment (NEW)
    // I-K: Maincon Check
    // L: Maincon Comment (NEW)

    worksheet.columns = [
        { key: 'no', width: 5 },
        { key: 'item', width: 45 },
        { key: 'method', width: 12 },
        { key: 'criteria', width: 12 },
        { key: 'sc_yes', width: 4 },
        { key: 'sc_no', width: 4 },
        { key: 'sc_date', width: 10 },
        { key: 'sc_comment', width: 20 }, // New Subcon Comment
        { key: 'mc_yes', width: 4 },
        { key: 'mc_no', width: 4 },
        { key: 'mc_date', width: 10 },
        { key: 'mc_comment', width: 20 }, // New Maincon Comment
    ];

    // Total columns now 12 (A to L).
    // Previous Layout was 14 (A to N).
    // We need to adjust all colspan/merges from N to L.

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
    worksheet.mergeCells('A1:L1');
    const titleRow = worksheet.getRow(1);
    titleRow.getCell(1).value = 'INSPECTION CHECKLIST - STRUCTURAL STEELWORKS';
    titleRow.font = { bold: true, underline: true, size: 14 };
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
    titleRow.height = 25;

    // Row 2: RFI No
    worksheet.mergeCells('A2:H2'); // Spacer
    worksheet.mergeCells('I2:L2'); // RFI
    const rfiRow = worksheet.getRow(2);
    rfiRow.getCell('I').value = `RFI No. :  ${getPI('RFI No.')}`;
    rfiRow.getCell('I').alignment = { horizontal: 'left' };
    rfiRow.height = 20;

    // Row 3: Project | Date
    worksheet.mergeCells('A3:H3');
    worksheet.mergeCells('I3:L3');
    const row3 = worksheet.getRow(3);
    row3.getCell('A').value = `PROJECT :  ${getPI('PROJECT')}`;
    row3.getCell('I').value = `DATE :  ${getPI('DATE')}`;
    row3.height = 20;

    // Row 4: Specialist | Location
    worksheet.mergeCells('A4:H4');
    worksheet.mergeCells('I4:L6'); // Location spans 3 rows
    const row4 = worksheet.getRow(4);
    row4.getCell('A').value = `STRUCTURAL STEEL SPECIALIST :  ${getPI('STRUCTURAL STEEL SPECIALIST')}`;
    row4.getCell('I').value = `LOCATION / GRIDLINES : \n${getPI('LOCATION / GRIDLINES')}`;
    row4.getCell('I').alignment = { vertical: 'top', wrapText: true };
    row4.height = 20;

    // Row 5: Steel Grade
    worksheet.mergeCells('A5:H5');
    const row5 = worksheet.getRow(5);
    row5.getCell('A').value = `STEEL GRADE:  ${getPI('STEEL GRADE')}          CLASS OF STEEL :  ${getPI('CLASS OF STEEL (CHECK CONSULTANT DRAWING)')}`;
    row5.height = 20;

    // Row 6: Finishing Spec
    worksheet.mergeCells('A6:H6');
    const row6 = worksheet.getRow(6);
    const finishingBase = "HOT DIPPED GALVANISED/PAINTING/VERMICULITE/INTUMESCENT";
    const finishingVal = getPI('FINISHING SPECIFICATION');
    row6.getCell('A').value = `FINISHING SPECIFICATION: ${finishingBase}  [Selected: ${finishingVal}]`;
    row6.height = 20;

    // Row 7: Label
    worksheet.mergeCells('A7:L7');
    const row7 = worksheet.getRow(7);
    row7.getCell('A').value = 'STRUCTURAL ELEMENT :';
    row7.height = 20;

    // Row 8: Elements
    worksheet.mergeCells('A8:L8');
    const row8 = worksheet.getRow(8);
    const elementVal = getPI('STRUCTURAL ELEMENT');
    const isBeam = elementVal === 'BEAM' ? '☒' : '☐';
    const isCol = elementVal === 'COLUMN' ? '☒' : '☐';
    const isOther = elementVal === 'OTHERS' ? '☒' : '☐';
    row8.getCell('A').value = `      BEAM  ${isBeam}              COLUMN  ${isCol}              OTHERS  ${isOther}`;
    row8.height = 20;

    // Styling Header Box Borders (Cols 1 to 12)
    for (let r = 2; r <= 8; r++) {
        const row = worksheet.getRow(r);
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            if (colNumber <= 12) {
                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                cell.font = { name: 'Arial', size: 10, bold: false };
                cell.alignment = { ...cell.alignment, vertical: 'middle', wrapText: true };
            }
        });
    }

    // Clean up specific merged borders
    ['A2', 'I2', 'A3', 'I3', 'A4', 'I4', 'A5', 'A6', 'A7', 'A8'].forEach(addr => {
        const cell = worksheet.getCell(addr);
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        if (addr !== 'I4') cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    });

    // --- 4. DRAW TABLE HEADERS ---
    const headerRowStart = 10;

    worksheet.mergeCells(`A${headerRowStart}:A${headerRowStart + 1}`); // NO.
    worksheet.getCell(`A${headerRowStart}`).value = 'NO.';

    worksheet.mergeCells(`B${headerRowStart}:B${headerRowStart + 1}`); // ITEMS
    worksheet.getCell(`B${headerRowStart}`).value = 'ITEMS TO BE CHECKED (where applicable)';

    worksheet.mergeCells(`C${headerRowStart}:C${headerRowStart + 1}`); // METHOD
    worksheet.getCell(`C${headerRowStart}`).value = 'CHK METHOD';

    worksheet.mergeCells(`D${headerRowStart}:D${headerRowStart + 1}`); // CRITERIA
    worksheet.getCell(`D${headerRowStart}`).value = 'CRITERIA';

    // Subcon (E-H)
    worksheet.mergeCells(`E${headerRowStart}:H${headerRowStart}`);
    worksheet.getCell(`E${headerRowStart}`).value = 'Subcon CHECK';

    // Maincon (I-L)
    worksheet.mergeCells(`I${headerRowStart}:L${headerRowStart}`);
    worksheet.getCell(`I${headerRowStart}`).value = 'Maincon CHECK';

    // SubHeaders
    const subHeaderRow = worksheet.getRow(headerRowStart + 1);
    subHeaderRow.getCell('E').value = 'YES';
    subHeaderRow.getCell('F').value = 'NO';
    subHeaderRow.getCell('G').value = 'Date';
    subHeaderRow.getCell('H').value = 'Comment'; // New

    subHeaderRow.getCell('I').value = 'YES';
    subHeaderRow.getCell('J').value = 'NO';
    subHeaderRow.getCell('K').value = 'Date';
    subHeaderRow.getCell('L').value = 'Comment'; // New

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
        worksheet.mergeCells(`B${currentRowIndex}:L${currentRowIndex}`);

        currentRowIndex++;
        sectionCounter++;

        sectionQuestions.forEach((q, idx) => {
            const answer = answers[q.id]?.value;
            const comment = answers[q.id]?.comment || '';
            // Note: Since we don't have separate comments in the provided structure yet, 
            // we will place the shared comment in both or just one. 
            // Let's place it in Subcon 'Comment' for now as a default, or leave both empty if you prefer.
            // User requested "put the comment for each main and sub contractor". 
            // Without split data, I'll put the SAME comment in both for visibility, or just Subcon.
            // Let's put it in Subcon col H, and leave Maincon col L empty for manual entry if needed, 
            // OR populate both. Let's populate 'Comment' into Subcon Comment col (H).

            const rowValues: any[] = [
                String.fromCharCode(97 + idx),
                q.text,
                '', '',
            ];

            if (q.type === 'dual-response-date' && typeof answer === 'object' && answer !== null) {
                const main = answer.main_contractor || {};
                const sub = answer.sub_contractor || {};
                const formatDate = (d: string | undefined) => d ? new Date(d).toLocaleDateString('en-GB') : '';

                // Subcon
                rowValues.push(sub.response === 'YES' || sub.response === 'Yes' ? '✓' : '');
                rowValues.push(sub.response === 'NO' || sub.response === 'No' ? '✓' : '');
                rowValues.push(formatDate(sub.date));
                rowValues.push(comment); // Subcon Comment

                // Maincon
                rowValues.push(main.response === 'YES' || main.response === 'Yes' ? '✓' : '');
                rowValues.push(main.response === 'NO' || main.response === 'No' ? '✓' : '');
                rowValues.push(formatDate(main.date));
                rowValues.push(''); // Maincon Comment (Empty for now as we don't have 2 source strings)
            } else {
                // Generic / Single question type
                // Just pad empty check cols
                rowValues.push('', '', '', comment, '', '', '', '');
            }

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

    const footerHeader = worksheet.addRow(['CHECKED AND SUBMITTED BY :', '', 'CHECKED BY :', '', '', '', '', '', '', 'CHECKED/ACKNOWLEDGED BY :']);
    footerHeader.font = { bold: true, size: 8, name: 'Arial' };

    // Update merges to be roughly equal width (approx 50 each)
    // Block 1: A-B (50)
    // Block 2: C-I (50)
    // Block 3: J-N (53)
    worksheet.mergeCells(`A${footerStart}:B${footerStart}`);
    worksheet.mergeCells(`C${footerStart}:I${footerStart}`);
    worksheet.mergeCells(`J${footerStart}:N${footerStart}`);

    const sigRow1 = worksheet.addRow([]);
    const sigRow2 = worksheet.addRow([]);
    const sigRow3 = worksheet.addRow([]);
    sigRow1.height = 40;
    sigRow2.height = 40;
    sigRow3.height = 40;

    // Merge signature empty space
    for (let r = footerStart + 1; r <= footerStart + 3; r++) {
        worksheet.mergeCells(`A${r}:B${r}`);
        worksheet.mergeCells(`C${r}:I${r}`);
        worksheet.mergeCells(`J${r}:N${r}`);
    }

    const nameRow = worksheet.addRow([
        'NAME: ' + getSigVal('Subcon Rep Name'), '',
        'NAME: ' + getSigVal('Main Con Name'), '', '', '', '', '', '',
        'NAME: ' + getSigVal('SRE Name')
    ]);
    worksheet.mergeCells(`A${footerStart + 4}:B${footerStart + 4}`);
    worksheet.mergeCells(`C${footerStart + 4}:I${footerStart + 4}`);
    worksheet.mergeCells(`J${footerStart + 4}:N${footerStart + 4}`);

    const dateRow = worksheet.addRow([
        'DATE: ' + getSigVal('Subcon Rep Date'), '',
        'DATE: ' + getSigVal('Main Con Date'), '', '', '', '', '', '',
        'DATE: ' + getSigVal('SRE Date')
    ]);
    worksheet.mergeCells(`A${footerStart + 5}:B${footerStart + 5}`);
    worksheet.mergeCells(`C${footerStart + 5}:I${footerStart + 5}`);
    worksheet.mergeCells(`J${footerStart + 5}:N${footerStart + 5}`);

    // Insert Signatures
    const addSignature = (id: number, colIndex: number, rowIndex: number) => {
        const sigVal = answers[id]?.value;
        if (typeof sigVal === 'string' && sigVal.startsWith('data:image')) {
            const imageId = workbook.addImage({
                base64: sigVal,
                extension: 'png',
            });
            // Use fixed size (ext) to control proportion and size reduced
            // tl uses 0-based indices. rowIndex passed here is 1-based from previous logic (footerStart+1)
            // so we subtract 1.
            // We add a small offset to col/row to center/pad it slightly if possible, 
            // but integer col/row with fixed size is a good start. 
            // 0.1 col offset ~ 7px padding.
            worksheet.addImage(imageId, {
                tl: { col: colIndex + 0.2, row: (rowIndex - 1) + 0.2 },
                ext: { width: 150, height: 75 }
            } as any);
        }
    };

    // Rows for signature image: footerStart + 1 to footerStart + 3
    // We only need the starting row for TL anchor.
    const sigRowVal = footerStart + 1;

    // Subcon (904): A-B -> Start Col Index 0
    addSignature(904, 0, sigRowVal);

    // Maincon (907): C-I -> Start Col Index 2
    addSignature(907, 2, sigRowVal);

    // SRE (910): J-N -> Start Col Index 9
    addSignature(910, 9, sigRowVal);


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
