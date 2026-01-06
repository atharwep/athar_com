const express = require('express');
const cors = require('cors');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ShadingType } = require('docx');
const ExcelJS = require('exceljs');

const app = express();
app.use(cors());
app.use(express.json());

// Word Export - Enhanced Formatting
app.post('/api/export/word', async (req, res) => {
    const { proposal, selectedIdea, projectInfo } = req.body;

    const sections = [];

    // Title Page Style
    sections.push(new Paragraph({
        children: [new TextRun({ text: selectedIdea.name, bold: true, size: 72, color: "2b579a" })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 2000, after: 400 }
    }));

    sections.push(new Paragraph({
        children: [new TextRun({ text: `مقترح مشروع إنساني - ${projectInfo.country}`, size: 28, color: "666666" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 2000 }
    }));

    // Content Sections
    Object.keys(proposal).forEach(sectionTitle => {
        sections.push(new Paragraph({
            text: sectionTitle,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            border: { bottom: { color: "4f46e5", size: 12, style: BorderStyle.SINGLE, space: 1 } }
        }));
        sections.push(new Paragraph({
            children: [new TextRun({ text: proposal[sectionTitle], size: 24 })],
            spacing: { after: 300 },
            alignment: AlignmentType.JUSTIFY
        }));
    });

    const doc = new Document({
        sections: [{ properties: {}, children: sections }]
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=Proposal.docx`);
    res.send(buffer);
});

// Excel Export - Enhanced with Percentages
app.post('/api/export/excel', async (req, res) => {
    const { budget, projectInfo } = req.body;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('الميزانية التفصيلية');

    // Header styling
    sheet.columns = [
        { header: 'الفئة / البند', key: 'item', width: 35 },
        { header: 'الوصف التفصيلي', key: 'desc', width: 45 },
        { header: 'الكمية', key: 'qty', width: 10 },
        { header: 'الوحدة', key: 'unit', width: 12 },
        { header: 'سعر الوحدة', key: 'price', width: 15 },
        { header: 'الإجمالي', key: 'total', width: 15 },
        { header: 'النسبة م%', key: 'percent', width: 12 }
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };

    let grandTotal = 0;
    budget.forEach(cat => {
        cat.items.forEach(item => grandTotal += (item.qty * item.price));
    });

    budget.forEach(cat => {
        const catRow = sheet.addRow({ item: cat.name });
        catRow.font = { bold: true, size: 12 };
        catRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };

        cat.items.forEach(item => {
            const subtotal = item.qty * item.price;
            const percent = ((subtotal / grandTotal) * 100).toFixed(1) + '%';
            sheet.addRow({
                item: item.item,
                desc: item.desc,
                qty: item.qty,
                unit: item.unit,
                price: item.price,
                total: subtotal,
                percent: percent
            });
        });
        sheet.addRow({}); // spacer
    });

    const finalRow = sheet.addRow({ item: 'الإجمالي الكلي التقديري', total: grandTotal });
    finalRow.font = { bold: true, size: 14 };
    finalRow.getCell('total').numFmt = '#,##0.00 ' + projectInfo.currency;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Budget.xlsx');
    await workbook.xlsx.write(res);
    res.end();
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Athar Server running on port ${PORT}`));
